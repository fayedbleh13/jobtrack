'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/format';
import type { Reminder } from './reminders-view-model';

type ReminderItemProps = {
  reminder: Reminder;
  overdue: boolean;
  busy: boolean;
  onToggle: (id: string) => Promise<boolean>;
};

export function ReminderItem({ reminder, overdue, busy, onToggle }: ReminderItemProps) {
  // Ticks immediately on click, then the row disappears when the refetch lands.
  const [checked, setChecked] = useState(false);

  async function handleToggle() {
    setChecked(true);
    const saved = await onToggle(reminder.id);
    if (!saved) {
      setChecked(false);
    }
  }

  return (
    <li className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/30">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => void handleToggle()}
        disabled={busy}
        aria-label={`Mark "${reminder.title}" as done`}
        className="mt-0.5 size-6 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium">{reminder.title}</span>
        <span className="truncate text-xs text-muted-foreground">
          {reminder.application.company} · due {formatDate(reminder.dueAt)}
        </span>
      </div>

      {overdue ? (
        <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
          Overdue
        </span>
      ) : null}
    </li>
  );
}
