# 5TOT ĐÀ NẴNG — ADMIN-REVAMP: CURRENT STATE AUDIT

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Phạm vi kiểm toán:** Toàn bộ phân hệ Quản trị Hệ thống (Frontend `src/staff/components/admin/*`, `src/features/admin-control-plane/*` & Backend V2 `backend/src/modules/*`)

---

## 1. Phân loại trạng thái trước và sau khi nâng cấp (Audit Classification Matrix)

| STT | Nhóm chức năng Quản trị | Trạng thái trước ADMIN-REVAMP | Trạng thái sau ADMIN-REVAMP | Frontend Route | Backend V2 Endpoint (`backend/src/`) | Nguồn lưu trữ (Persistence) |
|---|---|---|---|---|---|---|
| 1 | **Tổng quan hệ thống & Sẵn sàng vận hành** | `PARTIALLY IMPLEMENTED` (Có nhãn cứng `2026–2027`, thiếu chỉ số sẵn sàng vận hành và số liệu Tập thể) | `IMPLEMENTED AND VERIFIED` | `/staff/admin/overview` (`admin_home`) | `GET /api/v2/admin/control-plane` | `AwardSeason`, `Institution`, `SchoolReviewUnit`, `User`, `IndividualApplication`, `CollectiveApplication` |
| 2 | **Khởi tạo Quản trị viên đầu tiên (Zero-Manual-Seed Bootstrap)** | `NOT IMPLEMENTED` (Phải chạy seed/SQL thủ công để tạo ADMIN đầu tiên) | `IMPLEMENTED AND VERIFIED` | `/staff/admin/staff` (Banner & Modal Bootstrap) | `GET /api/v2/admin/bootstrap/status`<br>`POST /api/v2/admin/bootstrap/initialize` | `User`, `UserRoleAssignment`, `AdminAuditEvent`, khóa vĩnh viễn sau khi có >= 1 ADMIN |
| 3 | **Quản lý Mùa xét chọn & Tạo mới / Sao chép mùa trước** | `PARTIALLY IMPLEMENTED` (Chưa có luồng sao chép cấu hình từ mùa trước trên API Backend V2) | `IMPLEMENTED AND VERIFIED` | `/staff/admin/seasons` (`admin_seasons`) | `GET /api/v2/seasons`<br>`POST /api/v2/seasons`<br>`POST /api/v2/admin/seasons/copy-and-prepare` | `AwardSeason`, `CriterionGroup`, `RequirementDefinition` (Không sao chép hồ sơ/minh chứng/quyết định) |
| 4 | **Kiểm tra 8 điều kiện sẵn sàng & Kích hoạt / Đóng / Lưu trữ mùa xét** | `PARTIALLY IMPLEMENTED` (Thiếu checklist 8 cổng kiểm tra nghiệp vụ trước khi mở mùa) | `IMPLEMENTED AND VERIFIED` | `/staff/admin/seasons` (`data-testid="season-readiness-checklist"`) | `GET /api/v2/admin/seasons/:id/readiness`<br>`POST /api/v2/admin/seasons/:id/activate`<br>`PATCH /api/v2/seasons/:id/close`<br>`PATCH /api/v2/seasons/:id/archive` | `AwardSeason` (Đảm bảo tối đa 01 mùa `ACTIVE` tại một thời điểm) |
| 5 | **Tiến độ & Thời hạn xét chọn kiểu Trung ương (`T01`–`T07`)** | `PARTIALLY IMPLEMENTED` (Chưa tách rõ làn Tập thể `T04` song song với `T01`–`T03`) | `IMPLEMENTED AND VERIFIED` | `/staff/admin/deadlines` (`admin_deadlines`) | `GET /api/v2/public/season-context`<br>`GET /api/v2/seasons/context`<br>`PUT /api/v2/seasons/:id` | `AwardSeason` (`T01`..`T07` theo múi giờ `Asia/Ho_Chi_Minh`) |
| 6 | **Quản lý Tiêu chuẩn Cá nhân (05 tiêu chí) & Tập thể (`TT01`–`TT04`) + Kiểm thử quy tắc (Dry-Run)** | `PARTIALLY IMPLEMENTED` (Thiếu cấu hình ngưỡng Tập thể `TT01`–`TT04` và bộ kiểm thử quy tắc trực quan trên Admin UI) | `IMPLEMENTED AND VERIFIED` | `/staff/admin/criteria` (`admin_criteria`) | `GET /api/v2/seasons/:id/criteria`<br>`GET /api/v2/seasons/:id/collective-criteria`<br>`PUT /api/v2/seasons/:id/criteria`<br>`POST /api/v2/seasons/:id/criteria/evaluate-individual`<br>`POST /api/v2/seasons/:id/criteria/evaluate-collective` | `CriterionGroup`, `RequirementDefinition` (Khóa bất biến `409 SEASON_CRITERIA_FROZEN` với mùa đã đóng) |
| 7 | **Quản lý Đơn vị đào tạo & Phân tuyến Đơn vị xét sơ tuyển (`unit-udn`)** | `PARTIALLY IMPLEMENTED` (Thiếu bảng kiểm tra phân tuyến 8 trường ĐHĐN -> `unit-udn` trên UI) | `IMPLEMENTED AND VERIFIED` | `/staff/admin/institutions` (`admin_institutions`) | `GET /api/v2/institutions`<br>`POST /api/v2/institutions`<br>`PATCH /api/v2/institutions/:id/status`<br>`GET /api/v2/school-review-units/mapping/validate`<br>`PUT /api/v2/school-review-units/:id` | `Institution`, `SchoolReviewUnit` (Bảo vệ bất biến 8 trường ĐHĐN chung `unit-udn`) |
| 8 | **Quản lý Tài khoản Cán bộ, Phân quyền RBAC & Lời mời / Đặt lại mật khẩu** | `PARTIALLY IMPLEMENTED` (Thiếu gửi lại mã mời, đặt lại mật khẩu thu hồi phiên và khóa chống tự khóa ADMIN cuối cùng trên Backend V2) | `IMPLEMENTED AND VERIFIED` | `/staff/admin/staff` (`admin_staff`) | `GET /api/v2/admin/staff`<br>`POST /api/v2/admin/staff`<br>`POST /api/v2/admin/staff/activate-invite`<br>`POST /api/v2/admin/staff/:id/resend-invite`<br>`POST /api/v2/admin/staff/:id/reset-password`<br>`PUT /api/v2/admin/staff/:id/role`<br>`PATCH /api/v2/admin/staff/:id/status` | `User`, `UserRoleAssignment`, `UserSession` |
| 9 | **Vận hành & Cấu hình (Mẫu thông báo, Quy định vận hành, Sức khỏe tích hợp, Xuất danh mục)** | `FRONTEND ONLY / PARTIAL` (Chưa có màn hình thống nhất cho mẫu thông báo, chính sách bổ sung, chẩn đoán tích hợp và xuất JSON tham chiếu) | `IMPLEMENTED AND VERIFIED` | `/staff/admin/operations` (`admin_operations`) | `GET/PUT /api/v2/admin/notifications`<br>`POST /api/v2/admin/notifications/:id/preview`<br>`GET/PUT /api/v2/admin/workflow-policy`<br>`GET /api/v2/admin/system-health`<br>`GET /api/v2/admin/export/reference-data` | `NotificationTemplate`, `WorkflowOperationalPolicy`, `SystemHealthDiagnostic` |
| 10 | **Nhật ký kiểm toán bất biến (Audit Logs)** | `IMPLEMENTED` | `IMPLEMENTED AND VERIFIED` | `/staff/admin/audit` (`admin_audit`) | `GET /api/v2/admin/audit-events`<br>`GET /api/v2/audit-logs` | `AuditLog` (Bất biến, tự động che mật khẩu/token `[REDACTED]`) |

---

## 2. Tuân thủ Kiến trúc & Giới hạn Độ dài Tệp mã nguồn

- **Kiến trúc Backend thống nhất:** Toàn bộ mã nguồn Backend của phân hệ Quản trị và Tiến độ xét chọn nằm hoàn toàn trong `backend/src/modules/{admin,seasons,criteria,institutions,schoolReviewUnits}` và được gắn vào `backend/src/app/createApp.ts` dưới tiền tố `/api/v2`. Không sử dụng thư mục `/server`.
- **Giới hạn độ dài tệp (`< 1,000` dòng cho mọi tệp chỉnh sửa, tuyệt đối không có tệp nào `> 1,500` dòng):**
  - `src/features/admin-control-plane/useAdminControlPlane.ts`: **632 dòng**
  - `src/features/admin-control-plane/useAdminSeasonAndOperations.ts`: **863 dòng**
  - `backend/src/modules/admin/admin.service.ts`: **996 dòng**
  - `src/staff/components/admin/SeasonManagement.tsx`: **961 dòng**
  - `src/staff/components/admin/CriteriaManagement.tsx`: **774 dòng**
  - `src/staff/components/admin/InstitutionManagement.tsx`: **996 dòng**
  - `src/staff/components/admin/StaffManagement.tsx`: **993 dòng**
  - `src/staff/components/admin/OperationsConfigView.tsx`: **405 dòng**
