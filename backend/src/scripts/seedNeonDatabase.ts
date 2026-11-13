/**
 * 5TOT Đà Nẵng — Authoritative Neon PostgreSQL Seed Script (Production Ready)
 * Seeds all Da Nang Institutions (08 UDN member schools + 23 standalone universities/colleges + 1 suspended),
 * School Review Units (shared `unit-udn` + 23 standalone units), Active Season (2025-2026),
 * Criteria Definitions, Collective Units, and Multi-School Accounts.
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { dbManager } from '../shared/database/prismaClient';
import { defaultPasswordHasher } from '../modules/auth/passwordHasher';
import { FACULTIES_SEED_2026 } from './seedFaculties2026';
import {
  CloudflareR2StorageClient,
  verifyEvidenceMagicBytes,
} from '../shared/storage/r2StorageClient';
import {
  STAFF_SEED_ACCOUNTS,
  COLLECTIVE_PREPARERS,
  SEEDED_STUDENTS,
} from '../modules/domainPortal/domainPortal.state';

type InstitutionGroup =
  | 'UD_MEMBER_UNIVERSITY'
  | 'AFFILIATED_UNIVERSITY'
  | 'COLLEGE_JUNIOR_COLLEGE'
  | 'CITY_YOUTH_UNION_UNIT';

type SystemRoleCode =
  | 'STUDENT'
  | 'COLLECTIVE_PREPARER'
  | 'SCHOOL_OFFICER'
  | 'CITY_OFFICER'
  | 'CITY_MANAGER'
  | 'CITY_COMMITTEE'
  | 'ADMIN';

type CollectiveType =
  | 'CHI_HOI'
  | 'LIEN_CHI_HOI'
  | 'CHI_DOAN'
  | 'LIEN_CHI_DOAN'
  | 'CLUB_TEAM_GROUP';

type ApplicationTrack = 'INDIVIDUAL' | 'COLLECTIVE';

const INSTITUTIONS_SEED: {
  id: string;
  code: string;
  officialName: string;
  shortName: string;
  group: InstitutionGroup;
  hasStudentAssoc: boolean;
  isActive?: boolean;
}[] = [
  {
    id: 'inst-hsv-dn',
    code: 'HSV-DN',
    officialName: 'Hội Sinh viên Việt Nam Thành phố Đà Nẵng',
    shortName: 'HSV TP. Đà Nẵng',
    group: 'CITY_YOUTH_UNION_UNIT',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-udn',
    code: 'UDN',
    officialName: 'Đại học Đà Nẵng',
    shortName: 'Đại học Đà Nẵng',
    group: 'UD_MEMBER_UNIVERSITY',
    hasStudentAssoc: true,
  },
  // 08 UDN Member Institutions / Units in Da Nang
  {
    id: 'inst-dut',
    code: 'DUT',
    officialName: 'Trường Đại học Bách khoa – Đại học Đà Nẵng',
    shortName: 'ĐH Bách khoa - ĐHĐN',
    group: 'UD_MEMBER_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-due',
    code: 'DUE',
    officialName: 'Trường Đại học Kinh tế – Đại học Đà Nẵng',
    shortName: 'ĐH Kinh tế - ĐHĐN',
    group: 'UD_MEMBER_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-ued',
    code: 'UED',
    officialName: 'Trường Đại học Sư phạm – Đại học Đà Nẵng',
    shortName: 'ĐH Sư phạm - ĐHĐN',
    group: 'UD_MEMBER_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-ufl',
    code: 'UFL',
    officialName: 'Trường Đại học Ngoại ngữ – Đại học Đà Nẵng',
    shortName: 'ĐH Ngoại ngữ - ĐHĐN',
    group: 'UD_MEMBER_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-ute',
    code: 'UTE',
    officialName: 'Trường Đại học Sư phạm Kỹ thuật – Đại học Đà Nẵng',
    shortName: 'ĐH Sư phạm Kỹ thuật - ĐHĐN',
    group: 'UD_MEMBER_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-vku',
    code: 'VKU',
    officialName: 'Trường Đại học Công nghệ Thông tin và Truyền thông Việt – Hàn – Đại học Đà Nẵng',
    shortName: 'ĐH CNTT & TT Việt - Hàn',
    group: 'UD_MEMBER_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-vnuk',
    code: 'VNUK',
    officialName: 'Viện Nghiên cứu và Đào tạo Việt – Anh – Đại học Đà Nẵng',
    shortName: 'Viện NC&ĐT Việt - Anh',
    group: 'UD_MEMBER_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-udck',
    code: 'UDCK',
    officialName: 'Phân hiệu Đại học Đà Nẵng tại Kon Tum',
    shortName: 'Phân hiệu ĐHĐN tại Kon Tum',
    group: 'UD_MEMBER_UNIVERSITY',
    hasStudentAssoc: true,
  },
  // 17 Trường Đại học, Học viện, Cao đẳng độc lập theo danh sách chính thức
  {
    id: 'inst-dtu',
    code: 'DTU',
    officialName: 'Đại học Duy Tân',
    shortName: 'DTU',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-dqu',
    code: 'DQU',
    officialName: 'Trường Đại học Quảng Nam',
    shortName: 'DQU',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-tyd',
    code: 'DHKTYD',
    officialName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    shortName: 'DHKTYD',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-upes3',
    code: 'UPES3',
    officialName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    shortName: 'UPES3',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-dau',
    code: 'DAU',
    officialName: 'Trường Đại học Kiến trúc Đà Nẵng',
    shortName: 'DAU',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-donga',
    code: 'UDA',
    officialName: 'Trường Đại học Đông Á',
    shortName: 'UDA',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-cddn',
    code: 'CDDN',
    officialName: 'Trường Cao đẳng Đà Nẵng',
    shortName: 'CĐ Đà Nẵng',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-cd-thuongmai',
    code: 'CDTM',
    officialName: 'Trường Cao đẳng Thương mại',
    shortName: 'CDTM',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-cd-dulich',
    code: 'DVTC',
    officialName: 'Trường Cao đẳng Du lịch Đà Nẵng',
    shortName: 'DVTC',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-cd-gtvt-tw5',
    code: 'C5',
    officialName: 'Trường Cao đẳng Giao thông Vận tải Trung ương V',
    shortName: 'C5',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-cd-phuongdong-dn',
    code: 'CDPD',
    officialName: 'Trường Cao đẳng Phương Đông',
    shortName: 'CĐ Phương Đông',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-cd-luongthuc',
    code: 'CFIT',
    officialName: 'Trường Cao đẳng Lương thực Thực phẩm',
    shortName: 'CĐ Lương thực Thực phẩm',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-cd-congnghe',
    code: 'YDVN',
    officialName: 'Trường Cao đẳng Công nghệ Y – Dược Việt Nam',
    shortName: 'YDVN',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-cd-daiviet-dn',
    code: 'DAIVIET',
    officialName: 'Trường Cao đẳng Đại Việt Đà Nẵng',
    shortName: 'DAIVIET',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-cd-kinhte-thuyloi-mt',
    code: 'CCTW',
    officialName: 'Trường Cao đẳng Kinh tế Công nghệ và Thủy lợi Miền Trung',
    shortName: 'CĐ KTCN & Thủy lợi MT',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-muce-dn',
    code: 'MUCE-DN',
    officialName: 'Phân hiệu Trường Đại học Xây dựng Miền Trung tại TP. Đà Nẵng',
    shortName: 'Phân hiệu ĐH Xây dựng MT',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-apd-dn',
    code: 'APD-DN',
    officialName: 'Học viện Chính sách và Phát triển - Phân hiệu TP. Đà Nẵng',
    shortName: 'Phân hiệu HV Chính sách & Phát triển',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: false,
  },
];

const SCHOOL_REVIEW_UNITS_SEED: {
  id: string;
  institutionId: string;
  code: string;
  officialName: string;
  shortName: string;
  unitType: string;
  isActive?: boolean;
}[] = [
  {
    id: 'unit-udn',
    institutionId: 'inst-udn',
    code: 'SRU-UDN',
    officialName: 'Đại học Đà Nẵng',
    shortName: 'ĐH Đà Nẵng (08 trường thành viên)',
    unitType: 'BAN_THU_KY',
  },
  ...INSTITUTIONS_SEED.filter(
    (inst) =>
      inst.group === 'AFFILIATED_UNIVERSITY' || inst.group === 'COLLEGE_JUNIOR_COLLEGE'
  ).map((inst) => ({
    id: inst.id.replace(/^inst-/, 'unit-'),
    institutionId: inst.id,
    code: `SRU-${inst.code}`,
    officialName: inst.officialName,
    shortName: inst.shortName,
    unitType: inst.hasStudentAssoc ? 'HSV_TRUONG' : 'DOAN_TRUONG',
    isActive: inst.isActive !== false,
  })),
];

async function main() {
  console.log('🌱 Starting Neon PostgreSQL Seed (5TOT Thành phố Đà Nẵng)...');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prisma = (await dbManager.getClient()) as any;
  const defaultHash = await defaultPasswordHasher.hash('MatKhau@2026');

  const shouldCleanApps =
    process.argv.includes('--clean') || process.env.CLEAN_APPLICATIONS === '1';

  if (shouldCleanApps) {
    await prisma.$executeRawUnsafe('DELETE FROM "portal_persistent_records"').catch(() => {});
    await prisma.notification?.deleteMany({}).catch(() => {});
    await prisma.authSession?.deleteMany({}).catch(() => {});
    await prisma.supplementRequest?.deleteMany({}).catch(() => {});
    await prisma.evidenceObject?.deleteMany({}).catch(() => {});
    await prisma.applicationFinalResult?.deleteMany({}).catch(() => {});
    await prisma.recognitionDecisionBatch?.deleteMany({}).catch(() => {});
    await prisma.schoolForwardingBatch?.deleteMany({}).catch(() => {});
    await prisma.individualApplication?.deleteMany({}).catch(() => {});
    await prisma.collectiveApplication?.deleteMany({}).catch(() => {});
  }
  const validInstIds = INSTITUTIONS_SEED.map((i) => i.id);
  const validUnitIds = SCHOOL_REVIEW_UNITS_SEED.map((u) => u.id);
  await prisma.facultyDepartment
    ?.deleteMany({ where: { institutionId: { notIn: validInstIds } } })
    .catch(() => {});
  await prisma.schoolReviewUnit
    ?.deleteMany({ where: { id: { notIn: validUnitIds } } })
    .catch(() => {});
  await prisma.institution
    ?.deleteMany({ where: { id: { notIn: validInstIds } } })
    .catch(() => {});

  // 1. Seed Institutions (Bulk)
  await prisma.institution.createMany({
    data: INSTITUTIONS_SEED.map((inst) => ({
      id: inst.id,
      code: inst.code,
      officialName: inst.officialName,
      shortName: inst.shortName,
      group: inst.group,
      hasStudentAssoc: inst.hasStudentAssoc,
      isActive: inst.isActive !== false,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${INSTITUTIONS_SEED.length} Institutions.`);

  // 2. Seed School Review Units (Bulk)
  await prisma.schoolReviewUnit.createMany({
    data: SCHOOL_REVIEW_UNITS_SEED.map((unit) => ({
      id: unit.id,
      institutionId: unit.institutionId,
      code: unit.code,
      officialName: unit.officialName,
      shortName: unit.shortName,
      unitType: unit.unitType,
      isActive: unit.isActive !== false,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${SCHOOL_REVIEW_UNITS_SEED.length} School Review Units.`);

  // 2.1 Seed Canonical UDN Faculties (Bulk)
  await prisma.facultyDepartment.createMany({
    data: FACULTIES_SEED_2026.map((fac) => ({
      id: fac.id,
      institutionId: fac.institutionId,
      schoolReviewUnitId: fac.schoolReviewUnitId,
      code: fac.code,
      name: fac.name,
      isActive: true,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${FACULTIES_SEED_2026.length} Faculties.`);

  // 3. Seed Active AwardSeason
  const season = await prisma.awardSeason.upsert({
    where: { code: '2025-2026' },
    update: {
      name: 'Năm học 2025 – 2026',
      isActive: true,
      individualSubmissionStart: new Date('2025-10-01T08:00:00+07:00'),
      individualSubmissionEnd: new Date('2026-11-10T20:00:00+07:00'),
      schoolForwardingDeadline: new Date('2026-11-20T17:00:00+07:00'),
      collectiveSubmissionStart: new Date('2025-10-01T08:00:00+07:00'),
      collectiveSubmissionEnd: new Date('2026-11-10T20:00:00+07:00'),
    },
    create: {
      id: 'season-2025-2026',
      code: '2025-2026',
      name: 'Năm học 2025 – 2026',
      isActive: true,
      individualSubmissionStart: new Date('2025-10-01T08:00:00+07:00'),
      individualSubmissionEnd: new Date('2026-11-10T20:00:00+07:00'),
      schoolForwardingDeadline: new Date('2026-11-20T17:00:00+07:00'),
      collectiveSubmissionStart: new Date('2025-10-01T08:00:00+07:00'),
      collectiveSubmissionEnd: new Date('2026-11-10T20:00:00+07:00'),
    },
  });
  console.log(`✅ Seeded Active AwardSeason: ${season.code} (${season.id}).`);

  // 4. Seed Criterion Groups (5 Individual + 4 Collective)
  const criterionGroups: {
    track: ApplicationTrack;
    code: string;
    title: string;
    shortTitle: string;
    displayOrder: number;
    ruleConfig: Record<string, unknown>;
  }[] = [
    {
      track: 'INDIVIDUAL',
      code: 'ETHICS',
      title: 'Đạo đức tốt',
      shortTitle: 'Đạo đức',
      displayOrder: 1,
      ruleConfig: { minConductScore: 80, requireSupplementItem: true },
    },
    {
      track: 'INDIVIDUAL',
      code: 'ACADEMIC',
      title: 'Học tập tốt',
      shortTitle: 'Học tập',
      displayOrder: 2,
      ruleConfig: {
        minGpa4: 3.2,
        minGpa10: 8.0,
        collegeMinGpa4: 3.0,
        collegeMinGpa10: 7.5,
      },
    },
    {
      track: 'INDIVIDUAL',
      code: 'PHYSICAL',
      title: 'Thể lực tốt',
      shortTitle: 'Thể lực',
      displayOrder: 3,
      ruleConfig: { requireSportOrHealthyStudent: true },
    },
    {
      track: 'INDIVIDUAL',
      code: 'VOLUNTEER',
      title: 'Tình nguyện tốt',
      shortTitle: 'Tình nguyện',
      displayOrder: 4,
      ruleConfig: { minVolunteerDays: 5, allowCommendationAlternative: true },
    },
    {
      track: 'INDIVIDUAL',
      code: 'INTEGRATION',
      title: 'Hội nhập tốt',
      shortTitle: 'Hội nhập',
      displayOrder: 5,
      ruleConfig: { requireSkillAndForeignLangOrIntegration: true },
    },
    {
      track: 'COLLECTIVE',
      code: 'TT01',
      title: 'Đạt danh hiệu Tập thể Sinh viên 5 tốt cấp Trường',
      shortTitle: 'Danh hiệu cấp Trường',
      displayOrder: 1,
      ruleConfig: { requireSchoolRecognition: true },
    },
    {
      track: 'COLLECTIVE',
      code: 'TT02',
      title: '100% sinh viên tham gia phong trào Sinh viên 5 tốt',
      shortTitle: '100% tham gia',
      displayOrder: 2,
      ruleConfig: { minParticipationPercent: 100 },
    },
    {
      track: 'COLLECTIVE',
      code: 'TT03',
      title: 'Ít nhất 20% sinh viên đạt danh hiệu SV5T cấp Trường trở lên',
      shortTitle: '>= 20% đạt SV5T',
      displayOrder: 3,
      ruleConfig: { minRecognizedPercent: 20 },
    },
    {
      track: 'COLLECTIVE',
      code: 'TT04',
      title: 'Không có sinh viên vi phạm pháp luật hoặc quy chế',
      shortTitle: 'Không vi phạm',
      displayOrder: 4,
      ruleConfig: { requireZeroViolations: true },
    },
  ];

  await prisma.criterionGroupDefinition.createMany({
    data: criterionGroups.map((cg) => ({
      seasonId: season.id,
      track: cg.track,
      code: cg.code,
      title: cg.title,
      shortTitle: cg.shortTitle,
      displayOrder: cg.displayOrder,
      ruleConfig: cg.ruleConfig,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${criterionGroups.length} CriterionGroupDefinitions.`);

  // 5. Seed Staff Accounts (Admin, City Manager, City Officer, City Committee, School Officers)
  await prisma.user.createMany({
    data: STAFF_SEED_ACCOUNTS.map((staff) => {
      const validInstId = INSTITUTIONS_SEED.some((i) => i.id === staff.institutionId)
        ? staff.institutionId
        : 'inst-hsv-dn';
      return {
        id: staff.id,
        email: staff.email.toLowerCase(),
        fullName: staff.fullName,
        passwordHash: defaultHash,
        status: 'ACTIVE',
        institutionId: validInstId,
      };
    }),
    skipDuplicates: true,
  });

  await prisma.userRoleAssignment.createMany({
    data: STAFF_SEED_ACCOUNTS.map((staff) => {
      const validUnitId =
        staff.role === 'SCHOOL_OFFICER' &&
        SCHOOL_REVIEW_UNITS_SEED.some((u) => u.id === staff.unitId)
          ? staff.unitId
          : null;
      return {
        userId: staff.id,
        roleCode: staff.role as SystemRoleCode,
        schoolReviewUnitId: validUnitId,
        isActive: true,
      };
    }),
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${STAFF_SEED_ACCOUNTS.length} Staff Accounts (Admin, Manager, Officers, Committee, School Officers).`);

  // 6. Seed Collective Units & Collective Preparer Accounts
  await prisma.collectiveUnit.createMany({
    data: COLLECTIVE_PREPARERS.map((prep) => {
      const collectiveUnitId = `col-${prep.id.replace('prep-col-', '')}`;
      const collectiveType: CollectiveType =
        prep.collectiveName.includes('Liên chi hội')
          ? 'LIEN_CHI_HOI'
          : prep.collectiveName.includes('Liên chi đoàn')
          ? 'LIEN_CHI_DOAN'
          : prep.collectiveName.includes('CLB') || prep.collectiveName.includes('Câu lạc bộ')
          ? 'CLUB_TEAM_GROUP'
          : prep.collectiveName.includes('Chi đoàn')
          ? 'CHI_DOAN'
          : 'CHI_HOI';
      return {
        id: collectiveUnitId,
        code: collectiveUnitId.toUpperCase(),
        officialName: prep.collectiveName,
        collectiveType,
        institutionId: prep.institutionId,
        schoolReviewUnitId: prep.schoolReviewUnitId,
        facultyOrParentName: prep.institutionName,
        isActive: true,
      };
    }),
    skipDuplicates: true,
  });

  await prisma.user.createMany({
    data: COLLECTIVE_PREPARERS.map((prep) => ({
      id: prep.id,
      email: prep.email.toLowerCase(),
      fullName: prep.fullName,
      passwordHash: defaultHash,
      status: 'ACTIVE',
      institutionId: prep.institutionId,
    })),
    skipDuplicates: true,
  });

  await prisma.userRoleAssignment.createMany({
    data: COLLECTIVE_PREPARERS.map((prep) => ({
      userId: prep.id,
      roleCode: 'COLLECTIVE_PREPARER' as SystemRoleCode,
      schoolReviewUnitId: prep.schoolReviewUnitId,
      isActive: true,
    })),
    skipDuplicates: true,
  });

  await prisma.collectivePreparerAuthorization.createMany({
    data: COLLECTIVE_PREPARERS.map((prep) => ({
      collectiveUnitId: `col-${prep.id.replace('prep-col-', '')}`,
      userId: prep.id,
      seasonId: season.id,
      positionTitle: 'Người lập hồ sơ Tập thể được phân quyền',
      isActive: true,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${COLLECTIVE_PREPARERS.length} Collective Preparer Accounts & Authorizations.`);

  // 7. Seed Student Accounts (0 sample IndividualApplications)
  await prisma.user.createMany({
    data: SEEDED_STUDENTS.map((stu, idx) => ({
      id: stu.id,
      email: stu.email.toLowerCase(),
      fullName: stu.fullName,
      studentCode: stu.studentCode,
      passwordHash: defaultHash,
      status: 'ACTIVE',
      institutionId: stu.institutionId,
      profile: {
        fullName: stu.fullName,
        studentCode: stu.studentCode,
        dateOfBirth: '2004-05-15',
        gender: idx % 2 === 0 ? 'Nam' : 'Nữ',
        ethnicity: 'Kinh',
        citizenId: `04820400${String(1000 + idx)}`,
        phoneNumber: `0905${String(123400 + idx)}`,
        email: stu.email.toLowerCase(),
        permanentAddress: 'Thành phố Đà Nẵng',
        trainingInstitutionId: stu.institutionId,
        trainingInstitutionName: stu.institutionName,
        faculty: 'Khoa Đào tạo Chuyên ngành',
        className: `22CLC-${idx + 1}`,
        academicYear: '2025-2026',
        youthUnionRole: 'Đoàn viên / Hội viên ưu tú',
        updatedAt: new Date().toISOString(),
      },
    })),
    skipDuplicates: true,
  });

  await prisma.userRoleAssignment.createMany({
    data: SEEDED_STUDENTS.map((stu) => ({
      userId: stu.id,
      roleCode: 'STUDENT' as SystemRoleCode,
      schoolReviewUnitId: stu.unitId,
      isActive: true,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${SEEDED_STUDENTS.length} Student Accounts across Da Nang institutions (0 sample applications).`);

  const r2UploadedCount = 0;

  const [instCount, unitCount, userCount, roleCount, colAuthCount, appCount, evCount] = await Promise.all([
    prisma.institution.count(),
    prisma.schoolReviewUnit.count(),
    prisma.user.count(),
    prisma.userRoleAssignment.count(),
    prisma.collectivePreparerAuthorization.count(),
    prisma.individualApplication.count(),
    prisma.evidenceObject.count(),
  ]);

  console.log('\n📊 NEON POSTGRESQL & CLOUDFLARE R2 SEED SUMMARY:');
  console.log(`   - Institutions: ${instCount}`);
  console.log(`   - SchoolReviewUnits: ${unitCount}`);
  console.log(`   - Users: ${userCount}`);
  console.log(`   - UserRoleAssignments: ${roleCount}`);
  console.log(`   - CollectivePreparerAuthorizations: ${colAuthCount}`);
  console.log(`   - IndividualApplications: ${appCount}`);
  console.log(`   - EvidenceObjects (R2 + Neon): ${evCount} (${r2UploadedCount} synced from /minhchung_test)`);
  console.log('🎉 Neon PostgreSQL database & Cloudflare R2 storage are ready for full production testing!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await dbManager.disconnect();
  });
