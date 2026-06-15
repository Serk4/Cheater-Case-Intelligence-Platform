# Cheater Case Intelligence Platform (CCIP)

CCIP is a triage and evidence‑analysis platform for player‑reported cheating in online games.

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

