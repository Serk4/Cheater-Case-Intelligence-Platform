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
Instead of building anti‑cheat detection, CCIP focuses on **case intelligence**:

- structured report ingestion  
- evidence analysis  
- cross‑report correlation  
- confidence scoring  
- reviewer workflows  

The initial target use case is **Tom Clancy’s The Division 2**, but the platform is intentionally game‑agnostic and reusable for future titles (including Division 3).

## Core Goals

- Reduce manual review time for player‑submitted cheating reports  
- Improve consistency and accuracy of case decisions  
- Provide AI‑assisted evidence summaries and metadata extraction  
- Correlate multiple reports about the same player or incident  
- Deliver a clean reviewer dashboard for triage and audit history  
- Remain game‑agnostic and reusable across titles  

## Project Structure

```
.
├── backend/      # NestJS + Prisma + PostgreSQL + Redis
├── frontend/     # React + Vite + MUI
└── shared/       # Shared TypeScript types
```

## TODO

### Backend Infrastructure
- [x] Configure PostgreSQL connection string in `backend/.env`
- [ ] Configure Redis connection in `backend/.env`
- [x] Run `npx prisma migrate dev` to apply initial schema
- [x] Add full Prisma schema (v2.0.0) with all domain models
- [x] Implement seed file for initial Game / Platform / ViolationType / SanctionTemplate / IntegrationSource data

### Backend CRUD Modules (Completed)
- [x] Game CRUD
- [x] Platform CRUD
- [x] ViolationType CRUD
- [x] SanctionTemplate CRUD
- [x] IntegrationSource CRUD
- [x] Case CRUD
- [x] Subject CRUD
- [x] Report CRUD
- [x] Evidence CRUD
- [x] Note CRUD
- [x] Verdict CRUD
- [x] CaseViolationType CRUD (composite PK)
- [x] AuditLog CRUD

### Backend Logic (Next Steps)
- [x] Implement report ingestion logic (`backend/src/modules/reports/`)
- [ ] Implement evidence upload & storage (`backend/src/modules/evidence/`)
- [ ] Implement case workflow logic (status transitions, assignments)
- [ ] Implement AI analysis pipeline (`backend/src/modules/ai/`)
- [ ] Implement user authentication (JWT/OAuth)
- [ ] Implement role-based access control (RBAC)
- [ ] Add audit logging middleware
- [ ] Add global exception filters + validation pipes
- [ ] Add Swagger/OpenAPI documentation

### Frontend
- [ ] Build Dashboard page (`frontend/src/pages/Dashboard.tsx`)
- [ ] Build Case View page (`frontend/src/pages/CaseView.tsx`)
- [ ] Build Report Intake form (`frontend/src/pages/ReportIntake.tsx`)
- [ ] Add authentication flow (login, logout, roles)
- [ ] Integrate backend API with frontend pages

### Testing
- [ ] Add unit tests for backend modules
- [ ] Add integration tests for API endpoints
- [ ] Add end-to-end tests

## Roadmap

- Report ingestion API  
- Evidence processing queue  
- AI summarization service  
- Case correlation engine  
- Reviewer dashboard (MUI)  
- Exportable case packets for studio review  
- Pilot demo for The Division 2  

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DB / Redis credentials
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Contributing

This project is in early development. Contributions, ideas, and discussions are welcome as the platform evolves.

## License

MIT — free for personal and commercial use.
