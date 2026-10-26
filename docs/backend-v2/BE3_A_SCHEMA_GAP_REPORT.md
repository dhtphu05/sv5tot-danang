# 5TOT ĐÀ NẴNG — BE3-A SCHEMA GAP REPORT
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Phase:** BE3-A (Catalog & Regulatory Business Contracts Foundation)  
**Database Mode:** OFFLINE  
**Golden Frontend Verification:** 348/348 PASS (Immutable Baseline S487A-R3)  

---

## 1. EXECUTIVE SUMMARY

An exhaustive audit of the authoritative Prisma schema (`backend/prisma/schema.prisma` and PostgreSQL baseline migration `20261011000000_init_backend_v2`) was conducted against the approved Golden Frontend business requirements.

**Key Finding:**  
The authoritative Prisma schema already contains models and enums for:
1. `Institution`, `FacultyDepartment`, `AcademicClass`
2. `SchoolReviewUnit`, `UserRoleAssignment`
3. `AwardSeason`
4. `CriterionGroupDefinition`, `RequirementDefinition`

No destructive migrations or changes to `schema.prisma` were required during Phase BE3-A. All catalog models align with the approved Golden Frontend contracts. Minor schema enhancements and legacy discrepancies are documented below for future review.

---

## 2. DETAILED SCHEMA COMPARISON

### 2.1 Educational Institutions (`Institution`, `FacultyDepartment`, `AcademicClass`)
- **Authoritative Model:**
  - `Institution` fields: `id`, `code`, `officialName`, `shortName`, `group`, `hasStudentAssoc`, `isActive`, `createdAt`, `updatedAt`.
  - Relations: `faculties: FacultyDepartment[]`, `students: StudentProfile[]`, `individualApplications: IndividualApplication[]`, `collectiveApplications: CollectiveApplication[]`.
- **Frontend / DTO Comparison:**
  - Frontend `DANANG_INSTITUTION_REGISTRY` contains 32 institutions with `organizationContext` (e.g. "Đại học Đà Nẵng") and `searchKeywords: string[]`.
  - In `InstitutionDto`, `organizationContext` and `searchKeywords` are provided as computed or metadata fields.
  - When live database integration is activated, these search keywords can either be indexed via Postgres `tsvector` or stored in a JSON/array column.
- **Verdict:** **ALIGNED.** No schema blocker.

### 2.2 School Review Unit (`SchoolReviewUnit`)
- **Authoritative Model:**
  - `SchoolReviewUnit` fields: `id`, `code`, `name`, `isActive`, `createdAt`, `updatedAt`.
  - Relations: `facultyDepartments: FacultyDepartment[]`, `roleAssignments: UserRoleAssignment[]`, `applications: IndividualApplication[]`.
- **Domain Scope Resolution:**
  - `SchoolReviewUnitService` maps institutions to review units via explicit domain mappings (`unit-udn` for 8 UDN member institutions, `unit-dtu` for Duy Tân, `unit-daut` for Kiến trúc, etc.).
  - UDN is correctly represented as a single school-level review unit (`unit-udn`), eliminating any obsolete 3-tier university hierarchy.
- **Verdict:** **ALIGNED.** No schema blocker.

### 2.3 Award Season (`AwardSeason`)
- **Authoritative Model:**
  - `AwardSeason` fields: `id`, `code`, `name`, `isActive`, `individualSubmissionStart`, `individualSubmissionEnd`, `schoolForwardingDeadline`, `collectiveSubmissionStart`, `collectiveSubmissionEnd`, `createdAt`, `updatedAt`.
- **Timeline Milestones:**
  - Captures exact timestamps for both Individual and Collective submission windows and the School forwarding deadline.
  - Season timeline status (`UPCOMING`, `OPEN_INDIVIDUAL`, `OPEN_SCHOOL_REVIEW`, `OPEN_CITY_REVIEW`, `CLOSED`) is computed deterministically in `SeasonService`.
- **Verdict:** **ALIGNED.** No schema blocker.

### 2.4 Versioned Criteria Catalog (`CriterionGroupDefinition`, `RequirementDefinition`)
- **Authoritative Models:**
  - `CriterionGroupDefinition`: `id`, `seasonId`, `track`, `code`, `title`, `shortTitle`, `displayOrder`, `isMandatory`, `ruleConfig: Json`.
  - `RequirementDefinition`: `id`, `criterionGroupId`, `code`, `groupBranchCode`, `title`, `description`, `displayOrder`, `isMandatory`, `requiresEvidence`, `inputSchema: Json`.
- **Domain Expressiveness:**
  - The flexible `ruleConfig: Json` and `inputSchema: Json` allow complete season-to-season versioning without altering core relational tables.
  - Supports OR-group (`selectionType: 'ONE_OF'`) and AND-group (`selectionType: 'ALL_OF'`) logic.
  - Allows multiple declaration entries and multiple evidence attachments per requirement.
- **Verdict:** **ALIGNED.** No schema blocker.

---

## 3. IDENTIFICATION OF OBSOLETE SPECIFICATIONS & WORKFLOWS

During the BE3-A audit, three obsolete implementation concepts from legacy documents were explicitly identified and reconciled:

1. **Obsolete Notion of University of Da Nang as an Independent Review Level:**
   - *Legacy Concept:* Claimed applications from DUT, DUE, etc., would be reviewed first at the faculty, then at the member university, then at Đại học Đà Nẵng, then sent to the City.
   - *Authoritative Reality:* The approved Golden Frontend has exactly **two review levels** for individual applications: **School Preliminary Review** (`SchoolReviewUnit`) and **City Review** (`City Officer Review -> Committee`). Đại học Đà Nẵng operates as one school-level review unit (`unit-udn`).
   - *Status:* **RESOLVED & ELIMINATED.**

2. **Obsolete Notion of School Sơ duyệt for Collective Track:**
   - *Legacy Concept:* Claimed collective applications would go through School review before reaching City.
   - *Authoritative Reality:* Approved Golden Frontend establishes direct-to-City submission for Collectives. School-level award is checked via documentary evidence (TT01), not an in-system preliminary review stage.
   - *Status:* **RESOLVED & ELIMINATED.**

3. **Obsolete Algorithmic Gatekeeping (Automatic Submission Block):**
   - *Legacy Concept:* Any missing requirement or low score automatically prevents application submission.
   - *Authoritative Reality:* Golden Frontend requires that advisory evaluation informs the student with warnings, but **never prevents submission** (`isSubmissionBlocked: false`). Official decisions are made exclusively by authorized officers and the Committee.
   - *Status:* **RESOLVED & ENFORCED.**

---

## 4. FUTURE SCHEMA MIGRATION RECOMMENDATIONS (POST-OFFLINE)

When Phase BE9 (Live PostgreSQL Integration) is initiated, the following non-breaking enhancements can be considered for review:
1. `Institution`: Add `searchKeywords Text[]` or full-text search index (`tsvector`) for high-performance server-side Vietnamese search.
2. `AwardSeason`: Consider adding optional granular milestone fields for `cityReviewStart` / `committeeFinalizationDate` if requested by operational reporting.
3. No migration is permitted or required during Phase BE3-A. All database operations remain strictly offline.
