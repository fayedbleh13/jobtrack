import { PageHeader } from '@/components/page-header';
import { AnalyticsDashboard } from '@/features/analytics/analytics-dashboard';

export const metadata = {
  title: 'Analytics',
};

export default function AnalyticsPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Analytics" description="How your pipeline is actually going." />

      <AnalyticsDashboard />
    </section>
  );
}
