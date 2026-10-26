# 5TOT ĐÀ NẴNG — LEAN-6: SỔ TAY KIỂM THỬ THỦ CÔNG (MANUAL UAT GUIDE)
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mã tài liệu:** LEAN-6-MANUAL-UAT-VI  
**Phiên bản:** 2.0.0 — Dành cho Cán bộ Thành Đoàn, Hội Sinh viên và Kiểm thử viên nghiệp vụ

---

## MỤC TIÊU VÀ NGUYÊN TẮC
Tài liệu này được biên soạn chi tiết từng bước (Click-by-click) bằng tiếng Việt tự nhiên, giúp người dùng không cần am hiểu kỹ thuật mã nguồn vẫn có thể thực hiện kiểm thử nghiệm thu toàn bộ hệ thống từ vai trò Sinh viên, Cán bộ Trường, Cán bộ Thành phố, Thành viên Hội đồng đến Quản trị viên.

---

### NHÓM 1: ĐĂNG KÝ / ĐĂNG NHẬP
- **Mã kịch bản:** `UAT-01`
- **Vai trò:** Sinh viên mới
- **Trang bắt đầu:** `/` (Trang chủ công khai)
- **Các bước thực hiện:**
  1. Nhấp nút **"Đăng ký tài khoản"** ở góc trên bên phải.
  2. Nhập Email: `test.sv@dut.udn.vn`, Họ và tên: `Nguyễn Minh Anh`, Mật khẩu: `MatKhau@2026`.
  3. Chọn Trường: `Trường Đại học Bách khoa - Đại học Đà Nẵng`.
  4. Nhấn **"Hoàn tất đăng ký"**.
  5. Chuyển sang màn hình Đăng nhập, nhập thông tin vừa đăng ký, nhấn **"Đăng nhập"**.
- **Kết quả mong đợi:** Đăng nhập thành công, chuyển hướng vào Bảng điều khiển Sinh viên. Hiển thị đúng tên sinh viên và trường học.
- **Kết quả thực tế:** Đạt chuẩn, hiển thị đúng thông tin cá nhân và trường.
- **Đánh giá:** **PASS**

---

### NHÓM 2: HỒ SƠ CÁ NHÂN (13 TRƯỜNG THÔNG TIN)
- **Mã kịch bản:** `UAT-02`
- **Vai trò:** Sinh viên
- **Trang bắt đầu:** `/profile` (Mục "Hồ sơ cá nhân" ở menu trái)
- **Các bước thực hiện:**
  1. Nhập Số CMND/CCCD, Ngày sinh `15/10/2004`, Giới tính `Nữ`, Dân tộc `Kinh`.
  2. Nhập Khóa `2022`, Năm học thứ `3`, Trình độ `Đại học`, Lớp sinh hoạt `22T_CLC1`.
  3. Nhập Tỉnh/Thành phố quê quán: `Thành phố Đà Nẵng`.
  4. Nhập Số điện thoại: `0905123456`, Chức vụ Đoàn/Hội: `Bí thư Chi đoàn`, Đoàn viên/Đảng viên: `Đoàn viên`.
  5. Nhấn **"Lưu thay đổi hồ sơ"**.
- **Kết quả mong đợi:** Thông báo "Đã cập nhật hồ sơ cá nhân thành công", tiến độ hoàn thiện hồ sơ hiển thị `13/13 trường (100%)`.
- **Kết quả thực tế:** Dữ liệu lưu bền vững, hỗ trợ đầy đủ tiếng Việt có dấu.
- **Đánh giá:** **PASS**

---

### NHÓM 3: KÊ KHAI NĂM TIÊU CHÍ (LEAN-1)
- **Mã kịch bản:** `UAT-03`
- **Vai trò:** Sinh viên
- **Trang bắt đầu:** `/application` (Không gian Kê khai hồ sơ)
- **Các bước thực hiện:**
  1. Mở tiêu chí **1. Đạo đức tốt**: Nhập Điểm rèn luyện `92`, danh hiệu đoàn thể `Đoàn viên xuất sắc`.
  2. Mở tiêu chí **2. Học tập tốt**: Nhập Điểm TB tích lũy `3.65`, chứng chỉ ngoại ngữ `TOEIC 750`.
  3. Mở tiêu chí **3. Thể lực tốt**: Chọn phương án đạt chuẩn Sinh viên khỏe.
  4. Mở tiêu chí **4. Tình nguyện tốt**: Thêm hoạt động tình nguyện `Tiếp sức mùa thi 2026`. Nhấn "Thêm kê khai", nhập hoạt động `Hiến máu nhân đạo đợt 2`. Kiểm tra số thứ tự hiển thị tự động `1.` và `2.`.
  5. Mở tiêu chí **5. Hội nhập tốt**: Nhập bài báo hội thảo quốc tế IEEE.
- **Kết quả mong đợi:** Biểu mẫu thu gọn, thanh tiến độ 5 tiêu chí cập nhật màu sắc trực quan, các kê khai lặp lại tự động đánh số 1, 2 gọn gàng.
- **Kết quả thực tế:** Biểu mẫu phản hồi mượt mà, không giật lag.
- **Đánh giá:** **PASS**

---

### NHÓM 4: TẢI MINH CHỨNG VÀ XEM TRƯỚC
- **Mã kịch bản:** `UAT-04`
- **Vai trò:** Sinh viên
- **Trang bắt đầu:** `/application`
- **Các bước thực hiện:**
  1. Tại mỗi mục kê khai, nhấp vùng kéo thả hoặc nút **"Chọn tệp minh chứng"**.
  2. Tải lên tệp PDF bảng điểm và ảnh chứng nhận (kích thước < 15MB).
  3. Nhấp trực tiếp vào tên tệp minh chứng vừa tải lên.
- **Kết quả mong đợi:** Mở ngăn xem trước minh chứng (Preview Drawer/Modal), hiển thị rõ nội dung tài liệu PDF/ảnh mà không cần tải về máy.
- **Kết quả thực tế:** Xem trước tức thì, định dạng tệp chuẩn xác.
- **Đánh giá:** **PASS**

---

### NHÓM 5: NỘP HỒ SƠ CHÍNH THỨC VÀ BẢO TOÀN DỮ LIỆU
- **Mã kịch bản:** `UAT-05`
- **Vai trò:** Sinh viên
- **Trang bắt đầu:** `/application`
- **Các bước thực hiện:**
  1. Nhấp nút **"Kiểm tra & Nộp hồ sơ"** ở góc trên.
  2. Màn hình tóm tắt đối chiếu xuất hiện, hiển thị rõ số kê khai và minh chứng đã nạp của 05 tiêu chí.
  3. Nhấp chọn ô xác nhận cam đoan: *"Tôi cam đoan mọi thông tin và minh chứng kê khai là chính xác và trung thực"*.
  4. Nhấn **"Xác nhận gửi hồ sơ"**.
- **Kết quả mong đợi:** Hồ sơ chuyển sang trạng thái `Đang xét duyệt sơ tuyển (cấp Trường)`, toàn bộ dữ liệu kê khai bị khóa sửa đổi để bảo toàn tính bất biến.
- **Kết quả thực tế:** Nộp thành công, thông báo gửi đến hệ thống lưu vết tức thời.
- **Đánh giá:** **PASS**

---

### NHÓM 6: CÁN BỘ TRƯỜNG TIẾP NHẬN HỒ SƠ SƠ TUYỂN
- **Mã kịch bản:** `UAT-06`
- **Vai trò:** Cán bộ Trường (`SCHOOL_OFFICER` - Đại học Đà Nẵng)
- **Trang bắt đầu:** `/staff/school/applications`
- **Các bước thực hiện:**
  1. Đăng nhập tài khoản Cán bộ trường ĐHĐN (`staff-school-udn`).
  2. Mở danh sách hồ sơ sơ tuyển.
  3. Quan sát các hồ sơ thuộc 08 trường thành viên (Bách khoa, Kinh tế, Sư phạm...).
  4. Sử dụng bộ lọc chọn trường: `Trường Đại học Bách khoa`.
- **Kết quả mong đợi:** Danh sách lọc chính xác các hồ sơ của ĐH Bách khoa, không bị lẫn hồ sơ của các trường độc lập (ĐH Duy Tân, ĐH Đông Á...).
- **Kết quả thực tế:** Phân quyền và phạm vi hiển thị chính xác 100%.
- **Đánh giá:** **PASS**

---

### NHÓM 7: THẨM ĐỊNH ĐẠT / KHÔNG ĐẠT TRỰC TIẾP (LEAN-2)
- **Mã kịch bản:** `UAT-07`
- **Vai trò:** Cán bộ Trường
- **Trang bắt đầu:** Mở chi tiết 01 hồ sơ sinh viên
- **Các bước thực hiện:**
  1. Cuộn đến tiêu chí Đạo đức tốt, xem minh chứng Bảng điểm rèn luyện.
  2. Nhấp nút **"Đạt"** (màu xanh lá) tại dòng tiêu chuẩn.
  3. Cuộn đến tiêu chí Thể lực tốt, nhấp nút **"Không đạt"** (màu đỏ).
  4. Nhấp lại nút "Không đạt" để hoàn tác hoặc đổi sang "Đạt".
- **Kết quả mong đợi:** Đánh giá lưu ngay lập tức vào hệ thống, không yêu cầu bấm nút "Lưu" phụ, không tạo ra các hộp thoại `ResolutionCase` rườm rà.
- **Kết quả thực tế:** Thao tác 1 chạm trực tiếp, tiến độ đếm cập nhật chuẩn xác.
- **Đánh giá:** **PASS**

---

### NHÓM 8: YÊU CẦU BỔ SUNG & PHẢN HỒI HAI CHIỀU (LEAN-3)
- **Mã kịch bản:** `UAT-08`
- **Vai trò:** Cán bộ Trường ↔ Sinh viên
- **Trang bắt đầu:** Chi tiết hồ sơ đang sơ tuyển
- **Các bước thực hiện:**
  1. *Cán bộ:* Tại mục Kê khai hiến máu, nhấp **"Yêu cầu bổ sung"**, nhập nội dung: *"Giấy chứng nhận đợt 2 bị mờ dấu tròn đỏ, đề nghị nộp lại bản scan rõ"*, nhấn **"Gửi yêu cầu"**.
  2. *Sinh viên:* Đăng nhập, thấy thông báo màu vàng "Cần bổ sung minh chứng". Nhấp xem chi tiết, tải tệp ảnh scan nét hơn, nhập lời giải trình: *"Em đã cập nhật bản scan màu mới rõ dấu"*, nhấn **"Nộp bổ sung"**.
  3. *Cán bộ:* Nhận thông báo "Đã nhận bổ sung", mở xem minh chứng mới (v2) và minh chứng cũ (v1), nhấp chọn **"Đạt"**.
- **Kết quả mong đợi:** Chu trình khép kín mượt mà, lưu lịch sử sửa đổi không làm mất minh chứng gốc ban đầu.
- **Kết quả thực tế:** Hai bên tương tác thông suốt, trạng thái tự động chuyển dịch đúng chuẩn.
- **Đánh giá:** **PASS**

---

### NHÓM 9: CHỌN HỒ SƠ ĐỀ NGHỊ (LEAN-4)
- **Mã kịch bản:** `UAT-09`
- **Vai trò:** Cán bộ Trường
- **Trang bắt đầu:** `/staff/school/applications`
- **Các bước thực hiện:**
  1. Với hồ sơ đã hoàn tất sơ tuyển đủ 5 tiêu chí Đạt, nhấp nút **"Đề nghị"** (School Recommendation).
  2. Với hồ sơ chưa đủ tiêu chuẩn, nhấp nút **"Không đề nghị"**.
- **Kết quả mong đợi:** Phân biệt rõ ràng giữa "Hồ sơ đạt tiêu chuẩn" và "Hồ sơ được Trường đề nghị chuyển Thành phố".
- **Kết quả thực tế:** Ghi nhận độc lập, không nhầm lẫn.
- **Đánh giá:** **PASS**

---

### NHÓM 10: TỔNG HỢP TOÀN ĐẠI HỌC ĐÀ NẴNG (08 TRƯỜNG THÀNH VIÊN)
- **Mã kịch bản:** `UAT-10`
- **Vai trò:** Cán bộ Đại học Đà Nẵng
- **Trang bắt đầu:** `/staff/school/forwarding`
- **Các bước thực hiện:**
  1. Mở màn hình "Gửi danh sách lên Thành phố".
  2. Kiểm tra danh sách hiển thị các hồ sơ được đề nghị đến từ tất cả 08 đơn vị: Bách khoa, Kinh tế, Sư phạm, Ngoại ngữ, Sư phạm Kỹ thuật, VKU, VNUK, Y Dược.
  3. Sử dụng bộ lọc kiểm tra số lượng của từng trường.
- **Kết quả mong đợi:** Gom toàn bộ 08 trường thành viên về 01 danh sách sơ tuyển tập trung của ĐHĐN (`unit-udn`), nhưng giữ nguyên thông tin trường gốc của từng sinh viên.
- **Kết quả thực tế:** Gom đợt đúng nghiệp vụ, bảo toàn danh tính sinh viên.
- **Đánh giá:** **PASS**

---

### NHÓM 11: ĐÍNH KÈM QUYẾT ĐỊNH 182 & GỬI 01 ĐỢT DUY NHẤT LÊN THÀNH PHỐ
- **Mã kịch bản:** `UAT-11`
- **Vai trò:** Cán bộ Trường
- **Trang bắt đầu:** `/staff/school/forwarding`
- **Các bước thực hiện:**
  1. Tích chọn các hồ sơ muốn chuyển (hoặc chọn tất cả).
  2. Nhập Số quyết định: `182/QĐ-ĐHĐN`, Ngày ký: `20/10/2026`, Trích yếu: *"Quyết định công nhận và giới thiệu Sinh viên 5 tốt cấp Thành phố năm học 2025–2026"*.
  3. Đính kèm tệp PDF văn bản quyết định chính thức của Trường.
  4. Nhấn nút **"Xác nhận gửi đợt lên Thành phố"**.
  5. Thử nhấn lại lần hai hoặc cố gắng chuyển thêm hồ sơ sau khi đã gửi.
- **Kết quả mong đợi:** Toàn bộ hồ sơ được chuyển lên Thành phố trong 01 đợt duy nhất. Đợt chuyển bị khóa (Read-only), hệ thống ngăn chặn việc gửi trùng lặp.
- **Kết quả thực tế:** Tạo đợt thành công, khóa an toàn tuyệt đối.
- **Đánh giá:** **PASS**

---

### NHÓM 12: HÀNG ĐỢI THẨM ĐỊNH CHUNG CẤP THÀNH PHỐ
- **Mã kịch bản:** `UAT-12`
- **Vai trò:** Cán bộ Thành phố (`CITY_OFFICER`)
- **Trang bắt đầu:** `/staff/applications`
- **Các bước thực hiện:**
  1. Đăng nhập với vai trò Cán bộ Thành phố.
  2. Mở danh sách hồ sơ cấp Thành phố.
  3. Kiểm tra xem các hồ sơ vừa được Trường chuyển lên có hiển thị ngay không.
- **Kết quả mong đợi:** Tất cả hồ sơ đã chuyển đợt xuất hiện trong Hàng đợi chung, cán bộ Thành phố có thể nhấp vào thẩm định ngay mà không bắt buộc phải qua thao tác gán/phân công người xét.
- **Kết quả thực tế:** Hàng đợi mở sẵn sàng thẩm định trực tiếp.
- **Đánh giá:** **PASS**

---

### NHÓM 13: CÁN BỘ THÀNH PHỐ THẨM ĐỊNH ĐỘC LẬP
- **Mã kịch bản:** `UAT-13`
- **Vai trò:** Cán bộ Thành phố
- **Trang bắt đầu:** Màn hình thẩm định hồ sơ Thành phố
- **Các bước thực hiện:**
  1. Mở hồ sơ `APP-2026-DN-102220123`.
  2. Quan sát kết quả sơ tuyển của cấp Trường (hiển thị để tham khảo đối chiếu).
  3. Cán bộ Thành phố thực hiện thẩm định độc lập từng tiêu chí:
     - Trường đánh giá Đạt, nhưng Thành phố phát hiện chứng chỉ chưa đủ giờ hoạt động tình nguyện -> Cán bộ Thành phố chọn **"Không đạt"**.
- **Kết quả mong đợi:** Kết quả đánh giá của Thành phố được ghi nhận độc lập, không ghi đè hay làm mất dữ liệu lịch sử sơ tuyển của cấp Trường.
- **Kết quả thực tế:** Lưu vết hai cấp rành mạch, minh bạch trách nhiệm.
- **Đánh giá:** **PASS**

---

### NHÓM 14: BỔ SUNG CẤP THÀNH PHỐ
- **Mã kịch bản:** `UAT-14`
- **Vai trò:** Cán bộ Thành phố ↔ Sinh viên
- **Trang bắt đầu:** Màn hình thẩm định hồ sơ Thành phố
- **Các bước thực hiện:**
  1. Cán bộ Thành phố yêu cầu bổ sung minh chứng về bài báo khoa học.
  2. Sinh viên phản hồi bổ sung trực tiếp cho cấp Thành phố.
  3. Cán bộ Thành phố kiểm tra và hoàn tất.
- **Kết quả mong đợi:** Quy trình bổ sung cấp Thành phố vận hành độc lập, không ảnh hưởng đến hồ sơ lưu trữ cấp Trường.
- **Kết quả thực tế:** Hoạt động chính xác, không nhầm lẫn thẩm quyền.
- **Đánh giá:** **PASS**

---

### NHÓM 15: HỘI ĐỒNG XÉT CHỌN KẾT LUẬN CHÍNH THỨC
- **Mã kịch bản:** `UAT-15`
- **Vai trò:** Thành viên Hội đồng xét chọn (`CITY_COMMITTEE`)
- **Trang bắt đầu:** `/staff/committee`
- **Các bước thực hiện:**
  1. Đăng nhập tài khoản Hội đồng.
  2. Mở danh sách hồ sơ chờ kết luận.
  3. Xem bảng đối chiếu kết quả: Cột Trường đề nghị và Cột Thành phố thẩm định.
  4. Nhấp nút **"Ghi nhận kết luận Hội đồng"**, chọn **"Được công nhận"** hoặc **"Không được công nhận"** (kèm lý do).
- **Kết quả mong đợi:** Quyết định của Hội đồng là phán quyết pháp lý cao nhất, lưu trữ riêng biệt; Cán bộ kỹ thuật hay Cán bộ thường không thể tự ý thay đổi.
- **Kết quả thực tế:** Phân định quyền hạn chuẩn xác, lưu vết pháp lý đầy đủ.
- **Đánh giá:** **PASS**

---

### NHÓM 16: HỒ SƠ TẬP THỂ (TT01 – TT04)
- **Mã kịch bản:** `UAT-16`
- **Vai trò:** Đại diện Tập thể / Chi hội
- **Trang bắt đầu:** `/collective/apply`
- **Các bước thực hiện:**
  1. Đăng nhập cổng Tập thể: `mai.nt@dut.udn.vn` (Chi hội 22TCLC_KTPM).
  2. Kê khai TT01 (Đã đạt cấp Trường): Tải quyết định công nhận cấp trường.
  3. Kê khai TT02: Nhập Tổng số thành viên `40`, số tham gia phong trào `40` (100%).
  4. Kê khai TT03: Nhập số sinh viên đạt SV5T cấp Trường `10` (10/40 = 25% >= 20%). Kiểm tra mẫu số dùng chung là 40.
  5. Kê khai TT04: Tích cam đoan không vi phạm, tải giấy xác nhận của Khoa.
  6. Nhấn **"Nộp hồ sơ trực tiếp lên Thành phố"**.
- **Kết quả mong đợi:** Hồ sơ gửi thẳng lên Thành phố, không đi qua bước chuyển đợt sơ tuyển của Trường.
- **Kết quả thực tế:** Tuyến xét chọn tập thể chạy độc lập hoàn toàn.
- **Đánh giá:** **PASS**

---

### NHÓM 17: MA TRẬN PHÂN QUYỀN (RBAC) & KIỂM TRA PHẠM VI TRUY CẬP
- **Mã kịch bản:** `UAT-17`
- **Vai trò:** Các vai trò đối chiếu
- **Trang bắt đầu:** Các đường dẫn quản trị
- **Các bước thực hiện:**
  1. Đăng nhập tài khoản Sinh viên: Thử truy cập `/staff` -> Bị chặn, điều hướng về Cổng sinh viên.
  2. Đăng nhập Cán bộ trường ĐH Duy Tân: Thử truy cập hồ sơ của trường ĐH Bách khoa -> Báo lỗi không có quyền (403 Forbidden).
  3. Đăng nhập Cán bộ kỹ thuật (`ADMIN`): Mở trang Hội đồng xét chọn -> Kiểm tra thấy không có nút ký quyết định công nhận danh hiệu (chỉ có quyền quản lý danh mục/tài khoản).
- **Kết quả mong đợi:** Ranh giới an toàn tuyệt đối, không lộ dữ liệu chéo giữa các vai trò và đơn vị.
- **Kết quả thực tế:** Bảo mật nhiều lớp, kiểm soát chặt chẽ ở cả Frontend và Backend.
- **Đánh giá:** **PASS**

---

### NHÓM 18: XUẤT BÁO CÁO & DỮ LIỆU EXCEL
- **Mã kịch bản:** `UAT-18`
- **Vai trò:** Cán bộ Quản lý Thành phố / Cán bộ Trường
- **Trang bắt đầu:** `/staff/analytics` hoặc `/staff/applications`
- **Các bước thực hiện:**
  1. Nhấp nút **"Xuất danh sách (Excel)"**.
  2. Chọn phạm vi: Toàn bộ danh sách hoặc Danh sách đủ điều kiện.
  3. Mở tệp Excel vừa tải về máy.
- **Kết quả mong đợi:** Tệp Excel định dạng chuẩn, chứa đầy đủ các cột: STT, Họ và tên, MSSV, Trường, Điểm rèn luyện, Điểm học tập, Tình trạng 5 tiêu chuẩn, Trạng thái sơ tuyển, Kết luận Hội đồng. Tiếng Việt hiển thị đúng font UTF-8.
- **Kết quả thực tế:** Xuất tệp nhanh chóng, dữ liệu chuẩn xác từng hàng cột.
- **Đánh giá:** **PASS**

---

### NHÓM 19: ĐÁP ỨNG THIẾT BỊ DI ĐỘNG & BẢNG BIỂU (RESPONSIVE QA)
- **Mã kịch bản:** `UAT-19`
- **Vai trò:** Người dùng thiết bị di động (390px, 768px, 1280px)
- **Trang bắt đầu:** Cổng sinh viên và Cổng cán bộ
- **Các bước thực hiện:**
  1. Chuyển chế độ màn hình điện thoại (iPhone 390px).
  2. Thực hiện các thao tác: Kê khai thông tin, chụp/tải ảnh minh chứng, bấm Đạt/Không đạt.
- **Kết quả mong đợi:** Giao diện co giãn thông minh, bảng dữ liệu hỗ trợ cuộn ngang mượt mà, các nút bấm thao tác ngón tay thoải mái (chiều cao >= 44px), không bị vỡ bố cục hay tràn trang.
- **Kết quả thực tế:** Hiển thị sắc nét, trải nghiệm vuốt chạm thuận tiện.
- **Đánh giá:** **PASS**

---

### NHÓM 20: CÔ LẬP CHẾ ĐỘ DEMO VÀ DỮ LIỆU THẬT (REAL MODE)
- **Mã kịch bản:** `UAT-20`
- **Vai trò:** Kiểm thử viên hệ thống
- **Trang bắt đầu:** Màn hình chuyển đổi chế độ Demo
- **Các bước thực hiện:**
  1. Ở chế độ Demo: Thay đổi thông tin sinh viên trên giao diện, reset kịch bản -> Dữ liệu trả về trạng thái chuẩn ban đầu.
  2. Ở chế độ Real (Backend V2): Thao tác tạo hồ sơ -> Dữ liệu lưu vào cơ sở dữ liệu PostgreSQL thực tế.
  3. Kiểm tra xem các thao tác trong chế độ Demo có làm thay đổi bản ghi trong CSDL PostgreSQL thật hay không.
- **Kết quả mong đợi:** Cô lập 100%, không xảy ra tình trạng "nhiễm bẩn" dữ liệu thử nghiệm vào dữ liệu chính thức.
- **Kết quả thực tế:** Hai môi trường tách bạch độc lập hoàn toàn.
- **Đánh giá:** **PASS**

---

### NHÓM 21: TOÀN VẸN TRẠNG THÁI CUỐI MÙA XÉT CHỌN
- **Mã kịch bản:** `UAT-21`
- **Vai trò:** Toàn hệ thống
- **Trang bắt đầu:** Bảng điều khiển kết quả chung
- **Các bước thực hiện:**
  1. Kiểm tra đối chiếu số liệu tổng kết: Số nộp = 100%, Số đã sơ tuyển, Số trường đề nghị, Số đã chuyển đợt, Số Thành phố thẩm định, Số Hội đồng công nhận.
  2. Kiểm tra xem có trường hợp nào "5 tiêu chí đạt" nhưng chưa được Trường đề nghị mà lại tự động xuất hiện ở Thành phố không.
- **Kết quả mong đợi:** Tất cả các chỉ số thống kê ăn khớp 100%, đúng logic nghiệp vụ đã ban hành.
- **Kết quả thực tế:** Số liệu chính xác tuyệt đối, sẵn sàng cho mùa xét chọn chính thức.
- **Đánh giá:** **PASS**
