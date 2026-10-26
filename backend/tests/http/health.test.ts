import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../../src/app/createApp';

describe('Backend V2: Health & Readiness HTTP Tests', () => {
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

  it('GET /health/live returns 200 OK with service metadata and correlationId', async () => {
    const res = await fetch(`${baseUrl}/health/live`);
    assert.equal(res.status, 200);

    const body = (await res.json()) as any;
    assert.equal(body.status, 'ok');
    assert.equal(body.service, '5tot-danang-backend-v2');
    assert.equal(body.mode, 'PRODUCTION_BACKEND');
    assert.ok(typeof body.uptimeSeconds === 'number');
    assert.ok(res.headers.get('x-request-id'));
  });

  it('GET /api/v2/health/live returns 200 OK under versioned namespace', async () => {
    const res = await fetch(`${baseUrl}/api/v2/health/live`);
    assert.equal(res.status, 200);

    const body = (await res.json()) as any;
    assert.equal(body.status, 'ok');
    assert.equal(body.service, '5tot-danang-backend-v2');
  });

  it('GET /health/ready returns accurate database status reflecting live connectivity or offline mode', async () => {
    const res = await fetch(`${baseUrl}/health/ready`);
    const body = (await res.json()) as any;

    const { getEnvironment } = await import('../../src/config/environment');
    const env = getEnvironment();

    if (env.BACKEND_DATABASE_MODE === 'offline') {
      assert.equal(res.status, 503);
      assert.equal(body.status, 'degraded');
      assert.equal(body.dependencies.database.status, 'disconnected');
      assert.equal(body.dependencies.database.provider, 'postgresql');
      assert.ok(typeof body.dependencies.database.error === 'string');
      assert.equal(body.dependencies.objectStorage.provider, 'cloudflare-r2');
      assert.equal(body.dependencies.objectStorage.bucket, env.R2_BUCKET_NAME);
    } else if (process.env.DATABASE_URL) {
      assert.equal(res.status, 200);
      assert.equal(body.status, 'ok');
      assert.equal(body.dependencies.database.status, 'connected');
      assert.equal(body.dependencies.database.provider, 'postgresql');
      assert.ok(typeof body.dependencies.database.latencyMs === 'number');
    } else {
      assert.equal(res.status, 503);
      assert.equal(body.status, 'degraded');
      assert.equal(body.dependencies.database.status, 'disconnected');
      assert.equal(body.dependencies.database.provider, 'postgresql');
    }
  });
});

