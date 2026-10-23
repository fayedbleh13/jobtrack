import { ServiceUnavailableException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

const prisma = {
  $queryRaw: vi.fn(),
};

function makeController(): HealthController {
  return new HealthController(prisma as unknown as PrismaService);
}

describe('HealthController', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('reports ok when the database responds', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    await expect(makeController().check()).resolves.toEqual({ status: 'ok' });
  });

  it('reports 503 when the database is unreachable', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'));

    await expect(makeController().check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
