import { ApplicationStatus } from '../common/graphql/application-status.enum';

export type TimelinePoint = {
  toStatus: ApplicationStatus;
  at: Date;
};

export type ApplicationWithTimeline = {
  status: ApplicationStatus;
  timeline: TimelinePoint[];
};

export type StatusCount = {
  status: ApplicationStatus;
  count: number;
};

export type TimePoint = {
  date: string;
  count: number;
};

export type AnalyticsSummary = {
  total: number;
  byStatus: StatusCount[];
  responseRate: number;
  avgDaysToInterview: number | null;
  applicationsOverTime: TimePoint[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const ALL_STATUSES = Object.values(ApplicationStatus) as ApplicationStatus[];

const RESPONSE_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.SCREENING,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
];

function firstEventFor(
  application: ApplicationWithTimeline,
  status: ApplicationStatus,
): TimelinePoint | undefined {
  return application.timeline.find((event) => event.toStatus === status);
}

export function countByStatus(applications: ApplicationWithTimeline[]): StatusCount[] {
  return ALL_STATUSES.map((status) => ({
    status,
    count: applications.filter((application) => application.status === status).length,
  }));
}

export function applicationsOverTime(applications: ApplicationWithTimeline[]): TimePoint[] {
  const counts = new Map<string, number>();

  for (const application of applications) {
    const applied = firstEventFor(application, ApplicationStatus.APPLIED);
    if (!applied) {
      continue;
    }

    const date = applied.at.toISOString().slice(0, 10);
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, count]) => ({ date, count }));
}

export function responseRate(applications: ApplicationWithTimeline[]): number {
  const submitted = applications.filter((application) =>
    application.timeline.some((event) => event.toStatus === ApplicationStatus.APPLIED),
  );

  if (submitted.length === 0) {
    return 0;
  }

  const responded = submitted.filter((application) =>
    application.timeline.some((event) => RESPONSE_STATUSES.includes(event.toStatus)),
  );

  return responded.length / submitted.length;
}

export function averageDaysToInterview(applications: ApplicationWithTimeline[]): number | null {
  const durations: number[] = [];

  for (const application of applications) {
    const applied = firstEventFor(application, ApplicationStatus.APPLIED);
    const interview = firstEventFor(application, ApplicationStatus.INTERVIEW);

    if (!applied || !interview) {
      continue;
    }

    const days = (interview.at.getTime() - applied.at.getTime()) / MS_PER_DAY;
    if (days >= 0) {
      durations.push(days);
    }
  }

  if (durations.length === 0) {
    return null;
  }

  const total = durations.reduce((sum, days) => sum + days, 0);
  return Math.round((total / durations.length) * 10) / 10;
}

export function calculateAnalytics(applications: ApplicationWithTimeline[]): AnalyticsSummary {
  return {
    total: applications.length,
    byStatus: countByStatus(applications),
    responseRate: responseRate(applications),
    avgDaysToInterview: averageDaysToInterview(applications),
    applicationsOverTime: applicationsOverTime(applications),
  };
}
