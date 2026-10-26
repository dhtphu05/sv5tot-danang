# 5TOT ĐÀ NẴNG — ADMIN-REVAMP: UX & NAVIGATION ARCHITECTURE

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng

---

## 1. Cấu trúc Điều hướng Quản trị Hệ thống (Consolidated Admin Navigation)

Hệ thống điều hướng của Quản trị viên (`ADMIN`) trong `src/staff/components/shell/StaffAppShell.tsx` và `src/staff/permissions.ts` được tổ chức thành các đích đến rõ ràng, mỗi màn hình giải quyết một nhiệm vụ quản trị độc lập:

| Nhóm điều hướng | Route ID (`StaffRouteId`) | Đường dẫn URL | Nhiệm vụ cốt lõi trên màn hình | Component chính |
|---|---|---|---|---|
| **A. Tổng quan hệ thống** | `admin_home` | `/staff/admin/overview` | Hiển thị mùa xét đang mở, số trường tham gia, số Đơn vị xét sơ tuyển, số tài khoản cán bộ, tiến độ hồ sơ Cá nhân & Tập thể, huy hiệu Sẵn sàng vận hành và danh sách cảnh báo cấu hình. | `src/staff/components/admin/AdminHome.tsx` |
| **B. Mùa xét & thời hạn** | `admin_seasons`<br>`admin_deadlines` | `/staff/admin/seasons`<br>`/staff/admin/deadlines` | Tạo mùa xét mới, sao chép cấu hình từ mùa trước, kiểm tra 8 cổng sẵn sàng trước khi kích hoạt, đóng/lưu trữ mùa xét, và quản lý chi tiết tiến độ 7 giai đoạn `T01`–`T07`. | `src/staff/components/admin/SeasonManagement.tsx`<br>`src/staff/components/admin/DeadlineManagement.tsx` |
| **C. Tiêu chuẩn xét chọn** | `admin_criteria` | `/staff/admin/criteria` | Cấu hình bộ 05 tiêu chí Cá nhân, bộ 04 tiêu chuẩn Tập thể (`TT01`–`TT04`), và công cụ Kiểm thử quy tắc (Dry-Run Evaluator). | `src/staff/components/admin/CriteriaManagement.tsx`<br>`src/staff/components/admin/CriteriaCollectiveAndDryRunPanel.tsx` |
| **D. Đơn vị & phân tuyến** | `admin_institutions` | `/staff/admin/institutions` | Quản lý danh bạ cơ sở đào tạo (Đại học, Học viện, Cao đẳng), trạng thái tham gia mùa xét và bảng kiểm tra phân tuyến Đơn vị xét sơ tuyển (`unit-udn` cho 8 trường ĐHĐN). | `src/staff/components/admin/InstitutionManagement.tsx`<br>`src/staff/components/admin/SchoolReviewUnitMappingPanel.tsx` |
| **E. Tài khoản & phân quyền** | `admin_staff`<br>`admin_permissions` | `/staff/admin/staff`<br>`/staff/admin/permissions` | Khởi tạo Quản trị viên đầu tiên (Bootstrap), cấp tài khoản cán bộ (Cấp Trường, Cấp Thành phố, Hội đồng), gửi lại lời mời, đặt lại mật khẩu và tra cứu ma trận phân quyền RBAC. | `src/staff/components/admin/StaffManagement.tsx`<br>`src/staff/components/admin/StaffProvisioningPanels.tsx`<br>`src/staff/components/admin/PermissionsOverview.tsx` |
| **F. Vận hành & cấu hình** | `admin_operations`<br>`admin_audit` | `/staff/admin/operations`<br>`/staff/admin/audit` | Quản lý mẫu thông báo + Xem trước an toàn (không gửi email hàng loạt), chính sách bổ sung minh chứng, chẩn đoán sức khỏe tích hợp, xuất JSON danh mục tham chiếu và nhật ký kiểm toán. | `src/staff/components/admin/OperationsConfigView.tsx`<br>`src/staff/components/admin/AuditLogView.tsx` |

---

## 2. Nguyên tắc Thiết kế Trải nghiệm Quản trị (UX Principles)

1. **Một tác vụ trọng tâm trên mỗi màn hình:** Không lặp lại bảng danh sách hồ sơ nghiệp vụ trên màn hình Tổng quan Quản trị; không hiển thị JSON thô làm giao diện chính.
2. **Tương tác chuẩn hóa:** `Danh sách` → `Thêm / Chỉnh sửa` → `Kiểm tra hợp lệ` → `Lưu` → `Xác nhận kết quả & Ghi nhận Nhật ký hệ thống`.
3. **Kích hoạt mùa xét có kiểm soát:** `Cấu hình` → `Kiểm tra 8 điều kiện sẵn sàng (Readiness Checklist)` → `Xác nhận kích hoạt mùa xét`.
4. **Ngôn ngữ Tiếng Việt hành chính chuẩn mực:** Sử dụng thuật ngữ chính thức của Hội Sinh viên Việt Nam TP. Đà Nẵng (ví dụ: *Đơn vị xét sơ tuyển*, *Hội đồng xét chọn cấp Thành phố*, *Bản nháp*, *Đang mở nhận hồ sơ*).
