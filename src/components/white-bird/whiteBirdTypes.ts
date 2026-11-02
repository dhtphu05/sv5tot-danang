/**
 * 5TOT Đại học Đà Nẵng — Giải thưởng "Cánh chim trắng" Domain Types
 * Căn cứ Quy chế Giải thưởng "Cánh chim trắng" ban hành kèm theo Quyết định số 14-QĐ/ĐHĐN-HSV ngày 04/10/2022
 * của Ban Thư ký Hội Sinh viên Việt Nam Đại học Đà Nẵng.
 * Cơ quan Thường trực Giải thưởng: Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng.
 */

import { ApplicationEvidence } from '../../demo/fixtures/studentApplication';

export type WhiteBirdEvidenceItem = ApplicationEvidence & {
  evidenceCategory?: WhiteBirdTruyenLuaEvidenceCategory;
  customCategoryLabel?: string;
  documentReference?: string;
  academicYear?: string;
  notes?: string;
};

export type WhiteBirdCategory = 'UOM_MAM' | 'TRUYEN_LUA' | 'SANG_TAO';

export type WhiteBirdNomineeType = 'INDIVIDUAL' | 'COLLECTIVE';

export type WhiteBirdRequirementId = 'WB01' | 'WB02' | 'WB03';

export type WhiteBirdRequirementJudgment =
  | 'not_reviewed'
  | 'approved'
  | 'needs_supplement'
  | 'rejected';

export type WhiteBirdApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'supplement_requested'
  | 'supplement_returned'
  | 'awaiting_committee'
  | 'recognized'
  | 'not_recognized';

export type WhiteBirdNominatingUnitType =
  | 'UV_BCH_HSV_DHDN'
  | 'BTK_HSV_TRUONG'
  | 'BCN_CLB_DHDN'
  | 'BCH_LIEN_CHI_HOI'
  | 'BCN_CLB_TRUONG'
  | 'BCN_CLB_DOI_NHOM';

export interface WhiteBirdDossierItem {
  code: string;
  title: string;
  isOptional?: boolean;
}

export interface WhiteBirdStandardItem {
  number: number;
  label: string;
  text: string;
}

export interface WhiteBirdCategoryMeta {
  code: WhiteBirdCategory;
  name: string;
  shortName: string;
  articleRef: string;
  allowedNomineeTypes: WhiteBirdNomineeType[];
  targetDescription: string;
  standardsArticleRef: string;
  standards: WhiteBirdStandardItem[];
  dossierArticleRef: string;
  dossierItems: WhiteBirdDossierItem[];
  dossierRequirementsSummary: string[];
  wb02Title: string;
  wb02CommitmentLabel: string;
  wb03Title: string;
}

export const WHITE_BIRD_CATEGORIES: Record<WhiteBirdCategory, WhiteBirdCategoryMeta> = {
  UOM_MAM: {
    code: 'UOM_MAM',
    name: 'Hạng mục “Cánh chim ươm mầm”',
    shortName: 'Cánh chim ươm mầm',
    articleRef: 'Điều 3; điểm a khoản 4.2 Điều 4; khoản 6.1 Điều 6',
    allowedNomineeTypes: ['INDIVIDUAL', 'COLLECTIVE'],
    targetDescription:
      'Cá nhân hoặc tập thể có mô hình, giải pháp, sáng kiến đã được áp dụng thành công trong công tác Hội và phong trào sinh viên các cấp.',
    standardsArticleRef: 'Điểm a khoản 4.2 Điều 4',
    standards: [
      {
        number: 1,
        label: 'Tính mới, sáng tạo',
        text: 'Mô hình, giải pháp, sáng kiến mới, không trùng với các hình thức tương tự đã được áp dụng trước ngày nộp hồ sơ.',
      },
      {
        number: 2,
        label: 'Tính hiệu quả',
        text: 'Được áp dụng thành công vào thực tiễn công tác Hội và phong trào sinh viên; được lãnh đạo địa phương, đơn vị cùng cấp ghi nhận; được sinh viên tích cực hưởng ứng.',
      },
      {
        number: 3,
        label: 'Tính lan tỏa',
        text: 'Có khả năng nghiên cứu triển khai trong phạm vi rộng hơn.',
      },
      {
        number: 4,
        label: 'Tính điển hình',
        text: 'Tiêu biểu so với các mô hình, giải pháp, sáng kiến cùng cấp, cùng nội dung và lĩnh vực.',
      },
    ],
    dossierArticleRef: 'Khoản 6.1 Điều 6',
    dossierItems: [
      {
        code: 'WB01',
        title: 'Văn bản đề nghị xét trao Giải thưởng của các tổ chức, cá nhân nêu tại Điều 5 của Quy chế.',
        isOptional: false,
      },
      {
        code: 'WB02',
        title: 'Báo cáo thuyết minh mô hình, giải pháp, sáng kiến có minh chứng về tính hiệu quả và lời cam kết về tính sáng tạo (theo mẫu gửi kèm).',
        isOptional: false,
      },
      {
        code: 'WB03',
        title: 'Hình ảnh, sản phẩm minh họa (nếu có).',
        isOptional: true,
      },
    ],
    dossierRequirementsSummary: [
      'WB01: Văn bản đề nghị xét trao Giải thưởng của các tổ chức, cá nhân nêu tại Điều 5 của Quy chế.',
      'WB02: Báo cáo thuyết minh mô hình, giải pháp, sáng kiến có minh chứng về tính hiệu quả và lời cam kết về tính sáng tạo (theo mẫu gửi kèm).',
      'WB03: Hình ảnh, sản phẩm minh họa (nếu có).',
    ],
    wb02Title: 'Báo cáo thuyết minh mô hình, giải pháp, sáng kiến & Cam kết tính sáng tạo',
    wb02CommitmentLabel:
      'Tôi/tập thể cam kết mô hình, giải pháp, sáng kiến kê khai trên đảm bảo tính sáng tạo, trung thực và đã được triển khai thực tế trong công tác Hội và phong trào sinh viên.',
    wb03Title: 'Hình ảnh, sản phẩm minh họa (nếu có)',
  },
  TRUYEN_LUA: {
    code: 'TRUYEN_LUA',
    name: 'Hạng mục “Cánh chim truyền lửa”',
    shortName: 'Cánh chim truyền lửa',
    articleRef: 'Điều 3; điểm c khoản 4.2 Điều 4; khoản 6.2 Điều 6',
    allowedNomineeTypes: ['INDIVIDUAL'],
    targetDescription:
      'Cá nhân có thành tích xuất sắc trong nhiều năm liền, đóng góp vào sự phát triển chung của công tác Hội và phong trào Hội Sinh viên Việt Nam Đại học Đà Nẵng.',
    standardsArticleRef: 'Điểm c khoản 4.2 Điều 4',
    standards: [
      {
        number: 1,
        label: 'Chức vụ cán bộ Hội (đơn vị có cơ sở Hội)',
        text: 'Đối với đơn vị có tổ chức cơ sở Hội: Là cán bộ Hội từ chức vụ Chi Hội trưởng hoặc chức vụ cán bộ Hội tương đương trở lên.',
      },
      {
        number: 2,
        label: 'Chức vụ cán bộ Đoàn (đơn vị không có cơ sở Hội)',
        text: 'Đối với đơn vị không có tổ chức cơ sở Hội: Là cán bộ Đoàn từ chức vụ Bí thư Chi đoàn hoặc chức vụ cán bộ Đoàn tương đương trở lên.',
      },
      {
        number: 3,
        label: 'Thời gian công tác',
        text: 'Có thời gian công tác Đoàn – Hội ít nhất 2 năm.',
      },
      {
        number: 4,
        label: 'Thành tích xuất sắc 2 năm liên tục',
        text: 'Có thành tích xuất sắc trong công tác Hội và phong trào sinh viên cấp trường trở lên đối với đơn vị có tổ chức cơ sở Hội; hoặc trong công tác Đoàn và phong trào thanh niên cấp trường trở lên đối với đơn vị không có tổ chức cơ sở Hội, trong 2 năm liên tục.',
      },
    ],
    dossierArticleRef: 'Khoản 6.2 Điều 6',
    dossierItems: [
      {
        code: 'WB01',
        title: 'Văn bản đề nghị xét trao Giải thưởng của các tổ chức, cá nhân nêu tại Điều 5 của Quy chế.',
        isOptional: false,
      },
      {
        code: 'WB02',
        title: 'Báo cáo thành tích cá nhân (theo mẫu gửi kèm).',
        isOptional: false,
      },
      {
        code: 'WB03',
        title: 'Tài liệu minh chứng về thông tin chức vụ, bằng khen, giấy khen và thành tích tiêu biểu.',
        isOptional: false,
      },
    ],
    dossierRequirementsSummary: [
      'WB01: Văn bản đề nghị xét trao Giải thưởng của các tổ chức, cá nhân nêu tại Điều 5 của Quy chế.',
      'WB02: Báo cáo thành tích cá nhân (theo mẫu gửi kèm).',
      'WB03: Tài liệu minh chứng về thông tin chức vụ, bằng khen, giấy khen và thành tích tiêu biểu.',
    ],
    wb02Title: 'Báo cáo thành tích cá nhân theo mẫu',
    wb02CommitmentLabel:
      'Tôi cam kết toàn bộ quá trình rèn luyện, giữ chức vụ và thành tích đóng góp cho công tác Hội và phong trào sinh viên Đại học Đà Nẵng kê khai trên là hoàn toàn trung thực.',
    wb03Title: 'Tài liệu minh chứng thông tin chức vụ, thành tích',
  },
  SANG_TAO: {
    code: 'SANG_TAO',
    name: 'Hạng mục “Cánh chim sáng tạo”',
    shortName: 'Cánh chim sáng tạo',
    articleRef: 'Điều 3; điểm b khoản 4.2 Điều 4; khoản 6.3 Điều 6',
    allowedNomineeTypes: ['INDIVIDUAL', 'COLLECTIVE'],
    targetDescription:
      'Cá nhân hoặc tập thể có dự án khởi nghiệp đổi mới sáng tạo, đề tài nghiên cứu khoa học đạt giải từ cấp Đại học Đà Nẵng trở lên và có tính thiết thực, ứng dụng thực tế cao.',
    standardsArticleRef: 'Điểm b khoản 4.2 Điều 4',
    standards: [
      {
        number: 1,
        label: 'Tính mới và quyền tác giả',
        text: 'Là dự án, đề tài mới do chính cá nhân, tập thể đó đề xuất và thực hiện, không vi phạm quyền tác giả.',
      },
      {
        number: 2,
        label: 'Thành tích giải thưởng',
        text: 'Dự án, đề tài đã tham gia và đạt ít nhất 01 giải thưởng tại các cuộc thi từ cấp Đại học Đà Nẵng trở lên.',
      },
      {
        number: 3,
        label: 'Tính thiết thực và ứng dụng',
        text: 'Dự án, đề tài cần có tính thiết thực cao, có thể áp dụng đưa vào đời sống xã hội và phục vụ cộng đồng.',
      },
    ],
    dossierArticleRef: 'Khoản 6.3 Điều 6',
    dossierItems: [
      {
        code: 'WB01',
        title: 'Văn bản đề nghị xét trao Giải thưởng của các tổ chức, cá nhân nêu tại Điều 5 của Quy chế.',
        isOptional: false,
      },
      {
        code: 'WB02',
        title: 'Báo cáo thuyết minh dự án, đề tài nghiên cứu khoa học, khởi nghiệp có minh chứng về tính hiệu quả và lời cam kết về bản quyền (theo mẫu gửi kèm).',
        isOptional: false,
      },
      {
        code: 'WB03',
        title: 'Minh chứng đạt giải thưởng tại các cuộc thi liên quan.',
        isOptional: false,
      },
    ],
    dossierRequirementsSummary: [
      'WB01: Văn bản đề nghị xét trao Giải thưởng của các tổ chức, cá nhân nêu tại Điều 5 của Quy chế.',
      'WB02: Báo cáo thuyết minh dự án, đề tài nghiên cứu khoa học, khởi nghiệp có minh chứng về tính hiệu quả và lời cam kết về bản quyền (theo mẫu gửi kèm).',
      'WB03: Minh chứng đạt giải thưởng tại các cuộc thi liên quan.',
    ],
    wb02Title: 'Báo cáo thuyết minh dự án, đề tài NCKH, khởi nghiệp & Cam kết bản quyền',
    wb02CommitmentLabel:
      'Tôi/nhóm tác giả cam kết bản quyền đối với dự án khởi nghiệp đổi mới sáng tạo / đề tài nghiên cứu khoa học kê khai trên theo đúng quy định tại Khoản 3 Điều 6 Quy chế Giải thưởng.',
    wb03Title: 'Minh chứng đạt giải thưởng tại các cuộc thi liên quan',
  },
};

/**
 * Kiểm tra tính hợp lệ của trường URL tùy chọn (WB02 slide/video link, WB03 bài viết tra cứu kết quả).
 * - Rỗng hoặc khoảng trắng: Hợp lệ (cho phép để trống, không chặn nộp).
 * - Có nội dung: Bắt buộc phải là URL có giao thức http: hoặc https: hợp lệ.
 */
export function isValidOptionalHttpUrl(val?: string | null): boolean {
  if (!val || !val.trim()) return true;
  const trimmed = val.trim();
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const WHITE_BIRD_NOMINATING_UNIT_LABELS: Record<WhiteBirdNominatingUnitType, string> = {
  UV_BCH_HSV_DHDN: 'Ủy viên Ban Chấp hành Hội Sinh viên Việt Nam Đại học Đà Nẵng',
  BTK_HSV_TRUONG: 'Ban Thư ký Hội Sinh viên Việt Nam các Trường Đại học thành viên Đại học Đà Nẵng',
  BCN_CLB_DHDN: 'Ban Chủ nhiệm (hoặc tương đương) CLB/Đội/Nhóm trực thuộc Hội Sinh viên Việt Nam Đại học Đà Nẵng',
  BCH_LIEN_CHI_HOI: 'Ban Chấp hành Liên chi Hội',
  BCN_CLB_TRUONG: 'Ban Chủ nhiệm (hoặc tương đương) CLB/Đội/Nhóm trực thuộc Hội Sinh viên các Trường thành viên Đại học Đà Nẵng',
  BCN_CLB_DOI_NHOM: 'Ban Chủ nhiệm (hoặc tương đương) CLB/Đội/Nhóm trực thuộc Hội Sinh viên các Trường thành viên Đại học Đà Nẵng',
};

export interface WhiteBirdNominatingSubjectOption {
  value: WhiteBirdNominatingUnitType;
  label: string;
  category: 'Cá nhân' | 'Tổ chức';
  articleRef: string;
}

export const WHITE_BIRD_NOMINATING_SUBJECT_OPTIONS: WhiteBirdNominatingSubjectOption[] = [
  {
    value: 'UV_BCH_HSV_DHDN',
    label: 'Ủy viên Ban Chấp hành Hội Sinh viên Việt Nam Đại học Đà Nẵng',
    category: 'Cá nhân',
    articleRef: 'Điều 5 Quy chế',
  },
  {
    value: 'BTK_HSV_TRUONG',
    label: 'Ban Thư ký Hội Sinh viên Việt Nam các Trường Đại học thành viên Đại học Đà Nẵng',
    category: 'Tổ chức',
    articleRef: 'Điều 5 Quy chế',
  },
  {
    value: 'BCN_CLB_DHDN',
    label: 'Ban Chủ nhiệm (hoặc tương đương) CLB/Đội/Nhóm trực thuộc Hội Sinh viên Việt Nam Đại học Đà Nẵng',
    category: 'Tổ chức',
    articleRef: 'Điều 5 Quy chế',
  },
  {
    value: 'BCH_LIEN_CHI_HOI',
    label: 'Ban Chấp hành Liên chi Hội',
    category: 'Tổ chức',
    articleRef: 'Điều 5 Quy chế',
  },
  {
    value: 'BCN_CLB_TRUONG',
    label: 'Ban Chủ nhiệm (hoặc tương đương) CLB/Đội/Nhóm trực thuộc Hội Sinh viên các Trường thành viên Đại học Đà Nẵng',
    category: 'Tổ chức',
    articleRef: 'Điều 5 Quy chế',
  },
];

export interface WhiteBirdWB01Declaration {
  nominatingUnitType: WhiteBirdNominatingUnitType;
  nominatingUnitName: string;
  nominatingDocumentNumber: string;
  nominatingDate: string;
  nominatorSignerName: string;
  endorsementSummary: string;
  evidenceFiles: WhiteBirdEvidenceItem[];
}

export type WhiteBirdUnitHoiType = 'WITH_HOI' | 'WITHOUT_HOI';

export interface WhiteBirdOfficerTerm {
  id: string;
  position: string;
  unit: string;
  unitType: WhiteBirdUnitHoiType;
  startMonthYear: string; // MM/YYYY hoặc YYYY-MM
  endMonthYear: string; // MM/YYYY hoặc YYYY-MM hoặc "Hiện nay"
  isCurrent?: boolean;
  notes?: string;
}

export type WhiteBirdAnnualAwardLevel =
  | 'CO_SO'
  | 'TRUONG'
  | 'DHDN'
  | 'THANH_PHO'
  | 'TRUNG_UONG'
  | 'KHAC';

export const WHITE_BIRD_ANNUAL_AWARD_LEVEL_LABELS: Record<WhiteBirdAnnualAwardLevel, string> = {
  CO_SO: 'Cấp Cơ sở (Khoa / Liên chi Đoàn / Liên chi Hội)',
  TRUONG: 'Cấp Trường thành viên / Đơn vị trực thuộc ĐHĐN (hoặc tương đương)',
  DHDN: 'Cấp Đại học Đà Nẵng',
  THANH_PHO: 'Cấp Thành phố (Thành Đoàn / HSV TP)',
  TRUNG_UONG: 'Cấp Trung ương (TW Đoàn / TW HSV VN)',
  KHAC: 'Khác (ghi rõ)',
};

export interface WhiteBirdAnnualAchievement {
  id: string;
  academicYear: string; // VD: "2023–2024", "2024–2025"
  roleOrPosition: string;
  achievementSummary: string;
  awardLevel: WhiteBirdAnnualAwardLevel | string;
  documentReference?: string;
}

export interface WhiteBirdAcademicAndPriorityRecord {
  gpaText?: string;
  trainingScoreText?: string;
  sv5tRecognitions?: string;
  volunteerActivities?: string;
  scientificResearch?: string;
  otherAwards?: string;
}

export type WhiteBirdTruyenLuaEvidenceCategory =
  | 'CHUC_VU'
  | 'THANH_TICH_2_NAM'
  | 'HOC_TAP_REN_LUYEN'
  | 'UU_TIEN'
  | 'KHAC';

export const WHITE_BIRD_TRUYEN_LUA_CATEGORY_LABELS: Record<
  WhiteBirdTruyenLuaEvidenceCategory,
  string
> = {
  CHUC_VU: 'Quyết định / Xác nhận chức vụ & thời gian công tác',
  THANH_TICH_2_NAM: 'Thành tích xuất sắc 02 năm liên tục',
  HOC_TAP_REN_LUYEN: 'Bảng điểm học tập & Điểm rèn luyện',
  UU_TIEN: 'Minh chứng ưu tiên (SV5T, NCKH, Tình nguyện...)',
  KHAC: 'Tài liệu minh chứng khác',
};

export interface WhiteBirdWB02Declaration {
  reportTitle: string;
  implementationPeriod: string;
  contextAndObjectives: string;
  solutionAndExecution: string;
  impactAndResults: string;
  scalabilityAndSpread?: string;
  exemplaryNature?: string;
  leadRepresentative?: string;
  leadUnit?: string;
  leadPhone?: string;
  leadEmail?: string;
  presentationLink?: string;
  coAuthorsOrTeamMembers: string;
  commitmentConfirmed: boolean;
  evidenceFiles: WhiteBirdEvidenceItem[];

  // Hạng mục Cánh chim truyền lửa (TRUYEN_LUA)
  nomineeDateOfBirth?: string;
  nomineeGender?: 'NAM' | 'NU' | 'KHAC' | string;
  nomineeEthnicity?: string;
  nomineeReligion?: string;
  nomineeHometown?: string;
  nomineeYearOfStudy?: string;
  nomineePoliticalStatus?: 'DOAN_VIEN' | 'DANG_VIEN' | 'CHUA_KET_NAP' | string;
  nomineeCurrentRole?: string;
  nomineeFaculty?: string;
  nomineeClass?: string;
  nomineePhone?: string;
  nomineeEmail?: string;
  officerTerms?: WhiteBirdOfficerTerm[];
  annualAchievements?: WhiteBirdAnnualAchievement[];
  academicAndPriority?: WhiteBirdAcademicAndPriorityRecord;
}

export interface WhiteBirdWB03Declaration {
  awardOrRecognitionSummary: string;
  highestAwardLevel: string;
  decisionNumbersAndDates: string;
  mediaAndProductLinks: string;
  practicalApplicationNote: string;
  evidenceFiles: WhiteBirdEvidenceItem[];
}

/**
 * Phân tích chuỗi tháng/năm sang đối tượng { year, month } (1-12)
 */
export function parseMonthYear(val?: string | null): { year: number; month: number } | null {
  if (!val) return null;
  const trimmed = val.trim().toLowerCase();
  if (!trimmed) return null;

  if (
    trimmed === 'hiện nay' ||
    trimmed === 'hien nay' ||
    trimmed === 'nay' ||
    trimmed === 'present' ||
    trimmed === 'current'
  ) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }

  // Check YYYY-MM (e.g. 2023-09)
  const yyyyMm = /^(\d{4})[-/.](\d{1,2})$/.exec(trimmed);
  if (yyyyMm) {
    const year = parseInt(yyyyMm[1], 10);
    const month = parseInt(yyyyMm[2], 10);
    if (year >= 1990 && year <= 2050 && month >= 1 && month <= 12) {
      return { year, month };
    }
  }

  // Check MM/YYYY or M/YYYY (e.g. 09/2023, 9/2023)
  const mmYyyy = /^(\d{1,2})[-/.](\d{4})$/.exec(trimmed);
  if (mmYyyy) {
    const month = parseInt(mmYyyy[1], 10);
    const year = parseInt(mmYyyy[2], 10);
    if (year >= 1990 && year <= 2050 && month >= 1 && month <= 12) {
      return { year, month };
    }
  }

  // Check 4-digit year only (e.g. 2023)
  const yyyyOnly = /^(\d{4})$/.exec(trimmed);
  if (yyyyOnly) {
    const year = parseInt(yyyyOnly[1], 10);
    if (year >= 1990 && year <= 2050) {
      return { year, month: 1 };
    }
  }

  return null;
}

/**
 * Tính tổng thời gian công tác Đoàn - Hội từ danh sách các nhiệm kỳ,
 * tự động ghép khoảng thời gian chồng chéo để KHÔNG cộng trùng (Điểm c khoản 4.2 Điều 4).
 */
export function calculateOfficerServiceMonths(terms?: WhiteBirdOfficerTerm[]): {
  totalMonths: number;
  totalYearsText: string;
  mergedIntervalsCount: number;
  meetsTwoYearsRequirement: boolean;
  recommendation?: string;
} {
  if (!terms || terms.length === 0) {
    return {
      totalMonths: 0,
      totalYearsText: '0.0',
      mergedIntervalsCount: 0,
      meetsTwoYearsRequirement: false,
      recommendation:
        'Căn cứ Điểm c khoản 4.2 Điều 4 Quy chế: Yêu cầu có thời gian công tác Đoàn – Hội từ 02 năm trở lên. Vui lòng thêm các giai đoạn công tác để hệ thống tính toán.',
    };
  }

  interface MonthInterval {
    startMonthIndex: number;
    endMonthIndex: number;
  }

  const rawIntervals: MonthInterval[] = [];

  for (const term of terms) {
    const start = parseMonthYear(term.startMonthYear);
    if (!start) continue;

    let end = term.isCurrent ? parseMonthYear('hiện nay') : parseMonthYear(term.endMonthYear);
    if (!end) {
      end = parseMonthYear('hiện nay');
    }
    if (!end) continue;

    const startIdx = start.year * 12 + (start.month - 1);
    const endIdx = end.year * 12 + (end.month - 1);

    if (endIdx >= startIdx) {
      rawIntervals.push({ startMonthIndex: startIdx, endMonthIndex: endIdx });
    }
  }

  if (rawIntervals.length === 0) {
    return {
      totalMonths: 0,
      totalYearsText: '0.0',
      mergedIntervalsCount: 0,
      meetsTwoYearsRequirement: false,
      recommendation:
        'Vui lòng nhập định dạng tháng/năm hợp lệ (VD: 09/2023 hoặc 2023-09) để tính tổng thời gian công tác.',
    };
  }

  rawIntervals.sort((a, b) => a.startMonthIndex - b.startMonthIndex);

  const merged: MonthInterval[] = [];
  let current = { ...rawIntervals[0] };

  for (let i = 1; i < rawIntervals.length; i++) {
    const next = rawIntervals[i];
    if (next.startMonthIndex <= current.endMonthIndex + 1) {
      current.endMonthIndex = Math.max(current.endMonthIndex, next.endMonthIndex);
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  merged.push(current);

  let totalMonths = 0;
  for (const iv of merged) {
    totalMonths += iv.endMonthIndex - iv.startMonthIndex + 1;
  }

  const totalYears = totalMonths / 12;
  const totalYearsText = totalYears.toFixed(1);
  const meetsTwoYearsRequirement = totalMonths >= 24;

  let recommendation: string | undefined;
  if (!meetsTwoYearsRequirement) {
    recommendation = `Lưu ý hỗ trợ thẩm định: Tổng thời gian công tác hợp lệ hiện tại là ${totalMonths} tháng (~${totalYearsText} năm). Quy chế yêu cầu thời gian công tác Đoàn – Hội từ 02 năm trở lên (24 tháng) không tính trùng lặp (Điểm c khoản 4.2 Điều 4). Hội đồng sẽ đối chiếu văn bản chuẩn y/công nhận khi xét duyệt.`;
  }

  return {
    totalMonths,
    totalYearsText,
    mergedIntervalsCount: merged.length,
    meetsTwoYearsRequirement,
    recommendation,
  };
}

/**
 * Kiểm tra thành tích xuất sắc trong 2 năm học liên tục tính đến thời điểm xét trao
 */
export function checkConsecutiveAnnualAchievements(
  achievements?: WhiteBirdAnnualAchievement[]
): {
  hasTwoConsecutiveYears: boolean;
  consecutiveYears: [string, string] | null;
  explanation: string;
} {
  if (!achievements || achievements.length === 0) {
    return {
      hasTwoConsecutiveYears: false,
      consecutiveYears: null,
      explanation:
        'Căn cứ Điểm c khoản 4.2 Điều 4 Quy chế: Cần có thành tích xuất sắc trong công tác Hội/Đoàn cấp trường trở lên trong 02 năm liên tục tính đến thời điểm xét trao.',
    };
  }

  if (achievements.length < 2) {
    return {
      hasTwoConsecutiveYears: false,
      consecutiveYears: null,
      explanation:
        'Cần kê khai thành tích xuất sắc trong ít nhất 2 năm học để kiểm tra tính liên tục theo Điểm c khoản 4.2 Điều 4.',
    };
  }

  const validEntries = achievements.filter(
    (a) => Boolean(a.achievementSummary?.trim()) && Boolean(a.academicYear?.trim())
  );

  if (validEntries.length < 2) {
    return {
      hasTwoConsecutiveYears: false,
      consecutiveYears: null,
      explanation:
        'Cần có ít nhất 2 năm học có kê khai nội dung thành tích xuất sắc trong công tác Hội hoặc công tác Đoàn.',
    };
  }

  const yearEntries: { startYear: number; originalLabel: string; item: WhiteBirdAnnualAchievement }[] = [];

  for (const entry of validEntries) {
    const match = /(\d{4})/g.exec(entry.academicYear);
    if (match) {
      const startYear = parseInt(match[1], 10);
      yearEntries.push({ startYear, originalLabel: entry.academicYear, item: entry });
    }
  }

  yearEntries.sort((a, b) => a.startYear - b.startYear);

  for (let i = 0; i < yearEntries.length - 1; i++) {
    for (let j = i + 1; j < yearEntries.length; j++) {
      if (yearEntries[j].startYear === yearEntries[i].startYear + 1) {
        return {
          hasTwoConsecutiveYears: true,
          consecutiveYears: [yearEntries[i].originalLabel, yearEntries[j].originalLabel],
          explanation: `Đã đáp ứng tiêu chuẩn thành tích 02 năm liên tục: ${yearEntries[i].originalLabel} và ${yearEntries[j].originalLabel} (Điểm c khoản 4.2 Điều 4).`,
        };
      }
    }
  }

  return {
    hasTwoConsecutiveYears: false,
    consecutiveYears: null,
    explanation:
      'Các năm học đã kê khai chưa đảm bảo tính liên tục (2 năm liền kề). Quy chế yêu cầu thành tích xuất sắc trong 2 năm liên tục tính đến thời điểm xét trao.',
  };
}

/**
 * Đánh giá chức vụ cán bộ theo Điểm c khoản 4.2 Điều 4:
 * - Đơn vị có cơ sở Hội: Từ Chi hội trưởng trở lên
 * - Đơn vị không có cơ sở Hội: Từ Bí thư Chi đoàn trở lên
 */
export function evaluateTruyenLuaPosition(terms?: WhiteBirdOfficerTerm[]): {
  hasEligiblePosition: boolean;
  eligiblePositionsCount: number;
  feedback: string;
} {
  if (!terms || terms.length === 0) {
    return {
      hasEligiblePosition: false,
      eligiblePositionsCount: 0,
      feedback:
        'Căn cứ Điểm c khoản 4.2 Điều 4 Quy chế: Tiêu chuẩn chức vụ từ Chi hội trưởng trở lên (đơn vị có Hội) hoặc từ Bí thư Chi đoàn trở lên (đơn vị không có Hội).',
    };
  }

  const hoiEligibleKeywords = [
    'chi hội trưởng',
    'chi hoi truong',
    'lch',
    'liên chi',
    'lien chi',
    'ủy viên bch',
    'uy vien bch',
    'phó chủ tịch',
    'pho chu tich',
    'chủ tịch',
    'chu tich',
    'trưởng ban',
    'truong ban',
    'phó trưởng ban',
    'pho truong ban',
    'chủ nhiệm',
    'chu nhiem',
    'đội trưởng',
    'doi truong',
    'bch',
  ];

  const doanEligibleKeywords = [
    'bí thư',
    'bi thu',
    'phó bí thư',
    'pho bi thu',
    'ủy viên bch',
    'uy vien bch',
    'đoàn khoa',
    'doan khoa',
    'đoàn trường',
    'doan truong',
    'bch',
  ];

  let eligibleCount = 0;
  for (const t of terms) {
    const pos = (t.position || '').toLowerCase();
    if (!pos.trim()) continue;

    if (t.unitType === 'WITHOUT_HOI') {
      if (doanEligibleKeywords.some((kw) => pos.includes(kw))) {
        eligibleCount++;
      }
    } else {
      if (
        hoiEligibleKeywords.some((kw) => pos.includes(kw)) ||
        doanEligibleKeywords.some((kw) => pos.includes(kw))
      ) {
        eligibleCount++;
      }
    }
  }

  if (eligibleCount > 0) {
    return {
      hasEligiblePosition: true,
      eligiblePositionsCount: eligibleCount,
      feedback: `Đã kê khai ${eligibleCount} chức vụ cán bộ Đoàn - Hội đáp ứng tiêu chuẩn tối thiểu theo Điểm c khoản 4.2 Điều 4.`,
    };
  }

  return {
    hasEligiblePosition: false,
    eligiblePositionsCount: 0,
    feedback:
      'Chức vụ đã kê khai có thể chưa đạt ngưỡng tối thiểu theo Quy chế (từ Chi hội trưởng/Bí thư Chi đoàn trở lên). Vui lòng đối chiếu với Điểm c khoản 4.2 Điều 4.',
  };
}

export interface WhiteBirdRequirementsMap {
  wb01: WhiteBirdWB01Declaration;
  wb02: WhiteBirdWB02Declaration;
  wb03: WhiteBirdWB03Declaration;
}

export interface WhiteBirdApplication {
  id: string;
  nominationTitle: string;
  category: WhiteBirdCategory;
  nomineeType: WhiteBirdNomineeType;
  nomineeName: string;
  studentId: string;
  institutionId: string;
  institutionName: string;
  schoolReviewUnitId: string;
  schoolReviewUnitName: string;
  facultyName: string;
  className: string;
  academicYear: string;
  contactPhone: string;
  preparedByUserId: string;
  preparedByUserName: string;
  preparedByUserEmail: string;
  status: WhiteBirdApplicationStatus;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  requirements: WhiteBirdRequirementsMap;
  wb01Judgment?: WhiteBirdRequirementJudgment;
  wb02Judgment?: WhiteBirdRequirementJudgment;
  wb03Judgment?: WhiteBirdRequirementJudgment;
  wb01ReviewerNote?: string;
  wb02ReviewerNote?: string;
  wb03ReviewerNote?: string;
  reviewedByOfficerName?: string;
  reviewedAt?: string;
  supplementRequestNote?: string;
  supplementRequestedAt?: string;
  supplementRespondedAt?: string;
  committeeSubmittedAt?: string;
  councilNote?: string;
  decisionNumber?: string;
  decisionDate?: string;
  decidedByName?: string;
}
