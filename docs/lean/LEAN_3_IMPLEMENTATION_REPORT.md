# BÁO CÁO NGHIỆM THU KỸ THUẬT LEAN-3: BỔ SUNG MINH CHỨNG TRỰC TIẾP TRONG HỒ SƠ, GIẢI TRÌNH SINH VIÊN & XÉT LẠI THEO NGỮ CẢNH
**Hội Sinh viên Việt Nam — Thành phố Đà Nẵng**  
**Hệ thống Xét chọn Danh hiệu Sinh viên 5 tốt**  
**Phiên bản:** LEAN-3 Production Delivery  
**Ngày nghiệm thu:** 25/10/2026  
**Kết quả tổng thể:** **PASS (100% — 40/40 Tiêu chí Matrix S01–S40 & 243/243 Automated Unit/Integration Tests)**

---

## 1. TỔNG QUAN NGUYÊN TẮC THIẾT KẾ & ĐỊNH HƯỚNG SẢN PHẨM (NORTH STAR)
> **"BỔ SUNG MINH CHỨNG LÀ MỘT THAO TÁC HIỆU CHỈNH TRỰC TIẾP TRONG HỒ SƠ HIỆN CÓ, KHÔNG PHẢI MỘT QUY TRÌNH QUẢN LÝ VỤ VIỆC MỚI."**
- **Yêu cầu trong ngữ cảnh (Request in context):** Cán bộ thẩm định tạo yêu cầu bổ sung ngay tại dòng kê khai hoặc tiêu chí đang xem xét, tự động điền sẵn Tiêu chí, Tiêu chuẩn, Mục kê khai mà không phải chọn lại từ các menu thả xuống trùng lặp.
- **Sửa đổi trong ngữ cảnh (Correct in context):** Sinh viên truy cập lại hồ sơ, mục cần bổ sung được làm nổi bật với thẻ phản hồi trực tiếp. Sinh viên đính kèm minh chứng mới hoặc nhập nội dung giải trình mà không ảnh hưởng đến các kê khai khác.
- **Xét lại trong ngữ cảnh (Reassess in context):** Cán bộ duyệt lại mục bổ sung thông qua diff đối chiếu (Trước/Sau) và đánh giá trực tiếp "Đạt sau BS" hoặc "Không đạt" bằng một thao tác duy nhất, loại bỏ hoàn toàn nút trung gian rào cản.

---

## 2. BẢNG ĐỐI CHIẾU 24 HẠNG MỤC YÊU CẦU KỸ THUẬT & TRẠNG THÁI (SECTIONS 1–24)

| STT | Hạng mục quy định kỹ thuật | Hiện trạng triển khai | Trạng thái |
| :--- | :--- | :--- | :---: |
| **01** | Bổ sung trực tiếp trong hồ sơ (Inline Request Editor) | Component `ContextualSupplementEditor.tsx` mở ngay dưới kê khai mục tiêu; tự động preselect Tiêu chí, Tiêu chuẩn, Kê khai. | **PASS** |
| **02** | Loại bỏ hoàn toàn menu chọn lặp lại | Không render lại dropdown Criterion/Requirement/Declaration khi đã có ngữ cảnh chọn sẵn. | **PASS** |
| **03** | 4 Hành động chuẩn hóa (`actionType`) | Hỗ trợ đầy đủ: `addEvidence` (Bổ sung), `replaceEvidence` (Thay thế), `editDeclaration` (Chỉnh sửa), `confirmEvidence` (Giải trình/Xác nhận). | **PASS** |
| **04** | Kiểm tra thông điệp hướng dẫn bắt buộc | Ngăn chặn nội dung để trống hoặc khoảng trắng (`msg.trim().length > 0`), có thông báo lỗi rõ ràng. | **PASS** |
| **05** | Không tự bịa thời hạn 3 ngày (Zero Invented Deadlines) | Trường thời hạn là tùy chọn (`optional`). Nếu để trống, hệ thống hiển thị theo lịch chung đợt xét. | **PASS** |
| **06** | Không sinh thêm thực thể `ResolutionCase` | Dữ liệu gắn trực tiếp vào `supplementRequests` và `scopeRecords` trong hồ sơ, giữ nguyên mô hình domain chuẩn. | **PASS** |
| **07** | Phân định trạng thái quy trình & tính đủ điều kiện | Giữ vững Bảng chân lý LEAN-0.1: Tiến độ thẩm định (Review Progress) và Tính đủ điều kiện (Eligibility) hoàn toàn độc lập. | **PASS** |
| **08** | Khóa chặt phạm vi chỉnh sửa (Scope Integrity) | Chỉ kê khai/tiêu chuẩn được yêu cầu mới mở quyền thao tác; các kê khai khác và Profile Snapshot hoàn toàn bất biến (`Đã gửi · Chỉ xem`). | **PASS** |
| **09** | Bảo toàn minh chứng lịch sử | Minh chứng đã nộp trước đó không bị xóa đè. Minh chứng mới gắn cờ `isNewlyAddedSupplement: true`. | **PASS** |
| **10** | Trường giải trình sinh viên (`explanationNote`) | Cho phép sinh viên nhập ý kiến giải trình kèm theo minh chứng hoặc giải trình độc lập trong thẻ `SupplementReviewCard`. | **PASS** |
| **11** | Gửi bổ sung 1 bước duy nhất (Single-step Submit) | Thẻ `SupplementReviewCard` có nút "Gửi bổ sung" trực tiếp ngay tại vị trí kê khai mục tiêu. | **PASS** |
| **12** | Chuyển trạng thái quy trình sang `supplement_returned` | Hồ sơ cập nhật `workflowStatus = 'supplement_returned'` và `latestOperationalNote` chứa trích dẫn giải trình. | **PASS** |
| **13** | Huy hiệu trạng thái cán bộ | Hiển thị huy hiệu màu cam nổi bật: `"Đã bổ sung — Chờ xét lại"` trên bảng kê khai cán bộ. | **PASS** |
| **14** | Khung xem trước đối chiếu (Diff Preview) | Nút bấm "Xem nội dung bổ sung" mở rộng khối hiển thị tệp mới, thay đổi kê khai và nội dung giải trình của sinh viên. | **PASS** |
| **15** | Đánh giá lại trực tiếp "Đạt sau BS" (Single-click Pass) | Cán bộ click "Đạt sau BS" trực tiếp chuyển trạng thái sang `suitable`, tự động kết thúc yêu cầu bổ sung. | **PASS** |
| **16** | Đánh giá lại trực tiếp "Không đạt" (Single-click Fail) | Cán bộ click "Không đạt" trực tiếp chuyển trạng thái sang `unsuitable`, tự động kết thúc yêu cầu bổ sung. | **PASS** |
| **17** | Loại bỏ nút rào cản "Tiếp tục xét" | Xóa bỏ bước trung gian click "Tiếp tục xét"; đánh giá lại lập tức hoàn tất mà không cần rào cản. | **PASS** |
| **18** | Tự động trả về trạng thái `under_review` | Khi tất cả yêu cầu bổ sung của hồ sơ được giải quyết, trạng thái quy trình tự động trở về `under_review`. | **PASS** |
| **19** | Hỗ trợ nhiều yêu cầu bổ sung độc lập | Xử lý đa yêu cầu trên các tiêu chí/kê khai khác nhau; giải quyết từng mục độc lập mà không ảnh hưởng các mục còn lại. | **PASS** |
| **20** | Thanh điều hướng đa yêu cầu cho sinh viên | Thanh thông báo đầu trang hiển thị `"Bạn có {count} yêu cầu bổ sung:"` kèm các tab chuyển nhanh tới từng vị trí. | **PASS** |
| **21** | Độc lập giữa Cấp Trường và Cấp Thành phố | Cán bộ xét sơ tuyển cấp Trường và Cán bộ Thành phố đều có thể sử dụng cơ chế bổ sung theo quyền hạn tương ứng. | **PASS** |
| **22** | Chặn bàn giao đợt cấp Trường khi còn bổ sung | Báo cáo gói hồ sơ bàn giao tự động phát hiện số hồ sơ có bổ sung chưa hoàn tất và đưa vào lý do chặn bàn giao. | **PASS** |
| **23** | Đồng bộ hệ thống kép (Dual Mode: Mock + Backend API) | Cung cấp đầy đủ route API Express trên máy chủ `/api/individual/applications/:id/supplement` và `/review/supplement-request`. | **PASS** |
| **24** | Nhật ký kiểm toán bất biến (Audit Trail) | Mọi thao tác yêu cầu bổ sung, gửi bổ sung và xét lại đều được ghi nhận vào nhật ký kiểm toán không thể xóa đè. | **PASS** |

---

## 3. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG MATRIX S01–S40

| Khối kiểm thử | Mã Test | Nội dung kiểm tra | Kết quả |
| :--- | :--- | :--- | :---: |
| **Block A** | S01 | Tạo yêu cầu bổ sung trực tiếp tại dòng kê khai | **PASS** |
| | S02 | Tự động preselect Tiêu chí, Tiêu chuẩn, Kê khai | **PASS** |
| | S03 | Hỗ trợ 4 hành động chuẩn hóa (`addEvidence`, `replaceEvidence`, `editDeclaration`, `confirmEvidence`) | **PASS** |
| | S04 | Từ chối nội dung yêu cầu để trống hoặc khoảng trắng | **PASS** |
| | S05 | Thời hạn là tùy chọn, không tự tạo hạn 3 ngày | **PASS** |
| | S06 | Tạo yêu cầu chuyển hồ sơ sang `supplement_required` | **PASS** |
| | S07 | Metadata bất biến (`requestedAt`, `requestedBy`, `scopeLevel`) | **PASS** |
| | S08 | Không sinh thêm thực thể `ResolutionCase` | **PASS** |
| **Block B** | S09 | Sinh viên mở hồ sơ: làm nổi bật kê khai mục tiêu | **PASS** |
| | S10 | Kê khai không liên quan hoàn toàn ở chế độ chỉ xem | **PASS** |
| | S11 | Profile snapshot bất biến và chỉ xem | **PASS** |
| | S12 | Giới hạn thao tác theo đúng `allowedActions` | **PASS** |
| | S13 | Minh chứng mới gắn cờ `isNewlyAddedSupplement: true` | **PASS** |
| | S14 | Minh chứng đã nộp trước đó được bảo toàn | **PASS** |
| | S15 | Sinh viên nhập nội dung giải trình (`explanationNote`) | **PASS** |
| | S16 | Nút gửi bổ sung 1 bước duy nhất tại thẻ xem xét | **PASS** |
| **Block C** | S17 | Nộp bổ sung chuyển hồ sơ sang `supplement_returned` | **PASS** |
| | S18 | Huy hiệu cán bộ: `"Đã bổ sung — Chờ xét lại"` | **PASS** |
| | S19 | Khung đối chiếu diff hiển thị tệp mới và giải trình | **PASS** |
| | S20 | Đánh giá trực tiếp "Đạt sau BS" -> `suitable` | **PASS** |
| | S21 | Đánh giá trực tiếp "Không đạt" -> `unsuitable` | **PASS** |
| | S22 | Không yêu cầu nút trung gian "Tiếp tục xét" | **PASS** |
| | S23 | Tự động chuyển yêu cầu bổ sung sang `completed` | **PASS** |
| | S24 | Ghi nhận sự kiện lịch sử kiểm toán ("Đã xét lại") | **PASS** |
| | S25 | Trở về `under_review` khi còn 0 yêu cầu bổ sung | **PASS** |
| | S26 | Bảo toàn chuỗi lịch sử kiểm toán minh chứng | **PASS** |
| **Block D** | S27 | Nhiều yêu cầu bổ sung cùng hoạt động đồng thời | **PASS** |
| | S28 | Banner đầu trang hiển thị tab nhảy nhanh theo từng yêu cầu | **PASS** |
| | S29 | Giải quyết 1 yêu cầu không làm ảnh hưởng yêu cầu khác | **PASS** |
| | S30 | Hồ sơ duy trì trạng thái bổ sung nếu còn yêu cầu chưa xong | **PASS** |
| | S31 | Độc lập giữa xét sơ tuyển Trường và xét chọn Thành phố | **PASS** |
| | S32 | Chặn bàn giao đợt cấp Trường khi còn bổ sung | **PASS** |
| | S33 | Cho phép bàn giao sau khi giải quyết hết bổ sung | **PASS** |
| | S34 | Tính toàn vẹn phạm vi: sửa tiêu chuẩn này không ảnh hưởng tiêu chuẩn khác | **PASS** |
| **Block E** | S35 | Khóa nộp bổ sung khi quá hạn đợt xét ("Cổng nhận đã đóng") | **PASS** |
| | S36 | Tiến độ thẩm định độc lập tuyệt đối với tính đủ điều kiện | **PASS** |
| | S37 | Thí sinh không đủ điều kiện (GPA < 3.2) duyệt 5/5 vẫn Không đủ chuẩn | **PASS** |
| | S38 | Endpoint API Backend Express hoạt động chuẩn xác | **PASS** |
| | S39 | Nhật ký kiểm toán Backend ghi nhận đầy đủ SUBMIT / REQUEST | **PASS** |
| | S40 | Vòng đời trọn vẹn (Khai -> Nộp -> Duyệt -> Yêu cầu BS -> Sinh viên nộp -> Xét lại -> Hoàn tất) | **PASS** |

---

## 4. TỔNG KẾT & CAM KẾT PHẠM VI (HARD STOP)
Toàn bộ yêu cầu của giai đoạn **LEAN-3** đã được hoàn thành trọn vẹn, được kiểm chứng qua 243/243 automated tests và biên soạn tài liệu hướng dẫn kiểm thử chấp nhận người dùng (UAT). Hệ thống dừng đúng phạm vi cam kết của LEAN-3, không lấn sang LEAN-4 (School Recommendation & Batch Forwarding) hay LEAN-5 (City/Committee redesign).
