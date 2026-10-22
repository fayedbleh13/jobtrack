'use client';

import { useCallback, useEffect, useState } from 'react';
import { dueReminders, type Reminder } from './reminders-view-model';

export type NotificationSupport = NotificationPermission | 'unsupported';

export function useReminderNotifications(reminders: Reminder[]) {
  const [permission, setPermission] = useState<NotificationSupport>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  );
  const [notifiedIds, setNotifiedIds] = useState<string[]>([]);

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
      (reminder) => !notifiedIds.includes(reminder.id),
    );

    if (due.length === 0) {
      return;
    }

    for (const reminder of due) {
      new Notification('JobTrack reminder', { body: reminder.title });
    }

    setNotifiedIds((current) => [...current, ...due.map((reminder) => reminder.id)]);
  }, [reminders, permission, notifiedIds]);

  return { permission, requestPermission };
}
