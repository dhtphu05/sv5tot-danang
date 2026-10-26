# 05 — COMPLETE REST API CONTRACTS & DTO SPECIFICATION
**Project:** 5TOT Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure  
**Cross-References:** `src/entities/services/contracts.ts`, `06_AUTH_AND_RBAC.md`, `09_QUERY_AND_INDEX_STRATEGY.md`

---

## 1. API DESIGN & ENVELOPE STANDARDS

1. **Zero Raw Prisma Leakage:** Controllers map database records to explicit, versioned TypeScript/Zod DTOs (`*SummaryDto`, `*DetailDto`, `*MutationResultDto`). Internal columns (`passwordHash`, `refreshTokenHash`, `bucketName`, `objectKey`) are never serialized.
2. **Standard Response Envelopes:**
   - **Single Resource / Mutation:**
     ```json
     { "success": true, "data": { ... }, "meta": { "requestId": "req_...", "version": 4 } }
     ```
   - **Paginated List / Queue:**
     ```json
     {
       "success": true,
       "data": [ ... ],
       "pagination": { "nextCursor": "cuid_...", "hasMore": true, "limit": 25, "totalCount": 142 }
     }
     ```
   - **Error Envelope:**
     ```json
     {
       "success": false,
       "errorCode": "WORKFLOW_VERSION_CONFLICT",
       "error": "Hồ sơ đã được cập nhật bởi phiên làm việc khác. Vui lòng tải lại.",
       "details": { "expectedVersion": 3, "currentVersion": 4 },
       "requestId": "req_..."
     }
     ```
3. **Purpose-Built Loading Boundaries (Section 9 Compliance):**
   - **Summary List DTOs** exclude nested declaration items, member rosters, and full audit logs.
   - **Criterion / Requirement Detail DTOs** load declarations and evidence metadata for a single criterion/requirement on demand.
   - **Binary Evidence Content** is never embedded as Base64 in JSON responses; clients request short-lived presigned URLs (`GET /api/v2/evidence/:id/view-url`).

---

## 2. COMPLETE ENDPOINT CATALOG (MAPPED TO `DomainServicesBundle`)

### 2.1 Authentication & Session (`AuthDomainService`)

| Method & Route | Request DTO (Zod) | Response DTO | Auth & Scope | Error Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/v2/auth/login` | `{ email, password?, ssoIdToken?, preferredTrack? }` | `AuthSessionDto` (sets `HttpOnly` refresh cookie + returns short-lived `accessToken`) | Public (Rate-limited: 10 req/min/IP) | `400 INVALID_INPUT`, `401 INVALID_CREDENTIALS`, `403 ACCOUNT_LOCKED`, `429 RATE_LIMITED` |
| `POST /api/v2/auth/refresh` | `HttpOnly` Refresh Cookie | `{ accessToken, expiresAt, user }` | Refresh Cookie (`AuthSession`) | `401 SESSION_EXPIRED`, `401 TOKEN_REUSE_DETECTED` |
| `GET /api/v2/auth/me` | None | `AuthenticatedUserProfileDto` (roles, `schoolReviewUnitId`, active `collectiveGrants`) | Authenticated (Any Role) | `401 UNAUTHORIZED` |
| `POST /api/v2/auth/logout` | None | `{ loggedOut: true }` | Authenticated (Any Role) | `401 UNAUTHORIZED` |

### 2.2 Individual Applications (`IndividualApplicationDomainService`)

| Method & Route | Request DTO | Response DTO | Auth & Resource Scope (ABAC) | Version / Pagination | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/v2/individual/me/overview` | Query: `{ seasonCode? }` | `IndividualApplicationOverviewDto` (header + 5 criterion counters + active supplements + finalResult) | `STUDENT` (`applicantUserId === actor.id`) | Single summary (1 query) | `401`, `404` |
| `POST /api/v2/individual/applications` | `{ seasonCode, facultyName, className, gpaScale4, gpaScale10?, conductScore }` | `IndividualApplicationOverviewDto` | `STUDENT` (own account) | `Idempotency-Key` | `400`, `409 ALREADY_EXISTS_FOR_SEASON` |
| `GET /api/v2/individual/applications/:id/criteria/:criterionCode` | Path: `id`, `criterionCode` | `IndividualCriterionDetailDto` (declarations + evidence metadata + stage judgments) | Owner `STUDENT`, unit-matched `SCHOOL_OFFICER`, assigned `CITY_OFFICER`, `CITY_MANAGER`, `CITY_COMMITTEE` | Bounded to 1 criterion | `401`, `403 FORBIDDEN_SCOPE`, `404` |
| `PUT /api/v2/individual/applications/:id/declarations/:declId` | `{ expectedVersion, requirementCode, title, numericValue?, structuredAttributes, evidenceObjectIds[] }` | `IndividualDeclarationDto` + `{ newVersion }` | `STUDENT` (`applicantUserId === actor.id` & stage editable) | `expectedVersion` required | `400`, `403`, `409 WORKFLOW_VERSION_CONFLICT`, `422 STAGE_LOCKED` |
| `DELETE /api/v2/individual/applications/:id/declarations/:declId` | `{ expectedVersion }` | `{ deleted: true, newVersion }` | `STUDENT` (`applicantUserId === actor.id` & stage editable) | `expectedVersion` required | `403`, `404`, `409`, `422` |
| `POST /api/v2/individual/applications/:id/submit` | `{ expectedVersion }` | `IndividualApplicationOverviewDto` | `STUDENT` (`applicantUserId === actor.id`) | `expectedVersion` + `Idempotency-Key` | `403`, `409`, `422 INCOMPLETE_CRITERIA` |

### 2.3 School Preliminary Review (`SchoolReviewDomainService` — Individual Track Only)

| Method & Route | Request DTO | Response DTO | Auth & Resource Scope (ABAC) | Version / Pagination | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/v2/school-review/queue` | Query: `{ seasonCode, status?, faculty?, search?, cursor?, limit=25 }` | `Paginated<SchoolQueueRowDto>` | `SCHOOL_OFFICER` (`actor.schoolReviewUnitId` enforced), `ADMIN` | Cursor pagination (`limit <= 100`) | `401`, `403 UNIT_SCOPE_MISMATCH` |
| `POST /api/v2/school-review/applications/:id/criteria/:criterionCode/judgment` | `{ expectedVersion, judgmentStatus, reviewerNote? }` | `SchoolCriterionJudgmentDto` + `{ newVersion }` | `SCHOOL_OFFICER` (`app.schoolReviewUnitId === actor.schoolReviewUnitId`) | `expectedVersion` required | `403`, `409`, `422 NOT_IN_SCHOOL_STAGE` |
| `POST /api/v2/school-review/applications/:id/supplements` | `{ expectedVersion, criterionOrReqCode, scopeType, requestReason, deadlineAt? }` | `SupplementRequestDto` + `{ newVersion }` | `SCHOOL_OFFICER` (matching `schoolReviewUnitId`) | `expectedVersion` + `Idempotency-Key` | `403`, `409`, `422` |
| `POST /api/v2/school-review/applications/:id/conclude` | `{ expectedVersion, outcome: 'ELIGIBLE_FOR_CITY' \| 'NOT_ELIGIBLE_AT_SCHOOL', note? }` | `SchoolQueueRowDto` | `SCHOOL_OFFICER` (matching `schoolReviewUnitId`) | `expectedVersion` required | `403`, `409`, `422 UNREVIEWED_CRITERIA_REMAIN` |
| `POST /api/v2/school-review/applications/:id/forward-to-city` | `{ expectedVersion, submissionNote? }` | `SchoolQueueRowDto` | `SCHOOL_OFFICER` (matching `schoolReviewUnitId`) | `expectedVersion` + `Idempotency-Key` | `403`, `409`, `422 NOT_ELIGIBLE_FOR_FORWARDING` |

### 2.4 Collective Applications (`CollectiveApplicationDomainService` — Direct-to-City)

| Method & Route | Request DTO | Response DTO | Auth & Resource Scope (ABAC) | Version / Pagination | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/v2/collective/authorized-units` | Query: `{ seasonCode? }` | `AuthorizedCollectiveUnitDto[]` | `COLLECTIVE_PREPARER` (returns only units granted to `actor.id`) | Bounded list | `401`, `403` |
| `POST /api/v2/collective/applications` | `{ seasonCode, collectiveUnitId }` | `CollectiveApplicationOverviewDto` | `COLLECTIVE_PREPARER` (active grant for `collectiveUnitId + seasonId`) | `Idempotency-Key` | `403 UNAUTHORIZED_COLLECTIVE_PREPARER`, `409` |
| `GET /api/v2/collective/applications/:id/overview` | Path: `id` | `CollectiveApplicationOverviewDto` (includes `totalMembers`, `participatingMembers`, `recognizedMembers`, `tt02MeetsThreshold` [100%], `tt03MeetsThreshold` [>=20%]) | Granted `COLLECTIVE_PREPARER`, assigned `CITY_OFFICER`, `CITY_MANAGER`, `CITY_COMMITTEE`, `ADMIN` | Single summary | `401`, `403`, `404` |
| `GET /api/v2/collective/applications/:id/requirements/:reqCode` | Path: `id`, `reqCode` (`TT01..TT04`) | `CollectiveRequirementDetailDto` (requirement fields + evidence links + city judgment) | Same as overview | Bounded to 1 requirement | `403`, `404` |
| `PUT /api/v2/collective/applications/:id/requirements/:reqCode` | `{ expectedVersion, totalMembers?, participatingMembers?, recognizedMembers?, tt01..tt04Fields, evidenceObjectIds[] }` | `CollectiveRequirementDetailDto` + `{ metrics, newVersion }` | `COLLECTIVE_PREPARER` (active grant & status in `DRAFT` or `CITY_SUPPLEMENT_REQUESTED`) | `expectedVersion` required | `400 INVALID_MEMBER_DENOMINATOR`, `403`, `409`, `422` |
| `GET /api/v2/collective/applications/:id/roster` | Query: `{ cursor?, limit=50, filter? }` | `Paginated<CollectiveMemberRosterEntryDto>` | Same as overview | Cursor pagination (`limit <= 100`) | `403`, `404` |
| `PUT /api/v2/collective/applications/:id/roster` | `{ expectedVersion, syncMetricsFromRoster: boolean, entries: RosterInputDto[] }` | `{ totalMembers, participatingMembers, recognizedMembers, tt02MeetsThreshold, tt03MeetsThreshold, newVersion }` | `COLLECTIVE_PREPARER` (active grant & editable status) | `expectedVersion` required | `400 DUPLICATE_STUDENT_CODE`, `403`, `409` |
| `POST /api/v2/collective/applications/:id/submit` | `{ expectedVersion }` | `CollectiveApplicationOverviewDto` | `COLLECTIVE_PREPARER` (active grant) | `expectedVersion` + `Idempotency-Key` | `403`, `409`, `422 INVALID_TOTAL_MEMBERS_OR_MISSING_EVIDENCE` |

### 2.5 City Intake, Assignment, City Officer Review & Supplements (`StaffAssignmentDomainService`)

| Method & Route | Request DTO | Response DTO | Auth & Resource Scope (ABAC) | Version / Pagination | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/v2/city/intake-queue` | Query: `{ track, seasonCode, status?, unitId?, officerId?, search?, cursor?, limit=25 }` | `Paginated<CityQueueSummaryRowDto>` | `CITY_MANAGER`, `CITY_COMMITTEE`, `ADMIN` (or `CITY_OFFICER` scoped to `assignedCityOfficerId === actor.id`) | Cursor pagination (`limit <= 100`) | `401`, `403` |
| `POST /api/v2/city/applications/:track/:id/assign` | `{ expectedVersion, officerUserId, assignmentNote?, reassignmentReason? }` | `AssignmentResultDto` | `CITY_MANAGER`, `ADMIN` (`ASSIGN_APPLICATIONS`) | `expectedVersion` + `Idempotency-Key` | `400 MISSING_REASSIGN_REASON`, `403`, `409`, `422` |
| `POST /api/v2/city/applications/:track/:id/review/start` | `{ expectedVersion }` | `{ status, cityReviewStartedAt, newVersion }` | `CITY_OFFICER` (`assignedCityOfficerId === actor.id`) | `expectedVersion` | `403 NOT_ASSIGNED_OFFICER`, `409` |
| `POST /api/v2/city/applications/:track/:id/review/judgment` | `{ expectedVersion, code, judgmentStatus, reviewerNote?, flaggedEvidenceLinkIds? }` | `CityJudgmentDto` + `{ newVersion }` | `CITY_OFFICER` (`assignedCityOfficerId === actor.id`) | `expectedVersion` | `403 NOT_ASSIGNED_OFFICER`, `409`, `422` |
| `POST /api/v2/city/applications/:track/:id/supplements` | `{ expectedVersion, criterionOrReqCode, scopeType, targetId?, requestReason, requiredAction?, deadlineAt? }` | `SupplementRequestDto` + `{ newVersion }` | `CITY_OFFICER` (`assignedCityOfficerId === actor.id`) | `expectedVersion` + `Idempotency-Key` | `403`, `409`, `422` |
| `POST /api/v2/applications/:track/:id/supplements/respond` | `{ expectedVersion, responses: [{ supplementRequestId, explanationNote, attachedEvidenceIds[] }] }` | `{ status, openSupplementCount: 0, newVersion }` | Owner `STUDENT` (Individual) or granted `COLLECTIVE_PREPARER` (Collective) | `expectedVersion` + `Idempotency-Key` | `403`, `409`, `422 INCOMPLETE_SUPPLEMENT_RESPONSE` |
| `POST /api/v2/city/applications/:track/:id/review/complete` | `{ expectedVersion, overallJudgment, summaryNote }` | `{ status: 'COMMITTEE_PENDING', newVersion }` | `CITY_OFFICER` (`assignedCityOfficerId === actor.id`) | `expectedVersion` + `Idempotency-Key` | `403`, `409`, `422 OPEN_SUPPLEMENTS_OR_UNREVIEWED_ITEMS` |

### 2.6 Committee Decisions & FinalResult Publication (`CommitteeDecisionDomainService`)

| Method & Route | Request DTO | Response DTO | Auth & Resource Scope (ABAC) | Version / Pagination | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/v2/committee/queue` | Query: `{ track, seasonCode, status?, unitId?, cursor?, limit=25 }` | `Paginated<CommitteeQueueRowDto>` | `CITY_COMMITTEE`, `CITY_MANAGER`, `ADMIN` (`VIEW_COMMITTEE_QUEUE`) | Cursor pagination (`limit <= 100`) | `401`, `403` |
| `POST /api/v2/committee/applications/:track/:id/decision` | `{ expectedVersion, outcome: 'RECOGNIZED' \| 'NOT_RECOGNIZED', decisionNote? }` | `CommitteeDecisionDto` + `ApplicationFinalResultDto` | `CITY_COMMITTEE`, `ADMIN` (`FINALIZE_RESULTS`) | `expectedVersion` + `Idempotency-Key` | `403`, `409`, `422 NOT_READY_FOR_COMMITTEE` |
| `POST /api/v2/committee/applications/:track/:id/reopen` | `{ expectedVersion, reopenReason }` | `{ status: 'COMMITTEE_PENDING', newVersion }` | `CITY_COMMITTEE`, `ADMIN` (`REOPEN_COMMITTEE_DECISION`) | `expectedVersion` | `403`, `409 ALREADY_PUBLISHED` |
| `POST /api/v2/committee/results/publish-batch` | `{ seasonCode, track, decisionNumber, decisionTitle, decisionDate, signedByName, signedByTitle, applicationIds? }` | `RecognitionDecisionBatchDto` + `{ publishedCount }` | `ADMIN`, `CITY_COMMITTEE` (`PUBLISH_RESULTS`) | `Idempotency-Key` | `403`, `409 DUPLICATE_DECISION_NUMBER`, `422` |
| `GET /api/v2/results/final` | Query: `{ seasonCode, track, unitId?, outcome?, cursor?, limit=50 }` | `Paginated<ApplicationFinalResultRowDto>` | Staff (`VIEW_PUBLISHED_RESULTS`); Applicants view own via `/me/overview` | Cursor pagination (`limit <= 100`) | `401`, `403` |

### 2.7 Evidence Storage, Admin, Analytics & Audit (`EvidenceStorageDomainService` & `AuditLogDomainService`)

| Method & Route | Request DTO | Response DTO | Auth & Resource Scope (ABAC) | Version / Pagination | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /api/v2/evidence/upload-intent` | `{ track, applicationId, criterionOrReqCode, originalFileName, mimeType, sizeBytes, sha256Checksum }` | `{ evidenceObjectId, uploadUrl, expiresAt, requiredHeaders }` | Owner `STUDENT` or granted `COLLECTIVE_PREPARER` | Rate-limited (30/min/user) | `400 UNSUPPORTED_MIME_OR_SIZE`, `403`, `422` |
| `POST /api/v2/evidence/:id/finalize` | `{ applicationId, targetDeclarationOrReqId }` | `EvidenceMetadataDto` | Owner `STUDENT` or granted `COLLECTIVE_PREPARER` | `Idempotency-Key` | `400 CHECKSUM_OR_MAGIC_BYTE_MISMATCH`, `403`, `404` |
| `GET /api/v2/evidence/:id/view-url` | Path: `id` | `{ viewUrl, expiresAt, mimeType, fileName }` | Owner, unit-matched `SCHOOL_OFFICER`, assigned `CITY_OFFICER`, `CITY_MANAGER`, `CITY_COMMITTEE`, `ADMIN` | Short-lived URL (`120s`) | `403 FORBIDDEN_EVIDENCE_SCOPE`, `404`, `423 QUARANTINED` |
| `GET /api/v2/analytics/summary` | Query: `{ seasonCode, unitId? }` | `AnalyticsDashboardSummaryDto` | Staff (`VIEW_REPORTS`, unit-scoped for `SCHOOL_OFFICER`) | Aggregated SQL (`GROUP BY`) | `401`, `403` |
| `GET /api/v2/audit/logs` | Query: `{ applicationId?, track?, actorUserId?, actionCode?, cursor?, limit=50 }` | `Paginated<AuditLogEventDto>` | `ADMIN`, `CITY_MANAGER`, `CITY_COMMITTEE` (or scoped dossier reviewers) | Cursor pagination (`limit <= 100`) | `401`, `403` |
