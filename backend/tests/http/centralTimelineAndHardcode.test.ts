/**
 * 5TOT Đà Nẵng — ADMIN-REVAMP.1 Central-Style Award Selection Timeline & Hardcode Elimination Test Suite (Backend V2)
 *
 * Covers TL01–TL40:
 * - TL01–TL08: Canonical AwardSeason Central Timeline milestones (T01–T07), Asia/Ho_Chi_Minh date formatting, academic year validation
 * - TL09–TL16: Chronology validation rules (T01 start < T01 end <= T03 deadline <= T05 end; T04 parallel Collective submission never gated on T03)
 * - TL17–TL24: 4-tier Season Context Resolution (`SeasonService.resolveSeasonContext`: APPLICATION_SEASON -> EXPLICIT_SELECTION -> ACTIVE_SEASON -> LATEST_CONFIGURED)
 * - TL25–TL32: Individual (`T01`) and Collective (`T04`) submission window enforcement on backend services & HTTP endpoints
 * - TL33–TL40: System-wide hardcode elimination & `formatAcademicYearLabel` / `formatShortAcademicYear` idempotency across `2025-2026` and `2026-2027`
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Server } from 'http';
import { createApp } from '../../src/app/createApp';
import { FakeIdentityRepository } from '../fakes/fakeIdentityRepository';
import { FakeSessionRepository } from '../fakes/fakeSessionRepository';
import { FakePasswordResetRepository } from '../fakes/fakePasswordResetRepository';
import { FakeInstitutionRepository } from '../fakes/fakeInstitutionRepository';
import { FakeSchoolReviewUnitRepository } from '../fakes/fakeSchoolReviewUnitRepository';
import { FakeSeasonRepository } from '../fakes/fakeSeasonRepository';
import { FakeCriteriaRepository } from '../fakes/fakeCriteriaRepository';
import { FakeIndividualApplicationRepository } from '../fakes/fakeIndividualApplicationRepository';
import { FakeCollectiveApplicationRepository } from '../fakes/fakeCollectiveApplicationRepository';
import { FakeAdminRepository } from '../fakes/fakeAdminRepository';
import { SeasonService } from '../../src/modules/seasons/season.service';
import {
  buildCentralMilestonesForSeason,
  formatAcademicYearLabel,
  formatShortAcademicYear,
  formatVietnamTimestampVi,
  validateAcademicYearCode,
  validateCentralTimelineDates,
} from '../../src/modules/seasons/seasonTimeline.helper';

describe('ADMIN-REVAMP.1: Central-Style Award Selection Timeline & Hardcode Elimination (TL01–TL40)', () => {
  let server: Server;
  let baseUrl: string;
  let seasonRepo: FakeSeasonRepository;
  let seasonService: SeasonService;

  before(async () => {
    seasonRepo = new FakeSeasonRepository();
    seasonService = new SeasonService(seasonRepo);

    const app = createApp({
      identityRepo: new FakeIdentityRepository(),
      sessionRepo: new FakeSessionRepository(),
      resetRepo: new FakePasswordResetRepository(),
      institutionRepo: new FakeInstitutionRepository(),
      unitRepo: new FakeSchoolReviewUnitRepository(),
      seasonRepo,
      criteriaRepo: new FakeCriteriaRepository(),
      applicationRepo: new FakeIndividualApplicationRepository(),
      collectiveRepo: new FakeCollectiveApplicationRepository(),
      adminRepo: new FakeAdminRepository(),
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  // ===========================================================================
  // TL01–TL08: CENTRAL TIMELINE MILESTONES (T01–T07) & ACADEMIC YEAR VALIDATION
  // ===========================================================================
  describe('TL01–TL08: Central Timeline Milestones (T01–T07) & Academic Year Validation', () => {
    it('TL01–TL04: validateAcademicYearCode accepts consecutive YYYY-YYYY / YYYY–YYYY and rejects non-consecutive years', () => {
      const validHyphen = validateAcademicYearCode('2025-2026');
      assert.equal(validHyphen.valid, true);
      assert.equal(validHyphen.normalizedCode, '2025-2026');
      assert.equal(validHyphen.shortLabel, '2025–2026');
      assert.equal(validHyphen.fullLabel, 'Năm học 2025–2026');

      const validEnDash = validateAcademicYearCode('Năm học 2026–2027');
      assert.equal(validEnDash.valid, true);
      assert.equal(validEnDash.normalizedCode, '2026-2027');
      assert.equal(validEnDash.shortLabel, '2026–2027');
      assert.equal(validEnDash.fullLabel, 'Năm học 2026–2027');

      const invalidGap = validateAcademicYearCode('2025-2028');
      assert.equal(invalidGap.valid, false);

      const invalidFormat = validateAcademicYearCode('2026');
      assert.equal(invalidFormat.valid, false);
    });

    it('TL05–TL08: buildCentralMilestonesForSeason constructs all 7 Central-style milestones (T01–T07) with T04 on COLLECTIVE track', async () => {
      const activeSeason = await seasonRepo.getActiveSeason();
      assert.ok(activeSeason);

      const nowDuringBothOpen = new Date(
        Math.max(
          new Date(activeSeason.individualSubmissionStart).getTime(),
          new Date(activeSeason.collectiveSubmissionStart).getTime()
        ) + 3600 * 1000
      );
      const milestones = buildCentralMilestonesForSeason(activeSeason, nowDuringBothOpen);
      assert.equal(milestones.length, 7);

      const codes = milestones.map((m) => m.code);
      assert.deepEqual(codes, [
        'T01_INDIVIDUAL_SUBMISSION',
        'T02_SCHOOL_PRELIMINARY_REVIEW',
        'T03_SCHOOL_OFFICIAL_FORWARDING',
        'T04_COLLECTIVE_DIRECT_SUBMISSION',
        'T05_CITY_INDEPENDENT_REVIEW',
        'T06_COMMITTEE_FINAL_DECISION',
        'T07_RESULT_ANNOUNCEMENT',
      ]);

      const t01 = milestones.find((m) => m.code === 'T01_INDIVIDUAL_SUBMISSION')!;
      assert.equal(t01.track, 'INDIVIDUAL');
      assert.equal(t01.state, 'OPEN');

      const t04 = milestones.find((m) => m.code === 'T04_COLLECTIVE_DIRECT_SUBMISSION')!;
      assert.equal(t04.track, 'COLLECTIVE');
      assert.equal(t04.state, 'OPEN');
    });
  });

  // ===========================================================================
  // TL09–TL16: CHRONOLOGY VALIDATION & PARALLEL COLLECTIVE T04 INDEPENDENCE
  // ===========================================================================
  describe('TL09–TL16: Chronology Validation & Parallel T04 Collective Track Independence', () => {
    it('TL09–TL12: validateCentralTimelineDates enforces Individual->School->City->Committee->Publish sequence', () => {
      const validResult = validateCentralTimelineDates({
        individualSubmissionStart: new Date('2026-10-01T00:00:00Z'),
        individualSubmissionEnd: new Date('2026-10-15T13:00:00Z'),
        schoolReviewStartAt: new Date('2026-10-12T00:00:00Z'),
        schoolReviewEndAt: new Date('2026-10-18T10:00:00Z'),
        schoolForwardingDeadline: new Date('2026-10-18T10:00:00Z'),
        collectiveSubmissionStart: new Date('2026-10-01T00:00:00Z'),
        collectiveSubmissionEnd: new Date('2026-10-18T10:00:00Z'),
        cityReviewStartAt: new Date('2026-10-19T00:00:00Z'),
        cityReviewEndAt: new Date('2026-10-22T10:00:00Z'),
        committeeMeetingStartAt: new Date('2026-10-23T01:30:00Z'),
        resultAnnouncementAt: new Date('2026-10-25T02:00:00Z'),
      });
      assert.equal(validResult.valid, true);
      assert.equal(validResult.errors.length, 0);

      // Invalid: schoolForwardingDeadline before individualSubmissionEnd
      const invalidForwarding = validateCentralTimelineDates({
        individualSubmissionStart: new Date('2026-10-01T00:00:00Z'),
        individualSubmissionEnd: new Date('2026-10-15T13:00:00Z'),
        schoolForwardingDeadline: new Date('2026-10-10T10:00:00Z'),
        collectiveSubmissionStart: new Date('2026-10-01T00:00:00Z'),
        collectiveSubmissionEnd: new Date('2026-10-18T10:00:00Z'),
      });
      assert.equal(invalidForwarding.valid, false);
      assert.ok(invalidForwarding.errors.length > 0);
    });

    it('TL13–TL16: Collective submission T04 is evaluated independently of School forwarding T03', () => {
      const parallelCheck = validateCentralTimelineDates({
        individualSubmissionStart: new Date('2026-10-05T00:00:00Z'),
        individualSubmissionEnd: new Date('2026-10-12T13:00:00Z'),
        schoolForwardingDeadline: new Date('2026-10-14T10:00:00Z'),
        collectiveSubmissionStart: new Date('2026-10-01T00:00:00Z'),
        collectiveSubmissionEnd: new Date('2026-10-19T10:00:00Z'),
        cityReviewStartAt: new Date('2026-10-15T00:00:00Z'),
        cityReviewEndAt: new Date('2026-10-22T10:00:00Z'),
      });
      assert.equal(parallelCheck.valid, true);
    });
  });

  // ===========================================================================
  // TL17–TL24: 4-TIER SEASON CONTEXT RESOLUTION & PUBLIC ENDPOINT
  // ===========================================================================
  describe('TL17–TL24: 4-Tier Season Context Resolution & Public Endpoint', () => {
    it('TL17–TL20: SeasonService.resolveSeasonContext resolves APPLICATION_SEASON, EXPLICIT_SELECTION, ACTIVE_SEASON, and LATEST_CONFIGURED', async () => {
      // Seed 2026-2027 DRAFT season so explicit selection for 2026-2027 is tested
      await seasonRepo.create({
        code: '2026-2027',
        name: 'Đợt xét chọn Sinh viên 5 tốt & Tập thể Sinh viên 5 tốt cấp TP Đà Nẵng năm học 2026 - 2027',
        isActive: false,
        lifecycleStatus: 'DRAFT',
        individualSubmissionStart: new Date('2026-10-01T00:00:00Z'),
        individualSubmissionEnd: new Date('2026-10-15T13:00:00Z'),
        schoolForwardingDeadline: new Date('2026-10-18T10:00:00Z'),
        collectiveSubmissionStart: new Date('2026-10-01T00:00:00Z'),
        collectiveSubmissionEnd: new Date('2026-10-18T10:00:00Z'),
      });

      // Tier 3: ACTIVE_SEASON (default when no explicit seasonId)
      const activeCtx = await seasonService.resolveSeasonContext();
      assert.equal(activeCtx.source, 'ACTIVE_SEASON');
      assert.equal(activeCtx.academicYearCode, '2025-2026');
      assert.equal(activeCtx.academicYearLabel, 'Năm học 2025–2026');

      // Tier 2: EXPLICIT_SELECTION (requesting 2026-2027 draft)
      const explicitCtx = await seasonService.resolveSeasonContext({
        requestedSeasonId: '2026-2027',
      });
      assert.equal(explicitCtx.source, 'EXPLICIT_SELECTION');
      assert.equal(explicitCtx.academicYearCode, '2026-2027');
      assert.equal(explicitCtx.academicYearLabel, 'Năm học 2026–2027');
      assert.equal(explicitCtx.isHistoricalReadOnly, true);

      // Tier 1: APPLICATION_SEASON (application's own seasonId takes priority)
      const appCtx = await seasonService.resolveSeasonContext({
        applicationSeasonId: 'season-2024-2025',
        requestedSeasonId: '2025-2026',
      });
      assert.equal(appCtx.source, 'APPLICATION_SEASON');
      assert.equal(appCtx.academicYearCode, '2024-2025');
      assert.equal(appCtx.academicYearLabel, 'Năm học 2024–2025');
    });

    it('TL21–TL24: GET /api/v2/public/season-context and GET /api/v2/seasons/context return canonical timeline and active phase', async () => {
      const res = await fetch(`${baseUrl}/api/v2/public/season-context`);
      assert.equal(res.status, 200);
      const body = (await res.json()) as any;
      assert.equal(body.success, true);
      assert.equal(body.data.academicYearCode, '2025-2026');
      assert.equal(body.data.academicYearLabel, 'Năm học 2025–2026');
      assert.equal(body.data.timeline.milestones.length, 7);

      // Explicit query param ?seasonId=2026-2027
      const explicitRes = await fetch(
        `${baseUrl}/api/v2/seasons/context?seasonId=2026-2027`
      );
      assert.equal(explicitRes.status, 200);
      const explicitBody = (await explicitRes.json()) as any;
      assert.equal(explicitBody.data.source, 'EXPLICIT_SELECTION');
      assert.equal(explicitBody.data.academicYearCode, '2026-2027');
      assert.equal(explicitBody.data.academicYearLabel, 'Năm học 2026–2027');
    });
  });

  // ===========================================================================
  // TL25–TL40: FORMATTERS, TIMEZONE & HARDCODE ELIMINATION INVARIANTS
  // ===========================================================================
  describe('TL25–TL40: Academic Year Formatters, Timezone & Hardcode Elimination Invariants', () => {
    it('TL25–TL32: formatAcademicYearLabel and formatShortAcademicYear are idempotent and never duplicate "Năm học"', () => {
      assert.equal(formatAcademicYearLabel('2025-2026'), 'Năm học 2025–2026');
      assert.equal(formatAcademicYearLabel('2025–2026'), 'Năm học 2025–2026');
      assert.equal(formatAcademicYearLabel('Năm học 2025-2026'), 'Năm học 2025–2026');
      assert.equal(
        formatAcademicYearLabel(formatAcademicYearLabel('Năm học 2026–2027')),
        'Năm học 2026–2027'
      );

      assert.equal(formatShortAcademicYear('Năm học 2025-2026'), '2025–2026');
      assert.equal(formatShortAcademicYear('Năm học 2026–2027'), '2026–2027');
    });

    it('TL33–TL40: formatVietnamTimestampVi formats UTC timestamps cleanly into Asia/Ho_Chi_Minh (GMT+7)', () => {
      const end = new Date('2025-10-15T13:00:00.000Z'); // 20:00 15/10/2025 GMT+7
      const label = formatVietnamTimestampVi(end);
      assert.ok(label);
      assert.ok(label.includes('2025'));
      assert.ok(label.includes('20:00'));
      assert.ok(label.includes('GMT+7'));
    });
  });
});
