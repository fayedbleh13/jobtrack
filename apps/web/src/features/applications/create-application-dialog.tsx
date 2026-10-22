'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, Loader2 } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { cn } from '@/lib/utils';
import { SOURCE_OPTIONS, STAGE_OPTIONS } from './application-options';
import { type CreateApplicationValues, createApplicationSchema } from './create-application-schema';

const PRIORITY_ITEMS = [
  { value: '1', label: 'Low' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'High' },
];

const SOURCE_ITEMS = SOURCE_OPTIONS.map((value) => ({ value, label: value }));

const EMPTY_VALUES: CreateApplicationValues = {
  company: '',
  role: '',
  status: 'APPLIED',
  location: '',
  source: undefined,
  priority: undefined,
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
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CreateApplicationDialog() {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [createApplication, { loading, error }] = useMutation(CreateApplicationDocument, {
    refetchQueries: [ApplicationsDocument],
  });

  // Served from Apollo's cache when the board has already loaded, so this costs no request.
  const { data } = useQuery(ApplicationsDocument, { skip: !open });

  const knownLocations = useMemo(() => {
    const locations = (data?.applications ?? [])
      .map((application) => application.location)
      .filter((location): location is string => Boolean(location));

    return [...new Set(locations)].sort();
  }, [data]);

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
    const status = values.status ?? 'APPLIED';

    try {
      await createApplication({
        variables: {
          input: {
            company: values.company,
            role: values.role,
            status,
            appliedAt: status === 'APPLIED' ? new Date().toISOString() : undefined,
            location: values.location || undefined,
            source: values.source,
            priority: values.priority ? Number(values.priority) : undefined,
            salaryMin: values.salaryMin ? Number(values.salaryMin) : undefined,
            salaryMax: values.salaryMax ? Number(values.salaryMax) : undefined,
            notes: values.notes || undefined,
          },
        },
      });

      toast.success(`${values.company} added`, {
        description:
          status === 'APPLIED' ? 'Recorded as applied today.' : 'Saved to your wishlist.',
      });
      reset(EMPTY_VALUES);
      setShowMore(false);
      setOpen(false);
    } catch {
      toast.error('Could not add the application', {
        description: 'Check your connection and try again.',
      });
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New application</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New application</DialogTitle>
            <DialogDescription>
              Company and role are enough to start — everything else is optional.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Company" htmlFor="company" error={errors.company?.message}>
              <Input id="company" autoFocus {...register('company')} />
            </Field>

            <Field label="Role" htmlFor="role" error={errors.role?.message}>
              <Input id="role" {...register('role')} />
            </Field>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="text-sm font-medium">Stage</legend>
              <div className="flex gap-2">
                {STAGE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                  >
                    <input
                      type="radio"
                      value={option.value}
                      className="sr-only"
                      {...register('status')}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Applied records today&rsquo;s date for you.
              </p>
            </fieldset>

            <button
              type="button"
              onClick={() => setShowMore((value) => !value)}
              aria-expanded={showMore}
              aria-controls="more-details"
              className="flex w-fit items-center gap-1 text-sm font-medium text-primary"
            >
              {showMore ? 'Fewer details' : 'More details'}
              <ChevronDown
                aria-hidden
                className={cn('size-4 transition-transform', showMore && 'rotate-180')}
              />
            </button>

            {showMore ? (
              <div id="more-details" className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Location" htmlFor="location" error={errors.location?.message}>
                    <Input id="location" list="known-locations" {...register('location')} />
                    <datalist id="known-locations">
                      {knownLocations.map((location) => (
                        <option key={location} value={location} />
                      ))}
                    </datalist>
                  </Field>

                  <Field label="Source" htmlFor="source" error={errors.source?.message}>
                    <Controller
                      control={control}
                      name="source"
                      render={({ field }) => (
                        <Select
                          items={SOURCE_ITEMS}
                          value={field.value ?? null}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger id="source" className="w-full text-base sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SOURCE_ITEMS.map((item) => (
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
                          <SelectTrigger id="priority" className="w-full text-base sm:text-sm">
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
              </div>
            ) : null}

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
                {loading ? (
                  <>
                    <Loader2 aria-hidden className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Add application'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
