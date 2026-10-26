# LEAN-4.2 Correction: School Navigation & Workflow Deduplication — PDF-Only Official Document Upload

## 1. Executive Summary & Problem Resolution

Under the original design, the School Reviewer backoffice for **5TOT Đà Nẵng** suffered from two operational pain points:
1. **Unnecessary Manual Metadata Entry (Problem A):** When attaching the official school recommendation decision document, the reviewer was forced to manually type in:
   - *Số hiệu văn bản* (e.g. "182/QĐ-ĐHĐN")
   - *Ngày ban hành* (Issue date)
   - *Người ký* (Signer full name)
   - *Chức vụ người ký* (Signer title)
   - *Trích yếu / Tiêu đề văn bản*

   This created administrative friction, risked typo errors, and forced reviewer cognitive load for data that is already authoritatively present in the signed and sealed PDF itself.

2. **Sidebar Fragmentation & Redundancy (Problem B):** The sidebar contained 7-8 competing, overlapping destinations (`Tổng quan`, `Hồ sơ sinh viên`, `Cần xét sơ tuyển`, `Yêu cầu bổ sung`, `Danh sách đề nghị Thành phố`, `Đã chuyển Thành phố`, `Thống kê`, `Thông báo`), forcing users to jump between disjoint views to accomplish a single linear task.

3. **Checklist Clutter:** The pre-forwarding UI presented four large green cards that cluttered the operational workflow.

### LEAN-4.2 Solution Applied:
- **PDF-Only Upload:** The School Reviewer now only needs to upload the signed and sealed PDF document. Manual text inputs for Số hiệu, Ngày ban hành, Người ký, and Chức vụ are eliminated. Any pre-existing historical metadata is displayed in read-only form for archival viewing without requiring manual input or fabricating placeholders.
- **Sidebar Consolidation into 4 Core Destinations:**
  1. `Tổng quan` (`/staff/school`)
  2. `Hồ sơ sơ tuyển` (`/staff/school/applications`) with 5 canonical filters: **Tất cả**, **Chờ xét**, **Đang xét**, **Cần bổ sung**, **Đã xét**.
  3. `Danh sách đề nghị` (`/staff/school/awaiting-forward`), unifying candidate selection, PDF upload, pre-forwarding validation, and post-forwarding read-only archive.
  4. `Thông báo` (`/staff/school/notifications`).
- **Checklist Simplification:** The 4 large green cards have been removed from the default UI. A single concise contextual error message is shown when invalid, and the action button is enabled directly when valid.
- **Authority & Scope Preservation:** 1-time batch forwarding per School Unit per Season; 8 UDN member institutions share 1 consolidated batch and 1 PDF document under `unit-udn`; unselected students are not marked failed.

---

## 2. Architecture & Contract Matrix

| Layer | Component / Contract | Change Made in LEAN-4.2 | Backwards Compatibility |
|---|---|---|---|
| **Backend Schemas** | `schoolForwardingBatch.schemas.ts` | Relaxed `AttachDecisionDocumentSchema` metadata fields to `z.string().optional()`. Kept strict validation for `fileId`, `fileName` (.pdf regex), and `fileSize`. | 100% compatible. Existing stored batches keep historical fields. |
| **Backend Service** | `schoolForwardingBatch.service.ts` | `attachDecisionDocument` validates PDF attachment without demanding `decisionNumber`. `confirmBatchForwarding` validates `batch.decisionFileId`. | Old and new callers execute smoothly. |
| **Backend DB** | `prismaSchoolForwardingBatch.repository.ts` | Nullable date parsing and summary blocking reasons reflect `decisionFileId`. | Zero database migration needed (`?` fields already nullable). |
| **Frontend Types** | `schoolReviewTypes.ts` | Made `decisionNumber`, `decisionTitle`, `decisionDate`, `signedByName`, `signedByTitle` optional on `DecisionDocumentMetadata` & `AttachDecisionDocumentInput`. | TypeScript compile passes across all layers. |
| **Frontend Adapter** | `demoAdapter.ts` | Updated `attachSchoolDecisionDocument`, `confirmSchoolForwardingBatch`, `getSchoolForwardingBatchSummary` to enforce PDF file requirement without requiring metadata. | Demo & testing suites fully functional. |
| **UI Widget** | `SchoolDecisionDocumentSection.tsx` | Removed metadata form inputs and edit state. Clean upload dropzone, PDF status badge, file size, "Xem văn bản" preview, replace/remove buttons, and read-only display for pre-existing metadata. | Replaced without breaking parent props. |
| **UI Widget** | `SchoolForwardingPreValidationBar.tsx` | Removed 4 large green cards. Displays single concise contextual error or ready notice, with direct button activation. | Replaced cleanly. |
| **Navigation Shell** | `StaffAppShell.tsx` | Deduplicated School Officer sidebar navigation to 4 primary items. | Cleaner, faster user experience. |
| **Routing / Permissions** | `permissions.ts` | Updated `resolveActiveSidebarNavId` to map secondary/legacy routes to the 4 canonical destinations. | Deep links and bookmarks preserved. |
| **Unified Workspace** | `SchoolBackofficeViews.tsx` | Renamed to "Hồ sơ sơ tuyển" with 5 canonical filter buttons and badge counters. | Consolidates all review queues in one place. |

---

## 3. Strict Boundary Guarantees (No Slop / No Placeholders)

1. **No Dummy Metadata Generation:** When a user uploads a new PDF, the application does NOT generate "Không rõ", "N/A", today's date, or fabricated decision numbers.
2. **Authoritative Institutional Isolation:**
   - 8 member institutions of Đại học Đà Nẵng (`inst-dut`, `inst-due`, `inst-ued`, `inst-ufl`, `inst-ute`, `inst-vku`, `inst-smp`, `inst-vnuk`) route to `unit-udn` and produce 1 unified batch and 1 PDF document.
   - Independent schools (Duy Tân, Đông Á, Kiến trúc Đà Nẵng, Thể dục Thể thao, v.v.) maintain strictly isolated review units and forwarding batches.
3. **Preservation of Unselected Students:** Unselected students in a proposed list remain in their current state; they are never marked failed or rejected.
