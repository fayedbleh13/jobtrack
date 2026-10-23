import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

/**
 * Shared HTTP bootstrap configuration.
 *
 * Keeping this separate from `main.ts` makes the app easy to mount in
 * integration tests without duplicating middleware setup.
 */
export function configureApp(app: NestExpressApplication): void {
  // The API is deployed behind a single reverse proxy (Render/Vercel).
  // Without this, req.ip is the proxy address and rate limiting becomes global.
  app.set('trust proxy', 1);

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
}
