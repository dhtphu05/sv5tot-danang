# LEAN-0.1: NHẬT KÝ QUYẾT ĐỊNH VÀ GIẢI ĐÁP NGHIỆP VỤ
## (Decision Log: Confirmed Assumptions, Trade-offs & Open Policy Points — Corrected)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Mục đích:** Ghi nhận chính thức các quyết định kiến trúc, các giả định nghiệp vụ và danh mục các điểm mở cần hướng dẫn từ Ban Thường vụ Thành Đoàn / Ban Thư ký Hội Sinh viên Thành phố.

---

## 1. PHÂN LOẠI TRẠNG THÁI QUYẾT ĐỊNH (DECISION CATEGORIES)

Mọi nội dung trong nhật ký này được phân loại minh bạch theo 6 nhóm chuẩn tắc:
- `[CUSTOMER-CONFIRMED]`: Đã được khách hàng/chủ quản khẳng định chính thức trong yêu cầu nghiệp vụ.
- `[SUPPORTED BY APPROVED PROJECT WORKFLOW]`: Được bảo chứng bởi quy chế xét chọn và thể thức văn bản hiện hành của Đoàn - Hội.
- `[VERIFIED EXISTING TECHNICAL CONTRACT]`: Đã được kiểm chứng trong mã nguồn thực tế tại `/app/applet`.
- `[PROPOSED]`: Đề xuất thiết kế của nhóm kỹ thuật đang chờ xem xét.
- `[REQUIRES BUSINESS SIGN-OFF]`: Điểm mở bắt buộc phải có văn bản hướng dẫn/phê duyệt của cấp có thẩm quyền trước khi áp dụng.
- `[SUPERSEDED]`: Đề xuất cũ đã bị bác bỏ hoặc thay thế bởi kết luận mới.

---

## 2. MA TRẬN QUYẾT ĐỊNH NGHIỆP VỤ & KIẾN TRÚC (DECISION MATRIX)

| Mã quyết định | Nội dung quyết định nghiệp vụ | Cơ sở pháp lý & Kỹ thuật | Trạng thái phân loại |
| :---: | :--- | :--- | :---: |
| **DEC-01** | **Mô hình Thẩm định 2 cấp chính thức:**<br>Chỉ tồn tại 2 cấp thẩm định: Cấp 1 (Xét sơ cấp Trường) và Cấp 2 (Xét duyệt cấp Thành phố). Không tạo thêm cấp trung gian trong hệ thống. | Quy chế xét chọn Sinh viên 5 tốt TP. Đà Nẵng | `[CUSTOMER-CONFIRMED]` |
| **DEC-02** | **Cơ chế Hub Đại học Đà Nẵng (UDN Hub):**<br>8 trường thành viên ĐHĐN (DUT, DUE, UED, UFL, UTE, VKU, VNUK, SMP) được định tuyến về `unit-udn`. Chung 1 đợt chuyển giao và 1 Quyết định đề xuất duy nhất của Giám đốc ĐHĐN, nhưng giữ nguyên định danh trường đào tạo của sinh viên. | Thực tế tổ chức của Ban Cán sự Đoàn / HSV Đại học Đà Nẵng | `[CUSTOMER-CONFIRMED]` |
| **DEC-03** | **Độc lập của các trường Đại học ngoài UDN:**<br>ĐH Duy Tân, ĐH Đông Á, ĐH Kiến trúc, ĐH TDTT, ĐH Kỹ thuật Y - Dược, ĐH FPT là các Đơn vị xét sơ độc lập, tự ban hành Quyết định đề xuất riêng. | Danh mục cơ sở giáo dục đại học TP. Đà Nẵng | `[CUSTOMER-CONFIRMED]` |
| **DEC-04** | **Hàng đợi dùng chung cấp Thành phố (Shared Queue):**<br>Toàn bộ Cán bộ Thành phố được ủy quyền cùng truy cập một hàng đợi chung. Loại bỏ quy trình phân công cá nhân bắt buộc (`assignee`) và loại bỏ văn bản điều phối vụ việc (`ResolutionCase`). | Tối ưu hóa năng suất xử lý của Ban Thanh niên Trường học | `[CUSTOMER-CONFIRMED]` |
| **DEC-05** | **Hồ sơ Tập thể nộp trực tiếp cấp Thành phố:**<br>Hồ sơ Tập thể (TT01–TT04) nộp thẳng cấp Thành phố sau khi đã có Quyết định công nhận cấp Trường (TT01). Không chạy qua quy trình sơ tuyển cấp trường hay đợt chuyển giao trên hệ thống. | Tinh giản thủ tục cho các Chi hội và Liên chi hội | `[CUSTOMER-CONFIRMED]` |
| **DEC-06** | **Tách rời Hoàn tất thẩm định và Đạt tiêu chuẩn:**<br>Hoàn tất thẩm định thể hiện con người đã xét xong; một hồ sơ có thể hoàn tất thẩm định với kết quả Không đạt. Đạt 5/5 tiêu chí không tự động thay thế quyết định Đề xuất hay Công nhận. | Nguyên tắc phân định 5 chiều độc lập (LEAN-0.1) | `[CUSTOMER-CONFIRMED]` |
| **DEC-07** | **Thao tác thẩm định trực tiếp trên dòng (Direct Inline Review):**<br>Cán bộ đánh giá Đạt/Không đạt trực tiếp ngay cạnh dòng kê khai của sinh viên. Hệ thống tự động suy diễn tiến độ tiêu chí mà không bắt bấm nút duyệt tiêu chí thủ công. | Hợp đồng thẩm định tinh gọn | `[CUSTOMER-CONFIRMED]` |
| **DEC-08** | **Ngăn bổ sung minh chứng nội ngữ cảnh (Contextual Drawer):**<br>Thay thế modal che khuất màn hình bằng ngăn trượt tự động khóa phạm vi; tách biệt tuyệt đối ghi chú nội bộ và lời nhắn gửi sinh viên. | Tinh giản tương tác bổ sung minh chứng | `[CUSTOMER-CONFIRMED]` |
| **DEC-09** | **Quy tắc an toàn trong giai đoạn kiểm toán (Safety Restriction):**<br>Trong giai đoạn LEAN-0 và LEAN-0.1, tuyệt đối không sửa đổi schema Prisma, không chạy DB migration. (Lưu ý: Đây là quy tắc an toàn khi lập kế hoạch, không phải lệnh cấm vĩnh viễn nếu tương lai có nhu cầu chính đáng được phê duyệt). | Quy tắc an toàn môi trường thực thi | `[VERIFIED EXISTING TECHNICAL CONTRACT]` |
| **DEC-10** | **Tự động hóa đề xuất và công nhận:**<br>*(Đề xuất cũ của LEAN-0)* Tự động gom hồ sơ 5/5 vào đợt chuyển giao, tự động gửi TP, tự động công nhận danh hiệu và tự động 1-click công bố. | **BÁC BỎ:** Vi phạm thẩm quyền con người. Mọi quyết định đề xuất, chuyển giao, công nhận và công bố bắt buộc phải do con người quyết định. | `[SUPERSEDED]` |
| **DEC-11** | **Thời hạn bổ sung cố định 3 ngày làm việc:**<br>*(Đề xuất cũ của LEAN-0)* Áp đặt cứng thời hạn 3 ngày cho mọi yêu cầu bổ sung. | **CHUYỂN VÀO ĐIỂM MỞ:** Thời hạn phải lấy từ cấu hình mùa xét hoặc do cán bộ nhập cụ thể. | `[REQUIRES BUSINESS SIGN-OFF]` |

---

## 3. CÁC ĐIỂM NGHIỆP VỤ MỞ CẦN HƯỚNG DẪN BỔ SUNG (OPEN POLICY ITEMS)

Các nội dung sau đây bắt buộc phải có văn bản hướng dẫn cụ thể từ Ban Thư ký Hội Sinh viên Thành phố trước khi cấu hình vào hệ thống vận hành chính thức:

1. **Khung thời gian bổ sung minh chứng cấp Thành phố:**
   - *Hiện trạng:* Cán bộ có thể chủ động nhập ngày giờ hết hạn khi gửi yêu cầu.
   - *Điểm mở:* Hội Sinh viên Thành phố có ban hành khung giờ chuẩn (ví dụ: tối đa 3 ngày làm việc hay tính tròn 72 giờ từ thời điểm phát lệnh)?
2. **Quy chế xét chọn "Sinh viên 5 tốt tiêu biểu" cấp Thành phố:**
   - *Hiện trạng:* Hệ thống tính điểm tổng hợp dựa trên ĐRL + GPA + Thành tích NCKH/Khen thưởng.
   - *Điểm mở:* Tiêu chí xếp hạng và số lượng tối đa ứng viên tiêu biểu được đề xuất trao Bằng khen của Chủ tịch UBND Thành phố Đà Nẵng là bao nhiêu?
3. **Xử lý các trường hợp đặc thù về điểm học tập đối với sinh viên năm cuối:**
   - *Hiện trạng:* Quy chế cho phép một số ngành đặc thù áp dụng mức điểm TBHT tích lũy thay vì điểm năm học.
   - *Điểm mở:* Cần bảng danh mục ngành và điều kiện áp dụng cụ thể của từng trường đại học thành viên.

---

## 4. BIÊN BẢN GHI NHẬN TRẠNG THÁI BÁO CÁO

- **Nhóm Kiến trúc Hệ thống:** Đã hoàn tất đối soát mã nguồn thực tế và chỉnh sửa đồng bộ toàn bộ tài liệu LEAN-0.
- **Cam kết kỹ thuật:** 100% tuân thủ TypeScript, không sửa đổi runtime code trong pha kiểm toán, sẵn sàng cho việc triển khai LEAN-1 khi có lệnh chính thức.
