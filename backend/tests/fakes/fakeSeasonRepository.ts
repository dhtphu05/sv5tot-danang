/**
 * 5TOT Đà Nẵng — Fake Award Season Repository (Backend Tests V2)
 * Pre-seeded with official 2025–2026 award season.
 */

import { IAwardSeasonRepository } from '../../src/modules/seasons/season.repository';
import {
  AwardSeasonDto,
  CreateAwardSeasonInput,
  UpdateAwardSeasonInput,
} from '../../src/modules/seasons/season.types';

export class FakeSeasonRepository implements IAwardSeasonRepository {
  private seasons: Map<string, AwardSeasonDto> = new Map();

  constructor() {
    this.seedDefaultSeasons();
  }

  private seedDefaultSeasons(): void {
    const now = new Date();
    // Default active season 2025–2026
    const season2026: AwardSeasonDto = {
      id: 'season-2025-2026',
      code: '2025-2026',
      name: 'Năm học 2025–2026',
      isActive: true,
      lifecycleStatus: 'ACTIVE',
      copiedFromSeasonId: 'season-2024-2025',
      individualSubmissionStart: new Date('2026-09-01T00:00:00.000Z'),
      individualSubmissionEnd: new Date('2026-11-30T23:59:59.000Z'),
      schoolReviewStartAt: new Date('2026-10-01T00:00:00.000Z'),
      schoolReviewEndAt: new Date('2026-12-10T23:59:59.000Z'),
      schoolForwardingDeadline: new Date('2026-12-15T23:59:59.000Z'),
      collectiveSubmissionStart: new Date('2026-09-15T00:00:00.000Z'),
      collectiveSubmissionEnd: new Date('2026-11-30T23:59:59.000Z'),
      cityReviewStartAt: new Date('2026-12-16T00:00:00.000Z'),
      cityReviewEndAt: new Date('2026-12-25T23:59:59.000Z'),
      committeeMeetingStartAt: new Date('2026-12-28T00:00:00.000Z'),
      resultAnnouncementAt: new Date('2027-01-05T00:00:00.000Z'),
      defaultSupplementWindowHours: 72,
      createdAt: now,
      updatedAt: now,
    };

    // Historical season 2024–2025 (closed)
    const season2025: AwardSeasonDto = {
      id: 'season-2024-2025',
      code: '2024-2025',
      name: 'Năm học 2024–2025',
      isActive: false,
      lifecycleStatus: 'CLOSED',
      copiedFromSeasonId: null,
      individualSubmissionStart: new Date('2025-09-01T00:00:00.000Z'),
      individualSubmissionEnd: new Date('2025-11-30T23:59:59.000Z'),
      schoolReviewStartAt: new Date('2025-10-01T00:00:00.000Z'),
      schoolReviewEndAt: new Date('2025-12-10T23:59:59.000Z'),
      schoolForwardingDeadline: new Date('2025-12-15T23:59:59.000Z'),
      collectiveSubmissionStart: new Date('2025-09-15T00:00:00.000Z'),
      collectiveSubmissionEnd: new Date('2025-11-30T23:59:59.000Z'),
      cityReviewStartAt: new Date('2025-12-16T00:00:00.000Z'),
      cityReviewEndAt: new Date('2025-12-25T23:59:59.000Z'),
      committeeMeetingStartAt: new Date('2025-12-28T00:00:00.000Z'),
      resultAnnouncementAt: new Date('2026-01-05T00:00:00.000Z'),
      defaultSupplementWindowHours: 72,
      createdAt: new Date('2025-08-01T00:00:00.000Z'),
      updatedAt: new Date('2025-12-31T00:00:00.000Z'),
    };

    this.seasons.set(season2026.id, season2026);
    this.seasons.set(season2025.id, season2025);
  }

  public async findById(id: string): Promise<AwardSeasonDto | null> {
    return this.seasons.get(id) ?? null;
  }

  public async findByCode(code: string): Promise<AwardSeasonDto | null> {
    const normalized = code.replace(/–|—/g, '-').trim();
    for (const season of this.seasons.values()) {
      if (season.code === normalized || season.code === code) return season;
    }
    return null;
  }

  public async getActiveSeason(): Promise<AwardSeasonDto | null> {
    for (const season of this.seasons.values()) {
      if (season.isActive) return season;
    }
    return null;
  }

  public async list(): Promise<AwardSeasonDto[]> {
    const list = Array.from(this.seasons.values());
    list.sort((a, b) => b.code.localeCompare(a.code));
    return list;
  }

  public async create(data: CreateAwardSeasonInput): Promise<AwardSeasonDto> {
    const id = `season-${data.code}`;
    const now = new Date();
    const isActive = data.isActive ?? false;
    const season: AwardSeasonDto = {
      id,
      code: data.code,
      name: data.name,
      isActive,
      lifecycleStatus: data.lifecycleStatus ?? (isActive ? 'ACTIVE' : 'DRAFT'),
      copiedFromSeasonId: data.copiedFromSeasonId ?? null,
      individualSubmissionStart: data.individualSubmissionStart,
      individualSubmissionEnd: data.individualSubmissionEnd,
      schoolReviewStartAt: data.schoolReviewStartAt ?? data.individualSubmissionStart,
      schoolReviewEndAt: data.schoolReviewEndAt ?? data.schoolForwardingDeadline,
      schoolForwardingDeadline: data.schoolForwardingDeadline,
      collectiveSubmissionStart: data.collectiveSubmissionStart,
      collectiveSubmissionEnd: data.collectiveSubmissionEnd,
      cityReviewStartAt: data.cityReviewStartAt ?? data.schoolForwardingDeadline,
      cityReviewEndAt: data.cityReviewEndAt ?? null,
      committeeMeetingStartAt: data.committeeMeetingStartAt ?? null,
      resultAnnouncementAt: data.resultAnnouncementAt ?? null,
      defaultSupplementWindowHours: data.defaultSupplementWindowHours ?? 72,
      createdAt: now,
      updatedAt: now,
    };
    if (season.isActive) {
      for (const s of this.seasons.values()) {
        if (s.isActive) {
          s.isActive = false;
          s.lifecycleStatus = 'CLOSED';
        }
      }
    }
    this.seasons.set(id, season);
    return season;
  }

  public async update(id: string, data: UpdateAwardSeasonInput): Promise<AwardSeasonDto> {
    const existing = this.seasons.get(id);
    if (!existing) {
      throw new Error(`Award season ${id} not found.`);
    }
    if (data.isActive) {
      for (const s of this.seasons.values()) {
        if (s.id !== id && s.isActive) {
          s.isActive = false;
          s.lifecycleStatus = 'CLOSED';
        }
      }
    }
    const updated: AwardSeasonDto = {
      ...existing,
      ...(data.name && { name: data.name }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.lifecycleStatus !== undefined && { lifecycleStatus: data.lifecycleStatus }),
      ...(data.individualSubmissionStart && {
        individualSubmissionStart: data.individualSubmissionStart,
      }),
      ...(data.individualSubmissionEnd && {
        individualSubmissionEnd: data.individualSubmissionEnd,
      }),
      ...(data.schoolReviewStartAt !== undefined && {
        schoolReviewStartAt: data.schoolReviewStartAt,
      }),
      ...(data.schoolReviewEndAt !== undefined && {
        schoolReviewEndAt: data.schoolReviewEndAt,
      }),
      ...(data.schoolForwardingDeadline && {
        schoolForwardingDeadline: data.schoolForwardingDeadline,
      }),
      ...(data.collectiveSubmissionStart && {
        collectiveSubmissionStart: data.collectiveSubmissionStart,
      }),
      ...(data.collectiveSubmissionEnd && {
        collectiveSubmissionEnd: data.collectiveSubmissionEnd,
      }),
      ...(data.cityReviewStartAt !== undefined && {
        cityReviewStartAt: data.cityReviewStartAt,
      }),
      ...(data.cityReviewEndAt !== undefined && {
        cityReviewEndAt: data.cityReviewEndAt,
      }),
      ...(data.committeeMeetingStartAt !== undefined && {
        committeeMeetingStartAt: data.committeeMeetingStartAt,
      }),
      ...(data.resultAnnouncementAt !== undefined && {
        resultAnnouncementAt: data.resultAnnouncementAt,
      }),
      ...(data.defaultSupplementWindowHours !== undefined && {
        defaultSupplementWindowHours: data.defaultSupplementWindowHours,
      }),
      updatedAt: new Date(),
    };
    this.seasons.set(id, updated);
    return updated;
  }

  public async setActive(id: string): Promise<AwardSeasonDto> {
    const target = this.seasons.get(id);
    if (!target) {
      throw new Error(`Award season ${id} not found.`);
    }
    for (const s of this.seasons.values()) {
      if (s.id !== id && s.isActive) {
        s.isActive = false;
        s.lifecycleStatus = 'CLOSED';
      }
    }
    target.isActive = true;
    target.lifecycleStatus = 'ACTIVE';
    target.updatedAt = new Date();
    return target;
  }

  public async delete(id: string): Promise<void> {
    this.seasons.delete(id);
  }
}
