import { useState, useMemo, useEffect } from "react";
import { EventsSidebar } from "./EventsSidebar";
import { EventsTopBar } from "./EventsTopBar";
import { EventCard } from "./EventCard";
import { EventCardList } from "./EventCardList";
import { EventCardSkeleton } from "./EventCardSkeleton";
import { EmptyState } from "./EmptyState";
import { DUMMY_EVENTS } from "@/constants/eventCategories";
import { filterEvents, type FilterState } from "@/utils/eventFilters";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
// Prompt says: "Main Layout Components: Collapsible Sidebar... Main Content Area... Top navigation bar..."
// It doesn't explicitly mention the main site Navbar.
// But usually pages have the main navbar. However, the design described ("Top Navigation Bar with search...") seems to replace or sit below the main navbar.
// Given "Page Structure: Main Layout Components... Sidebar... Main Content Area... Top navigation bar", this sounds like an internal layout.
// I'll assume the MAIN Navbar is part of the `src/pages/EventsPage.tsx` or `App.tsx` layout if it exists globally.
// Looking at `LandingPage.tsx`, let's see if it uses Navbar.
// `src/components/landing/Navbar` exists.
// I will include the main Navbar in `src/pages/EventsPage.tsx` wrapper, and THIS component will be the content below it.

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

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem("eventsViewMode");
    if (savedView === "grid" || savedView === "list") {
      setView(savedView);
    }
    // Simulate initial API load
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSetView = (newView: "grid" | "list") => {
    setView(newView);
    localStorage.setItem("eventsViewMode", newView);
  };

  const filteredEvents = useMemo(() => {
    return filterEvents(DUMMY_EVENTS, filters);
  }, [filters]);

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
