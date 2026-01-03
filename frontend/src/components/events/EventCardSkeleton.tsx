import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden border-muted/40">
      <div className="aspect-video w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        
        <div className="space-y-2 pt-2">
           <Skeleton className="h-4 w-1/2" />
           <Skeleton className="h-4 w-2/3" />
        </div>
        
        <div className="space-y-2 pt-2">
            <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-1.5 w-full" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-3">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </CardFooter>
    </Card>
  );
}
