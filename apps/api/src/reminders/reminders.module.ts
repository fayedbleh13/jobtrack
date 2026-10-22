import { Module } from '@nestjs/common';
import { RemindersResolver } from './reminders.resolver';
import { RemindersService } from './reminders.service';

@Module({
  providers: [RemindersService, RemindersResolver],
})
export class RemindersModule {}
