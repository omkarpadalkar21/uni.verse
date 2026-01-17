import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CancelRegistrationDialogProps {
  eventTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
}

export function CancelRegistrationDialog({
  eventTitle,
  open,
  onOpenChange,
  onConfirm,
}: CancelRegistrationDialogProps) {
  const [cancellationReason, setCancellationReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (cancellationReason.length < 5) {
      setError('Cancellation reason must be at least 5 characters.');
      return;
    }
    if (cancellationReason.length > 255) {
      setError('Cancellation reason must be at most 255 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(cancellationReason);
      onOpenChange(false);
      setCancellationReason('');
    } catch (err) {
      console.error('Failed to cancel registration:', err);
      setError('Failed to cancel registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setCancellationReason('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Cancel Registration
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your registration for{' '}
            <span className="font-semibold text-foreground">{eventTitle}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cancellationReason">Reason for Cancellation</Label>
            <Textarea
              id="cancellationReason"
              placeholder="Please explain why you are cancelling your registration..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min 5 characters</span>
              <span className={cancellationReason.length > 255 ? 'text-destructive' : ''}>
                {cancellationReason.length}/255
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Keep Registration
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || cancellationReason.length < 5}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Registration'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
