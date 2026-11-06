/**
 * 5TOT Đà Nẵng — Participating Institution Registry Service & Fixture
 * Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Prompt 14 Sections 32–38, 65–68, 94:
 * - Isolated and replaceable data source (never hardcoded inside UI components).
 * - Displays full official Vietnamese institution names across all 31 active training institutions in Da Nang.
 * - Supports accent-insensitive search by full name, partial name, or common keyword.
 * - Does NOT require the Student to know or select parent UDN workspace semantics.
 */

export interface ParticipatingInstitution {
  id: string;
  officialName: string;
  organizationContext?: string;
  educationLevelHint?: 'Đại học' | 'Cao đẳng';
  searchKeywords: string[];
}

/**
 * Isolated fixture representing the authoritative registry of all 31 active
 * participating universities, academies, branch campuses, and colleges in Da Nang.
 */
export const DANANG_INSTITUTION_REGISTRY: ParticipatingInstitution[] = [
  // 08 Trường / Viện thành viên thuộc Đại học Đà Nẵng (định tuyến về unit-udn)
  {
    id: 'inst-dut',
    officialName: 'Trường Đại học Bách khoa - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['bach khoa', 'bk', 'dut', 'dhbk', 'ky thuat'],
  },
  {
    id: 'inst-due',
    officialName: 'Trường Đại học Kinh tế - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['kinh te', 'due', 'dhkt', 'tai chinh'],
  },
  {
    id: 'inst-ued',
    officialName: 'Trường Đại học Sư phạm - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['su pham', 'ued', 'dhsp', 'giao duc'],
  },
  {
    id: 'inst-ufl',
    officialName: 'Trường Đại học Ngoại ngữ - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['ngoai ngu', 'ufl', 'dhnn', 'ngon ngu'],
  },
  {
    id: 'inst-ute',
    officialName: 'Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['su pham ky thuat', 'spkt', 'ute'],
  },
  {
    id: 'inst-vku',
    officialName:
      'Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['viet han', 'cntt', 'truyen thong', 'vku', 'it'],
  },
  {
    id: 'inst-smp',
    officialName: 'Trường Y Dược - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['y duoc', 'khoa y duoc', 'smp', 'truong y duoc', 'y khoa'],
  },
  {
    id: 'inst-vnuk',
    officialName: 'Viện Nghiên cứu và Đào tạo Việt - Anh - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['viet anh', 'vnuk', 'quoc te'],
  },

  // 23 Trường Đại học, Học viện, Phân hiệu và Cao đẳng độc lập trên địa bàn TP. Đà Nẵng
  {
    id: 'inst-dtu',
    officialName: 'Đại học Duy Tân',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['duy tan', 'dtu'],
  },
  {
    id: 'inst-dau',
    officialName: 'Trường Đại học Kiến trúc Đà Nẵng',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['kien truc', 'dau', 'quy hoach'],
  },
  {
    id: 'inst-upes3',
    officialName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    organizationContext: 'Bộ Văn hóa, Thể thao và Du lịch',
    educationLevelHint: 'Đại học',
    searchKeywords: ['the duc the thao', 'tdtt', 'upes3'],
  },
  {
    id: 'inst-donga',
    officialName: 'Trường Đại học Đông Á',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['dong a', 'uda'],
  },
  {
    id: 'inst-tyd',
    officialName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    organizationContext: 'Bộ Y tế',
    educationLevelHint: 'Đại học',
    searchKeywords: ['ky thuat y duoc', 'dhktyd', 'y te'],
  },
  {
    id: 'inst-fpt',
    officialName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    organizationContext: 'Tập đoàn FPT',
    educationLevelHint: 'Đại học',
    searchKeywords: ['fpt', 'dai hoc fpt', 'fptu'],
  },
  {
    id: 'inst-dh-ngan-hang-dn',
    officialName: 'Trường Đại học Ngân hàng TP.HCM (Phân hiệu Đà Nẵng)',
    organizationContext: 'Ngân hàng Nhà nước Việt Nam',
    educationLevelHint: 'Đại học',
    searchKeywords: ['ngan hang', 'hub', 'phan hieu ngan hang'],
  },
  {
    id: 'inst-dh-luat-hanoi-dn',
    officialName: 'Trường Đại học Luật Hà Nội (Phân hiệu Đà Nẵng)',
    organizationContext: 'Bộ Tư pháp',
    educationLevelHint: 'Đại học',
    searchKeywords: ['dai hoc luat', 'hlu', 'luat ha noi'],
  },
  {
    id: 'inst-dh-mo-hn-dn',
    officialName: 'Trường Đại học Mở Hà Nội (Trạm đào tạo Đà Nẵng)',
    organizationContext: 'Bộ Giáo dục và Đào tạo',
    educationLevelHint: 'Đại học',
    searchKeywords: ['dai hoc mo', 'hou', 'mo ha noi'],
  },
  {
    id: 'inst-hv-chinhtri-kv3',
    officialName: 'Học viện Chính trị khu vực III',
    organizationContext: 'Học viện Chính trị quốc gia Hồ Chí Minh',
    educationLevelHint: 'Đại học',
    searchKeywords: ['hoc vien chinh tri', 'hcma3', 'khu vuc 3', 'hvct3'],
  },
  {
    id: 'inst-hv-toa-an',
    officialName: 'Học viện Tòa án (Cơ sở đào tạo thực hành Đà Nẵng)',
    organizationContext: 'Tòa án nhân dân tối cao',
    educationLevelHint: 'Đại học',
    searchKeywords: ['hoc vien toa an', 'hvta', 'luat'],
  },
  {
    id: 'inst-cd-thuongmai',
    officialName: 'Trường Cao đẳng Thương mại',
    organizationContext: 'Bộ Công Thương',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['thuong mai', 'cdtm', 'cao dang thuong mai'],
  },
  {
    id: 'inst-cd-dulich',
    officialName: 'Trường Cao đẳng Du lịch Đà Nẵng',
    organizationContext: 'Bộ Văn hóa, Thể thao và Du lịch',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['du lich', 'dvtc', 'cao dang du lich'],
  },
  {
    id: 'inst-cd-congnghe',
    officialName: 'Trường Cao đẳng Công nghệ Y - Dược Việt Nam',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['cong nghe y duoc', 'y duoc viet nam', 'ydvn', 'cao dang'],
  },
  {
    id: 'inst-cd-fptpoly',
    officialName: 'Trường Cao đẳng FPT Polytechnic cơ sở Đà Nẵng',
    organizationContext: 'Tập đoàn FPT',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['fpt polytechnic', 'poly', 'cao dang fpt'],
  },
  {
    id: 'inst-cd-nghe-dn',
    officialName: 'Trường Cao đẳng Nghề Đà Nẵng',
    organizationContext: 'UBND Thành phố Đà Nẵng',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['nghe da nang', 'danavtc', 'cao dang nghe'],
  },
  {
    id: 'inst-cd-gtvt-tw5',
    officialName: 'Trường Cao đẳng Giao thông Vận tải Trung ương V',
    organizationContext: 'Bộ Giao thông Vận tải',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['giao thong van tai', 'gtvt', 'c5', 'cao dang'],
  },
  {
    id: 'inst-cd-kinhte-kh',
    officialName: 'Trường Cao đẳng Kinh tế - Kế hoạch Đà Nẵng',
    organizationContext: 'Bộ Kế hoạch và Đầu tư',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['kinh te ke hoach', 'cep', 'cao dang'],
  },
  {
    id: 'inst-cd-vhtt-dl',
    officialName: 'Trường Cao đẳng Văn hóa Nghệ thuật Đà Nẵng',
    organizationContext: 'Sở Văn hóa và Thể thao TP. Đà Nẵng',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['van hoa nghe thuat', 'cdvhnt', 'nghe thuat'],
  },
  {
    id: 'inst-cd-luongthuc',
    officialName: 'Trường Cao đẳng Lương thực - Thực phẩm',
    organizationContext: 'Bộ Nông nghiệp và Phát triển nông thôn',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['luong thuc thuc pham', 'cfit', 'cao dang'],
  },
  {
    id: 'inst-cd-ptth',
    officialName: 'Trường Cao đẳng Phát thanh - Truyền hình II (Cơ sở Đà Nẵng)',
    organizationContext: 'Đài Tiếng nói Việt Nam',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['phat thanh truyen hinh', 'vov', 'vov2', 'cao dang'],
  },
  {
    id: 'inst-cd-supham-maugiao',
    officialName: 'Trường Cao đẳng Sư phạm Trung ương Nha Trang (Cơ sở Đà Nẵng)',
    organizationContext: 'Bộ Giáo dục và Đào tạo',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['su pham trung uong', 'mam non', 'cdsptw', 'cao dang'],
  },
  {
    id: 'inst-cd-yduoc-pasteur',
    officialName: 'Trường Cao đẳng Y Dược Pasteur Đà Nẵng',
    organizationContext: 'Đơn vị đào tạo ngoài công lập',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['pasteur', 'y duoc pasteur', 'duoc', 'cao dang'],
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

/**
 * Filtered list of 08 member universities and institutes in Da Nang
 * officially belonging to Đại học Đà Nẵng.
 */
export const UDN_MEMBER_INSTITUTIONS: ParticipatingInstitution[] =
  DANANG_INSTITUTION_REGISTRY.filter(
    (item) => item.organizationContext === 'Đại học Đà Nẵng'
  );
