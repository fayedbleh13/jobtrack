import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(254) // RFC 5321 maximum
  email: string;

  @Field()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @Field()
  @MinLength(1)
  @MaxLength(80)
  name: string;
}
