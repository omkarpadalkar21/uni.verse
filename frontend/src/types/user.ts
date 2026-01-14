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
