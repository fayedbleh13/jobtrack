import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import type { LoginInput } from './dto/login.input';
import type { RegisterInput } from './dto/register.input';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    return this.users.create({ email: input.email, name: input.name, passwordHash });
  }

  async login(input: LoginInput) {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { id: user.id, email: user.email, name: user.name };
  }

  signToken(user: { id: string; email: string }): Promise<string> {
    return this.jwt.signAsync({ sub: user.id, email: user.email });
  }
}
