/**
 * 5TOT Đà Nẵng — Fake Committee Repository (Test-Only Fake)
 */

import type { ICommitteeRepository, CommitteeQueueFilter } from '../../src/modules/committee/committee.repository';
import type {
  CommitteeQueueItemDto,
  CommitteeDecisionRecordDto,
  RecognitionDecisionBatchDto,
  ApplicationFinalResultDto,
  ApplicationTrack,
  CommitteeOutcome,
} from '../../src/modules/committee/committee.types';
import type { PaginatedResult } from '../../src/shared/query/pagination';
import { ApiError } from '../../src/shared/errors/apiError';

export class FakeCommitteeRepository implements ICommitteeRepository {
  public decisions = new Map<string, CommitteeDecisionRecordDto>();
  public batches = new Map<string, RecognitionDecisionBatchDto>();
  public finalResults = new Map<string, ApplicationFinalResultDto>();

  public async listCommitteeQueue(filter: CommitteeQueueFilter): Promise<PaginatedResult<CommitteeQueueItemDto>> {
    return {
      data: [],
      pagination: {
        limit: 50,
        hasMore: false,
        totalCount: 0,
      },
    };
  }

  public async recordDecision(data: {
    track: ApplicationTrack;
    applicationId: string;
    outcome: CommitteeOutcome;
    decisionNote?: string;
    decidedByUserId: string;
    decidedByNameSnapshot: string;
  }): Promise<CommitteeDecisionRecordDto> {
    const existing = this.finalResults.get(data.applicationId);
    if (existing && existing.isPublished) {
      throw ApiError.conflict('Hồ sơ đã được công bố quyết định.', 'APPLICATION_ALREADY_PUBLISHED');
    }

    const dec: CommitteeDecisionRecordDto = {
      id: `dec-${Date.now()}`,
      track: data.track,
      individualApplicationId: data.track === 'INDIVIDUAL' ? data.applicationId : undefined,
      collectiveApplicationId: data.track === 'COLLECTIVE' ? data.applicationId : undefined,
      outcome: data.outcome,
      decisionNote: data.decisionNote,
      decidedByUserId: data.decidedByUserId,
      decidedByNameSnapshot: data.decidedByNameSnapshot,
      decidedAt: new Date(),
      isCurrentActive: true,
    };

    this.decisions.set(data.applicationId, dec);

    const finalRes: ApplicationFinalResultDto = {
      id: `final-${Date.now()}`,
      seasonId: 'season-2025-2026',
      track: data.track,
      individualApplicationId: data.track === 'INDIVIDUAL' ? data.applicationId : undefined,
      collectiveApplicationId: data.track === 'COLLECTIVE' ? data.applicationId : undefined,
      outcome: data.outcome,
      isPublished: false,
      finalizedByUserId: data.decidedByUserId,
      finalizedAt: new Date(),
      summaryNote: data.decisionNote,
    };
    this.finalResults.set(data.applicationId, finalRes);

    return dec;
  }

  public async reopenDecision(data: {
    track: ApplicationTrack;
    applicationId: string;
    reopenedByUserId: string;
    reopenReason?: string;
  }): Promise<void> {
    const existing = this.finalResults.get(data.applicationId);
    if (existing && existing.isPublished) {
      throw ApiError.conflict('Không thể mở lại hồ sơ đã công bố.', 'APPLICATION_ALREADY_PUBLISHED');
    }
    const dec = this.decisions.get(data.applicationId);
    if (dec) {
      this.decisions.set(data.applicationId, {
        ...dec,
        isCurrentActive: false,
        reopenedAt: new Date(),
        reopenReason: data.reopenReason,
      });
    }
    this.finalResults.delete(data.applicationId);
  }

  public async getActiveDecision(track: ApplicationTrack, applicationId: string): Promise<CommitteeDecisionRecordDto | null> {
    const dec = this.decisions.get(applicationId);
    return dec?.isCurrentActive ? dec : null;
  }

  public async getFinalResult(track: ApplicationTrack, applicationId: string): Promise<ApplicationFinalResultDto | null> {
    return this.finalResults.get(applicationId) || null;
  }

  public async publishDecisionBatch(data: {
    seasonId: string;
    track: ApplicationTrack;
    decisionNumber: string;
    decisionTitle: string;
    decisionDate: Date;
    signedByName: string;
    signedByTitle: string;
    publishedById: string;
    applicationIds: string[];
  }): Promise<RecognitionDecisionBatchDto> {
    for (const b of this.batches.values()) {
      if (b.decisionNumber === data.decisionNumber) {
        throw ApiError.conflict('Số quyết định đã tồn tại.', 'DUPLICATE_DECISION_NUMBER');
      }
    }

    const batch: RecognitionDecisionBatchDto = {
      id: `batch-${Date.now()}`,
      seasonId: data.seasonId,
      track: data.track,
      decisionNumber: data.decisionNumber,
      decisionTitle: data.decisionTitle,
      decisionDate: data.decisionDate,
      signedByName: data.signedByName,
      signedByTitle: data.signedByTitle,
      status: 'PUBLISHED',
      publishedById: data.publishedById,
      publishedAt: new Date(),
      awardedCount: data.applicationIds.length,
    };
    this.batches.set(batch.id, batch);

    for (const appId of data.applicationIds) {
      const res = this.finalResults.get(appId);
      if (res) {
        this.finalResults.set(appId, {
          ...res,
          isPublished: true,
          decisionBatchId: batch.id,
          decisionNumberSnapshot: data.decisionNumber,
          decisionDateSnapshot: data.decisionDate,
          publishedAt: new Date(),
          publishedByUserId: data.publishedById,
        });
      }
    }

    return batch;
  }
}
