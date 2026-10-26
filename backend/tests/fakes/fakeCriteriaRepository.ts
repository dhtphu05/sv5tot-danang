/**
 * 5TOT Đà Nẵng — Fake Criteria Catalog Repository (Backend Tests V2)
 * Pre-seeded with official 2025–2026 5 Individual Criteria & TT01–TT04 Collective Criteria.
 */

import { ICriteriaRepository } from '../../src/modules/criteria/criteria.repository';
import {
  CriterionGroupDefinitionDto,
  RequirementDefinitionDto,
  CriterionTrack,
} from '../../src/modules/criteria/criteria.types';

export class FakeCriteriaRepository implements ICriteriaRepository {
  private groups: CriterionGroupDefinitionDto[] = [];

  constructor() {
    this.seedDefaultCriteria();
  }

  private seedDefaultCriteria(): void {
    const seasonId = 'season-2025-2026';

    // 1. INDIVIDUAL CRITERIA (5 Canonical Criteria)
    const individualGroups: CriterionGroupDefinitionDto[] = [
      // 1.1 ETHICS Foundation
      {
        id: 'cg-ethics-foundation',
        seasonId,
        track: 'INDIVIDUAL',
        code: 'ETHICS',
        title: 'Điểm rèn luyện và Chấp hành quy chế',
        shortTitle: 'Đạo đức - Nền tảng',
        displayOrder: 1,
        groupType: 'ALL_REQUIRED',
        minSelections: 2,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tc1-1',
            criterionGroupId: 'cg-ethics-foundation',
            code: 'TC1.1',
            title: 'Điểm rèn luyện cả năm học',
            description: 'Đạt từ 80/100 điểm trở lên hoặc xếp loại Giỏi với cơ sở đặc thù.',
            displayOrder: 1,
            isMandatory: true,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'SINGLE',
            ruleHelper: 'Từ 80/100 điểm trở lên hoặc Giỏi',
          },
          {
            id: 'req-tc1-2',
            criterionGroupId: 'cg-ethics-foundation',
            code: 'TC1.2',
            title: 'Không vi phạm pháp luật, quy chế, nội quy',
            description: 'Cam kết và xác nhận không vi phạm pháp luật và nội quy.',
            displayOrder: 2,
            isMandatory: true,
            requiresEvidence: false,
            allowMultipleEvidence: false,
            declarationMultiplicity: 'SINGLE',
            ruleHelper: 'Không vi phạm kỷ luật',
          },
        ],
      },
      // 1.2 ETHICS Supplement (1 of 4 alternatives)
      {
        id: 'cg-ethics-supplement',
        seasonId,
        track: 'INDIVIDUAL',
        code: 'ETHICS',
        title: 'Tiêu chuẩn bổ sung Đạo đức',
        shortTitle: 'Đạo đức - Bổ sung',
        displayOrder: 2,
        groupType: 'AT_LEAST_N',
        minSelections: 1,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tc1-3',
            criterionGroupId: 'cg-ethics-supplement',
            code: 'TC1.3',
            title: 'Đảng viên hoặc Đoàn viên ưu tú',
            description: 'Là Đảng viên ĐCSVN hoặc Đoàn viên ưu tú hoàn thành xuất sắc nhiệm vụ.',
            displayOrder: 1,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
          {
            id: 'req-tc1-4',
            criterionGroupId: 'cg-ethics-supplement',
            code: 'TC1.4',
            title: 'Thành viên đội tuyển Lý luận chính trị',
            description: 'Tham gia đội thi tìm hiểu Chủ nghĩa Mác - Lênin (không bắt buộc có giải).',
            displayOrder: 2,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
          {
            id: 'req-tc1-5',
            criterionGroupId: 'cg-ethics-supplement',
            code: 'TC1.5',
            title: 'Bài tham luận / Nghiên cứu Lý luận chính trị',
            description: 'Có bài viết về tư tưởng Hồ Chí Minh, Mác - Lênin (không bắt buộc có giải).',
            displayOrder: 3,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
          {
            id: 'req-tc1-6',
            criterionGroupId: 'cg-ethics-supplement',
            code: 'TC1.6',
            title: 'Khen thưởng gương người tốt việc tốt',
            description: 'Được tuyên dương, khen thưởng về hành động dũng cảm, đạo đức lối sống.',
            displayOrder: 4,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
        ],
      },
      // 2.1 ACADEMIC Foundation (GPA)
      {
        id: 'cg-academic-foundation',
        seasonId,
        track: 'INDIVIDUAL',
        code: 'ACADEMIC',
        title: 'Điểm trung bình học tập',
        shortTitle: 'Học tập - Điểm GPA',
        displayOrder: 3,
        groupType: 'ALL_REQUIRED',
        minSelections: 1,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tc2-1',
            criterionGroupId: 'cg-academic-foundation',
            code: 'TC2.1',
            title: 'Điểm trung bình chung học tập cả năm',
            description: 'ĐH >= 3.2/4 (8.0/10) hoặc CĐ >= 3.0/4 (7.5/10).',
            displayOrder: 1,
            isMandatory: true,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'SINGLE',
            ruleHelper: '>= 3.2/4 hoặc 8.0/10 đối với ĐH',
          },
        ],
      },
      // 2.2 ACADEMIC Achievements (1 of 6 alternatives)
      {
        id: 'cg-academic-achievements',
        seasonId,
        track: 'INDIVIDUAL',
        code: 'ACADEMIC',
        title: 'Thành tích Nghiên cứu khoa học & Học thuật',
        shortTitle: 'Học tập - NCKH & Giải thưởng',
        displayOrder: 4,
        groupType: 'AT_LEAST_N',
        minSelections: 1,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tc2-2',
            criterionGroupId: 'cg-academic-achievements',
            code: 'TC2.2',
            title: 'Đề tài Nghiên cứu khoa học đạt giải',
            description: 'Chủ nhiệm hoặc thành viên chính đề tài NCKH đạt giải cấp Trường trở lên.',
            displayOrder: 1,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
            ruleHelper: 'Bắt buộc có giải thưởng',
          },
          {
            id: 'req-tc2-3',
            criterionGroupId: 'cg-academic-achievements',
            code: 'TC2.3',
            title: 'Bài báo khoa học xuất bản trên tạp chí',
            description: 'Có bài báo đăng trên tạp chí chuyên ngành (không bắt buộc có giải thưởng).',
            displayOrder: 2,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
            ruleHelper: 'Không bắt buộc có giải',
          },
          {
            id: 'req-tc2-4',
            criterionGroupId: 'cg-academic-achievements',
            code: 'TC2.4',
            title: 'Báo cáo tại Hội thảo khoa học',
            description: 'Có bài tham luận/báo cáo tại Hội thảo khoa học cấp Khoa/Trường trở lên.',
            displayOrder: 3,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
          {
            id: 'req-tc2-5',
            criterionGroupId: 'cg-academic-achievements',
            code: 'TC2.5',
            title: 'Sản phẩm sáng tạo, ý tưởng khởi nghiệp',
            description: 'Có sản phẩm, giải pháp kỹ thuật, sáng chế được công nhận.',
            displayOrder: 4,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
          {
            id: 'req-tc2-6',
            criterionGroupId: 'cg-academic-achievements',
            code: 'TC2.6',
            title: 'Thành viên đội tuyển học thuật',
            description: 'Tham gia đội thi Olympic, học thuật cấp Trường trở lên.',
            displayOrder: 5,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
          {
            id: 'req-tc2-7',
            criterionGroupId: 'cg-academic-achievements',
            code: 'TC2.7',
            title: 'Giải thưởng cuộc thi Đổi mới sáng tạo',
            description: 'Đạt giải tại cuộc thi ý tưởng, khởi nghiệp đổi mới sáng tạo.',
            displayOrder: 6,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
        ],
      },
      // 3. PHYSICAL Criterion (1 of 2 alternatives)
      {
        id: 'cg-physical',
        seasonId,
        track: 'INDIVIDUAL',
        code: 'PHYSICAL',
        title: 'Tiêu chí Thể lực tốt',
        shortTitle: 'Thể lực tốt',
        displayOrder: 5,
        groupType: 'AT_LEAST_N',
        minSelections: 1,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tc3-1',
            criterionGroupId: 'cg-physical',
            code: 'TC3.1',
            title: 'Đạt danh hiệu "Thanh niên khỏe" / "Sinh viên khỏe"',
            description: 'Đạt chứng nhận Thanh niên khỏe của Hội Sinh viên hoặc Trung tâm GDQP.',
            displayOrder: 1,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'SINGLE',
          },
          {
            id: 'req-tc3-2',
            criterionGroupId: 'cg-physical',
            code: 'TC3.2',
            title: 'Tham gia và đạt giải thi đấu Thể dục Thể thao',
            description: 'Đạt huy chương / giải thưởng tại đại hội hoặc giải thể thao cấp Trường trở lên.',
            displayOrder: 2,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
            ruleHelper: 'Bắt buộc đạt giải thưởng',
          },
        ],
      },
      // 4. VOLUNTEER Criterion (1 of 2 alternatives)
      {
        id: 'cg-volunteer',
        seasonId,
        track: 'INDIVIDUAL',
        code: 'VOLUNTEER',
        title: 'Tiêu chí Tình nguyện tốt',
        shortTitle: 'Tình nguyện tốt',
        displayOrder: 6,
        groupType: 'AT_LEAST_N',
        minSelections: 1,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tc4-1',
            criterionGroupId: 'cg-volunteer',
            code: 'TC4.1',
            title: 'Hoạt động tình nguyện tích lũy >= 5 ngày',
            description: 'Tham gia các hoạt động tình nguyện cộng đồng, hiến máu (1 lần = 1 ngày quy đổi).',
            displayOrder: 1,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
            ruleHelper: 'Tích lũy tối thiểu 5 ngày',
          },
          {
            id: 'req-tc4-2',
            criterionGroupId: 'cg-volunteer',
            code: 'TC4.2',
            title: 'Khen thưởng hoạt động tình nguyện',
            description: 'Được Đoàn, Hội hoặc cơ quan chính quyền khen thưởng về công tác tình nguyện.',
            displayOrder: 2,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
        ],
      },
      // 5.1 INTEGRATION Group A (Skills / Union - 1 of 2)
      {
        id: 'cg-integration-group-a',
        seasonId,
        track: 'INDIVIDUAL',
        code: 'INTEGRATION',
        title: 'Kỹ năng xã hội & Hoạt động Đoàn - Hội (Nhóm A)',
        shortTitle: 'Hội nhập - Nhóm A',
        displayOrder: 7,
        groupType: 'AT_LEAST_N',
        minSelections: 1,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tc5-1',
            criterionGroupId: 'cg-integration-group-a',
            code: 'TC5.1',
            title: 'Chứng nhận hoàn thành khóa tập huấn Kỹ năng xã hội',
            description: 'Đạt chứng nhận khóa kỹ năng mềm, kỹ năng thực hành xã hội.',
            displayOrder: 1,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
          {
            id: 'req-tc5-2',
            criterionGroupId: 'cg-integration-group-a',
            code: 'TC5.2',
            title: 'Giấy khen / Bằng khen công tác Đoàn - Hội',
            description: 'Khen thưởng công tác Đoàn TNCS Hồ Chí Minh hoặc Hội Sinh viên cấp Trường trở lên.',
            displayOrder: 2,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
        ],
      },
      // 5.2 INTEGRATION Group B (Language / International - 1 of 3)
      {
        id: 'cg-integration-group-b',
        seasonId,
        track: 'INDIVIDUAL',
        code: 'INTEGRATION',
        title: 'Ngoại ngữ & Giao lưu quốc tế (Nhóm B)',
        shortTitle: 'Hội nhập - Nhóm B',
        displayOrder: 8,
        groupType: 'AT_LEAST_N',
        minSelections: 1,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tc5-3',
            criterionGroupId: 'cg-integration-group-b',
            code: 'TC5.3',
            title: 'Chứng chỉ năng lực ngoại ngữ hoặc Điểm học phần ngoại ngữ',
            description: 'IELTS >= 4.5, TOEIC >= 405, TOEFL >= 53, B1/Vstep bậc 3, hoặc GPA môn ngoại ngữ >= 3.0/4 (7.5/10).',
            displayOrder: 1,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
            ruleHelper: 'IELTS 4.5, TOEIC 405, hoặc GPA môn tiếng Anh >= 3.0/4',
          },
          {
            id: 'req-tc5-4',
            criterionGroupId: 'cg-integration-group-b',
            code: 'TC5.4',
            title: 'Tham gia chương trình giao lưu quốc tế',
            description: 'Tham gia các diễn đàn, hội trại, trao đổi sinh viên quốc tế.',
            displayOrder: 2,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
          },
          {
            id: 'req-tc5-5',
            criterionGroupId: 'cg-integration-group-b',
            code: 'TC5.5',
            title: 'Đạt giải cuộc thi Ngoại ngữ cấp Trường trở lên',
            description: 'Đạt từ giải Ba trở lên tại cuộc thi tiếng Anh / ngoại ngữ cấp Trường trở lên.',
            displayOrder: 3,
            isMandatory: false,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'MULTIPLE',
            ruleHelper: 'Đạt từ Giải Ba trở lên',
          },
        ],
      },
    ];

    // 2. COLLECTIVE CRITERIA (TT01–TT04)
    const collectiveGroups: CriterionGroupDefinitionDto[] = [
      {
        id: 'cg-col-tt01',
        seasonId,
        track: 'COLLECTIVE',
        code: 'TT01',
        title: 'Tiêu chuẩn 1: Đạt danh hiệu Tập thể Sinh viên 5 tốt cấp Trường',
        shortTitle: 'TT01 - Danh hiệu cấp Trường',
        displayOrder: 1,
        groupType: 'ALL_REQUIRED',
        minSelections: 1,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tt01',
            criterionGroupId: 'cg-col-tt01',
            code: 'tt01',
            title: 'Văn bản công nhận Tập thể SV5T cấp Trường',
            description: 'Được công nhận danh hiệu Tập thể Sinh viên 5 tốt cấp Trường năm học tương ứng kèm minh chứng quyết định.',
            displayOrder: 1,
            isMandatory: true,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'SINGLE',
            ruleHelper: 'Quyết định công nhận của Đoàn / Hội cấp Trường',
          },
        ],
      },
      {
        id: 'cg-col-tt02',
        seasonId,
        track: 'COLLECTIVE',
        code: 'TT02',
        title: 'Tiêu chuẩn 2: 100% thành viên tham gia phong trào Sinh viên 5 tốt',
        shortTitle: 'TT02 - 100% tham gia phong trào',
        displayOrder: 2,
        groupType: 'ALL_REQUIRED',
        minSelections: 1,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tt02',
            criterionGroupId: 'cg-col-tt02',
            code: 'tt02',
            title: 'Tỷ lệ thành viên tham gia phong trào SV5T đạt 100%',
            description: '100% sinh viên trong tập thể đăng ký và tham gia phong trào SV5T (participatingMembers === totalMembers).',
            displayOrder: 1,
            isMandatory: true,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'SINGLE',
            ruleHelper: '100% thành viên tập thể',
          },
        ],
      },
      {
        id: 'cg-col-tt03',
        seasonId,
        track: 'COLLECTIVE',
        code: 'TT03',
        title: 'Tiêu chuẩn 3: Ít nhất 20% thành viên đạt danh hiệu Sinh viên 5 tốt cấp Trường',
        shortTitle: 'TT03 - >= 20% cá nhân SV5T',
        displayOrder: 3,
        groupType: 'ALL_REQUIRED',
        minSelections: 1,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tt03',
            criterionGroupId: 'cg-col-tt03',
            code: 'tt03',
            title: 'Tỷ lệ sinh viên đạt danh hiệu SV5T cấp Trường >= 20%',
            description: 'Tối thiểu 20% thành viên trong tập thể đạt danh hiệu SV5T cấp Trường (recognizedMembers * 100 >= totalMembers * 20).',
            displayOrder: 1,
            isMandatory: true,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'SINGLE',
            ruleHelper: '>= 20% thành viên tập thể',
          },
        ],
      },
      {
        id: 'cg-col-tt04',
        seasonId,
        track: 'COLLECTIVE',
        code: 'TT04',
        title: 'Tiêu chuẩn 4: Không có thành viên vi phạm kỷ luật',
        shortTitle: 'TT04 - Không vi phạm kỷ luật',
        displayOrder: 4,
        groupType: 'ALL_REQUIRED',
        minSelections: 1,
        isMandatory: true,
        requirements: [
          {
            id: 'req-tt04',
            criterionGroupId: 'cg-col-tt04',
            code: 'tt04',
            title: 'Cam kết và xác nhận không có thành viên vi phạm',
            description: 'Không có thành viên bị kỷ luật từ hình thức khiển trách trở lên trong năm học (yêu cầu thẩm tra thực tế).',
            displayOrder: 1,
            isMandatory: true,
            requiresEvidence: true,
            allowMultipleEvidence: true,
            declarationMultiplicity: 'SINGLE',
            ruleHelper: 'Không có thành viên vi phạm kỷ luật',
          },
        ],
      },
    ];

    this.groups = [...individualGroups, ...collectiveGroups];
  }

  public async getSeasonCriteria(
    seasonId: string,
    track: CriterionTrack
  ): Promise<CriterionGroupDefinitionDto[]> {
    return this.groups.filter((g) => g.seasonId === seasonId && g.track === track);
  }

  public async getCriterionGroupByCode(
    seasonId: string,
    track: CriterionTrack,
    code: string
  ): Promise<CriterionGroupDefinitionDto | null> {
    return (
      this.groups.find(
        (g) => g.seasonId === seasonId && g.track === track && g.code === code
      ) || null
    );
  }

  public async saveCriterionGroup(
    data: Omit<CriterionGroupDefinitionDto, 'id' | 'requirements'>
  ): Promise<CriterionGroupDefinitionDto> {
    const id = `cg-${data.code.toLowerCase()}-${Date.now()}`;
    const group: CriterionGroupDefinitionDto = {
      ...data,
      id,
      requirements: [],
    };
    this.groups.push(group);
    return group;
  }

  public async saveRequirement(
    criterionGroupId: string,
    data: Omit<RequirementDefinitionDto, 'id' | 'criterionGroupId'>
  ): Promise<RequirementDefinitionDto> {
    const group = this.groups.find((g) => g.id === criterionGroupId);
    if (!group) {
      throw new Error(`Criterion group ${criterionGroupId} not found.`);
    }
    const req: RequirementDefinitionDto = {
      ...data,
      id: `req-${data.code.toLowerCase()}-${Date.now()}`,
      criterionGroupId,
    };
    group.requirements.push(req);
    return req;
  }

  public async replaceSeasonCriteria(
    seasonId: string,
    track: CriterionTrack,
    groups: CriterionGroupDefinitionDto[]
  ): Promise<CriterionGroupDefinitionDto[]> {
    this.groups = this.groups.filter(
      (g) => !(g.seasonId === seasonId && g.track === track)
    );
    const normalized = groups.map((g, idx) => ({
      ...g,
      id: g.id || `cg-${seasonId}-${g.code.toLowerCase()}-${idx}`,
      seasonId,
      track,
      requirements: (g.requirements || []).map((r, rIdx) => ({
        ...r,
        id: r.id || `req-${seasonId}-${r.code.toLowerCase()}-${rIdx}`,
        criterionGroupId: g.id || `cg-${seasonId}-${g.code.toLowerCase()}-${idx}`,
      })),
    }));
    this.groups.push(...normalized);
    return normalized;
  }
}

