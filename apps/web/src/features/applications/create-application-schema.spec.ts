import { describe, expect, it } from 'vitest';
import { createApplicationSchema } from './create-application-schema';

const MINIMAL = { company: 'Acme Corp', role: 'Engineer' };

function errorPaths(input: unknown): string[] {
  const result = createApplicationSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => String(issue.path[0] ?? ''));
}

describe('createApplicationSchema', () => {
  it('accepts a minimal application', () => {
    expect(createApplicationSchema.safeParse(MINIMAL).success).toBe(true);
  });

  it('requires a company and a role', () => {
    const paths = errorPaths({ company: '   ', role: '' });

    expect(paths).toContain('company');
    expect(paths).toContain('role');
  });

  it('accepts a well formed salary range', () => {
    const result = createApplicationSchema.safeParse({
      ...MINIMAL,
      salaryMin: '90000',
      salaryMax: '120000',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a salary that is not a whole number', () => {
    expect(errorPaths({ ...MINIMAL, salaryMin: '90k' })).toContain('salaryMin');
  });

  it('rejects a maximum below the minimum', () => {
    expect(errorPaths({ ...MINIMAL, salaryMin: '120000', salaryMax: '90000' })).toContain(
      'salaryMax',
    );
  });

  it('accepts a priority outside the offered options only if it is a known value', () => {
    expect(createApplicationSchema.safeParse({ ...MINIMAL, priority: '2' }).success).toBe(true);
    expect(createApplicationSchema.safeParse({ ...MINIMAL, priority: '5' }).success).toBe(false);
  });
});
