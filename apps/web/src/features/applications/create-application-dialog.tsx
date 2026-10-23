'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
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
  AnalyticsDocument,
  ApplicationsDocument,
  CreateApplicationDocument,
} from '@/graphql/generated/graphql';
import { cn } from '@/lib/utils';
import { STAGE_OPTIONS } from './application-options';
import {
  type CreateApplicationValues,
  createApplicationDefaultValues,
  createApplicationSchema,
} from './create-application-schema';
import { MoreDetailsFields } from './more-details-fields';

export function CreateApplicationDialog() {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [createApplication, { loading, error }] = useMutation(CreateApplicationDocument, {
    refetchQueries: [ApplicationsDocument, AnalyticsDocument],
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
    defaultValues: createApplicationDefaultValues,
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
      reset(createApplicationDefaultValues);
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
            <FormField label="Company" htmlFor="company" error={errors.company?.message}>
              <Input
                id="company"
                autoFocus
                {...fieldA11y('company', errors.company?.message)}
                {...register('company')}
              />
            </FormField>

            <FormField label="Role" htmlFor="role" error={errors.role?.message}>
              <Input id="role" {...fieldA11y('role', errors.role?.message)} {...register('role')} />
            </FormField>

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
              <MoreDetailsFields
                register={register}
                control={control}
                errors={errors}
                knownLocations={knownLocations}
              />
            ) : null}

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            ) : null}

            <DialogActions
              onCancel={() => setOpen(false)}
              submitLabel="Add application"
              loading={loading}
              loadingLabel="Saving…"
            />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
