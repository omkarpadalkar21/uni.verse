import { useState } from 'react';
import { Check, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { eventRegistrationApi } from '@/lib/eventRegistrationApi';
import type { EventRegistrationMode } from '@/types/event';
import type { EventRegistrationStatus } from '@/types/eventRegistration';

interface EventRegistrationButtonProps {
  slug: string;
  eventId: string;
  registrationMode: EventRegistrationMode;
  isRegistered?: boolean;
  currentRegistrationStatus?: EventRegistrationStatus | null;
  isFull?: boolean;
  onSuccess?: (status: EventRegistrationStatus) => void;
}

export function EventRegistrationButton({
  slug,
  eventId,
  registrationMode,
  isRegistered = false,
  currentRegistrationStatus = null,
  isFull = false,
  onSuccess,
}: EventRegistrationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<EventRegistrationStatus | null>(
    currentRegistrationStatus
  );
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await eventRegistrationApi.registerForEvent(slug, eventId);
      setRegistrationStatus(response.registrationStatus);
      onSuccess?.(response.registrationStatus);
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Already registered or has a registration status
  if (isRegistered || registrationStatus) {
    const status = registrationStatus || 'APPROVED';
    
    if (status === 'APPROVED') {
      return (
        <Button disabled className="w-full" variant="secondary">
          <Check className="h-4 w-4 mr-2" />
          Registered
        </Button>
      );
    }

    if (status === 'PENDING') {
      return (
        <Button disabled className="w-full" variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Pending Approval
        </Button>
      );
    }

    if (status === 'REJECTED') {
      return (
        <Button disabled className="w-full" variant="destructive">
          Registration Rejected
        </Button>
      );
    }

    if (status === 'CANCELLED') {
      return (
        <Button disabled className="w-full" variant="secondary">
          Registration Cancelled
        </Button>
      );
    }
  }

  // Event is full
  if (isFull) {
    return (
      <Button disabled className="w-full" variant="secondary">
        Event Full
      </Button>
    );
  }

  // Default: Can register
  return (
    <div className="space-y-2">
      <Button
        onClick={handleRegister}
        disabled={isLoading}
        className="w-full glow"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Registering...
          </>
        ) : (
          'Register Now'
        )}
      </Button>
      
      {registrationMode === 'MANUAL_APPROVE' && (
        <p className="text-xs text-muted-foreground text-center">
          Registration requires approval
        </p>
      )}
      
      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
    </div>
  );
}
