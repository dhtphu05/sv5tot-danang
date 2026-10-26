import { CRITERIA_LIST, CriterionDefinition } from "../../tokens";
import { StaffApplicationRecord, StaffOfficerWorkloadSummary, StaffUser } from "../types";
import { CITY_REVIEW_OFFICERS } from "../fixtures/staffDataset";
import {
  AnalyticsFilterState,
} from "./analyticsTypes";
import {
  filterApplicationsForAnalytics,
  resolveAuthoritativeResultForRecord,
  canInspectUnpublishedResults,
} from "./workflowClassification";
import { CommitteeCaseDetail } from "../committeeTypes";

export interface SupplementSummaryMetrics {
  totalSupplementRequests: number;
  waitingStudentCount: number;
  studentReturnedCount: number;
  waitingOfficerResumeCount: number;
  resumedOrClosedCount: number;
}

export interface CriterionSupplementStat {
  criterionId: CriterionDefinition['id'];
  criterionNumber: number;
  criterionName: string;
  accentColor: string;
  supplementRequestCount: number;
  considerationFlagCount: number;
}

export interface SupplementDetailRow {
  id: string;
  applicationId: string;
  studentName: string;
  studentCode: string;
  institutionId: string;
  institutionName: string;
  criterionId: CriterionDefinition['id'];
  criterionName: string;
  requirementTitle: string;
  declarationTitle: string;
  officerName: string;
  requestedAt: string;
  staffStatus: 'waiting_student' | 'student_returned' | 'resumed_review' | 'closed';
  statusLabel: string;
  updatedAt: string;
}

export function getSupplementAnalytics(
  filteredApps: StaffApplicationRecord[],
  committeeCases: Record<string, CommitteeCaseDetail>
): {
  summary: SupplementSummaryMetrics;
  byCriterion: CriterionSupplementStat[];
  detailRows: SupplementDetailRow[];
} {
  let totalSupplementRequests = 0;
  let waitingStudentCount = 0;
  let studentReturnedCount = 0;
  let waitingOfficerResumeCount = 0;
  let resumedOrClosedCount = 0;

  const criterionCounts: Record<CriterionDefinition['id'], number> = {
    ethics: 0,
    academic: 0,
    physical: 0,
    volunteer: 0,
    integration: 0,
  };

  const flagCounts: Record<CriterionDefinition['id'], number> = {
    ethics: 0,
    academic: 0,
    physical: 0,
    volunteer: 0,
    integration: 0,
  };

  const detailRows: SupplementDetailRow[] = [];

  for (const app of filteredApps) {
    // Count consideration flags by criterion (Section 115)
    const c = committeeCases[app.applicationId];
    if (c && c.flaggedItems.length > 0) {
      for (const f of c.flaggedItems) {
        flagCounts[f.criterionId] = (flagCounts[f.criterionId] || 0) + 1;
      }
    } else {
      for (const cr of app.criteriaReview) {
        if (cr.status === 'needs_discussion') {
          flagCounts[cr.criterionId] = (flagCounts[cr.criterionId] || 0) + 1;
        }
      }
    }

    if (
      app.supplementSummary.requestCount > 0 &&
      app.supplementSummary.latestRequest
    ) {
      const req = app.supplementSummary.latestRequest;
      totalSupplementRequests += app.supplementSummary.requestCount;

      const cid = req.criterionId as CriterionDefinition['id'];
      if (criterionCounts[cid] !== undefined) {
        criterionCounts[cid] += app.supplementSummary.requestCount;
      }

      const st = req.staffStatus;
      let statusLabel = 'Đang chờ sinh viên';
      if (st === 'waiting_student') {
        waitingStudentCount++;
        statusLabel = 'Đang chờ sinh viên';
      } else if (st === 'student_returned') {
        studentReturnedCount++;
        waitingOfficerResumeCount++;
        statusLabel = 'Chờ cán bộ tiếp tục xét';
      } else {
        studentReturnedCount++;
        resumedOrClosedCount++;
        statusLabel = 'Đã tiếp tục xét';
      }

      detailRows.push({
        id: `${app.applicationId}-${req.id}`,
        applicationId: app.applicationId,
        studentName: app.student.fullName,
        studentCode: app.student.studentCode,
        institutionId: app.institution.id,
        institutionName: app.institution.officialName,
        criterionId: cid,
        criterionName: req.criterionName,
        requirementTitle: req.requirementTitle || req.criterionName,
        declarationTitle:
          req.declarationTitle || req.requirementTitle || req.criterionName,
        officerName: app.assignment?.officerName || 'Chưa phân công',
        requestedAt: req.requestedAt,
        staffStatus: st,
        statusLabel,
        updatedAt: req.returnedAt || app.updatedAt,
      });
    }
  }

  const byCriterion: CriterionSupplementStat[] = CRITERIA_LIST.map((crit) => ({
    criterionId: crit.id,
    criterionNumber: crit.number,
    criterionName: crit.name,
    accentColor: crit.accentColor,
    supplementRequestCount: criterionCounts[crit.id] || 0,
    considerationFlagCount: flagCounts[crit.id] || 0,
  }));

  return {
    summary: {
      totalSupplementRequests,
      waitingStudentCount,
      studentReturnedCount,
      waitingOfficerResumeCount,
      resumedOrClosedCount,
    },
    byCriterion,
    detailRows,
  };
}

/**
 * 7. Officer Workload Analytics ("Khối lượng xét duyệt" — Sections 36–40)
 * Strictly resource coordination — never performance ranking!
 */
export interface OfficerWorkloadAnalyticsRow
  extends StaffOfficerWorkloadSummary {
  waitingSupplementCount: number;
  workloadLevelLabel: 'Khối lượng thấp' | 'Khối lượng vừa' | 'Khối lượng cao';
  workloadLevelTone: 'neutral' | 'brand' | 'amber';
}

export function getOfficerWorkloadSummary(
  filteredApps: StaffApplicationRecord[]
): OfficerWorkloadAnalyticsRow[] {
  return CITY_REVIEW_OFFICERS.map((off) => {
    const assigned = filteredApps.filter(
      (a) => a.assignment?.officerId === off.id
    );
    const notStartedCount = assigned.filter(
      (a) => a.workflowStatus === 'assigned_not_started'
    ).length;
    const openReviewCount = assigned.filter(
      (a) =>
        a.workflowStatus === 'under_review' ||
        a.workflowStatus === 'needs_recheck'
    ).length;
    const inProgressCount = notStartedCount + openReviewCount;
    const waitingSupplementCount = assigned.filter(
      (a) => a.workflowStatus === 'supplement_requested'
    ).length;
    const supplementReturnCount = assigned.filter(
      (a) => a.workflowStatus === 'supplement_returned'
    ).length;
    const completedCount = assigned.filter(
      (a) =>
        a.workflowStatus === 'review_completed' ||
        a.workflowStatus === 'needs_committee_review' ||
        a.workflowStatus === 'waiting_decision' ||
        a.workflowStatus === 'ready_for_finalization' ||
        a.workflowStatus === 'finalized_recognized' ||
        a.workflowStatus === 'finalized_not_recognized'
    ).length;
    const agingCount = assigned.filter((a) => Boolean(a.isAging)).length;

    const total = assigned.length;
    let workloadLevelLabel:
      | 'Khối lượng thấp'
      | 'Khối lượng vừa'
      | 'Khối lượng cao' = 'Khối lượng vừa';
    let workloadLevelTone: 'neutral' | 'brand' | 'amber' = 'brand';

    if (total >= 10) {
      workloadLevelLabel = 'Khối lượng cao';
      workloadLevelTone = 'amber';
    } else if (total <= 4) {
      workloadLevelLabel = 'Khối lượng thấp';
      workloadLevelTone = 'neutral';
    }

    return {
      officerId: off.id,
      officerName: off.fullName,
      email: off.email,
      unitLabel: off.unitLabel,
      assignedCount: total,
      notStartedCount,
      openReviewCount,
      inProgressCount,
      waitingSupplementCount,
      supplementReturnCount,
      supplementReturnedCount: supplementReturnCount,
      completedCount,
      agingCount,
      isHighWorkload: total >= 10,
      workloadLevelLabel,
      workloadLevelTone,
    };
  });
}

/**
 * 8. Authoritative Result Analytics ("Kết quả xét chọn" — Sections 41–46, 105, 113, 114, 132)
 */
export interface ResultAnalyticsSummary {
  canSeeUnpublished: boolean;
  totalDecided: number;
  recognizedCount: number;
  notRecognizedCount: number;
  unpublishedCount: number;
  publishedCount: number;
  /** Null when totalDecided === 0 so UI shows "Chưa có dữ liệu kết quả." instead of "0% được công nhận" (Section 105) */
  recognizedRatePercent: number | null;
  byInstitution: {
    institutionId: string;
    institutionName: string;
    decidedCount: number;
    recognizedCount: number;
    notRecognizedCount: number;
    unpublishedCount: number;
    publishedCount: number;
  }[];
}

export function getResultSummary(
  filteredApps: StaffApplicationRecord[],
  committeeCases: Record<string, CommitteeCaseDetail>,
  user: StaffUser
): ResultAnalyticsSummary {
  const canSeeUnpublished = canInspectUnpublishedResults(user);

  let totalDecided = 0;
  let recognizedCount = 0;
  let notRecognizedCount = 0;
  let unpublishedCount = 0;
  let publishedCount = 0;

  const instMap = new Map<
    string,
    {
      institutionId: string;
      institutionName: string;
      decidedCount: number;
      recognizedCount: number;
      notRecognizedCount: number;
      unpublishedCount: number;
      publishedCount: number;
    }
  >();

  for (const app of filteredApps) {
    const res = resolveAuthoritativeResultForRecord(app, committeeCases);
    if (!res.hasDecision) continue;

    // Respect unpublished result security (Sections 82 & 113)
    if (!res.isPublished && !canSeeUnpublished) {
      continue;
    }

    totalDecided++;
    if (res.outcome === 'recognized') recognizedCount++;
    if (res.outcome === 'not_recognized') notRecognizedCount++;
    if (res.isPublished) publishedCount++;
    else unpublishedCount++;

    const existing = instMap.get(app.institution.id) || {
      institutionId: app.institution.id,
      institutionName: app.institution.officialName,
      decidedCount: 0,
      recognizedCount: 0,
      notRecognizedCount: 0,
      unpublishedCount: 0,
      publishedCount: 0,
    };

    existing.decidedCount++;
    if (res.outcome === 'recognized') existing.recognizedCount++;
    if (res.outcome === 'not_recognized') existing.notRecognizedCount++;
    if (res.isPublished) existing.publishedCount++;
    else existing.unpublishedCount++;

    instMap.set(app.institution.id, existing);
  }

  const recognizedRatePercent =
    totalDecided > 0 ? Math.round((recognizedCount / totalDecided) * 100) : null;

  const byInstitution = Array.from(instMap.values()).sort((a, b) =>
    a.institutionName.localeCompare(b.institutionName, 'vi')
  );

  return {
    canSeeUnpublished,
    totalDecided,
    recognizedCount,
    notRecognizedCount,
    unpublishedCount,
    publishedCount,
    recognizedRatePercent,
    byInstitution,
  };
}

/**
 * Collective Applications Analytics Selectors (S4.8.6: Analytics, Metrics & Operational Tracking)
 */
