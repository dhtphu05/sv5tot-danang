/**
 * 5TOT Đà Nẵng — SRW-6 HTTP Integration Test Suite
 * Tests GET and PUT /api/v2/auth/profile endpoints using native http and fetch.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../../src/app/createApp';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { FakeSessionRepository } from '../fakes/fakeSessionRepository';
import { defaultPasswordHasher } from '../../src/modules/auth/passwordHasher';

describe('SRW-6 HTTP: /api/v2/auth/profile endpoints', () => {
  let fakeIdentityRepo: FakeIdentityRepository;
  let fakeSessionRepo: FakeSessionRepository;
  let testServer: http.Server;
  let baseUrl: string;
  let studentToken: string;

  before(async () => {
    fakeIdentityRepo = new FakeIdentityRepository();
    fakeSessionRepo = new FakeSessionRepository();

    const app = createApp({
      identityRepo: fakeIdentityRepo,
      sessionRepo: fakeSessionRepo,
    });

    await new Promise<void>((resolve) => {
      testServer = app.listen(0, '127.0.0.1', () => {
        const address = testServer.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });

    // Create student user with hashed password
    const passwordHash = await defaultPasswordHasher.hash('StudentSecret123!');
    await fakeIdentityRepo.createStudent({
      email: 'minhanh.nguyen@dut.udn.vn',
      passwordHash,
      fullName: 'Nguyễn Minh Anh',
      studentCode: '102220123',
      institutionId: 'inst-dut',
      phone: '0905123456',
    });

    // Log in to obtain genuine JWT access token
    const loginRes = await fetch(`${baseUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'minhanh.nguyen@dut.udn.vn',
        password: 'StudentSecret123!',
      }),
    });
    assert.equal(loginRes.status, 200);
    const loginData = (await loginRes.json()) as any;
    studentToken = loginData.data.tokens.accessToken;
    assert.ok(studentToken);
  });

  after(async () => {
    await new Promise<void>((resolve) => testServer.close(() => resolve()));
  });

  it('GET /api/v2/auth/profile returns profile and completeness', async () => {
    const res = await fetch(`${baseUrl}/api/v2/auth/profile`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.ok(body.data.profile);
    assert.equal(body.data.profile.fullName, 'Nguyễn Minh Anh');
    assert.equal(body.data.completeness.totalFields, 13);
  });

  it('PUT /api/v2/auth/profile updates profile and returns updated completeness', async () => {
    const res = await fetch(`${baseUrl}/api/v2/auth/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Nguyễn Minh Anh',
        gender: 'Nữ',
        dateOfBirth: '15/10/2004',
        ethnicity: 'Kinh',
        academicYearNumber: 3,
        educationLevel: 'Đại học',
        className: '22T_CLC1 - Khóa 2022',
        homeProvince: 'Thành phố Đà Nẵng',
        institutionId: 'inst-dut',
        unionPosition: 'Ủy viên Ban Chấp hành',
        politicalStatus: 'Đoàn viên',
        phoneNumber: '0905123456',
      }),
    });

    assert.equal(res.status, 200);
    const body = (await res.json()) as any;
    assert.equal(body.success, true);
    assert.equal(body.data.profile.gender, 'Nữ');
    assert.equal(body.data.completeness.isComplete, true);
    assert.equal(body.data.completeness.completedFields, 13);
  });

  it('PUT /api/v2/auth/profile rejects invalid phone number', async () => {
    const res = await fetch(`${baseUrl}/api/v2/auth/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '123456789',
      }),
    });

    assert.equal(res.status, 400);
    const body = (await res.json()) as any;
    assert.equal(body.code, 'INVALID_PHONE_NUMBER');
  });

  it('GET /api/v2/auth/profile requires authentication', async () => {
    const res = await fetch(`${baseUrl}/api/v2/auth/profile`);
    assert.equal(res.status, 401);
  });
});
