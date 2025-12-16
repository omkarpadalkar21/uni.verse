import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


const ROWS = 8;
const COLS = 12;
const SEAT_PRICE = 500;

export const SeatDemo: React.FC = () => {
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  
  // Simulate some booked seats
  const bookedSeats = new Set(['0-4', '0-5', '1-2', '2-8', '2-9', '4-4', '4-5', '4-6']);
  const vipSeats = new Set(['0-6', '0-7', '1-6', '1-7']);

  const toggleSeat = (row: number, col: number) => {
    const seatId = `${row}-${col}`;
    if (bookedSeats.has(seatId)) return;
    
    const newSelected = new Set(selectedSeats);
    if (newSelected.has(seatId)) {
      newSelected.delete(seatId);
    } else {
      newSelected.add(seatId);
    }
    setSelectedSeats(newSelected);
  };

  return (
    <section className="py-20 bg-background/50 backdrop-blur-sm border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
             {/* Left Text */}
             <div className="space-y-6">
                 <h2 className="text-3xl md:text-5xl font-bold font-sans">
                     Experience <span className="text-primary">Real-Time</span> Booking
                 </h2>
                 <p className="text-lg text-muted-foreground">
                     Our interactive seat map lets students choose their perfect spot. With WebSocket integration, seat availability updates instantly across everyone's devices.
                 </p>
                 
                 <div className="flex gap-4 text-sm mt-8">
                     <div className="flex items-center gap-2">
                         <div className="w-4 h-4 rounded-full bg-secondary border border-white/10" />
                         <span>Available</span>
                     </div>
                     <div className="flex items-center gap-2">
                         <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_rgba(116,57,255,0.5)]" />
                         <span>Selected</span>
                     </div>
                     <div className="flex items-center gap-2">
                         <div className="w-4 h-4 rounded-full bg-white/10" />
                         <span>Booked</span>
                     </div>
                     <div className="flex items-center gap-2">
                         <div className="w-4 h-4 rounded-full bg-yellow-400" />
                         <span>VIP</span>
                     </div>
                 </div>

                 <div className="p-6 rounded-xl bg-card border border-primary/20 mt-8">
                     <div className="flex justify-between items-center mb-4">
                         <span className="text-muted-foreground">Selected Seats</span>
                         <span className="font-mono text-xl">{selectedSeats.size}</span>
                     </div>
                     <div className="flex justify-between items-center mb-6">
                         <span className="text-muted-foreground">Total Price</span>
                         <span className="font-mono text-2xl font-bold text-primary">
                             ₹{selectedSeats.size * SEAT_PRICE}
                         </span>
                     </div>
                     <Button className="w-full glow" disabled={selectedSeats.size === 0}>
                         Book Now (Demo)
                     </Button>
                 </div>
             </div>

             {/* Right Demo Area */}
             <div className="relative p-8 rounded-2xl bg-black/40 border border-white/10 shadow-2xl overflow-hidden group">
                 {/* Stage */}
                 <div className="w-3/4 h-16 bg-gradient-to-b from-primary/20 to-transparent mx-auto mb-12 rounded-full blur-xl absolute top-0 left-1/2 -translate-x-1/2" />
                 <div className="text-center text-xs text-muted-foreground mb-8 tracking-[0.3em] uppercase opacity-50">Stage</div>

                 <div className="grid gap-2 justify-center" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
                     {Array.from({ length: ROWS }).map((_, row) => (
                         Array.from({ length: COLS }).map((_, col) => {
                             const seatId = `${row}-${col}`;
                             const isBooked = bookedSeats.has(seatId);
                             const isSelected = selectedSeats.has(seatId);
                             const isVip = vipSeats.has(seatId);

                             return (
                                 <motion.button
                                    key={seatId}
                                    whileHover={!isBooked ? { scale: 1.2 } : {}}
                                    whileTap={!isBooked ? { scale: 0.9 } : {}}
                                    onClick={() => toggleSeat(row, col)}
                                    disabled={isBooked}
                                    className={cn(
                                        "w-5 h-5 sm:w-6 sm:h-6 rounded-t-lg text-[0px] transition-all duration-200 relative",
                                        isBooked ? "bg-white/5 cursor-not-allowed" : "bg-secondary hover:bg-white/20 cursor-pointer",
                                        isSelected && "bg-primary shadow-[0_0_15px_rgba(116,57,255,0.6)] z-10",
                                        isVip && !isSelected && !isBooked && "bg-yellow-400/80 shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                                    )}
                                 >
                                    Seat {seatId}
                                    {/* Tooltip on hover */}
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                        ₹{isVip ? SEAT_PRICE + 200 : SEAT_PRICE}
                                    </span>
                                 </motion.button>
                             );
                         })
                     ))}
                 </div>
                 
                 {/* Floating Instruction */}
                 <div className="absolute top-4 right-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium border border-primary/20 animate-pulse">
                     Try clicking seats!
                 </div>
                 
                 <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
             </div>
        </div>
      </div>
    </section>
  );
};
