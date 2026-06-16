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

- [ ] Configure PostgreSQL connection string in `backend/.env`
- [ ] Configure Redis connection in `backend/.env`
- [ ] Run `npx prisma migrate dev` to apply initial schema
- [ ] Implement report ingestion logic in `backend/src/modules/reports/`
- [ ] Implement evidence upload & storage in `backend/src/modules/evidence/`
- [ ] Implement case management in `backend/src/modules/cases/`
- [ ] Implement AI analysis pipeline in `backend/src/modules/ai/`
- [ ] Implement user auth & roles in `backend/src/modules/users/`
- [ ] Build Dashboard page in `frontend/src/pages/Dashboard.tsx`
- [ ] Build Case View page in `frontend/src/pages/CaseView.tsx`
- [ ] Build Report Intake form in `frontend/src/pages/ReportIntake.tsx`
- [ ] Add authentication (JWT / OAuth) across backend + frontend
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
