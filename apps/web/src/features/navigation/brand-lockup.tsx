import { cn } from '@/lib/utils';

type BrandLockupProps = {
  className?: string;
  tone?: 'default' | 'inverted';
};

export function BrandLockup({ className, tone = 'default' }: BrandLockupProps) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span
        aria-hidden
        className={cn(
          'flex size-8 items-center justify-center rounded-lg text-sm font-bold',
          tone === 'inverted'
            ? 'bg-white/15 text-primary-foreground'
            : 'bg-primary text-primary-foreground',
        )}
      >
        JT
      </span>
      <span className="text-base font-semibold tracking-tight">JobTrack</span>
    </span>
  );
}
