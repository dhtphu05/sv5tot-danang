# 5TOT ĐÀ NẴNG — UX-S4 ADMINISTRATION & PROGRAM NAVIGATION CONTRACT
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Phase:** UX-S4 — Administration Workspace, System Configuration & Extensible Award Program Navigation  
**Version:** 1.0.0 (Authoritative)  

---

## 1. MỤC TIÊU & TỔNG QUAN HỆ THỐNG
Tài liệu này xác lập cấu trúc thông tin, phân quyền, giao diện quản trị và quy chuẩn kỹ thuật cho phân hệ Quản trị hệ thống (Administration) và Điều hướng chương trình xét chọn (Award Program Navigation) thuộc Hệ thống Quản lý và Xét chọn Sinh viên 5 tốt cấp Thành phố Đà Nẵng (5TOT Đà Nẵng).

Phân hệ UX-S4 kế thừa nguyên vẹn kết quả của:
- **UX-S1:** Kiến trúc thông tin và hợp đồng thiết kế tổng thể.
- **UX-S2:** Không gian thẩm định hồ sơ tinh giản, dùng chung giữa cán bộ Thành phố và Hội đồng.
- **UX-S3:** Quản lý danh sách hồ sơ, hàng đợi sơ tuyển, bảng thống kê và báo cáo xuất Excel OpenXML.
- **SRW-2 / SRW-3 / SRW-6:** Mô hình sơ tuyển cấp trường 1 lần gửi 1 quyết định, 8 trường thành viên ĐHĐN dùng chung 1 Hội đồng Sơ tuyển `unit-udn`, và bất biến hồ sơ sinh viên tại thời điểm nộp.

---

## 2. KIẾN TRÚC ĐIỀU HƯỚNG 2 CẤP (TWO-LEVEL INFORMATION ARCHITECTURE)

Hệ thống phân tách mạch lạc giữa hai khái niệm:

### CẤP 1 — Bối cảnh Chương trình xét chọn (Level 1: Award Program Context)
Đại diện cho chương trình đang được tổ chức và quản lý:
- **Chương trình:** `Danh hiệu Sinh viên 5 tốt` (Cấp Thành phố Đà Nẵng).
- **Cơ quan quản lý:** Thành Đoàn Đà Nẵng.
- **Đơn vị vận hành:** Hội Sinh viên Việt Nam TP. Đà Nẵng.
- **Mùa xét hiện hành:** Năm học 2026–2027 (Trạng thái: Đang tiếp nhận & Thẩm định).
- **Hạng mục xét chọn:**
  1. *Cá nhân:* Khung 05 tiêu chuẩn toàn diện (Đạo đức, Học tập, Thể lực, Tình nguyện, Hội nhập).
  2. *Tập thể:* Khung 04 tiêu chuẩn tập thể (TT01, TT02, TT03, TT04).
- **Khả năng mở rộng tương lai (Future-Ready):** Kiến trúc tách biệt rõ ràng mã chương trình (`prog-5tot`), mùa xét (`season-2026-2027`) và phiên bản tiêu chí (`crit-ver-2026-2027`). Không tạo dữ liệu ảo cho các chương trình chưa được ban hành quy chế chính thức.

### CẤP 2 — Không gian làm việc theo vai trò (Level 2: Role-Specific Workspaces)
Chỉ hiển thị các mục làm việc phù hợp với vai trò và quyền hạn được cấp:
1. **Quản trị hệ thống (`ADMIN`):**
   - *Tổng quan quản trị:* Thẻ chỉ số mùa xét, đơn vị đào tạo, tài khoản cán bộ, phiên bản tiêu chí, mốc thời gian và cảnh báo cần kiểm tra.
   - *Quản trị chương trình:* Mùa xét chọn (`admin_season`), Tiêu chí xét chọn (`admin_criteria`), Mốc thời gian (`admin_deadlines`), Đơn vị đào tạo (`admin_institutions`).
   - *Quản trị hệ thống & An toàn:* Người dùng & Cán bộ (`admin_users`), Ma trận quyền hạn (`admin_permissions`), Nhật ký kiểm toán (`admin_audit`).
2. **Cán bộ xét duyệt Thành phố (`CITY_OFFICER`):** Hồ sơ xét duyệt, Hồ sơ cần xử lý, Yêu cầu bổ sung, Thẩm định Tập thể, Thông báo.
3. **Quản lý xét duyệt (`CITY_MANAGER`):** Tổng quan tiến độ, Hồ sơ toàn thành phố, Thống kê & Báo cáo, Thông báo.
4. **Hội đồng xét chọn (`CITY_COMMITTEE`):** Hồ sơ xét chọn, Hồ sơ chờ quyết định, Kết quả xét chọn, Quyết định công nhận, Thống kê, Thông báo.
5. **Cán bộ sơ tuyển cấp trường (`SCHOOL_OFFICER`):** Hồ sơ sơ tuyển đơn vị, Cần xét sơ tuyển, Yêu cầu bổ sung cấp trường, Danh sách đề nghị Thành phố, Đã chuyển Thành phố.

---

## 3. NGUYÊN TẮC PHÂN QUYỀN: ADMIN ≠ AUTOMATIC EVERYTHING
Hệ thống tuân thủ nghiêm ngặt nguyên tắc **Tách biệt nhiệm vụ (Separation of Concerns)**:
- Tài khoản `ADMIN` có toàn quyền cấu hình đơn vị, mùa xét, mốc thời gian, tài khoản người dùng và xem nhật ký kiểm toán.
- Tài khoản `ADMIN` **KHÔNG** có quyền:
  - Tự ý thay mặt Hội đồng Sơ tuyển cấp trường để xác nhận chuyển hồ sơ lên Thành phố (`RECOMMEND_CITY_FORWARDING`, `CONFIRM_CITY_FORWARDING`).
  - Tự ý thẩm định hồ sơ sinh viên thay cán bộ chuyên môn (`REVIEW_CRITERIA`).
  - Tự ý biểu quyết hoặc ban hành quyết định công nhận danh hiệu thay Hội đồng (`FINALIZE_RESULTS`, `PUBLISH_RESULTS`).
- Mọi thay đổi về phân quyền và vai trò đều được ghi vết tự động vào Nhật ký kiểm toán bất biến (`AuditEvent`).

---

## 4. QUẢN LÝ ĐƠN VỊ ĐÀO TẠO & QUY TẮC ĐẠI HỌC ĐÀ NẴNG (UDN)
Hệ thống phân biệt rõ ràng 3 thực thể dữ liệu:
1. **Cơ sở đào tạo gốc (Original Educational Institution):** Trường/Viện sinh viên đang theo học (ví dụ: `inst-dut`, `inst-due`, `inst-ued`, `inst-ufl`, `inst-ute`, `inst-vku`, `inst-vnuk`, `inst-smp`). Bản sắc này là bất biến trong suốt vòng đời hồ sơ.
2. **Hội đồng Sơ tuyển cấp trường (School Review Unit):** Cấp thực hiện sơ tuyển và chuyển tiếp hồ sơ. Cả 08 trường thành viên ĐHĐN sử dụng chung 01 đơn vị sơ tuyển duy nhất: `unit-udn` (Hội đồng Sơ tuyển Đại học Đà Nẵng).
3. **Đơn vị chủ quản / Nhóm sơ tuyển chung (Organizational Parent Context):** Đại học Đà Nẵng.

### Bất biến chuyển tiếp hồ sơ UDN (Forwarding Invariant)
- `unit-udn` gửi **01 danh sách tổng hợp duy nhất** kèm **01 văn bản quyết định công nhận/đề nghị chính thức** (ví dụ: `182/QĐ-ĐHĐN`).
- Giao diện quản trị **KHÔNG** cho phép chia tách `unit-udn` thành 08 đợt gửi riêng rẽ làm sai lệch quy định tiếp nhận cấp Thành phố.
- Các trường đại học ngoài ĐHĐN (ví dụ: Duy Tân `inst-dtu`, Kiến trúc `inst-daa`, Đông Á `inst-uda`) sở hữu School Review Unit độc lập tương ứng (`unit-dtu`, `unit-daa`, `unit-uda`).

---

## 5. BẢO VỆ DỮ LIỆU LỊCH SỬ & AN TOÀN CẤU HÌNH
1. **Mùa xét đã có hồ sơ:** Không cho phép thay đổi năm học hoặc hoán đổi tiêu chí áp dụng của một mùa xét đang hoạt động đã tiếp nhận hồ sơ.
2. **Tiêu chí xét chọn:** Khi cần điều chỉnh tiêu chuẩn cho năm học mới, quản trị viên sử dụng tính năng **Tạo bản dự thảo mới từ cấu hình hiện hành** (`draft`), chỉnh sửa trên bản dự thảo, và chỉ kích hoạt khi bước vào mùa xét tương ứng.
3. **Khóa tài khoản cán bộ an toàn:** Hệ thống kiểm tra và cảnh báo/chặn việc tạm khóa tài khoản cán bộ nếu cán bộ đó đang phụ trách hồ sơ chưa hoàn tất thẩm định.
4. **Nhật ký kiểm toán:** Là nhật ký chỉ đọc (Read-only), lưu lại `timestamp`, `actorId`, `actorName`, `actorRoleLabel`, `actionType`, `targetEntity`, `summary`, `beforeValue`, `afterValue` và `reason`.
