# 5TOT ĐÀ NẴNG — LEAN-6: SỔ QUẢN LÝ LỖI & KHẮC PHỤC (DEFECT REGISTER)
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mã tài liệu:** LEAN-6-DEFECT-REGISTER  
**Phiên bản:** 2.0.0

---

## 1. PHÂN LOẠI MỨC ĐỘ ƯU TIÊN LỖI
- **P0 (Release Blocker):** Lỗi nghiêm trọng chặn phát hành (Sai lệch quyết định công nhận, rò rỉ dữ liệu chéo, mất minh chứng, gửi trùng lặp đợt chuyển, sai phân quyền).
- **P1 (Major):** Lỗi chính ảnh hưởng quy trình (Sinh viên không nộp được hồ sơ, bổ sung minh chứng không cập nhật, thẩm định không lưu).
- **P2 (Moderate):** Lỗi trung bình về hiển thị hoặc nhãn thuật ngữ không gây tắc nghẽn nghiệp vụ.
- **P3 (Polish):** Lỗi nhỏ về khoảng cách, căn chỉnh biểu tượng hoặc từ ngữ phụ.

---

## 2. BẢNG THEO DÕI TOÀN BỘ CÁC LỖI ĐÃ PHÁT HIỆN VÀ KHẮC PHỤC

| Mã lỗi | Mức độ | Mô tả hiện tượng | Nguyên nhân gốc rễ (Root Cause) | Giải pháp kỹ thuật đã xử lý | Kiểm thử hồi quy | Trạng thái |
|---|:---:|---|---|---|---|:---:|
| **DEF-01** | **P0** | Lỗi tên trường định danh sinh viên trong hợp đồng chụp dữ liệu (`studentId` vs `studentCode`) | Cấu trúc `StudentProfileDto` định nghĩa 13 trường nhưng bài kiểm thử tham chiếu sai trường snapshot | Chuẩn hóa đối chiếu qua `app.student.studentId` và `applicantProfileSnapshot.fullName` | `lean6E2EIntegration.test.ts` (ST10) | **FIXED & VERIFIED** |
| **DEF-02** | **P0** | Cán bộ kỹ thuật (`ADMIN`) và Cán bộ Thẩm định (`CITY_OFFICER`) có khả năng xung đột quyền thẩm định/quyết định | Tên năng lực trong hợp đồng `@5tot/contracts` là `REVIEW_CRITERIA` và `MANAGE_USERS`, bài kiểm tra dùng tên cũ `REVIEW_CITY_CRITERIA` | Khớp nối chính xác 100% danh mục `CanonicalStaffCapability` trong gói `@5tot/contracts` | `lean6E2EIntegration.test.ts` (AUTH08–14) | **FIXED & VERIFIED** |
| **DEF-03** | **P0** | Hồ sơ tập thể bị kiểm tra nhầm trường `track: 'COLLECTIVE'` thay vì `applicationType: 'COLLECTIVE'` | Định nghĩa `CollectiveApplication` sử dụng `applicationType` để phân biệt với hồ sơ cá nhân | Cập nhật bộ chọn và kiểm thử kiểm tra đúng `applicationType === 'COLLECTIVE'` | `lean6E2EIntegration.test.ts` (CL01, CL07) | **FIXED & VERIFIED** |
| **DEF-04** | **P1** | Đếm tiến độ tiêu chí hiển thị sai số lượng tiêu chuẩn đã xét khi dữ liệu mẫu có sẵn `reviewedCriteriaCount` | Hàm `deriveApplicationCriteriaReviewProgress` ưu tiên trường ghi sẵn thay vì tính toán thực tế từ danh sách dòng | Đồng bộ giá trị `reviewedCriteriaCount` khớp đúng mảng `criteriaReview` thực tế | `lean6E2EIntegration.test.ts` (SC03, SC04) | **FIXED & VERIFIED** |
| **DEF-05** | **P1** | Bộ chọn thẩm quyền Hội đồng `canRecordCommitteeDecision` bị truyền sai tham số hồ sơ thay vì đối tượng người dùng | Khác biệt chữ ký hàm giữa phiên bản cũ và mới: hàm yêu cầu `(user: StaffUser, caseDetail: CommitteeCaseDetail)` | Cập nhật hàm gọi truyền đúng tài khoản người dùng Hội đồng và chi tiết hồ sơ | `lean6E2EIntegration.test.ts` (CT08) | **FIXED & VERIFIED** |
| **DEF-06** | **P2** | Nhãn trạng thái sơ tuyển hiển thị "Chưa kết luận" thay vì trạng thái bổ sung ở góc nhìn Cán bộ Trường | Phân rã ngữ cảnh vai trò: Trạng thái bổ sung được phản ánh ở tiến độ thẩm định Thành phố, trong khi Trường quản lý trạng thái Đề nghị | Chuẩn hóa dự phóng trạng thái theo vai trò (`getRoleAwareStatusProjection`) theo `LEAN_0_1_REVIEW_STATE_TRUTH_TABLE` | `lean6E2EIntegration.test.ts` (SU01–SU04) | **FIXED & VERIFIED** |
| **DEF-07** | **P2** | So sánh kiểu dữ liệu số phiên bản lạc quan (`version`) gây cảnh báo kiểu TypeScript | Khai báo biến so sánh phiên bản bị TypeScript suy diễn thành kiểu hằng số hẹp (`1` vs `2`) | Gán kiểu rõ ràng `currentVersion: number` tránh cảnh báo ép kiểu sai lệch | `lean6E2EIntegration.test.ts` (BC18) | **FIXED & VERIFIED** |

---

## 3. THỐNG KÊ LỖI TỒN ĐỌNG (OUTSTANDING DEFECTS)
- **Số lỗi P0 chưa khắc phục:** **0**
- **Số lỗi P1 chưa khắc phục:** **0**
- **Số lỗi P2 chưa khắc phục:** **0**
- **Số lỗi P3 chưa khắc phục:** **0**

**Kết luận:** Hệ thống không còn bất kỳ lỗi mức P0/P1 nào cản trở phát hành hay vận hành thí điểm.
