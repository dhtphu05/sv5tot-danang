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
  // 08 Trường / Viện / Phân hiệu thành viên thuộc Đại học Đà Nẵng (định tuyến về unit-udn)
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
    id: 'inst-ufl',
    officialName: 'Trường Đại học Ngoại ngữ - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['ngoai ngu', 'ufl', 'dhnn', 'ngon ngu'],
  },
  {
    id: 'inst-ued',
    officialName: 'Trường Đại học Sư phạm - Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['su pham', 'ued', 'dhsp', 'giao duc'],
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
      'Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn, Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['viet han', 'cntt', 'truyen thong', 'vku', 'it'],
  },
  {
    id: 'inst-vnuk',
    officialName: 'Viện Nghiên cứu và Đào tạo Việt - Anh, Đại học Đà Nẵng',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['viet anh', 'vnuk', 'quoc te'],
  },
  {
    id: 'inst-udck',
    officialName: 'Phân hiệu Đại học Đà Nẵng tại Kon Tum',
    organizationContext: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['kon tum', 'udck', 'phan hieu kon tum', 'dhdn kon tum'],
  },

  // 17 Trường Đại học, Học viện, Phân hiệu và Cao đẳng độc lập thuộc danh sách chính thức
  {
    id: 'inst-dtu',
    officialName: 'Đại học Duy Tân',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['duy tan', 'dtu'],
  },
  {
    id: 'inst-dqu',
    officialName: 'Trường Đại học Quảng Nam',
    organizationContext: 'UBND Thành phố Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['dai hoc quang nam', 'dqu', 'quang nam', 'tam ky'],
  },
  {
    id: 'inst-tyd',
    officialName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    organizationContext: 'Bộ Y tế',
    educationLevelHint: 'Đại học',
    searchKeywords: ['ky thuat y duoc', 'dhktyd', 'y te'],
  },
  {
    id: 'inst-upes3',
    officialName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    organizationContext: 'Bộ Văn hóa, Thể thao và Du lịch',
    educationLevelHint: 'Đại học',
    searchKeywords: ['the duc the thao', 'tdtt', 'upes3'],
  },
  {
    id: 'inst-dau',
    officialName: 'Trường Đại học Kiến trúc Đà Nẵng',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['kien truc', 'dau', 'quy hoach'],
  },
  {
    id: 'inst-donga',
    officialName: 'Trường Đại học Đông Á',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['dong a', 'uda'],
  },
  {
    id: 'inst-cddn',
    officialName: 'Trường Cao đẳng Đà Nẵng',
    organizationContext: 'UBND Thành phố Đà Nẵng',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['cao dang da nang', 'cddn', 'danavtc', 'cao dang nghe da nang'],
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
    id: 'inst-cd-gtvt-tw5',
    officialName: 'Trường Cao đẳng Giao thông Vận tải Trung ương V',
    organizationContext: 'Bộ Giao thông Vận tải',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['giao thong van tai', 'gtvt', 'c5', 'cao dang'],
  },
  {
    id: 'inst-cd-phuongdong-dn',
    officialName: 'Trường Cao đẳng Phương Đông',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['phuong dong', 'cao dang phuong dong', 'cdpd'],
  },
  {
    id: 'inst-cd-luongthuc',
    officialName: 'Trường Cao đẳng Lương thực Thực phẩm',
    organizationContext: 'Bộ Nông nghiệp và Phát triển nông thôn',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['luong thuc thuc pham', 'cfit', 'cao dang'],
  },
  {
    id: 'inst-cd-congnghe',
    officialName: 'Trường Cao đẳng Công nghệ Y – Dược Việt Nam',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['cong nghe y duoc', 'y duoc viet nam', 'ydvn', 'cao dang'],
  },
  {
    id: 'inst-cd-daiviet-dn',
    officialName: 'Trường Cao đẳng Đại Việt Đà Nẵng',
    organizationContext: 'Đơn vị đào tạo trên địa bàn TP. Đà Nẵng',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['dai viet', 'cao dang dai viet', 'cddv'],
  },
  {
    id: 'inst-cd-kinhte-thuyloi-mt',
    officialName: 'Trường Cao đẳng Kinh tế Công nghệ và Thủy lợi Miền Trung',
    organizationContext: 'Bộ Nông nghiệp và Phát triển nông thôn',
    educationLevelHint: 'Cao đẳng',
    searchKeywords: ['kinh te cong nghe va thuy loi mien trung', 'thuy loi mien trung', 'cctw', 'hoi an'],
  },
  {
    id: 'inst-muce-dn',
    officialName: 'Phân hiệu Trường Đại học Xây dựng Miền Trung tại TP. Đà Nẵng',
    organizationContext: 'Bộ Xây dựng',
    educationLevelHint: 'Đại học',
    searchKeywords: ['xay dung mien trung', 'muce', 'phan hieu xay dung mien trung'],
  },
  {
    id: 'inst-apd-dn',
    officialName: 'Học viện Chính sách và Phát triển - Phân hiệu TP. Đà Nẵng',
    organizationContext: 'Bộ Kế hoạch và Đầu tư',
    educationLevelHint: 'Đại học',
    searchKeywords: ['chinh sach va phat trien', 'apd', 'hoc vien chinh sach'],
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
