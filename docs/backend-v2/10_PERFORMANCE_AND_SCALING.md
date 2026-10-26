# 10 — API PERFORMANCE TARGETS, WORKLOAD MODEL & CONNECTION SCALING
**Project:** 5TOT Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure  
**Cross-References:** `09_QUERY_AND_INDEX_STRATEGY.md`, `11_TRANSACTIONS_AND_CONCURRENCY.md`, `13_PRODUCTION_OPERATIONS.md`

---

## 1. PRODUCTION WORKLOAD MODEL (EXPLICIT ASSUMPTIONS)

The following sizing model reflects the realistic scale of the **Sinh viên 5 tốt & Tập thể Sinh viên 5 tốt TP. Đà Nẵng** campaign across Đại học Đà Nẵng member universities, affiliated universities, and colleges in a single academic season (`2025–2026`):

| Workload Parameter | Assumed Production Value | Basis / Rationale |
| :--- | :--- | :--- |
| **Total Eligible Student Population (Đà Nẵng)** | ~`85,000` students | Across ~18 universities/colleges under Thành Đoàn / HSV TP. Đà Nẵng. |
| **Active Registered Student Accounts per Season** | `4,000 – 8,000` students | Students initiating drafts or participating at School/City level. |
| **Submitted Individual Applications (School Stage)** | `2,500 – 5,000` dossiers | Submitted to `SchoolReviewUnit` queues across all institutions. |
| **Forwarded Individual Applications (City Stage)** | `600 – 1,500` dossiers | Recommended and forwarded by School units to HSV Thành phố. |
| **Submitted Collective Applications (Direct to City)** | `150 – 400` collectives | Chi hội, Liên chi hội, Chi đoàn, CLB/Đội/Nhóm submitting directly to City. |
| **Average Declarations per Individual Application** | `7 – 12` declaration items | Across 5 criteria (`30,000 – 60,000` rows per season). |
| **Average Member Roster Size per Collective** | `45` members (`30` for Chi hội; `150–400` for Liên chi hội) | `~18,000` `CollectiveMemberRosterEntry` rows per season. |
| **Average Evidence Files per Application** | `8 – 15` files | `~45,000 – 75,000` `EvidenceObject` records per season. |
| **Average Evidence File Size** | `1.8 MB` (max `15 MB`) | Scanned PDFs and mobile JPEG/PNG certificates (`~90–135 GB` object storage/season). |
| **Peak Concurrent Active Users (Submission Deadline Hour)** | `300 – 500` concurrent users | Final 6 hours before `individualSubmissionEnd` / `collectiveSubmissionEnd`. |
| **Peak Submission-Hour HTTP Request Rate** | `40 – 80 req/sec` (API) | Draft saves, presigned upload intents, evidence finalizations, and submissions. |
| **Concurrent School / City Reviewers** | `35 – 60` School Officers; `15 – 30` City Officers | Concurrent queue filtering, criterion judgments, and supplement requests. |
| **Concurrent Committee & Export Load** | `8 – 15` Committee members; `2 – 5` concurrent CSV/XLSX exports | During finalization and official decision batch publication. |

---

## 2. NON-BINDING ENGINEERING LATENCY & PAYLOAD TARGETS

*(Note: These are engineering design targets to be measured under synthetic load in BE8/BE9, not claimed current benchmark measurements.)*

| Operation Category | Target p95 Latency | Target p99 Latency | Max DB Queries | Max Response Payload |
| :--- | :---: | :---: | :---: | :---: |
| **Common Read APIs** (Overview, Queue Page, Criterion Detail) | `<= 300 ms` | `<= 600 ms` | `1 – 2` | `<= 40 KB` |
| **Common Write APIs** (Save Declaration, Update TT01–TT04, Save Judgment) | `<= 500 ms` | `<= 900 ms` | `2 – 4` (1 tx) | `<= 20 KB` |
| **Application Submission** (Individual to School / Collective Direct to City) | `<= 600 ms` | `<= 1,200 ms` | `1` ACID tx (`<= 6` queries) | `<= 25 KB` |
| **City Manager Officer Assignment / Reassignment** | `<= 400 ms` | `<= 800 ms` | `1` ACID tx (`<= 4` queries) | `<= 15 KB` |
| **Officer Review Completion** (`COMPLETE_REVIEW`) | `<= 450 ms` | `<= 900 ms` | `1` ACID tx (`<= 5` queries) | `<= 15 KB` |
| **Committee Decision & Batch Publication** (`<= 500` apps/batch) | `<= 1,500 ms` | `<= 3,000 ms` | `1` batched ACID tx | `<= 50 KB` |
| **Report / Export Generation** (Batched keyset stream) | `<= 2,500 ms` (TTFB `<= 400 ms`) | `<= 5,000 ms` | Keyset batches of `250` rows | Streamed |
| **Evidence Presigned URL Generation** (`upload-intent` / `view-url`) | `<= 200 ms` | `<= 400 ms` | `1 – 2` | `<= 2 KB` |
| **Evidence Finalize** (Bucket `HeadObject` + 4KB magic-byte check + DB tx) | `<= 650 ms` | `<= 1,200 ms` | `1` ACID tx + `2` GCS/S3 calls | `<= 5 KB` |

### Measurement Conditions (For BE8/BE9 Verification)
- **Dataset:** Seeded with `5,000` Individual applications, `400` Collective applications, `50,000` declarations, `60,000` evidence links, and `100,000` audit events.
- **Concurrency:** `100` virtual users (k6 / Autocannon) executing a realistic mix (`75%` reads, `20%` writes/judgments, `5%` submissions/exports) over a 15-minute sustained window.
- **Target Error Rate:** `< 0.1%` unexpected `5xx` errors; `0` deadlocks or lost updates.

---

## 3. CLOUD RUN AUTOSCALING & POSTGRESQL CONNECTION POOLING DESIGN

### 3.1 Preventing Database Connection Exhaustion
Cloud Run scales container instances horizontally based on CPU/request concurrency. Without strict per-instance pool limits, `N` instances multiplied by Prisma's default pool formula (`num_cpus * 2 + 1`) can exhaust Cloud SQL / PostgreSQL `max_connections`.

### 3.2 Concrete Sizing Budget
| Parameter | Configuration Value | Rationale |
| :--- | :--- | :--- |
| **PostgreSQL `max_connections`** | `100` (Standard Cloud SQL tier) | `15` reserved for superuser/migrations/admin; `85` available for application traffic. |
| **Cloud Run `max-instances`** | `8` instances | Sufficient for `8 * 80 = 640` concurrent HTTP requests (exceeding peak `500` users). |
| **Cloud Run `min-instances`** | `1` instance (during active submission/review window) | Eliminates cold-start latency during business hours; `0` off-season. |
| **Cloud Run Concurrency per Instance** | `80` concurrent requests/instance | Node.js event loop handles non-blocking I/O efficiently while queuing DB queries against the local Prisma pool. |
| **Prisma `connection_limit` per Instance** | `10` connections (`?connection_limit=10&pool_timeout=10`) | `8 max instances * 10 connections = 80 max connections <= 85 budget`. |
| **PgBouncer / Cloud SQL Proxy Pooler** | Optional upgrade path (`transaction` pooling mode with `?pgbouncer=true`) | Required only if `max-instances` is increased beyond `10`. |

### 3.3 Timeouts, Cold-Start & Backpressure Strategy
1. **Database Statement & Pool Timeouts:**
   - `pool_timeout = 10s` (time waiting to acquire a connection from Prisma's pool).
   - PostgreSQL `statement_timeout = 8000ms` (`8s`) and `lock_timeout = 3000ms` (`3s`) to prevent hung queries from pinning pool connections.
2. **Interactive Transaction Timeout:**
   - `prisma.$transaction(fn, { maxWait: 3000, timeout: 5000 })` — no external HTTP or bucket calls are allowed *inside* an open PostgreSQL transaction (bucket `HeadObject` in Evidence Finalize runs *before* opening `prisma.$transaction`).
3. **HTTP Request Timeout & Backpressure:**
   - Express server socket/request timeout set to `15,000 ms`.
   - Rate limiter (`express-rate-limit`) enforces per-IP and per-user token buckets (`120 req/min` for reads, `30 req/min` for writes/uploads), returning `429 TOO_MANY_REQUESTS` with `Retry-After` before the database pool can saturate.
4. **Cold-Start Mitigation:**
   - Lazy route module loading is avoided in favor of a lean single-bundle server build (`esbuild` / `tsx`).
   - `prisma.$connect()` is warmed during container startup readiness probe (`GET /api/v2/health/ready`) before Cloud Run routes user traffic to the instance.
