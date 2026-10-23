import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { RegisterInput } from './register.input';

describe('RegisterInput', () => {
  it('trims and lowercases the email before validation', async () => {
    const input = plainToInstance(RegisterInput, {
      email: '  Demo@Example.COM  ',
      password: 'password123',
      name: 'Demo',
    });

    expect(input.email).toBe('demo@example.com');
    await expect(validate(input)).resolves.toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const input = plainToInstance(RegisterInput, {
      email: 'not-an-email',
      password: 'password123',
      name: 'Demo',
    });

    const errors = await validate(input);
    expect(errors.some((error) => error.property === 'email')).toBe(true);
  });
});
