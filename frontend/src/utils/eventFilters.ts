import type { Event, EventCategory } from "../types/event";

export interface FilterState {
  searchQuery: string;
  categories: EventCategory[];
  dateFilter: "today" | "week" | "month" | "all" | "custom";
  customDateRange?: {
    from: Date;
    to: Date;
  };
  clubId?: number;
}

export const filterEvents = (events: Event[], filters: FilterState): Event[] => {
  return events.filter((event) => {
    // Search Query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTitle = event.title.toLowerCase().includes(query);
      const matchesDescription = event.description.toLowerCase().includes(query);
      const matchesClub = event.club.name.toLowerCase().includes(query);
      
      if (!matchesTitle && !matchesDescription && !matchesClub) return false;
    }

    // Categories
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(event.category as EventCategory)) return false;
    }

    // Date Filter
    if (filters.dateFilter !== "all") {
      const eventDate = new Date(event.startTime);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (filters.dateFilter === "today") {
        if (eventDate < today || eventDate >= tomorrow) return false;
      } else if (filters.dateFilter === "week") {
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        if (eventDate < today || eventDate >= nextWeek) return false;
      } else if (filters.dateFilter === "month") {
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        if (eventDate < today || eventDate >= nextMonth) return false;
      }
      
      // Handle custom date range if needed
      if (filters.dateFilter === "custom" && filters.customDateRange) {
         if (filters.customDateRange.from && eventDate < filters.customDateRange.from) return false;
         if (filters.customDateRange.to && eventDate > filters.customDateRange.to) return false;
      }
    }
    
    // Club Filter
    if (filters.clubId) {
        if (event.club.id !== filters.clubId) return false;
    }

    return true;
  });
};
