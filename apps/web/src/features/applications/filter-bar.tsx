'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type StatusFilterValue, useApplicationFilters } from '@/stores/application-filters';
import { STATUS_LABELS } from './status-badge';

const STATUS_OPTIONS: StatusFilterValue[] = [
  'ALL',
  'WISHLIST',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'GHOSTED',
];

export function FilterBar() {
  const status = useApplicationFilters((state) => state.status);
  const search = useApplicationFilters((state) => state.search);
  const setStatus = useApplicationFilters((state) => state.setStatus);
  const setSearch = useApplicationFilters((state) => state.setSearch);

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        value={search}
        placeholder="Search by company or role"
        aria-label="Search applications"
        className="max-w-sm"
        onChange={(event) => setSearch(event.target.value)}
      />

      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Filter by status</legend>
        {STATUS_OPTIONS.map((option) => {
          const isActive = option === status;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => setStatus(option)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                isActive
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400',
              )}
            >
              {option === 'ALL' ? 'All' : STATUS_LABELS[option]}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
