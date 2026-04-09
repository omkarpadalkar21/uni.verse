import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle, CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InteractiveSeatMap } from '@/components/venue/InteractiveSeatMap';
import { bookingApi } from '@/lib/api';
import type { Seat } from '@/types/venue';
import { Clock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function EventSeatSelectionPage() {
  const { id } = useParams<{ id: string }>();     // eventId
  const navigate = useNavigate();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  // bookingId comes from the /bookings/lock response — used for confirm
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [lockExpiresAt, setLockExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll seat availability every 10 s (only when no active hold)
  useEffect(() => {
    if (!id || bookingId) return;
    fetchSeats();
    const interval = setInterval(fetchSeats, 10_000);
    return () => clearInterval(interval);
  }, [id, bookingId]);

  // Countdown timer for the locked hold
  useEffect(() => {
    if (!lockExpiresAt || bookingConfirmed) return;
    const interval = setInterval(() => {
      const distance = lockExpiresAt.getTime() - Date.now();
      if (distance <= 0) {
        clearInterval(interval);
        setTimeRemaining('EXPIRED');
        setBookingId(null);
        setSelectedSeats([]);
        setError('Seat hold expired. Please select again.');
        fetchSeats();
        return;
      }
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockExpiresAt, bookingConfirmed]);

  const fetchSeats = async () => {
    if (!id) return;
    try {
      const response = await bookingApi.getEventSeats(id);
      setSeats(response.seats);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch seats', err);
      setError('Could not establish connection to the venue seat map.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seat: Seat) => {
    if (bookingId) return; // Can't change selection while hold is active
    setSelectedSeats((prev) => {
      const already = prev.some((s) => s.id === seat.id);
      return already ? prev.filter((s) => s.id !== seat.id) : [seat]; // single-seat flow
    });
  };

  // POST /api/bookings/lock  — passes eventId + seatIds[]
  const handleHoldSeat = async () => {
    if (selectedSeats.length === 0 || !id) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await bookingApi.lockSeats({
        eventId: id,
        seatIds: [selectedSeats[0].id],
      });
      setBookingId(result.bookingId);
      setLockExpiresAt(new Date(result.expiresAt));
      await fetchSeats();
    } catch (err: any) {
      console.error('Lock seat error:', err);
      setError(
        err?.response?.data?.message ||
          "Seat couldn't be locked. It might have just been taken.",
      );
      setSelectedSeats([]);
      await fetchSeats();
    } finally {
      setIsProcessing(false);
    }
  };

  // POST /api/bookings/{bookingId}/confirm
  const handleConfirmBooking = async () => {
    if (!bookingId) return;
    setIsProcessing(true);
    try {
      await bookingApi.confirmBooking(bookingId);
      setBookingConfirmed(true);
      setLockExpiresAt(null);
    } catch (err: any) {
      console.error('Confirm error:', err);
      setError('Booking confirmation failed. Your hold might have expired.');
    } finally {
      setIsProcessing(false);
    }
  };

  // No spec endpoint for releasing — clear state + refresh
  const cancelHold = () => {
    setBookingId(null);
    setLockExpiresAt(null);
    setSelectedSeats([]);
    fetchSeats();
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-8 text-center text-muted-foreground">Loading venue map...</div>
  );

  // ─── Booking confirmed ────────────────────────────────────────────────────
  const selectedSeat = selectedSeats[0];

  if (bookingConfirmed) return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <Card className="border-green-500/50">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-500/20 text-green-500 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          <CardDescription>Your seat has been successfully secured.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Section</p>
              <p className="font-bold">{selectedSeat?.section}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Row</p>
              <p className="font-bold">{selectedSeat?.row}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seat</p>
              <p className="font-bold">{selectedSeat?.number}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate('/my-registrations')}>
            View My Tickets
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const totalPrice = selectedSeat?.price ?? 0;

  // ─── Main layout ──────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">

      {/* Main Seat Map Area */}
      <div className="flex-1">
        <div>
          {/* Back to Event */}
          <Link to={`/events/${id}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Select Your Seat</h1>
          <p className="text-muted-foreground mb-8">
            Choose from the available seats. Locked seats are currently being held by others.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-card border rounded-3xl shadow-sm overflow-hidden">
            {seats.length > 0 ? (
              <InteractiveSeatMap
                seats={seats}
                selectedSeatIds={selectedSeats.map((s) => s.id)}
                onSeatSelect={handleSeatSelect}
                maxSelection={1}
              />
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                No seats available for this event.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Checkout / Hold Area */}
      <div className="w-full lg:w-[350px]">
        <div className="sticky top-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Selection</CardTitle>
              <CardDescription>
                {bookingId
                  ? 'Complete checkout to secure your seat.'
                  : 'Select a seat to continue.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {selectedSeats.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <div className="font-semibold text-lg">
                        {selectedSeat.section} - Row {selectedSeat.row}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Seat {selectedSeat.number}
                      </div>
                    </div>
                    {selectedSeat.price !== undefined && (
                      <div className="font-bold text-xl">₹{selectedSeat.price}</div>
                    )}
                  </div>

                  {totalPrice > 0 && (
                    <div className="flex justify-between items-center font-bold text-lg pt-2">
                      <span>Total</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No seat selected
                </div>
              )}

              {/* Active hold timer */}
              {bookingId && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-lg flex items-center gap-3">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider">Seat Held</div>
                    <div className="font-mono text-xl">{timeRemaining}</div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              {!bookingId ? (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedSeats.length === 0 || isProcessing}
                  onClick={handleHoldSeat}
                >
                  {isProcessing ? 'Locking...' : 'Hold & Proceed'}
                </Button>
              ) : (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleConfirmBooking}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? 'Processing...'
                      : `Confirm Booking${totalPrice > 0 ? ` · ₹${totalPrice}` : ''}`}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={cancelHold}
                    disabled={isProcessing}
                  >
                    Cancel Selection
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}