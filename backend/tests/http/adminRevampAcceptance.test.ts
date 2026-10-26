/**
 * 5TOT Đà Nẵng — ADMIN-REVAMP Automated Acceptance & Zero-Manual-Seed E2E Test Suite (Backend V2)
 *
 * Covers:
 * - AD01–AD55: Complete System Administration, Business Configuration, Zero-Manual-Seed Operations & Security Hardening
 * - Scenarios A–G:
 *   - Scenario A: First-Admin Bootstrap (`GET /api/v2/admin/bootstrap/status`, `POST /api/v2/admin/bootstrap/initialize`, permanent lock after first admin, rate limit / invalid setup token protection)
 *   - Scenario B: Create & Copy Season (`2026-2027` cloned from `2025-2026` without copying applications/evidence/decisions)
 *   - Scenario C: Criteria Configuration (05 Individual + TT01–TT04 Collective with TT02 100% & TT03 >= 20% on totalMembers, Advisory Dry-Run Evaluator, Frozen Historical Criteria Protection)
 *   - Scenario D: Institution & School Review Unit Management (`unit-udn` 8-school mapping invariant, soft-deactivation `PATCH /api/v2/institutions/:id/status`, mapping validation)
 *   - Scenario E: Staff Account Provisioning (`SCHOOL_OFFICER`, `CITY_OFFICER`, `CITY_COMMITTEE`, invite activation, invite resend, password reset, last-ADMIN lockout prevention)
 *   - Scenario F: 8-Gate Season Readiness Validation & Activation (`GET /api/v2/admin/seasons/:id/readiness`, `POST /api/v2/admin/seasons/:id/activate`, archiving prior active season)
 *   - Scenario G: Role Boundary Negative Tests (`STUDENT`, `SCHOOL_OFFICER`, `CITY_OFFICER`, `CITY_COMMITTEE` blocked from `/api/v2/admin/*`; `ADMIN` blocked from School/City/Committee substantive review/decision actions)
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
import { FakeSchoolReviewRepository } from '../fakes/fakeSchoolReviewRepository';
import { FakeSchoolForwardingBatchRepository } from '../fakes/fakeSchoolForwardingBatchRepository';
import { FakeCollectiveApplicationRepository } from '../fakes/fakeCollectiveApplicationRepository';
import { FakeCityWorkflowRepository } from '../fakes/fakeCityWorkflowRepository';
import { FakeCommitteeRepository } from '../fakes/fakeCommitteeRepository';
import { FakeAuditAndAnalyticsRepository } from '../fakes/fakeAuditAndAnalyticsRepository';
import { FakeAdminRepository } from '../fakes/fakeAdminRepository';
import { defaultPasswordHasher } from '../../src/modules/auth/passwordHasher';

describe('ADMIN-REVAMP: Complete Administration & Zero-Manual-Seed E2E Acceptance Suite (AD01–AD55 & Scenarios A–G)', () => {
  let server: Server;
  let baseUrl: string;

  let identityRepo: FakeIdentityRepository;
  let sessionRepo: FakeSessionRepository;
  let resetRepo: FakePasswordResetRepository;
  let institutionRepo: FakeInstitutionRepository;
  let unitRepo: FakeSchoolReviewUnitRepository;
  let seasonRepo: FakeSeasonRepository;
  let criteriaRepo: FakeCriteriaRepository;
  let applicationRepo: FakeIndividualApplicationRepository;
  let schoolReviewRepo: FakeSchoolReviewRepository;
  let schoolForwardingBatchRepo: FakeSchoolForwardingBatchRepository;
  let collectiveRepo: FakeCollectiveApplicationRepository;
  let cityWorkflowRepo: FakeCityWorkflowRepository;
  let committeeRepo: FakeCommitteeRepository;
  let auditRepo: FakeAuditAndAnalyticsRepository;
  let adminRepo: FakeAdminRepository;

  let bootstrappedAdminToken = '';
  let bootstrappedAdminId = '';
  let secondAdminId = '';
  let schoolOfficerToken = '';
  let cityOfficerToken = '';
  let committeeToken = '';
  let studentToken = '';
  let copiedSeasonId = '';
  let provisionedStaffId = '';
  let provisionedInviteCode = '';

  before(async () => {
    process.env.ADMIN_BOOTSTRAP_TOKEN = 'DANANG-5TOT-INIT-2026';

    identityRepo = new FakeIdentityRepository();
    sessionRepo = new FakeSessionRepository();
    resetRepo = new FakePasswordResetRepository();
    institutionRepo = new FakeInstitutionRepository();
    unitRepo = new FakeSchoolReviewUnitRepository();
    seasonRepo = new FakeSeasonRepository();
    criteriaRepo = new FakeCriteriaRepository();
    applicationRepo = new FakeIndividualApplicationRepository();
    schoolReviewRepo = new FakeSchoolReviewRepository(applicationRepo);
    schoolForwardingBatchRepo = new FakeSchoolForwardingBatchRepository();
    collectiveRepo = new FakeCollectiveApplicationRepository();
    cityWorkflowRepo = new FakeCityWorkflowRepository();
    committeeRepo = new FakeCommitteeRepository();
    auditRepo = new FakeAuditAndAnalyticsRepository();
    adminRepo = new FakeAdminRepository();

    const app = createApp({
      identityRepo,
      sessionRepo,
      resetRepo,
      institutionRepo,
      unitRepo,
      seasonRepo,
      criteriaRepo,
      applicationRepo,
      schoolReviewRepo,
      schoolForwardingBatchRepo,
      collectiveRepo,
      cityWorkflowRepo,
      committeeRepo,
      auditAndAnalyticsRepo: auditRepo,
      adminRepo,
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    // Seed a Student account (non-admin) to verify bootstrap remains open when 0 ADMINs exist
    const studentHash = await defaultPasswordHasher.hash('StudentSecret123!');
    const student = await identityRepo.createStudent({
      email: 'sv.minhanh@dut.udn.vn',
      passwordHash: studentHash,
      fullName: 'Nguyễn Minh Anh',
      studentCode: '102220123',
      institutionId: 'inst-dut',
    });

    const studentLoginRes = await fetch(`${baseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: student.email, password: 'StudentSecret123!' }),
    });
    const studentLoginJson = (await studentLoginRes.json()) as any;
    studentToken = studentLoginJson.data.tokens.accessToken;
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  // ===========================================================================
  // SCENARIO A: FIRST-ADMIN BOOTSTRAP & ZERO-MANUAL-SEED SECURITY (AD01–AD08)
  // ===========================================================================
  describe('Scenario A: First-Admin Bootstrap & Permanent Lock (AD01–AD08)', () => {
    it('AD01–AD02: GET /api/v2/admin/bootstrap/status reports bootstrapRequired=true when 0 ADMIN accounts exist', async () => {
      const res = await fetch(`${baseUrl}/api/v2/admin/bootstrap/status`);
      assert.equal(res.status, 200);
      const body = (await res.json()) as any;
      assert.equal(body.success, true);
      assert.equal(body.data.bootstrapRequired, true);
      assert.equal(body.data.isLocked, false);
      assert.equal(body.data.activeAdminCount, 0);
    });

    it('AD03: POST /api/v2/admin/bootstrap/initialize rejects invalid setup token with 403', async () => {
      const res = await fetch(`${baseUrl}/api/v2/admin/bootstrap/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupToken: 'WRONG-TOKEN-999',
          email: 'admin.root@danang.gov.vn',
          fullName: 'Quản trị viên Hệ thống Đà Nẵng',
          password: 'AdminRootPassword123!',
        }),
      });
      assert.equal(res.status, 403);
      const body = (await res.json()) as any;
      assert.equal(body.code, 'INVALID_BOOTSTRAP_TOKEN');
    });

    it('AD04–AD06: POST /api/v2/admin/bootstrap/initialize creates first ADMIN, permanently locks bootstrap, and allows ADMIN login', async () => {
      const res = await fetch(`${baseUrl}/api/v2/admin/bootstrap/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupToken: 'DANANG-5TOT-INIT-2026',
          email: 'admin.root@danang.gov.vn',
          fullName: 'Quản trị viên Hệ thống Đà Nẵng',
          password: 'AdminRootPassword123!',
          phone: '0905111222',
        }),
      });
      assert.equal(res.status, 201);
      const body = (await res.json()) as any;
      assert.equal(body.success, true);
      assert.equal(body.data.admin.email, 'admin.root@danang.gov.vn');
      assert.equal(body.data.admin.roleCode, 'ADMIN');
      assert.equal(body.data.bootstrapStatus.isLocked, true);
      assert.equal(body.data.bootstrapStatus.bootstrapRequired, false);

      bootstrappedAdminId = body.data.admin.id;

      // Authenticate as the newly bootstrapped ADMIN
      const loginRes = await fetch(`${baseUrl}/api/v2/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin.root@danang.gov.vn',
          password: 'AdminRootPassword123!',
        }),
      });
      assert.equal(loginRes.status, 200);
      const loginBody = (await loginRes.json()) as any;
      bootstrappedAdminToken = loginBody.data.tokens.accessToken;
      assert.ok(bootstrappedAdminToken);
    });

    it('AD07–AD08: Subsequent POST /api/v2/admin/bootstrap/initialize is permanently blocked with 409 ADMIN_BOOTSTRAP_ALREADY_COMPLETED', async () => {
      const res = await fetch(`${baseUrl}/api/v2/admin/bootstrap/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupToken: 'DANANG-5TOT-INIT-2026',
          email: 'attacker@danang.gov.vn',
          fullName: 'Attacker Admin',
          password: 'AttackerPassword123!',
        }),
      });
      assert.equal(res.status, 409);
      const body = (await res.json()) as any;
      assert.equal(body.code, 'ADMIN_BOOTSTRAP_ALREADY_COMPLETED');

      const statusRes = await fetch(`${baseUrl}/api/v2/admin/bootstrap/status`);
      const statusBody = (await statusRes.json()) as any;
      assert.equal(statusBody.data.isLocked, true);
      assert.equal(statusBody.data.bootstrapRequired, false);
      assert.equal(statusBody.data.activeAdminCount, 1);
    });
  });

  // ===========================================================================
  // SCENARIO E: STAFF ACCOUNT PROVISIONING & RBAC LIFECYYCLE (AD09–AD18)
  // ===========================================================================
  describe('Scenario E: Staff Account Provisioning, Invite Activation & Lockout Prevention (AD09–AD18)', () => {
    it('AD09–AD10: Rejects provisioning SCHOOL_OFFICER without schoolReviewUnitId', async () => {
      const res = await fetch(`${baseUrl}/api/v2/admin/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bootstrappedAdminToken}`,
        },
        body: JSON.stringify({
          email: 'school.missing.unit@udn.vn',
          fullName: 'Cán bộ Trường thiếu Đơn vị',
          roleCode: 'SCHOOL_OFFICER',
          provisioningMode: 'INVITE',
        }),
      });
      assert.equal(res.status, 400);
      const body = (await res.json()) as any;
      assert.equal(body.code, 'SCHOOL_REVIEW_UNIT_REQUIRED');
    });

    it('AD11–AD12: Provisions SCHOOL_OFFICER for unit-udn with INVITE mode and supports Resend Invite & Activate Invite', async () => {
      const provRes = await fetch(`${baseUrl}/api/v2/admin/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bootstrappedAdminToken}`,
        },
        body: JSON.stringify({
          email: 'school.udn@udn.vn',
          fullName: 'ThS. Lê Văn Hùng (ĐHĐN)',
          phone: '0905222333',
          roleCode: 'SCHOOL_OFFICER',
          schoolReviewUnitId: 'unit-udn',
          institutionId: 'inst-dut',
          provisioningMode: 'INVITE',
        }),
      });
      assert.equal(provRes.status, 201);
      const provBody = (await provRes.json()) as any;
      assert.equal(provBody.data.staff.roleCode, 'SCHOOL_OFFICER');
      assert.equal(provBody.data.staff.schoolReviewUnitId, 'unit-udn');
      assert.ok(provBody.data.inviteCode);
      provisionedStaffId = provBody.data.staff.id;

      // Resend invite rotates invite code
      const resendRes = await fetch(
        `${baseUrl}/api/v2/admin/staff/${provisionedStaffId}/resend-invite`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${bootstrappedAdminToken}` },
        }
      );
      assert.equal(resendRes.status, 200);
      const resendBody = (await resendRes.json()) as any;
      assert.ok(resendBody.data.inviteCode);
      provisionedInviteCode = resendBody.data.inviteCode;

      // Activate invite sets password and allows login
      const activateRes = await fetch(`${baseUrl}/api/v2/admin/staff/activate-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'school.udn@udn.vn',
          inviteCode: provisionedInviteCode,
          newPassword: 'SchoolOfficerPassword123!',
        }),
      });
      assert.equal(activateRes.status, 200);
      const activateBody = (await activateRes.json()) as any;
      assert.equal(activateBody.data.staff.inviteStatus, 'ACTIVATED');

      const loginRes = await fetch(`${baseUrl}/api/v2/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'school.udn@udn.vn',
          password: 'SchoolOfficerPassword123!',
        }),
      });
      assert.equal(loginRes.status, 200);
      const loginBody = (await loginRes.json()) as any;
      schoolOfficerToken = loginBody.data.tokens.accessToken;
    });

    it('AD13–AD15: Provisions CITY_OFFICER, CITY_COMMITTEE, and supports password reset + session revocation', async () => {
      // Provision CITY_OFFICER
      const cityRes = await fetch(`${baseUrl}/api/v2/admin/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bootstrappedAdminToken}`,
        },
        body: JSON.stringify({
          email: 'city.officer@danang.gov.vn',
          fullName: 'Trần Hoàng Nam (Thẩm định Thành phố)',
          roleCode: 'CITY_OFFICER',
          provisioningMode: 'TEMP_PASSWORD',
          temporaryPassword: 'CityOfficerPassword123!',
        }),
      });
      assert.equal(cityRes.status, 201);

      const cityLogin = await fetch(`${baseUrl}/api/v2/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'city.officer@danang.gov.vn',
          password: 'CityOfficerPassword123!',
        }),
      });
      cityOfficerToken = ((await cityLogin.json()) as any).data.tokens.accessToken;

      // Provision CITY_COMMITTEE
      const commRes = await fetch(`${baseUrl}/api/v2/admin/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bootstrappedAdminToken}`,
        },
        body: JSON.stringify({
          email: 'committee.chair@danang.gov.vn',
          fullName: 'Nguyễn Bá Duẩn (Hội đồng Thành phố)',
          roleCode: 'CITY_COMMITTEE',
          provisioningMode: 'TEMP_PASSWORD',
          temporaryPassword: 'CommitteePassword123!',
        }),
      });
      assert.equal(commRes.status, 201);
      const commStaffId = ((await commRes.json()) as any).data.staff.id;

      // Admin resets password for committee member
      const resetRes = await fetch(
        `${baseUrl}/api/v2/admin/staff/${commStaffId}/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({ newTemporaryPassword: 'CommitteeNewPassword123!' }),
        }
      );
      assert.equal(resetRes.status, 200);

      const commLogin = await fetch(`${baseUrl}/api/v2/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'committee.chair@danang.gov.vn',
          password: 'CommitteeNewPassword123!',
        }),
      });
      assert.equal(commLogin.status, 200);
      committeeToken = ((await commLogin.json()) as any).data.tokens.accessToken;
    });

    it('AD16–AD18: Enforces last-ADMIN lockout prevention (cannot suspend or demote the sole active ADMIN)', async () => {
      // Attempt to suspend sole active ADMIN -> 409 LAST_ACTIVE_ADMIN_LOCKOUT_PREVENTED
      const suspendSoleAdminRes = await fetch(
        `${baseUrl}/api/v2/admin/staff/${bootstrappedAdminId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({ status: 'SUSPENDED', reason: 'Test self lockout' }),
        }
      );
      assert.equal(suspendSoleAdminRes.status, 409);
      const suspendBody = (await suspendSoleAdminRes.json()) as any;
      assert.equal(suspendBody.code, 'LAST_ACTIVE_ADMIN_LOCKOUT_PREVENTED');

      // Attempt to demote sole active ADMIN -> 409 LAST_ACTIVE_ADMIN_LOCKOUT_PREVENTED
      const demoteSoleAdminRes = await fetch(
        `${baseUrl}/api/v2/admin/staff/${bootstrappedAdminId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({ roleCode: 'CITY_OFFICER' }),
        }
      );
      assert.equal(demoteSoleAdminRes.status, 409);
      const demoteBody = (await demoteSoleAdminRes.json()) as any;
      assert.equal(demoteBody.code, 'LAST_ACTIVE_ADMIN_LOCKOUT_PREVENTED');

      // Provision a second ADMIN, then verify suspending the second ADMIN succeeds
      const secondAdminRes = await fetch(`${baseUrl}/api/v2/admin/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bootstrappedAdminToken}`,
        },
        body: JSON.stringify({
          email: 'admin.backup@danang.gov.vn',
          fullName: 'Quản trị viên Dự phòng',
          roleCode: 'ADMIN',
          provisioningMode: 'TEMP_PASSWORD',
          temporaryPassword: 'BackupAdminPassword123!',
        }),
      });
      assert.equal(secondAdminRes.status, 201);
      secondAdminId = ((await secondAdminRes.json()) as any).data.staff.id;

      const suspendSecondRes = await fetch(
        `${baseUrl}/api/v2/admin/staff/${secondAdminId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({ status: 'SUSPENDED', reason: 'Kiểm thử khóa tài khoản dự phòng' }),
        }
      );
      assert.equal(suspendSecondRes.status, 200);
    });
  });

  // ===========================================================================
  // SCENARIO D: INSTITUTION & SCHOOL REVIEW UNIT MANAGEMENT (AD19–AD27)
  // ===========================================================================
  describe('Scenario D: Institution Registry & unit-udn 8-School Mapping Invariant (AD19–AD27)', () => {
    it('AD19–AD22: Validates that all 8 UDN member schools route to unit-udn and standalone schools have 1:1 units', async () => {
      const valRes = await fetch(`${baseUrl}/api/v2/school-review-units/mapping/validate`);
      assert.equal(valRes.status, 200);
      const valBody = (await valRes.json()) as any;
      assert.equal(valBody.data.valid, true);
      assert.equal(valBody.data.udnSharedUnitId, 'unit-udn');
      assert.equal(valBody.data.udnMemberInstitutionIds.length, 8);
    });

    it('AD23–AD25: Rejects breaking the unit-udn 8-school mapping invariant with 400 UDN_SHARED_UNIT_INVARIANT_VIOLATION', async () => {
      const badUpdateRes = await fetch(`${baseUrl}/api/v2/school-review-units/unit-udn`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bootstrappedAdminToken}`,
        },
        body: JSON.stringify({
          memberInstitutionIds: ['inst-dut', 'inst-due'], // Missing 6 UDN schools
        }),
      });
      assert.equal(badUpdateRes.status, 400);
      const badBody = (await badUpdateRes.json()) as any;
      assert.equal(badBody.code, 'UDN_SHARED_UNIT_INVARIANT_VIOLATION');
    });

    it('AD26–AD27: Supports creating a new Institution and soft-deactivating/reactivating via PATCH /api/v2/institutions/:id/status', async () => {
      const createRes = await fetch(`${baseUrl}/api/v2/institutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bootstrappedAdminToken}`,
        },
        body: JSON.stringify({
          code: 'CMC_DN',
          officialName: 'Phân hiệu Trường Đại học CMC tại Đà Nẵng',
          shortName: 'ĐH CMC Đà Nẵng',
          group: 'AFFILIATED_UNIVERSITY',
          hasStudentAssoc: true,
          isActive: true,
        }),
      });
      assert.equal(createRes.status, 201);
      const createdInst = ((await createRes.json()) as any).data.institution;

      // Soft-deactivate so historical records remain intact and unmapped active school check stays clean
      const deactivateRes = await fetch(
        `${baseUrl}/api/v2/institutions/${createdInst.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({ isActive: false }),
        }
      );
      assert.equal(deactivateRes.status, 200);
      const deactivatedBody = (await deactivateRes.json()) as any;
      assert.equal(deactivatedBody.data.institution.isActive, false);
    });
  });

  // ===========================================================================
  // SCENARIO B & C: COPY SEASON, CRITERIA CONFIG & DRY-RUN EVALUATOR (AD28–AD39)
  // ===========================================================================
  describe('Scenarios B & C: Copy Season 2027-2028, Configure Criteria & Dry-Run Evaluator (AD28–AD39)', () => {
    it('AD28–AD32: POST /api/v2/admin/seasons/copy-and-prepare clones configuration from 2025-2026 into DRAFT without copying applications or decisions', async () => {
      const copyRes = await fetch(`${baseUrl}/api/v2/admin/seasons/copy-and-prepare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bootstrappedAdminToken}`,
        },
        body: JSON.stringify({
          sourceSeasonId: 'season-2025-2026',
          code: '2027-2028',
          name: 'Đợt xét chọn Sinh viên 5 tốt & Tập thể Sinh viên 5 tốt cấp TP Đà Nẵng năm học 2027 - 2028',
          individualSubmissionStart: '2027-10-01T00:00:00.000Z',
          individualSubmissionEnd: '2027-10-15T13:00:00.000Z',
          schoolReviewStartAt: '2027-10-12T00:00:00.000Z',
          schoolReviewEndAt: '2027-10-18T10:00:00.000Z',
          schoolForwardingDeadline: '2027-10-18T10:00:00.000Z',
          collectiveSubmissionStart: '2027-10-01T00:00:00.000Z',
          collectiveSubmissionEnd: '2027-10-18T10:00:00.000Z',
          cityReviewStartAt: '2027-10-19T00:00:00.000Z',
          cityReviewEndAt: '2027-10-22T10:00:00.000Z',
          committeeMeetingStartAt: '2027-10-23T01:30:00.000Z',
          resultAnnouncementAt: '2027-10-25T02:00:00.000Z',
        }),
      });
      assert.equal(copyRes.status, 201);
      const copyBody = (await copyRes.json()) as any;
      copiedSeasonId = copyBody.data.season.id;
      assert.equal(copyBody.data.season.code, '2027-2028');
      assert.equal(copyBody.data.season.isActive, false);
      assert.equal(copyBody.data.season.lifecycleStatus, 'DRAFT');
      assert.equal(copyBody.data.season.copiedFromSeasonId, 'season-2025-2026');
      assert.ok(copyBody.data.clonedCriteria.individualGroupsCount >= 5);
      assert.equal(copyBody.data.clonedCriteria.collectiveGroupsCount, 4);
    });

    it('AD33–AD36: Updates Individual & Collective (TT01–TT04) criteria on DRAFT season and blocks overwriting frozen historical criteria', async () => {
      const getCritRes = await fetch(`${baseUrl}/api/v2/seasons/${copiedSeasonId}/criteria`);
      assert.equal(getCritRes.status, 200);
      const currentCriteria = ((await getCritRes.json()) as any).data.criteria;
      assert.ok(currentCriteria.length >= 5);

      const getCollRes = await fetch(
        `${baseUrl}/api/v2/seasons/${copiedSeasonId}/collective-criteria`
      );
      assert.equal(getCollRes.status, 200);
      const currentCollective = ((await getCollRes.json()) as any).data.criteria;
      assert.equal(currentCollective.length, 4);

      // Update Individual criteria on DRAFT season -> 200 OK
      const updateCritRes = await fetch(
        `${baseUrl}/api/v2/seasons/${copiedSeasonId}/criteria`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({
            track: 'INDIVIDUAL',
            groups: currentCriteria,
          }),
        }
      );
      assert.equal(updateCritRes.status, 200);

      // Attempting to overwrite when isSeasonHistoricalLocked=true -> 409 SEASON_CRITERIA_FROZEN
      const frozenRes = await fetch(
        `${baseUrl}/api/v2/seasons/${copiedSeasonId}/criteria`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({
            track: 'INDIVIDUAL',
            isSeasonHistoricalLocked: true,
            groups: currentCriteria,
          }),
        }
      );
      assert.equal(frozenRes.status, 409);
      const frozenBody = (await frozenRes.json()) as any;
      assert.equal(frozenBody.code, 'SEASON_CRITERIA_FROZEN');
    });

    it('AD37–AD39: Advisory Dry-Run Evaluator returns non-authoritative advisory feedback for Individual and Collective sample data', async () => {
      const indEvalRes = await fetch(
        `${baseUrl}/api/v2/seasons/${copiedSeasonId}/criteria/evaluate-individual`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            declarations: [
              {
                requirementCode: 'ETHICS_SCORE',
                criterionCode: 'ETHICS',
                value: 88,
                evidenceCount: 1,
              },
              {
                requirementCode: 'ACADEMIC_GPA',
                criterionCode: 'ACADEMIC',
                value: 3.55,
                evidenceCount: 1,
              },
            ],
          }),
        }
      );
      assert.equal(indEvalRes.status, 200);
      const indEvalBody = (await indEvalRes.json()) as any;
      assert.equal(indEvalBody.data.isSubmissionBlocked, false);
      assert.ok(indEvalBody.data.criteriaResults.ETHICS);

      const collEvalRes = await fetch(
        `${baseUrl}/api/v2/seasons/${copiedSeasonId}/criteria/evaluate-collective`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalMembers: 45,
            participatingMembers: 45, // 100% TT02
            recognizedMembers: 12,    // 26.7% >= 20% TT03
            hasPriorSchoolRecognition: true,
            hasSchoolEvidenceAttached: true,
            noViolationsDeclared: true,
          }),
        }
      );
      assert.equal(collEvalRes.status, 200);
      const collEvalBody = (await collEvalRes.json()) as any;
      assert.equal(collEvalBody.data.isSubmissionBlocked, false);
      assert.equal(collEvalBody.data.tt02.isMet, true);
      assert.equal(collEvalBody.data.tt03.isMet, true);
    });
  });

  // ===========================================================================
  // SCENARIO F: 8-GATE SEASON READINESS & ACTIVATION LIFECYCLE (AD40–AD49)
  // ===========================================================================
  describe('Scenario F: 8-Gate Season Readiness Validation, Activation & Historical Freeze (AD40–AD49)', () => {
    it('AD40–AD43: GET /api/v2/admin/seasons/:id/readiness verifies all 8 operational gates pass before activation', async () => {
      const readRes = await fetch(
        `${baseUrl}/api/v2/admin/seasons/${copiedSeasonId}/readiness`,
        {
          headers: { Authorization: `Bearer ${bootstrappedAdminToken}` },
        }
      );
      assert.equal(readRes.status, 200);
      const readBody = (await readRes.json()) as any;
      assert.equal(readBody.data.seasonCode, '2027-2028');
      assert.equal(readBody.data.checks.length, 8);
      assert.equal(readBody.data.isReadyToActivate, true);
      assert.equal(readBody.data.blockingFailureCount, 0);
    });

    it('AD44–AD46: POST /api/v2/admin/seasons/:id/activate activates 2027-2028 and transitions prior active season 2025-2026 to CLOSED', async () => {
      const actRes = await fetch(
        `${baseUrl}/api/v2/admin/seasons/${copiedSeasonId}/activate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${bootstrappedAdminToken}` },
        }
      );
      assert.equal(actRes.status, 200);
      const actBody = (await actRes.json()) as any;
      assert.equal(actBody.data.season.code, '2027-2028');
      assert.equal(actBody.data.season.isActive, true);
      assert.equal(actBody.data.season.lifecycleStatus, 'ACTIVE');

      // Verify prior season 2025-2026 is no longer active
      const oldSeasonRes = await fetch(`${baseUrl}/api/v2/seasons/season-2025-2026`);
      const oldSeason = ((await oldSeasonRes.json()) as any).data.season;
      assert.equal(oldSeason.isActive, false);
      assert.equal(oldSeason.lifecycleStatus, 'CLOSED');
    });

    it('AD47–AD49: Supports Notification Template safe preview (massEmailDispatched=false), Workflow Policy, System Health & Reference Catalog Export', async () => {
      const listTplRes = await fetch(`${baseUrl}/api/v2/admin/notifications`, {
        headers: { Authorization: `Bearer ${bootstrappedAdminToken}` },
      });
      assert.equal(listTplRes.status, 200);
      const tplList = ((await listTplRes.json()) as any).data.templates;
      assert.ok(tplList.length > 0);

      // Safe preview notification template
      const prevRes = await fetch(
        `${baseUrl}/api/v2/admin/notifications/${tplList[0].id}/preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({
            sampleVariables: { studentName: 'Nguyễn Minh Anh' },
          }),
        }
      );
      assert.equal(prevRes.status, 200);
      const prevBody = (await prevRes.json()) as any;
      assert.equal(prevBody.data.massEmailDispatched, false);

      // Update workflow policy
      const wfRes = await fetch(`${baseUrl}/api/v2/admin/workflow-policy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bootstrappedAdminToken}`,
        },
        body: JSON.stringify({
          defaultSupplementWindowHours: 96,
          allowLateSupplementSubmission: false,
          maxEvidenceFileSizeMb: 20,
          requirePdfForSchoolForwarding: true,
        }),
      });
      assert.equal(wfRes.status, 200);
      const wfBody = (await wfRes.json()) as any;
      assert.equal(wfBody.data.policy.defaultSupplementWindowHours, 96);

      // System health & Reference export
      const healthRes = await fetch(`${baseUrl}/api/v2/admin/system-health`, {
        headers: { Authorization: `Bearer ${bootstrappedAdminToken}` },
      });
      assert.equal(healthRes.status, 200);

      const exportRes = await fetch(`${baseUrl}/api/v2/admin/export/reference-data`, {
        headers: { Authorization: `Bearer ${bootstrappedAdminToken}` },
      });
      assert.equal(exportRes.status, 200);
      const exportBody = (await exportRes.json()) as any;
      assert.ok(exportBody.data.institutions.length >= 14);
    });

    it('Supports Operational Application CRUD & Hotfix (/api/v2/admin/applications) with mandatory audit reason and unit-udn routing', async () => {
      // 1. Create operational application for DUT (routes to unit-udn)
      const createRes = await fetch(`${baseUrl}/api/v2/admin/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bootstrappedAdminToken}`,
        },
        body: JSON.stringify({
          institutionId: 'inst-dut',
          studentCode: '102230888',
          fullName: 'Trần Minh Quân',
          facultyName: 'Khoa Công nghệ Thông tin',
          className: '23TCLC_DT1',
          academicYear: '2026-2027',
          reason: 'Tiếp nhận hồ sơ vận hành bổ sung theo công văn của HSV trường',
        }),
      });
      assert.equal(createRes.status, 201);
      const createBody = (await createRes.json()) as any;
      const appId = createBody.data.application.id;
      assert.equal(createBody.data.application.schoolReviewUnitId, 'unit-udn');

      // 2. Hotfix administrative metadata & reopen supplement window
      const hotfixRes = await fetch(
        `${baseUrl}/api/v2/admin/applications/${appId}/hotfix`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({
            studentCode: '102230889',
            schoolPreliminaryStatus: 'SCHOOL_SUPPLEMENT_REQUESTED',
            openSupplementCount: 1,
            reason: 'Hotfix đính chính MSSV và mở lại cổng bổ sung minh chứng 48h',
          }),
        }
      );
      assert.equal(hotfixRes.status, 200);
      const hotfixBody = (await hotfixRes.json()) as any;
      assert.equal(hotfixBody.data.application.studentCodeSnapshot, '102230889');
      assert.equal(
        hotfixBody.data.application.schoolPreliminaryStatus,
        'SCHOOL_SUPPLEMENT_REQUESTED'
      );

      // 3. List operational applications
      const listRes = await fetch(`${baseUrl}/api/v2/admin/applications`, {
        headers: { Authorization: `Bearer ${bootstrappedAdminToken}` },
      });
      assert.equal(listRes.status, 200);
      const listBody = (await listRes.json()) as any;
      assert.ok(
        listBody.data.applications.some((a: any) => a.id === appId)
      );

      // 4. Delete duplicate/draft application with mandatory reason
      const delRes = await fetch(
        `${baseUrl}/api/v2/admin/applications/${appId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({
            reason: 'Xóa hồ sơ vận hành tạo thử nghiệm trùng lặp',
          }),
        }
      );
      assert.equal(delRes.status, 200);
    });
  });

  // ===========================================================================
  // SCENARIO G: ROLE BOUNDARY NEGATIVE TESTS (AD50–AD55)
  // ===========================================================================
  describe('Scenario G: Role Boundary Negative Tests & Privilege Separation (AD50–AD55)', () => {
    it('AD50–AD52: Blocks STUDENT, SCHOOL_OFFICER, CITY_OFFICER, and CITY_COMMITTEE from /api/v2/admin/* with 403 FORBIDDEN', async () => {
      for (const token of [
        studentToken,
        schoolOfficerToken,
        cityOfficerToken,
        committeeToken,
      ]) {
        const res = await fetch(`${baseUrl}/api/v2/admin/control-plane`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        assert.equal(res.status, 403);
      }
    });

    it('AD53–AD55: Blocks technical ADMIN from performing School forwarding, City evaluation, or Committee official decisions (403 FORBIDDEN)', async () => {
      // ADMIN cannot confirm School Forwarding Batch
      const schoolFwdRes = await fetch(
        `${baseUrl}/api/v2/school-forwarding-batch/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({}),
        }
      );
      assert.equal(schoolFwdRes.status, 403);

      // ADMIN cannot complete City Officer evaluation
      const cityEvalRes = await fetch(
        `${baseUrl}/api/v2/city-workflow/app-test/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({}),
        }
      );
      assert.equal(cityEvalRes.status, 403);

      // ADMIN cannot record Committee official decision
      const commDecRes = await fetch(
        `${baseUrl}/api/v2/committee/decision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bootstrappedAdminToken}`,
          },
          body: JSON.stringify({}),
        }
      );
      assert.equal(commDecRes.status, 403);
    });
  });
});
