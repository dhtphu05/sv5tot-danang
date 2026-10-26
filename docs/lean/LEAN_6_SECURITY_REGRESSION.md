# 5TOT ĐÀ NẴNG — LEAN-6: BÁO CÁO HỒI QUY AN NINH & BẢO MẬT (SECURITY REGRESSION)
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mã tài liệu:** LEAN-6-SECURITY-REGRESSION  
**Phiên bản:** 2.0.0 — Tiêu chuẩn an ninh Zero-Trust & RBAC V2

---

## 1. TỔNG QUAN VÀ MỤC TIÊU KIỂM TOÁN AN NINH
Kiểm toán an ninh LEAN-6 tập trung rà soát các rủi ro thực tế có thể ảnh hưởng đến tính toàn vẹn hồ sơ, quyền riêng tư của sinh viên, tài liệu minh chứng và tính pháp lý của quyết định công nhận danh hiệu Sinh viên 5 tốt cấp Thành phố.

---

## 2. KẾT QUẢ KIỂM TOÁN CÁC LỖ HỔNG TRỌNG YẾU (AUTH01 – AUTH16)

| Mã kiểm toán | Lĩnh vực kiểm tra & Rủi ro tiềm ẩn | Cơ chế phòng thủ đã triển khai | Kết quả kiểm thử | Mức độ rủi ro còn lại |
|---|---|---|:---:|:---:|
| **AUTH01** | Đăng ký & Xác thực danh tính | Mã hóa mật khẩu chuẩn Argon2id + JWT RS256/HS256 15 phút + Refresh Token xoay vòng (Rotation) | **PASS** | Rất thấp |
| **AUTH02** | Xử lý thông tin đăng nhập sai | Rate limiting 5 lần/phút + Thông báo lỗi khái quát, không tiết lộ sự tồn tại của email | **PASS** | Rất thấp |
| **AUTH03** | Tấn công Replay Refresh Token | Thu hồi toàn bộ dòng họ phiên (Token Family Invalidation) ngay khi phát hiện token cũ được tái sử dụng | **PASS** | Rất thấp |
| **AUTH04** | Đổi / Đặt lại mật khẩu | Hủy hiệu lực tức thì toàn bộ phiên đăng nhập đang hoạt động của tài khoản | **PASS** | Rất thấp |
| **AUTH05** | Hết hạn phiên đăng nhập | Tự động đăng xuất an toàn, điều hướng về trang đăng nhập kèm bảo toàn vị trí làm việc hợp lệ | **PASS** | Rất thấp |
| **AUTH06** | Hủy phiên đăng xuất | Vô hiệu hóa Session ID trên cơ sở dữ liệu, chặn hoàn toàn truy vấn sau đăng xuất | **PASS** | Rất thấp |
| **AUTH07** | Truy cập route được bảo vệ không có token | Middleware `authMiddleware.ts` chặn và trả về HTTP 401 Unauthorized | **PASS** | Rất thấp |
| **AUTH08** | Cán bộ Trường truy cập chức năng Thành phố | `requireCapability('REVIEW_CRITERIA')` chặn và trả về HTTP 403 Forbidden | **PASS** | Rất thấp |
| **AUTH09** | Sinh viên truy cập hồ sơ của sinh viên khác (BOLA/IDOR) | Ràng buộc quyền sở hữu chặt chẽ: `userId === application.studentId`, chặn truy vấn chéo | **PASS** | Rất thấp |
| **AUTH10** | Sinh viên tự ý sửa hồ sơ sau khi đã nộp | Backend từ chối mọi thao tác sửa đổi khi `status !== 'draft'`, trừ phạm vi bổ sung được cấp phép | **PASS** | Rất thấp |
| **AUTH11** | Cán bộ Trường truy cập hồ sơ Trường khác | Ràng buộc phạm vi đơn vị xét sơ `schoolReviewUnitId`, chặn truy cập ngoài trường | **PASS** | Rất thấp |
| **AUTH12** | Cán bộ Thành phố thực hiện Chuyển đợt của Trường | Chỉ tài khoản có quyền `CONFIRM_CITY_FORWARDING` mới được gọi API chuyển đợt | **PASS** | Rất thấp |
| **AUTH13** | Cán bộ thẩm định tự ý ký Quyết định Hội đồng | Tách biệt quyền: `REVIEW_CRITERIA` (Cán bộ) hoàn toàn không có quyền `FINALIZE_RESULTS` | **PASS** | Rất thấp |
| **AUTH14** | Quản trị kỹ thuật (`ADMIN`) ra phán quyết công nhận | `ADMIN` bị cách ly khỏi cơ chế biểu quyết và kết luận của Hội đồng (`FINALIZE_RESULTS: false`) | **PASS** | Rất thấp |
| **AUTH15** | Bỏ qua nút ẩn trên giao diện bằng gọi API trực tiếp | Toàn bộ quy tắc nghiệp vụ và phân quyền được kiểm tra ở tầng Server/API, không phụ thuộc UI | **PASS** | Rất thấp |
| **AUTH16** | Giả mạo định danh đối tượng (Client Spoofing) | Middleware `rejectClientIdentitySpoofing.ts` loại bỏ các header danh tính giả mạo | **PASS** | Rất thấp |

---

## 3. BẢO MẬT TÀI LIỆU MINH CHỨNG & TỆP TIN ĐÍNH KÈM
1. **Kiểm tra loại tệp:** Chỉ cho phép các định dạng hợp lệ phục vụ xét duyệt: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.webp`, `.doc`, `.docx`, `.xls`, `.xlsx`. Chặn tuyệt đối tệp thực thi (`.exe`, `.sh`, `.bat`, `.js`, `.html`).
2. **Giới hạn dung lượng:** Giới hạn tối đa 15MB/tệp minh chứng đơn và 25MB cho văn bản quyết định chuyển đợt. Yêu cầu tải lên vượt quá giới hạn bị từ chối với lỗi 413 Payload Too Large.
3. **Phòng chống XSS & Mã độc trong tệp:** 
   - Tiêu đề tệp và tên kê khai được làm sạch (Sanitize) trước khi lưu và hiển thị.
   - Header bảo mật `Content-Security-Policy`, `X-Content-Type-Options: nosniff` được áp dụng cho toàn bộ tệp đính kèm.
4. **Phòng chống tấn công công thức Excel (Formula Injection):** Khi xuất báo cáo danh sách ra Excel, các ký tự đặc biệt (`=`, `+`, `-`, `@`) ở đầu ô văn bản tự động được escape để bảo vệ máy trạm của cán bộ mở tệp.

---

## 4. BẢO VỆ DỮ LIỆU RIÊNG TƯ CỦA SINH VIÊN (DATA PRIVACY & LEAKAGE PREVENTION)
- **Ghi chú nội bộ của cán bộ:** Các ghi chú nghiệp vụ nội bộ (`officerInternalNotes`, `discussionNotes`) được lọc bỏ trước khi trả dữ liệu về phía sinh viên; sinh viên chỉ nhìn thấy nội dung lý do yêu cầu bổ sung chính thức (`publicReason`).
- **Thông tin liên lạc sinh viên:** Số điện thoại, địa chỉ email và thông tin chi tiết cá nhân của sinh viên được bảo vệ, chỉ cán bộ thuộc đúng Đơn vị xét sơ tuyển hoặc Cán bộ Thành phố đang xử lý hồ sơ mới có quyền tra cứu.
- **Log máy chủ sạch:** Mã bí mật, token JWT, mật khẩu hoặc số CMND/CCCD tuyệt đối không xuất hiện trong các dòng nhật ký (Server Structured Logs).

---

## 5. KẾT LUẬN KIỂM TOÁN AN NINH
Toàn bộ 16 kịch bản hồi quy an ninh (AUTH01–AUTH16) đều đạt yêu cầu (PASS). Hệ thống đạt chuẩn an toàn thông tin nghiệp vụ phục vụ vận hành thí điểm chính thức.
