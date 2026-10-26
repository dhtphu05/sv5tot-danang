# LEAN-0.1: HỢP ĐỒNG NGHIỆP VỤ THẨM ĐỊNH VÀ PHÂN ĐỊNH THẨM QUYỀN
## (Review Contract: Granularity, Eligibility Aggregation & Authority Boundaries — Corrected)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức & vận hành:** Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Nguyên tắc kiến trúc:** Phân định rõ ràng tính bất biến của hồ sơ gốc, lớp phủ thẩm định của cán bộ, phân tách độc lập giữa Tiến độ thẩm định và Tính đủ điều kiện, và ranh giới thẩm quyền 3 cấp (Trường sơ tuyển -> Thành phố thẩm định độc lập -> Hội đồng quyết nghị).

---

## 1. MỨC ĐỘ CHI TIẾT THẨM ĐỊNH CHUẨN TẮC (CANONICAL REVIEW GRANULARITY)

Hệ thống 5TOT Đà Nẵng chuẩn hóa tương tác thẩm định của Cán bộ theo mô hình **Đơn tầng hữu dụng (Single-Layer Utility)**:

```
[HỒ SƠ SINH VIÊN] 
  └── [5 TIÊU CHÍ] (Tự động suy diễn kết quả từ các nhóm con)
        └── [CÁC NHÓM YÊU CẦU: ALL_REQUIRED / AT_LEAST_N] (Tự động kiểm tra ngưỡng)
              └── [DÒNG KÊ KHAI (DECLARATION ROW)] <=== VỊ TRÍ TÁC ĐỘNG DUY NHẤT CỦA CÁN BỘ
                    ├── [Nút Đạt (Suitable)] -> 1 click trực tiếp
                    ├── [Nút Không đạt (Unsuitable)] -> 1 click + ghi chú lý do
                    ├── [Nút Yêu cầu bổ sung] -> Mở drawer nhập nội dung gửi SV
                    └── [Minh chứng đính kèm] -> Đối soát trực tiếp song song
```

### 1.1 Kiểm toán mô hình lưu trữ đa tầng (Persistence Model Audit)
Nhằm đơn giản hóa giao diện mà không làm mất tính toàn vẹn dữ liệu và kiểm toán:

| Cấp độ dữ liệu trong DB/State | Bản chất (Nature) | Bắt buộc kiểm toán? (Audit Requirement) | Hành vi trong Lean UX |
| :--- | :--- | :---: | :--- |
| **1. Minh chứng (`evidenceRecords`)** | Bản ghi thẩm tra tệp | **CÓ** | Lưu vết lịch sử. Trên UI, cán bộ xem tệp và đưa ra phán quyết tại dòng kê khai; hệ thống đồng bộ ngầm trạng thái kiểm tra tệp mà không bắt cán bộ bấm thêm nút duyệt tệp riêng. |
| **2. Dòng kê khai (`scopeRecords`)** | **Phán quyết con người chính thức** | **BẮT BUỘC** | **Vị trí tương tác duy nhất của Cán bộ.** Ghi nhận `suitable` (Đạt) hoặc `unsuitable` (Không đạt). |
| **3. Yêu cầu (`Requirement`)** | Kết quả suy diễn (Derived) | Không cần lưu độc lập | Tự động suy ra từ các dòng kê khai con theo quy tắc nộp (Multiplicity). |
| **4. Tiêu chí (`Criterion`)** | Kết quả suy diễn (Derived) | Không cần lưu độc lập | Tự động suy ra từ các nhóm con theo quy tắc `ALL_REQUIRED` và `AT_LEAST_N`. |
| **5. Kết luận thẩm định Cán bộ** | Xác nhận hoàn tất công việc | **CÓ** | Thể hiện cán bộ đã xét xong mọi nội dung cần thiết. |

---

## 2. QUY TẮC TỔNG HỢP TÍNH ĐỦ ĐIỀU KIỆN (ELIGIBILITY AGGREGATION ENGINE)

### 2.1 Phân định dứt khoát: "Đã thẩm định xong" vs "Đạt tiêu chuẩn"
- **Hoàn tất thẩm định (Review Complete):** Thể hiện con người đã xem xét và đưa ra phán quyết trên mọi yêu cầu cần thiết. Một tiêu chí có thể là **Hoàn tất thẩm định với kết quả KHÔNG ĐẠT (FAIL)**.
- **Đạt tiêu chuẩn (Eligibility Pass):** Chỉ xảy ra khi toàn bộ các điều kiện của tiêu chí được thỏa mãn.

### 2.2 Quy tắc tổng hợp Nhóm bắt buộc (`ALL_REQUIRED`)
- Trong nhóm `ALL_REQUIRED`, mọi yêu cầu con bắt buộc phải thỏa mãn.
- **Tính thỏa mãn của từng Yêu cầu con:**
  - Nếu yêu cầu chỉ có 1 kê khai (`SINGLE`): Kê khai đó phải đạt `suitable`.
  - Nếu yêu cầu cho phép nhiều kê khai (`MULTIPLE`): Yêu cầu đạt khi có **Ít nhất 1 kê khai đạt `suitable`**.
  - **Sửa sai LEAN-0:** Việc một kê khai phụ bị `unsuitable` **KHÔNG** làm hỏng cả nhóm nếu đã có kê khai khác cùng yêu cầu thỏa mãn quy chế.

### 2.3 Quy tắc tổng hợp Nhóm lựa chọn (`AT_LEAST_N` & `ONE_OF`)
- Khi một phương án hợp lệ đã được cán bộ đánh giá Đạt và thỏa mãn ngưỡng $N$:
  - Nhóm tự động chuyển sang Đạt.
  - Các phương án còn lại chưa kê khai hiển thị nhãn mềm `(Phương án khác - Chưa kê khai)`, **tuyệt đối không tính vào khối lượng công việc còn thiếu và không hiển thị cảnh báo đỏ**.
- **Bảo toàn kê khai tự nguyện:** Nếu sinh viên nộp thêm phương án dự phòng, hệ thống bảo toàn 100% dữ liệu. Cán bộ có thể đánh giá hoặc bỏ qua mà không chặn tiến độ của tiêu chí.
- **Trường hợp Không đạt:** Chỉ khi mọi phương án sinh viên nộp đều bị cán bộ đánh giá Không đạt và không còn phương án nào khác cứu vãn được ngưỡng $N$, nhóm mới kết luận Không đạt.

---

## 3. PHÂN ĐỊNH RANH GIỚI THẨM QUYỀN VÀ TRÁCH NHIỆM PHÁP LÝ

### 3.1 Những cập nhật hệ thống ĐƯỢC PHÉP tự động suy diễn (Allowed Derived Updates)
1. Đếm số tiêu chí con người đã thẩm định xong (`reviewedCriteriaCount`).
2. Đếm số tiêu chí đạt yêu cầu (`passedCriteriaCount`) và không đạt (`failedCriteriaCount`).
3. Suy diễn tiến độ hoàn thành của tiêu chí (Chưa xét / Đang xét / Hoàn tất).
4. Xác định chỉ số sơ bộ: "Đủ điều kiện sơ bộ (5/5)" hoặc "Không đủ điều kiện (X/5 đạt)".

### 3.2 Những hành vi TUYỆT ĐỐI KHÔNG ĐƯỢC tự động hóa (Not Automatically Authorized)
1. **Tuyệt đối không tự động nộp hồ sơ** thay cho sinh viên hoặc tập thể.
2. **Tuyệt đối không tự động ghi nhận Đề xuất cấp Trường:** Cán bộ Trường phải chủ động bấm "Đề xuất" (`recommended`) hoặc "Không đề xuất" (`not_recommended`).
3. **Tuyệt đối không tự động gom tất cả hồ sơ 5/5 vào đợt chuyển giao:** Cán bộ Trường phải chủ động chọn lọc danh sách khớp với Quyết định phê duyệt của Ban Giám hiệu/Giám đốc ĐHĐN.
4. **Tuyệt đối không tự động gửi đợt chuyển giao:** Phải có thao tác ký chuyển chính thức kèm tệp Quyết định đề xuất đóng dấu.
5. **Tuyệt đối không tự động kết luận thẩm định cấp Thành phố:** Cán bộ Thành phố thẩm định độc lập và xác nhận kết quả.
6. **Tuyệt đối không tự động công nhận danh hiệu:** Chỉ Hội đồng Xét chọn Thành phố mới có quyền biểu quyết công nhận.
7. **Tuyệt đối không tự động công bố kết quả:** Việc công bố kết quả trên cổng thông tin đòi hỏi phê duyệt chính thức từ Thường trực Hội đồng.

---

## 4. RANH GIỚI THẨM QUYỀN 3 CẤP (THREE-TIER AUTHORITY BOUNDARIES)

### Cấp 1: Cấp Trường / Đơn vị xét sơ tuyển (School Review Unit)
- **Đại học Đà Nẵng (`unit-udn`):** Tiếp nhận hồ sơ của 8 trường thành viên (DUT, DUE, UED, UFL, UTE, VKU, VNUK, SMP). Thẩm định sơ tuyển, lập bảng tổng hợp phân rã 8 trường, trình Giám đốc ĐHĐN ký 1 Quyết định đề xuất duy nhất, chuyển giao 1 đợt duy nhất trong mùa xét.
- **Các trường đại học độc lập (Duy Tân, Đông Á, Kiến trúc, TDTT, KTYD, FPT):** Mỗi trường là 1 đơn vị xét sơ độc lập, tự quản lý danh sách và ban hành Quyết định đề xuất riêng.
- **Khóa an toàn (Read-Only Lock):** Sau khi ký chuyển lên Thành phố, toàn bộ hồ sơ tại cấp Trường chuyển sang chế độ Chỉ xem lịch sử (Read-Only).

### Cấp 2: Cấp Thành phố (City Review Tier)
- **Hàng đợi làm việc chung (Shared Queue):** Mọi cán bộ Thành phố được ủy quyền đều có thể truy cập hàng đợi chung để thẩm định độc lập. Loại bỏ cơ chế gán cá nhân bắt buộc và loại bỏ văn bản điều phối vụ việc (`ResolutionCase`).
- **Thẩm quyền độc lập:** Cán bộ Thành phố có quyền giữ nguyên hoặc thay đổi phán quyết của cấp Trường dựa trên việc đối soát lại minh chứng gốc.
- **Yêu cầu bổ sung cấp Thành phố:** Phát lệnh bổ sung trực tiếp tới sinh viên trong khung thời gian quy định.

### Cấp 3: Hội đồng Xét chọn Thành phố (Committee Decision Tier)
- Thẩm tra bảng số liệu tổng hợp và danh sách ứng viên tiêu biểu.
- Ban hành **Nghị quyết / Quyết định công nhận danh hiệu Sinh viên 5 tốt cấp Thành phố** (kèm số hiệu, ngày ký, chức vụ người ký và tệp văn bản scan).
- Phê duyệt công bố kết quả chính thức.
- **Loại trừ tuyệt đối:** Không xây dựng hệ thống bỏ phiếu điện tử phức tạp, không tạo biên bản điều trần kỹ thuật số trong phần mềm.
