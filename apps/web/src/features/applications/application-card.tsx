import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApplicationsQuery } from '@/graphql/generated/graphql';
import { formatSalaryRange } from '@/lib/format';
import { StatusBadge } from './status-badge';

export type ApplicationSummary = ApplicationsQuery['applications'][number];

export function ApplicationCard({ application }: { application: ApplicationSummary }) {
  const salary = formatSalaryRange(application.salaryMin, application.salaryMax);
  const nextReminder = application.reminders[0];

  return (
    <Card className="relative h-full justify-between transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <CardTitle className="line-clamp-2">{application.company}</CardTitle>
            <p className="line-clamp-2 text-sm text-muted-foreground">{application.role}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
        {application.location ? <span className="truncate">{application.location}</span> : null}
        {salary ? <span>{salary}</span> : null}
        {application.source ? <span className="truncate">via {application.source}</span> : null}
        {nextReminder ? (
          <span className="line-clamp-2">Next reminder: {nextReminder.title}</span>
        ) : null}

        {/* The pseudo-element stretches this single link over the whole card, so the card is
            clickable everywhere while remaining one focusable, correctly-named control. */}
        <Link
          href={`/applications/${application.id}`}
          className="mt-2 inline-flex w-fit items-center text-sm font-medium text-primary underline-offset-4 hover:underline after:absolute after:inset-0 after:content-['']"
        >
          View details
        </Link>
      </CardContent>
    </Card>
  );
}
