/**
 * 5TOT Đà Nẵng — Catalog & Regulatory HTTP Contract & Security Tests (Backend V2)
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
import { defaultPasswordHasher } from '../../src/modules/auth/passwordHasher';

describe('Backend V2: Catalog & Regulatory HTTP Contract & Security Tests', () => {
  let server: Server;
  let testBaseUrl: string;

  let fakeIdentityRepo: FakeIdentityRepository;
  let fakeSessionRepo: FakeSessionRepository;
  let fakeResetRepo: FakePasswordResetRepository;
  let fakeInstRepo: FakeInstitutionRepository;
  let fakeUnitRepo: FakeSchoolReviewUnitRepository;
  let fakeSeasonRepo: FakeSeasonRepository;
  let fakeCriteriaRepo: FakeCriteriaRepository;

  let studentToken: string;
  let adminToken: string;

  before(async () => {
    fakeIdentityRepo = new FakeIdentityRepository();
    fakeSessionRepo = new FakeSessionRepository();
    fakeResetRepo = new FakePasswordResetRepository();
    fakeInstRepo = new FakeInstitutionRepository();
    fakeUnitRepo = new FakeSchoolReviewUnitRepository();
    fakeSeasonRepo = new FakeSeasonRepository();
    fakeCriteriaRepo = new FakeCriteriaRepository();

    const app = createApp({
      identityRepo: fakeIdentityRepo,
      sessionRepo: fakeSessionRepo,
      resetRepo: fakeResetRepo,
      institutionRepo: fakeInstRepo,
      unitRepo: fakeUnitRepo,
      seasonRepo: fakeSeasonRepo,
      criteriaRepo: fakeCriteriaRepo,
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        testBaseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    // Seed student user & obtain token
    const studentPasswordHash = await defaultPasswordHasher.hash('StudentSecret123!');
    const student = await fakeIdentityRepo.createStudent({
      email: 'student.catalog@dut.udn.vn',
      passwordHash: studentPasswordHash,
      fullName: 'Sinh viên Kiểm thử Danh mục',
      studentCode: '102229988',
      institutionId: 'inst-dut',
    });

    const studentLogin = await fetch(`${testBaseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student.email, password: 'StudentSecret123!' }),
    });
    const studentLoginBody = (await studentLogin.json()) as any;
    studentToken = studentLoginBody.data.tokens.accessToken;

    // Seed admin user & obtain token
    const adminPasswordHash = await defaultPasswordHasher.hash('AdminSecret123!');
    const admin = await fakeIdentityRepo.createStaffUser({
      email: 'admin.catalog@danang.gov.vn',
      passwordHash: adminPasswordHash,
      fullName: 'Admin Quản trị Danh mục',
      roleCode: 'ADMIN',
      grantedByUserId: 'system',
    });

    const adminLogin = await fetch(`${testBaseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'AdminSecret123!' }),
    });
    const adminLoginBody = (await adminLogin.json()) as any;
    adminToken = adminLoginBody.data.tokens.accessToken;
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  // --------------------------------------------------------------------------
  // 1. INSTITUTION ENDPOINTS
  // --------------------------------------------------------------------------
  it('GET /api/v2/institutions returns 200 with list and pagination metadata', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/institutions`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.data));
    assert.ok(body.data.data.length >= 10);
    assert.equal(typeof body.data.pagination.totalCount, 'number');
  });

  it('GET /api/v2/institutions/:id returns 200 for valid institution', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/institutions/inst-dut`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.institution.id, 'inst-dut');
    assert.equal(body.data.institution.code, 'DUT');
    assert.equal(body.data.institution.group, 'UD_MEMBER_UNIVERSITY');
  });

  it('GET /api/v2/institutions/:id/faculties returns 200 with faculties list', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/institutions/inst-dut/faculties`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.faculties));
    assert.ok(body.data.faculties.some((f: any) => f.code === 'CNTT'));
  });

  // --------------------------------------------------------------------------
  // 2. SCHOOL REVIEW UNIT ENDPOINTS
  // --------------------------------------------------------------------------
  it('GET /api/v2/school-review-units returns 200 with review units', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-review-units`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.units));
    assert.ok(body.data.units.some((u: any) => u.code === 'UDN'));
  });

  it('GET /api/v2/school-review-units/resolve/:institutionId resolves UDN member correctly', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-review-units/resolve/inst-dut`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.resolved, true);
    assert.equal(body.data.unit.id, 'unit-udn');
    assert.equal(body.data.unit.code, 'UDN');
  });

  it('GET /api/v2/school-review-units/resolve/:institutionId resolves independent university correctly', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-review-units/resolve/inst-dtu`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.resolved, true);
    assert.equal(body.data.unit.id, 'unit-dtu');
  });

  // --------------------------------------------------------------------------
  // 3. AWARD SEASON ENDPOINTS
  // --------------------------------------------------------------------------
  it('GET /api/v2/seasons returns 200 with list of seasons', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/seasons`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.seasons));
  });

  it('GET /api/v2/seasons/active returns 200 with active season and timeline evaluation', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/seasons/active`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.season.code, '2025-2026');
    assert.equal(body.data.season.isActive, true);
    assert.ok(body.data.timeline);
    assert.ok(body.data.timeline.status);
  });

  // --------------------------------------------------------------------------
  // 4. CRITERIA CATALOG & ADVISORY EVALUATION ENDPOINTS
  // --------------------------------------------------------------------------
  it('GET /api/v2/seasons/:id/criteria returns exactly 5 Individual criteria', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/seasons/season-2025-2026/criteria`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.criteria));

    const codes = new Set(body.data.criteria.map((c: any) => c.code));
    assert.ok(codes.has('ETHICS'));
    assert.ok(codes.has('ACADEMIC'));
    assert.ok(codes.has('PHYSICAL'));
    assert.ok(codes.has('VOLUNTEER'));
    assert.ok(codes.has('INTEGRATION'));
    assert.equal(codes.size, 5);
  });

  it('GET /api/v2/seasons/:id/collective-criteria returns exactly 4 Collective criteria (TT01–TT04)', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/seasons/season-2025-2026/collective-criteria`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.criteria));
    assert.equal(body.data.criteria.length, 4);

    const codes = body.data.criteria.map((c: any) => c.code);
    assert.deepEqual(codes, ['TT01', 'TT02', 'TT03', 'TT04']);
  });

  it('POST /api/v2/criteria/evaluate-individual evaluates advisory readiness (isSubmissionBlocked: false)', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/criteria/evaluate-individual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        declarations: [
          { criterionCode: 'ACADEMIC', requirementCode: 'TC2.1', value: '3.5', evidenceCount: 1 },
          { criterionCode: 'ACADEMIC', requirementCode: 'TC2.3', value: 'IEEE Paper', evidenceCount: 1 },
        ],
      }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.criteriaResults.ACADEMIC.isMet, true);
    // Crucial contract: Advisory evaluation never blocks submission
    assert.equal(body.data.isSubmissionBlocked, false);
  });

  it('POST /api/v2/criteria/evaluate-collective evaluates TT01–TT04 with shared denominator', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/criteria/evaluate-collective`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalMembers: 30,
        participatingMembers: 30,
        recognizedMembers: 6,
        hasPriorSchoolRecognition: true,
        hasSchoolEvidenceAttached: true,
        noViolationsDeclared: true,
      }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.isOverallEligible, true);
    assert.equal(body.data.tt02.isMet, true);
    assert.equal(body.data.tt03.isMet, true);
    assert.equal(body.data.isSubmissionBlocked, false);
  });

  // --------------------------------------------------------------------------
  // 5. RBAC & SECURITY PROTECTION
  // --------------------------------------------------------------------------
  it('POST /api/v2/institutions returns 401 when Authorization header is missing', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/institutions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'TEST_INST',
        officialName: 'Trường Thử Nghiệm',
        shortName: 'TTN',
        group: 'AFFILIATED_UNIVERSITY',
      }),
    });

    assert.equal(res.status, 401);
  });

  it('POST /api/v2/institutions returns 403 Forbidden when called by a Student', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/institutions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        code: 'TEST_INST',
        officialName: 'Trường Thử Nghiệm',
        shortName: 'TTN',
        group: 'AFFILIATED_UNIVERSITY',
      }),
    });

    assert.equal(res.status, 403);
    const body = (await res.json()) as any;
    assert.equal(body.code, 'INSUFFICIENT_ROLE');
  });

  it('POST /api/v2/seasons returns 403 Forbidden when called by a Student', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/seasons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        code: '2026-2027',
        name: 'Năm học 2026–2027',
        individualSubmissionStart: '2027-09-01T00:00:00.000Z',
        individualSubmissionEnd: '2027-11-30T00:00:00.000Z',
        schoolForwardingDeadline: '2027-12-15T00:00:00.000Z',
        collectiveSubmissionStart: '2027-09-15T00:00:00.000Z',
        collectiveSubmissionEnd: '2027-11-30T00:00:00.000Z',
      }),
    });

    assert.equal(res.status, 403);
  });

  it('POST /api/v2/institutions returns 201 Created when called by an ADMIN', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/institutions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        code: 'NEW_UNIV',
        officialName: 'Trường Đại học Mới Thành Lập',
        shortName: 'NUM',
        group: 'AFFILIATED_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
      }),
    });

    assert.equal(res.status, 201);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.institution.code, 'NEW_UNIV');
  });

  // --------------------------------------------------------------------------
  // 6. OFFLINE FAIL-CLOSED VERIFICATION
  // --------------------------------------------------------------------------
  it('Production app without fakes returns 503 DATABASE_OFFLINE for DB-backed routes in offline mode', async () => {
    // Spin up real app instance with default Prisma repos (no fakes injected)
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
      const res = await fetch(`${offlineUrl}/api/v2/institutions`);
      assert.equal(res.status, 503);
      const body = (await res.json()) as any;
      assert.equal(body.code, 'DATABASE_OFFLINE');
    } finally {
      await new Promise<void>((resolve) => offlineServer.close(() => resolve()));
    }
  });
});
