<p align="center">
  <img src="https://img.shields.io/badge/Status-Phase%204%20Complete-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-NestJS-red?style=for-the-badge&logo=nestjs" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/AI-Pipeline-orange?style=for-the-badge&logo=openai" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/last-commit/Serk4/Cheater-Case-Intelligence-Platform?style=flat-square" />
  <img src="https://img.shields.io/github/languages/top/Serk4/Cheater-Case-Intelligence-Platform?style=flat-square" />
  <img src="https://img.shields.io/github/repo-size/Serk4/Cheater-Case-Intelligence-Platform?style=flat-square" />
</p>

# Cheater Case Intelligence Platform (CCIP)

CCIP is designed to help studios manage the operational burden of reviewing cheating reports.
Instead of building anti-cheat detection, CCIP focuses on **case intelligence**:

- structured report ingestion
- evidence analysis
- cross-report correlation
- confidence scoring
- reviewer workflows

The initial target use case is **Tom Clancy's The Division 2**, but the platform is intentionally game-agnostic and reusable for future titles.

## Core Goals

- Reduce manual review time for player-submitted cheating reports
- Improve consistency and accuracy of case decisions
- Provide AI-assisted evidence summaries and metadata extraction
- Correlate multiple reports about the same player or incident
- Deliver a clean reviewer dashboard for triage and audit history
- Remain game-agnostic and reusable across titles

## Project Structure

```text
.
├── backend/      # NestJS + Prisma + PostgreSQL
├── docs/         # Architecture and data-model reference docs
├── frontend/     # React + Vite + MUI
└── shared/       # Shared TypeScript types
```

## Current Implementation Snapshot

- ✅ Backend CRUD modules for all core entities (Games, Platforms, Cases, Reports, Evidence, Verdicts, Users, etc.)
- ✅ Case APIs with aggregate detail, search/filtering, note creation, soft-delete, and evidence upload
- ✅ Report ingestion endpoint at `POST /reports/ingest`
- ✅ Frontend with Dashboard, Cases list, CaseView, and ReportIntake routes
- ✅ Global NestJS validation pipes and CORS configured
- ✅ JWT-based user authentication with role-based access control
- ✅ Swagger/OpenAPI documentation at `/api`
- ✅ Audit logging for all case operations
- ✅ AI analysis integration (toggleable via AI_ENABLED flag)
- ⏳ Redis queue integration (planned for Phase 5)
- ⏳ Production-grade hardening (Phase 5 in progress)

## Delivery Status

### ✅ Phase 1 — Stabilize the foundation [COMPLETE]

1. ✅ Restore lint/test dependencies and make local validation reliable
2. ✅ Finish missing Game and Attachment CRUD coverage
3. ✅ Add Swagger and exception handling so the current API surface is easier to use safely

### ✅ Phase 2 — Complete the reviewer workflow backend [COMPLETE]

#### Phase 2.1: Upload Persistence
- ✅ Persist uploaded evidence files to durable local storage or object storage
- ✅ Attachment model and API surface complete

#### Phase 2.2: Workflow Rules
- ✅ Add formal case workflow rules for status transitions, assignment, escalation, and closure
- ✅ Case status transitions properly validated

#### Phase 2.3: Audit Logging
- ✅ Add audit logging middleware/hooks for case activity
- ✅ AuditLog CRUD and tracking complete

#### Phase 2.4: Authentication & RBAC
- ✅ Implement user authentication (JWT/OAuth)
- ✅ Implement role-based access control (RBAC)
- ✅ Four-tier role hierarchy (VIEWER, ANALYST, SENIOR_ANALYST, ADMIN)
- ✅ AuthGuard and RoleGuard implementation
- ✅ Protected endpoints with @Auth() decorator

### ✅ Phase 3 — Complete the reviewer workflow frontend [COMPLETE]

1. ✅ Finish Dashboard with reviewer metrics queue and case summary counts
2. ✅ Replace ad hoc `fetch` calls with a shared API layer (React Query + auth-aware client)
3. ✅ Add auth-aware navigation and protected routes (Login/signup UI, JWT storage, route guards)
4. ✅ Finish Case View page with subjects, AI panel, notes, verdicts, and evidence/attachment previews
5. ✅ Build Report Intake form and submit flow (wired to POST /reports/ingest, with Zod validation)

### ✅ Phase 4 — AI Triage (Toggleable Feature) [COMPLETE]

1. ✅ AI_ENABLED env var + `/config` endpoint — frontend reads flag to show/hide AI features
2. ✅ AiService with real OpenAI integration (provider abstraction, graceful fallback when disabled)
3. ✅ AI triage auto-triggered on report ingestion (async, non-blocking)
4. ✅ AI summary card + confidence badge in Case View
5. ✅ AI-scored cases surfaced at top of reviewer dashboard queue
6. ✅ Reviewer accept/modify/reject AI suggestions (audit-persisted in `AiAnalysis`)
7. ✅ `AiAnalysis` Prisma model added + migration applied

### 📋 Phase 5 — Quality & Hardening [IN PROGRESS]

1. ⏳ Add backend unit tests for core services (cases, reports, AI triage)
2. ⏳ Add backend API integration tests
3. ⏳ Add frontend component/page tests
4. ⏳ End-to-end test for the full report → AI triage → reviewer decision flow
5. ⏳ Restore lint tooling (`npm run lint`) for both backend and frontend
6. ⏳ Fix case number generator to be concurrency-safe (replace count-based with atomic upsert)

## TODO

### Backend Infrastructure

- [x] Configure PostgreSQL connection string in `backend/.env`
- [ ] Configure Redis connection in `backend/.env` and wire a Redis module into NestJS
- [x] Run `npx prisma migrate dev` to apply the initial schema
- [x] Add the Prisma schema with domain models, enums, and relations
- [x] Seed baseline configuration data plus two fully-related example cases in `backend/prisma/seed.ts`
- [ ] Restore backend lint/test tooling so `npm run lint` and `npm test` work locally

### Backend CRUD Modules

- [x] Game CRUD
- [x] Platform CRUD
- [x] ViolationType CRUD
- [x] SanctionTemplate CRUD
- [x] IntegrationSource CRUD
- [x] User CRUD
- [x] Case CRUD
- [x] Subject CRUD
- [x] Report CRUD
- [x] Evidence CRUD
- [x] Attachment CRUD
- [x] Note CRUD
- [x] Verdict CRUD
- [x] CaseViolationType CRUD (composite PK)
- [x] AuditLog CRUD

### Backend Logic

- [x] Implement report ingestion logic (`backend/src/modules/reports/`)
- [x] Implement case detail and case search endpoints (`backend/src/modules/cases/`)
- [x] Implement note creation and soft-delete flows (`backend/src/modules/cases/`)
- [x] Finish the Game and Attachment API surfaces
- [x] Persist uploaded evidence files to durable local storage or object storage
- [x] Add formal case workflow rules for status transitions, assignment, escalation, and closure
- [x] Add audit logging middleware/hooks for case activity
- [x] Add global validation pipes
- [x] Add global exception filters
- [x] Add Swagger/OpenAPI documentation
- [x] Implement user authentication (JWT/OAuth)
- [x] Implement role-based access control (RBAC)
- [x] Replace AI service stubs with a real provider-backed analysis pipeline

### Frontend

- [x] Create the application shell and route navigation (`frontend/src/App.tsx`)
- [x] Build the Cases list page (`frontend/src/pages/Cases.tsx`)
- [x] Integrate basic case list/detail fetching with the backend API
- [x] Flesh out the Dashboard page with reviewer metrics and queue views
- [x] Finish the Case View page with subjects, notes, verdicts, and working attachment previews
- [x] Build the Report Intake form and submit flow
- [x] Add a shared frontend API/data layer instead of page-local `fetch` calls
- [x] Add authentication flow and route guards

### Testing & Quality

- [ ] Restore frontend lint tooling so `npm run lint` works locally
- [ ] Add backend unit tests
- [ ] Add backend API integration tests
- [ ] Add frontend component/page tests
- [ ] Add end-to-end tests for reviewer workflows

These items are deferred. Implement only if deploying to production:

- Redis queue integration for async job processing
- Rate limiting and DDoS protection
- Data encryption at rest
- Compliance and security auditing
- Multi-region deployment strategy
- Observability stack (Prometheus, Grafana, ELK)
- Incident response automation
- Load testing and capacity planning
- ML-powered case prioritization (beyond basic AI triage)
- Cross-game pattern detection at scale
- Real-time anomaly detection

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DB / Redis credentials
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

#### Dev Login Credentials

After seeding, these accounts are available at `http://localhost:5173`:

| Email | Password | Role |
|---|---|---|
| `admin@ccip.local` | `Admin1234!` | ADMIN |
| `analyst.one@ccip.local` | `Analyst1234!` | ANALYST |
| `reviewer.one@ccip.local` | `Reviewer1234!` | SENIOR_ANALYST |

> ⚠️ These are development-only credentials. Do not use in production.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Documentation

| File | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | System architecture and current implementation state |
| [docs/data-model.md](docs/data-model.md) | Prisma schema, entity reference, and seed data |
| [docs/adjudication-workflow.md](docs/adjudication-workflow.md) | End-to-end case adjudication workflow |
| [docs/authentication.md](docs/authentication.md) | JWT auth, RBAC, and usage guide |
| [docs/copilot-instructions.md](docs/copilot-instructions.md) | AI coding conventions for this repo |
| [docs/AUTH_QUICK_REFERENCE.md](docs/AUTH_QUICK_REFERENCE.md) | Developer quick reference for auth patterns |
| [docs/SESSION_CHECKPOINT.md](docs/SESSION_CHECKPOINT.md) | Phase 1–2 session summary and test results |

## Contributing

This project is in early development. Contributions, ideas, and discussions are welcome as the platform evolves.

## License

MIT — free for personal and commercial use.
