export interface Seat {
  id: number;
  section: string;
  row: string;
  number: string;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
  price?: number;
}

export interface VenueSummary {
  id: string; // or number depending on backend
  name: string;
  capacity: number;
  type?: string;
}

export interface SectionLayout {
  name: string;
  rows: number;
  seatsPerRow: number;
  price?: number;
}

export interface CreateVenueRequest {
  name: string;
  capacity: number;
  type: string;
  layout: {
    sections: SectionLayout[];
  };
}

export interface EventSeatResponse {
  seats: Seat[];
}
