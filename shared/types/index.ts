// TODO: Define shared types used by both backend and frontend

export type ReportStatus = 'pending' | 'in_review' | 'resolved' | 'dismissed';

export type CaseStatus = 'open' | 'investigating' | 'closed';

export type EvidenceType = 'screenshot' | 'video' | 'log' | 'other';

export type UserRole = 'admin' | 'analyst' | 'viewer';

// TODO: Add shared DTO / API response interfaces here
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
