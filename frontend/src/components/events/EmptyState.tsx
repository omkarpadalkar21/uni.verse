import { Button } from "@/components/ui/button";
import { CalendarSearch } from "lucide-react";

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-muted/50 p-6 rounded-full mb-6 ring-1 ring-border">
        <CalendarSearch className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No events found</h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        We couldn't find any events matching your current filters. Try adjusting your search or clearing filters.
      </p>
      <Button onClick={onReset} variant="outline" size="lg">
        Clear all filters
      </Button>
    </div>
  );
}
