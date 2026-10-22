import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '../common/graphql/application-status.enum';
import { PrismaService } from '../prisma/prisma.service';
import { canTransition } from './application-status.rules';
import { CreateApplicationInput } from './dto/create-application.input';
import { UpdateApplicationInput } from './dto/update-application.input';

const withRelations = {
  contacts: true,
  timeline: { orderBy: { at: 'asc' } },
  reminders: { orderBy: { dueAt: 'asc' } },
} as const;

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, status?: ApplicationStatus, search?: string) {
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
      include: withRelations,
      orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async getById(userId: string, id: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
      include: withRelations,
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  create(userId: string, input: CreateApplicationInput) {
    const status = input.status ?? ApplicationStatus.WISHLIST;

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
        timeline: { create: [{ toStatus: status }] },
      },
      include: withRelations,
    });
  }

  async update(userId: string, id: string, input: UpdateApplicationInput) {
    await this.getById(userId, id);

    return this.prisma.application.update({
      where: { id },
      data: { ...input },
      include: withRelations,
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
      include: withRelations,
    });
  }

  async remove(userId: string, id: string): Promise<boolean> {
    await this.getById(userId, id);
    await this.prisma.application.delete({ where: { id } });
    return true;
  }
}
