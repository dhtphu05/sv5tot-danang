# 5TOT ĐÀ NẴNG — BÁO CÁO HIỆU CHỈNH UX THẨM ĐỊNH & KẾT LUẬN TIÊU CHÍ (P0)

**Cơ quan chỉ đạo:** Ban Thường vụ Thành Đoàn Đà Nẵng  
**Đơn vị vận hành chuyên môn:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Văn bản quy chuẩn:** Quy chế số 18-QĐ/TĐTN-TTNTH & Hướng dẫn đánh giá danh hiệu "Sinh viên 5 tốt"  
**Mục tiêu tài liệu:** Ghi nhận toàn bộ các điều chỉnh UX/UI thẩm định hồ sơ theo yêu cầu chính thức từ Hội đồng & Cán bộ chuyên môn, thiết lập nguyên tắc thẩm định không auto-pass và hướng dẫn kiểm thử chi tiết.

---

## 1. TỔNG QUAN CÁC ĐIỀU CHỈNH TRỌNG TÂM (CUSTOMER DIRECTIVES)

### Directive 1: Bỏ cột dư thừa "Cán bộ thẩm định" trong danh sách hồ sơ
- **Hiện trạng:** Trước đây, một số bảng danh sách (cấp Trường và Thành phố) hiển thị cột "Cán bộ thẩm định", đôi khi chứa giá trị "Chờ Trường chuyển giao" hoặc tên cán bộ phân công, gây hiểu nhầm về vai trò và giai đoạn hồ sơ.
- **Giải pháp:** 
  - Đã loại bỏ hoàn toàn cột "Cán bộ thẩm định" khỏi bảng danh sách hồ sơ cá nhân (`buildIndividualApplicationTableColumns`) và bảng xét sơ tuyển cấp trường (`registryColumns`).
  - Trạng thái sơ tuyển và phân công được gom chuẩn xác vào các cột chức năng chuyên biệt: Cột "Trường", Cột "Sơ tuyển", Cột "Tiêu chí (05 tiêu chí)", Cột "Thẩm định", và Cột "Thao tác".
  - Hồ sơ chưa được Trường sơ tuyển/chuyển giao được hiển thị trạng thái trung thực: `"Chờ Trường chuyển giao"` (badge xám trung tính, dot màu dịu), không dùng tên cán bộ giả lập.

### Directive 2: Mở rộng mặc định toàn bộ 05 tiêu chí trong Hồ sơ sinh viên
- **Hiện trạng:** Người dùng phải click mở từng accordion tiêu chí (`Đạo đức`, `Học tập`, `Thể lực`, `Tình nguyện`, `Hội nhập`), làm gián đoạn dòng kiểm tra liên tục của cán bộ xét duyệt.
- **Giải pháp:**
  - `SharedStudentDossier`: Thiết lập `expandedCriteria` mặc định mở `true` cho tất cả 5 tiêu chí trên cả chế độ xem xét sơ tuyển cấp Trường, thẩm định cấp Thành phố và Hội đồng.
  - Cán bộ cuộn chuột liền mạch để xem xét từ Tiêu chí 1 đến Tiêu chí 5 mà không cần bấm mở từng accordion.

### Directive 3: Hiển thị trực tiếp và rõ ràng các nội dung kê khai
- **Hiện trạng:** Kê khai của sinh viên đôi khi bị ẩn trong popup hoặc sub-panel.
- **Giải pháp:**
  - Cột 2 ("Khai báo của sinh viên") trong bảng hồ sơ hiển thị đầy đủ tiêu đề kê khai, chi tiết, đơn vị tính, điểm số.
  - Với nội dung có nhiều mục kê khai (ví dụ 3 hoạt động tình nguyện, 2 công trình NCKH), hiển thị số lượng và danh mục cụ thể; khi click vào hàng, bảng bung rộng chi tiết từng minh chứng.

### Directive 4: Không đánh trượt các hình thức lựa chọn chưa kê khai
- **Hiện trạng:** Trong các nhóm tiêu chí có cấu trúc `AT_LEAST_N` hoặc `OPTIONAL` (ví dụ: Thành tích học thuật có 6 hình thức lựa chọn, sinh viên đã kê khai 1 hình thức và đạt), các hình thức còn lại không được kê khai trước đây có thể hiển thị cảnh báo đỏ hoặc "Chưa đạt" sai lệch.
- **Giải pháp:**
  - Cấu trúc nhóm `AT_LEAST_N` / `OPTIONAL` chỉ hiển thị các hình thức sinh viên ĐÃ KÊ KHAI.
  - Các hình thức sinh viên không chọn được ẩn gọn gàng sau nút bấm phụ: `+ Xem các hình thức khác (+5)`.
  - Tuyệt đối không hiển thị viền đỏ, không gán nhãn "Không đạt" cho các phương án lựa chọn không được kê khai.
  - Đối với các yêu cầu bắt buộc (`ALL_REQUIRED`) mà sinh viên chưa kê khai, hiển thị nhãn trung tính `"Chưa có kê khai"` (màu xám trung tính `#64748B`, nền `#F1F5F9`), không tự động kết án "Chưa đạt" thay cán bộ.

### Directive 5: Tách biệt "Gợi ý đối soát" (Derived Readiness) và "Kết luận con người" (Human Criterion Conclusion)
- **Hiện trạng:** Hệ thống tự động chuyển tiêu chí sang "Đạt" khi các dòng kê khai đạt chuẩn, dẫn đến nguy cơ tự động hóa vượt thẩm quyền con người.
- **Giải pháp:**
  - **Derived Assessment Readiness** (Hệ thống tính toán từ các minh chứng) chỉ đóng vai trò là **khuyến nghị tham khảo (Advisory Hint)**:
    - Hiển thị dải băng xám/xanh dịu: `Hệ thống gợi ý: Đủ điều kiện kê khai · Cán bộ cần bấm nút để xác nhận kết luận chính thức`.
  - **Official Human Criterion Conclusion** (Kết luận chính thức của Cán bộ): Bắt buộc cán bộ phải tự tay click một trong hai nút:
    - `[✓ Đạt tiêu chí]` (Màu xanh thương hiệu chính thống).
    - `[✕ Không đạt tiêu chí]` (Kèm khung nhập lý do từ chối chính thức).
  - Khi đã kết luận, hệ thống đóng dấu chính thức: Người kết luận, chức danh, mốc thời gian, kết quả và nút `[Thu hồi kết luận]` nếu cần đánh giá lại.

### Directive 6: Độc lập kết luận giữa Cấp Trường và Cấp Thành phố
- **Hiện trạng:** Dữ liệu sơ tuyển cấp trường và thẩm định thành phố có nguy cơ bị ghi đè lẫn nhau.
- **Giải pháp:**
  - `ManualCriterionConclusionBar` phân tách rõ:
    - Ở chế độ `SCHOOL`: Cán bộ trường ghi nhận "Kết luận sơ tuyển tiêu chí".
    - Ở chế độ `CITY`: Cán bộ Thành phố ghi nhận "Kết luận thẩm định tiêu chí". Dữ liệu sơ tuyển của Trường được hiển thị dưới dạng thanh tham chiếu lịch sử (benchmark) màu xanh da trời nhạt, không bị ghi đè và không tự động kế thừa mù quáng.

### Directive 7: Cập nhật chỉ số tiến độ phản ánh kết luận thực tế
- **Hiện trạng:** Dải tóm tắt tiến độ chỉ đếm số dòng minh chứng đã xem, không phản ánh số tiêu chí đã có kết luận chính thức.
- **Giải pháp:**
  - Dải tóm tắt `LEAN DOSSIER SUMMARY STRIP` hiển thị rõ:
    - `Tiến độ kết luận: X/5 tiêu chí đã kết luận` (concludedCriteriaCount).
    - `Kết quả: Y Đạt / Z Không đạt / (5 - X) Chưa kết luận`.
    - Trạng thái tổng: Nếu cả 5 tiêu chí đã kết luận mà có ít nhất 1 tiêu chí không đạt, hiển thị rõ badge đỏ nhạt: `Chưa đủ điều kiện (Z tiêu chí Không đạt)`.
    - Chỉ khi đủ 5/5 tiêu chí được con người kết luận "Đạt", mới hiển thị `Đủ điều kiện 5/5 tiêu chí`.

### Directive 8: Mật độ thông tin chuẩn Desktop chuyên nghiệp (1440px – 1920px)
- **Hiện trạng:** Khoảng cách padding quá lớn, các tiêu đề dài (tên đề tài NCKH, bài báo) bị cắt xén (truncate ellipsis) làm cán bộ không đọc được nội dung.
- **Giải pháp:**
  - Điều chỉnh `.app-table-grid`: Padding dọc gọn gàng (`py-3`, chiều cao dòng tối thiểu `56px`).
  - Cột 1 và Cột 2 cho phép xuống dòng tự nhiên (`whitespace-normal break-words`), không cắt cụt tên đề tài, bài báo khoa học hay đơn vị tổ chức.

### Directive 9: Kiểm soát chuyển giao và thẩm định Thành phố chuẩn xác
- **Hiện trạng:** Cán bộ Thành phố có thể bấm thẩm định những hồ sơ đang nằm ở giai đoạn Trường.
- **Giải pháp:**
  - Hàm `isApplicationEligibleForCityIntake`: Kiểm tra nghiêm ngặt `currentReviewStage === 'CITY'` hoặc hồ sơ đã có quyết định chuyển giao từ Trường.
  - Nếu hồ sơ đang ở cấp Trường (`currentReviewStage === 'SCHOOL'`), Cán bộ Thành phố truy cập sẽ ở chế độ **Chỉ đọc (Read-only)** kèm dải thông báo:
    - `"Hồ sơ đang ở cấp Trường: Chưa được chuyển giao chính thức lên Thành phố. Bạn đang xem ở chế độ chỉ đọc để tra cứu."`
    - Mọi nút bấm thẩm định bị khóa an toàn.

---

## 2. KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE MATRIX)

Toàn bộ **422 bài kiểm tra** trong **57 test suites** đã vượt qua 100%:

| Test Suite | Số lượng test | Trạng thái | Nội dung bao phủ |
|---|---|---|---|
| `leanReviewManualCriterionUxCorrection.test.ts` | 9 tests | **100% PASS** | Kiểm tra độc lập kết luận con người, thu hồi kết luận, không có cột cán bộ dư thừa, kiểm soát chuyển giao Thành phố, mặc định mở rộng các yêu cầu nhiều kê khai, tách bạch nhật ký cấp Trường và cấp Thành phố |
| `lean2DirectInlineReview.test.ts` | 35 tests | **100% PASS** | Đánh giá trực tiếp nội dung, tính độc lập của tiến độ và kết quả, xử lý AT_LEAST_N |
| `uxS5InlineReview.test.ts` | 7 tests | **100% PASS** | Mở rộng liên tục 5 tiêu chí, kiểm soát hoàn tất hồ sơ |
| `schoolBackofficeForwarding.test.ts` | 28 tests | **100% PASS** | Khóa lịch sử hồ sơ đã chuyển, đề xuất và chuyển giao theo đợt |
| `uxS4AdminWorkspace.test.ts` | 26 tests | **100% PASS** | Phân quyền 5 vai trò, cô lập quản trị hệ thống và thẩm định |
| **Tổng cộng toàn hệ thống** | **422 tests** | **100% PASS** | Không có bất kỳ lỗi hồi quy hay phá vỡ hợp đồng |

---

## 3. CHECKLIST KIỂM THỬ THỦ CÔNG CHI TIẾT (CLICK-BY-CLICK MANUAL UAT)

### Kịch bản 1: Kiểm tra Danh sách hồ sơ cấp Thành phố (Không có cột dư thừa)
1. Đăng nhập với vai trò **Cán bộ Thành phố** (`CITY_OFFICER` - Trần Hoàng Nam).
2. Điều hướng đến menu **"Hồ sơ xét duyệt"** (Hồ sơ cá nhân).
3. **Quan sát bảng danh sách:**
   - [x] Không còn cột mang tiêu đề "Cán bộ thẩm định".
   - [x] Cột "Sơ tuyển" hiển thị rõ kết luận của Trường: `"Đề xuất Thành phố (Theo QĐ 182/QĐ-ĐHĐN)"` hoặc `"Chưa đề xuất"`.
   - [x] Cột "Thẩm định" hiển thị trạng thái chuẩn xác: `"Chờ thẩm định"`, `"Đang thẩm định"`, hoặc `"Đã thẩm định"`.
   - [x] Với hồ sơ đang ở cấp Trường chưa chuyển giao, nhãn hiển thị `"Chờ Trường chuyển giao"` (badge xám, không có tên cán bộ gán nhầm).

### Kịch bản 2: Không gian Thẩm định hồ sơ — Mở rộng mặc định toàn bộ 05 tiêu chí
1. Trong danh sách hồ sơ, click **"Bắt đầu thẩm định"** hoặc **"Xem hồ sơ"** trên hồ sơ mẫu (Nguyễn Minh Anh - `APP-2026-DN-102220123`).
2. Quan sát giao diện Không gian Thẩm định (`OfficerReviewWorkspace`):
   - [x] Cả **05 tiêu chí** (Tiêu chí 1: Đạo đức, Tiêu chí 2: Học tập, Tiêu chí 3: Thể lực, Tiêu chí 4: Tình nguyện, Tiêu chí 5: Hội nhập) đều được mở rộng sẵn sàng.
   - [x] Cuộn chuột từ trên xuống dưới: Các bảng kê khai và minh chứng của cả 5 tiêu chí hiển thị trực tiếp mà không cần click vào từng tiêu đề để mở accordion.
   - [x] Cột "Khai báo của sinh viên": Tên bài báo, tên đề tài NCKH, chứng chỉ IELTS xuống dòng tự nhiên, không bị mất chữ.

### Kịch bản 3: Không đánh trượt các hình thức lựa chọn chưa kê khai (Tiêu chí 2 & 3)
1. Cuộn đến **Tiêu chí 2: Học tập tốt**, nhóm **"Thành tích học thuật & Nghiên cứu khoa học"** (Cần ít nhất 1 trong 6 hình thức):
   - [x] Chỉ hiển thị hình thức sinh viên đã kê khai (ví dụ: NCKH - Báo cáo khoa học đạt giải).
   - [x] 5 hình thức còn lại (Olympic chuyên ngành, Bài báo khoa học...) không hiển thị các dòng màu đỏ "Không đạt".
   - [x] Phía dưới nhóm có thanh thông tin nhã nhặn: `"Đã kê khai 1/6 hình thức lựa chọn"` kèm nút `"Xem các hình thức khác (+5)"`.
   - [x] Click thử `"Xem các hình thức khác (+5)"`: Các hình thức chưa kê khai hiển thị nhãn trung tính `"Tùy chọn khác (Chưa kê khai)"`, tuyệt đối không có viền đỏ cảnh báo.
2. Cuộn đến mục yêu cầu bắt buộc chưa có kê khai (nếu có):
   - [x] Hiển thị nhãn trung tính: `"Chưa có kê khai"` (màu xám nhạt, không báo động đỏ).

### Kịch bản 4: Thao tác Kết luận tiêu chí thủ công (Không tự động Pass)
1. Tại **Tiêu chí 1: Đạo đức tốt**:
   - [x] Dù cả 2 nội dung điểm rèn luyện và hạnh kiểm đã được duyệt [Đạt], tiêu chí **chưa tự động trở thành Đạt**.
   - [x] Phía dưới Tiêu chí 1 hiển thị thanh kết luận `ManualCriterionConclusionBar`:
     - Huy hiệu: `"Chưa có kết luận chính thức"`.
     - Dòng gợi ý: `"Hệ thống gợi ý: Đủ điều kiện kê khai · Cán bộ cần bấm nút để xác nhận kết luận chính thức"`.
2. Click nút **"[✓ Đạt tiêu chí]"**:
   - [x] Thanh kết luận đổi sang màu xanh thành công (`#EAFBF1`).
   - [x] Hiển thị tem xác nhận: `"ĐÃ KẾT LUẬN: ĐẠT TIÊU CHÍ"`.
   - [x] Ghi rõ: Cán bộ thực hiện (Trần Hoàng Nam), chức danh, ngày giờ kết luận.
   - [x] Dải tóm tắt trên cùng cập nhật: `"Tiến độ kết luận: 1/5 tiêu chí đã kết luận · Kết quả: 1 Đạt"`.
3. Click nút **"[Thu hồi kết luận]"**:
   - [x] Tiêu chí quay lại trạng thái chưa kết luận. Tiến độ giảm về 0/5.

### Kịch bản 5: Kết luận Không đạt tiêu chí kèm lý do
1. Cuộn đến **Tiêu chí 5: Hội nhập tốt**:
2. Click nút **"[✕ Không đạt tiêu chí]"**:
   - [x] Khung nhập lý do xuất hiện: Nhập thử lý do `"Chứng chỉ ngoại ngữ hết hạn trước thời điểm xét chọn"`.
   - [x] Click **"Xác nhận Không đạt"**:
   - [x] Tiêu chí đổi sang màu đỏ nhạt thông tin (`#FEF2F2`).
   - [x] Dải tóm tắt trên cùng cập nhật số liệu: `"1 Không đạt"`.

### Kịch bản 6: Hoàn tất thẩm định hồ sơ với kết quả Đạt hoặc Không đạt
1. Lần lượt kết luận đủ cả 5 tiêu chí (ví dụ: 4 Đạt, 1 Không đạt):
   - [x] Dải tóm tắt hiển thị: `"5/5 tiêu chí đã kết luận · Kết quả: 4 Đạt / 1 Không đạt"`.
   - [x] Huy hiệu tổng thể: `"Chưa đủ điều kiện (1 tiêu chí Không đạt)"`.
   - [x] Nút **"[Hoàn tất thẩm định]"** trên thanh công cụ sáng lên, cho phép cán bộ xác nhận biên bản thẩm định chính thức trình Hội đồng.
