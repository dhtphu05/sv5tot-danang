/**
 * 5TOT Đà Nẵng — School Forwarding Batch HTTP Contract & Security Tests (Backend V2)
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * SRW-1 HTTP Test Suite:
 * - Authenticated School batch lookup
 * - Draft creation & selection update
 * - Decision attachment validation
 * - Forward validation & pre-forwarding summary
 * - One-time atomic forward confirmation
 * - Request idempotency & payload mismatch conflict
 * - Authorization & role-based access control (Student blocked, School Officer isolated)
 * - City intake visibility & incoming batch listing
 * - Legacy forwarding endpoint retired verification
 * - Offline Real Mode fail-closed behavior
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'http';
import { createApp } from '../../src/app/createApp';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { FakeSessionRepository } from '../fakes/fakeSessionRepository';
import { FakePasswordResetRepository } from '../fakes/fakePasswordResetRepository';
import { FakeSchoolForwardingBatchRepository } from '../fakes/fakeSchoolForwardingBatchRepository';
import { PrismaSchoolForwardingBatchRepository } from '../../src/modules/schoolReviews/prismaSchoolForwardingBatch.repository';
import { defaultPasswordHasher } from '../../src/modules/auth/passwordHasher';

describe('Backend V2: School Forwarding Batch HTTP Contract & Security Tests (SRW-1)', () => {
  let server: Server;
  let testBaseUrl: string;

  let fakeIdentityRepo: FakeIdentityRepository;
  let fakeSessionRepo: FakeSessionRepository;
  let fakeResetRepo: FakePasswordResetRepository;
  let fakeBatchRepo: FakeSchoolForwardingBatchRepository;

  let udnOfficerToken: string;
  let dtuOfficerToken: string;
  let studentToken: string;
  let cityManagerToken: string;

  const seasonId = 'season-2025-2026';

  before(async () => {
    fakeIdentityRepo = new FakeIdentityRepository();
    fakeSessionRepo = new FakeSessionRepository();
    fakeResetRepo = new FakePasswordResetRepository();
    fakeBatchRepo = new FakeSchoolForwardingBatchRepository();

    const app = createApp({
      identityRepo: fakeIdentityRepo,
      sessionRepo: fakeSessionRepo,
      resetRepo: fakeResetRepo,
      schoolForwardingBatchRepo: fakeBatchRepo,
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        testBaseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    const passHash = await defaultPasswordHasher.hash('SecurePass123!');

    // 1. Seed UDN School Officer
    const udnOfficer = await fakeIdentityRepo.createStaffUser({
      email: 'officer@udn.vn',
      passwordHash: passHash,
      fullName: 'Cán bộ Ban Thư ký ĐHĐN',
      roleCode: 'SCHOOL_OFFICER',
      schoolReviewUnitId: 'unit-udn',
      grantedByUserId: 'system-bootstrap',
    });
    const loginUdn = await fetch(`${testBaseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: udnOfficer.email, password: 'SecurePass123!' }),
    });
    const bodyUdn = (await loginUdn.json()) as any;
    udnOfficerToken = bodyUdn.data.tokens.accessToken;

    // 2. Seed DTU School Officer
    const dtuOfficer = await fakeIdentityRepo.createStaffUser({
      email: 'officer@duytan.edu.vn',
      passwordHash: passHash,
      fullName: 'Cán bộ Đoàn Trường ĐH Duy Tân',
      roleCode: 'SCHOOL_OFFICER',
      schoolReviewUnitId: 'unit-dtu',
      grantedByUserId: 'system-bootstrap',
    });
    const loginDtu = await fetch(`${testBaseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: dtuOfficer.email, password: 'SecurePass123!' }),
    });
    const bodyDtu = (await loginDtu.json()) as any;
    dtuOfficerToken = bodyDtu.data.tokens.accessToken;

    // 3. Seed City Manager
    const cityManager = await fakeIdentityRepo.createStaffUser({
      email: 'manager@danang.gov.vn',
      passwordHash: passHash,
      fullName: 'Cán bộ Quản lý Thành phố',
      roleCode: 'CITY_MANAGER',
      grantedByUserId: 'system-bootstrap',
    });
    const loginCity = await fetch(`${testBaseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cityManager.email, password: 'SecurePass123!' }),
    });
    const bodyCity = (await loginCity.json()) as any;
    cityManagerToken = bodyCity.data.tokens.accessToken;

    // 4. Seed Student
    const student = await fakeIdentityRepo.createStudent({
      email: 'student.dut@dut.udn.vn',
      passwordHash: passHash,
      fullName: 'Sinh viên Bách khoa',
      studentCode: '10222001',
      institutionId: 'inst-dut',
    });
    const loginStudent = await fetch(`${testBaseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student.email, password: 'SecurePass123!' }),
    });
    const bodyStudent = (await loginStudent.json()) as any;
    studentToken = bodyStudent.data.tokens.accessToken;

    // Seed mock applications
    fakeBatchRepo.mockApplications = [
      { id: 'app-dut-1', seasonId, schoolReviewUnitId: 'unit-udn', institutionId: 'inst-dut', institutionName: 'ĐH Bách khoa - ĐHĐN', schoolPreliminaryStatus: 'ELIGIBLE_FOR_CITY', openSupplementCount: 0 },
      { id: 'app-due-1', seasonId, schoolReviewUnitId: 'unit-udn', institutionId: 'inst-due', institutionName: 'ĐH Kinh tế - ĐHĐN', schoolPreliminaryStatus: 'ELIGIBLE_FOR_CITY', openSupplementCount: 0 },
      { id: 'app-dtu-1', seasonId, schoolReviewUnitId: 'unit-dtu', institutionId: 'inst-dtu', institutionName: 'Trường ĐH Duy Tân', schoolPreliminaryStatus: 'ELIGIBLE_FOR_CITY', openSupplementCount: 0 },
    ];
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('1. GET /api/v2/school-forwarding-batch returns null when no draft exists', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-forwarding-batch?seasonId=${seasonId}`, {
      headers: { Authorization: `Bearer ${udnOfficerToken}` },
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data, null);
  });

  it('2. POST /api/v2/school-forwarding-batch/draft saves batch draft and selection list', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-forwarding-batch/draft`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${udnOfficerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seasonId,
        selectedApplicationIds: ['app-dut-1', 'app-due-1'],
        forwardingNote: 'Kính chuyển Ban Thư ký Thành Đoàn & HSV Thành phố',
      }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'DRAFT');
    assert.equal(body.data.applicationCount, 2);
    assert.deepEqual(body.data.selectedApplicationIds, ['app-dut-1', 'app-due-1']);
  });

  it('3. GET /api/v2/school-forwarding-batch/summary returns pre-forwarding validation metrics', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-forwarding-batch/summary?seasonId=${seasonId}`, {
      headers: { Authorization: `Bearer ${udnOfficerToken}` },
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.schoolReviewUnitId, 'unit-udn');
    assert.equal(body.data.selectedApplicationsCount, 2);
    assert.equal(body.data.canForward, false); // No decision doc attached yet
  });

  it('4. POST /api/v2/school-forwarding-batch/decision-document validates and attaches official PDF', async () => {
    // Non-PDF should fail
    const invalidRes = await fetch(`${testBaseUrl}/api/v2/school-forwarding-batch/decision-document`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${udnOfficerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seasonId,
        decisionNumber: '182/QĐ-ĐHĐN',
        decisionTitle: 'Quyết định đề xuất',
        decisionDate: '2026-10-18T00:00:00Z',
        signedByName: 'PGS.TS. Nguyễn Ngọc Vũ',
        signedByTitle: 'Giám đốc Đại học Đà Nẵng',
        fileId: 'file-123',
        fileName: 'decision.docx', // NOT PDF
        fileSize: 1048576,
      }),
    });
    assert.equal(invalidRes.status, 400);

    // Valid PDF attaches successfully
    const validRes = await fetch(`${testBaseUrl}/api/v2/school-forwarding-batch/decision-document`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${udnOfficerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seasonId,
        decisionNumber: '182/QĐ-ĐHĐN',
        decisionTitle: 'Quyết định đề xuất danh sách SV5T 2025-2026',
        decisionDate: '2026-10-18T00:00:00Z',
        signedByName: 'PGS.TS. Nguyễn Ngọc Vũ',
        signedByTitle: 'Giám đốc Đại học Đà Nẵng',
        fileId: 'file-182-pdf',
        fileName: '182_QD_DHDN_Danh_sach_SV5T.pdf',
        fileSize: 1048576,
      }),
    });

    assert.equal(validRes.status, 200);
    const body = (await validRes.json()) as any;
    assert.equal(body.data.decisionNumber, '182/QĐ-ĐHĐN');
    assert.equal(body.data.decisionFileName, '182_QD_DHDN_Danh_sach_SV5T.pdf');
  });

  it('5. POST /api/v2/school-forwarding-batch/confirm executes atomic one-time forwarding', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-forwarding-batch/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${udnOfficerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seasonId,
        idempotencyKey: 'http-test-key-001',
        forwardingNote: 'Chuyển chính thức lên cấp Thành phố',
      }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'FORWARDED');
    assert.equal(body.data.forwardedCount, 2);
    assert.equal(body.data.isDuplicateCallIdempotent, false);
  });

  it('6. POST /api/v2/school-forwarding-batch/confirm with same idempotency key returns idempotent success', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-forwarding-batch/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${udnOfficerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seasonId,
        idempotencyKey: 'http-test-key-001',
        forwardingNote: 'Chuyển chính thức lên cấp Thành phố',
      }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'FORWARDED');
    assert.equal(body.data.isDuplicateCallIdempotent, true);
  });

  it('7. POST /api/v2/school-forwarding-batch/confirm with same key but changed payload returns 409 Conflict', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-forwarding-batch/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${udnOfficerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seasonId,
        idempotencyKey: 'http-test-key-001',
        forwardingNote: 'Ghi chú đã bị sửa đổi!',
      }),
    });

    assert.equal(res.status, 409);
    const body = (await res.json()) as any;
    assert.equal(body.code, 'IDEMPOTENCY_PAYLOAD_MISMATCH');
  });

  it('8. POST /api/v2/school-forwarding-batch/confirm with different key returns 409 Conflict', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-forwarding-batch/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${udnOfficerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seasonId,
        idempotencyKey: 'different-key-002',
      }),
    });

    assert.equal(res.status, 409);
    const body = (await res.json()) as any;
    assert.equal(body.code, 'BATCH_ALREADY_FORWARDED');
  });

  it('9. Unauthorized access: Student actor receives 403 Forbidden', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-forwarding-batch`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    assert.equal(res.status, 403);
  });

  it('10. Invalid application membership: trying to add DTU app to UDN batch rejected with 400', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-forwarding-batch/draft`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dtuOfficerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seasonId,
        selectedApplicationIds: ['app-dut-1'], // DUT belongs to UDN, not DTU!
      }),
    });

    assert.equal(res.status, 400);
    const body = (await res.json()) as any;
    assert.equal(body.code, 'INVALID_SELECTED_APPLICATIONS');
  });

  it('11. GET /api/v2/city/incoming-batches allows City Manager to view forwarded batches', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/city/incoming-batches?seasonId=${seasonId}`, {
      headers: { Authorization: `Bearer ${cityManagerToken}` },
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.some((b: any) => b.schoolReviewUnitId === 'unit-udn' && b.status === 'FORWARDED'));
  });

  it('12. Legacy forward endpoint POST /api/v2/school-reviews/:id/forward is retired and returns 400', async () => {
    const res = await fetch(`${testBaseUrl}/api/v2/school-reviews/app-dut-1/forward`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${udnOfficerToken}` },
    });

    assert.equal(res.status, 400);
    const body = (await res.json()) as any;
    assert.equal(body.code, 'LEGACY_FORWARDING_RETIRED');
  });

  it('13. Offline Real Mode fail-closed behavior: Prisma repository fails closed when DB offline', async () => {
    const prismaRepo = new PrismaSchoolForwardingBatchRepository();
    await assert.rejects(
      prismaRepo.findBatchByUnitAndSeason('unit-udn', seasonId),
      (err: any) => {
        assert.equal(err.status, 503);
        assert.equal(err.code, 'DATABASE_OFFLINE');
        return true;
      }
    );
  });
});
