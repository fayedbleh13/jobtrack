import Link from 'next/link';
import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      href="/applications"
      className={cn('group flex items-center gap-2 rounded-md focus-visible:outline-2', className)}
    >
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
      >
        JT
      </span>
      <span className="text-base font-semibold tracking-tight">JobTrack</span>
    </Link>
  );
}
