import { CasePriority, CaseStatus } from '@prisma/client';

export class CaseListItem {
  id: string;
  caseNumber: string;
  title: string;
  status: CaseStatus;
  priority: CasePriority;
  openedAt: Date;
  openedBy: any;
  assignedTo?: any;
}

export class CaseListResponse {
  data: CaseListItem[];
  total: number;
  page: number;
  pageSize: number;
}
