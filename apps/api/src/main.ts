import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { configureApp } from './app.config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);

  // Let Nest run onModuleDestroy/onApplicationShutdown on SIGTERM so Prisma
  // closes its connections cleanly when a container is stopped.
  app.enableShutdownHooks();

  // Render (and most PaaS providers) inject PORT and route only to that port.
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  Logger.log(`GraphQL API ready on port ${port}`, 'Bootstrap');
}

void bootstrap();
