# LEAN-0.1: BÁO CÁO KIỂM TOÁN HIỆN TRẠNG TOÀN DIỆN HỆ THỐNG 5TOT ĐÀ NẴNG
## (Current State Audit & Architecture Bottleneck Assessment — Corrected Baseline)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành nghiệp vụ:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Niên khóa áp dụng:** Năm học 2025–2026  
**Phiên bản tài liệu:** LEAN-0.1 (Corrected Audit Baseline)  
**Phạm vi kiểm toán:** Toàn bộ mã nguồn Frontend (`src/`), Backend Server (`server.ts`), Định nghĩa Tiêu chí (`src/demo/fixtures/criteriaDefinitions.ts`), Domain Types (`src/staff/`), Quản lý Hồ sơ Sinh viên & Tập thể.

---

## 1. TỔNG QUAN VÀ MỤC ĐÍCH KIỂM TOÁN

Đợt kiểm toán nghiệp vụ **LEAN-0.1** được tiến hành nhằm phân tích thực trạng kiến trúc phần mềm và trải nghiệm người dùng (UX) trên nền tảng quản lý phong trào Sinh viên 5 tốt (5TOT) TP. Đà Nẵng, bảo đảm tuân thủ nguyên tắc tinh giản trải nghiệm nhưng giữ vững tính chính xác và an toàn pháp lý.

### 1.1 Nguyên lý chỉ đạo tối cao (Lean Guiding Principle)
> **"Đơn giản hóa công việc mà con người phải thực hiện, không hạ thấp hay cắt xén các quy chuẩn nghiệp vụ bảo vệ tính chính xác, công bằng và tính giải trình."**  
> *(Simplify the work people must do, not the business rules that protect correctness).*

### 1.2 Phân loại mức độ xác thực của các phát hiện (Evidence Classification)
Mọi kết luận trong báo cáo kiểm toán này được phân định rõ ràng theo 5 cấp độ chuẩn tắc:
- `[VERIFIED IN SOURCE]`: Đã kiểm chứng trực tiếp trong mã nguồn thực tế tại `/app/applet`.
- `[SUPPORTED BY APPROVED BUSINESS REQUIREMENTS]`: Được bảo chứng bởi Quy chế xét chọn chính thức của Hội Sinh viên TP. Đà Nẵng.
- `[PROPOSED DESIGN]`: Đề xuất thiết kế mới của nhóm kỹ thuật nhằm tối ưu hóa trải nghiệm.
- `[REQUIRES BUSINESS CONFIRMATION]`: Điểm mở cần xin ý kiến chỉ đạo từ Ban Thư ký Hội Sinh viên Thành phố.
- `[UNVERIFIED]`: Chưa có dữ liệu thực nghiệm hoặc chưa được kiểm chứng trong môi trường thực tế.

---

## 2. BẢN ĐỒ CẤU TRÚC MÃ NGUỒN LIÊN QUAN ĐẾN THẨM ĐỊNH & KÊ KHAI

Hệ thống hiện tại phân bổ các chức năng thẩm định, xét duyệt và kê khai qua các module cốt lõi sau `[VERIFIED IN SOURCE]`:

| Module / Lớp kiến trúc | Đường dẫn tệp nguồn (File Path) | Thẩm quyền & Hành vi đã kiểm chứng trong mã nguồn |
| :--- | :--- | :--- |
| **Domain Types: Thẩm định Cá nhân** | `/src/staff/reviewTypes.ts` | `[VERIFIED IN SOURCE]` Định nghĩa trạng thái kê khai (`StaffItemReviewStatus`: `not_reviewed`, `viewed`, `suitable`, `needs_supplement`, `supplement_returned`, `unsuitable`, `needs_consideration`, `review_completed`), minh chứng (`StaffEvidenceReviewStatus`), tiêu chí (`StaffWorkspaceCriterionStatus`), kịch bản demo (`OfficerDemoScenarioId`). |
| **Domain Types: Thẩm quyền Hai cấp & Chuyển giao** | `/src/staff/schoolReviewTypes.ts` | `[VERIFIED IN SOURCE]` Định nghĩa 2 cấp chính thức (`SCHOOL`, `CITY`), định tuyến cơ sở đào tạo về Đơn vị xét sơ (`INSTITUTION_TO_SCHOOL_REVIEW_UNIT_MAP`, `resolveSchoolReviewUnit`), gói chuyển giao trường (`ForwardingBatchStatus`, `DecisionDocumentMetadata`). |
| **Domain Types: Hồ sơ Tập thể** | `/src/staff/collectiveTypes.ts` | `[VERIFIED IN SOURCE]` Định nghĩa 4 tiêu chuẩn TT01–TT04, trạng thái quy trình tập thể (`CollectiveWorkflowStatus`), thành viên cấu trúc (`StructuredMemberRecord`). |
| **Domain Entities: Hồ sơ Sinh viên** | `/src/entities/application/studentApplicationTypes.ts` | `[VERIFIED IN SOURCE]` Cấu trúc dữ liệu bất biến của hồ sơ sinh viên (`StudentApplicationData`, `ApplicationDeclaration`, `ApplicationEvidence`, `StudentProfileDto` 13 trường). |
| **Tokens & Tiêu chí chuẩn** | `/src/demo/fixtures/criteriaDefinitions.ts` | `[VERIFIED IN SOURCE]` Định nghĩa 5 tiêu chí cá nhân, 11 nhóm tiêu chí (`ALL_REQUIRED`, `AT_LEAST_N`, `OPTIONAL`), quy chuẩn điểm rèn luyện, học tập, thể lực, tình nguyện, hội nhập. |
| **Review Workspace Host** | `/src/staff/components/review/OfficerReviewWorkspace.tsx` | `[VERIFIED IN SOURCE]` Điều phối không gian thẩm định của Cán bộ (Header, Dossier, Tiêu chí, Modal bổ sung, AI copilot). |
| **Inline Row Review Controls** | `/src/staff/components/review/InlineRowReviewControls.tsx` | `[VERIFIED IN SOURCE]` Cụm điều khiển đánh giá trực tiếp Đạt / Không đạt trên từng dòng kê khai của sinh viên (UX-S5.2). |
| **Review Inspector Host** | `/src/staff/components/review/inspector/` & `/src/widgets/officer-review/` | `[VERIFIED IN SOURCE]` Panel kiểm tra chi tiết bên phải (ReviewInspector, Lịch sử xử lý, Ghi chú nội bộ, Trợ lý AI). |
| **Quản trị Trường & Chuyển giao** | `/src/staff/components/school/SchoolBackofficeViews.tsx` | `[VERIFIED IN SOURCE]` Giao diện cán bộ Trường: Danh sách hồ sơ sơ tuyển, tạo gói đề xuất chuyển Thành phố (`DecisionDocumentModal`). |
| **Trang Chuyển giao Hồ sơ Trường** | `/src/pages/school-backoffice/SchoolRecommendationForwardingPage.tsx` | `[VERIFIED IN SOURCE]` Đóng gói danh sách đề xuất kèm tệp Quyết định phê duyệt (`DecisionDocumentMetadata`). |
| **Hội đồng Thành phố** | `/src/staff/components/committee/CommitteeViews.tsx` | `[VERIFIED IN SOURCE]` Thẩm tra kết quả tổng hợp, xem xét hồ sơ danh dự, ban hành quyết định công nhận và công bố kết quả. |
| **Tập thể Thành phố** | `/src/staff/components/review/CollectiveOfficerReviewWorkspace.tsx` | `[VERIFIED IN SOURCE]` Thẩm định 4 tiêu chuẩn tập thể trực tiếp cấp Thành phố (không qua xét sơ cấp Trường). |

---

## 3. PHÂN TÍCH CÁC NGHẼN CỔ CHAI VÀ ĐIỂM QUÁ TẢI NGHIỆP VỤ (BOTTLENECK ANALYSIS)

Qua quá trình kiểm toán mã nguồn chi tiết, hệ thống tồn tại 6 nhóm vấn đề lớn về kiến trúc trải nghiệm cần được giải quyết:

### 3.1 Nghẽn cổ chai #1: Phân mảnh mức độ đánh giá (Review Granularity Fragmentation) `[VERIFIED IN SOURCE]`
- **Hiện trạng mã nguồn:**
  - `src/staff/reviewTypes.ts` định nghĩa đồng thời 3 cấp độ đánh giá trạng thái độc lập:
    1. Cấp độ Minh chứng (`StaffEvidenceReviewRecord`): `not_reviewed`, `viewed`, `suitable`, `needs_supplement`, `unsuitable`, `needs_consideration`.
    2. Cấp độ Mục kê khai (`StaffScopeReviewRecord`): `not_reviewed`, `viewed`, `suitable`, `needs_supplement`, `supplement_returned`, `unsuitable`, `needs_consideration`, `review_completed`.
    3. Cấp độ Tiêu chí (`criterionCompletedMap` / `StaffWorkspaceCriterionStatus`): Cán bộ phải bấm nút riêng để "Hoàn tất thẩm định tiêu chí".
- **Hệ quả thực tế:** Cán bộ xem xét một minh chứng đạt yêu cầu phải thao tác xác nhận minh chứng, sau đó quay lại xác nhận mục kê khai, và cuối cùng nhấn nút xác nhận tiêu chí. Thao tác lặp lại này làm tăng gánh nặng nhận thức.

### 3.2 Nghẽn cổ chai #2: Xung đột nhận thức trong các nhóm điều kiện lựa chọn (`AT_LEAST_N` & `OPTIONAL`) `[VERIFIED IN SOURCE]`
- **Hiện trạng mã nguồn:**
  - Tại `src/demo/fixtures/criteriaDefinitions.ts`:
    - Tiêu chí 3 (Thể lực tốt): Sinh viên có thể chọn Đạt danh hiệu "Sinh viên khỏe" HOẶC Giấy chứng nhận thể thao.
    - Tiêu chí 4 (Tình nguyện tốt): Nhóm hoạt động tình nguyện yêu cầu ít nhất 1 trong 3 hình thức (chiến dịch hè, hiến máu, hoặc hoạt động cộng đồng).
    - Tiêu chí 5 (Hội nhập tốt): Ngoại ngữ HOẶC Kỹ năng hội nhập/Giao lưu quốc tế.
- **Hệ quả thực tế:** Khi sinh viên đã kê khai một phương án hợp lệ, các phương án còn lại chưa kê khai vẫn hiển thị trạng thái `Chưa xét` hoặc màu xám gây nhầm lẫn là hồ sơ chưa hoàn thành. Cán bộ bị phân tâm không rõ tiêu chí này đã đủ điều kiện hay chưa nếu không cộng nhẩm logic trong đầu.

### 3.3 Nghẽn cổ chai #3: Quy trình Yêu cầu Bổ sung quá nhiều bước (Supplementation Overhead) `[VERIFIED IN SOURCE]`
- **Hiện trạng mã nguồn:**
  - `SupplementRequestFormModal.tsx` mở một hộp thoại che phủ màn hình, yêu cầu chọn lại Tiêu chí -> Yêu cầu -> Mục kê khai -> 4 checkboxes hành động -> Hạn chót -> Nội dung gửi sinh viên.
- **Hệ quả thực tế:** Việc che khuất tài liệu khiến cán bộ không thể vừa đối chiếu tệp minh chứng bị mờ vừa gõ nội dung hướng dẫn ngắn gọn.

### 3.4 Nghẽn cổ chai #4: Trộn lẫn thuật ngữ kỹ thuật và ngôn ngữ giao diện (Jargon Contamination) `[VERIFIED IN SOURCE]`
- **Hiện trạng mã nguồn:**
  - Một số thuật ngữ lập trình như `ResolutionCase`, `batch orchestration`, `read-only lock`, `scopeKey` ảnh hưởng đến nhãn hiển thị hoặc tài liệu hướng dẫn.
- **Yêu cầu tinh giản:** Chuẩn hóa sang ngôn ngữ tiếng Việt hành chính Đoàn - Hội: *"Đợt chuyển giao", "Nội dung trao đổi nội bộ", "Chế độ xem lịch sử", "Phạm vi tiêu chuẩn"*.

### 3.5 Nghẽn cổ chai #5: Mô hình Đại học Đà Nẵng (UDN Hub) cần tối ưu hóa hiển thị `[SUPPORTED BY APPROVED BUSINESS REQUIREMENTS]`
- **Hiện trạng mã nguồn:**
  - `src/staff/schoolReviewTypes.ts` định nghĩa chính xác `unit-udn` là đầu mối chung của 8 trường thành viên (Bách khoa, Kinh tế, Sư phạm, Ngoại ngữ, Sư phạm Kỹ thuật, VKU, VNUK, Y Dược).
  - Cán bộ Văn phòng Đoàn Đại học Đà Nẵng cần bảng thống kê tổng hợp phân rã trực quan số liệu theo 8 trường thành viên để đối soát trước khi trình Giám đốc ĐHĐN ký Quyết định đề xuất chung.

### 3.6 Nghẽn cổ chai #6: Sự tách biệt không cần thiết giữa luồng Tập thể và Giao diện chuẩn `[SUPPORTED BY APPROVED BUSINESS REQUIREMENTS]`
- **Hiện trạng mã nguồn:**
  - Hồ sơ Tập thể (TT01–TT04) nộp trực tiếp lên Thành phố nhưng mã nguồn cũ vẫn còn tàn dư trạng thái chờ đơn vị cơ sở xác nhận (`submitted_for_unit_confirmation`). Cần loại bỏ triệt để các trạng thái thừa này khỏi giao diện.

---

## 4. MA TRẬN PHÁT HIỆN THỰC ĐỊA ĐÃ ĐƯỢC ĐỐI CHIẾU MÃ NGUỒN (EVIDENCE & PATH TRACEABILITY)

| Mã phát hiện | Thành phần / Tệp nguồn | Đoạn mã / Dòng quan sát | Vấn đề kiểm toán xác nhận | Phân loại căn cứ | Mức độ rủi ro |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **AUD-01** | `InlineRowReviewControls.tsx` | L73–86, L100–120 | Điều khiển đa tầng: Dòng kê khai có nút Đạt / Không đạt nhưng ở cấp Tiêu chí vẫn đòi hỏi nút bấm kết luận độc lập. | `[VERIFIED IN SOURCE]` | **Trung bình** |
| **AUD-02** | `reviewTypes.ts` | L24–33, L37–43 | Tách biệt trạng thái `StaffItemReviewStatus` và `StaffEvidenceReviewStatus` dẫn đến tình trạng minh chứng "Phù hợp" nhưng mục kê khai "Chưa xét". | `[VERIFIED IN SOURCE]` | **Cao** |
| **AUD-03** | `reviewSelectors.ts` | L329–331, L420–435 | Hàm `isItemReviewDone` tính cả `unsuitable` là đã xét xong. Cần phân định dứt khoát giữa việc hoàn tất công việc xét duyệt và việc kết luận Đạt/Không đạt. | `[VERIFIED IN SOURCE]` | **P0 (Critical)** |
| **AUD-04** | `criteriaDefinitions.ts` | Tiêu chí thể lực, hội nhập | Nhóm `AT_LEAST_N` (chọn 1 trong N) chưa có trạng thái hiển thị mềm mại cho các phương án sinh viên không lựa chọn. | `[VERIFIED IN SOURCE]` | **P1 (High)** |
| **AUD-05** | `schoolReviewTypes.ts` | L199–217 | Định tuyến 8 trường UDN về `unit-udn` hoạt động chuẩn xác, trang `SchoolRecommendationForwardingPage.tsx` cần trực quan hóa bảng tổng hợp 8 trường thành viên. | `[VERIFIED IN SOURCE]` | **Trung bình** |
| **AUD-06** | `collectiveTypes.ts` | L163–179 | Tồn tại các trạng thái thừa (`submitted_for_unit_confirmation`, `city_unassigned`) không phản ánh đúng quy trình nộp trực tiếp cấp Thành phố của Hồ sơ Tập thể. | `[VERIFIED IN SOURCE]` | **Trung bình** |

---

## 5. KẾT LUẬN KIỂM TOÁN HIỆN TRẠNG HIỆU CHỈNH (CORRECTED AUDIT VERDICT)

1. **Nền tảng kiến trúc vững chắc:** Hệ thống đã phân định bất biến hồ sơ sinh viên, phân định 2 cấp chính thức (`SCHOOL`, `CITY`), bảo toàn nhật ký kiểm toán vĩnh viễn (`historyEvents`).
2. **Nguyên tắc phân tách 5 chiều độc lập:** Phải phân định tuyệt đối giữa:
   - Tiến độ thẩm định (Hoàn tất hay chưa).
   - Kết quả tiêu chí (Đạt hay Không đạt).
   - Đề xuất của Trường (Đề xuất hay Không đề xuất).
   - Kết luận của Thành phố (Thẩm định độc lập).
   - Quyết nghị Hội đồng (Công nhận chính thức).
3. **Không tự động hóa thay quyền con người:** Đạt 5/5 tiêu chí là chỉ số kỹ thuật, không tự động thay thế quyết định hành chính hay quyết định công nhận của Hội đồng.
