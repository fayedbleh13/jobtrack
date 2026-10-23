'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { dueReminders, type Reminder } from './reminders-view-model';

export type NotificationSupport = NotificationPermission | 'unsupported';

export function useReminderNotifications(reminders: Reminder[]) {
  // Start with a server-safe value so the initial HTML and the first client
  // render match; the real permission is read after hydration.
  const [permission, setPermission] = useState<NotificationSupport>('unsupported');
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    setPermission(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      return;
    }

    setPermission(await Notification.requestPermission());
  }, []);

  useEffect(() => {
    if (permission !== 'granted' || typeof Notification === 'undefined') {
      return;
    }

    const due = dueReminders(reminders, new Date()).filter(
      (reminder) => !notifiedIds.current.has(reminder.id),
    );

    if (due.length === 0) {
      return;
    }

    for (const reminder of due) {
      new Notification('JobTrack reminder', { body: reminder.title });
      notifiedIds.current.add(reminder.id);
    }
  }, [reminders, permission]);

  return { permission, requestPermission };
}
