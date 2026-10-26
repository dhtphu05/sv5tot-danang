# 5TOT ĐÀ NẴNG — BE0-R2
## AUTHORITATIVE BACKEND V2 PRODUCTION BLUEPRINT & ARCHITECTURE FREEZE

- **Cơ quan quản lý:** Thành Đoàn Đà Nẵng
- **Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng
- **Phase:** `BE0-R2 — DOMAIN CORRECTION, PERFORMANCE DESIGN & ARCHITECTURE FREEZE GATE`
- **Status:** **PASS — ARCHITECTURE FROZEN FOR BE1**

---

## 1. CANONICAL DOCUMENTATION SUITE INDEX (`docs/backend-v2/`)

This master blueprint indexes and reconciles the complete 15-document Backend V2 specification suite and `prisma/schema.prisma`:

1. [`docs/backend-v2/01_ARCHITECTURE.md`](docs/backend-v2/01_ARCHITECTURE.md) — Modular Monolith structure (`src/server-v2/`), layer boundaries, and dependency rules.
2. [`docs/backend-v2/02_DOMAIN_MODEL.md`](docs/backend-v2/02_DOMAIN_MODEL.md) — Domain entity separation, Individual 5-criteria rules, and **confirmed Collective TT01–TT04 invariants (`TT02 = 100%`, `TT03 >= 20%`, shared `totalMembers` denominator)**.
3. [`docs/backend-v2/03_DATABASE_SCHEMA.md`](docs/backend-v2/03_DATABASE_SCHEMA.md) — Mermaid ERD and full specification of all 29 PostgreSQL models and 21 enums in [`prisma/schema.prisma`](prisma/schema.prisma).
4. [`docs/backend-v2/04_STATE_MACHINES.md`](docs/backend-v2/04_STATE_MACHINES.md) — Individual (School -> City -> Committee -> FinalResult) and Collective (Direct-to-City -> Committee -> FinalResult) state machines and transition matrices.
5. [`docs/backend-v2/05_API_CONTRACTS.md`](docs/backend-v2/05_API_CONTRACTS.md) — Complete `/api/v2/*` REST endpoint catalog, request/response DTOs, error codes, and pagination/version controls.
6. [`docs/backend-v2/06_AUTH_AND_RBAC.md`](docs/backend-v2/06_AUTH_AND_RBAC.md) — P0 prototype vulnerability containment, zero-trust JWT/session architecture, and server-side RBAC + ABAC resource-scope policy matrix.
7. [`docs/backend-v2/07_DUAL_MODE.md`](docs/backend-v2/07_DUAL_MODE.md) — Permanent Dual-Mode architecture (`DEMO` vs `BACKEND`), strict isolation invariants, and zero-fallback guarantee.
8. [`docs/backend-v2/08_EVIDENCE_STORAGE.md`](docs/backend-v2/08_EVIDENCE_STORAGE.md) — Private GCS/S3 object storage, 3-step presigned PUT/finalize/GET pipeline, SHA-256 & magic-byte validation, and `EvidenceObjectVersion` immutability.
9. [`docs/backend-v2/09_QUERY_AND_INDEX_STRATEGY.md`](docs/backend-v2/09_QUERY_AND_INDEX_STRATEGY.md) — Mandatory 19-screen query & composite index matrix, payload budgets, N+1 prevention, and `EXPLAIN (ANALYZE, BUFFERS)` verification plan.
10. [`docs/backend-v2/10_PERFORMANCE_AND_SCALING.md`](docs/backend-v2/10_PERFORMANCE_AND_SCALING.md) — Danang production workload model, p95/p99 latency targets, and Cloud Run + PostgreSQL connection pool sizing (`8 instances * 10 connections = 80 <= 85 budget`).
11. [`docs/backend-v2/11_TRANSACTIONS_AND_CONCURRENCY.md`](docs/backend-v2/11_TRANSACTIONS_AND_CONCURRENCY.md) — 13-operation ACID transaction boundary, optimistic locking (`version`), and `Idempotency-Key` matrix.
12. [`docs/backend-v2/12_TESTING_STRATEGY.md`](docs/backend-v2/12_TESTING_STRATEGY.md) — 4-tier testing pyramid and mandatory Collective A (`42/42/9`), B (`42/41/9`), and C (`42/42/8`) boundary test cases.
13. [`docs/backend-v2/13_PRODUCTION_OPERATIONS.md`](docs/backend-v2/13_PRODUCTION_OPERATIONS.md) — Environment topology, Secret Manager, Cloud Run deployment, graceful shutdown, Pino PII redaction, and Cloud SQL PITR backup/restore drills.
14. [`docs/backend-v2/14_IMPLEMENTATION_ROADMAP.md`](docs/backend-v2/14_IMPLEMENTATION_ROADMAP.md) — Reconciled **BE1 → BE9** phased implementation roadmap with Vietnamese task titles and acceptance gates.
15. [`docs/backend-v2/15_EXISTING_CODE_MIGRATION.md`](docs/backend-v2/15_EXISTING_CODE_MIGRATION.md) — Complete source file inventory and migration disposition (`KEEP`, `DEMO-ONLY`, `REFACTOR`, `REPLACE`).

---

## 2. CONFIRMED COLLECTIVE TT01–TT04 DOMAIN RULES (CORRECTED IN BE0-R2)

All references to `70%` and `30%` from BE0-R1 have been purged and replaced with the canonical 2025–2026 rules:

1. **TT01 (School-Level Collective Recognition Prerequisite):**
   - Collective must hold actual School-level "Tập thể Sinh viên 5 tốt" recognition with attached decision evidence (`tt01DecisionNumber`, `tt01IssuingUnitName`, `tt01DecisionDate`).
   - This is a **prerequisite verified by the City Officer**, NOT a School-stage approval step in the workflow.
2. **TT02 (100% Movement Participation):**
   - **Exact 100% requirement:** `totalMembers > 0 && participatingMembers === totalMembers`.
3. **TT03 (>= 20% School-Level Individual SV5T Recognition):**
   - **At least 20% requirement (Exact Integer Arithmetic):** `totalMembers > 0 && recognizedMembers * 100 >= totalMembers * 20`.
4. **TT04 (No Legal / Disciplinary Violations):**
   - Explicit confirmation (`NO_VIOLATIONS` / `HAS_VIOLATIONS` / `NEEDS_CLARIFICATION`), supporting evidence, and human review required.
5. **Shared Authoritative Denominator (`CollectiveApplication.totalMembers`):**
   - Both TT02 and TT03 use the single shared `totalMembers` column on `CollectiveApplication` (`totalMembers >= 1` on submission; `0 <= participatingMembers <= totalMembers`; `0 <= recognizedMembers <= totalMembers`).
   - Threshold booleans (`tt02MeetsThreshold`, `tt03MeetsThreshold`) are advisory decision-support flags and never act as unauthorized hard submission blockers or automatic recognition decisions.
