# 5TOT ĐÀ NẴNG — LEAN-4 MANUAL UAT SCRIPT
## User Acceptance Testing Guide for School Preliminary Review & City Forwarding

**Target Role:** School Review Officer (`SCHOOL_OFFICER` — Đại học Đà Nẵng / Trường thành viên)  
**Award Season:** 2026–2027  
**Test Focus:** Verification of the 5-step operational workflow.

---

### Test Setup
1. Open the application and launch the Staff Portal.
2. Select role **Cán bộ xét sơ tuyển cấp Trường** (Đại học Đà Nẵng `unit-udn`).
3. Navigate to **Danh sách hồ sơ sơ tuyển** (`/staff/school_applications`).

---

### Scenario UAT-1: Step 1 — Inspection of 5-Criterion Compact Outcomes
1. **Action:** Observe the "05 Tiêu chí sơ tuyển" column on the applications table.
2. **Expected Result:**
   - Each row displays 5 badges: `ĐĐ`, `HT`, `TL`, `TN`, `HN`.
   - Badges have distinct color codes: Green (Đạt), Red (Không đạt), Amber (Cần bổ sung), Blue (Đang xét), Slate (Chưa xét).
   - Hovering over a badge reveals the criterion title and status label.
   - An overall summary badge is rendered directly below or next to the 5 badges (e.g. "Đạt 5/5 tiêu chí", "Đạt 4/5 (1 Chưa đạt)").

---

### Scenario UAT-2: Step 2 — Recording Authoritative Human Recommendation
1. **Action:** Click "Ghi kết luận" or "Đổi" in the "Kết luận đề xuất" column on any application.
2. **Expected Result:**
   - A modal titled **"Ghi nhận kết luận đề xuất cấp Trường"** opens.
   - The modal shows student metadata (Name, MSSV, Member Institution) and a preview of their 5 criteria outcomes.
   - 3 choices are displayed:
     - *Đề xuất chuyển lên Thành phố* (Green checkmark)
     - *Không đề xuất chuyển lên Thành phố* (Red alert, requires reason)
     - *Chưa có kết luận / Cần xem xét thêm*
3. **Action:** Select "Không đề xuất chuyển lên Thành phố" and leave reason empty. Click "Lưu kết luận".
4. **Expected Result:** Error message displays: "Vui lòng nhập lý do không đề xuất."
5. **Action:** Enter a reason (e.g., "Chưa đạt chuẩn ngoại ngữ B1") and save.
6. **Expected Result:** Modal closes. Table immediately updates the row to show a red badge **"Không đề nghị"**.

---

### Scenario UAT-3: Step 3 — Direct Checkbox Selection & Sticky Bar
1. **Action:** Click checkboxes in the leftmost column to select 2 or more applications.
2. **Expected Result:**
   - Checkboxes turn green with a checkmark.
   - A dark floating sticky bar appears at the bottom center of the screen:
     - "Đã chọn **N** hồ sơ (trong đó M hồ sơ có kết luận Đề nghị)"
     - Action buttons: "Bỏ chọn tất cả" and "Chuẩn bị gửi Thành phố (N)".
3. **Action:** Use the institution dropdown filter to switch to another member institution (e.g. "Trường ĐH Sư phạm").
4. **Expected Result:** The previously selected applications from other institutions remain selected in the sticky bar counter (persistence across member institutions).
5. **Action:** Click "Chọn tất cả hồ sơ Đề nghị".
6. **Expected Result:** All eligible recommended applications in scope are selected simultaneously.

---

### Scenario UAT-4: Step 4 — Decision Document Attachment
1. **Action:** Click "Chuẩn bị gửi Thành phố" or navigate to "Đợt đề xuất Thành phố" (`/staff/school_awaiting_forward`).
2. **Expected Result:**
   - The Forwarding Workspace opens for `unit-udn` (năm học 2026–2027).
   - The Official Decision Document section displays the default decision `182/QĐ-ĐHĐN` ("Quyết định về việc đề xuất danh sách sinh viên đạt danh hiệu SV5T cấp Thành phố năm học 2026–2027").
   - Reviewer can preview the document or edit document metadata (Số hiệu, Ngày ký, Người ký, Tệp đính kèm).

---

### Scenario UAT-5: Step 5 — One-Time Forwarding to City
1. **Action:** Verify pre-validation checks in the top validation banner (Tất cả tiêu chí hợp lệ, Đã đính kèm Quyết định).
2. **Action:** Click **"Gửi danh sách lên Thành phố"**.
3. **Expected Result:**
   - A confirmation dialog appears summarizing the total student count, member institution breakdown (DUT, DUE, etc.), and decision document `182/QĐ-ĐHĐN`.
4. **Action:** Click "Xác nhận gửi chính thức".
5. **Expected Result:**
   - The batch transitions to **FORWARDED** with frozen timestamp and submitter name.
   - All included applications transition to `reviewStage: 'CITY'` and status `'forwarded_to_city'`.
   - The UI displays a success banner and locks subsequent editing to prevent duplicate forwarding (idempotent).
   - In City Council / Manager views, these applications appear immediately in the City Intake queue.
