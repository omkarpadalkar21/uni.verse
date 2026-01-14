import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClubCard } from "@/components/clubs/ClubCard";
import { ClubCardSkeleton } from "@/components/clubs/ClubCardSkeleton";
import { clubApi, isAuthenticated } from "@/lib/api";
import type { ClubDTO, ClubCategory } from "@/types/club";
import {
  CLUB_CATEGORIES,
  CLUB_CATEGORY_LABELS,
  CLUB_CATEGORY_COLORS,
} from "@/constants/clubCategories";
import { cn } from "@/lib/utils";

export default function ClubsPage() {
  const [clubs, setClubs] = useState<ClubDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ClubCategory | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

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
      setError("Failed to load clubs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter clubs by search and category
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      searchQuery === "" ||
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || club.clubCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Explore Clubs</h1>
              <p className="text-muted-foreground mt-1">
                Discover and join clubs that match your interests
              </p>
            </div>
            {isAuthenticated() && (
              <Button asChild className="glow">
                <Link to="/clubs/register">
                  <Plus className="h-4 w-4 mr-2" />
                  Register Club
                </Link>
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
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
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value as ClubCategory | "ALL")}
            >
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {CLUB_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CLUB_CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== "ALL" || searchQuery) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory !== "ALL" && (
                <Badge
                  variant="outline"
                  className={cn("cursor-pointer", CLUB_CATEGORY_COLORS[selectedCategory])}
                  onClick={() => setSelectedCategory("ALL")}
                >
                  {CLUB_CATEGORY_LABELS[selectedCategory]} ×
                </Badge>
              )}
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setSearchQuery("")}
                >
                  "{searchQuery}" ×
                </Badge>
              )}
            </div>
          )}
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchClubs}>Try Again</Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ClubCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredClubs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-muted/50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No clubs found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedCategory !== "ALL"
                ? "Try adjusting your filters or search query"
                : "Be the first to register a club!"}
            </p>
            {isAuthenticated() && (
              <Button asChild>
                <Link to="/clubs/register">Register a Club</Link>
              </Button>
            )}
          </motion.div>
        )}

        {/* Clubs Grid */}
        {!isLoading && !error && filteredClubs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClubs.map((club) => (
                <ClubCard key={club.slug} club={club} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
