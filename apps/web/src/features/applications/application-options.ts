import type { ApplicationStatus } from '@/graphql/generated/graphql';

export const STATUS_VALUES = [
  'WISHLIST',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'GHOSTED',
] as const satisfies readonly ApplicationStatus[];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  GHOSTED: 'Ghosted',
};

export const STAGE_VALUES = ['APPLIED', 'WISHLIST'] as const;

export const STAGE_OPTIONS = STAGE_VALUES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

export const SOURCE_OPTIONS = [
  'LinkedIn',
  'Company site',
  'Job board',
  'Referral',
  'Recruiter',
  'Career fair',
  'Other',
] as const;

export const PRIORITY_VALUES = ['1', '2', '3'] as const;

export const PRIORITY_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
};

export const PRIORITY_ITEMS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));
