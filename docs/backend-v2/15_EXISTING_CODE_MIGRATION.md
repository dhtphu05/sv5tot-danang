# 15 — EXISTING CODE INVENTORY & MIGRATION DISPOSITION PLAN
**Project:** 5TOT Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure  
**Cross-References:** `07_DUAL_MODE.md`, `14_IMPLEMENTATION_ROADMAP.md`

---

## 1. MIGRATION RULES

1. **Zero Deletion During BE0-R2:** No existing source files are deleted during BE0-R2. All existing tests (`npm test`), lint (`npm run lint`), build (`npm run build`), source-size (`npm run audit:source-size`), and FSD architecture (`npm run audit:architecture`) gates remain green.
2. **Permanent Preservation of Demo Mode (`DEMO-ONLY` & `KEEP`):** Demo fixtures (`src/demo/**`, `src/staff/fixtures/**`), in-memory Demo stores (`src/staff/collectiveStore.ts`, `src/staff/schoolSelectors.ts`), and `src/entities/services/demoAdapter.ts` are permanently retained for Interactive Demo Mode (`DEMO`).
3. **Complete Decoupling of Server from Frontend Stores:** In BE3–BE4, Backend V2 modules (`src/server-v2/**`) will implement pure server-side domain evaluators and Prisma repositories, eliminating all server-side imports from `src/staff/collectiveStore.ts`.
4. **Scheduled Decommissioning in BE9 (`REPLACE / REMOVE IN BE9`):** Once `src/server-v2/**` is fully integrated in BE8, the prototype `server/*.ts` files and `.data/` JSON directory will be removed in BE9.

---

## 2. MODULE-BY-MODULE DISPOSITION MATRIX

| File / Directory Path | Classification | Current State | Target Phase & Migration Action |
| :--- | :--- | :--- | :--- |
| `prisma/schema.prisma` | **KEEP (CANONICAL V2)** | Updated in BE0-R2 with 29 models, 21 enums, TT02=100%, TT03>=20%, shared `totalMembers`, normalized judgments, `ApplicationFinalResult`, `EvidenceObjectVersion`. | Used in **BE1** to generate initial PostgreSQL migration and Prisma Client. |
| `src/shared/config/executionMode.ts` | **KEEP** | Session-stable `DEMO` / `BACKEND` mode state. | Retain permanently; disable persona-switcher UI controls when `isBackendMode() === true` in **BE8**. |
| `src/entities/services/modeResolver.ts` | **KEEP** | Deterministic switch between `demoServicesAdapter` and `backendServicesAdapter`. | Retain permanently. |
| `src/features/services/useDomainServices.ts` | **KEEP** | React hook exposing active mode and typed `DomainServicesBundle`. | Retain permanently. |
| `src/entities/services/demoAdapter.ts` | **DEMO-ONLY (KEEP)** | Interactive in-memory adapter for Demo Mode. | Retain permanently; never imported by Backend V2 server. |
| `src/demo/**` & `src/staff/fixtures/**` | **DEMO-ONLY (KEEP)** | Rich interactive fixtures for all 5TOT personas. | Retain for Demo Mode; reference catalog values (institutions, units, 2025–2026 criteria) mirrored into `prisma/seed.ts` in **BE1**. |
| `src/staff/collective/**` & `src/staff/collectiveStore.ts` | **DEMO-ONLY (KEEP FOR DEMO)** | In-browser state store for Collective Demo workflows (already implements `TT02 = 100%` and `TT03 >= 20%`). | Retain for Demo Mode; sever server-side import from `server/collectiveRoutes.ts` in **BE3/BE4**. |
| `src/entities/services/contracts.ts` | **REFACTOR (BE3–BE8)** | Typed domain service interfaces (`DomainServicesBundle`). | Extend with cursor pagination envelopes, `expectedVersion` optimistic concurrency fields, and 3-step presigned evidence methods while keeping backward compatibility for `demoAdapter.ts`. |
| `src/entities/services/backendAdapter.ts` | **REFACTOR (BE2–BE8)** | HTTP adapter calling prototype `/api/*` routes. | Update in **BE2–BE8** to call `/api/v2/*`, pass `expectedVersion` and `Idempotency-Key`, remove client-supplied `actor` body fields, and use presigned PUT/GET URLs for evidence. |
| `src/shared/api/httpClient.ts` | **REFACTOR (BE2)** | Fetch wrapper throwing `BackendApiError` (zero silent fallback). | Keep zero-fallback error handling; remove `x-5tot-actor-*` headers in **BE2** and add automatic `/api/v2/auth/refresh` retry on `401 TOKEN_EXPIRED`. |
| `server.ts` | **REFACTOR (BE1–BE2)** | Express server mounting prototype routes + Vite middleware. | Mount `/api/v2/*` pipeline (`src/server-v2/app.ts`) alongside Vite middleware in **BE1**, with graceful Prisma shutdown. |
| `server/persistence.ts` | **REPLACE (REMOVE IN BE9)** | Synchronous `.data/5tot-backend-db.json` and `.data/evidence/` file I/O. | Replaced by PostgreSQL (`prisma/schema.prisma`) in **BE1** and private Object Storage in **BE3**; deleted in **BE9**. |
| `server/authMiddleware.ts` | **REPLACE (REMOVE IN BE9)** | In-memory token map + spoofable `x-5tot-actor-*` fallback + unauthenticated bypass. | Replaced by fail-closed `authenticate.ts` & `authorize.ts` in **BE2**; deleted in **BE9**. |
| `server/individualAndSchoolRoutes.ts` | **REPLACE (REMOVE IN BE9)** | Prototype Individual & School handlers mutating JSON array. | Replaced by `src/server-v2/modules/{individual,school-review}` in **BE3–BE4**; deleted in **BE9**. |
| `server/collectiveRoutes.ts` | **REPLACE (REMOVE IN BE9)** | Prototype Collective handlers importing frontend `collectiveStore.ts`. | Replaced by `src/server-v2/modules/{collective,city-workflow}` in **BE3–BE5**; deleted in **BE9**. |
| `server/evidenceAndAuditRoutes.ts` | **REPLACE (REMOVE IN BE9)** | Base64 JSON upload & unauthenticated evidence GET. | Replaced by `src/server-v2/modules/{evidence,notifications-audit}` in **BE3 & BE7**; deleted in **BE9**. |
