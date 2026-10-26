# 14 — RECONCILED IMPLEMENTATION ROADMAP (BE1 → BE9)
**Project:** 5TOT Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure  
**Cross-References:** `01_ARCHITECTURE.md`, `03_DATABASE_SCHEMA.md`, `09_QUERY_AND_INDEX_STRATEGY.md`, `12_TESTING_STRATEGY.md`

---

## 1. ROADMAP RECONCILIATION (BE0-R1 `BE1–BE6` → CANONICAL `BE1–BE9`)

In BE0-R1, the roadmap was compressed into 6 high-level phases (`BE1–BE6`). To align with the approved project governance and ensure continuous security, query performance, and Dual-Mode verification at every step, Backend V2 execution is formally reconciled into **9 sequential/parallelizable phases (`BE1` through `BE9`)** following the **BE0-R2 Design Freeze**:

| BE0-R1 Compressed Phase | Reconciled Canonical BE1–BE9 Phase(s) | Reason for Split / Reconciliation |
| :--- | :--- | :--- |
| BE1 (DB & Infrastructure) | **BE1** — Khởi tạo Nền tảng Backend V2, PostgreSQL, Prisma, Migrations & Hạ tầng Kiểm thử | Dedicated foundation phase with test DB & `EXPLAIN` harness before business logic. |
| BE2 (Auth & RBAC) | **BE2** — Xác thực Thực tế, Quản lý Phiên (Session), Phân quyền RBAC & Phạm vi Dữ liệu ABAC | Eliminates P0 header-trust vulnerability (`x-5tot-actor-*`) before any domain endpoints are exposed. |
| BE3 (Individual & School) + BE4 (Collective) | **BE3** — Hồ sơ Cá nhân & Tập thể, Kê khai Tiêu chí (TT01–TT04), Danh sách Thành viên & Lưu trữ Minh chứng | Unifies applicant-side authoring, TT02=100% / TT03>=20% shared denominator, and private Evidence pipeline. |
| BE3 (School Review) + BE4 (City Assignment) | **BE4** — Xét duyệt Sơ tuyển Cấp Trường (Cá nhân), Tiếp nhận Cấp Thành phố & Phân công Cán bộ | Isolates School Preliminary forwarding (Individual) vs Direct-to-City intake (Collective) & Manager assignment. |
| BE4 (City Review & Supplements) | **BE5** — Động cơ Thẩm định Cấp Thành phố & Quy trình Yêu cầu / Phản hồi Bổ sung Hồ sơ | Dedicated phase for independent City criterion/requirement judgments and scoped School/City supplement cycles. |
| BE5 (Committee & Publication) | **BE6** — Hội đồng Xét chọn, Kết quả Cuối cùng (`ApplicationFinalResult`) & Công bố Quyết định | Separates individual `ApplicationFinalResult` from `RecognitionDecisionBatch` and enforces post-publication immutability. |
| BE5 (Audit & Admin) | **BE7** — Quản trị Hệ thống, Thông báo, Nhật ký Kiểm toán Bất biến, Thống kê & Xuất Báo cáo | Adds Admin catalog management, `Notification`, `AuditLogEvent` queries, SQL `GROUP BY` analytics, and streamed exports. |
| BE6 (Adapter Integration) | **BE8** — Tích hợp Toàn diện Chế độ Kép (Dual-Mode Real Backend) & Bảo toàn Chế độ Demo | Connects `backendServicesAdapter` to `/api/v2/*` across all 19 screens while keeping `demoServicesAdapter` 100% intact. |
| BE6 (Hardening) | **BE9** — Kiểm thử E2E Staging, Kiểm thử Tải (Load Test), Bảo mật, Sao lưu/Phục hồi & Sẵn sàng Pilot | Final production gate: `EXPLAIN ANALYZE`, k6 load test, restore drill, and decommissioning of legacy `server/*`. |

---

## 2. DETAILED PHASE SPECIFICATIONS (BE1 → BE9)

### BE1 — Khởi tạo Nền tảng Backend V2, PostgreSQL, Prisma, Migrations & Hạ tầng Kiểm thử
- **Responsibilities:** Configure `src/server-v2/` modular skeleton, Zod env loader (`env.ts`), PrismaClient singleton with pool limits (`connection_limit=10`), initial SQL migration from `prisma/schema.prisma`, deterministic seed script (`2025-2026` season, Danang institutions, `SchoolReviewUnits`, `CollectiveUnits`, 2025–2026 criteria catalog), and `/api/v2/health/{live,ready}` endpoints.
- **Module Boundaries:** `prisma/`, `src/server-v2/config/`, `src/server-v2/common/`.
- **Dependencies:** Approved BE0-R2 Freeze.
- **Database Changes:** Initial migration creating all 29 tables, enums, foreign keys, and composite indexes.
- **Frontend Contract Implications:** None (Demo Mode remains default and untouched).
- **Tests:** Migration apply/rollback test, seed idempotency test, healthcheck integration test.
- **Security & Performance Gates:** Fail-fast startup if `DATABASE_URL` or secrets missing; connection pool cap verified.
- **Acceptance Criteria:** `npx prisma validate`, `npx prisma migrate deploy`, and `npx prisma db seed` succeed cleanly.

---

### BE2 — Xác thực Thực tế, Quản lý Phiên (Session), Phân quyền RBAC & Phạm vi Dữ liệu ABAC
- **Responsibilities:** Implement `User`, `UserRoleAssignment`, `CollectivePreparerAuthorization`, and `AuthSession` repositories; Argon2id login + OIDC token verification; short-lived JWT access token + rotating `HttpOnly` refresh token with reuse detection; fail-closed `authenticate` and `authorize` middlewares; strip `x-5tot-actor-*` headers.
- **Module Boundaries:** `src/server-v2/modules/auth/`, `src/server-v2/common/middleware/{authenticate,authorize}.ts`.
- **Dependencies:** BE1.
- **Database Changes:** Seeds initial admin/test accounts with Argon2id hashes and scoped `UserRoleAssignment` / `CollectivePreparerAuthorization` rows.
- **Frontend Contract Implications:** `AuthDomainService` supports `/api/v2/auth/{login,refresh,me,logout}`; `httpClient` stops sending `x-5tot-actor-*` headers to `/api/v2/*`.
- **Tests:** Unauthenticated `401` tests, token refresh rotation & reuse revocation tests, cross-unit `SCHOOL_OFFICER` `403` tests, unauthorized `COLLECTIVE_PREPARER` `403` tests.
- **Security & Performance Gates:** Zero header-spoofing paths; login rate-limited (`10 req/min/IP`); auth middleware lookup `< 10ms`.
- **Acceptance Criteria:** 100% of `/api/v2/*` protected routes fail closed (`401`/`403`) without valid session and scope.

---

### BE3 — Hồ sơ Cá nhân & Tập thể, Kê khai Tiêu chí (TT01–TT04), Danh sách Thành viên & Lưu trữ Minh chứng
- **Responsibilities:**
  - Individual draft creation, 5-criteria declaration CRUD, 2025–2026 quantitative evaluators.
  - Collective draft creation (requiring active `CollectivePreparerAuthorization`), normalized TT01–TT04 persistence, paginated `CollectiveMemberRosterEntry` CRUD, shared `totalMembers` denominator synchronization, and exact integer evaluation (`TT02: participatingMembers === totalMembers`, `TT03: recognizedMembers * 100 >= totalMembers * 20`).
  - 3-step Private Evidence Storage pipeline (`upload-intent`, direct PUT, `finalize` with SHA-256 + magic-byte verification, `view-url` with ABAC scope guard, and `EvidenceObjectVersion`).
- **Module Boundaries:** `src/server-v2/modules/{individual,collective,evidence}/`.
- **Dependencies:** BE1, BE2. (Evidence module can be developed in parallel with Individual/Collective declaration services).
- **Database Changes:** None (uses BE1 schema).
- **Frontend Contract Implications:** Aligns `IndividualApplicationDomainService`, `CollectiveApplicationDomainService`, and `EvidenceStorageDomainService` with `expectedVersion` and presigned upload DTOs.
- **Tests:** Mandatory Collective A (`42/42/9`), Collective B (`42/41/9`), Collective C (`42/42/8`) integration tests; magic-byte mismatch rejection test; cross-student evidence access `403` test.
- **Security & Performance Gates:** Zero Base64 file payloads in JSON APIs; roster pagination (`limit <= 100`); optimistic lock (`409`) verified.
- **Acceptance Criteria:** Student and Collective Representative authoring + evidence upload/view work end-to-end against PostgreSQL + Object Storage.

---

### BE4 — Xét duyệt Sơ tuyển Cấp Trường (Cá nhân), Tiếp nhận Cấp Thành phố & Phân công Cán bộ
- **Responsibilities:**
  - Individual submission to School (`STUDENT_DRAFT -> SCHOOL_PRELIMINARY`), School Officer unit-scoped queue (`Screen 07`), School criterion judgment saving, School conclusion (`ELIGIBLE_FOR_CITY`), and Forward-to-City (`Screen 08`, initializing independent `CityCriterionReviewJudgment`).
  - Collective Direct-to-City submission (`DRAFT -> CITY_UNASSIGNED`, bypassing School stage completely).
  - City Manager intake queues (`Screen 09`), officer workload aggregation (`Screen 10`), and transactional Officer assignment/reassignment (`OfficerAssignmentHistory`).
- **Module Boundaries:** `src/server-v2/modules/{school-review,city-workflow}/`.
- **Dependencies:** BE3.
- **Database Changes:** None.
- **Frontend Contract Implications:** Connects `SchoolReviewDomainService` and `StaffAssignmentDomainService`.
- **Tests:** Individual School-stage mandatory gate test (cannot assign City Officer before School forwarding); Collective direct-to-City test (never appears in School queue); cross-unit `SCHOOL_OFFICER` forwarding `403` test; concurrent manager assignment `409` test.
- **Security & Performance Gates:** `EXPLAIN ANALYZE` on School Queue and City Intake Queue confirms Index Scan (`<= 25ms`).
- **Acceptance Criteria:** Full intake and assignment lifecycle verified for both tracks.

---

### BE5 — Động cơ Thẩm định Cấp Thành phố & Quy trình Yêu cầu / Phản hồi Bổ sung Hồ sơ
- **Responsibilities:**
  - City Officer review workspaces (`Screens 11 & 12`) for Individual (5 criteria) and Collective (TT01–TT04 + evidence judgments + revision history).
  - Targeted `SupplementRequest` creation (School stage for Individual; City stage for Individual and Collective) and applicant `SupplementResponse` submission (`Screen 13`).
  - City Officer review completion (`COMPLETE_REVIEW -> COMMITTEE_PENDING`).
- **Module Boundaries:** `src/server-v2/modules/city-workflow/`.
- **Dependencies:** BE4.
- **Database Changes:** None.
- **Frontend Contract Implications:** Connects review judgment, supplement request/response, and review completion contracts.
- **Tests:** Unassigned `CITY_OFFICER` review mutation `403` test; supplement request -> applicant response -> officer re-review E2E test; review completion blocked (`422`) when open supplements remain.
- **Security & Performance Gates:** Zero N+1 queries on Officer workspaces; transaction duration `< 50ms`.
- **Acceptance Criteria:** Complete School and City review + supplementation loops pass against PostgreSQL.

---

### BE6 — Hội đồng Xét chọn, Kết quả Cuối cùng (`ApplicationFinalResult`) & Công bố Quyết định
- **Responsibilities:**
  - Committee queue (`Screen 14`), `CommitteeDecisionRecord` creation (`RECOGNIZED` / `NOT_RECOGNIZED`), pre-publication reopen (`REOPEN_COMMITTEE_DECISION`), unpublished `ApplicationFinalResult` synchronization, and atomic batch publication (`RecognitionDecisionBatch` + `ApplicationFinalResult.isPublished = true`, `Screen 15`).
- **Module Boundaries:** `src/server-v2/modules/committee/`.
- **Dependencies:** BE5.
- **Database Changes:** None.
- **Frontend Contract Implications:** Connects `CommitteeDecisionDomainService`.
- **Tests:** Post-publication immutability test (`409 APPLICATION_ALREADY_PUBLISHED` on any edit/reopen after publication); duplicate `decisionNumber` `409` test; idempotent batch publication test.
- **Security & Performance Gates:** Batch publication of `500` dossiers completes in `< 1,500ms` within a single transaction.
- **Acceptance Criteria:** Authoritative per-application `ApplicationFinalResult` and `RecognitionDecisionBatch` verified for both tracks.

---

### BE7 — Quản trị Hệ thống, Thông báo, Nhật ký Kiểm toán Bất biến, Thống kê & Xuất Báo cáo
- **Responsibilities:**
  - Admin catalog & user/grant management (`Screens 16 & 17`), `TransactionalOutboxEvent` processor for `Notification` delivery, SQL `GROUP BY` analytics dashboard (`Screen 18`), streamed CSV/XLSX exports, and paginated `AuditLogEvent` query API (`Screen 19`).
- **Module Boundaries:** `src/server-v2/modules/{catalog,notifications-audit}/`.
- **Dependencies:** BE2, BE6. (Can be developed in parallel with BE5/BE6).
- **Database Changes:** None.
- **Frontend Contract Implications:** Connects `AuditLogDomainService`, Admin, Analytics, and Export endpoints.
- **Tests:** Append-only audit log verification, unit-scoped analytics test, streamed export memory-bound test.
- **Security & Performance Gates:** Analytics query p95 `<= 150ms` via SQL `GROUP BY`; export streaming holds `<= 250` rows in heap.
- **Acceptance Criteria:** All administrative, analytics, notification, and audit features verified.

---

### BE8 — Tích hợp Toàn diện Chế độ Kép (Dual-Mode Real Backend) & Bảo toàn Chế độ Demo
- **Responsibilities:**
  - Wire `backendServicesAdapter` (`src/entities/services/backendAdapter.ts`) to all `/api/v2/*` endpoints across all 19 frontend screens.
  - Verify strict isolation between `DEMO` mode (`demoServicesAdapter`) and `BACKEND` mode (`backendServicesAdapter`), confirming zero silent fallback and zero UI duplication.
- **Module Boundaries:** `src/entities/services/`, `src/shared/api/httpClient.ts`, `src/features/services/`.
- **Dependencies:** BE1–BE7.
- **Database Changes:** None.
- **Frontend Contract Implications:** Minor DTO adapter mapping updates in `backendAdapter.ts`; zero changes to Demo Mode behavior.
- **Tests:** Full Dual-Mode E2E regression suite running every workflow in both `DEMO` mode (offline) and `BACKEND` mode (against PostgreSQL).
- **Security & Performance Gates:** Zero `x-5tot-actor-*` headers in codebase; all 19 screens verified with `EXPLAIN (ANALYZE, BUFFERS)`.
- **Acceptance Criteria:** Both `DEMO FUNCTIONAL` and `REAL BACKEND E2E VERIFIED` pass simultaneously.

---

### BE9 — Kiểm thử E2E Staging, Kiểm thử Tải (Load Test), Bảo mật, Sao lưu/Phục hồi & Sẵn sàng Pilot
- **Responsibilities:**
  - Decommission legacy prototype files (`server/persistence.ts`, `server/authMiddleware.ts`, `server/individualAndSchoolRoutes.ts`, `server/collectiveRoutes.ts`, `server/evidenceAndAuditRoutes.ts`, `.data/`).
  - Execute k6 load test (`100` concurrent users against seeded staging DB), OWASP/RBAC/ABAC penetration verification, Cloud SQL PITR backup & restore drill, and final Pilot Readiness sign-off.
- **Module Boundaries:** Infrastructure, CI/CD, `server/` cleanup.
- **Dependencies:** BE8.
- **Tests:** Load test suite, security penetration test suite, disaster recovery drill.
- **Security & Performance Gates:** p95 read `<= 300ms`, p95 write `<= 500ms`, error rate `< 0.1%`, restore RTO `< 30m`.
- **Acceptance Criteria:** Production pilot sign-off for Thành Đoàn & Hội Sinh viên TP. Đà Nẵng.
