import {
  CasePriority,
  CaseStatus,
  EvidenceStatus,
  EvidenceType,
  NoteVisibility,
} from '@prisma/client';

export class CaseViewResponse {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;
  openedAt: Date;
  closedAt?: Date;

  game: any;
  openedBy: any;
  assignedTo?: any;

  subjects: any[];
  reports: any[];
  evidence: any[];
  notes: any[];
  verdict?: any;
  violationTypes: any[];
}
