/**
 * 5TOT Đà Nẵng — Prisma Implementation of School Forwarding Batch Repository (Backend V2)
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 */

import type { ISchoolForwardingBatchRepository } from './schoolForwardingBatch.repository';
import type {
  SchoolForwardingBatchDto,
  SchoolForwardingBatchSummaryDto,
  SaveBatchDraftInput,
  AttachDecisionDocumentInput,
} from './schoolForwardingBatch.types';
import { dbManager } from '../../shared/database/prismaClient';
import { getEnvironment } from '../../config/environment';
import { ApiError } from '../../shared/errors/apiError';

export class PrismaSchoolForwardingBatchRepository implements ISchoolForwardingBatchRepository {
  private async getClient() {
    const env = getEnvironment();
    if (env.BACKEND_DATABASE_MODE === 'offline') {
      throw ApiError.serviceUnavailable(
        'Thao tác cơ sở dữ liệu tạm ngưng trong chế độ phát triển offline (BACKEND_DATABASE_MODE=offline).',
        'DATABASE_OFFLINE'
      );
    }
    return dbManager.getClient();
  }

  public async findBatchByUnitAndSeason(
    unitId: string,
    seasonId: string
  ): Promise<SchoolForwardingBatchDto | null> {
    const prisma = await this.getClient();
    const batch = await (prisma as any).schoolForwardingBatch.findUnique({
      where: {
        schoolReviewUnitId_seasonId: {
          schoolReviewUnitId: unitId,
          seasonId,
        },
      },
      include: {
        schoolReviewUnit: true,
      },
    });

    if (!batch) return null;
    return this.mapToDto(batch);
  }

  public async findBatchById(batchId: string): Promise<SchoolForwardingBatchDto | null> {
    const prisma = await this.getClient();
    const batch = await (prisma as any).schoolForwardingBatch.findUnique({
      where: { id: batchId },
      include: { schoolReviewUnit: true },
    });

    if (!batch) return null;
    return this.mapToDto(batch);
  }

  public async createOrUpdateBatchDraft(
    unitId: string,
    input: SaveBatchDraftInput,
    _userId: string
  ): Promise<SchoolForwardingBatchDto> {
    const prisma = await this.getClient();
    const batch = await (prisma as any).schoolForwardingBatch.upsert({
      where: {
        schoolReviewUnitId_seasonId: {
          schoolReviewUnitId: unitId,
          seasonId: input.seasonId,
        },
      },
      create: {
        schoolReviewUnitId: unitId,
        seasonId: input.seasonId,
        status: 'DRAFT',
        forwardingNote: input.forwardingNote,
        selectedApplicationIds: input.selectedApplicationIds,
        applicationCount: input.selectedApplicationIds.length,
        decisionNumber: input.decisionMetadata?.decisionNumber,
        decisionTitle: input.decisionMetadata?.decisionTitle,
        decisionDate: input.decisionMetadata?.decisionDate ? new Date(input.decisionMetadata.decisionDate) : undefined,
        signedByName: input.decisionMetadata?.signedByName,
        signedByTitle: input.decisionMetadata?.signedByTitle,
      },
      update: {
        selectedApplicationIds: input.selectedApplicationIds,
        applicationCount: input.selectedApplicationIds.length,
        forwardingNote: input.forwardingNote,
        decisionNumber: input.decisionMetadata?.decisionNumber,
        decisionTitle: input.decisionMetadata?.decisionTitle,
        decisionDate: input.decisionMetadata?.decisionDate ? new Date(input.decisionMetadata.decisionDate) : undefined,
        signedByName: input.decisionMetadata?.signedByName,
        signedByTitle: input.decisionMetadata?.signedByTitle,
        version: { increment: 1 },
      },
      include: {
        schoolReviewUnit: true,
      },
    });

    return this.mapToDto(batch);
  }

  public async attachDecisionDocument(
    unitId: string,
    input: AttachDecisionDocumentInput,
    _userId: string
  ): Promise<SchoolForwardingBatchDto> {
    const prisma = await this.getClient();
    const batch = await (prisma as any).schoolForwardingBatch.upsert({
      where: {
        schoolReviewUnitId_seasonId: {
          schoolReviewUnitId: unitId,
          seasonId: input.seasonId,
        },
      },
      create: {
        schoolReviewUnitId: unitId,
        seasonId: input.seasonId,
        status: 'DRAFT',
        decisionNumber: input.decisionNumber,
        decisionTitle: input.decisionTitle,
        decisionDate: input.decisionDate ? new Date(input.decisionDate) : undefined,
        signedByName: input.signedByName,
        signedByTitle: input.signedByTitle,
        decisionFileId: input.fileId,
        decisionFileName: input.fileName,
        decisionFileSize: input.fileSize,
        decisionFileUrl: input.fileUrl,
        selectedApplicationIds: [],
        applicationCount: 0,
      },
      update: {
        decisionNumber: input.decisionNumber,
        decisionTitle: input.decisionTitle,
        decisionDate: input.decisionDate ? new Date(input.decisionDate) : undefined,
        signedByName: input.signedByName,
        signedByTitle: input.signedByTitle,
        decisionFileId: input.fileId,
        decisionFileName: input.fileName,
        decisionFileSize: input.fileSize,
        decisionFileUrl: input.fileUrl,
        version: { increment: 1 },
      },
      include: {
        schoolReviewUnit: true,
      },
    });

    return this.mapToDto(batch);
  }

  public async confirmBatchForwarding(
    batchId: string,
    unitId: string,
    seasonId: string,
    userId: string,
    forwardingNote?: string,
    idempotencyKey?: string,
    payloadHash?: string
  ): Promise<SchoolForwardingBatchDto> {
    const prisma = await this.getClient();
    const now = new Date();

    return (prisma as any).$transaction(async (tx: any) => {
      // 1. Fetch current batch
      const batch = await tx.schoolForwardingBatch.findUnique({
        where: { id: batchId },
      });

      if (!batch || batch.status === 'FORWARDED') {
        throw new Error('Batch not found or already forwarded.');
      }

      const selectedIds: string[] = (batch.selectedApplicationIds as string[]) || [];

      // 2. Lock and transition batch to FORWARDED
      const updatedBatch = await tx.schoolForwardingBatch.update({
        where: { id: batchId },
        data: {
          status: 'FORWARDED',
          submittedAt: now,
          submittedByUserId: userId,
          forwardingNote: forwardingNote || batch.forwardingNote,
          idempotencyKey: idempotencyKey || batch.idempotencyKey,
          payloadHash: payloadHash || batch.payloadHash,
          version: { increment: 1 },
        },
        include: { schoolReviewUnit: true },
      });

      // 3. Atomically transition all selected applications to forwarded_to_city & unassigned at City
      if (selectedIds.length > 0) {
        await tx.individualApplication.updateMany({
          where: {
            id: { in: selectedIds },
            seasonId,
            schoolReviewUnitId: unitId,
          },
          data: {
            forwardingBatchId: batchId,
            schoolPreliminaryStatus: 'FORWARDED_TO_CITY',
            currentReviewStage: 'CITY_REVIEW',
            cityWorkflowStatus: 'CITY_UNASSIGNED',
            schoolForwardedAt: now,
            schoolForwardedByUserId: userId,
          },
        });
      }

      return this.mapToDto(updatedBatch);
    });
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
    const prisma = await this.getClient();
    const invalidIds: string[] = [];
    const reasons: string[] = [];

    const apps = await (prisma as any).individualApplication.findMany({
      where: {
        id: { in: applicationIds },
      },
      select: {
        id: true,
        seasonId: true,
        schoolReviewUnitId: true,
        schoolPreliminaryStatus: true,
        openSupplementCount: true,
        forwardingBatchId: true,
      },
    });

    const appMap = new Map<string, any>(apps.map((a: any) => [a.id, a]));

    for (const appId of applicationIds) {
      if (appId.toLowerCase().startsWith('col-')) {
        invalidIds.push(appId);
        reasons.push(`Hồ sơ ${appId} là hồ sơ Tập thể (không được đưa vào đợt chuyển cá nhân)`);
        continue;
      }

      const app = appMap.get(appId);
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

      if (app.schoolPreliminaryStatus === 'NOT_ELIGIBLE_AT_SCHOOL') {
        invalidIds.push(appId);
        reasons.push(`Hồ sơ ${appId} không đủ điều kiện xét chọn ở cấp Trường`);
        continue;
      }

      if (app.schoolPreliminaryStatus === 'FORWARDED_TO_CITY' || app.forwardingBatchId) {
        invalidIds.push(appId);
        reasons.push(`Hồ sơ ${appId} đã được chuyển lên cấp Thành phố trước đó`);
        continue;
      }

      if (app.openSupplementCount > 0) {
        invalidIds.push(appId);
        reasons.push(`Hồ sơ ${appId} đang có yêu cầu bổ sung minh chứng chưa hoàn tất`);
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
    const prisma = await this.getClient();

    const unit = await (prisma as any).schoolReviewUnit.findUnique({
      where: { id: unitId },
      include: { institution: true },
    });

    const applications = await (prisma as any).individualApplication.findMany({
      where: {
        schoolReviewUnitId: unitId,
        seasonId,
      },
      include: {
        institution: true,
      },
    });

    const existingBatch = await (prisma as any).schoolForwardingBatch.findUnique({
      where: {
        schoolReviewUnitId_seasonId: {
          schoolReviewUnitId: unitId,
          seasonId,
        },
      },
    });

    const total = applications.length;
    let reviewed = 0;
    let selected = 0;
    let notSelected = 0;
    let pending = 0;
    let withOpenSupplements = 0;

    const instMap = new Map<string, { id: string; name: string; total: number; selected: number; pending: number }>();

    for (const app of applications) {
      const instId = app.institutionId;
      const instName = app.institution?.officialName || instId;
      if (!instMap.has(instId)) {
        instMap.set(instId, { id: instId, name: instName, total: 0, selected: 0, pending: 0 });
      }
      const item = instMap.get(instId)!;
      item.total++;

      if (app.openSupplementCount > 0) {
        withOpenSupplements++;
      }

      if (app.schoolPreliminaryStatus === 'FORWARDED_TO_CITY') {
        reviewed++;
        selected++;
        item.selected++;
      } else if (app.schoolPreliminaryStatus === 'ELIGIBLE_FOR_CITY') {
        reviewed++;
        selected++;
        item.selected++;
      } else if (app.schoolPreliminaryStatus === 'NOT_ELIGIBLE_AT_SCHOOL') {
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
    if (!existingBatch?.decisionFileId) {
      blockingReasons.push('Chưa đính kèm văn bản đề nghị chính thức của đơn vị.');
    }
    if (withOpenSupplements > 0) {
      blockingReasons.push(`Còn ${withOpenSupplements} hồ sơ có yêu cầu bổ sung minh chứng chưa hoàn tất.`);
    }

    const isAlreadyForwarded = existingBatch?.status === 'FORWARDED';

    return {
      schoolReviewUnitId: unitId,
      schoolReviewUnitName: unit?.officialName || unitId,
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
      forwardedAt: existingBatch?.submittedAt?.toISOString(),
      batchId: existingBatch?.id,
      attachedDecisionDocument: existingBatch?.decisionFileId ? {
        decisionNumber: existingBatch.decisionNumber || '',
        decisionTitle: existingBatch.decisionTitle || '',
        decisionDate: existingBatch.decisionDate?.toISOString() || '',
        signedByName: existingBatch.signedByName || '',
        signedByTitle: existingBatch.signedByTitle || '',
        fileId: existingBatch.decisionFileId || '',
        fileName: existingBatch.decisionFileName || '',
        fileSize: existingBatch.decisionFileSize || 0,
        fileUrl: existingBatch.decisionFileUrl || '',
      } : undefined,
    };
  }

  public async listIncomingBatchesForCity(seasonId?: string): Promise<SchoolForwardingBatchDto[]> {
    const prisma = await this.getClient();
    const where: any = { status: 'FORWARDED' };
    if (seasonId) where.seasonId = seasonId;

    const batches = await (prisma as any).schoolForwardingBatch.findMany({
      where,
      include: { schoolReviewUnit: true },
      orderBy: { submittedAt: 'desc' },
    });

    return batches.map((b: any) => this.mapToDto(b));
  }

  public async recordAuditEvent(_event: {
    actorUserId: string;
    action: string;
    schoolReviewUnitId: string;
    seasonId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    // In backend V2, audit logs are handled via TransactionHelper / AuditRepository
  }

  private mapToDto(b: any): SchoolForwardingBatchDto {
    return {
      id: b.id,
      seasonId: b.seasonId,
      schoolReviewUnitId: b.schoolReviewUnitId,
      schoolReviewUnitName: b.schoolReviewUnit?.officialName,
      status: b.status,
      decisionNumber: b.decisionNumber,
      decisionTitle: b.decisionTitle,
      decisionDate: b.decisionDate ? new Date(b.decisionDate).toISOString() : undefined,
      signedByName: b.signedByName,
      signedByTitle: b.signedByTitle,
      decisionFileId: b.decisionFileId,
      decisionFileName: b.decisionFileName,
      decisionFileSize: b.decisionFileSize,
      decisionFileUrl: b.decisionFileUrl,
      forwardingNote: b.forwardingNote,
      submittedByUserId: b.submittedByUserId,
      submittedAt: b.submittedAt ? new Date(b.submittedAt).toISOString() : undefined,
      applicationCount: b.applicationCount || 0,
      selectedApplicationIds: (b.selectedApplicationIds as string[]) || [],
      idempotencyKey: b.idempotencyKey,
      payloadHash: b.payloadHash,
      version: b.version || 1,
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : new Date().toISOString(),
    };
  }
}
