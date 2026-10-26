/**
 * 5TOT Đà Nẵng — Two-Level Review Architecture & Institutional Routing (Prompt S1)
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Prompt S1 Sections 1–32, 41–43, 50–57, 66–68:
 * - Exactly TWO official review levels:
 *     Level 1: Cấp Trường / Đơn vị xét sơ (School / Base Review Unit)
 *     Level 2: Cấp Thành phố (City Review)
 * - Đại học Đà Nẵng (UDN) is ONE School-Level Review Unit, operationally equivalent
 *   to other university-level review units (ĐH Duy Tân, ĐH Đông Á, v.v.).
 * - UDN member institutions (Bách khoa, Kinh tế, Sư phạm, Ngoại ngữ, v.v.) are routed to UDN.
 * - Training Institution (nơi sinh viên học) vs School Review Unit (đơn vị xét sơ) are strictly separated.
 * - Single canonical Student application moving through two independent review stages.
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
// 2. SCHOOL REVIEW UNIT (Đơn vị xét sơ tuyển)
// =============================================================================

export type SchoolReviewUnitId =
  | 'unit-udn'     // Đại học Đà Nẵng (Hub xét sơ cho các trường thành viên UDN)
  | 'unit-dtu'     // Trường Đại học Duy Tân
  | 'unit-donga'   // Trường Đại học Đông Á
  | 'unit-dau'     // Trường Đại học Kiến trúc Đà Nẵng
  | 'unit-upes3'   // Trường Đại học Thể dục Thể thao Đà Nẵng
  | 'unit-tyd'     // Trường Đại học Kỹ thuật Y - Dược Đà Nẵng
  | 'unit-fpt';    // Trường Đại học FPT phân hiệu Đà Nẵng

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
 * Danh mục thẩm quyền chính thức của các Đơn vị xét sơ tuyển tại TP. Đà Nẵng (Prompt S1 Section 4, 5, 8)
 */
export const AUTHORITATIVE_SCHOOL_REVIEW_UNITS: SchoolReviewUnit[] = [
  {
    id: 'unit-udn',
    officialName: 'Đại học Đà Nẵng',
    shortName: 'ĐHĐN',
    code: 'UDN',
    status: 'active',
    contactEmail: 'hsv@udn.vn',
    contactPhone: '0236 3822 041',
    unitOfficerName: 'Nguyễn Văn An',
    memberInstitutionIds: [
      'inst-dut',  // ĐH Bách khoa - ĐHĐN
      'inst-due',  // ĐH Kinh tế - ĐHĐN
      'inst-ued',  // ĐH Sư phạm - ĐHĐN
      'inst-ufl',  // ĐH Ngoại ngữ - ĐHĐN
      'inst-ute',  // ĐH Sư phạm Kỹ thuật - ĐHĐN
      'inst-vku',  // ĐH CNTT & Truyền thông Việt - Hàn - ĐHĐN
      'inst-smp',  // Trường Y Dược - ĐHĐN
      'inst-vnuk', // Viện Nghiên cứu & Đào tạo Việt - Anh - ĐHĐN
    ],
    description: 'Đơn vị xét sơ tuyển tập trung cho toàn bộ các trường thành viên và đơn vị thuộc Đại học Đà Nẵng.',
  },
  {
    id: 'unit-dtu',
    officialName: 'Trường Đại học Duy Tân',
    shortName: 'DTU',
    code: 'DTU',
    status: 'active',
    contactEmail: 'doanthanhnien@duytan.edu.vn',
    contactPhone: '0236 3827 111',
    unitOfficerName: 'Trần Gia Huy',
    memberInstitutionIds: ['inst-dtu'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Duy Tân.',
  },
  {
    id: 'unit-donga',
    officialName: 'Trường Đại học Đông Á',
    shortName: 'ĐH Đông Á',
    code: 'UDA',
    status: 'active',
    contactEmail: 'doantruong@donga.edu.vn',
    contactPhone: '0236 3519 929',
    unitOfficerName: 'Hoàng Thị Thu Thảo',
    memberInstitutionIds: ['inst-donga'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Đông Á.',
  },
  {
    id: 'unit-dau',
    officialName: 'Trường Đại học Kiến trúc Đà Nẵng',
    shortName: 'ĐH Kiến trúc',
    code: 'DAU',
    status: 'active',
    contactEmail: 'hsv@dau.edu.vn',
    contactPhone: '0236 3622 999',
    unitOfficerName: 'Lê Thanh Hải',
    memberInstitutionIds: ['inst-dau'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Kiến trúc Đà Nẵng.',
  },
  {
    id: 'unit-upes3',
    officialName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    shortName: 'ĐH TDTT',
    code: 'UPES3',
    status: 'active',
    contactEmail: 'hsv@upes3.edu.vn',
    contactPhone: '0236 3822 555',
    unitOfficerName: 'Võ Minh Trí',
    memberInstitutionIds: ['inst-upes3'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Thể dục Thể thao Đà Nẵng.',
  },
  {
    id: 'unit-tyd',
    officialName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    shortName: 'ĐH KTYD',
    code: 'DHKTYD',
    status: 'active',
    contactEmail: 'hsv@dhktyduocdn.edu.vn',
    contactPhone: '0236 3835 380',
    unitOfficerName: 'Nguyễn Thị Phương',
    memberInstitutionIds: ['inst-tyd'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Trường Đại học Kỹ thuật Y - Dược Đà Nẵng.',
  },
  {
    id: 'unit-fpt',
    officialName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    shortName: 'ĐH FPT',
    code: 'FPT',
    status: 'active',
    contactEmail: 'hsv.fptdn@fe.edu.vn',
    contactPhone: '0236 7300 999',
    unitOfficerName: 'Bùi Đức Anh',
    memberInstitutionIds: ['inst-fpt'],
    description: 'Đơn vị xét sơ tuyển độc lập cho sinh viên Phân hiệu Đại học FPT tại Đà Nẵng.',
  },
];

// =============================================================================
// 3. INSTITUTION ROUTING MAP & RESOLUTION (Định tuyến tiếp nhận hồ sơ)
// =============================================================================

/**
 * Mapping dứt khoát từ Training Institution ID -> School Review Unit ID (Prompt S1 Section 8 & 9)
 */
export const INSTITUTION_TO_SCHOOL_REVIEW_UNIT_MAP: Record<string, SchoolReviewUnitId> = {
  // Thành viên Đại học Đà Nẵng -> Định tuyến về 'unit-udn'
  'inst-dut': 'unit-udn',
  'inst-due': 'unit-udn',
  'inst-ued': 'unit-udn',
  'inst-ufl': 'unit-udn',
  'inst-ute': 'unit-udn',
  'inst-vku': 'unit-udn',
  'inst-smp': 'unit-udn',
  'inst-vnuk': 'unit-udn',

  // Các trường đại học độc lập -> Tự đảm nhận xét sơ
  'inst-dtu': 'unit-dtu',
  'inst-donga': 'unit-donga',
  'inst-dau': 'unit-dau',
  'inst-upes3': 'unit-upes3',
  'inst-tyd': 'unit-tyd',
  'inst-fpt': 'unit-fpt',
};

export interface SchoolReviewUnitResolutionResult {
  resolved: boolean;
  unit: SchoolReviewUnit | null;
  trainingInstitutionId: string;
  errorCode?: 'NOT_CONFIGURED' | 'UNIT_SUSPENDED' | 'INVALID_INSTITUTION';
  errorMessage?: string;
}

/**
 * Hàm giải quyết đơn vị xét sơ tuyển chuẩn tắc (Prompt S1 Section 10 & 14)
 * Tuyệt đối không dựa vào so sánh chuỗi mờ ("Đà Nẵng") hay văn bản tự do của sinh viên.
 */
export function resolveSchoolReviewUnit(
  trainingInstitutionId: string,
  seasonId?: string
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
  decisionNumber?: string; // e.g. "182/QĐ-ĐHĐN" (Optional in LEAN-4.2 PDF-only upload, preserved for historical viewing)
  decisionTitle?: string;  // e.g. "Quyết định đề xuất danh sách Sinh viên 5 tốt cấp Thành phố năm học 2025–2026"
  decisionDate?: string;   // ISO date string
  signedByName?: string;   // e.g. "PGS.TS. Nguyễn Ngọc Vũ"
  signedByTitle?: string;  // e.g. "Giám đốc Đại học Đà Nẵng"
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

/**
 * Kiểm tra tính hợp lệ để hồ sơ bước vào quy trình phân công / thẩm định cấp Thành phố (Prompt S1 Section 24, 27, 34 + Prompt S4.8.2 Section 48)
 * - INDIVIDUAL: Bắt buộc phải qua thẩm định sơ tuyển và được Đơn vị xét sơ (Trường/ĐHĐN) xác nhận chuyển lên Thành phố.
 * - COLLECTIVE: Nộp trực tiếp lên Thành phố từ Cổng Tập thể, KHÔNG qua khâu trung gian của Trường.
 */
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
  // 1. COLLECTIVE DIRECT SUBMISSION INTAKE RULE (Prompt S4.8.2 Section 48)
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

  // 2. INDIVIDUAL WORKFLOW (Preserves mandatory School preliminary review & forwarding)
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

/**
 * Định tuyến đích nhận phản hồi bổ sung chuẩn xác (Prompt S1 Section 37–43)
 * Tuyệt đối không bao giờ trả hồ sơ City về lại School khi City yêu cầu bổ sung.
 */
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

  // Mặc định hoặc stage CITY
  return {
    targetStage: 'CITY',
    targetReviewUnitId: undefined,
    targetOfficerId: request.requestingOfficerId,
    destinationDescription: 'Phản hồi được gửi trực tiếp về Cán bộ xét duyệt cấp Thành phố (không trả về cấp Trường).',
  };
}
