# 5TOT Đà Nẵng — Kịch bản Kiểm thử Chấp nhận Người dùng (Manual UAT)
**Kỳ xét chọn:** Năm học 2026–2027  
**Tài liệu:** Hướng dẫn UAT thực địa phiên bản LEAN-UX.2  
**Ngôn ngữ:** Tiếng Việt (100% chuẩn quy chế Hội Sinh viên Việt Nam TP. Đà Nẵng)

---

## MỤC TIÊU KIỂM THỬ
Xác nhận tính chính xác, nhất quán của giao diện và luồng nghiệp vụ sau đợt hiệu chỉnh LEAN-UX.2, bao gồm:
1. Không còn nút bấm trùng lặp trên cùng một vùng nhìn (Zero Action Duplication).
2. Trạng thái hồ sơ thống nhất tuyệt đối giữa Bảng điều khiển và Chi tiết hồ sơ.
3. Huy hiệu minh chứng không bao giờ đè lên tên tệp tin; không xuất hiện lỗi dấu cộng đôi `+ +`.
4. Cán bộ thẩm định bắt buộc phải đối soát minh chứng trước khi chốt kết luận đạt điều kiện.
5. Hàng đợi Hội đồng hiển thị thanh thoát, không bị co ép bởi panel bên phải.

---

## KỊCH BẢN 1: DÀNH CHO SINH VIÊN (STUDENT EXPERIENCE)

### Bước 1.1: Kiểm tra Bảng điều khiển hồ sơ bản nháp (Draft State)
- **Truy cập:** Đăng nhập với tài khoản Sinh viên (hoặc chọn scenario "Hồ sơ bản nháp").
- **Thao tác:** Quan sát Thẻ tiến độ chính (Tracking Summary) tại đầu trang chủ.
- **Kết quả mong đợi:**
  - Tiêu đề hiển thị: **"Đang hoàn thiện hồ sơ"** (Không được hiển thị "Đang xét sơ tuyển cấp Trường").
  - Huy hiệu góc phải: **"Chưa nộp hồ sơ"** màu xám/xanh nhạt.
  - Nội dung mô tả: *"Hồ sơ đang trong thời gian chuẩn bị và hoàn thiện kê khai 05 tiêu chí theo hướng dẫn của Hội Sinh viên."*
  - **Không** xuất hiện dòng chữ "Gửi lần đầu [thời gian]" khi hồ sơ chưa nộp.

### Bước 1.2: Kiểm tra Kê khai Tiêu chuẩn nhiều nội dung (NCKH / Hoạt động)
- **Truy cập:** Nhấn "Tiếp tục hoàn thiện hồ sơ" hoặc chọn Tiêu chuẩn Đạo đức tốt / Học tập tốt.
- **Thao tác:** Mở mục tiêu chuẩn có nhiều kê khai (ví dụ: *Đề tài nghiên cứu khoa học*).
- **Kết quả mong đợi:**
  - Khi chưa có đề tài nào: Nút bấm hiển thị chính giữa khung rỗng với nhãn chuẩn: **"+ Thêm đề tài nghiên cứu"** (hoàn toàn không có dấu cộng đôi `+ +`).
  - Thanh tiêu đề trên cùng không hiển thị nút thêm thứ hai khi danh sách đang trống.
  - Khi đã có ít nhất 01 đề tài: Nút thêm xuất hiện duy nhất 01 vị trí trên thanh công cụ góc phải.

### Bước 1.3: Kiểm tra Hiển thị Tên tệp Minh chứng & Huy hiệu Cảnh báo
- **Truy cập:** Kê khai có tệp minh chứng cần rà soát (ví dụ: tệp PDF tên dài).
- **Thao tác:** Co giãn trình duyệt hoặc xem ở chế độ màn hình điện thoại / máy tính bảng.
- **Kết quả mong đợi:**
  - Tên tệp tin hiển thị rõ ràng, tự động rút gọn dấu ba chấm (`...`) nếu quá dài.
  - Huy hiệu cảnh báo **"Cần kiểm tra"** hoặc **"Mới bổ sung"** nằm tách bạch, tự động xuống dòng linh hoạt, tuyệt đối không đè lên chữ của tên file.

---

## KỊCH BẢN 2: DÀNH CHO CÁN BỘ XÉT SƠ TUYỂN CẤP TRƯỜNG (SCHOOL OFFICER)

### Bước 2.1: Mở Workspace Xét sơ tuyển 05 Tiêu chí
- **Truy cập:** Chọn vai trò `SCHOOL_OFFICER` -> vào danh sách hồ sơ cơ sở -> bấm "Xét sơ tuyển" một hồ sơ.
- **Thao tác:** Quan sát thanh tiêu đề và thanh tiến độ tổng hợp trên cùng.
- **Kết quả mong đợi:**
  - Nhãn tiến độ hiển thị đúng ngữ cảnh: **"Tiến độ xét sơ tuyển: X/5 tiêu chí đã kết luận"**.
  - Khi chưa có tiêu chí nào được kết luận (`concludedCriteriaCount === 0`): Dải tóm tắt hiển thị: **"Đang xét sơ tuyển (chưa có tiêu chí kết luận)"** (Tuyệt đối không hiển thị "Chưa đủ điều kiện (0 tiêu chí Không đạt)").

### Bước 2.2: Kiểm tra Nút Hoàn tất Xét sơ tuyển
- **Thao tác:** Lần lượt đánh giá đạt/không đạt cho các tiêu chí đến khi đủ điều kiện hoàn tất.
- **Kết quả mong đợi:**
  - Nút **"Hoàn tất xét sơ tuyển"** xuất hiện duy nhất 01 vị trí trên thanh công cụ chính (không bị nhân đôi trên thanh điều hướng bên cạnh).
  - Khi bấm hoàn tất: Hiển thị hộp thoại xác nhận và chuyển trạng thái sang "Đã hoàn tất xét sơ tuyển".

---

## KỊCH BẢN 3: DÀNH CHO CÁN BỘ THẨM ĐỊNH THÀNH PHỐ — TẬP THỂ TT01–TT04 (CITY OFFICER)

### Bước 3.1: Kiểm tra Khung Thẩm định Điều kiện Tập thể
- **Truy cập:** Chọn vai trò `CITY_OFFICER` -> vào mục Tập thể SV5T -> mở thẩm định một tập thể.
- **Thao tác:** Quan sát khung thẩm định bên phải (Inspector).
- **Kết quả mong đợi:**
  - Chiều rộng khung vừa vặn, không che khuất bảng kê khai trung tâm.
  - Khung **Gợi ý AI** mặc định ở trạng thái thu gọn. Khi bấm "Xem gợi ý", gợi ý mở ra kèm nút chủ động *"Sao chép gợi ý vào nhận xét"* (AI không tự động điền vào nhận xét khi chưa được bấm).
  - Mục **Lịch sử đánh giá (N)** mặc định thu gọn, chỉ mở ra khi cán bộ nhấn vào tiêu đề.

### Bước 3.2: Kiểm tra Khóa bảo vệ Minh chứng (Evidence Integrity Guard)
- **Thao tác:**
  - Tại điều kiện TT01 (hoặc TT02/TT03), khi các tệp minh chứng đính kèm đang ở trạng thái "Chưa thẩm định".
  - Cán bộ thử bấm nút **"Phù hợp"** và nhấn **"Lưu kết quả xét"**.
- **Kết quả mong đợi:**
  - Hệ thống lập tức hiển thị thông báo chặn màu đỏ/cam: *"Vui lòng thẩm định N tệp minh chứng trước khi xác nhận Phù hợp cho điều kiện TT01."*
  - Hệ thống không cho phép lưu kết luận Phù hợp cho đến khi tất cả các tệp minh chứng đã được đánh giá đạt.

---

## KỊCH BẢN 4: DÀNH CHO HỘI ĐỒNG XÉT CHỌN THÀNH PHỐ (CITY COMMITTEE)

### Bước 4.1: Kiểm tra Hàng đợi Hồ sơ & Xem nhanh (Queue & Quick Preview)
- **Truy cập:** Chọn vai trò `COMMITTEE` -> vào Hàng đợi xét chọn (Tất cả / Cá nhân / Tập thể).
- **Thao tác:** Click chọn một hàng trong bảng để mở xem nhanh bên phải.
- **Kết quả mong đợi:**
  - Bảng danh sách giữ độ rộng thoáng đãng, dễ theo dõi thông tin cơ sở và tiến độ 05 tiêu chí.
  - Trên mỗi hàng của bảng: Có nút bấm chính **"Xem hồ sơ"**.
  - Trên thẻ Xem nhanh (Quick Preview):
    - Nếu hồ sơ chưa có quyết định: Hiển thị nút **"Ghi nhận kết luận xét chọn"**.
    - Nếu hồ sơ đã có quyết định: Hiển thị thẻ thông báo *"Hồ sơ đã ghi nhận kết luận Hội đồng"*, không hiển thị nút "Xem hồ sơ chi tiết" trùng lặp.

### Bước 4.2: Mở Hồ sơ Tập thể từ Hàng đợi Hội đồng
- **Thao tác:** Chuyển sang tab "Tập thể Sinh viên 5 tốt" -> bấm "Xem hồ sơ" một tập thể.
- **Kết quả mong đợi:**
  - Mở trực tiếp không gian làm việc chuyên sâu `CollectiveCommitteeWorkspace` đầy đủ nội dung minh chứng và biểu quyết.
  - Không mở modal pop-up thu nhỏ trùng lặp.

---

## KẾT LUẬN ĐÁNH GIÁ CHẤP NHẬN
Khi toàn bộ các bước trên hoàn thành với kết quả đúng như kỳ vọng, hệ thống đạt chuẩn nghiệm thu **LEAN-UX.2 Production Readiness**.
