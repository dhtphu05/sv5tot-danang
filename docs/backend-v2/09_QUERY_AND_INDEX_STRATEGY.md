# 09 — SCREEN-BY-SCREEN QUERY & INDEX STRATEGY (MANDATORY MATRIX)
**Project:** 5TOT Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure  
**Cross-References:** `prisma/schema.prisma`, `05_API_CONTRACTS.md`, `10_PERFORMANCE_AND_SCALING.md`

---

## 1. QUERY DESIGN PRINCIPLES

1. **Zero Full-Tree Loading for Queues:** List/queue screens never `include` nested `declarations`, `memberRoster`, or `evidenceLinks`. Counter fields (`declaredCriteriaCount`, `totalEvidenceCount`, `openSupplementCount`, `totalMembers`, `participatingMembers`, `recognizedMembers`, `tt02MeetsThreshold`, `tt03MeetsThreshold`) are maintained transactionally on the application header row so queues render with a **single indexed table scan + 0 N+1 subqueries**.
2. **Explicit Prisma `select` Projections:** Every repository method defines a narrow `select` clause matching the screen DTO.
3. **Bounded Keyset/Cursor Pagination:** All queues enforce `take: Math.min(limit, 100)` (default `25`) ordered deterministically by `(sortTimestamp DESC, id DESC)`.

---

## 2. MANDATORY 19-SCREEN QUERY & INDEX MATRIX

### Screen 01: Student Home (`StudentHomePage`)
- **Role:** `STUDENT`
- **Endpoint:** `GET /api/v2/individual/me/overview?seasonCode=2025-2026`
- **Requested Data:** Active season window, student profile summary, application stage/status badge, 5 criterion readiness badges, open supplement count, unread notification count, final result banner (if published).
- **Query Shape & Prisma Strategy:**
  - Query 1: `prisma.individualApplication.findUnique({ where: { seasonId_applicantUserId }, select: { id, applicationCode, currentReviewStage, schoolPreliminaryStatus, cityWorkflowStatus, gpaScale4, conductScore, declaredCriteriaCount, totalEvidenceCount, openSupplementCount, version, criterionSubmissions: { select: { criterionCode, selfStatus, declarationCount, evidenceCount } }, finalResult: { select: { outcome, isPublished, decisionNumberSnapshot, publishedAt } } } })`
  - Query 2 (parallel): `prisma.notification.count({ where: { recipientUserId, status: 'UNREAD' } })`
- **Sort / Pagination:** Single record (no pagination).
- **DB Round Trips:** `2` (executed in `Promise.all`).
- **Supporting Indexes:** `@@unique([seasonId, applicantUserId])` on `IndividualApplication`; `@@index([recipientUserId, status, createdAt(sort: Desc)])` on `Notification`.
- **Payload Boundary:** `<= 4 KB` (excludes declaration bodies and evidence objects).
- **N+1 Risk & Mitigation:** Eliminated by reading `criterionSubmissions` summary counters (5 rows max).
- **Cache Suitability:** Private per-user HTTP ETag based on `application.version`.

---

### Screen 02: Individual Application Overview (`StudentApplicationWorkspace` — Overview Tab)
- **Role:** `STUDENT` (owner)
- **Endpoint:** `GET /api/v2/individual/me/overview` + `GET /api/v2/catalog/seasons/2025-2026/criteria?track=INDIVIDUAL`
- **Requested Data:** Full 5-criterion checklist structure, per-criterion declaration/evidence counts, active School/City supplement banners (`SupplementRequest` where `status = OPEN`).
- **Query Shape & Prisma Strategy:**
  - Application header + `criterionSubmissions` + `supplementRequests: { where: { status: 'OPEN' }, select: { id, stage, criterionOrReqCode, scopeType, requestReason, deadlineAt } }`.
- **DB Round Trips:** `1` for application overview (+ `1` cached season catalog).
- **Supporting Indexes:** `@@unique([seasonId, applicantUserId])`, `@@index([individualApplicationId, status, requestedAt(sort: Desc)])` on `SupplementRequest`.
- **Payload Boundary:** `<= 12 KB`.
- **Cache Suitability:** Season criteria catalog cached in-memory on server (`TTL = 10 min`) and browser `Cache-Control: public, max-age=300`.

---

### Screen 03: Individual Criterion Detail (`StudentApplicationWorkspace` — Criterion Tab & `AddEditDeclarationModal`)
- **Role:** `STUDENT` (or reviewing Officer)
- **Endpoint:** `GET /api/v2/individual/applications/:id/criteria/:criterionCode`
- **Requested Data:** All `IndividualDeclarationItem` rows for that single `criterionCode`, linked `EvidenceObject` metadata, and any stage review judgment (`SchoolCriterionReviewJudgment` / `CityCriterionReviewJudgment`).
- **Query Shape & Prisma Strategy:**
  - `prisma.individualDeclarationItem.findMany({ where: { individualApplicationId: id, criterionCode }, orderBy: { createdAt: 'asc' }, select: { id, requirementCode, title, activityDateOrPeriod, issuingAuthority, certificateOrRefCode, numericValue, structuredAttributes, selfStatus, evidenceLinks: { where: { unlinkedAt: null }, select: { id, evidenceObject: { select: { id, originalFileName, mimeType, sizeBytes, currentVersionNo, uploadedAt } }, reviewJudgments: { select: { stage, judgmentStatus, reviewerNote } } } } } })`
- **Sort / Pagination:** Ordered by `createdAt ASC` (bounded to 1 criterion, typically 1–10 declarations).
- **DB Round Trips:** `2` (1 ABAC ownership check on `IndividualApplication`, 1 declaration + evidence metadata query).
- **Supporting Indexes:** `@@index([individualApplicationId, criterionCode, requirementCode])` on `IndividualDeclarationItem`; `@@index([individualDeclarationItemId])` on `ApplicationEvidenceLink`.
- **Payload Boundary:** `<= 25 KB` (strictly metadata; zero Base64 file content).
- **N+1 Risk:** Prevented via single nested `select` on `ApplicationEvidenceLink -> EvidenceObject`.

---

### Screen 04: Collective Application Overview (`CollectiveApplicationWorkspace` — Overview Header & Readiness Panel)
- **Role:** `COLLECTIVE_PREPARER`
- **Endpoint:** `GET /api/v2/collective/applications/:id/overview`
- **Requested Data:** Collective identity, workflow status, shared membership denominator (`totalMembers`), `participatingMembers`, `recognizedMembers`, `tt01IsSchoolRecognized`, `tt02MeetsThreshold` (`100%`), `tt03MeetsThreshold` (`>= 20%`), `tt04ViolationStatus`, 4 `CollectiveRequirementRecord` status summaries, and open City supplements.
- **Query Shape & Prisma Strategy:**
  - `prisma.collectiveApplication.findUnique({ where: { id }, select: { ..., requirements: { select: { id, requirementCode, selfStatus, evidenceCount, updatedAt } }, supplementRequests: { where: { status: 'OPEN' } }, finalResult: true } })`
- **DB Round Trips:** `2` (1 `CollectivePreparerAuthorization` check using `@@unique([collectiveUnitId, userId, seasonId])`, 1 overview query).
- **Supporting Indexes:** Primary key `id`, `@@unique([collectiveUnitId, userId, seasonId])`, `@@unique([collectiveApplicationId, requirementCode])`.
- **Payload Boundary:** `<= 10 KB` (excludes full member roster).

---

### Screen 05: Collective TT01–TT04 Detail (`CollectiveApplicationWorkspace` — Requirement Drawer & Roster Editor)
- **Role:** `COLLECTIVE_PREPARER`
- **Endpoint:** `GET /api/v2/collective/applications/:id/requirements/:reqCode` & `GET /api/v2/collective/applications/:id/roster?cursor=...&limit=50`
- **Requested Data:** Normalized TT01/TT02/TT03/TT04 fields, linked evidence metadata, and paginated `CollectiveMemberRosterEntry` rows (for TT02/TT03).
- **Query Shape & Prisma Strategy:**
  - Requirement query uses `findUnique({ where: { collectiveApplicationId_requirementCode } })` with `evidenceLinks`.
  - Roster query uses cursor pagination (`take: 50`, `orderBy: { studentCode: 'asc' }`).
- **DB Round Trips:** `1` for requirement detail; `1` for paginated roster when TT02/TT03 is opened.
- **Supporting Indexes:** `@@unique([collectiveApplicationId, requirementCode])`, `@@unique([collectiveApplicationId, studentCode])`, and `@@index([collectiveApplicationId, isParticipatingMovement, isSchoolSv5tRecognized])`.
- **Payload Boundary:** Requirement detail `<= 15 KB`; Roster page (50 rows) `<= 20 KB`.

---

### Screen 06: Evidence Library & Evidence Viewer (`AddEvidenceModal` & `EvidenceReviewViewer`)
- **Role:** `STUDENT`, `COLLECTIVE_PREPARER`, `SCHOOL_OFFICER`, `CITY_OFFICER`, `CITY_COMMITTEE`
- **Endpoints:** `GET /api/v2/evidence?applicationId=...` (list metadata) and `GET /api/v2/evidence/:id/view-url` (on-demand binary view)
- **Requested Data:** Paginated list of finalized `EvidenceObject` items for an application; short-lived presigned URL when viewing a specific file.
- **Query Shape & Prisma Strategy:**
  - `prisma.evidenceObject.findMany({ where: { individualAppId, isFinalized: true, deletedAt: null }, orderBy: { uploadedAt: 'desc' }, take: 50, select: { id, originalFileName, mimeType, extension, sizeBytes, currentVersionNo, uploadedAt } })`
- **DB Round Trips:** `1` for metadata list; `1` for single object lookup + GCS/S3 offline signing (`0` network calls to GCS to sign V4 URL).
- **Supporting Indexes:** `@@index([individualAppId, isFinalized])`, `@@index([collectiveAppId, isFinalized])`, `@@index([ownerUserId, isFinalized, uploadedAt(sort: Desc)])`.
- **Payload Boundary:** `<= 15 KB` for list; `<= 1 KB` for presigned URL response.

---

### Screen 07: School Review Queue (`SchoolPreliminaryReviewWorkspace`)
- **Role:** `SCHOOL_OFFICER` (strictly scoped to `actor.schoolReviewUnitId`)
- **Endpoint:** `GET /api/v2/school-review/queue?seasonCode=2025-2026&status=...&cursor=...&limit=25`
- **Requested Data:** Individual applications belonging to the officer's `schoolReviewUnitId`, showing student name, student code, faculty/class, GPA, conduct score, `schoolPreliminaryStatus`, `declaredCriteriaCount`, `totalEvidenceCount`, `openSupplementCount`, `submittedToSchoolAt`.
- **Query Shape & Prisma Strategy:**
  - `prisma.individualApplication.findMany({ where: { seasonId, schoolReviewUnitId: actor.schoolReviewUnitId, schoolPreliminaryStatus: statusFilter }, orderBy: [{ submittedToSchoolAt: 'desc' }, { id: 'desc' }], take: 25, cursor, select: { id, applicationCode, studentCodeSnapshot, fullNameSnapshot, facultyName, className, gpaScale4, conductScore, schoolPreliminaryStatus, declaredCriteriaCount, totalEvidenceCount, openSupplementCount, submittedToSchoolAt, version } })`
- **DB Round Trips:** `1` (plus `1` parallel `groupBy` status count query for filter tabs).
- **Supporting Index:** `@@index([seasonId, schoolReviewUnitId, schoolPreliminaryStatus, submittedToSchoolAt(sort: Desc)])` — **Why necessary:** Eliminates table scans across other universities and supports index-only sorting by `submittedToSchoolAt DESC`.
- **Payload Boundary:** `<= 25 KB` per 25 rows.

---

### Screen 08: School Forwarding Queue (`SchoolRecommendationForwardingPage`)
- **Role:** `SCHOOL_OFFICER`
- **Endpoint:** `GET /api/v2/school-review/queue?seasonCode=2025-2026&status=ELIGIBLE_FOR_CITY&limit=50`
- **Requested Data:** Eligible Individual dossiers ready to be forwarded to Hội Sinh viên TP. Đà Nẵng, plus already-forwarded history (`FORWARDED_TO_CITY`).
- **Query Shape & Prisma Strategy:** Same narrow projection as Screen 07 + `schoolJudgments: { select: { criterionCode, judgmentStatus } }` (5 tiny rows per application) to display the 5-criterion green checkmarks.
- **DB Round Trips:** `1`.
- **Supporting Index:** `@@index([seasonId, schoolReviewUnitId, schoolPreliminaryStatus, submittedToSchoolAt(sort: Desc)])`.
- **Payload Boundary:** `<= 40 KB` per 50 rows.

---

### Screen 09: City Manager Intake Queue (`CityManagerIntakeWorkspace`)
- **Role:** `CITY_MANAGER`
- **Endpoint:** `GET /api/v2/city/intake-queue?track=INDIVIDUAL|COLLECTIVE&seasonCode=2025-2026&status=CITY_UNASSIGNED&unitId=...&cursor=...&limit=25`
- **Requested Data:** Unassigned Individual dossiers forwarded from School units (`currentReviewStage = CITY_REVIEW`) and unassigned Collective dossiers submitted directly to City (`workflowStatus = CITY_UNASSIGNED`).
- **Query Shape & Prisma Strategy:**
  - Individual: filters `(seasonId, currentReviewStage = 'CITY_REVIEW', cityWorkflowStatus = 'CITY_UNASSIGNED')`, sorted by `schoolForwardedAt DESC`.
  - Collective: filters `(seasonId, workflowStatus = 'CITY_UNASSIGNED')`, sorted by `submittedToCityAt DESC`.
- **DB Round Trips:** `1` per active track tab.
- **Supporting Indexes:**
  - Individual: `@@index([seasonId, currentReviewStage, cityWorkflowStatus, schoolForwardedAt(sort: Desc)])`
  - Collective: `@@index([seasonId, workflowStatus, submittedToCityAt(sort: Desc)])`
- **Payload Boundary:** `<= 25 KB` per 25 rows.

---

### Screen 10: City Officer Assignment & Workload View (`CityAssignmentModal` & Workload Panel)
- **Role:** `CITY_MANAGER`
- **Endpoint:** `GET /api/v2/city/officers/workload?seasonCode=2025-2026`
- **Requested Data:** List of active `CITY_OFFICER` users with their current counts of `CITY_ASSIGNED`, `CITY_IN_REVIEW`, `CITY_SUPPLEMENT_REQUESTED`, and `CITY_REVIEW_COMPLETED` across Individual and Collective tracks.
- **Query Shape & Prisma Strategy:**
  - Query 1: Fetch active `UserRoleAssignment` where `roleCode = 'CITY_OFFICER'`.
  - Query 2 & 3 (parallel): `prisma.individualApplication.groupBy({ by: ['assignedCityOfficerId', 'cityWorkflowStatus'], where: { seasonId, assignedCityOfficerId: { not: null } }, _count: true })` and `prisma.collectiveApplication.groupBy({ by: ['assignedCityOfficerId', 'workflowStatus'], where: { seasonId, assignedCityOfficerId: { not: null } }, _count: true })`.
- **DB Round Trips:** `3` lightweight queries in `Promise.all` (**zero N+1 per officer**).
- **Supporting Indexes:** `@@index([assignedCityOfficerId, cityWorkflowStatus, assignedAt(sort: Desc)])` and `@@index([assignedCityOfficerId, workflowStatus, assignedAt(sort: Desc)])`.
- **Payload Boundary:** `<= 8 KB`.

---

### Screen 11: Individual Officer Review Workspace (`OfficerReviewWorkspace`)
- **Role:** `CITY_OFFICER` (scoped to `assignedCityOfficerId === actor.id`)
- **Endpoints:**
  1. Left rail queue: `GET /api/v2/city/intake-queue?track=INDIVIDUAL&officerId=me&limit=25`
  2. Active dossier header + 5 criterion judgments: `GET /api/v2/city/applications/INDIVIDUAL/:id/workspace`
  3. Selected criterion declarations & evidence metadata: `GET /api/v2/individual/applications/:id/criteria/:criterionCode`
- **Query Shape & Prisma Strategy:**
  - Workspace header loads `IndividualApplication`, `schoolJudgments` (5 rows), `cityJudgments` (5 rows), and `supplementRequests` (`<= 10` rows). Declarations and evidence metadata are fetched per selected criterion tab (`ETHICS`..`INTEGRATION`).
- **DB Round Trips:** `1` for workspace header + `1` for active criterion tab.
- **Supporting Indexes:** `@@index([assignedCityOfficerId, cityWorkflowStatus, assignedAt(sort: Desc)])`, `@@unique([individualApplicationId, criterionCode])`.
- **Payload Boundary:** Workspace header `<= 15 KB`; Criterion tab `<= 25 KB`.

---

### Screen 12: Collective Officer Review Workspace (`CollectiveOfficerReviewWorkspace`)
- **Role:** `CITY_OFFICER` (scoped to `assignedCityOfficerId === actor.id`)
- **Endpoints:**
  1. Assigned collective queue: `GET /api/v2/city/intake-queue?track=COLLECTIVE&officerId=me&limit=25`
  2. Active collective workspace: `GET /api/v2/city/applications/COLLECTIVE/:id/workspace`
  3. Paginated member roster (on TT02/TT03 tab): `GET /api/v2/collective/applications/:id/roster?limit=50`
- **Query Shape & Prisma Strategy:**
  - Workspace loads `CollectiveApplication` (including shared `totalMembers`, `participatingMembers`, `recognizedMembers`, `tt02MeetsThreshold`, `tt03MeetsThreshold`), the 4 `CollectiveRequirementRecord` rows (`TT01..TT04`) with their `evidenceLinks -> evidenceObject` metadata, the 4 `CollectiveCityRequirementJudgment` rows, and `supplementRequests`.
  - Member roster is fetched separately with cursor pagination (`limit=50`) so a 500-member `LIEN_CHI_HOI` never bloats the initial workspace response.
- **DB Round Trips:** `1` for 4-requirement workspace; `1` when opening paginated roster.
- **Supporting Indexes:** `@@index([assignedCityOfficerId, workflowStatus, assignedAt(sort: Desc)])`, `@@unique([collectiveApplicationId, requirementCode])`, `@@unique([collectiveApplicationId, studentCode])`.
- **Payload Boundary:** Workspace `<= 30 KB`; Roster page `<= 20 KB`.

---

### Screen 13: Supplement Queue & Composer (`SupplementRequestComposer` & Supplement Tracker)
- **Role:** `SCHOOL_OFFICER`, `CITY_OFFICER`, `CITY_MANAGER`
- **Endpoint:** `GET /api/v2/supplements?track=...&stage=...&status=OPEN|RESUBMITTED&cursor=...&limit=25`
- **Requested Data:** Active supplement requests with deadline countdowns, target application code, criterion/requirement code, and latest response timestamp.
- **Query Shape & Prisma Strategy:**
  - `prisma.supplementRequest.findMany({ where: { track, stage, status }, orderBy: [{ deadlineAt: 'asc' }, { requestedAt: 'desc' }], take: 25, select: { id, track, stage, criterionOrReqCode, scopeType, requestReason, deadlineAt, status, requestedAt, individualApplication: { select: { id, applicationCode, fullNameSnapshot, schoolReviewUnitId } }, collectiveApplication: { select: { id, applicationCode, collectiveNameSnapshot } } } })`
- **DB Round Trips:** `1`.
- **Supporting Index:** `@@index([track, stage, status, deadlineAt])` on `SupplementRequest`.
- **Payload Boundary:** `<= 25 KB`.

---

### Screen 14: Committee Queue & Decision Workspace (`CommitteeQueueView` & `CommitteeApplicationWorkspace`)
- **Role:** `CITY_COMMITTEE`
- **Endpoint:** `GET /api/v2/committee/queue?track=INDIVIDUAL|COLLECTIVE&seasonCode=2025-2026&status=COMMITTEE_PENDING&cursor=...&limit=25`
- **Requested Data:** Applications that have completed City Officer review (`COMMITTEE_PENDING` or `FINALIZED_*`), showing officer overall conclusion, 5-criterion / 4-requirement judgment summary badges, TT02/TT03 threshold flags (for Collectives), and active `CommitteeDecisionRecord`.
- **Query Shape & Prisma Strategy:**
  - Indexed filter on `(seasonId, currentReviewStage = 'COMMITTEE_FINALIZATION', cityWorkflowStatus)` for Individual, and `(seasonId, workflowStatus IN ['COMMITTEE_PENDING', 'FINALIZED_RECOGNIZED', 'FINALIZED_NOT_RECOGNIZED'])` for Collective.
- **DB Round Trips:** `1`.
- **Supporting Indexes:** `@@index([seasonId, currentReviewStage, cityWorkflowStatus, schoolForwardedAt(sort: Desc)])` and `@@index([seasonId, workflowStatus, submittedToCityAt(sort: Desc)])`.
- **Payload Boundary:** `<= 30 KB` per 25 rows.

---

### Screen 15: Final Results & Official Decision Publication (`CommitteeResultsView`)
- **Role:** `CITY_COMMITTEE`, `ADMIN`, `CITY_MANAGER`, `SCHOOL_OFFICER`
- **Endpoint:** `GET /api/v2/results/final?seasonCode=2025-2026&track=INDIVIDUAL|COLLECTIVE&isPublished=true&outcome=RECOGNIZED&cursor=...&limit=50`
- **Requested Data:** Persisted `ApplicationFinalResult` records joined with `RecognitionDecisionBatch` (`decisionNumber`, `decisionDate`, `signedByName`) and applicant/collective summary fields.
- **Query Shape & Prisma Strategy:**
  - `prisma.applicationFinalResult.findMany({ where: { seasonId, track, isPublished, outcome }, orderBy: { publishedAt: 'desc' }, take: 50, select: { id, outcome, isPublished, decisionNumberSnapshot, decisionDateSnapshot, certificateSerialNumber, publishedAt, individualApplication: { select: { id, applicationCode, studentCodeSnapshot, fullNameSnapshot, facultyName, schoolReviewUnitId } }, collectiveApplication: { select: { id, applicationCode, collectiveNameSnapshot, collectiveTypeSnapshot, schoolReviewUnitId } } } })`
- **DB Round Trips:** `1`.
- **Supporting Index:** `@@index([seasonId, track, isPublished, outcome])` on `ApplicationFinalResult`.
- **Payload Boundary:** `<= 35 KB` per 50 rows.

---

### Screen 16: Institution & Unit Management (`InstitutionManagement`)
- **Role:** `ADMIN`
- **Endpoint:** `GET /api/v2/admin/institutions`
- **Requested Data:** Hierarchy of `Institution`, `SchoolReviewUnit`, `FacultyDepartment`, and `CollectiveUnit` counts.
- **Query Shape & Prisma Strategy:**
  - `prisma.institution.findMany({ orderBy: { code: 'asc' }, select: { id, code, officialName, shortName, group, isActive, schoolUnits: { select: { id, code, officialName, unitType, isActive, _count: { select: { faculties: true, collectiveUnits: true, individualApps: true } } } } } })`
- **DB Round Trips:** `1`.
- **Supporting Indexes:** `@@index([group, isActive])` on `Institution`; `@@index([institutionId, isActive])` on `SchoolReviewUnit`.
- **Payload Boundary:** `<= 20 KB` (Danang has ~15–25 institutions/units).
- **Cache Suitability:** Server cache `TTL = 5 min`, invalidated on Admin mutation.

---

### Screen 17: Staff & Preparer Authorization Management (`StaffManagement`)
- **Role:** `ADMIN`
- **Endpoint:** `GET /api/v2/admin/users?roleCode=...&unitId=...&cursor=...&limit=50`
- **Requested Data:** Staff accounts (`UserRoleAssignment`) and Collective Representative authorizations (`CollectivePreparerAuthorization`).
- **Query Shape & Prisma Strategy:**
  - `prisma.userRoleAssignment.findMany({ where: { roleCode, schoolReviewUnitId, isActive: true }, take: 50, select: { id, roleCode, schoolReviewUnitId, grantedAt, user: { select: { id, fullName, email, phone, status, lastLoginAt } }, schoolReviewUnit: { select: { id, shortName } } } })`
- **DB Round Trips:** `1`.
- **Supporting Index:** `@@index([roleCode, schoolReviewUnitId, isActive])` on `UserRoleAssignment`; `@@index([userId, seasonId, isActive])` on `CollectivePreparerAuthorization`.
- **Payload Boundary:** `<= 25 KB`.

---

### Screen 18: Analytics Dashboard (`AnalyticsPage`)
- **Role:** `CITY_MANAGER`, `CITY_COMMITTEE`, `ADMIN`, `SCHOOL_OFFICER` (unit-scoped)
- **Endpoint:** `GET /api/v2/analytics/summary?seasonCode=2025-2026&unitId=...`
- **Requested Data:** Funnel counts by stage/status, breakdown by `SchoolReviewUnit` / `Institution`, recognition rate, and supplement bottleneck metrics.
- **Query Shape & Prisma Strategy:**
  - Uses SQL `GROUP BY` aggregations (`prisma.individualApplication.groupBy({ by: ['schoolReviewUnitId', 'currentReviewStage', 'cityWorkflowStatus'], where: { seasonId }, _count: true })` and `prisma.collectiveApplication.groupBy({ by: ['institutionId', 'workflowStatus'], where: { seasonId }, _count: true })`). **Never loads individual application rows into Node.js memory to compute charts.**
- **DB Round Trips:** `2` parallel `GROUP BY` queries.
- **Supporting Indexes:** `@@index([seasonId, institutionId, currentReviewStage])` on `IndividualApplication`; `@@index([seasonId, institutionId, workflowStatus])` on `CollectiveApplication`.
- **Payload Boundary:** `<= 10 KB`.
- **Cache Suitability:** Short server-side cache (`TTL = 30s`) with `stale-while-revalidate`.

---

### Screen 19: Reports Hub & Official Exports (`ReportsHub` & Audit Log Viewer)
- **Role:** `ADMIN`, `CITY_MANAGER`, `CITY_COMMITTEE`
- **Endpoints:** `GET /api/v2/reports/export?seasonCode=2025-2026&track=...&reportType=...` & `GET /api/v2/audit/logs?applicationId=...&cursor=...&limit=50`
- **Requested Data:** Tabular export rows (CSV/XLSX stream) and paginated append-only `AuditLogEvent` records.
- **Query Shape & Prisma Strategy:**
  - Audit logs use cursor pagination over `@@index([applicationId, occurredAt(sort: Desc)])` or `@@index([track, actionCode, occurredAt(sort: Desc)])`.
  - Exports fetch batches of `250` rows using keyset pagination (`cursor: { id }`) and stream chunks without holding > 250 rows in memory.
- **DB Round Trips:** `1` per 250-row export batch; `1` for audit log page.
- **Payload Boundary:** Audit page `<= 30 KB`; Export streamed via chunked transfer.

---

## 3. `EXPLAIN (ANALYZE, BUFFERS)` VERIFICATION PLAN (BE1 & BE8 GATE)

Once PostgreSQL is provisioned in BE1 and seeded with a synthetic volume dataset (`5,000` Individual applications, `400` Collective applications, `35,000` declarations, `50,000` evidence links, `18,000` collective roster entries):
1. Every repository query for Screens 01–19 will be executed under `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`.
2. **Hard Acceptance Criteria:**
   - **Zero `Seq Scan`** on `IndividualApplication`, `CollectiveApplication`, `IndividualDeclarationItem`, `CollectiveMemberRosterEntry`, `EvidenceObject`, `SupplementRequest`, or `AuditLogEvent` for filtered queries.
   - Index Scan / Index Only Scan buffer hits `>= 98%` on warm cache.
   - Execution time inside PostgreSQL `<= 25 ms` for all queue and workspace queries at p95.
