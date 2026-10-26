# HƯỚNG DẪN KIỂM THỬ THỰC TẾ (MANUAL UAT CHECKLIST)
## LEAN-3: BỔ SUNG MINH CHỨNG TRỰC TIẾP TRONG HỒ SƠ & XÉT LẠI THEO NGỮ CẢNH
**Hệ thống Xét chọn Sinh viên 5 tốt — Thành phố Đà Nẵng**  
**Đối tượng thực hiện:** Chuyên viên Kiểm thử (QA), Cán bộ Thẩm định (Reviewer), Sinh viên (Applicant)  
**Mục tiêu:** Kiểm tra trải nghiệm thực tế trên giao diện người dùng theo đúng quy trình nghiệp vụ thực tế.

---

### KỊCH BẢN 1: CÁN BỘ THẨM ĐỊNH TẠO YÊU CẦU BỔ SUNG TRỰC TIẾP THEO NGỮ CẢNH (OFFICER CONTEXTUAL REQUEST)
1. **Truy cập:** Đăng nhập với vai trò Cán bộ Xét duyệt (Cấp Trường hoặc Cấp Thành phố) và mở một hồ sơ cá nhân đã nộp.
2. **Chọn kê khai:** Cuộn đến Tiêu chí 04 (Tình nguyện tốt), mục kê khai "Hiến máu tình nguyện đợt 1".
3. **Thao tác yêu cầu:** Bấm vào nút **"Yêu cầu bổ sung"** (biểu tượng dấu hỏi/cảnh báo màu cam) ngay cạnh các nút Đạt/Không đạt của kê khai.
4. **Kiểm tra giao diện soạn thảo (Drawer/Form):**
   - [x] Tiêu chí ("Tình nguyện tốt"), Tiêu chuẩn ("Hoạt động tình nguyện tiêu biểu"), Kê khai ("Hiến máu tình nguyện đợt 1") đã được **điền sẵn tự động**.
   - [x] Không xuất hiện menu thả xuống trùng lặp yêu cầu chọn lại.
   - [x] Chọn hành động: Đính kèm thêm minh chứng mới (`addEvidence`).
   - [x] Nhập nội dung: `"Bổ sung giấy xác nhận có mộc đỏ của Bệnh viện Đà Nẵng."`
   - [x] Ô thời hạn: để trống (kiểm tra không bị ép buộc hạn 3 ngày).
5. **Gửi yêu cầu:** Bấm **"Gửi yêu cầu"**.
6. **Kiểm tra kết quả:**
   - Dòng kê khai chuyển sang trạng thái chờ sinh viên phản hồi.
   - Trạng thái hồ sơ chuyển sang `supplement_requested`.

---

### KỊCH BẢN 2: SINH VIÊN NHẬN THÔNG BÁO VÀ PHẢN HỒI BỔ SUNG TRONG HỒ SƠ (STUDENT IN-DOSSIER RESPONSE)
1. **Truy cập:** Chuyển sang giao diện Sinh viên của thí sinh trên.
2. **Kiểm tra thanh cảnh báo đầu trang:**
   - [x] Xuất hiện thông báo: `"Cần bạn bổ sung thông tin · Tình nguyện tốt"`.
   - [x] Bấm nút **"Xem nội dung cần bổ sung"** -> Hệ thống tự động cuộn mượt và mở rộng đúng Tiêu chí 04, Tiêu chuẩn tình nguyện và kê khai mục tiêu.
3. **Kiểm tra tính toàn vẹn phạm vi (Scope Integrity):**
   - [x] Kê khai mục tiêu "Hiến máu tình nguyện đợt 1" hiển thị viền cam nổi bật và có nút "Quản lý minh chứng" / Thẻ phản hồi bổ sung.
   - [x] Các tiêu chí khác (Đạo đức, Học tập, Thể lực, Hội nhập) hiển thị nhãn `"Đã gửi · Chỉ xem"`, các nút sửa/xóa bị vô hiệu hóa.
   - [x] Khối thông tin cá nhân (Profile Snapshot) hoàn toàn ở chế độ chỉ đọc.
4. **Đính kèm minh chứng & Giải trình:**
   - [x] Bấm "Quản lý minh chứng" -> Tải lên tệp `"Giay-xac-nhan-hien-mau-bv-da-nang.pdf"`.
   - [x] Tệp vừa tải hiển thị nhãn màu xanh dương: `"Mới bổ sung"`.
   - [x] Các tệp minh chứng cũ đã nộp ban đầu vẫn giữ nguyên vẹn, không bị xóa.
   - [x] Tại thẻ **"Phản hồi yêu cầu bổ sung"**, nhập vào ô **Nội dung giải trình (Tùy chọn)**: `"Em đã bổ sung bản quét giấy xác nhận có mộc tròn đỏ của Bệnh viện Đà Nẵng ạ."`
5. **Gửi bổ sung:**
   - [x] Bấm nút **"Gửi bổ sung"** (màu xanh lá cây) ngay trong thẻ.
   - [x] Thông báo thành công hiển thị, trạng thái chuyển sang `"Đã gửi bổ sung"`.

---

### KỊCH BẢN 3: CÁN BỘ ĐỐI CHIẾU DIFF VÀ XÉT LẠI TRỰC TIẾP (OFFICER DIFF PREVIEW & REASSESSMENT)
1. **Truy cập:** Quay lại giao diện Cán bộ Thẩm định.
2. **Kiểm tra danh sách & hồ sơ:**
   - [x] Huy hiệu trạng thái trên dòng kê khai hiển thị: `"Đã bổ sung — Chờ xét lại"` (màu cam nhạt/nổi bật).
   - [x] Bấm vào nút **"Xem nội dung bổ sung"**:
     - Hiển thị tệp minh chứng mới với nhãn `"Mới bổ sung"`.
     - Hiển thị chính xác đoạn giải trình của sinh viên: `"Em đã bổ sung bản quét giấy xác nhận có mộc tròn đỏ của Bệnh viện Đà Nẵng ạ."`
3. **Thực hiện thẩm định lại (Single-click Reassessment):**
   - [x] Các nút đánh giá **"Đạt sau BS"** và **"Không đạt"** hiển thị sẵn sàng, **KHÔNG** yêu cầu bấm nút trung gian nào khác.
   - [x] Cán bộ bấm vào **"Đạt sau BS"**:
     - Kê khai lập tức đổi thành Đạt (`suitable`).
     - Yêu cầu bổ sung tự động chuyển thành Hoàn tất (`completed`).
     - Trạng thái quy trình hồ sơ trở về `under_review`.
     - Nhật ký kiểm toán ghi nhận mục: `"Đã xét lại sau bổ sung Tiêu chí 04"`.

---

### KỊCH BẢN 4: HỒ SƠ CÓ NHIỀU YÊU CẦU BỔ SUNG ĐỒNG THỜI (MULTI-SUPPLEMENT WORKFLOW)
1. **Thiết lập:** Cán bộ tạo 2 yêu cầu bổ sung ở 2 tiêu chí khác nhau (Ví dụ: Tiêu chí 02 Học tập tốt và Tiêu chí 04 Tình nguyện tốt).
2. **Kiểm tra giao diện sinh viên:**
   - [x] Banner đầu trang hiển thị tab điều hướng: `"Bạn có 2 yêu cầu bổ sung: [1. Học tập tốt] [2. Tình nguyện tốt]"`.
   - [x] Bấm vào từng tab sẽ nhảy mượt (scroll anchor) tới đúng vị trí kê khai tương ứng.
3. **Giải quyết lần lượt:**
   - Sinh viên gửi bổ sung cho Tiêu chí 02.
   - Tiêu chí 04 vẫn giữ nguyên trạng thái chờ bổ sung.
   - Hồ sơ vẫn hiển thị trạng thái cần bổ sung cho đến khi hoàn thành cả 2 mục.

---

### KỊCH BẢN 5: KIỂM SOÁT BÀN GIAO GÓI HỒ SƠ CẤP TRƯỜNG (SCHOOL BATCH FORWARDING SAFETY)
1. **Truy cập:** Đăng nhập với vai trò Cán bộ Xét sơ tuyển cấp Trường (ví dụ: Đại học Đà Nẵng).
2. **Kiểm tra tiến độ đợt xét:**
   - Mở màn hình tổng kết đợt sơ tuyển.
   - Nếu còn hồ sơ trong diện đề cử đang có yêu cầu bổ sung chưa hoàn tất, hệ thống hiển thị cảnh báo:
     `"Còn X hồ sơ có yêu cầu bổ sung minh chứng chưa hoàn tất."`
   - Nút "Chuyển danh sách về Thành phố" bị khóa (disabled) cho tới khi các yêu cầu bổ sung được thẩm định xong.
