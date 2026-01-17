/**
 * Event Registration TypeScript types matching backend DTOs
 */

import type { EventCategory, EventStatus, VenueSummary } from './event';

// ============ Enums ============

export type EventRegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

// ============ Response DTOs ============

/** Response from registration/approval actions */
export interface EventRegistrationResponse {
  registrationStatus: EventRegistrationStatus;
  rejectionReason: string | null;
}

/** Event summary for registration lists */
export interface EventSummary {
  id: string;
  clubName: string;
  title: string;
  slug: string;
  description: string;
  venue: VenueSummary;
  capacity: number;
  bannerUrl: string;
  thumbnailUrl: string | null;
  category: EventCategory;
  tags: string[];
  status: EventStatus;
}

/** Basic user information for registration lists */
export interface UserBasicDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  universityId: string;
}

/** Full registration summary for list views */
export interface EventRegistrationSummary {
  eventSummary: EventSummary | null;
  clubName: string | null;
  user: UserBasicDTO | null;
  userEmail: string | null;
  registeredAt: string; // ISO date string
  registrationStatus: EventRegistrationStatus;
}

// ============ Request DTOs ============

/** Request body for rejecting a registration */
export interface RejectEventRegistrationRequest {
  rejectionReason: string; // Min 5, Max 255 characters
}

/** Request body for cancelling a registration */
export interface CancelEventRegistrationRequest {
  cancellationReason: string; // Min 5, Max 255 characters
}
