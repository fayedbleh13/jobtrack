import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ReminderModel } from '../applications/models/reminder.model';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../users/user.entity';
import { CreateReminderInput } from './dto/create-reminder.input';
import { RemindersService } from './reminders.service';

@Resolver(() => ReminderModel)
@UseGuards(GqlAuthGuard)
export class RemindersResolver {
  constructor(private readonly remindersService: RemindersService) {}

  @Query(() => [ReminderModel], {
    description: 'Reminders that are still open, soonest first.',
  })
  upcomingReminders(@CurrentUser() user: UserEntity) {
    return this.remindersService.listOpen(user.id);
  }

  @Mutation(() => ReminderModel)
  createReminder(@CurrentUser() user: UserEntity, @Args('input') input: CreateReminderInput) {
    return this.remindersService.create(user.id, input);
  }

  @Mutation(() => ReminderModel)
  toggleReminder(@CurrentUser() user: UserEntity, @Args('id', { type: () => ID }) id: string) {
    return this.remindersService.toggle(user.id, id);
  }
}
