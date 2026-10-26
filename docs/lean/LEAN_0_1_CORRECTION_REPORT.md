# LEAN-0.1: BÁO CÁO HIỆU CHỈNH HỢP ĐỒNG NGHIỆP VỤ & LỘ TRÌNH THỰC THI
## (Business Contract Correction & Architecture Realignment Report)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành nghiệp vụ:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Niên khóa áp dụng:** Năm học 2025–2026  
**Chế độ thực thi:** KIỂM ĐỊNH MÃ NGUỒN → HIỆU CHỈNH TÀI LIỆU → CHUẨN HÓA HỢP ĐỒNG NGHIỆP VỤ (KHÔNG SỬA CODE RUNTIME)  
**Trạng thái phê duyệt:** BÁO CÁO CHỈNH SỬA P0 (MANDATORY BEFORE LEAN-1)

---

## 1. TỔNG QUAN VÀ MỤC ĐÍCH HIỆU CHỈNH

Sau khi đợt kiểm toán LEAN-0 xuất xưởng 9 tài liệu đặc tả, quá trình rà soát độc lập đã phát hiện các điểm sai lệch trọng yếu giữa đề xuất tinh giản giao diện của agent và các nguyên tắc nghiệp vụ cốt lõi đã được phê duyệt.

### 1.1 Nguyên lý chỉ đạo tối cao được củng cố (Corrected Core Principle)
> **"Đơn giản hóa công việc mà con người phải thực hiện, không hạ thấp hay cắt xén các quy chuẩn nghiệp vụ bảo vệ tính chính xác, công bằng và tính giải trình."**  
> *(Simplify the work people must do, not the business rules that protect correctness).*

### 1.2 Nhóm 7 sai lệch nghiêm trọng đã được phát hiện và xử lý
1. **Đánh đồng "Đã thẩm định xong" với "Đạt tiêu chí" (Conflating Review Completion with Passing Eligibility):** LEAN-0 coi việc hoàn tất 5 tiêu chí là tự động "Đạt", bỏ qua trạng thái hoàn tất thẩm định nhưng kết quả là "Không đạt".
2. **Tự động hóa trái thẩm quyền các quyết định pháp lý (Unauthorized Workflow Automation):** LEAN-0 đề xuất khi đủ 5/5 tiêu chí thì tự động đề xuất trường, tự động gom vào đợt chuyển giao, tự động gửi Thành phố, tự động công nhận và tự động công bố kết quả.
3. **Logic gộp nhóm sai lệch (`ALL_REQUIRED` & `AT_LEAST_N`):** LEAN-0 giả định nếu 1 kê khai không phù hợp thì cả nhóm thất bại, vi phạm quyền nộp nhiều phương án/thành tích của sinh viên.
4. **Áp đặt mặc định chính sách không được phê duyệt (Invented Policy Defaults):** Đặt hạn chót bổ sung cố định 3 ngày làm việc trong khi nhật ký quyết định vẫn coi đây là vấn đề mở.
5. **Đảo lộn lộ trình thực hiện LEAN-1 đến LEAN-6 (Roadmap Inversion):** LEAN-0 tự ý đổi thứ tự các pha triển khai so với lộ trình gốc được phê duyệt (bắt đầu bằng sửa engine thẩm định thay vì tinh giản biểu mẫu kê khai sinh viên).
6. **Số liệu UX chưa được kiểm chứng thực nghiệm (Unverified Performance Metrics):** Công bố các con số như "giảm 71.3% clicks", "giảm từ 22 phút xuống 7.5 phút" như sự thật đã đo đạc, thay vì phân loại rõ là mục tiêu thiết kế (Target).
7. **Tùy tiện đánh dấu "ĐÃ PHÊ DUYỆT" trong Nhật ký quyết định:** Gán nhãn phê duyệt chính thức cho các ý tưởng do AI đề xuất.

---

## 2. BẢNG TRUY VẾT CÁC ĐIỂM HIỆU CHỈNH CHI TIẾT (TRACEABLE CORRECTION LOG)

| Mã lỗi | Phát hiện ban đầu tại LEAN-0 | Tại sao sai lệch hoặc thiếu căn cứ? | Diễn giải & Hợp đồng chuẩn sau hiệu chỉnh | Bằng chứng mã nguồn (Source Evidence) | Tài liệu bị ảnh hưởng | Mức độ rủi ro | Trạng thái giải quyết |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **CORR-01** | Coi `completed` ở cấp tiêu chí và hồ sơ đồng nghĩa với việc sinh viên "Đạt tiêu chí" và "Đủ điều kiện sơ bộ". | Tiêu chí có thể được cán bộ xem xét đầy đủ (Review Complete) nhưng kết quả thực tế là Không đạt (Fail). Một hồ sơ có 4 Đạt + 1 Không đạt vẫn là HOÀN TẤT THẨM ĐỊNH (không bị treo vĩnh viễn ở trạng thái "Đang xét"). | Tách bạch 5 chiều độc lập: (1) Tiến độ thẩm định (Chưa xét/Đang xét/Hoàn tất); (2) Kết quả tiêu chí (Đạt/Không đạt/Chưa kết luận); (3) Đề xuất của Trường; (4) Kết luận của Thành phố; (5) Quyết nghị Hội đồng. | `src/staff/reviewSelectors.ts` L365-372, L420-435 (`isItemReviewDone` bao gồm cả `unsuitable`). | Doc 1, 2, 3, 5, 6, 7 | **P0 (Critical)** | **ĐÃ HIỆU CHỈNH** |
| **CORR-02** | Tự động chuyển hồ sơ sang đề xuất chuyển Thành phố và tự động gom vào đợt chuyển giao khi đạt 5/5 tiêu chí. | Tước bỏ quyền hạn đánh giá của Cán bộ Trường. Trường có thể quyết định "Không đề xuất" dù sinh viên đủ 5 tiêu chí (ví dụ: vi phạm đạo đức ngoài trường học, vượt chỉ tiêu hoặc có khiếu nại). | Đạt 5/5 chỉ là chỉ số kỹ thuật "Đủ điều kiện sơ bộ". Cán bộ Trường phải chủ động bấm "Đề xuất" hoặc "Không đề xuất", và chủ động chọn hồ sơ vào đợt chuyển giao kèm Quyết định chính thức. | `src/staff/schoolReviewTypes.ts` L299 (`SchoolForwardingRecommendation`), `src/pages/school-backoffice/SchoolRecommendationForwardingPage.tsx` L114-116. | Doc 1, 2, 5, 6, 8 | **P0 (Critical)** | **ĐÃ HIỆU CHỈNH** |
| **CORR-03** | Quy tắc: "Nếu có bất kỳ kê khai nào không phù hợp thì nhóm `ALL_REQUIRED` bị Không đạt". | Một yêu cầu có thể cho phép sinh viên nộp nhiều kê khai/thành tích dự phòng. Nếu Kê khai A đạt chuẩn, yêu cầu vẫn ĐẠT dù Kê khai B bị cán bộ đánh giá không phù hợp. | Nhóm `ALL_REQUIRED` yêu cầu mọi YÊU CẦU CON bắt buộc phải thỏa mãn, nhưng tính thỏa mãn của từng yêu cầu con được tính theo quy tắc nộp kê khai của chính nó (chỉ cần >= 1 kê khai hợp lệ). | `src/demo/fixtures/criteriaDefinitions.ts` L8-18 (`resolveMultiplicity`), `src/entities/application/studentApplicationTypes.ts` L52-60. | Doc 2, 4, 5, 8 | **P1 (High)** | **ĐÃ HIỆU CHỈNH** |
| **CORR-04** | Nhóm lựa chọn `AT_LEAST_N` (ví dụ Thể lực tốt: SV Khỏe vs Giải thể thao): Coi phương án không chọn là vô hiệu và cấm nộp thêm. | Sinh viên có quyền nộp cả 2 phương án tự nguyện để nâng cao giá trị hồ sơ. Cán bộ chỉ cần 1 phương án đạt là đủ điều kiện kết luận nhóm. Phương án chưa kê khai không được hiển thị lỗi đỏ. | Thừa nhận tính hợp lệ của phương án tự nguyện; không bắt buộc cán bộ phải duyệt các phương án dôi dư nếu ngưỡng đã đạt; không hiển thị cảnh báo thiếu hụt đối với phương án không chọn. | `src/demo/fixtures/criteriaDefinitions.ts` L281-370 (`ethics`, `physical`, `volunteer`, `integration`). | Doc 3, 4, 5, 6 | **P1 (High)** | **ĐÃ HIỆU CHỈNH** |
| **CORR-05** | Mặc định hạn chót yêu cầu bổ sung là 3 ngày làm việc và bắt buộc khóa sau 3 ngày. | Đây là vấn đề chính sách chưa được Ban Thường vụ Thành Đoàn ban hành khung giờ cứng. Việc tự ý biến thành quy tắc bắt buộc trong mã nguồn là vi phạm thẩm quyền. | Đưa thời hạn bổ sung về đúng bản chất: Thiết lập theo cấu hình mùa xét hoặc do Cán bộ nhập cụ thể. Đánh dấu thời hạn mặc định là ĐIỂM MỞ CẦN XIN Ý KIẾN CHÍNH THỨC (OPEN POLICY ITEM). | `src/staff/reviewTypes.ts` L422 (`isCitySupplementWindowClosed`), `src/staff/components/review/SupplementRequestFormModal.tsx`. | Doc 3, 5, 8, 9 | **P1 (High)** | **ĐÃ HIỆU CHỈNH** |
| **CORR-06** | Tự động hóa quyết định của Hội đồng Thành phố và tự động 1-click công bố ra cổng thông tin đại chúng. | Hội đồng Thành phố là cơ quan có thẩm quyền pháp lý độc lập. Việc công nhận danh hiệu và công bố kết quả đòi hỏi Nghị quyết/Quyết định có số hiệu và chữ ký số/chữ ký tươi của Chủ tịch Hội đồng. | Tách rời 4 bước: (1) Báo cáo tổng hợp số liệu; (2) Họp Hội đồng biểu quyết; (3) Ban hành Quyết định công nhận kèm danh sách; (4) Phê duyệt công bố chính thức. Không có cổng tra cứu tự động nếu chưa có văn bản. | `src/staff/components/committee/CommitteeViews.tsx`, `DecisionDialog.tsx`, `PublicationDialog.tsx`. | Doc 1, 2, 5, 6, 8 | **P1 (High)** | **ĐÃ HIỆU CHỈNH** |
| **CORR-07** | Đảo lộn thứ tự lộ trình: Đặt "Hợp nhất đánh giá dòng & Động cơ tiêu chí" thành LEAN-1, đẩy Biểu mẫu sinh viên xuống sau. | Lộ trình được khách hàng phê duyệt bắt buộc phải bắt đầu từ LEAN-1: TINH GIẢN BIỂU MẪU KÊ KHAI CỦA SINH VIÊN (Student Declaration Simplification) để giải quyết nguồn dữ liệu đầu vào trước. | Khôi phục chính xác 100% thứ tự lộ trình 6 pha: LEAN-1 (Sinh viên) -> LEAN-2 (Thẩm định trực tiếp) -> LEAN-3 (Bổ sung nội ngữ cảnh) -> LEAN-4 (Trường đề xuất & Đợt ĐHĐN) -> LEAN-5 (Thành phố, Hội đồng & Trạng thái) -> LEAN-6 (UAT E2E). | Attachment spec Section 12; User approved roadmap. | Doc 8 | **P0 (Critical)** | **ĐÃ HIỆU CHỈNH** |
| **CORR-08** | Khẳng định số liệu đo đạc "giảm 71.3% clicks" và "rút ngắn thời gian từ 22 phút còn 7.5 phút" như kết quả kiểm thử thực tế. | Chưa có người dùng thực tế tham gia đo lường (Real user testing), chưa chạy kịch bản tự động mô phỏng đầy đủ trong trình duyệt. | Phân loại lại toàn bộ các chỉ số này thành CHỈ TIÊU THIẾT KẾ (DESIGN TARGETS) và ƯỚC TÍNH TỪ MÃ NGUỒN (SOURCE-DERIVED ESTIMATES), không tuyên bố là sự thật đã nghiệm thu. | `src/staff/fixtures/officerReviewFixtures.ts` (Demo fixtures). | Doc 3, 4, 7 | **P2 (Medium)** | **ĐÃ HIỆU CHỈNH** |
| **CORR-09** | Tự ý đánh dấu các đề xuất của AI là "ĐÃ PHÊ DUYỆT" trong Nhật ký quyết định. | Các ý tưởng thiết kế chỉ là đề xuất (PROPOSED) cho đến khi Ban Thư ký Hội Sinh viên Thành phố chính thức ký duyệt văn bản. | Phân loại lại toàn bộ mục quyết định thành 6 nhóm minh bạch: CUSTOMER-CONFIRMED, SUPPORTED BY WORKFLOW, VERIFIED TECHNICAL, PROPOSED, REQUIRES SIGN-OFF, SUPERSEDED. | `docs/lean/LEAN_0_DECISION_LOG.md`. | Doc 9 | **P1 (High)** | **ĐÃ HIỆU CHỈNH** |

---

## 3. CÁC TIÊU CHUẨN THẨM ĐỊNH NGUYÊN BẢN CẦN BẢO TOÀN TRỌNG TÂM

Qua quá trình rà soát đối chiếu với quy chế thi đua của Hội Sinh viên Việt Nam TP. Đà Nẵng:
1. **Tiêu chuẩn Đạo đức tốt:** Điểm rèn luyện cả năm đạt từ 80 điểm trở lên; 100% không vi phạm pháp luật và quy chế; có chứng nhận bồi dưỡng đạo đức tư tưởng.
2. **Tiêu chuẩn Học tập tốt:** Điểm trung bình học tập cả năm đạt từ 3.2/4.0 (hoặc 8.0/10.0) trở lên; có đề tài NCKH hoặc bài báo khoa học hoặc giải thưởng học thuật.
3. **Tiêu chuẩn Thể lực tốt:** Đạt danh hiệu "Sinh viên khỏe" HOẶC tham gia/đạt giải tại các giải thể thao từ cấp trường trở lên.
4. **Tiêu chuẩn Tình nguyện tốt:** Đạt tối thiểu 5 ngày tình nguyện (quy đổi từ các chiến dịch hè, tiếp sức mùa thi, hoạt động thường xuyên hoặc hiến máu tình nguyện - 1 lần hiến máu = 1 ngày quy đổi).
5. **Tiêu chuẩn Hội nhập tốt:** Đạt chuẩn ngoại ngữ (TOEIC >= 500, IELTS >= 5.0, VSTEP B1 hoặc tương đương) HOẶC tham gia các hoạt động giao lưu quốc tế/kỹ năng hội nhập được công nhận.
6. **Tiêu chuẩn Tập thể (TT01–TT04):** Đã đạt danh hiệu Tập thể SV5T cấp trường; 100% sinh viên tham gia phong trào; tối thiểu 20% thành viên đạt SV5T cá nhân cấp trường (dùng chung mẫu số tổng sinh viên); không có sinh viên vi phạm kỷ luật.

---

## 4. KẾT LUẬN VÀ TRẠNG THÁI HIỆU CHỈNH

Toàn bộ 9 tài liệu LEAN-0 đã được hiệu chỉnh đồng bộ tại chỗ (in-place correction), bảo lưu lịch sử phân tích hữu ích đồng thời triệt tiêu hoàn toàn các nguy cơ nghiệp vụ sai lệch. Hai tài liệu hiệu chỉnh bổ sung (`LEAN_0_1_CORRECTION_REPORT.md` và `LEAN_0_1_REVIEW_STATE_TRUTH_TABLE.md`) cung cấp căn cứ vững chắc để chuẩn bị bước vào LEAN-1 khi có lệnh chính thức.
