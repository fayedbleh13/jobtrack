'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/state-panels';

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl items-center px-4 py-10">
      <ErrorState
        title="Something went wrong"
        description={error.message || 'An unexpected error occurred while rendering this page.'}
        onRetry={retry}
      />
    </main>
  );
}
