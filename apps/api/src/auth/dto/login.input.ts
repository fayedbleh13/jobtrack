import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  @MaxLength(254) // RFC 5321 maximum
  email: string;

  @Field()
  @MinLength(8)
  @MaxLength(72) // bcrypt silently ignores bytes beyond 72 — cap here to be explicit
  password: string;
}
