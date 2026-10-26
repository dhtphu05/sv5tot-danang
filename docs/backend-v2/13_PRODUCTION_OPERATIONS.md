# 13 — PRODUCTION OPERATIONS, DEPLOYMENT, OBSERVABILITY & DR RUNBOOK
**Project:** 5TOT Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure  
**Cross-References:** `10_PERFORMANCE_AND_SCALING.md`, `14_IMPLEMENTATION_ROADMAP.md`

---

## 1. ENVIRONMENT TOPOLOGY & SECRETS MANAGEMENT

### 1.1 Four-Environment Separation
| Environment | Execution Mode | Database (`DATABASE_URL`) | Evidence Object Storage | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Local Dev (Demo)** | `DEMO` | None (Browser fixtures) | In-memory Demo preview | UI/UX iteration, offline Demo testing. |
| **Local Dev / CI (Backend)** | `BACKEND` | Local / Ephemeral PostgreSQL 16 (`5tot_dev` / `5tot_test`) | Local MinIO / GCS emulator (`5tot-dev-evidence`) | Integration, concurrency, and `EXPLAIN ANALYZE` tests. |
| **Staging (`staging`)** | `DEMO` & `BACKEND` | Cloud SQL for PostgreSQL 16 (`5tot-staging-db`, private IP) | Private GCS Bucket (`5tot-danang-staging-evidence`) | Full E2E UAT with Thành Đoàn / HSV TP. Đà Nẵng, k6 load testing, restore drills. |
| **Production (`prod`)** | `BACKEND` (with isolated `/demo` sandbox) | Cloud SQL for PostgreSQL 16 HA (`5tot-prod-db`, Regional High Availability) | Private GCS Bucket (`5tot-danang-prod-evidence`, CMEK + Object Versioning) | Official 2025–2026 campaign execution. |

### 1.2 Secrets Management (Google Cloud Secret Manager)
- Secrets are **never** stored in `.env` files in git or baked into Docker images.
- Injected at Cloud Run startup via Secret Manager volume/env bindings:
  - `DATABASE_URL` (with `?connection_limit=10&pool_timeout=10&connect_timeout=5`)
  - `JWT_ACCESS_SECRET` / `JWT_PRIVATE_KEY`
  - `REFRESH_TOKEN_PEPPER`
  - `GCS_SIGNING_SERVICE_ACCOUNT_KEY` (or Workload Identity Federation IAM signer)
  - `OIDC_CLIENT_SECRET`

---

## 2. PRISMA MIGRATIONS, DOCKER & CLOUD RUN DEPLOYMENT

1. **Migration Discipline:**
   - `prisma migrate dev` is used **only** in local development to author SQL migration files under `prisma/migrations/`.
   - Staging and Production execute `npx prisma migrate deploy` as a dedicated **Cloud Run Job** prior to rolling out new Cloud Run Service revisions.
   - Backward-compatible expand-and-contract migrations are mandatory so zero-downtime rolling updates never break active requests.
2. **Health & Readiness Probes:**
   - `GET /api/v2/health/live`: Liveness probe (`200 OK` if Node.js event loop responds within `< 50ms`).
   - `GET /api/v2/health/ready`: Readiness probe (`SELECT 1` on Prisma connection pool; returns `503 SERVICE_UNAVAILABLE` if DB is unreachable or shutting down).
3. **Graceful Shutdown (`SIGTERM`):**
   - On `SIGTERM` from Cloud Run:
     1. Readiness probe immediately flips to `503` so load balancer stops routing new requests.
     2. HTTP server stops accepting new connections (`server.close()`) while allowing in-flight transactions up to `8,000 ms` to complete.
     3. Flushes Pino structured logs and calls `await prisma.$disconnect()` before exiting `0`.

---

## 3. STRUCTURED LOGGING, SENSITIVE DATA REDACTION & SLOW QUERY OBSERVABILITY

1. **Structured JSON Logging (Pino -> Cloud Logging):**
   - Every log entry includes `{ timestamp, severity, requestId, actorUserId, actorRole, track, applicationId, method, path, statusCode, durationMs }`.
2. **Mandatory Sensitive-Data Redaction:**
   - Pino `redact` configuration strips:
     - `req.headers.authorization`
     - `req.headers.cookie`
     - `*.password`, `*.passwordHash`, `*.refreshToken`, `*.accessToken`
     - `*.presignedPutUrl`, `*.viewUrl` (query signatures redacted)
3. **Slow Query Observability:**
   - Prisma `$on('query')` middleware logs a `WARNING` event (`SLOW_DB_QUERY`) whenever any SQL statement exceeds `150 ms` (including parameterized query shape, duration, and `requestId`, with parameter literals redacted).
   - Cloud SQL Query Insights is enabled on Staging and Production to track top queries by total execution time and lock wait.

---

## 4. BACKUP, RESTORE DRILLS & ROLLBACK PROCEDURES

1. **Database Backups:**
   - Automated daily Cloud SQL snapshots (`02:00 ICT`) with **35-day retention** plus continuous **Point-in-Time Recovery (PITR)** write-ahead log (WAL) archiving (RPO `< 5 minutes`, RTO `< 30 minutes`).
2. **Evidence Bucket Protection:**
   - GCS Object Versioning enabled + Soft Delete retention (`14 days`) to protect against accidental deletion.
3. **Mandatory Pre-Pilot Restore Drill (BE9 Gate):**
   - Restore a staging backup + WAL point-in-time snapshot into an isolated Cloud SQL clone instance, run integrity checksums on `IndividualApplication`, `CollectiveApplication`, `ApplicationFinalResult`, and `AuditLogEvent`, and verify application boot within `< 20 minutes`.
4. **Application Rollback:**
   - Cloud Run traffic splitting allows instant (`< 10 seconds`) rollback to the previous immutable container revision if error rate (`5xx > 1%`) or latency (`p95 > 800ms`) breaches alert thresholds.
