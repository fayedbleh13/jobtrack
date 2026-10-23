'use client';

import { useMutation } from '@apollo/client/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ApplicationDocument,
  type ApplicationStatus,
  ChangeStatusDocument,
} from '@/graphql/generated/graphql';
import { STATUS_LABELS } from './application-options';

type StatusAdvanceControlProps = {
  applicationId: string;
  allowedNextStatuses: ApplicationStatus[];
};

export function StatusAdvanceControl({
  applicationId,
  allowedNextStatuses,
}: StatusAdvanceControlProps) {
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<ApplicationStatus | null>(null);

  const [changeStatus, { error }] = useMutation(ChangeStatusDocument, {
    refetchQueries: [{ query: ApplicationDocument, variables: { id: applicationId } }],
  });

  async function advance(status: ApplicationStatus) {
    setPending(status);

    try {
      await changeStatus({
        variables: { id: applicationId, status, note: note.trim() || null },
      });
      setNote('');
      toast.success(`Moved to ${STATUS_LABELS[status]}`);
    } catch {
      toast.error('Could not change the stage', {
        description: 'Nothing was saved. Try again.',
      });
    } finally {
      setPending(null);
    }
  }

  if (allowedNextStatuses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This application has reached a terminal state and cannot move on.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={note}
        placeholder="Optional note for this change"
        aria-label="Note for this status change"
        onChange={(event) => setNote(event.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        {allowedNextStatuses.map((status) => (
          <Button
            key={status}
            type="button"
            variant="outline"
            size="sm"
            disabled={pending !== null}
            onClick={() => advance(status)}
          >
            {pending === status ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                Moving…
              </>
            ) : (
              `Move to ${STATUS_LABELS[status]}`
            )}
          </Button>
        ))}
      </div>

      <div aria-live="polite">
        {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
      </div>
    </div>
  );
}
