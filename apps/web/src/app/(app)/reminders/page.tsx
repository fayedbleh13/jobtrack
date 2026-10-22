import { RemindersScreen } from '@/features/reminders/reminders-screen';

export default function RemindersPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Reminders</h1>
        <p className="text-slate-600">Follow-ups so applications do not go stale.</p>
      </header>

      <RemindersScreen />
    </section>
  );
}
