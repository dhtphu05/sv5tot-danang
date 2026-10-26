# 5TOT ĐÀ NẴNG — BE4-A INDIVIDUAL APPLICATION CONTRACT
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Phase:** BE4-A (Individual Student Application Domain — Offline Production Implementation)  
**Database Mode:** OFFLINE (`BACKEND_DATABASE_MODE=offline`)  
**Golden Frontend Verification:** 348/348 PASS (Immutable Baseline S487A-R3)  

---

## 1. PURPOSE & ARCHITECTURAL FOUNDATION

This document defines the authoritative business contracts, API specifications, and domain state machines for **Phase BE4-A — Individual Student Application Domain**. It formalizes the complete lifecycle from application creation and draft autosave to declaration management, evidence linking, advisory readiness precheck, and official submission into the School Preliminary Review queue.

### Core Architectural Invariants:
1. **One Application Per Student Per Season:** Unique constraint `[seasonId, applicantUserId]`. Starting an application is strictly idempotent.
2. **Canonical Two-Tier Review Workflow:**
   $$\text{Student Draft} \longrightarrow \text{School Preliminary Review} \longrightarrow \text{City Intake} \longrightarrow \text{City Officer Review} \longrightarrow \text{Committee} \longrightarrow \text{Publication}$$
   *No premature City Officer assignment or Committee decision at student submission.*
3. **University of Da Nang Shared Reviewer Mapping:**
   - Students at all 8 member institutions (DUT, DUE, UED, UFL, UTE, VKU, VNUK, SMP) route to single shared `schoolReviewUnitId = 'unit-udn'`.
   - The student's actual educational institution (`institutionId`) is strictly preserved (e.g. `inst-dut` for Bách khoa).
   - Independent universities route to their own review units (e.g. `inst-dtu` $\rightarrow$ `unit-dtu`).
4. **Exact UX Semantics for 5 Criteria:**
   - Exactly five criteria: `ETHICS`, `ACADEMIC`, `PHYSICAL`, `VOLUNTEER`, `INTEGRATION`.
   - `ONE_OF` requirement groups: Satisfied when student meets 1 valid alternative. Voluntary additional declarations and evidence are permitted and never converted into mandatory AND requirements.
   - Multiple evidence items supported per declaration.
5. **Advisory Precheck vs Procedural Blocking:**
   - Advisory evaluation provides guidance, warnings, and missing requirement indicators, but **never blocks submission** (`isSubmissionBlocked: false`).
   - Procedural restrictions (unauthenticated, wrong applicant owner, inactive season, concurrency conflict) fail with standard RFC 7807 status codes.
6. **Optimistic Concurrency Control:** Version-locked updates prevent concurrent overwrites between browser tabs.

---

## 2. BUSINESS CONTRACT MATRIX TABLE

| Frontend Screen / Action | Backend Operation | API Contract & Method | Authoritative Prisma Model | Ownership & Scope Rules | Workflow Transition | Advisory vs Blocking | Audit & Outbox Event | Test Reference | Status |
|---|---|---|---|---|---|---|---|---|---|
| **Student Workspace / Dashboard** (`StudentApplicationWorkspace`) | Get Current Application | `GET /api/v2/individual-applications/current` | `IndividualApplication`, `AwardSeason` | Authenticated student only (`actor.userId`). Access to other students' applications denied (403). | N/A (Read) | N/A | Logged in HTTP access trace | `individualApplication.service.test.ts` (1), `individualApplication.routes.test.ts` (2, 8) | **IMPLEMENTED & TESTED** |
| **Start / Resume Button** (`ApplicationHeader`) | Start or Resume Application | `POST /api/v2/individual-applications/start` | `IndividualApplication` (`@@unique([seasonId, applicantUserId])`) | Authenticated student. Derives `institutionId` and `schoolReviewUnitId` from server authority. | `None -> STUDENT_DRAFT` (if new) | Idempotent: returns existing application if already started. | `INDIVIDUAL_APPLICATION_CREATED` | `individualApplication.service.test.ts` (1, 2, 3), `individualApplication.routes.test.ts` (1) | **IMPLEMENTED & TESTED** |
| **Draft Header Autosave** (`ApplicationHeader`, `StudentApplicationWorkspace`) | Update Draft Header Fields | `PATCH /api/v2/individual-applications/:id` | `IndividualApplication` (`version`) | Applicant owner only. Locked if already submitted. | Remains `STUDENT_DRAFT` | Rejects stale version (409 Conflict). | `INDIVIDUAL_DRAFT_UPDATED` | `individualApplication.service.test.ts` (4, 5, 6), `individualApplication.routes.test.ts` (3) | **IMPLEMENTED & TESTED** |
| **Add Declaration Modal** (`AddEditDeclarationModal`) | Add Criterion Declaration | `POST /api/v2/individual-applications/:id/declarations` | `IndividualDeclarationItem`, `IndividualCriterionSubmission` | Applicant owner only. Locked if already submitted. | Remains `STUDENT_DRAFT` | Structural validation (Zod schema). Increments application declared counts. | `INDIVIDUAL_DECLARATION_CREATED` | `individualApplication.service.test.ts` (7, 8), `individualApplication.routes.test.ts` (4) | **IMPLEMENTED & TESTED** |
| **Edit Declaration Modal** (`AddEditDeclarationModal`) | Update Declaration Item | `PATCH /api/v2/individual-applications/:id/declarations/:declarationId` | `IndividualDeclarationItem` | Applicant owner only. Locked if already submitted. | Remains `STUDENT_DRAFT` | Structural validation. | `INDIVIDUAL_DECLARATION_UPDATED` | `individualApplication.service.test.ts` (9) | **IMPLEMENTED & TESTED** |
| **Delete Declaration** (`RepeatableDeclarationList`) | Remove Declaration Item | `DELETE /api/v2/individual-applications/:id/declarations/:declarationId` | `IndividualDeclarationItem`, `ApplicationEvidenceLink` | Applicant owner only. Locked if already submitted. | Remains `STUDENT_DRAFT` | Unlinks attached evidence, updates counters. | `INDIVIDUAL_DECLARATION_REMOVED` | `individualApplication.service.test.ts` (9) | **IMPLEMENTED & TESTED** |
| **Attach Evidence Modal** (`AddEvidenceModal`) | Link Evidence Object | `POST /api/v2/individual-applications/:id/evidence-links` | `ApplicationEvidenceLink`, `EvidenceObject` | Applicant owner only. Verified ownership of `evidenceObjectId`. | Remains `STUDENT_DRAFT` | Prevents linking foreign evidence (403) and duplicate links (409). | `INDIVIDUAL_EVIDENCE_LINKED` | `individualApplication.service.test.ts` (10), `catalog.routes.test.ts` | **IMPLEMENTED & TESTED** |
| **Remove Evidence File** (`EvidenceCell`) | Unlink Evidence Object | `DELETE /api/v2/individual-applications/:id/evidence-links/:linkId` | `ApplicationEvidenceLink` | Applicant owner only. | Remains `STUDENT_DRAFT` | Structural deletion of link. | Audited via link removal | `individualApplication.service.test.ts` (10) | **IMPLEMENTED & TESTED** |
| **Readiness Precheck** (`ApplicationPreSubmitSummary`) | Evaluate Criteria Readiness | `GET /api/v2/individual-applications/:id/readiness`, `POST /.../precheck` | Evaluates 5 criteria via `CriteriaService` | Applicant owner, School Officer, Admin. | None (Evaluation only) | **Advisory only**: `isSubmissionBlocked: false`. Produces warnings without blocking submission. | `INDIVIDUAL_PRECHECK_COMPLETED` | `individualApplication.service.test.ts` (11), `individualApplication.routes.test.ts` (5) | **IMPLEMENTED & TESTED** |
| **Submit Application Dialog** (`SubmitConfirmationDialog`) | Officially Submit Application | `POST /api/v2/individual-applications/:id/submit` | `IndividualApplication` | Applicant owner only. Requires active season and `STUDENT_DRAFT` stage. | `STUDENT_DRAFT -> SCHOOL_PRELIMINARY`, `schoolPreliminaryStatus = PENDING_SCHOOL_REVIEW`, `cityWorkflowStatus = NOT_AT_CITY` | Procedural validation (authenticated, active season, valid stage). Locks application against draft editing. Idempotent on retry. | `INDIVIDUAL_APPLICATION_SUBMITTED`, Outbox: `INDIVIDUAL_APPLICATION_SUBMITTED` | `individualApplication.service.test.ts` (12, 13), `individualApplication.routes.test.ts` (6, 7) | **IMPLEMENTED & TESTED** |
| **Tracking Summary** (`TrackingSummary`, `SubmissionStateBanner`) | Get Application Status | `GET /api/v2/individual-applications/:id/status` | `IndividualApplication` | Applicant owner, authorized School Officer, City Officer. | N/A (Read) | N/A | Logged in HTTP trace | `individualApplication.routes.test.ts` (6) | **IMPLEMENTED & TESTED** |

---

## 3. LIFECYCLE & STATE MACHINE SPECIFICATION

### 3.1 Review Stage Progression (`currentReviewStage`)
```
[STUDENT_DRAFT]
       │
       ▼ (Student submits via POST /.../submit)
[SCHOOL_PRELIMINARY]  (schoolPreliminaryStatus = PENDING_SCHOOL_REVIEW, cityWorkflowStatus = NOT_AT_CITY)
       │
       ▼ (School Officer reviews & forwards in BE4-B)
[CITY_REVIEW]         (cityWorkflowStatus = CITY_UNASSIGNED -> CITY_ASSIGNED -> CITY_IN_REVIEW)
       │
       ▼ (City Review completes & Committee convenes in BE5)
[COMMITTEE_FINALIZATION]
       │
       ▼ (Decision published in BE5)
[COMPLETED]
```

### 3.2 Canonical State Guarantees at BE4-A Submission
When a student executes `POST /api/v2/individual-applications/:id/submit`:
- `currentReviewStage` transitions strictly to `'SCHOOL_PRELIMINARY'`.
- `schoolPreliminaryStatus` transitions strictly to `'PENDING_SCHOOL_REVIEW'`.
- `cityWorkflowStatus` remains strictly `'NOT_AT_CITY'`.
- `submittedToSchoolAt` records the server-authoritative timestamp.
- Application `version` is incremented.
- The application enters the authorized School Review Unit queue (`unit-udn` for 8 UDN member institutions, `unit-dtu` for Duy Tân, etc.).
- The student's original educational institution (`institutionId`) remains unchanged.
- **NO premature City Manager assignment or City Officer criteria evaluation occurs.**
