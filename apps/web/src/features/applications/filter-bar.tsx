'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type StatusFilterValue, useApplicationFilters } from '@/stores/application-filters';
import { STATUS_LABELS, STATUS_VALUES } from './application-options';

const STATUS_OPTIONS: StatusFilterValue[] = ['ALL', ...STATUS_VALUES];

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
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/50',
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
