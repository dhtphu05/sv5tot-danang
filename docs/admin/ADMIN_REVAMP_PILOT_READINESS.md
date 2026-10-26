# 5TOT ĐÀ NẴNG — ADMIN-REVAMP: PILOT READINESS ASSESSMENT

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Trạng thái Đánh giá:** **READY FOR PILOT / PRODUCTION HANDOFF (SẴN SÀNG VẬN HÀNH THỰC TẾ)**

---

## 1. Bảng Kiểm tra Sẵn sàng Vận hành Không Phụ thuộc Lập trình viên (Zero-Developer-Dependency Checklist)

| STT | Tiêu chí Sẵn sàng Vận hành | Trạng thái | Minh chứng Kỹ thuật |
|---|---|---|---|
| 1 | Khởi tạo Quản trị viên đầu tiên không cần chạy SQL / seed script | **ĐẠT** | `GET /api/v2/admin/bootstrap/status`, `POST /api/v2/admin/bootstrap/initialize`, khóa vĩnh viễn sau lần tạo đầu tiên. |
| 2 | Cấp tài khoản Cán bộ cấp Trường (`unit-udn` và trường độc lập), Cấp Thành phố và Hội đồng từ giao diện Web | **ĐẠT** | `POST /api/v2/admin/staff`, hỗ trợ kích hoạt lời mời, gửi lại lời mời, đặt lại mật khẩu và thu hồi phiên đăng nhập. |
| 3 | Quản lý danh mục Trường Đại học / Cao đẳng / Học viện và bảo vệ phân tuyến 8 trường ĐHĐN chung `unit-udn` | **ĐẠT** | `POST/PUT/PATCH /api/v2/institutions`, `GET /api/v2/school-review-units/mapping/validate`, `UDN_SHARED_UNIT_INVARIANT_VIOLATION`. |
| 4 | Tạo mùa xét mới, sao chép cấu hình từ mùa trước mà không cần xóa cơ sở dữ liệu | **ĐẠT** | `POST /api/v2/admin/seasons/copy-and-prepare`, bảo toàn toàn bộ hồ sơ và quyết định của các mùa trước. |
| 5 | Chỉnh sửa tiêu chí Cá nhân (05 tiêu chí) & Tập thể (`TT01`–`TT04`) và kiểm thử quy tắc (Dry-Run) trên giao diện Web | **ĐẠT** | `PUT /api/v2/seasons/:id/criteria`, `POST /api/v2/seasons/:id/criteria/evaluate-individual`, `evaluate-collective`. |
| 6 | Điều chỉnh thời hạn nộp hồ sơ & thẩm định (`T01`–`T07`) không cần sửa tệp `.env` hay build lại Frontend | **ĐẠT** | `PUT /api/v2/seasons/:id`, `GET /api/v2/public/season-context`, đồng bộ thời gian thực theo múi giờ `Asia/Ho_Chi_Minh`. |
| 7 | Kiểm tra 8 điều kiện sẵn sàng trước khi kích hoạt mùa xét và chống tự khóa tài khoản `ADMIN` cuối cùng | **ĐẠT** | `GET /api/v2/admin/seasons/:id/readiness`, `POST /api/v2/admin/seasons/:id/activate`, `409 LAST_ACTIVE_ADMIN_LOCKOUT_PREVENTED`. |
| 8 | Ranh giới phân quyền nghiêm ngặt (Admin không làm thay Cấp Trường, Cấp Thành phố hay Hội đồng) | **ĐẠT** | Kiểm chứng tự động tại `Scenario G (AD50–AD55)` trong `backend/tests/http/adminRevampAcceptance.test.ts`. |

---

## 2. Kết luận Bàn giao Vận hành

Hệ thống Quản trị **5TOT Đà Nẵng** đã đáp ứng đầy đủ các yêu cầu của **ADMIN-REVAMP**. Cán bộ chuyên trách được ủy quyền của Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng có thể chủ động chuẩn bị, cấu hình, mở, theo dõi và đóng toàn bộ mùa xét chọn danh hiệu *Sinh viên 5 tốt* và *Tập thể Sinh viên 5 tốt* trực tiếp trên giao diện web.
