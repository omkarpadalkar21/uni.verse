import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Armchair, 
  Users, 
  Telescope, 
  CreditCard, 
  Radio, 
  BarChart3 
} from 'lucide-react';

const features = [
  {
    title: "Real-Time Seat Booking",
    description: "Lock seats with distributed locking. Zero double-bookings guaranteed. Detailed interactive maps.",
    icon: Armchair,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    title: "Club Management",
    description: "Register clubs, manage members, and organize events with role-based access control.",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Smart Discovery",
    description: "AI-powered recommendations based on interests and past attendance history.",
    icon: Telescope,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
  {
    title: "Secure Payments",
    description: "Razorpay integration for paid workshops, fests, and merchandise sales.",
    icon: CreditCard,
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  {
    title: "Live Updates",
    description: "WebSocket-powered real-time seat availability and instant notifications.",
    icon: Radio,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    title: "Analytics Dashboard",
    description: "Track engagement, revenue, and attendance stats for organizers.",
    icon: BarChart3,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-background relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">Everything You Need</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2 font-sans">
            Built for Campus <span className="text-primary">Communities</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
             Powerful tools to manage every aspect of your university events, from ticket sales to analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 group overflow-hidden">
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                  </CardDescription>
                </CardHeader>
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
