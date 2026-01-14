import type { ClubSummary } from "./club";

/**
 * Event-related TypeScript types matching backend DTOs
 */

// ============ Enums ============

export type EventCategory = 
  | "WORKSHOP" 
  | "SEMINAR" 
  | "COMPETITION" 
  | "FEST" 
  | "MEETUP"
  // Legacy values for backward compatibility
  | "TECHNICAL"
  | "CULTURAL"
  | "SPORTS"
  | "OTHER";

export type EventVisibility = "PUBLIC" | "CLUB_ONLY";

export type EventRegistrationMode = "AUTO_APPROVE" | "MANUAL_APPROVE";

export type EventStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED" | "DELETED";

export type VenueType = "AMPHITHEATRE" | "AUDITORIUM" | "SEMINAR_HALL" | "ONLINE";

// UI-only types (not from backend)
export type RegistrationStatus = "Open" | "Closing Soon" | "Waitlist Available" | "Full";
export type EventType = "In-Person" | "Virtual" | "Hybrid";
export type PriceType = "Free" | "Paid";

// ============ Response DTOs ============

/** Venue summary for event responses */
export interface VenueSummary {
  id: number;
  name: string;
  location: string;
}

/** Legacy Event interface for compatibility with existing EventCard */
export interface Event {
  id: number;
  title: string;
  description: string;
  bannerUrl: string;
  startTime: string;
  endTime: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  category: string;
  registrationMode: EventRegistrationMode;
  visibility: EventVisibility;
  status: "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";
  club: {
    id: number;
    name: string;
    logoUrl: string;
  };
}

/** Full event response matching backend EventResponse */
export interface EventResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  startTime: string;
  endTime: string;
  venue: VenueSummary;
  type: VenueType;
  onlineLink: string | null;
  capacity: number;
  registrationMode: EventRegistrationMode;
  registrationDeadline: string | null;
  isPaid: boolean;
  basePrice: number;
  visibility: EventVisibility;
  status: EventStatus;
  cancellationReason: string | null;
  bannerUrl: string;
  thumbnailUrl: string | null;
  category: EventCategory;
  tags: string[];
  registrationCount: number;
  attendanceCount: number;
  club: ClubSummary;
  createdByUser: string;
  createdAt: string;
  publishedAt: string | null;
  isRegistered: boolean;
}

// ============ Request DTOs ============

/** Event creation form data */
export interface EventCreateRequest {
  clubId: string;
  title: string;
  slug: string;
  description: string;
  startTime: string;
  endTime: string;
  venueId: number;
  capacity: number;
  isPaid: boolean;
  basePrice?: number;
  registrationMode: EventRegistrationMode;
  registrationDeadline?: string;
  visibility: EventVisibility;
  status: EventStatus;
  bannerUrl?: string;
  thumbnailUrl?: string;
  category: EventCategory;
  tags?: string[];
}

/** Event update form data */
export interface EventUpdateRequest {
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
  capacity: number;
  registrationMode: EventRegistrationMode;
}

/** Event cancellation request */
export interface EventCancelRequest {
  reason: string;
}
