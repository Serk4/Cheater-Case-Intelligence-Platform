# CCIP Data Model

> **Cheater Case Intelligence Platform** — Data Architecture Reference  
> Last updated: 2026-06-16 | Version 1.0.0

---

## Table of Contents

1. [Overview](#1-overview)
2. [Entity-Relationship Diagram](#2-entity-relationship-diagram)
3. [Prisma Schema](#3-prisma-schema)
4. [Entity Reference](#4-entity-reference)
5. [Relationships Summary](#5-relationships-summary)
6. [Enum Reference](#6-enum-reference)
7. [Design Decisions & Conventions](#7-design-decisions--conventions)

---

## 1. Overview

The Cheater Case Intelligence Platform (CCIP) is a case-management and intelligence system for tracking, investigating, and adjudicating cheating allegations. The data model is designed around the lifecycle of a **Case**: it is opened when a **Report** is received, investigated using **Evidence** and **Notes**, and closed with a **Verdict**. All actions are captured in an immutable **AuditLog**.

### Core Principles

| Principle | Implementation |
|---|---|
| Case-centric | Every entity relates back to a `Case` |
| Immutable audit trail | `AuditLog` is append-only; no updates or deletes |
| Soft deletes | All primary entities use `deletedAt` rather than hard deletes |
| Role-based access | `User.role` gates read/write/admin operations |
| Extensibility | `metadata` JSONB fields on key models for future attributes |

---

## 2. Entity-Relationship Diagram

```mermaid
erDiagram
    USER {
        string  id          PK
        string  email
        string  displayName
        string  avatarUrl
        UserRole role
        boolean isActive
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    CASE {
        string      id          PK
        string      caseNumber  UK
        string      title
        CaseStatus  status
        CasePriority priority
        string      assignedToId FK
        string      openedById   FK
        datetime    openedAt
        datetime    closedAt
        json        metadata
        datetime    deletedAt
    }
    SUBJECT {
        string  id          PK
        string  caseId      FK
        string  displayName
        string  externalId
        string  platform
        string  profileUrl
        json    metadata
    }
    REPORT {
        string       id           PK
        string       caseId       FK
        string       reportedById FK
        string       summary
        ReportSource source
        datetime     incidentAt
    }
    EVIDENCE {
        string         id           PK
        string         caseId       FK
        string         uploadedById FK
        string         title
        EvidenceType   evidenceType
        EvidenceStatus status
        json           metadata
        datetime       deletedAt
    }
    ATTACHMENT {
        string  id         PK
        string  evidenceId FK
        string  noteId     FK
        string  fileName
        string  mimeType
        int     sizeBytes
        string  storageKey
        string  storageUrl
    }
    NOTE {
        string         id         PK
        string         caseId     FK
        string         authorId   FK
        string         body
        boolean        isPinned
        NoteVisibility visibility
        datetime       deletedAt
    }
    VERDICT {
        string         id           PK
        string         caseId       FK
        string         renderedById FK
        VerdictOutcome outcome
        string         rationale
        datetime       effectiveAt
        datetime       expiresAt
    }
    TAG      { string id PK; string name UK; string color }
    CASE_TAG { string caseId FK; string tagId FK }
    AUDIT_LOG {
        string  id         PK
        string  actorId    FK
        string  caseId     FK
        string  action
        string  entityType
        string  entityId
        json    before
        json    after
        string  ipAddress
        datetime createdAt
    }

    USER        ||--o{ CASE        : "opens"
    USER        ||--o{ CASE        : "assigned to"
    USER        ||--o{ REPORT      : "files"
    USER        ||--o{ EVIDENCE    : "uploads"
    USER        ||--o{ NOTE        : "authors"
    USER        ||--o{ VERDICT     : "renders"
    USER        ||--o{ AUDIT_LOG   : "generates"
    CASE        ||--o{ SUBJECT     : "has"
    CASE        ||--o{ REPORT      : "receives"
    CASE        ||--o{ EVIDENCE    : "collects"
    CASE        ||--o{ NOTE        : "contains"
    CASE        ||--o| VERDICT     : "closes with"
    CASE        ||--o{ CASE_TAG    : "tagged by"
    CASE        ||--o{ AUDIT_LOG   : "logged in"
    EVIDENCE    ||--o{ ATTACHMENT  : "has"
    NOTE        ||--o{ ATTACHMENT  : "has"
    TAG         ||--o{ CASE_TAG    : "used in"
```

---

## 3. Prisma Schema

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────────

enum UserRole       { VIEWER ANALYST SENIOR_ANALYST ADMIN }
enum CaseStatus     { OPEN UNDER_REVIEW PENDING_EVIDENCE ESCALATED CLOSED DISMISSED }
enum CasePriority   { LOW MEDIUM HIGH CRITICAL }
enum ReportSource   { MANUAL AUTOMATED THIRD_PARTY_API COMMUNITY_TIP }
enum EvidenceType   { SCREENSHOT VIDEO LOG_FILE REPLAY_FILE EXTERNAL_REPORT API_DATA OTHER }
enum EvidenceStatus { PENDING_REVIEW VERIFIED DISPUTED REJECTED }
enum VerdictOutcome { GUILTY NOT_GUILTY INCONCLUSIVE SUSPENDED BANNED WARNING_ISSUED }
enum NoteVisibility { INTERNAL RESTRICTED CONFIDENTIAL }

// ─── USER ────────────────────────────────────────────────

model User {
  id          String    @id @default(cuid())
  email       String    @unique
  displayName String
  avatarUrl   String?
  role        UserRole  @default(VIEWER)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  casesOpened   Case[]     @relation("CaseOpenedBy")
  casesAssigned Case[]     @relation("CaseAssignedTo")
  reports       Report[]
  evidence      Evidence[]
  notes         Note[]
  verdicts      Verdict[]
  auditLogs     AuditLog[]

  @@index([email])
  @@index([role])
  @@index([isActive])
  @@map("users")
}

// ─── CASE ────────────────────────────────────────────────

model Case {
  id           String       @id @default(cuid())
  caseNumber   String       @unique
  title        String
  description  String?      @db.Text
  status       CaseStatus   @default(OPEN)
  priority     CasePriority @default(MEDIUM)
  assignedToId String?
  openedById   String
  openedAt     DateTime     @default(now())
  closedAt     DateTime?
  metadata     Json?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  deletedAt    DateTime?

  assignedTo User?    @relation("CaseAssignedTo", fields: [assignedToId], references: [id])
  openedBy   User     @relation("CaseOpenedBy",   fields: [openedById],   references: [id])
  subjects   Subject[]
  reports    Report[]
  evidence   Evidence[]
  notes      Note[]
  verdict    Verdict?
  tags       CaseTag[]
  auditLogs  AuditLog[]

  @@index([caseNumber])
  @@index([status])
  @@index([priority])
  @@index([assignedToId])
  @@index([openedById])
  @@index([openedAt])
  @@map("cases")
}

// ─── SUBJECT ─────────────────────────────────────────────

model Subject {
  id          String   @id @default(cuid())
  caseId      String
  displayName String
  externalId  String?
  platform    String?
  profileUrl  String?
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  case Case @relation(fields: [caseId], references: [id], onDelete: Cascade)

  @@index([caseId])
  @@index([externalId])
  @@index([platform])
  @@map("subjects")
}

// ─── REPORT ──────────────────────────────────────────────

model Report {
  id           String       @id @default(cuid())
  caseId       String
  reportedById String
  summary      String
  detail       String?      @db.Text
  source       ReportSource @default(MANUAL)
  incidentAt   DateTime?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  case       Case @relation(fields: [caseId],       references: [id], onDelete: Cascade)
  reportedBy User @relation(fields: [reportedById], references: [id])

  @@index([caseId])
  @@index([reportedById])
  @@index([source])
  @@index([incidentAt])
  @@map("reports")
}

// ─── EVIDENCE ────────────────────────────────────────────

model Evidence {
  id           String         @id @default(cuid())
  caseId       String
  uploadedById String
  title        String
  description  String?        @db.Text
  evidenceType EvidenceType   @default(OTHER)
  status       EvidenceStatus @default(PENDING_REVIEW)
  metadata     Json?
  capturedAt   DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  deletedAt    DateTime?

  case        Case         @relation(fields: [caseId],       references: [id], onDelete: Cascade)
  uploadedBy  User         @relation(fields: [uploadedById], references: [id])
  attachments Attachment[]

  @@index([caseId])
  @@index([uploadedById])
  @@index([evidenceType])
  @@index([status])
  @@map("evidence")
}

// ─── ATTACHMENT ──────────────────────────────────────────

model Attachment {
  id         String   @id @default(cuid())
  evidenceId String?
  noteId     String?
  fileName   String
  mimeType   String
  sizeBytes  Int
  storageKey String   @unique
  storageUrl String
  createdAt  DateTime @default(now())

  evidence Evidence? @relation(fields: [evidenceId], references: [id], onDelete: Cascade)
  note     Note?     @relation(fields: [noteId],     references: [id], onDelete: Cascade)

  @@index([evidenceId])
  @@index([noteId])
  @@map("attachments")
}

// ─── NOTE ────────────────────────────────────────────────

model Note {
  id         String         @id @default(cuid())
  caseId     String
  authorId   String
  body       String         @db.Text
  isPinned   Boolean        @default(false)
  visibility NoteVisibility @default(INTERNAL)
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt
  deletedAt  DateTime?

  case        Case         @relation(fields: [caseId],   references: [id], onDelete: Cascade)
  author      User         @relation(fields: [authorId], references: [id])
  attachments Attachment[]

  @@index([caseId])
  @@index([authorId])
  @@index([isPinned])
  @@map("notes")
}

// ─── VERDICT ─────────────────────────────────────────────

model Verdict {
  id           String         @id @default(cuid())
  caseId       String         @unique
  renderedById String
  outcome      VerdictOutcome
  rationale    String         @db.Text
  effectiveAt  DateTime       @default(now())
  expiresAt    DateTime?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  case       Case @relation(fields: [caseId],       references: [id], onDelete: Cascade)
  renderedBy User @relation(fields: [renderedById], references: [id])

  @@index([caseId])
  @@index([outcome])
  @@index([effectiveAt])
  @@map("verdicts")
}

// ─── TAG & CASE_TAG ──────────────────────────────────────

model Tag {
  id          String    @id @default(cuid())
  name        String    @unique
  color       String    @default("#6B7280")
  description String?
  createdAt   DateTime  @default(now())
  cases       CaseTag[]
  @@map("tags")
}

model CaseTag {
  caseId String
  tagId  String
  case   Case @relation(fields: [caseId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId],  references: [id], onDelete: Cascade)
  @@id([caseId, tagId])
  @@map("case_tags")
}

// ─── AUDIT LOG ───────────────────────────────────────────

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?
  caseId     String?
  action     String
  entityType String
  entityId   String
  before     Json?
  after      Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  actor User? @relation(fields: [actorId], references: [id], onDelete: SetNull)
  case  Case? @relation(fields: [caseId],  references: [id], onDelete: SetNull)

  @@index([actorId])
  @@index([caseId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## 4. Entity Reference

### 4.1 User
Represents any human actor — analyst, admin, or viewer. Auth is external (OAuth/SSO); this model holds the profile and role.

| Field | Type | Description |
|---|---|---|
| `id` | `String (cuid)` | Primary key |
| `email` | `String` | Unique login identifier |
| `displayName` | `String` | Human-readable name |
| `role` | `UserRole` | Access control gate |
| `isActive` | `Boolean` | Soft disable without deletion |
| `deletedAt` | `DateTime?` | Soft-delete timestamp |

**Example — query an analyst's open cases:**
```typescript
const cases = await prisma.case.findMany({
  where: { assignedToId: userId, status: { not: "CLOSED" }, deletedAt: null },
  include: { tags: { include: { tag: true } } },
  orderBy: { priority: "desc" },
});
```

---

### 4.2 Case
The central entity. Every other model anchors to a `Case`.

| Field | Type | Description |
|---|---|---|
| `caseNumber` | `String @unique` | Human-readable ID (e.g., `CCIP-2026-00142`) |
| `status` | `CaseStatus` | Lifecycle stage |
| `priority` | `CasePriority` | Triage priority with SLA targets |
| `assignedToId` | `String?` | Currently assigned analyst |
| `metadata` | `Json?` | Extensible bag (game title, match ID, etc.) |

**Auto-generating `caseNumber`:**
```typescript
function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const seq  = String(nextSequence()).padStart(5, "0");
  return `CCIP-${year}-${seq}`;
}
```

---

### 4.3 Subject
The individual(s) alleged to have cheated. One case may link to multiple subjects (e.g., a coordinated ring). Tied to an external identity via `externalId` + `platform`.

---

### 4.4 Report
A formal allegation tied to a case. Multiple reports may exist per case. Immutable after creation; captures the `source` (manual, automated, API, or community tip) and `incidentAt` timestamp.

---

### 4.5 Evidence
Structured evidence items with a review lifecycle:

```
PENDING_REVIEW → VERIFIED
               ↘ DISPUTED → VERIFIED
                          ↘ REJECTED
```

The `metadata` field holds technical attributes: SHA-256 checksums, video duration, resolution, etc.

---

### 4.6 Attachment
Binary files stored in object storage (S3 / Azure Blob). The DB stores only the reference (`storageKey`, `storageUrl`) — no binary data. Each attachment belongs to **either** an `Evidence` item or a `Note` (never both — enforce with a DB check constraint):

```sql
ALTER TABLE attachments
  ADD CONSTRAINT chk_attachment_owner CHECK (
    ("evidence_id" IS NOT NULL AND "note_id" IS NULL) OR
    ("evidence_id" IS NULL     AND "note_id" IS NOT NULL)
  );
```

---

### 4.7 Note
Free-form analyst notes with three visibility tiers:

| Visibility | Min Role | Purpose |
|---|---|---|
| `INTERNAL` | `ANALYST` | Standard case notes |
| `RESTRICTED` | `SENIOR_ANALYST` | Sensitive deliberations |
| `CONFIDENTIAL` | `ADMIN` | Legal / HR / executive-only |

Pinned notes (`isPinned: true`) surface at the top of the case feed.

---

### 4.8 Verdict
The final determination. At most **one verdict per case** (`@unique` on `caseId`). `expiresAt` supports time-limited penalties (e.g., a 30-day ban). `rationale` is required for accountability.

---

### 4.9 Tag & CaseTag
Flexible labels (e.g., `"aimbot"`, `"wallhack"`, `"boosting"`) applied to cases via the `CaseTag` join table. Tags are shared globally and managed by admins. Each tag carries a hex `color` for UI badge rendering.

---

### 4.10 AuditLog
Append-only immutable log of every state-changing action. Captures `before` / `after` JSON snapshots for forensic reconstruction. Enforce immutability with a DB trigger rejecting `UPDATE` / `DELETE` on `audit_logs`.

**Recommended action constants:**
```typescript
export const AuditActions = {
  CASE_CREATED:            "CASE_CREATED",
  CASE_STATUS_CHANGED:     "CASE_STATUS_CHANGED",
  CASE_ASSIGNED:           "CASE_ASSIGNED",
  CASE_CLOSED:             "CASE_CLOSED",
  EVIDENCE_UPLOADED:       "EVIDENCE_UPLOADED",
  EVIDENCE_STATUS_CHANGED: "EVIDENCE_STATUS_CHANGED",
  NOTE_CREATED:            "NOTE_CREATED",
  NOTE_DELETED:            "NOTE_DELETED",
  VERDICT_RENDERED:        "VERDICT_RENDERED",
  USER_ROLE_CHANGED:       "USER_ROLE_CHANGED",
} as const;
```

---

## 5. Relationships Summary

| From | Cardinality | To | Notes |
|---|---|---|---|
| `User` | 1 : many | `Case` (opened) | A user may open many cases |
| `User` | 1 : many | `Case` (assigned) | A user may be assigned many cases |
| `User` | 1 : many | `Report / Evidence / Note / Verdict` | Authorship relations |
| `Case` | 1 : many | `Subject / Report / Evidence / Note` | Core case contents |
| `Case` | 1 : 1 | `Verdict` | At most one verdict per case |
| `Case` | many : many | `Tag` | Via `CaseTag` join table |
| `Evidence` | 1 : many | `Attachment` | File attachments on evidence |
| `Note` | 1 : many | `Attachment` | File attachments on notes |

---

## 6. Enum Reference

### `CasePriority` with SLA targets

| Value | SLA | Description |
|---|---|---|
| `LOW` | 30 days | Routine / low-confidence |
| `MEDIUM` | 14 days | Standard investigation |
| `HIGH` | 5 days | Credible evidence; active cheating suspected |
| `CRITICAL` | 24 hours | Confirmed, ongoing, or high-impact |

*(Full enum tables for `UserRole`, `CaseStatus`, `ReportSource`, `EvidenceType`, `EvidenceStatus`, `VerdictOutcome`, and `NoteVisibility` are included in the complete document.)*

---

## 7. Design Decisions & Conventions

**CUID primary keys** — URL-safe, time-sortable, non-guessable. Safer than sequential integers for a security-sensitive platform.

**Soft deletes** — `deletedAt` on `User`, `Case`, `Evidence`, and `Note` preserves referential integrity and enables data recovery. Apply a global Prisma middleware to filter `WHERE deletedAt IS NULL` by default:
```typescript
prisma.$use(async (params, next) => {
  const softDeleteModels = ["User", "Case", "Evidence", "Note"];
  if (softDeleteModels.includes(params.model ?? "") && params.action === "findMany") {
    params.args.where = { ...params.args.where, deletedAt: null };
  }
  return next(params);
});
```

**Immutable AuditLog** — Never update or delete rows. Enforce at the DB layer with a trigger that rejects `UPDATE`/`DELETE` on `audit_logs`.

**`metadata` JSONB** — PostgreSQL JSONB on `Case`, `Subject`, and `Evidence` for platform-specific extensibility without schema migrations. Examples:
- `Case.metadata`: `{ "gameTitle": "Apex Legends", "matchId": "abc123" }`
- `Subject.metadata`: `{ "rank": "Diamond IV", "hoursPlayed": 1240 }`
- `Evidence.metadata`: `{ "sha256": "e3b0c44...", "durationSeconds": 47 }`

---

*End of CCIP Data Model Reference*
