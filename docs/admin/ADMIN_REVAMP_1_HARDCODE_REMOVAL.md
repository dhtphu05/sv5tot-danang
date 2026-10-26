# 5TOT ĐÀ NẴNG — ADMIN-REVAMP.1: SYSTEM-WIDE HARDCODE REMOVAL REPORT

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng

---

## 1. Danh mục Các Giá trị Năm học Cứng Đã Loại bỏ & Thay thế bằng Dữ liệu Động

| STT | Tệp mã nguồn | Giá trị cứng trước đây | Cơ chế động sau khi chuẩn hóa |
|---|---|---|---|
| 1 | `src/staff/components/shell/AwardProgramContextBar.tsx` | Hiển thị chuỗi năm học chưa qua chuẩn hóa tiền tố | Sử dụng `formatAcademicYearLabel(activeSeason.schoolYear)` đảm bảo hiển thị chuẩn `"Năm học YYYY–YYYY"`. |
| 2 | `src/staff/components/shell/StaffAppShell.tsx` | Nhãn mùa xét ở thanh tiêu đề phụ thuộc chuỗi tĩnh | Dẫn xuất động từ `currentSeason` thông qua `formatAcademicYearLabel`. |
| 3 | `src/staff/components/admin/AdminHome.tsx` | Một số nhãn mô tả mùa xét gắn cứng `'2026–2027'` | Dẫn xuất động từ `currentSeason` (`formatAcademicYearLabel`, `formatShortAcademicYear`), hiển thị đúng mùa đang mở (`Năm học 2025–2026`) hoặc mùa vừa kích hoạt (`Năm học 2026–2027`). |
| 4 | `src/staff/fixtures/admin/systemConfigs.ts` | Mùa `2026–2027` được đánh dấu active mặc định gây lệch với dữ liệu hồ sơ `2025–2026` | Chuẩn hóa `season-2025-2026` là mùa đang mở (`ACTIVE`) và `season-2026-2027` là mùa chuẩn bị kế tiếp (`DRAFT`), khớp 100% với `PrismaAwardSeasonRepository`. |
| 5 | `src/tokens/index.ts` & `src/staff/fixtures/staffDataset.ts` | `MOCK_STUDENT.schoolYear` và `upcomingDeadlines` dùng năm `2026` trong khi mùa xét là `2025–2026` | Đồng bộ nhất quán với mùa đang mở `2025–2026`. |
| 6 | `src/staff/analytics/analyticsTypes.ts` & `src/staff/components/analytics/AnalyticsFilterBar.tsx` | Chỉ có 01 tùy chọn cứng `<option value="Năm học 2026–2027">` | Mặc định theo mùa đang mở `Năm học 2025–2026` và cho phép chuyển đổi giữa `Năm học 2025–2026 (Đang mở)` và `Năm học 2026–2027 (Bản nháp)`. |
| 7 | `src/staff/components/analytics/AnalyticsPage.tsx` | `params.set('season', '2026-2027')` gắn cứng trên URL | Tự động trích xuất mã niên khóa từ `nextFilters.season` (`2025-2026` / `2026-2027`). |
| 8 | `src/staff/components/analytics/ReportsHub.tsx`, `src/staff/export/exportDataTransform.ts`, `src/staff/export/exportGenerators.ts` | Tên tệp xuất `.xlsx`/`.csv`, Sheet 2 `"Thông tin xuất"` và tiêu đề Bản in gắn cứng `'2026–2027'` | Truyền động `filters.season` vào `buildExportFilename` và `generateXlsxBinary` để tạo đúng tên tệp `5TOT_DaNang_..._<YYYY-YYYY>.xlsx` và thông tin năm học theo đúng mùa đang chọn. |
