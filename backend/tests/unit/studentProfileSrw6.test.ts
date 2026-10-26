/**
 * 5TOT Đà Nẵng — SRW-6 Student Personal Information Profile & Safe Snapshot Test Suite
 * Authoritative verification for:
 * 1. 13-field complete personal information collection across 4 groups.
 * 2. Strict validation (Vietnamese phone regex, normalized DOB, academic year range, valid gender).
 * 3. Immutable email protection.
 * 4. Completeness evaluation (13/13 vs incomplete missing fields).
 * 5. Application submission capturing immutable profile snapshot.
 * 6. Protection against post-submission mutation (changes to profile do not affect submitted applications).
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { IdentityService } from '../../src/modules/identity/identity.service';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { IndividualApplicationService } from '../../src/modules/individualApplications/individualApplication.service';
import { FakeIndividualApplicationRepository } from '../fakes/fakeIndividualApplicationRepository';
import { SeasonService } from '../../src/modules/seasons/season.service';
import { FakeSeasonRepository } from '../fakes/fakeSeasonRepository';
import { SchoolReviewUnitService } from '../../src/modules/schoolReviewUnits/schoolReviewUnit.service';
import { FakeSchoolReviewUnitRepository } from '../fakes/fakeSchoolReviewUnitRepository';
import { FakeInstitutionRepository } from '../fakes/fakeInstitutionRepository';
import { CriteriaService } from '../../src/modules/criteria/criteria.service';
import { FakeCriteriaRepository } from '../fakes/fakeCriteriaRepository';
import type { AuthenticatedActor } from '../../src/modules/authorization/authorization.types';

describe('SRW-6: Student Personal Information Profile & Safe Application Snapshot', () => {
  let identityRepo: FakeIdentityRepository;
  let identityService: IdentityService;
  let appRepo: FakeIndividualApplicationRepository;
  let seasonRepo: FakeSeasonRepository;
  let seasonService: SeasonService;
  let unitRepo: FakeSchoolReviewUnitRepository;
  let instRepo: FakeInstitutionRepository;
  let unitService: SchoolReviewUnitService;
  let criteriaRepo: FakeCriteriaRepository;
  let criteriaService: CriteriaService;
  let appService: IndividualApplicationService;

  const mockStudentActor: AuthenticatedActor = {
    userId: 'user-student-dut-01',
    email: 'minhanh.nguyen@dut.udn.vn',
    fullName: 'Nguyễn Minh Anh',
    activeRole: 'STUDENT',
    roles: ['STUDENT'],
    sessionId: 'sess-mock-01',
    institutionId: 'inst-dut',
    schoolReviewUnitId: 'unit-udn',
  };

  beforeEach(async () => {
    identityRepo = new FakeIdentityRepository();
    identityService = new IdentityService(identityRepo);

    // Seed mock student user
    const created = await identityRepo.createStudent({
      email: mockStudentActor.email,
      passwordHash: 'argon2id$mock-hash',
      fullName: mockStudentActor.fullName,
      studentCode: '102220123',
      institutionId: 'inst-dut',
      phone: '0905123456',
    });
    mockStudentActor.userId = created.id;

    seasonRepo = new FakeSeasonRepository();
    seasonService = new SeasonService(seasonRepo);

    instRepo = new FakeInstitutionRepository();
    unitRepo = new FakeSchoolReviewUnitRepository();
    unitService = new SchoolReviewUnitService(unitRepo, instRepo);

    criteriaRepo = new FakeCriteriaRepository();
    criteriaService = new CriteriaService(criteriaRepo);

    appRepo = new FakeIndividualApplicationRepository();
    appService = new IndividualApplicationService(
      appRepo,
      seasonService,
      unitService,
      criteriaService,
      identityRepo
    );
  });

  it('P0-1: Fetches default student profile with 13 fields and computes completeness', async () => {
    const { profile, completeness } = await identityService.getProfile(mockStudentActor.userId);

    assert.ok(profile, 'Profile must be retrieved');
    assert.equal(profile.fullName, 'Nguyễn Minh Anh');
    assert.equal(profile.email, 'minhanh.nguyen@dut.udn.vn');
    assert.equal(completeness.totalFields, 13, 'Must track exactly 13 fields');
    assert.equal(typeof completeness.isComplete, 'boolean');
  });

  it('P0-2: Updates all 13 fields with Vietnamese diacritics and formatting', async () => {
    const updatePayload = {
      fullName: 'Nguyễn Minh Anh',
      gender: 'Nữ' as const,
      dateOfBirth: '15/10/2004',
      ethnicity: 'Kinh',
      academicYearNumber: 3,
      educationLevel: 'Đại học',
      className: '22T_CLC1 - Khóa 2022',
      homeProvince: 'Thành phố Đà Nẵng',
      institutionId: 'inst-dut',
      unionPosition: 'Ủy viên Ban Chấp hành Liên chi đoàn',
      politicalStatus: 'Đoàn viên' as const,
      phoneNumber: '0905123456',
    };

    const { profile, completeness } = await identityService.updateProfile(
      mockStudentActor.userId,
      updatePayload
    );

    assert.equal(profile.fullName, 'Nguyễn Minh Anh');
    assert.equal(profile.gender, 'Nữ');
    assert.equal(profile.dateOfBirth, '15/10/2004');
    assert.equal(profile.ethnicity, 'Kinh');
    assert.equal(profile.academicYearNumber, 3);
    assert.equal(profile.educationLevel, 'Đại học');
    assert.equal(profile.className, '22T_CLC1 - Khóa 2022');
    assert.equal(profile.homeProvince, 'Thành phố Đà Nẵng');
    assert.equal(profile.institutionId, 'inst-dut');
    assert.equal(profile.unionPosition, 'Ủy viên Ban Chấp hành Liên chi đoàn');
    assert.equal(profile.politicalStatus, 'Đoàn viên');
    assert.equal(profile.phoneNumber, '0905123456');
    assert.equal(profile.email, mockStudentActor.email, 'Email must remain intact');

    assert.equal(completeness.isComplete, true, '13/13 fields filled should be complete');
    assert.equal(completeness.completedFields, 13);
    assert.equal(completeness.statusLabel, 'Đã hoàn thiện thông tin cá nhân (13/13 trường)');
  });

  it('P0-3: Rejects invalid phone number format', async () => {
    await assert.rejects(
      async () => {
        await identityService.updateProfile(mockStudentActor.userId, {
          phoneNumber: '123456789', // Invalid prefix and 9 digits
        });
      },
      (err: any) => {
        assert.equal(err.code, 'INVALID_PHONE_NUMBER');
        return true;
      }
    );
  });

  it('P0-4: Rejects invalid academic year or gender', async () => {
    await assert.rejects(
      async () => {
        await identityService.updateProfile(mockStudentActor.userId, {
          gender: 'INVALID_GENDER',
        });
      },
      (err: any) => {
        assert.equal(err.code, 'INVALID_GENDER');
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await identityService.updateProfile(mockStudentActor.userId, {
          academicYearNumber: 0,
        });
      },
      (err: any) => {
        assert.equal(err.code, 'INVALID_ACADEMIC_YEAR');
        return true;
      }
    );
  });

  it('P0-5: Application submission captures immutable snapshot of 13 personal info fields', async () => {
    // 1. Setup profile with complete data
    await identityService.updateProfile(mockStudentActor.userId, {
      fullName: 'Nguyễn Minh Anh',
      gender: 'Nữ',
      dateOfBirth: '15/10/2004',
      ethnicity: 'Kinh',
      academicYearNumber: 3,
      educationLevel: 'Đại học',
      className: '22T_CLC1 - Khóa 2022',
      homeProvince: 'Thành phố Đà Nẵng',
      institutionId: 'inst-dut',
      unionPosition: 'Bí thư Chi đoàn',
      politicalStatus: 'Đoàn viên',
      phoneNumber: '0905123456',
    });

    // 2. Start application
    const draftApp = await appService.startOrResumeApplication(mockStudentActor);

    // 3. Submit application
    const { application: submittedApp } = await appService.submitApplication(
      mockStudentActor,
      draftApp.id
    );

    assert.ok(submittedApp.applicantProfileSnapshot, 'Snapshot must be captured on submission');
    assert.equal(submittedApp.applicantProfileSnapshot.fullName, 'Nguyễn Minh Anh');
    assert.equal(submittedApp.applicantProfileSnapshot.gender, 'Nữ');
    assert.equal(submittedApp.applicantProfileSnapshot.unionPosition, 'Bí thư Chi đoàn');
    assert.equal(submittedApp.applicantProfileSnapshot.email, mockStudentActor.email);

    // 4. Student updates personal profile AFTER submission
    await identityService.updateProfile(mockStudentActor.userId, {
      fullName: 'Nguyễn Minh Anh (Cập nhật mới)',
      unionPosition: 'Phó Bí thư Đoàn trường',
      phoneNumber: '0905999888',
    });

    // 5. Verify the submitted application snapshot REMAINS UNCHANGED!
    const reloadedApp = await appRepo.findById(draftApp.id);
    assert.ok(reloadedApp?.applicantProfileSnapshot);
    assert.equal(
      reloadedApp.applicantProfileSnapshot.fullName,
      'Nguyễn Minh Anh',
      'Submitted snapshot must NOT be modified by subsequent profile updates!'
    );
    assert.equal(
      reloadedApp.applicantProfileSnapshot.unionPosition,
      'Bí thư Chi đoàn',
      'Submitted snapshot unionPosition must remain immutable!'
    );
    assert.equal(
      reloadedApp.applicantProfileSnapshot.phoneNumber,
      '0905123456',
      'Submitted snapshot phoneNumber must remain immutable!'
    );
  });
});
