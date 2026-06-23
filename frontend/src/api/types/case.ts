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
}

// ----------------------
// Report
// ----------------------
export interface Report {
  id: string;
  description: string;
  createdAt: string;
  reportedBy?: {
    id: string;
    displayName: string | null;
  } | null;
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

  evidence?: Evidence[];
  reports?: Report[];
}