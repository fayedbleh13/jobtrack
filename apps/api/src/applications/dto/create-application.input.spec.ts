import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateApplicationInput } from './create-application.input';

function makeInput(overrides: Record<string, unknown> = {}) {
  return plainToInstance(CreateApplicationInput, {
    company: 'Acme Corp',
    role: 'Engineer',
    ...overrides,
  });
}

describe('CreateApplicationInput', () => {
  it('accepts a minimal application', async () => {
    await expect(validate(makeInput())).resolves.toHaveLength(0);
  });

  it('rejects a priority outside the three supported levels', async () => {
    const errors = await validate(makeInput({ priority: 5 }));

    expect(errors.some((error) => error.property === 'priority')).toBe(true);
  });

  it('rejects a non-http job URL', async () => {
    const errors = await validate(makeInput({ jobUrl: 'javascript:alert(1)' }));

    expect(errors.some((error) => error.property === 'jobUrl')).toBe(true);
  });

  it('accepts an https job URL', async () => {
    const errors = await validate(makeInput({ jobUrl: 'https://example.com/jobs/1' }));

    expect(errors).toHaveLength(0);
  });

  it('rejects a value that is not a Date for appliedAt', async () => {
    const errors = await validate(makeInput({ appliedAt: 'not-a-date' }));

    expect(errors.some((error) => error.property === 'appliedAt')).toBe(true);
  });
});
