import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
        {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-background to-background" />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
           className="max-w-3xl mx-auto space-y-8"
        >
            <h2 className="text-4xl md:text-6xl font-bold font-sans tracking-tight">
                Ready to Launch Your <br />
                <span className="text-primary">Campus Events?</span>
            </h2>
            <p className="text-xl text-muted-foreground">
                Join thousands of clubs managing events across the galaxy. Start for free today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" className="glow h-14 px-8 text-lg w-full sm:w-auto" asChild>
                     <Link to="/auth/signup?role=student">
                        Sign Up as Student
                     </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto hover:bg-white/5" asChild>
                     <Link to="/auth/signup?role=organizer">
                        Register Your Club
                     </Link>
                </Button>
            </div>
            
            <p className="text-sm text-muted-foreground/60 pt-4">
                No credit card required · Free forever plan available
            </p>
        </motion.div>
      </div>

      {/* Decorative Rocket */}
      <motion.div
         animate={{ 
             x: [0, 1000], 
             y: [0, -500],
             scale: [1, 0.5]
         }}
         transition={{ 
             duration: 15, 
             repeat: Infinity, 
             ease: "linear",
             delay: 2
         }}
         className="absolute bottom-0 left-0 text-primary opacity-20 rotate-45 pointer-events-none"
      >
          <Rocket size={120} />
      </motion.div>
    </section>
  );
};
