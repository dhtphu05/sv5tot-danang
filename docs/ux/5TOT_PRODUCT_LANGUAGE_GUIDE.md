# 5TOT ĐÀ NẴNG — HƯỚNG DẪN CHUẨN MỰC NGÔN NGỮ SẢN PHẨM & TRẢI NGHIỆM NGHIỆP VỤ (UX-S5.1)
*Cơ quan quản lý: Ban Thường vụ Thành Đoàn Đà Nẵng*  
*Đơn vị tổ chức & vận hành: Ban Thư ký Hội Sinh viên Việt Nam TP. Đà Nẵng*  
*Mã tài liệu: 5TOT-UX-PLG-2026*

---

## 1. NGUYÊN TẮC CỐT LÕI (NORTH STAR)

> **GIAO DIỆN NGƯỜI DÙNG PHẢI NÓI NGÔN NGỮ CỦA CÁN BỘ VÀ SINH VIÊN, KHÔNG NÓI NGÔN NGỮ CỦA HỆ THỐNG KỸ THUẬT.**

Mỗi màn hình trong hệ thống phải trả lời ngay lập tức 3 câu hỏi của người dùng:
1. **Tôi đang xem gì?** (Ngữ cảnh: Vai trò của tôi, đơn vị, năm học, trạng thái hồ sơ).
2. **Tôi cần làm gì?** (Hành động trực quan, nút bấm rõ nghĩa, không bắt đọc hướng dẫn dài).
3. **Sau khi thực hiện, kết quả sẽ như thế nào?** (Thông báo kết quả ngắn gọn, xác thực, không đe dọa người dùng).

---

## 2. BỘ TỪ ĐIỂN THUẬT NGỮ CHUẨN TẮC THEO VAI TRÒ NGHIỆP VỤ

### 2.1. Sinh viên (Student View)
| Thuật ngữ chuẩn dùng trên giao diện | Thuật ngữ kỹ thuật / developer cần LOẠI BỎ |
| :--- | :--- |
| **Hồ sơ của tôi** | Workspace sinh viên, Form kê khai |
| **Thông tin cá nhân** | Thu thập 13 trường dữ liệu, Snapshot cá nhân |
| **Kê khai thành tích** | Nhập liệu tiêu chí, Khai báo data payload |
| **Minh chứng đính kèm** | Evidence file attachment, Tệp nhị phân tải lên |
| **Lưu kê khai** | Lưu draft, Ghi nhận biến cục bộ |
| **Nộp hồ sơ** | Chuyển trạng thái nộp, Submit workflow trigger |
| **Bổ sung minh chứng** | Quy trình supplement, Khắc phục lỗi rà soát |
| **Kết quả xét chọn** | Resolution outcome, Trạng thái chung cuộc |

### 2.2. Cán bộ Sơ tuyển cấp Trường / Đơn vị (School Reviewer)
| Thuật ngữ chuẩn dùng trên giao diện | Thuật ngữ kỹ thuật / developer cần LOẠI BỎ |
| :--- | :--- |
| **Hồ sơ sơ tuyển** | Application record thuộc scope đơn vị |
| **Xét sơ tuyển** | Preliminary review evaluation pipeline |
| **Kết quả sơ tuyển** | Preliminary evaluation summary |
| **Đề nghị xét chọn** | Recommended for forwarding flag |
| **Không đề nghị** | Rejected at school level status |
| **Chờ đánh giá đề xuất** | Pending recommendation determination |
| **Danh sách đề nghị xét chọn cấp Thành phố** | Bàn chốt đợt đề xuất, Forwarding batch workspace |
| **Văn bản đề nghị xét chọn** | Official decision document attachment, Tệp QĐ đợt |
| **Gửi danh sách lên Thành phố** | Chốt và chuyển giao chính thức đợt đề xuất, Batch confirm |
| **Danh sách đã gửi** | Forwarded batch list, Danh sách đóng băng (read-only) |

### 2.3. Cán bộ Thẩm định cấp Thành phố (City Reviewer)
| Thuật ngữ chuẩn dùng trên giao diện | Thuật ngữ kỹ thuật / developer cần LOẠI BỎ |
| :--- | :--- |
| **Hồ sơ cần thẩm định** | City queue, Hồ sơ phân công workload |
| **Thẩm định hồ sơ** | City evaluation stage 2 review |
| **Xem minh chứng** | PDF viewer modal, Tải tài liệu |
| **Ghi nhận đánh giá** | Save criterion judgment snapshot |
| **Yêu cầu bổ sung** | Initiate supplementary return action |
| **Hoàn tất thẩm định** | Complete independent review |

### 2.4. Hội đồng xét chọn cấp Thành phố (Committee)
| Thuật ngữ chuẩn dùng trên giao diện | Thuật ngữ kỹ thuật / developer cần LOẠI BỎ |
| :--- | :--- |
| **Hồ sơ trình Hội đồng** | Committee dossier deck, Hồ sơ đạt thẩm định |
| **Xem hồ sơ & kết quả thẩm định** | Inspect dual-level evaluation data |
| **Xét chọn danh hiệu** | Committee vote/quorum simulation |
| **Quyết định xét chọn** | Record committee decision |
| **Công nhận danh hiệu "Sinh viên 5 tốt"** | Publish final resolution case |

### 2.5. Quản trị hệ thống (Admin Control Plane)
| Thuật ngữ chuẩn dùng trên giao diện | Thuật ngữ kỹ thuật / developer cần LOẠI BỎ |
| :--- | :--- |
| **Mùa xét chọn** | Chu kỳ season lifecycle |
| **Bộ tiêu chí** | Versioned criteria configuration |
| **Đơn vị đào tạo** | Institution registry |
| **Đơn vị sơ tuyển** | School review unit hub |
| **Tài khoản cán bộ** | Staff user account credential |
| **Phân quyền** | RBAC permission capability matrix |
| **Lịch sử thao tác** | Immutable audit log records |

---

## 3. QUY TẮC PHÂN BIỆT RÕ RÀNG CÁC TRẠNG THÁI NGHIỆP VỤ

Tuyệt đối không gộp chung hoặc dùng lẫn lộn 4 khái niệm sau tại Cấp Trường:
1. **Đã xét xong 5 tiêu chí (Criteria Reviewed 5/5):** Cán bộ đã cho điểm/kết luận từng tiêu chuẩn, nhưng chưa ra kết luận đề nghị chung.
2. **Đã ghi nhận Đề nghị (Recommended):** Nhà trường chính thức kết luận sinh viên đủ điều kiện đề xuất lên cấp Thành phố.
3. **Đã chọn vào danh sách gửi (Selected in Forwarding List):** Cán bộ tích chọn đưa sinh viên vào văn bản gửi đợt này.
4. **Đã gửi lên Thành phố (Forwarded to City):** Danh sách đã được ký duyệt văn bản và chuyển chính thức lên Hội Sinh viên Thành phố.

---

## 4. BẢNG SO SÁNH CÁCH VIẾT: TRƯỚC VÀ SAU CHUẨN HÓA

| Ngữ cảnh | Cách viết CŨ (Mang tính kỹ thuật / AI overexplained) | Cách viết MỚI (Tự nhiên, hành chính, súc tích) |
| :--- | :--- | :--- |
| **Tiêu đề trang gửi đợt** | Chốt và chuyển giao chính thức đợt đề xuất | Danh sách đề nghị xét chọn cấp Thành phố |
| **Trạng thái đợt nháp** | Đang lập dự thảo đợt đề xuất | Đang chuẩn bị danh sách |
| **Cảnh báo khóa danh sách** | Danh sách sẽ được đóng khóa cố định (read-only) sau khi chuyển thành công. | Sau khi gửi, danh sách không thể chỉnh sửa. |
| **Quy định một lần** | Thao tác này chỉ được thực hiện một lần trong mùa xét 2025–2026. | Mỗi đơn vị chỉ gửi danh sách một lần trong năm học. |
| **Nút hành động chính** | Chốt và chuyển Thành phố (6) | Gửi danh sách lên Thành phố (6) |
| **Nút xác nhận hộp thoại** | Xác nhận chuyển Thành phố (6) | Gửi 6 hồ sơ |
| **Hộp thoại phân bổ** | Phân bổ theo trường thành viên: Tổng 6 hồ sơ (chiếm diện tích lớn) | Thu gọn: Xem phân bổ theo trường (6) |
| **Ô ghi chú** | Ý kiến chuyển giao của đơn vị (tùy chọn) | Ghi chú gửi kèm (không bắt buộc) |
| **Thông báo lưu** | Đã cập nhật kết luận sơ tuyển cho sinh viên Nguyễn Minh Anh. | Đã lưu kết quả sơ tuyển. |
| **Kiểm tra tệp văn bản** | Tệp PDF hợp lệ · Sẵn sàng chuyển giao | Đã đính kèm tệp PDF |
| **Chỉ báo AI** | AI · Chưa đủ căn cứ · Đối soát sơ bộ (trên từng thẻ) | Bỏ huy hiệu AI trang trí; chỉ hiển thị khi bấm "Xem gợi ý AI" |
| **Đồng bộ năm học** | Header: 2026–2027; Nội dung: 2025–2026 | Nhất quán: Năm học 2025–2026 (theo năm học đang mở xét) |

---

## 5. DANH MỤC CÁC TỪ & CỤM TỪ CẤM DÙNG TRÊN GIAO DIỆN NGƯỜI DÙNG

1. `read-only` (thay bằng: "không thể chỉnh sửa" hoặc "chỉ xem").
2. `snapshot`, `canonical snapshot` (thay bằng: "thông tin lúc nộp hồ sơ").
3. `workflow`, `workflow engine` (thay bằng: "quy trình xét chọn").
4. `batch`, `batch lifecycle` (thay bằng: "danh sách đề nghị" hoặc "đợt xét").
5. `API`, `Backend V2`, `Prisma` (tuyệt đối không hiển thị ngoài màn hình chẩn đoán kỹ thuật).
6. `AI đối soát sơ bộ`, `AI confidence` (tránh biến hệ thống thành AI dashboard).
7. `13 trường dữ liệu chuẩn hóa`, `không lệch múi giờ` (thay bằng câu ngắn gọn: "Thông tin cá nhân sinh viên").
8. `Chuyển đợt chính thức duy nhất` (thay bằng: "Gửi danh sách lên Thành phố").
