import { describe, expect, it } from 'vitest';
import { normalizeDatabaseUrl } from './database-url';

describe('normalizeDatabaseUrl', () => {
  it('upgrades legacy sslmode aliases to verify-full', () => {
    expect(
      normalizeDatabaseUrl(
        'postgresql://user:pass@example.com:5432/db?sslmode=require&schema=public',
      ),
    ).toBe('postgresql://user:pass@example.com:5432/db?sslmode=verify-full&schema=public');
  });

  it('handles prefer and verify-ca', () => {
    expect(normalizeDatabaseUrl('postgresql://db?sslmode=prefer')).toBe(
      'postgresql://db?sslmode=verify-full',
    );
    expect(normalizeDatabaseUrl('postgresql://db?sslmode=verify-ca')).toBe(
      'postgresql://db?sslmode=verify-full',
    );
  });

  it('leaves verify-full, disable, and absent sslmode untouched', () => {
    expect(normalizeDatabaseUrl('postgresql://db?sslmode=verify-full')).toBe(
      'postgresql://db?sslmode=verify-full',
    );
    expect(normalizeDatabaseUrl('postgresql://db?sslmode=disable')).toBe(
      'postgresql://db?sslmode=disable',
    );
    expect(normalizeDatabaseUrl('postgresql://db?schema=public')).toBe(
      'postgresql://db?schema=public',
    );
  });

  it('returns undefined for a missing URL', () => {
    expect(normalizeDatabaseUrl(undefined)).toBeUndefined();
  });
});
