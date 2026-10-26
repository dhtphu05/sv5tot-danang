# 5TOT ĐÀ NẴNG — ADMIN-REVAMP.1: CENTRAL-STYLE TIMELINE IMPLEMENTATION (`T01`–`T07`)

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng

---

## 1. Mô hình 7 Giai đoạn Tiến độ Xét chọn Kiểu Trung ương (`T01`–`T07`)

Được cài đặt tại `backend/src/modules/seasons/seasonTimeline.helper.ts` (`buildCentralMilestonesForSeason`) và `packages/contracts/src/seasonTimeline.ts`:

| Mã giai đoạn | Tên giai đoạn Tiếng Việt | Làn nghiệp vụ (`track`) | Chủ thể thực hiện | Quy tắc đóng/mở & Ràng buộc thứ tự |
|---|---|---|---|---|
| **`T01`** (`T01_INDIVIDUAL_SUBMISSION`) | Mở cổng & Hạn nộp hồ sơ Cá nhân | `INDIVIDUAL` | Sinh viên | Mở khi `season.isActive && now >= individualSubmissionStart && now <= individualSubmissionEnd`. |
| **`T02`** (`T02_SCHOOL_PRELIMINARY_REVIEW`) | Thẩm định sơ khảo cấp Trường / ĐHĐN | `INDIVIDUAL` | Cán bộ HSV Trường / Cụm `unit-udn` | Diễn ra từ `schoolReviewStartAt` đến `schoolReviewEndAt` (không vượt quá `schoolForwardingDeadline`). |
| **`T03`** (`T03_SCHOOL_OFFICIAL_FORWARDING`) | Hạn chót cấp Trường gửi Công văn & Danh sách đề xuất | `INDIVIDUAL` | Đơn vị xét sơ tuyển (`SchoolReviewUnit`) | `individualSubmissionEnd <= schoolForwardingDeadline`. Mỗi đơn vị gửi tối đa 01 đợt đề xuất hợp nhất kèm 01 tệp PDF. |
| **`T04`** (`T04_COLLECTIVE_DIRECT_SUBMISSION`) | Mở cổng & Hạn nộp hồ sơ Tập thể SV5T (`TT01`–`TT04`) | `COLLECTIVE` (**Song song**) | Người lập hồ sơ Tập thể (`COLLECTIVE_PREPARER`) | `collectiveSubmissionStart < collectiveSubmissionEnd`. **Độc lập hoàn toàn với `T02`/`T03`** — nộp thẳng lên Thành phố, không qua cấp Trường. |
| **`T05`** (`T05_CITY_INDEPENDENT_REVIEW`) | Thẩm định độc lập cấp Thành phố | `SHARED` | Tổ Thư ký / Cán bộ Thành phố (`CITY_OFFICER`) | `schoolForwardingDeadline <= cityReviewEndAt`. Thẩm định độc lập cả hồ sơ Cá nhân (đã qua Trường đề xuất) và Tập thể. |
| **`T06`** (`T06_COMMITTEE_FINAL_DECISION`) | Họp Hội đồng xét chọn cấp Thành phố | `SHARED` | Hội đồng xét chọn Thành phố (`CITY_COMMITTEE`) | `cityReviewEndAt <= committeeMeetingStartAt`. Hội đồng xem xét và ra quyết định công nhận chính thức. |
| **`T07`** (`T07_RESULT_ANNOUNCEMENT`) | Công bố Quyết định công nhận chính thức | `SHARED` | Ban Thư ký Hội Sinh viên TP. Đà Nẵng | `committeeMeetingStartAt <= resultAnnouncementAt`. Công bố kết quả tới Sinh viên, Tập thể và các Trường. |

---

## 2. Kiểm soát Thời hạn tại Backend (Server-Authoritative Window Guards)

- **Chống gian lận đồng hồ máy trạm:** Mọi kiểm tra thời hạn nộp hồ sơ Cá nhân (`SeasonService.assertIndividualSubmissionOpen`) và Tập thể (`SeasonService.assertCollectiveSubmissionOpen`) đều sử dụng thời gian thực của máy chủ (`new Date()`) đối chiếu với `AwardSeason` đang kích hoạt.
- **Hiển thị chuẩn múi giờ Việt Nam:** Hàm `formatVietnamTimestampVi` luôn định dạng mốc thời gian theo múi giờ `Asia/Ho_Chi_Minh (GMT+7)` rõ ràng trên cả API và giao diện.
