import type { ConfigService } from '@nestjs/config';
import { requireEnv } from '../common/env';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
export const ACCESS_TOKEN_MAX_AGE_MS = ACCESS_TOKEN_TTL_SECONDS * 1000;

export function getJwtSecret(config: ConfigService): string {
  return config.get<string>('JWT_SECRET') ?? requireEnv('JWT_SECRET');
}
