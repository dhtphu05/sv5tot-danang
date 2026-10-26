# 12 — TESTING, QUALITY GATES & VERIFICATION STRATEGY
**Project:** 5TOT Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure  
**Cross-References:** `02_DOMAIN_MODEL.md`, `04_STATE_MACHINES.md`, `09_QUERY_AND_INDEX_STRATEGY.md`, `11_TRANSACTIONS_AND_CONCURRENCY.md`

---

## 1. FOUR-TIER TESTING PYRAMID FOR DUAL-MODE & BACKEND V2

| Test Tier | Target Scope | Execution Environment | Mandatory Coverage |
| :--- | :--- | :--- | :--- |
| **Tier 1: Domain Unit Tests** | Pure domain evaluators (`*.policy.ts`), 2025–2026 Individual criteria evaluators, Collective TT01–TT04 evaluators, state transition tables. | Node.js test runner (`npm test`), zero I/O (`< 1s`). | Mandatory Collective A/B/C boundary tests (`TT02 === 100%`, `TT03 >= 20%`, shared `totalMembers`), Individual GPA/IELTS/Group A+B thresholds, state machine guard matrices. |
| **Tier 2: Dual-Mode Contract & Isolation Tests** | `modeResolver`, `demoServicesAdapter`, `backendServicesAdapter`, `httpClient` zero-fallback guarantee. | Node.js test runner (`src/test/dual-mode-backend.test.ts`). | Verifies `DEMO` mode works offline, `BACKEND` mode never falls back to Demo on `4xx/5xx`, and both adapters satisfy `DomainServicesBundle`. |
| **Tier 3: PostgreSQL Integration & Concurrency Tests (BE1–BE8)** | Prisma repositories, ACID transactions, RBAC/ABAC scope enforcement, optimistic locking (`409`), idempotency keys. | Ephemeral PostgreSQL 16 test database (`DATABASE_URL` test schema) reset per suite. | Parallel competing requests (`Promise.all` officer reassignments, concurrent judgment saves, duplicate submissions), cross-unit `SCHOOL_OFFICER` `403` rejection, unassigned `CITY_OFFICER` `403` rejection. |
| **Tier 4: Query Plan & Load Verification (BE8–BE9)** | `EXPLAIN (ANALYZE, BUFFERS)` assertions on all 19 screen queries + k6 load tests against staging. | Seeded PostgreSQL (`5,000` Individual + `400` Collective dossiers). | Zero `Seq Scan` on large tables, p95 read `<= 300ms`, p95 write `<= 500ms`, connection pool stability under `80` concurrent requests/instance. |

---

## 2. MANDATORY COLLECTIVE TT01–TT04 UNIT TEST SPECIFICATION

Every build must verify the exact canonical Collective threshold rules (`02_DOMAIN_MODEL.md` Section 2):

1. **Collective A (`totalMembers = 42`, `participatingMembers = 42`, `recognizedMembers = 9`):**
   - `tt02MeetsThreshold`: `42 === 42` -> **`true`** (`100%`)
   - `tt03MeetsThreshold`: `9 * 100 (900) >= 42 * 20 (840)` -> **`true`** (`21.43% >= 20%`)
2. **Collective B (`totalMembers = 42`, `participatingMembers = 41`, `recognizedMembers = 9`):**
   - `tt02MeetsThreshold`: `41 === 42` -> **`false`** (`97.62% < 100%`)
   - `tt03MeetsThreshold`: `9 * 100 (900) >= 42 * 20 (840)` -> **`true`** (`21.43% >= 20%`)
3. **Collective C (`totalMembers = 42`, `participatingMembers = 42`, `recognizedMembers = 8`):**
   - `tt02MeetsThreshold`: `42 === 42` -> **`true`** (`100%`)
   - `tt03MeetsThreshold`: `8 * 100 (800) >= 42 * 20 (840)` -> **`false`** (`19.05% < 20%`)
4. **Shared Denominator & Submission Invariant Checks:**
   - Rejects `totalMembers <= 0` on submission (`422 INVALID_TOTAL_MEMBERS`).
   - Rejects `participatingMembers > totalMembers` or `recognizedMembers > totalMembers` (`400 INVALID_MEMBER_COUNTS`).
   - Confirms that `tt02MeetsThreshold === false` or `tt03MeetsThreshold === false` produces structured advisory warnings for the Collective Representative and City Reviewer, **without** blocking `POST /api/v2/collective/applications/:id/submit` or auto-rejecting the application.
   - Confirms **TT01** requires School-level Collective recognition metadata + evidence attachment (prerequisite only, zero School-stage workflow queue).
   - Confirms **TT04** requires explicit confirmation status + evidence attachment + human reviewer judgment.
