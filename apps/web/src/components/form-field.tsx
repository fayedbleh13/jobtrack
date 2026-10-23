import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Label + control + error message, shared by every form in the app.
 * `fieldA11y` keeps the input wired to the error message for screen readers.
 */
export function FormField({ label, htmlFor, error, className, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
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

export function fieldA11y(id: string, error?: string) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
  } as const;
}
