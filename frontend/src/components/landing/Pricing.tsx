import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: "Starter Orbit",
    price: "0",
    description: "Perfect for new clubs just getting started.",
    features: [
      "Up to 5 events/month",
      "100 bookings total",
      "Basic analytics",
      "Community support",
      "Standard ticket types"
    ],
    limitations: [
      "No custom branding",
      "No API access",
      "No priority support"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Galaxy Explorer",
    price: "999",
    description: "For growing clubs that need more power.",
    features: [
      "Unlimited events",
      "Unlimited bookings",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "Email campaigns",
      "Waitlists"
    ],
    limitations: [],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Cosmic Command",
    price: "Custom",
    description: "Enterprise-grade control for universities.",
    features: [
      "Everything in Explorer",
      "Multi-campus management",
      "API access",
      "Dedicated account manager",
      "SLA guarantee",
      "SSO integration"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false
  }
];

export const Pricing: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <section id="pricing" className="py-20 relative">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-sans mb-4">Choose Your Plan</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                        Flexible pricing for clubs of all sizes. No hidden fees.
                    </p>
                    
                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-primary' : 'text-muted-foreground'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-14 h-7 bg-secondary rounded-full relative transition-colors duration-300 border border-primary/20"
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-primary rounded-full transition-all duration-300 ${billingCycle === 'monthly' ? 'left-1' : 'left-8'}`} />
                        </button>
                        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-primary' : 'text-muted-foreground'}`}>
                            Yearly <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full ml-1">Save 20%</span>
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                                    <Badge className="bg-gradient-to-r from-primary to-purple-400 border-none px-4 py-1 text-white shadow-lg">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}
                            
                            <Card className={`h-full relative overflow-hidden transition-all duration-300 ${plan.popular ? 'border-primary shadow-[0_0_30px_rgba(116,57,255,0.15)] scale-105 z-10 bg-card/60 backdrop-blur-xl' : 'bg-card/40 hover:bg-card/60 border-white/10 hover:border-primary/30'}`}>
                                <CardHeader>
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-4xl font-bold font-mono">
                                            {plan.price === "Custom" ? "Custom" : `₹${billingCycle === 'yearly' ? parseInt(plan.price) * 10 : plan.price}`}
                                        </span>
                                        {plan.price !== "Custom" && <span className="text-muted-foreground ml-2">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>}
                                    </div>
                                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        {plan.limitations.map((limitation, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground/50">
                                                <X size={16} className="mt-0.5 shrink-0" />
                                                <span>{limitation}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button className={`w-full ${plan.popular ? 'glow' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                                        {plan.cta}
                                    </Button>
                                </CardFooter>
                                
                                {plan.popular && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
