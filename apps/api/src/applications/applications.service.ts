import { BadRequestException, Injectable } from '@nestjs/common';
import { notFound } from '../common/errors';
import { ApplicationStatus } from '../common/graphql/application-status.enum';
import { PrismaService } from '../prisma/prisma.service';
import { canTransition } from './application-status.rules';
import { CreateApplicationInput } from './dto/create-application.input';
import { UpdateApplicationInput } from './dto/update-application.input';

const listInclude = {
  contacts: true,
  reminders: { where: { done: false }, orderBy: { dueAt: 'asc' } },
} as const;

const detailInclude = {
  contacts: true,
  timeline: { orderBy: { at: 'asc' } },
  reminders: { orderBy: { dueAt: 'asc' } },
} as const;

const INITIAL_STATUSES = new Set<ApplicationStatus>([
  ApplicationStatus.WISHLIST,
  ApplicationStatus.APPLIED,
]);

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

function assertSalaryRange(min?: number | null, max?: number | null): void {
  if (min != null && max != null && min > max) {
    throw new BadRequestException('salaryMin must not exceed salaryMax');
  }
}

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(
    userId: string,
    status?: ApplicationStatus,
    search?: string,
    take = DEFAULT_PAGE_SIZE,
    skip = 0,
  ) {
    return this.prisma.application.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { company: { contains: search, mode: 'insensitive' as const } },
                { role: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      include: listInclude,
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
      take: Math.min(Math.max(take, 1), MAX_PAGE_SIZE),
      skip: Math.max(skip, 0),
    });
  }

  async getById(userId: string, id: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
      include: detailInclude,
    });

    if (!application) {
      throw notFound('Application not found');
    }

    return application;
  }

  async create(userId: string, input: CreateApplicationInput) {
    const status = input.status ?? ApplicationStatus.WISHLIST;
    if (!INITIAL_STATUSES.has(status)) {
      throw new BadRequestException('New applications can only start in WISHLIST or APPLIED');
    }

    assertSalaryRange(input.salaryMin, input.salaryMax);

    return this.prisma.application.create({
      data: {
        userId,
        company: input.company,
        role: input.role,
        location: input.location,
        salaryMin: input.salaryMin,
        salaryMax: input.salaryMax,
        jobUrl: input.jobUrl,
        source: input.source,
        priority: input.priority,
        appliedAt: input.appliedAt,
        notes: input.notes,
        status,
        timeline: {
          create: [
            {
              toStatus: status,
              at:
                status === ApplicationStatus.APPLIED ? (input.appliedAt ?? new Date()) : undefined,
            },
          ],
        },
      },
      include: detailInclude,
    });
  }

  async update(userId: string, id: string, input: UpdateApplicationInput) {
    const application = await this.getById(userId, id);
    assertSalaryRange(
      input.salaryMin ?? application.salaryMin,
      input.salaryMax ?? application.salaryMax,
    );

    return this.prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id },
        data: {
          company: input.company,
          role: input.role,
          location: input.location,
          salaryMin: input.salaryMin,
          salaryMax: input.salaryMax,
          jobUrl: input.jobUrl,
          source: input.source,
          priority: input.priority,
          appliedAt: input.appliedAt,
          notes: input.notes,
        },
      });

      // Keep the analytics source of truth (the APPLIED event) in sync when
      // the user corrects the application date.
      if (input.appliedAt) {
        await tx.stageEvent.updateMany({
          where: { applicationId: id, toStatus: ApplicationStatus.APPLIED },
          data: { at: input.appliedAt },
        });
      }

      return tx.application.findUniqueOrThrow({
        where: { id },
        include: detailInclude,
      });
    });
  }

  async changeStatus(userId: string, id: string, status: ApplicationStatus, note?: string) {
    const application = await this.getById(userId, id);

    if (!canTransition(application.status, status)) {
      throw new BadRequestException(
        `Cannot move an application from ${application.status} to ${status}`,
      );
    }

    return this.prisma.application.update({
      where: { id },
      data: {
        status,
        timeline: { create: [{ fromStatus: application.status, toStatus: status, note }] },
      },
      include: detailInclude,
    });
  }

  async remove(userId: string, id: string): Promise<boolean> {
    await this.getById(userId, id);
    await this.prisma.application.delete({ where: { id } });
    return true;
  }
}
