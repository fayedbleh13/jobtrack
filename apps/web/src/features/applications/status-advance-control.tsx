'use client';

import { useMutation } from '@apollo/client/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ApplicationDocument,
  type ApplicationStatus,
  ChangeStatusDocument,
} from '@/graphql/generated/graphql';
import { STATUS_LABELS } from './status-badge';

type StatusAdvanceControlProps = {
  applicationId: string;
  allowedNextStatuses: ApplicationStatus[];
};

export function StatusAdvanceControl({
  applicationId,
  allowedNextStatuses,
}: StatusAdvanceControlProps) {
  const [note, setNote] = useState('');
  const [changeStatus, { loading, error }] = useMutation(ChangeStatusDocument, {
    refetchQueries: [{ query: ApplicationDocument, variables: { id: applicationId } }],
  });

  async function advance(status: ApplicationStatus) {
    try {
      await changeStatus({
        variables: { id: applicationId, status, note: note.trim() || null },
      });
      setNote('');
    } catch {
      // Surfaced through the mutation's `error` state below.
    }
  }

  if (allowedNextStatuses.length === 0) {
    return (
      <p className="text-sm text-slate-500">
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
            disabled={loading}
            onClick={() => advance(status)}
          >
            Move to {STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-600">{error.message}</p> : null}
    </div>
  );
}
