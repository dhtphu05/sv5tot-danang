/**
 * 5TOT Đà Nẵng — Regulation Fixture Data
 * Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 * Season: Năm học 2025–2026 (Áp dụng chính thức)
 * Single Source of Truth Alignment:
 * Built directly from CRITERIA_DEFINITIONS so Table Workspace and Regulation Inspector never disagree.
 */

import { CRITERIA_DEFINITIONS } from './criteriaDefinitions';

export interface RegulationOption {
  id: string;
  label: string;
  detail: string;
  recommendedEvidence?: string;
}

export interface RegulationSection {
  id: string;
  title: string;
  ruleType: 'mandatory' | 'optional_one_of' | 'optional_at_least_one' | 'repeatable';
  badge: string;
  description: string;
  threshold?: string;
  multiplicity?: 'SINGLE' | 'MULTIPLE';
  multiplicityNote?: string;
  options?: RegulationOption[];
  matchedRequirementId?: string;
}

export interface CriterionRegulation {
  criterionId: 'ethics' | 'academic' | 'physical' | 'volunteer' | 'integration';
  criterionName: string;
  criterionNumber: number;
  season: string;
  effectiveYear: string;
  summary: string;
  sections: RegulationSection[];
  evidencePreparation: {
    leadText: string;
    items: string[];
    guidanceNote: string;
  };
  importantNotes: string[];
  source: {
    documentName: string;
    documentNumber: string;
    issuedDate: string;
    issuingAuthority: string;
    isPrototypeNotice: string;
    fullExcerpt: string;
  };
}

/**
 * Builds regulation sections dynamically from CRITERIA_DEFINITIONS
 * Ensures Table Workspace and Regulation Inspector always share the exact same structural options.
 */
export const buildSectionsFromDefinition = (
  criterionId: 'ethics' | 'academic' | 'physical' | 'volunteer' | 'integration'
): RegulationSection[] => {
  const def = CRITERIA_DEFINITIONS[criterionId];
  if (!def) return [];

  return def.groups.flatMap((grp) =>
    grp.requirements.map((req) => ({
      id: req.id,
      title: req.code ? `${req.code} · ${req.title}` : req.title,
      ruleType: (grp.groupType === 'ALL_REQUIRED'
        ? 'mandatory'
        : grp.groupType === 'REPEATABLE_COLLECTION' || (grp.groupType as string) === 'REPEATABLE'
        ? 'repeatable'
        : grp.ruleBadge.includes('1 trong 2')
        ? 'optional_one_of'
        : 'optional_at_least_one') as RegulationSection['ruleType'],
      badge: req.ruleBadge || grp.ruleBadge,
      description:
        req.regulationSnippet ||
        req.ruleHelper ||
        grp.ruleHelper ||
        'Quy định cụ thể theo hướng dẫn của Hội Sinh viên Thành phố Đà Nẵng.',
      threshold: req.ruleHelper,
      multiplicity: req.declarationMultiplicity,
      multiplicityNote:
        req.declarationMultiplicity === 'MULTIPLE'
          ? 'Sinh viên có thể kê khai nhiều nội dung/thành tích phù hợp nếu có thực tế.'
          : 'Kê khai 01 kết quả chính xác đạt được trong năm học xét chọn.',
      matchedRequirementId: req.id,
    }))
  );
};

export const REGULATION_DATA: Record<string, CriterionRegulation> = {
  // =========================================================================
  // CRITERION 1: ĐẠO ĐỨC TỐT
  // =========================================================================
  ethics: {
    criterionId: 'ethics',
    criterionName: 'Đạo đức tốt',
    criterionNumber: 1,
    season: 'Năm học 2025–2026',
    effectiveYear: '2025–2026',
    summary: 'Rèn luyện đạo đức, lối sống lành mạnh, chấp hành pháp luật và nội quy nhà trường.',
    sections: buildSectionsFromDefinition('ethics'),
    evidencePreparation: {
      leadText: 'Các tài liệu minh chứng hợp lệ bao gồm:',
      items: [
        'Bảng điểm đánh giá kết quả rèn luyện năm học 2025–2026 có xác nhận của Nhà trường/Khoa (>= 80/100 điểm hoặc xếp loại Giỏi đối với cơ sở đặc thù).',
        'Bản xác nhận không vi phạm pháp luật, quy chế, nội quy của Nhà trường và nơi cư trú.',
        'Quyết định kết nạp Đảng, Thẻ Đảng viên hoặc xác nhận của cấp ủy chi bộ (đối với Đảng viên).',
        'Quyết định thành lập / triệu tập hoặc giấy chứng nhận thành viên chính thức đội thi tìm hiểu chủ nghĩa Mác - Lênin, tư tưởng HCM.',
        'Kỷ yếu / giấy chứng nhận tham luận tại diễn đàn học thuật về chủ nghĩa Mác - Lênin, tư tưởng HCM.',
        'Giấy khen, bằng khen hoặc quyết định biểu dương thanh niên tiêu biểu, gương người tốt việc tốt, dũng cảm cứu người.',
      ],
      guidanceNote: 'Hệ thống hỗ trợ đính kèm minh chứng số định dạng PDF hoặc ảnh chụp rõ nét cho từng nội dung kê khai.',
    },
    importantNotes: [
      'Điểm rèn luyện đạt từ 80/100 điểm trở lên (hoặc xếp loại Giỏi quy đổi đối với đơn vị đặc thù).',
      'Không bị kỷ luật từ mức khiển trách trở lên trong suốt năm học xét chọn.',
      'Bắt buộc hoàn thành Nhóm A (Điểm rèn luyện), Nhóm B (Không vi phạm) và ít nhất 1 trong 4 hình thức tại Nhóm C.',
    ],
    source: {
      documentName: 'Quy định tiêu chuẩn xét chọn danh hiệu Sinh viên 5 tốt cấp Thành phố',
      documentNumber: 'Hướng dẫn số 14-HD/BTK-HSVTP',
      issuedDate: '15/09/2025',
      issuingAuthority: 'Ban Thư ký Hội Sinh viên Việt Nam TP. Đà Nẵng',
      isPrototypeNotice: 'Áp dụng cho niên khóa xét chọn 2025–2026',
      fullExcerpt: `BAN THƯ KÝ HỘI SINH VIÊN TP. ĐÀ NẴNG
Số: 14-HD/BTK-HSVTP — Tiêu chí 1: ĐẠO ĐỨC TỐT

1. Điểm rèn luyện (Bắt buộc):
- Điểm rèn luyện cả năm đạt từ 80/100 điểm trở lên. Đối với các đơn vị đào tạo đặc thù không áp dụng thang điểm 100 thì kết quả rèn luyện quy đổi phải đạt loại Giỏi.

2. Chấp hành pháp luật, nội quy (Bắt buộc):
- Không vi phạm pháp luật, quy chế, nội quy của Nhà trường, quy định của địa phương và cộng đồng.

3. Tiêu chuẩn thành tích / hoạt động bổ sung (Cần đạt ít nhất 1 trong 4 hình thức):
- Là Đảng viên Đảng Cộng sản Việt Nam.
- Là thành viên chính thức đội tuyển tham gia các cuộc thi tìm hiểu chủ nghĩa Mác–Lênin, tư tưởng Hồ Chí Minh từ cấp chi đoàn trở lên (không yêu cầu đạt giải).
- Có tham luận hoặc bài viết được trình bày tại diễn đàn học thuật về chủ nghĩa Mác–Lênin, tư tưởng Hồ Chí Minh.
- Là thanh niên tiêu biểu, thanh niên tiên tiến, gương người tốt việc tốt, có hành động dũng cảm cứu người được ghi nhận, biểu dương các cấp.`,
    },
  },

  // =========================================================================
  // CRITERION 2: HỌC TẬP TỐT
  // =========================================================================
  academic: {
    criterionId: 'academic',
    criterionName: 'Học tập tốt',
    criterionNumber: 2,
    season: 'Năm học 2025–2026',
    effectiveYear: '2025–2026',
    summary: 'Kết quả học tập xuất sắc, nghiên cứu khoa học và phát triển chuyên môn học thuật.',
    sections: buildSectionsFromDefinition('academic'),
    evidencePreparation: {
      leadText: 'Các tài liệu minh chứng hợp lệ bao gồm:',
      items: [
        'Bảng điểm chính thức cả năm học 2025–2026 có xác nhận của Phòng Đào tạo (Đại học >= 3.2/4 hoặc 8.0/10; Cao đẳng >= 3.0/4 hoặc 7.5/10).',
        'Giấy chứng nhận đề tài nghiên cứu khoa học sinh viên đạt giải từ cấp khoa trở lên.',
        'Trang bìa, mục lục và trang đầu bài báo đăng trên tạp chí chuyên ngành có chỉ số ISSN/Scopus.',
        'Giấy chứng nhận tham gia hoặc kỷ yếu hội thảo khoa học từ cấp khoa trở lên có chỉ số ISBN.',
        'Bằng độc quyền sáng chế, giấy phép xuất bản hoặc quyết định trao giải thưởng sáng tạo cấp trường.',
        'Quyết định hoặc danh sách triệu tập thành viên đội tuyển thi học thuật cấp trường trở lên.',
        'Giấy khen hoặc chứng nhận đạt giải cuộc thi ý tưởng sáng tạo, khởi nghiệp cấp trường trở lên.',
      ],
      guidanceNote: 'Sinh viên có thể kê khai nhiều nội dung học thuật để hội đồng thẩm định ghi nhận toàn diện.',
    },
    importantNotes: [
      'Điểm trung bình chung học tập tính riêng năm học 2025–2026 (không dùng GPA tích lũy toàn khóa).',
      'Đại học: GPA >= 3.2/4.0 hoặc >= 8.0/10; Cao đẳng: GPA >= 3.0/4.0 hoặc >= 7.5/10.',
      'Bài báo tạp chí, tham luận hội thảo và đội tuyển học thuật không bắt buộc phải có giải thưởng.',
    ],
    source: {
      documentName: 'Quy định tiêu chuẩn xét chọn danh hiệu Sinh viên 5 tốt cấp Thành phố',
      documentNumber: 'Hướng dẫn số 14-HD/BTK-HSVTP',
      issuedDate: '15/09/2025',
      issuingAuthority: 'Ban Thư ký Hội Sinh viên Việt Nam TP. Đà Nẵng',
      isPrototypeNotice: 'Áp dụng cho niên khóa xét chọn 2025–2026',
      fullExcerpt: `BAN THƯ KÝ HỘI SINH VIÊN TP. ĐÀ NẴNG
Số: 14-HD/BTK-HSVTP — Tiêu chí 2: HỌC TẬP TỐT

1. Kết quả học tập (Bắt buộc):
- Điểm trung bình chung học tập cả năm học đạt từ 3.2/4.0 hoặc 8.0/10 trở lên đối với sinh viên Đại học; từ 3.0/4.0 hoặc 7.5/10 trở lên đối với sinh viên Cao đẳng.

2. Tiêu chuẩn thành tích học thuật (Cần đạt ít nhất 1 trong 6 hình thức):
- Có đề tài nghiên cứu khoa học sinh viên đạt giải từ cấp khoa trở lên.
- Có bài viết được đăng trên tạp chí chuyên ngành trong nước hoặc quốc tế.
- Có bài tham luận tham gia hội thảo khoa học từ cấp khoa trở lên.
- Có sản phẩm sáng tạo được cấp bằng sáng chế, giấy phép xuất bản hoặc đạt giải thưởng từ cấp trường trở lên.
- Là thành viên các đội tuyển tham gia các kỳ thi học thuật từ cấp trường trở lên.
- Đạt giải thưởng tại các cuộc thi ý tưởng sáng tạo từ cấp trường trở lên.`,
    },
  },

  // =========================================================================
  // CRITERION 3: THỂ LỰC TỐT
  // =========================================================================
  physical: {
    criterionId: 'physical',
    criterionName: 'Thể lực tốt',
    criterionNumber: 3,
    season: 'Năm học 2025–2026',
    effectiveYear: '2025–2026',
    summary: 'Rèn luyện thể dục thể thao, đạt danh hiệu thể lực hoặc thành tích thi đấu thể thao phong trào.',
    sections: buildSectionsFromDefinition('physical'),
    evidencePreparation: {
      leadText: 'Các tài liệu minh chứng hợp lệ bao gồm:',
      items: [
        'Giấy chứng nhận danh hiệu "Thanh niên khỏe" (hoặc "Sinh viên khỏe") cấp Trường trong năm học xét chọn.',
        'Giấy khen, huy chương, quyết định công nhận giải thưởng thể thao phong trào từ cấp Khoa trở lên.',
      ],
      guidanceNote: 'Sinh viên cần đạt ít nhất 1 trong 2 hình thức; nếu có cả hai có thể kê khai đầy đủ cả hai để hội đồng thẩm định.',
    },
    importantNotes: [
      'Danh hiệu Thanh niên khỏe (hoặc Sinh viên khỏe) phải do Hội Sinh viên hoặc Bộ môn GDTC cấp Trường cấp trong năm học.',
      'Đối với hoạt động thể thao phong trào: Yêu cầu THAM GIA VÀ ĐẠT GIẢI từ cấp Khoa trở lên (tham gia thông thường chưa đạt giải thì chưa đáp ứng).',
    ],
    source: {
      documentName: 'Quy định tiêu chuẩn xét chọn danh hiệu Sinh viên 5 tốt cấp Thành phố',
      documentNumber: 'Hướng dẫn số 14-HD/BTK-HSVTP',
      issuedDate: '15/09/2025',
      issuingAuthority: 'Ban Thư ký Hội Sinh viên Việt Nam TP. Đà Nẵng',
      isPrototypeNotice: 'Áp dụng cho niên khóa xét chọn 2025–2026',
      fullExcerpt: `BAN THƯ KÝ HỘI SINH VIÊN TP. ĐÀ NẴNG
Số: 14-HD/BTK-HSVTP — Tiêu chí 3: THỂ LỰC TỐT

Sinh viên cần đạt ít nhất 1 trong 2 hình thức sau (được phép kê khai cả hai):
1. Đạt danh hiệu "Thanh niên khỏe" (hoặc "Sinh viên khỏe") từ cấp trường trở lên.
2. Tham gia VÀ đạt giải tại các hoạt động thể thao phong trào từ cấp khoa trở lên.`,
    },
  },

  // =========================================================================
  // CRITERION 4: TÌNH NGUYỆN TỐT
  // =========================================================================
  volunteer: {
    criterionId: 'volunteer',
    criterionName: 'Tình nguyện tốt',
    criterionNumber: 4,
    season: 'Năm học 2025–2026',
    effectiveYear: '2025–2026',
    summary: 'Cống hiến vì cộng đồng, tham gia các chiến dịch, hoạt động an sinh xã hội và phong trào tình nguyện.',
    sections: buildSectionsFromDefinition('volunteer'),
    evidencePreparation: {
      leadText: 'Các tài liệu minh chứng hợp lệ bao gồm:',
      items: [
        'Giấy chứng nhận hoàn thành chiến dịch Mùa hè xanh, Tiếp sức mùa thi, Xuân tình nguyện, Ngày Chủ nhật xanh...',
        'Giấy chứng nhận hiến máu nhân đạo / tình nguyện do cơ sở y tế hoặc Hội Chữ thập đỏ cấp (quy đổi 01 ngày tương đương).',
        'Văn bản xác nhận tham gia hoạt động tình nguyện tại mái ấm, cơ sở bảo trợ xã hội có xác nhận số ngày.',
        'Quyết định khen thưởng, giấy khen về hoạt động tình nguyện từ cấp Khoa trở lên.',
      ],
      guidanceNote: 'Hệ thống hỗ trợ kê khai nhiều hoạt động với thông tin chi tiết số ngày tích lũy và minh chứng độc lập.',
    },
    importantNotes: [
      'Yêu cầu tham gia ít nhất 05 ngày tình nguyện trong năm học xét chọn, tích lũy qua các hoạt động.',
      'Ví dụ quy chuẩn văn bản: 3 ngày mái ấm + 1 lần hiến máu + 1 ngày Chủ nhật xanh = 5 ngày tình nguyện đạt chuẩn.',
      'Hình thức khen thưởng hoạt động tình nguyện từ cấp khoa trở lên cũng được ghi nhận.',
    ],
    source: {
      documentName: 'Quy định tiêu chuẩn xét chọn danh hiệu Sinh viên 5 tốt cấp Thành phố',
      documentNumber: 'Hướng dẫn số 14-HD/BTK-HSVTP',
      issuedDate: '15/09/2025',
      issuingAuthority: 'Ban Thư ký Hội Sinh viên Việt Nam TP. Đà Nẵng',
      isPrototypeNotice: 'Áp dụng cho niên khóa xét chọn 2025–2026',
      fullExcerpt: `BAN THƯ KÝ HỘI SINH VIÊN TP. ĐÀ NẴNG
Số: 14-HD/BTK-HSVTP — Tiêu chí 4: TÌNH NGUYỆN TỐT

- Tham gia ít nhất 05 ngày tình nguyện trong một năm học (được tính cộng dồn các hoạt động).
Ví dụ: 3 ngày tình nguyện tại Trung tâm bảo trợ xã hội + 1 lần hiến máu tình nguyện + 1 ngày tình nguyện Ngày Chủ nhật xanh = 5 ngày tình nguyện.
- Hoặc được khen thưởng về hoạt động tình nguyện từ cấp khoa trở lên.`,
    },
  },

  // =========================================================================
  // CRITERION 5: HỘI NHẬP TỐT
  // =========================================================================
  integration: {
    criterionId: 'integration',
    criterionName: 'Hội nhập tốt',
    criterionNumber: 5,
    season: 'Năm học 2025–2026',
    effectiveYear: '2025–2026',
    summary: 'Kỹ năng ngoại ngữ, tin học, giao lưu quốc tế và hoạt động hội nhập công dân toàn cầu.',
    sections: buildSectionsFromDefinition('integration'),
    evidencePreparation: {
      leadText: 'Các tài liệu minh chứng hợp lệ bao gồm:',
      items: [
        'Bản scan chứng chỉ ngoại ngữ quốc tế (IELTS >= 4.5, TOEIC >= 405, TOEFL iBT >= 53, Trình độ C/B1).',
        'Bảng điểm xác nhận điểm trung bình các học phần ngoại ngữ tích lũy từ năm thứ nhất (>= 3.0/4 hoặc >= 7.5/10).',
        'Minh chứng ngoại ngữ 2 đối với sinh viên chuyên ngành ngoại ngữ.',
        'Giấy chứng nhận tham gia chương trình giao lưu, tình nguyện quốc tế, hội nghị hội thảo quốc tế từ cấp Khoa trở lên.',
        'Giấy khen hoặc chứng nhận đạt giải Ba trở lên tại các cuộc thi kiến thức hoặc sử dụng ngoại ngữ từ cấp Khoa trở lên.',
        'Giấy chứng nhận hoàn thành khóa trang bị kỹ năng thực hành xã hội.',
        'Quyết định khen thưởng công tác Đoàn - Hội từ cấp Khoa trở lên trong năm học.',
      ],
      guidanceNote: 'Hệ thống hỗ trợ đính kèm minh chứng cho cả Nhóm A (Kỹ năng/Đoàn Hội) và Nhóm B (Ngoại ngữ/Quốc tế).',
    },
    importantNotes: [
      'BẮT BUỘC ĐẠT CẢ HAI NHÓM: Nhóm A (ít nhất 1 trong 2 hình thức) VÀ Nhóm B (ít nhất 1 trong 3 hình thức).',
      'Chuẩn ngoại ngữ: IELTS từ 4.5, TOEIC từ 405, TOEFL iBT từ 53, C/B1; hoặc điểm học phần ngoại ngữ từ 3.0/4.0 hoặc 7.5/10.',
      'Sinh viên chuyên ngành ngoại ngữ: Tính theo Ngoại ngữ thứ hai.',
      'Cuộc thi ngoại ngữ yêu cầu đạt từ Giải Ba trở lên từ cấp Khoa trở lên.',
    ],
    source: {
      documentName: 'Quy định tiêu chuẩn xét chọn danh hiệu Sinh viên 5 tốt cấp Thành phố',
      documentNumber: 'Hướng dẫn số 14-HD/BTK-HSVTP',
      issuedDate: '15/09/2025',
      issuingAuthority: 'Ban Thư ký Hội Sinh viên Việt Nam TP. Đà Nẵng',
      isPrototypeNotice: 'Áp dụng cho niên khóa xét chọn 2025–2026',
      fullExcerpt: `BAN THƯ KÝ HỘI SINH VIÊN TP. ĐÀ NẴNG
Số: 14-HD/BTK-HSVTP — Tiêu chí 5: HỘI NHẬP TỐT

I. Yêu cầu Nhóm A (Cần đạt ít nhất 1 trong 2 hình thức):
1. Hoàn thành ít nhất 01 khóa trang bị kỹ năng thực hành xã hội.
2. Được Hội Sinh viên hoặc Đoàn Thanh niên từ cấp khoa trở lên khen thưởng thành tích xuất sắc trong công tác Hội, phong trào sinh viên, công tác Đoàn và phong trào thanh niên trường học trong năm học.

II. Yêu cầu Nhóm B (Cần đạt ít nhất 1 trong 3 hình thức):
1. Tiêu chuẩn ngoại ngữ:
- Đạt chứng chỉ tiếng Anh trình độ C hoặc B1 trở lên; TOEIC từ 405 điểm trở lên; TOEFL iBT từ 53 điểm trở lên; IELTS từ 4.5 trở lên.
- Hoặc điểm trung bình các học phần ngoại ngữ tích lũy từ năm thứ nhất đạt từ 3.0/4.0 hoặc 7.5/10 trở lên.
- Đối với sinh viên chuyên ngành ngoại ngữ: Áp dụng đối với ngoại ngữ thứ hai.
2. Tham gia ít nhất một hoạt động giao lưu, hợp tác quốc tế từ cấp khoa trở lên (hội nghị, hội thảo quốc tế, giao lưu thanh niên sinh viên quốc tế...).
3. Tham gia và đạt giải Ba trở lên tại các cuộc thi kiến thức hoặc sử dụng ngoại ngữ từ cấp khoa trở lên.`,
    },
  },
};
