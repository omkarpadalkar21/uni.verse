/**
 * User-related TypeScript types
 */

export type RoleName = "USER" | "CLUB_MEMBER" | "CLUB_LEADER" | "FACULTY" | "SUPERADMIN";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  universityId: string;
  roles: RoleName[];
  emailVerified: boolean;
  createdAt: string;
}

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/** User profile response from backend */
export interface UserProfileResponse {
  id: string;
  email: string;
  phone: string;
  universityId: string;
  roles: RoleName[];
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  createdAt: string;
  lastLogin?: string;
  clubMemberships?: {
    clubSlug: string;
    clubName: string;
    role: 'MEMBER' | 'LEADER';
    joinedAt: string;
  }[];
}

/** Request to update user profile */
export interface UpdateUserProfileRequest {
  phone?: string;
  universityId?: string;
}
