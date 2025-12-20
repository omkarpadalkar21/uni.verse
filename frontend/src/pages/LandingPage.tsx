import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { SeatDemo } from '@/components/landing/SeatDemo';

import { Testimonials } from '@/components/landing/Testimonials';
import { Stats } from '@/components/landing/Stats';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { StarField } from '@/components/animations/StarField';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/30">
      <StarField />
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <SeatDemo />

        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
