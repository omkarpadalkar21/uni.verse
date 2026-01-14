import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClubDTO } from "@/types/club";
import { CLUB_CATEGORY_COLORS, CLUB_CATEGORY_LABELS } from "@/constants/clubCategories";

interface ClubCardProps {
  club: ClubDTO;
}

export function ClubCard({ club }: ClubCardProps) {
  const categoryColorClass = CLUB_CATEGORY_COLORS[club.clubCategory] || "bg-gray-500/10 text-gray-500";
  const categoryLabel = CLUB_CATEGORY_LABELS[club.clubCategory] || club.clubCategory;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 border-muted/40 h-full flex flex-col">
        {/* Banner/Logo Header */}
        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-blue-600/10">
          {club.bannerUrl ? (
            <img
              src={club.bannerUrl}
              alt={`${club.name} banner`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple-500/20 to-blue-600/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Logo Avatar */}
          <div className="absolute -bottom-6 left-4">
            <Avatar className="h-14 w-14 border-4 border-background shadow-lg">
              <AvatarImage src={club.logoUrl} alt={club.name} />
              <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                {club.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className={cn("backdrop-blur-md border-0 font-medium", categoryColorClass)}>
              {categoryLabel}
            </Badge>
          </div>
        </div>

        <CardContent className="pt-10 pb-4 flex-1 space-y-3">
          {/* Club Name */}
          <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {club.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {club.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{club.memberCount} members</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{club.eventCount} events</span>
            </div>
          </div>

          {/* Tags */}
          {club.tags && club.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {club.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {club.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{club.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 pb-4 px-4">
          <Button asChild variant="outline" className="w-full group/btn">
            <Link to={`/clubs/${club.slug}`}>
              View Club
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
