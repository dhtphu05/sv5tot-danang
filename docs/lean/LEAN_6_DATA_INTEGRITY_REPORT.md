# 5TOT ĐÀ NẴNG — LEAN-6: BÁO CÁO TOÀN VẸN DỮ LIỆU & GIAO DỊCH (DATA INTEGRITY REPORT)
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mã tài liệu:** LEAN-6-DATA-INTEGRITY  
**Phiên bản:** 2.0.0

---

## 1. MỤC TIÊU KIỂM ĐỊNH TOÀN VẸN DỮ LIỆU
Báo cáo này chứng minh rằng dữ liệu hồ sơ cá nhân và tập thể được bảo toàn tính toàn vẹn tuyệt đối qua tất cả các bước chuyển dịch trạng thái, không bị sai lệch số liệu, mất minh chứng, trùng lặp quyết định hay hỏng liên kết quan hệ trong cơ sở dữ liệu.

---

## 2. KẾT QUẢ KIỂM TRA TÍNH TOÀN VẸN CÁC THỰC THỂ DỮ LIỆU

### 2.1. Bản chụp hồ sơ nộp bất biến (Submitted Snapshot Immutability)
- **Cơ chế:** Khi sinh viên nộp hồ sơ, toàn bộ 13 trường thông tin cá nhân và cây tiêu chí kê khai tại thời điểm nộp được đóng băng vào `applicantProfileSnapshot`.
- **Kiểm nghiệm:** Khi sinh viên cập nhật thông tin trong mục Profile sau ngày nộp, hồ sơ đã nộp vẫn giữ nguyên bản chụp cũ chính xác thời điểm nộp. Cán bộ thẩm định luôn xem đúng dữ liệu sinh viên đã cam đoan.
- **Đánh giá:** **TOÀN VẸN (PASS)**

### 2.2. Tính duy nhất của Đợt chuyển cấp Trường (Batch Forwarding Uniqueness)
- **Cơ chế:** Mỗi Đơn vị xét sơ tuyển (`schoolReviewUnitId`) trong 01 niên khóa (`seasonId`) chỉ được tạo và hoàn tất tối đa 01 đợt chuyển hồ sơ chính thức lên Thành phố.
- **Ràng buộc cơ sở dữ liệu:** Ràng buộc duy nhất cấp cơ sở dữ liệu (Unique Constraint) trên bảng `SchoolForwardingBatch`:
  ```sql
  CONSTRAINT "uq_school_forwarding_batch_unit_season" UNIQUE ("schoolReviewUnitId", "seasonId")
  ```
- **Kiểm nghiệm phòng chống chạy đua (Race Condition):**
  - Giả lập 2 yêu cầu chuyển đợt đồng thời từ 2 cán bộ trường: Yêu cầu 1 hoàn tất thành công, yêu cầu 2 bị từ chối với mã lỗi `409 Conflict - Đợt chuyển hồ sơ của đơn vị đã được ban hành và gửi lên Thành phố`.
- **Đánh giá:** **AN TOÀN TUYỆT ĐỐI (PASS)**

### 2.3. Lịch sử phiên bản minh chứng trong quá trình bổ sung (Evidence Versioning)
- **Cơ chế:** Không xóa minh chứng gốc khi sinh viên tải lên tệp bổ sung.
- **Cấu trúc lưu vết:**
  - Phiên bản 1 (Tệp ban đầu): Đánh dấu `status: "superseded"`, lưu thời gian và người thẩm định ban đầu.
  - Phiên bản 2 (Tệp bổ sung): Đánh dấu `status: "active"`, liên kết với mã yêu cầu bổ sung `supplementRequestId`.
- **Kiểm nghiệm:** Cán bộ thẩm định có thể mở xem lại cả 2 phiên bản để so sánh sự cải thiện sau giải trình.
- **Đánh giá:** **BẢO TOÀN LỊCH SỬ (PASS)**

### 2.4. Tính nhất quán mẫu số thành viên Tập thể (TT02 & TT03 Consistency)
- **Nguyên tắc:** Tiêu chuẩn TT02 (100% sinh viên tham gia phong trào) và TT03 (Ít nhất 20% sinh viên đạt SV5T cấp Trường) phải dùng chung một mẫu số là Tổng số thành viên của tập thể (`totalMembers`).
- **Xác thực:** 
  - Không cho phép nhập số thành viên tham gia hoặc số đạt SV5T lớn hơn tổng số thành viên.
  - Xử lý an toàn trường hợp `totalMembers = 0` (trả về 0%, không gây lỗi chia cho 0).
- **Đánh giá:** **CHÍNH XÁC (PASS)**

### 2.5. Khóa lạc quan chống ghi đè dữ liệu (Optimistic Locking)
- **Cơ chế:** Mỗi bản ghi hồ sơ và thẩm định mang trường `version: number`.
- **Quy trình:** Khi gửi cập nhật lên server, client gửi kèm `expectedVersion`. Nếu bản ghi đã bị thay đổi bởi cán bộ khác trước đó (`currentVersion !== expectedVersion`), server từ chối cập nhật và trả về HTTP 409 Conflict.
- **Đánh giá:** **NGĂN CHẶN MẤT DỮ LIỆU ĐỒNG THỜI (PASS)**

---

## 3. TOÀN VẸN NHẬT KÝ KIỂM TOÁN (AUDIT TRAIL CONSISTENCY)
Toàn bộ các thao tác nghiệp vụ quan trọng đều sinh bản ghi kiểm toán bất biến (Append-only Audit Log) bao gồm:
1. Nộp hồ sơ cá nhân / tập thể.
2. Cán bộ trường đánh giá Đạt / Không đạt từng dòng tiêu chuẩn.
3. Cán bộ trường phát hành yêu cầu bổ sung minh chứng.
4. Sinh viên nộp minh chứng bổ sung và giải trình.
5. Cán bộ trường ghi nhận Đề nghị / Không đề nghị.
6. Cán bộ trường gửi đợt hồ sơ lên Thành phố kèm Quyết định.
7. Cán bộ Thành phố thẩm định độc lập từng tiêu chuẩn.
8. Thành viên Hội đồng Thành phố ban hành kết luận công nhận danh hiệu.

Mỗi bản ghi kiểm toán ghi nhận rõ: `actorId`, `actorRole`, `actionType`, `targetEntityId`, `timestamp`, `ipAddress` và `metadataChanges`.
