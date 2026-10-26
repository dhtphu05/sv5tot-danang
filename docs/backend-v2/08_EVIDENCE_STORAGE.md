# 08 — PRIVATE EVIDENCE STORAGE, VERSIONING & SECURITY DESIGN
**Project:** 5TOT Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure  
**Cross-References:** `prisma/schema.prisma` (`EvidenceObject`, `EvidenceObjectVersion`, `ApplicationEvidenceLink`, `EvidenceReviewJudgment`), `06_AUTH_AND_RBAC.md`

---

## 1. ARCHITECTURAL PRINCIPLES

1. **Private Durable Object Storage Only:** All Real Backend Mode evidence files are stored in a private Google Cloud Storage (GCS) or S3-compatible bucket (`publicAccessPrevention = enforced`). No object is ever publicly readable via a static URL.
2. **Zero File Buffering in Express:** Node.js / Express never buffers multi-megabyte binary uploads or Base64 JSON strings in memory. Uploads use short-lived, cryptographically signed **Presigned PUT URLs** directly from the browser to Object Storage.
3. **Strict Separation of Metadata and Binary Content:** Application APIs (`/overview`, `/criteria/:code`, `/requirements/:code`) return lightweight `EvidenceMetadataDto` records (`id`, `originalFileName`, `mimeType`, `sizeBytes`, `versionNumber`, `scanStatus`, `reviewJudgments`). Binary bytes are streamed only when a user opens `EvidenceViewer` (`GET /api/v2/evidence/:id/view-url`).
4. **Immutable Evidence Versioning (`EvidenceObjectVersion`):** Replacing an evidence file during a supplement cycle creates a new `EvidenceObjectVersion` (`versionNumber = N + 1`) with its own `objectKey` and `sha256Checksum` while preserving version `1..N` for audit and reviewer comparison.

---

## 2. END-TO-END UPLOAD, FINALIZATION & VIEW PIPELINE

```mermaid
sequenceDiagram
    participant Client as Browser (Student / Collective Preparer)
    participant API as Backend V2 (/api/v2/evidence)
    participant DB as PostgreSQL (Prisma)
    participant Bucket as Private GCS / S3 Bucket

    Client->>API: 1. POST /upload-intent (fileName, mimeType, sizeBytes, sha256)
    API->>DB: Verify ABAC ownership & editable stage; insert EvidenceObject(PENDING_UPLOAD)
    API-->>Client: Return { evidenceObjectId, presignedPutUrl (300s), requiredHeaders }
    Client->>Bucket: 2. PUT binary file directly to presignedPutUrl (Content-Length, SHA-256)
    Bucket-->>Client: 200 OK
    Client->>API: 3. POST /:id/finalize (applicationId, declarationOrReqId)
    API->>Bucket: HeadObject + Range GET first 4KB (verify size, SHA-256 & magic bytes)
    API->>DB: Transaction: mark isFinalized=true, create EvidenceObjectVersion(v1) & ApplicationEvidenceLink, increment evidenceCount, write AuditLogEvent
    API-->>Client: 200 OK (EvidenceMetadataDto)
```

### 2.1 Step 1 — Presigned Upload Initiation (`POST /api/v2/evidence/upload-intent`)
- **Preconditions:**
  - Caller is authenticated `STUDENT` (owning `IndividualApplication`) or `COLLECTIVE_PREPARER` (holding active grant for `CollectiveApplication`).
  - Dossier is in an editable state (`STUDENT_DRAFT`, `DRAFT`, `SCHOOL_SUPPLEMENT_REQUESTED`, or `CITY_SUPPLEMENT_REQUESTED`).
  - File size: `1 <= sizeBytes <= 15,728,640` (15 MB).
  - Allowed MIME types & extensions: `application/pdf` (`.pdf`), `image/jpeg` (`.jpg`, `.jpeg`), `image/png` (`.png`), `image/webp` (`.webp`). Office documents (`.doc/.docx/.xls/.xlsx`) are discouraged for primary certificates or require PDF conversion except for roster templates.
- **Object Key Format:**
  `seasons/{seasonCode}/{track}/{applicationId}/{evidenceObjectId}/v{versionNo}/{sanitizedUuid}.{ext}`

### 2.2 Step 2 — Validation, Magic-Byte Inspection & Finalization (`POST /api/v2/evidence/:id/finalize`)
- Server executes `HeadObject` against the private bucket to confirm `ContentLength === sizeBytes` and `ChecksumSHA256 === sha256Checksum`.
- Server fetches the first `4,096` bytes (`Range: bytes=0-4095`) and verifies file magic bytes:
  - PDF: `%PDF-` (`25 50 44 46 2D`)
  - JPEG: `FF D8 FF`
  - PNG: `89 50 4E 47 0D 0A 1A 0A`
  - WEBP: `RIFF....WEBP`
- If magic bytes do not match the declared `mimeType`, the object is immediately deleted from the bucket, `scanStatus` is set to `QUARANTINED`, and the API returns `400 MAGIC_BYTE_MIME_MISMATCH`.
- Inside `prisma.$transaction`, the server sets `isFinalized = true`, `scanStatus = CLEAN`, inserts `EvidenceObjectVersion`, creates `ApplicationEvidenceLink`, updates `totalEvidenceCount` on the parent application, and writes an `AuditLogEvent`.

---

## 3. ROLE-SCOPED EVIDENCE ACCESS AUTHORIZATION MATRIX

`GET /api/v2/evidence/:id/view-url` never issues a presigned `GET` URL (`TTL = 120 seconds`, `ResponseContentDisposition = inline`) unless the caller satisfies the ABAC policy for the linked application:

| Actor Role | Individual Application Evidence Access | Collective Application Evidence Access |
| :--- | :--- | :--- |
| `STUDENT` | Allowed **only** if `individualApp.applicantUserId === actor.userId`. | **DENIED (`403`)** |
| `COLLECTIVE_PREPARER` | **DENIED (`403`)** | Allowed **only** if caller holds active `CollectivePreparerAuthorization` for `(collectiveUnitId, seasonId)`. |
| `SCHOOL_OFFICER` | Allowed **only** if `individualApp.schoolReviewUnitId === actor.schoolReviewUnitId`. | **DENIED (`403`)** (Collectives bypass School stage). |
| `CITY_OFFICER` | Allowed **only** if `individualApp.assignedCityOfficerId === actor.userId`. | Allowed **only** if `collectiveApp.assignedCityOfficerId === actor.userId`. |
| `CITY_MANAGER` | Allowed for any Individual dossier in `CITY_REVIEW`, `COMMITTEE_FINALIZATION`, or `COMPLETED`. | Allowed for any Collective dossier in `CITY_*`, `COMMITTEE_PENDING`, `FINALIZED_*`, or `PUBLISHED`. |
| `CITY_COMMITTEE` | Allowed for any Individual dossier in `COMMITTEE_FINALIZATION` or `COMPLETED`. | Allowed for any Collective dossier in `COMMITTEE_PENDING`, `FINALIZED_*`, or `PUBLISHED`. |
| `ADMIN` | Allowed (every view logged in `AuditLogEvent`). | Allowed (every view logged in `AuditLogEvent`). |

---

## 4. ORPHAN CLEANUP & RETENTION POLICY

1. **Orphaned Upload Cleanup:** Any `EvidenceObject` with `isFinalized = false` and `uploadedAt < now() - 2 hours` is swept by a scheduled background job (Cloud Scheduler -> `/api/v2/internal/jobs/cleanup-orphan-evidence`), deleting the unlinked bucket object and removing the pending row.
2. **Soft Deletion & Immutability During Review:**
   - Applicants can unlink (`ApplicationEvidenceLink.unlinkedAt = now()`) an attachment while in `DRAFT`, but once an application is submitted (`SCHOOL_PRELIMINARY` or `CITY_UNASSIGNED`), existing `EvidenceObjectVersion` rows are **immutable** (`422 EVIDENCE_LOCKED_AFTER_SUBMISSION`). Supplement responses append new `EvidenceObject` links or increment `EvidenceObjectVersion`.
3. **Multi-Year Retention:** Finalized evidence for submitted applications is retained in Standard storage for the active academic year + 1 year, then transitioned via GCS/S3 Object Lifecycle Management to Nearline/Archive storage for 5 years to support inspection by Thành Đoàn / Hội Sinh viên TP. Đà Nẵng.
