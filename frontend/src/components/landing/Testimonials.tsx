import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // We'll implement this simple wrapper
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Tech Club President",
    org: "IIT Bombay",
    quote: "UniVerse transformed how we manage our 50+ annual events. The seat booking system is a game changer.",
    avatar: "PS"
  },
  {
    name: "Rahul Verma",
    role: "Cultural Secretary",
    org: "BITS Pilani",
    quote: "Finally, a platform that understands student festivals. We simply love the UI and the analytics.",
    avatar: "RV"
  },
  {
    name: "Ananya Gupta",
    role: "Event Lead",
    org: "Delhi University",
    quote: "Setup was instant. We sold out our workshop in 10 minutes thanks to the smooth payment flow.",
    avatar: "AG"
  },
  {
    name: "Vikram Singh",
    role: "GDSC Lead",
    org: "NIT Trichy",
    quote: "The best part is the real-time updates. No more confusion about seat types or availability.",
    avatar: "VS"
  },
  {
    name: "Neha Patel",
    role: "Organizer",
    org: "SRM University",
    quote: "Support is top-notch and the platform is incredibly stable even during high traffic registrations.",
    avatar: "NP"
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 overflow-hidden bg-background">
      <div className="container mx-auto px-4 mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-sans">Trusted by Campuses</h2>
      </div>
      
      {/* Infinite Scroll Container */}
      <div className="relative w-full overflow-hidden mask-gradient-x"> {/* mask-gradient-x to fade edges */}
          <div className="flex gap-6 animate-scroll w-max hover:paused">
              {[...testimonials, ...testimonials].map((t, i) => (
                  <Card key={i} className="w-[350px] md:w-[400px] bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/30 transition-colors shrink-0">
                      <CardContent className="p-6">
                          <div className="flex gap-1 mb-4">
                              {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />
                              ))}
                          </div>
                          <p className="text-lg mb-6 leading-relaxed">"{t.quote}"</p>
                          <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.avatar}`} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-400 text-white font-bold text-sm">{t.avatar}</AvatarFallback>
                              </Avatar>
                              <div>
                                  <div className="font-bold">{t.name}</div>
                                  <div className="text-xs text-muted-foreground">{t.role}, {t.org}</div>
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              ))}
          </div>
      </div>
      
      {/* CSS for infinite scroll */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .paused {
            animation-play-state: paused;
        }
        .mask-gradient-x {
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </section>
  );
};
