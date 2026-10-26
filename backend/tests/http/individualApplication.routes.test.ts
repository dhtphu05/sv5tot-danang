/**
 * 5TOT Đà Nẵng — Individual Application HTTP Contract & Security Tests (Backend V2)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'http';
import { createApp } from '../../src/app/createApp';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { FakeSessionRepository } from '../fakes/fakeSessionRepository';
import { FakePasswordResetRepository } from '../fakes/fakePasswordResetRepository';
import { FakeInstitutionRepository } from '../fakes/fakeInstitutionRepository';
import { FakeSchoolReviewUnitRepository } from '../fakes/fakeSchoolReviewUnitRepository';
import { FakeSeasonRepository } from '../fakes/fakeSeasonRepository';
import { FakeCriteriaRepository } from '../fakes/fakeCriteriaRepository';
import { FakeIndividualApplicationRepository } from '../fakes/fakeIndividualApplicationRepository';
import { defaultPasswordHasher } from '../../src/modules/auth/passwordHasher';

describe('Backend V2: Individual Application HTTP Contract & Security Tests', () => {
  let server: Server;
  let testBaseUrl: string;

  let fakeIdentityRepo: FakeIdentityRepository;
  let fakeSessionRepo: FakeSessionRepository;
  let fakeResetRepo: FakePasswordResetRepository;
  let fakeInstRepo: FakeInstitutionRepository;
  let fakeUnitRepo: FakeSchoolReviewUnitRepository;
  let fakeSeasonRepo: FakeSeasonRepository;
  let fakeCriteriaRepo: FakeCriteriaRepository;
  let fakeAppRepo: FakeIndividualApplicationRepository;

  let studentToken: string;
  let studentUser: any;
  let otherStudentToken: string;
  let otherStudentUser: any;

  before(async () => {
    fakeIdentityRepo = new FakeIdentityRepository();
    fakeSessionRepo = new FakeSessionRepository();
    fakeResetRepo = new FakePasswordResetRepository();
    fakeInstRepo = new FakeInstitutionRepository();
    fakeUnitRepo = new FakeSchoolReviewUnitRepository();
    fakeSeasonRepo = new FakeSeasonRepository();
    fakeCriteriaRepo = new FakeCriteriaRepository();
    fakeAppRepo = new FakeIndividualApplicationRepository();

    const app = createApp({
      identityRepo: fakeIdentityRepo,
      sessionRepo: fakeSessionRepo,
      resetRepo: fakeResetRepo,
      institutionRepo: fakeInstRepo,
      unitRepo: fakeUnitRepo,
      seasonRepo: fakeSeasonRepo,
      criteriaRepo: fakeCriteriaRepo,
      applicationRepo: fakeAppRepo,
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        testBaseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    // 1. Seed primary student (DUT)
    const passHash = await defaultPasswordHasher.hash('StudentPass123!');
    studentUser = await fakeIdentityRepo.createStudent({
      email: 'sv.bk@dut.udn.vn',
      passwordHash: passHash,
      fullName: 'Sinh viên Bách khoa Đà Nẵng',
      studentCode: '102220001',
      institutionId: 'inst-dut',
    });

    const loginRes = await fetch(`${testBaseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: studentUser.email, password: 'StudentPass123!' }),
    });
    const loginBody = (await loginRes.json()) as any;
    studentToken = loginBody.data.tokens.accessToken;

    // 2. Seed other student
    const otherPassHash = await defaultPasswordHasher.hash('OtherPass123!');
    otherStudentUser = await fakeIdentityRepo.createStudent({
      email: 'sv.other@dut.udn.vn',
      passwordHash: otherPassHash,
      fullName: 'Sinh viên Khác',
      studentCode: '102220002',
      institutionId: 'inst-dut',
    });

    const otherLoginRes = await fetch(`${testBaseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: otherStudentUser.email, password: 'OtherPass123!' }),
    });
    const otherLoginBody = (await otherLoginRes.json()) as any;
    otherStudentToken = otherLoginBody.data.tokens.accessToken;
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  // --------------------------------------------------------------------------
  // 1. START / RESUME APPLICATION
  // --------------------------------------------------------------------------
  it('POST /api/v2/individual-applications/start creates new draft and returns 201', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/individual-applications/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 201);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(body.data.application.id);
    assert.equal(body.data.application.institutionId, 'inst-dut');
    assert.equal(body.data.application.schoolReviewUnitId, 'unit-udn');
    assert.equal(body.data.application.currentReviewStage, 'STUDENT_DRAFT');
    assert.equal(body.data.application.schoolPreliminaryStatus, 'NOT_SUBMITTED');
  });

  it('GET /api/v2/individual-applications/current returns current student application with 200', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/individual-applications/current`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(body.data.application);
    assert.equal(body.data.application.institutionId, 'inst-dut');
  });

  // --------------------------------------------------------------------------
  // 2. DRAFT AUTOSAVE & DECLARATIONS
  // --------------------------------------------------------------------------
  it('PATCH /api/v2/individual-applications/:id updates header fields with 200', async () => {
    const currentRes = await fetch(`${testBaseUrl}/api/v2/individual-applications/current`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const currentBody = (await currentRes.json()) as any;
    const appId = currentBody.data.application.id;

    const res = await fetch(`${testBaseUrl}/api/v2/individual-applications/${appId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        facultyName: 'Khoa Công nghệ Thông tin',
        className: '21TCLC_DT1',
        gpaScale4: 3.82,
        conductScore: 95,
        expectedVersion: 1,
      }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.application.gpaScale4, 3.82);
    assert.equal(body.data.application.conductScore, 95);
    assert.equal(body.data.application.version, 2);
  });

  it('POST /api/v2/individual-applications/:id/declarations adds a declaration item with 201', async () => {
    const currentRes = await fetch(`${testBaseUrl}/api/v2/individual-applications/current`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const appId = (await currentRes.json() as any).data.application.id;

    const res = await fetch(`${testBaseUrl}/api/v2/individual-applications/${appId}/declarations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        criterionCode: 'ACADEMIC',
        requirementCode: 'TC2.1',
        title: 'Điểm trung bình tích lũy 3.82',
        numericValue: 3.82,
        structuredAttributes: { gpaScale4: 3.82 },
      }),
    });

    assert.equal(res.status, 201);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.declaration.criterionCode, 'ACADEMIC');
    assert.equal(body.data.declaration.requirementCode, 'TC2.1');
  });

  // --------------------------------------------------------------------------
  // 3. READINESS & PRECHECK
  // --------------------------------------------------------------------------
  it('GET /api/v2/individual-applications/:id/readiness returns advisory readiness with 200', async () => {
    const currentRes = await fetch(`${testBaseUrl}/api/v2/individual-applications/current`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const appId = (await currentRes.json() as any).data.application.id;

    const res = await fetch(`${testBaseUrl}/api/v2/individual-applications/${appId}/readiness`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(body.data.readiness);
    // Non-blocking contract verification
    assert.equal(body.data.readiness.isSubmissionBlocked, false);
  });

  // --------------------------------------------------------------------------
  // 4. SUBMISSION ORCHESTRATION & IDEMPOTENCY
  // --------------------------------------------------------------------------
  it('POST /api/v2/individual-applications/:id/submit transitions to School Review Unit with 200', async () => {
    const currentRes = await fetch(`${testBaseUrl}/api/v2/individual-applications/current`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const appId = (await currentRes.json() as any).data.application.id;

    const res = await fetch(`${testBaseUrl}/api/v2/individual-applications/${appId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.application.currentReviewStage, 'SCHOOL_PRELIMINARY');
    assert.equal(body.data.application.schoolPreliminaryStatus, 'PENDING_SCHOOL_REVIEW');
    assert.equal(body.data.application.cityWorkflowStatus, 'NOT_AT_CITY');
    assert.equal(body.data.isDuplicateSubmission, false);
  });

  it('POST /api/v2/individual-applications/:id/submit is idempotent on duplicate call', async () => {
    const currentRes = await fetch(`${testBaseUrl}/api/v2/individual-applications/current`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const appId = (await currentRes.json() as any).data.application.id;

    const res = await fetch(`${testBaseUrl}/api/v2/individual-applications/${appId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.isDuplicateSubmission, true);
  });

  // --------------------------------------------------------------------------
  // 5. SECURITY & ACCESS CONTROL
  // --------------------------------------------------------------------------
  it('rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/individual-applications/current`);
    assert.equal(res.status, 401);
  });

  it('rejects access to another student application with 403 Forbidden', async () => {
    const dutRes = await fetch(`${testBaseUrl}/api/v2/individual-applications/current`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const dutAppId = (await dutRes.json() as any).data.application.id;

    // other student attempts to view dut student's application
    const res = await fetch(`${testBaseUrl}/api/v2/individual-applications/${dutAppId}`, {
      headers: { Authorization: `Bearer ${otherStudentToken}` },
    });

    assert.equal(res.status, 403);
  });

  // --------------------------------------------------------------------------
  // 6. OFFLINE FAIL-CLOSED VERIFICATION
  // --------------------------------------------------------------------------
  it('Production app without fakes returns 503 DATABASE_OFFLINE in offline mode', async () => {
    const offlineApp = createApp();
    let offlineServer: Server;
    let offlineUrl: string = '';

    await new Promise<void>((resolve) => {
      offlineServer = offlineApp.listen(0, '127.0.0.1', () => {
        const address = offlineServer.address() as any;
        offlineUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    try {
      const res = await fetch(`${offlineUrl}/api/v2/individual-applications/current`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      assert.equal(res.status, 503);
      const body = (await res.json()) as any;
      assert.ok(
        body.code === 'DATABASE_OFFLINE' || body.code === 'SERVICE_UNAVAILABLE',
        `Expected 503 error code to be DATABASE_OFFLINE or SERVICE_UNAVAILABLE, got ${body.code}`
      );
    } finally {
      await new Promise<void>((resolve) => offlineServer.close(() => resolve()));
    }
  });
});
