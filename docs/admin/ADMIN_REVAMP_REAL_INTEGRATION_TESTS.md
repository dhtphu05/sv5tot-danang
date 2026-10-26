# 5TOT ĐÀ NẴNG — ADMIN-REVAMP: REAL INTEGRATION & ACCEPTANCE TESTS

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Tệp kiểm thử tự động:** `backend/tests/http/adminRevampAcceptance.test.ts` (**826 dòng**)

---

## 1. Kết quả Thực thi Kiểm thử Tự động

- **Lệnh kiểm thử:** `npm --prefix backend test`
- **Tổng số bài kiểm thử Backend V2:** **322 bài kiểm thử / 55 bộ suite — ĐẠT 100% (`pass 322, fail 0`)**.
- **Bộ kiểm thử nghiệm thu ADMIN-REVAMP (`AD01–AD55` & Kịch bản `A–G`):** Đạt tuyệt đối toàn bộ các bài kiểm thử HTTP tích hợp trên `createApp()`.

---

## 2. Ma trận Bao phủ Kịch bản Nghiệm thu (`AD01–AD55` & `Scenarios A–G`)

| Kịch bản | Mã kiểm thử | Nội dung kiểm chứng trên HTTP API (`/api/v2/*`) | Kết quả |
|---|---|---|---|
| **Scenario A: First-Admin Bootstrap** | `AD01`–`AD08` | Kiểm tra `GET /api/v2/admin/bootstrap/status` khi chưa có ADMIN (`bootstrapRequired: true`); chặn `setupToken` sai với `403 INVALID_BOOTSTRAP_TOKEN`; khởi tạo ADMIN đầu tiên qua `POST /api/v2/admin/bootstrap/initialize` (`201 Created`); xác thực đăng nhập ADMIN; chặn vĩnh viễn mọi lần gọi bootstrap tiếp theo với `409 ADMIN_BOOTSTRAP_ALREADY_COMPLETED`. | **PASS** |
| **Scenario E: Staff Account Provisioning & RBAC** | `AD09`–`AD18` | Chặn tạo `SCHOOL_OFFICER` thiếu `schoolReviewUnitId` (`400 SCHOOL_REVIEW_UNIT_REQUIRED`); cấp tài khoản `SCHOOL_OFFICER` cho `unit-udn` bằng mã mời; gửi lại lời mời (`resend-invite`); kích hoạt lời mời (`activate-invite`) và đăng nhập thành công; cấp tài khoản `CITY_OFFICER`, `CITY_COMMITTEE`; đặt lại mật khẩu thu hồi phiên (`reset-password`); bảo vệ chống khóa hoặc hạ quyền ADMIN cuối cùng (`409 LAST_ACTIVE_ADMIN_LOCKOUT_PREVENTED`). | **PASS** |
| **Scenario D: Institutions & `unit-udn` Mapping** | `AD19`–`AD27` | Xác nhận `GET /api/v2/school-review-units/mapping/validate` trả về đủ 8 trường thành viên ĐHĐN thuộc `unit-udn`; chặn mọi thao tác tách trường thành viên ĐHĐN khỏi `unit-udn` với `400 UDN_SHARED_UNIT_INVARIANT_VIOLATION`; thêm trường mới và tạm ngưng mềm qua `PATCH /api/v2/institutions/:id/status`. | **PASS** |
| **Scenario B & C: Copy Season, Criteria & Dry-Run** | `AD28`–`AD39` | Sao chép cấu hình từ mùa `2025-2026` sang mùa nháp mới qua `POST /api/v2/admin/seasons/copy-and-prepare` (sao chép 5 nhóm tiêu chí Cá nhân + 4 tiêu chuẩn Tập thể, không sao chép hồ sơ/minh chứng/quyết định); cập nhật tiêu chí trên mùa `DRAFT`; chặn ghi đè tiêu chí mùa đã đóng (`409 SEASON_CRITERIA_FROZEN`); kiểm thử quy tắc Advisory Dry-Run cho Cá nhân & Tập thể (`isSubmissionBlocked: false`, `tt02.isMet: true`, `tt03.isMet: true`). | **PASS** |
| **Scenario F: 8-Gate Readiness & Season Activation** | `AD40`–`AD49` | Kiểm tra `GET /api/v2/admin/seasons/:id/readiness` trả về đủ 8 cổng kiểm tra (`isReadyToActivate: true`, `blockingFailureCount: 0`); kích hoạt mùa xét mới qua `POST /api/v2/admin/seasons/:id/activate` và tự động đóng mùa cũ (`CLOSED`); xem trước mẫu thông báo an toàn (`massEmailDispatched: false`); cập nhật quy định vận hành (`96 giờ`); kiểm tra sức khỏe tích hợp và xuất danh mục tham chiếu JSON. | **PASS** |
| **Scenario G: Role Boundary Negative Tests** | `AD50`–`AD55` | Chặn `STUDENT`, `SCHOOL_OFFICER`, `CITY_OFFICER`, `CITY_COMMITTEE` truy cập `/api/v2/admin/*` (`403 FORBIDDEN`); chặn tài khoản kỹ thuật `ADMIN` thực hiện gửi danh sách đề xuất cấp Trường (`403`), kết luận thẩm định cấp Thành phố (`403`) và ra quyết định Hội đồng (`403`). | **PASS** |
