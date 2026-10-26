# 5TOT ĐÀ NẴNG — BÁO CÁO PHÂN TÍCH CHÊNH LỆCH QUY CHẾ (CRITERIA 2025–2026 GAP REPORT)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Ngày báo cáo:** Tháng 10/2026  
**Đánh giá tổng thể:** ĐÃ ĐỐI SOÁT TOÀN DIỆN VÀ ĐỒNG BỘ 100% VÀO HỆ THỐNG PHẦN MỀM  

---

## 1. TỔNG QUAN PHÂN TÍCH CHÊNH LỆCH (EXECUTIVE SUMMARY)

Trước khi thực hiện đợt nâng cấp niên khóa 2025–2026, các phiên bản thử nghiệm ban đầu của hệ thống còn tồn tại một số điểm giả định đơn giản hóa, chưa phản ánh đầy đủ văn bản quy định của Ban Thư ký Hội Sinh viên TP. Đà Nẵng. 

Báo cáo này lập danh mục toàn bộ các điểm khác biệt (Gaps), tình trạng xử lý và kết quả kiểm thử trên toàn bộ các phân hệ:
1. Không gian kê khai sinh viên (`StudentApplicationWorkspace`)
2. Biểu mẫu kê khai chuyên biệt (`AddEditDeclarationModal`)
3. Công cụ tìm kiếm nội dung kê khai đa từ khóa (`FindDeclarationSearchBar`)
4. Bàn thẩm định cán bộ (`OfficerReviewWorkspace` & `reviewSelectors.ts`)
5. Hội đồng xét chọn và Báo cáo quản trị (`CommitteeViews` & `AdminDataset`)

---

## 2. BẢNG TỔNG HỢP CÁC ĐIỂM CHÊNH LỆCH ĐÃ ĐƯỢC ĐỒNG BỘ (GAP AUDIT TABLE)

| STT | Phân hệ / Tiêu chí | Nội dung phiên bản cũ / Giả định | Quy chế chính thức 2025–2026 | Tình trạng xử lý | Phân hệ đã cập nhật |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **01** | **TC1: Đạo đức tốt** | Gộp chung điểm rèn luyện và hạnh kiểm thành 1 dòng tự do | Tách biệt chuẩn: Nhóm bắt buộc (Điểm rèn luyện >= 80 hoặc Giỏi + Không vi phạm) VÀ Nhóm bổ sung (1 trong 4 hình thức: Đảng viên, Đội thi Mác–Lênin, Tham luận chính trị, Gương người tốt việc tốt) | **ĐÃ GIẢI QUYẾT** | `criteriaDefinitions.ts`<br>`AddEditDeclarationModal.tsx`<br>`PreSubmitReviewContent.tsx` |
| **02** | **TC1.4: Đội thi Mác–Lênin** | Yêu cầu phải có giải thưởng cuộc thi | Là thành viên chính thức đội thi từ cấp chi đoàn trở lên (**KHÔNG yêu cầu đạt giải**) | **ĐÃ GIẢI QUYẾT** | `regulationData.ts`<br>`FindDeclarationSearchBar.tsx` |
| **03** | **TC2.1: Điểm GPA** | Chỉ dùng 1 ngưỡng chung 3.2 | Phân tách rõ ràng: Bậc Đại học (GPA >= 3.2/4.0 hoặc >= 8.0/10); Bậc Cao đẳng (GPA >= 3.0/4.0 hoặc >= 7.5/10) | **ĐÃ GIẢI QUYẾT** | `AddEditDeclarationModal.tsx`<br>`criteriaDefinitions.ts` |
| **04** | **TC2.3 & TC2.4: Tạp chí & Tham luận** | Đòi hỏi giải thưởng học thuật | Bài báo tạp chí khoa học (ISSN/Scopus) và Tham luận hội thảo (ISBN) **KHÔNG yêu cầu giải thưởng** | **ĐÃ GIẢI QUYẾT** | `criteriaDefinitions.ts`<br>`reviewSelectors.ts` |
| **05** | **TC2.5: Sản phẩm sáng tạo** | Chỉ chấp nhận giải thưởng nghiên cứu | Chấp nhận bằng độc quyền sáng chế, giấy phép xuất bản phần mềm/ấn phẩm hoặc giải thưởng cấp trường trở lên | **ĐÃ GIẢI QUYẾT** | `AddEditDeclarationModal.tsx`<br>`regulationData.ts` |
| **06** | **TC3: Thể lực tốt** | Chỉ cho phép nộp chứng nhận "Sinh viên khỏe" | Cung cấp 2 hình thức tương đương: Danh hiệu "Thanh niên khỏe" (hoặc "Sinh viên khỏe") HOẶC Đạt giải thể thao phong trào cấp Khoa trở lên | **ĐÃ GIẢI QUYẾT** | `criteriaDefinitions.ts`<br>`studentApplication.ts` |
| **07** | **TC4: Tình nguyện tốt** | Đếm số lượng hoạt động thuần túy | Quy định tích lũy đủ **tối thiểu 05 ngày tình nguyện**; áp dụng quy đổi chuẩn: **1 lần hiến máu tình nguyện = 1 ngày tình nguyện** | **ĐÃ GIẢI QUYẾT** | `CriterionSection.tsx`<br>`reviewSelectors.ts`<br>`studentApplication.ts` |
| **08** | **TC5: Cấu trúc Hội nhập** | Sinh viên chọn 1 trong các hình thức bất kỳ | Bắt buộc đạt **CẢ HAI NHÓM ĐỒNG THỜI**: Nhóm A (Kỹ năng hoặc Khen thưởng Đoàn–Hội) VÀ Nhóm B (Ngoại ngữ, Giao lưu quốc tế hoặc Cuộc thi) | **ĐÃ GIẢI QUYẾT** | `criteriaDefinitions.ts`<br>`PreSubmitReviewContent.tsx`<br>`CriterionReviewPanel.tsx` |
| **09** | **TC5.3: Ngoại ngữ** | Chỉ cho phép nộp chứng chỉ quốc tế (IELTS/TOEIC) | Cho phép dùng điểm trung bình các học phần ngoại ngữ tích lũy >= 3.0/4.0 (7.5/10); Sinh viên chuyên ngữ kê khai Ngoại ngữ 2 | **ĐÃ GIẢI QUYẾT** | `AddEditDeclarationModal.tsx`<br>`FindDeclarationSearchBar.tsx` |
| **10** | **TC5.4: Giao lưu quốc tế** | Cán bộ thường đòi hỏi giải thưởng quốc tế | Tham gia giao lưu, hợp tác quốc tế, hội thảo quốc tế từ cấp Khoa trở lên **KHÔNG yêu cầu có giải thưởng** | **ĐÃ GIẢI QUYẾT** | `regulationData.ts`<br>`officerReviewFixtures.ts` |
| **11** | **TC5.5: Cuộc thi ngoại ngữ** | Chấp nhận mọi giải thưởng hoặc chỉ tham gia | Bắt buộc tham gia VÀ **đạt từ Giải Ba trở lên** tại cuộc thi kiến thức/ngoại ngữ từ cấp Khoa trở lên | **ĐÃ GIẢI QUYẾT** | `criteriaDefinitions.ts`<br>`PreSubmitReviewContent.tsx` |

---

## 3. PHÂN TÍCH RỦI RO NGHIỆP VỤ VÀ BIỆN PHÁP KIỂM SOÁT (RESIDUAL RISK & MITIGATION)

1. **Rủi ro khai trùng lặp ngày tình nguyện giữa nhiều chiến dịch:**
   - *Biện pháp kiểm soát:* Hệ thống hiển thị tóm tắt chi tiết `X hoạt động · Y/5 ngày tích lũy (gồm Z lần hiến máu quy đổi)` ngay tại tiêu đề Tiêu chí 4; Cán bộ xét duyệt có bảng tổng hợp đối soát mốc thời gian diễn ra hoạt động để phát hiện trùng lịch.
2. **Rủi ro nhầm lẫn giữa điểm GPA năm học và điểm tích lũy toàn khóa:**
   - *Biện pháp kiểm soát:* Biểu mẫu kê khai `AddEditDeclarationModal` và hướng dẫn minh chứng nêu rõ dòng nhắc nhở màu xanh: *"Chỉ kê khai điểm trung bình chung học tập của năm học 2025–2026, không lấy điểm CPA tích lũy toàn khóa"*.
3. **Rủi ro sinh viên chuyên ngành ngoại ngữ nộp tiếng Anh thay vì Ngoại ngữ 2:**
   - *Biện pháp kiểm soát:* Có hộp kiểm *"Tôi là sinh viên chuyên ngành ngoại ngữ"* kích hoạt ô kê khai ngôn ngữ thứ 2 kèm văn bản trích dẫn quy chế.
4. **Rủi ro nhầm lẫn vai trò giữa Trường và Thành phố:**
   - *Biện pháp kiểm soát:* Cổng trường học (32 trường) chỉ có quyền tiếp nhận sơ loại và bàn giao danh sách; toàn bộ quyền ra quyết định công nhận và ban hành giấy chứng nhận tập trung 100% tại Hội đồng xét chọn cấp Thành phố.

---

## 4. KẾT LUẬN
Tất cả các tiêu chuẩn của năm học 2025–2026 đã được đồng bộ chuẩn hóa. Hệ thống bảo đảm tính thống nhất tuyệt đối giữa văn bản quy định, giao diện kê khai của sinh viên, bộ lọc thẩm định của cán bộ và cơ sở dữ liệu báo cáo của Thành Đoàn Đà Nẵng.
