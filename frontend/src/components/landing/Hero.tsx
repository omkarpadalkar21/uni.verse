import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FloatingPlanet } from '@/components/animations/FloatingPlanet';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Rocket, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <section 
      id="hero"
      ref={targetRef}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden" 
    >
      <div className="container mx-auto px-4 md:px-6 z-10 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div 
          style={{ opacity, scale, y }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-semibold mb-6 tracking-wide">
              🚀 Your Campus Event Universe
            </span>
            <h1 className="text-5xl md:text-7xl font-bold font-sans tracking-tight leading-[1.1]">
              Discover Events <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-primary">
                Across Your
              </span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Campus Universe
              </span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-lg">
              Real-time seat booking, club management, and seamless payments for university events. Launch your next event in seconds.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" className="glow text-lg px-8 h-14 w-full sm:w-auto">
              Explore Events
              <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 w-full sm:w-auto" asChild>
                <Link to="/auth/signup?role=organizer">For Organizers</Link>
            </Button>
          </motion.div>

          {/* Stats Ticker */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex items-center gap-8 pt-4 border-t border-white/10"
          >
            {[
              { label: 'Events', value: '1000+' },
              { label: 'Clubs', value: '50+' },
              { label: 'Students', value: '5K+' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold font-mono text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Illustration */}
        <div className="relative h-[600px] hidden md:block perspective-origin-center">
             {/* Central Planet */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="relative w-96 h-96 rounded-full bg-gradient-to-br from-primary via-purple-800 to-blue-900 shadow-[0_0_100px_rgba(116,57,255,0.3)]"
                >
                    {/* Planet Texture Details */}
                    <div className="absolute inset-0 rounded-full opacity-50 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
                    <div className="absolute top-20 left-10 w-20 h-10 rounded-full bg-black/20 blur-xl" />
                    <div className="absolute bottom-20 right-20 w-32 h-12 rounded-full bg-purple-400/20 blur-md" />
                </motion.div>
             </div>

             {/* Orbiting Elements */}
             <FloatingPlanet 
                size={80} 
                color="#f472b6" 
                className="top-20 right-20" 
                delay={0}
                duration={6}
             />
             <FloatingPlanet 
                size={60} 
                color="#22d3ee" 
                className="bottom-40 left-10" 
                delay={2}
                duration={7}
             />

             {/* Floating Event Cards */}
             <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-40 -left-10 z-20"
             >
                <div className="bg-card/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl w-48">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <Calendar size={16} />
                        </div>
                        <div className="text-sm font-semibold">Hackathon 2025</div>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-3/4" />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                        <span>450 Registered</span>
                        <span className="text-green-400">Live</span>
                    </div>
                </div>
             </motion.div>
             
             <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
                className="absolute bottom-20 right-0 z-20"
             >
                <div className="bg-card/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-xl w-48">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                            <Users size={16} />
                        </div>
                        <div className="text-sm font-semibold">Live Concert</div>
                    </div>
                    <div className="flex -space-x-2">
                         {[1,2,3,4].map(i => (
                             <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border-2 border-card" />
                         ))}
                    </div>
                     <div className="mt-2 text-xs text-muted-foreground">
                        Ticket Sales Closing Soon
                    </div>
                </div>
             </motion.div>

             {/* Decorative Stars */}
             <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
                 {[...Array(5)].map((_, i) => (
                     <div 
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`
                        }}
                     />
                 ))}
             </div>
        </div>
      </div>
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>
    </section>
  );
};
