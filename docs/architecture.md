# Architecture Overview  
Cheater Case Intelligence Platform (CCIP)

CCIP is a modular, service‑oriented platform designed to ingest player‑submitted cheating reports, analyze evidence, correlate related incidents, and present structured cases for human review. The system is intentionally game‑agnostic and reusable across multiple online titles.

---

## High-Level Architecture

The platform consists of three major layers:

### **1. Frontend (React + Vite + MUI)**
- Dashboard for triage and case overview  
- Case Viewer for evidence review and AI summaries  
- Report Intake form  
- Authentication and role-based access control  

### **2. Backend (NestJS)**
Organized into domain-driven modules:

- **Reports Module**  
  Handles report ingestion, validation, and normalization.

- **Evidence Module**  
  Manages uploads, metadata extraction, and storage.

- **Cases Module**  
  Correlates related reports, computes confidence scores, and manages case lifecycle.

- **AI Module**  
  Performs summarization, anomaly detection, and clustering.

- **Users Module**  
  Provides authentication, authorization, and audit logging.

### **3. Data Layer**
- **PostgreSQL** — primary relational database  
- **Redis** — queues for async processing and caching  
- **Object Storage** — video evidence, screenshots, thumbnails  

---

## System Diagram (Text-Based)

The following diagram shows how the frontend, backend, and data layers interact:

```md
[ Frontend (React) ]
- Dashboard
- Case Viewer
- Report Intake
- Auth UI
|
v
[ Backend API (NestJS) ]
- Reports Module
- Evidence Module
- Cases Module
- AI Module
- Users Module
|
v
[ Data Layer ]
- PostgreSQL (structured data)
- Redis (queues + cache)
- Object Storage (evidence files)
```


---

## Backend Architecture Details

### **Reports Module**
- Accepts player-submitted reports  
- Normalizes metadata (player ID, timestamps, region, platform)  
- Validates evidence references  
- Emits processing jobs to Redis queues  

### **Evidence Module**
- Handles video/image uploads  
- Extracts metadata (duration, resolution, timestamps)  
- Stores files in object storage  
- Generates preview thumbnails (future enhancement)  

### **Cases Module**
- Groups related reports  
- Correlates by player, timestamp, region, or behavioral pattern  
- Computes confidence scores  
- Tracks case lifecycle (open → triaged → actioned)  

### **AI Module**
- Summarizes video evidence  
- Extracts suspicious behavior indicators  
- Clusters similar reports  
- Provides anomaly scoring  

### **Users Module**
- Authentication (JWT/OAuth planned)  
- Role-based access (reviewer, admin, auditor)  
- Audit logging  

---

## Frontend Architecture Details

### **Pages**
- **Dashboard** — triage queue, filters, case metrics  
- **Case View** — evidence viewer, metadata, AI summaries  
- **Report Intake** — internal/external report submission  

### **Shared Components**
- Evidence viewer  
- Case metadata panel  
- Confidence score indicator  
- Role-based UI guards  

### **State Management**
- React Query recommended for server state  
- Minimal global state  

---

## Data Flow

### **1. Report Intake**
1. User submits report  
2. Backend validates and stores metadata  
3. Evidence (if any) is uploaded  
4. Processing job is queued  

### **2. Evidence Processing**
1. Worker extracts metadata  
2. AI module summarizes content  
3. Results stored in DB  

### **3. Case Correlation**
1. New report triggers correlation logic  
2. System groups related reports  
3. Case confidence score updated  

### **4. Reviewer Workflow**
1. Reviewer sees prioritized cases  
2. Opens case → views evidence + AI summary  
3. Takes action (flag, escalate, close)  

---

## Technology Choices

### **NestJS**
- Strong module boundaries  
- Built-in validation, DI, and testing  
- Enterprise-friendly  

### **Prisma + PostgreSQL**
- Clean schema  
- Strong relational modeling  
- Easy migrations  

### **Redis**
- Fast queues for evidence processing  
- Caching for repeated lookups  

### **React + Vite + MUI**
- Fast dev environment  
- Clean, modern UI  
- Easy to scale  

---

## Future Enhancements

- Webhooks for ingesting reports from external systems  
- Multi-game support with per-title configuration  
- Reviewer analytics dashboard  
- Automated case packet export (PDF/JSON)  
- Integration with studio moderation tools  

---

## Summary

CCIP is built as a scalable, modular platform focused on **case intelligence**, not anti-cheat detection.  
Its architecture supports:

- high-volume report ingestion  
- structured evidence analysis  
- AI-assisted triage  
- cross-report correlation  
- reviewer-friendly workflows  

This document will evolve as the platform grows.
