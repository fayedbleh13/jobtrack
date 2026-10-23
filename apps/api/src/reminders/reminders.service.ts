import { Injectable } from '@nestjs/common';
import { notFound } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderInput } from './dto/create-reminder.input';

const withApplication = {
  application: true,
} as const;

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  listOpen(userId: string) {
    return this.prisma.reminder.findMany({
      where: { done: false, application: { userId } },
      include: withApplication,
      orderBy: { dueAt: 'asc' },
    });
  }

  async create(userId: string, input: CreateReminderInput) {
    const application = await this.findOwnedApplication(userId, input.applicationId);

    return this.prisma.reminder.create({
      data: {
        applicationId: application.id,
        title: input.title,
        dueAt: input.dueAt,
      },
      include: withApplication,
    });
  }

  async toggle(userId: string, id: string) {
    const reminder = await this.prisma.reminder.findFirst({
      where: { id, application: { userId } },
      select: { id: true, done: true },
    });

    if (!reminder) {
      throw notFound('Reminder not found');
    }

    return this.prisma.reminder.update({
      where: { id: reminder.id },
      data: { done: !reminder.done },
      include: withApplication,
    });
  }

  private async findOwnedApplication(userId: string, id: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!application) {
      throw notFound('Application not found');
    }

    return application;
  }
}
