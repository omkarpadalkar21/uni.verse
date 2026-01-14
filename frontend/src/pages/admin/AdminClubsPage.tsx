import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  X,
  Ban,
  MoreHorizontal,
  Loader2,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clubApi } from "@/lib/api";
import type { ClubDTO, ClubStatus } from "@/types/club";
import { CLUB_CATEGORY_LABELS } from "@/constants/clubCategories";

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<ClubDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClubStatus | "ALL">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchClubs();
  }, [currentPage]);

  const fetchClubs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await clubApi.getClubs(currentPage, pageSize);
      setClubs(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to fetch clubs:", err);
      setError("Failed to load clubs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (slug: string) => {
    setActionLoading(slug);
    try {
      await clubApi.approveClub(slug);
      fetchClubs();
    } catch (err) {
      console.error("Failed to approve:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (slug: string) => {
    setActionLoading(slug);
    try {
      await clubApi.rejectClub(slug);
      fetchClubs();
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (slug: string) => {
    setActionLoading(slug);
    try {
      await clubApi.suspendClub(slug);
      fetchClubs();
    } catch (err) {
      console.error("Failed to suspend:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Note: ClubDTO doesn't include status, so we can't filter by it directly
  // This would need backend changes or a different endpoint
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      searchQuery === "" ||
      club.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <h1 className="text-3xl font-bold mb-2">Club Administration</h1>
          <p className="text-muted-foreground">
            Manage club approvals, rejections, and suspensions
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ClubStatus | "ALL")}
          >
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchClubs}>Try Again</Button>
          </div>
        )}

        {/* Clubs List */}
        {!error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>All Clubs ({filteredClubs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredClubs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No clubs found
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredClubs.map((club) => (
                      <div
                        key={club.slug}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={club.logoUrl} alt={club.name} />
                            <AvatarFallback>
                              {club.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/clubs/${club.slug}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {club.name}
                              </Link>
                              <Badge variant="secondary" className="text-xs">
                                {CLUB_CATEGORY_LABELS[club.clubCategory]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {club.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {club.memberCount} members • {club.eventCount} events
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(club.slug)}
                            disabled={actionLoading === club.slug}
                          >
                            {actionLoading === club.slug ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="h-9 w-9">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleReject(club.slug)}
                                className="text-destructive"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleSuspend(club.slug)}
                                className="text-orange-500"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
          </motion.div>
        )}
      </div>
    </div>
  );
}
