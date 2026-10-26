# 5TOT ĐÀ NẴNG — LEAN-6: BÁO CÁO KIỂM THỬ ĐÁP ỨNG THIẾT BỊ (RESPONSIVE QA REPORT)
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mã tài liệu:** LEAN-6-RESPONSIVE-QA  
**Phiên bản:** 2.0.0

---

## 1. MỤC TIÊU VÀ PHƯƠNG PHÁP KIỂM THỬ GIAO DIỆN
Đảm bảo sinh viên và cán bộ có thể thực hiện mọi thao tác cốt lõi trên mọi kích thước màn hình từ điện thoại thông minh màn hình nhỏ (320px) đến màn hình làm việc độ phân giải cao của văn phòng (1920px), loại bỏ hoàn toàn các lỗi vỡ khung, tràn ngang, đè nút hoặc che khuất thanh công cụ.

---

## 2. MA TRẬN ĐÁNH GIÁ 10 KÍCH THƯỚC MÀN HÌNH CHUẨN

| Điểm ngắt (Breakpoint) | Thiết bị tiêu biểu | Khu vực kiểm tra trọng tâm | Hiện tượng tràn ngang | Thao tác cảm ứng (Touch) | Kết quả |
|---|---|---|:---:|:---:|:---:|
| **320px** | Màn hình nhỏ cổ điển | Đăng nhập, Profile, Kê khai rút gọn | **KHÔNG** | Tốt (Nút >= 44px) | **PASS** |
| **360px** | Android phổ thông | Biểu mẫu kê khai, Tải tệp, Nộp hồ sơ | **KHÔNG** | Tốt | **PASS** |
| **390px** | iPhone 13/14/15/16 | Bảng tóm tắt, Xem trước PDF, Giải trình bổ sung | **KHÔNG** | Rất tốt | **PASS** |
| **430px** | iPhone Pro Max / Plus | Toàn bộ quy trình sinh viên | **KHÔNG** | Rất tốt | **PASS** |
| **768px** | iPad Mini / Máy tính bảng | Danh sách hồ sơ trường, Thẩm định Đạt/Không đạt | **KHÔNG** | Tốt, bảng cuộn mượt | **PASS** |
| **1024px** | iPad Pro / Laptop nhỏ | Bảng điều khiển cán bộ, Thẩm định 2 cột | **KHÔNG** | Tốt | **PASS** |
| **1280px** | Màn hình văn phòng tiêu chuẩn | Không gian làm việc đầy đủ, Ngăn chi tiết bên phải | **KHÔNG** | Tối ưu bàn phím/chuột | **PASS** |
| **1440px** | MacBook / Màn hình 2K | Toàn bộ chức năng quản trị, Thống kê biểu đồ | **KHÔNG** | Rất tốt | **PASS** |
| **1660px** | Màn hình rộng | Bảng danh sách nhiều cột, Xem hồ sơ liên tục | **KHÔNG** | Rất tốt | **PASS** |
| **1920px** | Full HD Desktop | Chế độ làm việc tập trung cao độ của Hội đồng | **KHÔNG** | Tối ưu | **PASS** |

---

## 3. ĐÁNH GIÁ CHI TIẾT CÁC THÀNH PHẦN GIAO DIỆN CHÍNH

### 3.1. Hệ thống lưới bảng hồ sơ (4-Column Grid System)
- **Tỷ lệ chuẩn:** `32fr / 30fr / 20fr / 18fr` (Tên tiêu chuẩn · Kê khai sinh viên · Minh chứng tệp · Đánh giá & Hành động).
- **Ràng buộc an toàn:** Tất cả các cột đều được thiết lập `min-width: 0` kết hợp `break-words`, ngăn chặn hiện tượng tràn ngang (Blowout) khi tên tệp hoặc trích yếu văn bản dài.
- **Trải nghiệm di động (< 768px):** Bảng chuyển đổi linh hoạt thành dạng thẻ khối (Stacked Card Layout) hoặc vùng cuộn ngang mượt mà có thanh chỉ báo trực quan.

### 3.2. Ngăn xem trước minh chứng (Document Preview Drawer / Modal)
- **Chiều cao và vị trí:** Chiều cao thích ứng `max-h-[90vh]`, cố định phần chân trang chứa nút hành động ("Đạt", "Không đạt", "Đóng").
- **Tương tác:** Không bị che khuất bởi bàn phím ảo trên điện thoại di động; hỗ trợ thu phóng và xoay ảnh chứng nhận.

### 3.3. Thanh công cụ nổi và Menu điều hướng (Sticky Navigation & Floating Bars)
- **Khoảng cách đệm an toàn:** Áp dụng `scroll-margin-top: 175px` cho các mốc neo tiêu chí, đảm bảo tiêu đề tiêu chí không bị che bởi thanh điều hướng dính phía trên khi cuộn trang.
- **Vùng bấm ngón tay (Touch Targets):** Tất cả các nút bấm hành động chính trên màn hình cảm ứng đạt chiều cao tối thiểu 44px, khoảng cách giữa 2 nút bấm lân cận tối thiểu 8px để tránh bấm nhầm.

---

## 4. KẾT LUẬN KIỂM ĐỊNH ĐÁP ỨNG
Giao diện đạt chuẩn nhận diện Hội Sinh viên Việt Nam (xanh cyan - trắng thanh lịch), tính tương phản cao, khả năng tiếp cận (Accessibility) tốt, không tồn tại lỗi hiển thị cản trở người dùng.
