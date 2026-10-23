import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApplicationStatus } from '../../common/graphql/application-status.enum';

const MAX_SALARY = 100_000_000;

@InputType()
export class CreateApplicationInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  company: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  role: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_SALARY)
  salaryMin?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_SALARY)
  salaryMax?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ValidateIf((_input, value) => value !== '')
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  jobUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @Field(() => ApplicationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  priority?: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  appliedAt?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
