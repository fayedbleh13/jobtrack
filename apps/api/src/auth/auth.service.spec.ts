import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const PASSWORD = 'password123';
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 10);

const users = {
  findByEmail: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
};

const jwt = {
  signAsync: vi.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new AuthService(users as unknown as UsersService, jwt as unknown as JwtService);
  });

  describe('login', () => {
    it('throws when the user does not exist', async () => {
      users.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: PASSWORD }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when the password does not match', async () => {
      users.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'ada@example.com',
        name: 'Ada',
        passwordHash: PASSWORD_HASH,
      });

      await expect(
        service.login({ email: 'ada@example.com', password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns the public user when credentials are valid', async () => {
      users.findByEmail.mockResolvedValue({
        id: 'u1',
        email: 'ada@example.com',
        name: 'Ada',
        passwordHash: PASSWORD_HASH,
      });

      await expect(
        service.login({ email: 'ada@example.com', password: PASSWORD }),
      ).resolves.toEqual({ id: 'u1', email: 'ada@example.com', name: 'Ada' });
    });
  });

  describe('register', () => {
    it('rejects an email that is already registered', async () => {
      users.findByEmail.mockResolvedValue({ id: 'u1' });

      await expect(
        service.register({ email: 'ada@example.com', password: PASSWORD, name: 'Ada' }),
      ).rejects.toThrow('Email is already registered');
      expect(users.create).not.toHaveBeenCalled();
    });

    it('hashes the password before storing the user', async () => {
      users.findByEmail.mockResolvedValue(null);
      users.create.mockImplementation(async (data: { passwordHash: string }) => ({
        id: 'u2',
        email: 'new@example.com',
        name: 'New',
        passwordHash: data.passwordHash,
      }));

      await service.register({ email: 'new@example.com', password: PASSWORD, name: 'New' });

      const stored = users.create.mock.calls[0]?.[0];
      expect(stored.passwordHash).not.toBe(PASSWORD);
      await expect(bcrypt.compare(PASSWORD, stored.passwordHash)).resolves.toBe(true);
    });
  });

  describe('signToken', () => {
    it('signs a payload containing the user id and email', async () => {
      jwt.signAsync.mockResolvedValue('signed-token');

      await expect(service.signToken({ id: 'u1', email: 'ada@example.com' })).resolves.toBe(
        'signed-token',
      );
      expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', email: 'ada@example.com' });
    });
  });
});
