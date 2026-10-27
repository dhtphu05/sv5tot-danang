import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../../src/app/createApp';

describe('Backend V2: Security Baseline HTTP Tests', () => {
  let server: http.Server;
  let baseUrl: string;

  before(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('enforces Helmet-equivalent security headers on all responses', async () => {
    const res = await fetch(`${baseUrl}/health/live`);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.ok(res.headers.get('content-security-policy'));
  });

  it('rejects untrusted client-asserted identity headers with 403 on /api/v2 endpoints', async () => {
    const res = await fetch(`${baseUrl}/api/v2/health/live`, {
      headers: {
        'x-5tot-actor-role': 'ADMIN',
        'x-5tot-actor-id': 'spoofed-user',
      },
    });

    assert.equal(res.status, 403);
    const body = (await res.json()) as any;
    assert.equal(body.code, 'REJECTED_IDENTITY_SPOOFING');
    assert.match(body.detail, /Không được phép gửi thông tin danh tính tự khẳng định/);
  });

  it('rejects unauthorized CORS origins with 403 on OPTIONS pre-flight', async () => {
    const res = await fetch(`${baseUrl}/api/v2/health/live`, {
      method: 'OPTIONS',
      headers: {
        origin: 'https://malicious-attacker-site.com',
        'access-control-request-method': 'POST',
      },
    });

    assert.equal(res.status, 403);
  });

  it('allows https://sv5tot.thanhdoandanang.org.vn CORS pre-flight and API requests', async () => {
    const preflightRes = await fetch(`${baseUrl}/api/v2/portal/auth/register`, {
      method: 'OPTIONS',
      headers: {
        origin: 'https://sv5tot.thanhdoandanang.org.vn',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type,authorization',
      },
    });

    assert.equal(preflightRes.status, 204);
    assert.equal(
      preflightRes.headers.get('access-control-allow-origin'),
      'https://sv5tot.thanhdoandanang.org.vn'
    );

    const getRes = await fetch(`${baseUrl}/api/v2/portal/collective/applications`, {
      method: 'GET',
      headers: {
        origin: 'https://sv5tot.thanhdoandanang.org.vn',
      },
    });

    assert.equal(getRes.status, 200);
    assert.equal(
      getRes.headers.get('access-control-allow-origin'),
      'https://sv5tot.thanhdoandanang.org.vn'
    );
  });
});
