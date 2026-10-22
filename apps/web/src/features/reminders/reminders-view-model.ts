import type { UpcomingRemindersQuery } from '@/graphql/generated/graphql';

export type Reminder = UpcomingRemindersQuery['upcomingReminders'][number];

export type ReminderBuckets = {
  overdue: Reminder[];
  upcoming: Reminder[];
};

export function splitReminders(reminders: Reminder[], now: Date): ReminderBuckets {
  const overdue: Reminder[] = [];
  const upcoming: Reminder[] = [];

  for (const reminder of reminders) {
    const due = new Date(reminder.dueAt).getTime();

    if (Number.isNaN(due)) {
      continue;
    }

    if (due <= now.getTime()) {
      overdue.push(reminder);
    } else {
      upcoming.push(reminder);
    }
  }

  return { overdue, upcoming };
}

export function dueReminders(reminders: Reminder[], now: Date): Reminder[] {
  const { overdue } = splitReminders(reminders, now);
  return overdue.filter((reminder) => !reminder.done);
}
