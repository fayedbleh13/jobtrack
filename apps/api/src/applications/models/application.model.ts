import { Field, GraphQLISODateTime, ID, Int, ObjectType } from '@nestjs/graphql';
import { ApplicationStatus } from '../../common/graphql/application-status.enum';
import { ContactModel } from './contact.model';
import { ReminderModel } from './reminder.model';
import { StageEventModel } from './stage-event.model';

@ObjectType('Application')
export class ApplicationModel {
  @Field(() => ID)
  id: string;

  @Field()
  company: string;

  @Field()
  role: string;

  @Field(() => String, { nullable: true })
  location: string | null;

  @Field(() => Int, { nullable: true })
  salaryMin: number | null;

  @Field(() => Int, { nullable: true })
  salaryMax: number | null;

  @Field(() => String, { nullable: true })
  jobUrl: string | null;

  @Field(() => String, { nullable: true })
  source: string | null;

  @Field(() => ApplicationStatus)
  status: ApplicationStatus;

  @Field(() => Int, { nullable: true })
  priority: number | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  appliedAt: Date | null;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => [ContactModel])
  contacts: ContactModel[];

  @Field(() => [StageEventModel])
  timeline: StageEventModel[];

  @Field(() => [ReminderModel])
  reminders: ReminderModel[];

  @Field(() => [ApplicationStatus], {
    description: 'Statuses this application may legally move to next.',
  })
  allowedNextStatuses: ApplicationStatus[];
}
