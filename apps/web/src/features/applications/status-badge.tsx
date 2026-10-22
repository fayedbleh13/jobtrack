import { Badge } from '@/components/ui/badge';
import type { ApplicationStatus } from '@/graphql/generated/graphql';
import { cn } from '@/lib/utils';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  GHOSTED: 'Ghosted',
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  WISHLIST: 'bg-slate-100 text-slate-700',
  APPLIED: 'bg-blue-100 text-blue-700',
  SCREENING: 'bg-indigo-100 text-indigo-700',
  INTERVIEW: 'bg-amber-100 text-amber-800',
  OFFER: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  GHOSTED: 'bg-zinc-200 text-zinc-600',
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge variant="outline" className={cn('border-transparent', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
