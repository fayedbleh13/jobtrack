import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Reminder } from './reminders-view-model';
import { useReminderNotifications } from './use-reminder-notifications';

type SentNotification = { title: string; body?: string };

const sent: SentNotification[] = [];

class FakeNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = vi.fn(async (): Promise<NotificationPermission> => 'granted');

  constructor(title: string, options?: { body?: string }) {
    sent.push({ title, body: options?.body });
  }
}

function reminder(id: string, dueAt: string, done = false): Reminder {
  return {
    id,
    title: `Reminder ${id}`,
    dueAt,
    done,
    application: { id: 'a1', company: 'Acme Corp', role: 'Engineer', status: 'APPLIED' },
  };
}

const OVERDUE = '2020-01-01T09:00:00.000Z';
const FUTURE = '2099-01-01T09:00:00.000Z';

describe('useReminderNotifications', () => {
  beforeEach(() => {
    sent.length = 0;
    FakeNotification.permission = 'granted';
    FakeNotification.requestPermission.mockClear();
    vi.stubGlobal('Notification', FakeNotification);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fires one notification for an overdue reminder', () => {
    renderHook(() => useReminderNotifications([reminder('a', OVERDUE)]));

    expect(sent).toEqual([{ title: 'JobTrack reminder', body: 'Reminder a' }]);
  });

  it('does not repeat a notification when the same list re-renders', () => {
    const { rerender } = renderHook(({ list }) => useReminderNotifications(list), {
      initialProps: { list: [reminder('a', OVERDUE)] },
    });

    expect(sent).toHaveLength(1);

    rerender({ list: [reminder('a', OVERDUE)] });

    expect(sent).toHaveLength(1);
  });

  it('ignores reminders that are not due yet or already done', () => {
    renderHook(() =>
      useReminderNotifications([reminder('future', FUTURE), reminder('done', OVERDUE, true)]),
    );

    expect(sent).toHaveLength(0);
  });

  it('stays silent when permission is denied', () => {
    FakeNotification.permission = 'denied';

    const { result } = renderHook(() => useReminderNotifications([reminder('a', OVERDUE)]));

    expect(result.current.permission).toBe('denied');
    expect(sent).toHaveLength(0);
  });

  it('only notifies after permission is granted on demand', async () => {
    FakeNotification.permission = 'default';

    const { result } = renderHook(() => useReminderNotifications([reminder('a', OVERDUE)]));
    expect(result.current.permission).toBe('default');
    expect(sent).toHaveLength(0);

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(FakeNotification.requestPermission).toHaveBeenCalledTimes(1);
    expect(result.current.permission).toBe('granted');
    expect(sent).toHaveLength(1);
  });

  it('reports unsupported browsers instead of throwing', () => {
    vi.unstubAllGlobals();
    // @ts-expect-error deliberately removing Notification to simulate an old browser
    delete globalThis.Notification;

    const { result } = renderHook(() => useReminderNotifications([reminder('a', OVERDUE)]));

    expect(result.current.permission).toBe('unsupported');
    expect(sent).toHaveLength(0);
  });
});
