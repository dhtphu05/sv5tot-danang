# 5TOT ĐÀ NẴNG — LEAN-6: BASELINE & TEST ENVIRONMENT SPECIFICATION
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mã tài liệu:** LEAN-6-BASELINE-ENV  
**Phiên bản hệ thống:** 2.0.0 (Dual-Mode: Interactive Demo & PostgreSQL Backend V2)  
**Thời gian thẩm định:** 25/10/2026

---

## 1. MỤC TIÊU VÀ PHẠM VI XÁC LẬP MÔI TRƯỜNG
Tài liệu này ghi nhận hiện trạng kỹ thuật, cấu hình môi trường thử nghiệm độc lập, ranh giới an toàn dữ liệu, cùng kết quả thẩm định nguồn của các giai đoạn tiền nhiệm (LEAN-1 đến LEAN-5) trước khi bước vào kỳ đánh giá toàn diện LEAN-6.

---

## 2. HIỆN TRẠNG MÃ NGUỒN VÀ KIẾN TRÚC HỆ THỐNG
- **Kiến trúc Frontend:** React 19 + Vite 8 + Strict TypeScript + Tailwind CSS (Feature-Sliced Design - FSD: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`).
- **Kiến trúc Backend V2:** Node.js + Express 4 + Strict TypeScript + Prisma ORM 5.22.0 (Modular Monolith: `auth/`, `individualApplications/`, `schoolReviewUnits/`, `schoolReviews/`, `cityWorkflow/`, `committee/`, `collectiveApplications/`, `evidence/`, `auditAndAnalytics/`).
- **Giao thức chia sẻ hợp đồng:** `@5tot/contracts` (Gói TypeScript dùng chung giữa Frontend và Backend V2, định nghĩa cấu trúc dữ liệu, RBAC Capabilities, Thresholds và State Machine).
- **Chế độ vận hành:** Dual-Mode (`VITE_5TOT_EXECUTION_MODE="DEMO"` hoặc `"BACKEND"`), cô lập 100% giữa phiên giả lập trình diễn và dữ liệu thực tế.

---

## 3. THẨM ĐỊNH KẾT QUẢ CÁC GIAI ĐOẠN TIỀN NHIỆM (LEAN-1 ĐẾN LEAN-5)

| Giai đoạn | Tên hợp đồng nghiệp vụ | Trạng thái nguồn | Tệp báo cáo & UAT | Kết quả kiểm thử tự động |
|---|---|---|---|---|
| **LEAN-1** | Đơn giản hóa biểu mẫu kê khai sinh viên & Đánh số tự động | **HOÀN TẤT** | `LEAN_1_IMPLEMENTATION_REPORT.md` | `lean1DeclarationSimplification.test.ts` (PASS - 16/16) |
| **LEAN-2** | Thẩm định trực tiếp Đạt/Không đạt & Gỡ bỏ ResolutionCase | **HOÀN TẤT** | `LEAN_2_IMPLEMENTATION_REPORT.md`<br>`LEAN_2_MANUAL_UAT.md` | `lean2DirectInlineReview.test.ts` (PASS - 18/18) |
| **LEAN-3** | Bổ sung minh chứng theo ngữ cảnh & Tái đánh giá | **HOÀN TẤT** | `LEAN_3_IMPLEMENTATION_REPORT.md`<br>`LEAN_3_MANUAL_UAT.md` | `lean3InlineSupplementation.test.ts` (PASS - 17/17) |
| **LEAN-4** | Sơ tuyển cấp Trường, Chọn danh sách & Chuyển 1 lần | **HOÀN TẤT** | `LEAN_4_IMPLEMENTATION_REPORT.md`<br>`LEAN_4_MANUAL_UAT.md` | `lean4SchoolForwarding.test.ts` (PASS - 24/24) |
| **LEAN-5** | Hàng đợi Thành phố, Hội đồng & Chuẩn hóa thuật ngữ | **HOÀN TẤT** | `LEAN_5_IMPLEMENTATION_REPORT.md`<br>`LEAN_5_MANUAL_UAT.md` | `lean5CityCommittee.test.ts` (PASS - 26/26) |

---

## 4. QUY TẮC AN TOÀN MÔI TRƯỜNG THỬ NGHIỆM (ENVIRONMENT SAFETY BOUNDARY)
1. **Nguyên tắc cô lập:** Tuyệt đối không trỏ kiểm thử tải, kiểm thử đồng thời (concurrency) hoặc kiểm thử phá hủy vào cơ sở dữ liệu môi trường sản xuất (Production).
2. **Cơ chế lưu trữ:** Môi trường thử nghiệm sử dụng bucket lưu trữ riêng biệt (`5tot-danang-private-evidence-test`) hoặc giả lập in-memory deterministic storage với sha256 checksum kiểm chứng. Không xóa minh chứng thực của sinh viên.
3. **Email Sandbox:** Không gửi email thật ra ngoài phạm vi thử nghiệm; toàn bộ thông báo hệ thống được định tuyến qua Transport giả lập hoặc lưu vết audit database.
4. **Bảo mật bí mật:** Không ghi lại JWT Secret, Session Pepper, hoặc mật khẩu tài khoản vào báo cáo thử nghiệm hay log tệp tin.

---

## 5. THÔNG SỐ CẤU HÌNH MÔI TRƯỜNG THỰC NGHIỆM LEAN-6
- **Múi giờ nghiệp vụ:** `Asia/Ho_Chi_Minh` (UTC+7) xuyên suốt toàn bộ hiển thị ngày giờ, biên bản nộp hồ sơ, thời hạn sơ tuyển và thời hạn chuyển hồ sơ.
- **Niên khóa xét chọn tích cực:** `season-2025-2026` ("Năm học 2025–2026" - Niên khóa xét chọn chính thức).
- **Cơ quan quản trị:** Thành Đoàn Đà Nẵng — Hội Sinh viên Việt Nam TP. Đà Nẵng.
- **Quy mô đơn vị xét sơ:** 05 Đơn vị xét sơ tuyển chính thức, trong đó `unit-udn` (Đại học Đà Nẵng) quản lý tập trung 08 trường/đơn vị thành viên (DUT, DUE, UED, UFL, UTE, VKU, VNUK, SMP).
- **Hệ thống kiểm thử tự động:**
  - Frontend & E2E Suites: Node.js Test Runner (`tsx --test`) với 362 kịch bản kiểm thử (0 failed).
  - Backend V2 Suites: Node.js Test Runner với 281 kịch bản kiểm thử Unit/HTTP/Integration (0 failed).
  - Tổng số kịch bản kiểm thử tự động toàn diện: **643 kịch bản, tỷ lệ đạt 100%**.
