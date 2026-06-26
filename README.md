<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-blueviolet?style=for-the-badge" />
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

- Backend exposes Prisma-backed CRUD modules for most core entities
- Case APIs include aggregate detail, search/filtering, note creation, note soft-delete, and evidence upload metadata handling
- Report ingestion endpoint exists at `POST /reports/ingest`
- Frontend has an app shell plus `Dashboard`, `Cases`, `CaseView`, and `ReportIntake` routes
- Global NestJS validation pipes and CORS are configured
- Redis, authentication, RBAC, Swagger, and production-grade AI/evidence pipelines are not implemented yet

## TODO

### Backend Infrastructure
- [x] Configure PostgreSQL connection string in `backend/.env`
- [ ] Configure Redis connection in `backend/.env` and wire a Redis module into NestJS
- [x] Run `npx prisma migrate dev` to apply the initial schema
- [x] Add the Prisma schema with domain models, enums, and relations
- [x] Seed baseline configuration data plus one fully-related example case in `backend/prisma/seed.ts`
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
- [ ] Add formal case workflow rules for status transitions, assignment, escalation, and closure
- [ ] Add audit logging middleware/hooks for case activity
- [x] Add global validation pipes
- [ ] Add global exception filters
- [ ] Add Swagger/OpenAPI documentation
- [ ] Implement user authentication (JWT/OAuth)
- [ ] Implement role-based access control (RBAC)
- [ ] Replace AI service stubs with a real provider-backed analysis pipeline

### Frontend
- [x] Create the application shell and route navigation (`frontend/src/App.tsx`)
- [x] Build the Cases list page (`frontend/src/pages/Cases.tsx`)
- [x] Integrate basic case list/detail fetching with the backend API
- [ ] Flesh out the Dashboard page with reviewer metrics and queue views
- [ ] Finish the Case View page with subjects, notes, verdicts, and working attachment previews
- [ ] Build the Report Intake form and submit flow
- [ ] Add a shared frontend API/data layer instead of page-local `fetch` calls
- [ ] Add authentication flow and route guards

### Testing & Quality
- [ ] Restore frontend lint tooling so `npm run lint` works locally
- [ ] Add backend unit tests
- [ ] Add backend API integration tests
- [ ] Add frontend component/page tests
- [ ] Add end-to-end tests for reviewer workflows

## Delivery Plan

### Phase 1 — Stabilize the foundation
1. Restore lint/test dependencies and make local validation reliable
2. Finish missing Game and Attachment CRUD coverage
3. Add Swagger and exception handling so the current API surface is easier to use safely

### Phase 2 — Complete the reviewer workflow backend
1. Persist uploads correctly
2. Add workflow rules for case assignment and status transitions
3. Add audit logging around reviewer actions
4. Add authentication and RBAC

### Phase 3 — Complete the reviewer workflow frontend
1. Finish Dashboard, Case View, and Report Intake
2. Replace ad hoc `fetch` calls with a shared API layer
3. Add auth-aware navigation and protected routes

### Phase 4 — Add intelligence and hardening
1. Integrate a real AI provider
2. Add automated tests across backend, frontend, and end-to-end flows
3. Expand storage/queue integrations for production readiness

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

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Documentation

- `/home/runner/work/Cheater-Case-Intelligence-Platform/Cheater-Case-Intelligence-Platform/docs/architecture.md`
- `/home/runner/work/Cheater-Case-Intelligence-Platform/Cheater-Case-Intelligence-Platform/docs/data-model.md`

## Contributing

This project is in early development. Contributions, ideas, and discussions are welcome as the platform evolves.

## License

MIT — free for personal and commercial use.
