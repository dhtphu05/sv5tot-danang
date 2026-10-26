/**
 * 5TOT Đà Nẵng — Fake Evidence Repository (Test-Only Fake)
 */

import type { IEvidenceRepository } from '../../src/modules/evidence/evidence.repository';
import type {
  EvidenceObjectDto,
  EvidenceObjectVersionDto,
  ApplicationEvidenceLinkDto,
  EvidenceScanStatus,
} from '../../src/modules/evidence/evidence.types';

export class FakeEvidenceRepository implements IEvidenceRepository {
  public objects = new Map<string, EvidenceObjectDto>();
  public versions = new Map<string, EvidenceObjectVersionDto[]>();
  public links = new Map<string, ApplicationEvidenceLinkDto>();

  public async createPendingObject(data: {
    ownerUserId: string;
    track: 'INDIVIDUAL' | 'COLLECTIVE';
    individualAppId?: string;
    collectiveAppId?: string;
    originalFileName: string;
    mimeType: string;
    extension: string;
    sizeBytes: number;
    sha256Checksum: string;
    bucketName: string;
    objectKey: string;
  }): Promise<EvidenceObjectDto> {
    const obj: EvidenceObjectDto = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ownerUserId: data.ownerUserId,
      track: data.track,
      individualAppId: data.individualAppId,
      collectiveAppId: data.collectiveAppId,
      currentVersionNo: 1,
      originalFileName: data.originalFileName,
      mimeType: data.mimeType,
      extension: data.extension,
      sizeBytes: data.sizeBytes,
      sha256Checksum: data.sha256Checksum,
      bucketName: data.bucketName,
      objectKey: data.objectKey,
      scanStatus: 'PENDING_UPLOAD',
      isFinalized: false,
      uploadedAt: new Date(),
    };
    this.objects.set(obj.id, obj);
    return obj;
  }

  public async findById(id: string): Promise<EvidenceObjectDto | null> {
    return this.objects.get(id) || null;
  }

  public async findByIds(ids: string[]): Promise<EvidenceObjectDto[]> {
    const out: EvidenceObjectDto[] = [];
    for (const id of new Set(ids)) {
      const obj = this.objects.get(id);
      if (obj && !obj.deletedAt) {
        out.push(obj);
      }
    }
    return out;
  }

  public async findByObjectKey(objectKey: string): Promise<EvidenceObjectDto | null> {
    for (const obj of this.objects.values()) {
      if (obj.objectKey === objectKey) return obj;
    }
    return null;
  }

  public async finalizeObject(
    id: string,
    data: {
      sha256Checksum: string;
      sizeBytes: number;
      scanStatus: EvidenceScanStatus;
    }
  ): Promise<EvidenceObjectDto> {
    const obj = this.objects.get(id);
    if (!obj) throw new Error('Not found');
    const updated: EvidenceObjectDto = {
      ...obj,
      sha256Checksum: data.sha256Checksum,
      sizeBytes: data.sizeBytes,
      scanStatus: data.scanStatus,
      isFinalized: true,
      finalizedAt: new Date(),
    };
    this.objects.set(id, updated);
    return updated;
  }

  public async updateScanStatus(
    id: string,
    scanStatus: EvidenceScanStatus
  ): Promise<EvidenceObjectDto> {
    const obj = this.objects.get(id);
    if (!obj) throw new Error('Not found');
    const updated: EvidenceObjectDto = {
      ...obj,
      scanStatus,
    };
    this.objects.set(id, updated);
    return updated;
  }

  public async createVersion(data: {
    evidenceObjectId: string;
    versionNumber: number;
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
    sha256Checksum: string;
    bucketName: string;
    objectKey: string;
    scanStatus: EvidenceScanStatus;
    uploadedByUserId: string;
    changeReason?: string;
  }): Promise<EvidenceObjectVersionDto> {
    const list = this.versions.get(data.evidenceObjectId) || [];
    const v: EvidenceObjectVersionDto = {
      id: `ver-${Date.now()}`,
      evidenceObjectId: data.evidenceObjectId,
      versionNumber: data.versionNumber,
      originalFileName: data.originalFileName,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      sha256Checksum: data.sha256Checksum,
      bucketName: data.bucketName,
      objectKey: data.objectKey,
      scanStatus: data.scanStatus,
      uploadedByUserId: data.uploadedByUserId,
      uploadedAt: new Date(),
      changeReason: data.changeReason,
    };
    list.push(v);
    this.versions.set(data.evidenceObjectId, list);
    return v;
  }

  public async linkToIndividualDeclaration(data: {
    evidenceObjectId: string;
    individualDeclarationItemId: string;
    linkedByUserId: string;
  }): Promise<ApplicationEvidenceLinkDto> {
    const obj = this.objects.get(data.evidenceObjectId);
    const link: ApplicationEvidenceLinkDto = {
      id: `link-${Date.now()}`,
      evidenceObjectId: data.evidenceObjectId,
      individualDeclarationItemId: data.individualDeclarationItemId,
      linkedByUserId: data.linkedByUserId,
      linkedAt: new Date(),
      evidenceObject: obj,
    };
    this.links.set(link.id, link);
    return link;
  }

  public async linkToCollectiveRequirement(data: {
    evidenceObjectId: string;
    collectiveRequirementId: string;
    linkedByUserId: string;
  }): Promise<ApplicationEvidenceLinkDto> {
    const obj = this.objects.get(data.evidenceObjectId);
    const link: ApplicationEvidenceLinkDto = {
      id: `link-${Date.now()}`,
      evidenceObjectId: data.evidenceObjectId,
      collectiveRequirementId: data.collectiveRequirementId,
      linkedByUserId: data.linkedByUserId,
      linkedAt: new Date(),
      evidenceObject: obj,
    };
    this.links.set(link.id, link);
    return link;
  }

  public async unlink(linkId: string): Promise<void> {
    const l = this.links.get(linkId);
    if (l) {
      this.links.set(linkId, { ...l, unlinkedAt: new Date() });
    }
  }

  public async listLinksForDeclaration(declarationItemId: string): Promise<ApplicationEvidenceLinkDto[]> {
    return Array.from(this.links.values()).filter(
      (l) => l.individualDeclarationItemId === declarationItemId && !l.unlinkedAt
    );
  }

  public async listLinksForCollectiveRequirement(requirementId: string): Promise<ApplicationEvidenceLinkDto[]> {
    return Array.from(this.links.values()).filter(
      (l) => l.collectiveRequirementId === requirementId && !l.unlinkedAt
    );
  }

  public async listOwnerEvidence(ownerUserId: string): Promise<EvidenceObjectDto[]> {
    return Array.from(this.objects.values()).filter(
      (o) => o.ownerUserId === ownerUserId && !o.deletedAt
    );
  }
}
