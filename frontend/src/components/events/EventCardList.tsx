import type { Event } from "@/types/event";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Heart, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS as CAT_COLORS_CONST } from "@/constants/eventCategories";

interface EventCardListProps {
  event: Event;
}

export function EventCardList({ event }: EventCardListProps) {
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

   const categoryColorClass = CAT_COLORS_CONST[event.category as keyof typeof CAT_COLORS_CONST] || "bg-gray-500/10 text-gray-500";

  return (
    <Card className="group flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-all duration-300 border-muted/40">
      {/* Image */}
      <div className="relative w-full sm:w-[200px] aspect-video sm:aspect-auto shrink-0 overflow-hidden">
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 sm:hidden">
            <Badge variant="outline" className={cn("backdrop-blur-md border-0 text-xs font-medium", categoryColorClass)}>
                {event.category}
             </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col sm:flex-row gap-4 p-4">
        <div className="flex-1 min-w-0 space-y-2">
           <div className="hidden sm:flex items-center gap-2 mb-1">
             <Badge variant="outline" className={cn("border-0 text-xs font-medium px-2 py-0.5", categoryColorClass)}>
                {event.category}
             </Badge>
             <span className="text-xs text-muted-foreground">•</span>
             <span className="text-xs text-muted-foreground font-medium">{event.club.name}</span>
           </div>

          <h3 className="font-semibold text-lg leading-tight truncate px-1 -mx-1">
            {event.title}
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-[150px]">{event.venue}</span>
            </div>
          </div>
          
           <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
              <Users className="h-3.5 w-3.5" />
              <span>{event.registeredCount} / {event.capacity} registered</span>
           </div>
        </div>

        {/* Actions - Right side on desktop, bottom on mobile */}
        <div className="flex sm:flex-col items-center sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0 sm:min-w-[140px]">
           <Button className="flex-1 w-full" size="sm">
            View Details
           </Button>
           <Button variant="outline" size="sm" className="w-full shrink-0">
             <Heart className="h-4 w-4 mr-2" /> Save
           </Button>
        </div>
      </div>
    </Card>
  );
}
