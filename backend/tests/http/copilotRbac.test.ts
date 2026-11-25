import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app/createApp';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { FakeSessionRepository } from '../fakes/fakeSessionRepository';
import { FakePasswordResetRepository } from '../fakes/fakePasswordResetRepository';
import { getEnvironment } from '../../src/config/environment';

describe('Backend V2: Copilot RBAC Enforcement Tests', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    const fakeIdentityRepo = new FakeIdentityRepository();
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

  it('strictly blocks SCHOOL_OFFICER from accessing Copilot / AI endpoints with 403 FORBIDDEN_ROLE', async () => {
    const env = getEnvironment();
    const schoolOfficerToken = jwt.sign(
      {
        sub: 'officer-school-01',
        email: 'officer@dut.udn.vn',
        activeRole: 'SCHOOL_OFFICER',
      },
      env.JWT_ACCESS_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const endpoints = [
      { path: '/api/v2/copilot/ocr-cache', method: 'GET' },
      { path: '/api/v2/copilot/ocr-evidence', method: 'POST' },
      { path: '/api/v2/copilot/evaluate-application', method: 'POST' },
      { path: '/api/v2/copilot/dossier-summary', method: 'POST' },
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${baseUrl}${ep.path}`, {
        method: ep.method,
        headers: {
          Authorization: `Bearer ${schoolOfficerToken}`,
          'Content-Type': 'application/json',
        },
        body: ep.method === 'POST' ? JSON.stringify({}) : undefined,
      });

      assert.equal(res.status, 403, `Expected 403 for SCHOOL_OFFICER on ${ep.method} ${ep.path}`);
      const body = (await res.json()) as { success: boolean; errorCode: string; error: string };
      assert.equal(body.success, false);
      assert.equal(body.errorCode, 'FORBIDDEN_ROLE');
      assert.match(body.error, /cán bộ cấp Thành phố/);
    }
  });

  it('allows CITY_OFFICER to access Copilot endpoints', async () => {
    const env = getEnvironment();
    const cityOfficerToken = jwt.sign(
      {
        sub: 'officer-city-01',
        email: 'cityofficer@hsvdanang.vn',
        activeRole: 'CITY_OFFICER',
      },
      env.JWT_ACCESS_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const res = await fetch(`${baseUrl}/api/v2/copilot/ocr-cache`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cityOfficerToken}`,
      },
    });

    assert.equal(res.status, 200, 'Expected 200 for CITY_OFFICER on /ocr-cache');
    const body = (await res.json()) as { success: boolean };
    assert.equal(body.success, true);
  });
});
