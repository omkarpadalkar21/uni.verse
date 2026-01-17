import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { eventApi, isAuthenticated } from "@/lib/api";
import { EventRegistrationButton } from "@/components/events/EventRegistrationButton";
import type { EventResponse } from "@/types/event";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  WORKSHOP: "bg-purple-500/10 text-purple-500",
  SEMINAR: "bg-yellow-500/10 text-yellow-500",
  COMPETITION: "bg-green-500/10 text-green-500",
  FEST: "bg-red-500/10 text-red-500",
  MEETUP: "bg-blue-500/10 text-blue-500",
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventApi.getEventById(id);
      setEvent(data);
    } catch (err) {
      console.error("Failed to fetch event:", err);
      setError("Event not found or failed to load.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-64 w-full rounded-xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  const capacityPercentage = event.capacity > 0
    ? Math.min((event.registrationCount / event.capacity) * 100, 100)
    : 0;
  const availableSeats = Math.max(0, event.capacity - event.registrationCount);
  const categoryColorClass = CATEGORY_COLORS[event.category] || "bg-gray-500/10 text-gray-500";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </motion.div>

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 md:h-72 rounded-xl overflow-hidden mb-8"
        >
          {event.bannerUrl ? (
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/30 via-purple-500/20 to-blue-600/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <Badge className={cn("font-medium", categoryColorClass)}>
              {event.category}
            </Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Title & Club */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3">{event.title}</h1>
              <Link
                to={`/clubs/${event.club.slug}`}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={event.club.logoUrl} />
                  <AvatarFallback>{event.club.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span>{event.club.name}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-semibold text-lg mb-3">About this Event</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="font-semibold text-lg mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
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
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Date & Time Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{formatDate(event.startTime)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </p>
                  </div>
                </div>

                {event.venue && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <MapPin className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">{event.venue.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.venue.location}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Registration Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Registration</span>
                  </div>
                  <Badge variant={availableSeats === 0 ? "destructive" : "secondary"}>
                    {availableSeats === 0 ? "Full" : `${availableSeats} spots left`}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {event.registrationCount} / {event.capacity} registered
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(capacityPercentage)}%
                    </span>
                  </div>
                  <Progress value={capacityPercentage} className="h-2" />
                </div>

                {event.isPaid && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">₹{event.basePrice}</span>
                  </div>
                )}

                {!isAuthenticated() ? (
                  <Button asChild className="w-full">
                    <Link to="/auth/signin">Sign in to Register</Link>
                  </Button>
                ) : (
                  <EventRegistrationButton
                    slug={event.club.slug}
                    eventId={event.id}
                    registrationMode={event.registrationMode}
                    isRegistered={event.isRegistered}
                    isFull={availableSeats === 0}
                    onSuccess={() => fetchEvent()}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
