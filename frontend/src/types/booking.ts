export interface LockResult {
  bookingId?: string;
  lockedSeats: number; // or an array of seat IDs
  expiresAt: string;
  totalAmount?: number;
  success: boolean;
  message?: string;
}

export interface BookingSeatDTO {
  id: number;
  status: string;
  // include other properties as defined by backend
}
