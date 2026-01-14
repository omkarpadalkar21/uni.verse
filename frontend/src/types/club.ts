/**
 * Club-related TypeScript types matching backend DTOs
 */

// ============ Enums ============

export type ClubCategory = "TECHNICAL" | "CULTURAL" | "SPORTS" | "SOCIAL_SERVICE" | "DRAMA";

export type ClubStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

export type ClubRole = "LEADER" | "MEMBER";

export type LeadershipRole = "PRESIDENT" | "VICE_PRESIDENT" | "SECRETARY";

export type JoinRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

// ============ Response DTOs ============

/** Club data for list views */
export interface ClubDTO {
  name: string;
  slug: string;
  description: string;
  clubCategory: ClubCategory;
  tags: string[];
  logoUrl: string;
  bannerUrl: string;
  memberCount: number;
  followerCount: number;
  eventCount: number;
}

/** Full club response with status and social links */
export interface ClubResponse {
  name: string;
  slug: string;
  description: string;
  clubCategory: ClubCategory;
  tags: string[];
  logoUrl: string;
  bannerUrl: string;
  socialLinks: Record<string, string>;
  clubStatus: ClubStatus;
}

/** Minimal club info for nested references */
export interface ClubSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
}

/** Member info for club members list */
export interface ClubMembersDTO {
  user: string; // Full name
  role: ClubRole;
  joinedAt: string; // ISO datetime
}

/** Join request with full user/club details (entity returned directly) */
export interface ClubJoinRequest {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  club: ClubSummary;
  status: JoinRequestStatus;
  message: string;
  rejectionReason: string | null;
  reviewedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  reviewedAt: string | null;
  createdAt: string;
}

/** Response from club management actions (approve/reject/promote/remove) */
export interface ClubManagementResponse {
  message: string;
  role: ClubRole;
}

// ============ Request DTOs ============

/** Club registration form data */
export interface ClubRegistrationRequest {
  name: string;
  slug: string;
  description: string;
  clubCategory: ClubCategory;
  logoUrl: string;
  role: LeadershipRole;
  socialLinks?: Record<string, string>;
}

/** Club update form data */
export interface ClubUpdateRequest {
  name: string;
  description: string;
  logoUrl: string;
  socialLinks?: Record<string, string>;
}

/** Join club request message */
export interface JoinClubRequest {
  message: string;
}

/** Rejection reason for join requests */
export interface ClubRejectionRequest {
  reason: string;
}
