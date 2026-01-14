/**
 * Common API response types
 */

/** Generic paginated response from backend */
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
}

/** Spring Page response structure (for endpoints returning Page directly) */
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** Simple message response */
export interface MessageResponse {
  message: string;
}

/** Error response from API */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}
