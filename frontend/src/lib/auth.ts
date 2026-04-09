import { jwtDecode } from 'jwt-decode';
import { clearTokens } from '@/lib/api';

interface JwtPayload {
  sub: string;
  authorities?: string[]; // backend stores e.g. ["ROLE_USER", "ROLE_SUPERADMIN", ...]
  exp?: number;           // seconds since epoch
}

export interface AuthInfo {
  loggedIn: boolean;
  email: string;
  isSuperAdmin: boolean;
  isClubLeader: boolean;
  isClubMember: boolean;
}

/**
 * Reads the access token from localStorage, validates it hasn't expired,
 * and returns structured auth information.
 *
 * If the token is missing or expired, tokens are cleared and
 * { loggedIn: false, ... } is returned.
 */
export function getAuthInfo(): AuthInfo {
  const raw = localStorage.getItem('access_token');
  if (!raw) return { loggedIn: false, email: '', isSuperAdmin: false, isClubLeader: false, isClubMember: false };

  try {
    const decoded = jwtDecode<JwtPayload>(raw);

    // Check expiry (exp is in seconds)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      // Token is expired – treat as signed out and tidy up
      clearTokens();
      return { loggedIn: false, email: '', isSuperAdmin: false, isClubLeader: false, isClubMember: false };
    }

    const authorities = decoded.authorities ?? [];
    return {
      loggedIn: true,
      email: decoded.sub ?? '',
      isSuperAdmin: authorities.includes('ROLE_SUPERADMIN'),
      isClubLeader: authorities.includes('ROLE_CLUB_LEADER'),
      isClubMember: authorities.includes('ROLE_CLUB_MEMBER'),
    };
  } catch {
    // Malformed token – clear and treat as signed out
    clearTokens();
    return { loggedIn: false, email: '', isSuperAdmin: false, isClubLeader: false, isClubMember: false };
  }
}
