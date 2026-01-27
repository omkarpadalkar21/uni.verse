import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileCheck,
  Filter,
  Check,
  X,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { adminApi } from '@/lib/api';
import type { OrganizerVerificationResponse, VerificationStatus } from '@/types/admin';

export default function OrganizerVerificationPage() {
  const [verifications, setVerifications] = useState<OrganizerVerificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'ALL'>('PENDING');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<OrganizerVerificationResponse | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchVerifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getOrganizerVerifications({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        offset: currentPage,
        pageSize,
      });
      setVerifications(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Failed to fetch verifications:', err);
      setError('Failed to load verification requests');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await adminApi.approveOrganizer(id);
      fetchVerifications();
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !rejectReason.trim()) return;

    setActionLoading(selectedVerification.id);
    try {
      await adminApi.rejectOrganizer(selectedVerification.id, { reason: rejectReason });
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedVerification(null);
      fetchVerifications();
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusConfig = (status: VerificationStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          icon: <Clock className="h-3.5 w-3.5" />,
          label: 'Pending',
        };
      case 'APPROVED':
        return {
          color: 'bg-green-500/10 text-green-500 border-green-500/20',
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          label: 'Approved',
        };
      case 'REJECTED':
        return {
          color: 'bg-red-500/10 text-red-500 border-red-500/20',
          icon: <XCircle className="h-3.5 w-3.5" />,
          label: 'Rejected',
        };
      default:
        return {
          color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
          icon: null,
          label: status,
        };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && verifications.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-500/20">
              <FileCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Organizer Verification</h1>
              <p className="text-muted-foreground">Review and manage verification requests</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as VerificationStatus | 'ALL');
              setCurrentPage(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchVerifications}>Try Again</Button>
          </div>
        )}

        {/* Verifications List */}
        {!error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle>Verification Requests ({verifications.length})</CardTitle>
                <CardDescription>
                  {statusFilter === 'PENDING'
                    ? 'Review pending verification requests'
                    : 'All verification requests'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verifications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      {statusFilter === 'PENDING'
                        ? 'No pending verification requests'
                        : 'No verification requests found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {verifications.map((verification) => {
                      const statusConfig = getStatusConfig(verification.status);
                      return (
                        <div
                          key={verification.id}
                          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-2">
                              <span className="font-medium">{verification.userEmail}</span>
                              <Badge variant="outline" className={statusConfig.color}>
                                {statusConfig.icon}
                                <span className="ml-1">{statusConfig.label}</span>
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Submitted: {formatDate(verification.submittedAt)}</p>
                              {verification.reviewedAt && (
                                <p>Reviewed: {formatDate(verification.reviewedAt)}</p>
                              )}
                              {verification.rejectionReason && (
                                <p className="text-red-500">
                                  Rejection reason: {verification.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* View Document Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedVerification(verification);
                                setViewDialogOpen(true);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View Document
                            </Button>

                            {/* Actions for Pending */}
                            {verification.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(verification.id)}
                                  disabled={actionLoading === verification.id}
                                >
                                  {actionLoading === verification.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedVerification(verification);
                                    setRejectDialogOpen(true);
                                  }}
                                  disabled={actionLoading === verification.id}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6">
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
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verification Document</DialogTitle>
            <DialogDescription>
              Document submitted by {selectedVerification?.userEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedVerification?.documentUrl ? (
              <div className="space-y-4">
                {/* Document Preview */}
                <div className="border rounded-lg overflow-hidden">
                  {selectedVerification.documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={selectedVerification.documentUrl}
                      alt="Verification document"
                      className="w-full h-auto max-h-96 object-contain bg-muted"
                    />
                  ) : (
                    <div className="p-8 text-center bg-muted">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Document preview not available</p>
                    </div>
                  )}
                </div>
                <Button asChild className="w-full">
                  <a
                    href={selectedVerification.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Full Document
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No document available
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the verification request from{' '}
              {selectedVerification?.userEmail}? Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Reason for rejection</Label>
              <Textarea
                id="rejectReason"
                placeholder="Enter the reason for rejecting this verification..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
                setSelectedVerification(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading === selectedVerification?.id}
            >
              {actionLoading === selectedVerification?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
