import { useState } from 'react';
import { Check, X, Loader2, Mail, Building } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { EventRegistrationSummary } from '@/types/eventRegistration';

interface RegistrationApprovalModalProps {
  registration: EventRegistrationSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

export function RegistrationApprovalModal({
  registration,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: RegistrationApprovalModalProps) {
  const [mode, setMode] = useState<'view' | 'reject'>('view');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onApprove();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to approve:', err);
      setError('Failed to approve registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (rejectionReason.length < 5) {
      setError('Rejection reason must be at least 5 characters.');
      return;
    }
    if (rejectionReason.length > 255) {
      setError('Rejection reason must be at most 255 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onReject(rejectionReason);
      onOpenChange(false);
      setRejectionReason('');
      setMode('view');
    } catch (err) {
      console.error('Failed to reject:', err);
      setError('Failed to reject registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setMode('view');
    setRejectionReason('');
    setError(null);
  };

  if (!registration || !registration.user) return null;

  const user = registration.user;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'view' ? 'Review Registration' : 'Reject Registration'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'view'
              ? 'Review the registration details and approve or reject.'
              : 'Please provide a reason for rejecting this registration.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Info Card */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold">
                {user.firstName} {user.lastName}
              </h4>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building className="h-3.5 w-3.5" />
                <span>{user.universityId}</span>
              </div>
            </div>
          </div>

          {/* Registration Info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Registered At:</div>
            <div>
              {new Date(registration.registeredAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>
          </div>

          {/* Rejection Reason Form */}
          {mode === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Reason for Rejection</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please explain why this registration is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min 5 characters</span>
                <span className={rejectionReason.length > 255 ? 'text-destructive' : ''}>
                  {rejectionReason.length}/255
                </span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {mode === 'view' ? (
            <>
              <Button
                variant="outline"
                onClick={() => setMode('reject')}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setMode('view')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isLoading || rejectionReason.length < 5}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Confirm Rejection
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
