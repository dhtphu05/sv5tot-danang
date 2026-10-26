/**
 * 5TOT Đà Nẵng — Collective Application Domain Service Unit Tests (Backend V2)
 *
 * Verifies canonical Collective rules:
 * - Shared Denominator: totalMembers
 * - TT02: 100% participation (participatingMembers === totalMembers)
 * - TT03: >= 20% SV5T integer math (recognizedMembers * 100 >= totalMembers * 20)
 * - Collective A: 42/42/9 (TT02 Met, TT03 Met)
 * - Collective B: 42/41/9 (TT02 Not Met, TT03 Met)
 * - Collective C: 42/42/8 (TT02 Met, TT03 Not Met)
 * - Direct-to-City submission bypasses School preliminary stage
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FakeCollectiveApplicationRepository } from '../fakes/fakeCollectiveApplicationRepository';
import { FakeSeasonRepository } from '../fakes/fakeSeasonRepository';
import { CollectiveApplicationService } from '../../src/modules/collectiveApplications/collectiveApplication.service';
import { SeasonService } from '../../src/modules/seasons/season.service';
import type { AuthenticatedActor } from '../../src/modules/authorization/authorization.types';

describe('Backend V2: Collective Application Domain Service Unit Tests', () => {
  let fakeRepo: FakeCollectiveApplicationRepository;
  let seasonRepo: FakeSeasonRepository;
  let seasonService: SeasonService;
  let service: CollectiveApplicationService;

  const preparerActor: AuthenticatedActor = {
    userId: 'user-preparer-1',
    email: 'preparer@dut.udn.vn',
    fullName: 'Lê Văn B',
    activeRole: 'COLLECTIVE_PREPARER',
    roles: ['COLLECTIVE_PREPARER'],
    institutionId: 'inst-dut',
    schoolReviewUnitId: 'unit-udn',
    sessionId: 'sess-preparer-1',
  };

  beforeEach(() => {
    fakeRepo = new FakeCollectiveApplicationRepository();
    seasonRepo = new FakeSeasonRepository();
    seasonService = new SeasonService(seasonRepo);
    service = new CollectiveApplicationService(fakeRepo, seasonService);
  });

  it('evaluates Collective A boundary (42/42/9) -> TT02 100% Met, TT03 >= 20% Met', () => {
    const { tt02Meets, tt03Meets } = service.calculateThresholds(42, 42, 9);
    assert.equal(tt02Meets, true, 'TT02 should meet 100% threshold');
    assert.equal(tt03Meets, true, 'TT03 should meet >= 20% threshold (9*100 >= 42*20 => 900 >= 840)');
  });

  it('evaluates Collective B boundary (42/41/9) -> TT02 Not Met, TT03 Met', () => {
    const { tt02Meets, tt03Meets } = service.calculateThresholds(42, 41, 9);
    assert.equal(tt02Meets, false, 'TT02 fails because 41 !== 42');
    assert.equal(tt03Meets, true, 'TT03 meets threshold');
  });

  it('evaluates Collective C boundary (42/42/8) -> TT02 Met, TT03 Not Met', () => {
    const { tt02Meets, tt03Meets } = service.calculateThresholds(42, 42, 8);
    assert.equal(tt02Meets, true, 'TT02 meets 100% threshold');
    assert.equal(tt03Meets, false, 'TT03 fails because 8*100 = 800 < 840');
  });

  it('creates draft and updates totalMembers with shared denominator', async () => {
    const draft = await service.startOrResumeDraft(preparerActor, {
      collectiveUnitId: 'col-unit-21tclc-dt1',
    });
    assert.equal(draft.workflowStatus, 'DRAFT');
    assert.equal(draft.preparerUserId, preparerActor.userId);

    const updated = await service.updateTotalMembers(preparerActor, draft.id, 42);
    assert.equal(updated.totalMembers, 42);
  });

  it('synchronizes roster metrics and auto-computes advisory flags', async () => {
    const draft = await service.startOrResumeDraft(preparerActor, {
      collectiveUnitId: 'col-unit-21tclc-dt1',
    });
    await service.updateTotalMembers(preparerActor, draft.id, 2);

    await service.addRosterEntry(preparerActor, draft.id, {
      studentCode: '102210001',
      fullName: 'Trần Văn X',
      isParticipatingMovement: true,
      isSchoolSv5tRecognized: true,
      dataOrigin: 'MANUAL',
    });

    await service.addRosterEntry(preparerActor, draft.id, {
      studentCode: '102210002',
      fullName: 'Lê Thị Y',
      isParticipatingMovement: true,
      isSchoolSv5tRecognized: false,
      dataOrigin: 'MANUAL',
    });

    const detail = await service.getApplicationDetail(preparerActor, draft.id);
    assert.equal(detail.application.totalMembers, 2);
    assert.equal(detail.application.participatingMembers, 2);
    assert.equal(detail.application.recognizedMembers, 1);
    assert.equal(detail.application.tt02MeetsThreshold, true); // 2/2 = 100%
    assert.equal(detail.application.tt03MeetsThreshold, true); // 1/2 = 50% >= 20%
  });

  it('submits directly to City: transitions to CITY_UNASSIGNED and bypasses School', async () => {
    const draft = await service.startOrResumeDraft(preparerActor, {
      collectiveUnitId: 'col-unit-21tclc-dt1',
    });
    await service.updateTotalMembers(preparerActor, draft.id, 42);

    const submitted = await service.submitToCity(preparerActor, draft.id);
    assert.equal(submitted.workflowStatus, 'CITY_UNASSIGNED');
    assert.ok(submitted.submittedToCityAt);

    // Assert audit log captured direct submission
    const event = fakeRepo.auditEvents.find((e) => e.action === 'SUBMIT_COLLECTIVE_DIRECT_TO_CITY');
    assert.ok(event);
  });
});
