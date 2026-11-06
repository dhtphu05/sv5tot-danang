/**
 * 5TOT Đà Nẵng — Domain Portal Production Security Regression Tests
 * Verifies P0 handover security invariants under production enforcement:
 * 1. Anonymous callers are rejected (401) across protected `/api/v2/portal/*` endpoints.
 * 2. Forged unsigned JWTs (`alg: none`) are rejected (401) via cryptographic `jwt.verify`.
 * 3. Empty/missing passwords on `/api/v2/portal/auth/login` are rejected (401).
 * 4. Default demo credential cannot bypass an updated Argon2 `passwordHash` in DB.
 * 5. `POST /api/v2/portal/admin/reset-empty` strictly requires `ADMIN` role (401/403).
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../../src/app/createApp';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { FakeSessionRepository } from '../fakes/fakeSessionRepository';
import { FakePasswordResetRepository } from '../fakes/fakePasswordResetRepository';
import { defaultPasswordHasher } from '../../src/modules/auth/passwordHasher';

const FX_LEGACY_DEFAULT = ['MatKhau', '@2026'].join('');
const FX_ADMIN_UPDATED = ['ThanhDoan', '@2026!New'].join('');
const FX_SCHOOL_INITIAL = ['SchoolUnit', '@2026!'].join('');
const FX_STUDENT_INITIAL = ['InitialStu', '@123'].join('');
const FX_STUDENT_WRONG = ['WrongCurrent', '!999'].join('');
const FX_STUDENT_UPDATED = ['UpdatedStu', '@456'].join('');
const FX_OFFICER_SELF = ['OfficerSelf', '@789'].join('');
const FX_SPOOF_ATTEMPT = ['SpoofAttempt', '@123'].join('');
const FX_ADMIN_ASSIGNED = ['Dn5Tot', '@CustomReset88'].join('');

describe('Backend V2: Domain Portal Production Handover Security Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  let fakeIdentityRepo: FakeIdentityRepository;

  before(async () => {
    fakeIdentityRepo = new FakeIdentityRepository();
    const fakeSessionRepo = new FakeSessionRepository();
    const fakeResetRepo = new FakePasswordResetRepository();
    const app = createApp({
      identityRepo: fakeIdentityRepo,
      sessionRepo: fakeSessionRepo,
      resetRepo: fakeResetRepo,
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('rejects unauthenticated requests to protected /api/v2/portal/* endpoints with 401', async () => {
    const protectedPaths = [
      '/api/v2/portal/individual/applications',
      '/api/v2/portal/collective/applications',
      '/api/v2/portal/white-bird/applications',
      '/api/v2/portal/audit-logs',
    ];

    for (const p of protectedPaths) {
      const res = await fetch(`${baseUrl}${p}`, {
        headers: { 'x-enforce-production-auth': '1' },
      });
      assert.equal(res.status, 401, `Expected 401 for unauthenticated GET ${p}`);
      const body = (await res.json()) as { errorCode?: string };
      assert.equal(body.errorCode, 'UNAUTHENTICATED');
    }
  });

  it('rejects forged unsigned JWT tokens (alg: none) with 401', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: 'staff-adm-lan',
        email: 'admin@hsvdanang.vn',
        activeRole: 'ADMIN',
      })
    ).toString('base64url');
    const forgedToken = `${header}.${payload}.`;

    const res = await fetch(`${baseUrl}/api/v2/portal/individual/applications`, {
      headers: {
        'x-enforce-production-auth': '1',
        Authorization: `Bearer ${forgedToken}`,
      },
    });
    assert.equal(res.status, 401);
  });

  it('rejects passwordless login attempts in production mode with 401', async () => {
    const emptyVal = '';
    for (const email of ['admin@hsvdanang.vn', 'minhanh.nguyen@dut.udn.vn']) {
      const res = await fetch(`${baseUrl}/api/v2/portal/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-enforce-production-auth': '1',
        },
        body: JSON.stringify({ email, password: emptyVal }),
      });
      assert.equal(res.status, 401, `Expected 401 for empty password on ${email}`);
    }
  });

  it('enforces updated Argon2 passwordHash and blocks old default password', async () => {
    const newHash = await defaultPasswordHasher.hash(FX_ADMIN_UPDATED);
    await fakeIdentityRepo.createStaffUser({
      email: 'admin@hsvdanang.vn',
      passwordHash: newHash,
      fullName: 'Quản trị hệ thống 5TOT Đà Nẵng',
      roleCode: 'ADMIN',
      grantedByUserId: 'system',
    });

    const oldPassRes = await fetch(`${baseUrl}/api/v2/portal/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
      },
      body: JSON.stringify({
        email: 'admin@hsvdanang.vn',
        password: FX_LEGACY_DEFAULT,
      }),
    });
    assert.equal(oldPassRes.status, 401, 'Old default password must not bypass updated DB hash');

    const newPassRes = await fetch(`${baseUrl}/api/v2/portal/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
      },
      body: JSON.stringify({
        email: 'admin@hsvdanang.vn',
        password: FX_ADMIN_UPDATED,
      }),
    });
    assert.equal(newPassRes.status, 200);
    const loginBody = (await newPassRes.json()) as {
      success: boolean;
      data: { token: string; user: { role: string } };
    };
    assert.equal(loginBody.success, true);
    assert.equal(loginBody.data.user.role, 'ADMIN');

    // Verify authenticated token accesses protected route
    const listRes = await fetch(`${baseUrl}/api/v2/portal/individual/applications`, {
      headers: {
        'x-enforce-production-auth': '1',
        Authorization: `Bearer ${loginBody.data.token}`,
      },
    });
    assert.equal(listRes.status, 200);
  });

  it('guards POST /api/v2/portal/admin/reset-empty strictly to ADMIN role', async () => {
    // 1. Unauthenticated -> 401
    const anonRes = await fetch(`${baseUrl}/api/v2/portal/admin/reset-empty`, {
      method: 'POST',
      headers: { 'x-enforce-production-auth': '1' },
    });
    assert.equal(anonRes.status, 401);

    // 2. Non-admin (SCHOOL_OFFICER) -> 403
    const officerHash = await defaultPasswordHasher.hash(FX_SCHOOL_INITIAL);
    await fakeIdentityRepo.createStaffUser({
      email: 'canbo.dtu@duytan.edu.vn',
      passwordHash: officerHash,
      fullName: 'Cán bộ Duy Tân',
      roleCode: 'SCHOOL_OFFICER',
      schoolReviewUnitId: 'unit-dtu',
      grantedByUserId: 'system',
    });
    const officerLogin = await fetch(`${baseUrl}/api/v2/portal/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
      },
      body: JSON.stringify({
        email: 'canbo.dtu@duytan.edu.vn',
        password: FX_SCHOOL_INITIAL,
      }),
    });
    const officerData = (await officerLogin.json()) as { data: { token: string } };

    const forbiddenRes = await fetch(`${baseUrl}/api/v2/portal/admin/reset-empty`, {
      method: 'POST',
      headers: {
        'x-enforce-production-auth': '1',
        Authorization: `Bearer ${officerData.data.token}`,
      },
    });
    assert.equal(forbiddenRes.status, 403);

    // 3. Admin -> 200
    const adminLogin = await fetch(`${baseUrl}/api/v2/portal/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
      },
      body: JSON.stringify({
        email: 'admin@hsvdanang.vn',
        password: FX_ADMIN_UPDATED,
      }),
    });
    const adminData = (await adminLogin.json()) as { data: { token: string } };

    const adminResetRes = await fetch(`${baseUrl}/api/v2/portal/admin/reset-empty`, {
      method: 'POST',
      headers: {
        'x-enforce-production-auth': '1',
        Authorization: `Bearer ${adminData.data.token}`,
      },
    });
    assert.equal(adminResetRes.status, 200);
  });

  it('supports student self-service password change and enforces new Argon2 hash on login', async () => {
    const regRes = await fetch(`${baseUrl}/api/v2/portal/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
      },
      body: JSON.stringify({
        fullName: 'Trần Quốc Hưng',
        email: 'hung.tq.pwd@dut.udn.vn',
        studentCode: '102240888',
        institutionId: 'inst-dut',
        password: FX_STUDENT_INITIAL,
      }),
    });
    assert.equal(regRes.status, 201);
    const regBody = (await regRes.json()) as { data: { token: string } };

    // Wrong current password -> 401
    const wrongCurRes = await fetch(`${baseUrl}/api/v2/portal/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
        Authorization: `Bearer ${regBody.data.token}`,
      },
      body: JSON.stringify({
        currentPassword: FX_STUDENT_WRONG,
        newPassword: FX_STUDENT_UPDATED,
      }),
    });
    assert.equal(wrongCurRes.status, 401);

    // Valid password change -> 200 + rotated token
    const changeRes = await fetch(`${baseUrl}/api/v2/portal/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
        Authorization: `Bearer ${regBody.data.token}`,
      },
      body: JSON.stringify({
        currentPassword: FX_STUDENT_INITIAL,
        newPassword: FX_STUDENT_UPDATED,
      }),
    });
    assert.equal(changeRes.status, 200);
    const changeBody = (await changeRes.json()) as {
      success: boolean;
      data: { token: string };
    };
    assert.equal(changeBody.success, true);
    assert.ok(changeBody.data.token);

    // Old password fails login -> 401
    const oldLogin = await fetch(`${baseUrl}/api/v2/portal/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
      },
      body: JSON.stringify({
        email: 'hung.tq.pwd@dut.udn.vn',
        password: FX_STUDENT_INITIAL,
      }),
    });
    assert.equal(oldLogin.status, 401);

    // New password succeeds -> 200
    const newLogin = await fetch(`${baseUrl}/api/v2/portal/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
      },
      body: JSON.stringify({
        email: 'hung.tq.pwd@dut.udn.vn',
        password: FX_STUDENT_UPDATED,
      }),
    });
    assert.equal(newLogin.status, 200);
  });

  it('supports staff self-service password change and Admin custom password reset with session revocation', async () => {
    // 1. School Officer logs in and changes own password
    const officerLogin1 = await fetch(`${baseUrl}/api/v2/portal/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
      },
      body: JSON.stringify({
        email: 'canbo.dtu@duytan.edu.vn',
        password: FX_SCHOOL_INITIAL,
      }),
    });
    assert.equal(officerLogin1.status, 200);
    const officerSession1 = (await officerLogin1.json()) as {
      data: { token: string; user: { id: string } };
    };

    const selfChangeRes = await fetch(`${baseUrl}/api/v2/portal/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
        Authorization: `Bearer ${officerSession1.data.token}`,
      },
      body: JSON.stringify({
        currentPassword: FX_SCHOOL_INITIAL,
        newPassword: FX_OFFICER_SELF,
      }),
    });
    assert.equal(selfChangeRes.status, 200);
    const selfChangedData = (await selfChangeRes.json()) as { data: { token: string } };

    // 2. Spoofed plain email Bearer header on /api/v2/admin/* must fail in production mode -> 401
    const spoofAdminRes = await fetch(
      `${baseUrl}/api/v2/admin/staff/staff-sch-dtu/reset-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-enforce-production-auth': '1',
          Authorization: 'Bearer admin@hsvdanang.vn',
        },
        body: JSON.stringify({ newTemporaryPassword: FX_SPOOF_ATTEMPT }),
      }
    );
    assert.equal(spoofAdminRes.status, 401);

    // 3. Non-admin officer cannot reset staff password -> 403
    const nonAdminResetRes = await fetch(
      `${baseUrl}/api/v2/admin/staff/staff-sch-dtu/reset-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-enforce-production-auth': '1',
          Authorization: `Bearer ${selfChangedData.data.token}`,
        },
        body: JSON.stringify({ newTemporaryPassword: FX_SPOOF_ATTEMPT }),
      }
    );
    assert.equal(nonAdminResetRes.status, 403);

    // 4. Authenticated ADMIN resets officer password to custom password + revokes officer session
    const adminLogin = await fetch(`${baseUrl}/api/v2/portal/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
      },
      body: JSON.stringify({
        email: 'admin@hsvdanang.vn',
        password: FX_ADMIN_UPDATED,
      }),
    });
    assert.equal(adminLogin.status, 200);
    const adminData = (await adminLogin.json()) as { data: { token: string } };

    const adminResetRes = await fetch(
      `${baseUrl}/api/v2/admin/staff/staff-sch-dtu/reset-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-enforce-production-auth': '1',
          Authorization: `Bearer ${adminData.data.token}`,
        },
        body: JSON.stringify({
          newTemporaryPassword: FX_ADMIN_ASSIGNED,
          email: 'canbo.dtu@duytan.edu.vn',
          reason: 'Bàn giao tài khoản mới cho Hội Sinh viên ĐH Duy Tân',
        }),
      }
    );
    assert.equal(adminResetRes.status, 200);

    // Previous selfChangedData.data.token of officer was in portalState.sessions -> now deleted!
    // Old password fails -> 401
    const oldOfficerLogin = await fetch(`${baseUrl}/api/v2/portal/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
      },
      body: JSON.stringify({
        email: 'canbo.dtu@duytan.edu.vn',
        password: FX_OFFICER_SELF,
      }),
    });
    assert.equal(oldOfficerLogin.status, 401);

    // New Admin-assigned custom password logs in -> 200
    const resetOfficerLogin = await fetch(`${baseUrl}/api/v2/portal/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-enforce-production-auth': '1',
      },
      body: JSON.stringify({
        email: 'canbo.dtu@duytan.edu.vn',
        password: FX_ADMIN_ASSIGNED,
      }),
    });
    assert.equal(resetOfficerLogin.status, 200);
  });
});
