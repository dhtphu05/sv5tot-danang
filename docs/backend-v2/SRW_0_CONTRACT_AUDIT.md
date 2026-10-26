# 5TOT ĐÀ NẴNG — SIMPLIFIED REVIEW WORKFLOW V2 ARCHITECTURAL AUDIT & CONTRACT FREEZE (SRW-0)
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Phase:** SRW-0 (Real Source Audit, Contract Freeze & State Mapping)  
**Database Mode:** OFFLINE Development Mode  
**Task Priority:** P0 — Customer-Validated Business Workflow Refactor  

---

## 1. EXECUTIVE SUMMARY & CUSTOMER VALIDATION BASELINE

Following real customer demonstrations with leadership and review officers of Hội Sinh viên Việt Nam TP. Đà Nẵng, three fundamental architectural alignments have been validated:

1. **CHANGE 1 — Shared Student Dossier UI**:
   - Reviewers at both School and City level must inspect the **EXACT SAME dossier presentation** that the Student uses (five criteria, requirement rows, declaration cards, evidence cells, regulation references).
   - Eliminates redundant, divergent review screens in favor of a unified, role-capable dossier foundation (`viewMode: 'STUDENT_EDIT' | 'STUDENT_SUBMITTED_READONLY' | 'SCHOOL_REVIEW' | 'CITY_OFFICER_REVIEW' | 'COMMITTEE_READONLY_OR_DECISION'`).

2. **CHANGE 2 — Exactly-Once School Batch Forwarding**:
   - Schools perform preliminary assessment of student applications in their scope.
   - Once prepared, the School reviews the complete selected list, attaches **ONE mandatory official School decision document**, confirms the batch, and forwards the entire selected list **EXACTLY ONCE** per authorized School Review Unit and award season.
   - For **Đại học Đà Nẵng (UDN)**: ONE shared School Review Unit (`unit-udn`) with ONE shared reviewer account forwards ONE consolidated batch covering all eight configured member institutions (DUT, DUE, UED, UFL, UTE, VKU, VNUK, SMP). Student institution identity is strictly preserved.

3. **CHANGE 3 — Simplified City Officer & Committee Review**:
   - Removal of obsolete intermediate constructs: Resolution Hub, ResolutionCase, separate escalation portals, and fictional Committee hearings.
   - City Officers inspect the assigned Student dossier, review criteria and evidence, request scoped supplementation if needed, and complete review.
   - City Committee inspects the Student dossier alongside recorded School recommendations, City Officer assessments, and decision documents to record authorized official recognition decisions.
   - AI remains an optional, unobtrusive assistant ("AI hỗ trợ rà soát") without auto-opening popups or mandatory guided review.

---

## 2. WORKFLOW COMPARISON: CURRENT VS TARGET

### Current Workflow (Fragmented & Ad-hoc Forwarding)
```
[Student Submits] 
       ↓
[School Review Queue] → [Individual Forwarding Button on Each Card]
       ↓ (Applications trickle to City one-by-one without common batch or decision file)
[City Intake] 
       ↓
[City Officer Workspace] (Divergent UI: Separate navigation panel, custom cards)
       ↓ (Optional Escalation to Resolution Hub / Needs Consideration flag)
[Resolution Hub] (Obsolete artificial queue)
       ↓
[Committee Workspace] (Divergent UI: Flag review queue, simulated hearing)
       ↓
[Official Publication]
```

### Approved Target Workflow (Unified Dossier & Atomic Batch Forwarding)
```
[Student Submits 5TOT Dossier]
       ↓
[School Preliminary Review in Shared Dossier UI]
       ↓ (Reviewer marks preliminary criteria verdicts & records recommendation)
[School Batch Preparation: "Chốt danh sách chuyển Thành phố"]
       ↓
   - Validates all selected candidates within School Review Unit
   - UDN: Consolidates DUT + DUE + UED + UFL + UTE + VKU + VNUK + SMP into ONE batch
   - Attaches mandatory official School Decision PDF (e.g. 182/QĐ-ĐHĐN)
   - Pre-forwarding validation summary (Total, Reviewed, Selected, Unselected, Pending)
       ↓
[ONE-TIME FINAL FORWARDING CONFIRMATION]
       ↓ (Locks batch & applications; enforces uniqueness @@unique([schoolReviewUnitId, seasonId]))
[City Intake: Batch Received with Attached Decision Document]
       ↓
[City Manager Assigns to City Officers]
       ↓
[City Officer Reviews in Shared Dossier UI]
       ↓ (Inspects exact Student dossier + School recommendation summary + records judgments)
[City Review Completed]
       ↓
[City Committee Reviews in Shared Dossier UI]
       ↓ (Inspects Student dossier + School verdict + City verdict + attached Decision doc)
[Committee Records Official Human Decision (Recognized / Not Recognized)]
       ↓
[Official Recognition Decision Published]
```

---

## 3. EXISTING-TO-TARGET STATE TRANSITION MAPPING

| State Dimension | Legacy / Previous Value | Approved Target Value | Notes & Business Invariants |
|---|---|---|---|
| **School Preliminary Status** | `pending_school_review`, `school_in_review`, `recommended_forwarding`, `not_recommended`, `forwarded_to_city` | Preserved: `pending_school_review`, `school_in_review`, `recommended_forwarding`, `not_recommended`, `forwarded_to_city` | Unchanged enum values to maintain backwards compatibility; `forwarded_to_city` is only set upon atomic batch forward. |
| **School Forwarding Mechanism** | Per-application `POST /api/school-review/applications/:id/forward` | Batch aggregate: `SchoolForwardingBatch` (`DRAFT` → `FORWARDED`) | Batch forward requires decision document, selection list, and is locked after forwarding. |
| **Batch Scope Uniqueness** | None (applications forwarded individually) | `schoolReviewUnitId + seasonId` UNIQUE | Exactly one normal forwarding batch per unit per season. Duplicate API calls return 409 Conflict or idempotent result. |
| **City Review UI** | Custom `OfficerReviewWorkspace` with isolated panels | Unified `SharedStudentDossierView` with `viewMode: 'CITY_OFFICER_REVIEW'` | Reviewer views the exact 5-criteria dossier structure the student created. |
| **Committee Review UI** | Custom `CommitteeApplicationWorkspace` | Unified `SharedStudentDossierView` with `viewMode: 'COMMITTEE_READONLY_OR_DECISION'` | Committee inspects original dossier + School decision attachment + City Officer findings. |
| **Escalation / Resolution Hub** | Artificial `ResolutionCase` / Escalation queue | RETIRED. Standard Scoped Supplementation & Human Judgment retained. | Historical data preserved; active workflow does not generate new ResolutionCases. |
| **AI Copilot Behavior** | Auto-opening modal, persistent floating cards, forced guided steps | Quiet, expert-first "AI hỗ trợ rà soát" button / drawer | Opens only upon deliberate reviewer request. |
| **Collective Track** | Direct-to-City (TT01–TT04) | PRESERVED: Direct-to-City (TT01–TT04) | Collective applications NEVER enter School batch forwarding. |

---

## 4. API & DTO SPECIFICATION (V2 CONTRACTS)

### 4.1 School Forwarding Batch Endpoints
- `GET /api/v2/school-forwarding-batch?seasonId=...`
  - Returns current batch (draft or forwarded) for the authenticated School Review Unit.
- `GET /api/v2/school-forwarding-batch/summary?seasonId=...`
  - Returns pre-forwarding validation metrics:
    - `totalApplications`: Total applications submitted to this school unit.
    - `reviewedCount`: Applications with completed preliminary review.
    - `selectedCount`: Applications with `recommended_forwarding` status.
    - `notSelectedCount`: Applications with `not_recommended` status.
    - `pendingCount`: Applications still in review or awaiting supplement.
    - `breakdownByInstitution`: Array of `{ institutionId, institutionName, total, selected }`.
    - `validationBlockers`: Array of blocking strings if validation fails.
- `POST /api/v2/school-forwarding-batch/draft`
  - Body: `{ seasonId, selectedApplicationIds, decisionNumber?, decisionTitle?, decisionDate?, signedByName?, signedByTitle? }`
  - Creates or updates the working batch in `DRAFT` status.
- `POST /api/v2/school-forwarding-batch/decision-document`
  - Multipart / JSON metadata: Uploads or references the official School decision document PDF.
- `POST /api/v2/school-forwarding-batch/confirm`
  - Body: `{ seasonId, idempotencyKey, forwardingNote? }`
  - Atomically locks batch, sets status to `FORWARDED`, transitions all selected applications to `forwarded_to_city` and `unassigned` at City level.
  - Enforces uniqueness: returns 409 Conflict if batch already forwarded.
- `GET /api/v2/school-forwarding-batch/incoming` (City Manager / Committee)
  - Returns all forwarded batches across school review units with attached decision documents.

---

## 5. PRISMA SCHEMA IMPACT ASSESSMENT

### New Model: `SchoolForwardingBatch`
```prisma
model SchoolForwardingBatch {
  id                    String              @id @default(cuid())
  seasonId              String
  schoolReviewUnitId    String
  status                ForwardingBatchStatus @default(DRAFT)
  decisionNumber        String?             // e.g. "182/QĐ-ĐHĐN"
  decisionTitle         String?             // "Quyết định đề xuất SV5T cấp Thành phố 2025–2026"
  decisionDate          DateTime?
  signedByName          String?
  signedByTitle         String?
  decisionFileId        String?
  decisionFileName      String?
  decisionFileSize      Int?
  decisionFileUrl       String?
  forwardingNote        String?
  submittedByUserId     String?
  submittedAt           DateTime?
  applicationCount      Int                 @default(0)
  selectedApplicationIds Json               // Array of application ID strings
  version               Int                 @default(1)
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  season                AwardSeason         @relation(fields: [seasonId], references: [id], onDelete: Restrict)
  schoolReviewUnit      SchoolReviewUnit    @relation(fields: [schoolReviewUnitId], references: [id], onDelete: Restrict)
  forwardedApplications IndividualApplication[]

  @@unique([schoolReviewUnitId, seasonId])
  @@index([schoolReviewUnitId, status])
  @@index([seasonId, status])
}

enum ForwardingBatchStatus {
  DRAFT
  FORWARDED
}
```

### Modification on `IndividualApplication`:
- Add `forwardingBatchId String?`
- Add `forwardingBatch SchoolForwardingBatch? @relation(fields: [forwardingBatchId], references: [id], onDelete: SetNull)`

---

## 6. AUTHORIZATION MATRIX (RBAC/ABAC)

| Endpoint / Operation | STUDENT | SCHOOL_OFFICER | CITY_MANAGER | CITY_OFFICER | CITY_COMMITTEE | ADMIN |
|---|---|---|---|---|---|---|
| View own student dossier | ALLOW (Own) | DENY | DENY | DENY | DENY | DENY |
| View School batch draft/summary | DENY | ALLOW (Own Unit) | ALLOW (Read) | DENY | ALLOW (Read) | ALLOW (Read) |
| Save School batch draft | DENY | ALLOW (Own Unit) | DENY | DENY | DENY | DENY |
| Upload batch decision document | DENY | ALLOW (Own Unit) | DENY | DENY | DENY | DENY |
| Confirm batch forwarding | DENY | ALLOW (Own Unit) | DENY | DENY | DENY | DENY |
| View City incoming batches | DENY | DENY | ALLOW | ALLOW | ALLOW | ALLOW |
| Assign applications to officers | DENY | DENY | ALLOW | DENY | DENY | ALLOW |
| Review assigned application dossier | DENY | DENY | DENY | ALLOW (Assigned) | DENY | DENY |
| Record Committee official decision | DENY | DENY | DENY | DENY | ALLOW | DENY |

---

## 7. RISK REGISTER & DATA PRESERVATION PLAN

1. **Zero Database History Deletion**:
   - Any historical review snapshots or legacy records remain intact. No destructive column drops or table resets.
2. **Offline Mode Safety**:
   - Live PostgreSQL is suspended in `BACKEND_DATABASE_MODE=offline`. All verification is executed through isolated fakes, unit tests, and the integrated applet server persistence (`.data/5tot-backend-db.json`).
3. **Dual-Mode Consistency**:
   - Both the pure `backend/` Prisma-based architecture and the active applet `server/` backend implement the identical `SchoolForwardingBatch` aggregate and validation rules.
