/**
 * 5TOT Đà Nẵng — Collective Student 5-Good Domain Types & Contracts
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 * Niên khóa áp dụng: Năm học 2025–2026
 *
 * Implements Prompt S4.8 v2:
 * - Two distinct recognition tracks: INDIVIDUAL vs COLLECTIVE
 * - Four Collective Requirements: TT01 (School Recognition), TT02 (100% Movement Participation),
 *   TT03 (>= 20% School-level Individual SV5T), TT04 (No Legal/Regulatory Violations).
 * - Canonical Workflow: DRAFT -> SUBMITTED_FOR_UNIT_CONFIRMATION -> UNIT_CONFIRMED_AND_FORWARDED
 *   -> CITY_UNASSIGNED -> CITY_ASSIGNED -> CITY_IN_REVIEW (with direct supplement) -> CITY_REVIEW_COMPLETED
 *   -> COMMITTEE -> PUBLISHED.
 */

export type { ApplicationEvidence } from '../demo/fixtures/studentApplication';
import { ApplicationEvidence } from '../demo/fixtures/studentApplication';
import { SchoolReviewUnitId } from './schoolReviewTypes';

export type ApplicationTrackType = 'INDIVIDUAL' | 'COLLECTIVE';

export type CollectiveType =
  | 'CHI_HOI'          // Chi hội
  | 'LIEN_CHI_HOI'     // Liên chi hội
  | 'CHI_DOAN'         // Chi đoàn (dành cho cơ sở không có Hội SV)
  | 'LIEN_CHI_DOAN'    // Liên chi đoàn
  | 'faculty_association'
  | 'student_branch'
  | 'club_team_group';

export const COLLECTIVE_TYPE_LABELS: Record<string, string> = {
  CHI_HOI: 'Chi hội',
  LIEN_CHI_HOI: 'Liên chi hội',
  CHI_DOAN: 'Chi đoàn',
  LIEN_CHI_DOAN: 'Liên chi đoàn',
  faculty_association: 'Liên chi hội',
  student_branch: 'Chi hội',
  club_team_group: 'CLB / Đội / Nhóm',
};

export type CollectiveRequirementId = 'TT01' | 'TT02' | 'TT03' | 'TT04';

export interface CollectiveRequirementMeta {
  id: CollectiveRequirementId;
  code: string;
  title: string;
  shortTitle: string;
  ruleBadge: string;
  ruleHelper: string;
  thresholdHelper: string;
}

export const COLLECTIVE_REQUIREMENTS_META: Record<CollectiveRequirementId, CollectiveRequirementMeta> = {
  TT01: {
    id: 'TT01',
    code: 'TT01',
    title: 'Đã đạt danh hiệu "Tập thể Sinh viên 5 tốt" cấp Trường',
    shortTitle: 'Công nhận cấp Trường',
    ruleBadge: 'Điều kiện tiên quyết',
    ruleHelper: 'Phải được Hội Sinh viên hoặc Ban Giám hiệu Nhà trường công nhận danh hiệu Tập thể Sinh viên 5 tốt cấp Trường trong năm học xét chọn.',
    thresholdHelper: 'Bắt buộc đạt',
  },
  TT02: {
    id: 'TT02',
    code: 'TT02',
    title: '100% sinh viên tham gia phong trào Sinh viên 5 tốt',
    shortTitle: 'Tham gia phong trào',
    ruleBadge: 'Tỷ lệ 100%',
    ruleHelper: '100% sinh viên trong tập thể đăng ký và tham gia phong trào Sinh viên 5 tốt trong năm học.',
    thresholdHelper: 'Ngưỡng yêu cầu: 100%',
  },
  TT03: {
    id: 'TT03',
    code: 'TT03',
    title: 'Ít nhất 20% thành viên đạt Sinh viên 5 tốt cấp Trường',
    shortTitle: 'Thành viên đạt SV5T',
    ruleBadge: 'Tỷ lệ >= 20%',
    ruleHelper: 'Ít nhất 20% sinh viên trong tập thể đạt danh hiệu Sinh viên 5 tốt cấp Trường trong năm học xét chọn.',
    thresholdHelper: 'Ngưỡng yêu cầu: >= 20%',
  },
  TT04: {
    id: 'TT04',
    code: 'TT04',
    title: 'Không có sinh viên vi phạm pháp luật và các quy định',
    shortTitle: 'Chấp hành quy định',
    ruleBadge: 'Điều kiện bắt buộc',
    ruleHelper: '100% sinh viên không vi phạm pháp luật, quy chế, nội quy của Nhà trường, nơi cư trú và cộng đồng.',
    thresholdHelper: 'Không vi phạm',
  },
};

/**
 * Data Origin for OCR-Ready records (Section 34)
 */
export type DataOrigin = 'MANUAL' | 'IMPORTED' | 'AI_EXTRACTED' | 'HUMAN_CONFIRMED';

export interface StructuredMemberRecord {
  id: string;
  fullName: string;
  studentCode: string;
  className?: string;
  isParticipatingMovement: boolean;
  isSchoolSv5tRecognized: boolean;
  recognitionDecisionNumber?: string;
  dataOrigin: DataOrigin;
  notes?: string;
}

export type SchoolRecognitionStatus =
  | 'recognized'       // Đã có kết quả công nhận
  | 'not_recognized'   // Chưa có kết quả công nhận
  | 'clarifying';      // Chưa xác định / cần làm rõ

export interface CollectiveTT01Data {
  isRecognizedSchoolLevel: boolean;
  recognitionStatus?: SchoolRecognitionStatus;
  recognizedCollectiveName?: string;
  recognizedAcademicYear: string;
  issuingUnitName: string;
  decisionNumber: string;
  decisionDate: string;
  referenceNotes?: string;
  evidenceFiles: ApplicationEvidence[];
}

export interface CollectiveTT02Data {
  /** Shared denominator for TT02 and TT03 */
  totalMembers: number;
  participatingCount: number;
  censusDate: string;
  notes?: string;
  evidenceFiles: ApplicationEvidence[];
  structuredMembers: StructuredMemberRecord[];
}

export interface CollectiveTT03Data {
  /** Reuses totalMembers from TT02 as canonical denominator */
  recognizedCount: number;
  recognizedAcademicYear: string;
  issuingInstitutionName: string;
  recognitionSource?: string;
  notes?: string;
  evidenceFiles: ApplicationEvidence[];
  structuredRecognizedMembers: StructuredMemberRecord[];
}

export type ViolationConfirmationStatus =
  | 'no_violations'       // Không ghi nhận sinh viên vi phạm trong phạm vi xét
  | 'has_violations'      // Có thông tin vi phạm / chưa thể xác nhận điều kiện
  | 'needs_clarification'; // Cần làm rõ thêm

export interface CollectiveTT04Data {
  noViolationsConfirmed: boolean;
  violationStatus?: ViolationConfirmationStatus;
  confirmingUnitName: string;
  confirmationDate: string;
  scopeYear: string;
  confirmationDocNumber?: string;
  notes?: string;
  evidenceFiles: ApplicationEvidence[];
}

export type CollectiveWorkflowStatus =
  | 'draft'                             // Đang kê khai
  | 'submitted_for_unit_confirmation'   // (Legacy) Đã gửi đơn vị chờ xác nhận
  | 'returned_for_correction'           // (Legacy) Đơn vị trả về yêu cầu chỉnh sửa
  | 'unit_confirmed_and_forwarded'     // (Legacy) Đơn vị đã xác nhận & chuyển Thành phố
  | 'city_unassigned'                   // Đã nộp Thành phố (Chờ phân công)
  | 'city_assigned'                     // Đã phân công cán bộ Thành phố
  | 'city_in_review'                    // Cán bộ Thành phố đang xét
  | 'city_under_review'                 // Cán bộ Thành phố đang xét
  | 'city_supplement_pending'           // Thành phố yêu cầu bổ sung (chờ tập thể)
  | 'city_supplement_requested'         // Thành phố yêu cầu bổ sung
  | 'city_supplement_returned'          // Tập thể đã gửi bổ sung
  | 'city_review_completed'             // Cán bộ Thành phố hoàn tất xét 4 tiêu chí
  | 'committee_pending'                 // Chờ Hội đồng Thành phố kết luận
  | 'finalized'                         // Hội đồng đã kết luận
  | 'published';                        // Đã công bố kết quả chính thức

export const COLLECTIVE_STATUS_LABELS: Record<string, string> = {
  draft: 'Đang kê khai',
  city_unassigned: 'Tiếp nhận · Chờ phân công',
  city_assigned: 'Đã phân công cán bộ',
  city_in_review: 'Đang thẩm định',
  city_under_review: 'Đang thẩm định',
  city_supplement_pending: 'Chờ bổ sung minh chứng',
  city_supplement_requested: 'Chờ bổ sung minh chứng',
  city_supplement_returned: 'Đã nộp bổ sung',
  city_review_completed: 'Hoàn tất thẩm định Cán bộ',
  committee_pending: 'Hội đồng đang xem xét',
  finalized: 'Đã hoàn tất kết luận',
  published: 'Đã công bố kết quả',
};

/**
 * Danh mục các tổ chức tập thể được cấp thẩm quyền kê khai (Prompt S4.8.2 Section 10)
 */
export interface RegisteredCollectiveEntity {
  id: string;
  name: string;
  type: CollectiveType;
  institutionId: string;
  institutionName: string;
  schoolReviewUnitId: SchoolReviewUnitId;
  schoolReviewUnitName: string;
  facultyName: string;
  defaultContactPhone: string;
  authorizedPreparerEmail: string;
  authorizedPreparerName: string;
}

export const AUTHORIZED_COLLECTIVE_REGISTRY: RegisteredCollectiveEntity[] = [
  {
    id: 'col-dut-21tclc-dt1',
    name: 'Chi hội 21TCLC_DT1',
    type: 'CHI_HOI',
    institutionId: 'inst-dut',
    institutionName: 'Trường Đại học Bách khoa - Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    facultyName: 'Khoa Điện tử - Viễn thông',
    defaultContactPhone: '0905 123 456',
    authorizedPreparerEmail: 'mai.nt@dut.udn.vn',
    authorizedPreparerName: 'Nguyễn Thị Mai',
  },
  {
    id: 'col-dut-22tclc-ktpm',
    name: 'Chi hội 22TCLC_KTPM',
    type: 'CHI_HOI',
    institutionId: 'inst-dut',
    institutionName: 'Trường Đại học Bách khoa - Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    facultyName: 'Khoa Công nghệ Thông tin',
    defaultContactPhone: '0905 654 321',
    authorizedPreparerEmail: 'mai.nt@dut.udn.vn',
    authorizedPreparerName: 'Nguyễn Thị Mai',
  },
  {
    id: 'col-dut-lch-dtvt',
    name: 'Liên chi hội Khoa Điện tử - Viễn thông',
    type: 'LIEN_CHI_HOI',
    institutionId: 'inst-dut',
    institutionName: 'Trường Đại học Bách khoa - Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    facultyName: 'Khoa Điện tử - Viễn thông',
    defaultContactPhone: '0905 123 456',
    authorizedPreparerEmail: 'mai.nt@dut.udn.vn',
    authorizedPreparerName: 'Nguyễn Thị Mai',
  },
  {
    id: 'col-ute-21kmt',
    name: 'Chi đoàn 21KMT',
    type: 'CHI_DOAN',
    institutionId: 'inst-ute',
    institutionName: 'Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    facultyName: 'Khoa Kỹ thuật Máy tính',
    defaultContactPhone: '0912 345 678',
    authorizedPreparerEmail: 'mai.nt@dut.udn.vn',
    authorizedPreparerName: 'Nguyễn Thị Mai',
  },
  {
    id: 'col-due-lch-qtkd',
    name: 'Liên chi hội Khoa Quản trị Kinh doanh',
    type: 'LIEN_CHI_HOI',
    institutionId: 'inst-due',
    institutionName: 'Trường Đại học Kinh tế - Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    facultyName: 'Khoa Quản trị Kinh doanh',
    defaultContactPhone: '0905 223 344',
    authorizedPreparerEmail: 'hung.lv@due.udn.vn',
    authorizedPreparerName: 'Lê Văn Hùng',
  },
  {
    id: 'col-ued-22st',
    name: 'Chi hội Sư phạm Toán 22ST',
    type: 'CHI_HOI',
    institutionId: 'inst-ued',
    institutionName: 'Trường Đại học Sư phạm - Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    facultyName: 'Khoa Toán',
    defaultContactPhone: '0905 334 455',
    authorizedPreparerEmail: 'thao.np@ued.udn.vn',
    authorizedPreparerName: 'Nguyễn Phương Thảo',
  },
  {
    id: 'col-ufl-lch-ta',
    name: 'Liên chi hội Khoa Tiếng Anh',
    type: 'LIEN_CHI_HOI',
    institutionId: 'inst-ufl',
    institutionName: 'Trường Đại học Ngoại ngữ - Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    facultyName: 'Khoa Tiếng Anh',
    defaultContactPhone: '0905 445 566',
    authorizedPreparerEmail: 'linh.nk@ufl.udn.vn',
    authorizedPreparerName: 'Nguyễn Khánh Linh',
  },
  {
    id: 'col-ute-lch-cn',
    name: 'Liên chi hội Khoa Cơ khí',
    type: 'LIEN_CHI_HOI',
    institutionId: 'inst-ute',
    institutionName: 'Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    facultyName: 'Khoa Cơ khí',
    defaultContactPhone: '0905 556 677',
    authorizedPreparerEmail: 'nam.ph@ute.udn.vn',
    authorizedPreparerName: 'Phạm Hoài Nam',
  },
  {
    id: 'col-vku-lch-khmt',
    name: 'Liên chi hội Khoa Khoa học Máy tính',
    type: 'LIEN_CHI_HOI',
    institutionId: 'inst-vku',
    institutionName: 'Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn - Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    facultyName: 'Khoa Khoa học Máy tính',
    defaultContactPhone: '0905 667 788',
    authorizedPreparerEmail: 'khang.dn@vku.udn.vn',
    authorizedPreparerName: 'Đinh Nguyên Khang',
  },
  {
    id: 'col-smp-lch-yk',
    name: 'Liên chi hội Y khoa',
    type: 'LIEN_CHI_HOI',
    institutionId: 'inst-smp',
    institutionName: 'Trường Y Dược - Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    facultyName: 'Khoa Y',
    defaultContactPhone: '0905 778 899',
    authorizedPreparerEmail: 'vy.lt@smp.udn.vn',
    authorizedPreparerName: 'Lê Thảo Vy',
  },
  {
    id: 'col-vnuk-lch',
    name: 'Liên chi hội Viện Nghiên cứu và Đào tạo Việt - Anh',
    type: 'LIEN_CHI_HOI',
    institutionId: 'inst-vnuk',
    institutionName: 'Viện Nghiên cứu và Đào tạo Việt - Anh - Đại học Đà Nẵng',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    facultyName: 'Khối Đào tạo Quốc tế',
    defaultContactPhone: '0905 889 900',
    authorizedPreparerEmail: 'khoa.nm@vnuk.udn.vn',
    authorizedPreparerName: 'Nguyễn Minh Khoa',
  },
  {
    id: 'col-dtu-lcd-dtqt',
    name: 'Liên chi đoàn Viện Đào tạo Quốc tế',
    type: 'LIEN_CHI_DOAN',
    institutionId: 'inst-dtu',
    institutionName: 'Đại học Duy Tân',
    schoolReviewUnitId: 'unit-dtu',
    schoolReviewUnitName: 'Trường Đại học Duy Tân',
    facultyName: 'Viện Đào tạo Quốc tế',
    defaultContactPhone: '0905 990 011',
    authorizedPreparerEmail: 'long.vh@dtu.edu.vn',
    authorizedPreparerName: 'Võ Hoàng Long',
  },
  {
    id: 'col-donga-lch-qtdl',
    name: 'Liên chi hội Khoa Quản trị Du lịch',
    type: 'LIEN_CHI_HOI',
    institutionId: 'inst-donga',
    institutionName: 'Trường Đại học Đông Á',
    schoolReviewUnitId: 'unit-donga',
    schoolReviewUnitName: 'Trường Đại học Đông Á',
    facultyName: 'Khoa Du lịch',
    defaultContactPhone: '0905 101 202',
    authorizedPreparerEmail: 'trang.lth@donga.edu.vn',
    authorizedPreparerName: 'Lê Thị Huyền Trang',
  },
  {
    id: 'col-dau-lch-kt',
    name: 'Liên chi hội Khoa Kiến trúc',
    type: 'LIEN_CHI_HOI',
    institutionId: 'inst-dau',
    institutionName: 'Trường Đại học Kiến trúc Đà Nẵng',
    schoolReviewUnitId: 'unit-dau',
    schoolReviewUnitName: 'Trường Đại học Kiến trúc Đà Nẵng',
    facultyName: 'Khoa Kiến trúc',
    defaultContactPhone: '0905 202 303',
    authorizedPreparerEmail: 'minh.tqh@dau.edu.vn',
    authorizedPreparerName: 'Trần Quốc Hoàng Minh',
  },
  {
    id: 'col-upes3-lcd-gdtc',
    name: 'Liên chi đoàn Khoa Giáo dục Thể chất',
    type: 'LIEN_CHI_DOAN',
    institutionId: 'inst-upes3',
    institutionName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    schoolReviewUnitId: 'unit-upes3',
    schoolReviewUnitName: 'Trường Đại học Thể dục Thể thao Đà Nẵng',
    facultyName: 'Khoa Giáo dục Thể chất',
    defaultContactPhone: '0905 303 404',
    authorizedPreparerEmail: 'tuan.nq@upes3.edu.vn',
    authorizedPreparerName: 'Nguyễn Quốc Tuấn',
  },
  {
    id: 'col-tyd-lch-dd',
    name: 'Liên chi hội Khoa Điều dưỡng',
    type: 'LIEN_CHI_HOI',
    institutionId: 'inst-tyd',
    institutionName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    schoolReviewUnitId: 'unit-tyd',
    schoolReviewUnitName: 'Trường Đại học Kỹ thuật Y - Dược Đà Nẵng',
    facultyName: 'Khoa Điều dưỡng',
    defaultContactPhone: '0905 404 505',
    authorizedPreparerEmail: 'truc.htt@dhktyduocdn.edu.vn',
    authorizedPreparerName: 'Huỳnh Thị Thanh Trúc',
  },
  {
    id: 'col-fpt-clb-fcode',
    name: 'CLB Kỹ thuật Phần mềm F-Code',
    type: 'club_team_group',
    institutionId: 'inst-fpt',
    institutionName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    schoolReviewUnitId: 'unit-fpt',
    schoolReviewUnitName: 'Trường Đại học FPT phân hiệu Đà Nẵng',
    facultyName: 'Khối Kỹ thuật Phần mềm',
    defaultContactPhone: '0905 505 606',
    authorizedPreparerEmail: 'vy.ntt@fpt.edu.vn',
    authorizedPreparerName: 'Nguyễn Trần Thảo Vy',
  },
];

export type CityRequirementJudgment =
  | 'not_reviewed'       // Chưa xét
  | 'reviewing'          // Đang xét
  | 'suitable'           // Phù hợp
  | 'needs_supplement'   // Cần bổ sung
  | 'unsuitable'         // Không phù hợp
  | 'needs_consideration' // Cần xem xét thêm
  | 'passed'
  | 'failed';

export type CityEvidenceJudgment =
  | 'not_reviewed'       // Chưa kiểm tra
  | 'suitable'           // Phù hợp
  | 'needs_supplement'   // Cần bổ sung
  | 'unsuitable'         // Không phù hợp
  | 'needs_consideration' // Cần xem xét thêm
  | 'valid'
  | 'invalid';

export interface CityRequirementReviewRecord {
  requirementId: CollectiveRequirementId;
  judgment: CityRequirementJudgment;
  officerNotes?: string;
  notes?: string;
  officerName?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  history?: {
    judgment: CityRequirementJudgment;
    officerNotes?: string;
    reviewedAt: string;
    reviewedBy: string;
  }[];
}

export interface CityEvidenceReviewRecord {
  evidenceId: string;
  requirementId?: CollectiveRequirementId;
  status: CityEvidenceJudgment | 'valid' | 'invalid' | 'needs_supplement' | 'pending';
  officerNotes?: string;
  officerName?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  history?: {
    status: CityEvidenceJudgment | string;
    officerNotes?: string;
    reviewedAt: string;
    reviewedBy: string;
  }[];
}

export interface InstitutionalSignOffRecord {
  confirmedByUserId: string;
  confirmedByUserName: string;
  confirmedAt: string;
  schoolReviewUnitId: SchoolReviewUnitId;
  schoolReviewUnitName: string;
  institutionId: string;
  institutionName: string;
  signOffNote?: string;
  forwardingDestination: string; // 'Hội Sinh viên Việt Nam TP. Đà Nẵng'
}

export interface CollectiveCorrectionRequestRecord {
  returnedByUserId: string;
  returnedByUserName: string;
  returnedAt: string;
  reason: string;
}

export type CollectiveSupplementScopeType = 'REQUIREMENT' | 'DECLARATION' | 'EVIDENCE';

export type CollectiveSupplementAction =
  | 'editDeclaration'
  | 'addEvidence'
  | 'replaceEvidence'
  | 'addExplanation';

export interface DeclarationRevisionRecord {
  field: string;
  fieldLabel: string;
  originalValue: any;
  newValue: any;
  updatedAt: string;
  updatedBy: string;
}

export interface CollectiveSupplementDraft {
  savedAt: string;
  notes: string;
  declarationChanges?: Record<string, any>;
  draftEvidenceFiles?: ApplicationEvidence[];
}

export interface CollectiveSupplementRequestRecord {
  id: string;
  requirementId: CollectiveRequirementId;
  scopeType?: CollectiveSupplementScopeType;
  targetDeclarationField?: string;
  targetEvidenceId?: string;
  targetEvidenceName?: string;
  allowedActions: CollectiveSupplementAction[];
  targetUserEmail: string;
  targetUserName: string;
  requestedByOfficerId: string;
  requestedByOfficerName: string;
  requestedAt: string;
  deadline?: string;
  reason: string;
  status: 'pending' | 'in_progress' | 'returned' | 'resolved' | 'cancelled';
  parentRequestId?: string;
  returnedAt?: string;
  returnedNotes?: string;
  returnedEvidenceFiles?: ApplicationEvidence[];
  declarationRevisions?: DeclarationRevisionRecord[];
  draftResponse?: CollectiveSupplementDraft;
  resolvedAt?: string;
  resolvedByOfficerId?: string;
  resolvedByOfficerName?: string;
  resolutionNotes?: string;
}

export interface CollectiveFinalResultRecord {
  applicationId?: string;
  collectiveId?: string;
  collectiveName?: string;
  institutionName?: string;
  academicYear?: string;
  outcome: 'recognized' | 'not_recognized';
  awardTitle?: string; // "Tập thể Sinh viên 5 tốt cấp Thành phố"
  decisionNumber?: string;
  decisionDate?: string;
  signedBy?: string; // "TM. BAN THƯ KÝ - CHỦ TỊCH HỘI SINH VIÊN TP. ĐÀ NẴNG"
  isPublished?: boolean;
  publishedAt?: string;
  finalizedAt?: string;
}

export interface CollectiveApplication {
  id: string;
  applicationType: 'COLLECTIVE';
  collectiveId: string;
  collectiveName: string;
  collectiveType: CollectiveType;
  institutionId: string;
  institutionName: string;
  schoolReviewUnitId: SchoolReviewUnitId;
  schoolReviewUnitName: string;
  academicYear: string;
  preparedByUserId: string;
  preparedByUserName: string;
  preparedByUserEmail: string;
  contactPhone: string;
  facultyName: string;

  representative?: {
    fullName: string;
    studentCode?: string;
    position?: string;
    email?: string;
    phone?: string;
  };

  // Workflow & State
  status: CollectiveWorkflowStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  submittedDirectlyToCityAt?: string;
  submissionRevisionNumber?: number;

  // 4 Requirements Declarations
  tt01: CollectiveTT01Data;
  tt02: CollectiveTT02Data;
  tt03: CollectiveTT03Data;
  tt04: CollectiveTT04Data;

  // Pre-City Institutional Handover
  correctionHistory: CollectiveCorrectionRequestRecord[];
  institutionalSignOff?: InstitutionalSignOffRecord;

  // City Assignment & Review (Prompt S4.8.3)
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedAt?: string;
  assignedByManagerName?: string;
  assignmentNote?: string;
  assignmentHistory?: {
    id: string;
    officerId: string;
    officerName: string;
    assignedAt: string;
    assignedBy: string;
    note?: string;
    reassignmentReason?: string;
  }[];
  cityRequirementReviews: Record<CollectiveRequirementId, CityRequirementReviewRecord>;
  cityEvidenceReviews: Record<string, CityEvidenceReviewRecord>;
  cityReviewCompletedAt?: string;
  cityReviewSummaryNote?: string;

  // City Supplement Cycle
  supplementRequests: CollectiveSupplementRequestRecord[];

  // Committee & Publication
  committeeOutcome?: 'recognized' | 'not_recognized';
  committeeDecisionDate?: string;
  committeeDecidedAt?: string;
  committeeDecidedBy?: string;
  committeeNotes?: string;
  finalResult?: CollectiveFinalResultRecord;

  // Audit Events
  auditHistory: {
    id: string;
    action: string;
    actorName: string;
    actorRole: string;
    timestamp: string;
    details?: string;
  }[];
}
