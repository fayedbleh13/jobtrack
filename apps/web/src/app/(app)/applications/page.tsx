import { ApplicationsBoard } from '@/features/applications/applications-board';

export default function ApplicationsPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="text-slate-600">Every role you are tracking, and where it stands.</p>
      </header>

      <ApplicationsBoard />
    </section>
  );
}
