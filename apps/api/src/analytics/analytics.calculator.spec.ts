import { describe, expect, it } from 'vitest';
import { ApplicationStatus } from '../common/graphql/application-status.enum';
import {
  type ApplicationWithTimeline,
  applicationsOverTime,
  averageDaysToInterview,
  calculateAnalytics,
  countByStatus,
  responseRate,
} from './analytics.calculator';

function at(dayOfMonth: number): Date {
  return new Date(Date.UTC(2026, 9, dayOfMonth, 12));
}

function application(
  status: ApplicationStatus,
  events: Array<[ApplicationStatus, number]>,
): ApplicationWithTimeline {
  return {
    status,
    timeline: events.map(([toStatus, dayOfMonth]) => ({ toStatus, at: at(dayOfMonth) })),
  };
}

const wishlist = application(ApplicationStatus.WISHLIST, [[ApplicationStatus.WISHLIST, 1]]);
const appliedOnly = application(ApplicationStatus.APPLIED, [
  [ApplicationStatus.WISHLIST, 1],
  [ApplicationStatus.APPLIED, 2],
]);
const screening = application(ApplicationStatus.SCREENING, [
  [ApplicationStatus.APPLIED, 1],
  [ApplicationStatus.SCREENING, 4],
]);
const rejected = application(ApplicationStatus.REJECTED, [
  [ApplicationStatus.APPLIED, 1],
  [ApplicationStatus.SCREENING, 3],
  [ApplicationStatus.REJECTED, 6],
]);
const ghosted = application(ApplicationStatus.GHOSTED, [
  [ApplicationStatus.APPLIED, 1],
  [ApplicationStatus.GHOSTED, 30],
]);
const interviewed = application(ApplicationStatus.INTERVIEW, [
  [ApplicationStatus.APPLIED, 1],
  [ApplicationStatus.INTERVIEW, 11],
]);
const offered = application(ApplicationStatus.OFFER, [
  [ApplicationStatus.APPLIED, 1],
  [ApplicationStatus.INTERVIEW, 21],
  [ApplicationStatus.OFFER, 30],
]);

describe('countByStatus', () => {
  it('returns every status in order, including zeroes', () => {
    const counts = countByStatus([]);

    expect(counts).toHaveLength(7);
    expect(counts.map((entry) => entry.status)).toEqual([
      'WISHLIST',
      'APPLIED',
      'SCREENING',
      'INTERVIEW',
      'OFFER',
      'REJECTED',
      'GHOSTED',
    ]);
    expect(counts.every((entry) => entry.count === 0)).toBe(true);
  });

  it('counts applications per current status', () => {
    const counts = countByStatus([appliedOnly, appliedOnly, interviewed]);
    const byStatus = Object.fromEntries(counts.map((entry) => [entry.status, entry.count]));

    expect(byStatus.APPLIED).toBe(2);
    expect(byStatus.INTERVIEW).toBe(1);
    expect(byStatus.OFFER).toBe(0);
  });
});

describe('responseRate', () => {
  it('is zero when nothing has been submitted', () => {
    expect(responseRate([])).toBe(0);
    expect(responseRate([wishlist])).toBe(0);
  });

  it('ignores wishlist entries and treats a rejection as a response', () => {
    const rate = responseRate([wishlist, appliedOnly, screening, rejected, ghosted]);

    // submitted: appliedOnly, screening, rejected, ghosted
    // responded: screening, rejected
    expect(rate).toBeCloseTo(0.5);
  });

  it('reaches one when every submission was answered', () => {
    expect(responseRate([screening, rejected, offered])).toBe(1);
  });
});

describe('averageDaysToInterview', () => {
  it('is null when nobody reached an interview', () => {
    expect(averageDaysToInterview([appliedOnly, rejected])).toBeNull();
  });

  it('measures from applying to the first interview', () => {
    // interviewed: day 1 -> day 11 = 10 days; offered: day 1 -> day 21 = 20 days
    expect(averageDaysToInterview([interviewed, offered, appliedOnly])).toBe(15);
  });

  it('rounds to one decimal place', () => {
    const quick = application(ApplicationStatus.INTERVIEW, [
      [ApplicationStatus.APPLIED, 1],
      [ApplicationStatus.INTERVIEW, 2],
    ]);
    const slow = application(ApplicationStatus.INTERVIEW, [
      [ApplicationStatus.APPLIED, 1],
      [ApplicationStatus.INTERVIEW, 3],
    ]);

    // 1 and 2 days -> mean 1.5
    expect(averageDaysToInterview([quick, slow])).toBe(1.5);
  });
});

describe('applicationsOverTime', () => {
  it('groups by the date the application was submitted and sorts ascending', () => {
    const late = application(ApplicationStatus.APPLIED, [[ApplicationStatus.APPLIED, 5]]);
    const early = application(ApplicationStatus.APPLIED, [[ApplicationStatus.APPLIED, 1]]);

    expect(applicationsOverTime([late, early, early])).toEqual([
      { date: '2026-10-01', count: 2 },
      { date: '2026-10-05', count: 1 },
    ]);
  });

  it('skips applications that were never submitted', () => {
    expect(applicationsOverTime([wishlist])).toEqual([]);
  });
});

describe('calculateAnalytics', () => {
  it('returns an empty but well formed summary for a new account', () => {
    expect(calculateAnalytics([])).toEqual({
      total: 0,
      byStatus: expect.any(Array),
      responseRate: 0,
      avgDaysToInterview: null,
      applicationsOverTime: [],
    });
  });

  it('composes the individual measures', () => {
    const summary = calculateAnalytics([wishlist, interviewed, ghosted]);

    expect(summary.total).toBe(3);
    expect(summary.responseRate).toBeCloseTo(0.5);
    expect(summary.avgDaysToInterview).toBe(10);
    expect(summary.applicationsOverTime).toHaveLength(1);
    expect(summary.byStatus.reduce((sum, entry) => sum + entry.count, 0)).toBe(3);
  });
});
