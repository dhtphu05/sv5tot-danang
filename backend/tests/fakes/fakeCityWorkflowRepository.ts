/**
 * 5TOT Đà Nẵng — Fake City Workflow Repository (Test-Only Fake)
 */

import type { ICityWorkflowRepository, CityIntakeFilter } from '../../src/modules/cityWorkflow/cityWorkflow.repository';
import type {
  CityIntakeQueueItemDto,
  CityOfficerWorkloadDto,
  CityCriterionJudgmentDto,
  CollectiveCityRequirementJudgmentDto,
} from '../../src/modules/cityWorkflow/cityWorkflow.types';
import type { ReviewJudgmentStatus } from '../../src/modules/schoolReviews/schoolReview.types';
import type { IndividualCriterionCode } from '../../src/modules/individualApplications/individualApplication.types';
import type { PaginatedResult } from '../../src/shared/query/pagination';
import { ApiError } from '../../src/shared/errors/apiError';

export class FakeCityWorkflowRepository implements ICityWorkflowRepository {
  public individualJudgments = new Map<string, CityCriterionJudgmentDto>(); // `${appId}_${code}`
  public collectiveJudgments = new Map<string, CollectiveCityRequirementJudgmentDto>(); // `${appId}_${code}`
  public assignments: Array<{ appId: string; officerId: string; managerId: string }> = [];
  public completedApps = new Set<string>();

  public async listIntakeQueue(filter: CityIntakeFilter): Promise<PaginatedResult<CityIntakeQueueItemDto>> {
    return {
      data: [],
      pagination: {
        limit: 50,
        hasMore: false,
        totalCount: 0,
      },
    };
  }

  public async getOfficerWorkload(seasonId?: string): Promise<CityOfficerWorkloadDto[]> {
    return [
      {
        officerUserId: 'user-officer-city-1',
        officerFullName: 'Cán bộ Ban TTNTH',
        email: 'officer.city@danang.gov.vn',
        assignedIndividualCount: 5,
        assignedCollectiveCount: 2,
        inReviewCount: 4,
        completedCount: 3,
        totalActiveAssigned: 7,
      },
    ];
  }

  public async assignIndividualApplication(data: {
    applicationId: string;
    assignedOfficerUserId: string;
    assignedOfficerName: string;
    assignedByManagerUserId: string;
    assignedByManagerName: string;
    assignmentNote?: string;
  }): Promise<void> {
    this.assignments.push({
      appId: data.applicationId,
      officerId: data.assignedOfficerUserId,
      managerId: data.assignedByManagerUserId,
    });
  }

  public async assignCollectiveApplication(data: {
    applicationId: string;
    assignedOfficerUserId: string;
    assignedOfficerName: string;
    assignedByManagerUserId: string;
    assignedByManagerName: string;
    assignmentNote?: string;
  }): Promise<void> {
    this.assignments.push({
      appId: data.applicationId,
      officerId: data.assignedOfficerUserId,
      managerId: data.assignedByManagerUserId,
    });
  }

  public async saveCityIndividualJudgment(data: {
    applicationId: string;
    criterionCode: IndividualCriterionCode;
    judgmentStatus: ReviewJudgmentStatus;
    reviewerUserId: string;
    reviewerNameSnapshot: string;
    reviewerNote?: string;
    flaggedEvidenceLinkIds?: string[];
  }): Promise<CityCriterionJudgmentDto> {
    const key = `${data.applicationId}_${data.criterionCode}`;
    const j: CityCriterionJudgmentDto = {
      id: `city-jdg-${Date.now()}`,
      individualApplicationId: data.applicationId,
      criterionCode: data.criterionCode,
      judgmentStatus: data.judgmentStatus,
      reviewerUserId: data.reviewerUserId,
      reviewerNameSnapshot: data.reviewerNameSnapshot,
      reviewerNote: data.reviewerNote,
      flaggedEvidenceLinkIds: data.flaggedEvidenceLinkIds || [],
      reviewedAt: new Date(),
      revisionNumber: 1,
    };
    this.individualJudgments.set(key, j);
    return j;
  }

  public async saveCityCollectiveJudgment(data: {
    applicationId: string;
    requirementCode: 'TT01' | 'TT02' | 'TT03' | 'TT04';
    judgmentStatus: ReviewJudgmentStatus;
    reviewerUserId: string;
    reviewerNameSnapshot: string;
    reviewerNote?: string;
  }): Promise<CollectiveCityRequirementJudgmentDto> {
    const key = `${data.applicationId}_${data.requirementCode}`;
    const j: CollectiveCityRequirementJudgmentDto = {
      id: `col-jdg-${Date.now()}`,
      collectiveApplicationId: data.applicationId,
      requirementCode: data.requirementCode,
      judgmentStatus: data.judgmentStatus,
      reviewerUserId: data.reviewerUserId,
      reviewerNameSnapshot: data.reviewerNameSnapshot,
      reviewerNote: data.reviewerNote,
      reviewedAt: new Date(),
      revisionNumber: 1,
    };
    this.collectiveJudgments.set(key, j);
    return j;
  }

  public appVersions = new Map<string, number>();

  public async completeIndividualReview(
    applicationId: string,
    reviewerUserId: string,
    note?: string,
    expectedVersion?: number
  ): Promise<void> {
    if (this.completedApps.has(applicationId)) {
      throw ApiError.conflict(
        'Hồ sơ đã được hoàn tất thẩm định và đang ở giai đoạn Hội đồng xét chọn.',
        'APPLICATION_ALREADY_COMPLETED'
      );
    }
    const currentVer = this.appVersions.get(applicationId) || 1;
    if (expectedVersion !== undefined && expectedVersion !== currentVer) {
      throw ApiError.conflict(
        'Hồ sơ đã bị thay đổi bởi phiên làm việc khác (xung đột phiên bản).',
        'VERSION_CONFLICT'
      );
    }
    this.completedApps.add(applicationId);
    this.appVersions.set(applicationId, currentVer + 1);
  }

  public async completeCollectiveReview(
    applicationId: string,
    reviewerUserId: string,
    note?: string,
    expectedVersion?: number
  ): Promise<void> {
    if (this.completedApps.has(applicationId)) {
      throw ApiError.conflict(
        'Hồ sơ tập thể đã được hoàn tất thẩm định trước đó.',
        'APPLICATION_ALREADY_COMPLETED'
      );
    }
    const currentVer = this.appVersions.get(applicationId) || 1;
    if (expectedVersion !== undefined && expectedVersion !== currentVer) {
      throw ApiError.conflict(
        'Hồ sơ đã bị thay đổi bởi phiên làm việc khác (xung đột phiên bản).',
        'VERSION_CONFLICT'
      );
    }
    this.completedApps.add(applicationId);
    this.appVersions.set(applicationId, currentVer + 1);
  }

  public async reopenIndividualReview(applicationId: string, officerUserId: string, reason?: string): Promise<void> {
    this.completedApps.delete(applicationId);
    const currentVer = this.appVersions.get(applicationId) || 1;
    this.appVersions.set(applicationId, currentVer + 1);
  }

  public async reopenCollectiveReview(applicationId: string, officerUserId: string, reason?: string): Promise<void> {
    this.completedApps.delete(applicationId);
    const currentVer = this.appVersions.get(applicationId) || 1;
    this.appVersions.set(applicationId, currentVer + 1);
  }

  public async getIndividualJudgments(applicationId: string): Promise<CityCriterionJudgmentDto[]> {
    return Array.from(this.individualJudgments.values()).filter((j) => j.individualApplicationId === applicationId);
  }

  public async getCollectiveJudgments(applicationId: string): Promise<CollectiveCityRequirementJudgmentDto[]> {
    return Array.from(this.collectiveJudgments.values()).filter((j) => j.collectiveApplicationId === applicationId);
  }
}
