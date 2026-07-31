// ----------------------
// Attachment
// ----------------------
export interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  createdAt: string;
}

// ----------------------
// Evidence
// ----------------------
export interface Evidence {
  id: string;
  type: string;
  description?: string | null;
  createdAt: string;
  attachments?: Attachment[];
  uploadedBy?: { id: string; displayName: string | null } | null;
}

// ----------------------
// Report
// ----------------------
export interface Report {
  id: string;
  summary?: string | null;
  description?: string | null;
  detail?: string | null;
  createdAt: string;
  reportedBy?: {
    id: string;
    displayName: string | null;
  } | null;
}

// ----------------------
// Note
// ----------------------
export interface Note {
  id: string;
  body: string;
  isPinned: boolean;
  visibility: 'INTERNAL' | 'RESTRICTED';
  createdAt: string;
  author?: { id: string; displayName: string | null; role: string } | null;
}

// ----------------------
// Subject
// ----------------------
export interface Subject {
  id: string;
  gameAccountId: string;
  displayName?: string | null;
  platform?: { id: string; name: string } | null;
}

// ----------------------
// Verdict
// ----------------------
export interface Verdict {
  id: string;
  decision: string;
  reasoning?: string | null;
  sanctionApplied?: string | null;
  createdAt: string;
  renderedBy?: { id: string; displayName: string | null } | null;
  sanctionTemplate?: { id: string; name: string } | null;
}

// ----------------------
// ViolationType
// ----------------------
export interface ViolationType {
  id: string;
  name: string;
  description?: string | null;
}

// ----------------------
// AiAnalysis
// ----------------------
export interface AiAnalysis {
  id: string;
  summary: string;
  confidence: number;
  suggestedViolationType?: string | null;
  suggestedPriority?: string | null;
  rawResponse?: string | null;
  createdAt: string;
  reviewerDecision?: 'ACCEPTED' | 'MODIFIED' | 'REJECTED' | null;
  reviewerNote?: string | null;
}

// ----------------------
// CaseData (full case)
// ----------------------
export interface CaseData {
  id: string;
  caseNumber: string;
  title: string | null;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
  assignedTo?: { id: string; displayName: string | null } | null;
  openedBy?: { id: string; displayName: string | null } | null;
  game?: { id: string; name: string } | null;

  subjects?: Subject[];
  evidence?: Evidence[];
  reports?: Report[];
  notes?: Note[];
  verdict?: Verdict | null;
  violationTypes?: ViolationType[];
  aiAnalysis?: AiAnalysis | null;
}

// ----------------------
// CaseSummary (for lists)
// ----------------------
export interface CaseSummary {
  id: string;
  caseNumber: string;
  title: string | null;
  status: string;
  priority: string;
  createdAt: string;
  assignedTo?: { id: string; displayName: string | null } | null;
  aiAnalysis?: { confidence: number; suggestedViolationType: string | null } | null;
}

// ----------------------
// DashboardStats
// ----------------------
export interface DashboardStats {
  total: number;
  open: number;
  underReview: number;
  escalated: number;
  closedToday: number;
}

// ----------------------
// Auth
// ----------------------
export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

// ----------------------
// Game / Platform
// ----------------------
export interface Game {
  id: string;
  name: string;
  slug: string;
}

export interface Platform {
  id: string;
  name: string;
  slug: string;
}
