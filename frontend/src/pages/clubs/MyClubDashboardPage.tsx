import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Calendar,
  Settings,
  LayoutDashboard,
  Shield,
  UserPlus,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { clubApi, clubManagementApi } from "@/lib/api";
import { getAuthInfo } from "@/lib/auth";
import type { ClubDTO } from "@/types/club";
import { CLUB_CATEGORY_LABELS, CLUB_CATEGORY_COLORS } from "@/constants/clubCategories";
import { cn } from "@/lib/utils";

/**
 * My Club Dashboard Portal — /my-club
 *
 * Accessible to any authenticated user.  All role enforcement is handled
 * server-side via @PreAuthorize on clubManagementApi.getMembers().
 *
 * Strategy (backend-accurate, no backend changes required):
 *  1. Fetch all active clubs (paginated, up to 200).
 *  2. For each club, attempt GET /api/v1/clubs/{slug}/members (page 0, size 1).
 *     - If it returns data → the current user is a member or leader of that club.
 *     - If it 403s/errors → the user is not in that club; skip it.
 *  3. Render only the clubs the user actually belongs to.
 *
 * The backend's @PreAuthorize("hasAnyAuthority('ROLE_CLUB_LEADER','ROLE_CLUB_MEMBER')")
 * on getAllClubMembers means this check is trustworthy and symmetric with the
 * server-side auth model — no extra role flags needed on the frontend.
 */
export default function MyClubDashboardPage() {
  const { isClubLeader, isClubMember } = getAuthInfo();
  const isClubParticipant = isClubLeader || isClubMember;

  const [myClubs, setMyClubs] = useState<ClubDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch all clubs (up to 200 — covers virtually all universities)
        const allClubsResponse = await clubApi.getClubs(0, 200);
        const allClubs = allClubsResponse.content;

        // 2. Probe each club: getMembers returns data only for clubs the user
        //    is in (leader or member).  We run probes concurrently.
        const results = await Promise.allSettled(
          allClubs.map((club) =>
            clubManagementApi
              .getMembers(club.slug, 0, 1)
              .then(() => club)        // success → user is in this club
              .catch(() => null)       // error (403) → user is not in this club
          )
        );

        const joined = results
          .filter(
            (r): r is PromiseFulfilledResult<ClubDTO | null> =>
              r.status === "fulfilled" && r.value !== null
          )
          .map((r) => r.value as ClubDTO);

        setMyClubs(joined);
      } catch (err) {
        console.error("Failed to load my clubs:", err);
        setError("Failed to load your club data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-72 mb-2" />
          <Skeleton className="h-5 w-56 mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-5xl">

        {/* ── Page Header ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" asChild className="mb-4 -ml-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-primary/20 ring-1 ring-primary/30">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Club Dashboard</h1>
              <p className="text-muted-foreground mt-0.5">
                {isClubLeader
                  ? "Manage your club, review join requests and organise events"
                  : "View your club memberships and activity"}
              </p>
            </div>
          </div>

          {/* Role badges */}
          <div className="flex gap-2 flex-wrap">
            {isClubLeader && (
              <Badge className="bg-primary/10 text-primary border border-primary/20 gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Club Leader
              </Badge>
            )}
            {isClubMember && !isClubLeader && (
              <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Club Member
              </Badge>
            )}
            {!isClubParticipant && (
              <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                No club membership yet
              </Badge>
            )}
          </div>
        </motion.div>

        {/* ── Error ──────────────────────────────────────────────────── */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── Stats bar (leaders with clubs) ─────────────────────────── */}
        {isClubLeader && myClubs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              {
                label: "Total Members",
                value: myClubs.reduce((s, c) => s + c.memberCount, 0),
                colorText: "text-blue-500",
                colorBg: "bg-blue-500/10",
                icon: <Users className="h-5 w-5 text-blue-500" />,
              },
              {
                label: "Total Events",
                value: myClubs.reduce((s, c) => s + c.eventCount, 0),
                colorText: "text-purple-500",
                colorBg: "bg-purple-500/10",
                icon: <Calendar className="h-5 w-5 text-purple-500" />,
              },
              {
                label: "Followers",
                value: myClubs.reduce((s, c) => s + c.followerCount, 0),
                colorText: "text-green-500",
                colorBg: "bg-green-500/10",
                icon: <UserPlus className="h-5 w-5 text-green-500" />,
              },
              {
                label: "Clubs Led",
                value: myClubs.length,
                colorText: "text-orange-500",
                colorBg: "bg-orange-500/10",
                icon: <LayoutDashboard className="h-5 w-5 text-orange-500" />,
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <Card className="bg-card/50 backdrop-blur-lg border-white/10">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl", stat.colorBg)}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className={cn("text-2xl font-bold tabular-nums", stat.colorText)}>
                          {stat.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Club Cards ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">Your Clubs</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/clubs">Browse All Clubs</Link>
            </Button>
          </div>

          {myClubs.length === 0 && !error ? (
            <Card className="bg-card/50 backdrop-blur-lg border-white/10">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No clubs yet</h3>
                <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                  {isClubLeader
                    ? "You haven't created a club yet. Register one to get started."
                    : "You haven't joined any clubs yet. Browse clubs to find one to join."}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button asChild variant="outline">
                    <Link to="/clubs">Browse Clubs</Link>
                  </Button>
                  {isClubLeader && (
                    <Button asChild>
                      <Link to="/clubs/register">Register a Club</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {myClubs.map((club, i) => (
                <ClubCard key={club.slug} club={club} isLeader={isClubLeader} index={i} />
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Quick Actions for leaders ─────────────────────────────── */}
        {isClubLeader && myClubs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-10"
          >
            <h2 className="text-xl font-semibold mb-5">Quick Actions</h2>

            {myClubs.map((club) => (
              <div key={club.slug} className="mb-8 last:mb-0">
                {myClubs.length > 1 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={club.logoUrl} />
                      <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                        {club.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-muted-foreground">{club.name}</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    {
                      title: "Manage Members",
                      desc: "View, promote or remove club members",
                      icon: <Users className="h-5 w-5" />,
                      to: `/dashboard/club/${club.slug}`,
                      color: "bg-blue-500/20 text-blue-500",
                    },
                    {
                      title: "Review Join Requests",
                      desc: "Approve or reject pending requests",
                      icon: <UserPlus className="h-5 w-5" />,
                      to: `/dashboard/club/${club.slug}`,
                      color: "bg-green-500/20 text-green-500",
                    },
                    {
                      title: "Create Event",
                      desc: "Organise a new event for your club",
                      icon: <Calendar className="h-5 w-5" />,
                      to: `/clubs/${club.slug}/events/create`,
                      color: "bg-purple-500/20 text-purple-500",
                    },
                  ].map((action) => (
                    <Link to={action.to} key={action.title}>
                      <Card className="bg-card/50 backdrop-blur-lg border-white/10 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer group h-full">
                        <CardContent className="pt-5">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "p-3 rounded-xl transition-transform group-hover:scale-110",
                                action.color
                              )}
                            >
                              {action.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold group-hover:text-primary transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">{action.desc}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
}

// ── ClubCard sub-component ────────────────────────────────────────────────
function ClubCard({
  club,
  isLeader,
  index,
}: {
  club: ClubDTO;
  isLeader: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.08 }}
    >
      <Card className="bg-card/50 backdrop-blur-lg border-white/10 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10 overflow-hidden h-full flex flex-col">
        {/* Colour accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/70 via-purple-500/50 to-blue-600/60" />

        <CardContent className="pt-5 space-y-4 flex-1 flex flex-col">
          {/* Identity */}
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0">
              <AvatarImage src={club.logoUrl} alt={club.name} />
              <AvatarFallback className="text-base font-bold bg-primary text-primary-foreground">
                {club.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-lg leading-tight truncate">{club.name}</h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium shrink-0",
                    CLUB_CATEGORY_COLORS[club.clubCategory]
                  )}
                >
                  {CLUB_CATEGORY_LABELS[club.clubCategory]}
                </Badge>
              </div>

              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  isLeader
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                )}
              >
                {isLeader ? (
                  <><Shield className="h-3 w-3 mr-1" />Leader</>
                ) : (
                  <><Users className="h-3 w-3 mr-1" />Member</>
                )}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{club.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/40 text-center">
            <div>
              <p className="text-base font-bold">{club.memberCount}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Users className="h-3 w-3" /> Members
              </p>
            </div>
            <div className="border-x border-border/40">
              <p className="text-base font-bold">{club.eventCount}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" /> Events
              </p>
            </div>
            <div>
              <p className="text-base font-bold">{club.followerCount}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <UserPlus className="h-3 w-3" /> Followers
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to={`/clubs/${club.slug}`}>
                View Club
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
            {isLeader && (
              <Button size="sm" className="flex-1" asChild>
                <Link to={`/dashboard/club/${club.slug}`}>
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Manage
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
