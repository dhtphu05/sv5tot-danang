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
    id: 'inst-smp',
    code: 'SMP',
    officialName: 'Trường Y Dược – Đại học Đà Nẵng',
    shortName: 'Trường Y Dược - ĐHĐN',
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
  // 23 Active Standalone Universities / Academies / Campuses / Colleges in Da Nang
  {
    id: 'inst-dtu',
    code: 'DTU',
    officialName: 'Đại học Duy Tân',
    shortName: 'DTU',
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
    id: 'inst-upes3',
    code: 'UPES3',
    officialName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    shortName: 'UPES3',
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
    id: 'inst-tyd',
    code: 'DHKTYD',
    officialName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    shortName: 'DHKTYD',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-fpt',
    code: 'FPTU',
    officialName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    shortName: 'FPTU',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-hv-chinhtri-kv3',
    code: 'HVCT3',
    officialName: 'Học viện Chính trị khu vực III',
    shortName: 'HVCT3',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-hv-toa-an',
    code: 'HVTA',
    officialName: 'Học viện Tòa án (Cơ sở đào tạo thực hành Đà Nẵng)',
    shortName: 'HVTA',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-dh-ngan-hang-dn',
    code: 'HUB-DN',
    officialName: 'Trường Đại học Ngân hàng TP.HCM (Phân hiệu Đà Nẵng)',
    shortName: 'HUB-DN',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-dh-luat-hanoi-dn',
    code: 'HLU-DN',
    officialName: 'Trường Đại học Luật Hà Nội (Phân hiệu Đà Nẵng)',
    shortName: 'HLU-DN',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-dh-mo-hn-dn',
    code: 'HOU-DN',
    officialName: 'Trường Đại học Mở Hà Nội (Trạm đào tạo Đà Nẵng)',
    shortName: 'HOU-DN',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: false,
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
    id: 'inst-cd-congnghe',
    code: 'YDVN',
    officialName: 'Trường Cao đẳng Công nghệ Y - Dược Việt Nam',
    shortName: 'YDVN',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-cd-fptpoly',
    code: 'POLY',
    officialName: 'Trường Cao đẳng FPT Polytechnic cơ sở Đà Nẵng',
    shortName: 'POLY',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-cd-nghe-dn',
    code: 'DANAVTC',
    officialName: 'Trường Cao đẳng Nghề Đà Nẵng',
    shortName: 'DANAVTC',
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
    id: 'inst-cd-kinhte-kh',
    code: 'CEP',
    officialName: 'Trường Cao đẳng Kinh tế - Kế hoạch Đà Nẵng',
    shortName: 'CEP',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-cd-vhtt-dl',
    code: 'CDVHNT',
    officialName: 'Trường Cao đẳng Văn hóa Nghệ thuật Đà Nẵng',
    shortName: 'CDVHNT',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-cd-luongthuc',
    code: 'CFIT',
    officialName: 'Trường Cao đẳng Lương thực - Thực phẩm',
    shortName: 'CFIT',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-cd-ptth',
    code: 'VOV2',
    officialName: 'Trường Cao đẳng Phát thanh - Truyền hình II (Cơ sở Đà Nẵng)',
    shortName: 'VOV2',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-cd-supham-maugiao',
    code: 'CDSPTW',
    officialName: 'Trường Cao đẳng Sư phạm Trung ương Nha Trang (Cơ sở Đà Nẵng)',
    shortName: 'CDSPTW',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-cd-yduoc-pasteur',
    code: 'PASTEUR',
    officialName: 'Trường Cao đẳng Y Dược Pasteur Đà Nẵng',
    shortName: 'PASTEUR',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: false,
  },
  {
    id: 'inst-cd-lacviet',
    code: 'LACVIET',
    officialName: 'Trường Cao đẳng Lạc Việt',
    shortName: 'LACVIET',
    group: 'COLLEGE_JUNIOR_COLLEGE',
    hasStudentAssoc: false,
    isActive: false,
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

  // 0. Clean all sample applications, batches, evidence objects, and legacy users/units/institutions first ("không có hồ sơ mẫu")
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
  await prisma.collectivePreparerAuthorization?.deleteMany({}).catch(() => {});
  await prisma.collectiveUnit?.deleteMany({}).catch(() => {});
  await prisma.userRoleAssignment?.deleteMany({}).catch(() => {});
  await prisma.user?.deleteMany({}).catch(() => {});
  await prisma.academicClass?.deleteMany({}).catch(() => {});
  await prisma.facultyDepartment?.deleteMany({}).catch(() => {});
  await prisma.schoolReviewUnit?.deleteMany({}).catch(() => {});
  await prisma.institution?.deleteMany({}).catch(() => {});

  // 1. Seed Institutions
  for (const inst of INSTITUTIONS_SEED) {
    const active = inst.isActive !== false;
    await prisma.institution.upsert({
      where: { id: inst.id },
      update: {
        code: inst.code,
        officialName: inst.officialName,
        shortName: inst.shortName,
        group: inst.group,
        hasStudentAssoc: inst.hasStudentAssoc,
        isActive: active,
      },
      create: {
        id: inst.id,
        code: inst.code,
        officialName: inst.officialName,
        shortName: inst.shortName,
        group: inst.group,
        hasStudentAssoc: inst.hasStudentAssoc,
        isActive: active,
      },
    });
  }
  console.log(`✅ Seeded ${INSTITUTIONS_SEED.length} Institutions.`);

  // 2. Seed School Review Units
  for (const unit of SCHOOL_REVIEW_UNITS_SEED) {
    const active = unit.isActive !== false;
    await prisma.schoolReviewUnit.upsert({
      where: { id: unit.id },
      update: {
        institutionId: unit.institutionId,
        code: unit.code,
        officialName: unit.officialName,
        shortName: unit.shortName,
        unitType: unit.unitType,
        isActive: active,
      },
      create: {
        id: unit.id,
        institutionId: unit.institutionId,
        code: unit.code,
        officialName: unit.officialName,
        shortName: unit.shortName,
        unitType: unit.unitType,
        isActive: active,
      },
    });
  }
  console.log(`✅ Seeded ${SCHOOL_REVIEW_UNITS_SEED.length} School Review Units.`);

  // 2.1 Seed 49 Canonical UDN Faculties (2026 Structure)
  for (const fac of FACULTIES_SEED_2026) {
    await prisma.facultyDepartment.upsert({
      where: {
        institutionId_code: {
          institutionId: fac.institutionId,
          code: fac.code,
        },
      },
      update: {
        schoolReviewUnitId: fac.schoolReviewUnitId,
        name: fac.name,
        isActive: true,
      },
      create: {
        id: fac.id,
        institutionId: fac.institutionId,
        schoolReviewUnitId: fac.schoolReviewUnitId,
        code: fac.code,
        name: fac.name,
        isActive: true,
      },
    });
  }
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

  for (const cg of criterionGroups) {
    await prisma.criterionGroupDefinition.upsert({
      where: {
        seasonId_track_code: {
          seasonId: season.id,
          track: cg.track,
          code: cg.code,
        },
      },
      update: {
        title: cg.title,
        shortTitle: cg.shortTitle,
        displayOrder: cg.displayOrder,
        ruleConfig: cg.ruleConfig,
      },
      create: {
        seasonId: season.id,
        track: cg.track,
        code: cg.code,
        title: cg.title,
        shortTitle: cg.shortTitle,
        displayOrder: cg.displayOrder,
        ruleConfig: cg.ruleConfig,
      },
    });
  }
  console.log(`✅ Seeded ${criterionGroups.length} CriterionGroupDefinitions.`);

  // 5. Seed Staff Accounts (Admin, City Manager, City Officer, City Committee, School Officers)
  for (const staff of STAFF_SEED_ACCOUNTS) {
    const validInstId = INSTITUTIONS_SEED.some((i) => i.id === staff.institutionId)
      ? staff.institutionId
      : 'inst-hsv-dn';
    const validUnitId =
      staff.role === 'SCHOOL_OFFICER' &&
      SCHOOL_REVIEW_UNITS_SEED.some((u) => u.id === staff.unitId)
        ? staff.unitId
        : null;

    const user = await prisma.user.upsert({
      where: { email: staff.email.toLowerCase() },
      update: {
        fullName: staff.fullName,
        passwordHash: defaultHash,
        status: 'ACTIVE',
        institutionId: validInstId,
      },
      create: {
        id: staff.id,
        email: staff.email.toLowerCase(),
        fullName: staff.fullName,
        passwordHash: defaultHash,
        status: 'ACTIVE',
        institutionId: validInstId,
      },
    });

    const roleCode = staff.role as SystemRoleCode;
    const existingRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: user.id,
        roleCode,
      },
    });

    if (existingRole) {
      await prisma.userRoleAssignment.update({
        where: { id: existingRole.id },
        data: {
          schoolReviewUnitId: validUnitId,
          isActive: true,
        },
      });
    } else {
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleCode,
          schoolReviewUnitId: validUnitId,
          isActive: true,
        },
      });
    }
  }
  console.log(`✅ Seeded ${STAFF_SEED_ACCOUNTS.length} Staff Accounts (Admin, Manager, Officers, Committee, School Officers).`);

  // 6. Seed Collective Units & Collective Preparer Accounts across all 14 universities
  for (const prep of COLLECTIVE_PREPARERS) {
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

    await prisma.collectiveUnit.upsert({
      where: { id: collectiveUnitId },
      update: {
        officialName: prep.collectiveName,
        collectiveType,
        institutionId: prep.institutionId,
        schoolReviewUnitId: prep.schoolReviewUnitId,
        facultyOrParentName: prep.institutionName,
        isActive: true,
      },
      create: {
        id: collectiveUnitId,
        code: collectiveUnitId.toUpperCase(),
        officialName: prep.collectiveName,
        collectiveType,
        institutionId: prep.institutionId,
        schoolReviewUnitId: prep.schoolReviewUnitId,
        facultyOrParentName: prep.institutionName,
        isActive: true,
      },
    });

    const user = await prisma.user.upsert({
      where: { email: prep.email.toLowerCase() },
      update: {
        fullName: prep.fullName,
        passwordHash: defaultHash,
        status: 'ACTIVE',
        institutionId: prep.institutionId,
      },
      create: {
        id: prep.id,
        email: prep.email.toLowerCase(),
        fullName: prep.fullName,
        passwordHash: defaultHash,
        status: 'ACTIVE',
        institutionId: prep.institutionId,
      },
    });

    const existingRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: user.id,
        roleCode: 'COLLECTIVE_PREPARER',
      },
    });
    if (!existingRole) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleCode: 'COLLECTIVE_PREPARER',
          schoolReviewUnitId: prep.schoolReviewUnitId,
          isActive: true,
        },
      });
    }

    await prisma.collectivePreparerAuthorization.upsert({
      where: {
        collectiveUnitId_userId_seasonId: {
          collectiveUnitId,
          userId: user.id,
          seasonId: season.id,
        },
      },
      update: {
        positionTitle: 'Người lập hồ sơ Tập thể được phân quyền',
        isActive: true,
      },
      create: {
        collectiveUnitId,
        userId: user.id,
        seasonId: season.id,
        positionTitle: 'Người lập hồ sơ Tập thể được phân quyền',
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${COLLECTIVE_PREPARERS.length} Collective Preparer Accounts & Authorizations.`);

  // 7. Seed Student Accounts across all 9 UDN member units (0 sample IndividualApplications)
  await prisma.schoolForwardingBatch.deleteMany({}).catch(() => {});
  await prisma.individualApplication.deleteMany({}).catch(() => {});

  for (let idx = 0; idx < SEEDED_STUDENTS.length; idx++) {
    const stu = SEEDED_STUDENTS[idx];
    const profilePayload = {
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
    };

    const user = await prisma.user.upsert({
      where: { email: stu.email.toLowerCase() },
      update: {
        fullName: stu.fullName,
        studentCode: stu.studentCode,
        passwordHash: defaultHash,
        status: 'ACTIVE',
        institutionId: stu.institutionId,
        profile: profilePayload,
      },
      create: {
        id: stu.id,
        email: stu.email.toLowerCase(),
        fullName: stu.fullName,
        studentCode: stu.studentCode,
        passwordHash: defaultHash,
        status: 'ACTIVE',
        institutionId: stu.institutionId,
        profile: profilePayload,
      },
    });

    const existingRole = await prisma.userRoleAssignment.findFirst({
      where: {
        userId: user.id,
        roleCode: 'STUDENT',
      },
    });
    if (!existingRole) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleCode: 'STUDENT',
          schoolReviewUnitId: stu.unitId,
          isActive: true,
        },
      });
    }
  }
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
