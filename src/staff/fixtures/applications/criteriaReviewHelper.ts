import { StaffCriterionReviewStatus, StaffCriterionReviewSummary } from '../../types';

export function buildFiveCriteriaReview(
  statuses: [
    StaffCriterionReviewStatus,
    StaffCriterionReviewStatus,
    StaffCriterionReviewStatus,
    StaffCriterionReviewStatus,
    StaffCriterionReviewStatus,
  ],
  notes?: Partial<
    Record<
      'ethics' | 'academic' | 'physical' | 'volunteer' | 'integration',
      string
    >
  >
): StaffCriterionReviewSummary[] {
  return [
    {
      criterionId: 'ethics',
      criterionNumber: 1,
      criterionName: 'Đạo đức tốt',
      status: statuses[0],
      declaredCount: 3,
      evidenceCount: 3,
      noteSummary: notes?.ethics,
    },
    {
      criterionId: 'academic',
      criterionNumber: 2,
      criterionName: 'Học tập tốt',
      status: statuses[1],
      declaredCount: 3,
      evidenceCount: 5,
      noteSummary: notes?.academic,
    },
    {
      criterionId: 'physical',
      criterionNumber: 3,
      criterionName: 'Thể lực tốt',
      status: statuses[2],
      declaredCount: 3,
      evidenceCount: 3,
      noteSummary: notes?.physical,
    },
    {
      criterionId: 'volunteer',
      criterionNumber: 4,
      criterionName: 'Tình nguyện tốt',
      status: statuses[3],
      declaredCount: 3,
      evidenceCount: 4,
      noteSummary: notes?.volunteer,
    },
    {
      criterionId: 'integration',
      criterionNumber: 5,
      criterionName: 'Hội nhập tốt',
      status: statuses[4],
      declaredCount: 2,
      evidenceCount: 2,
      noteSummary: notes?.integration,
    },
  ];
}
