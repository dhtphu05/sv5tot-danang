/**
 * 5TOT Đà Nẵng — Canonical Student Application Domain Data & Criteria Builder
 * Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 */

import {
  CRITERIA_DEFINITIONS_LIST,
  resolveMultiplicity,
} from './criteriaDefinitions';
import { DANANG_INSTITUTION_REGISTRY } from './institutionRegistry';
import { resolveSchoolReviewUnit, SchoolReviewUnitId } from '../../staff/schoolReviewTypes';
import {
  ApplicationEvidence,
  ApplicationRecommendation,
  ApplicationDeclaration,
  ApplicationRequirement,
  ApplicationRequirementGroup,
  ApplicationCriterion,
  StudentApplicationData,
  StudentApplication,
} from '../../entities/application/studentApplicationTypes';
import { INITIAL_STUDENT_APPLICATION } from './initialStudentApplication';

export type {
  ApplicationEvidence,
  ApplicationRecommendation,
  ApplicationDeclaration,
  ApplicationRequirement,
  ApplicationRequirementGroup,
  ApplicationCriterion,
  StudentApplicationData,
  StudentApplication,
};
export { INITIAL_STUDENT_APPLICATION };
export const STUDENT_APPLICATION_FIXTURE = INITIAL_STUDENT_APPLICATION;

/**
 * Builds application criteria always from central CRITERIA_DEFINITIONS
 */
export function buildCriteriaFromDefinitions(
  existingCriteria: ApplicationCriterion[] = []
): ApplicationCriterion[] {
  return CRITERIA_DEFINITIONS_LIST.map((critDef) => {
    const existingCrit = existingCriteria.find((c) => c.id === critDef.id);
    const existingReqs = existingCrit
      ? [
          ...(existingCrit.groups ? existingCrit.groups.flatMap((g) => g.requirements || []) : []),
          ...(existingCrit.requirements || []),
        ]
      : [];

    const groups: ApplicationRequirementGroup[] = critDef.groups.map((groupDef) => {
      const requirements: ApplicationRequirement[] = groupDef.requirements.map((reqDef) => {
        const found = existingReqs.find((r) => r.id === reqDef.id);
        const resolvedMultiplicity = resolveMultiplicity(reqDef.declarationMultiplicity);
        const addAction =
          reqDef.addActionLabel ||
          (resolvedMultiplicity === 'MULTIPLE' ? '+ Thêm kê khai' : 'Kê khai nội dung này');

        if (found && found.declarations && found.declarations.length > 0) {
          const normalizedDeclarations: ApplicationDeclaration[] =
            found.declarations.map((d) => {
              const rawDecl = d as unknown as Record<string, any>;
              const rawEvList = Array.isArray(d.evidenceFiles)
                ? d.evidenceFiles
                : Array.isArray(d.evidence)
                ? d.evidence
                : [];
              const normalizedEvidence: ApplicationEvidence[] = rawEvList.map(
                (ev) => {
                  const rawEv = ev as unknown as Record<string, any>;
                  return {
                    ...ev,
                    id: ev.id || `ev-${Date.now()}`,
                    name:
                      ev.name ||
                      rawEv.fileName ||
                      rawEv.title ||
                      'Minh_chung.pdf',
                    fileType: ev.fileType || 'pdf',
                    size: ev.size || rawEv.fileSize || '240 KB',
                    uploadedAt: ev.uploadedAt || '10/10/2026',
                    status:
                      ev.status && (ev.status as string) !== 'completed'
                        ? ev.status
                        : 'ready',
                    url: ev.url || rawEv.previewUrl,
                  };
                }
              );
              return {
                ...d,
                value:
                  d.value ||
                  rawDecl.title ||
                  rawDecl.description ||
                  'Đã kê khai minh chứng',
                detail: d.detail || rawDecl.description || rawDecl.authority || '',
                date: d.date || rawDecl.date || '10/10/2026',
                status:
                  d.status && (d.status as string) !== 'completed'
                    ? d.status
                    : 'ready',
                evidenceFiles: normalizedEvidence,
              };
            });
          return {
            ...found,
            declarations: normalizedDeclarations,
            status:
              found.status &&
              found.status !== 'undeclared' &&
              (found.status as string) !== 'completed'
                ? found.status
                : 'ready',
            groupId: groupDef.id,
            title: reqDef.title,
            ruleBadge: reqDef.ruleBadge,
            ruleHelper: reqDef.ruleHelper,
            declarationMultiplicity: resolvedMultiplicity,
            declarationLabel: reqDef.declarationLabel,
            addActionLabel: addAction,
            allowMultipleEvidence: reqDef.allowMultipleEvidence ?? true,
            declarationMode: reqDef.declarationMode,
            allowMultipleDeclarations: resolvedMultiplicity === 'MULTIPLE',
            isOptionalEmpty: false,
          };
        }
        return {
          id: reqDef.id,
          code: reqDef.code,
          criterionId: reqDef.criterionId,
          groupId: groupDef.id,
          title: reqDef.title,
          ruleBadge: reqDef.ruleBadge,
          ruleHelper: reqDef.ruleHelper,
          declarationMultiplicity: resolvedMultiplicity,
          declarationLabel: reqDef.declarationLabel,
          addActionLabel: addAction,
          allowMultipleEvidence: reqDef.allowMultipleEvidence ?? true,
          declarationMode: reqDef.declarationMode,
          allowMultipleDeclarations: resolvedMultiplicity === 'MULTIPLE',
          status: 'undeclared',
          declarations: [],
          isOptionalEmpty: true,
        };
      });

      return {
        id: groupDef.id,
        criterionId: groupDef.criterionId,
        title: groupDef.title,
        groupType: groupDef.groupType,
        ruleBadge: groupDef.ruleBadge,
        ruleHelper: groupDef.ruleHelper,
        minSelections: groupDef.minSelections ?? groupDef.minApplicable ?? 1,
        minApplicable: groupDef.minApplicable,
        requirements,
      };
    });

    const flatRequirements = groups.flatMap((g) => g.requirements);
    const declaredReqs = flatRequirements.filter(
      (r) => r.declarations && r.declarations.length > 0
    );
    const totalEvidence = flatRequirements.reduce(
      (sum, r) =>
        sum +
        r.declarations.reduce(
          (dSum, d) => dSum + (d.evidenceFiles?.length || 0),
          0
        ),
      0
    );

    let resolvedShortSummary = existingCrit?.shortSummary || critDef.shortSummary;
    if (
      declaredReqs.length > 0 &&
      (!existingCrit?.shortSummary || existingCrit.shortSummary.startsWith('0 '))
    ) {
      if (critDef.id === 'volunteer') {
        const awardReq = flatRequirements.find((r) => r.id === 'volunteer-award');
        const actReq = flatRequirements.find((r) => r.id === 'volunteer-activities');
        const allDecls = flatRequirements.flatMap((r) => r.declarations || []);
        if (awardReq && awardReq.declarations && awardReq.declarations.length > 0 && (!actReq || actReq.declarations.length === 0)) {
          resolvedShortSummary = `${awardReq.declarations.length} khen thưởng tình nguyện đã khai · ${totalEvidence} minh chứng`;
        } else {
          const actDecls = actReq?.declarations?.length ? actReq.declarations : allDecls;
          const totalActivities = actDecls.length;
          let totalDays = 0;
          let bloodCount = 0;
          for (const d of actDecls) {
            const combined = `${d.value} ${d.detail || ''}`.toLowerCase();
            if (
              d.metadata?.volActivityType === 'blood_donation' ||
              combined.includes('hiến máu') ||
              combined.includes('hien mau')
            ) {
              bloodCount++;
              totalDays += 1;
            } else if (d.metadata?.days) {
              const p = parseInt(d.metadata.days, 10);
              totalDays += isNaN(p) ? 1 : p;
            } else {
              const dayMatch = combined.match(/(\d+)\s*ngày/i);
              totalDays += dayMatch ? parseInt(dayMatch[1], 10) : 1;
            }
          }
          resolvedShortSummary = `${totalActivities} hoạt động đã khai · ${totalEvidence} minh chứng · ${totalDays}/5 ngày tình nguyện${
            bloodCount > 0 ? ` (${bloodCount} lần hiến máu)` : ''
          }`;
        }
      } else if (critDef.id === 'physical') {
        resolvedShortSummary = `${declaredReqs.length} nội dung đã kê khai · ${totalEvidence} minh chứng`;
      } else {
        resolvedShortSummary = `${declaredReqs.length} nội dung đã kê khai · ${totalEvidence} minh chứng`;
      }
    }

    const resolvedStatusLabel =
      existingCrit?.statusLabel &&
      existingCrit.statusLabel !== 'Chưa kê khai' &&
      existingCrit.statusLabel !== 'Đã kê khai'
        ? existingCrit.statusLabel
        : declaredReqs.length > 0
        ? 'Đã kê khai'
        : existingCrit?.statusLabel || 'Đã kê khai';

    return {
      id: critDef.id,
      number: critDef.number,
      name: critDef.name,
      shortSummary: resolvedShortSummary,
      statusLabel: resolvedStatusLabel,
      groups,
      requirements: flatRequirements,
    };
  });
}

// Ensure INITIAL_STUDENT_APPLICATION criteria are always merged from central definitions
INITIAL_STUDENT_APPLICATION.criteria = buildCriteriaFromDefinitions(
  INITIAL_STUDENT_APPLICATION.criteria
);

export function resolveInstitutionFromUniversity(
  university?: string,
  fallbackInstId?: string
): {
  institutionId: string;
  institutionName: string;
  schoolReviewUnitId: SchoolReviewUnitId;
  schoolReviewUnitName: string;
  educationLevelHint: 'Đại học' | 'Cao đẳng';
} {
  const normalizedInstId =
    fallbackInstId === 'inst-ufls' ? 'inst-ufl' : fallbackInstId;

  if (normalizedInstId) {
    const byId = DANANG_INSTITUTION_REGISTRY.find(
      (inst) => inst.id === normalizedInstId
    );
    if (byId) {
      const routing = resolveSchoolReviewUnit(byId.id);
      return {
        institutionId: byId.id,
        institutionName: university || byId.officialName,
        schoolReviewUnitId: routing.unit?.id || 'unit-udn',
        schoolReviewUnitName: routing.unit?.officialName || 'Đại học Đà Nẵng',
        educationLevelHint: byId.educationLevelHint || 'Đại học',
      };
    }
  }

  const norm = (university || '').trim().toLowerCase();
  if (norm) {
    const exactMatch = DANANG_INSTITUTION_REGISTRY.find(
      (inst) =>
        inst.officialName.toLowerCase() === norm ||
        inst.officialName.toLowerCase().replace(/–/g, '-') === norm.replace(/–/g, '-') ||
        inst.searchKeywords.some((kw) => kw.toLowerCase() === norm)
    );
    const partialMatch =
      exactMatch ||
      DANANG_INSTITUTION_REGISTRY.find((inst) => {
        const off = inst.officialName.toLowerCase();
        const normalizedDashOff = off.replace(/–/g, '-');
        const normalizedDashNorm = norm.replace(/–/g, '-');
        return (
          normalizedDashNorm.includes(normalizedDashOff) ||
          normalizedDashOff.includes(normalizedDashNorm) ||
          (inst.searchKeywords || []).some((kw) =>
            kw.length >= 4 && normalizedDashNorm.includes(kw.toLowerCase())
          )
        );
      });

    if (partialMatch) {
      const routing = resolveSchoolReviewUnit(partialMatch.id);
      return {
        institutionId: partialMatch.id,
        institutionName: university || partialMatch.officialName,
        schoolReviewUnitId: routing.unit?.id || 'unit-udn',
        schoolReviewUnitName: routing.unit?.officialName || 'Đại học Đà Nẵng',
        educationLevelHint: partialMatch.educationLevelHint || 'Đại học',
      };
    }
  }

  return {
    institutionId: 'inst-dut',
    institutionName: university || 'Trường Đại học Bách khoa – ĐHĐN',
    schoolReviewUnitId: 'unit-udn',
    schoolReviewUnitName: 'Đại học Đà Nẵng',
    educationLevelHint: 'Đại học',
  };
}

/**
 * Checks whether an application object is the hardcoded demo fixture (`INITIAL_STUDENT_APPLICATION`)
 * or belongs to a different student, without wiping out legitimate backend declarations of `minh.nv@dut.udn.vn` (`102220123`).
 */
export function isDemoFixtureApplication(
  app: StudentApplicationData | null | undefined,
  currentStudentId?: string
): boolean {
  if (!app) return false;
  if (
    currentStudentId &&
    app.student?.studentId &&
    app.student.studentId !== currentStudentId
  ) {
    return true;
  }
  if (app.student?.email === 'minhanh.nguyen@dut.udn.vn') {
    return true;
  }
  const hasHardcodedDemoDecl = (app.criteria || []).some((c) => {
    const reqs = [
      ...(c.requirements || []),
      ...(c.groups ? c.groups.flatMap((g) => g.requirements || []) : []),
    ];
    return reqs.some((r) =>
      (r.declarations || []).some(
        (d) => d.id === 'decl-drl' || d.id === 'decl-law' || d.id === 'decl-gpa'
      )
    );
  });
  return hasHardcodedDemoDecl;
}

export function buildCleanStudentApplication(params: {
  fullName: string;
  studentId: string;
  university: string;
  faculty?: string;
  facultyDepartmentId?: string;
  email?: string;
  academicYear?: string;
  institutionId?: string;
  institutionName?: string;
  existingProfileSnapshot?: import('../../entities/application/studentApplicationTypes').StudentProfileDto | null;
}): StudentApplicationData {
  const emptyCriteria = buildCriteriaFromDefinitions([]).map((crit) => ({
    ...crit,
    shortSummary: '0 nội dung đã kê khai · 0 minh chứng',
    statusLabel: 'Chưa kê khai',
  }));

  const resolvedInst = resolveInstitutionFromUniversity(
    params.university,
    params.institutionId || params.existingProfileSnapshot?.institutionId
  );
  const resolvedInstId = resolvedInst.institutionId;
  const resolvedInstName = params.university || resolvedInst.institutionName;
  const resolvedFacultyName =
    params.faculty ?? params.existingProfileSnapshot?.facultyName ?? '';
  const resolvedFacultyDeptId =
    params.facultyDepartmentId ??
    params.existingProfileSnapshot?.facultyDepartmentId;

  const profileSnapshot: import('../../entities/application/studentApplicationTypes').StudentProfileDto =
    params.existingProfileSnapshot &&
    params.existingProfileSnapshot.fullName === params.fullName
      ? {
          ...params.existingProfileSnapshot,
          fullName: params.fullName,
          email: params.email || params.existingProfileSnapshot.email,
          institutionId: resolvedInstId,
          institutionName: resolvedInstName,
          facultyDepartmentId: resolvedFacultyDeptId,
          facultyName: resolvedFacultyName,
        }
      : {
          fullName: params.fullName,
          gender: '',
          ethnicity: '',
          dateOfBirth: '',
          email: params.email || '',
          phoneNumber: '',
          homeProvince: '',
          institutionId: resolvedInstId,
          institutionName: resolvedInstName,
          facultyDepartmentId: resolvedFacultyDeptId,
          facultyName: resolvedFacultyName,
          academicYearNumber: 0,
          educationLevel: resolvedInst.educationLevelHint,
          className: '',
          unionPosition: 'Chưa giữ chức vụ',
          politicalStatus: 'Đoàn viên',
        };

  return {
    ...INITIAL_STUDENT_APPLICATION,
    applicationId: `APP-2026-DN-${params.studentId || 'NEW'}`,
    status: 'Đang hoàn thiện',
    eligibilityStatus: 'Đã xác nhận điều kiện nộp hồ sơ',
    applicantProfileSnapshot: profileSnapshot,
    student: {
      fullName: params.fullName,
      studentId: params.studentId,
      university: resolvedInstName,
      faculty: resolvedFacultyName,
      class: profileSnapshot.className || '',
      email: profileSnapshot.email || params.email || '',
      academicYear: INITIAL_STUDENT_APPLICATION.student.academicYear,
    },
    trainingInstitutionName: resolvedInstName,
    schoolReviewUnitId: resolvedInst.schoolReviewUnitId,
    schoolReviewUnitName: resolvedInst.schoolReviewUnitName,
    supplementRequests: [],
    criteria: emptyCriteria,
    otherAchievements: [],
  };
}

export const OTHER_ACHIEVEMENTS_CRITERION_ID = 'other_achievements';
export const OTHER_ACHIEVEMENTS_REQ_ID = 'other-achievements-general';

export function buildOtherAchievementsCriterion(
  declarations: ApplicationDeclaration[] = []
): ApplicationCriterion {
  const safeDecls: ApplicationDeclaration[] = (
    Array.isArray(declarations) ? declarations : []
  ).map((d) => {
    const rawDecl = d as unknown as Record<string, any>;
    const rawEvList = Array.isArray(d.evidenceFiles)
      ? d.evidenceFiles
      : Array.isArray(d.evidence)
      ? d.evidence
      : [];
    const normalizedEvidence: ApplicationEvidence[] = rawEvList.map((ev) => {
      const rawEv = ev as unknown as Record<string, any>;
      return {
        ...ev,
        id: ev.id || `ev-${Date.now()}`,
        name: ev.name || rawEv.fileName || rawEv.title || 'Minh_chung.pdf',
        fileType: ev.fileType || 'pdf',
        size: ev.size || rawEv.fileSize || '240 KB',
        uploadedAt: ev.uploadedAt || '10/10/2026',
        status:
          ev.status && (ev.status as string) !== 'completed'
            ? ev.status
            : 'ready',
        url: ev.url || rawEv.previewUrl,
      };
    });
    return {
      ...d,
      value:
        d.value ||
        rawDecl.title ||
        rawDecl.description ||
        'Thành tích bổ sung',
      detail: d.detail || rawDecl.description || rawDecl.authority || '',
      date: d.date || rawDecl.date || '10/10/2026',
      status:
        d.status && (d.status as string) !== 'completed' ? d.status : 'ready',
      evidenceFiles: normalizedEvidence,
    };
  });

  const totalEv = safeDecls.reduce(
    (sum, d) => sum + (d.evidenceFiles?.length || 0),
    0
  );

  const req: ApplicationRequirement = {
    id: OTHER_ACHIEVEMENTS_REQ_ID,
    code: 'TTK',
    criterionId: OTHER_ACHIEVEMENTS_CRITERION_ID as any,
    title:
      'Các giải thưởng, bằng khen, giấy khen, sáng kiến hoặc thành tích tiêu biểu khác',
    ruleBadge: 'Kê khai bổ sung · Cho phép nhiều kê khai',
    ruleHelper:
      'Mục này nằm ngoài 5 tiêu chí bắt buộc. Sinh viên có thể kê khai không giới hạn số lượng thành tích, giải thưởng, chứng nhận hoạt động xã hội, văn hóa, nghệ thuật, khởi nghiệp... kèm minh chứng.',
    declarationMultiplicity: 'MULTIPLE',
    declarationLabel: 'Tên thành tích / giải thưởng / bằng khen',
    addActionLabel: '+ Thêm thành tích khác',
    allowMultipleEvidence: true,
    declarationMode: 'repeatable',
    allowMultipleDeclarations: true,
    status: safeDecls.length > 0 ? 'declared' : 'undeclared',
    declarations: safeDecls,
    isOptionalEmpty: safeDecls.length === 0,
  };

  return {
    id: OTHER_ACHIEVEMENTS_CRITERION_ID as any,
    number: 5,
    name: 'Thành tích khác',
    shortSummary:
      safeDecls.length > 0
        ? `${safeDecls.length} thành tích bổ sung đã kê khai · ${totalEv} minh chứng`
        : 'Chưa có thành tích bổ sung (không bắt buộc · ngoài 5 tiêu chí)',
    statusLabel: safeDecls.length > 0 ? 'Đã kê khai' : 'Chưa kê khai',
    groups: [],
    requirements: [req],
  };
}

export {
  type PersonalLibraryItem,
  MOCK_PERSONAL_LIBRARY_EVIDENCE,
  loadPersonalLibraryItems,
  savePersonalLibraryItems,
  uploadFilesToPersonalLibrary,
  syncEvidenceFilesToPersonalLibrary,
  removePersonalLibraryItem,
  getActiveStudentCombinedLibrary,
  usePersonalEvidenceLibrary,
} from './mockEvidenceLibrary';
