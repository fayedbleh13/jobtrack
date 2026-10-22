import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateAnalytics } from './analytics.calculator';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(userId: string) {
    const applications = await this.prisma.application.findMany({
      where: { userId },
      select: {
        status: true,
        timeline: {
          select: { toStatus: true, at: true },
          orderBy: { at: 'asc' },
        },
      },
    });

    return calculateAnalytics(applications);
  }
}
