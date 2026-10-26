# LEAN-4.2 Navigation Audit: School Officer Workspace Deduplication

## 1. Audit Matrix: Legacy vs Canonical Deduplicated State

| Legacy Navigation Item | Legacy URL Path | Canonical Destination (LEAN-4.2) | Canonical URL Path | Canonical Filter / Context |
|---|---|---|---|---|
| **Tổng quan** | `/staff/school` | **Tổng quan** | `/staff/school` | Dashboard summary cards, 8-member UDN breakdown strip, priority queue, quick links. |
| **Hồ sơ sinh viên** | `/staff/school/applications` | **Hồ sơ sơ tuyển** | `/staff/school/applications` | Filter: `all` (Tất cả) |
| **Cần xét sơ tuyển** | `/staff/school/pending` | **Hồ sơ sơ tuyển** | `/staff/school/applications` | Filter: `pending` (Chờ xét) — Highlights `school_applications` in sidebar. |
| **Yêu cầu bổ sung** | `/staff/school/supplements` | **Hồ sơ sơ tuyển** | `/staff/school/applications` | Filter: `supplement` (Cần bổ sung) — Highlights `school_applications` in sidebar. |
| **Danh sách đề nghị Thành phố** | `/staff/school/awaiting-forward` | **Danh sách đề nghị** | `/staff/school/awaiting-forward` | Candidate selection table, PDF document upload, and pre-forwarding validation. |
| **Đã chuyển Thành phố** | `/staff/school/forwarded` | **Danh sách đề nghị** | `/staff/school/awaiting-forward` | Filter: `all`, post-forwarding immutable read-only view with archived PDF. Highlights `school_awaiting_forward` in sidebar. |
| **Thống kê** | `/staff/school/analytics` | Secondary Action | `/staff/school` (or `/staff/school/analytics`) | Accessed via "Thống kê tiến độ" quick link button in `SchoolOverviewPage`. Sidebar highlights `school_overview`. |
| **Thông báo** | `/staff/school/notifications` | **Thông báo** | `/staff/school/notifications` | School alerts and notifications. |

---

## 2. Canonical 4 Primary Destinations in Sidebar

The School Officer sidebar now contains strictly 4 primary items:

1. **Tổng quan (`school_overview`)**
   - Icon: `LayoutDashboard`
   - Purpose: Operational dashboard, institutional status summary, priority work queue ("Cần xử lý hôm nay"), and secondary links.
2. **Hồ sơ sơ tuyển (`school_applications`)**
   - Icon: `FolderKanban`
   - Badge: `school_total` (total applications in unit scope)
   - Workspace: 5 canonical filter buttons with real-time counts:
     - `Tất cả` (`all`): All applications in school scope.
     - `Chờ xét` (`pending`): Applications with status `pending_intake`.
     - `Đang xét` (`reviewing`): Applications with status `under_review`.
     - `Cần bổ sung` (`supplement`): Applications with status `supplement_requested` or `supplement_returned`.
     - `Đã xét` (`reviewed`): Applications with status `preliminary_completed`, `recommended_forwarding`, `not_recommended`, `forwarded_to_city`.
3. **Danh sách đề nghị (`school_awaiting_forward`)**
   - Icon: `UserCheck`
   - Badge: `school_awaiting_forward` (number of selected or ready-to-forward applications)
   - Workspace: Direct checkbox selection, PDF document upload (with preview, replace, remove), concise pre-validation bar, and final confirmation modal.
4. **Thông báo (`school_notifications`)**
   - Icon: `Bell`
   - Badge: `notifications` (unread count)
   - Workspace: Operational notifications and system notices.

---

## 3. Deep Link & Bookmark Compatibility

All legacy URLs (`/staff/school/pending`, `/staff/school/supplements`, `/staff/school/forwarded`, `/staff/school/analytics`) continue to resolve without throwing 404 errors. `resolveActiveSidebarNavId` transparently maps their active state to the appropriate canonical destination:
- `/staff/school/pending` -> highlights `school_applications`
- `/staff/school/supplements` -> highlights `school_applications`
- `/staff/school/forwarded` -> highlights `school_awaiting_forward`
- `/staff/school/analytics` -> highlights `school_overview`
- `/staff/school/applications/:id/review` -> highlights `school_applications`
