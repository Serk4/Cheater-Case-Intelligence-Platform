# Architecture Overview

Cheater Case Intelligence Platform (CCIP) is currently implemented as a TypeScript monorepo with:

- a NestJS backend in `/home/runner/work/Cheater-Case-Intelligence-Platform/Cheater-Case-Intelligence-Platform/backend`
- a React + Vite frontend in `/home/runner/work/Cheater-Case-Intelligence-Platform/Cheater-Case-Intelligence-Platform/frontend`
- Prisma as the backend data access layer

This document reflects the code that exists today, not the long-term target architecture.

---

## Current High-Level Shape

```text
[ React + Vite frontend ]
  - App shell with left-nav routing, login/signup, protected routes
  - Dashboard page with reviewer queue, metrics, and AI confidence scores
  - Cases list page (React Query)
  - Case detail page with subjects, evidence, reports, notes, verdict, AI panel
  - Report Intake form (Zod validation, wired to ingest endpoint)
  - Shared API client (auth-aware, JWT bearer tokens)
  - AuthContext (JWT storage, role helpers)
            |
            v
[ NestJS API ]
  - CRUD modules for all schema models
  - Case aggregate/detail endpoints
  - Report ingestion endpoint (triggers AI triage if enabled)
  - Note creation + soft delete flow
  - Evidence upload metadata flow
  - JWT authentication + RBAC (4-tier role system)
  - Audit logging middleware
  - Workflow rules (status transitions, assignment)
  - AI triage service (OpenAI integration, toggleable via AI_ENABLED)
  - Config endpoint (/config) exposing feature flags
            |
            v
[ PostgreSQL via Prisma ]
  - Core case-management schema
  - AiAnalysis model for persisting AI triage results
  - Seeded single-case example dataset

Not yet implemented:
  - Redis
  - Durable object storage
  - Production AI providers beyond OpenAI stub
```

---

## Backend Architecture

### Application Composition

`backend/src/app.module.ts` currently composes these modules:

- `ReportsModule`
- `EvidenceModule`
- `CasesModule`
- `AiModule`
- `UsersModule`
- `PlatformsModule`
- `ViolationTypesModule`
- `SanctionTemplatesModule`
- `IntegrationSourcesModule`
- `SubjectsModule`
- `NotesModule`
- `VerdictsModule`
- `CaseViolationTypesModule`
- `AuditLogsModule`
- `PrismaModule`

Notably, there is **no `GamesModule` yet**, so game data exists in the Prisma schema and seed data but does not currently have its own REST surface.

### API Behavior in Place

The backend is not just raw CRUD anymore:

- `ReportsService.ingestFromIntegration()` validates related entities and creates reports through `POST /reports/ingest`
- `CasesService.getCaseById()` returns an aggregated case view with subjects, reports, evidence, notes, verdict, and flattened violation types
- `CasesService.listCases()` supports filtering and pagination for case search
- `CasesService.createNote()` auto-pins the first note in a case
- `CasesService.softDeleteNote()` performs note soft deletion
- `CasesService.createEvidence()` creates evidence and attachment metadata records for uploaded files

### Cross-Cutting Runtime Configuration

`backend/src/main.ts` currently provides:

- global `ValidationPipe`
- JSON and URL-encoded request parsing
- CORS for the Vite dev server at `http://localhost:5173`
- static file serving from `/uploads`

Missing cross-cutting pieces:

- global exception filters
- auth guards
- RBAC enforcement
- Swagger/OpenAPI
- Redis-backed queues/caching

### Evidence Handling Today

Evidence upload support is only partially complete:

- the `cases` controller accepts multipart uploads with file type and size checks
- the service writes `Evidence` and `Attachment` database records
- attachment URLs are shaped as `/uploads/...`

What is still missing:

- durable local disk persistence or object storage wiring
- background processing
- metadata extraction
- thumbnail generation

### AI Module Status

The AI module exists as a placeholder service. It exposes stub methods for:

- evidence analysis
- case risk scoring

There is no external model provider, queue, cache, or persistence flow connected yet.

---

## Frontend Architecture

### Implemented UI Structure

The frontend is a single React application with `BrowserRouter` and a permanent left navigation drawer.

Implemented routes:

- `/` → `Dashboard`
- `/cases` → `Cases`
- `/cases/:id` → `CaseView`
- `/reports` → `ReportIntake`

### Current Page Status

- `Dashboard.tsx` is a shell page
- `Cases.tsx` fetches and lists backend cases
- `CaseView.tsx` fetches a case by id and renders evidence/report sections
- `ReportIntake.tsx` is a shell page

The current frontend uses direct `fetch()` calls inside pages. There is no shared API client, React Query layer, auth state, or route protection yet.

---

## Data Layer

### Database

Prisma targets PostgreSQL and models the full case-review domain:

- configuration tables (`Game`, `Platform`, `ViolationType`, `SanctionTemplate`, `IntegrationSource`)
- operational tables (`Case`, `Subject`, `Report`, `Evidence`, `Attachment`, `Note`, `Verdict`, `AuditLog`)
- users and role enums

The canonical schema lives in:

- `/home/runner/work/Cheater-Case-Intelligence-Platform/Cheater-Case-Intelligence-Platform/backend/prisma/schema.prisma`

### Seed Data

`backend/prisma/seed.ts` is intended to provide:

- baseline game configuration for The Division 2
- a single fully-related example case
- linked users, subjects, reports, evidence, attachments, notes, verdict, violation mappings, and audit logs

This gives both the backend and frontend a realistic relational dataset without seeding multiple cases.

---

## Current Request Flows

### Case Review Flow

1. Frontend requests `/cases` or `/cases/:id`
2. `CasesService` loads relational Prisma data
3. Backend returns aggregated case data
4. Frontend renders reports and evidence sections

### Report Ingestion Flow

1. A client calls `POST /reports/ingest`
2. Backend validates the case, reporting user, and optional integration source
3. Prisma writes the `Report`
4. The report becomes visible through case detail endpoints

### Evidence Upload Flow

1. A client posts multipart form data to `POST /cases/evidence`
2. Controller validates file type and size
3. Service creates `Evidence`
4. Service creates related `Attachment` metadata
5. Generated URLs assume uploaded content is available under `/uploads`

---

## Immediate Architecture Gaps

The next meaningful architecture increments are:

1. Add automated tests (backend unit + integration, frontend component, E2E)
2. Restore lint tooling for both backend and frontend
3. Fix the concurrency-safe case number generator
4. Replace metadata-only evidence handling with real durable storage

---

## Summary

Today CCIP is best described as an **early vertical slice**:

- the schema is broad
- most core entities have CRUD APIs
- case detail and report ingestion flows exist
- the frontend can browse and inspect case data

The platform is **not** yet production-ready because auth, Redis, durable evidence storage, testing depth, and the real AI pipeline are still outstanding.
