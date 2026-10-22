import { describe, expect, it } from 'vitest';
import {
  formatDays,
  formatPercent,
  formatShortDate,
  offersCount,
  toFunnelData,
  toTimeSeries,
} from './analytics-view-model';

describe('toFunnelData', () => {
  it('maps statuses to human labels and keeps zero counts', () => {
    const data = toFunnelData([
      { status: 'WISHLIST', count: 1 },
      { status: 'APPLIED', count: 2 },
      { status: 'OFFER', count: 0 },
    ]);

    expect(data).toEqual([
      { label: 'Wishlist', count: 1 },
      { label: 'Applied', count: 2 },
      { label: 'Offer', count: 0 },
    ]);
  });
});

describe('toTimeSeries', () => {
  it('formats an ISO date into a short axis label', () => {
    expect(toTimeSeries([{ date: '2026-10-01', count: 2 }])).toEqual([
      { label: '01 Oct', count: 2 },
    ]);
  });

  it('passes through values it cannot parse', () => {
    expect(formatShortDate('not-a-date')).toBe('not-a-date');
  });

  it('formats each month boundary correctly', () => {
    expect(formatShortDate('2026-01-05')).toBe('05 Jan');
    expect(formatShortDate('2026-12-31')).toBe('31 Dec');
  });
});

describe('formatPercent', () => {
  it('rounds a fraction to a whole percentage', () => {
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(0.7142857142857143)).toBe('71%');
    expect(formatPercent(1)).toBe('100%');
  });
});

describe('formatDays', () => {
  it('returns a dash when there is no measurement', () => {
    expect(formatDays(null)).toBe('—');
  });

  it('keeps whole numbers clean and trims decimals to one place', () => {
    expect(formatDays(10)).toBe('10 days');
    expect(formatDays(18.74)).toBe('18.7 days');
  });
});

describe('offersCount', () => {
  it('reads the offer bucket out of the status counts', () => {
    expect(
      offersCount([
        { status: 'APPLIED', count: 3 },
        { status: 'OFFER', count: 2 },
      ]),
    ).toBe(2);
  });

  it('is zero when there are no offers', () => {
    expect(offersCount([{ status: 'APPLIED', count: 3 }])).toBe(0);
  });
});
