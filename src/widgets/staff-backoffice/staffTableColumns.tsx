/**
 * 5TOT Đà Nẵng — Staff Backoffice Table Column Builders & Workload Selector (FSD Widgets Layer)
 */

import React from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileScan,
  Sparkles,
} from 'lucide-react';
import {
  StaffApplicationRecord,
  StaffOfficerWorkloadSummary,
  StaffRouteId,
  StaffUser,
} from '../../staff/types';
import {
  getStaffApplicationStatusMeta,
  resolveUserFacingStatus,
} from '../../staff/statusMap';
import { CITY_REVIEW_OFFICERS } from '../../staff/fixtures/staffDataset';
import { OperationalTableColumn } from '../../staff/components/shared/SharedOperationalTable';
import { isApplicationEligibleForCityIntake } from '../../staff/schoolReviewTypes';
import {
  assignCityOfficer,
  getCollectiveReviewProgress,
} from '../../staff/collectiveStore';
import {
  CollectiveApplication,
  COLLECTIVE_TYPE_LABELS,
} from '../../staff/collectiveTypes';
import { Button } from '../../components/buttons/Button';
import { deriveApplicationCriteriaReviewProgress } from '../../staff/criteriaProgress';
import { getApplicationCriteriaSummary } from '../../staff/schoolSelectors';

export interface RowAiCriterionChip {
  shortCode: 'ĐĐ' | 'HT' | 'TL' | 'TN' | 'HN';
  name: string;
  aiStatus: 'passed' | 'needs_check' | 'failed';
  reason: string;
}

export interface RowAiPreliminarySummary {
  overallStatus: 'passed' | 'needs_check' | 'failed';
  passedCount: number;
  badgeLabel: string;
  ocrNote: string;
  criteriaChips: RowAiCriterionChip[];
}

const SHORT_CODES: Record<string, 'ĐĐ' | 'HT' | 'TL' | 'TN' | 'HN'> = {
  ethics: 'ĐĐ',
  academic: 'HT',
  physical: 'TL',
  volunteer: 'TN',
  integration: 'HN',
};

export function deriveRowAiPreliminarySummary(
  app: StaffApplicationRecord
): RowAiPreliminarySummary {
  // Hero dossier (Nguyễn Minh Anh) matches the exact 2 passed / 3 needs_check inside OfficerReviewWorkspace
  if (app.applicationId === 'APP-2026-DN-102220123') {
    return {
      overallStatus: 'needs_check',
      passedCount: 2,
      badgeLabel: 'AI: Cần kiểm tra (2/5 Đạt)',
      ocrNote: 'OCR: Kiểm tra GPA cả năm, TL & lệch ngày TN',
      criteriaChips: [
        {
          shortCode: 'ĐĐ',
          name: 'Đạo đức tốt',
          aiStatus: 'passed',
          reason: 'AI: Đạt sơ bộ (ĐRL 88/100 · Có dấu xác nhận)',
        },
        {
          shortCode: 'HT',
          name: 'Học tập tốt',
          aiStatus: 'needs_check',
          reason: 'AI: Cần kiểm tra thêm (Bảng điểm mới thể hiện HK1)',
        },
        {
          shortCode: 'TL',
          name: 'Thể lực tốt',
          aiStatus: 'needs_check',
          reason: 'AI: Cần kiểm tra quy đổi giải chạy phong trào',
        },
        {
          shortCode: 'TN',
          name: 'Tình nguyện tốt',
          aiStatus: 'needs_check',
          reason: 'AI: Minh chứng ghi 04 ngày so với kê khai 05 ngày',
        },
        {
          shortCode: 'HN',
          name: 'Hội nhập tốt',
          aiStatus: 'passed',
          reason: 'AI: Đạt sơ bộ (IELTS 6.5 & hoạt động hội nhập hợp lệ)',
        },
      ],
    };
  }

  const baseOrder: Array<{
    id: 'ethics' | 'academic' | 'physical' | 'volunteer' | 'integration';
    name: string;
  }> = [
    { id: 'ethics', name: 'Đạo đức tốt' },
    { id: 'academic', name: 'Học tập tốt' },
    { id: 'physical', name: 'Thể lực tốt' },
    { id: 'volunteer', name: 'Tình nguyện tốt' },
    { id: 'integration', name: 'Hội nhập tốt' },
  ];

  const chips: RowAiCriterionChip[] = baseOrder.map(({ id, name }) => {
    const found = app.criteriaReview?.find((c) => c.criterionId === id);
    const shortCode = SHORT_CODES[id];

    if (!found || found.evidenceCount === 0 || found.declaredCount === 0) {
      return {
        shortCode,
        name,
        aiStatus: 'failed',
        reason: `AI: Chưa đạt sơ bộ (${name} thiếu tệp minh chứng)`,
      };
    }

    if (
      found.status === 'needs_supplement' ||
      found.status === 'needs_discussion' ||
      (found.noteSummary &&
        /bổ sung|kiểm tra|chưa rõ|thiếu|xem xét/i.test(found.noteSummary))
    ) {
      return {
        shortCode,
        name,
        aiStatus: 'needs_check',
        reason: `AI: Cần kiểm tra thêm (${
          found.noteSummary || 'Cần xác minh mộc dấu / nội dung OCR'
        })`,
      };
    }

    return {
      shortCode,
      name,
      aiStatus: 'passed',
      reason: `AI: Đạt sơ bộ (${found.evidenceCount} minh chứng khớp kê khai)`,
    };
  });

  // Also check application-level supplement/recheck workflow status
  if (
    (app.workflowStatus === 'supplement_requested' ||
      app.workflowStatus === 'needs_recheck') &&
    chips.every((c) => c.aiStatus === 'passed')
  ) {
    chips[3] = {
      ...chips[3],
      aiStatus: 'needs_check',
      reason: 'AI: Cần kiểm tra thêm minh chứng bổ sung tiêu chí Tình nguyện',
    };
  }

  const passedCount = chips.filter((c) => c.aiStatus === 'passed').length;
  const failedChips = chips.filter((c) => c.aiStatus === 'failed');
  const checkChips = chips.filter((c) => c.aiStatus === 'needs_check');

  if (failedChips.length > 0 || app.totalEvidence === 0) {
    const missingNames = failedChips.map((c) => c.shortCode).join(', ');
    return {
      overallStatus: 'failed',
      passedCount,
      badgeLabel: `AI: Chưa đạt sơ bộ (${passedCount}/5 Đạt)`,
      ocrNote: missingNames
        ? `OCR: Thiếu minh chứng hợp lệ tại ${missingNames}`
        : 'OCR: Hồ sơ thiếu tệp minh chứng bắt buộc',
      criteriaChips: chips,
    };
  }

  if (checkChips.length > 0) {
    const checkNames = checkChips.map((c) => c.shortCode).join(', ');
    return {
      overallStatus: 'needs_check',
      passedCount,
      badgeLabel: `AI: Cần kiểm tra (${passedCount}/5 Đạt)`,
      ocrNote: `OCR: Cần đối chiếu thêm minh chứng ${checkNames}`,
      criteriaChips: chips,
    };
  }

  return {
    overallStatus: 'passed',
    passedCount: 5,
    badgeLabel: 'AI: Đạt sơ bộ (5/5 tiêu chí)',
    ocrNote: `OCR: Khớp ${app.totalEvidence}/${app.totalEvidence} minh chứng · Có dấu xác nhận`,
    criteriaChips: chips,
  };
}

export function renderRowAiPreliminaryCell(
  app: StaffApplicationRecord
): React.ReactNode {
  const ai = deriveRowAiPreliminarySummary(app);

  return (
    <div className="space-y-1 min-w-[205px]">
      <div>
        {ai.overallStatus === 'passed' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold bg-[#EAFBF1] text-[#136F3A] border border-[#B6E6C9]">
            <CheckCircle2 size={11.5} className="shrink-0 text-[#16A34A]" />
            <span>{ai.badgeLabel}</span>
          </span>
        ) : ai.overallStatus === 'needs_check' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold bg-[#FEF6EB] text-[#B45309] border border-[#FADDB6]">
            <AlertTriangle size={11.5} className="shrink-0 text-[#D97706]" />
            <span>{ai.badgeLabel}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
            <XCircle size={11.5} className="shrink-0 text-[#DC2626]" />
            <span>{ai.badgeLabel}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {ai.criteriaChips.map((chip) => {
          const isPass = chip.aiStatus === 'passed';
          const isCheck = chip.aiStatus === 'needs_check';
          return (
            <span
              key={chip.shortCode}
              title={chip.reason}
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-[4px] border ${
                isPass
                  ? 'bg-[#EAFBF1] text-[#15803D] border-[#BBF7D0]'
                  : isCheck
                  ? 'bg-[#FEF6EB] text-[#B45309] border-[#FADDB6]'
                  : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
              }`}
            >
              <span>{chip.shortCode}</span>
              <span>{isPass ? '✓' : isCheck ? '!' : '✕'}</span>
            </span>
          );
        })}
      </div>

      <div
        className="flex items-center gap-1 text-[10.5px] text-[#526B7C] line-clamp-1"
        title={ai.ocrNote}
      >
        <FileScan size={11} className="shrink-0 text-[#0D78AE]" />
        <span className="truncate">{ai.ocrNote}</span>
      </div>
    </div>
  );
}

export function deriveOfficerWorkloadSummaries(
  applications: StaffApplicationRecord[]
): StaffOfficerWorkloadSummary[] {
  return CITY_REVIEW_OFFICERS.map((off) => {
    const assigned = applications.filter(
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
    const agingCount = assigned.filter((a) => a.isAging).length;

    return {
      officerId: off.id,
      officerName: off.fullName,
      email: off.email,
      unitLabel: off.unitLabel,
      assignedCount: assigned.length,
      notStartedCount,
      openReviewCount,
      inProgressCount,
      waitingSupplementCount,
      supplementReturnCount,
      supplementReturnedCount: supplementReturnCount,
      completedCount,
      agingCount,
      isHighWorkload: assigned.length >= 10,
    };
  });
}

export function buildCollectiveTableColumns(params: {
  isManager: boolean;
  currentUser: StaffUser;
  onOpenCollectiveWorkspace: (appId: string) => void;
}): OperationalTableColumn<CollectiveApplication>[] {
  const { isManager, currentUser, onOpenCollectiveWorkspace } = params;

  return [
    {
      key: 'collectiveName',
      header: 'Tên tập thể & Loại hình',
      renderCell: (app) => (
        <div>
          <div className="font-bold text-[#0F2335] text-[13.5px] flex items-center gap-1.5">
            <Users size={14} className="text-[#0D78AE]" />
            <span>{app.collectiveName}</span>
          </div>
          <div className="text-[11.5px] text-[#526B7C] mt-0.5">
            {COLLECTIVE_TYPE_LABELS[app.collectiveType]} · Mã: {app.id}
          </div>
        </div>
      ),
    },
    {
      key: 'institution',
      header: 'Đơn vị đào tạo',
      renderCell: (app) => (
        <div>
          <div className="font-semibold text-[#172A3A] text-[13px]">
            {app.institutionName}
          </div>
          <div className="text-[11.5px] text-[#728391] mt-0.5">
            {app.facultyName}
          </div>
        </div>
      ),
    },
    {
      key: 'academicYear',
      header: 'Năm học',
      align: 'center',
      renderCell: (app) => (
        <span className="font-semibold text-[12.5px] text-[#334E68]">
          {app.academicYear}
        </span>
      ),
    },
    {
      key: 'evidenceCount',
      header: 'Minh chứng',
      align: 'center',
      renderCell: (app) => {
        const count =
          (app.tt01?.evidenceFiles?.length || 0) +
          (app.tt02?.evidenceFiles?.length || 0) +
          (app.tt03?.evidenceFiles?.length || 0) +
          (app.tt04?.evidenceFiles?.length || 0);
        return (
          <span className="font-bold text-[#0D78AE] tabular-nums">
            {count} tệp
          </span>
        );
      },
    },
    {
      key: 'aiPreliminary',
      header: 'Đánh giá sơ bộ (AI / OCR)',
      renderCell: (app) => {
        const count =
          (app.tt01?.evidenceFiles?.length || 0) +
          (app.tt02?.evidenceFiles?.length || 0) +
          (app.tt03?.evidenceFiles?.length || 0) +
          (app.tt04?.evidenceFiles?.length || 0);
        const isPendingSupplement = app.status === 'city_supplement_pending';
        if (count < 4) {
          return (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                <XCircle size={11.5} className="shrink-0" />
                <span>AI: Chưa đạt sơ bộ</span>
              </span>
              <div className="text-[10.5px] text-[#526B7C]">
                OCR: Thiếu tệp minh chứng tiêu chuẩn TT01–TT04
              </div>
            </div>
          );
        }
        if (isPendingSupplement) {
          return (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold bg-[#FEF6EB] text-[#B45309] border border-[#FADDB6]">
                <AlertTriangle size={11.5} className="shrink-0" />
                <span>AI: Cần kiểm tra (3/4 Đạt)</span>
              </span>
              <div className="text-[10.5px] text-[#526B7C]">
                OCR: Cần đối chiếu danh sách thành viên & dấu xác nhận
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[11px] font-bold bg-[#EAFBF1] text-[#136F3A] border border-[#B6E6C9]">
              <CheckCircle2 size={11.5} className="shrink-0" />
              <span>AI: Đạt sơ bộ (4/4 TT)</span>
            </span>
            <div className="text-[10.5px] text-[#526B7C]">
              OCR: Khớp {count}/{count} minh chứng · Có dấu xác nhận
            </div>
          </div>
        );
      },
    },
    {
      key: 'progress',
      header: 'Tiến độ xét',
      renderCell: (app) => {
        const prg = getCollectiveReviewProgress(app);
        return (
          <div>
            <div className="font-bold text-[#172A3A] text-[12.5px] tabular-nums">
              {prg.reviewedRequirementsCount} / 4 điều kiện
            </div>
            <div className="text-[11px] text-[#607483] tabular-nums mt-0.5">
              {prg.reviewedEvidenceCount} / {prg.totalEvidenceCount} minh chứng
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng thái cấp Thành phố',
      renderCell: (app) => {
        const prg = getCollectiveReviewProgress(app);
        let label = 'Đang kê khai';
        let style = 'bg-[#EAF6FC] text-[#0D78AE] border-[#CFE3F0]';
        if (app.status === 'city_unassigned') {
          label = 'Thành phố tiếp nhận';
          style = 'bg-[#EDF9F1] text-[#16A34A] border-[#C6EED5]';
        } else if (app.status === 'city_assigned') {
          if (prg.reviewedRequirementsCount > 0) {
            label = 'Đang xét';
            style = 'bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]';
          } else {
            label = 'Chờ xét';
            style = 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]';
          }
        } else if (app.status === 'city_in_review') {
          label = 'Đang xét';
          style = 'bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]';
        } else if (app.status === 'city_supplement_pending') {
          label = 'Cần bổ sung';
          style = 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]';
        } else if (app.status === 'city_supplement_returned') {
          label = 'Đã nhận bổ sung';
          style = 'bg-[#FEF6EB] text-[#D97706] border-[#FADDB6]';
        } else if (app.status === 'city_review_completed') {
          label = 'Đã hoàn tất xét';
          style = 'bg-[#EDF9F1] text-[#16A34A] border-[#C6EED5]';
        } else if (app.status === 'published') {
          label = 'Đã công nhận';
          style = 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]';
        }
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11.5px] font-bold border whitespace-nowrap ${style}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: 'action',
      header: 'Thao tác',
      align: 'right',
      renderCell: (app) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpenCollectiveWorkspace(app.id);
          }}
          className="gap-1.5 whitespace-nowrap"
        >
          <Users size={13} />
          <span>Xem và xét hồ sơ</span>
        </Button>
      ),
    },
  ];
}

export function buildIndividualApplicationTableColumns(params: {
  isManager: boolean;
  onAssignOfficer?: (applicationId: string, officerId: string) => void;
  onOpenApplicationReview: (applicationId: string) => void;
}): OperationalTableColumn<StaffApplicationRecord>[] {
  const { isManager, onAssignOfficer, onOpenApplicationReview } = params;

  return [
    {
      key: 'student',
      header: 'Sinh viên',
      renderCell: (app) => (
        <div>
          <div className="font-bold text-[#0F2335] text-[13.5px] flex items-center gap-2">
            <span>{app.student.fullName}</span>
          </div>
          <div className="text-[11.5px] text-[#526B7C] font-mono tabular-nums mt-0.5">
            {app.student.studentCode} · {app.applicationId}
          </div>
        </div>
      ),
    },
    {
      key: 'institution',
      header: 'Trường / Đơn vị',
      renderCell: (app) => (
        <div className="min-w-[205px] max-w-[260px]">
          <div
            className="text-[12.5px] font-semibold text-[#172A3A] line-clamp-1"
            title={app.institution.officialName}
          >
            {app.institution.officialName}
          </div>
          <div className="text-[11.5px] text-[#607483] tabular-nums mt-0.5">
            Ngày tiếp nhận: {app.submittedAt}
          </div>
        </div>
      ),
    },
    {
      key: 'schoolPreliminary',
      header: 'Sơ tuyển',
      renderCell: (app) => {
        const isRecommended =
          app.schoolPreliminaryStatus === 'recommended_forwarding' ||
          app.schoolPreliminaryStatus === 'forwarded_to_city' ||
          app.schoolReviewSummary?.recommendation === 'recommended' ||
          app.schoolReviewSummary?.isForwardedToCity;
        const docNumber =
          app.schoolReviewSummary?.decisionDocumentMetadata?.decisionNumber;

        if (isRecommended) {
          return (
            <div>
              <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#0B64A0] bg-[#EAF5FC] border border-[#CBE5F6] px-2 py-0.5 rounded-[5px]">
                <CheckCircle2 size={12} className="text-[#0D78AE]" />
                <span>Đề xuất trình Thành phố</span>
              </span>
              <div className="text-[11px] text-[#607483] tabular-nums mt-0.5">
                {docNumber ? `Theo ${docNumber}` : 'Đã kèm văn bản PDF'}
              </div>
            </div>
          );
        }

        return (
          <span className="text-[12px] text-[#718290]">
            {app.schoolPreliminaryStatus === 'not_recommended'
              ? 'Không đề xuất'
              : 'Chưa đề xuất'}
          </span>
        );
      },
    },
    {
      key: 'aiPreliminary',
      header: (
        <span className="inline-flex items-center gap-1.5 text-[#0F2335]">
          <Sparkles size={13} className="text-[#0D78AE]" />
          <span>Đánh giá sơ bộ (AI / OCR)</span>
        </span>
      ),
      renderCell: (app) => renderRowAiPreliminaryCell(app),
    },
    {
      key: 'progress',
      header: 'Tiến độ cán bộ xét',
      renderCell: (app) => {
        const critSummary = getApplicationCriteriaSummary(app);
        const progress = deriveApplicationCriteriaReviewProgress(app);
        const isAllMet = progress.isAllMet;
        const isFullyReviewed = progress.isFullyReviewed;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {critSummary.items.map((c) => (
                <span
                  key={c.criterionId}
                  title={`${c.name}: ${c.statusLabel}`}
                  className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-[4px] border"
                  style={{
                    backgroundColor: `${c.dotColor}12`,
                    color: c.dotColor,
                    borderColor: `${c.dotColor}35`,
                  }}
                >
                  {c.shortCode}
                </span>
              ))}
            </div>
            <div>
              <span
                className={`text-[12px] font-bold tabular-nums ${
                  isAllMet
                    ? 'text-[#16A34A]'
                    : isFullyReviewed
                    ? 'text-[#0D78AE]'
                    : progress.reviewedCount > 0
                    ? 'text-[#1E293B]'
                    : 'text-[#64748B]'
                }`}
              >
                {progress.compactProgressLabel}
              </span>
              <div className="text-[11px] text-[#607483] tabular-nums">
                {app.totalDeclarations} mục · {app.totalEvidence} minh chứng
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Thẩm định & Cập nhật',
      renderCell: (app) => {
        const statusMeta = resolveUserFacingStatus(
          app,
          isManager ? 'CITY_MANAGER' : 'CITY_OFFICER'
        );
        const isHero = app.applicationId === 'APP-2026-DN-102220123';
        return (
          <div className="space-y-1">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold border whitespace-nowrap"
              style={{
                backgroundColor: statusMeta.badgeBg,
                color: statusMeta.badgeText,
                borderColor: statusMeta.badgeBorder,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: statusMeta.dotColor }}
              />
              {statusMeta.label}
            </span>
            <div className="text-[10.5px] text-[#607483] whitespace-nowrap tabular-nums">
              {isHero ? '15 phút trước' : app.updatedAt} · Hạn: {app.internalDeadline}
            </div>
          </div>
        );
      },
    },
    {
      key: 'action',
      header: 'Thao tác',
      align: 'right',
      renderCell: (app) => {
        const isHero = app.applicationId === 'APP-2026-DN-102220123';
        const progress = deriveApplicationCriteriaReviewProgress(app);
        const intakeCheck = isApplicationEligibleForCityIntake({
          currentReviewStage: app.currentReviewStage || 'CITY',
          schoolReviewSummary: app.schoolReviewSummary,
        });

        let actionLabel = 'Xem hồ sơ';
        let buttonVariant: 'primary' | 'secondary' = 'secondary';

        if (!intakeCheck.eligible) {
          actionLabel = 'Xem hồ sơ (Chờ Trường)';
          buttonVariant = 'secondary';
        } else if (isHero || progress.reviewedCount === 0) {
          actionLabel = 'Bắt đầu thẩm định';
          buttonVariant = 'primary';
        } else if (progress.isFullyReviewed) {
          actionLabel = 'Xem hồ sơ';
          buttonVariant = 'secondary';
        } else {
          actionLabel = 'Tiếp tục thẩm định';
          buttonVariant = 'secondary';
        }

        return (
          <Button
            variant={buttonVariant}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenApplicationReview(app.applicationId);
            }}
            className="whitespace-nowrap"
          >
            {actionLabel}
          </Button>
        );
      },
    },
  ];
}
