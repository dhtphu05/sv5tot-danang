# 01 — PRODUCTION BACKEND V2 ARCHITECTURE
**Project:** Hệ thống Xét chọn Sinh viên 5 tốt & Tập thể Sinh viên 5 tốt TP. Đà Nẵng (5TOT Đà Nẵng)  
**Governing Body:** Thành Đoàn Đà Nẵng — Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure & Architecture Freeze  
**Cross-References:** `02_DOMAIN_MODEL.md`, `03_DATABASE_SCHEMA.md`, `06_AUTH_AND_RBAC.md`, `07_DUAL_MODE.md`, `prisma/schema.prisma`

---

## 1. ARCHITECTURAL PRINCIPLES

1. **Production-Grade Modular Monolith:** Backend V2 is designed as a single deployable Node.js LTS + TypeScript strict-mode service structured into strict domain modules with unidirectional dependencies (`Controller/Transport -> Application Service -> Domain Policy/Validator -> Prisma Repository -> PostgreSQL / Object Storage`).
2. **Permanent Dual-Mode Coexistence (`07_DUAL_MODE.md`):**
   - **Interactive Demo Mode (`DEMO`):** Runs 100% in-browser using isolated fixtures (`demoServicesAdapter`), supporting persona switching and full interactive workflows without touching PostgreSQL or private Cloud Storage.
   - **Real Backend Mode (`BACKEND`):** Executes authenticated REST calls (`backendServicesAdapter`) against PostgreSQL (`prisma/schema.prisma`) and private Object Storage. Never falls back silently to Demo data on network/API errors.
3. **Zero-Trust Identity & Fail-Closed Authorization (`06_AUTH_AND_RBAC.md`):**
   - Never trusts `x-5tot-actor-*` headers, query parameters, or `req.body.actor` / `req.body.user`.
   - Every protected route requires a verified server session (`AuthSession`) and passes both **RBAC** (`SystemRoleCode` capability check) and **ABAC** (resource-scope verification on `schoolReviewUnitId`, `assignedCityOfficerId`, `applicantUserId`, or `CollectivePreparerAuthorization`).
4. **Screen-Optimized APIs & Explicit Query Budgets (`09_QUERY_AND_INDEX_STRATEGY.md`):**
   - List and queue endpoints return bounded summary projections (`limit <= 100`) backed by composite B-Tree indexes.
   - Detail workspaces load criterion/requirement details on demand without Base64 binary payloads.

---

## 2. MODULAR MONOLITH DIRECTORY STRUCTURE (`src/server-v2/`)

```text
prisma/
  schema.prisma                     # Canonical PostgreSQL 16+ schema (29 models, 21 enums)
  migrations/                       # Versioned SQL migrations (executed starting in BE1)
  seed.ts                           # Deterministic catalog seed (Institutions, Units, 2025-2026 Criteria)

src/server-v2/
  app.ts                            # Express pipeline: Helmet, CORS, Pino, RateLimit, RequestContext
  config/
    env.ts                          # Fail-fast Zod validation for env vars & connection pool limits
    database.ts                     # PrismaClient singleton with pool budget & slow-query instrumentation
    storage.ts                      # S3 / GCS private bucket client for presigned URLs
  common/
    errors/
      AppError.ts                   # Canonical error codes & HTTP status mapping
      errorHandler.ts               # Structured JSON error envelope (no stack trace leakage)
    middleware/
      requestContext.ts             # Correlation ID (x-request-id) & audit context binding
      authenticate.ts               # Session/JWT verification (fail-closed)
      authorize.ts                  # RBAC capability + ABAC resource-scope guards
      validateRequest.ts            # Zod request validation (params, query, body)
      idempotency.ts                # Idempotency-Key header enforcement for state transitions
  modules/
    auth/                           # Login, OIDC/SSO, refresh rotation, session revocation
    catalog/                        # AwardSeason, Institution, SchoolReviewUnit, CollectiveUnit, Criteria
    individual/                     # Student dossier CRUD, 5-criteria declarations, submission
    school-review/                  # School preliminary queue, criterion judgment, supplement, forward-to-City
    collective/                     # Preparer grant verify, TT01-TT04, roster, shared denominator, direct submit
    city-workflow/                  # City Manager intake/assignment, City Officer review, scoped supplements
    committee/                      # Committee decision, reopen, RecognitionDecisionBatch & FinalResult
    evidence/                       # Presigned upload intent, SHA-256/magic-byte finalize, authorized view URL
    notifications-audit/            # Notification dispatch, TransactionalOutbox worker, AuditLogEvent API
```

---

## 3. LAYER RESPONSIBILITIES & DEPENDENCY RULES

| Layer | Responsibility | Prohibited Actions |
| :--- | :--- | :--- |
| **HTTP Controllers (`*.controller.ts`)** | Parse validated DTOs, extract `req.authActor`, invoke Application Service, return typed Response DTO. | Direct `prisma.*` calls, business state rules, raw Prisma entity serialization. |
| **Application Services (`*.service.ts`)** | Orchestrate `prisma.$transaction`, enforce state machine transitions (`04_STATE_MACHINES.md`), invoke ABAC policies, emit `AuditLogEvent` & `TransactionalOutboxEvent`. | Reading raw `req`/`res`, importing frontend Demo stores (`src/staff/*Store.ts`). |
| **Domain Policy & Evaluators (`*.policy.ts`)** | Pure, deterministic business rules: Individual 2025–2026 criteria evaluators, Collective TT01–TT04 evaluators (`TT02 === 100%`, `TT03 >= 20%` shared denominator), state transition guards. | I/O, HTTP, or database mutations. |
| **Repositories (`*.repository.ts`)** | Encapsulate explicit `select` / `include` Prisma queries aligned with `09_QUERY_AND_INDEX_STRATEGY.md` and enforce optimistic `version` checks. | Unbounded `findMany()` without `take`, returning unprojected full relation graphs. |
