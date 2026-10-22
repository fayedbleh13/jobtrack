import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApplicationsQuery } from '@/graphql/generated/graphql';
import { formatSalaryRange } from '@/lib/format';
import { StatusBadge } from './status-badge';

export type ApplicationSummary = ApplicationsQuery['applications'][number];

export function ApplicationCard({ application }: { application: ApplicationSummary }) {
  const salary = formatSalaryRange(application.salaryMin, application.salaryMax);
  const nextReminder = application.reminders[0];

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <CardTitle>{application.company}</CardTitle>
            <p className="text-sm text-slate-600">{application.role}</p>
          </div>
          <StatusBadge status={application.status} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-1 text-sm text-slate-600">
        {application.location ? <span>{application.location}</span> : null}
        {salary ? <span>{salary}</span> : null}
        {application.source ? <span>via {application.source}</span> : null}
        {nextReminder ? <span>Next reminder: {nextReminder.title}</span> : null}
      </CardContent>
    </Card>
  );
}
