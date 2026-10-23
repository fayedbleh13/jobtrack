import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service';
import { RemindersService } from './reminders.service';

const prisma = {
  reminder: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  application: {
    findFirst: vi.fn(),
  },
};

function makeService(): RemindersService {
  return new RemindersService(prisma as unknown as PrismaService);
}

describe('RemindersService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lists only open reminders owned by the user', async () => {
    prisma.reminder.findMany.mockResolvedValue([]);

    await makeService().listOpen('u1');

    expect(prisma.reminder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { done: false, application: { userId: 'u1' } },
      }),
    );
  });

  it('refuses to create a reminder for an application owned by someone else', async () => {
    prisma.application.findFirst.mockResolvedValue(null);

    await expect(
      makeService().create('u1', {
        applicationId: 'a-other',
        title: 'Follow up',
        dueAt: new Date(),
      }),
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });

  it('refuses to toggle a reminder owned by someone else', async () => {
    prisma.reminder.findFirst.mockResolvedValue(null);

    await expect(makeService().toggle('u1', 'r-other')).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
  });
});
