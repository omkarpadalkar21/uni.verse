import { useState, useEffect } from "react";
import { EventsSidebar } from "./EventsSidebar";
import { EventsTopBar } from "./EventsTopBar";
import { EventCard } from "./EventCard";
import { EventCardList } from "./EventCardList";
import { EventCardSkeleton } from "./EventCardSkeleton";
import { EmptyState } from "./EmptyState";
import { eventApi } from "@/lib/api";
import type { EventResponse } from "@/types/event";
import type { FilterState } from "@/utils/eventFilters";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function EventsPage() {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    categories: [],
    dateFilter: "all",
    clubId: undefined,
  });

  const [view, setView] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [events, setEvents] = useState<EventResponse[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventResponse[]>([]);

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem("eventsViewMode");
    if (savedView === "grid" || savedView === "list") {
      setView(savedView);
    }
  }, []);

  const handleSetView = (newView: "grid" | "list") => {
    setView(newView);
    localStorage.setItem("eventsViewMode", newView);
  };

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Build base params. Backend requires dateTime.
        // If the dateFilter is 'upcoming', 'all' etc, we pass different dateTime.
        // For now, let's just pass current date as baseline for 'upcoming' or 'all', 
        // depending on what dateFilter is mapping to, but since dateFilter logic 
        // was in filterEvents locally before, we can just fetch upcoming events 
        // (dateTime=now) and filter locally for search queries etc if backend doesn't support them.
        
        let dateTimeStr = new Date().toISOString();
        if (filters.dateFilter === "week") {
          const d = new Date();
          d.setDate(d.getDate() - d.getDay()); // Start of week
          dateTimeStr = d.toISOString();
        } else if (filters.dateFilter === "month") {
          const d = new Date();
          d.setDate(1); // Start of month
          dateTimeStr = d.toISOString();
        }

        const res = await eventApi.getEvents({
          clubId: filters.clubId?.toString(),
          category: filters.categories.length === 1 ? (filters.categories[0] as any) : undefined,
          dateTime: dateTimeStr,
          offset: 0,
          pageSize: 50,
        });

        const fetchedEvents = res.content || [];
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [filters.clubId, filters.categories, filters.dateFilter]);

  // Apply local filtering for things the backend doesn't handle natively
  useEffect(() => {
    let result = [...events];
    
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q) ||
        e.club.name.toLowerCase().includes(q)
      );
    }

    if (filters.categories.length > 1) {
       result = result.filter(e => filters.categories.includes(e.category));
    }

    setFilteredEvents(result);
  }, [events, filters.searchQuery, filters.categories, filters.dateFilter]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex bg-background min-h-screen">
      {/* Sidebar */}
      <EventsSidebar
        filters={filters}
        setFilters={setFilters}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <EventsTopBar
          view={view}
          setView={handleSetView}
          filters={filters}
          setFilters={setFilters}
          onMobileMenuClick={() => setMobileOpen(true)}

        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          {/* Header */}
          <div className="mb-6 space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Discover Events</h1>
            <p className="text-muted-foreground">
              Explore the latest workshops, seminars, and cultural fests happening around you.
            </p>
          </div>

          {isLoading ? (
            <div className={cn(
                "grid gap-6",
                view === "grid" 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1"
            )}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={view === "list" ? "max-w-4xl" : ""}>
                   <EventCardSkeleton />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              onReset={() =>
                setFilters({ searchQuery: "", categories: [], dateFilter: "all" })
              }
            />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
               className={cn(
                "grid gap-6",
                view === "grid" 
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                    : "grid-cols-1"
              )}
            >
              {filteredEvents.map((event) => (
                <motion.div key={event.id} variants={itemVariants} layout className={view === "list" ? "max-w-5xl" : ""}> 
                  {view === "grid" ? (
                    <EventCard event={event} />
                  ) : (
                    <EventCardList event={event} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
