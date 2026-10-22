import { describe, expect, it } from 'vitest';
import { ApplicationStatus } from '../common/graphql/application-status.enum';
import { ALLOWED_STATUS_TRANSITIONS, canTransition } from './application-status.rules';

describe('canTransition', () => {
  it('allows the happy path through the pipeline', () => {
    expect(canTransition(ApplicationStatus.WISHLIST, ApplicationStatus.APPLIED)).toBe(true);
    expect(canTransition(ApplicationStatus.APPLIED, ApplicationStatus.SCREENING)).toBe(true);
    expect(canTransition(ApplicationStatus.SCREENING, ApplicationStatus.INTERVIEW)).toBe(true);
    expect(canTransition(ApplicationStatus.INTERVIEW, ApplicationStatus.OFFER)).toBe(true);
  });

  it('rejects skipping stages', () => {
    expect(canTransition(ApplicationStatus.APPLIED, ApplicationStatus.OFFER)).toBe(false);
    expect(canTransition(ApplicationStatus.WISHLIST, ApplicationStatus.INTERVIEW)).toBe(false);
  });

  it('rejects a no-op transition', () => {
    expect(canTransition(ApplicationStatus.APPLIED, ApplicationStatus.APPLIED)).toBe(false);
  });

  it('rejects moving from a rejected application straight to an offer', () => {
    expect(canTransition(ApplicationStatus.REJECTED, ApplicationStatus.OFFER)).toBe(false);
  });

  it('allows re-opening a rejected or ghosted application', () => {
    expect(canTransition(ApplicationStatus.REJECTED, ApplicationStatus.APPLIED)).toBe(true);
    expect(canTransition(ApplicationStatus.GHOSTED, ApplicationStatus.APPLIED)).toBe(true);
  });

  it('defines a transition list for every status', () => {
    expect(Object.keys(ALLOWED_STATUS_TRANSITIONS)).toHaveLength(7);
  });
});
