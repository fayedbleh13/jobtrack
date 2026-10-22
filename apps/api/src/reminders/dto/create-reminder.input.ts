import { Field, GraphQLISODateTime, ID, InputType } from '@nestjs/graphql';
import { IsDate, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateReminderInput {
  @Field(() => ID)
  @IsString()
  applicationId: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  dueAt: Date;
}
