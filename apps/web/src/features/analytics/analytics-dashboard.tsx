'use client';

import { useQuery } from '@apollo/client/react';
import { BarChart2, BriefcaseBusiness, Clock3, MessageSquareReply, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsDocument } from '@/graphql/generated/graphql';
import { formatDays, formatPercent, offersCount } from './analytics-view-model';
import { ApplicationsOverTimeChart } from './applications-over-time-chart';
import { FunnelChart } from './funnel-chart';
import { KpiCard } from './kpi-card';

function DashboardSkeleton() {
  const slots = ['total', 'response-rate', 'avg-days', 'offers'] as const;
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Loading analytics">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {slots.map((slot) => (
          <Card key={slot} className="h-full">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-9 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const { data, loading, error } = useQuery(AnalyticsDocument);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center gap-2 py-6 text-sm text-destructive">
          <BarChart2 className="h-4 w-4 shrink-0" aria-hidden />
          Could not load analytics: {error.message}
        </CardContent>
      </Card>
    );
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
          <CardDescription>
            Add your first application and this dashboard starts filling in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/applications"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Go to applications
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total applications"
          value={String(summary.total)}
          icon={<BriefcaseBusiness className="h-3.5 w-3.5" aria-hidden />}
        />
        <KpiCard
          label="Response rate"
          value={formatPercent(summary.responseRate)}
          hint="Share of submissions that got a reply"
          icon={<MessageSquareReply className="h-3.5 w-3.5" aria-hidden />}
        />
        <KpiCard
          label="Avg days to interview"
          value={formatDays(summary.avgDaysToInterview)}
          hint="From applying to first interview"
          icon={<Clock3 className="h-3.5 w-3.5" aria-hidden />}
        />
        <KpiCard
          label="Offers"
          value={String(offersCount(summary.byStatus))}
          icon={<Trophy className="h-3.5 w-3.5" aria-hidden />}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pipeline by status</CardTitle>
            <CardDescription>Applications at each stage of the funnel</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart byStatus={summary.byStatus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Applications over time</CardTitle>
            <CardDescription>Daily volume of new submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationsOverTimeChart points={summary.applicationsOverTime} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
