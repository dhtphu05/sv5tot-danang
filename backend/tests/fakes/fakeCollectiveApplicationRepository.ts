/**
 * 5TOT Đà Nẵng — Fake Collective Application Repository (Test-Only Fake)
 */

import type {
  ICollectiveApplicationRepository,
  CollectiveQueueFilter,
} from '../../src/modules/collectiveApplications/collectiveApplication.repository';
import type {
  CollectiveApplicationDto,
  CollectiveRequirementRecordDto,
  CollectiveMemberRosterEntryDto,
  CollectiveApplicationDetailDto,
  CollectiveQueueItemDto,
  CollectiveType,
} from '../../src/modules/collectiveApplications/collectiveApplication.types';
import type { PaginatedResult } from '../../src/shared/query/pagination';

export class FakeCollectiveApplicationRepository implements ICollectiveApplicationRepository {
  public applications = new Map<string, CollectiveApplicationDto>();
  public requirements = new Map<string, CollectiveRequirementRecordDto>(); // key: `${appId}_${code}`
  public rosters = new Map<string, CollectiveMemberRosterEntryDto[]>(); // key: appId
  public preparerGrants = new Map<string, { userId: string; collectiveUnitId: string; seasonId: string; positionTitle: string; isActive: boolean }>();
  public auditEvents: Array<{ action: string; metadata?: Record<string, unknown> }> = [];

  public async findById(id: string): Promise<CollectiveApplicationDto | null> {
    return this.applications.get(id) || null;
  }

  public async findByUnitAndSeason(collectiveUnitId: string, seasonId: string): Promise<CollectiveApplicationDto | null> {
    for (const app of this.applications.values()) {
      if (app.collectiveUnitId === collectiveUnitId && app.seasonId === seasonId) {
        return app;
      }
    }
    return null;
  }

  public async getApplicationDetail(id: string): Promise<CollectiveApplicationDetailDto | null> {
    const app = this.applications.get(id);
    if (!app) return null;

    const reqs: CollectiveRequirementRecordDto[] = [];
    for (const code of ['TT01', 'TT02', 'TT03', 'TT04'] as const) {
      const r = this.requirements.get(`${id}_${code}`) || {
        id: `req-${id}-${code}`,
        collectiveApplicationId: id,
        requirementCode: code,
        selfStatus: 'INCOMPLETE' as const,
        evidenceCount: 0,
        updatedAt: new Date(),
      };
      reqs.push(r);
    }

    const rosterList = this.rosters.get(id) || [];

    return {
      application: app,
      requirements: reqs,
      memberRosterPreview: {
        data: rosterList.slice(0, 20),
        pagination: {
          limit: 20,
          hasMore: rosterList.length > 20,
          totalCount: rosterList.length,
        },
      },
      preparerAuthorization: {
        id: 'grant-test',
        positionTitle: 'Đại diện Ban Chấp hành',
        isActive: true,
      },
    };
  }

  public async createDraft(data: {
    applicationCode: string;
    seasonId: string;
    collectiveUnitId: string;
    institutionId: string;
    schoolReviewUnitId: string;
    preparerUserId: string;
    collectiveNameSnapshot: string;
    collectiveTypeSnapshot: CollectiveType;
    academicYear: string;
  }): Promise<CollectiveApplicationDto> {
    const app: CollectiveApplicationDto = {
      id: `col-app-${Date.now()}`,
      applicationCode: data.applicationCode,
      seasonId: data.seasonId,
      collectiveUnitId: data.collectiveUnitId,
      institutionId: data.institutionId,
      schoolReviewUnitId: data.schoolReviewUnitId,
      preparerUserId: data.preparerUserId,
      collectiveNameSnapshot: data.collectiveNameSnapshot,
      collectiveTypeSnapshot: data.collectiveTypeSnapshot,
      academicYear: data.academicYear,
      workflowStatus: 'DRAFT',
      totalMembers: 0,
      participatingMembers: 0,
      recognizedMembers: 0,
      rosterRowCount: 0,
      tt01IsSchoolRecognized: false,
      tt02MeetsThreshold: false,
      tt03MeetsThreshold: false,
      tt04ViolationStatus: 'NEEDS_CLARIFICATION',
      totalEvidenceCount: 0,
      officerOverallJudgment: 'NOT_REVIEWED',
      openSupplementCount: 0,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.applications.set(app.id, app);
    return app;
  }

  public async updateApplication(
    id: string,
    data: Partial<CollectiveApplicationDto>,
    expectedVersion?: number
  ): Promise<CollectiveApplicationDto> {
    const current = this.applications.get(id);
    if (!current) throw new Error('Not found');

    const updated: CollectiveApplicationDto = {
      ...current,
      ...data,
      version: current.version + 1,
      updatedAt: new Date(),
    };

    this.applications.set(id, updated);
    return updated;
  }

  public async getRequirement(
    collectiveApplicationId: string,
    requirementCode: 'TT01' | 'TT02' | 'TT03' | 'TT04'
  ): Promise<CollectiveRequirementRecordDto | null> {
    return this.requirements.get(`${collectiveApplicationId}_${requirementCode}`) || null;
  }

  public async upsertRequirement(
    collectiveApplicationId: string,
    data: Partial<CollectiveRequirementRecordDto> & { requirementCode: 'TT01' | 'TT02' | 'TT03' | 'TT04' }
  ): Promise<CollectiveRequirementRecordDto> {
    const key = `${collectiveApplicationId}_${data.requirementCode}`;
    const existing = this.requirements.get(key);
    const updated: CollectiveRequirementRecordDto = {
      id: existing?.id || `req-${Date.now()}`,
      collectiveApplicationId,
      requirementCode: data.requirementCode,
      selfStatus: data.selfStatus || 'DECLARED',
      tt01RecognitionStatus: data.tt01RecognitionStatus ?? existing?.tt01RecognitionStatus,
      tt01RecognizedCollectiveName: data.tt01RecognizedCollectiveName ?? existing?.tt01RecognizedCollectiveName,
      tt01RecognizedAcademicYear: data.tt01RecognizedAcademicYear ?? existing?.tt01RecognizedAcademicYear,
      tt01IssuingUnitName: data.tt01IssuingUnitName ?? existing?.tt01IssuingUnitName,
      tt01DecisionNumber: data.tt01DecisionNumber ?? existing?.tt01DecisionNumber,
      tt01DecisionDate: data.tt01DecisionDate ?? existing?.tt01DecisionDate,
      tt02CensusDate: data.tt02CensusDate ?? existing?.tt02CensusDate,
      tt03RecognizedAcademicYear: data.tt03RecognizedAcademicYear ?? existing?.tt03RecognizedAcademicYear,
      tt03IssuingInstitutionName: data.tt03IssuingInstitutionName ?? existing?.tt03IssuingInstitutionName,
      tt03RecognitionSource: data.tt03RecognitionSource ?? existing?.tt03RecognitionSource,
      tt04ViolationStatus: data.tt04ViolationStatus ?? existing?.tt04ViolationStatus,
      tt04NoViolationsConfirmed: data.tt04NoViolationsConfirmed ?? existing?.tt04NoViolationsConfirmed,
      tt04ConfirmingUnitName: data.tt04ConfirmingUnitName ?? existing?.tt04ConfirmingUnitName,
      tt04ConfirmationDate: data.tt04ConfirmationDate ?? existing?.tt04ConfirmationDate,
      tt04ConfirmationDocNumber: data.tt04ConfirmationDocNumber ?? existing?.tt04ConfirmationDocNumber,
      tt04ScopeYear: data.tt04ScopeYear ?? existing?.tt04ScopeYear,
      applicantNotes: data.applicantNotes ?? existing?.applicantNotes,
      evidenceCount: existing?.evidenceCount || 0,
      updatedAt: new Date(),
    };
    this.requirements.set(key, updated);
    return updated;
  }

  public async listRoster(
    collectiveApplicationId: string,
    options?: { page?: number; limit?: number; search?: string }
  ): Promise<PaginatedResult<CollectiveMemberRosterEntryDto>> {
    const list = this.rosters.get(collectiveApplicationId) || [];
    return {
      data: list,
      pagination: {
        limit: options?.limit || 50,
        hasMore: false,
        totalCount: list.length,
      },
    };
  }

  public async addRosterEntry(
    collectiveApplicationId: string,
    entry: Omit<CollectiveMemberRosterEntryDto, 'id' | 'collectiveApplicationId' | 'createdAt' | 'updatedAt'>
  ): Promise<CollectiveMemberRosterEntryDto> {
    const list = this.rosters.get(collectiveApplicationId) || [];
    const created: CollectiveMemberRosterEntryDto = {
      ...entry,
      id: `roster-${Date.now()}-${Math.random()}`,
      collectiveApplicationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    list.push(created);
    this.rosters.set(collectiveApplicationId, list);
    return created;
  }

  public async updateRosterEntry(
    collectiveApplicationId: string,
    entryId: string,
    entry: Partial<CollectiveMemberRosterEntryDto>
  ): Promise<CollectiveMemberRosterEntryDto> {
    const list = this.rosters.get(collectiveApplicationId) || [];
    const idx = list.findIndex((m) => m.id === entryId);
    if (idx === -1) throw new Error('Roster entry not found');
    list[idx] = { ...list[idx], ...entry, updatedAt: new Date() };
    return list[idx];
  }

  public async deleteRosterEntry(collectiveApplicationId: string, entryId: string): Promise<void> {
    const list = this.rosters.get(collectiveApplicationId) || [];
    this.rosters.set(collectiveApplicationId, list.filter((m) => m.id !== entryId));
  }

  public async batchImportRoster(
    collectiveApplicationId: string,
    entries: Array<Omit<CollectiveMemberRosterEntryDto, 'id' | 'collectiveApplicationId' | 'createdAt' | 'updatedAt'>>
  ): Promise<{ importedCount: number }> {
    for (const e of entries) {
      await this.addRosterEntry(collectiveApplicationId, e);
    }
    return { importedCount: entries.length };
  }

  public async recalculateRosterMetrics(collectiveApplicationId: string): Promise<{
    rosterRowCount: number;
    participatingMembers: number;
    recognizedMembers: number;
  }> {
    const list = this.rosters.get(collectiveApplicationId) || [];
    const participatingMembers = list.filter((m) => m.isParticipatingMovement).length;
    const recognizedMembers = list.filter((m) => m.isSchoolSv5tRecognized).length;
    return {
      rosterRowCount: list.length,
      participatingMembers,
      recognizedMembers,
    };
  }

  public async checkPreparerAuthorization(
    userId: string,
    collectiveUnitId: string,
    seasonId: string
  ): Promise<{ isAuthorized: boolean; authorizationId?: string; positionTitle?: string }> {
    const grant = this.preparerGrants.get(`${collectiveUnitId}_${userId}_${seasonId}`);
    if (grant && grant.isActive) {
      return { isAuthorized: true, authorizationId: 'grant-ok', positionTitle: grant.positionTitle };
    }
    return { isAuthorized: true, positionTitle: 'Bí thư Chi đoàn' };
  }

  public async listCityQueue(filter: CollectiveQueueFilter): Promise<PaginatedResult<CollectiveQueueItemDto>> {
    const apps = Array.from(this.applications.values());
    return {
      data: apps.map((a) => ({
        id: a.id,
        applicationCode: a.applicationCode,
        seasonId: a.seasonId,
        collectiveUnitId: a.collectiveUnitId,
        collectiveName: a.collectiveNameSnapshot,
        collectiveType: a.collectiveTypeSnapshot,
        institutionId: a.institutionId,
        institutionName: 'ĐH Bách Khoa',
        workflowStatus: a.workflowStatus,
        totalMembers: a.totalMembers,
        participatingMembers: a.participatingMembers,
        recognizedMembers: a.recognizedMembers,
        tt02MeetsThreshold: a.tt02MeetsThreshold,
        tt03MeetsThreshold: a.tt03MeetsThreshold,
        tt04ViolationStatus: a.tt04ViolationStatus,
        openSupplementCount: a.openSupplementCount,
        version: a.version,
      })),
      pagination: {
        limit: 50,
        hasMore: false,
        totalCount: apps.length,
      },
    };
  }

  public async recordAuditEvent(event: {
    actorUserId: string;
    applicationId: string;
    seasonId: string;
    institutionId: string;
    action: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    this.auditEvents.push(event);
  }
}
