# 5TOT ĐÀ NẴNG — ADMIN-REVAMP: SECURITY & ZERO-MANUAL-SEED BOOTSTRAP

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng

---

## 1. Cơ chế Khởi tạo Quản trị viên Đầu tiên (Zero-Manual-Seed First-Admin Bootstrap)

Để loại bỏ hoàn toàn việc lập trình viên phải chạy câu lệnh SQL hoặc script seed thủ công trên cơ sở dữ liệu sản xuất khi bàn giao hệ thống mới:

### Quy trình hoạt động
1. **Kiểm tra trạng thái (`GET /api/v2/admin/bootstrap/status`):**
   - Trả về `bootstrapRequired: true`, `isLocked: false`, `activeAdminCount: 0` chỉ khi hệ thống chưa có bất kỳ tài khoản `ADMIN` nào đang hoạt động và chưa từng hoàn tất bootstrap.
   - Không tiết lộ mã bí mật khởi tạo (`ADMIN_BOOTSTRAP_TOKEN`) trong phản hồi API.
2. **Khởi tạo tài khoản Quản trị viên đầu tiên (`POST /api/v2/admin/bootstrap/initialize`):**
   - Yêu cầu cung cấp `setupToken` khớp với biến môi trường `ADMIN_BOOTSTRAP_TOKEN` trên máy chủ, cùng với `email`, `fullName`, `password` (tối thiểu 8 ký tự).
   - Băm mật khẩu bằng thuật toán chuẩn (`Argon2id` / `PasswordHasher`), tạo tài khoản `ADMIN` đầu tiên và ghi nhận dấu vết kiểm toán `ADMIN_BOOTSTRAP_INITIALIZED` (với `setupToken: '[REDACTED]'`, `password: '[REDACTED]'`).
3. **Khóa vĩnh viễn sau lần khởi tạo đầu tiên:**
   - Ngay sau khi tài khoản `ADMIN` đầu tiên được tạo, trạng thái `isLocked` chuyển sang `true` vĩnh viễn.
   - Mọi yêu cầu gọi lại `POST /api/v2/admin/bootstrap/initialize` đều bị từ chối với mã lỗi `409 Conflict` (`ADMIN_BOOTSTRAP_ALREADY_COMPLETED`).
4. **Chống vét cạn mã khởi tạo (Brute-Force Protection):**
   - Giới hạn tối đa 5 lần nhập sai `setupToken` (`MAX_BOOTSTRAP_ATTEMPTS = 5`). Khi vượt quá ngưỡng, hệ thống trả về `429 Too Many Requests` (`TOO_MANY_BOOTSTRAP_ATTEMPTS`) và ghi nhật ký cảnh báo bảo mật.

---

## 2. Bảo vệ Vòng đời Tài khoản Cán bộ & Phân quyền RBAC

1. **Chống tự khóa Quản trị viên cuối cùng (`LAST_ACTIVE_ADMIN_LOCKOUT_PREVENTED`):**
   - Hệ thống kiểm tra số lượng `ADMIN` đang ở trạng thái `ACTIVE`. Nếu chỉ còn 01 `ADMIN` duy nhất, mọi thao tác tạm ngưng (`SUSPENDED`), khóa (`LOCKED`) hoặc đổi vai trò sang vai trò khác đối với tài khoản đó đều bị chặn với mã `409 Conflict`.
2. **Thu hồi phiên đăng nhập tức thì khi đặt lại mật khẩu / đổi quyền / khóa tài khoản:**
   - Khi Quản trị viên đặt lại mật khẩu (`POST /api/v2/admin/staff/:id/reset-password`), đổi vai trò (`PUT /api/v2/admin/staff/:id/role`) hoặc tạm ngưng tài khoản (`PATCH /api/v2/admin/staff/:id/status`), `SessionService.revokeAllUserSessions` lập tức thu hồi toàn bộ phiên đăng nhập hiện hành của tài khoản đó.
3. **Bắt buộc phạm vi Đơn vị xét sơ tuyển cho Cán bộ cấp Trường:**
   - Khi tạo hoặc cập nhật tài khoản có vai trò `SCHOOL_OFFICER`, hệ thống bắt buộc phải có `schoolReviewUnitId` hợp lệ (`400 SCHOOL_REVIEW_UNIT_REQUIRED`).
4. **Kiểm soát Ranh giới Vai trò Nghiêm ngặt (Privilege Separation):**
   - Mọi đường dẫn `/api/v2/admin/*` (trừ cổng bootstrap/kích hoạt lời mời) đều yêu cầu xác thực JWT và `requireRole('ADMIN')`.
   - Ngược lại, tài khoản kỹ thuật `ADMIN` bị chặn (`403 FORBIDDEN`) tại các endpoint nghiệp vụ thực chất của Cấp Trường (`POST /api/v2/school-forwarding-batch/confirm`), Cấp Thành phố (`POST /api/v2/city-workflow/:id/complete`) và Hội đồng (`POST /api/v2/committee/decision`).
