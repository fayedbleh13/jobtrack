import { defineConfig } from 'prisma/config';
import { normalizeDatabaseUrl } from './src/common/database-url';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: normalizeDatabaseUrl(process.env.DATABASE_URL) ?? '',
  },
});
