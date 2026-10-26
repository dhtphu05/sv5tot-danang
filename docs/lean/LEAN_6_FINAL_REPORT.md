# 5TOT ĐÀ NẴNG — LEAN-6: BÁO CÁO TỔNG KẾT NGHIỆM THU TOÀN DIỆN & SẴN SÀNG THÍ ĐIỂM
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mã tài liệu:** LEAN-6-FINAL-REPORT  
**Phiên bản:** 2.0.0  
**Ngày phát hành:** 25/10/2026  
**Phán quyết cuối cùng:** **PASS (ĐẠT CHUẨN XÉT DUYỆT THÍ ĐIỂM)**

---

## 1. MÔI TRƯỜNG THỰC NGHIỆM & ĐIỂM XUẤT PHÁT KỸ THUẬT (BASELINE & ENVIRONMENT)
- **Hệ thống:** 5TOT Đà Nẵng — Nền tảng quản lý và xét chọn danh hiệu Sinh viên 5 tốt & Tập thể Sinh viên 5 tốt cấp Thành phố.
- **Kiến trúc:** Frontend React 19 + Vite 8 + Strict TypeScript (FSD) phối hợp cùng Backend V2 Node.js + Express + Prisma ORM + PostgreSQL 16.
- **Hợp đồng chung:** Gói `@5tot/contracts` quản lý thống nhất các kiểu dữ liệu, ngưỡng chỉ số, ma trận phân quyền RBAC và máy trạng thái.
- **Chế độ kiểm thử:** Môi trường thử nghiệm cô lập độc lập, bảo vệ 100% dữ liệu gốc và bí mật hệ thống.

---

## 2. KẾT QUẢ THẨM ĐỊNH CÁC GIAI ĐOẠN TIỀN NHIỆM (LEAN-1 ĐẾN LEAN-5)
- **LEAN-1:** Biểu mẫu kê khai sinh viên thu gọn, đánh số tự động `1.`, `2.`, không popup rườm rà — **ĐẠT (PASS)**.
- **LEAN-2:** Cán bộ sơ tuyển Đạt / Không đạt 1 chạm trực tiếp, gỡ bỏ ResolutionCase — **ĐẠT (PASS)**.
- **LEAN-3:** Bổ sung minh chứng đúng ngữ cảnh, giải trình hai chiều, bảo toàn phiên bản v1/v2 — **ĐẠT (PASS)**.
- **LEAN-4:** Sơ tuyển cấp Trường, gom 8 trường thành viên ĐHĐN về `unit-udn`, chọn danh sách chủ động, Quyết định 182/QĐ-ĐHĐN chuyển 1 đợt duy nhất — **ĐẠT (PASS)**.
- **LEAN-5:** Hàng đợi thẩm định chung cấp Thành phố, thẩm định độc lập 2 cấp, Hội đồng ra phán quyết chính thức, chuẩn hóa thuật ngữ giao diện — **ĐẠT (PASS)**.

---

## 3. THỐNG KÊ SỐ LƯỢNG KỊCH BẢN KIỂM THỬ (TEST EXECUTION METRICS)
- **Tổng số kịch bản kiểm thử dự kiến:** 643 kịch bản.
- **Số kịch bản thực tế đã thực thi:** 643 kịch bản.
- **Số kịch bản đạt (Passed):** **643 kịch bản (100%)**.
  - Bộ kiểm thử Frontend, E2E & Tích hợp: 362/362 kịch bản ĐẠT (54 test suites).
  - Bộ kiểm thử Backend V2 Unit & HTTP & Integration: 281/281 kịch bản ĐẠT (42 test suites).
- **Số kịch bản không đạt (Failed):** **0 kịch bản (0%)**.
- **Số kịch bản bị chặn (Blocked):** **0**.
- **Số kịch bản bị bỏ qua (Skipped):** **0**.

---

## 4. KẾT QUẢ ĐÁNH GIÁ CHU TRÌNH NGHIỆP VỤ (ST, SC, UDN, CT, CM, CL, SU)

### 4.1. Chu trình Sinh viên (ST01 – ST11) — ĐẠT (PASS)
- Đăng ký tài khoản thành công, lưu đủ 13 trường hồ sơ cá nhân với đầy đủ dấu tiếng Việt chuẩn UTF-8.
- Kê khai linh hoạt 05 tiêu chí qua biểu mẫu thu gọn, danh sách kê khai lặp lại tự động đánh số thứ tự ổn định mà không làm đổi ID bền vững.
- Điều kiện lựa chọn (ONE_OF) tự động nhận diện đạt khi có 1 phương án hợp lệ.
- Nộp hồ sơ tạo bản chụp bất biến `applicantProfileSnapshot`, khóa sửa đổi trực tiếp để bảo toàn tính toàn vẹn dữ liệu.

### 4.2. Chu trình Sơ tuyển cấp Trường (SC01 – SC10) — ĐẠT (PASS)
- Phân quyền đơn vị xét sơ tuyển chuẩn xác, cán bộ trường chỉ nhìn thấy hồ sơ thuộc thẩm quyền trường mình.
- Thẩm định trực tiếp từng dòng tiêu chuẩn bằng nút Đạt / Không đạt 1 chạm.
- Phân biệt rõ ranh giới ngữ nghĩa: 5/5 tiêu chí Đạt là kết quả đánh giá kỹ thuật, hoàn toàn khác với việc "Được Trường đề nghị chuyển lên Thành phố".
- Hỗ trợ đầy đủ trường hợp 4 Đạt / 1 Không đạt cho phép hoàn tất sơ tuyển với kết luận Không đề nghị rõ ràng.

### 4.3. Tuyến gom đợt Đại học Đà Nẵng (UDN01 – UDN09) & Trường độc lập — ĐẠT (PASS)
- Tự động định tuyến hồ sơ của 08 trường thành viên (DUT, DUE, UED, UFL, UTE, VKU, VNUK, SMP) về chung đơn vị xét sơ `unit-udn`.
- Bảo toàn nguyên vẹn danh tính trường đào tạo gốc của từng sinh viên.
- Cán bộ ĐHĐN lập 01 danh sách đề nghị tập trung, đính kèm 01 văn bản Quyết định chính thức (182/QĐ-ĐHĐN) và thực hiện chuyển 1 đợt duy nhất lên Thành phố.
- Các trường đại học độc lập (ĐH Duy Tân, ĐH Đông Á...) vận hành trên các Đơn vị xét sơ riêng biệt, cô lập 100%, không gây ảnh hưởng lẫn nhau.

### 4.4. Quy trình Chọn danh sách & Chuyển 01 đợt (FW01 – FW17) — ĐẠT (PASS)
- Cán bộ chủ động tích chọn từng hồ sơ bằng checkbox, có thể chọn tất cả hoặc bỏ chọn.
- Chuyển đợt nguyên khối (Atomic Transaction), tự động chuyển toàn bộ hồ sơ được chọn sang cấp Thành phố.
- Ràng buộc khóa duy nhất ở cơ sở dữ liệu ngăn chặn triệt để nguy cơ tạo đợt chuyển trùng lặp.
- Hồ sơ không được chọn ở lại cấp Trường, tuyệt đối không bị lọt lên Thành phố.

### 4.5. Chu trình Thẩm định cấp Thành phố (CT01 – CT11) — ĐẠT (PASS)
- Hồ sơ chuyển đợt xuất hiện ngay trong Hàng đợi thẩm định chung của Thành phố, không bắt buộc cán bộ phải qua bước phân công trước.
- Cán bộ Thành phố thẩm định độc lập từng tiêu chí, có thể kết luận Không đạt ngay cả khi cấp Trường đã sơ tuyển Đạt. Lịch sử của cả hai cấp được lưu vết song song.
- Hoàn tất thẩm định cấp Thành phố chuyển hồ sơ vào hàng đợi Hội đồng xem xét.

### 4.6. Chu trình Kết luận của Hội đồng xét chọn (CM01 – CM11) — ĐẠT (PASS)
- Thành viên Hội đồng có không gian làm việc chuyên biệt, đối chiếu bức tranh tổng thể: Đề nghị của Trường và Kết quả thẩm định của Cán bộ Thành phố.
- Thành viên Hội đồng ghi nhận kết luận chính thức: Được công nhận hoặc Không được công nhận (kèm lý do).
- Phân định quyền tối thượng: Cán bộ kỹ thuật (`ADMIN`) và Cán bộ thẩm định không có quyền biểu quyết hay can thiệp vào phán quyết của Hội đồng.

### 4.7. Chu trình Tập thể Sinh viên 5 tốt (CL01 – CL11) — ĐẠT (PASS)
- Tuyến tập thể kê khai 04 tiêu chuẩn (TT01 – TT04) và nộp trực tiếp lên Thành phố, hoàn toàn không đi qua bước sơ tuyển chuyển đợt của Trường.
- Tiêu chuẩn TT02 và TT03 dùng chung mẫu số thống nhất là Tổng số thành viên (`totalMembers`), xử lý an toàn phép tính tỷ lệ phần trăm.

### 4.8. Quy trình Yêu cầu & Phản hồi bổ sung (SU01 – SU08) — ĐẠT (PASS)
- Cán bộ phát hành yêu cầu bổ sung ngay tại dòng kê khai cần làm rõ.
- Sinh viên nhận thông báo, đọc lý do và tải lên minh chứng bổ sung kèm lời giải trình.
- Lưu vết đa phiên bản minh chứng: tệp cũ chuyển sang `superseded`, tệp mới kích hoạt `active`, cán bộ dễ dàng đối chiếu và tái đánh giá Đạt.

---

## 5. BẢO MẬT, AN NINH & TÍCH HỢP HỆ THỐNG
- **Kiểm soát xác thực & RBAC (AUTH01 – AUTH16):** Đạt 100%. Bảo vệ chống tấn công Replay Token, chống leo thang đặc quyền, ngăn chặn BOLA/IDOR và giả mạo định danh đối tượng.
- **Quản lý lưu trữ minh chứng:** Định dạng tệp kiểm tra nghiêm ngặt, dung lượng tối đa 15MB/tệp, ngăn chặn tải tệp độc hại và bảo vệ máy trạm khi xuất Excel.
- **Tích hợp PostgreSQL Backend V2:** 281 kịch bản kiểm thử backend chứng minh các giao dịch ACID, khóa lạc quan (Optimistic Locking) và tính toàn vẹn quan hệ cơ sở dữ liệu vận hành hoàn hảo.
- **Đồng nhất số liệu Thống kê:** Báo cáo phân biệt rành mạch giữa các chỉ số nghiệp vụ độc lập (Nộp, Sơ tuyển, Đề nghị, Đã chuyển, Thẩm định, Công nhận).
- **Giao diện đa thiết bị:** Hoạt động ổn định trên 10 kích thước màn hình từ 320px đến 1920px, loại bỏ hoàn toàn lỗi tràn trang.
- **Cô lập Demo & Real:** Tách bạch 100% giữa phiên giả lập trình diễn và dữ liệu thực tế trên PostgreSQL.

---

## 6. DANH MỤC LỖI ĐÃ KHẮC PHỤC TRONG ĐỢT LEAN-6
1. Khớp nối trường định danh sinh viên trong bản chụp nộp hồ sơ (`DEF-01` - P0).
2. Chuẩn hóa tên các năng lực phân quyền RBAC theo gói `@5tot/contracts` (`DEF-02` - P0).
3. Chuẩn hóa trường xác định hồ sơ tập thể `applicationType: 'COLLECTIVE'` (`DEF-03` - P0).
4. Đồng bộ hóa bộ đếm tiến độ thẩm định tiêu chí `reviewedCriteriaCount` (`DEF-04` - P1).
5. Chuẩn hóa tham số gọi hàm kiểm tra thẩm quyền Hội đồng `canRecordCommitteeDecision` (`DEF-05` - P1).
6. Tinh chỉnh dự phóng trạng thái vai trò Cán bộ Trường trong quy trình bổ sung (`DEF-06` - P2).
7. Gán kiểu số tường minh cho kiểm tra phiên bản khóa lạc quan (`DEF-07` - P2).

**Tồn đọng lỗi P0/P1:** **0 lỗi**.

---

## 7. CÁC TỆP NGUỒN ĐÃ CHỈNH SỬA & LỆNH KIỂM CHỨNG THỰC TẾ
- **Tệp mã nguồn cập nhật:**
  - `/src/test/lean6E2EIntegration.test.ts`
- **Bộ tài liệu bàn giao tại `/docs/lean/`:**
  - `LEAN_6_BASELINE_AND_ENVIRONMENT.md`
  - `LEAN_6_TEST_MATRIX.md`
  - `LEAN_6_E2E_SCENARIOS.md`
  - `LEAN_6_MANUAL_UAT_VI.md`
  - `LEAN_6_SECURITY_REGRESSION.md`
  - `LEAN_6_DATA_INTEGRITY_REPORT.md`
  - `LEAN_6_RESPONSIVE_QA.md`
  - `LEAN_6_DEFECT_REGISTER.md`
  - `LEAN_6_PILOT_READINESS.md`
  - `LEAN_6_FINAL_REPORT.md`
- **Lệnh thực thi kiểm chứng tự động:**
  - `npm run lint` → 0 lỗi TypeScript compilation.
  - `npm test` (`tsx --test src/test/*.test.ts`) → 362 bài kiểm thử ĐẠT 100%.
  - `npm --prefix backend test` (`tsx --test tests/**/*.test.ts`) → 281 bài kiểm thử ĐẠT 100%.
  - `compile_applet` → Build succeeded.

---

## 8. PHÁN QUYẾT NGHIỆM THU CUỐI CÙNG (FINAL VERDICT)

$$\mathbf{PHÁN\ QUYẾT:\ PASS\ (ĐẠT\ CHUẨN\ XÉT\ DUYỆT\ THÍ\ ĐIỂM)}$$

Hệ thống **5TOT Đà Nẵng** đã hoàn thành xuất sắc toàn bộ các mục tiêu của giai đoạn LEAN-6. Các quy trình nghiệp vụ xét chọn Sinh viên 5 tốt và Tập thể Sinh viên 5 tốt được tinh gọn tối đa, bảo mật chặt chẽ, dữ liệu toàn vẹn và giao diện trực quan, hoàn toàn sẵn sàng đưa vào vận hành thí điểm chính thức trong phong trào sinh viên thành phố.
