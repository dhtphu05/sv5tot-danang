# 5TOT Đà Nẵng — Báo cáo Hiệu chỉnh Trải nghiệm LEAN-UX.2
**Phiên bản:** LEAN-UX.2 Production  
**Cơ quan chỉ đạo:** Ban Thường vụ Thành Đoàn Đà Nẵng  
**Đơn vị vận hành chuyên môn:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mục tiêu:** Khắc phục triệt để 8 bất cập giao diện từ ảnh thực tế, loại bỏ nút bấm trùng lặp (Action Deduplication), chuẩn hóa trạng thái thẩm định thực chất (Single Source of Truth), bảo đảm tính toàn vẹn minh chứng (Evidence Integrity Guard) và thu gọn không gian tác nghiệp.

---

## 1. Tổng quan & Bản đồ Đối soát 8 Ảnh chụp Thực tế (Screenshots 1–8)

| Ảnh chụp | Phân hệ / Màn hình | Vấn đề phát hiện | Nguyên nhân cốt lõi | Giải pháp LEAN-UX.2 đã áp dụng |
|---|---|---|---|---|
| **Ảnh 1** | Cán bộ Thành phố — Tập thể TT01–TT04 | Khung thẩm định quá khổ; Lịch sử thẩm định luôn mở choán chỗ; AI tự chèn ghi chú mà không được cán bộ duyệt; Có thể bấm Đạt điều kiện khi minh chứng chưa xét. | State `isHistoryExpanded` mặc định mở; thiếu guard kiểm tra trạng thái minh chứng trước khi lưu kết luận `suitable`; gợi ý AI chưa có nút xác nhận chủ động. | Đưa `isHistoryExpanded` về `false` (thu gọn mặc định với nhãn `Lịch sử đánh giá (N)`); AI gợi ý thu gọn mặc định và chỉ sao chép khi nhấn nút; chặn lưu `Phù hợp` nếu còn minh chứng chưa xét. |
| **Ảnh 2** | Hội đồng Thành phố — Danh sách Tập thể | Nút "Xem hồ sơ" trùng lặp giữa hàng bảng và panel bên phải; Modal xem chi tiết tập thể trùng lặp với Workspace Hội đồng. | Cột thao tác của bảng có nút "Xem hồ sơ", panel bên phải lại có thêm "Xem hồ sơ chi tiết"; click vào hàng mở modal tạm thời thay vì mở thẳng workspace chuẩn. | Bảng thao tác giữ 01 nút "Xem hồ sơ" duy nhất; panel xem nhanh chỉ hiển thị "Ghi nhận kết luận xét chọn" khi hồ sơ chờ quyết định; click hàng mở trực tiếp `CollectiveCommitteeWorkspace`. |
| **Ảnh 3** | Sinh viên — Minh chứng đính kèm | Huy hiệu "Cần kiểm tra" đè lên tên file minh chứng trên màn hình nhỏ hoặc panel hẹp; layout xô lệch. | Button tên file thiếu `min-w-0` trong flexbox; container cha không có `flex-wrap` thích ứng khi chiều rộng giới hạn. | Bổ sung `min-w-0 max-w-full` cho nút tên file, thêm `flex-wrap sm:flex-nowrap gap-1.5` để huy hiệu tự động xuống dòng mượt mà khi hẹp, không đè chữ. |
| **Ảnh 4** | Sinh viên — Bảng điều khiển Trang chủ | Hồ sơ bản nháp ("Đang hoàn thiện hồ sơ") nhưng thẻ tiến độ lại hiển thị "Đang xét sơ tuyển cấp Trường" và "Gửi lần đầu: Chưa gửi". | `TrackingSummary.tsx` không có nhánh xử lý cho `submissionState === 'draft'`, rơi vào nhánh mặc định `under_review`. | Bổ sung nhánh độc lập `submissionState === 'draft'`: tiêu đề "Đang hoàn thiện hồ sơ", nhãn "Chưa nộp hồ sơ", thông điệp chuẩn bị 05 tiêu chí, xóa dòng "Gửi lần đầu". |
| **Ảnh 5** | Sinh viên — Kê khai Tiêu chuẩn NCKH | Nút "+ Thêm đề tài nghiên cứu" xuất hiện đồng thời ở đầu danh sách và cuối ô trống khi chưa có kê khai. | `ExpandedRequirement.tsx` hiển thị nút Add ở thanh tiêu đề và lặp lại nút Add ở hộp rỗng. | Khi `declarationCount === 0`, chỉ hiển thị 01 nút thêm chính giữa hộp rỗng; khi `declarationCount > 0`, hiển thị nút trên thanh công cụ. |
| **Ảnh 6** | Sinh viên — Nhãn nút bấm kê khai | Nút hiển thị dấu cộng đôi `+ + Thêm đề tài nghiên cứu` gây lỗi thị giác. | `cleanAddLabel` chỉ loại bỏ 1 dấu cộng đơn giản bằng regex `replace(/^\+\s*/, '')`, không xử lý chuỗi có sẵn tiền tố lồng nhau. | Nâng cấp `cleanAddLabel` với regex `/^(\+\s*)+/` và `.trim()`, triệt tiêu hoàn toàn dấu cộng thừa. |
| **Ảnh 7** | Cán bộ Trường — Hồ sơ Sinh viên | Xuất hiện 2 nút "Hoàn tất xét sơ" cùng lúc trên màn hình; thanh tóm tắt hiển thị mâu thuẫn "5/5 đã hoàn tất", "Chưa xét", "0 Đạt". | Header trên cùng có nút hoàn tất và thanh nav trái cũng có nút hoàn tất; bộ đếm dùng `reviewedCriteriaCount` thay vì `concludedCriteriaCount` dẫn đến mâu thuẫn khi 0 tiêu chí có kết luận người. | Giữ duy nhất 01 nút "Hoàn tất xét sơ tuyển" tại thanh công cụ chính; sửa logic thanh tóm tắt khi `concludedCriteriaCount === 0` hiển thị chính xác "Đang xét sơ tuyển (chưa có tiêu chí kết luận)". |
| **Ảnh 8** | Hội đồng Thành phố — Danh sách Cá nhân | Panel xem nhanh bên phải chiếm diện tích lớn ép hẹp bảng danh sách; nút xem hồ sơ bị nhân đôi. | Quick preview có nút "Xem hồ sơ chi tiết" lặp lại nút "Xem hồ sơ" có sẵn trên mỗi hàng của bảng. | Chuẩn hóa nút thao tác trên hàng bảng là điểm mở duy nhất; Quick preview chỉ cung cấp nút "Ghi nhận kết luận xét chọn" hoặc thông báo hồ sơ đã có kết luận. |

---

## 2. Chi tiết Giải pháp Kỹ thuật & Cấu trúc Mã nguồn

### 2.1. Chuẩn hóa Trạng thái Bảng điều khiển Sinh viên (Screenshot 4)
- **Tập tin:** `src/components/tracking/TrackingSummary.tsx`
- **Thay đổi:**
  - Định nghĩa rõ ràng trạng thái `submissionState === 'draft'`:
    - Tiêu đề: **"Đang hoàn thiện hồ sơ"**
    - Huy hiệu: **"Chưa nộp hồ sơ"**
    - Nội dung hướng dẫn: *"Hồ sơ đang trong thời gian chuẩn bị và hoàn thiện kê khai 05 tiêu chí theo hướng dẫn của Hội Sinh viên."*
    - Loại bỏ dòng *"Gửi lần đầu [ngày]"* gây hiểu lầm trên hồ sơ chưa từng nộp.
  - Phân định rõ `under_review` (Đang xét sơ tuyển cấp Trường) và `city_review` (Đang thẩm định cấp Thành phố).
- **Đồng bộ hóa Widgets:**
  - `src/widgets/student-home/StudentHomeCriteriaStrip.tsx`: Chỉ hiển thị gợi ý rà soát minh chứng khi `submissionState === 'draft'`.
  - `src/widgets/student-home/StudentHomeRecentUpdates.tsx`: Tự động chuyển đổi nhãn hành động từ "Tiếp tục hồ sơ" sang "Xem hồ sơ" khi hồ sơ đã được nộp chính thức.

### 2.2. Khắc phục Đè chữ & Dấu cộng đôi trong Kê khai (Screenshots 3, 5, 6)
- **Tập tin:** `src/components/evidence/ExpandedEvidenceList.tsx`
  - Bổ sung `min-w-0 max-w-full` vào button tên tệp, ngăn ngừa button HTML từ chối co lại trong flex layout.
  - Sử dụng `flex-wrap sm:flex-nowrap gap-1.5` để huy hiệu ngoại lệ `Cần kiểm tra` và `Mới bổ sung` tự động xuống dòng khi màn hình hẹp, hoàn toàn không đè lên tên file.
- **Tập tin:** `src/components/application/ExpandedRequirement.tsx`
  - Chuẩn hóa hàm `cleanAddLabel`:
    ```typescript
    const cleanAddLabel = (label?: string) => {
      if (!label) return 'Thêm kê khai';
      return label.replace(/^(\+\s*)+/, '').trim();
    };
    ```
  - Triệt tiêu nút thêm trùng lặp: Ở thanh tiêu đề của tiêu chuẩn nhiều kê khai, chỉ hiển thị nút `+ [Thao tác]` khi `declarationCount > 0`. Khi chưa có kê khai (`declarationCount === 0`), chỉ hiển thị nút thêm chính giữa khung trạng thái rỗng.

### 2.3. Loại bỏ Nút trùng lặp & Chuẩn hóa Tiến độ Thẩm định cấp Trường (Screenshot 7)
- **Tập tin:** `src/staff/components/review/OfficerReviewWorkspace.tsx`
  - Khắc phục bộ đếm thanh tóm tắt (`humanReviewSummary`): Khi `concludedCriteriaCount === 0`, hiển thị `"Chưa xét sơ tuyển"` (cấp Trường) hoặc `"Chưa thẩm định"` (cấp Thành phố), không còn xuất hiện dòng mâu thuẫn `"5/5 đã hoàn tất, 0 Đạt"`.
  - Dải tóm tắt điều kiện hồ sơ (Dossier Summary Strip): Bổ sung nhánh chặn `concludedCriteriaCount === 0` hiển thị nhãn trung tính `"Đang xét sơ tuyển (chưa có tiêu chí kết luận)"`, loại bỏ hoàn toàn thông báo sai lệch `"Chưa đạt (0 tiêu chí Không đạt)"`.
- **Tập tin:** `src/staff/components/review/ReviewApplicationHeader.tsx`
  - Hiển thị nhãn ngữ cảnh chính xác: `{isSchoolStage ? 'Tiến độ xét sơ tuyển:' : 'Tiến độ thẩm định:'}`.

### 2.4. Đảm bảo Toàn vẹn Minh chứng Thẩm định Tập thể TT01–TT04 (Screenshot 1)
- **Tập tin:** `src/staff/components/review/CollectiveOfficerReviewWorkspace.tsx`
  - **Evidence Verification Guard:** Hàm `handleSaveRequirementJudgment` kiểm tra nghiêm ngặt:
    - Nếu cán bộ chọn kết luận `suitable` (Phù hợp) cho điều kiện TT01–TT04, hệ thống kiểm tra toàn bộ tệp minh chứng đính kèm.
    - Nếu còn tệp chưa xét (`not_reviewed`), hệ thống chặn lưu và yêu cầu cán bộ xem xét từng tệp.
    - Nếu có tệp bị đánh giá `unsuitable`, chặn lưu kết luận `suitable`.
  - **Lịch sử đánh giá:** Mặc định đóng `isHistoryExpanded = false`, hiển thị nhãn gọn gàng `"Lịch sử đánh giá (N)"`.
  - **AI Assistant:** Khung gợi ý AI mặc định thu gọn; chỉ đưa văn bản vào nhận xét chính thức khi cán bộ chủ động nhấn nút *"Sao chép gợi ý vào nhận xét"*.

### 2.5. Tối ưu Không gian & Loại bỏ Nút thừa tại Hàng đợi Hội đồng (Screenshots 2, 8)
- **Tập tin:** `src/staff/components/committee/views/CommitteeQueueQuickPreview.tsx`
  - Thay vì luôn hiển thị nút thứ hai *"Xem hồ sơ chi tiết"* trùng với nút *"Xem hồ sơ"* trên từng hàng, panel bên phải ưu tiên nút nghiệp vụ duy nhất: **"Ghi nhận kết luận xét chọn"** khi hồ sơ chưa có quyết định. Khi đã có quyết định, panel hiển thị thông báo trạng thái trang nhã.
- **Tập tin:** `src/staff/components/committee/CommitteeViews.tsx`
  - Click vào hàng tập thể hoặc thao tác xem hồ sơ tập thể trực tiếp mở `CollectiveCommitteeWorkspace` chính thức, loại bỏ modal trung gian `CommitteeCollectiveDetailsModal`.

---

## 3. Kết quả Kiểm thử & Biên dịch Tự động

- **Bộ kiểm thử đơn vị & tích hợp LEAN-UX.2:**
  - `src/test/leanUx2DeduplicationAndIntegrity.test.ts`: **15/15 tests PASS (100%)**
  - Toàn bộ test suite dự án: **445/445 tests PASS (58 suites, 0 fail, 0 skipped)**
- **Kiểm tra Biên dịch (Build verification):**
  - `compile_applet`: **Build succeeded - the applet is compiled (0 error, 0 warning)**.
