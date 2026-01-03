export interface Event {
  id: number;
  title: string;
  description: string;
  bannerUrl: string;
  startTime: string; // ISO format
  endTime: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  category: string;
  registrationMode: "AUTO_APPROVE" | "MANUAL_APPROVE";
  visibility: "PUBLIC" | "CLUB_ONLY";
  status: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
  club: {
    id: number;
    name: string;
    logoUrl: string;
  };
}

export type EventCategory = "TECHNICAL" | "CULTURAL" | "SPORTS" | "WORKSHOP" | "SEMINAR" | "FEST" | "COMPETITION" | "OTHER";
export type RegistrationStatus = "Open" | "Closing Soon" | "Waitlist Available" | "Full";
export type EventType = "In-Person" | "Virtual" | "Hybrid";
export type PriceType = "Free" | "Paid";
