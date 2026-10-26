/**
 * 5TOT Đà Nẵng — Remediation R1 P0/P1 Security, Active Role, IDOR & Concurrency HTTP Tests
 *
 * Covers:
 * 1. P0 Committee Authorization: ADMIN cannot record decisions, reopen, or publish batches (403 Forbidden).
 * 2. P1 Active-Role Isolation: Possession of inactive role does NOT grant permission.
 * 3. P1 Evidence Cross-Unit IDOR: School Officer from unit A cannot view evidence from unit B.
 * 4. P1 Concurrency & Conflict: Duplicate review completion returns 409 Conflict.
 * 5. P1 City Shared Review: Obsolete /assign endpoint returns 400 ASSIGNMENT_WORKFLOW_RETIRED.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'http';
import { createApp } from '../../src/app/createApp';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { FakeSessionRepository } from '../fakes/fakeSessionRepository';
import { FakeIndividualApplicationRepository } from '../fakes/fakeIndividualApplicationRepository';
import { FakeEvidenceRepository } from '../fakes/fakeEvidenceRepository';
import { FakeCityWorkflowRepository } from '../fakes/fakeCityWorkflowRepository';
import { FakeCommitteeRepository } from '../fakes/fakeCommitteeRepository';
import { SessionService } from '../../src/modules/sessions/session.service';
import { defaultPasswordHasher } from '../../src/modules/auth/passwordHasher';

describe('Backend V2: Remediation R1 P0/P1 Security, Isolation & Concurrency HTTP Tests', () => {
  let server: Server;
  let baseUrl: string;

  let fakeIdentityRepo: FakeIdentityRepository;
  let fakeSessionRepo: FakeSessionRepository;
  let fakeAppRepo: FakeIndividualApplicationRepository;
  let fakeEvidenceRepo: FakeEvidenceRepository;
  let fakeCityWorkflowRepo: FakeCityWorkflowRepository;
  let fakeCommitteeRepo: FakeCommitteeRepository;
  let sessionService: SessionService;

  let adminToken: string;
  let committeeToken: string;
  let cityOfficerToken: string;
  let schoolOfficerUDNToken: string;
  let schoolOfficerDTUToken: string;
  let multiRoleStudentToken: string;

  before(async () => {
    fakeIdentityRepo = new FakeIdentityRepository();
    fakeSessionRepo = new FakeSessionRepository();
    fakeAppRepo = new FakeIndividualApplicationRepository();
    fakeEvidenceRepo = new FakeEvidenceRepository();
    fakeCityWorkflowRepo = new FakeCityWorkflowRepository();
    fakeCommitteeRepo = new FakeCommitteeRepository();
    sessionService = new SessionService(fakeSessionRepo, fakeIdentityRepo);

    const app = createApp({
      identityRepo: fakeIdentityRepo,
      sessionRepo: fakeSessionRepo,
      applicationRepo: fakeAppRepo,
      evidenceRepo: fakeEvidenceRepo,
      cityWorkflowRepo: fakeCityWorkflowRepo,
      committeeRepo: fakeCommitteeRepo,
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    const passwordHash = await defaultPasswordHasher.hash('SecurePass123!');

    // 1. Admin user
    const adminUser = await fakeIdentityRepo.createStaffUser({
      email: 'admin.sec@danang.gov.vn',
      fullName: 'Quản trị viên Hệ thống',
      passwordHash,
      roleCode: 'ADMIN',
      grantedByUserId: 'root',
    });
    const adminSess = await sessionService.createSession(adminUser, ['ADMIN'], 'ADMIN');
    adminToken = adminSess.accessToken;

    // 2. City Committee user
    const commUser = await fakeIdentityRepo.createStaffUser({
      email: 'committee.sec@danang.gov.vn',
      fullName: 'Hội đồng xét chọn Thành phố',
      passwordHash,
      roleCode: 'CITY_COMMITTEE',
      grantedByUserId: 'root',
    });
    const commSess = await sessionService.createSession(commUser, ['CITY_COMMITTEE'], 'CITY_COMMITTEE');
    committeeToken = commSess.accessToken;

    // 3. City Officer user
    const officerUser = await fakeIdentityRepo.createStaffUser({
      email: 'officer.sec@danang.gov.vn',
      fullName: 'Cán bộ Ban TTNTH',
      passwordHash,
      roleCode: 'CITY_OFFICER',
      grantedByUserId: 'root',
    });
    const officerSess = await sessionService.createSession(officerUser, ['CITY_OFFICER'], 'CITY_OFFICER');
    cityOfficerToken = officerSess.accessToken;

    // 4. School Officer UDN
    const udnUser = await fakeIdentityRepo.createStaffUser({
      email: 'officer.udn@udn.vn',
      fullName: 'Cán bộ ĐHĐN',
      passwordHash,
      roleCode: 'SCHOOL_OFFICER',
      schoolReviewUnitId: 'unit-udn',
      grantedByUserId: 'root',
    });
    const udnSess = await sessionService.createSession(
      udnUser,
      ['SCHOOL_OFFICER'],
      'SCHOOL_OFFICER',
      {},
      'unit-udn'
    );
    schoolOfficerUDNToken = udnSess.accessToken;

    // 5. School Officer DTU
    const dtuUser = await fakeIdentityRepo.createStaffUser({
      email: 'officer.dtu@dtu.edu.vn',
      fullName: 'Cán bộ Duy Tân',
      passwordHash,
      roleCode: 'SCHOOL_OFFICER',
      schoolReviewUnitId: 'unit-dtu',
      grantedByUserId: 'root',
    });
    const dtuSess = await sessionService.createSession(
      dtuUser,
      ['SCHOOL_OFFICER'],
      'SCHOOL_OFFICER',
      {},
      'unit-dtu'
    );
    schoolOfficerDTUToken = dtuSess.accessToken;

    // 6. Multi-role user: possesses ADMIN in roles, but activeRole is STUDENT
    const multiUser = await fakeIdentityRepo.createStudent({
      email: 'dual.user@danang.gov.vn',
      fullName: 'Dual Role User',
      passwordHash,
      studentCode: '25-MULTI-01',
      institutionId: 'inst-dut',
    });
    fakeIdentityRepo.roleAssignments.get(multiUser.id)?.push({
      id: `role-assign-admin-inactive`,
      userId: multiUser.id,
      roleCode: 'ADMIN',
      schoolReviewUnitId: null,
      isActive: true,
      grantedByUserId: 'root',
      grantedAt: new Date(),
      revokedAt: null,
      revokeReason: null,
    });
    const multiSess = await sessionService.createSession(
      multiUser,
      ['STUDENT', 'ADMIN'],
      'STUDENT'
    );
    multiRoleStudentToken = multiSess.accessToken;
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  describe('1. P0 Committee Authorization Remediation (REM-02)', () => {
    it('REJECTS technical ADMIN from recording Committee decision with 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/api/v2/committee/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          track: 'INDIVIDUAL',
          applicationId: 'app-ind-test-1',
          outcome: 'RECOGNIZED',
          decisionNote: 'Admin attempting illegal committee override',
        }),
      });

      assert.equal(res.status, 403);
      const data = (await res.json()) as any;
      assert.equal(data.code, 'INSUFFICIENT_ROLE');
    });

    it('REJECTS technical ADMIN from reopening Committee decision with 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/api/v2/committee/reopen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          track: 'INDIVIDUAL',
          applicationId: 'app-ind-test-1',
          reopenReason: 'Admin attempting illegal reopen',
        }),
      });

      assert.equal(res.status, 403);
    });

    it('REJECTS technical ADMIN from publishing recognition batch with 403 Forbidden', async () => {
      const res = await fetch(`${baseUrl}/api/v2/committee/publish-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          seasonId: 'season-2025-2026',
          track: 'INDIVIDUAL',
          decisionNumber: 'QĐ-01/SV5T',
          decisionTitle: 'Quyết định công nhận',
          decisionDate: '2026-01-09T00:00:00.000Z',
          signedByName: 'Trần Văn B',
          signedByTitle: 'Chủ tịch Hội đồng',
          applicationIds: ['app-ind-test-1'],
        }),
      });

      assert.equal(res.status, 403);
    });

    it('ALLOWS authorized CITY_COMMITTEE member to record decision', async () => {
      const res = await fetch(`${baseUrl}/api/v2/committee/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${committeeToken}`,
        },
        body: JSON.stringify({
          track: 'INDIVIDUAL',
          applicationId: 'app-ind-test-1',
          outcome: 'RECOGNIZED',
          decisionNote: 'Hội đồng thống nhất công nhận danh hiệu',
        }),
      });

      assert.equal(res.status, 200);
      const data = (await res.json()) as any;
      assert.equal(data.success, true);
      assert.equal(data.data.decision.outcome, 'RECOGNIZED');
    });
  });

  describe('2. P1 Active-Role Isolation Remediation (REM-04)', () => {
    it('DENIES user acting as STUDENT from accessing ADMIN endpoint even if ADMIN is in roles array', async () => {
      // Endpoint requiring ADMIN: e.g. POST /api/v2/seasons
      const res = await fetch(`${baseUrl}/api/v2/seasons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${multiRoleStudentToken}`,
        },
        body: JSON.stringify({
          seasonCode: '2027-2028',
          themeName: 'Test',
          individualSubmissionStartAt: '2027-09-01T00:00:00.000Z',
          individualSubmissionEndAt: '2027-10-31T00:00:00.000Z',
          schoolForwardingDeadlineAt: '2027-11-15T00:00:00.000Z',
          cityReviewCompletionDeadlineAt: '2027-12-15T00:00:00.000Z',
        }),
      });

      assert.equal(res.status, 403);
      const data = (await res.json()) as any;
      assert.equal(data.code, 'INSUFFICIENT_ROLE');
    });
  });

  describe('3. P1 Evidence Cross-Unit IDOR Remediation (REM-03)', () => {
    let evidenceObjId: string;

    before(async () => {
      // Seed an application in UDN
      fakeAppRepo.applications.set('app-udn-http-1', {
        id: 'app-udn-http-1',
        applicationCode: '25-IND-DUT-099',
        seasonId: 'season-2025-2026',
        applicantUserId: 'student-udn-1',
        fullNameSnapshot: 'Nguyễn Văn UDN',
        studentCodeSnapshot: '102210099',
        facultyName: 'Công nghệ Thông tin',
        className: '21TCLC_DT1',
        academicYear: '2025-2026',
        institutionId: 'inst-dut',
        schoolReviewUnitId: 'unit-udn',
        declaredCriteriaCount: 5,
        totalEvidenceCount: 3,
        currentReviewStage: 'SCHOOL_PRELIMINARY',
        schoolPreliminaryStatus: 'PENDING_SCHOOL_REVIEW',
        cityWorkflowStatus: 'CITY_UNASSIGNED',
        openSupplementCount: 0,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create evidence linked to app-udn-http-1
      const created = await fakeEvidenceRepo.createPendingObject({
        ownerUserId: 'student-udn-1',
        track: 'INDIVIDUAL',
        individualAppId: 'app-udn-http-1',
        originalFileName: 'bang-diem.pdf',
        mimeType: 'application/pdf',
        extension: 'pdf',
        sizeBytes: 2048,
        sha256Checksum: 'mock-hash',
        bucketName: 'mock-bucket',
        objectKey: 'mock-key',
      });
      await fakeEvidenceRepo.finalizeObject(created.id, {
        sha256Checksum: 'mock-hash',
        sizeBytes: 2048,
        scanStatus: 'CLEAN',
      });
      evidenceObjId = created.id;
    });

    it('DENIES School Officer from DTU accessing UDN evidence (Cross-Unit IDOR prevented)', async () => {
      const res = await fetch(`${baseUrl}/api/v2/evidence/${evidenceObjId}/view-url`, {
        headers: {
          Authorization: `Bearer ${schoolOfficerDTUToken}`,
        },
      });

      assert.equal(res.status, 403);
      const data = (await res.json()) as any;
      assert.equal(data.code, 'CROSS_UNIT_IDOR_PREVENTED');
    });

    it('ALLOWS School Officer from UDN to access UDN evidence', async () => {
      const res = await fetch(`${baseUrl}/api/v2/evidence/${evidenceObjId}/view-url`, {
        headers: {
          Authorization: `Bearer ${schoolOfficerUDNToken}`,
        },
      });

      assert.equal(res.status, 200);
      const data = (await res.json()) as any;
      assert.equal(data.success, true);
      assert.ok(data.data.viewUrl);
    });
  });

  describe('4. P1 City Shared Review & Concurrency Control (REM-05 & REM-07)', () => {
    it('returns 400 ASSIGNMENT_WORKFLOW_RETIRED on obsolete /city-workflow/assign endpoint', async () => {
      const res = await fetch(`${baseUrl}/api/v2/city-workflow/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          track: 'INDIVIDUAL',
          applicationId: 'app-ind-test-1',
          assignedOfficerUserId: 'user-officer-sec',
          assignedOfficerName: 'Cán bộ Ban TTNTH',
        }),
      });

      assert.equal(res.status, 400);
      const data = (await res.json()) as any;
      assert.equal(data.code, 'ASSIGNMENT_WORKFLOW_RETIRED');
    });

    it('enforces optimistic concurrency and conflict detection on review completion', async () => {
      const appId = 'app-concurrency-test-1';

      // Seed 5 criteria judgments for this application
      const criteria = ['ETHICS', 'ACADEMIC', 'PHYSICAL', 'VOLUNTEER', 'INTEGRATION'];
      for (const c of criteria) {
        await fakeCityWorkflowRepo.saveCityIndividualJudgment({
          applicationId: appId,
          criterionCode: c as any,
          judgmentStatus: 'SUITABLE',
          reviewerUserId: 'user-officer-sec',
          reviewerNameSnapshot: 'Cán bộ Ban TTNTH',
        });
      }

      // First complete review call -> 200 OK
      const res1 = await fetch(`${baseUrl}/api/v2/city-workflow/${appId}/complete?track=INDIVIDUAL`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cityOfficerToken}`,
        },
        body: JSON.stringify({
          summaryNote: 'Đạt toàn diện 5 tiêu chuẩn',
        }),
      });

      assert.equal(res1.status, 200);

      // Second complete review call (duplicate / concurrent completion) -> 409 Conflict
      const res2 = await fetch(`${baseUrl}/api/v2/city-workflow/${appId}/complete?track=INDIVIDUAL`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cityOfficerToken}`,
        },
        body: JSON.stringify({
          summaryNote: 'Đạt toàn diện 5 tiêu chuẩn (lặp lại)',
        }),
      });

      assert.equal(res2.status, 409);
      const data2 = (await res2.json()) as any;
      assert.equal(data2.code, 'APPLICATION_ALREADY_COMPLETED');
    });
  });
});
