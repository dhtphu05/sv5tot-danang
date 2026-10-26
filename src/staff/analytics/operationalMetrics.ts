import { StaffApplicationRecord, StaffUser } from "../types";
import { CommitteeCaseDetail } from "../committeeTypes";
import {
  AnalyticsFilterState,
  AnalyticsWorkflowGroupKey,
} from "./analyticsTypes";
import {
  classifyApplicationWorkflowBucket,
  filterApplicationsForAnalytics,
  resolveAuthoritativeResultForRecord,
  canInspectUnpublishedResults,
  WORKFLOW_BUCKET_META,
} from "./workflowClassification";

export interface SeasonSummaryMetrics {
  totalApplications: number;
  unassignedCount: number;
  underReviewCount: number;
  waitingSupplementCount: number;
  supplementReturnedCount: number;
  completedReviewCount: number;
  waitingCommitteeCount: number;
  decidedCount: number;
  publishedCount: number;
}

export function getSeasonAnalytics(
  filteredApps: StaffApplicationRecord[],
  committeeCases: Record<string, CommitteeCaseDetail>,
  user: StaffUser
): SeasonSummaryMetrics {
  const canSeeUnpublished = canInspectUnpublishedResults(user);

  let unassignedCount = 0;
  let underReviewCount = 0;
  let waitingSupplementCount = 0;
  let supplementReturnedCount = 0;
  let completedReviewCount = 0;
  let waitingCommitteeCount = 0;
  let decidedCount = 0;
  let publishedCount = 0;

  for (const app of filteredApps) {
    const bucket = classifyApplicationWorkflowBucket(app, committeeCases);
    const res = resolveAuthoritativeResultForRecord(app, committeeCases);

    if (bucket === 'unassigned') unassignedCount++;
    if (bucket === 'under_review' || bucket === 'supplement_returned') {
      underReviewCount++;
    }
    if (bucket === 'supplement_waiting') waitingSupplementCount++;
    if (bucket === 'supplement_returned') supplementReturnedCount++;

    // Completed 5/5 officer review (includes those already in Committee or decided)
    if (
      app.reviewedCriteriaCount === 5 ||
      bucket === 'review_completed' ||
      bucket === 'waiting_decision' ||
      bucket === 'decided'
    ) {
      completedReviewCount++;
    }

    if (bucket === 'waiting_decision') {
      waitingCommitteeCount++;
    }

    if (res.hasDecision && (res.isPublished || canSeeUnpublished)) {
      decidedCount++;
    }
    if (res.hasDecision && res.isPublished) {
      publishedCount++;
    }
  }

  return {
    totalApplications: filteredApps.length,
    unassignedCount,
    underReviewCount,
    waitingSupplementCount,
    supplementReturnedCount,
    completedReviewCount,
    waitingCommitteeCount,
    decidedCount,
    publishedCount,
  };
}

/**
 * 2. Season Workflow Distribution (Sections 16 & 17)
 */
export interface WorkflowDistributionItem {
  key: Exclude<AnalyticsWorkflowGroupKey, 'all'>;
  label: string;
  shortDescription: string;
  count: number;
  barColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export function getWorkflowDistribution(
  filteredApps: StaffApplicationRecord[],
  committeeCases: Record<string, CommitteeCaseDetail>
): WorkflowDistributionItem[] {
  const order: Exclude<AnalyticsWorkflowGroupKey, 'all'>[] = [
    'unassigned',
    'under_review',
    'supplement_waiting',
    'supplement_returned',
    'review_completed',
    'waiting_decision',
    'decided',
  ];

  const counts: Record<Exclude<AnalyticsWorkflowGroupKey, 'all'>, number> = {
    unassigned: 0,
    under_review: 0,
    supplement_waiting: 0,
    supplement_returned: 0,
    review_completed: 0,
    waiting_decision: 0,
    decided: 0,
  };

  for (const app of filteredApps) {
    const b = classifyApplicationWorkflowBucket(app, committeeCases);
    counts[b]++;
  }

  return order.map((key) => ({
    ...WORKFLOW_BUCKET_META[key],
    count: counts[key],
  }));
}

/**
 * 3. Operational Attention Summary ("Cần chú ý" — Section 18)
 */
export interface OperationalAttentionItem {
  id:
    | 'unassigned'
    | 'supplement_returned'
    | 'aging'
    | 'near_deadline'
    | 'committee_flagged';
  title: string;
  supporting: string;
  count: number;
  tone: 'amber' | 'brand' | 'violet';
  matchingApplicationIds: string[];
}

export function getOperationalAttentionSummary(
  filteredApps: StaffApplicationRecord[],
  committeeCases: Record<string, CommitteeCaseDetail>
): OperationalAttentionItem[] {
  const unassigned = filteredApps.filter(
    (a) => !a.assignment || a.workflowStatus === 'unassigned'
  );
  const suppReturned = filteredApps.filter(
    (a) => a.workflowStatus === 'supplement_returned'
  );
  const aging = filteredApps.filter((a) => Boolean(a.isAging));
  const nearDeadline = filteredApps.filter((a) => Boolean(a.isNearDeadline));
  const committeeFlagged = filteredApps.filter((a) => {
    const c = committeeCases[a.applicationId];
    if (c) {
      return c.flaggedItems.some((f: { status: string }) => f.status === 'pending_consideration');
    }
    return a.workflowStatus === 'needs_committee_review';
  });

  return [
    {
      id: 'unassigned',
      title: `${unassigned.length} hồ sơ chưa phân công`,
      supporting: 'Cần điều phối cán bộ xét duyệt phụ trách',
      count: unassigned.length,
      tone: 'amber',
      matchingApplicationIds: unassigned.map((a) => a.applicationId),
    },
    {
      id: 'supplement_returned',
      title: `${suppReturned.length} hồ sơ vừa nhận bổ sung`,
      supporting: 'Sinh viên đã gửi bổ sung, chờ Cán bộ tiếp tục xét',
      count: suppReturned.length,
      tone: 'brand',
      matchingApplicationIds: suppReturned.map((a) => a.applicationId),
    },
    {
      id: 'aging',
      title: `${aging.length} hồ sơ lâu chưa cập nhật`,
      supporting: 'Quá 3 ngày chưa phát sinh thao tác xét mới',
      count: aging.length,
      tone: 'amber',
      matchingApplicationIds: aging.map((a) => a.applicationId),
    },
    {
      id: 'near_deadline',
      title: `${nearDeadline.length} hồ sơ gần mốc xử lý`,
      supporting: 'Hạn hoàn tất nội bộ từ 18/10/2026',
      count: nearDeadline.length,
      tone: 'amber',
      matchingApplicationIds: nearDeadline.map((a) => a.applicationId),
    },
    {
      id: 'committee_flagged',
      title: `${committeeFlagged.length} hồ sơ cần Hội đồng xem xét thêm`,
      supporting: 'Có nội dung chuyên môn được Cán bộ chuyển Hội đồng',
      count: committeeFlagged.length,
      tone: 'violet',
      matchingApplicationIds: committeeFlagged.map((a) => a.applicationId),
    },
  ];
}

/**
 * 4. Institution Summary ("Theo đơn vị" — Sections 20–25)
 * Strictly administrative reporting — never ranks institutions!
 */
