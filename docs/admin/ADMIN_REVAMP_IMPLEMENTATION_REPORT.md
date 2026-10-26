# 5TOT ĐÀ NẴNG — ADMIN-REVAMP: IMPLEMENTATION REPORT

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng

---

## 1. Tổng quan Triển khai Kỹ thuật

Dự án **ADMIN-REVAMP** đã hoàn thiện trung tâm điều hành Quản trị Hệ thống cho ứng dụng **5TOT Đà Nẵng** trên cả hai tầng **Backend V2 (`backend/src/`)** và **Frontend (`src/`)**, cho phép Quản trị viên Hội Sinh viên chuẩn bị, cấu hình, kiểm tra sẵn sàng, kích hoạt, điều hành và đóng một mùa xét chọn hoàn chỉnh trực tiếp trên giao diện web mà không cần can thiệp SQL hay chạy script seed.

---

## 2. Danh mục Tệp Mã nguồn Đã Triển khai / Nâng cấp

### A. Shared Domain Contracts (`packages/contracts/`)
- `packages/contracts/src/seasonTimeline.ts` (**843 dòng**): Định nghĩa hợp đồng dữ liệu Tiến độ Trung ương (`T01`–`T07`), hàm chuẩn hóa nhãn năm học bất biến (`formatAcademicYearLabel`, `formatShortAcademicYear`, `validateAcademicYearCode`) và hàm giải quyết ngữ cảnh mùa xét 4 tầng (`resolveSeasonContext`).

### B. Backend V2 (`backend/src/modules/`) — Không sử dụng `/server`
- `backend/src/modules/admin/`:
  - `admin.types.ts`, `admin.repository.ts`, `prismaAdmin.repository.ts`, `admin.schemas.ts`, `admin.service.ts` (**996 dòng**), `admin.controller.ts`, `admin.routes.ts`.
  - Cung cấp đầy đủ API `/api/v2/admin/*`: First-Admin Bootstrap, 8-Gate Season Readiness, Copy-and-Prepare Season, Activate Season, Staff Provisioning / Invite Resend / Password Reset / Role & Status Lifecycle, Notification Templates & Safe Preview, Workflow Policy, System Health Diagnostics, Reference Catalog Export và Immutable Audit Events.
- `backend/src/modules/seasons/`:
  - `seasonTimeline.helper.ts` (**329 dòng**), `season.types.ts`, `season.repository.ts`, `prismaSeason.repository.ts`, `season.schemas.ts`, `season.service.ts` (**442 dòng**), `season.controller.ts`, `season.routes.ts`.
- `backend/src/modules/criteria/`:
  - `criteria.service.ts` (**490 dòng**), `criteria.controller.ts`, `criteria.routes.ts` (Hỗ trợ sao chép tiêu chí sang mùa mới, khóa bất biến `409 SEASON_CRITERIA_FROZEN` với mùa đã đóng, và bộ kiểm thử quy tắc Advisory Dry-Run cho Cá nhân & Tập thể `TT01`–`TT04`).
- `backend/src/modules/institutions/` & `backend/src/modules/schoolReviewUnits/`:
  - Bổ sung `PATCH /api/v2/institutions/:id/status` (tạm ngưng mềm bảo toàn dữ liệu lịch sử), `GET /api/v2/school-review-units/mapping/validate`, và chốt chặn `UDN_SHARED_UNIT_INVARIANT_VIOLATION` bảo vệ cụm `unit-udn` 8 trường ĐHĐN.
- `backend/src/app/createApp.ts` (**294 dòng**): Gắn kết đầy đủ `/api/v2/admin`, `/api/v2/public/season-context` và toàn bộ các phân hệ nghiệp vụ.

### C. Frontend Admin Control Plane & UI (`src/`)
- `src/features/admin-control-plane/useAdminControlPlane.ts` (**632 dòng**) & `src/features/admin-control-plane/useAdminSeasonAndOperations.ts` (**863 dòng**): Hook điều phối trạng thái Quản trị được tách mô-đun gọn gàng dưới 1.000 dòng.
- `src/staff/components/admin/AdminHome.tsx` (**497 dòng**): Tổng quan hệ thống với số liệu thực, chỉ báo Sẵn sàng vận hành và điều hướng nhanh.
- `src/staff/components/admin/SeasonManagement.tsx` (**961 dòng**) & `src/staff/components/admin/DeadlineManagement.tsx`: Quản lý mùa xét, sao chép cấu hình từ mùa trước, bảng kiểm tra 8 điều kiện sẵn sàng trước kích hoạt và tiến độ 7 giai đoạn `T01`–`T07`.
- `src/staff/components/admin/CriteriaManagement.tsx` (**774 dòng**) & `src/staff/components/admin/CriteriaCollectiveAndDryRunPanel.tsx` (**313 dòng**): Cấu hình 05 tiêu chí Cá nhân, 04 tiêu chuẩn Tập thể `TT01`–`TT04` và bộ Kiểm thử quy tắc (Dry-Run Evaluator).
- `src/staff/components/admin/InstitutionManagement.tsx` (**996 dòng**) & `src/staff/components/admin/SchoolReviewUnitMappingPanel.tsx` (**153 dòng**): Quản lý trường đào tạo và phân tuyến Đơn vị xét sơ tuyển (`unit-udn`).
- `src/staff/components/admin/StaffManagement.tsx` (**993 dòng**) & `src/staff/components/admin/StaffProvisioningPanels.tsx` (**267 dòng**): Khởi tạo Quản trị viên đầu tiên (Bootstrap), cấp tài khoản cán bộ, gửi lại mã mời, đặt lại mật khẩu và khóa bảo vệ ADMIN cuối cùng.
- `src/staff/components/admin/OperationsConfigView.tsx` (**405 dòng**): Quản lý mẫu thông báo (kèm Xem trước an toàn), quy định vận hành, sức khỏe hệ thống và xuất danh mục tham chiếu JSON.
