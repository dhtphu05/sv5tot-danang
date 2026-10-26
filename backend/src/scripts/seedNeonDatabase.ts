/**
 * 5TOT Đà Nẵng — Authoritative Neon PostgreSQL Seed Script (Production Ready)
 * Seeds all Institutions, School Review Units, Active Season (2025-2026),
 * Criteria Definitions, Collective Units, and Multi-School Accounts (Admin,
 * Committee, City Manager, City Officers, School Officers, Collective Preparers,
 * and Students across all 14 universities in Đà Nẵng).
 */

import 'dotenv/config';
import { dbManager } from '../shared/database/prismaClient';
import { defaultPasswordHasher } from '../modules/auth/passwordHasher';
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

  // 7. Seed Student Accounts across all 14 universities
  for (const stu of SEEDED_STUDENTS) {
    const user = await prisma.user.upsert({
      where: { email: stu.email.toLowerCase() },
      update: {
        fullName: stu.fullName,
        studentCode: stu.studentCode,
        passwordHash: defaultHash,
        status: 'ACTIVE',
        institutionId: stu.institutionId,
      },
      create: {
        id: stu.id,
        email: stu.email.toLowerCase(),
        fullName: stu.fullName,
        studentCode: stu.studentCode,
        passwordHash: defaultHash,
        status: 'ACTIVE',
        institutionId: stu.institutionId,
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
  console.log(`✅ Seeded ${SEEDED_STUDENTS.length} Student Accounts across all 14 universities.`);

  const [instCount, unitCount, userCount, roleCount, colAuthCount] = await Promise.all([
    prisma.institution.count(),
    prisma.schoolReviewUnit.count(),
    prisma.user.count(),
    prisma.userRoleAssignment.count(),
    prisma.collectivePreparerAuthorization.count(),
  ]);

  console.log('\n📊 NEON POSTGRESQL SEED SUMMARY:');
  console.log(`   - Institutions: ${instCount}`);
  console.log(`   - SchoolReviewUnits: ${unitCount}`);
  console.log(`   - Users: ${userCount}`);
  console.log(`   - UserRoleAssignments: ${roleCount}`);
  console.log(`   - CollectivePreparerAuthorizations: ${colAuthCount}`);
  console.log('🎉 Neon PostgreSQL database is ready for full production testing!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await dbManager.disconnect();
  });
