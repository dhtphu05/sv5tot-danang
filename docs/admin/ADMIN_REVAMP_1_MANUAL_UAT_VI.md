# HƯỚNG DẪN KIỂM THỬ NGHIỆM THU NGƯỜNG DÙNG (MANUAL UAT) — TIẾN ĐỘ TRUNG ƯƠNG & ĐỒNG BỘ MÙA XÉT (ADMIN-REVAMP.1)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng

---

## Kịch bản 1: Kiểm tra Tiến độ 7 Giai đoạn Kiểu Trung ương (`T01`–`T07`) & Làn Tập thể Song song (`T04`)
1. Đăng nhập tài khoản **Quản trị viên (`ADMIN`)**, mở **Mùa xét & thời hạn** (`/staff/admin/seasons`) hoặc **Quản lý thời hạn** (`/staff/admin/deadlines`).
2. Quan sát sơ đồ tiến độ 7 giai đoạn:
   - `T01`: Mở cổng & Hạn nộp hồ sơ Cá nhân
   - `T02`: Thẩm định sơ khảo cấp Trường / ĐHĐN
   - `T03`: Hạn chót cấp Trường gửi Công văn & Danh sách đề xuất
   - `T04`: Mở cổng & Hạn nộp hồ sơ Tập thể SV5T (`TT01`–`TT04`) — hiển thị nhãn **Làn song song (Nộp thẳng Thành phố)**
   - `T05`: Thẩm định độc lập cấp Thành phố
   - `T06`: Họp Hội đồng xét chọn cấp Thành phố
   - `T07`: Công bố Quyết định công nhận chính thức
3. **Kết quả kỳ vọng:** Các mốc thời gian hiển thị đúng múi giờ Việt Nam (`GMT+7`); làn Tập thể `T04` không bị khóa bởi trạng thái chuyển danh sách cấp Trường `T03`.

---

## Kịch bản 2: Kiểm tra Chặn Trình tự Thời gian Không Hợp lệ (Chronology Validation)
1. Trong biểu mẫu chỉnh sửa thời hạn mùa xét, thử đặt **Hạn cấp Trường gửi danh sách đề xuất (`T03`)** sớm hơn **Hạn sinh viên nộp hồ sơ cá nhân (`T01`)**.
2. **Kết quả kỳ vọng:** Hệ thống cảnh báo lỗi trình tự thời gian tiếng Việt rõ ràng và không cho phép lưu cấu hình sai thứ tự.

---

## Kịch bản 3: Chuyển đổi Mùa xét từ `2025–2026` sang `2026–2027` (Kiểm chứng Không còn Hardcode)
1. Tại màn hình **Tổng quan hệ thống** (`/staff/admin/overview`) và thanh ngữ cảnh phía trên, xác nhận mùa đang mở mặc định hiển thị `Năm học 2025–2026` (không bao giờ lặp thành `"Năm học Năm học ..."`).
2. Vào **Mùa xét & thời hạn** (`/staff/admin/seasons`), chọn mùa `Năm học 2026–2027 (Bản nháp)`, kiểm tra 8 điều kiện sẵn sàng và nhấn **Kích hoạt mùa xét**.
3. Quay lại **Tổng quan hệ thống** và mở **Thống kê mùa xét / Danh sách & xuất dữ liệu** (`/staff/reports`).
4. Chọn niên khóa trên bộ lọc và thực hiện xuất thử tệp Excel (`.xlsx`).
5. **Kết quả kỳ vọng:** Thanh ngữ cảnh, tiêu đề trang, URL query param `?season=`, tên tệp Excel tải về và thông tin trong Sheet `"Thông tin xuất"` đều cập nhật động theo đúng niên khóa đang chọn.
