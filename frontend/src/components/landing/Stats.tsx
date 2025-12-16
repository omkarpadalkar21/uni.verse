import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Globe, Server, Headset } from 'lucide-react';

const stats = [
  { label: "Total Bookings", value: "1M+", icon: Ticket, color: "text-purple-400" },
  { label: "Universities", value: "500+", icon: Globe, color: "text-blue-400" },
  { label: "Uptime", value: "99.9%", icon: Server, color: "text-green-400" },
  { label: "Support", value: "24/7", icon: Headset, color: "text-pink-400" },
];

export const Stats: React.FC = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-secondary/20" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(116,57,255,0.1),transparent)]" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, type: "spring" }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="flex justify-center mb-4">
                                <div className={`p-3 rounded-full bg-white/5 ${stat.color} ring-1 ring-white/10`}>
                                    <stat.icon size={32} />
                                </div>
                            </div>
                            <div className="text-4xl md:text-5xl font-mono font-bold mb-2 tracking-tight">
                                {stat.value}
                            </div>
                            <div className="text-muted-foreground font-medium uppercase text-sm tracking-wider">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
