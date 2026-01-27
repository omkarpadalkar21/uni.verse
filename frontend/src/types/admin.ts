/**
 * Admin panel TypeScript types
 */

// ============ Enums ============

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ClubStatusFilter = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export type EventStatusFilter = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

// ============ DTOs ============

/** Platform statistics for admin dashboard */
export interface PlatformStatsDTO {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingVerificationUsers: number;
  totalClubs: number;
  activeClubs: number;
  pendingClubs: number;
  suspendedClubs: number;
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  cancelledEvents: number;
  completedEvents: number;
}

/** Basic user info for admin list */
export interface UserBasicDTO {
  id: string;
  email: string;
  phone: string;
  universityId: string;
  accountStatus: AccountStatus;
  roles: string[];
  createdAt: string;
  lastLogin?: string;
}

/** Organizer verification request */
export interface OrganizerVerificationResponse {
  id: string;
  userId: string;
  userEmail: string;
  documentUrl: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

/** Rejection reason DTO */
export interface OrganizerRejectionReason {
  reason: string;
}

/** User suspension reason DTO */
export interface UserSuspensionReason {
  reason: string;
}
