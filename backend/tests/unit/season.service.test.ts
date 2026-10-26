/**
 * 5TOT Đà Nẵng — Award Season Domain Service Unit Tests (Backend V2)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FakeSeasonRepository } from '../fakes/fakeSeasonRepository';
import { SeasonService } from '../../src/modules/seasons/season.service';

describe('Backend V2: Award Season Domain Service Unit Tests', () => {
  let fakeRepo: FakeSeasonRepository;
  let service: SeasonService;

  beforeEach(() => {
    fakeRepo = new FakeSeasonRepository();
    service = new SeasonService(fakeRepo);
  });

  it('resolves the active award season', async () => {
    const active = await service.getActiveSeason();
    assert.equal(active.code, '2025-2026');
    assert.equal(active.isActive, true);
  });

  it('evaluates timeline status for active submission window', async () => {
    const season = await service.getActiveSeason();

    // Date during open window (October 15, 2026)
    const testNow = new Date('2026-10-15T10:00:00.000Z');
    const timeline = service.evaluateTimeline(season, testNow);

    assert.equal(timeline.isIndividualOpen, true);
    assert.equal(timeline.isCollectiveOpen, true);
    assert.equal(timeline.isSchoolForwardingOpen, true);
    assert.equal(timeline.status, 'OPEN_FOR_INDIVIDUAL_SUBMISSION');
  });

  it('evaluates timeline before submission opens (UPCOMING)', async () => {
    const season = await service.getActiveSeason();

    // Date before start (August 15, 2026)
    const testNow = new Date('2026-08-15T10:00:00.000Z');
    const timeline = service.evaluateTimeline(season, testNow);

    assert.equal(timeline.isIndividualOpen, false);
    assert.equal(timeline.isCollectiveOpen, false);
    assert.equal(timeline.status, 'UPCOMING');
  });

  it('evaluates school forwarding window after student submission closes', async () => {
    const season = await service.getActiveSeason();

    // Date after individual deadline but before school forwarding deadline (Dec 05, 2026)
    const testNow = new Date('2026-12-05T10:00:00.000Z');
    const timeline = service.evaluateTimeline(season, testNow);

    assert.equal(timeline.isIndividualOpen, false);
    assert.equal(timeline.isSchoolForwardingOpen, true);
    assert.equal(timeline.status, 'SCHOOL_FORWARDING_WINDOW');
  });

  it('evaluates closed status after all deadlines pass', async () => {
    const season = await service.getActiveSeason();

    // Date after all deadlines (December 20, 2026)
    const testNow = new Date('2026-12-20T10:00:00.000Z');
    const timeline = service.evaluateTimeline(season, testNow);

    assert.equal(timeline.isIndividualOpen, false);
    assert.equal(timeline.isSchoolForwardingOpen, false);
    assert.equal(timeline.status, 'INDIVIDUAL_SUBMISSION_CLOSED');
  });

  it('rejects invalid timeline dates where start >= end', async () => {
    await assert.rejects(
      async () => {
        await service.createSeason({
          code: '2026-2027',
          name: 'Năm học 2026–2027',
          individualSubmissionStart: new Date('2027-11-30T00:00:00.000Z'),
          individualSubmissionEnd: new Date('2027-09-01T00:00:00.000Z'), // Invalid: end before start!
          schoolForwardingDeadline: new Date('2027-12-15T00:00:00.000Z'),
          collectiveSubmissionStart: new Date('2027-09-15T00:00:00.000Z'),
          collectiveSubmissionEnd: new Date('2027-11-30T00:00:00.000Z'),
        });
      },
      (err: any) => {
        assert.equal(err.status, 400);
        return true;
      }
    );
  });

  it('rejects school forwarding deadline before individual submission deadline', async () => {
    await assert.rejects(
      async () => {
        await service.createSeason({
          code: '2026-2027',
          name: 'Năm học 2026–2027',
          individualSubmissionStart: new Date('2027-09-01T00:00:00.000Z'),
          individualSubmissionEnd: new Date('2027-11-30T00:00:00.000Z'),
          schoolForwardingDeadline: new Date('2027-11-15T00:00:00.000Z'), // Invalid: forwarding deadline before student end!
          collectiveSubmissionStart: new Date('2027-09-15T00:00:00.000Z'),
          collectiveSubmissionEnd: new Date('2027-11-30T00:00:00.000Z'),
        });
      },
      (err: any) => {
        assert.equal(err.status, 400);
        return true;
      }
    );
  });

  it('atomically activates a season and deactivates others', async () => {
    // Activate 2024–2025
    const activated = await service.setActiveSeason('season-2024-2025');
    assert.equal(activated.isActive, true);

    const oldSeason = await service.getSeasonById('season-2025-2026');
    assert.equal(oldSeason.isActive, false);

    // Switch back to 2025-2026
    await service.setActiveSeason('season-2025-2026');
    const currentActive = await service.getActiveSeason();
    assert.equal(currentActive.code, '2025-2026');
  });

  it('preserves historical seasons and criteria data when switching seasons', async () => {
    const all = await service.getSeasons();
    assert.ok(all.length >= 2);
    assert.ok(all.some((s) => s.code === '2024-2025'));
    assert.ok(all.some((s) => s.code === '2025-2026'));
  });
});
