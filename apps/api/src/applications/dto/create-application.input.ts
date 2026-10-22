import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { ApplicationStatus } from '../../common/graphql/application-status.enum';

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
  salaryMin?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  jobUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @Field(() => ApplicationStatus, { nullable: true })
  @IsOptional()
  status?: ApplicationStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  appliedAt?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
