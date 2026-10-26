/**
 * 5TOT Đà Nẵng — Fake Individual Application Repository for Unit & HTTP Tests (Backend V2)
 */

import { IIndividualApplicationRepository } from '../../src/modules/individualApplications/individualApplication.repository';
import {
  IndividualApplicationDto,
  IndividualDeclarationItemDto,
  ApplicationEvidenceLinkDto,
  EvidenceObjectMetadataDto,
  IndividualApplicationFilter,
} from '../../src/modules/individualApplications/individualApplication.types';

export class FakeIndividualApplicationRepository implements IIndividualApplicationRepository {
  public applications: Map<string, IndividualApplicationDto> = new Map();
  public declarations: Map<string, IndividualDeclarationItemDto> = new Map();
  public evidenceLinks: Map<string, ApplicationEvidenceLinkDto> = new Map();
  public evidenceObjects: Map<string, EvidenceObjectMetadataDto> = new Map();
  public auditEvents: any[] = [];
  public outboxEvents: any[] = [];

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults(): void {
    // Seed default evidence objects for testing
    this.evidenceObjects.set('ev-student-dut-01', {
      id: 'ev-student-dut-01',
      ownerUserId: 'user-student-dut-01',
      originalFileName: 'bang-diem-hk1.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 102400,
      sha256Checksum: 'mock-sha256-checksum',
      isFinalized: true,
      uploadedAt: new Date(),
    });

    this.evidenceObjects.set('ev-student-dut-02', {
      id: 'ev-student-dut-02',
      ownerUserId: 'user-student-dut-01',
      originalFileName: 'giay-khen-nckh.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 204800,
      sha256Checksum: 'mock-sha256-checksum-2',
      isFinalized: true,
      uploadedAt: new Date(),
    });
  }

  public async findBySeasonAndApplicant(
    seasonId: string,
    applicantUserId: string
  ): Promise<IndividualApplicationDto | null> {
    for (const app of this.applications.values()) {
      if (app.seasonId === seasonId && app.applicantUserId === applicantUserId) {
        return this.hydrate(app);
      }
    }
    return null;
  }

  public async findById(id: string): Promise<IndividualApplicationDto | null> {
    const app = this.applications.get(id);
    if (!app) return null;
    return this.hydrate(app);
  }

  public async findByCode(code: string): Promise<IndividualApplicationDto | null> {
    for (const app of this.applications.values()) {
      if (app.applicationCode === code) {
        return this.hydrate(app);
      }
    }
    return null;
  }

  public async list(filter: IndividualApplicationFilter): Promise<IndividualApplicationDto[]> {
    let result = Array.from(this.applications.values());
    if (filter.seasonId) {
      result = result.filter((a) => a.seasonId === filter.seasonId);
    }
    if (filter.applicantUserId) {
      result = result.filter((a) => a.applicantUserId === filter.applicantUserId);
    }
    if (filter.institutionId) {
      result = result.filter((a) => a.institutionId === filter.institutionId);
    }
    if (filter.schoolReviewUnitId) {
      result = result.filter((a) => a.schoolReviewUnitId === filter.schoolReviewUnitId);
    }
    if (filter.stage) {
      result = result.filter((a) => a.currentReviewStage === filter.stage);
    }
    if (filter.status) {
      result = result.filter((a) => a.schoolPreliminaryStatus === filter.status);
    }
    return result.map((a) => this.hydrate(a));
  }

  public async create(
    data: Omit<IndividualApplicationDto, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IndividualApplicationDto> {
    const id = `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const app: IndividualApplicationDto = {
      ...data,
      id,
      version: data.version ?? 1,
      createdAt: now,
      updatedAt: now,
    };
    this.applications.set(id, app);
    return this.hydrate(app);
  }

  public async update(
    id: string,
    data: Partial<IndividualApplicationDto>
  ): Promise<IndividualApplicationDto> {
    const existing = this.applications.get(id);
    if (!existing) throw new Error(`Application ${id} not found`);

    const updated: IndividualApplicationDto = {
      ...existing,
      ...data,
      version: (existing.version || 1) + 1,
      updatedAt: new Date(),
    };
    this.applications.set(id, updated);
    return this.hydrate(updated);
  }

  public async addDeclaration(
    declaration: Omit<IndividualDeclarationItemDto, 'id' | 'createdAt' | 'updatedAt'>,
    evidenceIds?: string[]
  ): Promise<IndividualDeclarationItemDto> {
    const id = `decl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const item: IndividualDeclarationItemDto = {
      ...declaration,
      id,
      createdAt: now,
      updatedAt: now,
      evidenceLinks: [],
    };
    this.declarations.set(id, item);

    if (evidenceIds && evidenceIds.length > 0) {
      for (const objId of evidenceIds) {
        await this.addEvidenceLink({
          evidenceObjectId: objId,
          individualDeclarationItemId: id,
          linkedByUserId: declaration.individualApplicationId,
        });
      }
    }

    return this.hydrateDeclaration(item);
  }

  public async updateDeclaration(
    id: string,
    data: Partial<IndividualDeclarationItemDto>,
    evidenceIds?: string[]
  ): Promise<IndividualDeclarationItemDto> {
    const existing = this.declarations.get(id);
    if (!existing) throw new Error(`Declaration ${id} not found`);

    const updated: IndividualDeclarationItemDto = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.declarations.set(id, updated);

    if (evidenceIds !== undefined) {
      // Remove old links
      for (const [linkId, link] of this.evidenceLinks.entries()) {
        if (link.individualDeclarationItemId === id) {
          this.evidenceLinks.delete(linkId);
        }
      }
      for (const objId of evidenceIds) {
        await this.addEvidenceLink({
          evidenceObjectId: objId,
          individualDeclarationItemId: id,
          linkedByUserId: existing.individualApplicationId,
        });
      }
    }

    return this.hydrateDeclaration(updated);
  }

  public async deleteDeclaration(id: string): Promise<void> {
    this.declarations.delete(id);
    for (const [linkId, link] of this.evidenceLinks.entries()) {
      if (link.individualDeclarationItemId === id) {
        this.evidenceLinks.delete(linkId);
      }
    }
  }

  public async findDeclarationById(id: string): Promise<IndividualDeclarationItemDto | null> {
    const item = this.declarations.get(id);
    if (!item) return null;
    return this.hydrateDeclaration(item);
  }

  public async listDeclarationsByApplicationId(
    applicationId: string
  ): Promise<IndividualDeclarationItemDto[]> {
    const items: IndividualDeclarationItemDto[] = [];
    for (const item of this.declarations.values()) {
      if (item.individualApplicationId === applicationId) {
        items.push(this.hydrateDeclaration(item));
      }
    }
    return items;
  }

  public async addEvidenceLink(
    link: Omit<ApplicationEvidenceLinkDto, 'id' | 'linkedAt'>
  ): Promise<ApplicationEvidenceLinkDto> {
    const id = `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const created: ApplicationEvidenceLinkDto = {
      ...link,
      id,
      linkedAt: new Date(),
      evidenceObject: this.evidenceObjects.get(link.evidenceObjectId),
    };
    this.evidenceLinks.set(id, created);
    return created;
  }

  public async removeEvidenceLink(id: string): Promise<void> {
    this.evidenceLinks.delete(id);
  }

  public async listEvidenceLinks(
    declarationItemId: string
  ): Promise<ApplicationEvidenceLinkDto[]> {
    const links: ApplicationEvidenceLinkDto[] = [];
    for (const l of this.evidenceLinks.values()) {
      if (l.individualDeclarationItemId === declarationItemId) {
        links.push({
          ...l,
          evidenceObject: this.evidenceObjects.get(l.evidenceObjectId),
        });
      }
    }
    return links;
  }

  public async findEvidenceObjectById(
    id: string
  ): Promise<EvidenceObjectMetadataDto | null> {
    return this.evidenceObjects.get(id) || null;
  }

  public async recordAuditEvent(event: {
    actorUserId: string;
    applicationId: string;
    seasonId: string;
    institutionId: string;
    schoolReviewUnitId: string;
    action: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    this.auditEvents.push({
      ...event,
      timestamp: new Date(),
    });
  }

  public async recordOutboxEvent(event: {
    eventType: string;
    payload: Record<string, any>;
  }): Promise<void> {
    this.outboxEvents.push({
      ...event,
      createdAt: new Date(),
    });
  }

  private hydrate(app: IndividualApplicationDto): IndividualApplicationDto {
    const declarations = Array.from(this.declarations.values())
      .filter((d) => d.individualApplicationId === app.id)
      .map((d) => this.hydrateDeclaration(d));

    return {
      ...app,
      declarations,
    };
  }

  private hydrateDeclaration(d: IndividualDeclarationItemDto): IndividualDeclarationItemDto {
    const evidenceLinks = Array.from(this.evidenceLinks.values())
      .filter((l) => l.individualDeclarationItemId === d.id)
      .map((l) => ({
        ...l,
        evidenceObject: this.evidenceObjects.get(l.evidenceObjectId),
      }));

    return {
      ...d,
      evidenceLinks,
    };
  }
}
