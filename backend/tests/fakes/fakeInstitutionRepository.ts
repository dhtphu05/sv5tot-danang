/**
 * 5TOT Đà Nẵng — Fake Institution Repository (Backend Tests V2)
 * Pre-seeded with authentic Da Nang educational institutions from frontend registry.
 */

import { IInstitutionRepository } from '../../src/modules/institutions/institution.repository';
import {
  InstitutionDto,
  FacultyDepartmentDto,
  AcademicClassDto,
  InstitutionListFilter,
  CreateInstitutionInput,
  UpdateInstitutionInput,
} from '../../src/modules/institutions/institution.types';
import { PaginatedResult } from '../../src/shared/query/pagination';

export class FakeInstitutionRepository implements IInstitutionRepository {
  private institutions: Map<string, InstitutionDto> = new Map();
  private faculties: Map<string, FacultyDepartmentDto[]> = new Map();
  private classes: Map<string, AcademicClassDto[]> = new Map();

  constructor() {
    this.seedDefaultInstitutions();
  }

  private seedDefaultInstitutions(): void {
    const defaultData: Array<Omit<InstitutionDto, 'createdAt' | 'updatedAt'>> = [
      {
        id: 'inst-dut',
        code: 'DUT',
        officialName: 'Trường Đại học Bách khoa - Đại học Đà Nẵng',
        shortName: 'DUT',
        group: 'UD_MEMBER_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Đại học Đà Nẵng',
        searchKeywords: ['bach khoa', 'bk', 'dut', 'dhbk'],
      },
      {
        id: 'inst-due',
        code: 'DUE',
        officialName: 'Trường Đại học Kinh tế - Đại học Đà Nẵng',
        shortName: 'DUE',
        group: 'UD_MEMBER_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Đại học Đà Nẵng',
        searchKeywords: ['kinh te', 'due', 'dhkt'],
      },
      {
        id: 'inst-ued',
        code: 'UED',
        officialName: 'Trường Đại học Sư phạm - Đại học Đà Nẵng',
        shortName: 'UED',
        group: 'UD_MEMBER_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Đại học Đà Nẵng',
        searchKeywords: ['su pham', 'ued', 'dhsp'],
      },
      {
        id: 'inst-ufl',
        code: 'UFL',
        officialName: 'Trường Đại học Ngoại ngữ - Đại học Đà Nẵng',
        shortName: 'UFL',
        group: 'UD_MEMBER_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Đại học Đà Nẵng',
        searchKeywords: ['ngoai ngu', 'ufl', 'dhnn'],
      },
      {
        id: 'inst-ute',
        code: 'UTE',
        officialName: 'Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng',
        shortName: 'UTE',
        group: 'UD_MEMBER_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Đại học Đà Nẵng',
        searchKeywords: ['su pham ky thuat', 'spkt', 'ute'],
      },
      {
        id: 'inst-vku',
        code: 'VKU',
        officialName:
          'Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn - Đại học Đà Nẵng',
        shortName: 'VKU',
        group: 'UD_MEMBER_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Đại học Đà Nẵng',
        searchKeywords: ['viet han', 'cntt', 'truyen thong', 'vku'],
      },
      {
        id: 'inst-smp',
        code: 'SMP',
        officialName: 'Trường Y Dược - Đại học Đà Nẵng',
        shortName: 'SMP',
        group: 'UD_MEMBER_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Đại học Đà Nẵng',
        searchKeywords: ['y duoc', 'khoa y duoc', 'smp'],
      },
      {
        id: 'inst-vnuk',
        code: 'VNUK',
        officialName: 'Viện Nghiên cứu và Đào tạo Việt - Anh - Đại học Đà Nẵng',
        shortName: 'VNUK',
        group: 'UD_MEMBER_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Đại học Đà Nẵng',
        searchKeywords: ['viet anh', 'vnuk'],
      },
      {
        id: 'inst-dtu',
        code: 'DTU',
        officialName: 'Đại học Duy Tân',
        shortName: 'DTU',
        group: 'AFFILIATED_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
        searchKeywords: ['duy tan', 'dtu'],
      },
      {
        id: 'inst-dau',
        code: 'DAU',
        officialName: 'Trường Đại học Kiến trúc Đà Nẵng',
        shortName: 'DAU',
        group: 'AFFILIATED_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
        searchKeywords: ['kien truc', 'dau'],
      },
      {
        id: 'inst-upes3',
        code: 'UPES3',
        officialName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
        shortName: 'UPES3',
        group: 'AFFILIATED_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Bộ Văn hóa, Thể thao và Du lịch',
        searchKeywords: ['the duc the thao', 'tdtt', 'upes3'],
      },
      {
        id: 'inst-donga',
        code: 'UDA',
        officialName: 'Trường Đại học Đông Á',
        shortName: 'UDA',
        group: 'AFFILIATED_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
        searchKeywords: ['dong a', 'uda'],
      },
      {
        id: 'inst-tyd',
        code: 'DHKTYD',
        officialName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
        shortName: 'DHKTYD',
        group: 'AFFILIATED_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Bộ Y tế',
        searchKeywords: ['ky thuat y duoc', 'dhktyd'],
      },
      {
        id: 'inst-fpt',
        code: 'FPTU',
        officialName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
        shortName: 'FPTU',
        group: 'AFFILIATED_UNIVERSITY',
        hasStudentAssoc: true,
        isActive: true,
        organizationContext: 'Tập đoàn FPT',
        searchKeywords: ['fpt', 'dai hoc fpt'],
      },
      {
        id: 'inst-cd-lacviet',
        code: 'LACVIET',
        officialName: 'Trường Cao đẳng Lạc Việt',
        shortName: 'LACVIET',
        group: 'COLLEGE_JUNIOR_COLLEGE',
        hasStudentAssoc: false,
        isActive: false, // Suspended for testing
        organizationContext: 'Đơn vị đào tạo ngoài công lập',
        searchKeywords: ['lac viet', 'cao dang lac viet'],
      },
    ];

    const now = new Date();
    for (const item of defaultData) {
      this.institutions.set(item.id, {
        ...item,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Seed faculties for DUT
    this.faculties.set('inst-dut', [
      {
        id: 'fac-dut-it',
        institutionId: 'inst-dut',
        schoolReviewUnitId: 'unit-udn',
        code: 'CNTT',
        name: 'Khoa Công nghệ Thông tin',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'fac-dut-ece',
        institutionId: 'inst-dut',
        schoolReviewUnitId: 'unit-udn',
        code: 'DDT',
        name: 'Khoa Điện - Điện tử',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  public async findById(id: string): Promise<InstitutionDto | null> {
    return this.institutions.get(id) ?? null;
  }

  public async findByCode(code: string): Promise<InstitutionDto | null> {
    const upper = code.toUpperCase();
    for (const inst of this.institutions.values()) {
      if (inst.code.toUpperCase() === upper) return inst;
    }
    return null;
  }

  public async list(filter: InstitutionListFilter): Promise<PaginatedResult<InstitutionDto>> {
    let result = Array.from(this.institutions.values());

    if (filter.group) {
      result = result.filter((i) => i.group === filter.group);
    }
    if (filter.isActive !== undefined) {
      result = result.filter((i) => i.isActive === filter.isActive);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.officialName.toLowerCase().includes(q) ||
          i.shortName.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q) ||
          (i.searchKeywords && i.searchKeywords.some((k) => k.toLowerCase().includes(q)))
      );
    }

    result.sort((a, b) => a.code.localeCompare(b.code));

    const limit = filter.limit ?? 50;
    const items = result.slice(0, limit);

    return {
      data: items,
      pagination: {
        limit,
        hasMore: result.length > limit,
        totalCount: result.length,
      },
    };
  }

  public async create(data: CreateInstitutionInput): Promise<InstitutionDto> {
    const id = `inst-${data.code.toLowerCase()}`;
    const now = new Date();
    const inst: InstitutionDto = {
      id,
      code: data.code.toUpperCase(),
      officialName: data.officialName,
      shortName: data.shortName,
      group: data.group,
      hasStudentAssoc: data.hasStudentAssoc ?? true,
      isActive: data.isActive ?? true,
      organizationContext: data.organizationContext,
      searchKeywords: data.searchKeywords,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      createdAt: now,
      updatedAt: now,
    };
    this.institutions.set(id, inst);
    return inst;
  }

  public async update(id: string, data: UpdateInstitutionInput): Promise<InstitutionDto> {
    const existing = this.institutions.get(id);
    if (!existing) {
      throw new Error(`Institution with id ${id} not found.`);
    }
    const updated: InstitutionDto = {
      ...existing,
      ...(data.officialName && { officialName: data.officialName }),
      ...(data.shortName && { shortName: data.shortName }),
      ...(data.group && { group: data.group }),
      ...(data.hasStudentAssoc !== undefined && { hasStudentAssoc: data.hasStudentAssoc }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.organizationContext && { organizationContext: data.organizationContext }),
      ...(data.searchKeywords && { searchKeywords: data.searchKeywords }),
      ...(data.contactEmail && { contactEmail: data.contactEmail }),
      ...(data.contactPhone && { contactPhone: data.contactPhone }),
      updatedAt: new Date(),
    };
    this.institutions.set(id, updated);
    return updated;
  }

  public async getFaculties(institutionId: string): Promise<FacultyDepartmentDto[]> {
    return this.faculties.get(institutionId) || [];
  }

  public async getClasses(facultyDepartmentId: string): Promise<AcademicClassDto[]> {
    return this.classes.get(facultyDepartmentId) || [];
  }
}
