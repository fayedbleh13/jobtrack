import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BrandLockup } from './brand-lockup';

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      href="/applications"
      className={cn('group flex items-center gap-2 rounded-md focus-visible:outline-2', className)}
    >
      <BrandLockup />
    </Link>
  );
}
