import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApplicationQuery } from '@/graphql/generated/graphql';
import { formatDate, formatSalaryRange } from '@/lib/format';
import { PRIORITY_LABELS } from './application-options';

type Application = ApplicationQuery['application'];

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}

export function ApplicationDetailsCard({ application }: { application: Application }) {
  const salary = formatSalaryRange(application.salaryMin, application.salaryMax);
  const priority = application.priority ? (PRIORITY_LABELS[application.priority] ?? null) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <DetailRow label="Location">{application.location || '—'}</DetailRow>
          <DetailRow label="Salary">{salary ?? '—'}</DetailRow>
          <DetailRow label="Source">{application.source || '—'}</DetailRow>
          <DetailRow label="Priority">{priority ?? '—'}</DetailRow>
          <DetailRow label="Applied">
            {application.appliedAt ? formatDate(application.appliedAt) : '—'}
          </DetailRow>
          <DetailRow label="Job posting">
            {application.jobUrl ? (
              <a href={application.jobUrl} target="_blank" rel="noreferrer" className="underline">
                Open posting
              </a>
            ) : (
              '—'
            )}
          </DetailRow>
        </dl>
      </CardContent>
    </Card>
  );
}

export function ApplicationNotesCard({ notes }: { notes: string | null }) {
  if (!notes) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="text-sm whitespace-pre-line text-muted-foreground">
        {notes}
      </CardContent>
    </Card>
  );
}

export function ApplicationContactsCard({ contacts }: { contacts: Application['contacts'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contacts recorded yet.</p>
        ) : (
          <ul className="flex flex-col gap-3 text-sm">
            {contacts.map((contact) => (
              <li key={contact.id} className="flex flex-col">
                <span className="font-medium">{contact.name}</span>
                {contact.role ? (
                  <span className="text-muted-foreground">{contact.role}</span>
                ) : null}
                {contact.email ? (
                  <span className="text-muted-foreground">{contact.email}</span>
                ) : null}
                {contact.linkedin ? (
                  <span className="text-muted-foreground">{contact.linkedin}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
