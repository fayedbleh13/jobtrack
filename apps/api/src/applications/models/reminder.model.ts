import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Reminder')
export class ReminderModel {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => GraphQLISODateTime)
  dueAt: Date;

  @Field()
  done: boolean;
}
