import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../users/user.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsSummaryModel } from './models/analytics-summary.model';

@Resolver(() => AnalyticsSummaryModel)
@UseGuards(GqlAuthGuard)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Query(() => AnalyticsSummaryModel)
  analytics(@CurrentUser() user: UserEntity) {
    return this.analyticsService.summary(user.id);
  }
}
