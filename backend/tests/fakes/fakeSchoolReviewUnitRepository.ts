/**
 * 5TOT Đà Nẵng — Fake School Review Unit Repository (Backend Tests V2)
 * Pre-seeded with authentic School Review Units from AUTHORITATIVE_SCHOOL_REVIEW_UNITS.
 */

import { ISchoolReviewUnitRepository } from '../../src/modules/schoolReviewUnits/schoolReviewUnit.repository';
import {
  SchoolReviewUnitDto,
  SchoolReviewUnitListFilter,
  CreateSchoolReviewUnitInput,
  UpdateSchoolReviewUnitInput,
} from '../../src/modules/schoolReviewUnits/schoolReviewUnit.types';

export class FakeSchoolReviewUnitRepository implements ISchoolReviewUnitRepository {
  private units: Map<string, SchoolReviewUnitDto> = new Map();

  constructor() {
    this.seedDefaultUnits();
  }

  private seedDefaultUnits(): void {
    const defaultUnits: Array<Omit<SchoolReviewUnitDto, 'createdAt' | 'updatedAt'>> = [
      {
        id: 'unit-udn',
        institutionId: 'inst-dut',
        code: 'UDN',
        officialName: 'Đại học Đà Nẵng',
        shortName: 'ĐHĐN',
        unitType: 'BAN_THU_KY',
        isActive: true,
        contactEmail: 'hsv@udn.vn',
        contactPhone: '0236 3822 041',
        unitOfficerName: 'Nguyễn Văn An',
        memberInstitutionIds: [
          'inst-dut',
          'inst-due',
          'inst-ued',
          'inst-ufl',
          'inst-ute',
          'inst-vku',
          'inst-smp',
          'inst-vnuk',
        ],
        description: 'Đơn vị xét sơ tuyển tập trung cho toàn bộ các trường thành viên UDN.',
      },
      {
        id: 'unit-dtu',
        institutionId: 'inst-dtu',
        code: 'DTU',
        officialName: 'Trường Đại học Duy Tân',
        shortName: 'DTU',
        unitType: 'DOAN_TRUONG',
        isActive: true,
        contactEmail: 'doanthanhnien@duytan.edu.vn',
        contactPhone: '0236 3827 111',
        unitOfficerName: 'Trần Gia Huy',
        memberInstitutionIds: ['inst-dtu'],
        description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Duy Tân.',
      },
      {
        id: 'unit-donga',
        institutionId: 'inst-donga',
        code: 'UDA',
        officialName: 'Trường Đại học Đông Á',
        shortName: 'ĐH Đông Á',
        unitType: 'DOAN_TRUONG',
        isActive: true,
        contactEmail: 'doantruong@donga.edu.vn',
        contactPhone: '0236 3519 929',
        unitOfficerName: 'Hoàng Thị Thu Thảo',
        memberInstitutionIds: ['inst-donga'],
        description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Đông Á.',
      },
      {
        id: 'unit-dau',
        institutionId: 'inst-dau',
        code: 'DAU',
        officialName: 'Trường Đại học Kiến trúc Đà Nẵng',
        shortName: 'ĐH Kiến trúc',
        unitType: 'HSV_TRUONG',
        isActive: true,
        contactEmail: 'hsv@dau.edu.vn',
        contactPhone: '0236 3622 999',
        unitOfficerName: 'Lê Thanh Hải',
        memberInstitutionIds: ['inst-dau'],
        description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Kiến trúc Đà Nẵng.',
      },
      {
        id: 'unit-upes3',
        institutionId: 'inst-upes3',
        code: 'UPES3',
        officialName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
        shortName: 'ĐH TDTT',
        unitType: 'HSV_TRUONG',
        isActive: true,
        contactEmail: 'hsv@upes3.edu.vn',
        contactPhone: '0236 3822 555',
        unitOfficerName: 'Võ Minh Trí',
        memberInstitutionIds: ['inst-upes3'],
        description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Thể dục Thể thao Đà Nẵng.',
      },
      {
        id: 'unit-tyd',
        institutionId: 'inst-tyd',
        code: 'DHKTYD',
        officialName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
        shortName: 'ĐH KTYD',
        unitType: 'HSV_TRUONG',
        isActive: true,
        contactEmail: 'hsv@dhktyduocdn.edu.vn',
        contactPhone: '0236 3835 380',
        unitOfficerName: 'Nguyễn Thị Phương',
        memberInstitutionIds: ['inst-tyd'],
        description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Kỹ thuật Y - Dược Đà Nẵng.',
      },
      {
        id: 'unit-fpt',
        institutionId: 'inst-fpt',
        code: 'FPT',
        officialName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
        shortName: 'ĐH FPT',
        unitType: 'HSV_TRUONG',
        isActive: true,
        contactEmail: 'hsv.fptdn@fe.edu.vn',
        contactPhone: '0236 7300 999',
        unitOfficerName: 'Bùi Đức Anh',
        memberInstitutionIds: ['inst-fpt'],
        description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Phân hiệu Đại học FPT tại Đà Nẵng.',
      },
      {
        id: 'unit-suspended',
        institutionId: 'inst-suspended',
        code: 'SUSPENDED_UNIT',
        officialName: 'Đơn vị Đang Tạm Dừng Tiếp Nhận',
        shortName: 'Tạm Dừng',
        unitType: 'HSV_TRUONG',
        isActive: false, // Suspended for boundary tests
        memberInstitutionIds: ['inst-cd-lacviet'],
      },
    ];

    const now = new Date();
    for (const u of defaultUnits) {
      this.units.set(u.id, {
        ...u,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  public async findById(id: string): Promise<SchoolReviewUnitDto | null> {
    return this.units.get(id) ?? null;
  }

  public async findByCode(code: string): Promise<SchoolReviewUnitDto | null> {
    const upper = code.toUpperCase();
    for (const unit of this.units.values()) {
      if (unit.code.toUpperCase() === upper) return unit;
    }
    return null;
  }

  public async findByInstitutionId(institutionId: string): Promise<SchoolReviewUnitDto | null> {
    for (const unit of this.units.values()) {
      if (unit.institutionId === institutionId) return unit;
    }
    return null;
  }

  public async findByMemberInstitutionId(institutionId: string): Promise<SchoolReviewUnitDto | null> {
    for (const unit of this.units.values()) {
      if (unit.memberInstitutionIds && unit.memberInstitutionIds.includes(institutionId)) {
        return unit;
      }
    }
    return null;
  }

  public async list(filter?: SchoolReviewUnitListFilter): Promise<SchoolReviewUnitDto[]> {
    let result = Array.from(this.units.values());

    if (filter?.isActive !== undefined) {
      result = result.filter((u) => u.isActive === filter.isActive);
    }
    if (filter?.institutionId) {
      result = result.filter((u) => u.institutionId === filter.institutionId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.officialName.toLowerCase().includes(q) ||
          u.shortName.toLowerCase().includes(q) ||
          u.code.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => a.code.localeCompare(b.code));
    return result;
  }

  public async create(data: CreateSchoolReviewUnitInput): Promise<SchoolReviewUnitDto> {
    const id = data.id || `unit-${data.code.toLowerCase()}`;
    const now = new Date();
    const unit: SchoolReviewUnitDto = {
      id,
      institutionId: data.institutionId,
      code: data.code.toUpperCase(),
      officialName: data.officialName,
      shortName: data.shortName,
      unitType: data.unitType,
      isActive: data.isActive ?? true,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      unitOfficerName: data.unitOfficerName,
      memberInstitutionIds: data.memberInstitutionIds || [data.institutionId],
      description: data.description,
      createdAt: now,
      updatedAt: now,
    };
    this.units.set(id, unit);
    return unit;
  }

  public async update(id: string, data: UpdateSchoolReviewUnitInput): Promise<SchoolReviewUnitDto> {
    const existing = this.units.get(id);
    if (!existing) {
      throw new Error(`School review unit ${id} not found.`);
    }
    const updated: SchoolReviewUnitDto = {
      ...existing,
      ...(data.officialName && { officialName: data.officialName }),
      ...(data.shortName && { shortName: data.shortName }),
      ...(data.unitType && { unitType: data.unitType }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.contactEmail && { contactEmail: data.contactEmail }),
      ...(data.contactPhone && { contactPhone: data.contactPhone }),
      ...(data.unitOfficerName && { unitOfficerName: data.unitOfficerName }),
      ...(data.memberInstitutionIds && { memberInstitutionIds: data.memberInstitutionIds }),
      ...(data.description && { description: data.description }),
      updatedAt: new Date(),
    };
    this.units.set(id, updated);
    return updated;
  }
}
