# 5TOT ĐÀ NẴNG — MA TRẬN ĐỐI SOÁT QUY ĐỊNH XÉT CHỌN (CRITERIA 2025–2026 COVERAGE MATRIX)

**Cơ quan chỉ đạo:** Thành Đoàn Đà Nẵng  
**Cơ quan ban hành & thường trực:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Niên khóa áp dụng:** Năm học 2025–2026 (Chính thức)  
**Cấp xét chọn:** CẤP THÀNH PHỐ (Cấp duy nhất thẩm định và ra quyết định công nhận)  
**Ngày cập nhật dữ liệu hệ thống:** Tháng 10/2026  

---

## 1. TỔNG QUAN CẤU TRÚC 05 TIÊU CHÍ VÀ QUY TẮC NHÓM (ARCHITECTURE MATRIX)

Hệ thống quản lý và xét chọn Sinh viên 5 tốt TP. Đà Nẵng áp dụng mô hình dữ liệu quy chuẩn toàn vẹn cho 05 tiêu chí cốt lõi. Mỗi tiêu chí được cấu trúc theo các nhóm yêu cầu với quy tắc toán học minh bạch (`ALL_REQUIRED`, `AT_LEAST_N`, `REPEATABLE_COLLECTION`, `OPTIONAL`).

| Tiêu chí | Mã TC | Nhóm yêu cầu | Tên nhóm yêu cầu | Quy tắc nhóm | Số lượng tối thiểu | Bội số kê khai |
| :--- | :---: | :---: | :--- | :---: | :---: | :---: |
| **1. Đạo đức tốt** | TC1 | Nhóm 1.1 | Điểm rèn luyện và Chấp hành quy chế | `ALL_REQUIRED` | 2/2 bắt buộc | Đơn (SINGLE) |
| | | Nhóm 1.2 | Tiêu chuẩn bổ sung đạo đức | `AT_LEAST_N` | Đạt >= 1 trong 4 hình thức | Đa dạng (SINGLE/MULTIPLE) |
| **2. Học tập tốt** | TC2 | Nhóm 2.1 | Điểm trung bình học tập (GPA) năm học | `ALL_REQUIRED` | 1/1 bắt buộc | Đơn (SINGLE) |
| | | Nhóm 2.2 | Thành tích học thuật & NCKH | `AT_LEAST_N` | Đạt >= 1 trong 6 hình thức | Đa dạng (MULTIPLE) |
| **3. Thể lực tốt** | TC3 | Nhóm 3.1 | Hình thức xác nhận thể lực | `AT_LEAST_N` | Đạt >= 1 trong 2 hình thức | Đơn hoặc Đa dạng |
| **4. Tình nguyện tốt** | TC4 | Nhóm 4.1 | Hoạt động tình nguyện tích lũy | `REPEATABLE_COLLECTION` | Tích lũy >= 05 ngày tình nguyện | Đa dạng lặp lại (REPEATABLE) |
| | | Nhóm 4.2 | Khen thưởng tình nguyện (Tùy chọn) | `OPTIONAL` | Không bắt buộc | Đa dạng (MULTIPLE) |
| **5. Hội nhập tốt** | TC5 | Nhóm 5.1 | Nhóm A: Kỹ năng hoặc Khen thưởng Đoàn–Hội | `AT_LEAST_N` | Đạt >= 1 trong 2 hình thức (Bắt buộc) | Đa dạng (MULTIPLE) |
| | | Nhóm 5.2 | Nhóm B: Ngoại ngữ, Quốc tế, Cuộc thi | `AT_LEAST_N` | Đạt >= 1 trong 3 hình thức (Bắt buộc) | Đa dạng (MULTIPLE) |

*Ghi chú quan trọng:* Tiêu chí 5 (Hội nhập tốt) bắt buộc sinh viên phải thỏa mãn **ĐỒNG THỜI CẢ NHÓM A VÀ NHÓM B**.

---

## 2. MA TRẬN CHI TIẾT TỪNG TIÊU CHUẨN KÊ KHAI (DETAILED REQUIREMENTS MATRIX)

### TIÊU CHÍ 01: ĐẠO ĐỨC TỐT (ETHICS)

| Mã số | Tên tiêu chuẩn / Yêu cầu | Ngưỡng quy định 2025–2026 | Bội số | Minh chứng chuẩn quy định | Trường dữ liệu chuyên biệt |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **TC1.1** | Điểm rèn luyện cả năm học | >= 80/100 điểm (hoặc xếp loại Giỏi đối với cơ sở đào tạo đặc thù) | SINGLE | Bảng điểm rèn luyện năm học có mộc đỏ P.CTSV / Ban Giám hiệu | Điểm số rèn luyện, Xếp loại, Đơn vị xác nhận |
| **TC1.2** | Không vi phạm pháp luật & quy chế | Không vi phạm nội quy, quy chế nhà trường, pháp luật và địa phương cư trú | SINGLE | Bản cam kết / Bản nhận xét hạnh kiểm từ Ban cán sự lớp, Khoa | Nội dung cam kết, Đơn vị xác nhận |
| **TC1.3** | Là Đảng viên ĐCSVN | Đảng viên chính thức hoặc Đảng viên dự bị | SINGLE | Quyết định kết nạp Đảng / Bản photo thẻ Đảng viên có xác nhận | Tình trạng Đảng viên, Chi bộ, Ngày kết nạp |
| **TC1.4** | Đội thi Mác–Lênin, tư tưởng HCM | Là thành viên chính thức đội thi từ cấp chi đoàn trở lên (không yêu cầu đạt giải) | MULTIPLE | Quyết định triệu tập / Giấy xác nhận thành viên đội tuyển | Tên cuộc thi, Cấp tổ chức, Đơn vị chủ trì |
| **TC1.5** | Tham luận / Bài viết Mác–Lênin | Có bài viết / tham luận trình bày tại diễn đàn học thuật chính trị | MULTIPLE | Kỷ yếu hội thảo / Giấy biên nhận bài tham luận có xác nhận | Tên tham luận, Diễn đàn/Tọa đàm, Ngày trình bày |
| **TC1.6** | Biểu dương gương người tốt việc tốt | Thanh niên tiêu biểu, gương dũng cảm cứu người được khen thưởng các cấp | MULTIPLE | Giấy khen, bằng khen, quyết định biểu dương của cơ quan có thẩm quyền | Danh hiệu, Đơn vị biểu dương, Số quyết định |

---

### TIÊU CHÍ 02: HỌC TẬP TỐT (ACADEMIC)

| Mã số | Tên tiêu chuẩn / Yêu cầu | Ngưỡng quy định 2025–2026 | Bội số | Minh chứng chuẩn quy định | Trường dữ liệu chuyên biệt |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **TC2.1** | Điểm trung bình học tập cả năm (GPA) | ĐH: >= 3.2/4.0 hoặc >= 8.0/10. CĐ: >= 3.0/4.0 hoặc >= 7.5/10. Tính riêng năm học xét chọn. | SINGLE | Bảng điểm chính thức năm học 2025–2026 có xác nhận P.Đào tạo | Điểm GPA, Bậc đào tạo, Thang điểm (4/10), Xếp loại |
| **TC2.2** | Đề tài NCKH sinh viên đạt giải | Đề tài NCKH sinh viên đạt giải từ cấp Khoa trở lên (bắt buộc có giải) | MULTIPLE | Giấy chứng nhận giải thưởng / Quyết định khen thưởng NCKH | Tên đề tài, Xếp hạng giải, Cấp tổ chức, Đơn vị chủ trì |
| **TC2.3** | Bài viết trên tạp chí chuyên ngành | Bài viết đăng trên tạp chí chuyên ngành trong nước hoặc quốc tế (không yêu cầu giải) | MULTIPLE | Bản chụp trang bìa, mục lục và toàn văn bài báo có chỉ số ISSN/Scopus | Tên bài báo, Tên tạp chí, Chỉ số ISSN, Tập/Số xuất bản |
| **TC2.4** | Tham luận hội thảo khoa học | Bài tham luận tham gia hội thảo khoa học từ cấp Khoa trở lên (không yêu cầu giải) | MULTIPLE | Giấy xác nhận tham luận / Kỷ yếu hội thảo có chỉ số ISBN | Tên tham luận, Tên hội thảo, Cấp tổ chức, Mã ISBN |
| **TC2.5** | Sản phẩm sáng tạo / Bằng sáng chế | Được cấp bằng độc quyền sáng chế, giấy phép xuất bản, hoặc giải thưởng từ cấp trường | MULTIPLE | Bản sao văn bằng độc quyền sáng chế / Quyết định cấp phép xuất bản | Tên sản phẩm, Cơ quan cấp văn bằng, Số hiệu chứng nhận |
| **TC2.6** | Thành viên đội tuyển thi học thuật | Thành viên chính thức đội tuyển thi học thuật từ cấp trường trở lên (không yêu cầu giải) | MULTIPLE | Quyết định thành lập / Giấy triệu tập đội tuyển của Nhà trường | Tên đội tuyển, Tên kỳ thi học thuật, Cấp tổ chức |
| **TC2.7** | Giải thưởng ý tưởng sáng tạo | Đạt giải thưởng tại cuộc thi ý tưởng sáng tạo, khởi nghiệp từ cấp trường trở lên | MULTIPLE | Giấy chứng nhận đạt giải / Quyết định khen thưởng cuộc thi | Tên cuộc thi, Giải thưởng đạt được, Đơn vị tổ chức |

---

### TIÊU CHÍ 03: THỂ LỰC TỐT (PHYSICAL)

| Mã số | Tên tiêu chuẩn / Yêu cầu | Ngưỡng quy định 2025–2026 | Bội số | Minh chứng chuẩn quy định | Trường dữ liệu chuyên biệt |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **TC3.1** | Danh hiệu Thanh niên khỏe | Đạt danh hiệu "Thanh niên khỏe" (hoặc "Sinh viên khỏe") từ cấp trường trở lên | SINGLE | Giấy chứng nhận Thanh niên khỏe / Sinh viên khỏe do HSV hoặc Bộ môn GDTC cấp | Danh hiệu, Đơn vị cấp, Ngày cấp, Thời hạn |
| **TC3.2** | Giải thưởng thể thao phong trào | Tham gia VÀ đạt giải tại hoạt động thể thao phong trào từ cấp Khoa trở lên | MULTIPLE | Giấy khen / Giấy chứng nhận đạt giải (Huy chương Vàng/Bạc/Đồng, Giải Nhất/Nhì/Ba) | Môn thể thao, Tên giải đấu, Giải thưởng, Cấp tổ chức |

---

### TIÊU CHÍ 04: TÌNH NGUYỆN TỐT (VOLUNTEER)

| Mã số | Tên tiêu chuẩn / Yêu cầu | Ngưỡng quy định 2025–2026 | Bội số | Minh chứng chuẩn quy định | Trường dữ liệu chuyên biệt |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **TC4.1** | Hoạt động tình nguyện tích lũy | Tích lũy tối thiểu 05 ngày tình nguyện trong năm học. 1 lần hiến máu = 1 ngày quy đổi. | REPEATABLE | Giấy chứng nhận chiến dịch (Mùa hè xanh, Tiếp sức mùa thi), GCN Hiến máu tình nguyện | Tên hoạt động, Loại hình, Số ngày tích lũy, Đơn vị tổ chức |
| **TC4.2** | Khen thưởng tình nguyện (Tùy chọn) | Được khen thưởng hoạt động tình nguyện từ cấp Khoa trở lên trong năm học | MULTIPLE | Giấy khen, bằng khen về thành tích tình nguyện vì cộng đồng | Tên khen thưởng, Cấp khen thưởng, Quyết định số |

*Công thức tính ngày tình nguyện chuẩn mực:*
$$\text{Tổng số ngày} = \sum (\text{Ngày chiến dịch cộng đồng}) + \sum (\text{Lần hiến máu} \times 1)$$
Ví dụ quy chuẩn đạt ngưỡng: 3 ngày Mái ấm yêu thương + 1 lần hiến máu nhân đạo + 1 ngày Chủ nhật xanh = 5 ngày tình nguyện.

---

### TIÊU CHÍ 05: HỘI NHẬP TỐT (INTEGRATION)

| Mã số | Tên tiêu chuẩn / Yêu cầu | Ngưỡng quy định 2025–2026 | Bội số | Minh chứng chuẩn quy định | Trường dữ liệu chuyên biệt |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **TC5.1** | Khóa kỹ năng thực hành xã hội (Nhóm A) | Hoàn thành ít nhất 01 khóa trang bị kỹ năng thực hành xã hội | MULTIPLE | Giấy chứng nhận hoàn thành khóa tập huấn kỹ năng của Đoàn - Hội | Tên khóa học, Nội dung kỹ năng, Đơn vị tổ chức, Thời gian |
| **TC5.2** | Khen thưởng Đoàn - Hội (Nhóm A) | Được Đoàn - Hội từ cấp Khoa trở lên khen thưởng thành tích xuất sắc trong năm học | MULTIPLE | Giấy khen thành tích xuất sắc trong công tác Hội / công tác Đoàn trường học | Cấp khen thưởng, Đơn vị trao tặng, Quyết định số |
| **TC5.3** | Năng lực ngoại ngữ (Nhóm B) | B1/C, TOEIC >= 405, TOEFL iBT >= 53, IELTS >= 4.5, hoặc ĐTB học phần ngoại ngữ >= 3.0/4 (7.5/10) | MULTIPLE | Bản sao chứng chỉ ngoại ngữ còn hiệu lực hoặc Bảng điểm học phần ngoại ngữ | Loại chứng chỉ/điểm số, Ngày cấp, Đơn vị cấp, Khai báo Ngoại ngữ 2 nếu là SV chuyên ngành |
| **TC5.4** | Giao lưu, hợp tác quốc tế (Nhóm B) | Tham gia hội nghị, hội thảo, giao lưu thanh niên quốc tế từ cấp Khoa trở lên | MULTIPLE | Giấy chứng nhận đại biểu / Thư mời / Quyết định cử tham gia hoạt động quốc tế | Tên chương trình, Quốc gia/Tổ chức đối tác, Vai trò đại biểu |
| **TC5.5** | Cuộc thi kiến thức / Ngoại ngữ (Nhóm B) | Tham gia VÀ đạt giải Ba trở lên tại cuộc thi kiến thức / ngoại ngữ từ cấp Khoa trở lên | MULTIPLE | Giấy chứng nhận đạt giải (Giải Nhất, Nhì, Ba) tại cuộc thi kiến thức hoặc ngoại ngữ | Tên cuộc thi, Ngôn ngữ sử dụng, Giải thưởng đạt được, Cấp tổ chức |

---

## 3. QUY TẮC CỔNG KHÓA VÀ KIỂM DUYỆT (GATEKEEPER & VALIDATION RULES)

1. **Khóa cứng (Hard Gate) trước khi nộp hồ sơ:**
   - Phải có đủ ít nhất một kê khai hợp lệ tại mỗi nhóm yêu cầu bắt buộc của 5 tiêu chí.
   - Mỗi kê khai phải đính kèm tối thiểu 01 tệp minh chứng số hợp lệ (`.pdf`, `.jpg`, `.png`, `.webp`, `.docx`).
   - Mốc thời gian hệ thống chưa đóng cổng tiếp nhận hồ sơ cấp Thành phố.
2. **Khuyến nghị mềm (Smart Advisory - Không chặn nộp):**
   - Cảnh báo thời hạn cấp của chứng chỉ ngoại ngữ hoặc chứng nhận thể lực.
   - Đề xuất bổ sung minh chứng rõ nét hơn nếu tệp tải lên có dung lượng quá nhỏ hoặc độ phân giải thấp.
3. **Quy tắc phân định thẩm quyền:**
   - Trường đại học (32 đơn vị) là đơn vị hỗ trợ đối soát, phân loại cơ sở và sơ loại nội bộ (nếu áp dụng cơ chế trường); **Hội đồng xét chọn cấp Thành phố là cấp thẩm định và ra quyết định công nhận duy nhất**.
