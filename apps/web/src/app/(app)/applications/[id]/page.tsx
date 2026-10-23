import Link from 'next/link';
import { ApplicationDetail } from '@/features/applications/application-detail';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <section className="flex flex-col gap-6">
      <Link href="/applications" className="text-sm text-muted-foreground underline">
        ← Back to applications
      </Link>

      <ApplicationDetail applicationId={id} />
    </section>
  );
}
