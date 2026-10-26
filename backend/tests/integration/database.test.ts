import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { dbManager } from '../../src/shared/database/prismaClient';

describe('Backend V2: Database Connectivity Integration Tests', () => {
  it('correctly reports connection status and failure reason without mocking success', async () => {
    const status = await dbManager.checkConnection();

    assert.equal(status.provider, 'postgresql');
    if (!process.env.DATABASE_URL) {
      assert.equal(status.connected, false);
      assert.equal(status.urlConfigured, false);
      assert.ok(status.error);
    } else {
      // If DATABASE_URL is configured, status.connected reflects actual network result
      assert.ok(typeof status.connected === 'boolean');
      if (status.connected) {
        assert.ok(typeof status.latencyMs === 'number');
      } else {
        assert.ok(status.error);
      }
    }
  });

  it('disconnects cleanly without throwing uncaught exceptions', async () => {
    await assert.doesNotReject(async () => {
      await dbManager.disconnect();
    });
  });
});
