import { AnalyticsDashboard } from '@/features/analytics/analytics-dashboard';

export const metadata = {
  title: 'Analytics',
};

export default function AnalyticsPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">How your pipeline is actually going.</p>
      </header>

      <AnalyticsDashboard />
    </section>
  );
}
