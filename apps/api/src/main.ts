import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // ── Security headers ────────────────────────────────────────────────────────
  // GraphQL over POST does not use <form> embeds, so frameguard DENY is safe.
  // The CSP is intentionally permissive for the GraphQL IDE in development;
  // tighten `script-src` when the Apollo Sandbox is disabled in production.
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://embeddable-sandbox.cdn.apollographql.com',
          ],
          imgSrc: ["'self'", 'data:', 'https://embeddable-sandbox.cdn.apollographql.com'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    }),
  );

  // ── Core middleware ─────────────────────────────────────────────────────────
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties from DTOs
      transform: true, // auto-coerce primitive types
      forbidNonWhitelisted: true, // throw on extra fields instead of silently dropping
    }),
  );

  // ── CORS ────────────────────────────────────────────────────────────────────
  const origin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Render (and most PaaS providers) inject PORT and route only to that port.
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`GraphQL API ready on port ${port}`);
}

void bootstrap();
