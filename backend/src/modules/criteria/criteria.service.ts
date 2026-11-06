/**
 * 5TOT Đà Nẵng — Criteria Domain & Advisory Evaluation Service (Backend V2)
 * Cơ quan chỉ đạo: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements authoritative regulation semantics:
 * - Exactly 5 Individual criteria (Ethics, Academic, Physical, Volunteer, Integration).
 * - Collective TT01–TT04 evaluation with shared totalMembers denominator & exact integer math.
 * - Alternative fulfillment: 1 of N satisfies AT_LEAST_N when min=1; voluntary extra declarations allowed.
 * - Advisory checks do NOT block student or collective application submission.
 * - Admin configuration validation, season cloning, and dry-run simulation.
 */

import type { ICriteriaRepository } from './criteria.repository';
import type {
  CriterionGroupDefinitionDto,
  IndividualCriterionCode,
  DeclarationItemInput,
  CriterionAdvisoryResult,
  IndividualAdvisoryEvaluationResult,
  CollectiveDeclarationInput,
  CollectiveAdvisoryEvaluationResult,
  CriterionTrack,
} from './criteria.types';
import { ApiError } from '../../shared/errors/apiError';

const CANONICAL_INDIVIDUAL_CODES: readonly IndividualCriterionCode[] = [
  'ETHICS',
  'ACADEMIC',
  'PHYSICAL',
  'VOLUNTEER',
  'INTEGRATION',
];

const CANONICAL_COLLECTIVE_CODES = ['TT01', 'TT02', 'TT03', 'TT04'] as const;

export class CriteriaService {
  constructor(private readonly criteriaRepo: ICriteriaRepository) {}

  public async getSeasonCriteria(
    seasonId: string,
    track: CriterionTrack = 'INDIVIDUAL'
  ): Promise<CriterionGroupDefinitionDto[]> {
    return this.criteriaRepo.getSeasonCriteria(seasonId, track);
  }

  /**
   * Validates Admin Criteria Configuration for Individual or Collective Track.
   * Rejects impossible AT_LEAST_N rules, missing 5 canonical criteria, or broken TT01-TT04 rules.
   */
  public validateCriteriaConfiguration(
    track: CriterionTrack,
    groups: CriterionGroupDefinitionDto[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (groups.length === 0) {
      errors.push('Danh sách nhóm tiêu chuẩn không được để trống.');
      return { valid: false, errors };
    }

    if (track === 'INDIVIDUAL') {
      const presentCodes = new Set(groups.map((g) => g.code));
      for (const reqCode of CANONICAL_INDIVIDUAL_CODES) {
        if (!presentCodes.has(reqCode)) {
          errors.push(`Thiếu nhóm tiêu chí cá nhân bắt buộc: ${reqCode} (Bộ tiêu chuẩn phải đủ 5 tiêu chí).`);
        }
      }
      for (const g of groups) {
        if (!CANONICAL_INDIVIDUAL_CODES.includes(g.code as IndividualCriterionCode)) {
          errors.push(`Mã tiêu chí cá nhân "${g.code}" không nằm trong 5 tiêu chí chuẩn của Trung ương Hội Sinh viên.`);
        }
      }
    } else {
      const presentCodes = new Set(groups.map((g) => g.code));
      for (const ttCode of CANONICAL_COLLECTIVE_CODES) {
        if (!presentCodes.has(ttCode)) {
          errors.push(`Thiếu tiêu chuẩn Tập thể Sinh viên 5 tốt bắt buộc: ${ttCode} (TT01–TT04).`);
        }
      }
    }

    for (const group of groups) {
      if (!group.requirements || group.requirements.length === 0) {
        errors.push(`Nhóm "${group.title}" (${group.code}) phải có ít nhất 1 điều kiện con.`);
        continue;
      }

      if (group.groupType === 'AT_LEAST_N') {
        if (group.minSelections < 1) {
          errors.push(`Nhóm "${group.title}" (${group.code}) có cấu hình AT_LEAST_N nhưng số lượng tối thiểu < 1.`);
        }
        if (group.minSelections > group.requirements.length) {
          errors.push(
            `Nhóm "${group.title}" (${group.code}) yêu cầu chọn tối thiểu ${group.minSelections} mục nhưng chỉ có ${group.requirements.length} điều kiện con (cấu hình mâu thuẫn).`
          );
        }
      }

      for (const req of group.requirements) {
        if (!req.code?.trim() || !req.title?.trim()) {
          errors.push(`Nhóm "${group.title}": Có điều kiện con bị thiếu mã hoặc tên hiển thị.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Updates Season Criteria Configuration (Admin Protected).
   * Prevents destructive modifications to closed/archived historical seasons.
   */
  public async updateSeasonCriteria(
    seasonId: string,
    track: CriterionTrack,
    groups: CriterionGroupDefinitionDto[],
    isSeasonHistoricalLocked = false
  ): Promise<CriterionGroupDefinitionDto[]> {
    if (isSeasonHistoricalLocked) {
      throw ApiError.conflict(
        'Không thể sửa đổi bộ tiêu chuẩn của mùa xét chọn đã đóng hoặc đã lưu trữ lịch sử.',
        'SEASON_CRITERIA_FROZEN'
      );
    }

    const validation = this.validateCriteriaConfiguration(track, groups);
    if (!validation.valid) {
      throw ApiError.badRequest(validation.errors[0], 'INVALID_CRITERIA_CONFIGURATION');
    }

    if (this.criteriaRepo.replaceSeasonCriteria) {
      return this.criteriaRepo.replaceSeasonCriteria(seasonId, track, groups);
    }

    const saved: CriterionGroupDefinitionDto[] = [];
    for (const group of groups) {
      const createdGroup = await this.criteriaRepo.saveCriterionGroup({
        seasonId,
        track,
        code: group.code,
        title: group.title,
        shortTitle: group.shortTitle,
        displayOrder: group.displayOrder,
        groupType: group.groupType,
        minSelections: group.minSelections,
        isMandatory: group.isMandatory,
        ruleConfig: {
          ...(group.ruleConfig || {}),
          groupType: group.groupType,
          minSelections: group.minSelections,
        },
      });
      const reqs = [];
      for (const req of group.requirements) {
        const createdReq = await this.criteriaRepo.saveRequirement(createdGroup.id, {
          code: req.code,
          title: req.title,
          description: req.description,
          displayOrder: req.displayOrder,
          isMandatory: req.isMandatory,
          requiresEvidence: req.requiresEvidence,
          allowMultipleEvidence: req.allowMultipleEvidence,
          declarationMultiplicity: req.declarationMultiplicity,
          ruleHelper: req.ruleHelper,
          inputSchema: req.inputSchema,
        });
        reqs.push(createdReq);
      }
      saved.push({
        ...createdGroup,
        requirements: reqs,
      });
    }
    return saved;
  }

  /**
   * Clones Individual and Collective criteria from sourceSeasonId into targetSeasonId.
   */
  public async cloneSeasonCriteria(
    sourceSeasonId: string,
    targetSeasonId: string
  ): Promise<{
    individualGroupsCount: number;
    collectiveGroupsCount: number;
  }> {
    const sourceIndividual = await this.criteriaRepo.getSeasonCriteria(sourceSeasonId, 'INDIVIDUAL');
    const sourceCollective = await this.criteriaRepo.getSeasonCriteria(sourceSeasonId, 'COLLECTIVE');

    if (sourceIndividual.length > 0) {
      await this.updateSeasonCriteria(targetSeasonId, 'INDIVIDUAL', sourceIndividual, false);
    }
    if (sourceCollective.length > 0) {
      await this.updateSeasonCriteria(targetSeasonId, 'COLLECTIVE', sourceCollective, false);
    }

    return {
      individualGroupsCount: sourceIndividual.length,
      collectiveGroupsCount: sourceCollective.length,
    };
  }

  /**
   * Evaluates Student Individual Application Declarations (Advisory Evaluation).
   * Notice: Advisory evaluation generates helpful readiness scores and warnings,
   * but NEVER blocks submission (isSubmissionBlocked is always false).
   */
  public evaluateIndividualAdvisory(
    declarations: DeclarationItemInput[]
  ): IndividualAdvisoryEvaluationResult {
    const criteriaCodes: IndividualCriterionCode[] = [
      'ETHICS',
      'ACADEMIC',
      'PHYSICAL',
      'VOLUNTEER',
      'INTEGRATION',
    ];

    const results: Record<IndividualCriterionCode, CriterionAdvisoryResult> = {
      ETHICS: {
        criterionCode: 'ETHICS',
        isMet: false,
        declaredCount: 0,
        evidenceCount: 0,
        satisfiedRequirements: [],
        warnings: [],
      },
      ACADEMIC: {
        criterionCode: 'ACADEMIC',
        isMet: false,
        declaredCount: 0,
        evidenceCount: 0,
        satisfiedRequirements: [],
        warnings: [],
      },
      PHYSICAL: {
        criterionCode: 'PHYSICAL',
        isMet: false,
        declaredCount: 0,
        evidenceCount: 0,
        satisfiedRequirements: [],
        warnings: [],
      },
      VOLUNTEER: {
        criterionCode: 'VOLUNTEER',
        isMet: false,
        declaredCount: 0,
        evidenceCount: 0,
        satisfiedRequirements: [],
        warnings: [],
      },
      INTEGRATION: {
        criterionCode: 'INTEGRATION',
        isMet: false,
        declaredCount: 0,
        evidenceCount: 0,
        satisfiedRequirements: [],
        warnings: [],
      },
    };

    const allDeclaredReqs = new Set<string>();
    const missingRequirements: string[] = [];
    const advisoryWarnings: string[] = [];

    for (const decl of declarations) {
      const code = decl.criterionCode;
      if (results[code]) {
        results[code].declaredCount += 1;
        results[code].evidenceCount += decl.evidenceCount ?? 0;
        results[code].satisfiedRequirements.push(decl.requirementCode);
        allDeclaredReqs.add(decl.requirementCode);
      }
    }

    // 1. ETHICS Evaluation (Hướng dẫn 14-HD/BTK-HSVTP: TC1.1 & TC1.2 bắt buộc VÀ ít nhất 1/4 tiêu chuẩn bổ sung TC1.3–TC1.6):
    const hasEthicsScore = allDeclaredReqs.has('TC1.1') || allDeclaredReqs.has('ethics-score');
    const hasEthicsLaw = allDeclaredReqs.has('TC1.2') || allDeclaredReqs.has('ethics-law');
    const hasEthicsSupplement =
      allDeclaredReqs.has('TC1.3') ||
      allDeclaredReqs.has('ethics-party') ||
      allDeclaredReqs.has('TC1.4') ||
      allDeclaredReqs.has('ethics-politics-team') ||
      allDeclaredReqs.has('TC1.5') ||
      allDeclaredReqs.has('ethics-politics-paper') ||
      allDeclaredReqs.has('TC1.6') ||
      allDeclaredReqs.has('ethics-commendation');

    if (hasEthicsScore && hasEthicsLaw && hasEthicsSupplement) {
      results.ETHICS.isMet = true;
    } else {
      if (!hasEthicsScore) missingRequirements.push('Đạo đức: Điểm rèn luyện cả năm từ 80/100 trở lên hoặc xếp loại Giỏi (TC1.1)');
      if (!hasEthicsLaw) missingRequirements.push('Đạo đức: Không vi phạm pháp luật và các quy chế, nội quy (TC1.2)');
      if (!hasEthicsSupplement) missingRequirements.push('Đạo đức: Đạt thêm ít nhất 01 trong 04 tiêu chuẩn bổ sung (TC1.3–TC1.6)');
      results.ETHICS.warnings.push('Chưa hoàn thành đủ các điều kiện bắt buộc và bổ sung của Tiêu chí 1: Đạo đức tốt.');
    }

    // 2. ACADEMIC Evaluation (Hướng dẫn 14-HD/BTK-HSVTP: TC2.1 bắt buộc + Đạt ít nhất 01 trong 06 tiêu chuẩn TC2.2–TC2.7):
    const hasAcademicGpa = allDeclaredReqs.has('TC2.1') || allDeclaredReqs.has('academic-gpa');
    const hasAcademicAch =
      allDeclaredReqs.has('TC2.2') ||
      allDeclaredReqs.has('academic-nckh') ||
      allDeclaredReqs.has('TC2.3') ||
      allDeclaredReqs.has('academic-paper') ||
      allDeclaredReqs.has('TC2.4') ||
      allDeclaredReqs.has('academic-presentation') ||
      allDeclaredReqs.has('TC2.5') ||
      allDeclaredReqs.has('academic-product') ||
      allDeclaredReqs.has('TC2.6') ||
      allDeclaredReqs.has('academic-team') ||
      allDeclaredReqs.has('TC2.7') ||
      allDeclaredReqs.has('academic-innovation');

    if (hasAcademicGpa && hasAcademicAch) {
      results.ACADEMIC.isMet = true;
    } else {
      if (!hasAcademicGpa) missingRequirements.push('Học tập: Điểm trung bình học tập cả năm đạt chuẩn ĐH >= 3.2/4 (8.0/10) hoặc CĐ >= 3.0/4 (7.5/10) (TC2.1)');
      if (!hasAcademicAch) missingRequirements.push('Học tập: Đạt ít nhất 01 trong 06 tiêu chuẩn NCKH / học thuật (TC2.2–TC2.7)');
      results.ACADEMIC.warnings.push('Chưa hoàn thành đủ điều kiện điểm GPA hoặc tiêu chuẩn NCKH / học thuật.');
    }

    // 3. PHYSICAL Evaluation (Hướng dẫn 14-HD/BTK-HSVTP: Đạt ít nhất 01 trong 02 tiêu chuẩn TC3.1–TC3.2):
    const hasPhysicalMet =
      allDeclaredReqs.has('TC3.1') ||
      allDeclaredReqs.has('physical-khoe') ||
      allDeclaredReqs.has('TC3.2') ||
      allDeclaredReqs.has('physical-sport');

    if (hasPhysicalMet) {
      results.PHYSICAL.isMet = true;
    } else {
      missingRequirements.push('Thể lực: Đạt danh hiệu Thanh niên khỏe / Sinh viên khỏe cấp Trường+ hoặc đạt giải thể thao phong trào cấp Khoa+ (TC3.1–TC3.2)');
      results.PHYSICAL.warnings.push('Chưa kê khai tiêu chuẩn thể lực hợp lệ.');
    }

    // 4. VOLUNTEER Evaluation (Hướng dẫn 14-HD/BTK-HSVTP: Tích lũy >= 05 ngày tình nguyện/năm TC4.1 HOẶC khen thưởng tình nguyện cấp Khoa+ TC4.2):
    const hasVolMet =
      allDeclaredReqs.has('TC4.1') ||
      allDeclaredReqs.has('volunteer-activities') ||
      allDeclaredReqs.has('TC4.2') ||
      allDeclaredReqs.has('volunteer-award');

    if (hasVolMet) {
      results.VOLUNTEER.isMet = true;
    } else {
      missingRequirements.push('Tình nguyện: Tích lũy ít nhất 05 ngày tình nguyện/năm hoặc được khen thưởng hoạt động tình nguyện từ cấp khoa trở lên (TC4.1–TC4.2)');
      results.VOLUNTEER.warnings.push('Chưa kê khai tiêu chuẩn tình nguyện hợp lệ.');
    }

    // 5. INTEGRATION Evaluation (Hướng dẫn 14-HD/BTK-HSVTP: Cả Nhóm A [TC5.1–TC5.2] VÀ Nhóm B [TC5.3–TC5.5]):
    const hasIntGroupA =
      allDeclaredReqs.has('TC5.1') ||
      allDeclaredReqs.has('integration-skills') ||
      allDeclaredReqs.has('TC5.2') ||
      allDeclaredReqs.has('integration-union-award');

    const hasIntGroupB =
      allDeclaredReqs.has('TC5.3') ||
      allDeclaredReqs.has('integration-lang') ||
      allDeclaredReqs.has('TC5.4') ||
      allDeclaredReqs.has('integration-intl') ||
      allDeclaredReqs.has('TC5.5') ||
      allDeclaredReqs.has('integration-contest');

    if (hasIntGroupA && hasIntGroupB) {
      results.INTEGRATION.isMet = true;
    } else {
      if (!hasIntGroupA) missingRequirements.push('Hội nhập (Nhóm A): Khóa kỹ năng thực hành xã hội hoặc khen thưởng Đoàn – Hội từ cấp khoa trở lên (TC5.1–TC5.2)');
      if (!hasIntGroupB) missingRequirements.push('Hội nhập (Nhóm B): Ngoại ngữ, Giao lưu quốc tế hoặc Cuộc thi ngoại ngữ/kiến thức từ giải Ba trở lên (TC5.3–TC5.5)');
      results.INTEGRATION.warnings.push('Chưa hoàn thành đủ cả hai nhóm điều kiện của Tiêu chí Hội nhập tốt.');
    }

    const metCount = criteriaCodes.filter((code) => results[code].isMet).length;
    const readinessPercentage = Math.round((metCount / 5) * 100);
    const isOverallEligible = metCount === 5;

    if (!isOverallEligible) {
      advisoryWarnings.push(
        `Hồ sơ hiện đạt ${metCount}/5 tiêu chí cơ bản (${readinessPercentage}% mức sẵn sàng). Vui lòng kiểm tra các tiêu chí chưa đạt trước khi hoàn thiện.`
      );
    }

    return {
      isOverallEligible,
      readinessPercentage,
      criteriaResults: results,
      advisoryWarnings,
      missingRequirements,
      isSubmissionBlocked: false,
    };
  }

  /**
   * Evaluates Collective Student 5-Good Declarations (TT01–TT04).
   * Exact integer arithmetic: recognizedMembers * 100 >= totalMembers * 20.
   * Single shared denominator: totalMembers > 0.
   */
  public evaluateCollectiveAdvisory(
    input: CollectiveDeclarationInput
  ): CollectiveAdvisoryEvaluationResult {
    const {
      totalMembers,
      participatingMembers,
      recognizedMembers,
      hasPriorSchoolRecognition,
      hasSchoolEvidenceAttached,
      noViolationsDeclared,
    } = input;

    if (totalMembers <= 0) {
      throw ApiError.badRequest(
        'Tổng số thành viên tập thể (totalMembers) phải là số nguyên dương lớn hơn 0.'
      );
    }

    const advisoryWarnings: string[] = [];

    const tt01Met = hasPriorSchoolRecognition && hasSchoolEvidenceAttached;
    let tt01Warning: string | undefined;
    if (!hasPriorSchoolRecognition) {
      tt01Warning = 'Chưa đạt danh hiệu Tập thể Sinh viên 5 tốt cấp Trường năm học tương ứng.';
      advisoryWarnings.push('TT01: Thiếu danh hiệu Tập thể SV5T cấp Trường.');
    } else if (!hasSchoolEvidenceAttached) {
      tt01Warning = 'Cần đính kèm minh chứng văn bản công nhận Tập thể SV5T cấp Trường.';
      advisoryWarnings.push('TT01: Chưa đính kèm quyết định/giấy khen công nhận cấp Trường.');
    }

    const tt02ActualPercentage = Math.round((participatingMembers / totalMembers) * 100);
    const tt02Met = participatingMembers >= totalMembers;
    let tt02Warning: string | undefined;
    if (!tt02Met) {
      tt02Warning = `Tỷ lệ tham gia phong trào đạt ${tt02ActualPercentage}% (${participatingMembers}/${totalMembers}), yêu cầu đạt 100%.`;
      advisoryWarnings.push(`TT02: Chưa đạt 100% thành viên tham gia phong trào (${participatingMembers}/${totalMembers}).`);
    }

    const minRequiredMembers = Math.ceil(totalMembers * 0.2);
    const tt03Met = recognizedMembers * 100 >= totalMembers * 20;
    const tt03ActualPercentage = Math.round((recognizedMembers / totalMembers) * 100);
    let tt03Warning: string | undefined;
    if (!tt03Met) {
      tt03Warning = `Số lượng cá nhân đạt SV5T cấp Trường là ${recognizedMembers}/${totalMembers} (${tt03ActualPercentage}%), yêu cầu tối thiểu ${minRequiredMembers} thành viên (>= 20%).`;
      advisoryWarnings.push(`TT03: Chưa đạt tỷ lệ 20% cá nhân SV5T cấp Trường (cần tối thiểu ${minRequiredMembers} thành viên).`);
    }

    const tt04Met = noViolationsDeclared;
    let tt04Warning: string | undefined;
    if (!noViolationsDeclared) {
      tt04Warning = 'Tập thể có vi phạm kỷ luật hoặc chưa cam kết không vi phạm.';
      advisoryWarnings.push('TT04: Chưa cam kết không có thành viên vi phạm kỷ luật/pháp luật.');
    }

    const metCriteriaCount = [tt01Met, tt02Met, tt03Met, tt04Met].filter(Boolean).length;
    const readinessPercentage = Math.round((metCriteriaCount / 4) * 100);
    const isOverallEligible = metCriteriaCount === 4;

    return {
      isOverallEligible,
      readinessPercentage,
      totalMembers,
      tt01: {
        isMet: tt01Met,
        hasSchoolRecognition: hasPriorSchoolRecognition,
        hasEvidence: hasSchoolEvidenceAttached,
        warning: tt01Warning,
      },
      tt02: {
        isMet: tt02Met,
        participatingMembers,
        requiredPercentage: 100,
        actualPercentage: tt02ActualPercentage,
        warning: tt02Warning,
      },
      tt03: {
        isMet: tt03Met,
        recognizedMembers,
        minRequiredMembers,
        requiredPercentage: 20,
        actualPercentage: tt03ActualPercentage,
        warning: tt03Warning,
      },
      tt04: {
        isMet: tt04Met,
        noViolationsDeclared,
        humanVerificationRequired: true,
        warning: tt04Warning,
      },
      advisoryWarnings,
      isSubmissionBlocked: false,
    };
  }
}
