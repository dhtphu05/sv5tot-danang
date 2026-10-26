/**
 * 5TOT Đà Nẵng — Committee Decision & Batch Publication Service Unit Tests (Backend V2)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FakeCommitteeRepository } from '../fakes/fakeCommitteeRepository';
import { CommitteeService } from '../../src/modules/committee/committee.service';
import type { AuthenticatedActor } from '../../src/modules/authorization/authorization.types';

describe('Backend V2: Committee Decision Domain Service Unit Tests', () => {
  let fakeRepo: FakeCommitteeRepository;
  let service: CommitteeService;

  const committeeActor: AuthenticatedActor = {
    userId: 'user-committee-1',
    email: 'committee@danang.gov.vn',
    fullName: 'Ủy viên Hội đồng xét chọn',
    activeRole: 'CITY_COMMITTEE',
    roles: ['CITY_COMMITTEE'],
    institutionId: null,
    schoolReviewUnitId: null,
    sessionId: 'sess-committee-1',
  };

  beforeEach(() => {
    fakeRepo = new FakeCommitteeRepository();
    service = new CommitteeService(fakeRepo);
  });

  it('records committee decision (RECOGNIZED) and prepares unpublished final result', async () => {
    const decision = await service.recordDecision(committeeActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-ind-501',
      outcome: 'RECOGNIZED',
      decisionNote: 'Đạt danh hiệu Sinh viên 5 tốt cấp Thành phố tiêu biểu',
    });

    assert.equal(decision.outcome, 'RECOGNIZED');
    assert.equal(decision.decidedByUserId, committeeActor.userId);

    const finalResult = await service.getFinalResult(committeeActor, 'INDIVIDUAL', 'app-ind-501');
    assert.ok(finalResult);
    assert.equal(finalResult.isPublished, false);
    assert.equal(finalResult.outcome, 'RECOGNIZED');
  });

  it('reopens decision before publication successfully', async () => {
    await service.recordDecision(committeeActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-ind-501',
      outcome: 'NOT_RECOGNIZED',
    });

    await service.reopenDecision(committeeActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-ind-501',
      reopenReason: 'Hội đồng thống nhất xem xét lại chứng chỉ Ngoại ngữ',
    });

    const finalResult = await service.getFinalResult(committeeActor, 'INDIVIDUAL', 'app-ind-501');
    assert.equal(finalResult, null);
  });

  it('publishes recognition decision batch atomically and freezes final results', async () => {
    await service.recordDecision(committeeActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-ind-501',
      outcome: 'RECOGNIZED',
    });

    const batch = await service.publishBatch(committeeActor, {
      seasonId: 'season-2025-2026',
      track: 'INDIVIDUAL',
      decisionNumber: '145-QĐ/HSV',
      decisionTitle: 'Quyết định công nhận Danh hiệu Sinh viên 5 tốt cấp Thành phố năm học 2025-2026',
      decisionDate: new Date().toISOString(),
      signedByName: 'Nguyễn Mạnh Dũng',
      signedByTitle: 'Chủ tịch Hội Sinh viên TP. Đà Nẵng',
      applicationIds: ['app-ind-501'],
    });

    assert.equal(batch.decisionNumber, '145-QĐ/HSV');
    assert.equal(batch.status, 'PUBLISHED');

    const publishedResult = await service.getFinalResult(committeeActor, 'INDIVIDUAL', 'app-ind-501');
    assert.ok(publishedResult);
    assert.equal(publishedResult.isPublished, true);
    assert.equal(publishedResult.decisionNumberSnapshot, '145-QĐ/HSV');

    // Post-publication immutability: Reopen MUST fail with 409
    await assert.rejects(
      async () =>
        service.reopenDecision(committeeActor, {
          track: 'INDIVIDUAL',
          applicationId: 'app-ind-501',
          reopenReason: 'Cố ý chỉnh sửa sau khi đã ban hành quyết định',
        }),
      (err: any) => err.status === 409
    );
  });
});
