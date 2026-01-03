import { CATEGORY_COLORS as CAT_COLORS_CONST } from "@/constants/eventCategories";
import type { Event } from "@/types/event";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, MapPin, Heart } from "lucide-react";
import { cn } from "@/lib/utils";


interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.startTime);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const capacityPercentage = Math.min(
    (event.registeredCount / event.capacity) * 100,
    100
  );



  const statusText =
    capacityPercentage >= 100
      ? "Full"
      : capacityPercentage >= 80
      ? "Closing Soon"
      : "Open";

  const categoryColorClass = CAT_COLORS_CONST[event.category as keyof typeof CAT_COLORS_CONST] || "bg-gray-500/10 text-gray-500";

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-muted/40">
      {/* Banner Image */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm shadow-sm border-none font-medium">
               {event.capacity === 0 ? "Free" : "Free"} {/* Assuming free for now based on dummy data not having price */}
            </Badge>
        </div>
        
        <div className="absolute top-3 right-3">
             <Badge variant="outline" className={cn("backdrop-blur-md border-0 font-medium", categoryColorClass)}>
                {event.category}
             </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Club Info */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Avatar className="h-5 w-5">
            <AvatarImage src={event.club.logoUrl} alt={event.club.name} />
            <AvatarFallback>{event.club.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium truncate">{event.club.name}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 min-h-[3.5rem]">
          {event.title}
        </h3>

        {/* Date, Time, Location */}
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 min-w-[50%]">
                 <Calendar className="h-3.5 w-3.5" />
                 <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
                 <Clock className="h-3.5 w-3.5" />
                 <span>{formattedTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {event.registeredCount} / {event.capacity} registered
            </span>
             <span className={cn(
                "font-medium",
                statusText === "Full" ? "text-red-500" :
                statusText === "Closing Soon" ? "text-amber-500" : "text-green-500"
             )}>
                {statusText}
             </span>
          </div>
          <Progress value={capacityPercentage} className="h-1.5" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-3">
        <Button className="flex-1" variant="outline">
          View Details
        </Button>
        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50">
          <Heart className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
