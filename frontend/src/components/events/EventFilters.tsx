import * as React from "react";
import { Search, Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

import type { FilterState } from "@/utils/eventFilters";
import { EVENT_CATEGORIES, DUMMY_EVENTS } from "@/constants/eventCategories";
import type { EventCategory } from "@/types/event";
import type { DateRange } from "react-day-picker";

interface EventFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  className?: string;
}

export function EventFilters({ filters, setFilters, className }: EventFiltersProps) {
  // Extract unique clubs from dummy data for the filter
  const clubs = React.useMemo(() => {
    const uniqueClubs = new Map();
    DUMMY_EVENTS.forEach((e) => {
      uniqueClubs.set(e.club.id, e.club);
    });
    return Array.from(uniqueClubs.values());
  }, []);

  const handleCategoryChange = (category: EventCategory) => {
    setFilters((prev) => {
      const current = prev.categories;
      if (current.includes(category)) {
        return { ...prev, categories: current.filter((c) => c !== category) };
      } else {
        return { ...prev, categories: [...current, category] };
      }
    });
  };

  const handleDateFilterChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      dateFilter: value as FilterState["dateFilter"],
      // Reset custom range if switching away from custom, optional
      customDateRange: value === "custom" ? prev.customDateRange : undefined, 
    }));
  };

  const [clubOpen, setClubOpen] = React.useState(false);
  const selectedClub = clubs.find((c) => c.id === filters.clubId);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search */}
      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-9"
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
          />
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-3">
        <Label>Categories</Label>
        <div className="space-y-2">
          {EVENT_CATEGORIES.map((category) => {
             // Calculate counts (naive implementation for dummy data)
             const count = DUMMY_EVENTS.filter(e => e.category === category).length;
             
             return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <label
                    htmlFor={`cat-${category}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.charAt(0) + category.slice(1).toLowerCase()}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Date Filter */}
      <div className="space-y-3">
        <Label>When</Label>
        <RadioGroup
          value={filters.dateFilter}
          onValueChange={handleDateFilterChange}
          className="space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="today" id="date-today" />
            <Label htmlFor="date-today" className="font-normal cursor-pointer">Today</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="week" id="date-week" />
            <Label htmlFor="date-week" className="font-normal cursor-pointer">This Week</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="month" id="date-month" />
            <Label htmlFor="date-month" className="font-normal cursor-pointer">This Month</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="date-custom" />
            <Label htmlFor="date-custom" className="font-normal cursor-pointer">Custom Range</Label>
          </div>
        </RadioGroup>

        {filters.dateFilter === "custom" && (
           <div className="pt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-9",
                    !filters.customDateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.customDateRange?.from ? (
                    filters.customDateRange.to ? (
                      <>
                        {format(filters.customDateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.customDateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.customDateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.customDateRange?.from}
                  selected={filters.customDateRange}
                  onSelect={(range: DateRange | undefined) =>
                    setFilters((prev) => ({
                        ...prev,
                        customDateRange: range ? { from: range.from!, to: range.to! } : undefined
                    }))
                  }
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
           </div>
        )}
      </div>

      <Separator />

      {/* Club Filter */}
      <div className="space-y-3">
        <Label>Club</Label>
        <Popover open={clubOpen} onOpenChange={setClubOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={clubOpen}
              className="w-full justify-between"
            >
              {selectedClub ? (
                 <div className="flex items-center gap-2 truncate">
                    <img src={selectedClub.logoUrl} className="w-4 h-4 rounded-full" alt="" />
                    <span className="truncate">{selectedClub.name}</span>
                 </div>
              ) : (
                "Select a club..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0">
            <Command>
              <CommandInput placeholder="Search clubs..." />
              <CommandList>
                <CommandEmpty>No club found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                        setFilters((prev) => ({ ...prev, clubId: undefined }));
                        setClubOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !filters.clubId ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Clubs
                  </CommandItem>
                  {clubs.map((club) => (
                    <CommandItem
                      key={club.id}
                      value={club.name}
                      onSelect={() => {
                        setFilters((prev) => ({
                            ...prev,
                            clubId: prev.clubId === club.id ? undefined : club.id
                        }));
                        setClubOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          filters.clubId === club.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2">
                        <img src={club.logoUrl} className="w-4 h-4 rounded-full" alt="" />
                        {club.name}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Actions */}
       <div className="pt-4 flex gap-2">
          <Button className="flex-1" onClick={() => {}}>Apply</Button> {/* Logic handled by React state immediately, but button was requested */}
          <Button variant="ghost" onClick={() => setFilters({ searchQuery: "", categories: [], dateFilter: "all" })} className="flex-1">Reset</Button>
       </div>
    </div>
  );
}
