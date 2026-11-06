/**
 * 5TOT Đà Nẵng — Shared City-Level Staff Backoffice Dataset
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements 2-level Da Nang City review architecture:
 * - Single shared dataset consumed across School Officer (unit-udn + 23 standalone units), City Officer, Manager, Committee, and Admin views.
 * - Reuses Nguyễn Minh Anh (APP-2026-DN-102220123) and HERO_SUPPLEMENT_REQUEST from Student fixtures.
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
 * 5 Canonical Prototype Staff Identities
 */
export const STAFF_DEMO_USERS: Record<StaffRole, StaffUser> = {
  SCHOOL_OFFICER: {
    id: 'staff-sch-udn',
    fullName: 'Cán bộ sơ tuyển Đại học Đà Nẵng',
    email: 'canbo.udn@udn.vn',
    primaryRole: 'SCHOOL_OFFICER',
    roleLabel: 'Cán bộ xét cấp trường',
    unitLabel: 'Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    roles: ['SCHOOL_OFFICER'],
  },
  CITY_OFFICER: {
    id: 'staff-off-nam',
    fullName: 'Cán bộ xét duyệt cấp Thành phố Đà Nẵng',
    email: 'canbo.thanhpho@hsvdanang.vn',
    primaryRole: 'CITY_OFFICER',
    roleLabel: 'Cán bộ xét duyệt',
    unitLabel: 'Hội Sinh viên Việt Nam Thành phố Đà Nẵng',
    roles: ['CITY_OFFICER'],
  },
  CITY_MANAGER: {
    id: 'staff-mgr-ha',
    fullName: 'Quản lý xét duyệt cấp Thành phố Đà Nẵng',
    email: 'quanly.thanhpho@hsvdanang.vn',
    primaryRole: 'CITY_MANAGER',
    roleLabel: 'Quản lý xét duyệt',
    unitLabel: 'Ban Thư ký · Hội Sinh viên Việt Nam TP. Đà Nẵng',
    roles: ['CITY_MANAGER'],
  },
  CITY_COMMITTEE: {
    id: 'staff-com-quan',
    fullName: 'Hội đồng xét chọn cấp Thành phố Đà Nẵng',
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
    unitLabel: 'Văn phòng Hội Sinh viên Việt Nam TP. Đà Nẵng',
    roles: ['ADMIN'],
  },
};

/**
 * Canonical City-level Reviewing Officer accounts
 */
export const CITY_REVIEW_OFFICERS: {
  id: string;
  fullName: string;
  email: string;
  unitLabel: string;
}[] = [
  {
    id: 'staff-off-nam',
    fullName: 'Cán bộ xét duyệt cấp Thành phố Đà Nẵng',
    email: 'canbo.thanhpho@hsvdanang.vn',
    unitLabel: 'Hội Sinh viên Việt Nam Thành phố Đà Nẵng',
  },
];

/**
 * Helper to build 5 canonical criteria review summaries
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
 * Current Season Operational Metadata
 */
export const CURRENT_STAFF_SEASON: StaffSeasonSummary = {
  seasonId: 'season-2025-2026',
  schoolYear: 'Năm học 2025–2026',
  title: 'Đợt xét chọn danh hiệu Sinh viên 5 tốt cấp Thành phố Đà Nẵng',
  scopeLabel: 'Cấp Thành phố Đà Nẵng',
  statusLabel: 'Đang trong giai đoạn tiếp nhận & thẩm định',
  submissionWindow: '01/10/2025 – 10/11/2026 · 20:00',
  reviewWindow: '12/10/2025 – 28/11/2026 · 17:00',
  committeeWindow: '30/11/2026 – 01/12/2026',
  participatingInstitutionCount: 31,
  activeStaffCount: 28,
  criteriaConfigStatus: 'Đã khóa cấu hình 05 tiêu chí chuẩn cấp Thành phố Đà Nẵng (Hướng dẫn 14-HD/BTK-HSVTP)',
  upcomingDeadlines: [
    {
      id: 'dl-sub-close',
      title: 'Hạn đóng tiếp nhận hồ sơ Sinh viên 5 tốt (Cá nhân & Tập thể)',
      dateLabel: '10/11/2026 · 20:00',
      scopeLabel: 'Sinh viên 31 cơ sở đào tạo trên địa bàn TP. Đà Nẵng',
      statusTone: 'warning',
    },
    {
      id: 'dl-school-forward',
      title: 'Hạn cấp Trường/Đơn vị gửi danh sách & văn bản PDF đề nghị lên Thành phố',
      dateLabel: '20/11/2026 · 17:00',
      scopeLabel: '24 Đơn vị xét sơ tuyển (ĐH Đà Nẵng & 23 trường độc lập)',
      statusTone: 'brand',
    },
    {
      id: 'dl-committee',
      title: 'Phiên họp Hội đồng xét chọn cấp Thành phố Đà Nẵng',
      dateLabel: '30/11/2026 · 08:30',
      scopeLabel: 'Hội đồng xét chọn cấp Thành phố Đà Nẵng',
      statusTone: 'brand',
    },
    {
      id: 'dl-publish',
      title: 'Công bố quyết định công nhận chính thức',
      dateLabel: '05/12/2026 · 09:00',
      scopeLabel: 'Ban Thư ký Hội Sinh viên Việt Nam TP. Đà Nẵng',
      statusTone: 'neutral',
    },
  ],
};

import { resolveSchoolReviewUnit } from '../schoolReviewTypes';
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
].map((app) => {
  const routing = resolveSchoolReviewUnit(app.institution.id);
  return {
    ...app,
    levelLabel: 'Cấp Thành phố Đà Nẵng',
    schoolReviewUnitId: routing.unit?.id || app.schoolReviewUnitId || 'unit-udn',
    schoolReviewUnitName:
      routing.unit?.officialName || app.schoolReviewUnitName || 'Đại học Đà Nẵng',
  };
});

export const INITIAL_STAFF_APPLICATIONS = STAFF_APPLICATIONS_DATASET;
export const INITIAL_STAFF_NOTIFICATIONS = STAFF_NOTIFICATIONS_FIXTURE;
