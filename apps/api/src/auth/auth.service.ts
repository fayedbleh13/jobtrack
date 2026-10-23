import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../generated/prisma/client';
import { UsersService } from '../users/users.service';
import type { LoginInput } from './dto/login.input';
import type { RegisterInput } from './dto/register.input';

const SALT_ROUNDS = 10;
// Compared against when the email does not exist so response timing does not
// reveal whether an account is registered.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const email = normalizeEmail(input.email);
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    try {
      return await this.users.create({ email, name: input.name, passwordHash });
    } catch (error) {
      // The check above is a friendly fast path; the unique index is the real
      // guard. Two concurrent registrations can still race here.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  async login(input: LoginInput) {
    const user = await this.users.findByEmail(normalizeEmail(input.email));
    const valid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { id: user.id, email: user.email, name: user.name };
  }

  signToken(user: { id: string; email: string }): Promise<string> {
    return this.jwt.signAsync({ sub: user.id, email: user.email });
  }
}
