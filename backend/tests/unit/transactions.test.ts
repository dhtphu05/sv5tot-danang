import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assertExpectedVersion } from '../../src/shared/database/optimisticLocking';
import { ApiError } from '../../src/shared/errors/apiError';

describe('Backend V2: Concurrency & Optimistic Locking Unit Tests', () => {
  it('passes when current version matches expected version', () => {
    const record = { id: 'app-001', version: 3 };
    assert.doesNotThrow(() => assertExpectedVersion(record, 3));
  });

  it('passes when expected version is omitted (non-optimistic update)', () => {
    const record = { id: 'app-001', version: 3 };
    assert.doesNotThrow(() => assertExpectedVersion(record, undefined));
  });

  it('throws 409 Conflict when current version differs from expected version', () => {
    const record = { id: 'app-001', version: 4 };

    assert.throws(
      () => assertExpectedVersion(record, 3, 'Hồ sơ'),
      (err: any) =>
        err instanceof ApiError &&
        err.status === 409 &&
        err.code === 'CONFLICT' &&
        err.detail.includes('đã được cập nhật bởi một người dùng hoặc quy trình khác')
    );
  });
});
