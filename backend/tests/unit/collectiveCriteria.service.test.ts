/**
 * 5TOT Đà Nẵng — Collective Criteria TT01–TT04 Domain Service Unit Tests (Backend V2)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FakeCriteriaRepository } from '../fakes/fakeCriteriaRepository';
import { CriteriaService } from '../../src/modules/criteria/criteria.service';

describe('Backend V2: Collective Criteria TT01–TT04 Domain Service Unit Tests', () => {
  let fakeRepo: FakeCriteriaRepository;
  let service: CriteriaService;

  beforeEach(() => {
    fakeRepo = new FakeCriteriaRepository();
    service = new CriteriaService(fakeRepo);
  });

  it('retrieves exactly the 4 canonical Collective criteria (TT01–TT04)', async () => {
    const groups = await service.getSeasonCriteria('season-2025-2026', 'COLLECTIVE');
    assert.equal(groups.length, 4);

    const codes = groups.map((g) => g.code);
    assert.deepEqual(codes, ['TT01', 'TT02', 'TT03', 'TT04']);
  });

  it('rejects zero or negative totalMembers denominator', () => {
    assert.throws(
      () => {
        service.evaluateCollectiveAdvisory({
          totalMembers: 0,
          participatingMembers: 0,
          recognizedMembers: 0,
          hasPriorSchoolRecognition: true,
          hasSchoolEvidenceAttached: true,
          noViolationsDeclared: true,
        });
      },
      (err: any) => {
        assert.equal(err.status, 400);
        assert.ok(err.detail.includes('lớn hơn 0'));
        return true;
      }
    );

    assert.throws(
      () => {
        service.evaluateCollectiveAdvisory({
          totalMembers: -5,
          participatingMembers: 0,
          recognizedMembers: 0,
          hasPriorSchoolRecognition: true,
          hasSchoolEvidenceAttached: true,
          noViolationsDeclared: true,
        });
      },
      (err: any) => {
        assert.equal(err.status, 400);
        return true;
      }
    );
  });

  it('evaluates completely met collective application', () => {
    const evaluation = service.evaluateCollectiveAdvisory({
      totalMembers: 30,
      participatingMembers: 30, // 100%
      recognizedMembers: 6,     // 6/30 = 20%
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: true,
      noViolationsDeclared: true,
    });

    assert.equal(evaluation.isOverallEligible, true);
    assert.equal(evaluation.readinessPercentage, 100);
    assert.equal(evaluation.tt01.isMet, true);
    assert.equal(evaluation.tt02.isMet, true);
    assert.equal(evaluation.tt03.isMet, true);
    assert.equal(evaluation.tt04.isMet, true);
    assert.equal(evaluation.isSubmissionBlocked, false);
  });

  it('TT02: strictly enforces 100% participation', () => {
    // 29 out of 30 -> 96.7% -> NOT met!
    const res = service.evaluateCollectiveAdvisory({
      totalMembers: 30,
      participatingMembers: 29,
      recognizedMembers: 6,
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: true,
      noViolationsDeclared: true,
    });

    assert.equal(res.tt02.isMet, false);
    assert.equal(res.tt02.actualPercentage, 97);
    assert.ok(res.tt02.warning?.includes('100%'));
  });

  it('TT03: evaluates exact integer arithmetic threshold (recognized * 100 >= total * 20)', () => {
    // Boundary Case 1: 5 members, 1 recognized -> 1 * 100 >= 100 (true, exactly 20%)
    const case5 = service.evaluateCollectiveAdvisory({
      totalMembers: 5,
      participatingMembers: 5,
      recognizedMembers: 1,
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: true,
      noViolationsDeclared: true,
    });
    assert.equal(case5.tt03.isMet, true);
    assert.equal(case5.tt03.minRequiredMembers, 1);

    // Boundary Case 2: 6 members, 1 recognized -> 1 * 100 >= 120 (false, 16.67%, min required is 2)
    const case6Fail = service.evaluateCollectiveAdvisory({
      totalMembers: 6,
      participatingMembers: 6,
      recognizedMembers: 1,
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: true,
      noViolationsDeclared: true,
    });
    assert.equal(case6Fail.tt03.isMet, false);
    assert.equal(case6Fail.tt03.minRequiredMembers, 2);

    // Boundary Case 3: 6 members, 2 recognized -> 2 * 100 >= 120 (true, 33.3%)
    const case6Pass = service.evaluateCollectiveAdvisory({
      totalMembers: 6,
      participatingMembers: 6,
      recognizedMembers: 2,
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: true,
      noViolationsDeclared: true,
    });
    assert.equal(case6Pass.tt03.isMet, true);

    // Boundary Case 4: 10 members, 1 recognized -> 1 * 100 >= 200 (false, 10%)
    const case10Fail = service.evaluateCollectiveAdvisory({
      totalMembers: 10,
      participatingMembers: 10,
      recognizedMembers: 1,
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: true,
      noViolationsDeclared: true,
    });
    assert.equal(case10Fail.tt03.isMet, false);
    assert.equal(case10Fail.tt03.minRequiredMembers, 2);

    // Boundary Case 5: 10 members, 2 recognized -> 2 * 100 >= 200 (true, exactly 20%)
    const case10Pass = service.evaluateCollectiveAdvisory({
      totalMembers: 10,
      participatingMembers: 10,
      recognizedMembers: 2,
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: true,
      noViolationsDeclared: true,
    });
    assert.equal(case10Pass.tt03.isMet, true);
  });

  it('shares single canonical totalMembers denominator across TT02 and TT03', () => {
    const res = service.evaluateCollectiveAdvisory({
      totalMembers: 25,
      participatingMembers: 25,
      recognizedMembers: 5,
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: true,
      noViolationsDeclared: true,
    });

    assert.equal(res.totalMembers, 25);
    assert.equal(res.tt02.participatingMembers, 25);
    assert.equal(res.tt03.recognizedMembers, 5);
    assert.equal(res.tt03.minRequiredMembers, 5); // Math.ceil(25 * 0.2) = 5
  });

  it('TT01: requires both school recognition flag AND documentary evidence attached', () => {
    // Recognition true, but evidence missing
    const noEvidence = service.evaluateCollectiveAdvisory({
      totalMembers: 20,
      participatingMembers: 20,
      recognizedMembers: 4,
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: false,
      noViolationsDeclared: true,
    });
    assert.equal(noEvidence.tt01.isMet, false);
    assert.ok(noEvidence.tt01.warning?.includes('minh chứng'));

    // Both present
    const withEvidence = service.evaluateCollectiveAdvisory({
      totalMembers: 20,
      participatingMembers: 20,
      recognizedMembers: 4,
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: true,
      noViolationsDeclared: true,
    });
    assert.equal(withEvidence.tt01.isMet, true);
  });

  it('TT04: specifies human verification requirement and does not auto-certify absence of violation', () => {
    const res = service.evaluateCollectiveAdvisory({
      totalMembers: 20,
      participatingMembers: 20,
      recognizedMembers: 4,
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: true,
      noViolationsDeclared: true,
    });

    assert.equal(res.tt04.isMet, true);
    assert.equal(res.tt04.humanVerificationRequired, true);
  });

  it('does NOT automatically grant official recognition award (advisory only)', () => {
    const res = service.evaluateCollectiveAdvisory({
      totalMembers: 20,
      participatingMembers: 20,
      recognizedMembers: 4,
      hasPriorSchoolRecognition: true,
      hasSchoolEvidenceAttached: true,
      noViolationsDeclared: true,
    });

    assert.equal(res.isOverallEligible, true);
    assert.equal(res.isSubmissionBlocked, false);
    // Advisory response does not fabricate an official recognition decision batch
    assert.equal((res as any).decisionId, undefined);
  });
});
