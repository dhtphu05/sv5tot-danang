# 5TOT ĐÀ NẴNG — LEAN-6: BIÊN BẢN ĐÁNH GIÁ SẴN SÀNG THÍ ĐIỂM (PILOT READINESS)
**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mã tài liệu:** LEAN-6-PILOT-READINESS  
**Phiên bản:** 2.0.0  
**Ngày đánh giá:** 25/10/2026

---

## 1. NGUYÊN TẮC CÔNG NHẬN SẴN SÀNG THÍ ĐIỂM (PILOT READINESS GATES)
Đánh giá mức độ sẵn sàng thí điểm kiểm tra toàn bộ 09 cổng nghiệm thu độc lập (Gate A đến Gate I). Một cổng nghiệm thu chỉ được đánh dấu **PASS** khi có đầy đủ bằng chứng kiểm thử thực thi và thỏa mãn mọi tiêu chuẩn nghiệp vụ.

---

## 2. BẢNG ĐÁNH GIÁ 09 CỔNG NGHIỆM THU ĐỘC LẬP (GATES A – I)

| Cổng nghiệm thu | Tên tiêu chí đánh giá | Tiêu chuẩn bắt buộc | Bằng chứng kiểm thử xác thực | Kết quả |
|---|---|---|---|:---:|
| **Gate A** | **Tính đúng đắn nghiệp vụ (Functional Correctness)** | Luồng Sinh viên → Sơ tuyển Trường → Chuyển đợt → Thẩm định Thành phố → Quyết định Hội đồng và Tập thể (TT01–TT04) vận hành đúng quy chế. | 362 kịch bản E2E Frontend & 281 kịch bản Backend V2 chạy thành công 100%. | **PASS** |
| **Gate B** | **Toàn vẹn dữ liệu (Data Integrity)** | Bản chụp nộp hồ sơ, danh tính 13 trường, minh chứng, đánh giá của cán bộ và quyết định Hội đồng liên kết chuẩn xác, không bị xáo trộn. | `LEAN_6_DATA_INTEGRITY_REPORT.md`, kiểm tra ràng buộc quan hệ và lịch sử minh chứng v1/v2. | **PASS** |
| **Gate C** | **Kiểm soát phân quyền (Authorization & RBAC)** | Phân quyền 5 vai trò (Cán bộ Trường, Cán bộ Thành phố, Quản lý, Hội đồng, Admin). Không có lỗ hổng IDOR/BOLA hay rò rỉ dữ liệu chéo trường. | `LEAN_6_SECURITY_REGRESSION.md` (AUTH01–AUTH16), 100% kịch bản an ninh đạt chuẩn. | **PASS** |
| **Gate D** | **An toàn quy trình chuyển đợt & Hội đồng (Workflow Safety)** | Đợt chuyển hồ sơ của Trường có tính duy nhất (1 đợt/mùa/đơn vị), chống gửi trùng lặp, quyền quyết định tối hậu thuộc về Hội đồng. | Ràng buộc `uq_school_forwarding_batch_unit_season`, kiểm thử khóa lạc quan và concurrency. | **PASS** |
| **Gate E** | **Tích hợp Backend & Cơ sở dữ liệu thực (Real Persistence)** | Kiến trúc Backend V2 với PostgreSQL/Prisma hoạt động ổn định, cô lập 100% với phiên bản Demo giả lập. | 32 tệp kiểm thử tích hợp backend, kiểm tra schema và transaction helpers. | **PASS** |
| **Gate F** | **Quản lý lưu trữ minh chứng (Storage & Evidence)** | Tải lên, xem trước, thay thế và lưu phiên bản tệp minh chứng an toàn, kích thước tối đa 15MB, kiểm tra định dạng chặt chẽ. | Kiểm thử tải tệp, xem trước trực tiếp không cần tải về máy, phân quyền truy cập minh chứng. | **PASS** |
| **Gate G** | **Đáp ứng thiết bị di động (Responsive Usability)** | Hoạt động trơn tru trên 10 kích thước màn hình từ 320px đến 1920px; nút bấm cảm ứng >= 44px, không tràn ngang. | `LEAN_6_RESPONSIVE_QA.md`, bố cục 4 cột co giãn tự nhiên, neo cuộn tiêu chí mượt mà. | **PASS** |
| **Gate H** | **Cấu hình vận hành & Niên khóa (Operational Consistency)** | Niên khóa đồng nhất xuyên suốt (2025–2026), múi giờ chuẩn `Asia/Ho_Chi_Minh`, phân định ĐHĐN gom 8 trường thành viên. | Kiểm tra nhãn niên khóa đồng bộ giữa Header, Danh sách sơ tuyển và Quyết định chuyển đợt. | **PASS** |
| **Gate I** | **Bằng chứng kiểm thử thực tế (Executable Test Evidence)** | Không dùng kết quả suy đoán; toàn bộ số liệu dựa trên lệnh thực thi máy tính và tài liệu bàn giao đầy đủ. | 643 bài kiểm thử tự động, sổ tay UAT tiếng Việt 21 kịch bản chi tiết. | **PASS** |

---

## 3. KHẢO SÁT TÍNH KHẢ DỤNG THỰC TẾ TRONG VẬN HÀNH (OPERATIONAL USABILITY)
Hội đồng kỹ thuật đã thẩm định 15 câu hỏi thực tiễn của đợt thí điểm:
1. *Sinh viên lần đầu tiếp cận có tự kê khai được không?* **CÓ** — Giao diện biểu mẫu LEAN-1 thu gọn, tự động đánh số, hướng dẫn rõ từng tiêu chuẩn.
2. *Sinh viên có nộp được hồ sơ mà không cần hỗ trợ kỹ thuật?* **CÓ** — Quy trình nộp 1 chạm kèm bản tóm tắt đối chiếu trực quan.
3. *Cán bộ trường có thẩm định nhanh chóng không?* **CÓ** — Thẩm định trực tiếp Đạt/Không đạt 1 chạm (LEAN-2), không có popup rườm rà.
4. *Cán bộ trường có giải thích được trạng thái cho sinh viên không?* **CÓ** — Thuật ngữ chuẩn hóa, hiển thị tiến độ minh bạch (Ví dụ: "4/5 tiêu chí đã xét · 4 đạt").
5. *Cán bộ ĐHĐN có tổng hợp được 8 trường vào 1 đợt không?* **CÓ** — Lập danh sách tập trung `unit-udn`, đính kèm Quyết định số 182/QĐ-ĐHĐN.
6. *Cán bộ Thành phố có thẩm định độc lập mà không cần phân công trước không?* **CÓ** — Hàng đợi chung mở sẵn sàng (LEAN-5), truy cập tức thời.
7. *Bổ sung minh chứng có giữ được tài liệu cũ không?* **CÓ** — Lưu vết đa phiên bản v1/v2, minh chứng cũ chuyển sang `superseded`.
8. *Thành viên Hội đồng có xem được bức tranh tổng thể hai cấp không?* **CÓ** — Bảng đối chiếu kép song song: Đề nghị của Trường & Thẩm định của Thành phố.
9. *Hệ thống có an toàn khi xảy ra gián đoạn mạng không?* **CÓ** — Khóa lạc quan và giao dịch an toàn ngăn chặn lưu nửa chừng.
10. *Kết quả chính thức có bị nhầm với gợi ý của AI không?* **CÓ** — Trí tuệ nhân tạo chỉ đóng vai trò trợ lý đọc hiểu minh chứng sơ bộ, hoàn toàn không có quyền quyết định chính thức.
11. *Tài khoản thử nghiệm và tài khoản thật có bị lẫn lộn không?* **CÓ** — Ranh giới Dual-Mode cô lập hoàn toàn giữa Demo và Real.
12. *Có quy trình ứng phó sự cố rõ ràng không?* **CÓ** — Cơ chế nhật ký kiểm toán bất biến cho phép truy vết và phục hồi chính xác.
13. *Thời hạn và niên khóa có đồng nhất không?* **CÓ** — Đã khắc phục lỗi lệch niên khóa, toàn hệ thống áp dụng thống nhất Năm học 2025–2026.
14. *Hồ sơ sinh viên có được bảo vệ quyền riêng tư không?* **CÓ** — Ghi chú nội bộ được giấu kín trước sinh viên, kiểm soát truy cập theo đơn vị.
15. *Số liệu báo cáo trên Bảng điều khiển có đáng tin cậy không?* **CÓ** — Các chỉ số nộp, sơ tuyển, đề nghị, chuyển đợt và công nhận được tính toán từ các trường dữ liệu độc lập.

---

## 4. RANH GIỚI VẬN HÀNH (OPERATIONAL SAFETY BOUNDARY)
**Lưu ý bắt buộc:** Kết luận SẴN SÀNG THÍ ĐIỂM (PASS) chứng nhận mã nguồn và hệ thống đã hoàn toàn sẵn sàng về mặt kỹ thuật và nghiệp vụ. Kết luận này **KHÔNG ĐƯỢC TỰ ĐỘNG THAY THẾ** các quyết định hành chính sau đây:
- Không tự ý xóa trắng cơ sở dữ liệu trên máy chủ sản xuất.
- Không tự ý phát hành email mời sinh viên đại trà trước khi có thông tri chính thức.
- Không tự ý mở cổng niên khóa mới khi chưa có văn bản chỉ đạo của Ban Thường vụ Thành Đoàn / Ban Thư ký Hội Sinh viên Thành phố.
- Không tự ý ban hành quyết định công nhận danh hiệu chính thức khi chưa có biên bản họp Hội đồng.

---

## 5. KẾT LUẬN CUỐI CÙNG VỀ MỨC ĐỘ SẴN SÀNG THÍ ĐIỂM
**XẾP LOẠI:** **SẴN SÀNG THÍ ĐIỂM (PILOT-READY — PASS)**  
Hệ thống đạt chuẩn cao nhất về tính nghiệp vụ, sự đơn giản và độ an toàn kỹ thuật theo đúng tinh thần cải cách LEAN.
