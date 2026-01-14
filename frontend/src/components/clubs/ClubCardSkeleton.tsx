import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ClubCardSkeleton() {
  return (
    <Card className="overflow-hidden border-muted/40 h-full flex flex-col">
      {/* Banner Skeleton */}
      <div className="relative h-32 w-full">
        <Skeleton className="h-full w-full" />
        {/* Logo Skeleton */}
        <div className="absolute -bottom-6 left-4">
          <Skeleton className="h-14 w-14 rounded-full border-4 border-background" />
        </div>
      </div>

      <CardContent className="pt-10 pb-4 flex-1 space-y-3">
        {/* Name */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Description */}
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-4">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}
