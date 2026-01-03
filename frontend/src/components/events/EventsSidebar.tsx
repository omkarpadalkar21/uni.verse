import type { FilterState } from "@/utils/eventFilters";
import { EventFilters } from "./EventFilters";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Filter, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

import type { Dispatch, SetStateAction } from "react";

interface EventsSidebarProps {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function EventsSidebar({
  filters,
  setFilters,
  isOpen,
  setIsOpen,
  mobileOpen,
  setMobileOpen,
}: EventsSidebarProps) {
  
  // Desktop Sidebar Content
  const SidebarContent = () => (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between py-2">
        <h2 className="text-lg font-semibold tracking-tight">Filters</h2>
        {/* Toggle Button for Desktop - Inside the sidebar to close */}
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="lg:flex hidden h-8 w-8">
            <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 -mx-4 px-4">
        <EventFilters filters={filters} setFilters={setFilters} />
        <div className="h-20" /> {/* Bottom padding */}
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden lg:block h-[calc(100vh-4rem)] sticky top-16 border-r bg-background/50 backdrop-blur-xl z-20 shrink-0 overflow-hidden"
          >
            <div className="w-[280px] h-full p-6">
               <SidebarContent />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Toggle Button (when closed) */}
      {!isOpen && (
         <div className="hidden lg:block fixed left-4 top-24 z-20">
            <Button
                variant="outline"
                size="icon"
                className="bg-background shadow-md"
                onClick={() => setIsOpen(true)}
            >
                <PanelLeftOpen className="h-4 w-4" />
            </Button>
         </div>
      )}

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-6">
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>Filter Events</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto pb-20 no-scrollbar">
             <EventFilters filters={filters} setFilters={setFilters} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Floating Filter Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-xl"
            onClick={() => setMobileOpen(true)}
        >
            <Filter className="h-6 w-6" />
            <span className="sr-only">Open Filters</span>
             {(filters.categories.length > 0 || filters.dateFilter !== "all" || filters.clubId) && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 border-2 border-background" />
             )}
        </Button>
      </div>
    </>
  );
}
