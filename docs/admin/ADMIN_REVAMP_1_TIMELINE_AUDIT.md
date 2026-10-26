# 5TOT ĐÀ NẴNG — ADMIN-REVAMP.1: CENTRAL TIMELINE & HARDCODE AUDIT

**Cơ quan quản lý:** Thành Đoàn Đà Nẵng  
**Đơn vị tổ chức / vận hành nghiệp vụ:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng

---

## 1. Kiểm toán Hiện trạng Tiến độ Xét chọn & Các Giá trị Năm học Cứng (Hardcode Audit)

Trước khi thực hiện **ADMIN-REVAMP.1**, kiểm toán mã nguồn phát hiện các điểm chưa đồng bộ về niên khóa và tiến độ xét chọn:

| Khu vực / Thành phần | Tệp mã nguồn | Vấn đề phát hiện trước khi xử lý | Giải pháp chuẩn hóa trong ADMIN-REVAMP.1 |
|---|---|---|---|
| **Thanh ngữ cảnh Chương trình & Mùa xét** | `src/staff/components/shell/AwardProgramContextBar.tsx`<br>`src/staff/components/shell/StaffAppShell.tsx` | Từng có nguy cơ lặp tiền tố `"Năm học Năm học ..."` hoặc dùng nhãn năm học tĩnh khi chuyển mùa xét. | Áp dụng hàm bất biến `formatAcademicYearLabel(season.schoolYear)` và `formatShortAcademicYear(season.schoolYear)`. |
| **Tổng quan Quản trị & Tiến độ Thời hạn** | `src/staff/components/admin/AdminHome.tsx`<br>`src/staff/components/admin/SeasonManagement.tsx`<br>`src/staff/components/admin/DeadlineManagement.tsx` | Mùa đang kích hoạt mặc định trong `systemConfigs.ts` từng lệch giữa `2025–2026` và `2026–2027`; thiếu biểu diễn trực quan 7 mốc tiến độ kiểu Trung ương (`T01`–`T07`). | Đồng bộ mùa đang mở là `season-2025-2026` (`Năm học 2025–2026`) và mùa chuẩn bị kế tiếp là `season-2026-2027` (`DRAFT`), tích hợp đầy đủ 7 mốc `T01`–`T07` kèm làn Tập thể `T04` song song. |
| **Hồ sơ Sinh viên & Token mặc định** | `src/tokens/index.ts`<br>`src/staff/fixtures/staffDataset.ts` | `MOCK_STUDENT.schoolYear` và các mốc hạn trong `CURRENT_STAFF_SEASON` từng ghi cứng `2026–2027` trong khi `CURRENT_STAFF_SEASON.seasonId` là `season-2025-2026`. | Chuẩn hóa đồng nhất về mùa đang mở `2025–2026` và dẫn xuất động theo mùa xét đang chọn. |
| **Thống kê & Xuất báo cáo Excel / CSV / Bản in** | `src/staff/analytics/analyticsTypes.ts`<br>`src/staff/components/analytics/AnalyticsFilterBar.tsx`<br>`src/staff/components/analytics/AnalyticsPage.tsx`<br>`src/staff/components/analytics/ReportsHub.tsx`<br>`src/staff/export/exportDataTransform.ts`<br>`src/staff/export/exportGenerators.ts` | Bộ lọc mặc định, tham số URL `?season=`, tên tệp `.xlsx`/`.csv`, Sheet 2 `"Thông tin xuất"` và tiêu đề bản in từng gắn cứng `'2026–2027'`. | Dẫn xuất động hoàn toàn từ `filters.season` thông qua `formatAcademicYearLabel` và `formatShortAcademicYear`; hỗ trợ chuyển đổi linh hoạt giữa `Năm học 2025–2026` và `Năm học 2026–2027`. |
| **Backend V2 Season & Timeline Service** | `backend/src/modules/seasons/*` | Chưa có helper đánh giá đầy đủ 7 giai đoạn `T01`–`T07` và endpoint giải quyết ngữ cảnh mùa xét 4 tầng. | Triển khai `seasonTimeline.helper.ts`, `SeasonService.resolveSeasonContext` và endpoint `GET /api/v2/public/season-context` + `GET /api/v2/seasons/context`. |
