# LEAN-4.2 Manual UAT Verification Guide

## Test Persona & Context
- **Persona 1:** Cán bộ Ban Thư ký Hội Sinh viên Đại học Đà Nẵng (`unit-udn`, 8 member institutions).
- **Persona 2:** Cán bộ Đoàn Trường Đại học Duy Tân (`unit-dtu`, independent school).

---

## Scenario A: PDF-Only Document Upload & Forwarding (Problem A Verification)

### Step A.1: Navigate to "Danh sách đề nghị"
1. Sign in as School Officer (`staff-udn-01` or switch role to School Officer).
2. Look at the left sidebar: observe exactly **4 items**:
   - `Tổng quan`
   - `Hồ sơ sơ tuyển`
   - `Danh sách đề nghị`
   - `Thông báo`
3. Click **"Danh sách đề nghị"** (`/staff/school/awaiting-forward`).

### Step A.2: Verify Elimination of Text Input Fields
1. Scroll down to the **"Văn bản đề nghị xét chọn (.PDF)"** section.
2. Confirm there are **no text inputs** for:
   - *Số hiệu văn bản*
   - *Ngày ban hành*
   - *Người ký*
   - *Chức vụ người ký*
   - *Trích yếu*
3. If pre-existing metadata exists (e.g. from an existing draft or test), confirm it is displayed in an informational read-only bar, without edit buttons or mandatory prompt fields.
4. If no metadata exists, confirm that no dummy placeholders (such as "Không rõ", "N/A", or fake numbers) are displayed.

### Step A.3: PDF File Upload & Validation
1. Attempt to upload a non-PDF file (e.g. `.docx`, `.png`):
   - **Expected Result:** Immediate validation rejection stating that only `.PDF` files are accepted.
2. Upload a valid signed `.PDF` file (e.g. `to_trinh_ky_so.pdf`):
   - **Expected Result:**
     - File is accepted immediately without asking for any manual text inputs.
     - Document card displays file name, file size in MB, and a green badge: `Tệp PDF đã đính kèm hợp lệ`.
     - "Xem văn bản" button opens preview modal.
     - "Thay đổi tệp PDF" and "Gỡ bỏ tệp" buttons are accessible.

### Step A.4: Pre-Validation Bar Simplification
1. With 0 applications selected:
   - **Expected Result:** Single concise error message: *"Chưa có hồ sơ nào được chọn để gửi lên Thành phố."* Button is disabled.
2. With applications selected, but no PDF attached:
   - **Expected Result:** Single concise error message: *"Vui lòng đính kèm tệp văn bản PDF đề nghị của đơn vị để tiếp tục."* Button is disabled.
3. With at least 1 application selected AND valid PDF attached:
   - **Expected Result:**
     - Concise success message: *"Sẵn sàng gửi danh sách lên Hội Sinh viên Thành phố (X hồ sơ đã chọn, tệp PDF hợp lệ)."*
     - Button **"Gửi danh sách lên Thành phố"** is directly enabled.
     - **No 4 large green checklist cards** cluttering the screen.

### Step A.5: Final Confirmation & Lock
1. Click **"Gửi danh sách lên Thành phố"**.
2. Review confirmation dialog summary: confirms unit scope, season, selected student count, and attached PDF reference.
3. Click **"Xác nhận gửi"**:
   - Batch is successfully forwarded.
   - Status switches to `FORWARDED`.
   - Batch becomes strictly immutable (cannot change selection, cannot replace or remove PDF).
   - Pre-validation bar changes to locked summary notice.

---

## Scenario B: Navigation Deduplication & 5 Canonical Filters (Problem B Verification)

### Step B.1: Check "Hồ sơ sơ tuyển" View
1. Click **"Hồ sơ sơ tuyển"** in the sidebar.
2. Observe page title: **"Hồ sơ sơ tuyển"**.
3. Verify the **5 canonical filter buttons**:
   - `Tất cả` (displays total count)
   - `Chờ xét` (displays count of applications in `pending_intake`)
   - `Đang xét` (displays count of applications in `under_review`)
   - `Cần bổ sung` (displays count of applications with active/returned supplements)
   - `Đã xét` (displays count of completed, recommended, or forwarded applications)
4. Click each tab and verify the table rows update accurately to match the filter.

### Step B.2: Deep-Link & Bookmark Routing Verification
1. Manually navigate or click legacy URL `/staff/school/pending`:
   - **Expected Result:** Page renders with active filter set to `Chờ xét`, and sidebar cleanly highlights **"Hồ sơ sơ tuyển"**.
2. Manually navigate to `/staff/school/supplements`:
   - **Expected Result:** Page renders and sidebar highlights **"Hồ sơ sơ tuyển"**.
3. Manually navigate to `/staff/school/forwarded`:
   - **Expected Result:** Page renders and sidebar highlights **"Danh sách đề nghị"**.
4. Click "Thống kê tiến độ" on the Overview dashboard:
   - **Expected Result:** Analytics page opens, and sidebar highlights **"Tổng quan"**.

---

## Scenario C: Invariant & Scope Isolation Checks

1. **UDN Consolidated Forwarding:**
   - 8 member institutions of Đại học Đà Nẵng route to `unit-udn`.
   - Confirm all 8 institutions share **1 single consolidated batch** and **1 PDF document**.
2. **Independent Schools Isolation:**
   - Sign in as Duy Tân (`unit-dtu`): confirm Duy Tân only sees Duy Tân applications and cannot see or modify UDN batches.
3. **No Unintended Failures:**
   - Applications not selected for the city list remain in their completed preliminary state; they are **never** marked as failed or rejected.
