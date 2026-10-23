'use client';

import { useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { EmptyState, ErrorState } from '@/components/state-panels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ApplicationsDocument } from '@/graphql/generated/graphql';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useApplicationFilters } from '@/stores/application-filters';
import { ApplicationCard } from './application-card';
import { CreateApplicationDialog } from './create-application-dialog';
import { FilterBar } from './filter-bar';

const SKELETON_KEYS = ['one', 'two', 'three', 'four', 'five', 'six'];
const PAGE_SIZE = 24;

function BoardSkeleton() {
  return (
    <ul aria-hidden className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SKELETON_KEYS.map((key) => (
        <li key={key}>
          <Card className="h-full">
            <CardHeader className="flex flex-col gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export function ApplicationsBoard() {
  const status = useApplicationFilters((state) => state.status);
  const search = useApplicationFilters((state) => state.search);
  const reset = useApplicationFilters((state) => state.reset);
  const debouncedSearch = useDebouncedValue(search, 300);
  const [loadingMore, setLoadingMore] = useState(false);
  const queryKey = `${status}|${debouncedSearch}`;
  const [pagination, setPagination] = useState<{ key: string; hasMore: boolean | null }>({
    key: queryKey,
    hasMore: null,
  });
  const hasMore = pagination.key === queryKey ? pagination.hasMore : null;

  const variables = {
    status: status === 'ALL' ? undefined : status,
    search: debouncedSearch.trim() || undefined,
    take: PAGE_SIZE,
    skip: 0,
  };

  const { data, loading, error, refetch, fetchMore } = useQuery(ApplicationsDocument, {
    variables,
  });

  const applications = data?.applications ?? [];
  const hasFilters = status !== 'ALL' || debouncedSearch.trim().length > 0;
  // Only skeletonise when there is nothing to show; refetches keep the existing grid.
  const showSkeleton = loading && !data;
  const canLoadMore = hasMore ?? applications.length >= PAGE_SIZE;

  async function loadMore() {
    setLoadingMore(true);
    try {
      const result = await fetchMore({
        variables: { ...variables, skip: applications.length },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previous;
          }

          return {
            applications: [...previous.applications, ...fetchMoreResult.applications],
          };
        },
      });

      setPagination({
        key: queryKey,
        hasMore: (result.data?.applications.length ?? 0) >= PAGE_SIZE,
      });
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <FilterBar />
        <CreateApplicationDialog />
      </div>

      <p aria-live="polite" className="sr-only">
        {loading ? 'Loading applications' : `${applications.length} applications shown`}
      </p>

      {showSkeleton ? <BoardSkeleton /> : null}

      {error ? (
        <ErrorState
          title="Could not load applications"
          description={error.message}
          onRetry={() => void refetch()}
        />
      ) : null}

      {!showSkeleton && !error && applications.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="No applications match these filters"
            description="Try another stage, or clear the filters to see everything."
            action={
              <Button variant="outline" size="sm" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No applications yet"
            description="Add the first role you are tracking — company and role are all it takes."
          />
        )
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {applications.map((application) => (
          <li key={application.id} className="h-full">
            <ApplicationCard application={application} />
          </li>
        ))}
      </ul>

      {canLoadMore && !showSkeleton && !error ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
