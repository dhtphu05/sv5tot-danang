# 5TOT ĐÀ NẴNG — BE3-A BUSINESS CONTRACT MATRIX
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Phase:** BE3-A (Catalog & Regulatory Business Contracts Foundation)  
**Database Mode:** OFFLINE  
**Golden Frontend Verification:** 348/348 PASS (Immutable Baseline S487A-R3)  

---

## 1. PURPOSE & ARCHITECTURAL FOUNDATION

This document defines the exhaustive business contract matrix for **Phase BE3-A**, reconciling the frozen Golden Frontend specifications, authoritative Prisma models, domain service rules, authorization policies, and offline test cases across:
1. **Educational Institution Catalog** (32 Participating Higher Education & Vocational Institutions in Da Nang).
2. **School Review Unit Domain & Scope Resolution** (Đơn vị thẩm định sơ duyệt cấp trường).
3. **Award Season Domain & Milestones Lifecycle** (Niên khóa xét chọn & các mốc tiến độ).
4. **Individual Criteria Catalog** (5 Tiêu chuẩn Sinh viên 5 tốt cá nhân: Đạo đức, Học tập, Thể lực, Tình nguyện, Hội nhập).
5. **Exact Student Declaration & Optional Evidence UX Semantics** (OR-groups, AND-groups, multiple evidence per option).
6. **Non-blocking Advisory Readiness Evaluation** (`isSubmissionBlocked: false`).
7. **Collective Criteria Catalog** (4 Tiêu chuẩn Tập thể Sinh viên 5 tốt: TT01, TT02, TT03, TT04).
8. **Direct-to-City Collective Workflow Alignment** (Tập thể nộp trực tiếp cấp Thành phố, không qua sơ duyệt trường).

---

## 2. BUSINESS CONTRACT MATRIX TABLE

| Business Area | Frontend Screen / Feature | Approved Business Behavior | Backend Domain Model | Authoritative Prisma Model | Proposed API / DTO | Authorization Requirement | Test Case Reference | Status | Contract Gap / Notes |
|---|---|---|---|---|---|---|---|---|---|
| **Institution Catalog** | Public Signup (`InstitutionCombobox`), Student Profile, Admin Institution Management (`InstitutionManagement.tsx`) | Complete registry of 32 participating universities, colleges & institutes across Da Nang; accent-insensitive search; supports UD grouping without forcing students to select parent entity. | `InstitutionDto`, `FacultyDepartmentDto`, `AcademicClassDto` | `Institution`, `FacultyDepartment`, `AcademicClass` | `GET /api/v2/institutions`, `GET /api/v2/institutions/:id`, `GET /api/v2/institutions/:id/faculties` | Public read for registration/profile; `ADMIN` with `MANAGE_SYSTEM_SETTINGS` for create/update. | `institution.service.test.ts` (1-6), `catalog.routes.test.ts` (1-3, 13, 14, 16) | **PASS (Offline)** | None. Aligned with `DANANG_INSTITUTION_REGISTRY` (32 institutions). |
| **School Review Unit (BE3-A1 UDN Rule)** | School Backoffice (`SchoolOverviewPage`, `SchoolRecommendationForwardingPage`), Student Profile Routing | Map student's institution to authorized School Review Unit; exactly ONE shared School Officer account for University of Da Nang (`unit-udn`) covering all 8 configured member institutions (DUT, DUE, UED, UFL, UTE, VKU, VNUK, SMP); student original institution identity (`institutionId`) preserved; shared account can filter by member institution without changing unit scope; independent institutions route to their respective units; NO extra UDN review tier. | `SchoolReviewUnitDto`, `ReviewApplicationScopeContext`, `SharedUdnReviewerAuditContext` | `SchoolReviewUnit`, `UserRoleAssignment` | `GET /api/v2/school-review-units`, `GET /api/v2/school-review-units/resolve/:institutionId` | Public/Student resolution of own unit; `SCHOOL_OFFICER` scoped strictly to assigned unit (`unit-udn`); `ADMIN` full management. | `schoolReviewUnit.service.test.ts` (1-16), `catalog.routes.test.ts` (4-6) | **PASS (Offline)** | Exactly 1 shared UDN reviewer account, not 8 separate accounts. Audit context documents student's actual institution and shared account attribution. |
| **Award Season Lifecycle** | Public Landing (`SelectionCyclePanel`), Admin Season Management (`SeasonManagement.tsx`), Student Application timeline guard | Server-authoritative timeline: `individualSubmissionStart`, `individualSubmissionEnd`, `schoolForwardingDeadline`, `collectiveSubmissionStart`, `collectiveSubmissionEnd`; calculates status: `UPCOMING`, `OPEN_INDIVIDUAL`, `OPEN_SCHOOL_REVIEW`, `OPEN_CITY_REVIEW`, `CLOSED`. | `AwardSeasonDto`, `SeasonTimelineEvaluation` | `AwardSeason` | `GET /api/v2/seasons`, `GET /api/v2/seasons/active`, `POST /api/v2/seasons`, `PUT /api/v2/seasons/:id/activate` | Public read for active season; `ADMIN` with `MANAGE_SEASONS` / `MANAGE_SYSTEM_SETTINGS` for creation/activation. | `season.service.test.ts` (1-9), `catalog.routes.test.ts` (7-8, 15) | **PASS (Offline)** | Vietnam ICT timezone (UTC+7) handled in timestamp ISO comparison; atomic single-active season activation enforced. |
| **Individual Criteria (5 Tiêu chuẩn)** | Student Workspace (`StudentApplicationWorkspace`), Criterion Sections, Regulation Inspector | Exactly 5 canonical criteria: Ethics (`ETHICS`), Academic (`ACADEMIC`), Physical (`PHYSICAL`), Volunteer (`VOLUNTEER`), Integration (`INTEGRATION`). NO sixth priority criterion. | `CriterionGroupDefinitionDto`, `RequirementDefinitionDto` | `CriterionGroupDefinition`, `RequirementDefinition` | `GET /api/v2/seasons/:id/criteria` | Public read / authenticated student read. Criteria mutation restricted to system configuration. | `criteria.service.test.ts` (1-10), `catalog.routes.test.ts` (9, 11) | **PASS (Offline)** | Aligned with 2025–2026 regulations and Golden Frontend structure. |
| **Declaration & Evidence UX Semantics** | Student Modal (`AddEditDeclarationModal`, `AddEvidenceModal`), Table (`ApplicationTable`) | Student can satisfy a criterion by selecting 1 valid alternative when rule requires only 1; student can voluntarily declare additional alternatives; student can attach multiple evidence files to a single declaration; adding extra evidence NEVER blocks or changes requirement to AND. | `IndividualEvaluationInput`, `EvaluationResult` | `StudentDeclaration`, `Evidence` | `POST /api/v2/criteria/evaluate-individual` | Student evaluates own declarations; Officer evaluates during review. | `criteria.service.test.ts` (5, 6, 8, 9, 10), `catalog.routes.test.ts` (11) | **PASS (Offline)** | Preserves exact UX contract approved in Golden Frontend. |
| **Advisory Validation vs Submission Blocking** | Pre-Submit Modal (`ApplicationPreSubmitSummary`), Status Chip, Readiness Bar | Advisory evaluation provides guidance (`isMet`, `warnings`, `missingRequirements`), but NEVER blocks submission (`isSubmissionBlocked: false`). Acceptance/recognition is strictly a human officer/committee decision. | `AdvisoryEvaluationResult` | In-memory evaluation service | `POST /api/v2/criteria/evaluate-individual`, `POST /api/v2/criteria/evaluate-collective` | Any authenticated user. | `criteria.service.test.ts` (7), `collectiveCriteria.service.test.ts` (8), `catalog.routes.test.ts` (11, 12) | **PASS (Offline)** | No automated grant of recognition; system provides decision support, not algorithmic gatekeeping. |
| **Collective TT01 (Công nhận cấp trường)** | Collective Workspace (`TT01RecognitionForm`), Collective Document Preview | Prerequisite: Evidence of prior School-level Collective SV5T recognition (Decision/Certificate). This is an evidence prerequisite, NOT a workflow review stage in software. | `CollectiveEvaluationInput`, `TT01Result` | `CollectiveApplication`, `Evidence` | `POST /api/v2/criteria/evaluate-collective` | Collective Preparer, Officer, Committee. | `collectiveCriteria.service.test.ts` (1), `catalog.routes.test.ts` (12) | **PASS (Offline)** | Verified via documentary evidence attached. |
| **Collective TT02 (100% Tham gia phong trào)** | Collective Workspace (`TT02ParticipationForm`) | 100% of collective members must participate in Student 5-Good movement (`participatingMembers === totalMembers`). Shared canonical `totalMembers` denominator. | `TT02Result` | `CollectiveApplication` | `POST /api/v2/criteria/evaluate-collective` | Collective Preparer, Officer, Committee. | `collectiveCriteria.service.test.ts` (2, 3) | **PASS (Offline)** | `totalMembers` must be positive integer (> 0). Denominator shared with TT03. |
| **Collective TT03 (>= 20% Đạt danh hiệu)** | Collective Workspace (`TT03SchoolAwardForm`) | At least 20% of collective membership recognized as School-level Individual SV5T. Evaluated using exact integer arithmetic: `recognizedMembers * 100 >= totalMembers * 20` to eliminate float rounding errors. | `TT03Result` | `CollectiveApplication` | `POST /api/v2/criteria/evaluate-collective` | Collective Preparer, Officer, Committee. | `collectiveCriteria.service.test.ts` (4, 5, 6, 7) | **PASS (Offline)** | Tested: 6/30 (20.0%) PASS, 5/30 (16.7%) FAIL, 1/5 (20.0%) PASS, 7/36 (19.44%) FAIL. |
| **Collective TT04 (Không kỷ luật / vi phạm)** | Collective Workspace (`TT04ComplianceForm`) | Declaration of non-violation; requires human verification by City Review Officer. Unverified declaration is not automatically approved. | `TT04Result` | `CollectiveApplication` | `POST /api/v2/criteria/evaluate-collective` | Collective Preparer, Officer, Committee. | `collectiveCriteria.service.test.ts` (9, 10) | **PASS (Offline)** | Human verification mandatory before final committee review. |
| **Canonical Workflow Routing** | Individual Track vs Collective Track | INDIVIDUAL: Student -> School Preliminary Review -> School Forwarding -> City Intake -> City Officer Review -> Committee -> Publish.<br>COLLECTIVE: Representative -> Direct City Submission -> City Intake -> City Officer Review -> Committee -> Publish. | Domain Workflow Routing | `Application`, `CollectiveApplication` | Future BE4 (Individual), BE5 (Collective) | Role-based & Track-based policies. | `schoolReviewUnit.service.test.ts` (5, 7), root `dual-mode-backend.test.ts` | **PASS (Offline)** | Collective applications BYPASS school preliminary review completely. |
| **Zero-Trust RBAC & Role Boundaries** | Staff Backoffice, Admin Console, Committee Views | Strict capability boundaries: `ADMIN` cannot make Committee decisions; `ADMIN` cannot perform City Officer judgments; `SCHOOL_OFFICER` cannot edit global season; `STUDENT` cannot edit catalogs. | `AuthorizationService`, `PermissionMatrix` | `User`, `RoleAssignment` | Protected Express Middlewares (`requireRole`, `rejectClientIdentitySpoofing`) | Token-backed zero-trust authentication; no client-asserted header spoofing. | `authorization.test.ts`, `authorizationMatrix.test.ts`, `security.test.ts` | **PASS (Offline)** | 27 permissions, 8 operational domains verified. |
| **Fail-Closed Offline Persistence** | App Boot, Health Check, Route Handlers | Under `BACKEND_DATABASE_MODE=offline`, live PostgreSQL connection is suspended; health readiness reports 503; DB-dependent endpoints return 503 RFC 7807; unit/http tests run via isolated fakes; no live Supabase connection. | `wireProbe`, `apiError` | N/A (Offline) | `GET /health/live` (200), `GET /health/ready` (503) | Public health endpoints. | `health.test.ts`, `catalog.routes.test.ts` (17), `database.test.ts` | **PASS (Offline)** | Zero database operations executed during BE3-A. |

---

## 3. AUDIT OF HISTORICAL WORKFLOW CONFLICTS & RECONCILIATIONS

1. **Obsolete Specification:** "University of Da Nang acts as an intermediary review level between member universities and the City."
   - **Approved Golden Frontend Reality:** Đại học Đà Nẵng represents a single school-level review unit (`unit-udn`) with review authority for member universities, exactly parallel to other independent universities (Đại học Duy Tân, Đại học Kiến trúc Đà Nẵng). There is **NO second-tier university review** before City submission.
   - **Backend V2 Alignment:** Implemented in `SchoolReviewUnitService.resolveUnitForInstitution()`. All 8 member universities resolve directly to `unit-udn`. Forwarded individual applications go directly to City Intake.

2. **Obsolete Specification:** "Collective applications require School Youth Union preliminary recommendation before submitting to City."
   - **Approved Golden Frontend Reality:** Authorized Collective Preparers submit directly to the City Youth Union / Vietnamese Student Association Da Nang (`city_unassigned`). TT01 requires attaching documentary proof of prior School-level recognition, but there is **NO software school preliminary review stage** for collectives.
   - **Backend V2 Alignment:** Tested in `schoolReviewUnit.service.test.ts` Test 5 and `collectiveWorkflow.test.ts`.

3. **Obsolete Specification:** "Strict 1-evidence limit or mandatory declaration of all alternative requirements."
   - **Approved Golden Frontend Reality:** Any requirement group with `selectionType: 'ONE_OF'` is satisfied when the student meets any single alternative. The student is encouraged to attach multiple files per declaration and can voluntarily declare additional alternatives without penalty.
   - **Backend V2 Alignment:** Implemented in `CriteriaService.evaluateIndividualAdvisory()`.

---

## 4. BE3-A1 — UNIVERSITY OF DA NANG AUTHORITATIVE OPERATIONAL MODEL

### 4.1 Authoritative Principle & Architectural Contract
**AUTHORITATIVE PRINCIPLE: MANY MEMBER INSTITUTIONS → ONE UDN SCHOOL REVIEW UNIT → ONE SHARED UDN REVIEWER ACCOUNT → CITY.**

The operational model for University of Da Nang (UDN) is authoritative and user-confirmed:
- **Canonical Mapping:** All currently configured University of Da Nang member institutions resolve to:
  `schoolReviewUnitId = unit-udn`
  Their original `institutionId` values remain distinct.
  - DUT (`inst-dut`) → `unit-udn`
  - DUE (`inst-due`) → `unit-udn`
  - UED (`inst-ued`) → `unit-udn`
  - UFL (`inst-ufl`) → `unit-udn`
  - UTE (`inst-ute`) → `unit-udn`
  - VKU (`inst-vku`) → `unit-udn`
  - SMP (`inst-smp`) → `unit-udn`
  - VNUK (`inst-vnuk`) → `unit-udn`
  Independent institutions (DTU, DAUT, Donga, FPT, etc.) continue to resolve to their own authorized review units (`unit-dtu`, `unit-dau`, `unit-donga`, `unit-fpt`, etc.).

### 4.2 Shared Reviewer Account Capabilities & Boundaries
There is **exactly ONE shared School-level reviewer account** for the University of Da Nang, covering its configured member institutions (`unit-udn`).
- **Prohibition:** There must NOT be eight separate School-level accounts for the eight UDN member institutions.
- **Reviewer Scope:**
  - Represents the University of Da Nang School Review Unit (`unit-udn`).
  - CAN review Individual applications from every configured UDN member institution (DUT, DUE, UED, UFL, UTE, VKU, SMP, VNUK).
  - CAN filter applications in the school review queue by original member institution (`institutionId`).
  - CAN request supplements for applications within the UDN scope.
  - CAN recommend and forward approved Individual applications to City.
  - CANNOT access applications outside the authorized UDN unit (e.g. Duy Tân, Kiến trúc, FPT).
  - CANNOT perform City Officer or Committee duties without separate explicit authorization.

### 4.3 Preservation of Student Institution Identity
For each Individual application, the system maintains two separate authoritative attributes:
- `institutionId`: The student's actual university (e.g., `inst-dut` for Trường Đại học Bách khoa).
- `schoolReviewUnitId`: The authorized School Review Unit (`unit-udn`).
- **Data Integrity Rule:** Student profiles, application records, review details, exports, and reports MUST preserve the actual member institution name (`Trường Đại học Bách khoa - Đại học Đà Nẵng`). The student's original institution is **NEVER overwritten** with generic "Đại học Đà Nẵng".

### 4.4 Correction of Earlier Test Assumption
The previous assumption (*"DUT-only Officer cannot access UED applications"*) was incorrect because DUT and UED do NOT have separate School Officer accounts. Both belong to `unit-udn` reviewed by the single shared UDN reviewer.
The corrected authoritative requirements are:
1. The UDN reviewer **CAN** access DUT Individual applications.
2. The UDN reviewer **CAN** access UED Individual applications.
3. The UDN reviewer **CAN** access applications of all other configured UDN members.
4. The UDN reviewer **CANNOT** access non-UDN institutions.
5. An independent institution's reviewer **CANNOT** access UDN applications.
6. School application queues are filtered by authoritative School Review Unit scope (`schoolReviewUnitId`).
7. The UDN reviewer can filter by original institution without changing its authorization scope.
8. Client-provided `institutionId` and `schoolReviewUnitId` cannot enlarge permissions or leak cross-unit data.
9. Revoked UDN reviewer authority denies future review operations immediately.
10. Collective applications **never enter** this School-level review workflow.

### 4.5 Preservation of the Two-Level Review Workflow
- **Individual Track:** Student at member institution → Shared UDN School Review Account → City Review → Committee.
- **Collective Track:** Authorized Collective Representative → City Review → Committee.
- **No Extra Tier:** There is NO second-tier or intermediate University review stage between member colleges and the City.

### 4.6 Security, Audit, and Operational Limitations
- **Security:** Standard JWT + PostgreSQL session + RBAC/ABAC architecture. Access is scoped via server-verified `schoolReviewUnitId` on both actor and target resource.
- **Audit Logging:** Every school review event records reviewer identity (`userId`), application identity (`applicationId`), original student institution (`institutionId`), and review unit context (`schoolReviewUnitId`).
- **Documented Operational Limitation:** Because a single shared credential is used across member schools, actions in the audit log are attributed to the shared UDN School Officer identity (`user-officer-udn-shared`), rather than identifying individual human reviewers from separate campuses. This limitation is an operational reality explicitly confirmed by the governing body.

### 4.7 Test Coverage Matrix for UDN Shared Model
- `backend/tests/unit/schoolReviewUnit.service.test.ts`:
  - Routing all 8 UDN members to `unit-udn` while maintaining distinct training institutions.
  - Shared UDN reviewer access across all UDN members (DUT, DUE, UED, UFL, UTE, VKU, SMP, VNUK).
  - Denial of UDN reviewer access to independent institutions (DTU, DAUT, FPT).
  - Denial of independent institution reviewer access to UDN applications.
  - Authoritative queue filtering and member institution sub-filtering without scope leakage.
  - Protection against client parameter spoofing / permission enlargement.
  - Immediate denial upon reviewer role revocation.
  - Complete exclusion of Collective applications from school review.
  - Audit context construction with shared account attribution notice.
- `backend/tests/unit/authorization.test.ts`:
  - `ScopePolicy.canAccessStudentResource`: Verified that shared UDN officer has scope for DUT and UED, but denied for DTU; verified that DTU officer is denied for DUT/UED.
- `backend/tests/unit/individualApplication.service.test.ts`:
  - Verifies that new Individual applications from DUT students resolve `schoolReviewUnitId: 'unit-udn'` while maintaining `institutionId: 'inst-dut'`.
- `backend/tests/http/catalog.routes.test.ts`:
  - Verifies `GET /api/v2/school-review-units/resolve/:institutionId` returns `unit-udn` for DUT (`inst-dut`).

