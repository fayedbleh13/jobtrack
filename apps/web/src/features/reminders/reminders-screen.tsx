'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleReminderDocument, UpcomingRemindersDocument } from '@/graphql/generated/graphql';
import { CreateReminderDialog } from './create-reminder-dialog';
import { ReminderItem } from './reminder-item';
import { splitReminders } from './reminders-view-model';
import { useReminderNotifications } from './use-reminder-notifications';

export function RemindersScreen() {
  const { data, loading, error } = useQuery(UpcomingRemindersDocument);
  const [toggleReminder, { loading: toggling }] = useMutation(ToggleReminderDocument, {
    refetchQueries: [UpcomingRemindersDocument],
  });

  const reminders = useMemo(() => data?.upcomingReminders ?? [], [data]);
  const { overdue, upcoming } = useMemo(() => splitReminders(reminders, new Date()), [reminders]);
  const { permission, requestPermission } = useReminderNotifications(reminders);

  function toggle(id: string) {
    void toggleReminder({ variables: { id } }).catch(() => undefined);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <NotificationStatus permission={permission} onRequest={requestPermission} />
        <CreateReminderDialog />
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading reminders…</p> : null}
      {error ? (
        <p className="text-sm text-rose-600">Could not load reminders: {error.message}</p>
      ) : null}

      {!loading && !error && reminders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-slate-500">
          Nothing to follow up on. Add a reminder to keep an application moving.
        </div>
      ) : null}

      {overdue.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {overdue.map((reminder) => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  overdue
                  busy={toggling}
                  onToggle={toggle}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {upcoming.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {upcoming.map((reminder) => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  overdue={false}
                  busy={toggling}
                  onToggle={toggle}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function NotificationStatus({
  permission,
  onRequest,
}: {
  permission: ReturnType<typeof useReminderNotifications>['permission'];
  onRequest: () => void;
}) {
  if (permission === 'granted') {
    return <p className="text-sm text-slate-500">Browser notifications are on.</p>;
  }

  if (permission === 'default') {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-500">Get notified when a reminder falls due.</p>
        <Button size="sm" variant="outline" onClick={() => void onRequest()}>
          Enable notifications
        </Button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <p className="text-sm text-slate-500">
        Notifications are blocked for this site. You can re-enable them in your browser settings.
      </p>
    );
  }

  return <p className="text-sm text-slate-500">This browser does not support notifications.</p>;
}
