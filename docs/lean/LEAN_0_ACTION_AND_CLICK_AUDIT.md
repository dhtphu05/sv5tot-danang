# LEAN-0.1: BÁO CÁO KIỂM TOÁN THAO TÁC VÀ ĐO ĐẠC LƯỢT NHẤP CHUỘT
## (Action & Click Audit: Redundancy Elimination & Metric Reclassification)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Phương pháp đo đạc & phân loại số liệu:** Mô hình hóa đường dẫn tương tác (Interaction Path Modeling) trên mã nguồn thực tế; phân định rõ giữa Ước tính từ mã nguồn (Source-Derived Estimate) và Chỉ tiêu thiết kế (Design Target).

---

## 1. NGUYÊN TẮC VÀ PHÂN LOẠI ĐỘ ĐO THAO TÁC (METRIC CLASSIFICATION)

Để đảm bảo tính khoa học và trung thực của báo cáo, toàn bộ số liệu đo đạc trong tài liệu này được phân loại minh bạch theo 4 nhóm:

- `[MEASURED]`: Số lượng thao tác được đếm trực tiếp trên cây DOM và luồng mã nguồn hiện tại của ứng dụng.
- `[SOURCE-DERIVED ESTIMATE]`: Ước tính số thao tác dựa trên cấu trúc component, modal và selector hiện có trong mã nguồn.
- `[TARGET]`: Mục tiêu thiết kế hướng tới của đợt refactor Lean UX.
- `[UNVERIFIED]`: Chưa có thử nghiệm thực tế với người dùng (Real-User Testing); không được tuyên bố là kết quả đã nghiệm thu.

> **Tuyên bố minh bạch:** Hệ thống hiện tại đang trong giai đoạn kiểm toán mã nguồn và lập kế hoạch (LEAN-0.1). Chưa có phiên kiểm thử thực địa với người dùng thực tế nào được tiến hành. Mọi chỉ số "giảm clicks" dưới đây là **Mục tiêu thiết kế (Design Targets)** được tính toán dựa trên việc loại bỏ các bước tương tác thừa trong mã nguồn.

---

## 2. BẢNG KIỂM TỔNG HỢP CÁC NÚT BẤM VÀ THAO TÁC HIỆN TẠI (BUTTON AUDIT)

Qua khảo sát toàn bộ mã nguồn tại `src/staff/components/review/`, `src/staff/components/school/`, và `src/staff/components/committee/`, hệ thống hiện có các nhóm thao tác sau `[VERIFIED IN SOURCE]`:

| Vùng giao diện / Màn hình | Nút bấm / Thao tác hiện tại | Mục đích thiết kế ban đầu | Đánh giá tính dư thừa (Redundancy Evaluation) | Đề xuất tinh giản Lean UX |
| :--- | :--- | :--- | :--- | :--- |
| **Dòng Kê khai (Inline Row)** | Nút [Đạt] & [Không đạt] | Ghi nhận kết quả đánh giá cho mục | Cần thiết. Đây là phán quyết trực tiếp của con người. | Giữ nguyên 1-click trực tiếp trên dòng. |
| **Dòng Kê khai (Inline Row)** | Nút "Đánh dấu hoàn tất dòng" | Xác nhận cán bộ đã xong dòng này | **RẤT THỪA.** Nhấn [Đạt] hoặc [Không đạt] đã hàm ý hoàn tất dòng. | **Bỏ hoàn toàn.** Khi click [Đạt]/[Không đạt], dòng tự động hoàn tất. |
| **Khung Xem Minh chứng** | Nút "Xác nhận tệp hợp lệ" | Đánh giá riêng cho từng tệp PDF/ảnh | **RẤT THỪA.** Tệp minh chứng đi liền với mục kê khai. Cán bộ xem tệp và bấm Đạt ở dòng kê khai. | **Bỏ nút xác nhận tệp.** Chỉ xem và đối soát tệp. |
| **Tiêu chí (Criterion Panel)** | Nút "Hoàn tất thẩm định tiêu chí" | Chốt kết quả cho 1 trong 5 tiêu chí | **THỪA.** Nếu các mục con đã có kết luận, hệ thống tự động suy ra tiến độ tiêu chí hoàn tất. | **Bỏ nút thủ công.** Tiêu chí tự động chuyển trạng thái khi đủ điều kiện. |
| **Yêu cầu Bổ sung (Supplement)** | Nút mở modal -> Chọn tiêu chí -> Chọn yêu cầu -> Chọn mục -> Tích 4 quyền -> Nhập hạn chót -> Nhập nội dung -> Bấm gửi | Gửi thông báo cần bổ sung minh chứng | **QUÁ TẢI (8 thao tác).** Modal che khuất hồ sơ, buộc chọn lại phạm vi mà con người vừa nhấp vào. | **Tích hợp ngữ cảnh (Contextual Drawer):** Bấm "Yêu cầu bổ sung" ngay tại dòng kê khai -> Tự động khóa phạm vi -> Nhập lưu ý -> Gửi (2 clicks). |
| **Ghi chú nội bộ (Internal Notes)**| Nút mở Inspector bên phải -> Tìm tab Ghi chú -> Bấm Sửa -> Gõ -> Bấm Lưu | Ghi nhớ cho đồng nghiệp xem | **RỜI RẠC.** Buộc người dùng rời mắt khỏi dòng kê khai đang đọc. | **Inline Note Box:** Ô ghi chú nhanh thu gọn ngay dưới dòng kê khai. |
| **Đợt chuyển giao trường (Batch)** | Tích chọn thủ công từng hồ sơ -> Đính kèm Quyết định -> Xác nhận | Đóng gói hồ sơ chuyển Thành phố | Quy trình hành chính bắt buộc. | **Bulk-select tiện lợi:** Cung cấp nút chọn nhanh các hồ sơ đã có kết luận đề xuất để cán bộ kiểm tra trước khi ký chuyển. |

---

## 3. MỤC TIÊU CẮT GIẢM THAO TÁC THEO 8 KỊCH BẢN CHUẨN TẮC (SCENARIOS A–H)

Bảng dưới đây so sánh số lượng thao tác đo được từ mã nguồn hiện tại `[SOURCE-DERIVED ESTIMATE]` với Chỉ tiêu thiết kế tinh giản `[TARGET]`:

```
+----------------------------------------------------------------------------------------------------+
| KỊCH BẢN MÔ PHỎNG (SCENARIO)                           | HIỆN TẠI (Ước tính) | MỤC TIÊU LEAN (Target) |
+----------------------------------------------------------------------------------------------------+
| Kịch bản A: Thẩm định hồ sơ chuẩn (Đạt cả 5 tiêu chí)   |        42 clicks    |        11 clicks       |
| Kịch bản B: Hồ sơ có 1 mục đạo đức cần bổ sung          |        28 clicks    |         8 clicks       |
| Kịch bản C: Hồ sơ có nhóm lựa chọn (AT_LEAST_N thể lực)  |        18 clicks    |         3 clicks       |
| Kịch bản D: Sinh viên tiếp nhận và nộp lại minh chứng   |        14 clicks    |         5 clicks       |
| Kịch bản E: Trường tổng hợp và chuyển giao (kèm UDN Hub)|        31 clicks    |         9 clicks       |
| Kịch bản F: Thành phố thẩm định hồ sơ trường chuyển lên  |        36 clicks    |        11 clicks       |
| Kịch bản G: Tập thể nộp hồ sơ & Thành phố xét TT01-TT04 |        24 clicks    |         8 clicks       |
| Kịch bản H: Hội đồng thẩm tra và ban hành công nhận     |        19 clicks    |         6 clicks       |
+----------------------------------------------------------------------------------------------------+
| TRUNG BÌNH ƯỚC TÍNH                                     |       26.5 clicks   |        7.6 clicks      |
| TỶ LỆ CẮT GIẢM MỤC TIÊU (DESIGN TARGET REDUCTION)       |             MỤC TIÊU: ~70%                   |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. CHI TIẾT ĐƯỜNG DẪN TƯƠNG TÁC TỪNG KỊCH BẢN (INTERACTION PATH ANALYSIS)

### Kịch bản A: Thẩm định hồ sơ chuẩn (Đạt cả 5 tiêu chí, 10 mục kê khai)
- **Đường dẫn hiện tại (42 clicks - Ước tính từ mã nguồn):**
  1. Mở hồ sơ từ hàng đợi (1 click).
  2. Với mỗi tiêu chí (5 tiêu chí): Mở tệp minh chứng (1) -> Đánh giá tệp (2) -> Đóng xem tệp (1) -> Bấm Đạt mục 1 (1) -> Bấm Hoàn tất mục 1 (1) -> Lặp lại mục 2 (2) -> Bấm Hoàn tất Tiêu chí (1) => ~8 clicks/tiêu chí.
  3. Bấm Hoàn tất thẩm định Cán bộ trên Header (1 click).
- **Mục tiêu thiết kế Lean UX (11 clicks - Target):**
  1. Mở hồ sơ từ hàng đợi (1 click).
  2. Minh chứng mở trực quan song song; bấm trực tiếp [Đạt] trên 10 dòng kê khai (10 clicks).
  3. Hệ thống tự động tính toán tiến độ 5 tiêu chí hoàn tất Đạt (0 click).
  4. Trạng thái hiển thị rõ: "Hoàn tất thẩm định: Đủ điều kiện sơ bộ (5/5)".

---

### Kịch bản B: Hồ sơ có 1 mục Đạo đức cần bổ sung minh chứng
- **Đường dẫn hiện tại (28 clicks):**
  1. Mở hồ sơ (1 click) -> Xem mục ĐRL -> Bấm nút "Yêu cầu bổ sung" trên toolbar (1 click).
  2. Modal che khuất màn hình: Chọn Tiêu chí (2 clicks) -> Chọn Yêu cầu (2) -> Chọn Mục (2) -> Tích quyền cho phép (1) -> Chọn hạn chót (3) -> Nhập nội dung (1) -> Bấm Gửi (1).
  3. Duyệt tiếp các mục khác (14 clicks).
- **Mục tiêu thiết kế Lean UX (8 clicks - Target):**
  1. Mở hồ sơ (1 click) -> Ngay tại dòng ĐRL, bấm nút [Yêu cầu bổ sung] (1 click).
  2. Ngăn trượt mở bên cạnh (không che hồ sơ), tự khóa phạm vi ĐRL; hạn chót điền theo quy chế hoặc cán bộ chọn; nhập lưu ý (1 focus + gõ) -> Bấm Gửi (1 click).
  3. Duyệt các mục còn lại của hồ sơ (4 clicks).

---

### Kịch bản C: Hồ sơ có nhóm lựa chọn (`AT_LEAST_N` - Thể lực tốt)
- **Hiện trạng:** Sinh viên đạt danh hiệu "Sinh viên khỏe". Mục "Giải thể thao" để trống.
  - Cán bộ thấy mục Thể thao báo màu xám, băn khoăn mở ra kiểm tra -> Đóng lại (18 clicks toàn tiêu chí).
- **Mục tiêu thiết kế Lean UX (3 clicks - Target):**
  - Cán bộ bấm [Đạt] tại mục "Sinh viên khỏe" (1 click).
  - Mục "Giải thể thao" hiển thị nhãn mềm thanh nhã: `(Phương án khác - Chưa kê khai)`.
  - Tiêu chí Thể lực tự động hoàn tất Đạt (0 click).

---

### Kịch bản E: Cán bộ Trường tổng hợp và ký chuyển giao lên Thành phố (Kèm UDN Hub)
- **Đường dẫn hiện tại (31 clicks):**
  - Tích chọn thủ công từng hồ sơ trong danh sách -> Chuyển tab Đợt chuyển -> Tạo đợt -> Mở modal nhập thông tin QĐ -> Tải tệp -> Xác nhận 2 lần.
- **Mục tiêu thiết kế Lean UX (9 clicks - Target):**
  1. Mở màn hình Đợt chuyển giao (1 click).
  2. Xem bảng phân rã thống kê 8 trường thành viên ĐHĐN (hoặc toàn trường với trường độc lập).
  3. Bấm tiện ích "Chọn các hồ sơ được đề xuất" -> Kiểm tra danh sách đã chọn (2 clicks).
  4. Nhập số Quyết định đề xuất & đính kèm tệp PDF duy nhất (4 clicks).
  5. Bấm [Ký chuyển danh sách lên Thành phố] -> Xác nhận bằng popover an toàn (2 clicks).

---

## 5. KẾT LUẬN KIỂM TOÁN THAO TÁC

Cắt giảm thao tác trong Lean UX được xây dựng trên nguyên tắc **loại bỏ các nút xác nhận trung gian lặp lại** và **tận dụng ngữ cảnh hiển thị sẵn có**, bảo toàn 100% quyền kiểm tra, phán quyết và ký duyệt chính thức của con người.
