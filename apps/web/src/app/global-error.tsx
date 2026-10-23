'use client';

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', maxWidth: '40rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Something went wrong</h1>
          <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={retry}
            style={{ border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '0.5rem 1rem' }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
