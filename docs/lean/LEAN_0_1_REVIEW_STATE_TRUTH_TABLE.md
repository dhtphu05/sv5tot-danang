# LEAN-0.1: BẢNG CHÂN TRỊ TRẠNG THÁI THẨM ĐỊNH & TÍNH ĐỦ ĐIỀU KIỆN
## (Review State & Eligibility Truth Table: Multi-Dimensional Decoupling)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Niên khóa áp dụng:** Năm học 2025–2026  
**Mục tiêu cốt lõi:** Phân định dứt khoát giữa **Tính hoàn tất thẩm định (Review Completion)** và **Kết quả đủ điều kiện (Eligibility Result)**; chuẩn hóa hành vi tổng hợp `ALL_REQUIRED`, `AT_LEAST_N`, và đặc tả 20 kịch bản kiểm thử nghiệm thu (BC01–BC20).

---

## 1. NGUYÊN TẮC PHÂN TÁCH 5 CHIỀU ĐỘC LẬP (THE 5 INDEPENDENT DIMENSIONS)

Hệ thống thẩm định 5TOT Đà Nẵng quản lý 5 chiều thông tin hoàn toàn độc lập, không được phép gộp chung hay suy diễn bắc cầu trái phép:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CHIỀU 1: TIẾN ĐỘ THẨM ĐỊNH (Review Completion Progress)                                          │
│ -> Thể hiện khối lượng công việc con người đã thực hiện: CHƯA XÉT / ĐANG XÉT / HOÀN TẤT XÉT      │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CHIỀU 2: KẾT QUẢ TIÊU CHÍ (Criterion Eligibility Result)                                         │
│ -> Thể hiện mức độ đạt chuẩn quy định: ĐẠT (PASS) / KHÔNG ĐẠT (FAIL) / CHƯA XÁC ĐỊNH             │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CHIỀU 3: KẾT LUẬN SƠ BỘ CẤP TRƯỜNG (School Preliminary Recommendation)                           │
│ -> Phán quyết chính thức của Trường: ĐỀ NGHỊ CHUYỂN TP / KHÔNG ĐỀ NGHỊ (Hành động con người)    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CHIỀU 4: KẾT LUẬN THẨM ĐỊNH CẤP THÀNH PHỐ (City Independent Review Outcome)                      │
│ -> Thẩm định độc lập của cán bộ Thành phố: ĐỦ ĐIỀU KIỆN TRÌNH HĐ / KHÔNG ĐỦ ĐIỀU KIỆN            │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CHIỀU 5: QUYẾT NGHỊ HỘI ĐỒNG THÀNH PHỐ (Committee Official Recognition Decision)                 │
│ -> Quyết định pháp lý tối cao: CÔNG NHẬN DANH HIỆU / KHÔNG CÔNG NHẬN (Kèm Quyết định & Số hiệu) │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

> **Ví dụ điển hình bắt buộc:**  
> Hồ sơ có 4 tiêu chí Đạt (Đạo đức, Học tập, Tình nguyện, Hội nhập) và 1 tiêu chí Không đạt (Thể lực).  
> - **Tiến độ thẩm định (Review Completion):** **HOÀN TẤT (5/5 tiêu chí đã xét xong)**.  
> - **Kết quả tiêu chí (Criterion Result):** 4 Đạt / 1 Không đạt.  
> - **Tính đủ điều kiện toàn diện (Overall Eligibility):** **KHÔNG ĐẠT**.  
> - **Trạng thái giao diện:** Hiển thị rõ "Đã hoàn tất thẩm định (4/5 tiêu chí đạt)", tuyệt đối KHÔNG bị treo ở trạng thái "Đang xét" chỉ vì có 1 tiêu chí Không đạt!  
> - **Hành động tiếp theo của Trường:** Cán bộ Trường ghi nhận quyết định "Không đề nghị chuyển Thành phố" hoặc lập biên bản lưu trữ tại cơ sở.

---

## 2. BẢNG CHÂN TRỊ TỔNG HỢP TIÊU CHÍ (CRITERION EVALUATION TRUTH TABLE)

Bảng này mô tả chính xác mối quan hệ giữa trạng thái đánh giá dòng kê khai của con người và kết quả suy diễn của Tiêu chí:

| Tình huống thực tế (Scenario) | Trạng thái các mục con / minh chứng | Tiến độ thẩm định (Review Completion) | Kết quả tiêu chí (Criterion Result) | Cơ sở nghiệp vụ & Diễn giải |
| :--- | :--- | :---: | :---: | :--- |
| **S01: Chưa có phán quyết nào** | Mọi dòng kê khai đều `not_reviewed` | **Chưa xét** (`not_reviewed`) | **Chưa xác định** (`undetermined`) | Chưa có cán bộ nào mở ra đánh giá. |
| **S02: Đang xét dở dang** | Một số dòng đã đánh giá, còn dòng bắt buộc chưa xét | **Đang xét** (`reviewing`) | **Chưa xác định** (`undetermined`) | Chưa đủ dữ kiện để khẳng định Đạt hay Không đạt. |
| **S03: Đạt toàn bộ mục bắt buộc** | Tất cả yêu cầu bắt buộc và lựa chọn đều đạt chuẩn | **Hoàn tất** (`completed`) | **ĐẠT (PASS)** | Thỏa mãn 100% điều kiện của tiêu chí. |
| **S04: Hoàn tất với 1 mục bắt buộc thất bại** | Đã xét hết, có 1 yêu cầu bắt buộc bị `unsuitable` | **Hoàn tất** (`completed`) | **KHÔNG ĐẠT (FAIL)** | **Trọng yếu:** Đã xét xong toàn bộ công việc, kết luận dứt khoát là Không đạt. Không treo hồ sơ. |
| **S05: Phương án lựa chọn không kê khai** | Nhóm `AT_LEAST_N` (min=1): Đã đạt Phương án 1, Phương án 2 để trống | **Hoàn tất** (`completed`) | **ĐẠT (PASS)** | Phương án 2 không tạo ra công việc tồn đọng (No outstanding work). Hiển thị nhãn mềm `(Phương án khác)`. |
| **S06: Đạt đủ số lượng phương án lựa chọn** | Nhóm `AT_LEAST_N` (min=2): Đã có 2 phương án đạt, phương án 3 chưa xét | **Hoàn tất** (`completed`)* | **ĐẠT (PASS)** | Đủ ngưỡng tối thiểu. Nếu phương án 3 sinh viên tự nguyện nộp, cán bộ có thể xem hoặc bỏ qua mà không chặn tiêu chí. |
| **S07: Một phương án hỏng, phương án khác chưa xét** | Nhóm `AT_LEAST_N`: Phương án 1 bị `unsuitable`, Phương án 2 chưa xét | **Đang xét** (`reviewing`) | **Chưa xác định** (`undetermined`) | Chưa thể kết luận Không đạt vì sinh viên vẫn còn Phương án 2 có khả năng cứu vãn tiêu chí. |
| **S08: Mọi phương án lựa chọn đều thất bại** | Nhóm `AT_LEAST_N`: Toàn bộ các phương án sinh viên nộp đều bị `unsuitable` | **Hoàn tất** (`completed`) | **KHÔNG ĐẠT (FAIL)** | Đã cạn kiệt các khả năng đạt chuẩn của nhóm. |
| **S09: Đang chờ bổ sung minh chứng** | Có ít nhất 1 yêu cầu gửi bổ sung (`waiting_student`) | **Chờ bổ sung** (`needs_supplement`) | **Tạm dừng / Chưa xác định** | Bảo lưu các phán quyết cũ, không tự động chuyển thành Đạt hay Không đạt. |
| **S10: Sinh viên nộp lại bổ sung** | Sinh viên đã nộp lại tệp, cán bộ chưa kiểm tra | **Chờ kiểm tra lại** (`supplement_returned`) | **Tạm dừng / Chưa xác định** | Tuyệt đối không tự động coi là đã Đạt; buộc cán bộ phải đối soát tệp mới. |
| **S11: Sửa phán quyết cũ từ Đạt sang Không đạt** | Cán bộ phát hiện sai sót, đổi 1 dòng từ Đạt -> Không đạt | **Tự động tính lại** | **Tính lại an toàn** | Nếu dòng đó làm gãy điều kiện bắt buộc, tiêu chí lập tức chuyển sang Không đạt. |

---

## 3. QUY TẮC TỔNG HỢP CHI TIẾT THEO CẤP BẬC (EVALUATION HIERARCHY)

Để loại bỏ hoàn toàn các lỗi suy diễn của LEAN-0, quy trình tính toán tuân thủ đúng thứ bậc 6 tầng sau:

```
[TẦNG 1: DÒNG KÊ KHAI (Declaration)]
   │ -> Kết quả: suitable (Đạt) | unsuitable (Không đạt) | needs_supplement | not_reviewed
   ▼
[TẦNG 2: YÊU CẦU THÀNH PHẦN (Requirement)]
   │ -> Trường hợp Multiplicity = SINGLE: Kết quả = Kết quả của dòng kê khai duy nhất.
   │ -> Trường hợp Multiplicity = MULTIPLE: Yêu cầu ĐẠT nếu có ÍT NHẤT 1 kê khai hợp lệ (suitable).
   │    Một kê khai phụ bị unsuitable KHÔNG làm hỏng toàn bộ yêu cầu nếu đã có kê khai khác đạt chuẩn!
   ▼
[TẦNG 3: NHÓM YÊU CẦU (Requirement Group)]
   │ -> Nhóm ALL_REQUIRED: Tất cả các Requirement con bắt buộc phải ĐẠT.
   │ -> Nhóm AT_LEAST_N: Số lượng Requirement con ĐẠT phải >= N.
   │    (Các Requirement không kê khai được coi là N/A, không chặn tiến độ).
   ▼
[TẦNG 4: TIÊU CHÍ (Criterion)]
   │ -> ĐẠT: Mọi nhóm con (ALL_REQUIRED và AT_LEAST_N) đều ĐẠT.
   │ -> KHÔNG ĐẠT: Có ít nhất 1 nhóm con bị xác nhận Không đạt không thể cứu vãn.
   │ -> HOÀN TẤT THẨM ĐỊNH: Đã có phán quyết dứt khoát trên toàn bộ phạm vi cần thiết.
   ▼
[TẦNG 5: HỒ SƠ TOÀN DIỆN (Application Level)]
   │ -> TIẾN ĐỘ: Số tiêu chí đã thẩm định xong / 5 (Ví dụ: 5/5 đã thẩm định).
   │ -> ĐỦ ĐIỀU KIỆN SƠ BỘ: Đạt 5/5 tiêu chuẩn quy định.
   │ -> KHÔNG ĐỦ ĐIỀU KIỆN: Đạt < 5 tiêu chuẩn quy định.
   ▼
[TẦNG 6: PHÁN QUYẾT HÀNH CHÍNH & PHÁP LÝ (Human Administrative Decisions)]
   │ -> Cấp Trường: Đề xuất chuyển TP (Recommended) / Không đề xuất (Not Recommended).
   │ -> Chuyển giao: Gói chuyển giao cấp Trường kèm Quyết định đề xuất chính thức.
   │ -> Cấp Thành phố: Kết luận thẩm định độc lập của Cán bộ Thành phố.
   │ -> Hội đồng: Nghị quyết / Quyết định công nhận chính thức kèm danh sách công bố.
```

---

## 4. CHI TIẾT BẢO TỒN THẨM QUYỀN HÀNH CHÍNH (HUMAN AUTHORITY PRESERVATION)

| Thao tác nghiệp vụ | Hệ thống tự động thực hiện? | Quyền hạn của con người bắt buộc | Văn bản / Chứng thư bắt buộc |
| :--- | :---: | :--- | :--- |
| **Tính số tiêu chí đã xét** | **CÓ** (Tự động đếm) | Không cần thao tác | Không |
| **Tính số tiêu chí Đạt/Không đạt**| **CÓ** (Tự động tính) | Không cần thao tác | Không |
| **Kết luận sơ tuyển cấp Trường** | **TUYỆT ĐỐI KHÔNG** | Cán bộ Trường click "Đề xuất" hoặc "Không đề xuất" | Biên bản họp xét sơ tuyển của Trường |
| **Chọn hồ sơ vào đợt chuyển giao**| **TUYỆT ĐỐI KHÔNG** | Cán bộ Trường tích chọn (hoặc duyệt danh sách chọn hàng loạt) | Khớp đúng danh sách trình Giám đốc/Hiệu trưởng |
| **Ký chuyển hồ sơ lên Thành phố** | **TUYỆT ĐỐI KHÔNG** | Lãnh đạo đơn vị xét sơ thực hiện ký chuyển | **Quyết định đề xuất chính thức (PDF đóng dấu)** |
| **Thẩm định cấp Thành phố** | **TUYỆT ĐỐI KHÔNG** | Cán bộ Thành phố thẩm định độc lập từng tiêu chí | Biên bản thẩm tra của Ban TNTH |
| **Công nhận danh hiệu SV5T** | **TUYỆT ĐỐI KHÔNG** | Hội đồng Xét chọn Thành phố biểu quyết thông qua | **Quyết định công nhận của Hội đồng Thành phố** |
| **Công bố kết quả ra công chúng** | **TUYỆT ĐỐI KHÔNG** | Thường trực Hội đồng bấm phê duyệt công bố | Thông báo chính thức của Ban Thư ký Hội Sinh viên TP |

---

## 5. ĐẶC TẢ 20 KỊCH BẢN KIỂM THỬ NGHIỆM THU (BUSINESS ACCEPTANCE CRITERIA: BC01–BC20)

Bộ 20 kịch bản này là chuẩn mực kiểm thử tự động và bán tự động bắt buộc trước khi bàn giao hệ thống:

### BC01: Đạt cả 5 tiêu chí (All Five Criteria Passed)
- **Đầu vào:** Sinh viên có cả 5 tiêu chí được đánh giá Đạt (`suitable`).
- **Kết quả mong đợi:**
  - `reviewedCriteriaCount = 5`, `passedCriteriaCount = 5`.
  - Hiển thị nhãn: "Đủ điều kiện sơ bộ (5/5)".
  - **Khẳng định an toàn:** Không tự động đánh dấu "Đề xuất chuyển Thành phố", không tự động đưa vào đợt chuyển giao. Cán bộ Trường vẫn phải chủ động đưa ra kết luận đề xuất.

### BC02: 4 Đạt, 1 Không đạt (Four Passed, One Failed)
- **Đầu vào:** Đạo đức (Đạt), Học tập (Đạt), Thể lực (Không đạt do ĐRL thể thao không đủ), Tình nguyện (Đạt), Hội nhập (Đạt).
- **Kết quả mong đợi:**
  - `reviewedCriteriaCount = 5`, `passedCriteriaCount = 4`, `failedCriteriaCount = 1`.
  - Tiến độ thẩm định: **HOÀN TẤT (100% việc xét đã xong)**.
  - Trạng thái: "Không đủ điều kiện (4/5 tiêu chí đạt)".
  - **Khẳng định an toàn:** Hồ sơ KHÔNG bị kẹt ở trạng thái "Đang xét". Cán bộ có thể ghi nhận kết luận "Không đề xuất" và hoàn tất xử lý hồ sơ.

### BC03: Thẩm định dở dang (Partially Reviewed)
- **Đầu vào:** Đã duyệt xong Tiêu chí 1 và 2; Tiêu chí 3, 4, 5 chưa có thao tác.
- **Kết quả mong đợi:**
  - `reviewedCriteriaCount = 2`, `passedCriteriaCount = 2`.
  - Trạng thái hồ sơ: "Đang xét sơ tuyển (2/5 tiêu chí đã xét)".
  - Nút bấm chuyển giao bị khóa, hiển thị rõ số tiêu chí còn thiếu.

### BC04: Nhóm lựa chọn thỏa mãn (ONE_OF Satisfied)
- **Đầu vào:** Tiêu chí Thể lực: Sinh viên nộp "Giấy chứng nhận SV Khỏe" và được duyệt Đạt. Mục "Giải thể thao" không kê khai.
- **Kết quả mong đợi:**
  - Tiêu chí Thể lực tự động chuyển sang Đạt.
  - Mục "Giải thể thao" hiển thị nhãn mềm `(Phương án khác - Chưa kê khai)`, tuyệt đối không hiển thị cảnh báo đỏ hoặc tính vào số lượng công việc còn thiếu.

### BC05: Mọi phương án lựa chọn đều hỏng (ONE_OF Unsatisfied)
- **Đầu vào:** Tiêu chí Thể lực: Sinh viên nộp cả 2 phương án (SV Khỏe và Giải thể thao), nhưng cả 2 đều bị cán bộ đánh giá Không đạt (do giấy tờ giả mạo hoặc không đúng năm học).
- **Kết quả mong đợi:**
  - Nhóm Thể lực lập tức kết luận Không đạt.
  - Tiêu chí Thể lực chuyển sang trạng thái "Không đạt" và "Hoàn tất thẩm định".

### BC06: Nhiều kê khai trong cùng 1 yêu cầu (Multiple Declarations)
- **Đầu vào:** Tiêu chí Học tập - Nghiên cứu khoa học: Sinh viên nộp 2 đề tài (Đề tài A nghiệm thu Đạt; Đề tài B chưa nghiệm thu bị cán bộ đánh giá `unsuitable`).
- **Kết quả mong đợi:**
  - Yêu cầu NCKH vẫn được tính là ĐẠT nhờ Đề tài A.
  - Sự thất bại của Đề tài B không làm gãy toàn bộ Tiêu chí Học tập.

### BC07: Nhóm bắt buộc thiếu mục (ALL_REQUIRED Strictness)
- **Đầu vào:** Tiêu chí Đạo đức: Điểm rèn luyện Đạt (85 điểm), nhưng mục "Cam kết không vi phạm pháp luật" bị đánh dấu Không đạt.
- **Kết quả mong đợi:**
  - Nhóm Đạo đức nền tảng thất bại -> Tiêu chí Đạo đức kết luận Không đạt.

### BC08: Đang có yêu cầu bổ sung (Active Supplementation)
- **Đầu vào:** Cán bộ phát lệnh bổ sung minh chứng cho mục Điểm rèn luyện.
- **Kết quả mong đợi:**
  - Trạng thái dòng: `needs_supplement`.
  - Trạng thái tiêu chí: `needs_supplement`.
  - Hồ sơ hiển thị cảnh báo: "Chờ sinh viên bổ sung minh chứng".
  - Chặn quyền bấm kết luận tiêu chí hoặc chuyển giao hồ sơ cho đến khi sinh viên nộp lại.

### BC09: Sinh viên đã gửi bổ sung (Supplement Returned)
- **Đầu vào:** Sinh viên tải tệp minh chứng mới và gửi phản hồi.
- **Kết quả mong đợi:**
  - Trạng thái dòng: `supplement_returned`.
  - Giao diện cán bộ hiển thị thẻ so sánh (Diff View) giữa tệp cũ và tệp mới.
  - **Khẳng định an toàn:** Dòng không tự động chuyển thành Đạt; cán bộ bắt buộc phải bấm Đạt hoặc Không đạt sau khi xem tệp mới.

### BC10: Ghi nhận kết luận đề xuất độc lập (Independent School Recommendation)
- **Đầu vào:** Hồ sơ đạt 5/5 tiêu chí.
- **Kết quả mong đợi:** Cán bộ Trường có thể chọn "Đề xuất chuyển Thành phố" (`recommended`) HOẶC "Không đề xuất" (`not_recommended`) kèm ô nhập lý do nội bộ của Hội đồng trường.

### BC11: Chọn lọc hồ sơ chuyển giao có kiểm soát (School Bulk Selection)
- **Đầu vào:** Cán bộ Trường bấm "Chọn tất cả hồ sơ đủ điều kiện".
- **Kết quả mong đợi:** Hệ thống chọn các hồ sơ có đề xuất `recommended`, hiển thị thanh tóm tắt số lượng (ví dụ: "Đã chọn 45/50 hồ sơ"). Cán bộ có thể bỏ tích chọn từng hồ sơ trước khi tiến hành chuyển giao.

### BC12: Đợt chuyển giao Hub Đại học Đà Nẵng (UDN Consolidated Forwarding)
- **Đầu vào:** 8 trường thành viên ĐHĐN (Bách khoa, Kinh tế, Sư phạm...) có tổng cộng 160 hồ sơ đề xuất.
- **Kết quả mong đợi:**
  - Chỉ tạo duy nhất 1 đợt chuyển giao mang mã `unit-udn`.
  - Đính kèm 1 Quyết định đề xuất duy nhất do Giám đốc ĐHĐN ký.
  - Từng hồ sơ vẫn bảo lưu chính xác mã trường thành viên (`inst-dut`, `inst-due`...).
  - Chuyển thành công một lần duy nhất trong mùa xét (Idempotent batch).

### BC13: Thành phố thẩm định độc lập phủ quyết kết quả trường (City Independent Verdict)
- **Đầu vào:** Trường sơ tuyển đánh giá mục Ngoại ngữ là Đạt (chấp nhận chứng chỉ nội bộ). Cán bộ Thành phố kiểm tra thấy chứng chỉ không nằm trong khung tham chiếu cấp Thành phố -> Đánh dấu `unsuitable`.
- **Kết quả mong đợi:**
  - Kết quả tại cấp Thành phố chuyển thành Không đạt.
  - Dữ liệu lịch sử xét sơ của Trường vẫn được bảo lưu nguyên vẹn để đối chiếu, không bị ghi đè.

### BC14: Thành phố hoàn tất thẩm định với hồ sơ không đạt (City Review Completed with Failures)
- **Đầu vào:** Cán bộ Thành phố thẩm định xong 5 tiêu chí, kết luận 4 Đạt / 1 Không đạt.
- **Kết quả mong đợi:** Cán bộ Thành phố hoàn tất thẩm định với kết luận "Không đủ điều kiện trình Hội đồng". Hồ sơ không được chuyển tiếp vào danh sách đề xuất công nhận.

### BC15: Hội đồng Thành phố bác bỏ hồ sơ đủ điều kiện (Committee Rejection)
- **Đầu vào:** Hồ sơ đạt 5/5 tiêu chí cấp Thành phố, nhưng trong phiên họp Hội đồng phát hiện sinh viên có vi phạm quy chế thi cử đang trong thời gian xử lý khiếu nại.
- **Kết quả mong đợi:** Hội đồng ghi nhận kết luận "Không công nhận danh hiệu" kèm lý do vào biên bản phiên họp. Hồ sơ chuyển sang `finalized_not_recognized`.

### BC16: Tính toán chỉ số Tập thể TT01–TT04 (Collective Track Math)
- **Đầu vào:** Chi hội nộp hồ sơ: Tổng sinh viên TT02 = 50, Tham gia = 50 (100%). TT03: Có 12 sinh viên đạt SV5T cấp trường.
- **Kết quả mong đợi:**
  - Tỷ lệ TT03 tự động tính: $12 / 50 = 24\% \ge 20\%$ -> Đạt tiêu chuẩn TT03.
  - Không bắt tập thể phải nhập lại con số 50 tại TT03.
  - Hồ sơ vào thẳng hàng đợi chung của Cán bộ Thành phố, không qua xét sơ cấp Trường.

### BC17: Nộp hồ sơ của sinh viên (Student Submission Guard)
- **Đầu vào:** Sinh viên chưa hoàn thành mục bắt buộc (ĐRL) nhưng bấm nộp.
- **Kết quả mong đợi:** Hệ thống hiển thị cảnh báo hướng dẫn cụ thể các mục còn thiếu. Sinh viên hoàn thiện đủ các mục bắt buộc mới có thể nộp chính thức. Cảnh báo mang tính hướng dẫn, không tạo ra lỗi chặn vô căn cứ.

### BC18: Đồng bộ dữ liệu khi thẩm định đồng thời (Concurrency Safety)
- **Đầu vào:** Cán bộ A đang mở hồ sơ xem xét; Cán bộ B ở phòng ban khác cũng mở cùng hồ sơ.
- **Kết quả mong đợi:** Khi Cán bộ A lưu phán quyết, hệ thống kiểm tra phiên bản (version timestamp), ngăn chặn việc ghi đè âm thầm dữ liệu mới hơn.

### BC19: Khóa an toàn sau chuyển giao (Post-Forwarding Lock)
- **Đầu vào:** Cán bộ Trường mở một hồ sơ đã được gửi lên Thành phố (`forwarded_to_city`).
- **Kết quả mong đợi:** Màn hình chuyển sang chế độ "Chỉ đọc" (Read-Only) kèm banner giải thích: *"Hồ sơ đã được chuyển lên cấp Thành phố. Dữ liệu chỉ dùng để tra cứu lịch sử."* Mọi nút bấm [Đạt], [Không đạt], [Yêu cầu bổ sung] đều bị vô hiệu hóa.

### BC20: Thống kê Bảng điều khiển phân tách minh bạch (Dashboard Separation)
- **Đầu vào:** Ban Thư ký xem màn hình tổng quan Thành phố.
- **Kết quả mong đợi:**
  - Số lượng hồ sơ "Đã thẩm định xong" tách biệt với số lượng "Hồ sơ đủ điều kiện".
  - Số lượng "Trường đề xuất" tách biệt với số lượng "Hội đồng công nhận".
  - Không tồn tại con số ảo do tự động làm tròn hay gộp trạng thái.
