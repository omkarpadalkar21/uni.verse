import { useMemo } from 'react';
import type { Seat } from '@/types/venue';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface InteractiveSeatMapProps {
  seats: Seat[];
  selectedSeatIds: number[];
  onSeatSelect: (seat: Seat) => void;
  maxSelection?: number;
}

export function InteractiveSeatMap({ seats, selectedSeatIds, onSeatSelect, maxSelection = 10 }: InteractiveSeatMapProps) {
  // Group seats by Section -> Row
  const sectionedSeats = useMemo(() => {
    const grouped: Record<string, Record<string, Seat[]>> = {};

    seats.forEach((seat) => {
      if (!grouped[seat.section]) {
        grouped[seat.section] = {};
      }
      if (!grouped[seat.section][seat.row]) {
        grouped[seat.section][seat.row] = [];
      }
      grouped[seat.section][seat.row].push(seat);
    });

    // Sort rows and seats
    Object.keys(grouped).forEach(section => {
      const rowsMap = grouped[section];
      Object.keys(rowsMap).forEach(row => {
        rowsMap[row].sort((a, b) => {
          const numA = parseInt(a.number) || 0;
          const numB = parseInt(b.number) || 0;
          return numA - numB;
        });
      });
    });

    return grouped;
  }, [seats]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return;

    if (!selectedSeatIds.includes(seat.id) && selectedSeatIds.length >= maxSelection) {
      // Could show a toast here in a full implementation
      console.warn(`Maximum ${maxSelection} seats can be selected`);
      return;
    }
    onSeatSelect(seat);
  };

  return (
    <div className="w-full space-y-12 pb-12 overflow-x-auto min-w-[600px] p-4">
      <div className="flex items-center justify-center gap-6 mb-8 mt-4 border rounded-full py-3 px-8 mx-auto w-max bg-background shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-t-lg rounded-b-sm bg-secondary border"></div>
          <span className="text-sm font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-t-lg rounded-b-sm bg-primary border-primary"></div>
          <span className="text-sm font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-t-lg rounded-b-sm bg-amber-500/80 border-amber-600"></div>
          <span className="text-sm font-medium">Locked (Hold)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-t-lg rounded-b-sm bg-muted border-muted-foreground/30 opacity-60"></div>
          <span className="text-sm font-medium">Booked</span>
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="w-full h-12 bg-gradient-to-b from-primary/20 flex items-center justify-center rounded-t-[100px] border-t-4 border-primary/40 mb-16 shadow-inner">
          <span className="text-lg font-semibold tracking-widest text-primary/80 uppercase">Stage</span>
        </div>

        {Object.entries(sectionedSeats).map(([sectionName, rows]) => (
          <div key={sectionName} className="mb-12 bg-card/40 p-6 rounded-2xl border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{sectionName}</h3>
              {Object.values(rows)[0]?.[0]?.price !== undefined && (
                <Badge variant="secondary">₹{Object.values(rows)[0]?.[0]?.price}</Badge>
              )}
            </div>

            <div className="space-y-4">
              {Object.entries(rows).map(([rowName, rowSeats]) => (
                <div key={rowName} className="flex items-center gap-4 justify-center">
                  <div className="w-8 text-right font-bold text-muted-foreground">{rowName}</div>
                  <div className="flex gap-2">
                    {rowSeats.map((seat) => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isAvailable = seat.status === 'AVAILABLE';
                      const isLocked = seat.status === 'LOCKED';
                      
                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          disabled={!isAvailable && !isSelected}
                          className={cn(
                            "w-8 h-8 rounded-t-lg rounded-b-sm transition-all relative group flex items-center justify-center text-xs font-medium border",
                            isAvailable && !isSelected && "bg-secondary hover:bg-secondary/80 hover:-translate-y-1 cursor-pointer border-border",
                            isSelected && "bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)] -translate-y-1",
                            isLocked && !isSelected && "bg-amber-500/80 border-amber-600 cursor-not-allowed",
                            seat.status === 'BOOKED' && "bg-muted border-muted-foreground/30 opacity-60 cursor-not-allowed"
                          )}
                          title={`${sectionName} Row ${rowName} Seat ${seat.number}${seat.price ? ` - ₹${seat.price}` : ''}`}
                        >
                          {isSelected ? '✓' : seat.number}
                        </button>
                      );
                    })}
                  </div>
                  <div className="w-8 text-left font-bold text-muted-foreground">{rowName}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
