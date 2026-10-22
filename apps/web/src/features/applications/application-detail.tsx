'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApplicationDocument } from '@/graphql/generated/graphql';
import { formatDate, formatSalaryRange } from '@/lib/format';
import { StatusAdvanceControl } from './status-advance-control';
import { StatusBadge } from './status-badge';
import { StatusTimeline } from './status-timeline';

const PRIORITY_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
};

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs tracking-wide text-slate-500 uppercase">{label}</dt>
      <dd className="text-slate-900">{children}</dd>
    </div>
  );
}

export function ApplicationDetail({ applicationId }: { applicationId: string }) {
  const { data, loading, error } = useQuery(ApplicationDocument, {
    variables: { id: applicationId },
  });

  if (loading) {
    return <p className="text-sm text-slate-500">Loading application…</p>;
  }

  if (error) {
    const notFound = /not found/i.test(error.message);

    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {notFound ? 'Application not found' : 'Could not load this application'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-slate-600">
          <p>
            {notFound
              ? 'It may have been deleted, or it belongs to another account.'
              : error.message}
          </p>
          <Link href="/applications" className="underline">
            Back to applications
          </Link>
        </CardContent>
      </Card>
    );
  }

  const application = data?.application;
  if (!application) {
    return null;
  }

  const salary = formatSalaryRange(application.salaryMin, application.salaryMax);
  const priority = application.priority ? (PRIORITY_LABELS[application.priority] ?? null) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{application.company}</h1>
          <p className="text-slate-600">{application.role}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
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
                    <a
                      href={application.jobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Open posting
                    </a>
                  ) : (
                    '—'
                  )}
                </DetailRow>
              </dl>
            </CardContent>
          </Card>

          {application.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm whitespace-pre-line text-slate-600">
                {application.notes}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {application.contacts.length === 0 ? (
                <p className="text-sm text-slate-500">No contacts recorded yet.</p>
              ) : (
                <ul className="flex flex-col gap-3 text-sm">
                  {application.contacts.map((contact) => (
                    <li key={contact.id} className="flex flex-col">
                      <span className="font-medium">{contact.name}</span>
                      {contact.role ? <span className="text-slate-600">{contact.role}</span> : null}
                      {contact.email ? (
                        <span className="text-slate-600">{contact.email}</span>
                      ) : null}
                      {contact.linkedin ? (
                        <span className="text-slate-600">{contact.linkedin}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
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
