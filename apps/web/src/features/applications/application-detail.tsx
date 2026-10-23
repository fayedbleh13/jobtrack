import { CombinedGraphQLErrors } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { ErrorState } from '@/components/state-panels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ApplicationDocument } from '@/graphql/generated/graphql';
import {
  ApplicationContactsCard,
  ApplicationDetailsCard,
  ApplicationNotesCard,
} from './application-detail-cards';
import { StatusAdvanceControl } from './status-advance-control';
import { StatusBadge } from './status-badge';
import { StatusTimeline } from './status-timeline';

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function ApplicationDetail({ applicationId }: { applicationId: string }) {
  const { data, loading, error } = useQuery(ApplicationDocument, {
    variables: { id: applicationId },
  });

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error) {
    const notFound =
      CombinedGraphQLErrors.is(error) &&
      error.errors.some((entry) => entry.extensions?.code === 'NOT_FOUND');

    return (
      <ErrorState
        title={notFound ? 'Application not found' : 'Could not load this application'}
        description={
          notFound ? 'It may have been deleted, or it belongs to another account.' : error.message
        }
        action={
          <Link href="/applications" className="underline">
            Back to applications
          </Link>
        }
      />
    );
  }

  const application = data?.application;
  if (!application) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{application.company}</h1>
          <p className="text-muted-foreground">{application.role}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <ApplicationDetailsCard application={application} />
          <ApplicationNotesCard notes={application.notes} />
          <ApplicationContactsCard contacts={application.contacts} />
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Move this application</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusAdvanceControl
                applicationId={application.id}
                allowedNextStatuses={application.allowedNextStatuses}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline entries={application.timeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
