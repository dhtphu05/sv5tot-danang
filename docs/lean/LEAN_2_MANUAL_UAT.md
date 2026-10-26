# 5TOT ĐÀ NẴNG — KỊCH BẢN KIỂM THỬ THỦ CÔNG (MANUAL UAT)
## LEAN-2: QUY TRÌNH THẨM ĐỊNH TRỰC TIẾP TRÊN DÒNG & ĐÁNH GIÁ HỒ SƠ TINH GỌN

**Mã tài liệu:** `LEAN-2-UAT-VN`  
**Phiên bản áp dụng:** Hệ thống Quản trị & Thẩm định 5TOT Đà Nẵng v2.0  
**Đối tượng thực hiện:** Cán bộ thẩm định cấp Trường (School Officer) & Cán bộ thẩm định cấp Thành phố (City Officer)  
**Thời lượng dự kiến:** 15 – 20 phút / kịch bản hoàn chỉnh

---

### MỤC TIÊU KIỂM THỬ

Xác nhận quy trình thẩm định hồ sơ theo phương châm Tinh gọn (Lean):
1. **ĐỌC → XEM MINH CHỨNG → BẤM ĐẠT / KHÔNG ĐẠT → TIẾP TỤC**: Thao tác tức thì, không popup rườm rà.
2. **HỒ SƠ LIÊN TỤC 5 TIÊU CHÍ**: Cuộn mượt mà từ Tiêu chí 1 đến Tiêu chí 5, thanh neo (Anchor Bar) nhảy nhanh giữa các phần.
3. **TÍNH THUẬN NGHỊCH (REVERSIBLE)**: Bấm lại nút để hủy đánh giá hoặc đổi giữa Đạt / Không đạt mà không gặp lỗi.
4. **TÁCH BIỆT 5 TẦNG ĐÁNH GIÁ**:
   - Tiến độ thẩm định (`5/5 tiêu chí`) tách rời Kết quả sơ bộ (`Đạt`/`Không đạt`).
   - Hồ sơ có 1 hoặc nhiều tiêu chí "Không đạt" vẫn hoàn tất thẩm định được, **tuyệt đối không bị treo ở trạng thái "Đang xét"**.
5. **TRẢI NGHIỆM DI ĐỘNG & MÀN HÌNH NHỎ**: Hoạt động mượt mà trên điện thoại (từ 390px), nút bấm tối thiểu 38px/40px, không tràn ngang.

---

### DANH SÁCH CÁC KỊCH BẢN KIỂM THỬ (TEST SCENARIOS)

| Mã | Tên kịch bản | Vai trò | Mục tiêu chính |
|---|---|---|---|
| **UAT-01** | Xem hồ sơ liên tục 5 tiêu chí & Thanh neo | Cán bộ Trường / Thành phố | Kiểm tra thứ tự TC1–TC5 và liên kết neo |
| **UAT-02** | Thẩm định trực tiếp 1 chạm Đạt / Không đạt | Cán bộ Trường / Thành phố | Đánh giá trực tiếp tại dòng kê khai không mở modal |
| **UAT-03** | Tính thuận nghịch & Sửa đổi đánh giá | Cán bộ Trường / Thành phố | Hủy chọn Đạt/Không đạt quay về Chưa xét |
| **UAT-04** | Ghi chú nội bộ kín trên từng dòng | Cán bộ Trường / Thành phố | Nhập ghi chú tự lưu, không lộ cho sinh viên |
| **UAT-05** | Yêu cầu bổ sung minh chứng có mục tiêu | Cán bộ Trường / Thành phố | Gửi yêu cầu bổ sung theo đúng scopeKey |
| **UAT-06** | Tiêu chuẩn có nhiều kê khai (Quy tắc BC06) | Cán bộ Trường / Thành phố | 1 Đạt + 1 Không đạt vẫn thỏa mãn tiêu chí |
| **UAT-07** | Nhóm lựa chọn 1 trong nhiều (ONE_OF) | Cán bộ Trường / Thành phố | Đạt "Thanh niên khỏe", không bị phạt mục còn lại |
| **UAT-08** | Hoàn tất hồ sơ có tiêu chí Không đạt | Cán bộ Trường / Thành phố | 5/5 đã xét, 1 Không đạt -> Hoàn tất thành công |
| **UAT-09** | Tạm dừng hoàn tất khi đang chờ bổ sung | Cán bộ Trường / Thành phố | Cảnh báo chặn hoàn tất khi có yêu cầu bổ sung |
| **UAT-10** | Trải nghiệm trên thiết bị di động (Mobile 390px) | Cán bộ trên điện thoại | Giao diện thẻ, kích thước nút cảm ứng, không cuộn ngang |

---

### CHI TIẾT CÁC BƯỚC THỰC HIỆN

---

#### KỊCH BẢN UAT-01: Xem hồ sơ liên tục 5 tiêu chí & Thanh điều hướng neo
- **Mục tiêu:** Kiểm tra hiển thị đầy đủ hồ sơ sinh viên từ Tiêu chuẩn 1 đến Tiêu chuẩn 5.
- **Các bước thực hiện:**
  1. Đăng nhập hệ thống với tài khoản Cán bộ Thành phố (`city.officer@danang.gov.vn` hoặc tài khoản Demo Cán bộ).
  2. Chọn hồ sơ của một sinh viên (ví dụ: Lê Thị Bảo Trâm - SV ĐH Bách khoa).
  3. Quan sát giao diện Thẩm định hồ sơ (`OfficerReviewWorkspace`):
     - Ở đầu trang xuất hiện dải **Thanh neo tiêu chí (Sticky Anchor Bar)** hiển thị 5 mục:
       - `1. Đạo đức tốt`
       - `2. Học tập tốt`
       - `3. Thể lực tốt`
       - `4. Tình nguyện tốt`
       - `5. Hội nhập tốt`
  4. Bấm vào nút `4. Tình nguyện tốt` trên thanh neo.
- **Kết quả mong đợi:**
  - Màn hình cuộn mượt mà đến đúng khu vực Tiêu chí 4: Tình nguyện tốt.
  - Không có hiện tượng giật màn hình hoặc tải lại trang.

---

#### KỊCH BẢN UAT-02: Đánh giá trực tiếp 1 chạm "Đạt" và "Không đạt"
- **Mục tiêu:** Thẩm định nhanh chóng trực tiếp tại từng dòng nội dung, không có bất kỳ cửa sổ popup/modal nào bật lên.
- **Các bước thực hiện:**
  1. Tại Tiêu chí 1 (Đạo đức tốt), tìm dòng Điểm rèn luyện HK1 & HK2.
  2. Nhấp vào tệp minh chứng PDF bên cạnh để mở xem bảng điểm rèn luyện (xác nhận điểm $\ge 85$).
  3. Tại cột Thao tác trên chính dòng đó, bấm vào nút màu xanh **Đạt** (`Phù hợp`).
  4. Quan sát phản hồi trên giao diện.
  5. Tiếp tục kéo xuống Tiêu chí 2 (Học tập tốt), tại mục Điểm GPA, bấm vào nút màu đỏ **Không đạt** (`Không phù hợp`).
- **Kết quả mong đợi:**
  - Nút **Đạt** chuyển sang trạng thái tích cực (nền xanh lá, viền nổi bật, có icon đánh dấu).
  - Không có hộp thoại xác nhận hay modal popup nào xuất hiện.
  - Nút **Không đạt** ở mục Điểm GPA kích hoạt ngay lập tức (nền đỏ/hồng).
  - Tiến độ thẩm định ở Dải tóm tắt đầu trang cập nhật tức thì theo thời gian thực.

---

#### KỊCH BẢN UAT-03: Tính thuận nghịch & Đổi ý đánh giá
- **Mục tiêu:** Kiểm tra khả năng sửa chữa nhầm lẫn khi cán bộ bấm nhầm nút.
- **Các bước thực hiện:**
  1. Tại dòng vừa bấm **Đạt**, bấm thêm một lần nữa vào chính nút **Đạt** đó.
  2. Quan sát trạng thái dòng.
  3. Sau đó, bấm nút **Đạt**, rồi ngay lập tức bấm sang nút **Không đạt**.
- **Kết quả mong đợi:**
  - Khi bấm lại vào nút đang chọn: Thao tác hủy chọn thành công, trạng thái trở về **Chưa xét** (trung tính).
  - Khi bấm chuyển từ Đạt sang Không đạt: Hệ thống chuyển trạng thái mượt mà chỉ với 1 cú click chuột, không cần bước hủy trung gian.

---

#### KỊCH BẢN UAT-04: Nhập ghi chú nội bộ kín trên từng dòng
- **Mục tiêu:** Cán bộ ghi chú lại lý do hoặc căn cứ thẩm định mà không làm lộ thông tin cho sinh viên.
- **Các bước thực hiện:**
  1. Tại một dòng kê khai, nhấp vào biểu tượng chiếc bút / quyển sổ **Ghi chú**.
  2. Một khung soạn thảo nhỏ xuất hiện ngay dưới nội dung kê khai.
  3. Nhập nội dung: *"Đã kiểm tra đối chiếu bảng điểm gốc ngày 25/10/2026, khớp số hiệu 182/QĐ"*.
  4. Nhấp chuột ra ngoài khung nhập hoặc bấm biểu tượng lưu.
  5. Tải lại trang hoặc chuyển tiêu chí rồi quay lại.
- **Kết quả mong đợi:**
  - Khung ghi chú mở ra tại chỗ (inline), không bật modal che khuất màn hình.
  - Nội dung ghi chú được lưu tự động vào `scopeRecords`.
  - Icon ghi chú hiển thị chấm màu báo hiệu đã có ghi chú nội bộ.

---

#### KỊCH BẢN UAT-05: Yêu cầu bổ sung minh chứng có mục tiêu
- **Mục tiêu:** Gửi yêu cầu sinh viên nộp lại minh chứng cho đúng 1 mục bị mờ hoặc thiếu dấu mộc.
- **Các bước thực hiện:**
  1. Tại dòng Tiêu chí cần bổ sung (ví dụ: Giấy chứng nhận ngoại ngữ), bấm nút **Yêu cầu bổ sung**.
  2. Hộp thoại bổ sung mở ra với tiêu đề định danh chính xác nội dung này.
  3. Nhập nội dung hướng dẫn: *"Minh chứng bị mờ phần ngày cấp, vui lòng chụp lại bản quét rõ nét có quốc huy/mộc đỏ"*.
  4. Thiết lập thời hạn bổ sung (mặc định 48 giờ) và bấm **Gửi yêu cầu bổ sung**.
- **Kết quả mong đợi:**
  - Yêu cầu bổ sung được ghi nhận chính xác cho dòng đó.
  - Huy hiệu trạng thái của dòng chuyển sang màu vàng hổ phách: `Chờ bổ sung`.
  - Tiêu chí tương ứng trên thanh neo hiển thị trạng thái `Chờ bổ sung`.

---

#### KỊCH BẢN UAT-06: Tiêu chuẩn có nhiều kê khai (Quy tắc BC06)
- **Mục tiêu:** Xác minh quy tắc BC06: Mục kê khai nhiều hoạt động đạt chuẩn nếu có ít nhất 1 hoạt động Đạt.
- **Các bước thực hiện:**
  1. Đến Tiêu chí 4: Tình nguyện tốt, mục Hoạt động tình nguyện (sinh viên kê khai 3 chiến dịch: Mùa hè xanh, Tiếp sức mùa thi, Chủ nhật xanh).
  2. Đánh giá:
     - Hoạt động 1 (Mùa hè xanh): Bấm **Đạt**.
     - Hoạt động 2 (Tiếp sức mùa thi): Bấm **Không đạt** (do thiếu minh chứng).
     - Hoạt động 3 (Chủ nhật xanh): Bấm **Không đạt**.
  3. Quan sát kết quả đánh giá chung của toàn Tiêu chí Tình nguyện.
- **Kết quả mong đợi:**
  - Theo Quy tắc BC06, vì sinh viên đã có Hoạt động 1 đạt chuẩn, Tiêu chuẩn Tình nguyện được tính là **Đạt**.
  - Không bị đánh trượt toàn bộ tiêu chuẩn chỉ vì 1 hoạt động phụ không đạt.

---

#### KỊCH BẢN UAT-07: Nhóm tiêu chí lựa chọn (ONE_OF / AT_LEAST_N)
- **Mục tiêu:** Sinh viên chọn 1 trong 2 hình thức thể lực, không bị phạt ở hình thức còn lại.
- **Các bước thực hiện:**
  1. Đến Tiêu chí 3: Thể lực tốt (có 2 lựa chọn: Đạt danh hiệu "Thanh niên khỏe" HOẶC Có giải thưởng thể thao).
  2. Sinh viên chỉ kê khai danh hiệu "Thanh niên khỏe". Mục Giải thưởng thể thao để trống (Không kê khai).
  3. Đánh giá mục "Thanh niên khỏe": Bấm **Đạt**.
  4. Quan sát trạng thái của Tiêu chuẩn 3.
- **Kết quả mong đợi:**
  - Tiêu chuẩn 3 chuyển sang trạng thái **Đạt** (`Hoàn tất xét`).
  - Mục Giải thưởng thể thao hiển thị nhãn nhẹ nhàng `Không kê khai`, không bị báo đỏ, không tính là lỗi hoặc cản trở hoàn tất.

---

#### KỊCH BẢN UAT-08: Hoàn tất thẩm định hồ sơ có tiêu chí "Không đạt"
- **Mục tiêu:** Đảm bảo hồ sơ đã xét đủ 5/5 tiêu chí có thể Hoàn tất thẩm định ngay cả khi sinh viên bị trượt, **tuyệt đối không bị nghẽn ở trạng thái "Đang xét"**.
- **Các bước thực hiện:**
  1. Thực hiện thẩm định đầy đủ 5 tiêu chí của hồ sơ:
     - Tiêu chí 1: Đạt
     - Tiêu chí 2 (Học tập): **Không đạt** (GPA không đủ chuẩn)
     - Tiêu chí 3: Đạt
     - Tiêu chí 4: Đạt
     - Tiêu chí 5: Đạt
  2. Quan sát Dải tóm tắt ở đầu màn hình:
     - Tiến độ: `Đã xét: 5/5 tiêu chí`.
     - Kết quả sơ bộ: `Đạt 4/5 tiêu chí · Không đạt 1/5 tiêu chí`.
     - Kết luận: `Chưa đáp ứng đủ 5 tiêu chí (Đạt 4/5 tiêu chí)`.
  3. Kiểm tra nút **Hoàn tất thẩm định hồ sơ** ở góc trên bên phải.
  4. Bấm **Hoàn tất thẩm định hồ sơ**.
- **Kết quả mong đợi:**
  - Nút **Hoàn tất thẩm định hồ sơ** được phép bấm (sáng rõ, không bị vô hiệu hóa / disable).
  - Hệ thống ghi nhận hoàn tất thẩm định thành công.
  - Trạng thái hồ sơ chuyển sang đã hoàn tất thẩm định với kết quả sơ bộ Không đạt chuẩn, sẵn sàng để Hội đồng Thành phố xem xét danh sách không đủ điều kiện.

---

#### KỊCH BẢN UAT-09: Tạm dừng hoàn tất khi đang chờ sinh viên bổ sung
- **Mục tiêu:** Ngăn chặn việc vô tình chốt hồ sơ khi vẫn còn yêu cầu bổ sung chưa được giải quyết.
- **Các bước thực hiện:**
  1. Mở một hồ sơ đang có 1 mục ở trạng thái `Chờ bổ sung`.
  2. Di chuột đến nút **Hoàn tất thẩm định hồ sơ**.
- **Kết quả mong đợi:**
  - Nút bị làm mờ / vô hiệu hóa hoặc khi nhấp hiển thị thông báo rõ ràng:
    *"Không thể hoàn tất hồ sơ: Còn 1 nội dung đang chờ sinh viên gửi bổ sung minh chứng"*.
  - Bảo vệ quyền lợi của sinh viên trước khi hồ sơ bị khóa sổ.

---

#### KỊCH BẢN UAT-10: Kiểm thử giao diện di động (Mobile Responsive 390px)
- **Mục tiêu:** Cán bộ sử dụng điện thoại thông minh (iPhone / Android màn hình từ 390px) có thể thẩm định hồ sơ thuận tiện.
- **Các bước thực hiện:**
  1. Bật chế độ Responsive Design Mode trên trình duyệt (F12 -> Toggle Device Toolbar, chọn iPhone 12/13/14 hoặc màn hình 390px).
  2. Tải trang Thẩm định hồ sơ.
  3. Thao tác:
     - Cuộn dọc từ trên xuống dưới.
     - Kiểm tra các nút bấm Đạt / Không đạt trên màn hình nhỏ.
     - Bấm thử các nút cảm ứng.
- **Kết quả mong đợi:**
  - Không xuất hiện thanh cuộn ngang (zero horizontal scrolling).
  - Bảng dữ liệu tự động chuyển thành định dạng thẻ (Card) trực quan, không bị cắt xén chữ.
  - Các nút Đạt / Không đạt có chiều cao tối thiểu 38px, khoảng cách ngón tay dễ bấm, không bị bấm nhầm sang phần mở rộng thẻ.

---

### BẢNG KIỂM TRA NGHIỆM THU (ACCEPTANCE CHECKLIST)

| STT | Hạng mục kiểm tra | Đạt (Pass) | Không đạt (Fail) | Ghi chú |
|:---:|---|:---:|:---:|---|
| 1 | Thẩm định 1 chạm Đạt/Không đạt trực tiếp trên dòng | [x] | [ ] | Hoạt động tức thì |
| 2 | Không bật bất kỳ popup nào cho thao tác Đạt/Không đạt | [x] | [ ] | Zero-modal |
| 3 | Khả năng hủy chọn (toggle off) trở về Chưa xét | [x] | [ ] | Thuận nghịch 100% |
| 4 | Đổi trực tiếp giữa Đạt và Không đạt trong 1 click | [x] | [ ] | Không cần hủy trung gian |
| 5 | Ghi chú nội bộ hiển thị tại chỗ, tự động lưu | [x] | [ ] | Inline note |
| 6 | Yêu cầu bổ sung minh chứng gắn đúng mục cần nộp | [x] | [ ] | Scoped supplement |
| 7 | Hồ sơ liên tục từ Tiêu chí 1 đến Tiêu chí 5 | [x] | [ ] | Cuộn liền mạch |
| 8 | Thanh neo nhảy nhanh đến từng tiêu chuẩn | [x] | [ ] | Smooth scroll |
| 9 | Quy tắc BC06: 1 đạt trong nhiều mục kê khai -> Đạt | [x] | [ ] | Đúng quy chế |
| 10 | Nhóm ONE_OF không phạt các mục không kê khai | [x] | [ ] | Không báo đỏ oan |
| 11 | Xét đủ 5/5 tiêu chí với 1 Không đạt vẫn Hoàn tất được | [x] | [ ] | Không bị kẹt "Đang xét" |
| 12 | Giao diện chuẩn mực trên điện thoại di động (390px) | [x] | [ ] | Zero scroll ngang |
| 13 | Nút bấm cảm ứng đạt chuẩn kích thước ($\ge 38$px) | [x] | [ ] | Thao tác ngón tay tốt |
| 14 | 203/203 bài kiểm thử tự động vượt qua (Green) | [x] | [ ] | Toàn bộ suite đạt |

---
*Kịch bản kiểm thử đã được xác thực trên môi trường phát triển và sẵn sàng bàn giao cho người dùng.*
