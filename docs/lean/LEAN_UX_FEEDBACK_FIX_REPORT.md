# 5TOT ĐÀ NẴNG — BÁO CÁO TỔNG HỢP XỬ LÝ PHẢN HỒI UX LEAN
## (Lean UX Feedback Consolidation Report — Fix 01 đến Fix 10)

**Cơ quan chỉ đạo:** Thành Đoàn Đà Nẵng  
**Đơn vị vận hành chuyên môn:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Đối tượng áp dụng:** Cổng thông tin Sinh viên, Cổng thông tin Tập thể, Bàn làm việc Cán bộ xét sơ tuyển cấp Trường (School Officer), Bàn làm việc Cán bộ xét duyệt cấp Thành phố (City Officer & Manager)  
**Trạng thái kiểm thử:** 433/433 tests passed (58 suites), 0 failures. Build thành công 100%.

---

## 1. TỔNG QUAN YÊU CẦU & BỐI CẢNH PHẢN HỒI

Dựa trên 6 phản hồi trực quan từ người dùng thực tế và các khiếm khuyết được phát hiện trong đợt thử nghiệm vận hành hệ thống xét chọn "Sinh viên 5 tốt" TP. Đà Nẵng:
1. **Lệch căn gióng cột bảng kê khai (Fix 01):** Đường gióng giữa tiêu đề bảng 4 cột (`ApplicationTableHeader`) và các hàng dữ liệu (`RequirementRow`, `RequirementGroupHeader`) bị lệch viền do viền trái `border-l-[3.5px]` và chênh lệch `padding` giữa các breakpoint.
2. **Lặp biểu tượng và dấu cộng (Fix 02):** Nút hành động hiển thị thừa thành `+ + Thêm` do lồng ghép đồng thời icon `<Plus />` và chuỗi văn bản `+ Thêm ...`.
3. **Thiếu hộp thoại xác nhận nộp thành công ở vị trí trung tâm (Fix 03):** Sau khi nộp hồ sơ, hệ thống chỉ hiển thị toast góc dưới mà thiếu modal xác nhận trang trọng tại trung tâm màn hình (`SubmissionSuccessDialog`).
4. **Hành động thừa tại thanh tiêu đề đầu trang (Fix 04):** Các nút bấm trùng lặp như "Hồ sơ xét duyệt cấp Thành phố" và "Mở thẩm định: [Tên]" hiển thị ngay trên dải chỉ số vận hành đã có chức năng bấm lọc.
5. **Chuẩn hóa thuật ngữ "Xét sơ tuyển" (Fix 05):** Thay thế triệt để các cách viết tắt/không chính quy ("Xét sơ", "Tiếp tục xét sơ", "Đang xét sơ") sang tiếng Việt hành chính chuẩn mực: "Xét sơ tuyển", "Đang xét sơ tuyển", "Đã hoàn tất xét sơ tuyển".
6. **Hợp nhất điều hướng chuyển giao danh sách cấp Trường (Fix 06):** Giữ duy nhất một điểm đến điều hướng là "Danh sách đề nghị" (`school_awaiting_forward`), tự động hiển thị danh sách đề xuất kèm nút chuyển khi chưa chuyển, và hiển thị danh sách lưu vết/Quyết định đính kèm khi đã chuyển.
7. **Sửa lỗi điều hướng tab Thông báo & Thống kê cấp Trường (Fix 07 - P0):** Khi cán bộ cấp Trường bấm vào "Thông báo" (`school_notifications`) hoặc "Thống kê tiến độ" (`school_analytics`), hệ thống bị rơi xuống nhánh mặc định (General Application Registry) hiển thị danh sách hồ sơ thay vì màn hình tương ứng.
8. **Tinh gọn hiển thị minh chứng mở rộng (Fix 08):** Loại bỏ nút hành động thừa, cho phép bấm trực tiếp vào tên tệp/chip để mở xem ngay, loại bỏ mục "Xem chi tiết" trùng lặp trong menu phụ.
9. **Cải thiện độ tương phản Cổng Tập thể (Fix 09):** Nâng cấp bảng màu tiêu đề, nhãn trạng thái và thẻ chỉ số trên Cổng Tập thể đạt chuẩn tương phản cao WCAG AA.
10. **Bảo toàn ràng buộc kiến trúc & Invariant (Fix 10):** Không sinh thêm tầng workflow thừa, không dùng dữ liệu giả lập chắp vá, tuân thủ RBAC và tính bất biến của hồ sơ đã nộp.

---

## 2. NGUYÊN NHÂN GỐC RỄ & GIẢI PHÁP CHI TIẾT

| Mã | Hạng mục | Nguyên nhân gốc rễ (Root Cause) | Giải pháp kỹ thuật đã áp dụng |
|---|---|---|---|
| **Fix 01** | Table Column Alignment | `RequirementGroupHeader.tsx` có `border-l-[3.5px]` gắn trực tiếp lên grid container khiến bề rộng 4 cột bị đẩy dịch sang phải 3.5px so với Header. `RequirementRow.tsx` dùng `px-5 lg:px-6` (lệch ở 768-1023px) và cột 1 dùng `pr-4` thay vì `pr-6`. `EvidenceSummary.tsx` cắt tên tệp ở 12-14 ký tự và giới hạn chiều rộng chỉ 125px. | - Thay `border-l-[3.5px]` bằng `boxShadow: inset 3.5px 0 0 0 ...`, giữ nguyên kích thước grid.<br>- Đặt cố định `px-6` trên desktop cho cả header và hàng.<br>- Đồng bộ cột 1 với `pr-6`.<br>- Tăng giới hạn tên tệp hiển thị lên 22-28 ký tự và độ rộng chip lên 160-190px. |
| **Fix 02** | Duplicated Plus Sign (`+ + Thêm`) | Component render `<Plus size={11} />` cạnh `<span>+ Thêm</span>`, hoặc lấy `requirement.addActionLabel` vốn đã có sẵn tiền tố `+ ` từ fixture. | - Viết helper `cleanAddLabel = (l) => l.replace(/^\+\s*/, '')`.<br>- Sửa chuỗi nút bấm thành `Thêm`, `Thêm kê khai`, `Thêm minh chứng`. |
| **Fix 03** | Centered Submission Success Dialog | `StudentApplicationWorkspace.tsx` chỉ có `SubmitConfirmationDialog` (hỏi trước khi nộp) và một toast thông báo nhanh sau khi gửi, thiếu hộp thoại xác nhận chính thức tại trung tâm màn hình. | - Xây dựng component mới `SubmissionSuccessDialog.tsx` tại vị trí trung tâm, có biểu tượng chữ V xanh lá lớn, tiêu đề "Nộp hồ sơ thành công!", tóm tắt thông tin sinh viên, niên khóa, đơn vị và nút CTA "Xem hồ sơ" + "Đóng".<br>- Kích hoạt dialog ngay sau khi tiến trình nộp hồ sơ hoàn tất thành công. |
| **Fix 04** | Redundant Header Buttons | `StaffOverviewAndWorkload.tsx` và `SchoolOverviewPage.tsx` render thêm các nút bấm điều hướng vào hồ sơ ở góc trên bên phải, trùng lặp trực tiếp với dải thẻ chỉ số bên dưới. | - Gỡ bỏ các nút bấm trùng lặp ở header.<br>- Giữ lại nút thống kê chính quy và các thẻ lọc nghiệp vụ tự nhiên. |
| **Fix 05** | Standardization of "Xét sơ tuyển" | Các chuỗi hiển thị và trạng thái ngắn dùng thuật ngữ viết tắt: "Xét sơ", "Đang xét sơ", "Đã hoàn tất xét sơ", "Chờ tiếp nhận xét sơ". | - Cập nhật `SCHOOL_PRELIMINARY_STATUS_META` trong `schoolReviewTypes.ts`: `under_review.shortLabel = 'Đang xét sơ tuyển'`, `preliminary_completed.label = 'Đã hoàn tất xét sơ tuyển'`.<br>- Cập nhật toàn bộ nhãn trên thẻ tổng quan, tiêu đề hàng, thông báo sinh viên và nhật ký xét duyệt (`officerReviewMutators.ts`). |
| **Fix 06** | Consolidated Forwarding Nav | Tồn tại cả 2 khái niệm "Hồ sơ chờ chuyển" và "Hồ sơ đã chuyển" trên thanh điều hướng bên. | - Quy về duy nhất 1 điểm đến trên thanh điều hướng: "Danh sách đề nghị" (`school_awaiting_forward`).<br>- Trang `SchoolRecommendationForwardingPage.tsx` tự động hiển thị chế độ chọn ứng viên & gửi lên TP nếu chưa chuyển; hoặc hiển thị danh sách chính thức & tệp Quyết định 182/QĐ-ĐHĐN kèm mốc thời gian nếu đã chuyển. |
| **Fix 07** | School Notifications & Analytics Bug (P0) | Bộ định tuyến `SchoolBackofficeViews.tsx` chỉ kiểm tra các route `school_overview`, `school_collective_queue`, `school_supplements`, `school_awaiting_forward`. Khi `activeRouteId === 'school_notifications'` hoặc `school_analytics`, điều kiện rơi xuống cuối hàm và hiển thị bảng hồ sơ chung. | - Thêm nhánh xử lý `activeRouteId === 'school_notifications'` kết nối với `StaffNotificationsRouteView` kèm trạng thái rỗng trung thực ("Không có thông báo mới").<br>- Thêm nhánh `activeRouteId === 'school_analytics'` kết nối với component trang mới `SchoolAnalyticsPage.tsx` phân tích chi tiết tiến độ 5 tiêu chuẩn, tỷ lệ đề xuất và bảng phân bổ 8 trường thành viên ĐHĐN. |
| **Fix 08** | Streamlined Evidence Inspection | Tệp minh chứng trong danh sách mở rộng có nút "Xem" rồi trong menu `•••` lại có nút "Xem chi tiết", tên tệp không bấm được trực tiếp. | - Cho phép bấm thẳng vào tên tệp để mở xem trực quan.<br>- Giữ nút "Xem" chính quy, xóa bỏ nút "Xem chi tiết" trùng lặp trong menu phụ.<br>- Loại bỏ dấu `+` thừa trong nút "Thêm minh chứng". |
| **Fix 09** | Collective Dashboard Contrast | Bảng màu banner và các badge trạng thái trên Cổng Tập thể dùng màu chữ và nền có độ tương phản chưa tối ưu, thiếu đường viền phân tách. | - Tinh chỉnh banner sang nền xanh navy đậm `#0B1E2D` viền `#1E3A52` với chữ trắng/slate-200 tương phản cao.<br>- Toàn bộ huy hiệu trạng thái (TT01–TT04) được bổ sung viền tương phản cao và mã màu chuẩn WCAG AA. |
| **Fix 10** | Architecture & Invariant Adherence | Ràng buộc bảo toàn dữ liệu, chống suy thoái hệ thống và tuân thủ quy chế giải thưởng. | - Không tạo bảng giả lập.<br>- Xác nhận nộp thành công chỉ mở khi hồ sơ thực sự được lưu.<br>- Giữ vững quyền hạn phân cấp giữa cấp Trường và cấp Thành phố. |

---

## 3. TẬP TIN ĐÃ THAY ĐỔI & TẠO MỚI

1. `src/components/submission/SubmissionSuccessDialog.tsx` (Tạo mới)
2. `src/components/application/StudentApplicationWorkspace.tsx` (Cập nhật)
3. `src/components/application/RequirementGroupHeader.tsx` (Cập nhật)
4. `src/components/application/RequirementRow.tsx` (Cập nhật)
5. `src/components/evidence/EvidenceSummary.tsx` (Cập nhật)
6. `src/components/evidence/ExpandedEvidenceList.tsx` (Cập nhật)
7. `src/components/application/ExpandedRequirement.tsx` (Cập nhật)
8. `src/widgets/staff-backoffice/StaffOverviewAndWorkload.tsx` (Cập nhật)
9. `src/pages/school-backoffice/SchoolOverviewPage.tsx` (Cập nhật)
10. `src/staff/schoolReviewTypes.ts` (Cập nhật)
11. `src/widgets/officer-review/OfficerReviewOverlaysAndDemoBar.tsx` (Cập nhật)
12. `src/widgets/officer-review/OfficerReviewBannersAndGuards.tsx` (Cập nhật)
13. `src/widgets/student-home/StudentHomeHeroBanner.tsx` (Cập nhật)
14. `src/entities/review/officerReviewMutators.ts` (Cập nhật)
15. `src/widgets/staff-backoffice/StaffQueueAndUtilityViews.tsx` (Cập nhật)
16. `src/pages/school-backoffice/SchoolAnalyticsPage.tsx` (Tạo mới)
17. `src/staff/components/school/SchoolBackofficeViews.tsx` (Cập nhật)
18. `src/components/collective/portal/CollectiveOverviewTab.tsx` (Cập nhật)
19. `src/test/leanUxFeedbackConsolidation.test.ts` (Tạo mới)

---

## 4. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG

- **Biên dịch Vite/TypeScript:** `npm run build` / `compile_applet` thành công 100%, 0 lỗi cú pháp hoặc kiểu dữ liệu.
- **Node Test Runner:**
  - Bộ test mới `leanUxFeedbackConsolidation.test.ts`: 11/11 tests pass trong 8.6ms.
  - Toàn bộ suite kiểm thử: **433/433 tests pass** trên 58 suites kiểm thử.
  - Tỷ lệ lỗi: **0%**.
