import Link from 'next/link';
import { EmptyState } from '@/components/state-panels';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl items-center px-4 py-10">
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist or has moved."
        action={
          <Link href="/applications" className="text-sm font-medium text-primary underline">
            Back to applications
          </Link>
        }
      />
    </main>
  );
}
