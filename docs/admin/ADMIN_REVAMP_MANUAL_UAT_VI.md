# HƯỚNG DẪN KIỂM THỬ NGHIỆM THU NGƯỜI DÙNG (MANUAL UAT) — PHÂN HỆ QUẢN TRỊ HỆ THỐNG (ADMIN-REVAMP)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng

---

## Kịch bản 1: Khởi tạo Quản trị viên đầu tiên (Zero-Manual-Seed Bootstrap)
1. Khi hệ thống mới triển khai chưa có tài khoản `ADMIN`, mở màn hình **Tài khoản & phân quyền** (`/staff/admin/staff`).
2. Quan sát thanh thông báo **Khởi tạo Quản trị viên hệ thống đầu tiên (Zero-Manual-Seed)**.
3. Nhấn nút **Khởi tạo Admin đầu tiên**, nhập Mã thiết lập (`ADMIN_BOOTSTRAP_TOKEN`), Họ và tên, Email công vụ và Mật khẩu.
4. **Kết quả kỳ vọng:** Tài khoản Quản trị viên đầu tiên được tạo thành công, cổng Bootstrap chuyển sang trạng thái **Đã khóa vĩnh viễn** (`Bootstrap Locked`), không thể dùng lại mã thiết lập để tạo thêm tài khoản trái phép.

---

## Kịch bản 2: Tạo mùa xét mới bằng cách Sao chép cấu hình từ mùa trước
1. Đăng nhập bằng tài khoản **Quản trị viên hệ thống (`ADMIN`)**, truy cập **Mùa xét & thời hạn** (`/staff/admin/seasons`).
2. Nhấn nút **Tạo mùa xét mới**.
3. Chọn niên khóa mới (ví dụ: `2026–2027`), chọn mục **Sao chép cấu hình từ mùa trước** (`Năm học 2025–2026`), nhập các mốc thời gian `T01`–`T07` và nhấn **Tạo mùa xét**.
4. **Kết quả kỳ vọng:** Mùa xét `Năm học 2026–2027` được tạo ở trạng thái **Bản nháp (`DRAFT`)**, kế thừa bộ 05 tiêu chí Cá nhân và 04 tiêu chuẩn Tập thể (`TT01`–`TT04`), đồng thời số lượng hồ sơ/minh chứng/quyết định của mùa mới bằng `0`.

---

## Kịch bản 3: Cấu hình Tiêu chuẩn Cá nhân, Tập thể (`TT01`–`TT04`) & Kiểm thử Quy tắc (Dry-Run)
1. Truy cập **Tiêu chuẩn xét chọn** (`/staff/admin/criteria`).
2. Kiểm tra cấu hình 05 tiêu chí Cá nhân và khu vực **Cấu hình Ngưỡng Tiêu chuẩn Tập thể (`TT01`–`TT04`)** (`100%` thành viên tham gia ở `TT02` và `>= 20%` thành viên đạt SV5T cấp Trường ở `TT03` trên cùng mẫu số `totalMembers`).
3. Tại khung **Kiểm thử Quy tắc Xét chọn (Dry-Run Evaluator)**, nhập thử Điểm rèn luyện, GPA và Sĩ số Chi hội để xem kết quả gợi ý.
4. **Kết quả kỳ vọng:** Hệ thống hiển thị kết quả đánh giá thử tức thì kèm nhãn **Chỉ mang tính chất tham khảo (Advisory Only)**. Khi chọn phiên bản tiêu chuẩn đã khóa của mùa trước, hệ thống không cho phép ghi đè.

---

## Kịch bản 4: Quản lý Đơn vị Đào tạo & Phân tuyến Cụm Đại học Đà Nẵng (`unit-udn`)
1. Truy cập **Đơn vị & phân tuyến** (`/staff/admin/institutions`).
2. Quan sát bảng **Phân tuyến Đơn vị Xét sơ tuyển (`SchoolReviewUnit`)**: xác nhận 8 trường thành viên Đại học Đà Nẵng (`DUT`, `DUE`, `UED`, `UFL`, `UTE`, `VKU`, `VNUK`, `SMP`) được gộp chung vào đơn vị `unit-udn` với giới hạn `01 đợt gửi danh sách / mùa xét`.
3. Thêm mới hoặc tạm ngưng một đơn vị đào tạo độc lập.
4. **Kết quả kỳ vọng:** Trạng thái phân tuyến hiển thị hợp lệ; đơn vị bị tạm ngưng vẫn giữ nguyên dữ liệu hồ sơ lịch sử.

---

## Kịch bản 5: Cấp tài khoản Cán bộ, Gửi lại Lời mời & Đặt lại Mật khẩu
1. Truy cập **Tài khoản & phân quyền** (`/staff/admin/staff`), nhấn **Thêm tài khoản cán bộ**.
2. Chọn vai trò **Cán bộ Hội Sinh viên Cấp Trường (`SCHOOL_OFFICER`)**: xác nhận hệ thống bắt buộc chọn **Đơn vị xét sơ tuyển**.
3. Sau khi tạo tài khoản, thử nhấn biểu tượng **Gửi lại lời mời** và **Đặt lại mật khẩu tạm**.
4. Thử khóa hoặc đổi vai trò của tài khoản `ADMIN` duy nhất đang hoạt động.
5. **Kết quả kỳ vọng:** Hệ thống cấp mã lời mời/mật khẩu tạm mới và ghi nhận Nhật ký hệ thống; thao tác tự khóa tài khoản `ADMIN` cuối cùng bị chặn để bảo vệ an toàn vận hành.

---

## Kịch bản 6: Kiểm tra 8 điều kiện sẵn sàng & Kích hoạt Mùa xét chọn
1. Quay lại **Mùa xét & thời hạn** (`/staff/admin/seasons`), chọn mùa nháp `Năm học 2026–2027`.
2. Kiểm tra khung **Danh sách 8 điều kiện sẵn sàng trước khi kích hoạt mùa xét** (`data-testid="season-readiness-checklist"`).
3. Khi cả 8 điều kiện đều đạt, nhấn **Kích hoạt mùa xét** và xác nhận.
4. **Kết quả kỳ vọng:** Mùa `Năm học 2026–2027` chuyển sang trạng thái **Đang mở nhận hồ sơ (`ACTIVE`)**, mùa `Năm học 2025–2026` tự động chuyển sang **Đã kết thúc (`CLOSED`)**, và nhãn năm học trên toàn bộ thanh ngữ cảnh cập nhật tức thì.
