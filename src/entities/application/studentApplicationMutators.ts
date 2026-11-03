/**
 * 5TOT ĐHĐN — Student Application Pure Domain Mutators & Selectors (FSD Entities Layer)
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

export function syncCriteriaWithUpdate(
  prevCriteria: ApplicationCriterion[],
  reqId: string,
  updateReq: (req: ApplicationRequirement) => ApplicationRequirement
): ApplicationCriterion[] {
  return prevCriteria.map((crit) => {
    const updatedReqs = crit.requirements.map((r) =>
      r.id === reqId ? updateReq(r) : r
    );
    const updatedGroups = crit.groups?.map((grp) => ({
      ...grp,
      requirements: grp.requirements.map((r) =>
        r.id === reqId ? updateReq(r) : r
      ),
    }));

    const declaredReqs = updatedReqs.filter(
      (r) => r.declarations && r.declarations.length > 0
    );
    const totalEvidence = updatedReqs.reduce(
      (sum, r) =>
        sum +
        r.declarations.reduce(
          (dSum, d) => dSum + (d.evidenceFiles?.length || 0),
          0
        ),
      0
    );

    let shortSummary = crit.shortSummary;
    if (crit.id === 'volunteer') {
      const allDecls = updatedReqs.flatMap((r) => r.declarations || []);
      const totalActivities = allDecls.length;
      let totalDays = 0;
      let bloodCount = 0;
      for (const d of allDecls) {
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
      shortSummary = `${totalActivities} hoạt động đã khai · ${totalEvidence} minh chứng · ${totalDays}/3 ngày tình nguyện${
        bloodCount > 0 ? ` (${bloodCount} lần hiến máu)` : ''
      }`;
    } else if (crit.id === 'physical') {
      shortSummary = `${declaredReqs.length} nội dung đã kê khai · ${totalEvidence} minh chứng`;
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
  manualAdvisories: PreSubmitAdvisoryItem[] = []
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

    // CRITERION-SPECIFIC MANDATORY & COMBINATORY LOGIC (Decision 12/QĐ/ĐHĐN-HSV)
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
          message: 'Tiêu chí 1: Bạn chưa kê khai Điểm rèn luyện (TC1.1 - Tiêu chuẩn bắt buộc).',
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

      // Priority requirements (TC1.3–TC1.6): only warn if declared without evidence
      const priorityReqs = allReqs.filter(
        (r) => r.id.startsWith('ethics-') && r.id !== 'ethics-score' && r.id !== 'ethics-law'
      );
      for (const pr of priorityReqs) {
        const hasDeclWithoutEv = (pr.declarations || []).some(
          (d) => !d.evidenceFiles || d.evidenceFiles.length === 0
        );
        if (hasDeclWithoutEv) {
          result.push({
            id: `adv-no-ev-${c.id}-${pr.id}`,
            criterionId: c.id,
            criterionName: c.name,
            criterionNumber: c.number,
            requirementId: pr.id,
            message: `Mục "${pr.title}" đã kê khai nhưng chưa đính kèm tệp minh chứng.`,
            actionLabel: 'Bổ sung',
            targetType: 'row',
          });
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
          message: 'Tiêu chí 2: Bạn chưa kê khai Điểm trung bình học tập GPA (TC2.1 - Tiêu chuẩn bắt buộc).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      } else {
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

      // Academic achievements (TC2.2 - TC2.8): need at least 1
      const academicAchReqs = allReqs.filter(
        (r) => r.id.startsWith('academic-') && r.id !== 'academic-gpa' && !r.id.startsWith('academic-priority')
      );
      const achDeclared = academicAchReqs.filter((r) => (r.declarations?.length || 0) > 0);

      if (achDeclared.length === 0) {
        result.push({
          id: 'adv-missing-academic-ach',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: academicAchReqs[0]?.id || 'academic-nckh',
          message: 'Tiêu chí 2: Cần đạt thêm ít nhất 01 tiêu chuẩn học thuật, NCKH hoặc cuộc thi sáng tạo (TC2.2–TC2.8).',
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

      // Priority requirements (TC2.9 - TC2.11)
      const priorityReqs = allReqs.filter((r) => r.id.startsWith('academic-priority'));
      for (const pr of priorityReqs) {
        const hasDeclWithoutEv = (pr.declarations || []).some(
          (d) => !d.evidenceFiles || d.evidenceFiles.length === 0
        );
        if (hasDeclWithoutEv) {
          result.push({
            id: `adv-no-ev-${c.id}-${pr.id}`,
            criterionId: c.id,
            criterionName: c.name,
            criterionNumber: c.number,
            requirementId: pr.id,
            message: `Mục "${pr.title}" đã kê khai nhưng chưa đính kèm tệp minh chứng.`,
            actionLabel: 'Bổ sung',
            targetType: 'row',
          });
        }
      }
    } else if (c.id === 'physical') {
      const physicalForms = allReqs.filter((r) => r.id !== 'physical-priority-team');
      const formsDeclared = physicalForms.filter((r) => (r.declarations?.length || 0) > 0);

      if (formsDeclared.length === 0) {
        result.push({
          id: 'adv-missing-physical-form',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: physicalForms[0]?.id || 'physical-khoe',
          message: 'Tiêu chí 3: Cần kê khai ít nhất 01 trong 04 phương án Thể lực tốt theo quy định.',
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

      // Priority team (TC3.5)
      const priorityTeam = allReqs.find((r) => r.id === 'physical-priority-team');
      if (priorityTeam && (priorityTeam.declarations?.length || 0) > 0) {
        const hasDeclWithoutEv = (priorityTeam.declarations || []).some(
          (d) => !d.evidenceFiles || d.evidenceFiles.length === 0
        );
        if (hasDeclWithoutEv) {
          result.push({
            id: `adv-no-ev-${c.id}-${priorityTeam.id}`,
            criterionId: c.id,
            criterionName: c.name,
            criterionNumber: c.number,
            requirementId: priorityTeam.id,
            message: `Mục "${priorityTeam.title}" đã kê khai nhưng chưa đính kèm tệp minh chứng.`,
            actionLabel: 'Bổ sung',
            targetType: 'row',
          });
        }
      }
    } else if (c.id === 'volunteer') {
      const volActReq = allReqs.find((r) => r.id === 'volunteer-activities');
      const volCampReq = allReqs.find((r) => r.id === 'volunteer-campaign');
      const volAwardReq = allReqs.find((r) => r.id === 'volunteer-award');

      const hasCamp = (volCampReq?.declarations?.length || 0) > 0;
      const hasAward = (volAwardReq?.declarations?.length || 0) > 0;
      const hasActivities = (volActReq?.declarations?.length || 0) > 0;

      if (!hasCamp && !hasAward && !hasActivities) {
        result.push({
          id: 'adv-missing-volunteer-form',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: 'volunteer-activities',
          message: 'Tiêu chí 4: Cần kê khai ít nhất 01 phương án Tình nguyện tốt (hoạt động tích lũy, chiến dịch hoặc giấy khen).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      } else {
        // If student only uses activities (TC4.1) without campaign or award, check days
        if (hasActivities && !hasCamp && !hasAward) {
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
          if (totalDays < 3) {
            result.push({
              id: 'adv-volunteer-days-insufficient',
              criterionId: c.id,
              criterionName: c.name,
              criterionNumber: c.number,
              requirementId: 'volunteer-activities',
              message: `Hoạt động tình nguyện tích lũy (TC4.1) hiện đạt ${totalDays}/3 ngày. Bạn có thể bổ sung thêm hoạt động/hiến máu hoặc dùng phương án chiến dịch (TC4.2) / giấy khen (TC4.3).`,
              actionLabel: 'Khai thêm',
              targetType: 'row',
            });
          }
        }

        // Check evidence for declared volunteer items
        for (const r of [volActReq, volCampReq, volAwardReq]) {
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
      const actReq = allReqs.find((r) => r.id === 'integration-activity');
      const langReq = allReqs.find((r) => r.id === 'integration-lang');
      const intlReq = allReqs.find((r) => r.id === 'integration-intl');
      const contestReq = allReqs.find((r) => r.id === 'integration-contest');
      const cultureReq = allReqs.find((r) => r.id === 'integration-priority-culture');

      const hasGroupA = ((skillsReq?.declarations?.length || 0) > 0) || ((unionReq?.declarations?.length || 0) > 0);
      const hasGroupB = (actReq?.declarations?.length || 0) > 0;
      const hasGroupC = ((langReq?.declarations?.length || 0) > 0) || ((intlReq?.declarations?.length || 0) > 0) || ((contestReq?.declarations?.length || 0) > 0);

      if (!hasGroupA) {
        result.push({
          id: 'adv-missing-integration-group-a',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: 'integration-skills',
          message: 'Tiêu chí 5: Cần hoàn thành khóa kỹ năng thực hành xã hội (TC5.1) hoặc có khen thưởng Đoàn - Hội (TC5.2).',
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
          requirementId: 'integration-activity',
          message: 'Tiêu chí 5: Cần kê khai tham gia hoạt động về hội nhập do cấp khoa trở lên tổ chức (TC5.3 - Tiêu chuẩn bắt buộc).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      }

      if (!hasGroupC) {
        result.push({
          id: 'adv-missing-integration-group-c',
          criterionId: c.id,
          criterionName: c.name,
          criterionNumber: c.number,
          requirementId: 'integration-lang',
          message: 'Tiêu chí 5: Cần đạt ít nhất 01 tiêu chuẩn về Ngoại ngữ (TC5.4), Giao lưu quốc tế (TC5.5) hoặc Cuộc thi liên quan (TC5.6).',
          actionLabel: 'Kê khai',
          targetType: 'row',
        });
      }

      // Check evidence for declared items in integration
      for (const r of [skillsReq, unionReq, actReq, langReq, intlReq, contestReq, cultureReq]) {
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

    const criterionAdvisories = (advisories || []).filter((a) => a.criterionId === c.id);
    const hasMissingMandatory = criterionAdvisories.some((a) => a.id.startsWith('adv-missing-'));
    const hasInsufficientDays = criterionAdvisories.some((a) => a.id === 'adv-volunteer-days-insufficient');
    const hasMissingEvidence = criterionAdvisories.some((a) => a.id.startsWith('adv-no-ev-'));
    const hasOtherAdvisory = criterionAdvisories.some(
      (a) => !a.id.startsWith('adv-missing-') && !a.id.startsWith('adv-no-ev-') && a.id !== 'adv-volunteer-days-insufficient'
    );

    let statusLabel = 'Đã có thông tin';
    let statusTone: 'undeclared' | 'advisory' | 'ready' = 'ready';
    let hasAdvisory = false;

    if (declaredCount === 0) {
      statusLabel = 'Chưa kê khai';
      statusTone = 'undeclared';
      hasAdvisory = false;
    } else if (hasMissingMandatory || hasInsufficientDays) {
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
