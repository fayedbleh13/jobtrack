'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsDocument } from '@/graphql/generated/graphql';
import { formatDays, formatPercent, offersCount } from './analytics-view-model';
import { ApplicationsOverTimeChart } from './applications-over-time-chart';
import { FunnelChart } from './funnel-chart';
import { KpiCard } from './kpi-card';

export function AnalyticsDashboard() {
  const { data, loading, error } = useQuery(AnalyticsDocument);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading analytics…</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-600">Could not load analytics: {error.message}</p>;
  }

  const summary = data?.analytics;
  if (!summary) {
    return null;
  }

  if (summary.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No data yet</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-slate-600">
          <p>Add your first application and this dashboard starts filling in.</p>
          <Link href="/applications" className="underline">
            Go to applications
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Applications" value={String(summary.total)} />
        <KpiCard
          label="Response rate"
          value={formatPercent(summary.responseRate)}
          hint="Share of submissions that got a reply"
        />
        <KpiCard
          label="Avg days to interview"
          value={formatDays(summary.avgDaysToInterview)}
          hint="From applying to first interview"
        />
        <KpiCard label="Offers" value={String(offersCount(summary.byStatus))} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by status</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart byStatus={summary.byStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications over time</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationsOverTimeChart points={summary.applicationsOverTime} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
