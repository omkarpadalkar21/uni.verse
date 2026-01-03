import { Search, Grid, List, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import type { FilterState } from "@/utils/eventFilters";

interface EventsTopBarProps {
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  onMobileMenuClick: () => void;

}

export function EventsTopBar({
  view,
  setView,
  filters,
  setFilters,
  onMobileMenuClick,

}: EventsTopBarProps) {
  const activeFilterCount =
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.dateFilter !== "all" ? 1 : 0) +
    (filters.clubId ? 1 : 0);

  return (
    <div className="flex flex-col gap-4 pb-4 sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 px-4 border-b">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Menu & Search */}
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
            {activeFilterCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events by name, club, or venue..."
              className="pl-9 h-10 w-full bg-muted/50 border-muted-foreground/20 focus-visible:bg-background transition-colors"
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters({ ...filters, searchQuery: e.target.value })
              }
            />
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
            <Select defaultValue="upcoming">
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="recently_added">Recently Added</SelectItem>
                <SelectItem value="closing_soon">Closing Soon</SelectItem>
            </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1" />

            <ToggleGroup type="single" value={view} onValueChange={(v: string) => v && setView(v as "grid" | "list")}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
                <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
                <List className="h-4 w-4" />
            </ToggleGroupItem>
            </ToggleGroup>
        </div>
        
        {/* Mobile Filter Trigger (redundant if Sidebar toggle handles it, but requested 'Filter badge showing active filter count (mobile only)') */}
        {/* We combined Sidebar Toggle and Filter access in one menu button for cleaner UX on mobile, or we could add a specific filter button.
            The prompt says "Sidebar toggle button (hamburger icon)" AND "Floating filter button (bottom-right)".
            So Top Bar just has Menu and Search.
        */}
      </div>
      
      {/* Mobile Sort & View Row (Only visible on small screens usually, or we keep it clean. 
          Prompt said: Top Navigation Bar... View toggle buttons... Sort dropdown
          We can stack them on mobile or hide them.
          "Stack filters vertically... 1 column grid... Floating filter button"
          Let's put View Toggle in a secondary row for mobile or just hide sort on mobile until meaningful.
      */}
      <div className="flex lg:hidden items-center justify-between gap-2 overflow-x-auto pb-1">
          <Select defaultValue="upcoming">
            <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
          
          <ToggleGroup type="single" value={view} onValueChange={(v: string) => v && setView(v as "grid" | "list")} size="sm">
            <ToggleGroupItem value="grid" className="h-8 w-8 p-0">
                <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" className="h-8 w-8 p-0">
                <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
      </div>
    </div>
  );
}
