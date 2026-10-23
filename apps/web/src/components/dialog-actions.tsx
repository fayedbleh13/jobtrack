import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

type DialogActionsProps = {
  onCancel: () => void;
  submitLabel: string;
  loadingLabel?: string;
  loading?: boolean;
  cancelLabel?: string;
};

export function DialogActions({
  onCancel,
  submitLabel,
  loadingLabel = 'Saving…',
  loading = false,
  cancelLabel = 'Cancel',
}: DialogActionsProps) {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </DialogFooter>
  );
}
