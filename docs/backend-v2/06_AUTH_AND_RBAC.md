# 06 — AUTHENTICATION, RBAC, ABAC & P0 PROTOTYPE CONTAINMENT
**Project:** 5TOT Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure  
**Cross-References:** `server/authMiddleware.ts`, `src/shared/api/httpClient.ts`, `01_ARCHITECTURE.md`, `04_STATE_MACHINES.md`

---

## 1. P0 SECURITY FINDING: PROTOTYPE EXPOSURE & IMMEDIATE CONTAINMENT

### 1.1 Exact Prototype Vulnerabilities Identified
1. **External Reachability:** `server.ts` binds to `0.0.0.0:3000` inside the Cloud Run preview container (`https://ais-dev-...run.app` and `https://ais-pre-...run.app`), exposing `/api/*` routes over HTTPS.
2. **Unauthenticated Capability Bypass (`server/authMiddleware.ts` Lines 85–88):**
   ```ts
   if (!explicitRoleHeader && !authHeader) {
     return next();
   }
   ```
   Any HTTP request that omits both `x-5tot-actor-role` and `Authorization` bypasses `requireStaffCapability(...)` completely.
3. **Privilege Escalation via Client Headers (`server/authMiddleware.ts` Lines 50–73):**
   `resolveActorFromRequest()` reads `x-5tot-actor-id`, `x-5tot-actor-name`, `x-5tot-actor-role`, and `x-5tot-actor-unit` directly from unverified HTTP request headers, and defaults missing roles to `'CITY_OFFICER'`.
4. **Client Body Identity Trust (`server/collectiveRoutes.ts`):**
   Multiple routes accept `req.body.user`, `req.body.manager`, or `req.body.actor` as the authoritative actor identity.
5. **Unauthenticated Evidence Access (`server/evidenceAndAuditRoutes.ts` Lines 145–200):**
   `GET /api/evidence/:id` and `DELETE /api/evidence/:id` have no authentication or ownership guard.

### 1.2 Mandatory Containment Policy Before Real Users / Pilot Data
- **Classification:** **P0 CRITICAL SECURITY EXPOSURE** if used with real student PII or official documents.
- **Immediate Containment Rules:**
  1. **Zero Real PII in Prototype Mode:** No real student national IDs, transcripts, or official decision documents may be uploaded while `.data/5tot-backend-db.json` and `server/authMiddleware.ts` are active.
  2. **Default Mode Isolation:** Interactive Demo Mode (`DEMO`) remains the default browser experience (`executionMode.ts` defaults to `'DEMO'`) and never calls `/api/*`.
  3. **BE2 Hard Gate:** Before any staging/pilot deployment in `BACKEND` mode, `server/authMiddleware.ts` is completely replaced by the fail-closed `authenticate` + `authorize` pipeline below, and `x-5tot-actor-*` headers are deleted from `src/shared/api/httpClient.ts`.

---

## 2. PRODUCTION BACKEND V2 ZERO-TRUST AUTHENTICATION

### 2.1 Fail-Closed Authentication Pipeline (`authenticate.ts`)
1. **Strict Header & Body Hygiene:**
   - Any `x-5tot-actor-*` header is ignored and stripped by ingress middleware.
   - `req.body.actor`, `req.body.user`, and `req.body.manager` are stripped by Zod `.strict()` schemas; actor identity is read exclusively from `req.authActor` populated by `authenticate.ts`.
   - If no valid `Authorization: Bearer <accessToken>` (or signed `HttpOnly` session token) is present, `authenticate.ts` immediately returns `401 UNAUTHORIZED` (`never` calls `next()` with a fallback role).
2. **Token & Session Architecture (`AuthSession` Model):**
   - **Access Token (JWT, 15-minute TTL):** Signed with asymmetric RS256 (or 256-bit HS256 secret from Secret Manager), containing `{ sub: user.id, sid: session.id, roles: [...], unitId: schoolReviewUnitId, iat, exp }`.
   - **Refresh Token (Opaque 256-bit random token, 7-day TTL):** Stored in an `HttpOnly; Secure; SameSite=Lax; Path=/api/v2/auth` cookie. Only its `SHA-256` digest (`refreshTokenHash`) is persisted in `AuthSession`.
   - **Refresh Rotation & Reuse Detection:** Every `POST /api/v2/auth/refresh` rotates `refreshTokenHash` within the same `tokenFamilyId`. Presenting an already-rotated token triggers immediate revocation of all `AuthSession` rows sharing that `tokenFamilyId` (`revokeReason = 'TOKEN_REUSE_DETECTED'`).
   - **Password Hashing:** Argon2id (`memoryCost: 65536`, `timeCost: 3`, `parallelism: 4`) for credential accounts; OIDC/Google Workspace token verification (`ssoSubjectId`) for institutional SSO accounts.

---

## 3. SERVER-SIDE RBAC & ABAC RESOURCE-SCOPE MATRIX

Every protected route declares both:
1. **RBAC Capability Requirement:** Verified against active `UserRoleAssignment` rows (`isActive === true && revokedAt === null`).
2. **ABAC Resource-Scope Guard:** Verified against the target database row inside the service/transaction before any read or write.

| Role (`SystemRoleCode`) | Permitted Capabilities | Mandatory Server-Side Resource Scope (ABAC Formula) | Fail-Closed Rejection |
| :--- | :--- | :--- | :--- |
| `STUDENT` | `MANAGE_OWN_APPLICATION`, `SUBMIT_OWN_APPLICATION`, `RESPOND_OWN_SUPPLEMENT`, `VIEW_OWN_RESULT` | `app.applicantUserId === req.authActor.userId` | `403 FORBIDDEN_APPLICATION_OWNER` |
| `COLLECTIVE_PREPARER` | `CREATE_COLLECTIVE_APPLICATION`, `EDIT_COLLECTIVE_APPLICATION`, `SUBMIT_COLLECTIVE_APPLICATION`, `RESPOND_COLLECTIVE_SUPPLEMENT` | `EXISTS (SELECT 1 FROM CollectivePreparerAuthorization WHERE userId = req.authActor.userId AND collectiveUnitId = app.collectiveUnitId AND seasonId = app.seasonId AND isActive = true)` | `403 UNAUTHORIZED_COLLECTIVE_PREPARER` |
| `SCHOOL_OFFICER` | `VIEW_SCHOOL_QUEUE`, `REVIEW_SCHOOL_APPLICATIONS`, `REQUEST_SCHOOL_SUPPLEMENT`, `CONCLUDE_SCHOOL_REVIEW`, `FORWARD_SCHOOL_TO_CITY` | `track === 'INDIVIDUAL' && app.schoolReviewUnitId === req.authActor.schoolReviewUnitId` (Read-only after `FORWARDED_TO_CITY`; `0` access to Collective review) | `403 UNIT_SCOPE_MISMATCH` |
| `CITY_OFFICER` | `VIEW_ASSIGNED_QUEUE`, `REVIEW_CRITERIA`, `REVIEW_COLLECTIVE_CRITERIA`, `REQUEST_SUPPLEMENT`, `COMPLETE_REVIEW` | `app.assignedCityOfficerId === req.authActor.userId` (Cannot mutate unassigned dossiers or dossiers assigned to another officer) | `403 NOT_ASSIGNED_CITY_OFFICER` |
| `CITY_MANAGER` | `VIEW_ALL_APPLICATIONS`, `ASSIGN_APPLICATIONS`, `REASSIGN_APPLICATIONS`, `MONITOR_WORKLOAD`, `VIEW_REPORTS` | City-wide read & assignment scope across all `SchoolReviewUnit`s; cannot directly record criterion review judgments or overwrite applicant declarations. | `403 INSUFFICIENT_CAPABILITY` |
| `CITY_COMMITTEE` | `VIEW_COMMITTEE_QUEUE`, `FINALIZE_RESULTS`, `REOPEN_COMMITTEE_DECISION`, `PUBLISH_RESULTS`, `VIEW_REPORTS` | City-wide scope for applications in `COMMITTEE_PENDING` / `FINALIZED_*`; cannot mutate applications still in `DRAFT`, `SCHOOL_PRELIMINARY`, or `CITY_IN_REVIEW`. | `403 INVALID_COMMITTEE_STAGE` |
| `ADMIN` | `MANAGE_SEASONS`, `MANAGE_INSTITUTIONS`, `MANAGE_STAFF_USERS`, `MANAGE_CRITERIA`, `PUBLISH_RESULTS`, `VIEW_AUDIT_LOGS` | System-wide administrative scope; every write requires audit reason and logs full before/after state in `AuditLogEvent`. | `403 ADMIN_REQUIRED` |
