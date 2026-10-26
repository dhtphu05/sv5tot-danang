# LEAN-0.1: MA TRẬN BIỂU MẪU KÊ KHAI VÀ QUY CHUẨN THÔNG TIN
## (Declaration Form Matrix: Field-by-Field Audit & Progressive Disclosure Design)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Phạm vi áp dụng:** 5 Tiêu chuẩn Cá nhân ("Sinh viên 5 tốt") và 4 Tiêu chuẩn Tập thể ("Tập thể Sinh viên 5 tốt") Niên khóa 2025–2026.  
**Căn cứ pháp lý:** Quy chế xét chọn danh hiệu "Sinh viên 5 tốt" và "Tập thể Sinh viên 5 tốt" TP. Đà Nẵng năm học 2025–2026.

---

## 1. NGUYÊN TẮC THIẾT KẾ BIỂU MẪU TINH GỌN (LEAN DECLARATION PRINCIPLES)

1. **Hiển thị lũy tiến (Progressive Disclosure):** Không bắt buộc sinh viên điền vào các mục mà họ không đăng ký. Các mục thuộc nhóm lựa chọn (`AT_LEAST_N` hoặc `OPTIONAL`) chỉ mở rộng các trường nhập khi sinh viên tích chọn hoặc chọn phương án đó.
2. **Không báo lỗi giả định (Zero False Missing Flags):** Khi sinh viên đã thỏa mãn một phương án hợp lệ trong nhóm điều kiện lựa chọn (ví dụ: đã chọn "Sinh viên khỏe"), các phương án còn lại (như "Chứng nhận giải thể thao") được đánh dấu là `(Phương án khác - Chưa kê khai)`, tuyệt đối không đánh dấu màu đỏ hoặc cảnh báo "Chưa hoàn thành".
3. **Bảo tồn các kê khai tự nguyện (Preserve Voluntary Submissions):** Sinh viên có quyền nộp nhiều hơn 1 phương án hoặc nộp nhiều thành tích trong cùng một yêu cầu để làm đẹp hồ sơ thi đua. Hệ thống bảo toàn 100% các dữ liệu này và minh chứng đi kèm; cán bộ có thể xem hoặc bỏ qua nếu ngưỡng tối thiểu đã đạt.
4. **Đối chiếu số liệu một lần duy nhất (Single Source of Truth):** Với hồ sơ Tập thể, số lượng tổng thành viên (`totalMembers`) tại TT02 được tự động dùng làm mẫu số chuẩn cho TT03 để tính tỷ lệ % đạt SV5T, tránh việc sinh viên phải nhập đi nhập lại một con số ở hai mục khác nhau.
5. **Gắn liền Minh chứng và Kê khai:** Mỗi dòng kê khai gắn trực tiếp với 1 hoặc nhiều tệp minh chứng (PDF, JPG, PNG).

---

## 2. MA TRẬN CHI TIẾT 5 TIÊU CHÍ CÁ NHÂN (INDIVIDUAL TRACK)

### 2.1 Tiêu chí 1: Đạo đức tốt (Ethics)
*Tệp định nghĩa: `src/demo/fixtures/criteriaDefinitions.ts` (L70–L160) `[VERIFIED IN SOURCE]`*

| Mã yêu cầu | Tên tiêu chuẩn thành phần | Loại nhóm điều kiện | Danh sách trường nhập liệu (Fields) | Loại dữ liệu | Ràng buộc kiểm thực (Validation Thresholds) | Thiết kế hiển thị Lean UX |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **TC1.1** | Điểm rèn luyện cả năm học | `ALL_REQUIRED` | - Điểm rèn luyện (ĐRL)<br>- Năm học áp dụng<br>- Tệp minh chứng scan bảng điểm/giấy xác nhận | Number (Float)<br>Select<br>File (PDF/Image) | - ĐRL >= 80 điểm (thang 100)<br>- Đính kèm bắt buộc >= 1 tệp | Ô nhập số lớn, tự động hiển thị xếp loại (Xuất sắc / Tốt). |
| **TC1.2** | Không vi phạm pháp luật và quy chế | `ALL_REQUIRED` | - Cam kết không vi phạm<br>- Giấy xác nhận của Khoa/Trường (hoặc tích hợp trong ĐRL) | Checkbox / Text<br>File (Tùy chọn nếu ĐRL đã có) | - Giá trị boolean bắt buộc `true`<br>- Tệp minh chứng có thể kế thừa từ TC1.1 | Checkbox xác nhận cam kết; ghi chú rõ "Được chứng minh đồng thời qua Bảng điểm rèn luyện". |
| **TC1.3** | Hoạt động bồi dưỡng đạo đức, tư tưởng | `AT_LEAST_N` (Chọn ít nhất 1 trong 4) | - Hình thức tham gia (Học tập NQ, Đoàn viên ưu tú, Thi tìm hiểu Lịch sử/Tư tưởng, CLB Lý luận trẻ)<br>- Tên chương trình/chứng nhận<br>- Ngày cấp / thời gian<br>- Minh chứng giấy chứng nhận | Select<br>Text<br>Date (DD/MM/YYYY)<br>File (PDF/Image) | - Chọn >= 1 hình thức<br>- Cho phép nộp nhiều hình thức tự nguyện | Dropdown chọn hình thức trước -> Chỉ bung các ô nhập liệu của hình thức sinh viên chọn. |

---

### 2.2 Tiêu chí 2: Học tập tốt (Academic)
*Tệp định nghĩa: `src/demo/fixtures/criteriaDefinitions.ts` (L161–L280) `[VERIFIED IN SOURCE]`*

| Mã yêu cầu | Tên tiêu chuẩn thành phần | Loại nhóm điều kiện | Danh sách trường nhập liệu (Fields) | Loại dữ liệu | Ràng buộc kiểm thực (Validation Thresholds) | Thiết kế hiển thị Lean UX |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **TC2.1** | Điểm trung bình học tập cả năm | `ALL_REQUIRED` | - Điểm TBHT (thang 4 hoặc 10)<br>- Hệ điểm lựa chọn<br>- Tệp bảng điểm chính thức | Number (Float)<br>Radio (Thang 4 / Thang 10)<br>File (PDF) | - Thang 4: >= 3.2 (hoặc >= 3.0 với SV năm cuối/đặc thù theo quy chế)<br>- Thang 10: >= 8.0<br>- Bắt buộc tệp minh chứng | Chuyển đổi thang điểm trực quan; tự động báo đạt/chưa đạt theo ngưỡng quy định. |
| **TC2.2** | Nghiên cứu khoa học / Học thuật | `AT_LEAST_N` (Chọn ít nhất 1 trong 3) | - Hình thức (Đề tài NCKH, Bài báo tạp chí/hội thảo, Giải thưởng học thuật sinh viên)<br>- Tên công trình / cuộc thi<br>- Cấp quản lý (Trường, ĐHĐN, Thành phố, Quốc gia)<br>- Quyết định nghiệm thu/giấy khen | Select<br>Text<br>Select<br>File (PDF/Image) | - Đề tài nghiệm thu từ loại Đạt trở lên<br>- Hoặc bài báo đã đăng/nhận đăng<br>- Hoặc giải thưởng từ giải Ba/Khuyến khích trở lên | Thẻ chọn hình thức (Radio Cards). Cho phép nộp nhiều đề tài; chỉ cần 1 đề tài đạt chuẩn là yêu cầu ĐẠT. |

---

### 2.3 Tiêu chí 3: Thể lực tốt (Physical)
*Tệp định nghĩa: `src/demo/fixtures/criteriaDefinitions.ts` (L281–L370) `[VERIFIED IN SOURCE]`*

| Mã yêu cầu | Tên tiêu chuẩn thành phần | Loại nhóm điều kiện | Danh sách trường nhập liệu (Fields) | Loại dữ liệu | Ràng buộc kiểm thực (Validation Thresholds) | Thiết kế hiển thị Lean UX |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **TC3.1** | Đạt danh hiệu "Sinh viên khỏe" | `AT_LEAST_N` (Phương án 1) | - Ngày kiểm tra tiêu chuẩn<br>- Đơn vị tổ chức kiểm tra<br>- Giấy chứng nhận Sinh viên khỏe | Date<br>Text<br>File | - Cấp bởi HSV hoặc Bộ môn GDTC cấp Trường trở lên | Tùy chọn 1-click. Tải tệp và điền ngày cấp. |
| **TC3.2** | Giải thưởng / Chứng nhận thể thao | `AT_LEAST_N` (Phương án 2) | - Tên giải đấu thể thao<br>- Môn thi đấu<br>- Cấp tổ chức (Trường, ĐHĐN, Thành phố...)<br>- Giấy khen / Huy chương | Text<br>Text<br>Select<br>File | - Đạt từ giải Ba / Khuyến khích hoặc tham gia VĐV chính thức theo quy chế | Thu gọn lại khi sinh viên đã chọn TC3.1. Có nhãn: `(Phương án khác - Chưa kê khai)`. Sinh viên vẫn có quyền nộp nếu muốn. |

---

### 2.4 Tiêu chí 4: Tình nguyện tốt (Volunteer)
*Tệp định nghĩa: `src/demo/fixtures/criteriaDefinitions.ts` (L371–L510) `[VERIFIED IN SOURCE]`*

| Mã yêu cầu | Tên tiêu chuẩn thành phần | Loại nhóm điều kiện | Danh sách trường nhập liệu (Fields) | Loại dữ liệu | Ràng buộc kiểm thực (Validation Thresholds) | Thiết kế hiển thị Lean UX |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **TC4.1** | Chiến dịch tình nguyện lớn (Mùa hè xanh, Tiếp sức mùa thi...) | `AT_LEAST_N` (Ít nhất 1 trong 3 hình thức) | - Tên chiến dịch / hoạt động<br>- Thời gian tham gia<br>- Vai trò / nhiệm vụ<br>- Giấy chứng nhận / Giấy khen | Text<br>Date range<br>Text<br>File | - Tham gia tối thiểu 2.5 ngày hoặc hoàn thành trọn vẹn chiến dịch | Danh sách kê khai linh hoạt (Repeater). |
| **TC4.2** | Hiến máu tình nguyện | `AT_LEAST_N` (Phương án thay thế) | - Số lần hiến máu trong năm học<br>- Ngày hiến máu gần nhất<br>- Giấy chứng nhận hiến máu | Number (Integer)<br>Date<br>File | - Tối thiểu 1 lần trong năm học xét chọn (tương đương 1 ngày tình nguyện quy đổi) | Ô nhập số lần hiến máu nhanh gọn kèm tệp chụp Giấy chứng nhận. |
| **TC4.3** | Hoạt động vì cộng đồng thường xuyên | `AT_LEAST_N` (Phương án thay thế) | - Tên hoạt động từ thiện/cộng đồng<br>- Đơn vị chủ trì<br>- Giấy chứng nhận/xác nhận | Text<br>Text<br>File | - Có xác nhận của đơn vị tổ chức | Thu gọn hiển thị trừ khi sinh viên chọn hình thức này. |

---

### 2.5 Tiêu chí 5: Hội nhập tốt (Integration)
*Tệp định nghĩa: `src/demo/fixtures/criteriaDefinitions.ts` (L511–L690) `[VERIFIED IN SOURCE]`*

| Mã yêu cầu | Tên tiêu chuẩn thành phần | Loại nhóm điều kiện | Danh sách trường nhập liệu (Fields) | Loại dữ liệu | Ràng buộc kiểm thực (Validation Thresholds) | Thiết kế hiển thị Lean UX |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **TC5.1** | Chứng chỉ / Năng lực Ngoại ngữ | `AT_LEAST_N` (Phương án 1) | - Loại chứng chỉ (TOEIC, IELTS, TOEFL, VSTEP, Tiếng Pháp, Tiếng Trung...)<br>- Điểm số / Bậc đạt được<br>- Ngày cấp chứng chỉ<br>- Bản scan chứng chỉ | Select<br>Text / Number<br>Date<br>File (PDF/Image) | - TOEIC >= 500, IELTS >= 5.0, VSTEP B1 hoặc tương đương theo khung 6 bậc VN | Bộ chọn chứng chỉ thông minh: chọn TOEIC -> gợi ý 500; chọn IELTS -> gợi ý 5.0. |
| **TC5.2** | Hoạt động giao lưu quốc tế / Kỹ năng hội nhập | `AT_LEAST_N` (Phương án 2) | - Tên chương trình giao lưu / hội thảo quốc tế<br>- Quốc gia / Đơn vị tổ chức<br>- Thời gian tham gia<br>- Giấy chứng nhận tham gia | Text<br>Text<br>Date<br>File | - Có yếu tố giao lưu quốc tế hoặc hoàn thành khóa kỹ năng hội nhập được HSV công nhận | Phương án thay thế hợp lệ; không bắt buộc nếu đã có chứng chỉ ngoại ngữ. |

---

## 3. MA TRẬN 4 TIÊU CHUẨN TẬP THỂ (COLLECTIVE TRACK - TT01 ĐẾN TT04)

*Tệp định nghĩa: `src/staff/collectiveTypes.ts` (L41–L162) `[VERIFIED IN SOURCE]`*

| Tiêu chuẩn | Tên quy định | Nhóm điều kiện | Danh sách trường nhập liệu cốt lõi | Nguồn dữ liệu & Ràng buộc tính toán | Giải pháp Lean UX |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **TT01** | Đã đạt danh hiệu "Tập thể Sinh viên 5 tốt" cấp Trường | Điều kiện tiên quyết (Prerequisite) | - Số quyết định công nhận cấp trường<br>- Ngày ban hành quyết định<br>- Đơn vị ban hành (HSV Trường/Ban Giám hiệu)<br>- Tệp scan Quyết định công nhận | Bắt buộc có quyết định và tệp minh chứng đính kèm. | Điền số Quyết định và kéo thả tệp PDF. Tự động kiểm tra niên khóa công nhận. |
| **TT02** | 100% sinh viên tham gia phong trào Sinh viên 5 tốt | Tỷ lệ bắt buộc: 100% | - Tổng số sinh viên tập thể (`totalMembers`)<br>- Số sinh viên đăng ký tham gia phong trào (`participatingCount`)<br>- Ngày chốt danh sách (`censusDate`)<br>- Danh sách sinh viên chi tiết (họ tên, MSSV, lớp) | Tỷ lệ tính tự động: `participatingCount / totalMembers == 1.0` (100%). | Nhập 2 con số; cho phép tải tệp Excel danh sách thành viên (nhập liệu có cấu trúc). |
| **TT03** | Ít nhất 20% thành viên đạt SV5T cấp Trường | Ngưỡng yêu cầu: >= 20% | - Số thành viên đạt danh hiệu SV5T cấp trường (`recognizedCount`)<br>- Số Quyết định công nhận cá nhân của trường<br>- Danh sách trích ngang thành viên đạt | Tỷ lệ tính tự động dựa trên mẫu số của TT02: `recognizedCount / TT02.totalMembers >= 0.20`. | Không bắt nhập lại tổng sĩ số. Hiển thị ngay thanh tiến độ % (ví dụ: 12/40 sinh viên = 30% -> Đạt màu xanh lá). |
| **TT04** | Không có sinh viên vi phạm pháp luật và quy chế | Điều kiện loại trừ: 0 vi phạm | - Xác nhận của Khoa/Đoàn trường (`noViolationsConfirmed`)<br>- Số văn bản xác nhận<br>- Tệp công văn / biên bản xác nhận | Bắt buộc 100% không có trường hợp vi phạm kỷ luật từ khiển trách trở lên. | Nút cam kết 1 chạm kèm tệp scan xác nhận của Ban Chủ nhiệm Khoa hoặc Đoàn trường. |

---

## 4. PHÂN ĐỊNH CHỈ TIÊU THIẾT KẾ VS DỮ LIỆU ĐO ĐẠC THỰC NGHIỆM

```
+-----------------------------------------------------------------------------------------+
| CHỈ SỐ BIỂU MẪU KÊ KHAI                           | HIỆN TRẠNG (Mã nguồn) | MỤC TIÊU THIẾT KẾ (Target) |
+-----------------------------------------------------------------------------------------+
| Số trường nhìn thấy ngay từ đầu                    | 38 trường (dàn trải) | 14 trường (lũy tiến)      |
| Cảnh báo đỏ đối với phương án không chọn          | CÓ (gây bối rối)     | KHÔNG (màu xám nhã)        |
| Nhập lại sĩ số tập thể giữa TT02 và TT03          | CÓ (trùng lặp)       | KHÔNG (Kế thừa tự động)    |
| Thời gian hoàn thành biểu mẫu                     | Chưa đo thực nghiệm  | Mục tiêu: Rút ngắn tối đa  |
+-----------------------------------------------------------------------------------------+
```
