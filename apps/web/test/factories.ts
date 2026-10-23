import type { ApplicationSummary } from '@/features/applications/application-card';
import type { TimelineEntry } from '@/features/applications/status-timeline';
import type { Reminder } from '@/features/reminders/reminders-view-model';
import type { AnalyticsQuery, ApplicationQuery } from '@/graphql/generated/graphql';

export function makeApplicationSummary(
  overrides: Partial<ApplicationSummary> = {},
): ApplicationSummary {
  return {
    id: 'a1',
    company: 'Acme Corp',
    role: 'Senior Frontend Engineer',
    location: 'Remote',
    salaryMin: 120000,
    salaryMax: 150000,
    source: 'LinkedIn',
    status: 'INTERVIEW',
    priority: 3,
    appliedAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-02T12:00:00.000Z',
    contacts: [],
    reminders: [],
    ...overrides,
  };
}

export function makeApplicationDetail(
  overrides: Partial<ApplicationQuery['application']> = {},
): ApplicationQuery['application'] {
  return {
    id: 'a1',
    company: 'Acme Corp',
    role: 'Senior Frontend Engineer',
    location: 'Remote',
    salaryMin: 120000,
    salaryMax: 150000,
    jobUrl: null,
    source: 'LinkedIn',
    status: 'INTERVIEW',
    priority: 3,
    appliedAt: '2026-10-01T12:00:00.000Z',
    notes: 'Third round scheduled.',
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-02T12:00:00.000Z',
    allowedNextStatuses: ['OFFER', 'REJECTED', 'GHOSTED'],
    contacts: [],
    timeline: [],
    reminders: [],
    ...overrides,
  };
}

export function makeTimelineEntry(overrides: Partial<TimelineEntry> = {}): TimelineEntry {
  return {
    id: 't1',
    fromStatus: null,
    toStatus: 'WISHLIST',
    at: '2026-10-01T12:00:00.000Z',
    note: null,
    ...overrides,
  };
}

export function makeReminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: 'r1',
    title: 'Send thank-you note',
    dueAt: '2026-10-06T12:00:00.000Z',
    done: false,
    application: {
      id: 'a1',
      company: 'Acme Corp',
      role: 'Engineer',
      status: 'APPLIED',
    },
    ...overrides,
  };
}

export function makeAnalytics(
  overrides: Partial<AnalyticsQuery['analytics']> = {},
): AnalyticsQuery['analytics'] {
  return {
    total: 8,
    responseRate: 0.7142857142857143,
    avgDaysToInterview: 18.7,
    byStatus: [
      { status: 'WISHLIST', count: 1 },
      { status: 'APPLIED', count: 2 },
      { status: 'SCREENING', count: 1 },
      { status: 'INTERVIEW', count: 1 },
      { status: 'OFFER', count: 1 },
      { status: 'REJECTED', count: 1 },
      { status: 'GHOSTED', count: 1 },
    ],
    applicationsOverTime: [{ date: '2026-10-01', count: 2 }],
    ...overrides,
  };
}
