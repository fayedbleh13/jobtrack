'use client';

import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import type { Reminder } from './reminders-view-model';

type ReminderItemProps = {
  reminder: Reminder;
  overdue: boolean;
  busy: boolean;
  onToggle: (id: string) => void;
};

export function ReminderItem({ reminder, overdue, busy, onToggle }: ReminderItemProps) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border bg-white p-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{reminder.title}</span>
        <span className="text-xs text-slate-500">
          {reminder.application.company} · due {formatDate(reminder.dueAt)}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {overdue ? <span className="text-xs font-medium text-rose-600">Overdue</span> : null}
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onToggle(reminder.id)}>
          Mark done
        </Button>
      </div>
    </li>
  );
}
