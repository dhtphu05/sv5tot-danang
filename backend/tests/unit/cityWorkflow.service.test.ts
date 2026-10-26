/**
 * 5TOT Đà Nẵng — City Workflow Service Unit Tests (Backend V2)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FakeCityWorkflowRepository } from '../fakes/fakeCityWorkflowRepository';
import { CityWorkflowService } from '../../src/modules/cityWorkflow/cityWorkflow.service';
import type { AuthenticatedActor } from '../../src/modules/authorization/authorization.types';

describe('Backend V2: City Workflow Domain Service Unit Tests', () => {
  let fakeRepo: FakeCityWorkflowRepository;
  let service: CityWorkflowService;

  const managerActor: AuthenticatedActor = {
    userId: 'user-manager-1',
    email: 'manager@danang.gov.vn',
    fullName: 'Trưởng ban TTNTH',
    activeRole: 'CITY_MANAGER',
    roles: ['CITY_MANAGER'],
    institutionId: null,
    schoolReviewUnitId: null,
    sessionId: 'sess-manager-1',
  };

  const officerActor: AuthenticatedActor = {
    userId: 'user-officer-city-1',
    email: 'officer@danang.gov.vn',
    fullName: 'Cán bộ Ban TTNTH',
    activeRole: 'CITY_OFFICER',
    roles: ['CITY_OFFICER'],
    institutionId: null,
    schoolReviewUnitId: null,
    sessionId: 'sess-officer-1',
  };

  beforeEach(() => {
    fakeRepo = new FakeCityWorkflowRepository();
    service = new CityWorkflowService(fakeRepo);
  });

  it('assigns application to City officer and creates assignment history', async () => {
    await service.assignOfficer(managerActor, {
      track: 'INDIVIDUAL',
      applicationId: 'app-ind-100',
      assignedOfficerUserId: officerActor.userId,
      assignedOfficerName: officerActor.fullName,
      assignmentNote: 'Thẩm định hồ sơ trường ĐH Bách Khoa',
    });

    assert.equal(fakeRepo.assignments.length, 1);
    assert.equal(fakeRepo.assignments[0].appId, 'app-ind-100');
    assert.equal(fakeRepo.assignments[0].officerId, officerActor.userId);
    assert.equal(fakeRepo.assignments[0].managerId, managerActor.userId);
  });

  it('records City criterion judgments and flags evidence links', async () => {
    const judgment = await service.saveIndividualJudgment(
      officerActor,
      'app-ind-100',
      'ACADEMIC',
      'SUITABLE',
      'GPA đạt 3.8/4',
      ['ev-link-01']
    );

    assert.equal(judgment.individualApplicationId, 'app-ind-100');
    assert.equal(judgment.criterionCode, 'ACADEMIC');
    assert.equal(judgment.judgmentStatus, 'SUITABLE');
    assert.deepEqual(judgment.flaggedEvidenceLinkIds, ['ev-link-01']);
  });

  it('enforces complete evaluation of all 5 criteria before completing individual review', async () => {
    // Only 4 evaluated
    for (const code of ['ETHICS', 'ACADEMIC', 'PHYSICAL', 'VOLUNTEER'] as const) {
      await service.saveIndividualJudgment(officerActor, 'app-ind-100', code, 'SUITABLE');
    }

    await assert.rejects(
      async () => service.completeIndividualReview(officerActor, 'app-ind-100', 'Hoàn tất'),
      (err: any) => err.status === 400
    );

    // Evaluate 5th
    await service.saveIndividualJudgment(officerActor, 'app-ind-100', 'INTEGRATION', 'SUITABLE');
    await service.completeIndividualReview(officerActor, 'app-ind-100', 'Đã thẩm định đủ 5 tiêu chuẩn');

    assert.ok(fakeRepo.completedApps.has('app-ind-100'));
  });

  it('enforces complete evaluation of TT01–TT04 before completing collective review', async () => {
    for (const code of ['TT01', 'TT02', 'TT03'] as const) {
      await service.saveCollectiveJudgment(officerActor, 'col-app-200', code, 'SUITABLE');
    }

    await assert.rejects(
      async () => service.completeCollectiveReview(officerActor, 'col-app-200'),
      (err: any) => err.status === 400
    );

    await service.saveCollectiveJudgment(officerActor, 'col-app-200', 'TT04', 'SUITABLE');
    await service.completeCollectiveReview(officerActor, 'col-app-200');

    assert.ok(fakeRepo.completedApps.has('col-app-200'));
  });
});
