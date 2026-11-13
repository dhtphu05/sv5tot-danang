/**
 * 5TOT Đà Nẵng — Two-Level Review Architecture & Institutional Routing
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Two-Level Review Architecture for Thành phố Đà Nẵng:
 * - Exactly TWO official review levels:
 *     Level 1: Cấp Trường / Đơn vị xét sơ tuyển (24 đơn vị: Đại học Đà Nẵng + 23 trường ĐH, HV, CĐ độc lập)
 *     Level 2: Cấp Thành phố Đà Nẵng (Ban Thư ký Hội Sinh viên TP. Đà Nẵng / Hội đồng xét chọn cấp Thành phố)
 * - Đại học Đà Nẵng (`unit-udn`) là 01 Đơn vị xét sơ tuyển tập trung cho 08 trường/viện thành viên ĐHĐN tại Đà Nẵng.
 * - Thông tin trường gốc (Training Institution) của từng sinh viên được giữ nguyên xuyên suốt.
 */

// =============================================================================
// 1. REVIEW STAGES (Hai cấp thẩm định chính thức)
// =============================================================================

export type ReviewStage =
  | 'SCHOOL'     // Cấp 1: Xét sơ tuyển cấp Trường / Đơn vị
  | 'CITY'       // Cấp 2: Xét duyệt cấp Thành phố
  | 'COMPLETED'; // Đã hoàn tất toàn bộ quy trình xét duyệt hai cấp

export interface ReviewStageMeta {
  id: ReviewStage;
  label: string;
  shortLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const REVIEW_STAGE_META: Record<ReviewStage, ReviewStageMeta> = {
  SCHOOL: {
    id: 'SCHOOL',
    label: 'Cấp Trường / Đơn vị xét sơ tuyển',
    shortLabel: 'Xét sơ tuyển cấp Trường',
    description: 'Hồ sơ đang trong quy trình thẩm định sơ tuyển tại đơn vị phụ trách.',
    badgeBg: '#EFF6FF',
    badgeText: '#1D4ED8',
    badgeBorder: '#BFDBFE',
  },
  CITY: {
    id: 'CITY',
    label: 'Cấp Thành phố Đà Nẵng',
    shortLabel: 'Xét duyệt cấp Thành phố',
    description: 'Hồ sơ đã được chuyển lên và đang được thẩm định độc lập tại cấp Thành phố.',
    badgeBg: '#F0FDF4',
    badgeText: '#15803D',
    badgeBorder: '#BBF7D0',
  },
  COMPLETED: {
    id: 'COMPLETED',
    label: 'Hoàn tất quy trình hai cấp',
    shortLabel: 'Đã hoàn tất',
    description: 'Hồ sơ đã hoàn thành toàn bộ quy trình xét sơ và xét duyệt cấp Thành phố.',
    badgeBg: '#F8FAFC',
    badgeText: '#475569',
    badgeBorder: '#E2E8F0',
  },
};

// =============================================================================
// 2. SCHOOL REVIEW UNIT (24 Đơn vị xét sơ tuyển trên địa bàn TP. Đà Nẵng)
// =============================================================================

export type SchoolReviewUnitId =
  | 'unit-udn'                  // 1. Đại học Đà Nẵng (Hub xét sơ cho 08 trường/viện/phân hiệu thành viên ĐHĐN)
  | 'unit-dtu'                  // 2. Đại học Duy Tân
  | 'unit-dqu'                  // 3. Trường Đại học Quảng Nam
  | 'unit-tyd'                  // 4. Trường Đại học Kỹ thuật Y - Dược Đà Nẵng
  | 'unit-upes3'                // 5. Trường Đại học Thể dục Thể thao Đà Nẵng
  | 'unit-dau'                  // 6. Trường Đại học Kiến trúc Đà Nẵng
  | 'unit-donga'                // 7. Trường Đại học Đông Á
  | 'unit-cddn'                 // 8. Trường Cao đẳng Đà Nẵng
  | 'unit-cd-thuongmai'         // 9. Trường Cao đẳng Thương mại
  | 'unit-cd-dulich'            // 10. Trường Cao đẳng Du lịch Đà Nẵng
  | 'unit-cd-gtvt-tw5'          // 11. Trường Cao đẳng Giao thông Vận tải Trung ương V
  | 'unit-cd-phuongdong-dn'     // 12. Trường Cao đẳng Phương Đông
  | 'unit-cd-luongthuc'         // 13. Trường Cao đẳng Lương thực Thực phẩm
  | 'unit-cd-congnghe'          // 14. Trường Cao đẳng Công nghệ Y – Dược Việt Nam
  | 'unit-cd-daiviet-dn'        // 15. Trường Cao đẳng Đại Việt Đà Nẵng
  | 'unit-cd-kinhte-thuyloi-mt' // 16. Trường Cao đẳng Kinh tế Công nghệ và Thủy lợi Miền Trung
  | 'unit-muce-dn'              // 17. Phân hiệu Trường Đại học Xây dựng Miền Trung tại TP. Đà Nẵng
  | 'unit-apd-dn'               // 18. Học viện Chính sách và Phát triển - Phân hiệu TP. Đà Nẵng
  // Legacy IDs preserved in union for historical snapshot type compatibility
  | 'unit-cd-nghe-dn'
  | 'unit-fpt'
  | 'unit-dh-ngan-hang-dn'
  | 'unit-dh-luat-hanoi-dn'
  | 'unit-dh-mo-hn-dn'
  | 'unit-hv-chinhtri-kv3'
  | 'unit-hv-hanhchinh-dn'
  | 'unit-hv-toa-an'
  | 'unit-greenwich-dn'
  | 'unit-auv'
  | 'unit-cd-fptpoly'
  | 'unit-cd-btec-fpt'
  | 'unit-cd-kinhte-kh'
  | 'unit-cd-vhtt-dl'
  | 'unit-cd-bachkhoa-dn'
  | 'unit-cd-ptth'
  | 'unit-cd-supham-maugiao'
  | 'unit-cd-yduoc-pasteur'
  | 'unit-cd-lacviet'
  | 'unit-pctu'
  | 'unit-cd-quangnam'
  | 'unit-cd-dienluc-mt'
  | 'unit-cd-thaco'
  | 'unit-dut'
  | 'unit-due'
  | 'unit-ued'
  | 'unit-ufl'
  | 'unit-ute'
  | 'unit-vku'
  | 'unit-smp'
  | 'unit-vnuk'
  | 'unit-udck'
  | 'unit-kontum';

export interface SchoolReviewUnit {
  id: SchoolReviewUnitId;
  officialName: string;
  shortName: string;
  code: string;
  status: 'active' | 'suspended';
  contactEmail: string;
  contactPhone: string;
  unitOfficerName?: string;
  /** Danh sách ID đơn vị đào tạo trực thuộc định tuyến về đơn vị xét sơ này */
  memberInstitutionIds: string[];
  description?: string;
}

/**
 * Danh mục thẩm quyền chính thức của 18 Đơn vị xét sơ tuyển đang hoạt động
 * (01 đầu mối chung Đại học Đà Nẵng cho 08 trường/viện/phân hiệu thành viên + 17 đơn vị độc lập)
 */
export const AUTHORITATIVE_SCHOOL_REVIEW_UNITS: SchoolReviewUnit[] = [
  {
    id: 'unit-udn',
    officialName: 'Đại học Đà Nẵng',
    shortName: 'ĐHĐN',
    code: 'UDN',
    status: 'active',
    contactEmail: 'canbo.udn@udn.vn',
    contactPhone: '0236 3822 041',
    unitOfficerName: 'Cán bộ xét cấp trường Đại học Đà Nẵng',
    memberInstitutionIds: [
      'inst-dut',
      'inst-due',
      'inst-ufl',
      'inst-ued',
      'inst-ute',
      'inst-vku',
      'inst-vnuk',
      'inst-udck',
    ],
    description: 'Đơn vị xét sơ tuyển tập trung cho toàn bộ 08 trường thành viên, viện và phân hiệu thuộc Đại học Đà Nẵng.',
  },
  {
    id: 'unit-dtu',
    officialName: 'Đại học Duy Tân',
    shortName: 'DTU',
    code: 'DTU',
    status: 'active',
    contactEmail: 'canbo.dtu@duytan.edu.vn',
    contactPhone: '0236 3650 403',
    unitOfficerName: 'Cán bộ xét cấp trường Đại học Duy Tân',
    memberInstitutionIds: ['inst-dtu'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Đại học Duy Tân.',
  },
  {
    id: 'unit-dqu',
    officialName: 'Trường Đại học Quảng Nam',
    shortName: 'ĐH Quảng Nam',
    code: 'DQU',
    status: 'active',
    contactEmail: 'canbo.dqu@dqu.edu.vn',
    contactPhone: '0235 3812 834',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Đại học Quảng Nam',
    memberInstitutionIds: ['inst-dqu'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Quảng Nam.',
  },
  {
    id: 'unit-tyd',
    officialName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    shortName: 'ĐH KTYD',
    code: 'DHKTYD',
    status: 'active',
    contactEmail: 'canbo.tyd@dhktyduocdn.edu.vn',
    contactPhone: '0236 3835 380',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    memberInstitutionIds: ['inst-tyd'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Kỹ thuật Y - Dược Đà Nẵng.',
  },
  {
    id: 'unit-upes3',
    officialName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    shortName: 'ĐH TDTT',
    code: 'UPES3',
    status: 'active',
    contactEmail: 'canbo.upes3@upes3.edu.vn',
    contactPhone: '0236 3759 123',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Đại học Thể dục Thể thao Đà Nẵng',
    memberInstitutionIds: ['inst-upes3'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Thể dục Thể thao Đà Nẵng.',
  },
  {
    id: 'unit-dau',
    officialName: 'Trường Đại học Kiến trúc Đà Nẵng',
    shortName: 'ĐH Kiến trúc',
    code: 'DAU',
    status: 'active',
    contactEmail: 'canbo.dau@dau.edu.vn',
    contactPhone: '0236 3740 666',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Đại học Kiến trúc Đà Nẵng',
    memberInstitutionIds: ['inst-dau'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Kiến trúc Đà Nẵng.',
  },
  {
    id: 'unit-donga',
    officialName: 'Trường Đại học Đông Á',
    shortName: 'ĐH Đông Á',
    code: 'UDA',
    status: 'active',
    contactEmail: 'canbo.donga@donga.edu.vn',
    contactPhone: '0236 3519 929',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Đại học Đông Á',
    memberInstitutionIds: ['inst-donga'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Đông Á.',
  },
  {
    id: 'unit-cddn',
    officialName: 'Trường Cao đẳng Đà Nẵng',
    shortName: 'CĐ Đà Nẵng',
    code: 'CDDN',
    status: 'active',
    contactEmail: 'canbo.cddn@danavtc.edu.vn',
    contactPhone: '0236 3940 946',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Cao đẳng Đà Nẵng',
    memberInstitutionIds: ['inst-cddn'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Đà Nẵng.',
  },
  {
    id: 'unit-cd-thuongmai',
    officialName: 'Trường Cao đẳng Thương mại',
    shortName: 'CĐ Thương mại',
    code: 'CDTM',
    status: 'active',
    contactEmail: 'canbo.cdtm@cdtm.edu.vn',
    contactPhone: '0236 3759 580',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Cao đẳng Thương mại',
    memberInstitutionIds: ['inst-cd-thuongmai'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Thương mại.',
  },
  {
    id: 'unit-cd-dulich',
    officialName: 'Trường Cao đẳng Du lịch Đà Nẵng',
    shortName: 'CĐ Du lịch',
    code: 'DVTC',
    status: 'active',
    contactEmail: 'canbo.dvtc@dvtc.edu.vn',
    contactPhone: '0236 3957 957',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Cao đẳng Du lịch Đà Nẵng',
    memberInstitutionIds: ['inst-cd-dulich'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Du lịch Đà Nẵng.',
  },
  {
    id: 'unit-cd-gtvt-tw5',
    officialName: 'Trường Cao đẳng Giao thông Vận tải Trung ương V',
    shortName: 'CĐ GTVT TW5',
    code: 'C5',
    status: 'active',
    contactEmail: 'canbo.c5@c5.edu.vn',
    contactPhone: '0236 3842 266',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Cao đẳng Giao thông Vận tải Trung ương V',
    memberInstitutionIds: ['inst-cd-gtvt-tw5'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Giao thông Vận tải Trung ương V.',
  },
  {
    id: 'unit-cd-phuongdong-dn',
    officialName: 'Trường Cao đẳng Phương Đông',
    shortName: 'CĐ Phương Đông',
    code: 'CDPD',
    status: 'active',
    contactEmail: 'canbo.cdpd@cdpd.edu.vn',
    contactPhone: '0236 3893 823',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Cao đẳng Phương Đông',
    memberInstitutionIds: ['inst-cd-phuongdong-dn'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Phương Đông.',
  },
  {
    id: 'unit-cd-luongthuc',
    officialName: 'Trường Cao đẳng Lương thực Thực phẩm',
    shortName: 'CĐ LTTP',
    code: 'CFIT',
    status: 'active',
    contactEmail: 'canbo.cfit@cfit.edu.vn',
    contactPhone: '0236 3831 228',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Cao đẳng Lương thực Thực phẩm',
    memberInstitutionIds: ['inst-cd-luongthuc'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Lương thực Thực phẩm.',
  },
  {
    id: 'unit-cd-congnghe',
    officialName: 'Trường Cao đẳng Công nghệ Y – Dược Việt Nam',
    shortName: 'CĐ CN Y Dược VN',
    code: 'YDVN',
    status: 'active',
    contactEmail: 'canbo.ydvn@ydvn.edu.vn',
    contactPhone: '0236 3888 333',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Cao đẳng Công nghệ Y – Dược Việt Nam',
    memberInstitutionIds: ['inst-cd-congnghe'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Công nghệ Y – Dược Việt Nam.',
  },
  {
    id: 'unit-cd-daiviet-dn',
    officialName: 'Trường Cao đẳng Đại Việt Đà Nẵng',
    shortName: 'CĐ Đại Việt ĐN',
    code: 'DAIVIET',
    status: 'active',
    contactEmail: 'canbo.daiviet@daivietdanang.edu.vn',
    contactPhone: '0236 3644 999',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Cao đẳng Đại Việt Đà Nẵng',
    memberInstitutionIds: ['inst-cd-daiviet-dn'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Đại Việt Đà Nẵng.',
  },
  {
    id: 'unit-cd-kinhte-thuyloi-mt',
    officialName: 'Trường Cao đẳng Kinh tế Công nghệ và Thủy lợi Miền Trung',
    shortName: 'CĐ KT-TL Miền Trung',
    code: 'CCTW',
    status: 'active',
    contactEmail: 'canbo.cctw@cctw.edu.vn',
    contactPhone: '0235 3861 312',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Cao đẳng Kinh tế Công nghệ và Thủy lợi Miền Trung',
    memberInstitutionIds: ['inst-cd-kinhte-thuyloi-mt'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Kinh tế Công nghệ và Thủy lợi Miền Trung.',
  },
  {
    id: 'unit-muce-dn',
    officialName: 'Phân hiệu Trường Đại học Xây dựng Miền Trung tại TP. Đà Nẵng',
    shortName: 'ĐH XD Miền Trung - ĐN',
    code: 'MUCE-DN',
    status: 'active',
    contactEmail: 'canbo.muce@muce.edu.vn',
    contactPhone: '0236 3842 100',
    unitOfficerName: 'Cán bộ xét cấp trường Phân hiệu Trường Đại học Xây dựng Miền Trung tại TP. Đà Nẵng',
    memberInstitutionIds: ['inst-muce-dn'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Phân hiệu Trường Đại học Xây dựng Miền Trung tại TP. Đà Nẵng.',
  },
  {
    id: 'unit-apd-dn',
    officialName: 'Học viện Chính sách và Phát triển - Phân hiệu TP. Đà Nẵng',
    shortName: 'HV CS&PT - ĐN',
    code: 'APD-DN',
    status: 'active',
    contactEmail: 'canbo.apd@apd.edu.vn',
    contactPhone: '0236 3842 200',
    unitOfficerName: 'Cán bộ xét cấp trường Học viện Chính sách và Phát triển - Phân hiệu TP. Đà Nẵng',
    memberInstitutionIds: ['inst-apd-dn'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Học viện Chính sách và Phát triển - Phân hiệu TP. Đà Nẵng.',
  },
];

// =============================================================================
// 3. INSTITUTION ROUTING MAP & RESOLUTION (Định tuyến tiếp nhận hồ sơ)
// =============================================================================

/**
 * Mapping dứt khoát từ Training Institution ID -> School Review Unit ID
 * - 08 trường/viện/phân hiệu thành viên ĐHĐN -> Định tuyến chung về 'unit-udn'
 * - 17 cơ sở đào tạo độc lập -> Tự đảm nhận xét sơ tại đơn vị riêng
 */
export const INSTITUTION_TO_SCHOOL_REVIEW_UNIT_MAP: Record<string, SchoolReviewUnitId> = {
  // Thành viên Đại học Đà Nẵng -> Định tuyến về 'unit-udn'
  'inst-dut': 'unit-udn',
  'inst-due': 'unit-udn',
  'inst-ued': 'unit-udn',
  'inst-ufl': 'unit-udn',
  'inst-ufls': 'unit-udn',
  'inst-ute': 'unit-udn',
  'inst-vku': 'unit-udn',
  'inst-vnuk': 'unit-udn',
  'inst-udck': 'unit-udn',
  'inst-smp': 'unit-udn',

  // 17 cơ sở đào tạo độc lập thuộc danh sách chính thức
  'inst-dtu': 'unit-dtu',
  'inst-dqu': 'unit-dqu',
  'inst-tyd': 'unit-tyd',
  'inst-upes3': 'unit-upes3',
  'inst-dau': 'unit-dau',
  'inst-donga': 'unit-donga',
  'inst-cddn': 'unit-cddn',
  'inst-cd-nghe-dn': 'unit-cddn',
  'inst-cd-thuongmai': 'unit-cd-thuongmai',
  'inst-cd-dulich': 'unit-cd-dulich',
  'inst-cd-gtvt-tw5': 'unit-cd-gtvt-tw5',
  'inst-cd-phuongdong-dn': 'unit-cd-phuongdong-dn',
  'inst-cd-luongthuc': 'unit-cd-luongthuc',
  'inst-cd-congnghe': 'unit-cd-congnghe',
  'inst-cd-daiviet-dn': 'unit-cd-daiviet-dn',
  'inst-cd-kinhte-thuyloi-mt': 'unit-cd-kinhte-thuyloi-mt',
  'inst-muce-dn': 'unit-muce-dn',
  'inst-apd-dn': 'unit-apd-dn',
};

const LEGACY_UDN_MEMBER_UNIT_IDS = new Set<string>([
  'unit-dut',
  'unit-due',
  'unit-ued',
  'unit-ufl',
  'unit-ufls',
  'unit-ute',
  'unit-vku',
  'unit-smp',
  'unit-vnuk',
  'unit-udck',
  'unit-kontum',
]);

/**
 * Chuẩn hóa mã đơn vị xét sơ cũ (per-school UDN) về đầu mối tập trung 'unit-udn'
 */
export function normalizeLegacySchoolReviewUnitId(unitId: string): SchoolReviewUnitId {
  if (LEGACY_UDN_MEMBER_UNIT_IDS.has(unitId)) {
    return 'unit-udn';
  }
  if (unitId === 'unit-cd-nghe-dn') {
    return 'unit-cddn';
  }
  return unitId as SchoolReviewUnitId;
}

export interface SchoolReviewUnitResolutionResult {
  resolved: boolean;
  unit: SchoolReviewUnit | null;
  trainingInstitutionId: string;
  errorCode?: 'NOT_CONFIGURED' | 'UNIT_SUSPENDED' | 'INVALID_INSTITUTION';
  errorMessage?: string;
}

/**
 * Hàm giải quyết đơn vị xét sơ tuyển chuẩn tắc
 */
export function resolveSchoolReviewUnit(
  trainingInstitutionId: string,
  _seasonId?: string
): SchoolReviewUnitResolutionResult {
  if (!trainingInstitutionId) {
    return {
      resolved: false,
      unit: null,
      trainingInstitutionId: '',
      errorCode: 'INVALID_INSTITUTION',
      errorMessage: 'Chưa có thông tin đơn vị đào tạo của sinh viên.',
    };
  }

  const unitId = INSTITUTION_TO_SCHOOL_REVIEW_UNIT_MAP[trainingInstitutionId];
  if (!unitId) {
    return {
      resolved: false,
      unit: null,
      trainingInstitutionId,
      errorCode: 'NOT_CONFIGURED',
      errorMessage:
        'Chưa xác định được đơn vị tiếp nhận xét sơ hồ sơ cho trường đào tạo này. Vui lòng liên hệ Hội Sinh viên Thành phố để được hỗ trợ cấu hình.',
    };
  }

  const unit = AUTHORITATIVE_SCHOOL_REVIEW_UNITS.find((u) => u.id === unitId);
  if (!unit) {
    return {
      resolved: false,
      unit: null,
      trainingInstitutionId,
      errorCode: 'NOT_CONFIGURED',
      errorMessage: 'Đơn vị xét sơ tuyển không tồn tại trong danh mục thẩm quyền.',
    };
  }

  if (unit.status !== 'active') {
    return {
      resolved: false,
      unit,
      trainingInstitutionId,
      errorCode: 'UNIT_SUSPENDED',
      errorMessage: `Đơn vị xét sơ ${unit.officialName} đang tạm dừng hoạt động xét chọn trong mùa xét hiện tại.`,
    };
  }

  return {
    resolved: true,
    unit,
    trainingInstitutionId,
  };
}

// =============================================================================
// 4. SCHOOL PRELIMINARY REVIEW STATUS (Trạng thái xét sơ tuyển cấp Trường)
// =============================================================================

export type SchoolPreliminaryStatus =
  | 'pending_intake'         // Chờ tiếp nhận xét sơ
  | 'under_review'            // Đang xét sơ
  | 'supplement_requested'    // Cần sinh viên bổ sung (Cấp Trường)
  | 'supplement_returned'     // Sinh viên đã gửi bổ sung (Cấp Trường)
  | 'preliminary_completed'   // Đã hoàn tất xét sơ (chờ đưa ra kết luận đề xuất)
  | 'recommended_forwarding'  // Đề xuất chuyển Thành phố (chưa bấm chuyển chính thức)
  | 'not_recommended'         // Không đề xuất chuyển Thành phố
  | 'forwarded_to_city';      // Đã chuyển hồ sơ lên Thành phố

export type SchoolForwardingRecommendation =
  | 'recommended'
  | 'not_recommended'
  | 'pending';

export interface SchoolPreliminaryStatusMeta {
  label: string;
  shortLabel: string;
  tone: 'neutral' | 'brand' | 'warning' | 'success' | 'rose';
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const SCHOOL_PRELIMINARY_STATUS_META: Record<
  SchoolPreliminaryStatus,
  SchoolPreliminaryStatusMeta
> = {
  pending_intake: {
    label: 'Chờ tiếp nhận xét sơ tuyển',
    shortLabel: 'Chờ tiếp nhận',
    tone: 'neutral',
    dotColor: '#64748B',
    badgeBg: '#F1F5F9',
    badgeText: '#475569',
    badgeBorder: '#CBD5E1',
  },
  under_review: {
    label: 'Đang xét sơ tuyển',
    shortLabel: 'Đang xét sơ tuyển',
    tone: 'brand',
    dotColor: '#0284C7',
    badgeBg: '#F0F9FF',
    badgeText: '#0369A1',
    badgeBorder: '#BAE6FD',
  },
  supplement_requested: {
    label: 'Cần bổ sung (Cấp Trường)',
    shortLabel: 'Chờ SV bổ sung',
    tone: 'warning',
    dotColor: '#D97706',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    badgeBorder: '#FDE68A',
  },
  supplement_returned: {
    label: 'Đã nhận bổ sung (Cấp Trường)',
    shortLabel: 'Vừa gửi bổ sung',
    tone: 'brand',
    dotColor: '#0284C7',
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
    badgeBorder: '#7DD3FC',
  },
  preliminary_completed: {
    label: 'Đã hoàn tất xét sơ tuyển',
    shortLabel: 'Hoàn tất sơ tuyển',
    tone: 'brand',
    dotColor: '#2563EB',
    badgeBg: '#EFF6FF',
    badgeText: '#1D4ED8',
    badgeBorder: '#BFDBFE',
  },
  recommended_forwarding: {
    label: 'Đề xuất chuyển Thành phố',
    shortLabel: 'Đề xuất chuyển',
    tone: 'success',
    dotColor: '#16A34A',
    badgeBg: '#F0FDF4',
    badgeText: '#15803D',
    badgeBorder: '#BBF7D0',
  },
  not_recommended: {
    label: 'Không đề xuất chuyển',
    shortLabel: 'Không đề xuất',
    tone: 'rose',
    dotColor: '#E11D48',
    badgeBg: '#FFF1F2',
    badgeText: '#BE123C',
    badgeBorder: '#FECDD3',
  },
  forwarded_to_city: {
    label: 'Đã chuyển Thành phố',
    shortLabel: 'Đã chuyển TP',
    tone: 'success',
    dotColor: '#059669',
    badgeBg: '#ECFDF5',
    badgeText: '#047857',
    badgeBorder: '#A7F3D0',
  },
};

// =============================================================================
// 5. SCHOOL FORWARDING SNAPSHOT (Lưu trữ ảnh chụp lúc chuyển giao)
// =============================================================================

export interface SchoolForwardingSnapshot {
  applicationId: string;
  trainingInstitutionId: string;
  trainingInstitutionName: string;
  schoolReviewUnitId: SchoolReviewUnitId;
  schoolReviewUnitName: string;
  forwardedBy: string;
  forwardedByName: string;
  forwardedAt: string;
  recommendation: SchoolForwardingRecommendation;
  summaryNotes?: string;
  reviewedCriteriaCount: number;
  totalDeclarations: number;
  totalEvidence: number;
  scopeSummary: Record<
    string,
    {
      status: string;
      internalNote?: string;
      reviewedAt?: string;
    }
  >;
}

export interface SchoolReviewSummary {
  status: SchoolPreliminaryStatus;
  schoolReviewUnitId?: SchoolReviewUnitId;
  schoolReviewUnitName?: string;
  recommendation?: SchoolForwardingRecommendation;
  recommendationDate?: string;
  recommendingOfficerId?: string;
  recommendingOfficerName?: string;
  isForwardedToCity: boolean;
  forwardedAt?: string;
  forwardedBy?: string;
  forwardedByName?: string;
  preliminaryCompletedAt?: string;
  officerNotes?: string;
  notRecommendedReason?: string;
  reviewedCriteriaCount: number;
  snapshot?: SchoolForwardingSnapshot;
  decisionDocumentMetadata?: DecisionDocumentMetadata;
}

// =============================================================================
// 5B. SCHOOL FORWARDING BATCH TYPES & DTOS (Prompt SRW-0, SRW-1 & SRW-3)
// =============================================================================

export type ForwardingBatchStatus = 'DRAFT' | 'FORWARDED';

export interface DecisionDocumentMetadata {
  decisionNumber?: string;
  decisionTitle?: string;
  decisionDate?: string;
  signedByName?: string;
  signedByTitle?: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
}

export interface InstitutionBatchBreakdown {
  institutionId: string;
  institutionName: string;
  totalApplications: number;
  selectedCount: number;
  pendingCount: number;
}

export interface SchoolForwardingBatchSummaryDto {
  schoolReviewUnitId: string;
  schoolReviewUnitName: string;
  seasonId: string;
  seasonCode: string;
  totalApplicationsInScope: number;
  reviewedApplicationsCount: number;
  selectedApplicationsCount: number;
  notSelectedApplicationsCount: number;
  pendingReviewCount: number;
  hasActiveSupplementsCount: number;
  institutionBreakdown: InstitutionBatchBreakdown[];
  canForward: boolean;
  blockingReasons: string[];
  attachedDecisionDocument?: DecisionDocumentMetadata;
  isAlreadyForwarded: boolean;
  forwardedAt?: string;
  batchId?: string;
}

export interface SchoolForwardingBatchDto {
  id: string;
  seasonId: string;
  schoolReviewUnitId: string;
  schoolReviewUnitName?: string;
  status: ForwardingBatchStatus;
  decisionNumber?: string;
  decisionTitle?: string;
  decisionDate?: string;
  signedByName?: string;
  signedByTitle?: string;
  decisionFileId?: string;
  decisionFileName?: string;
  decisionFileSize?: number;
  decisionFileUrl?: string;
  forwardingNote?: string;
  submittedByUserId?: string;
  submittedByName?: string;
  submittedAt?: string;
  applicationCount: number;
  selectedApplicationIds: string[];
  idempotencyKey?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveBatchDraftInput {
  seasonId: string;
  selectedApplicationIds: string[];
  forwardingNote?: string;
  decisionMetadata?: Partial<DecisionDocumentMetadata>;
}

export interface AttachDecisionDocumentInput {
  seasonId: string;
  decisionNumber?: string;
  decisionTitle?: string;
  decisionDate?: string;
  signedByName?: string;
  signedByTitle?: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
}

export interface ConfirmBatchForwardingInput {
  seasonId: string;
  idempotencyKey?: string;
  forwardingNote?: string;
}

// =============================================================================
// 6. CITY INTAKE ELIGIBILITY CONTRACT (Điều kiện tiếp nhận cấp Thành phố)
// =============================================================================

export function isApplicationEligibleForCityIntake(app: {
  applicationType?: 'INDIVIDUAL' | 'COLLECTIVE';
  currentReviewStage?: ReviewStage;
  schoolReviewSummary?: SchoolReviewSummary;
  status?: string;
}): {
  eligible: boolean;
  reason?: 'NOT_IN_CITY_STAGE' | 'NOT_FORWARDED_BY_SCHOOL' | 'NOT_RECOMMENDED' | 'SCHOOL_REVIEW_IN_PROGRESS';
  message: string;
} {
  if (app.applicationType === 'COLLECTIVE') {
    if (
      app.status === 'city_unassigned' ||
      app.status === 'city_assigned' ||
      app.status === 'city_in_review' ||
      app.status === 'city_supplement_pending' ||
      app.status === 'city_supplement_returned' ||
      app.status === 'city_review_completed' ||
      app.status === 'published' ||
      app.currentReviewStage === 'CITY' ||
      app.currentReviewStage === 'COMPLETED'
    ) {
      return {
        eligible: true,
        message: 'Hồ sơ tập thể đã nộp trực tiếp lên Thành phố hợp lệ, sẵn sàng tiếp nhận và phân công.',
      };
    }
    return {
      eligible: false,
      reason: 'NOT_IN_CITY_STAGE',
      message: 'Hồ sơ tập thể đang ở trạng thái kê khai (Draft), chưa nộp lên cấp Thành phố.',
    };
  }

  if (app.currentReviewStage === 'SCHOOL') {
    return {
      eligible: false,
      reason: 'SCHOOL_REVIEW_IN_PROGRESS',
      message: 'Hồ sơ đang trong giai đoạn xét sơ cấp Trường, chưa đủ điều kiện tiếp nhận cấp Thành phố.',
    };
  }

  if (!app.schoolReviewSummary?.isForwardedToCity) {
    if (app.schoolReviewSummary?.recommendation === 'not_recommended') {
      return {
        eligible: false,
        reason: 'NOT_RECOMMENDED',
        message: 'Hồ sơ không được đơn vị xét sơ đề xuất chuyển lên cấp Thành phố.',
      };
    }
    return {
      eligible: false,
      reason: 'NOT_FORWARDED_BY_SCHOOL',
      message: 'Hồ sơ chưa được Cán bộ xét duyệt cấp Trường xác nhận chuyển lên cấp Thành phố.',
    };
  }

  if (app.currentReviewStage === 'CITY' || app.currentReviewStage === 'COMPLETED') {
    return {
      eligible: true,
      message: 'Hồ sơ đã được chuyển lên cấp Thành phố hợp lệ và sẵn sàng tiếp nhận/phân công.',
    };
  }

  return {
    eligible: false,
    reason: 'NOT_IN_CITY_STAGE',
    message: 'Hồ sơ chưa ở trạng thái tiếp nhận cấp Thành phố.',
  };
}

// =============================================================================
// 7. SUPPLEMENT ROUTING RULES (Định tuyến phản hồi bổ sung độc lập)
// =============================================================================

export function resolveSupplementResponseDestination(request: {
  originatingReviewStage?: ReviewStage;
  requestingReviewUnitId?: string;
  requestingOfficerId?: string;
}): {
  targetStage: ReviewStage;
  targetReviewUnitId?: string;
  targetOfficerId?: string;
  destinationDescription: string;
} {
  if (request.originatingReviewStage === 'SCHOOL') {
    return {
      targetStage: 'SCHOOL',
      targetReviewUnitId: request.requestingReviewUnitId,
      targetOfficerId: request.requestingOfficerId,
      destinationDescription: 'Phản hồi được gửi trực tiếp về Cán bộ xét duyệt cấp Trường.',
    };
  }

  return {
    targetStage: 'CITY',
    targetReviewUnitId: undefined,
    targetOfficerId: request.requestingOfficerId,
    destinationDescription: 'Phản hồi được gửi trực tiếp về Cán bộ xét duyệt cấp Thành phố (không trả về cấp Trường).',
  };
}
