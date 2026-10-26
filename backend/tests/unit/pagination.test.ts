import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePaginationParams,
  buildCursorPaginationResponse,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../src/shared/query/pagination';
import { ApiError } from '../../src/shared/errors/apiError';

describe('Backend V2: Pagination and Keyset Unit Tests', () => {
  it('applies default limits when no pagination parameters are provided', () => {
    const params = sanitizePaginationParams({});
    assert.equal(params.limit, DEFAULT_PAGE_LIMIT);
    assert.equal(params.cursor, undefined);
  });

  it('clamps excessive limit to MAX_PAGE_LIMIT (100)', () => {
    const params = sanitizePaginationParams({ limit: 500 });
    assert.equal(params.limit, MAX_PAGE_LIMIT);
  });

  it('rejects invalid limit values', () => {
    assert.throws(
      () => sanitizePaginationParams({ limit: -5 }),
      (err: any) => err instanceof ApiError && err.status === 400
    );

    assert.throws(
      () => sanitizePaginationParams({ limit: 'abc' }),
      (err: any) => err instanceof ApiError && err.status === 400
    );
  });

  it('builds cursor pagination response with hasMore flag and nextCursor', () => {
    const mockItems = [
      { id: 'app-001', name: 'Nguyen Van A' },
      { id: 'app-002', name: 'Tran Thi B' },
      { id: 'app-003', name: 'Le Van C' },
    ];

    const result = buildCursorPaginationResponse(mockItems, 2);
    assert.equal(result.data.length, 2);
    assert.equal(result.pagination.hasMore, true);
    assert.equal(result.pagination.nextCursor, 'app-002');
  });

  it('indicates hasMore=false when total items fit within requested limit', () => {
    const mockItems = [
      { id: 'app-001', name: 'Nguyen Van A' },
      { id: 'app-002', name: 'Tran Thi B' },
    ];

    const result = buildCursorPaginationResponse(mockItems, 5);
    assert.equal(result.data.length, 2);
    assert.equal(result.pagination.hasMore, false);
    assert.equal(result.pagination.nextCursor, undefined);
  });
});
