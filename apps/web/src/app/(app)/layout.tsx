import Link from 'next/link';
import type { ReactNode } from 'react';
import { SignOutButton } from '@/features/auth/sign-out-button';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 p-4">
          <Link href="/applications" className="font-semibold tracking-tight">
            JobTrack
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/applications" className="hover:text-slate-900">
              Applications
            </Link>
            <Link href="/analytics" className="hover:text-slate-900">
              Analytics
            </Link>
            <Link href="/reminders" className="hover:text-slate-900">
              Reminders
            </Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}
