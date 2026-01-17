import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Ticket,
  X,
  Clock,
  Check,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { eventRegistrationApi } from '@/lib/eventRegistrationApi';
import { CancelRegistrationDialog } from '@/components/events/CancelRegistrationDialog';
import type {
  EventRegistrationStatus,
  EventRegistrationSummary,
} from '@/types/eventRegistration';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<
  EventRegistrationStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  PENDING: {
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    icon: <Clock className="h-3.5 w-3.5" />,
    label: 'Pending Approval',
  },
  APPROVED: {
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: <Check className="h-3.5 w-3.5" />,
    label: 'Approved',
  },
  REJECTED: {
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: <XCircle className="h-3.5 w-3.5" />,
    label: 'Rejected',
  },
  CANCELLED: {
    color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    icon: <X className="h-3.5 w-3.5" />,
    label: 'Cancelled',
  },
};

export default function UserRegistrationsPage() {
  const [registrations, setRegistrations] = useState<EventRegistrationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<EventRegistrationStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<EventRegistrationSummary | null>(null);

  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = statusFilter === 'ALL' ? undefined : statusFilter;
      const response = await eventRegistrationApi.getUserRegistrations(
        status,
        currentPage,
        pageSize
      );
      setRegistrations(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleCancelRegistration = async (reason: string) => {
    if (!selectedRegistration?.eventSummary) return;
    
    const event = selectedRegistration.eventSummary;
    // We need the club slug, which should be derived from the event
    // For now, we'll use the event slug's club portion or club name
    const clubSlug = selectedRegistration.clubName?.toLowerCase().replace(/\s+/g, '-') || '';
    
    await eventRegistrationApi.cancelRegistration(clubSlug, event.id, {
      cancellationReason: reason,
    });
    fetchRegistrations();
  };

  const canCancelRegistration = (registration: EventRegistrationSummary): boolean => {
    // Can only cancel if not already cancelled/rejected and event hasn't started
    if (registration.registrationStatus === 'CANCELLED' || registration.registrationStatus === 'REJECTED') {
      return false;
    }
    
    // Check if event hasn't started yet (we don't have startTime in EventSummary, so we'll allow cancellation for now)
    // In a real implementation, you'd check: new Date(registration.eventSummary.startTime) > new Date()
    return true;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Ticket className="h-7 w-7" />
              My Registrations
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage your event registrations
            </p>
          </div>

          {/* Status Filter Tabs */}
          <Tabs
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as EventRegistrationStatus | 'ALL');
              setCurrentPage(0);
            }}
          >
            <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-5 gap-1">
              <TabsTrigger value="ALL">All</TabsTrigger>
              <TabsTrigger value="APPROVED">Approved</TabsTrigger>
              <TabsTrigger value="PENDING">Pending</TabsTrigger>
              <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
              <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Registrations List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="h-24 w-40 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : registrations.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Ticket className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Registrations Found</h3>
                <p className="text-muted-foreground mb-6">
                  {statusFilter === 'ALL'
                    ? "You haven't registered for any events yet."
                    : `You don't have any ${statusFilter.toLowerCase()} registrations.`}
                </p>
                <Button asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {registrations.map((registration, index) => {
                const event = registration.eventSummary;
                const statusConfig = STATUS_CONFIG[registration.registrationStatus];

                return (
                  <motion.div
                    key={`${event?.id || index}-${registration.registeredAt}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Event Banner */}
                          {event && (
                            <div className="relative w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
                              {event.bannerUrl ? (
                                <img
                                  src={event.bannerUrl}
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/30 via-purple-500/20 to-blue-600/20" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/80 hidden sm:block" />
                            </div>
                          )}

                          {/* Event Details */}
                          <div className="flex-1 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                {event ? (
                                  <>
                                    <Link
                                      to={`/events/${event.id}`}
                                      className="hover:underline"
                                    >
                                      <h3 className="font-semibold text-lg truncate">
                                        {event.title}
                                      </h3>
                                    </Link>
                                    <p className="text-sm text-muted-foreground mb-3">
                                      {registration.clubName}
                                    </p>
                                  </>
                                ) : (
                                  <h3 className="font-semibold text-lg mb-3">
                                    Event Details Unavailable
                                  </h3>
                                )}

                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <span>Registered: {formatDate(registration.registeredAt)}</span>
                                  </div>
                                  {event?.venue && (
                                    <div className="flex items-center gap-1.5">
                                      <MapPin className="h-4 w-4" />
                                      <span>{event.venue.name}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'flex items-center gap-1.5',
                                    statusConfig.color
                                  )}
                                >
                                  {statusConfig.icon}
                                  {statusConfig.label}
                                </Badge>

                                {canCancelRegistration(registration) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      setSelectedRegistration(registration);
                                      setCancelDialogOpen(true);
                                    }}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Cancel Registration Dialog */}
      <CancelRegistrationDialog
        eventTitle={selectedRegistration?.eventSummary?.title || 'this event'}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelRegistration}
      />
    </div>
  );
}
