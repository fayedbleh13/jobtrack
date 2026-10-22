'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { EmptyState, ErrorState } from '@/components/state-panels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleReminderDocument, UpcomingRemindersDocument } from '@/graphql/generated/graphql';
import { CreateReminderDialog } from './create-reminder-dialog';
import { ReminderItem } from './reminder-item';
import { splitReminders } from './reminders-view-model';
import { useReminderNotifications } from './use-reminder-notifications';

const SKELETON_KEYS = ['one', 'two', 'three'];

export function RemindersScreen() {
  const { data, loading, error, refetch } = useQuery(UpcomingRemindersDocument);
  const [toggleReminder, { loading: toggling }] = useMutation(ToggleReminderDocument, {
    refetchQueries: [UpcomingRemindersDocument],
  });

  const reminders = useMemo(() => data?.upcomingReminders ?? [], [data]);
  const { overdue, upcoming } = useMemo(() => splitReminders(reminders, new Date()), [reminders]);
  const { permission, requestPermission } = useReminderNotifications(reminders);

  async function toggle(id: string) {
    try {
      await toggleReminder({ variables: { id } });
      toast.success('Reminder completed');
    } catch {
      toast.error('Could not update the reminder', { description: 'Nothing was saved.' });
    }
  }

  const showSkeleton = loading && !data;
  const isEmpty = !showSkeleton && !error && reminders.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <NotificationStatus permission={permission} onRequest={requestPermission} />
        <CreateReminderDialog />
      </div>

      <p aria-live="polite" className="sr-only">
        {loading ? 'Loading reminders' : `${reminders.length} open reminders`}
      </p>

      {showSkeleton ? (
        <div aria-hidden className="flex flex-col gap-2">
          {SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : null}

      {error ? (
        <ErrorState
          title="Could not load reminders"
          description={error.message}
          onRetry={() => void refetch()}
        />
      ) : null}

      {isEmpty ? (
        <EmptyState
          title="Nothing to follow up on"
          description="Add a reminder so an application does not go quiet on you."
        />
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
                  onToggle={(id) => void toggle(id)}
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
                  onToggle={(id) => void toggle(id)}
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
    return (
      <p className="text-sm text-muted-foreground">
        Notifications are on for reminders that fall due while this page is open.
      </p>
    );
  }

  if (permission === 'default') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">Get a desktop notification when one is due.</p>
        <Button size="sm" variant="outline" onClick={() => void onRequest()}>
          Enable notifications
        </Button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <p className="text-sm text-muted-foreground">
        Notifications are blocked for this site — re-enable them in your browser settings.
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">This browser does not support notifications.</p>
  );
}
