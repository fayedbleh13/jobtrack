import { describe, expect, it } from 'vitest';
import { makeReminder } from '../../../test/factories';
import { dueReminders, splitReminders } from './reminders-view-model';

const NOW = new Date('2026-10-22T12:00:00.000Z');

describe('splitReminders', () => {
  it('separates overdue from upcoming around the given instant', () => {
    const { overdue, upcoming } = splitReminders(
      [
        makeReminder({ id: 'past', dueAt: '2026-10-21T12:00:00.000Z' }),
        makeReminder({ id: 'future', dueAt: '2026-10-23T12:00:00.000Z' }),
      ],
      NOW,
    );

    expect(overdue.map((entry) => entry.id)).toEqual(['past']);
    expect(upcoming.map((entry) => entry.id)).toEqual(['future']);
  });

  it('treats a reminder due exactly now as overdue', () => {
    const { overdue } = splitReminders(
      [makeReminder({ id: 'now', dueAt: NOW.toISOString() })],
      NOW,
    );

    expect(overdue.map((entry) => entry.id)).toEqual(['now']);
  });

  it('drops entries with an unparseable date', () => {
    const { overdue, upcoming } = splitReminders(
      [makeReminder({ id: 'bad', dueAt: 'not-a-date' })],
      NOW,
    );

    expect(overdue).toHaveLength(0);
    expect(upcoming).toHaveLength(0);
  });
});

describe('dueReminders', () => {
  it('returns only overdue reminders that are still open', () => {
    const due = dueReminders(
      [
        makeReminder({ id: 'overdue-open', dueAt: '2026-10-21T12:00:00.000Z' }),
        makeReminder({ id: 'overdue-done', dueAt: '2026-10-21T12:00:00.000Z', done: true }),
        makeReminder({ id: 'future', dueAt: '2026-10-23T12:00:00.000Z' }),
      ],
      NOW,
    );

    expect(due.map((entry) => entry.id)).toEqual(['overdue-open']);
  });
});
