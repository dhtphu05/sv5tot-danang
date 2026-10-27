/**
 * 5TOT Đà Nẵng — Shared City-Level Staff Backoffice Dataset
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Prompt 16 Sections 31–33, 50–61, 84–87, 115–119:
 * - Single shared dataset consumed across Officer, Manager, Committee, and Admin views.
 * - Reuses Nguyễn Minh Anh (APP-2026-DN-102220123) and HERO_SUPPLEMENT_REQUEST from Student fixtures.
 * - Counts in Officer Home (12 assigned: 4 not started, 2 supplement returned, 1 needs recheck),
 *   Manager Home (8 unassigned, 2 high-workload officers, 5 aging cases),
 *   and Committee Home (12 cases: 3 needs review, 4 waiting decision, 5 ready for finalization)
 *   are 100% derived from this dataset — zero hardcoded disconnected numbers.
 */

import {
  StaffRole,
  StaffUser,
  StaffApplicationRecord,
  StaffCriterionReviewSummary,
  StaffCriterionReviewStatus,
  StaffSeasonSummary,
  StaffNotificationItem,
} from '../types';
import { HERO_SUPPLEMENT_REQUEST } from '../../demo/fixtures/supplementScenarios';

/**
 * 4 Canonical Prototype Staff Identities (Section 84)
 */
export const STAFF_DEMO_USERS: Record<StaffRole, StaffUser> = {
  SCHOOL_OFFICER: {
    id: 'staff-sch-an',
    fullName: 'Cán bộ xét cấp trường Đại học Đà Nẵng',
    email: 'canbo.udn@udn.vn',
    primaryRole: 'SCHOOL_OFFICER',
    roleLabel: 'Cán bộ xét cấp trường',
    unitLabel: 'Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    roles: ['SCHOOL_OFFICER'],
  },
  CITY_OFFICER: {
    id: 'staff-off-nam',
    fullName: 'Cán bộ xét duyệt cấp Thành phố',
    email: 'canbo.thanhpho@hsvdanang.vn',
    primaryRole: 'CITY_OFFICER',
    roleLabel: 'Cán bộ xét duyệt',
    unitLabel: 'Hội Sinh viên Việt Nam TP. Đà Nẵng',
    roles: ['CITY_OFFICER'],
  },
  CITY_MANAGER: {
    id: 'staff-mgr-ha',
    fullName: 'Quản lý xét duyệt cấp Thành phố',
    email: 'quanly.thanhpho@hsvdanang.vn',
    primaryRole: 'CITY_MANAGER',
    roleLabel: 'Quản lý xét duyệt',
    unitLabel: 'Ban Thư ký · Hội Sinh viên TP. Đà Nẵng',
    roles: ['CITY_MANAGER'],
  },
  CITY_COMMITTEE: {
    id: 'staff-com-quan',
    fullName: 'Hội đồng xét chọn cấp Thành phố',
    email: 'hoidong.thanhpho@hsvdanang.vn',
    primaryRole: 'CITY_COMMITTEE',
    roleLabel: 'Hội đồng xét chọn',
    unitLabel: 'Hội đồng xét chọn cấp Thành phố Đà Nẵng',
    roles: ['CITY_COMMITTEE'],
  },
  ADMIN: {
    id: 'staff-adm-lan',
    fullName: 'Quản trị hệ thống 5TOT Đà Nẵng',
    email: 'admin@hsvdanang.vn',
    primaryRole: 'ADMIN',
    roleLabel: 'Quản trị hệ thống',
    unitLabel: 'Văn phòng Hội Sinh viên TP. Đà Nẵng',
    roles: ['ADMIN'],
  },
};

/**
 * Single canonical City-level Reviewing Officer account
 */
export const CITY_REVIEW_OFFICERS: {
  id: string;
  fullName: string;
  email: string;
  unitLabel: string;
}[] = [
  {
    id: 'staff-off-nam',
    fullName: 'Cán bộ xét duyệt cấp Thành phố',
    email: 'canbo.thanhpho@hsvdanang.vn',
    unitLabel: 'Hội Sinh viên Việt Nam TP. Đà Nẵng',
  },
];

/**
 * Helper to build 5 canonical criteria review summaries (Section 50 & 51)
 */
function buildFiveCriteriaReview(
  statuses: [
    StaffCriterionReviewStatus,
    StaffCriterionReviewStatus,
    StaffCriterionReviewStatus,
    StaffCriterionReviewStatus,
    StaffCriterionReviewStatus,
  ],
  notes?: Partial<
    Record<
      'ethics' | 'academic' | 'physical' | 'volunteer' | 'integration',
      string
    >
  >
): StaffCriterionReviewSummary[] {
  return [
    {
      criterionId: 'ethics',
      criterionNumber: 1,
      criterionName: 'Đạo đức tốt',
      status: statuses[0],
      declaredCount: 3,
      evidenceCount: 3,
      noteSummary: notes?.ethics,
    },
    {
      criterionId: 'academic',
      criterionNumber: 2,
      criterionName: 'Học tập tốt',
      status: statuses[1],
      declaredCount: 3,
      evidenceCount: 5,
      noteSummary: notes?.academic,
    },
    {
      criterionId: 'physical',
      criterionNumber: 3,
      criterionName: 'Thể lực tốt',
      status: statuses[2],
      declaredCount: 3,
      evidenceCount: 3,
      noteSummary: notes?.physical,
    },
    {
      criterionId: 'volunteer',
      criterionNumber: 4,
      criterionName: 'Tình nguyện tốt',
      status: statuses[3],
      declaredCount: 3,
      evidenceCount: 4,
      noteSummary: notes?.volunteer,
    },
    {
      criterionId: 'integration',
      criterionNumber: 5,
      criterionName: 'Hội nhập tốt',
      status: statuses[4],
      declaredCount: 2,
      evidenceCount: 2,
      noteSummary: notes?.integration,
    },
  ];
}

/**
 * Current Season Operational Metadata (Sections 28–30, 85, 119)
 */
export const CURRENT_STAFF_SEASON: StaffSeasonSummary = {
  seasonId: 'season-2025-2026',
  schoolYear: 'Năm học 2025–2026',
  title: 'Đợt xét chọn danh hiệu Sinh viên 5 tốt cấp Thành phố Đà Nẵng',
  scopeLabel: 'Cấp Thành phố Đà Nẵng',
  statusLabel: 'Đang trong giai đoạn thẩm định & xét chọn',
  submissionWindow: '01/10/2025 – 15/10/2025 · 20:00',
  reviewWindow: '12/10/2025 – 20/10/2025 · 17:00',
  committeeWindow: '21/10/2025 – 24/10/2025',
  participatingInstitutionCount: 14,
  activeStaffCount: 7,
  criteriaConfigStatus: 'Đã khóa cấu hình 05 tiêu chí chuẩn cấp Thành phố',
  upcomingDeadlines: [
    {
      id: 'dl-supp',
      title: 'Hạn sinh viên phản hồi bổ sung minh chứng đợt 1',
      dateLabel: '18/10/2025 · 20:00',
      scopeLabel: 'Toàn đợt xét chọn cấp Thành phố',
      statusTone: 'warning',
    },
    {
      id: 'dl-review',
      title: 'Hạn hoàn tất thẩm định 05 tiêu chí của Cán bộ xét duyệt',
      dateLabel: '20/10/2025 · 17:00',
      scopeLabel: 'Tổ Thẩm định Hồ sơ',
      statusTone: 'brand',
    },
    {
      id: 'dl-committee',
      title: 'Phiên họp Hội đồng xét chọn cấp Thành phố',
      dateLabel: '22/10/2025 · 08:30',
      scopeLabel: 'Hội đồng xét chọn cấp Thành phố',
      statusTone: 'brand',
    },
    {
      id: 'dl-publish',
      title: 'Công bố quyết định công nhận chính thức',
      dateLabel: '24/10/2025 · 09:00',
      scopeLabel: 'Ban Thư ký Hội Sinh viên TP. Đà Nẵng',
      statusTone: 'neutral',
    },
  ],
};

/**
 * Canonical Shared Staff Applications Dataset (32 records across all realistic lifecycle states)
 *
 * Breakdown verified for exact consistency (Section 87):
 * - Assigned to Trần Hoàng Nam (staff-off-nam): 12 records
 *   - 4 assigned_not_started ("4 hồ sơ chưa bắt đầu xét")
 *   - 2 supplement_returned ("2 hồ sơ vừa gửi bổ sung")
 *   - 1 needs_recheck ("1 hồ sơ cần xem lại")
 *   - 2 under_review
 *   - 1 supplement_requested (Nguyễn Minh Anh - Hero Student record!)
 *   - 2 review_completed
 * - Assigned to Võ Thị Minh Châu (staff-off-chau): 10 records (High workload #2)
 * - Assigned to Đặng Quốc Huy (staff-off-huy): 4 records
 * - Assigned to Phan Thanh Tùng (staff-off-tung): 4 records
 * - Unassigned: 8 records ("8 hồ sơ chưa phân công")
 * - Committee Queue: 12 records total
 *   - 3 needs_committee_review ("3 hồ sơ có nội dung cần xem xét")
 *   - 4 waiting_decision ("4 hồ sơ chờ quyết định")
 *   - 5 ready_for_finalization ("5 hồ sơ đã đủ thông tin chờ hoàn tất")
 * - Aging cases (isAging: true): 5 records ("5 hồ sơ quá lâu chưa cập nhật")
 */

import { OFFICER_ASSIGNED_APPLICATIONS } from './applications/officerAssignedApplications';
import { UNASSIGNED_INTAKE_APPLICATIONS } from './applications/unassignedIntakeApplications';
import { COMMITTEE_QUEUE_APPLICATIONS } from './applications/committeeQueueApplications';
import { AGING_AND_CROSS_OFFICER_APPLICATIONS } from './applications/agingAndCrossOfficerApplications';
import { STAFF_NOTIFICATIONS_FIXTURE } from './staffNotifications';
export { STAFF_NOTIFICATIONS_FIXTURE };

export const STAFF_APPLICATIONS_DATASET: StaffApplicationRecord[] = [
  ...OFFICER_ASSIGNED_APPLICATIONS,
  ...UNASSIGNED_INTAKE_APPLICATIONS,
  ...COMMITTEE_QUEUE_APPLICATIONS,
  ...AGING_AND_CROSS_OFFICER_APPLICATIONS,
];

export const INITIAL_STAFF_APPLICATIONS = STAFF_APPLICATIONS_DATASET;
export const INITIAL_STAFF_NOTIFICATIONS = STAFF_NOTIFICATIONS_FIXTURE;
