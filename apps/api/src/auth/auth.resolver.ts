import { ConfigService } from '@nestjs/config';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { GqlContext } from '../common/gql-context';
import { UserEntity } from '../users/user.entity';
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_MAX_AGE_MS } from './auth.constants';
import { AuthService } from './auth.service';
import { AuthPayload } from './auth.types';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

@Resolver(() => UserEntity)
export class AuthResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Mutation(() => AuthPayload)
  async register(
    @Args('input') input: RegisterInput,
    @Context() ctx: GqlContext,
  ): Promise<AuthPayload> {
    const user = await this.auth.register(input);
    await this.setSessionCookie(ctx.res, user);
    return { user };
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput, @Context() ctx: GqlContext): Promise<AuthPayload> {
    const user = await this.auth.login(input);
    await this.setSessionCookie(ctx.res, user);
    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Context() ctx: GqlContext): boolean {
    ctx.res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    return true;
  }

  @Query(() => UserEntity, { nullable: true })
  me(@CurrentUser() user: UserEntity | null): UserEntity | null {
    return user ?? null;
  }

  private async setSessionCookie(
    res: Response,
    user: { id: string; email: string },
  ): Promise<void> {
    const token = await this.auth.signToken(user);
    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get<string>('COOKIE_SECURE') === 'true',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });
  }
}
