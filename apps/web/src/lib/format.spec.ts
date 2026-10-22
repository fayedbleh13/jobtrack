import { describe, expect, it } from 'vitest';
import { formatDate, formatSalaryRange } from './format';

describe('formatSalaryRange', () => {
  it('returns null when no bounds are given', () => {
    expect(formatSalaryRange()).toBeNull();
    expect(formatSalaryRange(null, null)).toBeNull();
  });

  it('formats a full range', () => {
    expect(formatSalaryRange(120000, 150000)).toBe('$120k – $150k');
  });

  it('formats an open-ended range', () => {
    expect(formatSalaryRange(120000)).toBe('$120k');
    expect(formatSalaryRange(null, 150000)).toBe('$150k');
  });
});

describe('formatDate', () => {
  it('formats an ISO timestamp as a readable date', () => {
    expect(formatDate('2026-10-01T12:00:00.000Z')).toBe('01 Oct 2026');
  });

  it('returns a dash for missing or unparseable values', () => {
    expect(formatDate()).toBe('—');
    expect(formatDate(null)).toBe('—');
    expect(formatDate('not-a-date')).toBe('—');
  });
});
