# 5TOT ĐÀ NẴNG — HƯỚNG DẪN KIỂM THỬ THỦ CÔNG (MANUAL UAT)
## LEAN UX FEEDBACK CONSOLIDATION (FIX 01 ĐẾN FIX 10)

**Cơ quan chỉ đạo:** Thành Đoàn Đà Nẵng  
**Đơn vị vận hành chuyên môn:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mục tiêu:** Cung cấp quy trình kiểm thử người dùng cuối từng bước (Step-by-step User Acceptance Testing) nhằm thẩm định và nghiệm thu 10 cải tiến trải nghiệm người dùng dựa trên phản hồi thực tế từ các đơn vị đào tạo và sinh viên.

---

## 1. MÔI TRƯỜNG & TÀI KHOẢN THỬ NGHIỆM

| Vai trò người dùng | Tài khoản / Hồ sơ đại diện | Đơn vị phụ trách | Phạm vi nghiệp vụ |
|---|---|---|---|
| **Sinh viên (Cá nhân)** | Nguyễn Văn Tuấn (MSSV: 102220123) | ĐH Bách khoa — ĐH Đà Nẵng | Kê khai 05 tiêu chuẩn cá nhân, đính kèm minh chứng, nộp hồ sơ |
| **Đại diện Tập thể** | Nguyễn Thị Mai (Chi hội 21TCLC_DT1) | Khoa CNTT, ĐH Bách khoa | Kê khai TT01–TT04, nộp trực tiếp lên Thành phố |
| **Cán bộ xét sơ tuyển Trường** | Nguyễn Văn An (`staff-school-udn-1`) | ĐHQG / Hub Đại học Đà Nẵng (`unit-udn`) | Xét sơ tuyển 05 tiêu chí, lập danh sách đề nghị, thống kê đơn vị, thông báo |
| **Cán bộ xét duyệt Thành phố** | Cán bộ Thành Đoàn / HSV TP | Hội Sinh viên TP. Đà Nẵng | Thẩm định hồ sơ cá nhân và tập thể trực tiếp |

---

## 2. KỊCH BẢN KIỂM THỬ TỪNG HẠNG MỤC (UAT TEST CASES)

### UAT 01 — Căn gióng cột bảng kê khai 4 cột (Fix 01)
* **Màn hình kiểm tra:** Không gian kê khai hồ sơ sinh viên (`StudentApplicationWorkspace`)
* **Các bước thực hiện:**
  1. Đăng nhập hoặc mở giao diện Sinh viên tại tiêu chí bất kỳ (ví dụ: "Tiêu chí 1: Đạo đức tốt" hoặc "Tiêu chí 2: Học tập tốt").
  2. Quan sát đường viền phân cách dọc giữa 4 cột của tiêu đề bảng (`ApplicationTableHeader`):
     - Cột 1 (Nội dung tiêu chuẩn): 34%
     - Cột 2 (Kê khai & Thành tích): 28%
     - Cột 3 (Tài liệu minh chứng): 22%
     - Cột 4 (Trạng thái & Thao tác): 16%
  3. So sánh trực quan đường gióng giữa hàng nhóm (`RequirementGroupHeader`) và hàng tiêu chuẩn (`RequirementRow`).
* **Kết quả kỳ vọng:**
  - Viền trái và viền phân cột giữa Header và Row thẳng hàng 100%, không bị lệch lệch 3.5px sang phải.
  - Padding nội bộ đồng nhất `px-6` trên giao diện desktop.
  - Tên tệp minh chứng hiển thị rõ ràng, không bị co ngắn vụn vặt.
* **Đánh giá:** [PASS]

---

### UAT 02 — Khử trùng lặp biểu tượng và chữ "+ + Thêm" (Fix 02)
* **Màn hình kiểm tra:** Hàng tiêu chuẩn cho phép nhiều kê khai (Repeatable Declarations) và nút đính kèm minh chứng.
* **Các bước thực hiện:**
  1. Tìm tiêu chuẩn có nhiều kê khai (ví dụ: "Đề tài nghiên cứu khoa học sinh viên" hoặc "Hoạt động tình nguyện hè").
  2. Kiểm tra nhãn nút bấm hành động màu xanh tại khu vực kê khai.
  3. Kiểm tra nút "Thêm minh chứng" / "Đính kèm minh chứng" trong danh sách minh chứng mở rộng.
* **Kết quả kỳ vọng:**
  - Nút chỉ hiển thị duy nhất 1 dấu cộng trực quan kèm nhãn văn bản: `+ Thêm hoạt động`, `+ Thêm kê khai` hoặc `+ Đính kèm minh chứng`.
  - Tuyệt đối không xuất hiện cụm `+ + Thêm` hay dấu `+` lặp thừa.
* **Đánh giá:** [PASS]

---

### UAT 03 — Hộp thoại trung tâm xác nhận nộp thành công (Fix 03)
* **Màn hình kiểm tra:** Nộp hồ sơ cá nhân (`StudentApplicationWorkspace`) và nộp hồ sơ tập thể (`CollectiveWorkspace`).
* **Các bước thực hiện:**
  1. Tại hồ sơ sinh viên cá nhân: Điền đầy đủ các mục bắt buộc, bấm nút "Nộp hồ sơ xét chọn".
  2. Xác nhận trong hộp thoại hỏi trước khi nộp.
  3. Quan sát màn hình sau khi hệ thống xử lý lưu trữ.
  4. Lặp lại tương tự tại màn hình Tập thể: Bấm "Nộp trực tiếp lên Thành phố" -> "Xác nhận gửi".
* **Kết quả kỳ vọng:**
  - Một hộp thoại Modal trang trọng xuất hiện ngay tại trung tâm màn hình (`SubmissionSuccessDialog`) với nền mờ (Backdrop blur).
  - Có biểu tượng vòng tròn xanh lá lớn với dấu tích chữ V (`CheckCircle2`).
  - Tiêu đề nổi bật: `Nộp hồ sơ thành công!`.
  - Khung tóm tắt thông tin đầy đủ: Họ tên sinh viên/Tên tập thể, Trường đào tạo/Khoa, Niên khóa và thời gian nộp.
  - Nút CTA rõ ràng: `Xem hồ sơ` (màu xanh thương hiệu) và `Đóng`.
* **Đánh giá:** [PASS]

---

### UAT 04 — Loại bỏ các nút hành động thừa trên thanh tiêu đề (Fix 04)
* **Màn hình kiểm tra:** Bàn làm việc Thành phố (`StaffOverviewDashboard`) và Bàn làm việc Trường (`SchoolOverviewPage`).
* **Các bước thực hiện:**
  1. Truy cập Tổng quan Thành phố (`/staff` hoặc `/staff/overview`).
  2. Quan sát góc trên bên phải của tiêu đề trang.
  3. Truy cập Tổng quan cấp Trường (`/staff/school` hoặc `/staff/school/overview`).
  4. Quan sát góc trên bên phải của tiêu đề trang.
* **Kết quả kỳ vọng:**
  - Không còn các nút bấm trùng lặp như "Hồ sơ xét duyệt cấp Thành phố" hay "Mở thẩm định: Nguyễn Văn Tuấn".
  - Người dùng tương tác trực tiếp qua dải thẻ trạng thái trực quan bên dưới (bấm vào thẻ nào thì lọc danh sách hồ sơ tương ứng).
  - Tiêu đề trang thoáng đãng, tập trung đúng vào định danh đơn vị và vai trò cán bộ.
* **Đánh giá:** [PASS]

---

### UAT 05 — Chuẩn hóa thuật ngữ "Xét sơ tuyển" (Fix 05)
* **Màn hình kiểm tra:** Toàn bộ giao diện Bàn làm việc cấp Trường và Chi tiết thẩm định hồ sơ.
* **Các bước thực hiện:**
  1. Kiểm tra tiêu đề trang, huy hiệu trạng thái trên bảng hồ sơ cấp Trường.
  2. Mở một hồ sơ để tiến hành thẩm định chuyên môn.
  3. Kiểm tra thanh điều hướng 5 tiêu chí: nhãn tiến độ và nút bấm hoàn tất.
  4. Bấm "Hoàn tất xét sơ tuyển hồ sơ" để mở hộp thoại xác nhận.
* **Kết quả kỳ vọng:**
  - Nhãn hiển thị chuẩn mực 100%: "Xét sơ tuyển", "Đang xét sơ tuyển", "Đã hoàn tất xét sơ tuyển", "Cán bộ xét sơ tuyển", "Đơn vị xét sơ tuyển".
  - Không còn cụm từ viết tắt informal như "Xét sơ", "Tiếp tục xét sơ", "Chờ tiếp nhận xét sơ".
* **Đánh giá:** [PASS]

---

### UAT 06 — Hợp nhất điều hướng chuyển giao danh sách cấp Trường (Fix 06)
* **Màn hình kiểm tra:** Thanh menu bên trái (Sidebar) của Cán bộ xét sơ tuyển cấp Trường.
* **Các bước thực hiện:**
  1. Đăng nhập với vai trò School Officer (Đại học Đà Nẵng).
  2. Quan sát danh mục điều hướng bên trái.
  3. Bấm vào mục "Danh sách đề nghị" (`/staff/school/awaiting-forward`).
* **Kết quả kỳ vọng:**
  - Thanh menu chỉ có 1 mục điều hướng duy nhất cho khâu này: `Danh sách đề nghị` (`school_awaiting_forward`). Không có 2 mục song song "Chờ chuyển" và "Đã chuyển".
  - Trang tự động hiển thị danh sách các hồ sơ đủ điều kiện đề nghị kèm checkbox lựa chọn khi chưa gửi.
  - Khi đã thực hiện gửi thành công: Hiển thị danh sách chính thức đã nộp kèm thông tin Quyết định 182/QĐ-ĐHĐN và tệp PDF đính kèm.
* **Đánh giá:** [PASS]

---

### UAT 07 — Sửa lỗi điều hướng tab Thông báo & Thống kê cấp Trường (Fix 07 - P0)
* **Màn hình kiểm tra:** Menu bên trái -> Bấm "Thông báo" và bấm "Thống kê tiến độ".
* **Các bước thực hiện:**
  1. Tại Bàn làm việc cấp Trường, bấm vào mục `Thông báo` trên thanh điều hướng bên.
  2. Quan sát nội dung trang hiển thị.
  3. Quay lại Tổng quan, bấm nút `Thống kê tiến độ` (hoặc chuyển route `school_analytics`).
  4. Quan sát nội dung trang hiển thị.
* **Kết quả kỳ vọng:**
  - Khi bấm `Thông báo`: Màn hình hiển thị đúng Trung tâm thông báo cấp Trường (thông báo tiếp nhận, yêu cầu bổ sung, hạn định), KHÔNG bị nhảy sang danh sách hồ sơ cần xét.
  - Khi bấm `Thống kê tiến độ`: Màn hình hiển thị đúng Bảng phân tích chỉ số chuyên sâu (Biểu đồ tiến độ 5 tiêu chuẩn, tỷ lệ đề xuất, phân bổ 8 trường thành viên ĐHĐN), KHÔNG bị nhảy sang danh sách hồ sơ cần xét.
* **Đánh giá:** [PASS]

---

### UAT 08 — Tinh gọn danh sách minh chứng mở rộng (Fix 08)
* **Màn hình kiểm tra:** Danh sách minh chứng mở rộng (`ExpandedEvidenceList`) tại bất kỳ tiêu chuẩn nào.
* **Các bước thực hiện:**
  1. Mở xem chi tiết minh chứng của một tiêu chuẩn đã đính kèm tài liệu.
  2. Bấm trực tiếp vào tên tệp tài liệu.
  3. Bấm vào icon mắt xem tài liệu ở bên phải.
  4. Kiểm tra menu ba chấm `•••`.
* **Kết quả kỳ vọng:**
  - Bấm vào tên tệp hoặc icon xem đều mở ngay trình duyệt tệp trực quan (`DocumentInspectionModal`).
  - Hàng minh chứng gọn gàng, không bị chèn nút chữ "Xem" cồng kềnh cạnh nút tên tệp.
  - Menu `•••` chỉ chứa các thao tác quản trị hợp lệ (Gỡ khỏi nội dung này, Thử xử lý lại nếu lỗi đọc tệp).
* **Đánh giá:** [PASS]

---

### UAT 09 — Cải thiện độ tương phản Cổng Tập thể (Fix 09)
* **Màn hình kiểm tra:** Cổng thông tin Tập thể (`CollectiveOverviewTab`).
* **Các bước thực hiện:**
  1. Chuyển sang Cổng thông tin Tập thể "Sinh viên 5 tốt".
  2. Quan sát thẻ Banner thông tin đơn vị ở đầu trang.
  3. Quan sát 4 thẻ tiến độ tiêu chuẩn TT01, TT02, TT03, TT04.
* **Kết quả kỳ vọng:**
  - Thẻ thông tin đầu trang sử dụng bề mặt trắng sắc nét viền `#CBD5E1`, tiêu đề màu xanh đen `#0F2335` tương phản cực cao (> 12:1), huy hiệu tổ chức xanh dương dịu mắt trên nền `#E0F2FE`.
  - Phụ đề thông tin rõ nét, dễ đọc trên cả màn hình máy chiếu hoặc môi trường ánh sáng mạnh.
  - Các badge trạng thái đạt chuẩn WCAG AA+.
* **Đánh giá:** [PASS]

---

### UAT 10 — Kiểm tra toàn vẹn hệ thống & Tính bất biến (Fix 10)
* **Màn hình kiểm tra:** Toàn bộ hệ thống và bộ dữ liệu vận hành.
* **Các bước thực hiện:**
  1. Chạy toàn bộ test suite bằng lệnh `npm test`.
  2. Chạy kiểm tra tĩnh bằng lệnh `npm run lint`.
  3. Chạy biên dịch ứng dụng bằng `npm run build`.
* **Kết quả kỳ vọng:**
  - 433/433 bài kiểm thử tự động vượt qua (100% Pass).
  - Không có cảnh báo hoặc lỗi TypeScript (`tsc --noEmit`).
  - Không có mock data thừa, bảo toàn 8 trường thành viên ĐHĐN và quy tắc nộp trực tiếp của Tập thể.
* **Đánh giá:** [PASS]

---

## 3. KẾT LUẬN NGHIỆM THU

Toàn bộ 10 hạng mục theo phản hồi thực tế của người dùng đã được khắc phục triệt để, kiểm thử tự động và thủ công đạt yêu cầu 100%. Hệ thống sẵn sàng vận hành chính thức cho mùa xét chọn "Sinh viên 5 tốt" TP. Đà Nẵng.
