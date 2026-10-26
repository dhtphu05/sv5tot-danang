# 5TOT ĐÀ NẴNG — ADMIN-REVAMP.1: CANONICAL SEASON SOURCE OF TRUTH

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng

---

## 1. Cấu trúc Nguồn Sự thật Duy nhất của Mùa xét chọn (`AwardSeason`)

Mọi nhãn niên khóa, trạng thái đóng/mở cổng nộp hồ sơ và tiến độ thẩm định trên toàn hệ thống đều bắt nguồn từ thực thể chuẩn `AwardSeason` (`packages/contracts/src/seasonTimeline.ts` & `backend/src/modules/seasons/season.types.ts`):

- `id`: Mã định danh mùa xét (ví dụ: `season-2025-2026`, `season-2026-2027`).
- `code`: Mã niên khóa chuẩn hóa `YYYY-YYYY` (bắt buộc hai năm liên tiếp: `endYear === startYear + 1`).
- `name`: Tên đợt xét chọn chính thức bằng Tiếng Việt.
- `isActive`: Cờ xác định mùa xét đang mở hoạt động hiện hành (tối đa 01 mùa `isActive = true` trên toàn hệ thống).
- `lifecycleStatus`: `'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED'`.
- `copiedFromSeasonId`: Tham chiếu mùa xét nguồn khi khởi tạo bằng chức năng sao chép cấu hình.
- **Các mốc thời gian chuẩn (`UTC` lưu trữ, hiển thị theo `Asia/Ho_Chi_Minh` GMT+7):**
  - `individualSubmissionStart`, `individualSubmissionEnd` (`T01`)
  - `schoolReviewStartAt`, `schoolReviewEndAt` (`T02`)
  - `schoolForwardingDeadline` (`T03`)
  - `collectiveSubmissionStart`, `collectiveSubmissionEnd` (`T04` — Làn Tập thể song song)
  - `cityReviewStartAt`, `cityReviewEndAt` (`T05`)
  - `committeeMeetingStartAt` (`T06`)
  - `resultAnnouncementAt` (`T07`)

---

## 2. Cơ chế Giải quyết Ngữ cảnh Mùa xét 4 Tầng (`resolveSeasonContext`)

Hệ thống giải quyết mùa xét theo thứ tự ưu tiên 4 tầng rõ ràng (`SeasonService.resolveSeasonContext` tại `backend/src/modules/seasons/season.service.ts`):

1. **Tầng 1 — `APPLICATION_SEASON` (Mùa xét gắn với Hồ sơ đang xem):**
   - Khi xem chi tiết một hồ sơ Cá nhân hoặc Tập thể đã nộp, hệ thống luôn sử dụng đúng `seasonId` của hồ sơ đó để hiển thị nhãn năm học và bộ tiêu chuẩn tương ứng của mùa đó.
2. **Tầng 2 — `EXPLICIT_SELECTION` (Mùa xét được người dùng chọn tường minh):**
   - Khi Quản trị viên hoặc Cán bộ chọn một mùa xét cụ thể trên bộ lọc hoặc truyền `?seasonId=2026-2027`, hệ thống trả về ngữ cảnh của mùa được chọn (kèm cờ `isHistoricalReadOnly: true` nếu mùa đó không phải mùa đang mở).
3. **Tầng 3 — `ACTIVE_SEASON` (Mùa xét đang mở hoạt động của hệ thống):**
   - Mặc định cho Sinh viên, Người lập hồ sơ Tập thể và các màn hình vận hành khi không chỉ định mùa xét riêng.
4. **Tầng 4 — `LATEST_CONFIGURED` / `UNCONFIGURED_FALLBACK` (Dự phòng an toàn):**
   - Khi tất cả các mùa đều đã đóng hoặc hệ thống chưa cấu hình mùa xét nào, trả về mùa gần nhất ở chế độ chỉ đọc mà không gây lỗi sập giao diện.

---

## 3. Hàm Chuẩn hóa Nhãn Năm học Bất biến (Idempotent Academic Year Formatters)

- `formatShortAcademicYear(raw)`: Luôn trả về `"YYYY–YYYY"` (dùng dấu gạch ngang dài chuẩn ngành xuất bản `–`), ví dụ: `"2025–2026"`.
- `formatAcademicYearLabel(raw)`: Luôn trả về `"Năm học YYYY–YYYY"`, tuyệt đối **idempotent** (`formatAcademicYearLabel(formatAcademicYearLabel("Năm học 2025-2026")) === "Năm học 2025–2026"`), triệt tiêu hoàn toàn lỗi lặp chuỗi `"Năm học Năm học ..."`.
