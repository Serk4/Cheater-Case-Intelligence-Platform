# CCIP Data Model

This document summarizes the current Prisma data model and the example seed dataset used by the repository.

Canonical sources:

- `/home/runner/work/Cheater-Case-Intelligence-Platform/Cheater-Case-Intelligence-Platform/backend/prisma/schema.prisma`
- `/home/runner/work/Cheater-Case-Intelligence-Platform/Cheater-Case-Intelligence-Platform/backend/prisma/seed.ts`

---

## Overview

CCIP is modeled around a single core workflow:

1. configure a game and its moderation vocabulary
2. open a case for a suspected cheating incident
3. attach subjects, reports, evidence, notes, verdicts, and audit history to that case

Most game-specific concepts are stored in configuration tables rather than hardcoded enums so the same schema can support more than one title.

---

## Enums

### `UserRole`

- `VIEWER`
- `ANALYST`
- `SENIOR_ANALYST`
- `ADMIN`

### `CaseStatus`

- `OPEN`
- `UNDER_REVIEW`
- `PENDING_EVIDENCE`
- `ESCALATED`
- `CLOSED`
- `DISMISSED`

### `CasePriority`

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

### `EvidenceType`

- `SCREENSHOT`
- `VIDEO`
- `LOG_FILE`
- `REPLAY_FILE`
- `EXTERNAL_REPORT`
- `API_DATA`
- `OTHER`

### `EvidenceStatus`

- `PENDING_REVIEW`
- `VERIFIED`
- `DISPUTED`
- `REJECTED`

### `NoteVisibility`

- `INTERNAL`
- `RESTRICTED`
- `CONFIDENTIAL`

---

## Entity Reference

| Entity | Purpose | Key relations |
| --- | --- | --- |
| `Game` | Top-level tenant/title definition | Has many `Platform`, `ViolationType`, `SanctionTemplate`, `IntegrationSource`, `Case` |
| `Platform` | External identity platform for subjects | Belongs to optional `Game`; has many `Subject` |
| `ViolationType` | Game-specific cheating taxonomy | Belongs to `Game`; linked to `Case` through `CaseViolationType` |
| `CaseViolationType` | Join table between `Case` and `ViolationType` | Composite primary key on `caseId + violationTypeId` |
| `SanctionTemplate` | Reusable penalty template | Belongs to `Game`; used by `Verdict` |
| `IntegrationSource` | Source system for reports | Belongs to `Game`; referenced by `Report` |
| `User` | Internal or system actor | Can open/own cases, file reports, upload evidence, write notes, render verdicts, generate audit logs |
| `Case` | Central investigation record | Belongs to `Game`; links to nearly all operational tables |
| `Subject` | A player/account involved in a case | Belongs to `Case`; references `Platform` |
| `Report` | A player or system report tied to a case | Belongs to `Case`; references `User` and optional `IntegrationSource` |
| `Evidence` | Evidence item collected for a case | Belongs to `Case`; references uploading `User`; has many `Attachment` |
| `Attachment` | File metadata for evidence or notes | Belongs to either one `Evidence` or one `Note` |
| `Note` | Analyst commentary on a case | Belongs to `Case`; references author `User`; has many `Attachment` |
| `Verdict` | Final sanction decision for a case | One-to-one with `Case`; references `SanctionTemplate` and rendering `User` |
| `AuditLog` | Append-only activity history | Optional links to `User` and `Case` |

---

## Relationship Summary

```text
Game
├── Platform
├── ViolationType
├── SanctionTemplate
├── IntegrationSource
└── Case
    ├── Subject -> Platform
    ├── Report -> User, IntegrationSource?
    ├── Evidence -> User
    │   └── Attachment
    ├── Note -> User
    │   └── Attachment
    ├── Verdict -> SanctionTemplate, User
    ├── CaseViolationType -> ViolationType
    └── AuditLog -> User?
```

Important model constraints:

- `Case.caseNumber` is unique
- `Verdict.caseId` is unique, so a case can have at most one verdict
- `Attachment.storageKey` is unique
- `CaseViolationType` uses a composite primary key
- `Platform.slug` is globally unique
- `ViolationType`, `SanctionTemplate`, and `IntegrationSource` are unique per game via composite keys

---

## Operational Tables

### Configuration Layer

These tables define per-game moderation vocabulary:

- `Game`
- `Platform`
- `ViolationType`
- `SanctionTemplate`
- `IntegrationSource`

They are seeded before case data and can be reused across many cases.

### Case Layer

These tables represent the active investigation workflow:

- `Case`
- `Subject`
- `Report`
- `Evidence`
- `Attachment`
- `Note`
- `Verdict`
- `AuditLog`
- `CaseViolationType`

Every operational record is either directly attached to a case or attached to something that is case-owned.

---

## Seed Dataset Snapshot

The current seed is designed to create **exactly one case** with supporting rows across the rest of the schema.

### Seeded configuration

- `Game`: The Division 2
- `Platform`: Ubisoft Connect, Xbox Live
- `ViolationType`: Aimbot, Wallhack, Exploiting
- `SanctionTemplate`: Permanent Ban, 7-Day Suspension, Warning
- `IntegrationSource`: In-Game Report System, Customer Support Portal

### Seeded users

- one analyst user
- one senior analyst / reviewer user
- one system ingest user

### Seeded case graph

The single seeded case includes:

- 1 `Case`
- 2 `Subject` rows
- 2 `Report` rows
- 2 `CaseViolationType` rows
- 1 `Evidence` row
- 2 `Attachment` rows
  - 1 attached to evidence
  - 1 attached to a note
- 2 `Note` rows
- 1 `Verdict`
- multiple `AuditLog` rows

This makes the seed useful for:

- exercising the case detail endpoint
- testing case list/detail rendering in the frontend
- validating the relational shape of the schema

---

## Seeded Case Walkthrough

The example case represents a suspected cheating incident in The Division 2:

1. an analyst opens a case
2. the case is assigned to a senior analyst
3. an accused subject and a reporting subject are attached to the case
4. one automated/system-style report and one manual follow-up report are linked
5. the case is tagged with seeded violation types
6. an evidence record is created with an attachment
7. analyst notes are added, including a note attachment
8. a verdict references a seeded sanction template
9. audit logs capture the major actions

---

## Notes About the Current Model

- The schema already supports soft deletion on several operational tables through `deletedAt`
- `Attachment` is intentionally polymorphic between `Evidence` and `Note`
- `IntegrationSource.apiKeyHash` stores hashed values only; plaintext keys should never be persisted
- `Case.metadata`, `Subject.metadata`, and `Evidence.metadata` allow title-specific extensions without schema churn
- The schema supports auth roles, but authentication and authorization are not fully implemented at the application layer yet

---

## Known Gaps Between Model and Application

The schema is ahead of the current service layer in a few places:

- there is no dedicated `Game` API module yet
- there is no dedicated `Attachment` API module yet
- evidence storage URLs are modeled, but durable storage is not fully wired
- audit log rows are modeled and seedable, but automatic middleware/hooks are not in place
- the AI module does not yet persist analysis outputs into the schema

These gaps are application-level implementation gaps, not data-model gaps.
