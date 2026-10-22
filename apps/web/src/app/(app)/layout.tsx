import type { ReactNode } from 'react';
import { SignOutButton } from '@/features/auth/sign-out-button';
import { AppNav } from '@/features/navigation/app-nav';
import { BrandMark } from '@/features/navigation/brand-mark';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <BrandMark className="mr-auto" />
          <div className="order-last w-full sm:order-none sm:w-auto">
            <AppNav />
          </div>
          <SignOutButton />
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
