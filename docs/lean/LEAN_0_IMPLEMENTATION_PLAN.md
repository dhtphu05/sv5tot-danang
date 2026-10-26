# LEAN-0.1: KẾ HOẠCH TRIỂN KHAI TINH GIẢN HỆ THỐNG (LEAN-1 ĐẾN LEAN-6)
## (Actionable Implementation Plan & Phased Refactor Roadmap — Realigned)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Nguyên tắc triển khai:** Khôi phục chuẩn xác 100% thứ tự 6 pha triển khai (LEAN-1 đến LEAN-6) theo yêu cầu của khách hàng. Mỗi pha đều có phạm vi tác động, tiêu chí nghiệm thu (Acceptance Criteria), định nghĩa hoàn thành (Definition of Done) và kế hoạch phối hợp phụ thuộc (Dependency Planning) rõ ràng.

---

## 1. TỔNG QUAN LỘ TRÌNH 6 PHA TRIỂN KHAI CHUẨN TẮC

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEAN-1: TINH GIẢN BIỂU MẪU KÊ KHAI CỦA SINH VIÊN (Student Declaration)       │
│ -> Tinh giản form nhập, "Nội dung kê khai", đính kèm minh chứng trực tiếp   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEAN-2: THẨM ĐỊNH CON NGƯỜI TRỰC TIẾP TRÊN DÒNG (Direct Inline Human Review)│
│ -> Phán quyết Đạt/Không đạt trực tiếp, đối soát song song, tổng hợp an toàn │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEAN-3: BỔ SUNG MINH CHỨNG NỘI NGỮ CẢNH (Inline Contextual Supplementation) │
│ -> Ngăn trượt khóa phạm vi, không modal che khuất, đối soát tệp so sánh     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEAN-4: ĐỀ XUẤT CẤP TRƯỜNG & CHUYỂN GIAO MỘT LẦN (School Batch & UDN Hub)   │
│ -> Đề xuất con người, chọn lọc có kiểm soát, UDN 8 trường, 1 Quyết định PDF │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEAN-5: THẨM ĐỊNH THÀNH PHỐ, HỘI ĐỒNG & CHUẨN HÓA GIAO DIỆN                 │
│ -> Hàng đợi chung TP, hoàn tất độc lập, Quyết nghị Hội đồng, Tập thể TT01-04│
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ LEAN-6: KIỂM THỬ CHẤP NHẬN ĐẦU-CUỐI & AN TOÀN HỒI QUY (E2E UAT BC01-BC20)   │
│ -> Kiểm thử 20 kịch bản, đối soát quyền hạn, hiệu năng, không suy giảm      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CHI TIẾT CÁC GIAI ĐOẠN TRIỂN KHAI

### GIAI ĐOẠN LEAN-1: TINH GIẢN BIỂU MẪU KÊ KHAI CỦA SINH VIÊN (STUDENT DECLARATION SIMPLIFICATION)
- **Mục tiêu:** Đơn giản hóa toàn bộ biểu mẫu kê khai thành tích của sinh viên, loại bỏ việc ép buộc điền các trường không cần thiết, hỗ trợ kê khai linh hoạt và đính kèm minh chứng trực tiếp.
- **Phạm vi công việc (Scope):**
  - Biểu mẫu kê khai ngắn gọn, tập trung vào trường "Nội dung kê khai" cốt lõi.
  - Các trường cấu trúc động chỉ hiển thị khi thực sự cần thiết (lũy tiến).
  - Tải và đính kèm minh chứng trực tiếp ngay tại dòng kê khai.
  - Tự động đánh số thứ tự thành tích; hỗ trợ nộp nhiều thành tích trong 1 yêu cầu (`Multiple Declarations`).
  - Giao diện nhận biết nhóm lựa chọn (`ONE_OF` / `ALL_OF`), không hiển thị cảnh báo đỏ đối với các phương án sinh viên không lựa chọn.
  - Bảo toàn tuyệt đối tính toàn vẹn của dữ liệu sinh viên đã kê khai trước đây.
- **Tệp nguồn tác động chính:**
  - `src/components/forms/`, `src/components/submission/`, `src/components/dossier/`
  - `src/entities/application/studentApplicationTypes.ts`
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - Sinh viên có thể nhập một thành tích đơn giản và đính kèm tệp minh chứng với số lượng trường nhập tối thiểu.
  - Không xuất hiện cảnh báo lỗi hoặc viền đỏ trên các phương án lựa chọn mà sinh viên không đăng ký.
- **Definition of Done (DoD):** `tsc --noEmit` không lỗi, sinh viên nộp thử nghiệm hồ sơ cá nhân hoàn chỉnh không gặp trở ngại.

---

### GIAI ĐOẠN LEAN-2: THẨM ĐỊNH CON NGƯỜI TRỰC TIẾP TRÊN DÒNG (DIRECT INLINE HUMAN REVIEW)
- **Mục tiêu:** Cung cấp trải nghiệm thẩm định liền mạch, đọc hồ sơ đến đâu đánh giá đến đó; phân định dứt khoát giữa tiến độ hoàn thành thẩm định và kết quả đạt chuẩn.
- **Phạm vi công việc (Scope):**
  - Hồ sơ hiển thị liên tục (Continuous dossier), không chia cắt màn hình.
  - Phán quyết trực tiếp [Đạt] / [Không đạt] tại đúng phạm vi dòng kê khai.
  - Tệp minh chứng hiển thị song song bên cạnh để đối soát tức thời.
  - Động cơ tổng hợp tiêu chí chính xác: phân tách độc lập giữa "Đã xét xong" (Reviewed) và "Đạt" (Passed) / "Không đạt" (Failed).
  - Loại bỏ các nút xác nhận hoàn tất thủ công thừa chỉ sau khi logic tự động đã được kiểm chứng.
  - Loại bỏ thanh công cụ ghim dày đặc (No excessive sticky toolbar).
- **Tệp nguồn tác động chính:**
  - `src/staff/components/review/InlineRowReviewControls.tsx`
  - `src/staff/components/review/CriterionReviewPanel.tsx`
  - `src/staff/reviewSelectors.ts`
  - `src/staff/components/review/useOfficerReviewMutations.ts`
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - Cán bộ bấm [Đạt] hoặc [Không đạt] trực tiếp trên dòng; kết quả được lưu trữ bền vững và hiển thị đúng tiến độ tiêu chí.
  - Hồ sơ có tiêu chí Không đạt vẫn đạt trạng thái "Hoàn tất thẩm định (X/5 đạt)", không bị treo ở "Đang xét".
- **Definition of Done (DoD):** Bộ test suite selector vượt qua 100%, bảo toàn các bản ghi lịch sử `historyEvents`.

---

### GIAI ĐOẠN LEAN-3: BỔ SUNG MINH CHỨNG NỘI NGỮ CẢNH (INLINE CONTEXTUAL SUPPLEMENTATION)
- **Mục tiêu:** Thay thế hộp thoại Modal che khuất hồ sơ bằng Ngăn trượt nhanh gắn liền với dòng kê khai đang xét, tạo luồng đối soát bổ sung minh bạch.
- **Phạm vi công việc (Scope):**
  - Nút bấm [Yêu cầu bổ sung] mở nhanh ngăn trượt nội ngữ cảnh, tự động khóa phạm vi Tiêu chí / Yêu cầu / Dòng kê khai.
  - Lời nhắn gửi sinh viên rõ ràng, tách biệt tuyệt đối với Ghi chú nội bộ của cán bộ.
  - Hạn chót bổ sung áp dụng theo cấu hình mùa xét hoặc do cán bộ chủ động nhập (không áp đặt cứng 3 ngày).
  - Sinh viên giải trình và tải tệp bổ sung ngay trên hồ sơ của mình.
  - Cán bộ đối soát tệp mới qua màn hình so sánh (Diff View) trước khi đưa ra phán quyết tái thẩm định.
- **Tệp nguồn tác động chính:**
  - `src/staff/components/review/SupplementRequestFormModal.tsx` -> Contextual Drawer
  - `src/staff/components/review/OfficerReviewWorkspace.tsx`
  - `src/components/supplement/`
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - Cán bộ gửi yêu cầu bổ sung trong 2 thao tác mà không bị che khuất tài liệu đối chiếu.
  - Sinh viên phản hồi và cán bộ kiểm tra lại tệp mới thông suốt trên cùng một hồ sơ.
- **Definition of Done (DoD):** Dữ liệu lịch sử các lần yêu cầu bổ sung được lưu trữ đầy đủ, không ghi đè mất tệp cũ.

---

### GIAI ĐOẠN LEAN-4: ĐỀ XUẤT CẤP TRƯỜNG & CHUYỂN GIAO MỘT LẦN (SCHOOL RECOMMENDATION & ONE-TIME FORWARDING)
- **Mục tiêu:** Chuẩn hóa quy trình ghi nhận đề xuất của Cán bộ Trường và đợt chuyển giao chính thức lên Thành phố, tối ưu hóa hiển thị cho Đại học Đà Nẵng (`unit-udn`).
- **Phạm vi công việc (Scope):**
  - Bảng tổng hợp kết quả thẩm định sơ bộ kèm tóm tắt 5 tiêu chí.
  - Ghi nhận phán quyết đề xuất của con người: "Đề xuất chuyển Thành phố" (`recommended`) hoặc "Không đề xuất" (`not_recommended`).
  - Hỗ trợ chọn lọc hồ sơ bằng checkbox và nút tiện ích chọn nhanh (Bulk-select convenience), bảo đảm người dùng luôn kiểm tra trước khi chuyển.
  - Tối ưu hóa Hub Đại học Đà Nẵng: Bảng thống kê phân rã 8 trường thành viên (DUT, DUE, UED, UFL, UTE, VKU, VNUK, SMP).
  - Đính kèm 1 Quyết định đề xuất chính thức duy nhất (Số hiệu, Ngày ký, Người ký, Tệp PDF).
  - Thực hiện chuyển giao thành công một lần duy nhất trong mùa xét (Idempotent forwarding).
- **Tệp nguồn tác động chính:**
  - `src/staff/components/school/SchoolBackofficeViews.tsx`
  - `src/pages/school-backoffice/SchoolRecommendationForwardingPage.tsx`
  - `src/staff/schoolSelectors.ts`
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - Trường chuyển đúng và đủ danh sách hồ sơ được cấp có thẩm quyền phê duyệt kèm tệp Quyết định hợp lệ.
  - Hồ sơ sau khi chuyển lập tức khóa quyền sửa đổi tại trường (Read-Only) và hiển thị trên hàng đợi Thành phố.
- **Definition of Done (DoD):** ĐHĐN và các trường độc lập chuyển giao độc lập không gây xung đột dữ liệu.

---

### GIAI ĐOẠN LEAN-5: THẨM ĐỊNH THÀNH PHỐ, HỘI ĐỒNG & CHUẨN HÓA GIAO DIỆN
- **Mục tiêu:** Hoàn thiện không gian làm việc của Cán bộ Thành phố và Hội đồng; chuẩn hóa văn phong tiếng Việt hành chính và cải tiến hồ sơ Tập thể TT01–TT04.
- **Phạm vi công việc (Scope):**
  - Hàng đợi chung cấp Thành phố (Shared Queue) không ép buộc phân công cá nhân.
  - Cán bộ Thành phố thẩm định độc lập 5 tiêu chí và xác nhận hoàn tất thẩm định.
  - Không gian làm việc của Hội đồng Thành phố: Thẩm tra số liệu tổng hợp, ban hành Quyết định công nhận chính thức.
  - Tinh giản giao diện hồ sơ Tập thể (TT01–TT04): Nộp trực tiếp lên Thành phố, kế thừa sĩ số từ TT02 sang TT03.
  - Thay thế toàn bộ thuật ngữ kỹ thuật (`pipeline`, `resolution case`, `scopeKey`) bằng tiếng Việt hành chính Đoàn - Hội chuẩn mực.
  - Tối ưu hóa hiển thị đáp ứng (Responsive UI) trên máy tính bảng và màn hình cảm ứng.
- **Tệp nguồn tác động chính:**
  - `src/staff/components/committee/CommitteeViews.tsx`, `DecisionDialog.tsx`, `PublicationDialog.tsx`
  - `src/staff/components/review/CollectiveOfficerReviewWorkspace.tsx`
  - `src/staff/collectiveStore.ts`
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - Quy trình Thành phố và Hội đồng được vận hành trang trọng, kiểm soát hoàn toàn bởi con người.
  - Tập thể nộp và được thẩm định 4 tiêu chuẩn mượt mà không qua trung gian.
- **Definition of Done (DoD):** Giao diện 100% thuần Việt, không còn từ ngữ kỹ thuật gây khó hiểu.

---

### GIAI ĐOẠN LEAN-6: KIỂM THỬ CHẤP NHẬN ĐẦU-CUỐI & AN TOÀN HỒI QUY (E2E UAT & SECURITY REGRESSION)
- **Mục tiêu:** Thực hiện nghiệm thu toàn diện hệ thống trên 20 kịch bản chấp nhận người dùng (BC01–BC20), kiểm tra phân quyền, an toàn đồng thời và bảo đảm không suy giảm năng lực.
- **Phạm vi công việc (Scope):**
  - Kiểm thử luồng Sinh viên nộp -> Hồ sơ 13 trường -> Trường sơ tuyển -> Bổ sung minh chứng -> Đợt chuyển ĐHĐN / Trường độc lập -> Thành phố thẩm định -> Hội đồng quyết nghị -> Công bố.
  - Kiểm thử hồ sơ Tập thể nộp trực tiếp.
  - Kiểm thử xuất dữ liệu báo cáo và biểu mẫu Excel.
  - Kiểm thử phân quyền: Chống rò rỉ hồ sơ giữa các trường; kiểm tra khóa an toàn sau chuyển giao.
  - Kiểm thử đồng thời (Concurrency Safety): Ngăn ghi đè phán quyết cũ lên phán quyết mới.
  - Kiểm thử giao diện trên các thiết bị và độ phân giải khác nhau.
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - 100% trong số 20 kịch bản BC01–BC20 đạt kết quả Passed dựa trên bằng chứng kiểm thử thực tế.
  - Toàn bộ test suite tự động (`vitest run`) và kiểm tra kiểu (`tsc --noEmit`) đạt màu xanh.
- **Definition of Done (DoD):** Báo cáo nghiệm thu kỹ thuật chính thức được phê duyệt, sẵn sàng đưa vào vận hành.

---

## 3. KẾ HOẠCH ĐIỀU PHỐI PHỤ THUỘC (DEPENDENCY PLANNING)

```
+-----------------------------------------------------------------------------------------+
| QUY TẮC PHỐI HỢP LIÊN PHA (CROSS-PHASE COORDINATION RULES)                              |
+-----------------------------------------------------------------------------------------+
1. Độc lập an toàn:
   - Giao diện kê khai sinh viên (LEAN-1) có thể triển khai độc lập mà không ảnh hưởng tới
     màn hình của Cán bộ Thành phố (LEAN-5).
2. Trình tự ràng buộc:
   - LEAN-2 (Động cơ tổng hợp tiêu chí) PHẢI hoàn tất trước khi LEAN-4 phụ thuộc vào dữ liệu
     tiến độ và kết quả đề xuất.
   - LEAN-3 (Bổ sung minh chứng) bắt buộc phải bảo lưu cấu trúc dữ liệu SupplementRequest của hệ thống.
3. Không sửa đổi đồng thời:
   - Tuyệt đối không thực hiện sửa đổi song song trên các tệp dùng chung trọng yếu
     (như reviewSelectors.ts hoặc reviewTypes.ts) nếu không có sự điều phối rõ ràng.
4. Cổng nghiệm thu cuối cùng:
   - LEAN-6 là cổng tích hợp và chốt chặn an toàn tối cao trước khi phát hành.
+-----------------------------------------------------------------------------------------+
```
