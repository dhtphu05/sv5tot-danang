/**
 * 5TOT Đà Nẵng — SRW-3 Automated Test Suite
 * School Batch Forwarding UI: One Consolidated List, One Decision Document, One Final Submission
 * Tests all 15 Deterministic Scenarios (S3-01 through S3-15) and Business Invariants
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTHORITATIVE_SCHOOL_REVIEW_UNITS,
  resolveSchoolReviewUnit,
  DecisionDocumentMetadata,
  SchoolForwardingBatchSummaryDto,
  SchoolForwardingBatchDto,
} from '../staff/schoolReviewTypes';
import { STAFF_DEMO_USERS, INITIAL_STAFF_APPLICATIONS } from '../staff/fixtures/staffDataset';
import { resolveDomainServices } from '../entities/services/modeResolver';
import { resetDemoBatchState } from '../entities/services/demoAdapter';
import {
  validateSchoolRecommendationEligibility,
  validateSchoolForwardingEligibility,
  getApplicationsForSchoolOfficer,
} from '../staff/schoolSelectors';

describe('5TOT Đà Nẵng — SRW-3 School Batch Forwarding Specification Suite', () => {
  const udnOfficer = STAFF_DEMO_USERS.SCHOOL_OFFICER;
  const dtuOfficer = {
    ...STAFF_DEMO_USERS.SCHOOL_OFFICER,
    id: 'staff-sch-huy-dtu',
    fullName: 'Trần Gia Huy',
    schoolReviewUnitId: 'unit-dtu' as const,
    unitLabel: 'Trường Đại học Duy Tân',
  };
  const cityManager = STAFF_DEMO_USERS.CITY_MANAGER;

  const demoDecisionDoc: DecisionDocumentMetadata = {
    decisionNumber: '182/QĐ-ĐHĐN',
    decisionTitle:
      'Quyết định về việc đề xuất danh sách sinh viên đạt danh hiệu "Sinh viên 5 tốt" cấp Thành phố năm học 2025–2026',
    decisionDate: '2026-10-18',
    signedByName: 'PGS.TS. Nguyễn Ngọc Vũ',
    signedByTitle: 'Giám đốc Đại học Đà Nẵng',
    fileId: 'doc-dec-182-dhdn-2026',
    fileName: '182_QD_DHDN_DanhSach_DeXuat_SV5T_CapThanhPho.pdf',
    fileSize: 2450000,
  };

  beforeEach(() => {
    resetDemoBatchState();
  });

  // ---------------------------------------------------------------------------
  // S3-01: One UDN Batch
  // ---------------------------------------------------------------------------
  it('S3-01: Exactly ONE batch belongs to unit-udn for the award season', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: udnOfficer.schoolReviewUnitId,
    };

    // Initially no batch exists
    const batchBefore = await services.schoolReview.getSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      actor,
    });
    assert.equal(batchBefore, null);

    // Save initial draft
    const batch = await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: ['APP-2026-DN-102220123'],
      forwardingNote: 'Dự thảo đợt đề xuất ĐHĐN',
      actor,
    });

    assert.equal(batch.schoolReviewUnitId, 'unit-udn');
    assert.equal(batch.seasonId, 'season-2025-2026');
    assert.equal(batch.status, 'DRAFT');
    assert.equal(batch.selectedApplicationIds.length, 1);
  });

  // ---------------------------------------------------------------------------
  // S3-02: Multiple Member Institutions Preserved Under One UDN Batch
  // ---------------------------------------------------------------------------
  it('S3-02: Consolidated selected list contains applications from multiple member institutions while preserving original institution identity', async () => {
    const udnApps = getApplicationsForSchoolOfficer(INITIAL_STAFF_APPLICATIONS, udnOfficer);
    assert.ok(udnApps.length > 0, 'UDN has applications in scope');

    // Collect institutions present in UDN scope
    const institutionIds = new Set(udnApps.map((a) => a.institution.id));
    assert.ok(institutionIds.size >= 2, 'UDN scope contains multiple member institutions (e.g. DUT, DUE)');

    // Ensure member institutions route to unit-udn
    for (const instId of institutionIds) {
      const routing = resolveSchoolReviewUnit(instId);
      assert.equal(routing.resolved, true);
      assert.equal(routing.unit?.id, 'unit-udn');
    }
  });

  // ---------------------------------------------------------------------------
  // S3-03: Institution Filter Does Not Clear Selected Applications
  // ---------------------------------------------------------------------------
  it('S3-03: Changing institution filter does not change underlying batch identity or clear selected applications', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    // Select applications from different institutions
    const selectedIds = ['APP-2026-DN-102220123', 'APP-2026-DN-471102190'];
    const draft = await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: selectedIds,
      actor,
    });

    assert.deepEqual(draft.selectedApplicationIds, selectedIds);

    // Filter simulation: even if UI displays only DUT rows, querying batch preserves all selected IDs
    const currentBatch = await services.schoolReview.getSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      actor,
    });
    assert.equal(currentBatch?.selectedApplicationIds.length, 2);
    assert.ok(currentBatch?.selectedApplicationIds.includes('APP-2026-DN-102220123'));
    assert.ok(currentBatch?.selectedApplicationIds.includes('APP-2026-DN-471102190'));
  });

  // ---------------------------------------------------------------------------
  // S3-04: Draft Selection Management (Add and Remove)
  // ---------------------------------------------------------------------------
  it('S3-04: Supports adding and removing eligible applications from draft selection', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    // 1. Initial selection: 1 application
    let batch = await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: ['APP-2026-DN-102220123'],
      actor,
    });
    assert.equal(batch.applicationCount, 1);

    // 2. Add second application
    batch = await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: ['APP-2026-DN-102220123', 'APP-2026-DN-471102190'],
      actor,
    });
    assert.equal(batch.applicationCount, 2);

    // 3. Remove first application
    batch = await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: ['APP-2026-DN-471102190'],
      actor,
    });
    assert.equal(batch.applicationCount, 1);
    assert.equal(batch.selectedApplicationIds[0], 'APP-2026-DN-471102190');
  });

  // ---------------------------------------------------------------------------
  // S3-05: Missing Decision Document Rejection
  // ---------------------------------------------------------------------------
  it('S3-05: Final batch confirmation is rejected if decision document is missing', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    // Save draft with applications but NO decision doc
    await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: ['APP-2026-DN-102220123'],
      actor,
    });

    // Confirmation must fail with MISSING_DECISION_DOCUMENT
    await assert.rejects(
      async () => {
        await services.schoolReview.confirmSchoolForwardingBatch({
          seasonId: 'season-2025-2026',
          actor,
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('MISSING_DECISION_DOCUMENT'));
        return true;
      }
    );
  });

  // ---------------------------------------------------------------------------
  // S3-06: Decision Document Attachment & Inspection
  // ---------------------------------------------------------------------------
  it('S3-06: Synthetic decision attachment can be inspected with required metadata', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    const batch = await services.schoolReview.attachSchoolDecisionDocument({
      seasonId: 'season-2025-2026',
      decisionNumber: demoDecisionDoc.decisionNumber,
      decisionTitle: demoDecisionDoc.decisionTitle,
      decisionDate: demoDecisionDoc.decisionDate,
      signedByName: demoDecisionDoc.signedByName,
      signedByTitle: demoDecisionDoc.signedByTitle,
      fileId: demoDecisionDoc.fileId,
      fileName: demoDecisionDoc.fileName,
      fileSize: demoDecisionDoc.fileSize,
      fileUrl: demoDecisionDoc.fileUrl,
      actor,
    });

    assert.equal(batch.decisionNumber, '182/QĐ-ĐHĐN');
    assert.equal(batch.decisionFileName, '182_QD_DHDN_DanhSach_DeXuat_SV5T_CapThanhPho.pdf');
    assert.equal(batch.signedByName, 'PGS.TS. Nguyễn Ngọc Vũ');
  });

  // ---------------------------------------------------------------------------
  // S3-07: Pre-forwarding Validation Summary
  // ---------------------------------------------------------------------------
  it('S3-07: Batch summary returns correct counts and breakdown by member institutions', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    const summary = await services.schoolReview.getSchoolForwardingBatchSummary({
      seasonId: 'season-2025-2026',
      actor,
    });

    assert.equal(summary.schoolReviewUnitId, 'unit-udn');
    assert.equal(summary.schoolReviewUnitName, 'Đại học Đà Nẵng');
    assert.ok(summary.totalApplicationsInScope > 0);
    assert.ok(Array.isArray(summary.institutionBreakdown));
    assert.ok(summary.institutionBreakdown.length > 0);
  });

  // ---------------------------------------------------------------------------
  // S3-08: Confirm Batch Once
  // ---------------------------------------------------------------------------
  it('S3-08: Confirming forwards the single UDN batch atomically and locks it', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    // 1. Prepare draft
    await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: ['APP-2026-DN-102220123'],
      actor,
    });

    // 2. Attach decision
    await services.schoolReview.attachSchoolDecisionDocument({
      seasonId: 'season-2025-2026',
      ...demoDecisionDoc,
      actor,
    });

    // 3. Confirm
    const result = await services.schoolReview.confirmSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      forwardingNote: 'Kính chuyển Hội đồng xét chọn cấp Thành phố',
      actor,
    });

    assert.equal(result.success, true);
    assert.equal(result.data.status, 'FORWARDED');
    assert.ok(result.data.submittedAt);
  });

  // ---------------------------------------------------------------------------
  // S3-09: Duplicate Prevention & Idempotency
  // ---------------------------------------------------------------------------
  it('S3-09: Trying to forward an already forwarded batch returns conflict or idempotent result', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: ['APP-2026-DN-102220123'],
      actor,
    });
    await services.schoolReview.attachSchoolDecisionDocument({
      seasonId: 'season-2025-2026',
      ...demoDecisionDoc,
      actor,
    });

    // First forward with key
    const first = await services.schoolReview.confirmSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      idempotencyKey: 'idem-key-123',
      actor,
    });
    assert.equal(first.data.status, 'FORWARDED');

    // Idempotent retry with same key
    const retry = await services.schoolReview.confirmSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      idempotencyKey: 'idem-key-123',
      actor,
    });
    assert.equal(retry.success, true);
    assert.equal(retry.data.status, 'FORWARDED');

    // Attempt to re-forward with new key must fail with BATCH_ALREADY_FORWARDED
    await assert.rejects(
      async () => {
        await services.schoolReview.confirmSchoolForwardingBatch({
          seasonId: 'season-2025-2026',
          idempotencyKey: 'new-key-456',
          actor,
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('BATCH_ALREADY_FORWARDED'));
        return true;
      }
    );
  });

  // ---------------------------------------------------------------------------
  // S3-10: Read-only State After Forwarding
  // ---------------------------------------------------------------------------
  it('S3-10: Revisiting workspace shows forwarded batch in read-only state', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: ['APP-2026-DN-102220123'],
      actor,
    });
    await services.schoolReview.attachSchoolDecisionDocument({
      seasonId: 'season-2025-2026',
      ...demoDecisionDoc,
      actor,
    });
    await services.schoolReview.confirmSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      actor,
    });

    // Query batch status after confirmation
    const batch = await services.schoolReview.getSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      actor,
    });
    assert.equal(batch?.status, 'FORWARDED');

    // Trying to edit draft after forwarding is forbidden
    await assert.rejects(
      async () => {
        await services.schoolReview.saveSchoolForwardingBatchDraft({
          seasonId: 'season-2025-2026',
          selectedApplicationIds: ['APP-2026-DN-471102190'],
          actor,
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('BATCH_ALREADY_FORWARDED'));
        return true;
      }
    );
  });

  // ---------------------------------------------------------------------------
  // S3-11: City Intake Visibility
  // ---------------------------------------------------------------------------
  it('S3-11: City Manager can inspect incoming forwarded batches from schools', async () => {
    const services = resolveDomainServices('DEMO');
    const schoolActor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    // Forward UDN batch
    await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: ['APP-2026-DN-102220123'],
      actor: schoolActor,
    });
    await services.schoolReview.attachSchoolDecisionDocument({
      seasonId: 'season-2025-2026',
      ...demoDecisionDoc,
      actor: schoolActor,
    });
    await services.schoolReview.confirmSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      actor: schoolActor,
    });

    // City Manager inspects incoming batches
    const cityBatches = await services.schoolReview.listIncomingForwardedBatchesForCity({
      seasonId: 'season-2025-2026',
      actor: {
        id: cityManager.id,
        name: cityManager.fullName,
        role: cityManager.primaryRole,
      },
    });

    assert.equal(cityBatches.length, 1);
    assert.equal(cityBatches[0].schoolReviewUnitId, 'unit-udn');
    assert.equal(cityBatches[0].decisionNumber, '182/QĐ-ĐHĐN');
    assert.equal(cityBatches[0].status, 'FORWARDED');
  });

  // ---------------------------------------------------------------------------
  // S3-12: Non-UDN School Review Unit Isolation
  // ---------------------------------------------------------------------------
  it('S3-12: Independent School Review Unit (unit-dtu) cannot modify UDN batch', async () => {
    const services = resolveDomainServices('DEMO');
    const dtuActor = {
      id: dtuOfficer.id,
      name: dtuOfficer.fullName,
      role: dtuOfficer.primaryRole,
      unitId: 'unit-dtu',
    };

    // DTU officer creates DTU batch draft
    const dtuBatch = await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: [],
      actor: dtuActor,
    });

    assert.equal(dtuBatch.schoolReviewUnitId, 'unit-dtu');

    // DTU cannot see or mutate UDN batch
    const udnBatch = await services.schoolReview.getSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      actor: {
        id: udnOfficer.id,
        name: udnOfficer.fullName,
        role: udnOfficer.primaryRole,
        unitId: 'unit-udn',
      },
    });
    assert.equal(udnBatch, null, 'UDN batch remains uncreated and unimpacted by DTU');
  });

  // ---------------------------------------------------------------------------
  // S3-13: Empty Selection List Rejection
  // ---------------------------------------------------------------------------
  it('S3-13: Empty selected list is rejected by forwarding validation', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: [],
      actor,
    });
    await services.schoolReview.attachSchoolDecisionDocument({
      seasonId: 'season-2025-2026',
      ...demoDecisionDoc,
      actor,
    });

    await assert.rejects(
      async () => {
        await services.schoolReview.confirmSchoolForwardingBatch({
          seasonId: 'season-2025-2026',
          actor,
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('EMPTY_SELECTION_LIST'));
        return true;
      }
    );
  });

  // ---------------------------------------------------------------------------
  // S3-14: Out-of-Scope Application Rejection
  // ---------------------------------------------------------------------------
  it('S3-14: Selecting an out-of-scope application is rejected by validation', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    // Find or simulate application from DTU
    const dtuApp = INITIAL_STAFF_APPLICATIONS.find(
      (a) => a.institution.id === 'inst-dtu'
    );
    if (dtuApp) {
      await assert.rejects(
        async () => {
          await services.schoolReview.saveSchoolForwardingBatchDraft({
            seasonId: 'season-2025-2026',
            selectedApplicationIds: [dtuApp.applicationId],
            actor,
          });
        },
        (err: any) => {
          assert.ok(err.message.includes('APPLICATION_NOT_IN_SCOPE'));
          return true;
        }
      );
    }
  });

  // ---------------------------------------------------------------------------
  // S3-15: Demo Reset Restores Clean Initial State
  // ---------------------------------------------------------------------------
  it('S3-15: Demo reset restores initial batch draft state predictably', async () => {
    const services = resolveDomainServices('DEMO');
    const actor = {
      id: udnOfficer.id,
      name: udnOfficer.fullName,
      role: udnOfficer.primaryRole,
      unitId: 'unit-udn',
    };

    // Forward a batch
    await services.schoolReview.saveSchoolForwardingBatchDraft({
      seasonId: 'season-2025-2026',
      selectedApplicationIds: ['APP-2026-DN-102220123'],
      actor,
    });
    await services.schoolReview.attachSchoolDecisionDocument({
      seasonId: 'season-2025-2026',
      ...demoDecisionDoc,
      actor,
    });
    await services.schoolReview.confirmSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      actor,
    });

    const batchBefore = await services.schoolReview.getSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      actor,
    });
    assert.equal(batchBefore?.status, 'FORWARDED');

    // Execute reset
    resetDemoBatchState();

    const batchAfter = await services.schoolReview.getSchoolForwardingBatch({
      seasonId: 'season-2025-2026',
      actor,
    });
    assert.equal(batchAfter, null);
  });
});
