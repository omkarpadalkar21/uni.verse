import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Map as MapIcon, 
  CreditCard, 
  QrCode, 
  Building2, 
  PenTool, 
  Users, 
  LineChart 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const studentSteps = [
  {
    title: "Browse & Filter",
    description: "Discover events by date, club, category, or location.",
    icon: Search,
  },
  {
    title: "Select Seats",
    description: "Interactive seat map with real-time availability.",
    icon: MapIcon,
  },
  {
    title: "Secure Payment",
    description: "Quick checkout with Razorpay integration.",
    icon: CreditCard,
  },
  {
    title: "Get QR Ticket",
    description: "Digital ticket delivered instantly to your dashboard.",
    icon: QrCode,
  },
];

const organizerSteps = [
  {
    title: "Register Club",
    description: "Submit club details for admin approval.",
    icon: Building2,
  },
  {
    title: "Create Events",
    description: "Rich text editor, image/video uploads, seat allocation.",
    icon: PenTool,
  },
  {
    title: "Manage Bookings",
    description: "QR check-ins, attendance tracking, cancellations.",
    icon: Users,
  },
  {
    title: "View Analytics",
    description: "Revenue, engagement, and demographic insights.",
    icon: LineChart,
  },
];

const TimelineCard = ({ step, index, align }: { step: any; index: number; align: 'left' | 'right' }) => (
    <motion.div
      initial={{ opacity: 0, x: align === 'left' ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.2 }}
      viewport={{ once: true }}
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl bg-card border border-white/5 backdrop-blur-sm hover:border-primary/30 transition-all duration-300",
        align === 'left' ? 'flex-row-reverse text-right' : 'flex-row'
      )}
    >
      <div className="flex-1">
        <h3 className="text-xl font-bold font-sans mb-1">{step.title}</h3>
        <p className="text-sm text-muted-foreground">{step.description}</p>
      </div>
      <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
        <step.icon size={20} />
      </div>
      
      {/* Connector Line Number */}
      <div className={cn(
          "absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center font-mono text-xs font-bold z-10",
          align === 'left' ? '-right-12' : '-left-12'
      )}>
          {index + 1}
      </div>
    </motion.div>
);

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
           <h2 className="text-3xl md:text-5xl font-bold font-sans mb-4">How it Works</h2>
           <p className="text-muted-foreground max-w-2xl mx-auto">
               A seamless experience for both students attending events and clubs organizing them.
           </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-24 relative">
             {/* Central Line */}
             <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent -translate-x-1/2 hidden md:block" />

             {/* Students Column */}
             <div className="space-y-12">
                 <div className="text-center md:text-right mb-8">
                     <h3 className="text-2xl font-bold text-accent">For Students</h3>
                 </div>
                 <div className="space-y-12 relative">
                     {studentSteps.map((step, i) => (
                         <TimelineCard key={i} step={step} index={i} align="left" />
                     ))}
                 </div>
             </div>

             {/* Organizers Column */}
             <div className="space-y-12">
                 <div className="text-center md:text-left mb-8">
                     <h3 className="text-2xl font-bold text-secondary-foreground">For Organizers</h3>
                 </div>
                 <div className="space-y-12 relative">
                     {organizerSteps.map((step, i) => (
                         <TimelineCard key={i} step={step} index={i} align="right" />
                     ))}
                 </div>
             </div>
        </div>
      </div>
    </section>
  );
};
