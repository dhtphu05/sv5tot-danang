/**
 * 5TOT Đà Nẵng — Frontend Domain Portal V2 State & Auth Helpers (Backend V2)
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 */

import type { Request, Response, NextFunction } from 'express';
import type { IIdentityRepository } from '../identity/identity.repository';
import type { SessionService } from '../sessions/session.service';
import type { SystemRoleCode } from '../identity/identity.types';
import { defaultPasswordHasher } from '../auth/passwordHasher';

export interface PortalAuditLogRecord {
  id: string;
  timestamp: string;
  track: 'INDIVIDUAL' | 'COLLECTIVE' | 'SYSTEM';
  applicationId?: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  details: string;
}

export interface PortalAuthSessionPayload {
  authenticated: boolean;
  mode: 'BACKEND';
  token: string;
  accountType: 'STUDENT' | 'COLLECTIVE_PREPARER' | 'STAFF';
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    roleLabel: string;
    unitId?: string;
    unitLabel?: string;
    institutionId?: string;
    institutionName?: string;
    studentCode?: string;
  };
}

export interface StoredEvidenceRecord {
  id: string;
  ownerTrack: 'INDIVIDUAL' | 'COLLECTIVE';
  applicationId: string;
  requirementOrCriterionId: string;
  name: string;
  fileType: string;
  size: string;
  uploadedAt: string;
  status: string;
  url: string;
  base64Content?: string;
}

export const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'doc',
  'docx',
  'xls',
  'xlsx',
]);

export const SCHOOL_UNIT_MAP: Record<string, { unitId: string; unitName: string; instName: string }> = {
  'inst-dut': {
    unitId: 'unit-udn',
    unitName: 'Đại học Đà Nẵng',
    instName: 'Trường Đại học Bách khoa – ĐHĐN',
  },
  'inst-due': {
    unitId: 'unit-udn',
    unitName: 'Đại học Đà Nẵng',
    instName: 'Trường Đại học Kinh tế – ĐHĐN',
  },
  'inst-ued': {
    unitId: 'unit-udn',
    unitName: 'Đại học Đà Nẵng',
    instName: 'Trường Đại học Sư phạm – ĐHĐN',
  },
  'inst-ufl': {
    unitId: 'unit-udn',
    unitName: 'Đại học Đà Nẵng',
    instName: 'Trường Đại học Ngoại ngữ – ĐHĐN',
  },
  'inst-ufls': {
    unitId: 'unit-udn',
    unitName: 'Đại học Đà Nẵng',
    instName: 'Trường Đại học Ngoại ngữ – ĐHĐN',
  },
  'inst-ute': {
    unitId: 'unit-udn',
    unitName: 'Đại học Đà Nẵng',
    instName: 'Trường Đại học Sư phạm Kỹ thuật – ĐHĐN',
  },
  'inst-vku': {
    unitId: 'unit-udn',
    unitName: 'Đại học Đà Nẵng',
    instName: 'Trường Đại học Công nghệ Thông tin và Truyền thông Việt – Hàn – ĐHĐN',
  },
  'inst-smp': {
    unitId: 'unit-udn',
    unitName: 'Đại học Đà Nẵng',
    instName: 'Trường Y Dược – ĐHĐN',
  },
  'inst-vnuk': {
    unitId: 'unit-udn',
    unitName: 'Đại học Đà Nẵng',
    instName: 'Viện Nghiên cứu và Đào tạo Việt – Anh – ĐHĐN',
  },
  'inst-dtu': {
    unitId: 'unit-dtu',
    unitName: 'Trường Đại học Duy Tân',
    instName: 'Đại học Duy Tân',
  },
  'inst-dau': {
    unitId: 'unit-dau',
    unitName: 'Trường Đại học Kiến trúc Đà Nẵng',
    instName: 'Trường Đại học Kiến trúc Đà Nẵng',
  },
  'inst-donga': {
    unitId: 'unit-donga',
    unitName: 'Trường Đại học Đông Á',
    instName: 'Trường Đại học Đông Á',
  },
  'inst-upes3': {
    unitId: 'unit-upes3',
    unitName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    instName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
  },
  'inst-tyd': {
    unitId: 'unit-tyd',
    unitName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    instName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
  },
  'inst-fpt': {
    unitId: 'unit-fpt',
    unitName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    instName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
  },
};

export const STAFF_SEED_ACCOUNTS: Array<{
  id: string;
  email: string;
  fullName: string;
  role: SystemRoleCode;
  roleLabel: string;
  unitId?: string;
  unitLabel: string;
  institutionId?: string;
}> = [
  // Cán bộ sơ tuyển cấp Trường / Đơn vị (SCHOOL_OFFICER)
  {
    id: 'staff-sch-an',
    email: 'an.nv@udn.vn',
    fullName: 'Nguyễn Văn An',
    role: 'SCHOOL_OFFICER',
    roleLabel: 'Cán bộ xét sơ tuyển',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
    institutionId: 'inst-dut',
  },
  {
    id: 'staff-sch-udn',
    email: 'tien.nv@udn.vn',
    fullName: 'Nguyễn Văn Tiến',
    role: 'SCHOOL_OFFICER',
    roleLabel: 'Cán bộ sơ tuyển cấp Trường',
    unitId: 'unit-udn',
    unitLabel: 'Hội đồng Sơ tuyển Đại học Đà Nẵng',
    institutionId: 'inst-dut',
  },
  {
    id: 'staff-sch-dtu',
    email: 'dung.th@duytan.edu.vn',
    fullName: 'Trần Hoàng Dũng',
    role: 'SCHOOL_OFFICER',
    roleLabel: 'Cán bộ sơ tuyển cấp Trường',
    unitId: 'unit-dtu',
    unitLabel: 'Trường Đại học Duy Tân',
    institutionId: 'inst-dtu',
  },
  {
    id: 'staff-sch-dtu-huy',
    email: 'canbo.dtu@duytan.edu.vn',
    fullName: 'Trần Gia Huy',
    role: 'SCHOOL_OFFICER',
    roleLabel: 'Cán bộ sơ tuyển cấp Trường',
    unitId: 'unit-dtu',
    unitLabel: 'Trường Đại học Duy Tân',
    institutionId: 'inst-dtu',
  },
  {
    id: 'staff-sch-donga',
    email: 'thao.htt@donga.edu.vn',
    fullName: 'Hoàng Thị Thu Thảo',
    role: 'SCHOOL_OFFICER',
    roleLabel: 'Cán bộ sơ tuyển cấp Trường',
    unitId: 'unit-donga',
    unitLabel: 'Trường Đại học Đông Á',
    institutionId: 'inst-donga',
  },
  {
    id: 'staff-sch-dau',
    email: 'hai.lt@dau.edu.vn',
    fullName: 'Lê Thanh Hải',
    role: 'SCHOOL_OFFICER',
    roleLabel: 'Cán bộ sơ tuyển cấp Trường',
    unitId: 'unit-dau',
    unitLabel: 'Trường Đại học Kiến trúc Đà Nẵng',
    institutionId: 'inst-dau',
  },
  {
    id: 'staff-sch-upes3',
    email: 'tri.vm@upes3.edu.vn',
    fullName: 'Võ Minh Trí',
    role: 'SCHOOL_OFFICER',
    roleLabel: 'Cán bộ sơ tuyển cấp Trường',
    unitId: 'unit-upes3',
    unitLabel: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    institutionId: 'inst-upes3',
  },
  {
    id: 'staff-sch-tyd',
    email: 'phuong.nt@dhktyduocdn.edu.vn',
    fullName: 'Nguyễn Thị Phương',
    role: 'SCHOOL_OFFICER',
    roleLabel: 'Cán bộ sơ tuyển cấp Trường',
    unitId: 'unit-tyd',
    unitLabel: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    institutionId: 'inst-tyd',
  },
  {
    id: 'staff-sch-fpt',
    email: 'anh.bd@fpt.edu.vn',
    fullName: 'Bùi Đức Anh',
    role: 'SCHOOL_OFFICER',
    roleLabel: 'Cán bộ sơ tuyển cấp Trường',
    unitId: 'unit-fpt',
    unitLabel: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    institutionId: 'inst-fpt',
  },
  // Cán bộ xét duyệt Thành phố (CITY_OFFICER)
  {
    id: 'staff-off-nam',
    email: 'nam.th@hsvdanang.vn',
    fullName: 'Trần Hoàng Nam',
    role: 'CITY_OFFICER',
    roleLabel: 'Cán bộ xét duyệt Thành phố',
    unitLabel: 'Tổ Thẩm định Hồ sơ · Khối Kỹ thuật & Công nghệ',
  },
  {
    id: 'staff-off-chau',
    email: 'chau.vtm@hsvdanang.vn',
    fullName: 'Võ Thị Minh Châu',
    role: 'CITY_OFFICER',
    roleLabel: 'Cán bộ xét duyệt Thành phố',
    unitLabel: 'Tổ Thẩm định Hồ sơ · Khối Kinh tế & Sư phạm',
  },
  {
    id: 'staff-off-huy',
    email: 'huy.dq@hsvdanang.vn',
    fullName: 'Đặng Quốc Huy',
    role: 'CITY_OFFICER',
    roleLabel: 'Cán bộ xét duyệt Thành phố',
    unitLabel: 'Tổ Thẩm định Hồ sơ · Khối Ngoại ngữ & Y Dược',
  },
  {
    id: 'staff-off-tung',
    email: 'tung.pt@hsvdanang.vn',
    fullName: 'Phan Thanh Tùng',
    role: 'CITY_OFFICER',
    roleLabel: 'Cán bộ xét duyệt Thành phố',
    unitLabel: 'Tổ Thẩm định Hồ sơ · Khối Đại học & Học viện',
  },
  {
    id: 'staff-off-linh',
    email: 'linh.pt@hsvdanang.vn',
    fullName: 'Phạm Thùy Linh',
    role: 'CITY_OFFICER',
    roleLabel: 'Cán bộ xét duyệt Thành phố',
    unitLabel: 'Hội Sinh viên TP. Đà Nẵng',
  },
  // Quản lý xét duyệt Thành phố (CITY_MANAGER)
  {
    id: 'staff-mgr-ha',
    email: 'ha.nt@hsvdanang.vn',
    fullName: 'Nguyễn Thu Hà',
    role: 'CITY_MANAGER',
    roleLabel: 'Quản lý xét duyệt Thành phố',
    unitLabel: 'Ban Thư ký · Hội Sinh viên TP. Đà Nẵng',
  },
  // Hội đồng xét chọn Thành phố (CITY_COMMITTEE)
  {
    id: 'staff-com-quan',
    email: 'quan.lm@hsvdanang.vn',
    fullName: 'Lê Minh Quân',
    role: 'CITY_COMMITTEE',
    roleLabel: 'Hội đồng xét chọn Thành phố',
    unitLabel: 'Hội đồng xét chọn cấp Thành phố Đà Nẵng',
  },
  {
    id: 'staff-com-thao',
    email: 'thao.tp@hsvdanang.vn',
    fullName: 'Trương Phương Thảo',
    role: 'CITY_COMMITTEE',
    roleLabel: 'Hội đồng xét chọn Thành phố',
    unitLabel: 'Ban Thanh niên Trường học Thành Đoàn',
  },
  {
    id: 'staff-com-viet',
    email: 'viet.hq@hsvdanang.vn',
    fullName: 'Hoàng Quốc Việt',
    role: 'CITY_COMMITTEE',
    roleLabel: 'Hội đồng xét chọn Thành phố',
    unitLabel: 'Hội đồng xét chọn cấp Thành phố Đà Nẵng',
  },
  // Quản trị hệ thống (ADMIN)
  {
    id: 'staff-adm-khoa',
    email: 'khoa.nd@hsvdanang.vn',
    fullName: 'Nguyễn Đăng Khoa',
    role: 'ADMIN',
    roleLabel: 'Quản trị hệ thống',
    unitLabel: 'Thành Đoàn Đà Nẵng',
  },
  {
    id: 'staff-adm-lan',
    email: 'lan.pn@hsvdanang.vn',
    fullName: 'Phạm Ngọc Lan',
    role: 'ADMIN',
    roleLabel: 'Quản trị hệ thống',
    unitLabel: 'Văn phòng Hội Sinh viên TP. Đà Nẵng',
  },
  {
    id: 'staff-adm-root',
    email: 'admin@hsvdanang.vn',
    fullName: 'Quản trị viên 5TOT Đà Nẵng',
    role: 'ADMIN',
    roleLabel: 'Quản trị hệ thống',
    unitLabel: 'Hội Sinh viên TP. Đà Nẵng',
  },
];

export const COLLECTIVE_PREPARERS: Array<{
  id: string;
  email: string;
  fullName: string;
  collectiveName: string;
  institutionId: string;
  institutionName: string;
  schoolReviewUnitId: string;
  schoolReviewUnitName: string;
}> = [
  {
    id: 'prep-col-dut-01',
    email: 'mai.nt@dut.udn.vn',
    fullName: 'Nguyễn Thị Mai',
    collectiveName: 'Chi hội Sinh viên 21TCLC_DT1',
    institutionId: 'inst-dut',
    institutionName: 'Trường Đại học Bách khoa – ĐHĐN',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
  },
  {
    id: 'prep-col-due-01',
    email: 'hung.lv@due.udn.vn',
    fullName: 'Lê Văn Hùng',
    collectiveName: 'Liên chi hội Khoa Quản trị Kinh doanh',
    institutionId: 'inst-due',
    institutionName: 'Trường Đại học Kinh tế – ĐHĐN',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
  },
  {
    id: 'prep-col-ued-01',
    email: 'thao.np@ued.udn.vn',
    fullName: 'Nguyễn Phương Thảo',
    collectiveName: 'Chi hội Sư phạm Toán 22ST',
    institutionId: 'inst-ued',
    institutionName: 'Trường Đại học Sư phạm – ĐHĐN',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
  },
  {
    id: 'prep-col-ufl-01',
    email: 'linh.nk@ufl.udn.vn',
    fullName: 'Nguyễn Khánh Linh',
    collectiveName: 'Liên chi hội Khoa Tiếng Anh',
    institutionId: 'inst-ufl',
    institutionName: 'Trường Đại học Ngoại ngữ – ĐHĐN',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
  },
  {
    id: 'prep-col-ute-01',
    email: 'nam.ph@ute.udn.vn',
    fullName: 'Phạm Hoài Nam',
    collectiveName: 'Chi đoàn 21KMT',
    institutionId: 'inst-ute',
    institutionName: 'Trường Đại học Sư phạm Kỹ thuật – ĐHĐN',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
  },
  {
    id: 'prep-col-vku-01',
    email: 'khang.dn@vku.udn.vn',
    fullName: 'Đinh Nguyên Khang',
    collectiveName: 'Liên chi hội Khoa Khoa học Máy tính',
    institutionId: 'inst-vku',
    institutionName: 'Trường Đại học CNTT & TT Việt – Hàn – ĐHĐN',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
  },
  {
    id: 'prep-col-smp-01',
    email: 'vy.lt@smp.udn.vn',
    fullName: 'Lê Thảo Vy',
    collectiveName: 'Liên chi hội Y khoa',
    institutionId: 'inst-smp',
    institutionName: 'Trường Y Dược – ĐHĐN',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
  },
  {
    id: 'prep-col-vnuk-01',
    email: 'khoa.nm@vnuk.udn.vn',
    fullName: 'Nguyễn Minh Khoa',
    collectiveName: 'Liên chi hội Viện Nghiên cứu và Đào tạo Việt – Anh',
    institutionId: 'inst-vnuk',
    institutionName: 'Viện Nghiên cứu và Đào tạo Việt – Anh – ĐHĐN',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
  },
  {
    id: 'prep-col-dtu-01',
    email: 'long.vh@dtu.edu.vn',
    fullName: 'Võ Hoàng Long',
    collectiveName: 'Liên chi đoàn Viện Đào tạo Quốc tế',
    institutionId: 'inst-dtu',
    institutionName: 'Đại học Duy Tân',
    schoolReviewUnitId: 'unit-dtu',
    schoolReviewUnitName: 'Trường Đại học Duy Tân',
  },
  {
    id: 'prep-col-donga-01',
    email: 'trang.lth@donga.edu.vn',
    fullName: 'Lê Thị Huyền Trang',
    collectiveName: 'Liên chi hội Khoa Quản trị Du lịch',
    institutionId: 'inst-donga',
    institutionName: 'Trường Đại học Đông Á',
    schoolReviewUnitId: 'unit-donga',
    schoolReviewUnitName: 'Trường Đại học Đông Á',
  },
  {
    id: 'prep-col-dau-01',
    email: 'minh.tqh@dau.edu.vn',
    fullName: 'Trần Quốc Hoàng Minh',
    collectiveName: 'Liên chi hội Khoa Kiến trúc',
    institutionId: 'inst-dau',
    institutionName: 'Trường Đại học Kiến trúc Đà Nẵng',
    schoolReviewUnitId: 'unit-dau',
    schoolReviewUnitName: 'Trường Đại học Kiến trúc Đà Nẵng',
  },
  {
    id: 'prep-col-upes3-01',
    email: 'tuan.nq@upes3.edu.vn',
    fullName: 'Nguyễn Quốc Tuấn',
    collectiveName: 'Liên chi đoàn Khoa Giáo dục Thể chất',
    institutionId: 'inst-upes3',
    institutionName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    schoolReviewUnitId: 'unit-upes3',
    schoolReviewUnitName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
  },
  {
    id: 'prep-col-tyd-01',
    email: 'truc.htt@dhktyduocdn.edu.vn',
    fullName: 'Huỳnh Thị Thanh Trúc',
    collectiveName: 'Liên chi hội Khoa Điều dưỡng',
    institutionId: 'inst-tyd',
    institutionName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    schoolReviewUnitId: 'unit-tyd',
    schoolReviewUnitName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
  },
  {
    id: 'prep-col-fpt-01',
    email: 'vy.ntt@fpt.edu.vn',
    fullName: 'Nguyễn Trần Thảo Vy',
    collectiveName: 'CLB Kỹ thuật Phần mềm F-Code',
    institutionId: 'inst-fpt',
    institutionName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    schoolReviewUnitId: 'unit-fpt',
    schoolReviewUnitName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
  },
];

export const SEEDED_STUDENTS: Array<{
  id: string;
  email: string;
  fullName: string;
  studentCode: string;
  institutionId: string;
  institutionName: string;
  unitId: string;
  unitLabel: string;
}> = [
  {
    id: 'stu-dut-01',
    email: 'minh.nv@dut.udn.vn',
    fullName: 'Nguyễn Minh Anh',
    studentCode: '102220123',
    institutionId: 'inst-dut',
    institutionName: 'Trường Đại học Bách khoa – ĐHĐN',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-dut-02',
    email: 'sv.dut@dut.udn.vn',
    fullName: 'Phạm Quốc Đạt',
    studentCode: '102220301',
    institutionId: 'inst-dut',
    institutionName: 'Trường Đại học Bách khoa – ĐHĐN',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-due-01',
    email: 'sv.due@due.udn.vn',
    fullName: 'Lê Thị Bảo Ngọc',
    studentCode: '211121045120',
    institutionId: 'inst-due',
    institutionName: 'Trường Đại học Kinh tế – ĐHĐN',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-ued-01',
    email: 'sv.ued@ued.udn.vn',
    fullName: 'Trần Quốc Bảo',
    studentCode: '3140122089',
    institutionId: 'inst-ued',
    institutionName: 'Trường Đại học Sư phạm – ĐHĐN',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-ufl-01',
    email: 'sv.ufl@ufl.udn.vn',
    fullName: 'Phạm Ngọc Hà My',
    studentCode: '411220156',
    institutionId: 'inst-ufl',
    institutionName: 'Trường Đại học Ngoại ngữ – ĐHĐN',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-ute-01',
    email: 'sv.ute@ute.udn.vn',
    fullName: 'Võ Văn Kiệt',
    studentCode: '221150531201',
    institutionId: 'inst-ute',
    institutionName: 'Trường Đại học Sư phạm Kỹ thuật – ĐHĐN',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-vku-01',
    email: 'sv.vku@vku.udn.vn',
    fullName: 'Hoàng Gia Bảo',
    studentCode: '22IT088',
    institutionId: 'inst-vku',
    institutionName: 'Trường Đại học CNTT & TT Việt – Hàn – ĐHĐN',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-smp-01',
    email: 'sv.smp@smp.udn.vn',
    fullName: 'Đặng Thùy Dương',
    studentCode: '21YK042',
    institutionId: 'inst-smp',
    institutionName: 'Trường Y Dược – ĐHĐN',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-vnuk-01',
    email: 'sv.vnuk@vnuk.udn.vn',
    fullName: 'Phan Minh Khôi',
    studentCode: '22VNUK019',
    institutionId: 'inst-vnuk',
    institutionName: 'Viện Nghiên cứu và Đào tạo Việt – Anh – ĐHĐN',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-dtu-01',
    email: 'sv.dtu@duytan.edu.vn',
    fullName: 'Nguyễn Hoàng Phúc',
    studentCode: '27211204567',
    institutionId: 'inst-dtu',
    institutionName: 'Đại học Duy Tân',
    unitId: 'unit-dtu',
    unitLabel: 'Trường Đại học Duy Tân',
  },
  {
    id: 'stu-donga-01',
    email: 'sv.donga@donga.edu.vn',
    fullName: 'Trương Mỹ Linh',
    studentCode: 'DA220518',
    institutionId: 'inst-donga',
    institutionName: 'Trường Đại học Đông Á',
    unitId: 'unit-donga',
    unitLabel: 'Trường Đại học Đông Á',
  },
  {
    id: 'stu-dau-01',
    email: 'sv.dau@dau.edu.vn',
    fullName: 'Lê Đình Khôi',
    studentCode: '21KT0115',
    institutionId: 'inst-dau',
    institutionName: 'Trường Đại học Kiến trúc Đà Nẵng',
    unitId: 'unit-dau',
    unitLabel: 'Trường Đại học Kiến trúc Đà Nẵng',
  },
  {
    id: 'stu-upes3-01',
    email: 'sv.upes3@upes3.edu.vn',
    fullName: 'Nguyễn Quốc Tuấn',
    studentCode: 'TD220094',
    institutionId: 'inst-upes3',
    institutionName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    unitId: 'unit-upes3',
    unitLabel: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
  },
  {
    id: 'stu-tyd-01',
    email: 'sv.tyd@dhktyduocdn.edu.vn',
    fullName: 'Huỳnh Thị Thanh Trúc',
    studentCode: 'YD210312',
    institutionId: 'inst-tyd',
    institutionName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    unitId: 'unit-tyd',
    unitLabel: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
  },
  {
    id: 'stu-fpt-01',
    email: 'sv.fpt@fpt.edu.vn',
    fullName: 'Bùi Quang Nhật',
    studentCode: 'DE170452',
    institutionId: 'inst-fpt',
    institutionName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    unitId: 'unit-fpt',
    unitLabel: 'Trường Đại học FPT phân hiệu Đà Nẵng',
  },
];

export function createDefaultCriteriaList() {
  return [
    { id: 'ethics', name: 'Đạo đức tốt', requirements: [], groups: [] },
    { id: 'academic', name: 'Học tập tốt', requirements: [], groups: [] },
    { id: 'physical', name: 'Thể lực tốt', requirements: [], groups: [] },
    { id: 'volunteer', name: 'Tình nguyện tốt', requirements: [], groups: [] },
    { id: 'integration', name: 'Hội nhập tốt', requirements: [], groups: [] },
  ];
}

export function createDefaultCriteriaReviewList() {
  return [
    { criterionId: 'ethics', criterionName: 'Đạo đức tốt', status: 'not_reviewed' },
    { criterionId: 'academic', criterionName: 'Học tập tốt', status: 'not_reviewed' },
    { criterionId: 'physical', criterionName: 'Thể lực tốt', status: 'not_reviewed' },
    { criterionId: 'volunteer', criterionName: 'Tình nguyện tốt', status: 'not_reviewed' },
    { criterionId: 'integration', criterionName: 'Hội nhập tốt', status: 'not_reviewed' },
  ];
}

export function createEmptyCollectiveRequirements() {
  return {
    tt01: {
      isRecognizedSchoolLevel: false,
      recognizedAcademicYear: '2025–2026',
      issuingUnitName: '',
      decisionNumber: '',
      decisionDate: '',
      evidenceFiles: [],
    },
    tt02: {
      totalMembers: 0,
      participatingCount: 0,
      censusDate: '',
      structuredMembers: [],
      evidenceFiles: [],
    },
    tt03: {
      recognizedCount: 0,
      structuredRecognizedMembers: [],
      evidenceFiles: [],
    },
    tt04: {
      noViolationsConfirmed: false,
      confirmingUnitName: '',
      confirmationDate: '',
      evidenceFiles: [],
    },
  };
}

function buildSeededIndividualStaffRecords(): Array<Record<string, any>> {
  return [
    {
      applicationId: 'APP-2026-DN-00142',
      schoolYear: 'Năm học 2025–2026',
      student: {
        fullName: 'Nguyễn Minh Anh',
        studentCode: '102220123',
        email: 'minhanh.nguyen@dut.udn.vn',
      },
      institution: {
        id: 'inst-dut',
        officialName: 'Trường Đại học Bách khoa – ĐHĐN',
      },
      currentReviewStage: 'SCHOOL',
      schoolReviewUnitId: 'unit-udn',
      schoolReviewUnitName: 'Đại học Đà Nẵng',
      schoolPreliminaryStatus: 'pending_intake',
      workflowStatus: 'unassigned',
      assignment: null,
      reviewedCriteriaCount: 0,
      criteriaReview: createDefaultCriteriaReviewList(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function buildSeededStudentApplications(): Record<string, Record<string, any>> {
  return {
    'APP-2026-DN-00142': {
      applicationId: 'APP-2026-DN-00142',
      status: 'draft',
      reviewStage: 'SCHOOL',
      trainingInstitutionName: 'Trường Đại học Bách khoa – ĐHĐN',
      schoolReviewUnitId: 'unit-udn',
      schoolReviewUnitName: 'Đại học Đà Nẵng',
      schoolPreliminaryStatus: 'school_not_submitted',
      student: {
        fullName: 'Nguyễn Minh Anh',
        studentId: '102220123',
        university: 'Trường Đại học Bách khoa – ĐHĐN',
        faculty: 'Khoa Công nghệ Thông tin',
        class: '22T_CLC1',
        email: 'minhanh.nguyen@dut.udn.vn',
        academicYear: '2025–2026',
      },
      criteria: createDefaultCriteriaList(),
      supplementRequests: [],
    },
  };
}

export interface PortalRegisteredStudent {
  id: string;
  fullName: string;
  email: string;
  studentCode: string;
  institutionId: string;
  institutionName: string;
  password?: string;
}

export interface PortalState {
  sessions: Map<string, PortalAuthSessionPayload>;
  registeredStudents: Map<string, PortalRegisteredStudent>;
  individualStaffRecords: Array<Record<string, any>>;
  studentApplications: Record<string, Record<string, any>>;
  collectiveApplications: Array<Record<string, any>>;
  evidenceIndex: Map<string, StoredEvidenceRecord>;
  auditLogs: PortalAuditLogRecord[];
}

export const portalState: PortalState = {
  sessions: new Map(),
  registeredStudents: new Map(),
  individualStaffRecords: buildSeededIndividualStaffRecords(),
  studentApplications: buildSeededStudentApplications(),
  collectiveApplications: [],
  evidenceIndex: new Map(),
  auditLogs: [
    {
      id: 'aud-seed-init',
      timestamp: new Date().toISOString(),
      track: 'SYSTEM',
      action: 'BACKEND_DB_INITIALIZED',
      actorId: 'system',
      actorName: 'Hệ thống 5TOT Đà Nẵng',
      actorRole: 'ADMIN',
      details: 'Khởi tạo cơ sở dữ liệu chế độ Real Backend V2.',
    },
  ],
};

export function resetDomainPortalState(): void {
  portalState.sessions = new Map();
  portalState.registeredStudents = new Map();
  portalState.individualStaffRecords = buildSeededIndividualStaffRecords();
  portalState.studentApplications = buildSeededStudentApplications();
  portalState.collectiveApplications = [];
  portalState.evidenceIndex = new Map();
  portalState.auditLogs = [
    {
      id: 'aud-seed-init',
      timestamp: new Date().toISOString(),
      track: 'SYSTEM',
      action: 'BACKEND_DB_INITIALIZED',
      actorId: 'system',
      actorName: 'Hệ thống 5TOT Đà Nẵng',
      actorRole: 'ADMIN',
      details: 'Khởi tạo cơ sở dữ liệu chế độ Real Backend V2.',
    },
  ];
}

export function appendPortalAuditLog(
  entry: Omit<PortalAuditLogRecord, 'id' | 'timestamp'>
): PortalAuditLogRecord {
  const record: PortalAuditLogRecord = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  portalState.auditLogs.unshift(record);
  return record;
}

export function resolveSessionActor(req: Request): {
  id: string;
  name: string;
  email: string;
  role: string;
  unitId?: string;
  authenticated: boolean;
} {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    const session = portalState.sessions.get(token);
    if (session?.user) {
      return {
        id: session.user.id,
        name: session.user.fullName,
        email: session.user.email,
        role: session.user.role,
        unitId: session.user.unitId,
        authenticated: true,
      };
    }
  }
  return {
    id: 'actor-system',
    name: 'Cán bộ nghiệp vụ',
    email: '',
    role: 'CITY_OFFICER',
    authenticated: false,
  };
}

export function requireAllowedRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const actor = resolveSessionActor(req);
    if (actor.authenticated && !allowedRoles.includes(actor.role)) {
      res.status(403).json({
        success: false,
        errorCode: 'FORBIDDEN_ROLE',
        code: 'FORBIDDEN_ROLE',
        error: `Vai trò "${actor.role}" không có thẩm quyền thực hiện thao tác này.`,
      });
      return;
    }
    next();
  };
}

export async function issueZeroTrustJwtToken(
  deps: { sessionService: SessionService; identityRepo: IIdentityRepository },
  params: {
    id: string;
    email: string;
    fullName: string;
    role: SystemRoleCode;
    institutionId?: string;
    unitId?: string;
    studentCode?: string;
  }
): Promise<{ userId: string; accessToken: string }> {
  try {
    let existing = await deps.identityRepo.findByEmail(params.email);
    if (!existing) {
      const passwordHash = await defaultPasswordHasher.hash('PortalAuthPass123!');
      if (params.role === 'STUDENT') {
        existing = await deps.identityRepo.createStudent({
          email: params.email,
          passwordHash,
          fullName: params.fullName,
          studentCode: params.studentCode || `SV-${Date.now().toString(36)}`,
          institutionId: params.institutionId || 'inst-dut',
        });
      } else {
        existing = await deps.identityRepo.createStaffUser({
          email: params.email,
          passwordHash,
          fullName: params.fullName,
          roleCode: params.role,
          institutionId: params.institutionId,
          schoolReviewUnitId: params.unitId,
          grantedByUserId: 'system-portal',
        });
      }
    }
    const tokens = await deps.sessionService.createSession(
      existing,
      [params.role],
      params.role,
      {},
      params.unitId
    );
    return { userId: existing.id, accessToken: tokens.accessToken };
  } catch {
    const fallbackToken = `v2-portal-token-${params.id}-${Date.now()}`;
    return { userId: params.id, accessToken: fallbackToken };
  }
}
