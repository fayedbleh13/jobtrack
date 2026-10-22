'use client';

import { useMutation } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { ApplicationsDocument, CreateApplicationDocument } from '@/graphql/generated/graphql';
import { type CreateApplicationValues, createApplicationSchema } from './create-application-schema';

const PRIORITY_ITEMS = [
  { value: '1', label: 'Low' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'High' },
];

const EMPTY_VALUES: CreateApplicationValues = {
  company: '',
  role: '',
  location: '',
  source: '',
  salaryMin: '',
  salaryMax: '',
  notes: '',
};

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

export function CreateApplicationDialog() {
  const [open, setOpen] = useState(false);
  const [createApplication, { loading, error }] = useMutation(CreateApplicationDocument, {
    refetchQueries: [ApplicationsDocument],
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateApplicationValues>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues: EMPTY_VALUES,
  });

  async function onSubmit(values: CreateApplicationValues) {
    try {
      await createApplication({
        variables: {
          input: {
            company: values.company,
            role: values.role,
            location: values.location || undefined,
            source: values.source || undefined,
            priority: values.priority ? Number(values.priority) : undefined,
            salaryMin: values.salaryMin ? Number(values.salaryMin) : undefined,
            salaryMax: values.salaryMax ? Number(values.salaryMax) : undefined,
            notes: values.notes || undefined,
          },
        },
      });
      reset(EMPTY_VALUES);
      setOpen(false);
    } catch {
      // Surfaced through the mutation's `error` state below.
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New application</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New application</DialogTitle>
            <DialogDescription>
              Track a role you have applied to, or one you plan to.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Company" htmlFor="company" error={errors.company?.message}>
              <Input id="company" {...register('company')} />
            </Field>

            <Field label="Role" htmlFor="role" error={errors.role?.message}>
              <Input id="role" {...register('role')} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Location" htmlFor="location" error={errors.location?.message}>
                <Input id="location" {...register('location')} />
              </Field>

              <Field label="Source" htmlFor="source" error={errors.source?.message}>
                <Input id="source" placeholder="LinkedIn, referral…" {...register('source')} />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Salary min" htmlFor="salaryMin" error={errors.salaryMin?.message}>
                <Input id="salaryMin" inputMode="numeric" {...register('salaryMin')} />
              </Field>

              <Field label="Salary max" htmlFor="salaryMax" error={errors.salaryMax?.message}>
                <Input id="salaryMax" inputMode="numeric" {...register('salaryMax')} />
              </Field>

              <Field label="Priority" htmlFor="priority" error={errors.priority?.message}>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select
                      items={PRIORITY_ITEMS}
                      value={field.value ?? null}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger id="priority" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <Field label="Notes" htmlFor="notes" error={errors.notes?.message}>
              <Textarea id="notes" rows={3} {...register('notes')} />
            </Field>

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
