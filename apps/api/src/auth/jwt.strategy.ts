import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ACCESS_TOKEN_COOKIE, getJwtSecret } from './auth.constants';

type JwtPayload = { sub: string; email: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => req?.cookies?.[ACCESS_TOKEN_COOKIE] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(config),
    });
  }

  async validate(payload: JwtPayload) {
    return this.users.findById(payload.sub);
  }
}
