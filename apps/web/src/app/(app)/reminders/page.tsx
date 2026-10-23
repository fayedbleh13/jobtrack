import { PageHeader } from '@/components/page-header';
import { RemindersScreen } from '@/features/reminders/reminders-screen';

export default function RemindersPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Reminders" description="Follow-ups so applications do not go stale." />

      <RemindersScreen />
    </section>
  );
}
