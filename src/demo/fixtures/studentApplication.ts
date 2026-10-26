/**
 * 5TOT Đà Nẵng — Canonical Student Application Domain Data & Criteria Builder
 * Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 */

import {
  CRITERIA_DEFINITIONS_LIST,
  resolveMultiplicity,
} from './criteriaDefinitions';
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
      ? existingCrit.groups
        ? existingCrit.groups.flatMap((g) => g.requirements)
        : existingCrit.requirements || []
      : [];

    const groups: ApplicationRequirementGroup[] = critDef.groups.map((groupDef) => {
      const requirements: ApplicationRequirement[] = groupDef.requirements.map((reqDef) => {
        const found = existingReqs.find((r) => r.id === reqDef.id);
        const resolvedMultiplicity = resolveMultiplicity(reqDef.declarationMultiplicity);
        const addAction =
          reqDef.addActionLabel ||
          (resolvedMultiplicity === 'MULTIPLE' ? '+ Thêm kê khai' : 'Kê khai nội dung này');

        if (found && found.declarations && found.declarations.length > 0) {
          return {
            ...found,
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

    return {
      id: critDef.id,
      number: critDef.number,
      name: critDef.name,
      shortSummary: existingCrit?.shortSummary || critDef.shortSummary,
      statusLabel: existingCrit?.statusLabel || 'Đã kê khai',
      groups,
      requirements: flatRequirements,
    };
  });
}

// Ensure INITIAL_STUDENT_APPLICATION criteria are always merged from central definitions
INITIAL_STUDENT_APPLICATION.criteria = buildCriteriaFromDefinitions(
  INITIAL_STUDENT_APPLICATION.criteria
);

export { type PersonalLibraryItem, MOCK_PERSONAL_LIBRARY_EVIDENCE } from './mockEvidenceLibrary';
