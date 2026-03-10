import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { eventApi, isAuthenticated } from "@/lib/api";
import { EventRegistrationButton } from "@/components/events/EventRegistrationButton";
import type { EventResponse } from "@/types/event";

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


  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 pb-20">
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-5xl">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="link" asChild className="mb-6 p-0 text-muted-foreground hover:text-foreground">
            <Link to="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-10 lg:gap-14">
          {/* Left Column (Image & Host) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full md:w-[38%] flex flex-col gap-6"
          >
            {/* Poster Image */}
            <div className="rounded-xl overflow-hidden aspect-square border shadow-sm bg-muted/20">
              {event.bannerUrl ? (
                <img
                  src={event.bannerUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/10 to-blue-600/10 flex items-center justify-center text-muted-foreground p-6 text-center">
                   {event.title}
                </div>
              )}
            </div>

            {/* Host Info */}
            <div className="pt-2 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-wide">Hosted By</h3>
              
              <Link to={`/clubs/${event.club.slug}`} className="flex items-center gap-3 w-fit group">
                <Avatar className="h-8 w-8 ring-1 ring-border group-hover:ring-primary/50 transition-all">
                  <AvatarImage src={event.club.logoUrl} />
                  <AvatarFallback className="bg-yellow-100 text-yellow-800 text-xs font-bold">{event.club.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-[15px] group-hover:text-primary transition-colors">{event.club.name}</span>
              </Link>
              
              <div className="flex flex-col gap-2 pt-2 items-start">
                 <Button variant="link" className="p-0 h-auto text-[13px] text-muted-foreground hover:text-foreground">Contact the Host</Button>
                 <Button variant="link" className="p-0 h-auto text-[13px] text-muted-foreground hover:text-foreground">Report Event</Button>
              </div>

              {event.tags && event.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-muted/30">
                  {event.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="rounded-full px-3 py-1 font-normal text-[13px] text-muted-foreground border-muted-foreground/30 hover:bg-muted/50">
                      # {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="pt-4 border-t border-muted/30">
                  <Badge variant="outline" className="rounded-full px-3 py-1 font-normal text-[13px] text-muted-foreground border-muted-foreground/30 hover:bg-muted/50">
                      # {event.category}
                  </Badge>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column (Details) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full md:w-[62%] flex flex-col gap-8"
          >
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted/80 border-none font-medium px-2.5 py-1 mb-2 tracking-wide">
                <span className="text-yellow-500 mr-1.5">★</span> Featured in {event.venue?.location || "Bengaluru"} <ExternalLink className="h-3 w-3 ml-1.5 opacity-50 inline" />
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold leading-[1.15] tracking-tight text-foreground/90">{event.title}</h1>
            </div>

            <div className="flex flex-col gap-5 mt-2">
              {/* Date Box */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center w-[3.5rem] h-[3.75rem] rounded-xl border bg-card/60 shadow-sm shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-lg font-bold leading-none mt-0.5">{new Date(event.startTime).toLocaleDateString('en-US', { day: 'numeric' })}</span>
                </div>
                <div className="flex flex-col justify-center min-h-[3.75rem] space-y-1">
                  <p className="font-semibold text-base leading-none">
                    {new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'long' })} {new Date(event.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                  </p>
                  <p className="text-[14px] text-muted-foreground font-medium">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </p>
                </div>
              </div>

              {/* Location Box */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center w-[3.5rem] h-[3.5rem] rounded-xl border bg-card/60 shadow-sm shrink-0">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col justify-center min-h-[3.5rem] space-y-1">
                  <p className="font-semibold text-base leading-none flex items-center gap-1.5">
                    {event.venue?.name || "TBA"} <ExternalLink className="h-3 w-3 text-muted-foreground opacity-50" />
                  </p>
                  <p className="text-[14px] text-muted-foreground font-medium">{event.venue?.location || ""}</p>
                </div>
              </div>
            </div>

            {/* Registration Card Match */}
            <div className="mt-2 rounded-xl border border-border/60 bg-muted/20 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-border/60 bg-muted/40 backdrop-blur-sm">
                <p className="text-[13px] font-semibold tracking-wide text-muted-foreground">Registration</p>
              </div>
              <div className="p-5 flex flex-col gap-3">
                 {availableSeats === 0 || capacityPercentage >= 100 ? (
                    <>
                       <div className="flex items-center gap-3 text-foreground pt-1">
                          <div className="rounded-full bg-muted p-1 border">
                             <div className="w-3 h-1 bg-foreground rounded-full" />
                          </div>
                          <h3 className="text-lg font-semibold tracking-tight">Registration Closed</h3>
                       </div>
                       <p className="text-[15px] text-muted-foreground leading-relaxed">
                          This event is not currently taking registrations. You may contact the host or subscribe to receive updates.
                       </p>
                    </>
                 ) : (
                    <>
                       <div className="flex items-center justify-between mb-2">
                           <div className="space-y-1.5">
                              <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                Registration Open
                              </h3>
                              <p className="text-[14px] text-muted-foreground font-medium">{availableSeats} spots left</p>
                           </div>
                           {event.isPaid && <span className="font-bold text-lg">₹{event.basePrice}</span>}
                       </div>
                       {!isAuthenticated() ? (
                          <Button asChild className="w-full mt-2" size="lg">
                              <Link to="/auth/signin">Sign in to Register</Link>
                          </Button>
                       ) : (
                          <div className="mt-2 text-foreground">
                            <EventRegistrationButton
                                slug={event.club.slug}
                                eventId={event.id}
                                registrationMode={event.registrationMode}
                                isRegistered={event.isRegistered}
                                isFull={availableSeats === 0}
                                onSuccess={() => fetchEvent()}
                            />
                          </div>
                      )}
                    </>
                 )}
              </div>
            </div>

            {/* About Event */}
            <div className="mt-4 space-y-4">
              <h3 className="font-semibold text-[15px] tracking-wide text-muted-foreground">About Event</h3>
              <div className="text-[15.5px] text-foreground/90 whitespace-pre-wrap leading-[1.7]">
                 {event.description}
              </div>
            </div>
            
            {/* View Seats Link if venue is set and not online */}
            {event.venue && event.type !== 'ONLINE' && (
               <div className="mt-2 border-t border-muted/30 pt-6">
                  <h3 className="font-semibold text-[15px] tracking-wide text-muted-foreground mb-4">Venue Actions</h3>
                  <Button asChild variant="outline" className="w-full lg:w-fit font-semibold shadow-sm text-primary group">
                    <Link to={`/events/${event.id}/seats`}>View Interactive Venue Map <ArrowLeft className="h-4 w-4 ml-2 rotate-180 transition-transform group-hover:translate-x-1" /></Link>
                  </Button>
               </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
