# 5TOT ĐÀ NẴNG — LEAN-6: END-TO-END CROSS-ROLE LIFECYCLE SCENARIOS
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mã tài liệu:** LEAN-6-E2E-SCENARIOS  
**Phiên bản:** 2.0.0

---

## 1. VẾT ĐỒNG NHẤT TOÀN VẸN (CANONICAL TRACEABILITY PROOF)
Để chứng minh hệ thống vận hành trên cùng một hồ sơ thực tế thay vì dữ liệu rời rạc giữa các màn hình, kịch bản dưới đây ghi vết mã hồ sơ duy nhất xuyên suốt tất cả các bước:

- **Mã hồ sơ (Test Application ID):** `APP-2026-DN-102220123`
- **Sinh viên nộp:** Nguyễn Minh Anh (MSSV: 102220123)
- **Trường đào tạo gốc:** Trường Đại học Bách khoa - Đại học Đà Nẵng (`inst-dut`)
- **Đơn vị xét sơ tuyển:** Đại học Đà Nẵng (`unit-udn`)
- **Niên khóa xét:** Năm học 2025–2026 (`season-2025-2026`)
- **Văn bản chuyển cấp Trường:** Quyết định số `182/QĐ-ĐHĐN` ngày 20/10/2026
- **Văn bản công nhận cấp Thành phố:** Quyết định số `86/QĐ-HSV-TP` ngày 24/10/2026

---

## 2. KỊCH BẢN CHU TRÌNH ĐẦY ĐỦ CÁ NHÂN (INDIVIDUAL TRACK)

### BƯỚC 1: Sinh viên đăng ký, hoàn thiện hồ sơ & kê khai (ST01 – ST10)
1. **Đăng ký tài khoản:** Sinh viên Nguyễn Minh Anh đăng ký qua cổng công khai, hệ thống lưu trữ bản ghi danh tính với đầy đủ 13 trường thông tin cá nhân bắt buộc (Họ tên, Ngày sinh, Giới tính, Dân tộc, Khóa, Lớp, Trường, Đoàn/Hội, Số điện thoại, Email).
2. **Kê khai 05 tiêu chí:** 
   - *Đạo đức tốt:* Điểm rèn luyện HK1 đạt 92 điểm + Đính kèm bảng điểm rèn luyện.
   - *Học tập tốt:* Điểm trung bình học tập đạt 3.65 + Đính kèm chứng chỉ TOEIC 750.
   - *Thể lực tốt:* Đạt tiêu chuẩn Sinh viên khỏe cấp Trường + Đính kèm chứng nhận.
   - *Tình nguyện tốt:* Hoạt động Tiếp sức mùa thi 2026 + Giấy chứng nhận hiến máu tình nguyện.
   - *Hội nhập tốt:* Tham gia Hội thảo Khoa học Quốc tế sinh viên IEEE R10.
3. **Nộp hồ sơ chính thức:** Sinh viên kiểm tra màn hình tóm tắt trước khi nộp, xác nhận cam đoan thông tin trung thực. Hệ thống lưu `submittedAt` và tạo bản chụp bất biến `applicantProfileSnapshot`. Trạng thái chuyển thành `under_review`, khóa quyền sửa trực tiếp của sinh viên.
4. **Định tuyến:** Dù sinh viên học tại DUT (`inst-dut`), hệ thống tự động gắn `schoolReviewUnitId: "unit-udn"` theo quy định tổ chức.

### BƯỚC 2: Cán bộ cấp Trường sơ tuyển & Yêu cầu bổ sung (SC01 – SC10, SU01 – SU08)
1. **Tiếp nhận hồ sơ:** Cán bộ Hội Sinh viên ĐHĐN (`staff-school-udn`) đăng nhập, mở danh sách sơ tuyển. Hồ sơ `APP-2026-DN-102220123` hiển thị rõ trường thành viên là ĐH Bách khoa.
2. **Thẩm định trực tiếp:**
   - Đạo đức: Thẩm định Bảng điểm RL -> Chọn **Đạt** (Pass).
   - Học tập: Thẩm định Bảng điểm & TOEIC -> Chọn **Đạt** (Pass).
   - Thể lực: Thẩm định Giấy chứng nhận -> Chọn **Đạt** (Pass).
   - Hội nhập: Thẩm định Kỷ yếu hội thảo -> Chọn **Đạt** (Pass).
   - Tình nguyện: Cán bộ phát hiện Giấy chứng nhận hiến máu đợt 2 bản scan bị mờ dấu tròn đỏ.
3. **Yêu cầu bổ sung đúng phạm vi (LEAN-3):** Cán bộ nhấp nút "Yêu cầu bổ sung" ngay tại mục Hiến máu, nhập lý do: *"Bản scan giấy chứng nhận hiến máu tình nguyện đợt 2 bị mờ dấu mộc tròn, đề nghị chụp lại rõ nét."*
4. **Sinh viên giải trình và cập nhật:**
   - Sinh viên đăng nhập, nhận thông báo "Cần bổ sung minh chứng".
   - Mở đúng mục Tình nguyện, đọc lý do của cán bộ, tải lên tệp scan mới `Chung_nhan_hien_mau_scan_ro_dau.pdf` và gửi giải trình.
   - Minh chứng cũ tự động đánh dấu `superseded`, minh chứng mới kích hoạt `active`.
5. **Cán bộ tái đánh giá:** Cán bộ kiểm tra minh chứng mới, hài lòng và chuyển đánh giá sang **Đạt** (Pass). Tiến độ hiển thị đủ `5/5 tiêu chí Đạt`.
6. **Đề nghị của Trường:** Cán bộ nhấp nút **"Đề nghị"** (School Recommendation). Trạng thái chuyển sang `recommended_forwarding`.

### BƯỚC 3: Chọn danh sách & Gửi 01 đợt tập trung lên Thành phố (FW01 – FW17, UDN01 – UDN09)
1. **Lập danh sách chuyển đợt:** Cán bộ mở màn hình "Gửi danh sách lên Thành phố".
2. **Chọn hồ sơ chủ động:** Danh sách đề nghị gồm các sinh viên từ nhiều trường thành viên (DUT, DUE, UED, VKU). Cán bộ tích chọn 45 hồ sơ đạt chuẩn, trong đó có `APP-2026-DN-102220123`.
3. **Đính kèm văn bản Quyết định:** Nhập số văn bản `182/QĐ-ĐHĐN`, ngày ký `20/10/2026`, trích yếu: *"Quyết định công nhận và giới thiệu Sinh viên 5 tốt cấp Thành phố năm học 2025–2026"*, tải tệp PDF `182_QD_DHDN_SV5T_2026.pdf`.
4. **Xác nhận chuyển đợt 1 lần duy nhất:** Kiểm tra tóm tắt, nhấn "Xác nhận gửi lên Thành phố". Hệ thống tạo một đợt chuyển tập trung duy nhất (`batch-unit-udn-2026`). Tất cả 45 hồ sơ chuyển sang giai đoạn `CITY` với trạng thái `forwarded_to_city`.
5. **Khóa sửa đổi cấp Trường:** Đợt chuyển được khóa vĩnh viễn, trường không thể thêm bớt hồ sơ sau khi đã gửi thành công.

### BƯỚC 4: Thẩm định độc lập cấp Thành phố (CT01 – CT11)
1. **Hàng đợi chung Thành phố:** Cán bộ Thành phố (`staff-city-officer`) mở Hàng đợi thẩm định chung. Hồ sơ `APP-2026-DN-102220123` hiển thị sẵn sàng, kèm đầy đủ kết quả sơ tuyển và văn bản 182/QĐ-ĐHĐN.
2. **Độc lập thẩm định:** Cán bộ Thành phố trực tiếp rà soát 05 tiêu chí. Cả 05 tiêu chí được xác nhận phù hợp quy chế cấp Thành phố.
3. **Hoàn tất thẩm định:** Nhấn "Hoàn tất thẩm định". Hồ sơ chuyển trạng thái `review_completed` và chuyển vào danh sách chờ Hội đồng Thành phố.

### BƯỚC 5: Hội đồng Thành phố kết luận chính thức (CM01 – CM11)
1. **Hội đồng xem xét:** Thành viên Hội đồng (`staff-committee-user`) mở màn hình "Hội đồng xét chọn".
2. **Kiểm tra thông tin kép:** Đối chiếu kết quả sơ tuyển của Trường ĐHĐN (Đề nghị) và kết quả thẩm định của Cán bộ Thành phố (5/5 Đạt).
3. **Ghi nhận quyết định chính thức:** Nhấn "Ghi nhận kết luận", chọn **Được công nhận** (Recognized), nhập ghi chú: *"Hội đồng thống nhất 100% công nhận danh hiệu Sinh viên 5 tốt cấp Thành phố."*
4. **Công bố kết quả:** Khi toàn bộ danh sách được hoàn tất, Ban Thư ký ban hành Quyết định `86/QĐ-HSV-TP`. Sinh viên đăng nhập vào Cổng thông tin thấy Giấy chứng nhận điện tử chính thức và danh hiệu được vinh danh.

---

## 3. KỊCH BẢN CHU TRÌNH TẬP THỂ (COLLECTIVE TRACK: TT01 – TT04)
1. **Đại diện tập thể đăng ký:** Đại diện Chi hội 22TCLC_KTPM (`col-dut-22tclc-ktpm`) đăng nhập vào Cổng Tập thể.
2. **Kê khai 04 tiêu chuẩn:**
   - **TT01 (Công nhận cấp Trường):** Nhập Quyết định số 118/QĐ-HSV-ĐHBK ngày 30/05/2026 của HSV Trường ĐH Bách khoa + Đính kèm PDF.
   - **TT02 (Tham gia phong trào 100%):** Tổng số sinh viên chi hội = 38, tham gia phong trào = 38 (100% >= ngưỡng 100%) + Đính kèm danh sách Excel.
   - **TT03 (SV5T cấp Trường >= 20%):** Số lượng đạt SV5T cấp Trường = 8 (8/38 = 21.05% >= ngưỡng 20%) + Đính kèm danh sách xác nhận.
   - **TT04 (Không vi phạm):** Xác nhận 100% sinh viên không vi phạm kỷ luật + Đính kèm xác nhận số 35/XN-KCNTT của Ban Chủ nhiệm Khoa.
3. **Nộp hồ sơ trực tiếp:** Nhấn "Nộp hồ sơ trực tiếp lên Thành phố". Hồ sơ vào thẳng hàng đợi Thành phố (`status: "city_unassigned"`), hoàn toàn không qua sơ tuyển hay gom đợt của Trường.
4. **Thành phố thẩm định & Hội đồng công nhận:** Cán bộ Thành phố thẩm định 4 tiêu chuẩn đạt chuẩn, Hội đồng ban hành quyết định công nhận danh hiệu Tập thể Sinh viên 5 tốt cấp Thành phố.
