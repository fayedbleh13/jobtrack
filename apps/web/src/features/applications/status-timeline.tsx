import type { ApplicationQuery } from '@/graphql/generated/graphql';
import { formatDate } from '@/lib/format';
import { STATUS_LABELS } from './application-options';

export type TimelineEntry = ApplicationQuery['application']['timeline'][number];

export function StatusTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {entries.map((entry) => (
        <li key={entry.id} className="flex gap-3">
          <span
            aria-hidden
            className="mt-1.5 size-2 shrink-0 rounded-full bg-muted-foreground/30"
          />

          <div className="flex flex-col gap-0.5">
            <p className="text-sm">
              {entry.fromStatus ? (
                <>
                  <span className="text-muted-foreground">{STATUS_LABELS[entry.fromStatus]}</span>
                  <span aria-hidden className="text-muted-foreground/60">
                    {' → '}
                  </span>
                </>
              ) : null}
              <span className="font-medium">{STATUS_LABELS[entry.toStatus]}</span>
            </p>

            <p className="text-xs text-muted-foreground">{formatDate(entry.at)}</p>

            {entry.note ? <p className="text-sm text-muted-foreground">{entry.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
