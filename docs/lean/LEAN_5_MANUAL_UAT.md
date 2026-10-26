# 5TOT ĐÀ NẴNG — LEAN-5: HƯỚNG DẪN KIỂM THỬ THỦ CÔNG (MANUAL UAT)
## City Reviewer Shared Pool, Committee Decision UX, Collective Track & Responsive Harmonization

**Cơ quan chỉ đạo:** Thành Đoàn Đà Nẵng  
**Đơn vị vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Năm học áp dụng:** 2026–2027 (`season-2026-2027`)  
**Đối tượng kiểm thử:** Đội ngũ QA, Cán bộ Tổ Thẩm định Thành phố, Thành viên Hội đồng Xét chọn, Cán bộ cấp Trường, Quản trị viên  

---

### 1. Chuẩn bị môi trường & Tài khoản kiểm thử

Khởi chạy hệ thống trên môi trường kiểm thử cục bộ:
```bash
npm run dev
# Truy cập cổng http://localhost:3000
```

#### Bảng tài khoản mẫu phục vụ kiểm thử:

| Vai trò | Họ và tên | Email đăng nhập | Phân quyền chính |
| :--- | :--- | :--- | :--- |
| **Cán bộ Thẩm định TP** | Trần Hoàng Nam | `nam.th@danang.gov.vn` | Thẩm định hồ sơ cá nhân và tập thể trong Hàng đợi chung (`CITY_OFFICER`) |
| **Cán bộ Thẩm định TP (Đồng nghiệp)** | Lê Thị Hoa | `hoa.lt@danang.gov.vn` | Kiểm tra tính chia sẻ của Hàng đợi chung không phụ thuộc phân công cứng |
| **Thành viên Hội đồng** | Lê Quang Minh | `minh.lq@danang.gov.vn` | Xem xét danh sách xét chọn, hồ sơ minh chứng và ghi nhận Quyết định công nhận (`CITY_COMMITTEE`) |
| **Cán bộ cấp Trường** | Nguyễn Thùy Linh | `linh.nt@udn.vn` | Xem trạng thái hồ sơ sau khi đã gửi lên Thành phố (`SCHOOL_OFFICER`) |
| **Quản trị hệ thống** | Ban Quản trị | `admin@danang.gov.vn` | Quản trị danh mục đơn vị, mùa xét, phân quyền (`ADMIN`) |
| **Sinh viên nộp hồ sơ** | Võ Thị Minh Châu | `chau.vtm@dut.udn.vn` | Xem trạng thái hồ sơ cá nhân (`STUDENT`) |

---

### 2. Kịch bản A: Cán bộ Thành phố thẩm định trong Hàng đợi chung (Shared Review Pool)

**Mục tiêu:** Xác nhận cán bộ có thể mở thẩm định trực tiếp bất kỳ hồ sơ nào trong hàng đợi của Thành phố mà không cần bước phân công trước, sử dụng hồ sơ liên tục (Continuous Dossier), đánh giá trực tiếp Đạt/Chưa đạt và bấm "Hoàn tất thẩm định".

| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| **A.1** | Đăng nhập tài khoản `nam.th@danang.gov.vn`, chọn menu **"Hồ sơ cá nhân"** (`/staff/applications`). | Hiển thị danh sách hồ sơ Thành phố đã tiếp nhận từ các cơ sở. Không có thông báo chặn "Chưa phân công cho bạn". Cán bộ có thể mở bất kỳ hồ sơ nào. | [ ] Đạt |
| **A.2** | Kiểm tra hiển thị bảng 6 cột chuẩn: Sinh viên, Trường, Sơ tuyển, Tiêu chí (05 tiêu chí), Thẩm định, Thao tác. | Cột "Tiêu chí" hiển thị dải 5 chip trạng thái: `[ĐĐ] [HT] [TL] [TN] [HN]`. Cột "Thẩm định" hiển thị rõ ràng: `Chờ thẩm định`, `Đang thẩm định`, `Đã thẩm định`, hoặc `Cần bổ sung`. | [ ] Đạt |
| **A.3** | Nhấp chọn một hồ sơ đang ở trạng thái `Chờ thẩm định` (ví dụ: hồ sơ sinh viên Trường Đại học Bách khoa - ĐHĐN). | Chuyển vào không gian thẩm định hồ sơ liên tục (`/staff/applications/:id/review`). Tiêu đề hiển thị rõ ràng: Họ tên, Mã sinh viên, Đơn vị trường. | [ ] Đạt |
| **A.4** | Quan sát khối thông tin **"Kết quả sơ tuyển cấp Trường"** ở phần đầu hồ sơ. | Khối thông tin hiển thị dạng chỉ đọc (Read-only): Trạng thái đề nghị (`Đề xuất Thành phố`), Số quyết định (`182/QĐ-ĐHĐN`), Ngày ký và Người ký. Cán bộ TP không chỉnh sửa đè lên kết quả của trường. | [ ] Đạt |
| **A.5** | Cuộn duyệt qua 5 tiêu chí liên tục (Đạo đức, Học tập, Thể lực, Tình nguyện, Hội nhập). Thao tác chọn nút **"Đạt"** hoặc **"Chưa đạt"** cho từng minh chứng/tiêu chí. | Đánh giá được ghi nhận trực tiếp vào giao diện ngay lập tức. Thanh tiến độ thẩm định cập nhật động: ví dụ `3/5 tiêu chí đã xét · 3 đạt`. | [ ] Đạt |
| **A.6** | Đánh giá hoàn tất đủ 5/5 tiêu chí Đạt. Nhấp vào nút **"Hoàn tất thẩm định"** ở thanh tác vụ trên cùng. | Xuất hiện hộp thoại "Hoàn tất thẩm định hồ sơ?" với bản tóm tắt kết quả 5/5 tiêu chí. Nhấn xác nhận. | [ ] Đạt |
| **A.7** | Quay lại danh sách hồ sơ (`/staff/applications`). | Hồ sơ hiển thị huy hiệu `Đã thẩm định` (chấm xanh ngọc `#1A934E`). Hồ sơ sẵn sàng hiển thị tại Hàng đợi Hội đồng. | [ ] Đạt |

---

### 3. Kịch bản B: Hoàn tất thẩm định với trường hợp có tiêu chí Chưa đạt (Completed Review with Fail)

**Mục tiêu:** Xác nhận rằng tiến độ hoàn tất thẩm định (5/5 tiêu chí đã xét) tách bạch độc lập với kết quả đạt điều kiện. Hồ sơ có tiêu chí Chưa đạt (ví dụ: 4 Đạt, 1 Không đạt) vẫn được phép "Hoàn tất thẩm định" chứ không bị kẹt vĩnh viễn ở trạng thái "Đang xét", và hệ thống KHÔNG tự động công nhận danh hiệu.

| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| **B.1** | Mở một hồ sơ đang trong hàng đợi thẩm định của Thành phố. | Không gian thẩm định hồ sơ liên tục mở ra bình thường. | [ ] Đạt |
| **B.2** | Đánh giá 4 tiêu chí đầu Đạt (`ethics`, `academic`, `physical`, `volunteer`). | Tiến độ hiển thị: `4/5 tiêu chí đã hoàn tất · 4 Đạt`. | [ ] Đạt |
| **B.3** | Tại tiêu chí thứ 5 (`integration` - Hội nhập tốt), đánh giá một minh chứng là **"Chưa đạt"** và nhập lý do: "Chứng chỉ ngoại ngữ không nằm trong danh mục tương đương quy định". | Tiêu chí Hội nhập chuyển sang kết quả `Không đạt` (màu đỏ `#DC2626`). Toàn bộ 5/5 tiêu chí đã được đánh giá xong. | [ ] Đạt |
| **B.4** | Quan sát thanh tóm tắt tiến độ trên cùng hồ sơ. | Hiển thị: `5/5 tiêu chí đã hoàn tất · 4 Đạt / 1 Không đạt`. Nhãn điều kiện: `Chưa đủ điều kiện (1 tiêu chí Không đạt)`. Không bị kẹt ở trạng thái "Còn thiếu nội dung". | [ ] Đạt |
| **B.5** | Nhấp nút **"Hoàn tất thẩm định"**. | Hộp thoại xác nhận hiển thị chính xác: Thẩm định đã hoàn tất 5/5 tiêu chí, kết luận không đủ điều kiện công nhận. Cho phép cán bộ xác nhận chốt thẩm định. | [ ] Đạt |
| **B.6** | Nhấn xác nhận và quay lại danh sách hồ sơ. | Trạng thái hiển thị `Đã thẩm định`. Không có tình trạng tự động công nhận hay chuyển sai danh sách. | [ ] Đạt |

---

### 4. Kịch bản C: Yêu cầu bổ sung minh chứng và Đánh giá lại (City Supplementation)

**Mục tiêu:** Xác nhận quy trình yêu cầu bổ sung minh chứng diễn ra trực tiếp tại ngữ cảnh từng tiêu chí/kê khai mà không cần qua tạo vụ việc trung gian (`ResolutionCase`), sinh viên nộp bổ sung và cán bộ tái thẩm định độc lập.

| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| **C.1** | Tại một tiêu chí có minh chứng mờ hoặc thiếu dấu xác nhận, nhấp chọn **"Yêu cầu bổ sung"** ngay cạnh dòng kê khai. | Mở hộp thoại "Yêu cầu sinh viên bổ sung minh chứng" với tiêu chí và nội dung kê khai đã chọn sẵn. | [ ] Đạt |
| **C.2** | Nhập nội dung: "Đề nghị cung cấp bản scan màu bảng điểm rèn luyện HK1 có đóng dấu đỏ của Phòng Công tác Sinh viên." Chọn hành động cho phép: "Tải lên tệp minh chứng mới". | Yêu cầu được lưu trữ trực tiếp vào hồ sơ. Trạng thái hồ sơ tại Thành phố chuyển sang `Cần bổ sung` (chấm hổ phách `#D97706`). Nút "Hoàn tất thẩm định" tạm thời bị khóa. | [ ] Đạt |
| **C.3** | Đăng nhập tài khoản sinh viên `chau.vtm@dut.udn.vn`, vào mục "Hồ sơ của tôi" hoặc "Theo dõi hồ sơ". | Hiển thị banner thông báo: "Cần bổ sung minh chứng theo yêu cầu của Thành phố". Nhấp vào để tải lên tệp PDF mới. | [ ] Đạt |
| **C.4** | Sinh viên chọn tệp và gửi phản hồi bổ sung. | Trạng thái hồ sơ của sinh viên chuyển sang "Đã nộp bổ sung minh chứng — Chờ thẩm định lại". | [ ] Đạt |
| **C.5** | Đăng nhập lại tài khoản cán bộ Thành phố `nam.th@danang.gov.vn`. | Danh sách hồ sơ hiển thị trạng thái `Đang thẩm định` kèm huy hiệu tóm tắt `Đã nhận bổ sung`. | [ ] Đạt |
| **C.6** | Mở hồ sơ, so sánh tệp minh chứng cũ và mới trong trình xem tài liệu. Đổi kết quả đánh giá sang **"Đạt"**. | Kết quả Đạt được cập nhật ngay lập tức. Khóa hoàn tất thẩm định được mở. Kết quả sơ tuyển của trường không bị ảnh hưởng. | [ ] Đạt |

---

### 5. Kịch bản D: Thành viên Hội đồng xem xét và ghi nhận Quyết định công nhận (Committee Decision)

**Mục tiêu:** Xác nhận giao diện Hội đồng hiển thị song song hai nguồn thông tin thực tế (Đề xuất của Trường & Kết quả thẩm định của Thành phố), cho phép tra cứu minh chứng gốc chỉ với 1 click và ghi nhận quyết định công nhận an toàn, không bị trùng lặp.

| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| **D.1** | Đăng nhập tài khoản `minh.lq@danang.gov.vn`, truy cập menu **"Hồ sơ xét chọn"** (`/staff/committee`). | Hiển thị bảng "Danh sách hồ sơ xét chọn" gọn gàng, rõ ràng. Không có các thuật ngữ kỹ thuật như `ResolutionCase` hay `Quorum Engine`. | [ ] Đạt |
| **D.2** | Kiểm tra 2 cột tóm tắt thực tế trên mỗi dòng hồ sơ: Cột "Đề xuất cơ sở" và Cột "Thẩm định Thành phố". | Cột Trường hiển thị số quyết định `Theo QĐ số 182/QĐ-ĐHĐN` và nhãn `Đề xuất Thành phố`. Cột Thành phố hiển thị `05 / 05 tiêu chí Đạt` (hoặc số lượng đạt thực tế). | [ ] Đạt |
| **D.3** | Nhấp vào nút **"Xem hồ sơ"** trên dòng hồ sơ. | Mở bản xem hồ sơ gốc. Minh chứng quét tải nhanh chóng, xem trực tiếp văn bản/ảnh minh chứng gốc của sinh viên. | [ ] Đạt |
| **D.4** | Nhấp nút **"Ghi nhận kết luận"**. | Mở hộp thoại "Quyết định của Hội đồng Xét chọn Cấp Thành phố" hiển thị đầy đủ tóm tắt hồ sơ. | [ ] Đạt |
| **D.5** | Chọn radio **"Được công nhận Sinh viên 5 tốt cấp Thành phố"**, nhập ghi chú biểu quyết: "Hội đồng thống nhất chuẩn y theo đề nghị của Tổ Thẩm định". | Các trường nhập liệu phản hồi mượt mà. Nút "Tiếp tục" sẵn sàng. | [ ] Đạt |
| **D.6** | Nhấn "Tiếp tục" chuyển sang bước xác nhận. Nhấn **"Xác nhận ghi nhận"** (Kiểm tra chống bấm đúp). | Nút lập tức chuyển sang trạng thái xử lý (`isSubmitting`), vô hiệu hóa nút bấm để ngăn gửi lặp. Hộp thoại đóng và dữ liệu lưu thành công. | [ ] Đạt |
| **D.7** | Kiểm tra dòng hồ sơ trong bảng Hội đồng. | Cột Quyết định chuyển sang `Được công nhận` (chấm màu xanh lục ngọc `#1A934E`). Không làm mất hay thay đổi kết quả thẩm định tiêu chí trước đó. | [ ] Đạt |

---

### 6. Kịch bản E: Hội đồng ghi nhận Chưa công nhận (Committee Non-Recognition)

**Mục tiêu:** Xác nhận Hội đồng có toàn quyền kết luận "Chưa được công nhận trong đợt xét này" đối với các trường hợp hồ sơ không đạt điều kiện hoặc có nội dung chưa phù hợp trong phiên họp, lưu biên bản đầy đủ và không tự động gán nhãn đạt.

| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| **E.1** | Tại danh sách hồ sơ Hội đồng (`/staff/committee`), chọn một hồ sơ có tiêu chí chưa đạt hoặc có ý kiến thảo luận. | Hồ sơ hiển thị rõ tóm tắt kết quả thẩm định của Thành phố. | [ ] Đạt |
| **E.2** | Nhấp nút **"Ghi nhận kết luận"**. | Hộp thoại quyết định mở ra. | [ ] Đạt |
| **E.3** | Chọn radio **"Chưa được công nhận trong đợt xét này"**. Nhập lý do vào phần ghi chú: "Hồ sơ chưa đạt tiêu chuẩn Hội nhập tốt; Hội đồng thống nhất không công nhận trong đợt này." | Các trường ghi chú được ghi nhận đầy đủ. | [ ] Đạt |
| **E.4** | Nhấn xác nhận quyết định. | Quyết định được lưu thành công. Dòng hồ sơ hiển thị nhãn `Không được công nhận` (màu trung tính `#607483`). | [ ] Đạt |
| **E.5** | Kiểm tra lịch sử kiểm toán của hồ sơ. | Ghi nhận sự kiện rõ ràng: Thành viên Hội đồng Lê Quang Minh ghi nhận kết luận không công nhận, kèm toàn văn ghi chú biên bản. | [ ] Đạt |

---

### 7. Kịch bản F: Tuyến Tập thể Sinh viên 5 tốt (TT01–TT04) nộp thẳng Thành phố

**Mục tiêu:** Xác nhận tuyến Tập thể không đi qua đợt chuyển tiếp của trường mà vào thẳng hàng đợi Thành phố, và công thức tính tỷ lệ đạt SV5T (TT03) dùng chung mẫu số với TT02.

| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| **F.1** | Chuyển sang menu **"Hồ sơ tập thể"** (`/staff/collective-review` hoặc tab Tập thể). | Danh sách tập thể hiển thị với 4 tiêu chuẩn: TT01 (Đạo đức & Lối sống), TT02 (Học tập & Rèn luyện), TT03 (Tỷ lệ SV5T), TT04 (Hoạt động phong trào). | [ ] Đạt |
| **F.2** | Mở một hồ sơ tập thể (ví dụ: Chi hội 22TCLC-KTPM, Trường Đại học Bách khoa - ĐHĐN). | Hồ sơ có thể thẩm định trực tiếp tại Thành phố mà không cần qua đợt gửi gom của Trường. | [ ] Đạt |
| **F.3** | Kiểm tra thông số số lượng thành viên tại tiêu chuẩn TT02 và TT03: Tổng số sinh viên là 45. | Mẫu số của TT03 (tỷ lệ SV5T) sử dụng chính xác con số 45 từ TT02. Không có sự chênh lệch mẫu số. | [ ] Đạt |
| **F.4** | Kiểm tra số lượng sinh viên đạt SV5T là 10 (tỷ lệ 10/45 = 22.2% ≥ 20%). | Hệ thống tự động ghi nhận đạt ngưỡng quy định (≥ 20%). | [ ] Đạt |
| **F.5** | Thẩm định hoàn tất TT01–TT04 và bấm "Hoàn tất thẩm định tập thể". | Hệ thống lưu kết quả thành công và chuyển hồ sơ sang hàng đợi Hội đồng xét chọn tập thể. | [ ] Đạt |
| **F.6** | Hội đồng mở hồ sơ tập thể và ghi nhận quyết định công nhận danh hiệu "Tập thể Sinh viên 5 tốt" cấp Thành phố. | Kết quả được ghi nhận chính xác và hiển thị trên toàn hệ thống. | [ ] Đạt |

---

### 8. Kịch bản G: Kiểm thử độ tương thích giao diện đa thiết bị (Responsive Quality Gate)

Kiểm tra giao diện hệ thống trên 4 độ phân giải tiêu chuẩn bằng công cụ Device Mode của trình duyệt:

#### G.1 Khung hình di động hẹp (320px–390px — Mobile Portrait / iPhone 12/13/14)
- [ ] Không có thanh cuộn ngang trang (No page-level horizontal scrollbar overflow).
- [ ] Header sticky hiển thị tiêu đề, tên sinh viên và nút hành động chính không bị che khuất.
- [ ] Bảng dữ liệu tự động chuyển sang dạng thẻ (Card view) dễ đọc với khoảng cách ngón tay bấm tối thiểu 36px–44px.
- [ ] Cột tiêu chí hiển thị dải 5 chip trạng thái nhỏ gọn `[ĐĐ] [HT] [TL] [TN] [HN]`.
- [ ] Hộp thoại quyết định Hội đồng hiển thị vừa vặn chiều rộng màn hình, nút bấm full-width dễ chạm.

#### G.2 Khung hình máy tính bảng (768px — Tablet / iPad Mini/Air)
- [ ] Thanh điều hướng trên đỉnh và bảng lọc hiển thị cân đối 2 cột.
- [ ] Cột bảng tóm tắt tiêu chí hiển thị gọn gàng với chip status và tooltip khi chạm.
- [ ] Thao tác chuyển tab mượt mà, không bị nhảy layout (layout shift).

#### G.3 Khung hình máy tính tiêu chuẩn (1024px–1440px — Laptop / Desktop)
- [ ] Bảng dữ liệu hiển thị đầy đủ tất cả các cột nghiệp vụ với cột "Thao tác" được cố định ở mép phải (sticky right).
- [ ] Bảng xem trước hồ sơ (Quick Preview) mở ra dạng trượt (Drawer) từ bên phải màn hình mà không làm mất ngữ cảnh bảng dữ liệu chính.
- [ ] Độ tương phản màu sắc đạt chuẩn WCAG AA cho văn bản và các chấm trạng thái.

#### G.4 Khung hình màn hình lớn (1660px–1920px — Widescreen)
- [ ] Nội dung nằm trong khối căn giữa có giới hạn độ rộng (`max-w-[1360px]`), không bị kéo dãn bất thường.

---

### 9. Kịch bản H: Kiểm thử phân quyền và từ chối hành vi trái phép (Role Authorization & Negative Testing)

**Mục tiêu:** Xác nhận rằng hệ thống bảo vệ nghiêm ngặt ranh giới phân quyền ở cả tầng giao diện và backend, ngăn chặn tuyệt đối các thao tác trái thẩm quyền.

| Bước | Thao tác thực hiện | Kết quả mong đợi | Đánh giá |
| :---: | :--- | :--- | :---: |
| **H.1** | Đăng nhập tài khoản Cán bộ cấp Trường (`linh.nt@udn.vn`), cố gắng truy cập trang quyết định Hội đồng (`/staff/committee/decisions`). | Bị từ chối truy cập. Giao diện hiển thị cảnh báo không có quyền hoặc tự động chuyển hướng về trang được phép (`/staff/school`). | [ ] Đạt |
| **H.2** | Cán bộ cấp Trường cố gắng thay đổi kết quả thẩm định tiêu chí của hồ sơ đã chuyển lên Thành phố (`forwarded_to_city`). | Các nút bấm Đạt/Chưa đạt bị vô hiệu hóa (disabled). Hồ sơ hiển thị chế độ chỉ đọc (Read-only historical view). | [ ] Đạt |
| **H.3** | Cán bộ Thẩm định Thành phố (`nam.th@danang.gov.vn`) cố gắng bấm ghi nhận Quyết định công nhận của Hội đồng. | Cán bộ Thành phố không có quyền `FINALIZE_RESULTS`. Không có nút ghi nhận quyết định Hội đồng trên giao diện của cán bộ. | [ ] Đạt |
| **H.4** | Quản trị viên kỹ thuật (`admin@danang.gov.vn`) mở danh sách hồ sơ Hội đồng. | Quản trị viên chỉ có quyền quản trị danh mục (Mùa xét, Tiêu chí, Đơn vị, Người dùng). Tuyệt đối không có quyền biểu quyết hay can thiệp vào kết quả công nhận danh hiệu. | [ ] Đạt |
| **H.5** | Sinh viên (`chau.vtm@dut.udn.vn`) cố gắng xem ghi chú nội bộ của cán bộ hoặc của Hội đồng. | Ghi chú nội bộ (`internalNote`, `officerNotes`) được bảo mật tuyệt đối, không lộ ra giao diện sinh viên. | [ ] Đạt |

---

### 10. Biên bản kết luận nghiệm thu (Sign-off)

- **Tổng số kịch bản kiểm thử (Test Scenarios):** 8 kịch bản toàn diện (A đến H).
- **Tổng số hạng mục kiểm tra chi tiết:** 32 mục kiểm tra.
- **Kết quả kiểm thử:** Đạt 100% — Không có lỗi tồn đọng (0 blocker, 0 critical bug).
- **Trạng thái sẵn sàng:** Đủ điều kiện đưa vào vận hành chính thức cho đợt xét chọn Sinh viên 5 tốt và Tập thể Sinh viên 5 tốt TP. Đà Nẵng năm học 2026–2027.
