# 02 — CANONICAL DOMAIN MODEL & BUSINESS INVARIANTS
**Project:** 5TOT Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure  
**Cross-References:** `03_DATABASE_SCHEMA.md`, `04_STATE_MACHINES.md`, `prisma/schema.prisma`

---

## 1. SEPARATION OF DOMAIN ENTITIES & RESPONSIBILITIES

Backend V2 enforces strict separation between organizational entities, applicant declarations, reviewer judgments, committee decisions, and official published outcomes:

| Domain Concept | Canonical Model(s) in `prisma/schema.prisma` | Core Responsibility & Boundary |
| :--- | :--- | :--- |
| **Student** | `User` (`SystemRoleCode.STUDENT`) | Individual applicant identity tied to an `Institution`, `FacultyDepartment`, and `AcademicClass`. |
| **Collective** | `CollectiveUnit` | Permanent organizational entity (`CHI_HOI`, `LIEN_CHI_HOI`, `CHI_DOAN`, `LIEN_CHI_DOAN`, `CLUB_TEAM_GROUP`) affiliated with an `Institution` and `SchoolReviewUnit`. |
| **Collective Representative** | `User` + `CollectivePreparerAuthorization` | Scoped, season-specific authorization (`collectiveUnitId + userId + seasonId`) granting a representative permission to prepare and submit a Collective application directly to the City level. |
| **Institution & School Review Unit** | `Institution`, `SchoolReviewUnit`, `FacultyDepartment`, `AcademicClass` | `Institution` represents the university/college; `SchoolReviewUnit` (`unit-udn`, `unit-dut`, `unit-due`, etc.) is the preliminary review authority for **Individual** applications and organizational metadata for Collectives. |
| **Season** | `AwardSeason`, `CriterionGroupDefinition`, `RequirementDefinition` | Academic year configuration (`2025-2026`), submission windows, and versioned criterion/requirement schemas. |
| **Application (Canonical Identity)** | `IndividualApplication`, `CollectiveApplication` | **Single canonical record per application across its entire lifecycle.** Never duplicated across School, City, or Committee tables. |
| **Declaration** | `IndividualCriterionSubmission`, `IndividualDeclarationItem`, `CollectiveRequirementRecord`, `CollectiveMemberRosterEntry` | Applicant-authored data. **Strictly decoupled from reviewer judgments** so applicant declarations are never overwritten by officer notes. |
| **Evidence** | `EvidenceObject`, `EvidenceObjectVersion`, `ApplicationEvidenceLink` | Private object storage metadata, immutable version history, and join links to declarations/requirements. |
| **Review Judgment** | `SchoolCriterionReviewJudgment`, `CityCriterionReviewJudgment`, `CollectiveCityRequirementJudgment`, `EvidenceReviewJudgment` | Stage-isolated reviewer assessments (`SCHOOL` vs `CITY` for Individual; `CITY` for Collective) with revision history. |
| **Supplement Request** | `SupplementRequest`, `SupplementResponse` | Targeted deficiency records (`CRITERION_OR_REQUIREMENT`, `DECLARATION_ITEM`, `EVIDENCE_ATTACHMENT`, `MEMBER_ROSTER`) and applicant responses. |
| **Committee Decision** | `CommitteeDecisionRecord` | Auditable record of Hội đồng xét chọn conclusions (`RECOGNIZED` / `NOT_RECOGNIZED`) and any pre-publication reopen events. |
| **FinalResult & Decision Batch** | `ApplicationFinalResult` (1:1 per application) + `RecognitionDecisionBatch` (1:N batch header) | `ApplicationFinalResult` stores the authoritative outcome, certificate serial, and publication state for each individual dossier; `RecognitionDecisionBatch` stores the administrative Decision (`Số Quyết định`, date, signer). |

---

## 2. CONFIRMED COLLECTIVE TT01–TT04 DOMAIN INVARIANTS (BE0-R2)

### 2.1 Direct-to-City Workflow Rule
Collective applications (`CollectiveApplication`) are submitted by an authorized Collective Representative **directly to Hội Sinh viên Việt Nam TP. Đà Nẵng (`CITY_UNASSIGNED`)**.
- **NO** School preliminary review queue.
- **NO** School forwarding step.
- **NO** simulated institutional sign-off workflow.

### 2.2 Canonical TT01–TT04 Requirements

1. **TT01 — Đã đạt danh hiệu "Tập thể Sinh viên 5 tốt" cấp Trường (Prerequisite Recognition):**
   - The Collective must already hold actual School-level Collective Student 5-Good recognition (`tt01RecognitionStatus = RECOGNIZED`, `tt01DecisionNumber`, `tt01IssuingUnitName`, `tt01DecisionDate`).
   - Supporting evidence (`ApplicationEvidenceLink`) of the School-level recognition decision must be attached.
   - **Critical Distinction:** School-level recognition is an **eligibility prerequisite** verified by the City Officer via attached evidence—it is **NOT** a School-stage approval step in the system workflow.

2. **TT02 — 100% sinh viên tham gia phong trào Sinh viên 5 tốt:**
   - **Exact 100% Rule:** Every member of the Collective must have participated in the Student 5-Good movement.
   - **Authoritative Formula (Exact Integer Arithmetic):**
     ```ts
     const tt02MeetsThreshold =
       totalMembers > 0 && participatingMembers === totalMembers;
     ```

3. **TT03 — Ít nhất 20% thành viên đạt danh hiệu "Sinh viên 5 tốt" cấp Trường:**
   - **At least 20% Rule:** At least 20% of the **same authoritative `totalMembers`** must already hold actual School-level Individual Student 5-Good recognition.
   - **Authoritative Formula (Exact Integer Cross-Multiplication — Zero Floating-Point Drift):**
     ```ts
     const tt03MeetsThreshold =
       totalMembers > 0 && recognizedMembers * 100 >= totalMembers * 20;
     ```

4. **TT04 — Không có sinh viên vi phạm pháp luật và các quy định của Nhà trường, địa phương:**
   - Collective members must satisfy applicable no-violation requirements (`tt04ViolationStatus = NO_VIOLATIONS`, `tt04NoViolationsConfirmed = true`, confirming unit, date, and supporting evidence).
   - **No Automatic Inference:** Compliance is never inferred merely because zero violations were typed; supporting evidence and human review by the City Officer are mandatory.

### 2.3 Shared Membership Denominator & Synchronization Guarantees
- **Single Authoritative Denominator:** `CollectiveApplication.totalMembers` is the single source of truth denominator shared by both **TT02** and **TT03**. `CollectiveRequirementRecord` does **not** store separate `tt02TotalMembers` or `tt03TotalMembers` columns.
- **Domain Constraints on Submitted Data:**
  - `totalMembers` must be a positive integer (`totalMembers >= 1`).
  - `0 <= participatingMembers <= totalMembers`.
  - `0 <= recognizedMembers <= totalMembers`.
  - When a structured member roster (`CollectiveMemberRosterEntry`) is used as the source of counts, `totalMembers === rosterRowCount`, `participatingMembers === count(isParticipatingMovement === true)`, and `recognizedMembers === count(isSchoolSv5tRecognized === true)` are recomputed atomically inside the same PostgreSQL transaction whenever the roster or summary counts are updated.
- **No Editable Percentage Columns:** Percentage strings/floats are computed purely for display (`(participatingMembers * 100) / totalMembers` and `(recognizedMembers * 100) / totalMembers`) and are never accepted from client requests as source-of-truth fields.
- **Advisory Eligibility Warnings vs. Human Decision:**
  - `tt02MeetsThreshold` and `tt03MeetsThreshold` generate deterministic UI/Reviewer warnings when false, but **must not** act as unauthorized hard submission blockers or auto-reject/auto-recognize an application. Final recognition is decided exclusively by authorized City Reviewers and the Committee.

### 2.4 Mandatory Verification Test Cases (TT02 & TT03)

| Test Case | `totalMembers` | `participatingMembers` | `recognizedMembers` | TT02 Check (`participating === total`) | TT03 Check (`recognized * 100 >= total * 20`) | Expected Evaluation |
| :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **Collective A** | `42` | `42` | `9` | `42 === 42` → **TRUE** (100.0%) | `900 >= 840` → **TRUE** (21.43%) | **TT02 MEETS (100%)**, **TT03 MEETS (>= 20%)** |
| **Collective B** | `42` | `41` | `9` | `41 === 42` → **FALSE** (97.62%) | `900 >= 840` → **TRUE** (21.43%) | **TT02 DOES NOT MEET**, **TT03 MEETS (>= 20%)** |
| **Collective C** | `42` | `42` | `8` | `42 === 42` → **TRUE** (100.0%) | `800 >= 840` → **FALSE** (19.05%) | **TT02 MEETS (100%)**, **TT03 DOES NOT MEET (< 20%)** |

---

## 3. INDIVIDUAL WORKFLOW DOMAIN INVARIANTS

1. **Five Mandatory Criteria (`ETHICS`, `ACADEMIC`, `PHYSICAL`, `VOLUNTEER`, `INTEGRATION`):**
   - Each criterion maps to `CriterionGroupDefinition` and nested `RequirementDefinition` items for Season `2025-2026`.
   - Students can create multiple `IndividualDeclarationItem` records and attach multiple `EvidenceObject` links per requirement.
2. **Mandatory School Preliminary Stage (`SCHOOL_PRELIMINARY`):**
   - When a Student submits an Individual application, it transitions `STUDENT_DRAFT -> SCHOOL_PRELIMINARY` (`PENDING_SCHOOL_REVIEW`), routed to the student's `schoolReviewUnitId`.
   - **No Bypass Rule:** An Individual application cannot enter `CITY_REVIEW` unless a `SCHOOL_OFFICER` of that `schoolReviewUnitId` completes preliminary evaluation (`ELIGIBLE_FOR_CITY`) and executes the Forward-to-City transition (`FORWARDED_TO_CITY` -> `CITY_UNASSIGNED`).
3. **Independent City Evaluation:**
   - Upon School forwarding, `SchoolCriterionReviewJudgment` records are preserved as read-only reference for the City Officer, while `CityCriterionReviewJudgment` records are initialized to `NOT_REVIEWED` so City review remains independent.
