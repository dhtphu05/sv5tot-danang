# 5TOT — LEAN-4.1 CORRECTION
## DIRECT SCHOOL FINALIZATION — SELECT, ATTACH AND FORWARD

**Document Version:** 1.0.0  
**Effective Date:** October 2026  
**Governing Authority:** Thành Đoàn Đà Nẵng & Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Status:** Approved & Verified (Canonical Implementation Contract)  

---

### 1. Executive Summary & Customer Business Clarification

The customer clarified a fundamental business principle governing School Preliminary Review:

> **The School Reviewer operating the forwarding page is already the authorized person responsible for finalizing the School's proposed Student list.**

Under this authorized role, the School does **not** require a separate per-student "Đánh giá đề xuất" workflow after having already reviewed the 5 criteria:

1. **Preliminary Review Complete:** Applications undergo School preliminary assessment across the 5 canonical criteria (Đạo đức, Học tập, Thể lực, Tình nguyện, Hội nhập).
2. **Unified Outcome Visibility:** The system presents the actual 5-criterion human assessment outcomes.
3. **Authorized Direct Selection:** The authorized School Reviewer selects the Students to include in the official proposed list via checkboxes.
4. **Common Decision Document Attachment:** The reviewer attaches one consolidated official School proposal document (e.g. Quyết định số 182/QĐ-ĐHĐN for Đại học Đà Nẵng).
5. **Single One-Time Forwarding:** The reviewer confirms forwarding the proposed list to Hội Sinh viên Thành phố.

**Selection and official forwarding together constitute the School's authorized recommendation finalization.**

---

### 2. Elimination of Secondary Recommendation Workflow

The prior LEAN-4 interpretation required an artificial second-stage recommendation approval: every student had to be marked "Đề nghị" or "Không đề nghị" individually via a modal before selection was permitted, and unselected students were blocked from forwarding with misleading warnings ("Hồ sơ chưa có kết luận").

**LEAN-4.1 supersedes and completely eliminates:**
- The per-row `"Đánh giá đề xuất"`, `"Đổi kết luận"`, and `"Đánh giá lại"` action buttons.
- The modal `"Đánh giá kết luận đề xuất cấp Trường"`.
- The four recommendation-status tabs (`Hồ sơ đề nghị`, `Chưa có kết luận`, `Không đề nghị`, `Đã gửi lên Thành phố`).
- The false equation of unselected students with "Fail" or "Not Recommended":
  - **Unselected $\neq$ Failed criterion $\neq$ Not recommended $\neq$ Unreviewed.**
  - An unselected student simply remains at the School level; they are **never** given an automatic substantive failure judgment.

---

### 3. Unified Single Table Design

The forwarding page (`/school/forwarding` / route `school_awaiting_forward`) presents a single unified table titled **"Danh sách đề nghị xét chọn cấp Thành phố"**.

| Column | Content | Purpose |
| :--- | :--- | :--- |
| **Checkbox** | Master checkbox in `<th>` + Row checkbox | Authorized selection input for batch recommendation |
| **Sinh viên** | Họ tên, MSSV, Mã hồ sơ (`app.applicationId`) | Clear applicant identification |
| **Trường / Đơn vị** | `app.institution.officialName` | Preserves original institution identity across UDN members |
| **Đạo đức** | Đạt / Chưa đạt / Cần bổ sung / Đang xét | Actual School assessment result for Criterion 1 |
| **Học tập** | Đạt / Chưa đạt / Cần bổ sung / Đang xét | Actual School assessment result for Criterion 2 |
| **Thể lực** | Đạt / Chưa đạt / Cần bổ sung / Đang xét | Actual School assessment result for Criterion 3 |
| **Tình nguyện** | Đạt / Chưa đạt / Cần bổ sung / Đang xét | Actual School assessment result for Criterion 4 |
| **Hội nhập** | Đạt / Chưa đạt / Cần bổ sung / Đang xét | Actual School assessment result for Criterion 5 |
| **Đánh giá sơ tuyển** | `5/5 Đạt` / `X/5 Đạt` / `Đang xét` | Scannable summary of 5 criteria outcomes |
| **Thao tác** | Button "Xem hồ sơ" (and "Lưu vết" if forwarded) | Instant dossier inspection without losing context |

---

### 4. Direct Selection as Authorized Finalization Input

The authorized School Reviewer has full ergonomic control:
- **Individual Selection:** Click row checkbox to select or deselect any eligible student.
- **Bulk Selection:**
  - `"Chọn tất cả đạt 5/5"`: Instantly selects all eligible students meeting all 5 criteria.
  - `"Bỏ chọn tất cả"`: Quickly resets selection.
  - Header master checkbox: Toggles selection for all visible eligible rows.
- **Multi-Member Scope:**
  - Filtering by institution (e.g., Trường ĐH Bách khoa) maintains selected state for other member institutions (e.g., Trường ĐH Kinh tế).
  - Selected count is always visible: `Đã chọn: [N] hồ sơ`.
- **Eligibility Guard:** Applications with active student supplement requests (`waiting_student`) or already forwarded applications cannot be selected, with informative tooltips.

---

### 5. One Consolidated Official Decision Document

Below the unified table, the section **"Văn bản đề nghị xét chọn"** anchors the official proposal:
- **Canonical Document:** Quyết định số 182/QĐ-ĐHĐN (`182_QD_DHDN_DanhSach_DeXuat_SV5T_CapThanhPho.pdf`).
- **One Shared Document:** For Đại học Đà Nẵng, 08 member institutions share Review Unit `unit-udn`, producing **one** consolidated proposal document signed by the UDN Director.
- **Ergonomics:** Supports previewing the simulated Vietnamese official letterhead, uploading/replacing before confirmation, and immutable lock after confirmation.

---

### 6. One Concise Final Confirmation Dialog

Upon clicking the primary CTA **"Gửi danh sách lên Thành phố"**, a single modal confirms:

> **"Xác nhận gửi [N] hồ sơ của [Đơn vị] lên Hội Sinh viên Thành phố?"**

**Modal contents:**
1. **Notice:** Immutable one-time forwarding lock per season.
2. **Metadata:** Đơn vị sơ tuyển, Năm học xét chọn (formatted without string duplication).
3. **Decision Document Reference:** Number and filename.
4. **Accurate Selected Students List:** Full names, student codes (MSSV), and member institutions.
5. **Actions:**
   - `"Quay lại"` (dismiss modal to continue editing selection).
   - `"Xác nhận gửi"` (atomic batch submission).

---

### 7. Removal of Outdated UI Baggage

Per strict customer instructions, the following obsolete elements were permanently removed:
1. **4 KPI Cards:** Removed `SchoolBatchSummaryMetrics` from the page view to restore focused, calm institutional layout.
2. **4 Recommendation Tabs:** Eliminated artificial status segmentation (`recommended`, `pending`, `not_recommended`, `forwarded`).
3. **"Đang chuẩn bị danh sách" Badge:** Removed noisy draft status tag from the page header; only shows clean green `Đã gửi lên Thành phố` badge once confirmed.
4. **Duplicate Season String:** Fixed `Năm học Năm học 2026–2027` string duplication across header, banners, and modals.

---

### 8. Verification Results

All automated test suites pass 100%:
- **New LEAN-4.1 Test Suite:** `src/test/lean41DirectForwardingCorrection.test.ts` (5 tests passing).
- **Consolidated Frontend Suites:** 367 tests passing (100%).
- **Full Backend Integration Suites:** 281 tests passing (100%).
- **TypeScript Compilation & Lint:** Zero errors (`tsc --noEmit`).
- **Production Build:** `compile_applet` succeeding.
