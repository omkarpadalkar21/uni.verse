// Request to lock seats for an event
export interface LockSeatsRequest {
  eventId: string;
  seatIds: number[];
}

// Response from POST /api/bookings/lock
export interface LockSeatsResponse {
  bookingId: string;
  lockedSeats: LockedSeatInfo[];
  expiresAt: string;       // ISO date string
  totalAmount: number;
}

export interface LockedSeatInfo {
  id: number;
  section: string;
  row: string;
  number: string;
  price?: number;
}

// Response from POST /api/bookings/{id}/confirm
export interface BookingSeatDTO {
  id: string;
  eventId: string;
  seatId: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  totalAmount: number;
  section?: string;
  row?: string;
  number?: string;
}