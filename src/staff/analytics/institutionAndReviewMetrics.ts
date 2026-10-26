import { StaffApplicationRecord, StaffUser } from "../types";
import { CommitteeCaseDetail } from "../committeeTypes";
import {
  AnalyticsFilterState,
} from "./analyticsTypes";
import {
  filterApplicationsForAnalytics,
  resolveAuthoritativeResultForRecord,
  canInspectUnpublishedResults,
  classifyApplicationWorkflowBucket,
} from "./workflowClassification";

export interface InstitutionAnalyticsRow {
  institutionId: string;
  institutionName: string;
  totalSubmitted: number;
  unassignedCount: number;
  underReviewCount: number;
  waitingSupplementCount: number;
  completedReviewCount: number;
  decidedCount: number;
  recognizedCount: number;
  notRecognizedCount: number;
  publishedCount: number;
}

export function getInstitutionSummary(
  filteredApps: StaffApplicationRecord[],
  committeeCases: Record<string, CommitteeCaseDetail>,
  user: StaffUser,
  allApplicationsForDirectory?: StaffApplicationRecord[]
): InstitutionAnalyticsRow[] {
  const canSeeUnpublished = canInspectUnpublishedResults(user);
  const directorySource = allApplicationsForDirectory || filteredApps;

  const instMap = new Map<string, string>();
  for (const a of directorySource) {
    instMap.set(a.institution.id, a.institution.officialName);
  }

  const rows: InstitutionAnalyticsRow[] = [];

  for (const [instId, instName] of instMap.entries()) {
    const apps = filteredApps.filter((a) => a.institution.id === instId);
    if (apps.length === 0 && filteredApps.length !== directorySource.length) {
      continue;
    }

    let unassignedCount = 0;
    let underReviewCount = 0;
    let waitingSupplementCount = 0;
    let completedReviewCount = 0;
    let decidedCount = 0;
    let recognizedCount = 0;
    let notRecognizedCount = 0;
    let publishedCount = 0;

    for (const app of apps) {
      const bucket = classifyApplicationWorkflowBucket(app, committeeCases);
      const res = resolveAuthoritativeResultForRecord(app, committeeCases);

      if (bucket === 'unassigned') unassignedCount++;
      if (bucket === 'under_review' || bucket === 'supplement_returned') {
        underReviewCount++;
      }
      if (bucket === 'supplement_waiting') waitingSupplementCount++;
      if (
        app.reviewedCriteriaCount === 5 ||
        bucket === 'review_completed' ||
        bucket === 'waiting_decision' ||
        bucket === 'decided'
      ) {
        completedReviewCount++;
      }

      if (res.hasDecision && (res.isPublished || canSeeUnpublished)) {
        decidedCount++;
        if (res.outcome === 'recognized') recognizedCount++;
        if (res.outcome === 'not_recognized') notRecognizedCount++;
      }
      if (res.hasDecision && res.isPublished) {
        publishedCount++;
      }
    }

    rows.push({
      institutionId: instId,
      institutionName: instName,
      totalSubmitted: apps.length,
      unassignedCount,
      underReviewCount,
      waitingSupplementCount,
      completedReviewCount,
      decidedCount,
      recognizedCount,
      notRecognizedCount,
      publishedCount,
    });
  }

  // Sort alphabetically by official institution name (administrative order, NOT competitive ranking — Section 25)
  return rows.sort((a, b) =>
    a.institutionName.localeCompare(b.institutionName, 'vi')
  );
}

/**
 * 5. Review Progress & Aging Analytics ("Tiến độ xét" — Sections 26–30)
 */
export interface ReviewProgressSummary {
  notStartedCount: number;
  inReviewCount: number;
  partialCriteriaCount: number; // Đã hoàn tất 1–4 tiêu chí
  allFiveCompletedCount: number; // Đã hoàn tất xét 5 tiêu chí
  needsConsiderationCount: number; // Cần xem xét thêm
  agingBuckets: {
    id: 'lt_1d' | '1_to_3d' | '3_to_5d' | 'gt_5d';
    label: string;
    count: number;
  }[];
  agingApplications: {
    app: StaffApplicationRecord;
    daysSinceUpdateLabel: string;
    daysBucket: 'lt_1d' | '1_to_3d' | '3_to_5d' | 'gt_5d';
  }[];
}

export function getReviewProgressSummary(
  filteredApps: StaffApplicationRecord[],
  committeeCases: Record<string, CommitteeCaseDetail>
): ReviewProgressSummary {
  let notStartedCount = 0;
  let inReviewCount = 0;
  let partialCriteriaCount = 0;
  let allFiveCompletedCount = 0;
  let needsConsiderationCount = 0;

  const bucketCounts = {
    lt_1d: 0,
    '1_to_3d': 0,
    '3_to_5d': 0,
    gt_5d: 0,
  };

  const agingApplications: ReviewProgressSummary['agingApplications'] = [];

  for (const app of filteredApps) {
    if (
      !app.assignment ||
      app.workflowStatus === 'unassigned' ||
      app.workflowStatus === 'assigned_not_started'
    ) {
      notStartedCount++;
    } else if (
      app.workflowStatus === 'under_review' ||
      app.workflowStatus === 'supplement_requested' ||
      app.workflowStatus === 'supplement_returned' ||
      app.workflowStatus === 'needs_recheck'
    ) {
      inReviewCount++;
    }

    if (app.reviewedCriteriaCount >= 1 && app.reviewedCriteriaCount <= 4) {
      partialCriteriaCount++;
    } else if (app.reviewedCriteriaCount === 5) {
      allFiveCompletedCount++;
    }

    const c = committeeCases[app.applicationId];
    const hasFlag =
      (c &&
        c.flaggedItems.some((f: { status: string }) => f.status === 'pending_consideration')) ||
      app.workflowStatus === 'needs_recheck' ||
      app.workflowStatus === 'needs_committee_review' ||
      app.criteriaReview.some((cr) => cr.status === 'needs_discussion');

    if (hasFlag) {
      needsConsiderationCount++;
    }

    // Derive deterministic aging bucket from updatedSortKey (reference date: 2026-10-16)
    const dayNum = Math.floor(app.updatedSortKey / 10000) % 100; // day of Oct 2026
    const daysElapsed = Math.max(0, 16 - dayNum);

    let daysBucket: 'lt_1d' | '1_to_3d' | '3_to_5d' | 'gt_5d' = 'lt_1d';
    let daysSinceUpdateLabel = 'Trong ngày (< 1 ngày)';

    if (daysElapsed === 0) {
      daysBucket = 'lt_1d';
      daysSinceUpdateLabel = '< 1 ngày';
    } else if (daysElapsed <= 3) {
      daysBucket = '1_to_3d';
      daysSinceUpdateLabel = `${daysElapsed} ngày`;
    } else if (daysElapsed <= 5) {
      daysBucket = '3_to_5d';
      daysSinceUpdateLabel = `${daysElapsed} ngày`;
    } else {
      daysBucket = 'gt_5d';
      daysSinceUpdateLabel = `${daysElapsed} ngày`;
    }

    bucketCounts[daysBucket]++;

    if (app.isAging || daysElapsed >= 3) {
      agingApplications.push({
        app,
        daysSinceUpdateLabel,
        daysBucket,
      });
    }
  }

  agingApplications.sort(
    (a, b) => a.app.updatedSortKey - b.app.updatedSortKey
  );

  return {
    notStartedCount,
    inReviewCount,
    partialCriteriaCount,
    allFiveCompletedCount,
    needsConsiderationCount,
    agingBuckets: [
      { id: 'lt_1d', label: '< 1 ngày', count: bucketCounts.lt_1d },
      { id: '1_to_3d', label: '1–3 ngày', count: bucketCounts['1_to_3d'] },
      { id: '3_to_5d', label: '3–5 ngày', count: bucketCounts['3_to_5d'] },
      { id: 'gt_5d', label: '> 5 ngày', count: bucketCounts.gt_5d },
    ],
    agingApplications,
  };
}

/**
 * 6. Supplement Request Analytics ("Bổ sung" — Sections 31–35, 47, 115)
 * Strictly factual: "Số yêu cầu bổ sung phát sinh" — never "Tiêu chí khó nhất" or "Tiêu chí yếu nhất".
 */
