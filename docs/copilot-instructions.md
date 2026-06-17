# Copilot Instructions

## Project Architecture
- Frontend: React + Vite + MUI v5
- Backend: NestJS + Prisma + PostgreSQL
- Database: PostgreSQL on port 5433, database name `ccip`
- API style: REST, not GraphQL

## Coding Standards
- Use functional components only
- Use TypeScript everywhere
- Use React Query for data fetching
- Use Zod for validation
- Use async/await, never .then()
- Keep PRs small and atomic

## Backend Standards
- Use NestJS module/service/controller structure
- Use Prisma for all DB access
- Never write raw SQL unless explicitly asked
- Generate DTOs using class-validator + class-transformer

## Frontend Standards
- Use MUI components
- Use responsive design (mobile-first)
- Use custom hooks for data logic
- Keep components small and focused

## PR Expectations
- Do not scaffold more than requested
- Do not create placeholder logic unless asked
- Follow existing folder structure
- Keep changes minimal and intentional
