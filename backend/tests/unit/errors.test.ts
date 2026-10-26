import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../../src/shared/errors/apiError';

describe('Backend V2: RFC 7807 Error Model Unit Tests', () => {
  it('creates badRequest with 400 status and invalid parameters', () => {
    const err = ApiError.badRequest('Trường "fullName" không được để trống.', 'INVALID_PAYLOAD', [
      { name: 'fullName', reason: 'REQUIRED' },
    ]);

    assert.equal(err.status, 400);
    assert.equal(err.code, 'INVALID_PAYLOAD');
    assert.equal(err.title, 'Yêu cầu không hợp lệ');
    assert.equal(err.detail, 'Trường "fullName" không được để trống.');
    assert.equal(err.invalidParams?.length, 1);
  });

  it('creates unauthorized error with 401 status', () => {
    const err = ApiError.unauthorized();
    assert.equal(err.status, 401);
    assert.equal(err.code, 'UNAUTHORIZED');
  });

  it('creates forbidden error with 403 status', () => {
    const err = ApiError.forbidden();
    assert.equal(err.status, 403);
    assert.equal(err.code, 'FORBIDDEN');
  });

  it('creates notFound error with 404 status', () => {
    const err = ApiError.notFound('Hồ sơ');
    assert.equal(err.status, 404);
    assert.match(err.detail, /Hồ sơ/);
  });

  it('creates conflict error with 409 status', () => {
    const err = ApiError.conflict('Xung đột phiên bản');
    assert.equal(err.status, 409);
    assert.equal(err.code, 'CONFLICT');
  });

  it('creates payloadTooLarge error with 413 status', () => {
    const err = ApiError.payloadTooLarge();
    assert.equal(err.status, 413);
  });

  it('creates tooManyRequests error with 429 status', () => {
    const err = ApiError.tooManyRequests(30);
    assert.equal(err.status, 429);
    assert.match(err.detail, /30 giây/);
  });

  it('creates serviceUnavailable error with 503 status', () => {
    const err = ApiError.serviceUnavailable();
    assert.equal(err.status, 503);
  });
});
