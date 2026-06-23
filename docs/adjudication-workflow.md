# CCIP Adjudication Workflow  

## Purpose
This document defines the **end‑to‑end workflow** for how CCIP (Cheater Case Intelligence Platform) processes cheating reports from initial submission through final adjudication.  
It blends **business logic** (what the system accomplishes) with **technical flow** (how the system behaves), serving as the guiding reference for developers, designers, and stakeholders.

---

# 1. Report Intake (User → CCIP)

## Business View
Players submit cheating reports through in‑game UI or a web form. Reports may include:

- Accused player
- Reporter identity
- Description of incident
- Timestamp
- Optional evidence (clip, screenshot, log, etc.)

Goal: **Capture raw accusations quickly and reliably.**

## Technical View
Incoming reports are normalized into:

```ts
Report {
  id
  description
  createdAt
  reportedBy { id, displayName }
  attachments: Attachment[]
}
```

Evidence files are uploaded to storage and linked via Attachment.

## Future AI Hooks
- Auto‑classify report type (aimbot, ESP, griefing, etc.)

- Auto‑extract metadata from text

- Auto‑score reporter credibility


---

# **📘 Section 2 — Case Creation & Correlation**

# 2. Case Creation & Correlation

## Business View
Multiple reports about the **same accused player** are grouped into a single **Case**.  
A Case is the primary unit of investigation.

Example:  
12 reports about “xXShadowAimXx” → 1 Case with 12 Reports.

## Technical View
CaseData structure:

```ts
CaseData {
  id
  caseNumber
  title
  description
  status: "Pending" | "In Review" | "Completed"
  priority
  createdAt
  evidence?: Evidence[]
  reports?: Report[]
}
```

Correlation logic (future):

- Match by accused player ID

- Match by match ID

- Match by timestamp proximity

## Future AI Hooks
- Auto‑merge duplicate cases

- Auto‑detect “high‑volume cheater” clusters


---

# **📘 Section 3 — Analyst Review (CaseView UI)**

# 3. Analyst Review (CaseView UI)

## Business View
An analyst opens a case and reviews:

- Case summary
- All reports
- All evidence
- All attachments
- Reporter credibility
- Cross‑report consistency

This is the core adjudication workflow.

## Technical View
CaseView provides:

- Reports panel
- Evidence panel
- Evidence viewer modal
- Navigation between evidence items
- Attachment viewer (future)
- Notes (future)
- Tags (future)

Evidence viewer supports:

- Images
- Videos
- Text (via iframe)
- Attachments (coming next)

## Future AI Hooks
- Auto‑summaries of evidence
- Highlight suspicious moments in clips
- Detect inconsistencies across reports

# 4. Evidence Evaluation

## Business View
Analysts must inspect **every piece of evidence** before issuing a verdict.

Evidence may include:

- Primary clip
- Screenshots
- Logs
- Metadata dumps
- Replay files
- PDFs
- Zipped attachments

This is why **Attachment Preview + Download** is essential.

## Technical View
Evidence:

```ts
Evidence {
  id
  type
  description
  createdAt
  attachments?: Attachment[]
}
```

Attachment:

```ts
Attachment {
  id
  fileName
  mimeType
  sizeBytes
  storageUrl
  createdAt
}
```

Viewer logic:

- If viewable → preview

- If not → download

- If unknown → fallback UI

## Future AI Hooks
- Auto‑parse logs

- Auto‑detect aim patterns

- Auto‑flag suspicious frames

- Auto‑score evidence strength


---

# **📘 Section 5 — Determination (Verdict)**

# 5. Determination (Verdict)

## Business View
Analyst chooses one:

- **Guilty** → ban
- **Not enough evidence** → close case
- **Needs more info** → request more evidence
- **False report** → mark reporter as low‑credibility

## Technical View
Verdict model (future):

```ts
Verdict {
  caseId
  reviewerId
  decision
  notes
  createdAt
}
```

Case status transitions:

Pending → In Review → Completed

## Future AI Hooks
- Auto‑suggest verdict

- Confidence scoring

- Anomaly detection


---

# **📘 Section 6 — Finalization**

# 6. Finalization

## Business View
Once a verdict is issued:

- Case is closed
- Ban request may be sent to game backend
- Analytics updated
- Case archived

## Technical View
System updates:

- `Case.status = "Completed"`
- Verdict stored
- Audit log entry created
- Dashboard metrics updated

## Future AI Hooks
- Auto‑generate case summary
- Auto‑generate ban rationale
- Auto‑update player risk score

# 7. Future AI Augmentation (Vision)

## Business View
AI becomes a **co‑analyst**, not a replacement.

AI assists with:

- Clustering reports
- Summarizing evidence
- Detecting cheating patterns
- Scoring confidence
- Recommending verdicts

Human approval remains mandatory.

## Technical View
AI modules (future):

- NLP for report text
- CV for video/image analysis
- ML for pattern detection
- Graph clustering for multi‑report correlation
