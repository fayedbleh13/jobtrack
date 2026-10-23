'use client';

import { type Control, Controller, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { FormField, fieldA11y } from '@/components/form-field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PRIORITY_ITEMS, SOURCE_OPTIONS } from './application-options';
import type { CreateApplicationValues } from './create-application-schema';

const SOURCE_ITEMS = SOURCE_OPTIONS.map((value) => ({ value, label: value }));

type MoreDetailsFieldsProps = {
  register: UseFormRegister<CreateApplicationValues>;
  control: Control<CreateApplicationValues>;
  errors: FieldErrors<CreateApplicationValues>;
  knownLocations: string[];
};

export function MoreDetailsFields({
  register,
  control,
  errors,
  knownLocations,
}: MoreDetailsFieldsProps) {
  return (
    <div id="more-details" className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Location" htmlFor="location" error={errors.location?.message}>
          <Input
            id="location"
            list="known-locations"
            {...fieldA11y('location', errors.location?.message)}
            {...register('location')}
          />
          <datalist id="known-locations">
            {knownLocations.map((location) => (
              <option key={location} value={location} />
            ))}
          </datalist>
        </FormField>

        <FormField label="Source" htmlFor="source" error={errors.source?.message}>
          <Controller
            control={control}
            name="source"
            render={({ field }) => (
              <Select
                items={SOURCE_ITEMS}
                value={field.value ?? null}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger
                  id="source"
                  className="w-full text-base sm:text-sm"
                  {...fieldA11y('source', errors.source?.message)}
                >
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
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Salary min" htmlFor="salaryMin" error={errors.salaryMin?.message}>
          <Input
            id="salaryMin"
            inputMode="numeric"
            {...fieldA11y('salaryMin', errors.salaryMin?.message)}
            {...register('salaryMin')}
          />
        </FormField>

        <FormField label="Salary max" htmlFor="salaryMax" error={errors.salaryMax?.message}>
          <Input
            id="salaryMax"
            inputMode="numeric"
            {...fieldA11y('salaryMax', errors.salaryMax?.message)}
            {...register('salaryMax')}
          />
        </FormField>

        <FormField label="Priority" htmlFor="priority" error={errors.priority?.message}>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select
                items={PRIORITY_ITEMS}
                value={field.value ?? null}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger
                  id="priority"
                  className="w-full text-base sm:text-sm"
                  {...fieldA11y('priority', errors.priority?.message)}
                >
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
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
        <Textarea
          id="notes"
          rows={3}
          {...fieldA11y('notes', errors.notes?.message)}
          {...register('notes')}
        />
      </FormField>
    </div>
  );
}
