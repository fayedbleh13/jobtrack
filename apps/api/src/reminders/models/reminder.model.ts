import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { ApplicationModel } from '../../applications/models/application.model';

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

  @Field(() => ApplicationModel, {
    description: 'The application this reminder belongs to.',
  })
  application: ApplicationModel;
}
