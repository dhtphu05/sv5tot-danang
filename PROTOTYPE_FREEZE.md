# 5TOT ĐÀ NẴNG — STAKEHOLDER PROTOTYPE FREEZE

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Ngày chốt phiên bản:** 06/10/2026 (Năm học 2026–2027)  
**Trạng thái phiên bản:** STAKEHOLDER PROTOTYPE FREEZE (Ứng viên nghiệm thu trình diễn)

---

## 1. PHẠM VI NGHIỆP VỤ HỆ THỐNG (SYSTEM BUSINESS SCOPE)
- **Cấp xét chọn duy nhất:** **CẤP THÀNH PHỐ** (Hội Sinh viên Việt Nam Thành phố Đà Nẵng).
- **Đơn vị đào tạo (32 trường):** Phục vụ phân loại cơ sở, đối soát thông tin sinh viên và cơ chế nộp (*Nộp trực tiếp lên Thành phố* hoặc *Hội Sinh viên trường sơ loại*). Trường đại học **KHÔNG** phải là một cấp thẩm định trong phần mềm cấp Thành phố.
- **05 Tiêu chí cốt lõi (Khóa bất biến):**
  1. **Đạo đức tốt** (Rèn luyện đạo đức, pháp luật, lịch sử truyền thống)
  2. **Học tập tốt** (Điểm trung bình học tập GPA, Nghiên cứu khoa học, cuộc thi học thuật)
  3. **Thể lực tốt** (Tiêu chuẩn Sinh viên khỏe hoặc chứng chỉ thể thao tương đương)
  4. **Tình nguyện tốt** (Chiến dịch Mùa hè xanh, Ngày Chủ nhật xanh, hiến máu tình nguyện, ngày tình nguyện)
  5. **Hội nhập tốt** (Ngoại ngữ, tin học, giao lưu quốc tế, kỹ năng mềm)

---

## 2. KIẾN TRÚC MÔ HÌNH DỮ LIỆU CHUNG (ONE SHARED BUSINESS WORLD)
Tất cả các vai trò trong phiên bản trình diễn cùng vận hành trên **MỘT nguồn dữ liệu nghiệp vụ đồng bộ duy nhất**:
1. **Sinh viên nộp hồ sơ** $\rightarrow$ Dữ liệu chuyển ngay sang hàng chờ phân công của Quản lý và danh sách của Cán bộ; hồ sơ sinh viên khóa quyền chỉnh sửa nội dung thông thường.
2. **Cán bộ yêu cầu bổ sung** $\rightarrow$ Sinh viên nhận thông báo bổ sung kèm 1 mục việc cần làm, Trang chủ đổi sang trạng thái *Cần bổ sung hồ sơ*, giao diện hồ sơ chỉ mở đúng phạm vi kê khai được yêu cầu.
3. **Sinh viên gửi bổ sung** $\rightarrow$ Cán bộ thấy ngay minh chứng mới và tóm tắt thay đổi; Quản lý thấy hồ sơ cập nhật trong danh sách theo dõi bổ sung.
4. **Cán bộ hoàn tất xét 5 tiêu chí** $\rightarrow$ Hồ sơ chuyển trạng thái *Đã hoàn tất xét 5 tiêu chí*; Sinh viên chuyển sang trạng thái *Đang chờ kết quả chính thức* (**Quy tắc cứng: Hoàn tất xét $\neq$ Được công nhận!**).
5. **Hội đồng ghi nhận kết luận xét chọn** $\rightarrow$ Quyết định được lưu nội bộ cấp Thành phố; Sinh viên vẫn thấy trạng thái chờ kết quả chính thức.
6. **Hội đồng công bố kết quả** $\rightarrow$ Kết quả thẩm định chính thức lập tức hiển thị trên Trang chủ, Trang Kết quả và Thông báo của Sinh viên; báo cáo thống kê cập nhật chỉ số công nhận.
7. **Quản trị hệ thống điều chỉnh mốc thời gian** $\rightarrow$ Trang công khai, Trang chủ sinh viên, Kiểm tra trước khi gửi, và Dòng thời gian của Quản lý cùng phản ánh mốc thời gian mới.

---

## 3. CÁC VAI TRÒ & DANH TÍNH TRÌNH DIỄN (DEMO PERSONAS)
- **Sinh viên:** Nguyễn Minh Anh (MSSV: 102220123 · Trường Đại học Bách khoa — ĐH Đà Nẵng)
- **Cán bộ xét duyệt (CITY_OFFICER):** Trần Hoàng Nam (`nam.th@hsvdanang.vn` · Tổ Thẩm định Kỹ thuật & Công nghệ)
- **Quản lý xét duyệt (CITY_MANAGER):** Nguyễn Thu Hà (`ha.nt@hsvdanang.vn` · Ban Thư ký Hội Sinh viên TP)
- **Hội đồng xét chọn (CITY_COMMITTEE):** Lê Minh Quân (`quan.lm@hsvdanang.vn` · Hội đồng xét chọn cấp Thành phố)
- **Quản trị hệ thống (ADMIN):** Phạm Ngọc Lan (`lan.pn@hsvdanang.vn` · Văn phòng Hội Sinh viên TP)

---

## 4. ĐƯỜNG DẪN & TRÌNH DIỄN (DEMO ROUTES & CONTROLS)
- **Trang chủ công khai:** `/` (Trang thông tin chính thức, sạch sẽ, không lộ công cụ nhà phát triển).
- **Ứng dụng Sinh viên:** `/app` (Tổng quan, Hồ sơ của tôi, Kho minh chứng, Thông báo, Kết quả xét chọn).
- **Bàn làm việc Cán bộ:** `/staff` (Hồ sơ phân công, Không gian xét duyệt, Điều phối, Hội đồng, Thống kê, Quản trị).
- **Bộ điều hướng kịch bản trình diễn (/demo):**
  - Kịch bản Sinh viên (9 trạng thái vòng đời)
  - Kịch bản Cán bộ xét duyệt (7 trạng thái thẩm định A-G)
  - Kịch bản Quản lý xét duyệt (6 tình huống điều phối QL-01 - QL-06)
  - Kịch bản Hội đồng xét chọn (5 tình huống kết luận & công bố HĐ-01 - HĐ-05)
  - Kịch bản Quản trị hệ thống (6 phân hệ cấu hình QT-01 - QT-06)
- **Thanh công cụ trình diễn góc phải dưới (Prototype Demo Toolbar):**
  - Chiều cao 36px, nền trắng trung tính, bóng đổ mềm.
  - Hỗ trợ đổi vai trò 5 tab: *Sinh viên | Cán bộ | Quản lý | Hội đồng | Quản trị*.
  - Có nút ẩn hoàn toàn khi cần chụp ảnh màn hình / thuyết trình trang trọng; phím tắt `Alt + D` để mở lại.

---

## 5. ĐỘ PHÂN GIẢI & ĐÁP ỨNG GIAO DIỆN (RESPONSIVE COMPLIANCE)
Đã kiểm thử và đạt chuẩn hiển thị trên:
- `1280 × 720` (Màn hình nhỏ)
- `1366 × 768` (Độ phân giải phổ biến tại cơ quan nhà nước / trường học — Không vỡ layout, không cuộn ngang trình duyệt)
- `1440 × 900` (Chuẩn chụp ảnh tư liệu & báo cáo)
- `1600 × 900` & `1920 × 1080` (Màn hình làm việc tiêu chuẩn)
- `Tỉ lệ phóng to 125% (Browser Zoom)`: Thanh điều hướng giữ cố định `100dvh`, bảng dữ liệu giữ tiêu đề `sticky`, chân modal và thanh tác vụ giữ cố định.

---

## 6. GIỚI HẠN ĐÃ BIẾT CỦA BẢN TRÌNH DIỄN (KNOWN PROTOTYPE LIMITATIONS)
1. **Dịch vụ Backend & Cơ sở dữ liệu:** Vận hành trên bộ nhớ trình duyệt kết hợp bộ điều phối trạng thái nội bộ; chưa kết nối cơ sở dữ liệu phân tán ngoài.
2. **Gửi Email/SMS thông báo:** Tác vụ gửi thư mời bổ sung và thông báo kết quả được mô phỏng lập tức trong Trung tâm Thông báo nội bộ; chưa tích hợp SMTP gateway.
3. **Chữ ký số & Quyết định PDF có mộc đỏ:** Mẫu quyết định công nhận và giấy chứng nhận hiển thị theo định dạng tài liệu số nội bộ có thể xuất bản/in trực tiếp, chưa tích hợp chứng thư số USB Token / SIM CA.
4. **Quy định chi tiết năm học tiếp theo (2027–2028):** Hệ thống cung cấp cơ chế dự thảo bản nháp sao chép từ quy định 2026–2027; văn bản hướng dẫn chính thức năm 2027–2028 sẽ do Ban Thư ký phê duyệt khi mở mùa xét mới.
