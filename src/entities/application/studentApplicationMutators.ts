/**
 * 5TOT Đà Nẵng — Student Application Pure Domain Mutators & Selectors (FSD Entities Layer)
 * Synchronizes criteria requirement mutations, declaration/evidence CRUD, summary strings, and live stats.
 */

import {
  ApplicationCriterion,
  ApplicationDeclaration,
  ApplicationEvidence,
  ApplicationRequirement,
  StudentApplicationData,
  OTHER_ACHIEVEMENTS_REQ_ID,
  buildOtherAchievementsCriterion,
} from '../../demo/fixtures/studentApplication';
import { resolveMultiplicity } from '../../demo/fixtures/criteriaDefinitions';
import { PreSubmitAdvisoryItem } from '../../components/submission/submissionTypes';
import { RequirementStatus } from '../../tokens';
import { StudentProfileDto } from './studentApplicationTypes';

export function syncCriteriaWithUpdate(
  prevCriteria: ApplicationCriterion[],
  reqId: string,
  updateReq: (req: ApplicationRequirement) => ApplicationRequirement
): ApplicationCriterion[] {
  return prevCriteria.map((crit) => {
    const updatedReqs = crit.requirements.map((r) => (r.id === reqId ? updateReq(r) : r));
    const updatedGroups = crit.groups?.map((grp) => ({
      ...grp,
      requirements: grp.requirements.map((r) => (r.id === reqId ? updateReq(r) : r)),
    }));

    const declaredReqs = updatedReqs.filter((r) => r.declarations && r.declarations.length > 0);
    const totalEvidence = updatedReqs.reduce(
      (sum, r) => sum + r.declarations.reduce((dSum, d) => dSum + (d.evidenceFiles?.length || 0), 0),
      0
    );

    let shortSummary = crit.shortSummary;
    if (crit.id === 'volunteer') {
      const volActDecls = updatedReqs.find((r) => r.id === 'volunteer-activities')?.declarations || [];
      const volAwardDecls = updatedReqs.find((r) => r.id === 'volunteer-award')?.declarations || [];
      const totalActivities = volActDecls.length;
      let totalDays = 0;
      let bloodCount = 0;
      for (const d of volActDecls) {
        const combined = `${d.value} ${d.detail || ''}`.toLowerCase();
        if (
          d.metadata?.volActivityType === 'blood_donation' ||
          combined.includes('hiến máu') ||
          combined.includes('hien mau')
        ) {
          bloodCount++;
          totalDays += 1;
        } else if (d.metadata?.days || d.metadata?.volDaysCount) {
          const p = parseInt(d.metadata.days || d.metadata.volDaysCount || '1', 10);
          totalDays += isNaN(p) ? 1 : p;
        } else {
          const dayMatch = combined.match(/(\d+)\s*ngày/i);
          totalDays += dayMatch ? parseInt(dayMatch[1], 10) : 1;
        }
      }
      if (volAwardDecls.length > 0 && totalActivities === 0) {
        shortSummary = `${volAwardDecls.length} giấy khen tình nguyện · ${totalEvidence} minh chứng`;
      } else {
        shortSummary = `${totalActivities} hoạt động đã khai · ${totalEvidence} minh chứng · ${totalDays}/5 ngày tình nguyện${
          bloodCount > 0 ? ` (${bloodCount} lần hiến máu)` : ''
        }`;
      }
    } else {
      shortSummary = `${declaredReqs.length} nội dung đã kê khai · ${totalEvidence} minh chứng`;
    }

    const nextStatusLabel =
      crit.statusLabel &&
      crit.statusLabel !== 'Chưa kê khai' &&
      crit.statusLabel !== 'Đã kê khai'
        ? crit.statusLabel
        : declaredReqs.length > 0
        ? 'Đã kê khai'
        : 'Chưa kê khai';

    return {
      ...crit,
      shortSummary,
      statusLabel: nextStatusLabel,
      groups: updatedGroups || crit.groups,
      requirements: updatedReqs,
    };
  });
}

export function applyConfirmEvidenceToApplication(
  prev: StudentApplicationData,
  fileId: string
): StudentApplicationData {
  const newCriteria = prev.criteria.map((crit) => ({
    ...crit,
    requirements: crit.requirements.map((req) => {
      const updatedDeclarations = req.declarations.map((decl) => ({
        ...decl,
        evidenceFiles: decl.evidenceFiles.map((f) =>
          f.id === fileId ? { ...f, status: 'ready' as RequirementStatus } : f
        ),
      }));

      const hasFile = req.declarations.some((d) =>
        d.evidenceFiles.some((f) => f.id === fileId)
      );
      return {
        ...req,
        declarations: updatedDeclarations,
        status: hasFile ? ('ready' as RequirementStatus) : req.status,
        recommendation: hasFile ? undefined : req.recommendation,
      };
    }),
  }));

  const newOtherAchievements = (prev.otherAchievements || []).map((decl) => ({
    ...decl,
    evidenceFiles: (decl.evidenceFiles || []).map((f) =>
      f.id === fileId ? { ...f, status: 'ready' as RequirementStatus } : f
    ),
  }));

  return {
    ...prev,
    criteria: newCriteria,
    otherAchievements: newOtherAchievements,
  };
}

export function applySaveDeclarationMutation(
  prev: StudentApplicationData,
  reqId: string,
  declData: {
    value: string;
    detail?: string;
    date?: string;
    metadata?: Record<string, string>;
  },
  evidenceFiles: ApplicationEvidence[],
  existingDeclId: string | undefined,
  isSupplementActive: boolean
): StudentApplicationData {
  if (reqId === OTHER_ACHIEVEMENTS_REQ_ID) {
    const existingList = prev.otherAchievements || [];
    if (existingDeclId) {
      return {
        ...prev,
        otherAchievements: existingList.map((d) =>
          d.id === existingDeclId
            ? {
                ...d,
                value: declData.value,
                detail: declData.detail,
                date: declData.date || d.date,
                metadata: declData.metadata,
                evidenceFiles,
              }
            : d
        ),
      };
    }
    const newOtherDecl: ApplicationDeclaration = {
      id: `decl-other-${Date.now()}`,
      value: declData.value,
      detail: declData.detail,
      date: declData.date || new Date().toLocaleDateString('vi-VN'),
      metadata: declData.metadata,
      evidenceFiles: evidenceFiles.map((f) => ({
        ...f,
        isNewlyAddedSupplement: isSupplementActive
          ? true
          : f.isNewlyAddedSupplement,
      })),
    };
    return {
      ...prev,
      otherAchievements: [...existingList, newOtherDecl],
    };
  }

  if (existingDeclId) {
    return {
      ...prev,
      criteria: syncCriteriaWithUpdate(prev.criteria, reqId, (req) => ({
        ...req,
        status: (isSupplementActive ? 'supplement' : 'ready') as RequirementStatus,
        declarations: req.declarations.map((d) => {
          if (d.id !== existingDeclId) return d;
          return {
            ...d,
            value: declData.value,
            detail: declData.detail,
            date: declData.date || d.date,
            metadata: declData.metadata,
            evidenceFiles,
          };
        }),
      })),
    };
  }

  const newDecl: ApplicationDeclaration = {
    id: `decl-${Date.now()}`,
    value: declData.value,
    detail: declData.detail,
    date: declData.date || new Date().toLocaleDateString('vi-VN'),
    metadata: declData.metadata,
    evidenceFiles: evidenceFiles.map((f) => ({
      ...f,
      isNewlyAddedSupplement: isSupplementActive
        ? true
        : f.isNewlyAddedSupplement,
    })),
  };

  return {
    ...prev,
    criteria: syncCriteriaWithUpdate(prev.criteria, reqId, (req) => {
      const isMulti =
        resolveMultiplicity(req.declarationMultiplicity) === 'MULTIPLE' ||
        req.declarationMode === 'repeatable' ||
        req.allowMultipleDeclarations;
      const updatedDeclarations = isMulti
        ? [...req.declarations, newDecl]
        : [newDecl];

      return {
        ...req,
        status: (isSupplementActive ? 'supplement' : 'ready') as RequirementStatus,
        isOptionalEmpty: false,
        declarations: updatedDeclarations,
      };
    }),
  };
}

export function applyUpdateDeclarationInlineMutation(
  prev: StudentApplicationData,
  reqId: string,
  declarationId: string,
  updated: { value: string; detail?: string }
): StudentApplicationData {
  if (reqId === OTHER_ACHIEVEMENTS_REQ_ID) {
    return {
      ...prev,
      otherAchievements: (prev.otherAchievements || []).map((d) =>
        d.id === declarationId
          ? {
              ...d,
              value: updated.value,
              detail: updated.detail,
            }
          : d
      ),
    };
  }
  return {
    ...prev,
    criteria: syncCriteriaWithUpdate(prev.criteria, reqId, (req) => ({
      ...req,
      status: 'declared' as RequirementStatus,
      declarations: req.declarations.map((d) =>
        d.id === declarationId
          ? {
              ...d,
              value: updated.value,
              detail: updated.detail,
            }
          : d
      ),
    })),
  };
}

export function applyAddDeclarationInlineMutation(
  prev: StudentApplicationData,
  reqId: string,
  newDecl: ApplicationDeclaration
): StudentApplicationData {
  if (reqId === OTHER_ACHIEVEMENTS_REQ_ID) {
    return {
      ...prev,
      otherAchievements: [...(prev.otherAchievements || []), newDecl],
    };
  }
  return {
    ...prev,
    criteria: syncCriteriaWithUpdate(prev.criteria, reqId, (req) => {
      const isMulti =
        resolveMultiplicity(req.declarationMultiplicity) === 'MULTIPLE' ||
        req.declarationMode === 'repeatable' ||
        req.allowMultipleDeclarations;

      return {
        ...req,
        status: 'ready' as RequirementStatus,
        isOptionalEmpty: false,
        declarations: isMulti ? [...req.declarations, newDecl] : [newDecl],
      };
    }),
  };
}

export function applyDeleteDeclarationMutation(
  prev: StudentApplicationData,
  reqId: string,
  declId: string
): StudentApplicationData {
  if (reqId === OTHER_ACHIEVEMENTS_REQ_ID) {
    return {
      ...prev,
      otherAchievements: (prev.otherAchievements || []).filter(
        (d) => d.id !== declId
      ),
    };
  }
  return {
    ...prev,
    criteria: syncCriteriaWithUpdate(prev.criteria, reqId, (req) => {
      const nextDeclarations = req.declarations.filter((d) => d.id !== declId);
      return {
        ...req,
        declarations: nextDeclarations,
        status: (nextDeclarations.length > 0 ? req.status : 'undeclared') as RequirementStatus,
        isOptionalEmpty: nextDeclarations.length === 0,
      };
    }),
  };
}

export function applyAppendEvidenceFilesMutation(
  prev: StudentApplicationData,
  reqId: string,
  declId: string,
  newFiles: ApplicationEvidence[],
  updateStatusTo?: RequirementStatus
): StudentApplicationData {
  if (reqId === OTHER_ACHIEVEMENTS_REQ_ID) {
    return {
      ...prev,
      otherAchievements: (prev.otherAchievements || []).map((d) =>
        d.id === declId
          ? {
              ...d,
              evidenceFiles: [...(d.evidenceFiles || []), ...newFiles],
            }
          : d
      ),
    };
  }
  return {
    ...prev,
    criteria: syncCriteriaWithUpdate(prev.criteria, reqId, (req) => ({
      ...req,
      status: updateStatusTo || req.status,
      declarations: req.declarations.map((d) =>
        d.id === declId
          ? {
              ...d,
              evidenceFiles: [...d.evidenceFiles, ...newFiles],
            }
          : d
      ),
    })),
  };
}

export function findEvidenceContextInApplication(
  application: StudentApplicationData,
  file: ApplicationEvidence
) {
  let foundCritName = 'Hội nhập tốt';
  let foundCritId = 'integration';
  let foundReqTitle = 'Chứng chỉ ngoại ngữ chuẩn quốc tế';
  let foundReqId = 'integration-lang';
  let foundDeclTitle: string | undefined;
  let siblingFiles: ApplicationEvidence[] = [file];

  for (const crit of application.criteria) {
    for (const req of crit.requirements) {
      for (const decl of req.declarations) {
        if (
          decl.evidenceFiles.some(
            (ef) => ef.id === file.id || ef.name === file.name
          )
        ) {
          foundCritName = crit.name;
          foundCritId = crit.id;
          foundReqTitle = req.title;
          foundReqId = req.id;
          foundDeclTitle = decl.value;
          siblingFiles = decl.evidenceFiles;
          break;
        }
      }
    }
  }

  for (const decl of application.otherAchievements || []) {
    if (
      (decl.evidenceFiles || []).some(
        (ef) => ef.id === file.id || ef.name === file.name
      )
    ) {
      foundCritName = 'Thành tích khác';
      foundCritId = 'other_achievements';
      foundReqTitle =
        'Các giải thưởng, bằng khen, giấy khen, sáng kiến hoặc thành tích tiêu biểu khác';
      foundReqId = OTHER_ACHIEVEMENTS_REQ_ID;
      foundDeclTitle = decl.value;
      siblingFiles = decl.evidenceFiles || [file];
      break;
    }
  }

  return {
    criterionId: foundCritId,
    criterionName: foundCritName,
    requirementId: foundReqId,
    requirementTitle: foundReqTitle,
    declarationTitle: foundDeclTitle,
    allEvidenceList: siblingFiles,
  };
}

export function findCriterionAndRequirementById(
  application: StudentApplicationData,
  reqId: string
): {
  criterion: ApplicationCriterion | null;
  requirement: ApplicationRequirement | null;
} {
  if (reqId === OTHER_ACHIEVEMENTS_REQ_ID) {
    const otherCrit = buildOtherAchievementsCriterion(
      application.otherAchievements
    );
    return {
      criterion: otherCrit,
      requirement: otherCrit.requirements[0] || null,
    };
  }
  for (const c of application.criteria) {
    const r = c.requirements.find((req) => req.id === reqId);
    if (r) {
      return { criterion: c, requirement: r };
    }
    if (c.groups) {
      for (const grp of c.groups) {
        const gr = grp.requirements.find((req) => req.id === reqId);
        if (gr) {
          return { criterion: c, requirement: gr };
        }
      }
    }
  }
  return { criterion: null, requirement: null };
}

export function calculateStudentApplicationSummaryStats(
  application: StudentApplicationData
) {
  const totalCriteria = application.criteria.length;
  const otherDecls = application.otherAchievements || [];
  const otherEvCount = otherDecls.reduce(
    (sum, d) => sum + (d.evidenceFiles?.length || 0),
    0
  );
  const totalDeclarations =
    application.criteria.reduce(
      (sum, c) =>
        sum +
        c.requirements.reduce((rSum, r) => rSum + r.declarations.length, 0),
      0
    ) + otherDecls.length;
  const totalEvidence =
    application.criteria.reduce(
      (sum, c) =>
        sum +
        c.requirements.reduce(
          (rSum, r) =>
            rSum +
            r.declarations.reduce(
              (dSum, d) => dSum + d.evidenceFiles.length,
              0
            ),
          0
        ),
      0
    ) + otherEvCount;
  const totalRecommendations = application.criteria.reduce(
    (sum, c) => sum + c.requirements.filter((r) => !!r.recommendation).length,
    0
  );

  return {
    totalCriteria,
    totalDeclarations,
    totalEvidence,
    totalRecommendations,
  };
}

export function computeDynamicPreSubmitAdvisories(
  criteria: ApplicationCriterion[],
  manualAdvisories: PreSubmitAdvisoryItem[] = [],
  profile?: StudentProfileDto | null
): PreSubmitAdvisoryItem[] {
  const result: PreSubmitAdvisoryItem[] = [];

  for (const c of criteria) {
    const allReqs = c.requirements || [];
    const declaredCount = allReqs.reduce(
      (sum, r) => sum + (r.declarations?.length || 0),
      0
    );

    // Completely empty criterion
    if (declaredCount === 0) {
      result.push({
        id: `adv-missing-${c.id}-all`,
        criterionId: c.id,
        criterionName: c.name,
        criterionNumber: c.number,
        requirementId: allReqs[0]?.id || '',
        message: `Tiêu chí ${c.name} hiện chưa có nội dung kê khai nào.`,
        actionLabel: 'Kê khai',
        targetType: 'row',
      });
      continue;
    }

    // CRITERION-SPECIFIC MANDATORY & COMBINATORY LOGIC (Hướng dẫn số 14-HD/BTK-HSVTP — Cấp TP. Đà Nẵng)
    if (c.id === 'ethics') {
      const ethicsScoreReq = allReqs.find((r) => r.id === 'ethics-score');
      const ethicsLawReq = allReqs.find((r) => r.id === 'ethics-law');
      const scoreCount = ethicsScoreReq?.declarations?.length || 0;
      const lawCount = ethicsLawReq?.declarations?.length || 0;

      if (scoreCount === 0) {
        result.push({
          id: 'adv-missing-ethics-score',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: 'ethics-score',
          message: 'Tiêu chí 1: Bạn chưa kê khai Điểm rèn luyện năm học (TC1.1 - Tiêu chuẩn bắt buộc).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      } else {
        const scoreHasNoEv = ethicsScoreReq?.declarations?.some(
          (d) => !d.evidenceFiles || d.evidenceFiles.length === 0
        );
        if (scoreHasNoEv) {
          result.push({
            id: 'adv-no-ev-ethics-score',
            criterionId: c.id,
            criterionName: c.name,
            criterionNumber: c.number,
            requirementId: 'ethics-score',
            message: 'Mục "Điểm rèn luyện" (TC1.1) đã kê khai nhưng chưa đính kèm tệp minh chứng bảng điểm.',
            actionLabel: 'Bổ sung',
            targetType: 'row',
          });
        }
      }

      if (lawCount === 0) {
        result.push({
          id: 'adv-missing-ethics-law',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: 'ethics-law',
          message: 'Tiêu chí 1: Bạn chưa xác nhận Không vi phạm pháp luật và nội quy (TC1.2 - Tiêu chuẩn bắt buộc).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      }
      // Note: TC1.2 is a pledge/statement; having a declaration text is sufficient for formal precheck, no mandatory file required.

      // Supplement group (TC1.3–TC1.6): City-level requires at least 1 of 4
      const supplementReqs = allReqs.filter(
        (r) => r.id.startsWith('ethics-') && r.id !== 'ethics-score' && r.id !== 'ethics-law'
      );
      const supplementDeclared = supplementReqs.filter((r) => (r.declarations?.length || 0) > 0);

      if (supplementDeclared.length === 0) {
        result.push({
          id: 'adv-missing-ethics-supplement',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: supplementReqs[0]?.id || 'ethics-party',
          message: 'Tiêu chí 1: Cần đạt thêm ít nhất 01 trong 04 tiêu chuẩn bổ sung về đạo đức, nhận thức chính trị (TC1.3–TC1.6).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      } else {
        for (const sr of supplementDeclared) {
          const hasDeclWithoutEv = (sr.declarations || []).some(
            (d) => !d.evidenceFiles || d.evidenceFiles.length === 0
          );
          if (hasDeclWithoutEv) {
            result.push({
              id: `adv-no-ev-${c.id}-${sr.id}`,
              criterionId: c.id,
              criterionName: c.name,
              criterionNumber: c.number,
              requirementId: sr.id,
              message: `Mục "${sr.title}" đã kê khai nhưng chưa đính kèm tệp minh chứng.`,
              actionLabel: 'Bổ sung',
              targetType: 'row',
            });
          }
        }
      }
    } else if (c.id === 'academic') {
      const gpaReq = allReqs.find((r) => r.id === 'academic-gpa');
      const gpaCount = gpaReq?.declarations?.length || 0;

      if (gpaCount === 0) {
        result.push({
          id: 'adv-missing-academic-gpa',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: 'academic-gpa',
          message: 'Tiêu chí 2: Bạn chưa kê khai Điểm trung bình học tập năm học GPA (TC2.1 - Tiêu chuẩn bắt buộc).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      } else {
        const profileIsCollege =
          Boolean(profile?.educationLevel && profile.educationLevel.toLowerCase().includes('cao đẳng')) ||
          Boolean(profile?.institutionId && profile.institutionId.includes('-cd-')) ||
          Boolean(profile?.institutionName && profile.institutionName.toLowerCase().includes('cao đẳng'));

        for (const d of gpaReq?.declarations || []) {
          const isCollege =
            d.metadata?.trainingLevel === 'college'
              ? true
              : d.metadata?.trainingLevel === 'university'
                ? false
                : profileIsCollege;
          let parsedScore: number | null = null;
          let parsedScale: 4 | 10 | null = null;

          if (d.metadata?.gpaScore) {
            const s = parseFloat(d.metadata.gpaScore.replace(',', '.'));
            if (!isNaN(s)) {
              parsedScore = s;
              parsedScale = d.metadata.gpaScale === '10' ? 10 : 4;
            }
          } else {
            const stripped = (d.value || '')
              .replace(/\b\d{1,2}\/\d{1,2}\/20\d{2}\b/g, ' ')
              .replace(/\b20\d{2}\s*[-–/]\s*20\d{2}\b/g, ' ');
            const m4 = stripped.match(/(\d+(?:[.,]\d+)?)\s*\/\s*4(?:[.,]0+)?\b/);
            const m10 = stripped.match(/(\d+(?:[.,]\d+)?)\s*\/\s*10(?:[.,]0+)?\b/);
            if (m4) {
              parsedScore = parseFloat(m4[1].replace(',', '.'));
              parsedScale = 4;
            } else if (m10) {
              parsedScore = parseFloat(m10[1].replace(',', '.'));
              parsedScale = 10;
            }
          }

          if (parsedScore !== null && parsedScale !== null) {
            const minRequired = parsedScale === 4 ? (isCollege ? 3.0 : 3.2) : isCollege ? 7.5 : 8.0;
            if (parsedScore < minRequired) {
              result.push({
                id: 'adv-gpa-below-threshold',
                criterionId: c.id,
                criterionName: c.name,
                criterionNumber: c.number,
                requirementId: 'academic-gpa',
                message: `Điểm trung bình năm học (TC2.1) kê khai ${parsedScore}/${parsedScale} chưa đạt ngưỡng quy định hệ ${isCollege ? 'Cao đẳng (tối thiểu 3.0/4 hoặc 7.5/10)' : 'Đại học / Học viện (tối thiểu 3.2/4 hoặc 8.0/10)'}.`,
                actionLabel: 'Kiểm tra',
                targetType: 'row',
              });
              break;
            }
          }
        }

        const gpaHasNoEv = gpaReq?.declarations?.some(
          (d) => !d.evidenceFiles || d.evidenceFiles.length === 0
        );
        if (gpaHasNoEv) {
          result.push({
            id: 'adv-no-ev-academic-gpa',
            criterionId: c.id,
            criterionName: c.name,
            criterionNumber: c.number,
            requirementId: 'academic-gpa',
            message: 'Mục "Điểm trung bình học tập" (TC2.1) đã kê khai nhưng chưa đính kèm bảng điểm xác nhận.',
            actionLabel: 'Bổ sung',
            targetType: 'row',
          });
        }
      }

      // Academic achievements (TC2.2 - TC2.7): need at least 1 of 6
      const academicAchReqs = allReqs.filter(
        (r) => r.id.startsWith('academic-') && r.id !== 'academic-gpa'
      );
      const achDeclared = academicAchReqs.filter((r) => (r.declarations?.length || 0) > 0);

      if (achDeclared.length === 0) {
        result.push({
          id: 'adv-missing-academic-ach',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: academicAchReqs[0]?.id || 'academic-nckh',
          message: 'Tiêu chí 2: Cần đạt thêm ít nhất 01 trong 06 tiêu chuẩn học thuật, NCKH hoặc cuộc thi sáng tạo (TC2.2–TC2.7).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      } else {
        for (const r of achDeclared) {
          const hasDeclWithoutEv = (r.declarations || []).some(
            (d) => !d.evidenceFiles || d.evidenceFiles.length === 0
          );
          if (hasDeclWithoutEv) {
            result.push({
              id: `adv-no-ev-${c.id}-${r.id}`,
              criterionId: c.id,
              criterionName: c.name,
              criterionNumber: c.number,
              requirementId: r.id,
              message: `Mục "${r.title}" đã kê khai nhưng chưa đính kèm tệp minh chứng.`,
              actionLabel: 'Bổ sung',
              targetType: 'row',
            });
          }
        }
      }
    } else if (c.id === 'physical') {
      const formsDeclared = allReqs.filter((r) => (r.declarations?.length || 0) > 0);

      if (formsDeclared.length === 0) {
        result.push({
          id: 'adv-missing-physical-form',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: allReqs[0]?.id || 'physical-khoe',
          message: 'Tiêu chí 3: Cần kê khai ít nhất 01 trong 02 tiêu chuẩn Thể lực tốt theo quy định (TC3.1–TC3.2).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      } else {
        for (const r of formsDeclared) {
          const hasDeclWithoutEv = (r.declarations || []).some(
            (d) => !d.evidenceFiles || d.evidenceFiles.length === 0
          );
          if (hasDeclWithoutEv) {
            result.push({
              id: `adv-no-ev-${c.id}-${r.id}`,
              criterionId: c.id,
              criterionName: c.name,
              criterionNumber: c.number,
              requirementId: r.id,
              message: `Mục "${r.title}" đã kê khai nhưng chưa đính kèm tệp minh chứng.`,
              actionLabel: 'Bổ sung',
              targetType: 'row',
            });
          }
        }
      }
    } else if (c.id === 'volunteer') {
      const volActReq = allReqs.find((r) => r.id === 'volunteer-activities');
      const volAwardReq = allReqs.find((r) => r.id === 'volunteer-award');

      const hasAward = (volAwardReq?.declarations?.length || 0) > 0;
      const hasActivities = (volActReq?.declarations?.length || 0) > 0;

      if (!hasAward && !hasActivities) {
        result.push({
          id: 'adv-missing-volunteer-form',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: 'volunteer-activities',
          message: 'Tiêu chí 4: Cần đạt ít nhất 01 trong 02 tiêu chuẩn Tình nguyện tốt: tích lũy tối thiểu 05 ngày tình nguyện/năm (TC4.1) hoặc có khen thưởng tình nguyện từ cấp khoa trở lên (TC4.2).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      } else {
        if (hasActivities && !hasAward) {
          let totalDays = 0;
          for (const d of volActReq?.declarations || []) {
            const text = `${d.value} ${d.detail || ''} ${d.metadata?.duration || ''}`.toLowerCase();
            if (
              d.metadata?.volActivityType === 'blood_donation' ||
              text.includes('hiến máu') ||
              text.includes('hien mau')
            ) {
              totalDays += 1;
            } else if (d.metadata?.days || d.metadata?.volDaysCount) {
              const parsed = parseInt(d.metadata.days || d.metadata.volDaysCount || '1', 10);
              totalDays += isNaN(parsed) ? 1 : parsed;
            } else {
              const match = text.match(/(\d+)\s*ngày/);
              totalDays += match ? parseInt(match[1], 10) : 1;
            }
          }
          if (totalDays < 5) {
            result.push({
              id: 'adv-volunteer-days-insufficient',
              criterionId: c.id,
              criterionName: c.name,
              criterionNumber: c.number,
              requirementId: 'volunteer-activities',
              message: `Hoạt động tình nguyện tích lũy (TC4.1) hiện đạt ${totalDays}/5 ngày. Bạn cần tích lũy đủ tối thiểu 05 ngày tình nguyện/năm (bao gồm quy đổi hiến máu) hoặc bổ sung khen thưởng tình nguyện từ cấp khoa trở lên (TC4.2).`,
              actionLabel: 'Khai thêm',
              targetType: 'row',
            });
          }
        }

        // Check evidence for declared volunteer items
        for (const r of [volActReq, volAwardReq]) {
          if (!r) continue;
          const hasDeclWithoutEv = (r.declarations || []).some(
            (d) => !d.evidenceFiles || d.evidenceFiles.length === 0
          );
          if (hasDeclWithoutEv) {
            result.push({
              id: `adv-no-ev-${c.id}-${r.id}`,
              criterionId: c.id,
              criterionName: c.name,
              criterionNumber: c.number,
              requirementId: r.id,
              message: `Mục "${r.title}" đã kê khai nhưng chưa đính kèm tệp minh chứng.`,
              actionLabel: 'Bổ sung',
              targetType: 'row',
            });
          }
        }
      }
    } else if (c.id === 'integration') {
      const skillsReq = allReqs.find((r) => r.id === 'integration-skills');
      const unionReq = allReqs.find((r) => r.id === 'integration-union-award');
      const langReq = allReqs.find((r) => r.id === 'integration-lang');
      const intlReq = allReqs.find((r) => r.id === 'integration-intl');
      const contestReq = allReqs.find((r) => r.id === 'integration-contest');

      const hasGroupA = ((skillsReq?.declarations?.length || 0) > 0) || ((unionReq?.declarations?.length || 0) > 0);
      const hasGroupB = ((langReq?.declarations?.length || 0) > 0) || ((intlReq?.declarations?.length || 0) > 0) || ((contestReq?.declarations?.length || 0) > 0);

      if (!hasGroupA) {
        result.push({
          id: 'adv-missing-integration-group-a',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: 'integration-skills',
          message: 'Tiêu chí 5 (Nhóm A): Cần hoàn thành ít nhất 01 khóa trang bị kỹ năng thực hành xã hội (TC5.1) hoặc có khen thưởng Đoàn – Hội từ cấp trường trở lên (TC5.2).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      }

      if (!hasGroupB) {
        result.push({
          id: 'adv-missing-integration-group-b',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: 'integration-lang',
          message: 'Tiêu chí 5 (Nhóm B): Cần đạt ít nhất 01 tiêu chuẩn về Ngoại ngữ (TC5.3), Giao lưu quốc tế (TC5.4) hoặc Đạt giải cuộc thi kiến thức – kỹ năng hội nhập (TC5.5).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      }

      // Check evidence for declared items in integration
      for (const r of [skillsReq, unionReq, langReq, intlReq, contestReq]) {
        if (!r) continue;
        const hasDeclWithoutEv = (r.declarations || []).some(
          (d) => !d.evidenceFiles || d.evidenceFiles.length === 0
        );
        if (hasDeclWithoutEv) {
          result.push({
            id: `adv-no-ev-${c.id}-${r.id}`,
            criterionId: c.id,
            criterionName: c.name,
            criterionNumber: c.number,
            requirementId: r.id,
            message: `Mục "${r.title}" đã kê khai nhưng chưa đính kèm tệp minh chứng.`,
            actionLabel: 'Bổ sung',
            targetType: 'row',
          });
        }
      }
    }

    // Append manual advisories for this criterion if any (without duplicates)
    for (const adv of manualAdvisories || []) {
      if (adv.criterionId === c.id && !result.some((r) => r.id === adv.id)) {
        result.push(adv);
      }
    }
  }

  // 6. PROFILE 3x4 PORTRAIT PHOTO CHECK — Non-blocking Advisory
  if (profile && !profile.portraitUrl) {
    result.push({
      id: 'adv-suggestion-portrait-photo',
      criterionId: 'ethics',
      criterionName: 'Thông tin cá nhân',
      criterionNumber: 1,
      requirementId: '',
      message: 'Hồ sơ chưa có ảnh thẻ 3×4. Bạn nên bổ sung ảnh thẻ chân dung để hoàn thiện thành phần hồ sơ xét chọn cấp Thành phố.',
      actionLabel: 'Bổ sung ảnh thẻ',
      targetType: 'row',
    });
  }

  return result;
}

export function computeCriteriaAdvisoryStatuses(
  criteria: ApplicationCriterion[],
  advisories: PreSubmitAdvisoryItem[]
) {
  return criteria.map((c) => {
    const allReqs = c.requirements || [];
    const declaredCount = allReqs.reduce(
      (sum, r) => sum + (r.declarations?.length || 0),
      0
    );

    const criterionAdvisories = (advisories || []).filter(
      (a) => a.criterionId === c.id && a.id !== 'adv-suggestion-portrait-photo'
    );
    const hasMissingMandatory = criterionAdvisories.some((a) => a.id.startsWith('adv-missing-'));
    const hasThresholdIssue = criterionAdvisories.some(
      (a) => a.id === 'adv-volunteer-days-insufficient' || a.id === 'adv-gpa-below-threshold'
    );
    const hasMissingEvidence = criterionAdvisories.some((a) => a.id.startsWith('adv-no-ev-'));
    const hasOtherAdvisory = criterionAdvisories.some(
      (a) =>
        !a.id.startsWith('adv-missing-') &&
        !a.id.startsWith('adv-no-ev-') &&
        a.id !== 'adv-volunteer-days-insufficient' &&
        a.id !== 'adv-gpa-below-threshold'
    );

    let statusLabel = 'Đã có thông tin';
    let statusTone: 'undeclared' | 'advisory' | 'ready' = 'ready';
    let hasAdvisory = false;

    if (declaredCount === 0) {
      statusLabel = 'Chưa kê khai';
      statusTone = 'undeclared';
      hasAdvisory = false;
    } else if (hasMissingMandatory || hasThresholdIssue) {
      statusLabel = 'Chưa đủ điều kiện';
      statusTone = 'advisory';
      hasAdvisory = true;
    } else if (hasMissingEvidence) {
      statusLabel = 'Thiếu minh chứng';
      statusTone = 'advisory';
      hasAdvisory = true;
    } else if (hasOtherAdvisory) {
      statusLabel = 'Cần kiểm tra';
      statusTone = 'advisory';
      hasAdvisory = true;
    }

    return {
      id: c.id,
      name: c.name,
      number: c.number,
      statusLabel,
      statusTone,
      hasAdvisory,
      declaredCount,
    };
  });
}
