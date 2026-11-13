/**
 * 5TOT Đà Nẵng — Interactive Demo Mode Service Adapter
 * Implements DomainServicesBundle backed by isolated Demo Stores and Fixtures.
 * Works 100% offline/client-side without requiring a production backend connection.
 */

import type {
  DomainServicesBundle,
  AuthSessionPayload,
  CreateCollectivePayload,
  CreateSupplementRequestPayload,
  EvidenceUploadPayload,
  AuditLogRecord,
} from './contracts';
import {
  validateClientEvidenceFile,
  resolveCanonicalMimeType,
} from '../../shared/api/r2EvidenceClient';
import type {
  StaffRole,
  StaffApplicationRecord,
} from '../../staff/types';
import type {
  CollectiveApplication,
  CollectiveRequirementId,
} from '../../staff/collectiveTypes';
import { AUTHORIZED_COLLECTIVE_REGISTRY } from '../../staff/collectiveTypes';
import {
  STAFF_DEMO_USERS,
  CITY_REVIEW_OFFICERS,
  INITIAL_STAFF_APPLICATIONS,
} from '../../staff/fixtures/staffDataset';
import { INITIAL_STAFF_ACCOUNTS } from '../../staff/fixtures/admin/staffAccounts';
import {
  getAllCollectiveApplications,
  getCollectiveApplicationById,
  createCollectiveApplication,
  updateCollectiveBasicInfo,
  updateCollectiveRequirement,
  submitCollectiveDirectlyToCity,
  assignCityOfficer,
  addCollectiveEvidence,
  removeCollectiveEvidence,
  submitCollectiveSupplement,
  startCityReview,
  saveCityRequirementJudgment,
  saveCityEvidenceJudgment,
  completeCityReview,
  reopenCityReview,
  requestCollectiveSupplement,
  recordCollectiveCommitteeDecision,
  publishCollectiveResultRecord,
  reopenCollectiveCommitteeDecision,
} from '../../staff/collectiveStore';
import { getApplicationSchoolReviewUnitId } from '../../staff/schoolSelectors';
import {
  AUTHORITATIVE_SCHOOL_REVIEW_UNITS,
  resolveSchoolReviewUnit,
  SchoolForwardingBatchSummaryDto,
  SchoolForwardingBatchDto,
} from '../../staff/schoolReviewTypes';
import { STUDENT_APPLICATION_FIXTURE } from '../../demo/fixtures/studentApplication';
import type {
  StudentApplicationData,
  ApplicationEvidence,
  StudentProfileDto,
  UpdateStudentProfileInput,
  ProfileCompletenessResult,
} from '../application/studentApplicationTypes';
import {
  DEFAULT_CANONICAL_STUDENT_PROFILE,
  evaluateProfileCompleteness,
} from '../../demo/fixtures/studentProfileFixtures';

const DEMO_SEEDED_STUDENTS: Array<{
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
    institutionName: 'Trường Đại học Bách khoa - Đại học Đà Nẵng',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-dut-02',
    email: 'sv.dut@dut.udn.vn',
    fullName: 'Nguyễn Minh Anh',
    studentCode: '102220123',
    institutionId: 'inst-dut',
    institutionName: 'Trường Đại học Bách khoa - Đại học Đà Nẵng',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-due-01',
    email: 'sv.due@due.udn.vn',
    fullName: 'Lê Thị Bảo Ngọc',
    studentCode: '211121045120',
    institutionId: 'inst-due',
    institutionName: 'Trường Đại học Kinh tế - Đại học Đà Nẵng',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-ued-01',
    email: 'sv.ued@ued.udn.vn',
    fullName: 'Trần Quốc Bảo',
    studentCode: '3140122089',
    institutionId: 'inst-ued',
    institutionName: 'Trường Đại học Sư phạm - Đại học Đà Nẵng',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-ufl-01',
    email: 'sv.ufl@ufl.udn.vn',
    fullName: 'Phạm Ngọc Hà My',
    studentCode: '411220156',
    institutionId: 'inst-ufl',
    institutionName: 'Trường Đại học Ngoại ngữ - Đại học Đà Nẵng',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-ute-01',
    email: 'sv.ute@ute.udn.vn',
    fullName: 'Võ Văn Kiệt',
    studentCode: '221150531201',
    institutionId: 'inst-ute',
    institutionName: 'Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-vku-01',
    email: 'sv.vku@vku.udn.vn',
    fullName: 'Hoàng Gia Bảo',
    studentCode: '22IT088',
    institutionId: 'inst-vku',
    institutionName: 'Trường Đại học CNTT & Truyền thông Việt - Hàn - Đại học Đà Nẵng',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-smp-01',
    email: 'sv.smp@smp.udn.vn',
    fullName: 'Đặng Thùy Dương',
    studentCode: '21YK042',
    institutionId: 'inst-smp',
    institutionName: 'Trường Y Dược - Đại học Đà Nẵng',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-vnuk-01',
    email: 'sv.vnuk@vnuk.udn.vn',
    fullName: 'Phan Minh Khôi',
    studentCode: '22VNUK019',
    institutionId: 'inst-vnuk',
    institutionName: 'Viện Nghiên cứu & Đào tạo Việt - Anh - Đại học Đà Nẵng',
    unitId: 'unit-udn',
    unitLabel: 'Đại học Đà Nẵng',
  },
  {
    id: 'stu-dtu-01',
    email: 'sv.dtu@duytan.edu.vn',
    fullName: 'Trần Khánh Linh',
    studentCode: '2721120456',
    institutionId: 'inst-dtu',
    institutionName: 'Trường Đại học Duy Tân',
    unitId: 'unit-dtu',
    unitLabel: 'Trường Đại học Duy Tân',
  },
  {
    id: 'stu-donga-01',
    email: 'sv.donga@donga.edu.vn',
    fullName: 'Huỳnh Quốc Thịnh',
    studentCode: 'DA22CNTT08',
    institutionId: 'inst-donga',
    institutionName: 'Trường Đại học Đông Á',
    unitId: 'unit-donga',
    unitLabel: 'Trường Đại học Đông Á',
  },
  {
    id: 'stu-dau-01',
    email: 'sv.dau@dau.edu.vn',
    fullName: 'Ngô Minh Khang',
    studentCode: '22KT1042',
    institutionId: 'inst-dau',
    institutionName: 'Trường Đại học Kiến trúc Đà Nẵng',
    unitId: 'unit-dau',
    unitLabel: 'Trường Đại học Kiến trúc Đà Nẵng',
  },
  {
    id: 'stu-cdtm-01',
    email: 'sv.cdtm@cdtm.edu.vn',
    fullName: 'Phạm Thị Thanh Trúc',
    studentCode: 'CD23QT019',
    institutionId: 'inst-cd-thuongmai',
    institutionName: 'Trường Cao đẳng Thương mại',
    unitId: 'unit-cd-thuongmai',
    unitLabel: 'Trường Cao đẳng Thương mại',
  },
];

const LEGACY_UDN_DEMO_UNIT_IDS = new Set([
  'unit-dut',
  'unit-due',
  'unit-ued',
  'unit-ufl',
  'unit-ute',
  'unit-vku',
  'unit-smp',
  'unit-vnuk',
]);

function normalizeDemoUnitId(unitId?: string | null): string {
  if (!unitId) return 'unit-udn';
  if (LEGACY_UDN_DEMO_UNIT_IDS.has(unitId)) return 'unit-udn';
  return unitId;
}

let demoSchoolForwardingBatches = new Map<string, SchoolForwardingBatchDto>();

const DEMO_PROFILE_STORAGE_KEY = '5tot_demo_student_profile_v1';

function loadPersistedDemoProfile(): StudentProfileDto | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DEMO_PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StudentProfileDto;
  } catch {
    // ignore storage errors
  }
  return null;
}

function savePersistedDemoProfile(profile: StudentProfileDto): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage errors
  }
}

let activeDemoSession: AuthSessionPayload | null = null;
let demoStudentProfile: StudentProfileDto =
  loadPersistedDemoProfile() || structuredClone(DEFAULT_CANONICAL_STUDENT_PROFILE);
let demoRegisteredProfiles = new Map<string, StudentProfileDto>();
let demoRegisteredPasswords = new Map<string, string>();

export function setDemoAccountPassword(email: string, newPassword: string): void {
  if (!email || !newPassword) return;
  demoRegisteredPasswords.set(email.trim().toLowerCase(), newPassword);
}
let demoIndividualRecords: StaffApplicationRecord[] = [...INITIAL_STAFF_APPLICATIONS];
let demoStudentApps = new Map<string, StudentApplicationData>([
  [STUDENT_APPLICATION_FIXTURE.applicationId, structuredClone(STUDENT_APPLICATION_FIXTURE)],
]);
let demoEvidenceMap = new Map<string, ApplicationEvidence & { base64Content?: string }>();
let demoAuditLogs: AuditLogRecord[] = [];

function recordDemoAudit(entry: Omit<AuditLogRecord, 'id' | 'timestamp'>): void {
  demoAuditLogs.unshift({
    id: `demo-aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  });
}

const REQ_KEY_MAP: Record<CollectiveRequirementId, 'tt01' | 'tt02' | 'tt03' | 'tt04'> = {
  TT01: 'tt01',
  TT02: 'tt02',
  TT03: 'tt03',
  TT04: 'tt04',
};

export const demoServicesAdapter: DomainServicesBundle = {
  mode: 'DEMO',

  auth: {
    async loginWithCredentials({ email, password, preferredTrack }) {
      const normalized = email.trim().toLowerCase();

      const throwInvalidCredentials = (): never => {
        const err = new Error('Email hoặc mật khẩu chưa chính xác.') as Error & {
          status?: number;
          code?: string;
        };
        err.status = 401;
        err.code = 'INVALID_CREDENTIALS';
        throw err;
      };

      if (normalized === 'sai@example.com' || password === 'wrongpassword') {
        throwInvalidCredentials();
      }

      const hasPasswordInput = typeof password === 'string' && password.length > 0;

      // Check full Staff accounts list first (includes all School Officers across 24 review units)
      const matchedStaffAccount = INITIAL_STAFF_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === normalized && acc.status === 'active'
      );

      // Check canonical Staff demo users (including legacy aliases)
      const staffRoleEntry = (Object.entries(STAFF_DEMO_USERS) as [StaffRole, typeof STAFF_DEMO_USERS[StaffRole]][]).find(
        ([, user]) =>
          user.email.toLowerCase() === normalized ||
          (user.primaryRole === 'SCHOOL_OFFICER' &&
            [
              'canbo.udn@udn.vn',
              'canbo.dhdn@udn.vn',
              'canbo.dut@udn.vn',
              'canbo.due@udn.vn',
              'canbo.ued@udn.vn',
              'canbo.ufl@udn.vn',
              'canbo.ufls@udn.vn',
              'canbo.ute@udn.vn',
              'canbo.vku@udn.vn',
              'canbo.smp@udn.vn',
              'canbo.vnuk@udn.vn',
              'canbo.udck@udn.vn',
              'an.nv@udn.vn',
              'tien.nv@udn.vn',
            ].includes(normalized)) ||
          (user.primaryRole === 'CITY_OFFICER' &&
            (normalized === 'nam.th@hsvdanang.vn' ||
              normalized === 'canbo.thanhpho@hsvdanang.vn')) ||
          (user.primaryRole === 'CITY_MANAGER' &&
            (normalized === 'ha.nt@hsvdanang.vn' ||
              normalized === 'quanly.thanhpho@hsvdanang.vn' ||
              normalized === 'quanly.dhdn@udn.vn')) ||
          (user.primaryRole === 'CITY_COMMITTEE' &&
            (normalized === 'quan.lm@hsvdanang.vn' ||
              normalized === 'hoidong.thanhpho@hsvdanang.vn' ||
              normalized === 'hoidong.dhdn@udn.vn')) ||
          (user.primaryRole === 'ADMIN' &&
            (normalized === 'lan.pn@hsvdanang.vn' ||
              normalized === 'khoa.nd@hsvdanang.vn' ||
              normalized === 'admin@hsvdanang.vn' ||
              normalized === 'admin@udn.vn'))
      );

      if (matchedStaffAccount || staffRoleEntry) {
        const canonicalStaffEmail = (
          matchedStaffAccount?.email ||
          staffRoleEntry?.[1].email ||
          normalized
        ).toLowerCase();
        const expectedStaffPwd =
          demoRegisteredPasswords.get(normalized) ||
          demoRegisteredPasswords.get(canonicalStaffEmail) ||
          'MatKhau@2026';
        if (hasPasswordInput && password !== expectedStaffPwd) {
          throwInvalidCredentials();
        }
        if (matchedStaffAccount) {
          activeDemoSession = {
            authenticated: true,
            mode: 'DEMO',
            token: `demo-token-${matchedStaffAccount.id}`,
            accountType: 'STAFF',
            user: {
              id: matchedStaffAccount.id,
              fullName: matchedStaffAccount.fullName,
              email: matchedStaffAccount.email,
              role: matchedStaffAccount.primaryRole,
              roleLabel: matchedStaffAccount.roleLabel,
              unitId: matchedStaffAccount.schoolReviewUnitId,
              unitLabel: matchedStaffAccount.unitLabel,
            },
          };
          return activeDemoSession;
        }
        const [role, user] = staffRoleEntry!;
        activeDemoSession = {
          authenticated: true,
          mode: 'DEMO',
          token: `demo-token-${user.id}`,
          accountType: 'STAFF',
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role,
            roleLabel: user.roleLabel,
            unitId: user.schoolReviewUnitId,
            unitLabel: user.unitLabel,
          },
        };
        return activeDemoSession;
      }

      if (preferredTrack === 'STAFF') {
        throwInvalidCredentials();
      }

      // Check Authorized Collective Preparer
      const collectiveEntity = AUTHORIZED_COLLECTIVE_REGISTRY.find(
        (c) => c.authorizedPreparerEmail.toLowerCase() === normalized
      );
      if (collectiveEntity || preferredTrack === 'COLLECTIVE') {
        if (!collectiveEntity) {
          const err = new Error(
            'Tài khoản này chưa được cấp thẩm quyền lập hồ sơ Tập thể Sinh viên 5 tốt.'
          ) as Error & { status?: number; code?: string };
          err.status = 403;
          err.code = 'UNAUTHORIZED_COLLECTIVE_PREPARER';
          throw err;
        }
        const expectedColPwd =
          demoRegisteredPasswords.get(normalized) || 'MatKhau@2026';
        if (hasPasswordInput && password !== expectedColPwd) {
          throwInvalidCredentials();
        }
        const target = collectiveEntity;
        activeDemoSession = {
          authenticated: true,
          mode: 'DEMO',
          token: `demo-token-col-${target.id}`,
          accountType: 'COLLECTIVE_PREPARER',
          user: {
            id: `prep-${target.id}`,
            fullName: target.authorizedPreparerName,
            email: normalized || target.authorizedPreparerEmail,
            role: 'COLLECTIVE_PREPARER',
            roleLabel: 'Người lập hồ sơ Tập thể được phân quyền',
            unitId: target.schoolReviewUnitId,
            unitLabel: target.schoolReviewUnitName,
            institutionId: target.institutionId,
            institutionName: target.institutionName,
          },
        };
        return activeDemoSession;
      }

      // Check Seeded Multi-School Student or registered student
      const matchedStudent = DEMO_SEEDED_STUDENTS.find(
        (s) => s.email.toLowerCase() === normalized
      );
      const registeredProf = demoRegisteredProfiles.get(normalized);
      const isCanonicalDemoStudent =
        normalized === 'minhanh.nguyen@dut.udn.vn' ||
        normalized === 'minh.nv@dut.udn.vn' ||
        normalized === 'minhquan.tran@dut.udn.vn';

      if (!matchedStudent && !registeredProf && !isCanonicalDemoStudent) {
        throwInvalidCredentials();
      }

      if (hasPasswordInput) {
        const savedPwd = demoRegisteredPasswords.get(normalized);
        if (savedPwd) {
          if (savedPwd !== password) {
            throwInvalidCredentials();
          }
        } else if (!registeredProf && password !== 'MatKhau@2026') {
          throwInvalidCredentials();
        }
      }

      if (registeredProf) {
        demoStudentProfile = structuredClone(registeredProf);
        savePersistedDemoProfile(demoStudentProfile);
      } else if (
        normalized === 'minhanh.nguyen@dut.udn.vn' ||
        normalized === 'minh.nv@dut.udn.vn'
      ) {
        demoStudentProfile = {
          ...structuredClone(DEFAULT_CANONICAL_STUDENT_PROFILE),
          email: normalized,
        };
        savePersistedDemoProfile(demoStudentProfile);
      } else if (matchedStudent) {
        demoStudentProfile = {
          fullName: matchedStudent.fullName,
          gender: '',
          dateOfBirth: '',
          ethnicity: '',
          academicYearNumber: 0,
          educationLevel: matchedStudent.institutionId.startsWith('inst-cd-') ? 'Cao đẳng' : 'Đại học',
          className: '',
          homeProvince: '',
          institutionId: matchedStudent.institutionId,
          institutionName: matchedStudent.institutionName,
          unionPosition: '',
          politicalStatus: '' as any,
          phoneNumber: '',
          email: matchedStudent.email,
        };
        savePersistedDemoProfile(demoStudentProfile);
      }

      const resolvedInstId =
        registeredProf?.institutionId || matchedStudent?.institutionId || 'inst-dut';
      const resolvedUnit = resolveSchoolReviewUnit(resolvedInstId);

      activeDemoSession = {
        authenticated: true,
        mode: 'DEMO',
        token: `demo-token-student-${matchedStudent?.studentCode || '102220123'}`,
        accountType: 'STUDENT',
        user: {
          id: matchedStudent?.id || 'student-102220123',
          fullName:
            registeredProf?.fullName ||
            matchedStudent?.fullName ||
            STUDENT_APPLICATION_FIXTURE.student.fullName,
          email: normalized || 'minhanh.nguyen@dut.udn.vn',
          role: 'STUDENT',
          roleLabel: 'Sinh viên đăng ký xét chọn',
          studentCode: matchedStudent?.studentCode || STUDENT_APPLICATION_FIXTURE.student.studentId,
          institutionId: resolvedInstId,
          institutionName:
            registeredProf?.institutionName ||
            matchedStudent?.institutionName ||
            STUDENT_APPLICATION_FIXTURE.student.university,
          unitId: resolvedUnit.unit?.id || matchedStudent?.unitId || 'unit-udn',
          unitLabel: resolvedUnit.unit?.officialName || matchedStudent?.unitLabel || 'Đại học Đà Nẵng',
        },
      };
      return activeDemoSession;
    },

    async registerStudent({ fullName, email, studentCode, institutionId, institutionName, facultyDepartmentId, facultyName, password }) {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedCode = studentCode.trim().toUpperCase();

      if (normalizedEmail === 'da-ton-tai@dut.udn.vn') {
        const err = new Error('Email này đã được sử dụng.') as Error & {
          status?: number;
          code?: string;
        };
        err.status = 409;
        err.code = 'EMAIL_CONFLICT';
        throw err;
      }

      if (normalizedCode === 'TRUNG_MSSV') {
        const err = new Error('Mã số sinh viên này đã được sử dụng cho một tài khoản khác.') as Error & {
          status?: number;
          code?: string;
        };
        err.status = 409;
        err.code = 'STUDENT_CODE_CONFLICT';
        throw err;
      }

      const resolvedInstName = institutionName || 'Trường Đại học Bách khoa - Đại học Đà Nẵng';
      const resolvedUnit = resolveSchoolReviewUnit(institutionId);
      const freshProfile: StudentProfileDto = {
        fullName: fullName.trim(),
        studentCode: normalizedCode,
        gender: '',
        dateOfBirth: '',
        ethnicity: '',
        academicYearNumber: 0,
        educationLevel: institutionId.startsWith('inst-cd-') ? 'Cao đẳng' : '',
        className: '',
        homeProvince: '',
        institutionId,
        institutionName: resolvedInstName,
        facultyDepartmentId,
        faculty: facultyName,
        facultyName,
        unionPosition: '',
        politicalStatus: '' as any,
        phoneNumber: '',
        email: normalizedEmail,
      };
      demoStudentProfile = structuredClone(freshProfile);
      demoRegisteredProfiles.set(normalizedEmail, structuredClone(freshProfile));
      if (password) {
        demoRegisteredPasswords.set(normalizedEmail, password);
      }
      savePersistedDemoProfile(demoStudentProfile);

      activeDemoSession = {
        authenticated: true,
        mode: 'DEMO',
        token: `demo-token-student-${studentCode.trim()}`,
        accountType: 'STUDENT',
        user: {
          id: `student-${studentCode.trim()}`,
          fullName: fullName.trim(),
          email: normalizedEmail,
          role: 'STUDENT',
          roleLabel: 'Sinh viên đăng ký xét chọn',
          studentCode: studentCode.trim(),
          institutionId,
          institutionName: resolvedInstName,
          unitId: resolvedUnit.unit?.id || 'unit-udn',
          unitLabel: resolvedUnit.unit?.officialName || 'Đại học Đà Nẵng',
        },
      };
      return activeDemoSession;
    },

    async changePassword({ currentPassword, newPassword }) {
      if (!currentPassword) {
        const err = new Error('Vui lòng nhập mật khẩu hiện tại.') as Error & {
          status?: number;
          code?: string;
        };
        err.status = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
      }
      if (!newPassword || newPassword.length < 8) {
        const err = new Error('Mật khẩu mới phải có tối thiểu 8 ký tự.') as Error & {
          status?: number;
          code?: string;
        };
        err.status = 400;
        err.code = 'VALIDATION_ERROR';
        throw err;
      }
      if (newPassword === currentPassword) {
        const err = new Error('Mật khẩu mới phải khác mật khẩu hiện tại.') as Error & {
          status?: number;
          code?: string;
        };
        err.status = 400;
        err.code = 'PASSWORD_UNCHANGED';
        throw err;
      }

      const emailKey = (
        activeDemoSession?.user.email ||
        demoStudentProfile.email ||
        'minh.nv@dut.udn.vn'
      )
        .trim()
        .toLowerCase();
      const expectedPwd = demoRegisteredPasswords.get(emailKey) || 'MatKhau@2026';
      if (currentPassword !== expectedPwd) {
        const err = new Error('Mật khẩu hiện tại không chính xác.') as Error & {
          status?: number;
          code?: string;
        };
        err.status = 401;
        err.code = 'INVALID_CURRENT_PASSWORD';
        throw err;
      }

      demoRegisteredPasswords.set(emailKey, newPassword);
      recordDemoAudit({
        track:
          activeDemoSession?.accountType === 'COLLECTIVE_PREPARER'
            ? 'COLLECTIVE'
            : activeDemoSession?.accountType === 'STAFF'
            ? 'SYSTEM'
            : 'INDIVIDUAL',
        action: 'USER_CHANGE_PASSWORD',
        actorId: activeDemoSession?.user.id || 'demo-user',
        actorName: activeDemoSession?.user.fullName || demoStudentProfile.fullName,
        actorRole: activeDemoSession?.user.role || 'STUDENT',
        details: `Đổi mật khẩu tài khoản (${emailKey})`,
      });

      return {
        success: true,
        message: 'Đổi mật khẩu thành công.',
        session: activeDemoSession ?? undefined,
      };
    },

    async getCurrentSession() {
      return activeDemoSession;
    },

    async logout() {
      activeDemoSession = null;
    },
  },

  profile: {
    async getProfile() {
      const persisted = loadPersistedDemoProfile();
      if (persisted) {
        demoStudentProfile = persisted;
      }
      return {
        profile: structuredClone(demoStudentProfile),
        completeness: evaluateProfileCompleteness(demoStudentProfile),
      };
    },

    async updateProfile(input: UpdateStudentProfileInput, actor) {
      if (input.studentCode) {
        const normalizedCode = input.studentCode.trim().toUpperCase();
        if (normalizedCode === 'TRUNG_MSSV') {
          const err = new Error('Mã số sinh viên này đã được sử dụng cho một tài khoản khác.') as Error & {
            status?: number;
            code?: string;
          };
          err.status = 409;
          err.code = 'STUDENT_CODE_CONFLICT';
          throw err;
        }
      }
      demoStudentProfile = {
        ...demoStudentProfile,
        ...input,
        email: demoStudentProfile.email, // email is immutable
      };
      if (demoStudentProfile.email) {
        demoRegisteredProfiles.set(
          demoStudentProfile.email.toLowerCase(),
          structuredClone(demoStudentProfile)
        );
      }
      savePersistedDemoProfile(demoStudentProfile);
      const completeness = evaluateProfileCompleteness(demoStudentProfile);
      recordDemoAudit({
        track: 'INDIVIDUAL',
        action: 'UPDATE_STUDENT_PROFILE',
        actorId: actor?.id || (demoStudentProfile as any).studentCode || 'student-102220123',
        actorName: actor?.name || demoStudentProfile.fullName,
        actorRole: actor?.role || 'STUDENT',
        details: `Cập nhật thông tin cá nhân sinh viên (${completeness.completedFields}/${completeness.totalFields} trường đầy đủ)`,
      });
      return {
        profile: structuredClone(demoStudentProfile),
        completeness,
      };
    },
  },

  individual: {
    async listApplications() {
      return [...demoIndividualRecords];
    },

    async getStudentApplication(applicationId: string) {
      return demoStudentApps.get(applicationId) || structuredClone(STUDENT_APPLICATION_FIXTURE);
    },

    async getStaffApplicationRecord(applicationId: string) {
      return demoIndividualRecords.find((r) => r.applicationId === applicationId) || null;
    },

    async createStudentApplication(params) {
      const appId = `APP-2026-DN-${params.studentCode}`;
      const routing = resolveSchoolReviewUnit(params.institutionId);
      const created: StudentApplicationData = {
        ...structuredClone(STUDENT_APPLICATION_FIXTURE),
        applicationId: appId,
        status: 'draft',
        reviewStage: 'SCHOOL',
        trainingInstitutionName: params.institutionName,
        schoolReviewUnitId: routing.unit?.id || 'unit-udn',
        schoolReviewUnitName: routing.unit?.officialName || 'Đại học Đà Nẵng',
        schoolPreliminaryStatus: 'school_not_submitted',
        student: {
          fullName: params.studentFullName,
          studentId: params.studentCode,
          university: params.institutionName,
          faculty: params.faculty,
          class: params.className,
          email: params.email,
          academicYear: '2025–2026',
        },
      };
      demoStudentApps.set(appId, created);
      recordDemoAudit({
        track: 'INDIVIDUAL',
        applicationId: appId,
        action: 'CREATE_INDIVIDUAL_APPLICATION',
        actorId: params.studentCode,
        actorName: params.studentFullName,
        actorRole: 'STUDENT',
        details: `Khởi tạo hồ sơ cá nhân cho sinh viên ${params.studentFullName} (${params.studentCode})`,
      });
      return created;
    },

    async saveDeclaration({ applicationId, criterionId, requirementId, declaration, actor }) {
      const app =
        demoStudentApps.get(applicationId) || structuredClone(STUDENT_APPLICATION_FIXTURE);
      let updated: StudentApplicationData;
      if (
        (criterionId as string) === 'other_achievements' ||
        requirementId === 'other-achievements-general'
      ) {
        const currentOthers = Array.isArray(app.otherAchievements)
          ? [...app.otherAchievements]
          : [];
        const existingIdx = currentOthers.findIndex((d: any) => d.id === declaration.id);
        const nextOthers =
          existingIdx >= 0
            ? currentOthers.map((d: any, idx: number) => (idx === existingIdx ? declaration : d))
            : [...currentOthers, declaration];
        updated = { ...app, otherAchievements: nextOthers };
      } else {
        const nextCriteria = app.criteria.map((c: any) => {
          if (c.id !== criterionId) return c;
          const updateReqs = (reqs: any[]) =>
            reqs.map((r: any) => {
              if (r.id !== requirementId) return r;
              const existingIdx = r.declarations.findIndex((d: any) => d.id === declaration.id);
              const nextDecls =
                existingIdx >= 0
                  ? r.declarations.map((d: any, idx: number) => (idx === existingIdx ? declaration : d))
                  : [...r.declarations, declaration];
              return { ...r, declarations: nextDecls };
            });
          return {
            ...c,
            requirements: updateReqs(c.requirements),
            groups: c.groups.map((g: any) => ({ ...g, requirements: updateReqs(g.requirements) })),
          };
        });
        updated = { ...app, criteria: nextCriteria };
      }
      demoStudentApps.set(applicationId, updated);
      recordDemoAudit({
        track: 'INDIVIDUAL',
        applicationId,
        action: 'SAVE_INDIVIDUAL_DECLARATION',
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        details: `Lưu kê khai tiêu chí ${criterionId} - yêu cầu ${requirementId}`,
      });
      return updated;
    },

    async deleteDeclaration({ applicationId, requirementId, declarationId, actor }) {
      const app =
        demoStudentApps.get(applicationId) || structuredClone(STUDENT_APPLICATION_FIXTURE);
      const nextOthers = Array.isArray(app.otherAchievements)
        ? app.otherAchievements.filter((d: any) => d.id !== declarationId)
        : app.otherAchievements;
      const nextCriteria = app.criteria.map((c: any) => {
        const updateReqs = (reqs: any[]) =>
          reqs.map((r: any) => {
            if (r.id !== requirementId) return r;
            const nextDecls = (r.declarations || []).filter((d: any) => d.id !== declarationId);
            return {
              ...r,
              declarations: nextDecls,
              status: nextDecls.length > 0 ? r.status : 'undeclared',
              isOptionalEmpty: nextDecls.length === 0,
            };
          });
        return {
          ...c,
          requirements: updateReqs(c.requirements || []),
          groups: c.groups
            ? c.groups.map((g: any) => ({ ...g, requirements: updateReqs(g.requirements || []) }))
            : c.groups,
        };
      });
      const updated: StudentApplicationData = {
        ...app,
        criteria: nextCriteria,
        otherAchievements: nextOthers,
      };
      demoStudentApps.set(applicationId, updated);
      recordDemoAudit({
        track: 'INDIVIDUAL',
        applicationId,
        action: 'DELETE_INDIVIDUAL_DECLARATION',
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        details: `Xóa kê khai ${declarationId} - yêu cầu ${requirementId}`,
      });
      return updated;
    },

    async submitToSchoolReview({ applicationId, actor }) {
      const app =
        demoStudentApps.get(applicationId) || structuredClone(STUDENT_APPLICATION_FIXTURE);
      const snapshot = structuredClone(demoStudentProfile);
      const updated: StudentApplicationData = {
        ...app,
        status: 'under_review',
        reviewStage: 'SCHOOL',
        schoolPreliminaryStatus: 'school_submitted',
        applicantProfileSnapshot: snapshot,
      };
      demoStudentApps.set(applicationId, updated);
      const recIdx = demoIndividualRecords.findIndex((r) => r.applicationId === applicationId);
      if (recIdx >= 0) {
        demoIndividualRecords[recIdx] = {
          ...demoIndividualRecords[recIdx],
          applicantProfileSnapshot: snapshot,
          workflowStatus: 'under_review',
          studentApplication: updated,
        } as any;
      }
      recordDemoAudit({
        track: 'INDIVIDUAL',
        applicationId,
        action: 'SUBMIT_TO_SCHOOL_REVIEW',
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        details: `Nộp hồ sơ về đơn vị xét sơ tuyển: ${updated.schoolReviewUnitName || 'Đại học Đà Nẵng'}`,
      });
      return {
        success: true,
        message: 'Đã nộp hồ sơ về Đơn vị xét sơ tuyển thành công.',
        schoolReviewUnitId: updated.schoolReviewUnitId,
        schoolReviewUnitName: updated.schoolReviewUnitName,
        application: updated,
      };
    },

    async submitSupplementResponse({ applicationId, explanation, actor }) {
      const idx = demoIndividualRecords.findIndex((r) => r.applicationId === applicationId);
      if (idx === -1) {
        throw new Error(`Không tìm thấy hồ sơ cá nhân ${applicationId}`);
      }
      const current = demoIndividualRecords[idx];
      const updated: StaffApplicationRecord = {
        ...current,
        workflowStatus: 'supplement_returned',
        updatedAt: 'Vừa xong',
        latestOperationalNote: explanation,
        supplementSummary: {
          ...current.supplementSummary,
          activeStatus: 'student_returned',
          returnedDaysAgo: 0,
        },
      };
      demoIndividualRecords[idx] = updated;
      recordDemoAudit({
        track: 'INDIVIDUAL',
        applicationId,
        action: 'SUBMIT_INDIVIDUAL_SUPPLEMENT',
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        details: `Sinh viên gửi phản hồi bổ sung: ${explanation}`,
      });
      return updated;
    },
  },

  schoolReview: {
    async listSchoolQueue(unitId) {
      if (!unitId) return [...demoIndividualRecords];
      const effectiveUnitId = normalizeDemoUnitId(unitId);
      return demoIndividualRecords.filter(
        (r) => getApplicationSchoolReviewUnitId(r) === effectiveUnitId
      );
    },

    async recordSchoolCriterionJudgment({ applicationId, criterionId, status, note, actor }) {
      const idx = demoIndividualRecords.findIndex((r) => r.applicationId === applicationId);
      if (idx === -1) {
        throw new Error(`Không tìm thấy hồ sơ xét sơ tuyển ${applicationId}`);
      }
      const target = demoIndividualRecords[idx];
      const nextCriteria = target.criteriaReview.map((c) =>
        c.criterionId === criterionId ? { ...c, status, noteSummary: note || c.noteSummary } : c
      );
      const updated: StaffApplicationRecord = {
        ...target,
        criteriaReview: nextCriteria,
        reviewedCriteriaCount: nextCriteria.filter((c) => c.status === 'reviewed').length,
      };
      demoIndividualRecords[idx] = updated;
      recordDemoAudit({
        track: 'INDIVIDUAL',
        applicationId,
        action: 'SCHOOL_CRITERION_REVIEW',
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        details: `Xét sơ tuyển tiêu chí ${criterionId}: ${status}`,
      });
      return updated;
    },

    async completeSchoolPreliminaryReview({ applicationId, recommendation, summaryNote, actor }) {
      const idx = demoIndividualRecords.findIndex((r) => r.applicationId === applicationId);
      if (idx === -1) {
        throw new Error(`Không tìm thấy hồ sơ xét sơ tuyển ${applicationId}`);
      }
      const target = demoIndividualRecords[idx];
      const updated: StaffApplicationRecord = {
        ...target,
        schoolPreliminaryStatus:
          recommendation === 'recommended' ? 'recommended_forwarding' : 'not_recommended',
        schoolReviewSummary: {
          status:
            recommendation === 'recommended' ? 'recommended_forwarding' : 'not_recommended',
          schoolReviewUnitId: target.schoolReviewUnitId,
          schoolReviewUnitName: target.schoolReviewUnitName,
          recommendation,
          recommendationDate: new Date().toISOString(),
          recommendingOfficerId: actor.id,
          recommendingOfficerName: actor.name,
          isForwardedToCity: false,
          officerNotes: summaryNote,
          reviewedCriteriaCount: 5,
        },
        latestOperationalNote: summaryNote,
      };
      demoIndividualRecords[idx] = updated;
      recordDemoAudit({
        track: 'INDIVIDUAL',
        applicationId,
        action: 'COMPLETE_SCHOOL_REVIEW',
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        details: `Hoàn tất xét sơ tuyển: ${recommendation} — ${summaryNote}`,
      });
      return updated;
    },

    async forwardSchoolApplicationToCity({ applicationId, actor }) {
      const idx = demoIndividualRecords.findIndex((r) => r.applicationId === applicationId);
      if (idx === -1) {
        throw new Error(`Không tìm thấy hồ sơ xét sơ tuyển ${applicationId}`);
      }
      const target = demoIndividualRecords[idx];
      const now = new Date().toISOString();
      const updatedRecord: StaffApplicationRecord = {
        ...target,
        currentReviewStage: 'CITY',
        workflowStatus: 'unassigned',
        schoolPreliminaryStatus: 'forwarded_to_city',
        schoolReviewSummary: {
          ...(target.schoolReviewSummary || {
            recommendation: 'recommended',
            reviewedCriteriaCount: 5,
          }),
          status: 'forwarded_to_city',
          isForwardedToCity: true,
          forwardedAt: now,
          forwardedBy: actor.id,
          forwardedByName: actor.name,
        },
      };
      demoIndividualRecords[idx] = updatedRecord;
      return {
        success: true,
        message: 'Đã xác nhận và chuyển hồ sơ lên Hội Sinh viên Việt Nam TP. Đà Nẵng.',
        record: updatedRecord,
      };
    },

    async getSchoolForwardingBatchSummary(params) {
      const unitId = normalizeDemoUnitId(params?.actor?.unitId);
      const unitName =
        AUTHORITATIVE_SCHOOL_REVIEW_UNITS.find((u) => u.id === unitId)?.officialName ||
        'Đại học Đà Nẵng';
      const seasonId = params?.seasonId || 'season-2025-2026';
      const batchKey = `${unitId}:${seasonId}`;
      const existingBatch = demoSchoolForwardingBatches.get(batchKey);

      const apps = demoIndividualRecords.filter((r) => {
        const rUnit = resolveSchoolReviewUnit(r.institution.id);
        const effectiveUnitId = rUnit.resolved && rUnit.unit ? rUnit.unit.id : r.institution.id;
        return effectiveUnitId === unitId;
      });

      let reviewed = 0;
      let selected = 0;
      let notSelected = 0;
      let pending = 0;
      let withActiveSupplements = 0;

      const instMap = new Map<string, { id: string; name: string; total: number; selected: number; pending: number }>();

      for (const app of apps) {
        const instId = app.institution.id;
        const instName = app.institution.officialName;
        if (!instMap.has(instId)) {
          instMap.set(instId, { id: instId, name: instName, total: 0, selected: 0, pending: 0 });
        }
        const item = instMap.get(instId)!;
        item.total++;

        if (app.supplementSummary && app.supplementSummary.activeStatus) {
          withActiveSupplements++;
        }

        if (app.schoolPreliminaryStatus === 'forwarded_to_city') {
          reviewed++;
          selected++;
          item.selected++;
        } else if (app.schoolPreliminaryStatus === 'recommended_forwarding') {
          reviewed++;
          selected++;
          item.selected++;
        } else if (app.schoolPreliminaryStatus === 'not_recommended') {
          reviewed++;
          notSelected++;
        } else {
          pending++;
          item.pending++;
        }
      }

      const effectiveSelectedCount = existingBatch?.selectedApplicationIds
        ? existingBatch.selectedApplicationIds.length
        : selected;

      const blockingReasons: string[] = [];
      if (effectiveSelectedCount === 0) {
        blockingReasons.push('Chưa có hồ sơ nào được đơn vị đề xuất chuyển cấp Thành phố Đà Nẵng.');
      }
      if (!existingBatch?.decisionFileId) {
        blockingReasons.push('Chưa đính kèm tệp văn bản PDF đề nghị của đơn vị.');
      }
      if (withActiveSupplements > 0) {
        blockingReasons.push(`Còn ${withActiveSupplements} hồ sơ có yêu cầu bổ sung minh chứng chưa hoàn tất.`);
      }

      const isAlreadyForwarded = existingBatch?.status === 'FORWARDED';

      return {
        schoolReviewUnitId: unitId,
        schoolReviewUnitName: unitName,
        seasonId,
        seasonCode: seasonId.includes('2025') ? '2025–2026' : '2026–2027',
        totalApplicationsInScope: apps.length,
        reviewedApplicationsCount: reviewed,
        selectedApplicationsCount: effectiveSelectedCount,
        notSelectedApplicationsCount: notSelected,
        pendingReviewCount: pending,
        hasActiveSupplementsCount: withActiveSupplements,
        institutionBreakdown: Array.from(instMap.values()).map((v) => ({
          institutionId: v.id,
          institutionName: v.name,
          totalApplications: v.total,
          selectedCount: v.selected,
          pendingCount: v.pending,
        })),
        canForward: !isAlreadyForwarded && blockingReasons.length === 0,
        blockingReasons,
        isAlreadyForwarded,
        forwardedAt: existingBatch?.submittedAt,
        batchId: existingBatch?.id,
        attachedDecisionDocument: existingBatch?.decisionFileId
          ? {
              decisionNumber: existingBatch.decisionNumber || undefined,
              decisionTitle: existingBatch.decisionTitle || undefined,
              decisionDate: existingBatch.decisionDate || undefined,
              signedByName: existingBatch.signedByName || undefined,
              signedByTitle: existingBatch.signedByTitle || undefined,
              fileId: existingBatch.decisionFileId || '',
              fileName: existingBatch.decisionFileName || '',
              fileSize: existingBatch.decisionFileSize || 0,
              fileUrl: existingBatch.decisionFileUrl,
            }
          : undefined,
      };
    },

    async getSchoolForwardingBatch(params) {
      const unitId = normalizeDemoUnitId(params?.actor?.unitId);
      const seasonId = params?.seasonId || 'season-2025-2026';
      const batchKey = `${unitId}:${seasonId}`;
      return demoSchoolForwardingBatches.get(batchKey) || null;
    },

    async saveSchoolForwardingBatchDraft({ seasonId = 'season-2025-2026', selectedApplicationIds, forwardingNote, decisionMetadata, actor }) {
      const unitId = normalizeDemoUnitId(actor.unitId);
      const unitName =
        AUTHORITATIVE_SCHOOL_REVIEW_UNITS.find((u) => u.id === unitId)?.officialName ||
        'Đại học Đà Nẵng';
      const batchKey = `${unitId}:${seasonId}`;
      let batch = demoSchoolForwardingBatches.get(batchKey);

      if (batch && batch.status === 'FORWARDED') {
        throw new Error('BATCH_ALREADY_FORWARDED: Đơn vị đã chốt và chuyển danh sách lên cấp Thành phố Đà Nẵng. Không thể chỉnh sửa sau khi đã gửi.');
      }

      for (const appId of selectedApplicationIds) {
        const app = demoIndividualRecords.find((r) => r.applicationId === appId);
        if (app) {
          const rUnit = resolveSchoolReviewUnit(app.institution.id);
          const effectiveUnitId = rUnit.resolved && rUnit.unit ? rUnit.unit.id : app.institution.id;
          if (effectiveUnitId !== unitId) {
            throw new Error(`APPLICATION_NOT_IN_SCOPE: Hồ sơ ${appId} không thuộc thẩm quyền của đơn vị.`);
          }
        }
      }

      const now = new Date().toISOString();
      if (!batch) {
        batch = {
          id: `batch-${unitId}-${Date.now().toString(36)}`,
          seasonId,
          schoolReviewUnitId: unitId,
          schoolReviewUnitName: unitName,
          status: 'DRAFT',
          selectedApplicationIds,
          applicationCount: selectedApplicationIds.length,
          forwardingNote,
          decisionNumber: decisionMetadata?.decisionNumber,
          decisionTitle: decisionMetadata?.decisionTitle,
          decisionDate: decisionMetadata?.decisionDate,
          signedByName: decisionMetadata?.signedByName,
          signedByTitle: decisionMetadata?.signedByTitle,
          version: 1,
          createdAt: now,
          updatedAt: now,
        };
      } else {
        batch.selectedApplicationIds = selectedApplicationIds;
        batch.applicationCount = selectedApplicationIds.length;
        batch.forwardingNote = forwardingNote ?? batch.forwardingNote;
        if (decisionMetadata) {
          batch.decisionNumber = decisionMetadata.decisionNumber ?? batch.decisionNumber;
          batch.decisionTitle = decisionMetadata.decisionTitle ?? batch.decisionTitle;
          batch.decisionDate = decisionMetadata.decisionDate ?? batch.decisionDate;
          batch.signedByName = decisionMetadata.signedByName ?? batch.signedByName;
          batch.signedByTitle = decisionMetadata.signedByTitle ?? batch.signedByTitle;
        }
        batch.version += 1;
        batch.updatedAt = now;
      }

      demoSchoolForwardingBatches.set(batchKey, batch);
      recordDemoAudit({
        track: 'INDIVIDUAL',
        action: 'SAVE_SCHOOL_FORWARDING_BATCH_DRAFT',
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        details: `Lưu dự thảo đợt chuyển danh sách cấp Trường (${selectedApplicationIds.length} hồ sơ).`,
      });

      return batch;
    },

    async attachSchoolDecisionDocument({ seasonId = 'season-2025-2026', decisionNumber, decisionTitle, decisionDate, signedByName, signedByTitle, fileId, fileName, fileSize, fileUrl, actor }) {
      const unitId = normalizeDemoUnitId(actor.unitId);
      const unitName =
        AUTHORITATIVE_SCHOOL_REVIEW_UNITS.find((u) => u.id === unitId)?.officialName ||
        'Đại học Đà Nẵng';
      const batchKey = `${unitId}:${seasonId}`;
      let batch = demoSchoolForwardingBatches.get(batchKey);

      if (batch && batch.status === 'FORWARDED') {
        throw new Error('BATCH_ALREADY_FORWARDED: Đơn vị đã chốt và chuyển danh sách lên cấp Thành phố Đà Nẵng. Quyết định đã được đóng băng.');
      }

      if (!fileId) {
        throw new Error('INVALID_DECISION_DOC_INPUT: Tệp đính kèm văn bản quyết định là bắt buộc.');
      }

      if (fileName && !fileName.toLowerCase().endsWith('.pdf')) {
        throw new Error('Văn bản đính kèm bắt buộc phải là định dạng PDF (.pdf)');
      }

      const now = new Date().toISOString();
      if (!batch) {
        batch = {
          id: `batch-${unitId}-${Date.now().toString(36)}`,
          seasonId,
          schoolReviewUnitId: unitId,
          schoolReviewUnitName: unitName,
          status: 'DRAFT',
          selectedApplicationIds: [],
          applicationCount: 0,
          decisionNumber,
          decisionTitle,
          decisionDate,
          signedByName,
          signedByTitle,
          decisionFileId: fileId,
          decisionFileName: fileName,
          decisionFileSize: fileSize,
          decisionFileUrl: fileUrl,
          version: 1,
          createdAt: now,
          updatedAt: now,
        };
      } else {
        batch.decisionNumber = decisionNumber ?? batch.decisionNumber;
        batch.decisionTitle = decisionTitle ?? batch.decisionTitle;
        batch.decisionDate = decisionDate ?? batch.decisionDate;
        batch.signedByName = signedByName ?? batch.signedByName;
        batch.signedByTitle = signedByTitle ?? batch.signedByTitle;
        batch.decisionFileId = fileId;
        batch.decisionFileName = fileName;
        batch.decisionFileSize = fileSize;
        batch.decisionFileUrl = fileUrl;
        batch.version += 1;
        batch.updatedAt = now;
      }

      demoSchoolForwardingBatches.set(batchKey, batch);
      recordDemoAudit({
        track: 'INDIVIDUAL',
        action: 'ATTACH_SCHOOL_DECISION_DOCUMENT',
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        details: `Đính kèm văn bản quyết định đề xuất (${fileName}).`,
      });

      return batch;
    },

    async confirmSchoolForwardingBatch({ seasonId = 'season-2025-2026', idempotencyKey, forwardingNote, actor }) {
      const unitId = normalizeDemoUnitId(actor.unitId);
      const batchKey = `${unitId}:${seasonId}`;
      const batch = demoSchoolForwardingBatches.get(batchKey);

      if (!batch) {
        throw new Error('BATCH_NOT_FOUND: Chưa khởi tạo danh sách đề xuất chuyển cấp Thành phố Đà Nẵng.');
      }

      if (batch.status === 'FORWARDED') {
        if (idempotencyKey && batch.idempotencyKey === idempotencyKey) {
          return {
            success: true,
            message: `Danh sách đợt đề xuất đã được chuyển thành công trước đó (idempotent).`,
            data: batch,
          };
        }
        throw new Error('BATCH_ALREADY_FORWARDED: Danh sách đề xuất của đơn vị đã được chuyển lên cấp Thành phố Đà Nẵng trước đó. Mỗi đơn vị chỉ được chuyển 01 lần duy nhất trong mùa xét.');
      }

      if (!batch.selectedApplicationIds || batch.selectedApplicationIds.length === 0) {
        throw new Error('EMPTY_SELECTION_LIST: Danh sách đề xuất chuyển cấp Thành phố Đà Nẵng không được để trống.');
      }

      if (!batch.decisionFileId) {
        throw new Error('MISSING_DECISION_DOCUMENT: Bắt buộc phải đính kèm tệp văn bản PDF đề nghị của đơn vị trước khi chuyển danh sách lên cấp Thành phố Đà Nẵng.');
      }

      const now = new Date().toISOString();
      batch.status = 'FORWARDED';
      batch.submittedAt = now;
      batch.submittedByUserId = actor.id;
      batch.submittedByName = actor.name;
      if (forwardingNote) batch.forwardingNote = forwardingNote;
      if (idempotencyKey) batch.idempotencyKey = idempotencyKey;
      batch.version += 1;
      batch.updatedAt = now;

      let transitionedCount = 0;
      for (const appId of batch.selectedApplicationIds) {
        const idx = demoIndividualRecords.findIndex((r) => r.applicationId === appId);
        if (idx !== -1) {
          const current = demoIndividualRecords[idx];
          demoIndividualRecords[idx] = {
            ...current,
            currentReviewStage: 'CITY',
            schoolPreliminaryStatus: 'forwarded_to_city',
            workflowStatus: 'unassigned',
            assignment: null,
            reviewedCriteriaCount: 0,
            criteriaReview: current.criteriaReview.map((c) => ({
              ...c,
              status: 'not_reviewed',
              noteSummary: undefined,
            })),
            latestOperationalNote: `Đã chuyển theo Quyết định ${batch.decisionNumber} từ ${
              current.schoolReviewUnitName || batch.schoolReviewUnitName || 'Đại học Đà Nẵng'
            } lên Hội Sinh viên Việt Nam TP. Đà Nẵng (${now}).`,
          };
          transitionedCount++;
        }
      }

      recordDemoAudit({
        track: 'INDIVIDUAL',
        action: 'CONFIRM_ONE_TIME_SCHOOL_FORWARDING_BATCH',
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        details: `Chốt và chuyển chính thức đợt ${batch.id} gồm ${transitionedCount} hồ sơ lên Hội Sinh viên Việt Nam TP. Đà Nẵng theo QĐ số ${batch.decisionNumber}.`,
      });

      return {
        success: true,
        message: `Đã chốt và chuyển thành công ${transitionedCount} hồ sơ lên Hội Sinh viên Việt Nam TP. Đà Nẵng.`,
        data: batch,
      };
    },

    async listIncomingForwardedBatchesForCity(params) {
      const seasonId = params?.seasonId;
      const batches = Array.from(demoSchoolForwardingBatches.values()).filter(
        (b) => b.status === 'FORWARDED' && (!seasonId || b.seasonId === seasonId)
      );
      return batches;
    },
  },

  collective: {
    async listApplications() {
      return getAllCollectiveApplications();
    },

    async getApplicationById(id: string) {
      return getCollectiveApplicationById(id) || null;
    },

    async createApplication(payload: CreateCollectivePayload) {
      return createCollectiveApplication(payload);
    },

    async updateBasicInfo(id: string, payload: any) {
      updateCollectiveBasicInfo(id, payload, payload.actor);
      return getCollectiveApplicationById(id)!;
    },

    async updateDeclaration(
      id: string,
      requirementId: CollectiveRequirementId,
      data: Record<string, unknown>,
      actor?: any
    ) {
      const keyMap: Record<CollectiveRequirementId, 'tt01' | 'tt02' | 'tt03' | 'tt04'> = {
        TT01: 'tt01',
        TT02: 'tt02',
        TT03: 'tt03',
        TT04: 'tt04',
      };
      updateCollectiveRequirement(id, keyMap[requirementId], data as any, actor);
      return getCollectiveApplicationById(id)!;
    },

    async saveMembersRoster(
      id: string,
      requirementId: 'TT02' | 'TT03',
      members: any[],
      actor?: any
    ) {
      const keyMap: Record<'TT02' | 'TT03', 'tt02' | 'tt03'> = {
        TT02: 'tt02',
        TT03: 'tt03',
      };
      updateCollectiveRequirement(id, keyMap[requirementId], { structuredMembers: members } as any, actor);
      return getCollectiveApplicationById(id)!;
    },

    async submitDirectlyToCity(id: string, actor: any) {
      const res = submitCollectiveDirectlyToCity(
        id,
        actor || { name: 'Người lập hồ sơ', role: 'COLLECTIVE_PREPARER' }
      );
      return {
        success: res.success,
        message: res.message,
        destination: 'Hội Sinh viên Việt Nam Thành phố Đà Nẵng',
        data: res.application || getCollectiveApplicationById(id) || null,
      };
    },

    async submitSupplementResponse(params: {
      applicationId: string;
      requirementId: CollectiveRequirementId;
      files: ApplicationEvidence[];
      notes: string;
      actor: any;
    }) {
      submitCollectiveSupplement(
        params.applicationId,
        params.requirementId,
        params.files,
        params.notes,
        params.actor || { name: 'Người nộp bổ sung' }
      );
      return getCollectiveApplicationById(params.applicationId)!;
    },
  },

  cityAssignment: {
    async assignIndividualOfficer({ applicationId, officerId, actor }) {
      const app =
        demoIndividualRecords.find((a) => a.applicationId === applicationId) ||
        INITIAL_STAFF_APPLICATIONS.find((a) => a.applicationId === applicationId);
      if (!app) throw new Error(`Không tìm thấy hồ sơ ${applicationId}`);
      const officer = CITY_REVIEW_OFFICERS.find((o) => o.id === officerId) || {
        id: officerId,
        fullName: 'Cán bộ thẩm định',
        email: 'officer@danang.gov.vn',
      };
      app.assignment = {
        applicationId,
        officerId: officer.id,
        officerName: officer.fullName,
        assignedAt: new Date().toISOString(),
        assignedBy: actor.name,
        status: 'not_started',
      };
      if (app.workflowStatus === 'unassigned') {
        app.workflowStatus = 'assigned_not_started';
      }
      return app;
    },

    async assignCollectiveOfficer({
      applicationId,
      officerId,
      assignmentNote,
      reassignmentReason,
      actor,
    }) {
      const officer = CITY_REVIEW_OFFICERS.find((o) => o.id === officerId) || {
        id: officerId,
        fullName: 'Cán bộ thẩm định',
        email: 'officer@danang.gov.vn',
      };
      const res = assignCityOfficer(
        applicationId,
        officer.id,
        officer.fullName,
        { name: actor.name, role: actor.role },
        assignmentNote,
        reassignmentReason
      );
      return {
        success: res.success,
        message: res.message,
        isReassignment: res.isReassignment,
        data: res.application || getCollectiveApplicationById(applicationId) || null,
      };
    },
  },

  cityOfficerReview: {
    async startCollectiveReview(applicationId, actor) {
      startCityReview(applicationId, { name: actor.name, role: actor.role });
      const updated = getCollectiveApplicationById(applicationId);
      if (!updated) throw new Error(`Không tìm thấy hồ sơ tập thể ${applicationId}`);
      return updated;
    },

    async saveCollectiveRequirementJudgment({
      applicationId,
      requirementId,
      judgment,
      notes,
      actor,
    }) {
      const ok = saveCityRequirementJudgment(applicationId, requirementId, judgment, notes, {
        name: actor.name,
        role: actor.role,
      });
      if (!ok) throw new Error(`Không tìm thấy hồ sơ tập thể ${applicationId}`);
      return getCollectiveApplicationById(applicationId)!;
    },

    async saveCollectiveEvidenceJudgment({
      applicationId,
      requirementId,
      evidenceId,
      status,
      notes,
      actor,
    }) {
      const ok = saveCityEvidenceJudgment(
        applicationId,
        requirementId,
        evidenceId,
        status,
        notes,
        { name: actor.name, role: actor.role }
      );
      if (!ok) throw new Error(`Không tìm thấy hồ sơ tập thể ${applicationId}`);
      return getCollectiveApplicationById(applicationId)!;
    },

    async requestCollectiveSupplement(applicationId, payload: CreateSupplementRequestPayload) {
      requestCollectiveSupplement(
        applicationId,
        payload.requirementId,
        payload.reason,
        { id: payload.actor.id, name: payload.actor.name, role: payload.actor.role },
        {
          deadline: payload.deadline,
          scopeType: payload.scopeType,
          targetDeclarationField: payload.targetDeclarationField,
          targetEvidenceId: payload.targetEvidenceId,
          targetEvidenceName: payload.targetEvidenceName,
          allowedActions: payload.allowedActions,
        }
      );
      const updated = getCollectiveApplicationById(applicationId);
      if (!updated) throw new Error(`Không tìm thấy hồ sơ tập thể ${applicationId}`);
      return updated;
    },

    async completeCollectiveReview({ applicationId, summaryNote, actor }) {
      const res = completeCityReview(applicationId, summaryNote, {
        name: actor.name,
        role: actor.role,
      });
      return {
        success: res.success,
        message: res.message,
        data: getCollectiveApplicationById(applicationId) || null,
      };
    },

    async reopenCollectiveReview({ applicationId, reason, actor }) {
      const res = reopenCityReview(applicationId, reason, {
        name: actor.name,
        role: actor.role,
      });
      return {
        success: res.success,
        message: res.message,
        data: getCollectiveApplicationById(applicationId) || null,
      };
    },
  },

  committeeDecision: {
    async recordIndividualDecision({ applicationId, outcome, internalNote, actor }) {
      const idx = demoIndividualRecords.findIndex((r) => r.applicationId === applicationId);
      if (idx === -1) throw new Error(`Không tìm thấy hồ sơ cá nhân ${applicationId}`);
      const current = demoIndividualRecords[idx];
      const updated: StaffApplicationRecord = {
        ...current,
        workflowStatus: 'ready_for_finalization',
        finalResultSummary: {
          isPublished: false,
          outcome,
        },
        latestOperationalNote: internalNote || current.latestOperationalNote,
      };
      demoIndividualRecords[idx] = updated;
      recordDemoAudit({
        track: 'INDIVIDUAL',
        applicationId,
        action: 'COMMITTEE_INDIVIDUAL_DECISION',
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        details: `Hội đồng ghi nhận kết luận: ${outcome}`,
      });
      return updated;
    },

    async publishIndividualResults({ decisionNumber, actor }) {
      let publishedCount = 0;
      const now = new Date().toISOString();
      demoIndividualRecords = demoIndividualRecords.map((r) => {
        if (r.finalResultSummary?.outcome) {
          publishedCount++;
          return {
            ...r,
            workflowStatus:
              r.finalResultSummary.outcome === 'recognized'
                ? 'finalized_recognized'
                : 'finalized_not_recognized',
            finalResultSummary: {
              ...r.finalResultSummary,
              isPublished: true,
              decisionNumber,
              publishedAt: now,
            },
          };
        }
        return r;
      });
      recordDemoAudit({
        track: 'INDIVIDUAL',
        action: 'PUBLISH_INDIVIDUAL_RESULTS',
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        details: `Công bố ${publishedCount} kết quả cá nhân theo QĐ ${decisionNumber}`,
      });
      return { publishedCount, decisionNumber };
    },

    async recordCollectiveDecision({ applicationId, outcome, notes, actor }) {
      const res = recordCollectiveCommitteeDecision(applicationId, outcome, notes || '', {
        name: actor.name,
        role: actor.role,
      });
      return {
        success: res.success,
        message: res.message,
        data: getCollectiveApplicationById(applicationId) || null,
      };
    },

    async publishCollectiveResult({ applicationId, decisionNumber, decisionDate, actor }) {
      const res = publishCollectiveResultRecord(
        applicationId,
        decisionNumber,
        decisionDate || new Date().toLocaleDateString('vi-VN'),
        { name: actor.name, role: actor.role }
      );
      return {
        success: res.success,
        message: res.message,
        data: getCollectiveApplicationById(applicationId) || null,
      };
    },

    async reopenCollectiveDecision({ applicationId, reason, actor }) {
      const res = reopenCollectiveCommitteeDecision(applicationId, reason, {
        name: actor.name,
        role: actor.role,
      });
      return {
        success: res.success,
        message: res.message,
        data: getCollectiveApplicationById(applicationId) || null,
      };
    },
  },

  evidenceStorage: {
    async uploadEvidence(payload: EvidenceUploadPayload) {
      payload.onStateChange?.('VALIDATING');
      const mime = resolveCanonicalMimeType(payload.fileName, payload.mimeType || payload.fileType);
      validateClientEvidenceFile(payload.fileName, mime, payload.fileSizeBytes);

      const ext = payload.fileName.split('.').pop()?.toLowerCase() || 'pdf';
      const sizeKb = Math.max(1, Math.round(payload.fileSizeBytes / 1024));
      const sizeLabel =
        sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
      const evidence: ApplicationEvidence = {
        id: `ev-demo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: payload.fileName,
        fileType: ext,
        size: sizeLabel,
        uploadedAt: new Date().toLocaleDateString('vi-VN'),
        status: 'achieved' as ApplicationEvidence['status'],
        url: payload.base64Content || `#demo-evidence-${payload.fileName}`,
      };
      demoEvidenceMap.set(evidence.id, { ...evidence, base64Content: payload.base64Content });

      if (payload.ownerTrack === 'COLLECTIVE') {
        addCollectiveEvidence(
          payload.applicationId,
          payload.requirementOrCriterionId as CollectiveRequirementId,
          evidence
        );
      }
      payload.onStateChange?.('CLEAN');
      return evidence;
    },

    async uploadEvidenceViaR2(payload: EvidenceUploadPayload) {
      return this.uploadEvidence(payload);
    },

    async getEvidenceById(evidenceId: string) {
      return demoEvidenceMap.get(evidenceId) || null;
    },

    async getViewUrl(evidenceId: string) {
      const found = demoEvidenceMap.get(evidenceId);
      return {
        evidenceObjectId: evidenceId,
        viewUrl: found?.url || `#demo-view-${evidenceId}`,
        expiresInSeconds: 120,
        fileName: found?.name || 'minh-chung.pdf',
        mimeType: resolveCanonicalMimeType(found?.name || 'minh-chung.pdf', found?.fileType),
        cacheControl: 'private, max-age=3600, immutable',
      };
    },

    async getBatchViewUrls(evidenceIds: string[]) {
      return Promise.all(evidenceIds.map((id) => this.getViewUrl(id)));
    },

    async retryUploadIntent(evidenceId: string) {
      return {
        evidenceObjectId: evidenceId,
        uploadUrl: `#demo-retry-put-${evidenceId}`,
        objectKey: `evidence/demo/${evidenceId}`,
        expiresInSeconds: 300,
      };
    },

    async deleteEvidence({ ownerTrack, applicationId, requirementId, evidenceId }) {
      demoEvidenceMap.delete(evidenceId);
      if (ownerTrack === 'COLLECTIVE') {
        removeCollectiveEvidence(
          applicationId,
          requirementId as CollectiveRequirementId,
          evidenceId
        );
      }
    },
  },

  auditAndSystem: {
    async getHealth() {
      return {
        status: 'ok',
        mode: 'DEMO',
        timestamp: new Date().toISOString(),
      };
    },

    async listAuditLogs(filter) {
      return demoAuditLogs.filter((log) => {
        if (filter?.applicationId && log.applicationId !== filter.applicationId) return false;
        if (filter?.track && log.track !== filter.track) return false;
        return true;
      });
    },
  },
};

export function resetDemoBatchState(): void {
  demoSchoolForwardingBatches.clear();
  demoIndividualRecords = structuredClone(INITIAL_STAFF_APPLICATIONS);
}
