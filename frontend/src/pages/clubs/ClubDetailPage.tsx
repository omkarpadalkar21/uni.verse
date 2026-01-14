import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Calendar,
  Loader2,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { clubApi, clubManagementApi, isAuthenticated } from "@/lib/api";
import type { ClubDTO } from "@/types/club";
import { CLUB_CATEGORY_COLORS, CLUB_CATEGORY_LABELS } from "@/constants/clubCategories";
import { cn } from "@/lib/utils";

export default function ClubDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [club, setClub] = useState<ClubDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<"idle" | "loading" | "pending" | "member">("idle");
  const [joinMessage, setJoinMessage] = useState("");

  useEffect(() => {
    if (slug) {
      fetchClub();
    }
  }, [slug]);

  const fetchClub = async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await clubApi.getClubBySlug(slug);
      setClub(data);
    } catch (err) {
      console.error("Failed to fetch club:", err);
      setError("Club not found or failed to load.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!slug || !isAuthenticated()) return;
    setJoinStatus("loading");
    try {
      await clubManagementApi.createJoinRequest(slug, { message: "I would like to join this club." });
      setJoinStatus("pending");
      setJoinMessage("Your request has been sent! Wait for club leaders to approve.");
    } catch (err: unknown) {
      setJoinStatus("idle");
      if (err && typeof err === "object" && "response" in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setJoinMessage(error.response?.data?.message || "Failed to send join request.");
      } else {
        setJoinMessage("Failed to send join request.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="relative h-64 rounded-xl overflow-hidden mb-8">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex items-start gap-6 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Club Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link to="/clubs">Back to Clubs</Link>
          </Button>
        </div>
      </div>
    );
  }

  const categoryColorClass = CLUB_CATEGORY_COLORS[club.clubCategory] || "bg-gray-500/10 text-gray-500";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/clubs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clubs
            </Link>
          </Button>
        </motion.div>

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-8"
        >
          {club.bannerUrl ? (
            <img
              src={club.bannerUrl}
              alt={`${club.name} banner`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/30 via-purple-500/20 to-blue-600/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </motion.div>

        {/* Club Info Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row items-start gap-6 mb-8 -mt-20 relative z-10 px-4"
        >
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
            <AvatarImage src={club.logoUrl} alt={club.name} />
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              {club.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">{club.name}</h1>
              <Badge variant="outline" className={cn("font-medium", categoryColorClass)}>
                {CLUB_CATEGORY_LABELS[club.clubCategory]}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{club.memberCount} members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{club.eventCount} events</span>
              </div>
            </div>

            {/* Join Button */}
            {!isAuthenticated() ? (
              <Button asChild>
                <Link to="/auth/signin">Sign in to Join</Link>
              </Button>
            ) : joinStatus === "member" ? (
              <Badge variant="secondary" className="text-sm py-1.5 px-4">
                <Shield className="h-4 w-4 mr-2" />
                Member
              </Badge>
            ) : joinStatus === "pending" ? (
              <Badge variant="outline" className="text-sm py-1.5 px-4 bg-yellow-500/10 text-yellow-500">
                <Clock className="h-4 w-4 mr-2" />
                Request Pending
              </Badge>
            ) : (
              <Button onClick={handleJoinRequest} disabled={joinStatus === "loading"}>
                {joinStatus === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Request to Join"
                )}
              </Button>
            )}

            {joinMessage && (
              <Alert className="mt-4 max-w-md">
                <AlertDescription>{joinMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{club.description}</p>
              </CardContent>
            </Card>

            {/* Tags */}
            {club.tags && club.tags.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {club.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Stats Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-medium">{club.memberCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Followers</span>
                    <span className="font-medium">{club.followerCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Events</span>
                    <span className="font-medium">{club.eventCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
