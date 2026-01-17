import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Search,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { eventRegistrationApi } from '@/lib/eventRegistrationApi';
import { RegistrationApprovalModal } from './RegistrationApprovalModal';
import type {
  EventRegistrationStatus,
  EventRegistrationSummary,
} from '@/types/eventRegistration';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<EventRegistrationStatus, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-500 border-green-500/20',
  REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
  CANCELLED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

interface EventRegistrationsListProps {
  slug?: string;
  eventId?: string;
}

export function EventRegistrationsList({
  slug: propSlug,
  eventId: propEventId,
}: EventRegistrationsListProps) {
  const params = useParams<{ slug: string; eventId: string }>();
  const slug = propSlug || params.slug || '';
  const eventId = propEventId || params.eventId || '';

  const [registrations, setRegistrations] = useState<EventRegistrationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<EventRegistrationStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  // Modal state
  const [selectedRegistration, setSelectedRegistration] = useState<EventRegistrationSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    if (!slug || !eventId) return;

    setIsLoading(true);
    try {
      const status = statusFilter === 'ALL' ? undefined : statusFilter;
      const response = await eventRegistrationApi.getEventRegistrations(
        slug,
        eventId,
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
  }, [slug, eventId, statusFilter, currentPage]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleApprove = async () => {
    if (!selectedRegistration?.user) return;
    await eventRegistrationApi.approveRegistration(slug, eventId, selectedRegistration.user.id);
    fetchRegistrations();
  };

  const handleReject = async (reason: string) => {
    if (!selectedRegistration?.user) return;
    await eventRegistrationApi.rejectRegistration(slug, eventId, selectedRegistration.user.id, {
      rejectionReason: reason,
    });
    fetchRegistrations();
  };

  const handleExportCSV = () => {
    // Filter registrations based on search
    const filtered = registrations.filter((reg) => {
      if (!searchQuery) return true;
      const user = reg.user;
      if (!user) return false;
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) || user.email.includes(searchQuery.toLowerCase());
    });

    // Create CSV content
    const headers = ['Name', 'Email', 'University ID', 'Status', 'Registered At'];
    const rows = filtered.map((reg) => [
      reg.user ? `${reg.user.firstName} ${reg.user.lastName}` : 'N/A',
      reg.userEmail || 'N/A',
      reg.user?.universityId || 'N/A',
      reg.registrationStatus,
      new Date(reg.registeredAt).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter registrations locally by search query
  const filteredRegistrations = registrations.filter((reg) => {
    if (!searchQuery) return true;
    const user = reg.user;
    if (!user) return false;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Stats
  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.registrationStatus === 'PENDING').length,
    approved: registrations.filter((r) => r.registrationStatus === 'APPROVED').length,
    rejected: registrations.filter((r) => r.registrationStatus === 'REJECTED').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6" />
                Event Registrations
              </h1>
              <p className="text-muted-foreground">Manage registrations for this event</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchRegistrations}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
                <p className="text-sm text-muted-foreground">Approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as EventRegistrationStatus | 'ALL');
                  setCurrentPage(0);
                }}
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="ALL">All</TabsTrigger>
                  <TabsTrigger value="PENDING">Pending</TabsTrigger>
                  <TabsTrigger value="APPROVED">Approved</TabsTrigger>
                  <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
                  <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Registrations List */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg mb-1">No registrations found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? 'Try adjusting your search criteria'
                      : 'No one has registered for this event yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRegistrations.map((registration, index) => {
                    const user = registration.user;
                    if (!user) return null;

                    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {user.firstName} {user.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>

                        <div className="hidden sm:block text-sm text-muted-foreground">
                          {new Date(registration.registeredAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>

                        <Badge
                          variant="outline"
                          className={cn('capitalize', STATUS_COLORS[registration.registrationStatus])}
                        >
                          {registration.registrationStatus.toLowerCase()}
                        </Badge>

                        {registration.registrationStatus === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRegistration(registration);
                              setIsModalOpen(true);
                            }}
                          >
                            Review
                          </Button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t mt-6">
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
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Approval Modal */}
      <RegistrationApprovalModal
        registration={selectedRegistration}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
