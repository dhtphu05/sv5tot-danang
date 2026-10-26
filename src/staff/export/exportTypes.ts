import { StaffCapability } from "../types";

export type ReportPresetId =
  | "ALL_SUBMITTED_APPLICATIONS"
  | "UNASSIGNED_APPLICATIONS"
  | "UNDER_REVIEW_APPLICATIONS"
  | "SUPPLEMENT_WAITING"
  | "SUPPLEMENT_RETURNED"
  | "REVIEW_COMPLETED"
  | "COMMITTEE_ATTENTION"
  | "AWAITING_DECISION"
  | "DECIDED_RESULTS"
  | "RECOGNIZED_RESULTS"
  | "NOT_RECOGNIZED_RESULTS"
  | "BY_INSTITUTION"
  | "ASSIGNMENT_LIST"
  | "SUPPLEMENT_LIST"
  | "COLLECTIVE_ALL_APPLICATIONS"
  | "COLLECTIVE_RECOGNIZED_RESULTS"
  | "COLLECTIVE_DECIDED_RESULTS";

export type ExportFormat = "xlsx" | "csv" | "print";

export type ExportScopeType =
  | "filtered"
  | "selected"
  | "all_in_report";

export type ReportColumnKey =
  | "stt"
  | "studentName"
  | "studentCode"
  | "institutionName"
  | "applicationId"
  | "schoolYear"
  | "submittedAt"
  | "workflowStatusLabel"
  | "officerName"
  | "assignedAt"
  | "reviewProgressLabel"
  | "supplementStatusLabel"
  | "supplementCriterionLabel"
  | "decisionOutcomeLabel"
  | "decidedAt"
  | "publicationStatusLabel"
  | "collectiveName"
  | "collectiveTypeLabel"
  | "facultyName"
  | "representativeName"
  | "representativeRole"
  | "totalMembersCount"
  | "participatingMembersCount"
  | "recognizedMembersCount"
  | "cityReviewSummary"
  | "decisionNumber";

export interface ReportColumnDefinition {
  key: ReportColumnKey;
  label: string;
  excelWidth: number;
  isMandatory?: boolean;
  requiresResultPermission?: boolean;
  align?: "left" | "center" | "right";
}

export const REPORT_COLUMNS_CATALOG: Record<
  ReportColumnKey,
  ReportColumnDefinition
> = {
  stt: {
    key: 'stt',
    label: 'STT',
    excelWidth: 8,
    isMandatory: true,
    align: 'center',
  },
  studentName: {
    key: 'studentName',
    label: 'Họ và tên',
    excelWidth: 26,
    isMandatory: true,
  },
  studentCode: {
    key: 'studentCode',
    label: 'Mã số sinh viên',
    excelWidth: 16,
    isMandatory: true,
  },
  institutionName: {
    key: 'institutionName',
    label: 'Đơn vị đào tạo',
    excelWidth: 38,
    isMandatory: true,
  },
  applicationId: {
    key: 'applicationId',
    label: 'Mã hồ sơ',
    excelWidth: 22,
  },
  schoolYear: {
    key: 'schoolYear',
    label: 'Năm học',
    excelWidth: 16,
    align: 'center',
  },
  submittedAt: {
    key: 'submittedAt',
    label: 'Ngày nộp',
    excelWidth: 18,
    align: 'center',
  },
  workflowStatusLabel: {
    key: 'workflowStatusLabel',
    label: 'Trạng thái hồ sơ',
    excelWidth: 24,
  },
  officerName: {
    key: 'officerName',
    label: 'Cán bộ phụ trách',
    excelWidth: 22,
  },
  assignedAt: {
    key: 'assignedAt',
    label: 'Ngày phân công',
    excelWidth: 18,
    align: 'center',
  },
  reviewProgressLabel: {
    key: 'reviewProgressLabel',
    label: 'Tiến độ xét',
    excelWidth: 22,
    align: 'center',
  },
  supplementStatusLabel: {
    key: 'supplementStatusLabel',
    label: 'Trạng thái bổ sung',
    excelWidth: 24,
  },
  supplementCriterionLabel: {
    key: 'supplementCriterionLabel',
    label: 'Tiêu chí yêu cầu bổ sung',
    excelWidth: 24,
  },
  decisionOutcomeLabel: {
    key: 'decisionOutcomeLabel',
    label: 'Kết luận xét chọn',
    excelWidth: 36,
    requiresResultPermission: true,
  },
  decidedAt: {
    key: 'decidedAt',
    label: 'Ngày hoàn tất kết luận',
    excelWidth: 20,
    requiresResultPermission: true,
    align: 'center',
  },
  publicationStatusLabel: {
    key: 'publicationStatusLabel',
    label: 'Trạng thái công bố',
    excelWidth: 20,
    requiresResultPermission: true,
    align: 'center',
  },
  collectiveName: {
    key: 'collectiveName',
    label: 'Tên tập thể',
    excelWidth: 32,
    isMandatory: true,
  },
  collectiveTypeLabel: {
    key: 'collectiveTypeLabel',
    label: 'Loại tập thể',
    excelWidth: 22,
    isMandatory: true,
  },
  facultyName: {
    key: 'facultyName',
    label: 'Khoa / Ban',
    excelWidth: 26,
  },
  representativeName: {
    key: 'representativeName',
    label: 'Đại diện tập thể',
    excelWidth: 24,
  },
  representativeRole: {
    key: 'representativeRole',
    label: 'Chức vụ đại diện',
    excelWidth: 20,
  },
  totalMembersCount: {
    key: 'totalMembersCount',
    label: 'Sĩ số',
    excelWidth: 10,
    align: 'center',
  },
  participatingMembersCount: {
    key: 'participatingMembersCount',
    label: 'Tham gia phong trào (TT02)',
    excelWidth: 24,
    align: 'center',
  },
  recognizedMembersCount: {
    key: 'recognizedMembersCount',
    label: 'Đạt SV5T trường (TT03)',
    excelWidth: 24,
    align: 'center',
  },
  cityReviewSummary: {
    key: 'cityReviewSummary',
    label: 'Thẩm định Cán bộ TP',
    excelWidth: 26,
  },
  decisionNumber: {
    key: 'decisionNumber',
    label: 'Số quyết định công nhận',
    excelWidth: 24,
    requiresResultPermission: true,
  },
};



export interface ReportDefinition {
  id: ReportPresetId;
  label: string;
  shortLabel: string;
  description: string;
  fileSlug: string;
  requiredCapabilities: StaffCapability[];
  requiresUnpublishedResultAccess?: boolean;
  defaultColumns: ReportColumnKey[];
  optionalColumns: ReportColumnKey[];
  supportedFormats: ExportFormat[];
}

export interface FormattedReportRow {
  rowKey: string;
  applicationId: string;
  studentName: string;
  studentCode: string;
  institutionId: string;
  institutionName: string;
  schoolYear: string;
  submittedAt: string;
  workflowStatusLabel: string;
  officerName: string;
  assignedAt: string;
  reviewProgressLabel: string;
  supplementStatusLabel: string;
  supplementCriterionLabel: string;
  decisionOutcomeLabel: string;
  decidedAt: string;
  publicationStatusLabel: string;
  collectiveName?: string;
  collectiveTypeLabel?: string;
  facultyName?: string;
  representativeName?: string;
  representativeRole?: string;
  totalMembersCount?: string;
  participatingMembersCount?: string;
  recognizedMembersCount?: string;
  cityReviewSummary?: string;
  decisionNumber?: string;
}


export interface ExportAuditEvent {
  id: string;
  actorName: string;
  actorRoleLabel: string;
  reportLabel: string;
  scopeLabel: string;
  recordCount: number;
  format: ExportFormat;
  filename: string;
  timestamp: string;
}

// ============================================================================
// GENUINE OPENXML (.XLSX) & UTF-8 BOM (.CSV) FILE GENERATOR (Sections 66–71, 118)
// ============================================================================

