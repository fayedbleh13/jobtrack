import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { normalizeDatabaseUrl } from '../common/database-url';
import { requireEnv } from '../common/env';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: normalizeDatabaseUrl(requireEnv('DATABASE_URL')),
      }),
    });
  }

  // Deliberately no eager `$connect()` in onModuleInit. Prisma connects on the
  // first query, which lets Nest bind PORT immediately; Render's port scan then
  // does not warn while a cold Neon database is waking up.
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
