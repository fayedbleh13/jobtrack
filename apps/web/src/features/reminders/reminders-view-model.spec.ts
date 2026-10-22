import { describe, expect, it } from 'vitest';
import { dueReminders, type Reminder, splitReminders } from './reminders-view-model';

const NOW = new Date('2026-10-22T12:00:00.000Z');

function reminder(id: string, dueAt: string, done = false): Reminder {
  return {
    id,
    title: `Reminder ${id}`,
    dueAt,
    done,
    application: { id: 'a1', company: 'Acme Corp', role: 'Engineer', status: 'APPLIED' },
  };
}

describe('splitReminders', () => {
  it('separates overdue from upcoming around the given instant', () => {
    const { overdue, upcoming } = splitReminders(
      [
        reminder('past', '2026-10-21T12:00:00.000Z'),
        reminder('future', '2026-10-23T12:00:00.000Z'),
      ],
      NOW,
    );

    expect(overdue.map((entry) => entry.id)).toEqual(['past']);
    expect(upcoming.map((entry) => entry.id)).toEqual(['future']);
  });

  it('treats a reminder due exactly now as overdue', () => {
    const { overdue } = splitReminders([reminder('now', NOW.toISOString())], NOW);

    expect(overdue.map((entry) => entry.id)).toEqual(['now']);
  });

  it('drops entries with an unparseable date', () => {
    const { overdue, upcoming } = splitReminders([reminder('bad', 'not-a-date')], NOW);

    expect(overdue).toHaveLength(0);
    expect(upcoming).toHaveLength(0);
  });
});

describe('dueReminders', () => {
  it('returns only overdue reminders that are still open', () => {
    const due = dueReminders(
      [
        reminder('overdue-open', '2026-10-21T12:00:00.000Z'),
        reminder('overdue-done', '2026-10-21T12:00:00.000Z', true),
        reminder('future', '2026-10-23T12:00:00.000Z'),
      ],
      NOW,
    );

    expect(due.map((entry) => entry.id)).toEqual(['overdue-open']);
  });
});
