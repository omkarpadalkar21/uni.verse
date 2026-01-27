import axios, { type AxiosInstance } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear tokens and redirect to signin
      clearTokens();
      if (window.location.pathname !== '/auth/signin') {
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Token management functions
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistrationRequest {
  email: string;
  password: string;
  phone: string;
  universityId: string;
  intendedRole?: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface AuthenticationResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegistrationResponse {
  message: string;
  email: string;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// Authentication API calls
// Forgot password request
export interface ForgotPasswordRequest {
  email: string;
}

// Reset password request
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

// Logout request
export interface LogoutRequest {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthenticationResponse> => {
    const response = await apiClient.post<AuthenticationResponse>('/api/v1/auth/login', data);
    return response.data;
  },

  register: async (data: RegistrationRequest): Promise<RegistrationResponse> => {
    const response = await apiClient.post<RegistrationResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<AuthenticationResponse> => {
    const response = await apiClient.post<AuthenticationResponse>('/api/v1/auth/verify-email', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/api/v1/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/api/v1/auth/reset-password', data);
    return response.data;
  },

  logout: async (data: LogoutRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/api/v1/auth/logout', data);
    clearTokens();
    return response.data;
  },
};

// ============ Type Imports ============
import type { PageResponse, Page, MessageResponse } from '@/types/api';
import type { UserProfileResponse, UpdateUserProfileRequest } from '@/types/user';
import type {
  PlatformStatsDTO,
  UserBasicDTO,
  OrganizerVerificationResponse,
  OrganizerRejectionReason,
  UserSuspensionReason,
  AccountStatus,
  VerificationStatus,
  ClubStatusFilter,
  EventStatusFilter,
} from '@/types/admin';
import type {
  ClubDTO,
  ClubResponse,
  ClubRegistrationRequest,
  ClubUpdateRequest,
  ClubMembersDTO,
  ClubJoinRequest,
  ClubManagementResponse,
  JoinClubRequest,
  ClubRejectionRequest,
} from '@/types/club';
import type {
  EventResponse,
  EventCreateRequest,
  EventUpdateRequest,
  EventCancelRequest,
  EventCategory,
} from '@/types/event';

// ============ Club API ============
export const clubApi = {
  /** Get paginated list of clubs */
  getClubs: async (offset: number, pageSize: number): Promise<PageResponse<ClubDTO>> => {
    const response = await apiClient.get<PageResponse<ClubDTO>>(`/api/v1/clubs/${offset}/${pageSize}`);
    return response.data;
  },

  /** Get club details by slug */
  getClubBySlug: async (slug: string): Promise<ClubDTO> => {
    const response = await apiClient.get<ClubDTO>(`/api/v1/clubs/${slug}`);
    return response.data;
  },

  /** Register a new club */
  registerClub: async (data: ClubRegistrationRequest): Promise<ClubResponse> => {
    const response = await apiClient.post<ClubResponse>('/api/v1/clubs', data);
    return response.data;
  },

  /** Update club by slug */
  updateClub: async (slug: string, data: ClubUpdateRequest): Promise<ClubDTO> => {
    const response = await apiClient.put<ClubDTO>(`/api/v1/clubs/${slug}`, data);
    return response.data;
  },

  /** Approve club (admin only) */
  approveClub: async (slug: string): Promise<ClubResponse> => {
    const response = await apiClient.put<ClubResponse>(`/api/v1/clubs/${slug}/approve`);
    return response.data;
  },

  /** Reject club (admin only) */
  rejectClub: async (slug: string): Promise<ClubResponse> => {
    const response = await apiClient.put<ClubResponse>(`/api/v1/clubs/${slug}/reject`);
    return response.data;
  },

  /** Suspend club (admin only) */
  suspendClub: async (slug: string): Promise<ClubResponse> => {
    const response = await apiClient.put<ClubResponse>(`/api/v1/clubs/${slug}/suspend`);
    return response.data;
  },
};

// ============ Club Management API ============
export const clubManagementApi = {
  /** Create a join request for a club */
  createJoinRequest: async (slug: string, data: JoinClubRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(`/api/v1/clubs/${slug}/join-requests`, data);
    return response.data;
  },

  /** Get all join requests for a club (leaders only) */
  getJoinRequests: async (slug: string, page: number = 0, size: number = 20): Promise<Page<ClubJoinRequest>> => {
    const response = await apiClient.get<Page<ClubJoinRequest>>(
      `/api/v1/clubs/${slug}/join-requests`,
      { params: { page, size } }
    );
    return response.data;
  },

  /** Approve a join request */
  approveJoinRequest: async (slug: string, userId: string): Promise<ClubManagementResponse> => {
    const response = await apiClient.put<ClubManagementResponse>(
      `/api/v1/clubs/${slug}/join-requests/${userId}/approve`
    );
    return response.data;
  },

  /** Reject a join request */
  rejectJoinRequest: async (
    slug: string,
    userId: string,
    data: ClubRejectionRequest
  ): Promise<ClubManagementResponse> => {
    const response = await apiClient.put<ClubManagementResponse>(
      `/api/v1/clubs/${slug}/join-requests/${userId}/reject`,
      data
    );
    return response.data;
  },

  /** Get all members of a club */
  getMembers: async (slug: string, page: number = 0, size: number = 20): Promise<Page<ClubMembersDTO>> => {
    const response = await apiClient.get<Page<ClubMembersDTO>>(
      `/api/v1/clubs/${slug}/members`,
      { params: { page, size } }
    );
    return response.data;
  },

  /** Promote a member to leader */
  promoteMember: async (slug: string, userId: string): Promise<ClubManagementResponse> => {
    const response = await apiClient.put<ClubManagementResponse>(
      `/api/v1/clubs/${slug}/members/${userId}/promote`
    );
    return response.data;
  },

  /** Remove a member from club */
  removeMember: async (slug: string, userId: string): Promise<ClubManagementResponse> => {
    const response = await apiClient.delete<ClubManagementResponse>(
      `/api/v1/clubs/${slug}/members/${userId}`
    );
    return response.data;
  },

  /** Leave a club */
  leaveClub: async (slug: string): Promise<ClubManagementResponse> => {
    const response = await apiClient.post<ClubManagementResponse>(`/api/v1/clubs/${slug}/leave`);
    return response.data;
  },
};

// ============ Event API ============
export const eventApi = {
  /** Get paginated list of events with filters */
  getEvents: async (params: {
    clubId?: string;
    category?: EventCategory;
    dateTime: string;
    offset?: number;
    pageSize?: number;
  }): Promise<PageResponse<EventResponse>> => {
    const response = await apiClient.get<PageResponse<EventResponse>>('/api/v1/events', { params });
    return response.data;
  },

  /** Get event by ID */
  getEventById: async (id: string): Promise<EventResponse> => {
    const response = await apiClient.get<EventResponse>(`/api/v1/events/${id}`);
    return response.data;
  },
};

// ============ Event Management API ============
export const eventManagementApi = {
  /** Create a new event */
  createEvent: async (slug: string, data: EventCreateRequest): Promise<EventResponse> => {
    const response = await apiClient.post<EventResponse>(`/api/v1/${slug}/events`, data);
    return response.data;
  },

  /** Update an event */
  updateEvent: async (slug: string, eventId: string, data: EventUpdateRequest): Promise<EventResponse> => {
    const response = await apiClient.put<EventResponse>(`/api/v1/${slug}/events/${eventId}`, data);
    return response.data;
  },

  /** Delete an event */
  deleteEvent: async (slug: string, eventId: string): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>(`/api/v1/${slug}/events/${eventId}`);
    return response.data;
  },

  /** Publish an event */
  publishEvent: async (slug: string, eventId: string): Promise<EventResponse> => {
    const response = await apiClient.put<EventResponse>(`/api/v1/${slug}/events/${eventId}/publish`);
    return response.data;
  },

  /** Cancel an event */
  cancelEvent: async (slug: string, eventId: string, data: EventCancelRequest): Promise<EventResponse> => {
    const response = await apiClient.put<EventResponse>(`/api/v1/${slug}/events/${eventId}/cancelled`, data);
    return response.data;
  },
};

// ============ User API ============
export const userApi = {
  /** Get user profile by email */
  getProfile: async (emailId: string): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>(`/api/v1/users/profile/${emailId}`);
    return response.data;
  },

  /** Update current user's profile */
  updateProfile: async (data: UpdateUserProfileRequest): Promise<MessageResponse> => {
    const response = await apiClient.put<MessageResponse>('/api/v1/users/profile', data);
    return response.data;
  },
};

// ============ Admin API ============
export const adminApi = {
  /** Get platform statistics */
  getStats: async (params?: {
    clubStatus?: ClubStatusFilter;
    eventStatus?: EventStatusFilter;
    accountStatus?: AccountStatus;
  }): Promise<PlatformStatsDTO> => {
    const response = await apiClient.get<PlatformStatsDTO>('/api/v1/admin/stats', { params });
    return response.data;
  },

  /** Get paginated list of clubs (admin) */
  getClubs: async (params: {
    status?: ClubStatusFilter;
    offset?: number;
    pageSize?: number;
  }): Promise<PageResponse<ClubDTO>> => {
    const response = await apiClient.get<PageResponse<ClubDTO>>('/api/v1/admin/clubs', { params });
    return response.data;
  },

  /** Get paginated list of users */
  getUsers: async (params: {
    accountStatus?: AccountStatus;
    roleName?: string;
    offset?: number;
    pageSize?: number;
  }): Promise<PageResponse<UserBasicDTO>> => {
    const response = await apiClient.get<PageResponse<UserBasicDTO>>('/api/v1/admin/users', { params });
    return response.data;
  },

  /** Promote user to faculty */
  promoteToFaculty: async (userId: string): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>(`/api/v1/admin/users/${userId}/promote-faculty`);
    return response.data;
  },

  /** Suspend a user */
  suspendUser: async (userId: string, reason: UserSuspensionReason): Promise<UserProfileResponse> => {
    const response = await apiClient.put<UserProfileResponse>(`/api/v1/admin/users/${userId}/suspend`, reason);
    return response.data;
  },

  /** Get organizer verification requests */
  getOrganizerVerifications: async (params?: {
    status?: VerificationStatus;
    offset?: number;
    pageSize?: number;
  }): Promise<PageResponse<OrganizerVerificationResponse>> => {
    const response = await apiClient.get<PageResponse<OrganizerVerificationResponse>>(
      '/api/v1/admin/organization-verification',
      { params }
    );
    return response.data;
  },

  /** Get single organizer verification request */
  getOrganizerVerification: async (id: string): Promise<OrganizerVerificationResponse> => {
    const response = await apiClient.get<OrganizerVerificationResponse>(
      `/api/v1/admin/organization-verification/${id}`
    );
    return response.data;
  },

  /** Approve organizer verification */
  approveOrganizer: async (id: string): Promise<MessageResponse> => {
    const response = await apiClient.put<MessageResponse>(
      `/api/v1/admin/organization-verification/${id}/approve`
    );
    return response.data;
  },

  /** Reject organizer verification */
  rejectOrganizer: async (id: string, reason: OrganizerRejectionReason): Promise<MessageResponse> => {
    const response = await apiClient.put<MessageResponse>(
      `/api/v1/admin/organization-verification/${id}/reject`,
      reason
    );
    return response.data;
  },
};
