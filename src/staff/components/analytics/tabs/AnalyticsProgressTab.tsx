import React from 'react';
import { Clock } from 'lucide-react';
import { StaffApplicationRecord } from '../../../types';
import { getStaffApplicationStatusMeta } from '../../../statusMap';
import { SharedOperationalTable } from '../../shared/SharedOperationalTable';

export interface AnalyticsProgressTabProps {
  reviewProgress: {
    notStartedCount: number;
    inReviewCount: number;
    partialCriteriaCount: number;
    allFiveCompletedCount: number;
    needsConsiderationCount: number;
    agingBuckets: {
      id: string;
      label: string;
      count: number;
    }[];
    agingApplications: {
      app: StaffApplicationRecord;
      daysSinceUpdateLabel: string;
    }[];
  };
  onOpenApplicationReview: (applicationId: string) => void;
}

export const AnalyticsProgressTab: React.FC<AnalyticsProgressTabProps> = ({
  reviewProgress,
  onOpenApplicationReview,
}) => {
  return (
    <div className="space-y-4">
      {/* Operational Review Progress Strip */}
      <div className="bg-white rounded-[12px] border border-[#D4E2EC] shadow-2xs overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E6EFF5]">
          <div className="p-3.5">
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Chưa bắt đầu xét
            </div>
            <div className="text-[22px] font-extrabold text-[#0F2335] tabular-nums mt-0.5">
              {reviewProgress.notStartedCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              0/5 tiêu chí đã hoàn tất xét
            </div>
          </div>
          <div className="p-3.5">
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Đang xét
            </div>
            <div className="text-[22px] font-extrabold text-[#0B64A0] tabular-nums mt-0.5">
              {reviewProgress.inReviewCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Đang trong quy trình thẩm định
            </div>
          </div>
          <div className="p-3.5">
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Đã hoàn tất 1–4 tiêu chí
            </div>
            <div className="text-[22px] font-extrabold text-[#0D78AE] tabular-nums mt-0.5">
              {reviewProgress.partialCriteriaCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              1–4/5 tiêu chí đã hoàn tất xét
            </div>
          </div>
          <div className="p-3.5">
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Đã hoàn tất xét 5 tiêu chí
            </div>
            <div className="text-[22px] font-extrabold text-[#136F3A] tabular-nums mt-0.5">
              {reviewProgress.allFiveCompletedCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              5/5 tiêu chí đã hoàn tất xét
            </div>
          </div>
          <div className="p-3.5">
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Cần xem xét thêm
            </div>
            <div className="text-[22px] font-extrabold text-[#5B21B6] tabular-nums mt-0.5">
              {reviewProgress.needsConsiderationCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Chuyển Quản lý / Hội đồng
            </div>
          </div>
        </div>
      </div>

      {/* Aging Grouping Visual */}
      <div className="bg-white rounded-[12px] border border-[#D4E2EC] p-4 space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[14.5px] font-extrabold text-[#0F2335] flex items-center gap-2">
              <Clock size={16} className="text-[#0D78AE]" />
              <span>Phân nhóm thời gian kể từ lần cập nhật gần nhất</span>
            </h2>
            <p className="text-[12px] text-[#526B7C]">
              Hỗ trợ Quản lý theo dõi nhịp độ xử lý hồ sơ mà không chấm điểm cá nhân.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {reviewProgress.agingBuckets.map((b) => (
            <div
              key={b.id}
              className="p-3 rounded-[9px] bg-[#F8FBFD] border border-[#DCE7EE] flex items-center justify-between"
            >
              <div>
                <div className="text-[12px] font-bold text-[#334E68]">
                  Thời gian: {b.label}
                </div>
                <div className="text-[11px] text-[#607483] mt-0.5">
                  Tính đến ngày 16/10/2026
                </div>
              </div>
              <span className="text-[20px] font-extrabold text-[#0F2335] tabular-nums">
                {b.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Aging Table */}
      <section className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-[15px] font-extrabold text-[#0F2335]">
              Hồ sơ chưa cập nhật gần đây ({reviewProgress.agingApplications.length} hồ sơ)
            </h3>
            <p className="text-[12px] text-[#526B7C]">
              Các hồ sơ có thời gian chưa cập nhật từ 3 ngày trở lên cần rà soát hoặc đôn đốc.
            </p>
          </div>
        </div>
        <SharedOperationalTable<{ app: StaffApplicationRecord; daysSinceUpdateLabel: string }>
          variant="operational"
          density="compact"
          ariaLabel="Bảng hồ sơ chưa cập nhật gần đây"
          data={reviewProgress.agingApplications}
          getRowKey={(r) => r.app.applicationId}
          getRowAttentionTone={() => 'warning'}
          emptyStateTitle="Không có hồ sơ nào bị trễ cập nhật trong phạm vi này."
          columns={[
            {
              key: 'student',
              header: 'Sinh viên',
              renderCell: ({ app }) => (
                <div>
                  <div className="font-bold text-[#0F2335]">
                    {app.student.fullName}
                  </div>
                  <div className="text-[11.5px] text-[#526B7C] tabular-nums">
                    {app.student.studentCode}
                  </div>
                </div>
              ),
            },
            {
              key: 'institution',
              header: 'Đơn vị',
              renderCell: ({ app }) => (
                <span className="text-[12.5px] text-[#172A3A]">
                  {app.institution.officialName}
                </span>
              ),
            },
            {
              key: 'officer',
              header: 'Cán bộ phụ trách',
              renderCell: ({ app }) => (
                <span className="text-[12.5px] font-semibold text-[#172A3A]">
                  {app.assignment?.officerName || 'Chưa phân công'}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Trạng thái',
              renderCell: ({ app }) => {
                const meta = getStaffApplicationStatusMeta(
                  app.workflowStatus
                );
                return (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[11.5px] font-bold border"
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
              key: 'updatedAt',
              header: 'Cập nhật gần nhất',
              align: 'center',
              renderCell: ({ app }) => (
                <span className="text-[12px] text-[#4A6275] tabular-nums">
                  {app.updatedAt}
                </span>
              ),
            },
            {
              key: 'aging',
              header: 'Thời gian chưa cập nhật',
              align: 'center',
              renderCell: ({ daysSinceUpdateLabel }) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-[5px] bg-[#FEF6EB] border border-[#FADDB6] text-[11.5px] font-bold text-[#B45309] tabular-nums">
                  {daysSinceUpdateLabel}
                </span>
              ),
            },
            {
              key: 'action',
              header: 'Thao tác',
              align: 'right',
              renderCell: ({ app }) => (
                <button
                  type="button"
                  onClick={() => onOpenApplicationReview(app.applicationId)}
                  className="px-2.5 py-1 rounded-[6px] border border-[#CFE0EC] bg-white hover:bg-[#EAF6FC] text-[11.5px] font-bold text-[#0B64A0] cursor-pointer"
                >
                  Mở hồ sơ
                </button>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
};
