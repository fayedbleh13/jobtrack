'use client';

import { useQuery } from '@apollo/client/react';
import { ApplicationsDocument } from '@/graphql/generated/graphql';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useApplicationFilters } from '@/stores/application-filters';
import { ApplicationCard } from './application-card';
import { CreateApplicationDialog } from './create-application-dialog';
import { FilterBar } from './filter-bar';

export function ApplicationsBoard() {
  const status = useApplicationFilters((state) => state.status);
  const search = useApplicationFilters((state) => state.search);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, loading, error } = useQuery(ApplicationsDocument, {
    variables: {
      status: status === 'ALL' ? undefined : status,
      search: debouncedSearch.trim() || undefined,
    },
  });

  const applications = data?.applications ?? [];
  const isEmpty = !loading && !error && applications.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <FilterBar />
        <CreateApplicationDialog />
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading applications…</p> : null}

      {error ? (
        <p className="text-sm text-rose-600">Could not load applications: {error.message}</p>
      ) : null}

      {isEmpty ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-slate-500">
          No applications match these filters yet.
        </div>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {applications.map((application) => (
          <li key={application.id}>
            <ApplicationCard application={application} />
          </li>
        ))}
      </ul>
    </div>
  );
}
