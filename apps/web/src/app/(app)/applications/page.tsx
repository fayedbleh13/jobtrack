import { PageHeader } from '@/components/page-header';
import { ApplicationsBoard } from '@/features/applications/applications-board';

export default function ApplicationsPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Applications"
        description="Every role you are tracking, and where it stands."
      />

      <ApplicationsBoard />
    </section>
  );
}
