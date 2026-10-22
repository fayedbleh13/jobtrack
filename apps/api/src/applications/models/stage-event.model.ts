import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { ApplicationStatus } from '../../common/graphql/application-status.enum';

@ObjectType('StageEvent')
export class StageEventModel {
  @Field(() => ID)
  id: string;

  @Field(() => ApplicationStatus, { nullable: true })
  fromStatus: ApplicationStatus | null;

  @Field(() => ApplicationStatus)
  toStatus: ApplicationStatus;

  @Field(() => GraphQLISODateTime)
  at: Date;

  @Field(() => String, { nullable: true })
  note: string | null;
}
