/**
 * 5TOT Đà Nẵng — Central Criteria & Requirement Group Definitions
 * Hội Sinh viên Việt Nam Thành phố Đà Nẵng — Niên khóa 2025–2026 (Áp dụng chính thức)
 * Single Source of Truth for Application Table, Regulation Inspector, School Review, City Review, and Committee.
 * Implements Prompt S4.6: Complete 5-Criteria Regulatory Compliance & Declaration Workflows.
 */

export type DeclarationMultiplicity = 'SINGLE' | 'MULTIPLE';
export type RequirementGroupType = 'ALL_REQUIRED' | 'AT_LEAST_N' | 'OPTIONAL' | 'REPEATABLE_COLLECTION';

/**
 * Canonical Resolution Rule:
 * if declarationMultiplicity === "SINGLE" -> SINGLE
 * otherwise -> MULTIPLE (safe default for all achievements, activities, certificates)
 */
export function resolveMultiplicity(multiplicity?: DeclarationMultiplicity | string): DeclarationMultiplicity {
  return multiplicity === 'SINGLE' ? 'SINGLE' : 'MULTIPLE';
}

export interface RequirementDefinition {
  id: string;
  code: string;
  criterionId: 'ethics' | 'academic' | 'physical' | 'volunteer' | 'integration';
  groupId: string;
  title: string;
  ruleBadge: string;
  ruleHelper?: string;
  declarationMultiplicity?: DeclarationMultiplicity;
  declarationLabel?: string;
  addActionLabel?: string;
  allowMultipleEvidence?: boolean;
  declarationMode?: 'single' | 'repeatable';
  allowMultipleDeclarations?: boolean;
  isOptionalEmpty?: boolean;
  fieldConfig?: {
    valueLabel: string;
    valuePlaceholder?: string;
    detailLabel?: string;
    detailPlaceholder?: string;
    dateLabel?: string;
  };
  regulationSnippet?: string;
}

export interface RequirementGroupDefinition {
  id: string;
  criterionId: 'ethics' | 'academic' | 'physical' | 'volunteer' | 'integration';
  title: string;
  groupType: RequirementGroupType;
  ruleBadge: string;
  ruleHelper?: string;
  minSelections: number;
  minApplicable?: number;
  requirements: RequirementDefinition[];
}

export interface CriterionDefinitionData {
  id: 'ethics' | 'academic' | 'physical' | 'volunteer' | 'integration';
  number: 1 | 2 | 3 | 4 | 5;
  name: string;
  vietnameseTitle: string;
  shortSummary: string;
  accentColor: string;
  accentSoft: string;
  bgTint: string;
  groups: RequirementGroupDefinition[];
}

export const CRITERIA_DEFINITIONS: Record<string, CriterionDefinitionData> = {
  // =========================================================================
  // TIÊU CHÍ 01: ĐẠO ĐỨC TỐT
  // Cấu trúc quy chuẩn: Nhóm A (Điểm rèn luyện) VÀ Nhóm B (Không vi phạm) VÀ Nhóm C (Ít nhất 1 trong 4 hình thức)
  // =========================================================================
  ethics: {
    id: 'ethics',
    number: 1,
    name: 'Đạo đức tốt',
    vietnameseTitle: 'Tiêu chí 1: Đạo đức tốt',
    shortSummary: 'Rèn luyện đạo đức, lối sống, chấp hành pháp luật và nội quy',
    accentColor: '#3182CE',
    accentSoft: 'rgba(49, 130, 206, 0.10)',
    bgTint: '#F2F7FC',
    groups: [
      {
        id: 'ethics-foundation',
        criterionId: 'ethics',
        title: 'Điểm rèn luyện và Chấp hành quy chế',
        groupType: 'ALL_REQUIRED',
        ruleBadge: 'Yêu cầu bắt buộc',
        ruleHelper: 'Bắt buộc đạt điểm rèn luyện và không vi phạm quy chế, pháp luật',
        minSelections: 2,
        minApplicable: 2,
        requirements: [
          {
            id: 'ethics-score',
            code: 'TC1.1',
            criterionId: 'ethics',
            groupId: 'ethics-foundation',
            title: 'Điểm rèn luyện cả năm học',
            ruleBadge: 'Yêu cầu bắt buộc',
            ruleHelper: 'Từ 80/100 điểm trở lên hoặc xếp loại Giỏi đối với cơ sở đào tạo đặc thù',
            declarationMultiplicity: 'SINGLE',
            declarationLabel: 'Điểm rèn luyện',
            addActionLabel: 'Kê khai điểm rèn luyện',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            fieldConfig: {
              valueLabel: 'Điểm rèn luyện / Xếp loại',
              valuePlaceholder: 'Ví dụ: 85 / 100 điểm hoặc Xếp loại Giỏi (đơn vị đặc thù)',
              detailLabel: 'Hình thức đánh giá & Đơn vị xác nhận',
              detailPlaceholder: 'Ví dụ: Phòng Công tác Sinh viên xác nhận năm học 2025–2026',
            },
            regulationSnippet: 'Điểm rèn luyện cả năm đạt từ 80/100 điểm trở lên. Đối với các đơn vị đào tạo đặc thù không áp dụng thang điểm 100 thì kết quả rèn luyện quy đổi phải đạt loại Giỏi.',
          },
          {
            id: 'ethics-law',
            code: 'TC1.2',
            criterionId: 'ethics',
            groupId: 'ethics-foundation',
            title: 'Không vi phạm pháp luật, quy chế, nội quy',
            ruleBadge: 'Yêu cầu bắt buộc',
            ruleHelper: 'Không vi phạm pháp luật, quy chế, nội quy nhà trường, quy định địa phương và cộng đồng',
            declarationMultiplicity: 'SINGLE',
            declarationLabel: 'Xác nhận chấp hành pháp luật & quy chế',
            addActionLabel: 'Kê khai xác nhận',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            fieldConfig: {
              valueLabel: 'Nội dung cam kết / xác nhận',
              valuePlaceholder: 'Ví dụ: Không vi phạm pháp luật, quy chế sinh viên và quy định địa phương',
              detailLabel: 'Đơn vị xác nhận & Ghi chú',
              detailPlaceholder: 'Ví dụ: Xác nhận của Ban cán sự lớp, Cố vấn học tập và Khoa',
            },
            regulationSnippet: 'Không vi phạm pháp luật, quy chế, nội quy của Nhà trường, quy định của địa phương và cộng đồng.',
          },
        ],
      },
      {
        id: 'ethics-supplement',
        criterionId: 'ethics',
        title: 'Tiêu chuẩn bổ sung (Đạt thêm ít nhất 1 trong 4 hình thức)',
        groupType: 'AT_LEAST_N',
        ruleBadge: 'Cần ít nhất 1 trong 4 hình thức',
        ruleHelper: 'Sinh viên đạt ít nhất một trong bốn hình thức; có thể kê khai nhiều hình thức nếu có thực tế',
        minSelections: 1,
        minApplicable: 1,
        requirements: [
          {
            id: 'ethics-party',
            code: 'TC1.3',
            criterionId: 'ethics',
            groupId: 'ethics-supplement',
            title: 'Là Đảng viên Đảng Cộng sản Việt Nam',
            ruleBadge: 'Hình thức 1',
            ruleHelper: 'Là Đảng viên chính thức hoặc Đảng viên dự bị',
            declarationMultiplicity: 'SINGLE',
            declarationLabel: 'Thông tin Đảng viên',
            addActionLabel: 'Kê khai thông tin Đảng viên',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            fieldConfig: {
              valueLabel: 'Trạng thái Đảng viên',
              valuePlaceholder: 'Ví dụ: Đảng viên chính thức (hoặc Đảng viên dự bị)',
              detailLabel: 'Chi bộ trực thuộc & Ngày kết nạp',
              detailPlaceholder: 'Ví dụ: Chi bộ Sinh viên 1, Đảng bộ Trường ĐH Bách khoa · Kết nạp ngày 03/02/2025',
            },
            regulationSnippet: 'Là Đảng viên Đảng Cộng sản Việt Nam (Đảng viên chính thức hoặc dự bị).',
          },
          {
            id: 'ethics-politics-team',
            code: 'TC1.4',
            criterionId: 'ethics',
            groupId: 'ethics-supplement',
            title: 'Thành viên đội thi tìm hiểu chủ nghĩa Mác–Lênin, tư tưởng Hồ Chí Minh',
            ruleBadge: 'Hình thức 2',
            ruleHelper: 'Thành viên chính thức đội thi từ cấp chi đoàn trở lên (không yêu cầu đạt giải)',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Đội thi Mác–Lênin, tư tưởng HCM',
            addActionLabel: 'Thêm đội thi Mác–Lênin',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên cuộc thi & Đội tuyển',
              valuePlaceholder: 'Ví dụ: Thành viên đội thi Hội thi Ánh sáng soi đường 2026',
              detailLabel: 'Cấp tổ chức & Đơn vị chủ trì',
              detailPlaceholder: 'Ví dụ: Cấp Đoàn trường / Thành Đoàn · Quyết định triệu tập số 12/QĐ-ĐTN',
            },
            regulationSnippet: 'Là thành viên chính thức đội tuyển tham gia các cuộc thi tìm hiểu chủ nghĩa Mác–Lênin, tư tưởng Hồ Chí Minh từ cấp chi đoàn trở lên (không yêu cầu đạt giải).',
          },
          {
            id: 'ethics-politics-paper',
            code: 'TC1.5',
            criterionId: 'ethics',
            groupId: 'ethics-supplement',
            title: 'Tham luận / bài viết tại diễn đàn học thuật về chủ nghĩa Mác–Lênin, tư tưởng HCM',
            ruleBadge: 'Hình thức 3',
            ruleHelper: 'Có bài viết hoặc tham luận được trình bày tại diễn đàn học thuật chính trị',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Tham luận / Bài viết Mác–Lênin',
            addActionLabel: 'Thêm bài viết / tham luận',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên tham luận / bài viết',
              valuePlaceholder: 'Ví dụ: Vận dụng tư tưởng Hồ Chí Minh về thanh niên trong kỷ nguyên số',
              detailLabel: 'Diễn đàn / Tọa đàm & Ngày trình bày',
              detailPlaceholder: 'Ví dụ: Tọa đàm khoa học Đảng bộ Trường ĐH Bách khoa, ngày 19/05/2026',
            },
            regulationSnippet: 'Có tham luận hoặc bài viết được trình bày tại diễn đàn học thuật về chủ nghĩa Mác–Lênin, tư tưởng Hồ Chí Minh.',
          },
          {
            id: 'ethics-commendation',
            code: 'TC1.6',
            criterionId: 'ethics',
            groupId: 'ethics-supplement',
            title: 'Thanh niên tiêu biểu, gương người tốt việc tốt, dũng cảm cứu người',
            ruleBadge: 'Hình thức 4',
            ruleHelper: 'Thanh niên tiêu biểu, thanh niên tiên tiến, gương người tốt việc tốt được biểu dương',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Khen thưởng / Biểu dương đạo đức',
            addActionLabel: 'Thêm khen thưởng / biểu dương',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Danh hiệu / Hình thức biểu dương',
              valuePlaceholder: 'Ví dụ: Gương Người tốt việc tốt cấp Trường / Thanh niên tiên tiến làm theo lời Bác',
              detailLabel: 'Cơ quan ghi nhận & Số quyết định',
              detailPlaceholder: 'Ví dụ: Đảng ủy & Đoàn trường khen thưởng · Quyết định số 42/QĐ-ĐTN',
            },
            regulationSnippet: 'Là thanh niên tiêu biểu, thanh niên tiên tiến, gương người tốt việc tốt, có hành động dũng cảm cứu người được ghi nhận, biểu dương các cấp.',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // TIÊU CHÍ 02: HỌC TẬP TỐT
  // Cấu trúc quy chuẩn: Nhóm A (GPA cả năm) VÀ Nhóm B (Ít nhất 1 trong 6 hình thức học thuật)
  // Thang điểm GPA: Đại học >= 3.2/4 hoặc >= 8.0/10; Cao đẳng >= 3.0/4 hoặc >= 7.5/10.
  // =========================================================================
  academic: {
    id: 'academic',
    number: 2,
    name: 'Học tập tốt',
    vietnameseTitle: 'Tiêu chí 2: Học tập tốt',
    shortSummary: 'Kết quả học tập, nghiên cứu khoa học và kỹ năng chuyên môn',
    accentColor: '#7C5CFC',
    accentSoft: 'rgba(124, 92, 252, 0.10)',
    bgTint: '#F6F3FE',
    groups: [
      {
        id: 'academic-foundation',
        criterionId: 'academic',
        title: 'Điểm trung bình học tập cả năm học',
        groupType: 'ALL_REQUIRED',
        ruleBadge: 'Yêu cầu bắt buộc',
        ruleHelper: 'Đại học: GPA >= 3.2/4 hoặc >= 8.0/10; Cao đẳng: GPA >= 3.0/4 hoặc >= 7.5/10',
        minSelections: 1,
        minApplicable: 1,
        requirements: [
          {
            id: 'academic-gpa',
            code: 'TC2.1',
            criterionId: 'academic',
            groupId: 'academic-foundation',
            title: 'Điểm trung bình học tập cả năm học (GPA)',
            ruleBadge: 'Yêu cầu bắt buộc',
            ruleHelper: 'Tính theo năm học xét chọn 2025–2026 (Đại học: >= 3.2/4 hoặc >= 8.0/10; Cao đẳng: >= 3.0/4 hoặc >= 7.5/10)',
            declarationMultiplicity: 'SINGLE',
            declarationLabel: 'Điểm trung bình năm học (GPA)',
            addActionLabel: 'Kê khai điểm GPA',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            fieldConfig: {
              valueLabel: 'Điểm trung bình năm học (GPA)',
              valuePlaceholder: 'Ví dụ: 3.45 / 4.00 (hệ tín chỉ) hoặc 8.2 / 10 (hệ niên chế)',
              detailLabel: 'Bậc đào tạo, Thang điểm & Xếp loại',
              detailPlaceholder: 'Ví dụ: Đại học · Thang điểm 4 · Năm học 2025–2026 · Xếp loại Giỏi',
            },
            regulationSnippet: 'Điểm trung bình chung học tập cả năm học đạt từ 3.2/4.0 hoặc 8.0/10 trở lên đối với sinh viên Đại học; từ 3.0/4.0 hoặc 7.5/10 trở lên đối với sinh viên Cao đẳng (tính riêng năm học xét chọn, không dùng GPA tích lũy toàn khóa).',
          },
        ],
      },
      {
        id: 'academic-achievements',
        criterionId: 'academic',
        title: 'Thành tích học thuật & Nghiên cứu khoa học (Đạt ít nhất 1 trong 6 hình thức)',
        groupType: 'AT_LEAST_N',
        ruleBadge: 'Cần ít nhất 1 trong 6 hình thức',
        ruleHelper: 'Sinh viên đạt ít nhất một trong sáu hình thức học thuật; có thể kê khai nhiều nội dung phù hợp',
        minSelections: 1,
        minApplicable: 1,
        requirements: [
          {
            id: 'academic-nckh',
            code: 'TC2.2',
            criterionId: 'academic',
            groupId: 'academic-achievements',
            title: 'Đề tài nghiên cứu khoa học sinh viên đạt giải cấp khoa trở lên',
            ruleBadge: 'Hình thức 1',
            ruleHelper: 'Đề tài NCKH sinh viên đạt giải từ cấp khoa trở lên (bắt buộc có giải)',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Đề tài NCKH đạt giải',
            addActionLabel: 'Thêm đề tài nghiên cứu',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên đề tài & Giải thưởng',
              valuePlaceholder: 'Ví dụ: Giải Nhì Hội nghị Sinh viên NCKH cấp Khoa CNTT năm 2026',
              detailLabel: 'Cấp tổ chức & Đơn vị chủ trì',
              detailPlaceholder: 'Ví dụ: Cấp Khoa CNTT · Quyết định khen thưởng số 15/QĐ-ĐHBK',
            },
            regulationSnippet: 'Có đề tài nghiên cứu khoa học sinh viên đạt giải từ cấp khoa trở lên.',
          },
          {
            id: 'academic-paper',
            code: 'TC2.3',
            criterionId: 'academic',
            groupId: 'academic-achievements',
            title: 'Bài viết đăng trên tạp chí chuyên ngành',
            ruleBadge: 'Hình thức 2',
            ruleHelper: 'Bài viết được đăng trên tạp chí chuyên ngành (không yêu cầu giải thưởng)',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Bài báo trên tạp chí chuyên ngành',
            addActionLabel: 'Thêm bài báo tạp chí',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên bài báo & Tạp chí',
              valuePlaceholder: 'Ví dụ: Bài báo khoa học đăng trên Tạp chí Khoa học & Công nghệ Đại học Đà Nẵng',
              detailLabel: 'Chỉ số ISSN/Scopus, Tập/Số & Ngày xuất bản',
              detailPlaceholder: 'Ví dụ: ISSN 1859-1531, Tập 24, Số 3/2026 · Tác giả chính',
            },
            regulationSnippet: 'Có bài viết được đăng trên tạp chí chuyên ngành trong nước hoặc quốc tế (không yêu cầu có giải thưởng).',
          },
          {
            id: 'academic-presentation',
            code: 'TC2.4',
            criterionId: 'academic',
            groupId: 'academic-achievements',
            title: 'Bài tham luận tham gia hội thảo khoa học từ cấp khoa trở lên',
            ruleBadge: 'Hình thức 3',
            ruleHelper: 'Tham luận khoa học được trình bày hoặc đăng kỷ yếu từ cấp khoa trở lên (không yêu cầu giải thưởng)',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Bài tham luận hội thảo',
            addActionLabel: 'Thêm bài tham luận',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên tham luận & Hội thảo',
              valuePlaceholder: 'Ví dụ: Tham luận tại Hội thảo Khoa học Quốc gia SOICT 2026',
              detailLabel: 'Cấp tổ chức & Chỉ số ISBN',
              detailPlaceholder: 'Ví dụ: Cấp Quốc gia · Kỷ yếu có chỉ số ISBN 978-604-67-2100-3',
            },
            regulationSnippet: 'Có bài tham luận tham gia hội thảo khoa học từ cấp khoa trở lên (không yêu cầu có giải thưởng).',
          },
          {
            id: 'academic-product',
            code: 'TC2.5',
            criterionId: 'academic',
            groupId: 'academic-achievements',
            title: 'Sản phẩm sáng tạo được cấp bằng sáng chế, giấy phép xuất bản, hoặc giải thưởng cấp trường',
            ruleBadge: 'Hình thức 4',
            ruleHelper: 'Sản phẩm sáng tạo có bằng sáng chế, giấy phép xuất bản hoặc đạt giải thưởng từ cấp trường trở lên',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Sản phẩm sáng tạo / Sáng chế',
            addActionLabel: 'Thêm sản phẩm sáng tạo',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên sản phẩm & Hình thức công nhận',
              valuePlaceholder: 'Ví dụ: Thiết bị hỗ trợ người khiếm thị tra cứu giảng đường · Cấp Bằng độc quyền sáng chế',
              detailLabel: 'Cơ quan cấp chứng nhận & Số hiệu',
              detailPlaceholder: 'Ví dụ: Cục Sở hữu trí tuệ cấp · Văn bằng số 34212/QĐ-SHTT',
            },
            regulationSnippet: 'Có sản phẩm sáng tạo được cấp bằng sáng chế, giấy phép xuất bản hoặc đạt giải thưởng từ cấp trường trở lên.',
          },
          {
            id: 'academic-team',
            code: 'TC2.6',
            criterionId: 'academic',
            groupId: 'academic-achievements',
            title: 'Thành viên các đội tuyển tham gia kỳ thi học thuật cấp trường trở lên',
            ruleBadge: 'Hình thức 5',
            ruleHelper: 'Là thành viên chính thức đội tuyển thi học thuật cấp trường trở lên (không yêu cầu đạt giải)',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Đội tuyển học thuật',
            addActionLabel: 'Thêm đội tuyển học thuật',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên đội tuyển & Kỳ thi',
              valuePlaceholder: 'Ví dụ: Đội tuyển Olympic Tin học Sinh viên Trường ĐH Bách khoa',
              detailLabel: 'Cấp tổ chức & Vai trò thành viên',
              detailPlaceholder: 'Ví dụ: Cấp Toàn quốc · Thành viên chính thức đội tuyển Olympic 2025–2026',
            },
            regulationSnippet: 'Là thành viên các đội tuyển tham gia các kỳ thi học thuật từ cấp trường trở lên (không yêu cầu có giải thưởng).',
          },
          {
            id: 'academic-innovation',
            code: 'TC2.7',
            criterionId: 'academic',
            groupId: 'academic-achievements',
            title: 'Giải thưởng cuộc thi ý tưởng sáng tạo từ cấp trường trở lên',
            ruleBadge: 'Hình thức 6',
            ruleHelper: 'Đạt giải thưởng cuộc thi ý tưởng sáng tạo, khởi nghiệp từ cấp trường trở lên (bắt buộc có giải)',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Giải thưởng sáng tạo',
            addActionLabel: 'Thêm giải thưởng sáng tạo',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên cuộc thi & Giải thưởng đạt được',
              valuePlaceholder: 'Ví dụ: Giải Nhất Cuộc thi Ý tưởng Khởi nghiệp Đổi mới sáng tạo 2026',
              detailLabel: 'Cấp tổ chức & Tên dự án',
              detailPlaceholder: 'Ví dụ: Cấp Trường ĐH Bách khoa · Dự án Hệ thống IoT nông nghiệp đô thị',
            },
            regulationSnippet: 'Đạt giải thưởng tại các cuộc thi ý tưởng sáng tạo từ cấp trường trở lên.',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // TIÊU CHÍ 03: THỂ LỰC TỐT
  // Cấu trúc quy chuẩn: Cần ít nhất 1 trong 2 hình thức (hoặc có cả hai):
  // 1. Danh hiệu "Thanh niên khỏe" (hoặc "Sinh viên khỏe") từ cấp trường trở lên
  // 2. Tham gia VÀ đạt giải tại hoạt động thể thao phong trào từ cấp khoa trở lên
  // =========================================================================
  physical: {
    id: 'physical',
    number: 3,
    name: 'Thể lực tốt',
    vietnameseTitle: 'Tiêu chí 3: Thể lực tốt',
    shortSummary: 'Tiêu chuẩn rèn luyện thể thao, chứng nhận thể lực sinh viên',
    accentColor: '#E99A18',
    accentSoft: 'rgba(233, 154, 24, 0.10)',
    bgTint: '#FEF9F0',
    groups: [
      {
        id: 'physical-forms',
        criterionId: 'physical',
        title: 'Hình thức xác nhận thể lực (Cần ít nhất 1 trong 2 hình thức)',
        groupType: 'AT_LEAST_N',
        ruleBadge: 'Cần ít nhất 1 trong 2 hình thức',
        ruleHelper: 'Sinh viên đạt ít nhất một trong hai hình thức; nếu có cả hai có thể kê khai đầy đủ cả hai để hội đồng thẩm định',
        minSelections: 1,
        minApplicable: 1,
        requirements: [
          {
            id: 'physical-khoe',
            code: 'TC3.1',
            criterionId: 'physical',
            groupId: 'physical-forms',
            title: 'Danh hiệu Thanh niên khỏe từ cấp trường trở lên',
            ruleBadge: 'Hình thức 1',
            ruleHelper: 'Đạt danh hiệu "Thanh niên khỏe" (hoặc "Sinh viên khỏe") do Hội Sinh viên hoặc Bộ môn GDTC cấp Trường chứng nhận',
            declarationMultiplicity: 'SINGLE',
            declarationLabel: 'Chứng nhận Thanh niên khỏe / Sinh viên khỏe',
            addActionLabel: 'Kê khai Thanh niên khỏe',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            fieldConfig: {
              valueLabel: 'Danh hiệu thể lực đạt được',
              valuePlaceholder: 'Ví dụ: Đạt danh hiệu Thanh niên khỏe (Sinh viên khỏe) cấp Trường năm học 2025–2026',
              detailLabel: 'Cấp chứng nhận & Đơn vị cấp',
              detailPlaceholder: 'Ví dụ: Hội Sinh viên phối hợp Bộ môn GDTC Trường ĐH Bách khoa cấp ngày 15/05/2026',
            },
            regulationSnippet: 'Đạt danh hiệu "Thanh niên khỏe" (hoặc "Sinh viên khỏe") từ cấp trường trở lên theo tiêu chuẩn đánh giá thể lực sinh viên.',
          },
          {
            id: 'physical-sport',
            code: 'TC3.2',
            criterionId: 'physical',
            groupId: 'physical-forms',
            title: 'Tham gia và đạt giải hoạt động thể thao phong trào từ cấp khoa trở lên',
            ruleBadge: 'Hình thức 2',
            ruleHelper: 'Tham gia VÀ đạt giải tại hoạt động thể thao phong trào từ cấp khoa trở lên (không yêu cầu thứ hạng cụ thể)',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Giải thưởng thể thao phong trào',
            addActionLabel: 'Thêm thành tích thể thao',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Giải đấu, Môn thể thao & Giải thưởng',
              valuePlaceholder: 'Ví dụ: Huy chương Bạc Môn bóng chuyền tại Hội thao Sinh viên cấp Trường 2026',
              detailLabel: 'Cấp tổ chức & Đơn vị chủ trì',
              detailPlaceholder: 'Ví dụ: Cấp Trường / Cấp Khoa · Đoàn trường phối hợp Hội Sinh viên tổ chức',
            },
            regulationSnippet: 'Tham gia VÀ đạt giải tại các hoạt động thể thao phong trào từ cấp khoa trở lên (chỉ tham gia chưa đủ điều kiện, bắt buộc phải đạt giải thưởng).',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // TIÊU CHÍ 04: TÌNH NGUYỆN TỐT
  // Cấu trúc quy chuẩn:
  // Nhóm A: Tham gia hoạt động tình nguyện tích lũy tối thiểu 05 ngày (hỗ trợ Mùa hè xanh, Chủ nhật xanh, Hiến máu 1 ngày quy đổi...)
  // Nhóm B: Khen thưởng hoạt động tình nguyện từ cấp khoa trở lên
  // =========================================================================
  volunteer: {
    id: 'volunteer',
    number: 4,
    name: 'Tình nguyện tốt',
    vietnameseTitle: 'Tiêu chí 4: Tình nguyện tốt',
    shortSummary: 'Hoạt động tình nguyện vì cộng đồng và phong trào Đoàn - Hội',
    accentColor: '#22A06B',
    accentSoft: 'rgba(34, 160, 107, 0.10)',
    bgTint: '#F0FAF5',
    groups: [
      {
        id: 'volunteer-activities-group',
        criterionId: 'volunteer',
        title: 'Hoạt động tình nguyện vì cộng đồng (Tích lũy tối thiểu 05 ngày)',
        groupType: 'REPEATABLE_COLLECTION',
        ruleBadge: 'Tích lũy tối thiểu 05 ngày',
        ruleHelper: 'Tham gia tích lũy tối thiểu 05 ngày tình nguyện trong năm học qua các chiến dịch, hoạt động cộng đồng hoặc hiến máu',
        minSelections: 1,
        minApplicable: 1,
        requirements: [
          {
            id: 'volunteer-activities',
            code: 'TC4.1',
            criterionId: 'volunteer',
            groupId: 'volunteer-activities-group',
            title: 'Hoạt động tình nguyện tích lũy',
            ruleBadge: 'Tích lũy >= 5 ngày',
            ruleHelper: 'Mùa hè xanh, Chủ nhật xanh, Tiếp sức mùa thi, Mái ấm, Hiến máu tình nguyện (mỗi lần hiến máu quy đổi 1 ngày)',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Hoạt động tình nguyện',
            addActionLabel: 'Thêm hoạt động tình nguyện',
            allowMultipleEvidence: true,
            declarationMode: 'repeatable',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên hoạt động tình nguyện',
              valuePlaceholder: 'Ví dụ: Chiến dịch tình nguyện Mùa hè xanh 2026 (hoặc Hiến máu tình nguyện đợt 1)',
              detailLabel: 'Số ngày tích lũy & Đơn vị tổ chức',
              detailPlaceholder: 'Ví dụ: 3 ngày · Xã Hòa Bắc, Huyện Hòa Vang · Đoàn trường ĐH Bách khoa',
            },
            regulationSnippet: 'Tham gia ít nhất 05 ngày tình nguyện trong năm học xét chọn, tích lũy qua các chiến dịch hoặc hoạt động cộng đồng (ví dụ quy chuẩn: 3 ngày mái ấm + 1 lần hiến máu + 1 ngày Chủ nhật xanh = 5 ngày).',
          },
        ],
      },
      {
        id: 'volunteer-award-group',
        criterionId: 'volunteer',
        title: 'Khen thưởng hoạt động tình nguyện',
        groupType: 'OPTIONAL',
        ruleBadge: 'Hình thức khen thưởng',
        ruleHelper: 'Được khen thưởng về hoạt động tình nguyện từ cấp khoa trở lên trong năm học',
        minSelections: 0,
        minApplicable: 0,
        requirements: [
          {
            id: 'volunteer-award',
            code: 'TC4.2',
            criterionId: 'volunteer',
            groupId: 'volunteer-award-group',
            title: 'Khen thưởng hoạt động tình nguyện từ cấp khoa trở lên',
            ruleBadge: 'Khen thưởng cấp khoa trở lên',
            ruleHelper: 'Giấy khen, bằng khen về hoạt động tình nguyện từ cấp khoa trở lên',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Khen thưởng tình nguyện',
            addActionLabel: 'Thêm khen thưởng tình nguyện',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên khen thưởng & Hoạt động liên quan',
              valuePlaceholder: 'Ví dụ: Giấy khen Thành tích xuất sắc trong Chiến dịch Mùa hè xanh 2026',
              detailLabel: 'Cấp khen thưởng & Đơn vị trao tặng',
              detailPlaceholder: 'Ví dụ: Cấp Đoàn trường ĐH Bách khoa · Quyết định số 56/QĐ-ĐTN',
            },
            regulationSnippet: 'Được khen thưởng về hoạt động tình nguyện từ cấp khoa trở lên.',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // TIÊU CHÍ 05: HỘI NHẬP TỐT
  // Cấu trúc quy chuẩn: CẢ NHÓM A VÀ NHÓM B ĐỀU BẮT BUỘC ĐẠT CHUẨN
  // Nhóm A: Kỹ năng hoặc Công tác Đoàn/Hội (Cần ít nhất 1 trong 2 hình thức)
  // Nhóm B: Ngoại ngữ, Hoạt động quốc tế hoặc Cuộc thi ngoại ngữ (Cần ít nhất 1 trong 3 hình thức)
  // Ngoại ngữ: C/B1, TOEIC >= 405, TOEFL iBT >= 53, IELTS >= 4.5, hoặc ĐTB các học phần >= 3.0/4 hoặc 7.5/10.
  // Sinh viên chuyên ngành ngoại ngữ: Tính theo ngoại ngữ thứ hai.
  // =========================================================================
  integration: {
    id: 'integration',
    number: 5,
    name: 'Hội nhập tốt',
    vietnameseTitle: 'Tiêu chí 5: Hội nhập tốt',
    shortSummary: 'Kỹ năng ngoại ngữ, tin học, giao lưu quốc tế và hoạt động hội nhập',
    accentColor: '#0E9F9A',
    accentSoft: 'rgba(14, 159, 154, 0.10)',
    bgTint: '#EDFAF9',
    groups: [
      {
        id: 'integration-skills-award',
        criterionId: 'integration',
        title: 'Nhóm A: Kỹ năng hoặc Khen thưởng Đoàn - Hội',
        groupType: 'AT_LEAST_N',
        ruleBadge: 'Cần ít nhất 1 trong 2 hình thức (Bắt buộc)',
        ruleHelper: 'Bắt buộc đạt ít nhất một trong hai hình thức: Khóa kỹ năng thực hành xã hội HOẶC Khen thưởng Đoàn/Hội từ cấp khoa trở lên',
        minSelections: 1,
        minApplicable: 1,
        requirements: [
          {
            id: 'integration-skills',
            code: 'TC5.1',
            criterionId: 'integration',
            groupId: 'integration-skills-award',
            title: 'Hoàn thành khóa trang bị kỹ năng thực hành xã hội',
            ruleBadge: 'Hình thức A1',
            ruleHelper: 'Hoàn thành ít nhất một khóa trang bị kỹ năng thực hành xã hội do các cấp tổ chức',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Khóa kỹ năng thực hành xã hội',
            addActionLabel: 'Thêm khóa học kỹ năng',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên khóa học & Nội dung kỹ năng',
              valuePlaceholder: 'Ví dụ: Khóa tập huấn Kỹ năng thực hành xã hội và làm việc nhóm 2026',
              detailLabel: 'Đơn vị tổ chức & Thời gian hoàn thành',
              detailPlaceholder: 'Ví dụ: Hội Sinh viên TP. Đà Nẵng tổ chức · Hoàn thành tháng 04/2026',
            },
            regulationSnippet: 'Hoàn thành ít nhất 01 khóa trang bị kỹ năng thực hành xã hội (không yêu cầu giải thưởng).',
          },
          {
            id: 'integration-union-award',
            code: 'TC5.2',
            criterionId: 'integration',
            groupId: 'integration-skills-award',
            title: 'Khen thưởng công tác Đoàn - Hội từ cấp khoa trở lên',
            ruleBadge: 'Hình thức A2',
            ruleHelper: 'Được Hội Sinh viên hoặc Đoàn Thanh niên từ cấp khoa trở lên khen thưởng thành tích xuất sắc',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Khen thưởng Đoàn - Hội',
            addActionLabel: 'Thêm khen thưởng Đoàn - Hội',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên khen thưởng công tác Đoàn - Hội',
              valuePlaceholder: 'Ví dụ: Giấy khen Thành tích xuất sắc trong công tác Hội và phong trào sinh viên năm học 2025–2026',
              detailLabel: 'Cấp khen thưởng & Đơn vị trao tặng',
              detailPlaceholder: 'Ví dụ: Hội Sinh viên trường ĐH Bách khoa khen tặng · Quyết định số 28/QĐ-HSV',
            },
            regulationSnippet: 'Được Hội Sinh viên hoặc Đoàn Thanh niên từ cấp khoa trở lên khen thưởng thành tích xuất sắc trong công tác Hội, phong trào sinh viên, công tác Đoàn và phong trào thanh niên trường học trong năm học.',
          },
        ],
      },
      {
        id: 'integration-languages-intl',
        criterionId: 'integration',
        title: 'Nhóm B: Ngoại ngữ, Hoạt động quốc tế hoặc Cuộc thi',
        groupType: 'AT_LEAST_N',
        ruleBadge: 'Cần ít nhất 1 trong 3 hình thức (Bắt buộc)',
        ruleHelper: 'Bắt buộc đạt ít nhất một trong ba hình thức: Chuẩn ngoại ngữ, Giao lưu quốc tế, hoặc Cuộc thi ngoại ngữ từ giải Ba trở lên',
        minSelections: 1,
        minApplicable: 1,
        requirements: [
          {
            id: 'integration-lang',
            code: 'TC5.3',
            criterionId: 'integration',
            groupId: 'integration-languages-intl',
            title: 'Tiêu chuẩn năng lực ngoại ngữ',
            ruleBadge: 'Hình thức B1',
            ruleHelper: 'Chứng chỉ C/B1, TOEIC >= 405, TOEFL iBT >= 53, IELTS >= 4.5, hoặc ĐTB học phần ngoại ngữ >= 3.0/4 hoặc 7.5/10; Ngoại ngữ 2 cho SV chuyên ngành',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Chứng chỉ / Điểm ngoại ngữ',
            addActionLabel: 'Thêm kê khai ngoại ngữ',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Loại chứng chỉ / Hình thức & Kết quả đạt được',
              valuePlaceholder: 'Ví dụ: IELTS 6.5 (hoặc TOEIC 650, hoặc ĐTB học phần ngoại ngữ: 3.25/4.00)',
              detailLabel: 'Đơn vị cấp, Ngày cấp & Chuyên ngành',
              detailPlaceholder: 'Ví dụ: IDP cấp ngày 14/03/2026 (Đối với SV chuyên ngành ngoại ngữ: kê khai Ngoại ngữ 2)',
            },
            regulationSnippet: 'Đạt chứng chỉ tiếng Anh trình độ C hoặc B1 trở lên; TOEIC từ 405 trở lên; TOEFL iBT từ 53 trở lên; IELTS từ 4.5 trở lên; hoặc điểm trung bình các học phần ngoại ngữ tích lũy từ năm thứ nhất đạt từ 3.0/4.0 hoặc 7.5/10 trở lên. Đối với sinh viên chuyên ngành ngoại ngữ: áp dụng đối với ngoại ngữ thứ hai.',
          },
          {
            id: 'integration-intl',
            code: 'TC5.4',
            criterionId: 'integration',
            groupId: 'integration-languages-intl',
            title: 'Tham gia hoạt động giao lưu, hợp tác quốc tế từ cấp khoa trở lên',
            ruleBadge: 'Hình thức B2',
            ruleHelper: 'Tham gia hội nghị, hội thảo quốc tế, giao lưu thanh niên sinh viên quốc tế từ cấp khoa trở lên (không yêu cầu giải thưởng)',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Hoạt động giao lưu quốc tế',
            addActionLabel: 'Thêm hoạt động quốc tế',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên hoạt động giao lưu / Hội nghị quốc tế',
              valuePlaceholder: 'Ví dụ: Đại biểu Diễn đàn Thanh niên ASEAN - Đà Nẵng 2026',
              detailLabel: 'Cấp tổ chức & Đơn vị chủ trì',
              detailPlaceholder: 'Ví dụ: Cấp Thành phố · Thành Đoàn phối hợp Hội Hữu nghị các nước tổ chức',
            },
            regulationSnippet: 'Tham gia ít nhất một hoạt động giao lưu, hợp tác quốc tế, hội nghị hội thảo quốc tế từ cấp khoa trở lên (không yêu cầu có giải thưởng).',
          },
          {
            id: 'integration-contest',
            code: 'TC5.5',
            criterionId: 'integration',
            groupId: 'integration-languages-intl',
            title: 'Cuộc thi kiến thức hoặc sử dụng ngoại ngữ từ cấp khoa trở lên',
            ruleBadge: 'Hình thức B3',
            ruleHelper: 'Tham gia VÀ đạt Giải Ba trở lên tại cuộc thi kiến thức hoặc sử dụng ngoại ngữ từ cấp khoa trở lên',
            declarationMultiplicity: 'MULTIPLE',
            declarationLabel: 'Cuộc thi ngoại ngữ (Giải Ba trở lên)',
            addActionLabel: 'Thêm cuộc thi ngoại ngữ',
            allowMultipleEvidence: true,
            declarationMode: 'single',
            allowMultipleDeclarations: true,
            fieldConfig: {
              valueLabel: 'Tên cuộc thi & Giải thưởng (từ Giải Ba trở lên)',
              valuePlaceholder: 'Ví dụ: Giải Ba Hội thi Hùng biện tiếng Anh sinh viên Đà Nẵng 2026',
              detailLabel: 'Cấp tổ chức & Đơn vị chủ trì',
              detailPlaceholder: 'Ví dụ: Cấp Thành phố · Hội Sinh viên TP. Đà Nẵng tổ chức',
            },
            regulationSnippet: 'Tham gia và đạt giải Ba trở lên tại các cuộc thi kiến thức hoặc các cuộc thi sử dụng ngoại ngữ từ cấp khoa trở lên.',
          },
        ],
      },
    ],
  },
};

export const CRITERIA_DEFINITIONS_LIST = Object.values(CRITERIA_DEFINITIONS);
