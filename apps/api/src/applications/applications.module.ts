import { Module } from '@nestjs/common';
import { ApplicationsResolver } from './applications.resolver';
import { ApplicationsService } from './applications.service';

@Module({
  providers: [ApplicationsService, ApplicationsResolver],
})
export class ApplicationsModule {}
