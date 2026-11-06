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
  | 'unit-udn'                  // Đại học Đà Nẵng (Hub xét sơ cho 08 trường/viện thành viên ĐHĐN)
  | 'unit-dtu'                  // Đại học Duy Tân
  | 'unit-donga'                // Trường Đại học Đông Á
  | 'unit-dau'                  // Trường Đại học Kiến trúc Đà Nẵng
  | 'unit-upes3'                // Trường Đại học Thể dục Thể thao Đà Nẵng
  | 'unit-tyd'                  // Trường Đại học Kỹ thuật Y - Dược Đà Nẵng
  | 'unit-fpt'                  // Trường Đại học FPT phân hiệu Đà Nẵng
  | 'unit-dh-ngan-hang-dn'      // Trường Đại học Ngân hàng TP.HCM (Phân hiệu Đà Nẵng)
  | 'unit-dh-luat-hanoi-dn'     // Trường Đại học Luật Hà Nội (Phân hiệu Đà Nẵng)
  | 'unit-dh-mo-hn-dn'          // Trường Đại học Mở Hà Nội (Trạm đào tạo Đà Nẵng)
  | 'unit-hv-chinhtri-kv3'      // Học viện Chính trị khu vực III
  | 'unit-hv-toa-an'            // Học viện Tòa án (Cơ sở Đà Nẵng)
  | 'unit-cd-thuongmai'         // Trường Cao đẳng Thương mại
  | 'unit-cd-dulich'            // Trường Cao đẳng Du lịch Đà Nẵng
  | 'unit-cd-congnghe'          // Trường Cao đẳng Công nghệ Y - Dược Việt Nam
  | 'unit-cd-fptpoly'           // Trường Cao đẳng FPT Polytechnic cơ sở Đà Nẵng
  | 'unit-cd-nghe-dn'           // Trường Cao đẳng Nghề Đà Nẵng
  | 'unit-cd-gtvt-tw5'          // Trường Cao đẳng Giao thông Vận tải Trung ương V
  | 'unit-cd-kinhte-kh'         // Trường Cao đẳng Kinh tế - Kế hoạch Đà Nẵng
  | 'unit-cd-vhtt-dl'           // Trường Cao đẳng Văn hóa Nghệ thuật Đà Nẵng
  | 'unit-cd-luongthuc'         // Trường Cao đẳng Lương thực - Thực phẩm
  | 'unit-cd-ptth'              // Trường Cao đẳng Phát thanh - Truyền hình II (Cơ sở Đà Nẵng)
  | 'unit-cd-supham-maugiao'    // Trường Cao đẳng Sư phạm Trung ương Nha Trang (Cơ sở Đà Nẵng)
  | 'unit-cd-yduoc-pasteur'     // Trường Cao đẳng Y Dược Pasteur Đà Nẵng
  | 'unit-cd-lacviet'           // Trường Cao đẳng Lạc Việt (Tạm ngưng)
  // Legacy UDN unit IDs preserved in union for historical snapshot type compatibility
  | 'unit-dut'
  | 'unit-due'
  | 'unit-ued'
  | 'unit-ufl'
  | 'unit-ute'
  | 'unit-vku'
  | 'unit-smp'
  | 'unit-vnuk'
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
 * Danh mục thẩm quyền chính thức của 24 Đơn vị xét sơ tuyển đang hoạt động tại TP. Đà Nẵng
 * (01 đầu mối chung Đại học Đà Nẵng cho 08 trường/viện thành viên + 23 đơn vị độc lập)
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
      'inst-ued',
      'inst-ufl',
      'inst-ute',
      'inst-vku',
      'inst-smp',
      'inst-vnuk',
    ],
    description: 'Đơn vị xét sơ tuyển tập trung cho toàn bộ 08 trường thành viên và viện thuộc Đại học Đà Nẵng tại Đà Nẵng.',
  },
  {
    id: 'unit-dtu',
    officialName: 'Trường Đại học Duy Tân',
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
    id: 'unit-fpt',
    officialName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    shortName: 'ĐH FPT',
    code: 'FPTU',
    status: 'active',
    contactEmail: 'canbo.fpt@fpt.edu.vn',
    contactPhone: '0236 7300 999',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Đại học FPT phân hiệu Đà Nẵng',
    memberInstitutionIds: ['inst-fpt'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Phân hiệu Đại học FPT tại Đà Nẵng.',
  },
  {
    id: 'unit-dh-ngan-hang-dn',
    officialName: 'Trường Đại học Ngân hàng TP.HCM (Phân hiệu Đà Nẵng)',
    shortName: 'HUB-DN',
    code: 'HUB-DN',
    status: 'active',
    contactEmail: 'canbo.hubdn@hub.edu.vn',
    contactPhone: '0236 3736 888',
    unitOfficerName: 'Cán bộ xét cấp trường Trường ĐH Ngân hàng TP.HCM (Phân hiệu Đà Nẵng)',
    memberInstitutionIds: ['inst-dh-ngan-hang-dn'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường ĐH Ngân hàng TP.HCM (Phân hiệu Đà Nẵng).',
  },
  {
    id: 'unit-dh-luat-hanoi-dn',
    officialName: 'Trường Đại học Luật Hà Nội (Phân hiệu Đà Nẵng)',
    shortName: 'HLU-DN',
    code: 'HLU-DN',
    status: 'active',
    contactEmail: 'canbo.hludn@hlu.edu.vn',
    contactPhone: '0236 3824 555',
    unitOfficerName: 'Cán bộ xét cấp trường Trường ĐH Luật Hà Nội (Phân hiệu Đà Nẵng)',
    memberInstitutionIds: ['inst-dh-luat-hanoi-dn'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường ĐH Luật Hà Nội (Phân hiệu Đà Nẵng).',
  },
  {
    id: 'unit-dh-mo-hn-dn',
    officialName: 'Trường Đại học Mở Hà Nội (Trạm đào tạo Đà Nẵng)',
    shortName: 'HOU-DN',
    code: 'HOU-DN',
    status: 'active',
    contactEmail: 'canbo.houdn@hou.edu.vn',
    contactPhone: '0236 3829 111',
    unitOfficerName: 'Cán bộ xét cấp trường Trường ĐH Mở Hà Nội (Trạm Đà Nẵng)',
    memberInstitutionIds: ['inst-dh-mo-hn-dn'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường ĐH Mở Hà Nội (Trạm đào tạo Đà Nẵng).',
  },
  {
    id: 'unit-hv-chinhtri-kv3',
    officialName: 'Học viện Chính trị khu vực III',
    shortName: 'HVCT3',
    code: 'HVCT3',
    status: 'active',
    contactEmail: 'canbo.hvct3@hcma3.vn',
    contactPhone: '0236 3822 411',
    unitOfficerName: 'Cán bộ xét cấp trường Học viện Chính trị khu vực III',
    memberInstitutionIds: ['inst-hv-chinhtri-kv3'],
    description: 'Đơn vị xét sơ tuyển độc lập cho học viên Học viện Chính trị khu vực III.',
  },
  {
    id: 'unit-hv-toa-an',
    officialName: 'Học viện Tòa án (Cơ sở đào tạo thực hành Đà Nẵng)',
    shortName: 'HVTA',
    code: 'HVTA',
    status: 'active',
    contactEmail: 'canbo.hvta@toaan.gov.vn',
    contactPhone: '0236 3889 001',
    unitOfficerName: 'Cán bộ xét cấp trường Học viện Tòa án (Cơ sở Đà Nẵng)',
    memberInstitutionIds: ['inst-hv-toa-an'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Học viện Tòa án (Cơ sở Đà Nẵng).',
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
    id: 'unit-cd-congnghe',
    officialName: 'Trường Cao đẳng Công nghệ Y - Dược Việt Nam',
    shortName: 'CĐ CN Y Dược VN',
    code: 'YDVN',
    status: 'active',
    contactEmail: 'canbo.ydvn@ydvn.edu.vn',
    contactPhone: '0236 3888 333',
    unitOfficerName: 'Cán bộ xét cấp trường Trường CĐ Công nghệ Y - Dược Việt Nam',
    memberInstitutionIds: ['inst-cd-congnghe'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Công nghệ Y - Dược Việt Nam.',
  },
  {
    id: 'unit-cd-fptpoly',
    officialName: 'Trường Cao đẳng FPT Polytechnic cơ sở Đà Nẵng',
    shortName: 'FPTPoly ĐN',
    code: 'POLY',
    status: 'active',
    contactEmail: 'canbo.poly@fpt.edu.vn',
    contactPhone: '0236 7300 888',
    unitOfficerName: 'Cán bộ xét cấp trường Trường CĐ FPT Polytechnic Đà Nẵng',
    memberInstitutionIds: ['inst-cd-fptpoly'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng FPT Polytechnic cơ sở Đà Nẵng.',
  },
  {
    id: 'unit-cd-nghe-dn',
    officialName: 'Trường Cao đẳng Nghề Đà Nẵng',
    shortName: 'CĐ Nghề ĐN',
    code: 'DANAVTC',
    status: 'active',
    contactEmail: 'canbo.danavtc@danavtc.edu.vn',
    contactPhone: '0236 3940 946',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Cao đẳng Nghề Đà Nẵng',
    memberInstitutionIds: ['inst-cd-nghe-dn'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Nghề Đà Nẵng.',
  },
  {
    id: 'unit-cd-gtvt-tw5',
    officialName: 'Trường Cao đẳng Giao thông Vận tải Trung ương V',
    shortName: 'CĐ GTVT TW5',
    code: 'C5',
    status: 'active',
    contactEmail: 'canbo.c5@c5.edu.vn',
    contactPhone: '0236 3842 266',
    unitOfficerName: 'Cán bộ xét cấp trường Trường CĐ GTVT Trung ương V',
    memberInstitutionIds: ['inst-cd-gtvt-tw5'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Giao thông Vận tải Trung ương V.',
  },
  {
    id: 'unit-cd-kinhte-kh',
    officialName: 'Trường Cao đẳng Kinh tế - Kế hoạch Đà Nẵng',
    shortName: 'CĐ Kinh tế - KH',
    code: 'CEP',
    status: 'active',
    contactEmail: 'canbo.cep@cep.edu.vn',
    contactPhone: '0236 3842 062',
    unitOfficerName: 'Cán bộ xét cấp trường Trường CĐ Kinh tế - Kế hoạch Đà Nẵng',
    memberInstitutionIds: ['inst-cd-kinhte-kh'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Kinh tế - Kế hoạch Đà Nẵng.',
  },
  {
    id: 'unit-cd-vhtt-dl',
    officialName: 'Trường Cao đẳng Văn hóa Nghệ thuật Đà Nẵng',
    shortName: 'CĐ VHNT',
    code: 'CDVHNT',
    status: 'active',
    contactEmail: 'canbo.vhnt@vhntdn.edu.vn',
    contactPhone: '0236 3840 215',
    unitOfficerName: 'Cán bộ xét cấp trường Trường CĐ Văn hóa Nghệ thuật Đà Nẵng',
    memberInstitutionIds: ['inst-cd-vhtt-dl'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Văn hóa Nghệ thuật Đà Nẵng.',
  },
  {
    id: 'unit-cd-luongthuc',
    officialName: 'Trường Cao đẳng Lương thực - Thực phẩm',
    shortName: 'CĐ LTTP',
    code: 'CFIT',
    status: 'active',
    contactEmail: 'canbo.cfit@cfit.edu.vn',
    contactPhone: '0236 3831 228',
    unitOfficerName: 'Cán bộ xét cấp trường Trường CĐ Lương thực - Thực phẩm',
    memberInstitutionIds: ['inst-cd-luongthuc'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Lương thực - Thực phẩm.',
  },
  {
    id: 'unit-cd-ptth',
    officialName: 'Trường Cao đẳng Phát thanh - Truyền hình II (Cơ sở Đà Nẵng)',
    shortName: 'CĐ PT-TH II',
    code: 'VOV2',
    status: 'active',
    contactEmail: 'canbo.vov2@vov.edu.vn',
    contactPhone: '0236 3821 543',
    unitOfficerName: 'Cán bộ xét cấp trường Trường CĐ Phát thanh - Truyền hình II',
    memberInstitutionIds: ['inst-cd-ptth'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Phát thanh - Truyền hình II (Cơ sở Đà Nẵng).',
  },
  {
    id: 'unit-cd-supham-maugiao',
    officialName: 'Trường Cao đẳng Sư phạm Trung ương Nha Trang (Cơ sở Đà Nẵng)',
    shortName: 'CĐ SPTW',
    code: 'CDSPTW',
    status: 'active',
    contactEmail: 'canbo.cdsptw@edu.vn',
    contactPhone: '0236 3847 213',
    unitOfficerName: 'Cán bộ xét cấp trường Trường CĐ Sư phạm Trung ương Nha Trang',
    memberInstitutionIds: ['inst-cd-supham-maugiao'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Sư phạm Trung ương Nha Trang (Cơ sở Đà Nẵng).',
  },
  {
    id: 'unit-cd-yduoc-pasteur',
    officialName: 'Trường Cao đẳng Y Dược Pasteur Đà Nẵng',
    shortName: 'CĐ Pasteur ĐN',
    code: 'PASTEUR',
    status: 'active',
    contactEmail: 'canbo.pasteur@pasteur.edu.vn',
    contactPhone: '0236 3887 777',
    unitOfficerName: 'Cán bộ xét cấp trường Trường Cao đẳng Y Dược Pasteur Đà Nẵng',
    memberInstitutionIds: ['inst-cd-yduoc-pasteur'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Cao đẳng Y Dược Pasteur Đà Nẵng.',
  },
];

// =============================================================================
// 3. INSTITUTION ROUTING MAP & RESOLUTION (Định tuyến tiếp nhận hồ sơ)
// =============================================================================

/**
 * Mapping dứt khoát từ Training Institution ID -> School Review Unit ID
 * - 08 trường/viện thành viên ĐHĐN -> Định tuyến chung về 'unit-udn'
 * - 23 cơ sở đào tạo độc lập -> Tự đảm nhận xét sơ tại đơn vị riêng
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
  'inst-smp': 'unit-udn',
  'inst-vnuk': 'unit-udn',

  // 23 cơ sở đào tạo độc lập trên địa bàn TP. Đà Nẵng
  'inst-dtu': 'unit-dtu',
  'inst-donga': 'unit-donga',
  'inst-dau': 'unit-dau',
  'inst-upes3': 'unit-upes3',
  'inst-tyd': 'unit-tyd',
  'inst-fpt': 'unit-fpt',
  'inst-dh-ngan-hang-dn': 'unit-dh-ngan-hang-dn',
  'inst-dh-luat-hanoi-dn': 'unit-dh-luat-hanoi-dn',
  'inst-dh-mo-hn-dn': 'unit-dh-mo-hn-dn',
  'inst-hv-chinhtri-kv3': 'unit-hv-chinhtri-kv3',
  'inst-hv-toa-an': 'unit-hv-toa-an',
  'inst-cd-thuongmai': 'unit-cd-thuongmai',
  'inst-cd-dulich': 'unit-cd-dulich',
  'inst-cd-congnghe': 'unit-cd-congnghe',
  'inst-cd-fptpoly': 'unit-cd-fptpoly',
  'inst-cd-nghe-dn': 'unit-cd-nghe-dn',
  'inst-cd-gtvt-tw5': 'unit-cd-gtvt-tw5',
  'inst-cd-kinhte-kh': 'unit-cd-kinhte-kh',
  'inst-cd-vhtt-dl': 'unit-cd-vhtt-dl',
  'inst-cd-luongthuc': 'unit-cd-luongthuc',
  'inst-cd-ptth': 'unit-cd-ptth',
  'inst-cd-supham-maugiao': 'unit-cd-supham-maugiao',
  'inst-cd-yduoc-pasteur': 'unit-cd-yduoc-pasteur',
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
]);

/**
 * Chuẩn hóa mã đơn vị xét sơ cũ (per-school UDN) về đầu mối tập trung 'unit-udn'
 */
export function normalizeLegacySchoolReviewUnitId(unitId: string): SchoolReviewUnitId {
  if (LEGACY_UDN_MEMBER_UNIT_IDS.has(unitId)) {
    return 'unit-udn';
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

  if (trainingInstitutionId === 'inst-cd-lacviet') {
    return {
      resolved: false,
      unit: {
        id: 'unit-cd-lacviet',
        officialName: 'Trường Cao đẳng Lạc Việt',
        shortName: 'CĐ Lạc Việt',
        code: 'LACVIET',
        status: 'suspended',
        contactEmail: 'info@lacviet.edu.vn',
        contactPhone: '0236 3553 111',
        memberInstitutionIds: ['inst-cd-lacviet'],
      },
      trainingInstitutionId,
      errorCode: 'UNIT_SUSPENDED',
      errorMessage: 'Đơn vị xét sơ Trường Cao đẳng Lạc Việt đang tạm dừng hoạt động xét chọn trong mùa xét hiện tại.',
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
