'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DialogActions } from '@/components/dialog-actions';
import { FormField, fieldA11y } from '@/components/form-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
import {
  type CreateReminderValues,
  createReminderDefaultValues,
  createReminderSchema,
} from './create-reminder-schema';

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
  } = useForm<CreateReminderValues>({
    resolver: zodResolver(createReminderSchema),
    defaultValues: createReminderDefaultValues,
  });

  async function onSubmit(values: CreateReminderValues) {
    try {
      // The API scalar expects a full ISO date-time; noon avoids the date
      // shifting backwards for users west of UTC.
      const dueAt = new Date(`${values.dueAt}T12:00:00`).toISOString();

      await createReminder({
        variables: {
          input: {
            applicationId: values.applicationId,
            title: values.title,
            dueAt,
          },
        },
      });
      toast.success('Reminder created');
      reset(createReminderDefaultValues);
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
            <FormField
              label="Application"
              htmlFor="applicationId"
              error={errors.applicationId?.message}
            >
              <Controller
                control={control}
                name="applicationId"
                render={({ field }) => (
                  <Select
                    items={items}
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger
                      id="applicationId"
                      className="w-full"
                      {...fieldA11y('applicationId', errors.applicationId?.message)}
                    >
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
            </FormField>

            <FormField label="What to do" htmlFor="title" error={errors.title?.message}>
              <Input
                id="title"
                placeholder="Follow up with the recruiter"
                {...fieldA11y('title', errors.title?.message)}
                {...register('title')}
              />
            </FormField>

            <FormField label="Due date" htmlFor="dueAt" error={errors.dueAt?.message}>
              <Input
                id="dueAt"
                type="date"
                {...fieldA11y('dueAt', errors.dueAt?.message)}
                {...register('dueAt')}
              />
            </FormField>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ) : null}

            <DialogActions onCancel={() => setOpen(false)} submitLabel="Create" loading={loading} />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
