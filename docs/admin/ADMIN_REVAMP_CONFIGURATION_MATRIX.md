# 5TOT ĐÀ NẴNG — ADMIN-REVAMP: BUSINESS CONFIGURATION MATRIX

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng

---

## 1. Phân định Cấu hình được phép chỉnh sửa vs. Hợp đồng Nghiệp vụ Cố định

Để đảm bảo Quản trị viên có thể vận hành toàn bộ mùa giải trên giao diện web mà **không làm biến dạng quy trình xét chọn chuẩn**, hệ thống phân tách rõ:

### A. Các thông số Quản trị viên ĐƯỢC PHÉP cấu hình trên giao diện Web

| Nhóm cấu hình | Thông số cụ thể | Quy tắc kiểm tra hợp lệ (Validation) |
|---|---|---|
| **Mùa xét chọn (`AwardSeason`)** | Mã niên khóa (`YYYY-YYYY`), tên đợt xét chọn, trạng thái vòng đời (`DRAFT`, `ACTIVE`, `CLOSED`, `ARCHIVED`), sao chép cấu hình từ mùa trước. | Hai năm phải liên tiếp (`endYear === startYear + 1`); chỉ tối đa 01 mùa `ACTIVE` tại một thời điểm; không được xóa mùa đã có hồ sơ. |
| **Tiến độ & Thời hạn (`T01`–`T07`)** | Thời điểm mở/đóng nộp Cá nhân (`T01`), sơ khảo Trường (`T02`), hạn Trường gửi danh sách đề xuất (`T03`), mở/đóng nộp Tập thể (`T04`), thẩm định Thành phố (`T05`), họp Hội đồng (`T06`), công bố kết quả (`T07`). | `T01.start < T01.end <= T03.deadline <= T05.end`; `T04.start < T04.end`; làn Tập thể `T04` chạy song song, không phụ thuộc hạn `T03`. |
| **Tiêu chí Cá nhân (05 tiêu chí)** | Điểm chuẩn rèn luyện, điểm chuẩn GPA, số lượng điều kiện tối thiểu (`ALL_REQUIRED` / `AT_LEAST_N`), danh mục điều kiện con, yêu cầu minh chứng. | Phải giữ đủ 05 tiêu chí cốt lõi (*Đạo đức tốt, Học tập tốt, Thể lực tốt, Tình nguyện tốt, Hội nhập tốt*); không được ghi đè tiêu chí của mùa đã đóng (`409 SEASON_CRITERIA_FROZEN`). |
| **Tiêu chuẩn Tập thể (`TT01`–`TT04`)** | Ngưỡng tỷ lệ tham gia phong trào (`TT02` = 100%), ngưỡng tỷ lệ sinh viên đạt SV5T cấp Trường (`TT03` ≥ 20%), yêu cầu minh chứng văn bản công nhận cấp Trường (`TT01`) và cam kết kỷ luật (`TT04`). | `TT02` và `TT03` bắt buộc dùng chung mẫu số `totalMembers > 0`; `TT04` luôn yêu cầu Cán bộ thẩm định xác minh thủ công. |
| **Đơn vị đào tạo & Phân tuyến** | Thêm mới, cập nhật thông tin liên hệ, tạm ngưng (`soft-deactivate`) hoặc kích hoạt lại trường Đại học/Cao đẳng/Học viện; cấu hình đơn vị xét sơ tuyển cho trường độc lập. | 8 trường thành viên Đại học Đà Nẵng (`DUT`, `DUE`, `UED`, `UFL`, `UTE`, `VKU`, `VNUK`, `SMP`) bắt buộc thuộc chung `unit-udn` (tối đa 01 đợt gửi danh sách/mùa). |
| **Tài khoản & Phân quyền** | Cấp mới tài khoản cán bộ, chọn phương thức cấp (Mã lời mời hoặc Mật khẩu tạm), gửi lại lời mời, đặt lại mật khẩu, đổi vai trò, tạm khóa/mở khóa tài khoản. | `SCHOOL_OFFICER` bắt buộc có `schoolReviewUnitId`; không cho phép khóa hoặc hạ quyền tài khoản `ADMIN` đang hoạt động cuối cùng (`409 LAST_ACTIVE_ADMIN_LOCKOUT_PREVENTED`). |
| **Vận hành & Mẫu thông báo** | Nội dung tiêu đề/thân mẫu thông báo Tiếng Việt, kênh gửi, thời hạn bổ sung minh chứng mặc định (12–336 giờ), dung lượng tệp minh chứng tối đa (1–50 MB). | Xem trước mẫu thông báo chỉ hiển thị bản dựng thử (`massEmailDispatched: false`), tuyệt đối không phát tán thư thật hàng loạt. |

---

### B. Các bất biến Nghiệp vụ CỐ ĐỊNH (Không cho phép cấu hình làm sai lệch)

1. **Chỉ có đúng 02 cấp xét duyệt con người:** Cấp Trường / ĐHĐN (`SCHOOL_OFFICER`) → Cấp Thành phố (`CITY_OFFICER` / `CITY_MANAGER`), và **Hội đồng xét chọn cấp Thành phố (`CITY_COMMITTEE`)** là cấp ra quyết định công nhận chính thức.
2. **Cụm Đại học Đà Nẵng (`unit-udn`):** 8 trường thành viên ĐHĐN dùng chung 01 Đơn vị xét sơ tuyển `unit-udn`, đính kèm 01 văn bản PDF chung và gửi 01 danh sách đề xuất hợp nhất mỗi mùa xét, đồng thời giữ nguyên thông tin trường gốc của từng sinh viên.
3. **Hồ sơ Tập thể (`TT01`–`TT04`):** Nộp trực tiếp lên cấp Thành phố ở giai đoạn `T04`, không đi qua bước xét sơ tuyển hay chuyển danh sách cấp Trường.
4. **Trợ lý AI chỉ mang tính tham khảo (`Advisory Only`):** Không tự động chấm đạt/trượt chính thức và không thay thế quyết định của Hội đồng.
5. **Tách biệt quyền hạn Quản trị viên (`ADMIN`):** Tài khoản kỹ thuật `ADMIN` quản lý cấu hình hệ thống nhưng bị chặn (`403 FORBIDDEN`) khỏi các thao tác gửi danh sách đề xuất cấp Trường, kết luận thẩm định cấp Thành phố và ra quyết định công nhận của Hội đồng.
