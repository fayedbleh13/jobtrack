import { ApplicationStatus } from '../common/graphql/application-status.enum';

export const ALLOWED_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  WISHLIST: [ApplicationStatus.APPLIED, ApplicationStatus.GHOSTED],
  APPLIED: [
    ApplicationStatus.SCREENING,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.REJECTED,
    ApplicationStatus.GHOSTED,
  ],
  SCREENING: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED],
  INTERVIEW: [ApplicationStatus.OFFER, ApplicationStatus.REJECTED, ApplicationStatus.GHOSTED],
  OFFER: [ApplicationStatus.REJECTED],
  REJECTED: [ApplicationStatus.APPLIED],
  GHOSTED: [ApplicationStatus.APPLIED],
};

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  if (from === to) {
    return false;
  }
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}
