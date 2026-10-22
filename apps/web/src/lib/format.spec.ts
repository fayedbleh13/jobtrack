import { describe, expect, it } from 'vitest';
import { formatSalaryRange } from './format';

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
