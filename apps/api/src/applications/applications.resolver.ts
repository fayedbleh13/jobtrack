import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApplicationStatus } from '../common/graphql/application-status.enum';
import { UserEntity } from '../users/user.entity';
import { ApplicationsService } from './applications.service';
import { CreateApplicationInput } from './dto/create-application.input';
import { UpdateApplicationInput } from './dto/update-application.input';
import { ApplicationModel } from './models/application.model';

@Resolver(() => ApplicationModel)
@UseGuards(GqlAuthGuard)
export class ApplicationsResolver {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Query(() => [ApplicationModel])
  applications(
    @CurrentUser() user: UserEntity,
    @Args('status', { type: () => ApplicationStatus, nullable: true })
    status?: ApplicationStatus,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    return this.applicationsService.list(user.id, status, search);
  }

  @Query(() => ApplicationModel)
  application(@CurrentUser() user: UserEntity, @Args('id', { type: () => ID }) id: string) {
    return this.applicationsService.getById(user.id, id);
  }

  @Mutation(() => ApplicationModel)
  createApplication(@CurrentUser() user: UserEntity, @Args('input') input: CreateApplicationInput) {
    return this.applicationsService.create(user.id, input);
  }

  @Mutation(() => ApplicationModel)
  updateApplication(
    @CurrentUser() user: UserEntity,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateApplicationInput,
  ) {
    return this.applicationsService.update(user.id, id, input);
  }

  @Mutation(() => ApplicationModel)
  changeStatus(
    @CurrentUser() user: UserEntity,
    @Args('id', { type: () => ID }) id: string,
    @Args('status', { type: () => ApplicationStatus }) status: ApplicationStatus,
    @Args('note', { type: () => String, nullable: true }) note?: string,
  ) {
    return this.applicationsService.changeStatus(user.id, id, status, note);
  }

  @Mutation(() => Boolean)
  deleteApplication(@CurrentUser() user: UserEntity, @Args('id', { type: () => ID }) id: string) {
    return this.applicationsService.remove(user.id, id);
  }
}
