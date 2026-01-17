/**
 * Event Registration API service
 */

import { apiClient } from './api';
import type { PageResponse, MessageResponse } from '@/types/api';
import type {
  EventRegistrationResponse,
  EventRegistrationSummary,
  EventRegistrationStatus,
  RejectEventRegistrationRequest,
  CancelEventRegistrationRequest,
} from '@/types/eventRegistration';

export const eventRegistrationApi = {
  /**
   * Register current user for an event
   * Access: USER role
   */
  registerForEvent: async (slug: string, eventId: string): Promise<EventRegistrationResponse> => {
    const response = await apiClient.post<EventRegistrationResponse>(
      `/api/v1/${slug}/events/${eventId}/register`
    );
    return response.data;
  },

  /**
   * Get event registrations (for club admins)
   * Access: CLUB_MEMBER, CLUB_LEADER
   */
  getEventRegistrations: async (
    slug: string,
    eventId: string,
    status?: EventRegistrationStatus,
    page = 0,
    size = 10
  ): Promise<PageResponse<EventRegistrationSummary>> => {
    const response = await apiClient.get<PageResponse<EventRegistrationSummary>>(
      `/api/v1/${slug}/events/${eventId}/registrations`,
      { params: { status, page, size } }
    );
    return response.data;
  },

  /**
   * Approve a pending registration
   * Access: CLUB_MEMBER, CLUB_LEADER
   */
  approveRegistration: async (
    slug: string,
    eventId: string,
    userId: string
  ): Promise<EventRegistrationResponse> => {
    const response = await apiClient.put<EventRegistrationResponse>(
      `/api/v1/${slug}/events/${eventId}/registrations/${userId}/approve`
    );
    return response.data;
  },

  /**
   * Reject a pending registration
   * Access: CLUB_MEMBER, CLUB_LEADER
   */
  rejectRegistration: async (
    slug: string,
    eventId: string,
    userId: string,
    data: RejectEventRegistrationRequest
  ): Promise<EventRegistrationResponse> => {
    const response = await apiClient.put<EventRegistrationResponse>(
      `/api/v1/${slug}/events/${eventId}/registrations/${userId}/reject`,
      data
    );
    return response.data;
  },

  /**
   * Cancel own registration
   * Access: USER (only before event starts)
   */
  cancelRegistration: async (
    slug: string,
    eventId: string,
    data: CancelEventRegistrationRequest
  ): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>(
      `/api/v1/${slug}/events/${eventId}/registrations`,
      { data }
    );
    return response.data;
  },

  /**
   * Get current user's event registrations
   * Access: USER
   */
  getUserRegistrations: async (
    status?: EventRegistrationStatus,
    page = 0,
    pageSize = 10
  ): Promise<PageResponse<EventRegistrationSummary>> => {
    const response = await apiClient.get<PageResponse<EventRegistrationSummary>>(
      '/api/v1/users/registrations',
      { params: { status, page, pageSize } }
    );
    return response.data;
  },
};
