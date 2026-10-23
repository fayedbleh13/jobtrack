import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationStatus } from '../common/graphql/application-status.enum';
import type { PrismaService } from '../prisma/prisma.service';
import { ApplicationsService } from './applications.service';

const prisma = {
  application: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  stageEvent: {
    updateMany: vi.fn(),
  },
  $transaction: vi.fn(),
};

function makeService(): ApplicationsService {
  return new ApplicationsService(prisma as unknown as PrismaService);
}

const baseApplication = {
  id: 'a1',
  userId: 'u1',
  company: 'Acme',
  role: 'Engineer',
  status: ApplicationStatus.APPLIED,
  salaryMin: 100,
  salaryMax: 200,
  contacts: [],
  timeline: [],
  reminders: [],
};

describe('ApplicationsService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    prisma.$transaction.mockImplementation(async (callback: (tx: typeof prisma) => unknown) =>
      callback(prisma),
    );
  });

  describe('list', () => {
    it('scopes to the user and clamps pagination', async () => {
      prisma.application.findMany.mockResolvedValue([]);

      await makeService().list('u1', ApplicationStatus.INTERVIEW, 'acme', 500, -10);

      expect(prisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'u1',
            status: ApplicationStatus.INTERVIEW,
          }),
          take: 100,
          skip: 0,
        }),
      );
    });
  });

  describe('getById', () => {
    it('throws a NOT_FOUND GraphQL error when the application is missing', async () => {
      prisma.application.findFirst.mockResolvedValue(null);

      await expect(makeService().getById('u1', 'missing')).rejects.toMatchObject({
        extensions: { code: 'NOT_FOUND' },
      });
    });
  });

  describe('create', () => {
    it('rejects an application that starts in a non-initial status', async () => {
      await expect(
        makeService().create('u1', {
          company: 'Acme',
          role: 'Engineer',
          status: ApplicationStatus.OFFER,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('dates the initial APPLIED event with the supplied appliedAt', async () => {
      prisma.application.create.mockImplementation(async ({ data }) => ({ id: 'a1', ...data }));
      const appliedAt = new Date('2026-10-01T12:00:00.000Z');

      await makeService().create('u1', {
        company: 'Acme',
        role: 'Engineer',
        status: ApplicationStatus.APPLIED,
        appliedAt,
      });

      expect(prisma.application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            timeline: {
              create: [{ toStatus: ApplicationStatus.APPLIED, at: appliedAt }],
            },
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('rejects a salary range where the minimum exceeds the maximum', async () => {
      prisma.application.findFirst.mockResolvedValue(baseApplication);

      await expect(makeService().update('u1', 'a1', { salaryMin: 300 })).rejects.toBeInstanceOf(
        BadRequestException,
      );

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('changeStatus', () => {
    it('rejects an illegal transition', async () => {
      prisma.application.findFirst.mockResolvedValue(baseApplication);

      await expect(
        makeService().changeStatus('u1', 'a1', ApplicationStatus.OFFER),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
