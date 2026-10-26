/**
 * 5TOT Đà Nẵng — Fake In-Memory School Forwarding Batch Repository (Backend V2 Testing)
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 */

import type { ISchoolForwardingBatchRepository } from '../../src/modules/schoolReviews/schoolForwardingBatch.repository';
import type {
  SchoolForwardingBatchDto,
  SchoolForwardingBatchSummaryDto,
  SaveBatchDraftInput,
  AttachDecisionDocumentInput,
} from '../../src/modules/schoolReviews/schoolForwardingBatch.types';

export class FakeSchoolForwardingBatchRepository implements ISchoolForwardingBatchRepository {
  public batches: Map<string, SchoolForwardingBatchDto> = new Map();
  public auditEvents: any[] = [];
  public mockApplications: Array<{
    id: string;
    seasonId: string;
    schoolReviewUnitId: string;
    institutionId: string;
    institutionName: string;
    schoolPreliminaryStatus: string;
    openSupplementCount: number;
  }> = [];

  public async findBatchByUnitAndSeason(
    unitId: string,
    seasonId: string
  ): Promise<SchoolForwardingBatchDto | null> {
    for (const b of this.batches.values()) {
      if (b.schoolReviewUnitId === unitId && b.seasonId === seasonId) {
        return structuredClone(b);
      }
    }
    return null;
  }

  public async findBatchById(batchId: string): Promise<SchoolForwardingBatchDto | null> {
    const b = this.batches.get(batchId);
    return b ? structuredClone(b) : null;
  }

  public async createOrUpdateBatchDraft(
    unitId: string,
    input: SaveBatchDraftInput,
    userId: string
  ): Promise<SchoolForwardingBatchDto> {
    let existing = await this.findBatchByUnitAndSeason(unitId, input.seasonId);
    const now = new Date().toISOString();

    if (!existing) {
      const newBatch: SchoolForwardingBatchDto = {
        id: `batch-${unitId}-${input.seasonId}`,
        seasonId: input.seasonId,
        schoolReviewUnitId: unitId,
        schoolReviewUnitName: unitId === 'unit-udn' ? 'Đại học Đà Nẵng' : 'Đơn vị xét sơ tuyển',
        status: 'DRAFT',
        selectedApplicationIds: input.selectedApplicationIds,
        applicationCount: input.selectedApplicationIds.length,
        forwardingNote: input.forwardingNote,
        decisionNumber: input.decisionMetadata?.decisionNumber,
        decisionTitle: input.decisionMetadata?.decisionTitle,
        decisionDate: input.decisionMetadata?.decisionDate,
        signedByName: input.decisionMetadata?.signedByName,
        signedByTitle: input.decisionMetadata?.signedByTitle,
        version: 1,
        createdAt: now,
        updatedAt: now,
      };
      this.batches.set(newBatch.id, newBatch);
      return structuredClone(newBatch);
    }

    existing.selectedApplicationIds = input.selectedApplicationIds;
    existing.applicationCount = input.selectedApplicationIds.length;
    existing.forwardingNote = input.forwardingNote ?? existing.forwardingNote;
    if (input.decisionMetadata) {
      existing.decisionNumber = input.decisionMetadata.decisionNumber ?? existing.decisionNumber;
      existing.decisionTitle = input.decisionMetadata.decisionTitle ?? existing.decisionTitle;
      existing.decisionDate = input.decisionMetadata.decisionDate ?? existing.decisionDate;
      existing.signedByName = input.decisionMetadata.signedByName ?? existing.signedByName;
      existing.signedByTitle = input.decisionMetadata.signedByTitle ?? existing.signedByTitle;
    }
    existing.version += 1;
    existing.updatedAt = now;
    this.batches.set(existing.id, existing);
    return structuredClone(existing);
  }

  public async attachDecisionDocument(
    unitId: string,
    input: AttachDecisionDocumentInput,
    _userId: string
  ): Promise<SchoolForwardingBatchDto> {
    let existing = await this.findBatchByUnitAndSeason(unitId, input.seasonId);
    const now = new Date().toISOString();

    if (!existing) {
      existing = {
        id: `batch-${unitId}-${input.seasonId}`,
        seasonId: input.seasonId,
        schoolReviewUnitId: unitId,
        schoolReviewUnitName: unitId === 'unit-udn' ? 'Đại học Đà Nẵng' : 'Đơn vị xét sơ tuyển',
        status: 'DRAFT',
        selectedApplicationIds: [],
        applicationCount: 0,
        version: 1,
        createdAt: now,
        updatedAt: now,
      };
    }

    existing.decisionNumber = input.decisionNumber;
    existing.decisionTitle = input.decisionTitle;
    existing.decisionDate = input.decisionDate;
    existing.signedByName = input.signedByName;
    existing.signedByTitle = input.signedByTitle;
    existing.decisionFileId = input.fileId;
    existing.decisionFileName = input.fileName;
    existing.decisionFileSize = input.fileSize;
    existing.decisionFileUrl = input.fileUrl;
    existing.version += 1;
    existing.updatedAt = now;

    this.batches.set(existing.id, existing);
    return structuredClone(existing);
  }

  public async confirmBatchForwarding(
    batchId: string,
    _unitId: string,
    _seasonId: string,
    userId: string,
    forwardingNote?: string,
    idempotencyKey?: string,
    payloadHash?: string
  ): Promise<SchoolForwardingBatchDto> {
    const existing = this.batches.get(batchId);
    if (!existing) {
      throw new Error('Batch not found');
    }
    if (existing.status === 'FORWARDED') {
      throw new Error('Batch already forwarded.');
    }

    existing.status = 'FORWARDED';
    existing.submittedAt = new Date().toISOString();
    existing.submittedByUserId = userId;
    if (forwardingNote) existing.forwardingNote = forwardingNote;
    if (idempotencyKey) existing.idempotencyKey = idempotencyKey;
    if (payloadHash) existing.payloadHash = payloadHash;
    existing.version += 1;
    existing.updatedAt = new Date().toISOString();

    // Mark mock applications
    for (const app of this.mockApplications) {
      if (existing.selectedApplicationIds.includes(app.id)) {
        app.schoolPreliminaryStatus = 'FORWARDED_TO_CITY';
      }
    }

    this.batches.set(batchId, existing);
    return structuredClone(existing);
  }

  public async validateApplicationEligibility(
    unitId: string,
    seasonId: string,
    applicationIds: string[]
  ): Promise<{
    valid: boolean;
    invalidApplicationIds: string[];
    reasons: string[];
  }> {
    const invalidIds: string[] = [];
    const reasons: string[] = [];

    for (const appId of applicationIds) {
      // Check collective
      if (appId.toLowerCase().startsWith('col-')) {
        invalidIds.push(appId);
        reasons.push(`Hồ sơ ${appId} là hồ sơ Tập thể (không được đưa vào đợt chuyển cá nhân)`);
        continue;
      }

      const app = this.mockApplications.find((a) => a.id === appId);
      if (!app) {
        invalidIds.push(appId);
        reasons.push(`Không tìm thấy hồ sơ ${appId}`);
        continue;
      }

      if (app.seasonId !== seasonId) {
        invalidIds.push(appId);
        reasons.push(`Hồ sơ ${appId} không thuộc mùa xét ${seasonId}`);
        continue;
      }

      if (app.schoolReviewUnitId !== unitId) {
        invalidIds.push(appId);
        reasons.push(`Hồ sơ ${appId} thuộc đơn vị khác (${app.schoolReviewUnitId}), không thuộc ${unitId}`);
        continue;
      }

      if (app.schoolPreliminaryStatus === 'NOT_ELIGIBLE_AT_SCHOOL' || app.schoolPreliminaryStatus === 'not_recommended') {
        invalidIds.push(appId);
        reasons.push(`Hồ sơ ${appId} không được đề xuất ở cấp Trường (Không đủ điều kiện sơ tuyển)`);
        continue;
      }

      if (app.schoolPreliminaryStatus === 'FORWARDED_TO_CITY') {
        invalidIds.push(appId);
        reasons.push(`Hồ sơ ${appId} đã được chuyển lên cấp Thành phố trước đó`);
        continue;
      }

      if (app.openSupplementCount > 0) {
        invalidIds.push(appId);
        reasons.push(`Hồ sơ ${appId} đang có ${app.openSupplementCount} yêu cầu bổ sung chưa hoàn tất`);
        continue;
      }
    }

    return {
      valid: invalidIds.length === 0,
      invalidApplicationIds: invalidIds,
      reasons,
    };
  }

  public async getBatchSummary(
    unitId: string,
    seasonId: string
  ): Promise<SchoolForwardingBatchSummaryDto> {
    const apps = this.mockApplications.filter(
      a => a.schoolReviewUnitId === unitId && a.seasonId === seasonId
    );

    const existing = await this.findBatchByUnitAndSeason(unitId, seasonId);

    const total = apps.length;
    let reviewed = 0;
    let selected = 0;
    let notSelected = 0;
    let pending = 0;
    let withOpenSupplements = 0;

    const instMap = new Map<string, { id: string; name: string; total: number; selected: number; pending: number }>();

    for (const a of apps) {
      if (!instMap.has(a.institutionId)) {
        instMap.set(a.institutionId, {
          id: a.institutionId,
          name: a.institutionName,
          total: 0,
          selected: 0,
          pending: 0,
        });
      }
      const item = instMap.get(a.institutionId)!;
      item.total++;

      if (a.openSupplementCount > 0) withOpenSupplements++;

      if (a.schoolPreliminaryStatus === 'FORWARDED_TO_CITY' || a.schoolPreliminaryStatus === 'ELIGIBLE_FOR_CITY') {
        reviewed++;
        selected++;
        item.selected++;
      } else if (a.schoolPreliminaryStatus === 'NOT_ELIGIBLE_AT_SCHOOL') {
        reviewed++;
        notSelected++;
      } else {
        pending++;
        item.pending++;
      }
    }

    const blockingReasons: string[] = [];
    if (selected === 0) {
      blockingReasons.push('Chưa có hồ sơ nào được đơn vị đề xuất chuyển cấp Thành phố.');
    }
    if (!existing?.decisionFileId) {
      blockingReasons.push('Chưa đính kèm văn bản đề nghị chính thức của đơn vị.');
    }
    if (withOpenSupplements > 0) {
      blockingReasons.push(`Còn ${withOpenSupplements} hồ sơ có yêu cầu bổ sung minh chứng chưa hoàn tất.`);
    }

    const isAlreadyForwarded = existing?.status === 'FORWARDED';

    return {
      schoolReviewUnitId: unitId,
      schoolReviewUnitName: unitId === 'unit-udn' ? 'Đại học Đà Nẵng' : 'Đơn vị xét sơ tuyển',
      seasonId,
      seasonCode: '2025-2026',
      totalApplicationsInScope: total,
      reviewedApplicationsCount: reviewed,
      selectedApplicationsCount: selected,
      notSelectedApplicationsCount: notSelected,
      pendingReviewCount: pending,
      hasActiveSupplementsCount: withOpenSupplements,
      institutionBreakdown: Array.from(instMap.values()).map(v => ({
        institutionId: v.id,
        institutionName: v.name,
        totalApplications: v.total,
        selectedCount: v.selected,
        pendingCount: v.pending,
      })),
      canForward: !isAlreadyForwarded && blockingReasons.length === 0,
      blockingReasons,
      isAlreadyForwarded,
      forwardedAt: existing?.submittedAt,
      batchId: existing?.id,
      attachedDecisionDocument: existing?.decisionFileId ? {
        decisionNumber: existing.decisionNumber || '',
        decisionTitle: existing.decisionTitle || '',
        decisionDate: existing.decisionDate || '',
        signedByName: existing.signedByName || '',
        signedByTitle: existing.signedByTitle || '',
        fileId: existing.decisionFileId || '',
        fileName: existing.decisionFileName || '',
        fileSize: existing.decisionFileSize || 0,
        fileUrl: existing.decisionFileUrl,
      } : undefined,
    };
  }

  public async listIncomingBatchesForCity(seasonId?: string): Promise<SchoolForwardingBatchDto[]> {
    const list: SchoolForwardingBatchDto[] = [];
    for (const b of this.batches.values()) {
      if (b.status === 'FORWARDED') {
        if (!seasonId || b.seasonId === seasonId) {
          list.push(structuredClone(b));
        }
      }
    }
    return list;
  }

  public async recordAuditEvent(event: any): Promise<void> {
    this.auditEvents.push({ ...event, recordedAt: new Date().toISOString() });
  }
}
