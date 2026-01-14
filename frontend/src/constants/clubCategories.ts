import type { ClubCategory, ClubStatus } from "@/types/club";

/**
 * Club category and status constants with styling
 */

export const CLUB_CATEGORIES: ClubCategory[] = [
  "TECHNICAL",
  "CULTURAL",
  "SPORTS",
  "SOCIAL_SERVICE",
  "DRAMA",
];

export const CLUB_CATEGORY_LABELS: Record<ClubCategory, string> = {
  TECHNICAL: "Technical",
  CULTURAL: "Cultural",
  SPORTS: "Sports",
  SOCIAL_SERVICE: "Social Service",
  DRAMA: "Drama",
};

export const CLUB_CATEGORY_COLORS: Record<ClubCategory, string> = {
  TECHNICAL: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CULTURAL: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  SPORTS: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  SOCIAL_SERVICE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  DRAMA: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export const CLUB_STATUS_COLORS: Record<ClubStatus, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  ACTIVE: "bg-green-500/10 text-green-500 border-green-500/20",
  SUSPENDED: "bg-red-500/10 text-red-500 border-red-500/20",
  REJECTED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export const CLUB_STATUS_LABELS: Record<ClubStatus, string> = {
  PENDING: "Pending Approval",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
};
