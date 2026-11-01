/**
 * 5TOT Đại học Đà Nẵng — Giải thưởng "Cánh chim trắng" Domain Types
 * Căn cứ Quy chế Giải thưởng "Cánh chim trắng" ban hành kèm theo Quyết định số 14-QĐ/ĐHĐN-HSV ngày 04/10/2022
 * của Ban Thư ký Hội Sinh viên Việt Nam Đại học Đà Nẵng.
 * Cơ quan Thường trực Giải thưởng: Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng.
 */

import { ApplicationEvidence } from '../../demo/fixtures/studentApplication';

export type WhiteBirdEvidenceItem = ApplicationEvidence;

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
    articleRef: 'Khoản 1 Điều 5',
  },
  {
    value: 'BTK_HSV_TRUONG',
    label: 'Ban Thư ký Hội Sinh viên Việt Nam các Trường Đại học thành viên Đại học Đà Nẵng',
    category: 'Tổ chức',
    articleRef: 'Khoản 2 Điều 5',
  },
  {
    value: 'BCN_CLB_DHDN',
    label: 'Ban Chủ nhiệm (hoặc tương đương) CLB/Đội/Nhóm trực thuộc Hội Sinh viên Việt Nam Đại học Đà Nẵng',
    category: 'Tổ chức',
    articleRef: 'Khoản 3 Điều 5',
  },
  {
    value: 'BCH_LIEN_CHI_HOI',
    label: 'Ban Chấp hành Liên chi Hội',
    category: 'Tổ chức',
    articleRef: 'Khoản 4 Điều 5',
  },
  {
    value: 'BCN_CLB_TRUONG',
    label: 'Ban Chủ nhiệm (hoặc tương đương) CLB/Đội/Nhóm trực thuộc Hội Sinh viên các Trường thành viên Đại học Đà Nẵng',
    category: 'Tổ chức',
    articleRef: 'Khoản 5 Điều 5',
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

export interface WhiteBirdWB02Declaration {
  reportTitle: string;
  implementationPeriod: string;
  contextAndObjectives: string;
  solutionAndExecution: string;
  impactAndResults: string;
  coAuthorsOrTeamMembers: string;
  commitmentConfirmed: boolean;
  evidenceFiles: WhiteBirdEvidenceItem[];
}

export interface WhiteBirdWB03Declaration {
  awardOrRecognitionSummary: string;
  highestAwardLevel: string;
  decisionNumbersAndDates: string;
  mediaAndProductLinks: string;
  practicalApplicationNote: string;
  evidenceFiles: WhiteBirdEvidenceItem[];
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
