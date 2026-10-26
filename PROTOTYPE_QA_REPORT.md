# 5TOT ĐÀ NẴNG — BÁO CÁO KIỂM THỬ TỔNG THỂ (PROTOTYPE QA REPORT)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Ngày báo cáo:** 06/10/2026  
**Đánh giá tổng thể:** ĐẠT CHUẨN NGHIỆM THU TRÌNH DIỄN (STAKEHOLDER REVIEW CANDIDATE)

---

## 1. BẢNG TỔNG HỢP KẾT QUẢ THEO PHÂN HỆ

| Phân hệ / Luồng nghiệp vụ | Kết quả kiểm thử | Chi tiết đánh giá & Ghi chú |
| :--- | :---: | :--- |
| **1. Cổng thông tin công khai (Public Entry)** | **PASS** | Giao diện cơ quan nhà nước trang nhã, đúng thẩm quyền HSV TP. Đà Nẵng, hiển thị 05 tiêu chí, hướng dẫn, chu kỳ xét và đăng nhập/đăng ký. Không lộ công cụ kiểm thử trên môi trường công khai. |
| **2. Luồng Sinh viên (Student Lifecycle)** | **PASS** | Đủ 9 trạng thái vòng đời từ Chưa có hồ sơ $\rightarrow$ Bản nháp $\rightarrow$ Kê khai & Minh chứng $\rightarrow$ Rà soát $\rightarrow$ Nộp $\rightarrow$ Cần bổ sung $\rightarrow$ Đã gửi bổ sung $\rightarrow$ Chờ kết quả $\rightarrow$ Đã công bố. |
| **3. Cấu trúc 05 Tiêu chí (Five Criteria)** | **PASS** | Bảo toàn chính xác 05 tiêu chí chuẩn. Quy tắc nhóm (Bắt buộc / Chọn N), kê khai đơn/lặp lại (SINGLE / MULTIPLE), hướng dẫn minh chứng và quy chế trích dẫn hoạt động chuẩn xác. |
| **4. Kiểm tra trước khi nộp (Pre-submit Review)** | **PASS** | Khuyến nghị thông minh (Advisory) không chặn nộp hồ sơ. Cổng khóa cứng (Hard Gate) phản ánh chính xác điều kiện nộp và mốc thời gian hệ thống. |
| **5. Cơ chế Bổ sung hồ sơ (Scoped Supplement)** | **PASS** | Giới hạn chỉnh sửa đúng vào kê khai được yêu cầu bổ sung; các kê khai khác và tiêu chí khác hoàn toàn ở chế độ chỉ xem. Đã gửi bổ sung khóa lại an toàn. |
| **6. Luồng Cán bộ xét duyệt (Officer Workspace)** | **PASS** | 7 trạng thái A-G. Thẩm định độc lập 5 tiêu chí; minh chứng xem toàn diện kèm đánh giá; ghi chú nội bộ; gửi yêu cầu bổ sung; hoàn tất phần xét hồ sơ. Không sửa đổi dữ liệu sinh viên. |
| **7. Luồng Quản lý xét duyệt (Manager Coordination)** | **PASS** | Phân công đơn lẻ và hàng loạt; phát hiện hồ sơ tồn đọng (>48h); theo dõi hồ sơ vừa nhận bổ sung; cân bằng khối lượng thẩm định giữa các cán bộ; cảnh báo mốc thời gian. |
| **8. Luồng Hội đồng xét chọn (Committee Decision)** | **PASS** | Xem xét các nội dung cán bộ chuyển Hội đồng; ghi nhận kết luận xét chọn (Được công nhận / Chưa được công nhận); khóa công bố khi chưa đủ kết luận; công bố kết quả đồng bộ sang sinh viên. |
| **9. Thống kê, Báo cáo & Xuất dữ liệu (Analytics & Export)** | **PASS** | Số liệu thống kê đồng bộ từ tập dữ liệu chung; khoan sâu (Drill-down) bảng dữ liệu; xuất file XLSX/CSV tôn trọng bộ lọc; bảo vệ thông tin mật (không xuất ghi chú nhạy cảm/mã nội bộ). |
| **10. Bàn điều khiển Quản trị (Admin Control Plane)** | **PASS** | Quản lý 32 trường đại học/cao đẳng tại Đà Nẵng; quản lý 18 tài khoản cán bộ; cấu hình mùa xét; quản lý phiên bản tiêu chí; điều chỉnh mốc thời gian kèm lý do và ghi nhận nhật ký bất biến. |
| **11. Phân quyền & Bảo mật (Access Control & RBAC)** | **PASS** | Cán bộ xét duyệt không truy cập trang quản trị; Quản lý không can thiệp nội dung kê khai sinh viên; Hội đồng tách biệt giữa ghi nhận kết luận và công bố; Quản trị không thay đổi kết quả thẩm định. |
| **12. Tính đồng bộ đa vai trò (Cross-role Consistency)** | **PASS** | Một thay đổi trạng thái (Nộp hồ sơ, Bổ sung, Hoàn tất xét, Công bố kết quả, Cập nhật hạn nộp) lập tức phản ánh đồng bộ giữa Sinh viên, Cán bộ, Quản lý, Hội đồng và Quản trị. |
| **13. Khả năng hiển thị đáp ứng (Responsive & UI QA)** | **PASS** | Hoạt động mượt mà tại 1366×768 (không vỡ, không cuộn ngang trình duyệt), 1440×900, 1920×1080 và tỷ lệ phóng to 125%. Thanh bên cố định 100dvh, bảng dữ liệu có tiêu đề cố định và sọc ngựa vằn. |
| **14. Dọn dẹp môi trường trình diễn (Production Cleanup)** | **PASS** | Loại bỏ toàn bộ nhãn dev, mã định danh thô, hộp kiểm thử nội bộ và enum kỹ thuật (DIRECT_CITY, CITY_OFFICER, ALL_REQUIRED...) khỏi giao diện người dùng; thuật ngữ thuần phong mỹ tục Việt Nam. |
| **15. Tích hợp Backend / SMTP / Chữ ký số USB Token** | **KNOWN LIMITATION** | Bản trình diễn độc lập vận hành hoàn hảo với trạng thái mô phỏng đầy đủ; việc kết nối cơ sở dữ liệu phân tán ngoài và cổng chữ ký số nghiệp vụ sẽ thực hiện trong giai đoạn tiếp theo. |

---

## 2. KIỂM TRA TÍNH TOÀN VẸN CÁC QUY TẮC CỨNG (HARD BUSINESS RULES)

1. **Hoàn tất xét 5 tiêu chí $\neq$ Được công nhận chính thức:**
   - **Xác nhận:** ĐÃ KIỂM TRA. Khi cán bộ hoàn tất 5/5 tiêu chí, sinh viên chỉ thấy trạng thái *"Đã hoàn tất xét 5 tiêu chí · Đang chờ kết quả chính thức"*. Tuyệt đối không hiển thị *"Được công nhận"* cho đến khi Hội đồng ấn nút *"Công bố kết quả"*.
2. **Quyền lực của Quyết định chính thức (FinalResult Authority):**
   - **Xác nhận:** ĐÃ KIỂM TRA. Kết quả hiển thị cho sinh viên phụ thuộc 100% vào dữ liệu `FinalResult` được Hội đồng ban hành, không suy đoán từ số lượng tiêu chí đạt của giao diện trước.
3. **Tính bất biến của dữ liệu sinh viên sau khi nộp (Post-submission Immutability):**
   - **Xác nhận:** ĐÃ KIỂM TRA. Sau khi ấn nộp, toàn bộ hồ sơ khóa chỉ xem; chỉ kê khai có yêu cầu bổ sung mới được phép đính kèm thêm minh chứng theo đúng giới hạn của cán bộ.
4. **Không phân cấp trường thành một cấp xét duyệt:**
   - **Xác nhận:** ĐÃ KIỂM TRA. 32 đơn vị đóng vai trò phân loại và nguồn cơ sở; Hội đồng xét chọn cấp Thành phố là cấp ra quyết định duy nhất trong hệ thống.
5. **Cơ chế đặt lại kịch bản (Scenario Reset Determinism):**
   - **Xác nhận:** ĐÃ KIỂM TRA. Nút *"Đặt lại kịch bản"* đưa hệ thống về đúng dữ liệu ban đầu một cách xác định, không gây lỗi dữ liệu rác.

---

## 3. KẾT LUẬN NGHIỆM THU
Hệ thống **5TOT Đà Nẵng** đã hoàn thành toàn diện giai đoạn đóng băng phiên bản mẫu (Prototype Freeze), đáp ứng đầy đủ tất cả các tiêu chí kỹ thuật và nghiệp vụ được yêu cầu, sẵn sàng để Hội Sinh viên Thành phố Đà Nẵng và Ban Thư ký Thành Đoàn nghiệm thu, trình diễn cho các bên liên quan.
