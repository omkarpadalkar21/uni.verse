import { Navigate } from 'react-router-dom';
import { getAuthInfo } from '@/lib/auth';

interface ProtectedRouteProps {
  /** The page component to render if access is granted */
  children: React.ReactNode;
  /** If true, user must have SUPERADMIN authority. Default: any authenticated user. */
  requireSuperAdmin?: boolean;
  /** If true, user must have CLUB_LEADER authority. Default: false. */
  requireClubLeader?: boolean;
}

/**
 * Wraps a route and enforces authentication (and optionally role requirements).
 *
 * - Not authenticated        →  redirect to /auth/signin
 * - Needs SUPERADMIN, lacks  →  redirect to /
 * - Needs CLUB_LEADER, lacks →  redirect to / (they are not yet an approved organizer)
 */
export function ProtectedRoute({
  children,
  requireSuperAdmin = false,
  requireClubLeader = false,
}: ProtectedRouteProps) {
  const { loggedIn, isSuperAdmin, isClubLeader } = getAuthInfo();

  if (!loggedIn) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireClubLeader && !isClubLeader) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
