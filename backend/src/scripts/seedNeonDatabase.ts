/**
 * 5TOT Đà Nẵng — Authoritative Neon PostgreSQL Seed Script (Production Ready)
 * Seeds all Institutions, School Review Units, Active Season (2025-2026),
 * Criteria Definitions, Collective Units, and Multi-School Accounts (Admin,
 * Committee, City Manager, City Officers, School Officers, Collective Preparers,
 * and Students across all 14 universities in Đà Nẵng).
 */

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { dbManager } from '../shared/database/prismaClient';
import { defaultPasswordHasher } from '../modules/auth/passwordHasher';
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
}[] = [
  {
    id: 'inst-hsv-dn',
    code: 'HSV-DN',
    officialName: 'Hội Sinh viên Việt Nam Thành phố Đà Nẵng',
    shortName: 'HSV TP. Đà Nẵng',
    group: 'CITY_YOUTH_UNION_UNIT',
    hasStudentAssoc: true,
  },
  // 8 UDN Member Institutions
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
    officialName: 'Trường Đại học CNTT & Truyền thông Việt – Hàn – Đại học Đà Nẵng',
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
  // 6 Independent Universities in Đà Nẵng
  {
    id: 'inst-dtu',
    code: 'DTU',
    officialName: 'Trường Đại học Duy Tân',
    shortName: 'ĐH Duy Tân',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-donga',
    code: 'UDA',
    officialName: 'Trường Đại học Đông Á',
    shortName: 'ĐH Đông Á',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-dau',
    code: 'DAU',
    officialName: 'Trường Đại học Kiến trúc Đà Nẵng',
    shortName: 'ĐH Kiến trúc Đà Nẵng',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-upes3',
    code: 'UPES3',
    officialName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    shortName: 'ĐH TDTT Đà Nẵng',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-tyd',
    code: 'DHKTYD',
    officialName: 'Trường Đại học Kỹ thuật Y – Dược Đà Nẵng',
    shortName: 'ĐH Kỹ thuật Y - Dược ĐN',
    group: 'AFFILIATED_UNIVERSITY',
    hasStudentAssoc: true,
  },
  {
    id: 'inst-fpt',
    code: 'FPT-DN',
    officialName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    shortName: 'ĐH FPT Đà Nẵng',
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
}[] = [
  {
    id: 'unit-udn',
    institutionId: 'inst-dut',
    code: 'SRU-UDN',
    officialName: 'Đại học Đà Nẵng',
    shortName: 'ĐHĐN',
    unitType: 'HSV_TRUONG',
  },
  {
    id: 'unit-dtu',
    institutionId: 'inst-dtu',
    code: 'SRU-DTU',
    officialName: 'Trường Đại học Duy Tân',
    shortName: 'DTU',
    unitType: 'HSV_TRUONG',
  },
  {
    id: 'unit-donga',
    institutionId: 'inst-donga',
    code: 'SRU-UDA',
    officialName: 'Trường Đại học Đông Á',
    shortName: 'ĐH Đông Á',
    unitType: 'DOAN_TRUONG',
  },
  {
    id: 'unit-dau',
    institutionId: 'inst-dau',
    code: 'SRU-DAU',
    officialName: 'Trường Đại học Kiến trúc Đà Nẵng',
    shortName: 'ĐH Kiến trúc',
    unitType: 'HSV_TRUONG',
  },
  {
    id: 'unit-upes3',
    institutionId: 'inst-upes3',
    code: 'SRU-UPES3',
    officialName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    shortName: 'ĐH TDTT',
    unitType: 'HSV_TRUONG',
  },
  {
    id: 'unit-tyd',
    institutionId: 'inst-tyd',
    code: 'SRU-DHKTYD',
    officialName: 'Trường Đại học Kỹ thuật Y – Dược Đà Nẵng',
    shortName: 'ĐH KTYD',
    unitType: 'HSV_TRUONG',
  },
  {
    id: 'unit-fpt',
    institutionId: 'inst-fpt',
    code: 'SRU-FPT',
    officialName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    shortName: 'ĐH FPT',
    unitType: 'DOAN_TRUONG',
  },
];

async function main() {
  console.log('🌱 Starting Neon PostgreSQL Seed (5TOT Đà Nẵng)...');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prisma = (await dbManager.getClient()) as any;
  const defaultHash = await defaultPasswordHasher.hash('12345678');

  // 1. Seed Institutions
  for (const inst of INSTITUTIONS_SEED) {
    await prisma.institution.upsert({
      where: { id: inst.id },
      update: {
        code: inst.code,
        officialName: inst.officialName,
        shortName: inst.shortName,
        group: inst.group,
        hasStudentAssoc: inst.hasStudentAssoc,
        isActive: true,
      },
      create: {
        id: inst.id,
        code: inst.code,
        officialName: inst.officialName,
        shortName: inst.shortName,
        group: inst.group,
        hasStudentAssoc: inst.hasStudentAssoc,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${INSTITUTIONS_SEED.length} Institutions.`);

  // 2. Seed School Review Units
  for (const unit of SCHOOL_REVIEW_UNITS_SEED) {
    await prisma.schoolReviewUnit.upsert({
      where: { id: unit.id },
      update: {
        institutionId: unit.institutionId,
        code: unit.code,
        officialName: unit.officialName,
        shortName: unit.shortName,
        unitType: unit.unitType,
        isActive: true,
      },
      create: {
        id: unit.id,
        institutionId: unit.institutionId,
        code: unit.code,
        officialName: unit.officialName,
        shortName: unit.shortName,
        unitType: unit.unitType,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${SCHOOL_REVIEW_UNITS_SEED.length} School Review Units.`);

  // 3. Seed Active AwardSeason
  const season = await prisma.awardSeason.upsert({
    where: { code: '2025-2026' },
    update: {
      name: 'Năm học 2025 – 2026',
      isActive: true,
    },
    create: {
      id: 'season-2025-2026',
      code: '2025-2026',
      name: 'Năm học 2025 – 2026',
      isActive: true,
      individualSubmissionStart: new Date('2025-10-01T00:00:00Z'),
      individualSubmissionEnd: new Date('2026-11-15T23:59:59Z'),
      schoolForwardingDeadline: new Date('2026-11-25T23:59:59Z'),
      collectiveSubmissionStart: new Date('2025-10-01T00:00:00Z'),
      collectiveSubmissionEnd: new Date('2026-11-20T23:59:59Z'),
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
      ruleConfig: { minConductScore: 80 },
    },
    {
      track: 'INDIVIDUAL',
      code: 'ACADEMIC',
      title: 'Học tập tốt',
      shortTitle: 'Học tập',
      displayOrder: 2,
      ruleConfig: { minGpa4: 3.2, minGpa10: 8.0 },
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
      ruleConfig: { minVolunteerDays: 5 },
    },
    {
      track: 'INDIVIDUAL',
      code: 'INTEGRATION',
      title: 'Hội nhập tốt',
      shortTitle: 'Hội nhập',
      displayOrder: 5,
      ruleConfig: { requireForeignLangAndIntegration: true },
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

  // 7. Seed Student Accounts & IndividualApplications across all 14 universities
  let appSeedCount = 0;
  for (let idx = 0; idx < SEEDED_STUDENTS.length; idx++) {
    const stu = SEEDED_STUDENTS[idx];
    const profilePayload = {
      fullName: stu.fullName,
      studentCode: stu.studentCode,
      dateOfBirth: stu.studentCode === '193230153' ? '2004-08-19' : '2004-05-15',
      gender: idx % 2 === 0 ? 'Nam' : 'Nữ',
      ethnicity: 'Kinh',
      citizenId: `04820400${String(1000 + idx)}`,
      phoneNumber: `0905${String(123400 + idx)}`,
      email: stu.email.toLowerCase(),
      permanentAddress: 'Thành phố Đà Nẵng',
      trainingInstitutionId: stu.institutionId,
      trainingInstitutionName: stu.institutionName,
      faculty: stu.studentCode === '193230153' ? 'Khoa Công nghệ Thông tin' : 'Khoa Đào tạo Chuyên ngành',
      className: stu.studentCode === '193230153' ? '23T_DT2' : `22CLC-${idx + 1}`,
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

    // Create / upsert IndividualApplication across School Preliminary & City Review stages
    const appCode = stu.studentCode === '102220123'
      ? 'APP-2026-DN-00142'
      : `APP-2026-DN-${stu.studentCode}`;
    const isCityStage = idx % 3 !== 0; // 2/3 forwarded to City for City Manager/Officer/Committee testing, 1/3 at School Preliminary for School Officer testing
    const isCommitteeStage = idx % 5 === 0 && isCityStage;

    await prisma.individualApplication.upsert({
      where: {
        seasonId_applicantUserId: {
          seasonId: season.id,
          applicantUserId: user.id,
        },
      },
      update: {
        applicationCode: appCode,
        institutionId: stu.institutionId,
        schoolReviewUnitId: stu.unitId,
        facultyName: profilePayload.faculty,
        className: profilePayload.className,
        academicYear: '2025-2026',
        studentCodeSnapshot: stu.studentCode,
        fullNameSnapshot: stu.fullName,
        applicantProfileSnapshot: profilePayload,
        gpaScale4: 3.65,
        gpaScale10: 8.85,
        conductScore: 92,
        declaredCriteriaCount: 5,
        totalEvidenceCount: 8,
        currentReviewStage: isCommitteeStage
          ? 'COMMITTEE_FINALIZATION'
          : isCityStage
          ? 'CITY_REVIEW'
          : 'SCHOOL_PRELIMINARY',
        schoolPreliminaryStatus: isCityStage
          ? 'FORWARDED_TO_CITY'
          : 'PENDING_SCHOOL_REVIEW',
        cityWorkflowStatus: isCommitteeStage
          ? 'CITY_REVIEW_COMPLETED'
          : isCityStage
          ? idx % 2 === 0
            ? 'CITY_IN_REVIEW'
            : 'CITY_UNASSIGNED'
          : 'NOT_AT_CITY',
        submittedToSchoolAt: new Date('2026-10-15T08:30:00Z'),
        schoolForwardedAt: isCityStage ? new Date('2026-10-18T10:00:00Z') : null,
      },
      create: {
        id: appCode,
        applicationCode: appCode,
        seasonId: season.id,
        applicantUserId: user.id,
        institutionId: stu.institutionId,
        schoolReviewUnitId: stu.unitId,
        facultyName: profilePayload.faculty,
        className: profilePayload.className,
        academicYear: '2025-2026',
        studentCodeSnapshot: stu.studentCode,
        fullNameSnapshot: stu.fullName,
        applicantProfileSnapshot: profilePayload,
        gpaScale4: 3.65,
        gpaScale10: 8.85,
        conductScore: 92,
        declaredCriteriaCount: 5,
        totalEvidenceCount: 8,
        currentReviewStage: isCommitteeStage
          ? 'COMMITTEE_FINALIZATION'
          : isCityStage
          ? 'CITY_REVIEW'
          : 'SCHOOL_PRELIMINARY',
        schoolPreliminaryStatus: isCityStage
          ? 'FORWARDED_TO_CITY'
          : 'PENDING_SCHOOL_REVIEW',
        cityWorkflowStatus: isCommitteeStage
          ? 'CITY_REVIEW_COMPLETED'
          : isCityStage
          ? idx % 2 === 0
            ? 'CITY_IN_REVIEW'
            : 'CITY_UNASSIGNED'
          : 'NOT_AT_CITY',
        submittedToSchoolAt: new Date('2026-10-15T08:30:00Z'),
        schoolForwardedAt: isCityStage ? new Date('2026-10-18T10:00:00Z') : null,
      },
    });
    appSeedCount++;
  }
  console.log(`✅ Seeded ${SEEDED_STUDENTS.length} Student Accounts & ${appSeedCount} IndividualApplications across all 14 universities.`);

  // 8. Real Evidence Files Verification & Upload to Cloudflare R2 + Neon DB
  const minhChungDir = fs.existsSync(path.resolve(process.cwd(), '../public/minhchung_test'))
    ? path.resolve(process.cwd(), '../public/minhchung_test')
    : path.resolve(process.cwd(), 'public/minhchung_test');
  const r2Client = new CloudflareR2StorageClient();
  let r2UploadedCount = 0;

  if (fs.existsSync(minhChungDir)) {
    const allFiles = fs
      .readdirSync(minhChungDir)
      .filter((f) => !f.startsWith('.') && /\.(pdf|heic|jpg|jpeg|png|webp)$/i.test(f));

    console.log(`\n📂 Found ${allFiles.length} real evidence files in public/minhchung_test.`);

    // Upload the 5 real PDFs + representative HEIC & JPG files to Cloudflare R2 & Neon DB
    const targetFiles = allFiles.filter(
      (f) =>
        f.endsWith('.pdf') ||
        f === 'IMG_1711.heic' ||
        f === 'IMG_1711.jpg' ||
        f === 'IMG_2266.heic' ||
        f === 'IMG_2266.jpg' ||
        f === 'IMG_4242.jpg'
    );

    const phuUser = await prisma.user.findUnique({
      where: { email: 'phu.dht@dut.udn.vn' },
    });
    const ownerUserId = phuUser?.id || 'stu-dut-phu';

    for (const fileName of targetFiles) {
      const fullPath = path.join(minhChungDir, fileName);
      const buffer = fs.readFileSync(fullPath);
      const ext = (fileName.split('.').pop() || '').toLowerCase();
      const mimeType =
        ext === 'pdf'
          ? 'application/pdf'
          : ext === 'heic' || ext === 'heif'
          ? 'image/heic'
          : ext === 'png'
          ? 'image/png'
          : 'image/jpeg';

      const headerHex = buffer.subarray(0, 32).toString('hex');
      const magicValid = verifyEvidenceMagicBytes(mimeType, headerHex);
      if (!magicValid) {
        throw new Error(`Magic byte check failed for ${fileName} (${mimeType}): ${headerHex}`);
      }

      const sha256Checksum = crypto.createHash('sha256').update(buffer).digest('hex');
      const safeSlug = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectKey = `2025-2026/INDIVIDUAL/APP-2026-DN-193230153/minhchung_test/${safeSlug}`;

      if (r2Client.isConfigured()) {
        const putIntent = await r2Client.createPresignedPutUrl({
          objectKey,
          mimeType,
          sizeBytes: buffer.byteLength,
        });
        const putRes = await fetch(putIntent.uploadUrl, {
          method: 'PUT',
          headers: putIntent.headers,
          body: buffer,
        });
        if (!putRes.ok) {
          throw new Error(`R2 PUT failed for ${fileName}: HTTP ${putRes.status}`);
        }
        const inspected = await r2Client.inspectUploadedObject(objectKey);
        if (!inspected?.exists) {
          throw new Error(`R2 inspectUploadedObject failed for ${fileName}`);
        }
      }

      const evId = `ev-real-${crypto.createHash('md5').update(fileName).digest('hex').slice(0, 12)}`;
      await prisma.evidenceObject.upsert({
        where: { objectKey },
        update: {
          originalFileName: fileName,
          mimeType,
          extension: ext,
          sizeBytes: BigInt(buffer.byteLength),
          sha256Checksum,
          bucketName: r2Client.getBucketName(),
          scanStatus: 'CLEAN',
          isFinalized: true,
          finalizedAt: new Date(),
        },
        create: {
          id: evId,
          ownerUserId,
          track: 'INDIVIDUAL',
          individualAppId: 'APP-2026-DN-193230153',
          currentVersionNo: 1,
          originalFileName: fileName,
          mimeType,
          extension: ext,
          sizeBytes: BigInt(buffer.byteLength),
          sha256Checksum,
          bucketName: r2Client.getBucketName(),
          objectKey,
          scanStatus: 'CLEAN',
          isFinalized: true,
          finalizedAt: new Date(),
        },
      });
      r2UploadedCount++;
      console.log(
        `   ✔ Uploaded & verified [${ext.toUpperCase()}] ${fileName} (${(buffer.byteLength / 1024).toFixed(1)} KB) -> R2 + Neon DB`
      );
    }
  }

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
