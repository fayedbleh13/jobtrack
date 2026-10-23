import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { ApplicationStatus } from '../../common/graphql/application-status.enum';
import type { AnalyticsSummary, StatusCount, TimePoint } from '../analytics.calculator';

@ObjectType('StatusCount')
export class StatusCountModel implements StatusCount {
  @Field(() => ApplicationStatus)
  status: ApplicationStatus;

  @Field(() => Int)
  count: number;
}

@ObjectType('TimePoint')
export class TimePointModel implements TimePoint {
  @Field()
  date: string;

  @Field(() => Int)
  count: number;
}

@ObjectType('AnalyticsSummary')
export class AnalyticsSummaryModel implements AnalyticsSummary {
  @Field(() => Int)
  total: number;

  @Field(() => [StatusCountModel], {
    description: 'Every status, including those with a count of zero.',
  })
  byStatus: StatusCountModel[];

  @Field(() => Float, {
    description: 'Fraction of submitted applications that received any response.',
  })
  responseRate: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Mean days between applying and the first interview, if any.',
  })
  avgDaysToInterview: number | null;

  @Field(() => [TimePointModel])
  applicationsOverTime: TimePointModel[];
}
