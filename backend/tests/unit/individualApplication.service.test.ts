/**
 * 5TOT Đà Nẵng — Individual Application Domain Service Unit Tests (Backend V2)
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FakeIndividualApplicationRepository } from '../fakes/fakeIndividualApplicationRepository';
import { FakeSeasonRepository } from '../fakes/fakeSeasonRepository';
import { FakeSchoolReviewUnitRepository } from '../fakes/fakeSchoolReviewUnitRepository';
import { FakeInstitutionRepository } from '../fakes/fakeInstitutionRepository';
import { FakeCriteriaRepository } from '../fakes/fakeCriteriaRepository';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { IndividualApplicationService } from '../../src/modules/individualApplications/individualApplication.service';
import { SeasonService } from '../../src/modules/seasons/season.service';
import { SchoolReviewUnitService } from '../../src/modules/schoolReviewUnits/schoolReviewUnit.service';
import { CriteriaService } from '../../src/modules/criteria/criteria.service';
import { AuthenticatedActor } from '../../src/modules/authorization/authorization.types';

describe('Backend V2: Individual Application Domain Service Unit Tests', () => {
  let fakeAppRepo: FakeIndividualApplicationRepository;
  let fakeSeasonRepo: FakeSeasonRepository;
  let fakeUnitRepo: FakeSchoolReviewUnitRepository;
  let fakeInstRepo: FakeInstitutionRepository;
  let fakeCriteriaRepo: FakeCriteriaRepository;
  let fakeIdentityRepo: FakeIdentityRepository;

  let seasonService: SeasonService;
  let unitService: SchoolReviewUnitService;
  let criteriaService: CriteriaService;
  let service: IndividualApplicationService;

  let studentDutActor: AuthenticatedActor;
  let studentDtuActor: AuthenticatedActor;
  let otherStudentActor: AuthenticatedActor;

  beforeEach(async () => {
    fakeAppRepo = new FakeIndividualApplicationRepository();
    fakeSeasonRepo = new FakeSeasonRepository();
    fakeUnitRepo = new FakeSchoolReviewUnitRepository();
    fakeInstRepo = new FakeInstitutionRepository();
    fakeCriteriaRepo = new FakeCriteriaRepository();
    fakeIdentityRepo = new FakeIdentityRepository();

    seasonService = new SeasonService(fakeSeasonRepo);
    unitService = new SchoolReviewUnitService(fakeUnitRepo, fakeInstRepo);
    criteriaService = new CriteriaService(fakeCriteriaRepo);

    service = new IndividualApplicationService(
      fakeAppRepo,
      seasonService,
      unitService,
      criteriaService,
      fakeIdentityRepo
    );

    studentDutActor = {
      userId: 'user-student-dut-01',
      email: 'student.dut@dut.udn.vn',
      fullName: 'Nguyễn Văn Bách Khoa',
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
      institutionId: 'inst-dut',
      schoolReviewUnitId: null,
      sessionId: 'sess-01',
    };

    studentDtuActor = {
      userId: 'user-student-dtu-01',
      email: 'student.dtu@duytan.edu.vn',
      fullName: 'Trần Thị Duy Tân',
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
      institutionId: 'inst-dtu',
      schoolReviewUnitId: null,
      sessionId: 'sess-02',
    };

    otherStudentActor = {
      userId: 'user-student-other-02',
      email: 'other.student@dut.udn.vn',
      fullName: 'Lê Văn Khác',
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
      institutionId: 'inst-dut',
      schoolReviewUnitId: null,
      sessionId: 'sess-03',
    };
  });

  // --------------------------------------------------------------------------
  // 1. APPLICATION CREATION & IDEMPOTENCY
  // --------------------------------------------------------------------------
  it('starts a new draft application and resolves authoritative school review unit (UDN -> unit-udn)', async () => {
    const app = await service.startOrResumeApplication(studentDutActor);

    assert.ok(app.id);
    assert.equal(app.applicantUserId, studentDutActor.userId);
    assert.equal(app.institutionId, 'inst-dut'); // Preserves student original institution!
    assert.equal(app.schoolReviewUnitId, 'unit-udn'); // Resolves to shared UDN review unit!
    assert.equal(app.currentReviewStage, 'STUDENT_DRAFT');
    assert.equal(app.schoolPreliminaryStatus, 'NOT_SUBMITTED');
    assert.equal(app.cityWorkflowStatus, 'NOT_AT_CITY');
    assert.equal(app.version, 1);

    // Audit log verification
    const createdAudit = fakeAppRepo.auditEvents.find((e) => e.action === 'INDIVIDUAL_APPLICATION_CREATED');
    assert.ok(createdAudit);
    assert.equal(createdAudit.applicationId, app.id);
    assert.equal(createdAudit.institutionId, 'inst-dut');
    assert.equal(createdAudit.schoolReviewUnitId, 'unit-udn');
  });

  it('idempotently returns existing application if called repeatedly for the same season and student', async () => {
    const app1 = await service.startOrResumeApplication(studentDutActor);
    const app2 = await service.startOrResumeApplication(studentDutActor);

    assert.equal(app1.id, app2.id);
    assert.equal(app1.applicationCode, app2.applicationCode);
    assert.equal(fakeAppRepo.applications.size, 1);
  });

  it('routes independent university (DTU) to its authorized review unit (unit-dtu)', async () => {
    const app = await service.startOrResumeApplication(studentDtuActor);

    assert.equal(app.institutionId, 'inst-dtu');
    assert.equal(app.schoolReviewUnitId, 'unit-dtu');
  });

  // --------------------------------------------------------------------------
  // 2. DRAFT AUTOSAVE & OPTIMISTIC CONCURRENCY
  // --------------------------------------------------------------------------
  it('partially updates draft application and increments version', async () => {
    const app = await service.startOrResumeApplication(studentDutActor);

    const updated = await service.updateDraft(studentDutActor, app.id, {
      facultyName: 'Khoa Công nghệ Thông tin',
      className: '21TCLC_DT1',
      gpaScale4: 3.65,
      conductScore: 92,
      expectedVersion: 1,
    });

    assert.equal(updated.facultyName, 'Khoa Công nghệ Thông tin');
    assert.equal(updated.className, '21TCLC_DT1');
    assert.equal(updated.gpaScale4, 3.65);
    assert.equal(updated.conductScore, 92);
    assert.equal(updated.version, 2);
  });

  it('optimistic locking: rejects draft update when expectedVersion differs from current version', async () => {
    const app = await service.startOrResumeApplication(studentDutActor);

    await assert.rejects(
      async () => {
        await service.updateDraft(studentDutActor, app.id, {
          facultyName: 'Outdated Tab Edit',
          expectedVersion: 999, // Stale version
        });
      },
      (err: any) => {
        assert.equal(err.status, 409);
        assert.equal(err.code, 'VERSION_CONFLICT');
        return true;
      }
    );
  });

  it('prevents modifying draft once officially submitted', async () => {
    const app = await service.startOrResumeApplication(studentDutActor);
    await service.submitApplication(studentDutActor, app.id);

    await assert.rejects(
      async () => {
        await service.updateDraft(studentDutActor, app.id, {
          facultyName: 'Attempted Post-Submission Edit',
        });
      },
      (err: any) => {
        assert.equal(err.status, 400);
        assert.ok(err.detail.includes('đã nộp'));
        return true;
      }
    );
  });

  // --------------------------------------------------------------------------
  // 3. DECLARATION MANAGEMENT & MULTI-EVIDENCE
  // --------------------------------------------------------------------------
  it('adds declaration items, links evidence, and updates application counters', async () => {
    const app = await service.startOrResumeApplication(studentDutActor);

    const declaration = await service.addDeclaration(studentDutActor, app.id, {
      criterionCode: 'ACADEMIC',
      requirementCode: 'TC2.1',
      title: 'Điểm trung bình học tập năm học 2025–2026',
      numericValue: 3.65,
      structuredAttributes: { gpaScale4: 3.65, scale: '4.0' },
      applicantNote: 'Đạt danh hiệu Sinh viên Giỏi',
      evidenceIds: ['ev-student-dut-01'],
    });

    assert.ok(declaration.id);
    assert.equal(declaration.criterionCode, 'ACADEMIC');
    assert.equal(declaration.requirementCode, 'TC2.1');
    assert.equal(declaration.evidenceLinks?.length, 1);

    // Verify application declared counts updated
    const fetched = await service.getApplicationById(studentDutActor, app.id);
    assert.equal(fetched.declaredCriteriaCount, 1);
    assert.equal(fetched.totalEvidenceCount, 1);
  });

  it('allows multiple declarations for voluntary alternative options under the same criterion', async () => {
    const app = await service.startOrResumeApplication(studentDutActor);

    // First declaration: GPA
    await service.addDeclaration(studentDutActor, app.id, {
      criterionCode: 'ACADEMIC',
      requirementCode: 'TC2.1',
      title: 'Điểm học tập GPA 3.7',
      numericValue: 3.7,
      evidenceIds: ['ev-student-dut-01'],
    });

    // Second declaration: NCKH award
    await service.addDeclaration(studentDutActor, app.id, {
      criterionCode: 'ACADEMIC',
      requirementCode: 'TC2.2',
      title: 'Đề tài NCKH cấp Trường đạt giải Nhất',
      evidenceIds: ['ev-student-dut-02'],
    });

    const declarations = await fakeAppRepo.listDeclarationsByApplicationId(app.id);
    assert.equal(declarations.length, 2);
    assert.equal(declarations[0].requirementCode, 'TC2.1');
    assert.equal(declarations[1].requirementCode, 'TC2.2');
  });

  it('updates and deletes a declaration item and recalculates counts', async () => {
    const app = await service.startOrResumeApplication(studentDutActor);

    const decl = await service.addDeclaration(studentDutActor, app.id, {
      criterionCode: 'PHYSICAL',
      requirementCode: 'TC3.1',
      title: 'Chứng nhận Thanh niên khỏe',
      evidenceIds: ['ev-student-dut-01'],
    });

    const updatedDecl = await service.updateDeclaration(studentDutActor, app.id, decl.id, {
      title: 'Chứng nhận Thanh niên khỏe cấp Thành phố',
    });
    assert.equal(updatedDecl.title, 'Chứng nhận Thanh niên khỏe cấp Thành phố');

    // Delete declaration
    await service.deleteDeclaration(studentDutActor, app.id, decl.id);
    const remaining = await fakeAppRepo.listDeclarationsByApplicationId(app.id);
    assert.equal(remaining.length, 0);

    const refreshedApp = await service.getApplicationById(studentDutActor, app.id);
    assert.equal(refreshedApp.declaredCriteriaCount, 0);
    assert.equal(refreshedApp.totalEvidenceCount, 0);
  });

  it('prevents linking evidence belonging to another student (403 Forbidden)', async () => {
    const app = await service.startOrResumeApplication(studentDutActor);
    const decl = await service.addDeclaration(studentDutActor, app.id, {
      criterionCode: 'ETHICS',
      requirementCode: 'TC1.1',
      title: 'Điểm rèn luyện',
    });

    // Create foreign evidence belonging to other student
    fakeAppRepo.evidenceObjects.set('ev-foreign-01', {
      id: 'ev-foreign-01',
      ownerUserId: 'user-foreign-student-99',
      originalFileName: 'foreign.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 50000,
      isFinalized: true,
      uploadedAt: new Date(),
    });

    await assert.rejects(
      async () => {
        await service.linkEvidence(studentDutActor, app.id, {
          declarationItemId: decl.id,
          evidenceObjectId: 'ev-foreign-01',
        });
      },
      (err: any) => {
        assert.equal(err.status, 403);
        assert.ok(err.detail.includes('không sở hữu'));
        return true;
      }
    );
  });

  // --------------------------------------------------------------------------
  // 4. ADVISORY PRECHECK & READINESS (NON-BLOCKING)
  // --------------------------------------------------------------------------
  it('evaluates advisory readiness: unmet criteria produce warnings but isSubmissionBlocked is FALSE', async () => {
    const app = await service.startOrResumeApplication(studentDutActor);

    // Only declared 1 requirement
    await service.addDeclaration(studentDutActor, app.id, {
      criterionCode: 'ACADEMIC',
      requirementCode: 'TC2.1',
      numericValue: 3.5,
      title: 'Điểm trung bình',
      evidenceIds: ['ev-student-dut-01'],
    });

    const readiness = await service.evaluateReadiness(studentDutActor, app.id);
    assert.equal(typeof readiness.readinessPercentage, 'number');
    assert.ok(readiness.missingRequirements.length > 0);
    // Crucial contract: Advisory check NEVER blocks submission!
    assert.equal(readiness.isSubmissionBlocked, false);
  });

  // --------------------------------------------------------------------------
  // 5. OFFICIAL SUBMISSION ORCHESTRATION & IDEMPOTENCY
  // --------------------------------------------------------------------------
  it('officially submits application to School Preliminary Review (no premature City assignment)', async () => {
    const app = await service.startOrResumeApplication(studentDutActor);

    const submission = await service.submitApplication(studentDutActor, app.id);
    assert.equal(submission.isDuplicateSubmission, false);
    assert.equal(submission.application.currentReviewStage, 'SCHOOL_PRELIMINARY');
    assert.equal(submission.application.schoolPreliminaryStatus, 'PENDING_SCHOOL_REVIEW');
    // Strict contract: City status remains NOT_AT_CITY!
    assert.equal(submission.application.cityWorkflowStatus, 'NOT_AT_CITY');
    assert.ok(submission.application.submittedToSchoolAt);

    // Outbox event created for school reviewer notification
    const outboxEvent = fakeAppRepo.outboxEvents.find(
      (e) => e.eventType === 'INDIVIDUAL_APPLICATION_SUBMITTED'
    );
    assert.ok(outboxEvent);
    assert.equal(outboxEvent.payload.schoolReviewUnitId, 'unit-udn');

    // Audit event created
    const submitAudit = fakeAppRepo.auditEvents.find(
      (e) => e.action === 'INDIVIDUAL_APPLICATION_SUBMITTED'
    );
    assert.ok(submitAudit);
    assert.equal(submitAudit.schoolReviewUnitId, 'unit-udn');
  });

  it('submission idempotency: duplicate submit request returns existing submitted application', async () => {
    const app = await service.startOrResumeApplication(studentDutActor);

    const sub1 = await service.submitApplication(studentDutActor, app.id);
    assert.equal(sub1.isDuplicateSubmission, false);

    // Double-click retry
    const sub2 = await service.submitApplication(studentDutActor, app.id);
    assert.equal(sub2.isDuplicateSubmission, true);
    assert.equal(sub2.application.id, app.id);
    assert.equal(sub2.application.schoolPreliminaryStatus, 'PENDING_SCHOOL_REVIEW');
  });

  // --------------------------------------------------------------------------
  // 6. STUDENT OWNERSHIP & CROSS-USER ISOLATION
  // --------------------------------------------------------------------------
  it('denies access when a student attempts to view or edit another student application (403 Forbidden)', async () => {
    const dutApp = await service.startOrResumeApplication(studentDutActor);

    await assert.rejects(
      async () => {
        await service.getApplicationById(otherStudentActor, dutApp.id);
      },
      (err: any) => {
        assert.equal(err.status, 403);
        assert.ok(err.detail.includes('sinh viên khác'));
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await service.updateDraft(otherStudentActor, dutApp.id, {
          facultyName: 'Malicious Overwrite',
        });
      },
      (err: any) => {
        assert.equal(err.status, 403);
        return true;
      }
    );
  });
});
