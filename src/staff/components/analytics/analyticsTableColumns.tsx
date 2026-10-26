import React from 'react';
import { Eye } from 'lucide-react';
import { StaffApplicationRecord } from '../../types';
import { CommitteeCaseDetail } from '../../committeeTypes';
import { getStaffApplicationStatusMeta } from '../../statusMap';
import { resolveAuthoritativeResultForRecord } from '../../analyticsSelectors';
import { OperationalTableColumn } from '../shared/SharedOperationalTable';

export function getUnderlyingAppColumns(params: {
  committeeCases: Record<string, CommitteeCaseDetail>;
  canSeeUnpublished: boolean;
  onOpenApplicationReview: (applicationId: string) => void;
}): OperationalTableColumn<StaffApplicationRecord>[] {
  const { committeeCases, canSeeUnpublished, onOpenApplicationReview } = params;

  return [
    {
      key: 'student',
      header: 'Sinh viên',
      renderCell: (app) => (
        <div>
          <div className="font-bold text-[#0F2335] text-[13px]">
            {app.student.fullName}
          </div>
          <div className="text-[11.5px] text-[#526B7C] tabular-nums">
            MSSV: {app.student.studentCode} · {app.applicationId}
          </div>
        </div>
      ),
    },
    {
      key: 'institution',
      header: 'Đơn vị đào tạo',
      renderCell: (app) => (
        <div className="max-w-[260px]">
          <div className="text-[12.5px] font-semibold text-[#172A3A] line-clamp-1">
            {app.institution.officialName}
          </div>
          <div className="text-[11px] text-[#607483] tabular-nums">
            Ngày nộp: {app.submittedAt}
          </div>
        </div>
      ),
    },

    {
      key: 'progress',
      header: 'Tiến độ xét',
      align: 'center',
      renderCell: (app) => (
        <span className="text-[12.5px] font-bold text-[#0F2335] tabular-nums">
          {app.reviewedCriteriaCount}/5 tiêu chí đã hoàn tất xét
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái hồ sơ',
      renderCell: (app) => {
        const meta = getStaffApplicationStatusMeta(app.workflowStatus);
        const res = resolveAuthoritativeResultForRecord(app, committeeCases);
        if (res.hasDecision && (res.isPublished || canSeeUnpublished)) {
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-[11.5px] font-bold border ${
                res.outcome === 'recognized'
                  ? 'bg-[#EAFBF1] text-[#136F3A] border-[#B6E6C9]'
                  : 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]'
              }`}
            >
              {res.outcome === 'recognized'
                ? 'Được công nhận'
                : 'Chưa được công nhận'}
            </span>
          );
        }
        return (
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-[11.5px] font-bold border"
            style={{
              backgroundColor: meta.badgeBg,
              color: meta.badgeText,
              borderColor: meta.badgeBorder,
            }}
          >
            {meta.shortLabel || meta.label}
          </span>
        );
      },
    },
    {
      key: 'action',
      header: 'Thao tác',
      align: 'right',
      renderCell: (app) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenApplicationReview(app.applicationId);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-[#CFE0EC] bg-white hover:bg-[#EAF6FC] text-[11.5px] font-bold text-[#0B64A0] transition-colors cursor-pointer"
        >
          <Eye size={12} />
          <span>Xem hồ sơ</span>
        </button>
      ),
    },
  ];
}
