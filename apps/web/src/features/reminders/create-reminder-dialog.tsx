'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ApplicationsDocument,
  CreateReminderDocument,
  UpcomingRemindersDocument,
} from '@/graphql/generated/graphql';

const reminderSchema = z.object({
  applicationId: z.string().min(1, 'Choose an application'),
  title: z.string().trim().min(1, 'Title is required').max(200),
  dueAt: z.string().min(1, 'Pick a due date'),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

const EMPTY_VALUES: ReminderFormValues = { applicationId: '', title: '', dueAt: '' };

export function CreateReminderDialog() {
  const [open, setOpen] = useState(false);
  const [createReminder, { loading, error }] = useMutation(CreateReminderDocument, {
    refetchQueries: [UpcomingRemindersDocument],
  });
  const { data } = useQuery(ApplicationsDocument, { skip: !open });

  const applications = data?.applications ?? [];
  const items = applications.map((application) => ({
    value: application.id,
    label: `${application.company} — ${application.role}`,
  }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: EMPTY_VALUES,
  });

  async function onSubmit(values: ReminderFormValues) {
    try {
      await createReminder({ variables: { input: values } });
      reset(EMPTY_VALUES);
      setOpen(false);
    } catch {
      // Surfaced through the mutation's `error` state below.
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New reminder</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New reminder</DialogTitle>
            <DialogDescription>
              Something to follow up on, tied to an application.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="applicationId">Application</Label>
              <Controller
                control={control}
                name="applicationId"
                render={({ field }) => (
                  <Select
                    items={items}
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger id="applicationId" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.applicationId ? (
                <p className="text-xs text-rose-600">{errors.applicationId.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">What to do</Label>
              <Input id="title" placeholder="Follow up with the recruiter" {...register('title')} />
              {errors.title ? (
                <p className="text-xs text-rose-600">{errors.title.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueAt">Due date</Label>
              <Input id="dueAt" type="date" {...register('dueAt')} />
              {errors.dueAt ? (
                <p className="text-xs text-rose-600">{errors.dueAt.message}</p>
              ) : null}
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
