import { Navbar } from "@/components/landing/Navbar";
import { EventsPage as EventsPageContent } from "@/components/events/EventsPage";
import { Footer } from "@/components/landing/Footer";

export default function EventsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 pt-16">
         <EventsPageContent />
      </div>
      <Footer />
    </div>
  );
}
