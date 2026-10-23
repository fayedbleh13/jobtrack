import { z } from 'zod';

export const createReminderSchema = z.object({
  applicationId: z.string().min(1, 'Choose an application'),
  title: z.string().trim().min(1, 'Title is required').max(200),
  dueAt: z.string().min(1, 'Pick a due date'),
});

export type CreateReminderValues = z.infer<typeof createReminderSchema>;

export const createReminderDefaultValues: CreateReminderValues = {
  applicationId: '',
  title: '',
  dueAt: '',
};
