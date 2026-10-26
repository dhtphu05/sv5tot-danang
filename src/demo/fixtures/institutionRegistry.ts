/**
 * 5TOT Đà Nẵng — Participating Institution Registry Service & Fixture
 * Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Prompt 14 Sections 32–38, 65–68, 94:
 * - Isolated and replaceable data source (never hardcoded inside UI components).
 * - Displays full official Vietnamese institution names.
 * - Supports accent-insensitive search by full name, partial name, or common keyword.
 * - Does NOT require the Student to know or select parent UDN workspace semantics.
 */

export interface ParticipatingInstitution {
  id: string;
  officialName: string;
  organizationContext?: string;
  searchKeywords: string[];
}

/**
 * Isolated fixture representing the authoritative backend registry of
 * participating universities, academies, and colleges in Da Nang.
 */
export const DANANG_INSTITUTION_REGISTRY: ParticipatingInstitution[] = [
  {
    id: 'inst-dut',
    officialName: 'Trường Đại học Bách khoa - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    searchKeywords: ['bach khoa', 'bk', 'dut', 'dhbk'],
  },
  {
    id: 'inst-due',
    officialName: 'Trường Đại học Kinh tế - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    searchKeywords: ['kinh te', 'due', 'dhkt'],
  },
  {
    id: 'inst-ued',
    officialName: 'Trường Đại học Sư phạm - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    searchKeywords: ['su pham', 'ued', 'dhsp'],
  },
  {
    id: 'inst-ufl',
    officialName: 'Trường Đại học Ngoại ngữ - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    searchKeywords: ['ngoai ngu', 'ufl', 'dhnn'],
  },
  {
    id: 'inst-ute',
    officialName: 'Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    searchKeywords: ['su pham ky thuat', 'spkt', 'ute'],
  },
  {
    id: 'inst-vku',
    officialName:
      'Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    searchKeywords: ['viet han', 'cntt', 'truyen thong', 'vku'],
  },
  {
    id: 'inst-smp',
    officialName: 'Trường Y Dược - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    searchKeywords: ['y duoc', 'khoa y duoc', 'smp'],
  },
  {
    id: 'inst-vnuk',
    officialName: 'Viện Nghiên cứu và Đào tạo Việt - Anh - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    searchKeywords: ['viet anh', 'vnuk'],
  },
  {
    id: 'inst-dtu',
    officialName: 'Đại học Duy Tân',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    searchKeywords: ['duy tan', 'dtu'],
  },
  {
    id: 'inst-dau',
    officialName: 'Trường Đại học Kiến trúc Đà Nẵng',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    searchKeywords: ['kien truc', 'dau'],
  },
  {
    id: 'inst-upes3',
    officialName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    searchKeywords: ['the duc the thao', 'tdtt', 'upes3'],
  },
  {
    id: 'inst-donga',
    officialName: 'Trường Đại học Đông Á',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    searchKeywords: ['dong a', 'uda'],
  },
  {
    id: 'inst-tyd',
    officialName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    searchKeywords: ['ky thuat y duoc', 'dhktyd'],
  },
  {
    id: 'inst-fpt',
    officialName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    searchKeywords: ['fpt', 'dai hoc fpt'],
  },
];

/**
 * Normalizes Vietnamese text (strips diacritics, converts đ -> d, lowercases)
 * for fast accent-insensitive and partial keyword matching.
 */
export function normalizeVietnameseText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Filters a list of participating institutions using Vietnamese accent-insensitive
 * matching across officialName, organizationContext, and common searchKeywords.
 */
export function filterInstitutionsByQuery(
  institutions: ParticipatingInstitution[],
  rawQuery: string
): ParticipatingInstitution[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) return institutions;

  const normalizedQuery = normalizeVietnameseText(trimmed);
  const rawLower = trimmed.toLowerCase();

  return institutions.filter((item) => {
    const rawMatch = item.officialName.toLowerCase().includes(rawLower);
    if (rawMatch) return true;

    const normOfficial = normalizeVietnameseText(item.officialName);
    if (normOfficial.includes(normalizedQuery)) return true;

    const normContext = item.organizationContext
      ? normalizeVietnameseText(item.organizationContext)
      : '';
    if (normContext.includes(normalizedQuery)) return true;

    return item.searchKeywords.some((kw) =>
      normalizeVietnameseText(kw).includes(normalizedQuery)
    );
  });
}

/**
 * Simulated async registry fetcher (replaceable by real API endpoint `/api/institutions`).
 */
export async function fetchParticipatingInstitutions(options?: {
  simulateDelayMs?: number;
  simulateError?: boolean;
}): Promise<ParticipatingInstitution[]> {
  const delay = options?.simulateDelayMs ?? 180;
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  if (options?.simulateError) {
    throw new Error('INSTITUTION_REGISTRY_UNAVAILABLE');
  }
  return [...DANANG_INSTITUTION_REGISTRY];
}
