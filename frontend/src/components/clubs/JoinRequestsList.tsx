import { useState, useEffect } from "react";
import { Loader2, Check, X, Clock, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { clubManagementApi } from "@/lib/api";
import type { ClubJoinRequest } from "@/types/club";
import type { Page } from "@/types/api";

interface JoinRequestsListProps {
  slug: string;
}

export function JoinRequestsList({ slug }: JoinRequestsListProps) {
  const [requests, setRequests] = useState<ClubJoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Rejection dialog state
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; request: ClubJoinRequest | null }>({
    open: false,
    request: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const pageSize = 20;

  useEffect(() => {
    fetchRequests();
  }, [slug, currentPage]);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: Page<ClubJoinRequest> = await clubManagementApi.getJoinRequests(slug, currentPage, pageSize);
      setRequests(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError("Failed to load join requests.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: ClubJoinRequest) => {
    setActionLoading(request.id);
    try {
      await clubManagementApi.approveJoinRequest(slug, request.user.id);
      // Remove from list after approval
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (err) {
      console.error("Failed to approve:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (request: ClubJoinRequest) => {
    setRejectDialog({ open: true, request });
    setRejectionReason("");
  };

  const handleReject = async () => {
    if (!rejectDialog.request) return;
    
    setActionLoading(rejectDialog.request.id);
    try {
      await clubManagementApi.rejectJoinRequest(slug, rejectDialog.request.user.id, {
        reason: rejectionReason || "Your request was not approved.",
      });
      // Remove from list after rejection
      setRequests((prev) => prev.filter((r) => r.id !== rejectDialog.request?.id));
      setRejectDialog({ open: false, request: null });
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Join Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchRequests}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  // Filter only pending requests
  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Join Requests</span>
            {pendingRequests.length > 0 && (
              <Badge variant="secondary">{pendingRequests.length} pending</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {request.user.firstName[0]}{request.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {request.user.firstName} {request.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {request.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested {formatDate(request.createdAt)}
                      </p>
                      {request.message && (
                        <div className="mt-2 p-2 bg-background rounded text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <MessageSquare className="h-3 w-3" />
                            <span className="text-xs">Message:</span>
                          </div>
                          <p className="text-muted-foreground">{request.message}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request)}
                      disabled={actionLoading === request.id}
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRejectDialog(request)}
                      disabled={actionLoading === request.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, request: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Join Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {rejectDialog.request?.user.firstName}'s request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, request: null })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading === rejectDialog.request?.id}
            >
              {actionLoading === rejectDialog.request?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Reject Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
