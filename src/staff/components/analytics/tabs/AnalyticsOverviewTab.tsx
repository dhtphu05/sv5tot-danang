import React from 'react';
import { AlertTriangle, FileSpreadsheet } from 'lucide-react';
import {
  AnalyticsTabId,
  StaffApplicationRecord,
} from '../../../types';
import {
  AnalyticsFilterState,
  SeasonSummaryMetrics,
  WorkflowDistributionItem,
  OperationalAttentionItem,
} from '../../../analyticsSelectors';
import { ReportPresetId } from '../../../exportService';
import {
  OperationalTableColumn,
  SharedOperationalTable,
} from '../../shared/SharedOperationalTable';
import { WorkflowDistributionChart } from '../OperationalChart';
import { Button } from '../../../../components/buttons/Button';

export interface AnalyticsOverviewTabProps {
  seasonMetrics: SeasonSummaryMetrics;
  filters: AnalyticsFilterState;
  setFilters: React.Dispatch<React.SetStateAction<AnalyticsFilterState>>;
  workflowDistribution: WorkflowDistributionItem[];
  attentionItems: OperationalAttentionItem[];
  triggerDrillDown: (payload: {
    targetTab: AnalyticsTabId;
    sourceLabel: string;
    reportPreset?: ReportPresetId;
  }) => void;
  filteredApps: StaffApplicationRecord[];
  underlyingAppColumns: OperationalTableColumn<StaffApplicationRecord>[];
}

export const AnalyticsOverviewTab: React.FC<AnalyticsOverviewTabProps> = ({
  seasonMetrics,
  filters,
  setFilters,
  workflowDistribution,
  attentionItems,
  triggerDrillDown,
  filteredApps,
  underlyingAppColumns,
}) => {
  return (
    <div className="space-y-4">
      {/* Structured Season Summary Strip */}
      <div className="bg-white rounded-[12px] border border-[#D4E2EC] shadow-2xs overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[#E6EFF5]">
          <button
            type="button"
            onClick={() =>
              setFilters((prev: AnalyticsFilterState) => ({ ...prev, workflowGroup: 'all' }))
            }
            className="p-3.5 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Tổng hồ sơ
            </div>
            <div className="text-[22px] font-extrabold text-[#0F2335] tabular-nums mt-0.5">
              {seasonMetrics.totalApplications}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Trong phạm vi đang xem
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters((prev: AnalyticsFilterState) => ({
                ...prev,
                workflowGroup:
                  prev.workflowGroup === 'unassigned' ? 'all' : 'unassigned',
              }))
            }
            className="p-3.5 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Chưa phân công
            </div>
            <div className="text-[22px] font-extrabold text-[#172A3A] tabular-nums mt-0.5">
              {seasonMetrics.unassignedCount}
            </div>
            <div className="text-[11px] text-[#0D78AE] font-semibold mt-0.5">
              Chờ điều phối →
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters((prev: AnalyticsFilterState) => ({
                ...prev,
                workflowGroup:
                  prev.workflowGroup === 'under_review' ? 'all' : 'under_review',
              }))
            }
            className="p-3.5 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Đang xét
            </div>
            <div className="text-[22px] font-extrabold text-[#0B64A0] tabular-nums mt-0.5">
              {seasonMetrics.underReviewCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Có {seasonMetrics.supplementReturnedCount} vừa gửi bổ sung
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFilters((prev: AnalyticsFilterState) => ({
                ...prev,
                workflowGroup:
                  prev.workflowGroup === 'supplement_waiting'
                    ? 'all'
                    : 'supplement_waiting',
              }))
            }
            className="p-3.5 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Đang chờ bổ sung
            </div>
            <div className="text-[22px] font-extrabold text-[#B45309] tabular-nums mt-0.5">
              {seasonMetrics.waitingSupplementCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Chờ sinh viên phản hồi
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              triggerDrillDown({
                targetTab: 'progress',
                sourceLabel: 'Tổng quan · Đã hoàn tất xét',
              })
            }
            className="p-3.5 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Đã hoàn tất xét
            </div>
            <div className="text-[22px] font-extrabold text-[#0F766E] tabular-nums mt-0.5">
              {seasonMetrics.completedReviewCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Hoàn tất xét 5/5 tiêu chí
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              triggerDrillDown({
                targetTab: 'results',
                sourceLabel: 'Tổng quan · Đã có kết luận',
              })
            }
            className="p-3.5 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Đã có kết luận
            </div>
            <div className="text-[22px] font-extrabold text-[#136F3A] tabular-nums mt-0.5">
              {seasonMetrics.decidedCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Đã công bố: {seasonMetrics.publishedCount}
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid: Workflow Distribution + Operational Attention List */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_370px] gap-4 items-start">
        <WorkflowDistributionChart
          items={workflowDistribution}
          totalCount={seasonMetrics.totalApplications}
          activeGroupKey={filters.workflowGroup}
          onSelectSegment={(key) =>
            setFilters((prev: AnalyticsFilterState) => ({
              ...prev,
              workflowGroup: prev.workflowGroup === key ? 'all' : (key as any),
            }))
          }
        />

        {/* Operational Attention Section */}
        <div className="bg-white rounded-[12px] border border-[#D4E2EC] p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[#E6EFF5] pb-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-[#D97706]" />
              <h2 className="text-[14.5px] font-extrabold text-[#0F2335]">
                Cần chú ý trong mùa xét
              </h2>
            </div>
            <span className="text-[11.5px] text-[#526B7C]">
              Dữ liệu thực tế
            </span>
          </div>
          <div className="space-y-2">
            {attentionItems.map((att) => {
              const presetMap: Record<typeof att.id, ReportPresetId> = {
                unassigned: 'UNASSIGNED_APPLICATIONS',
                supplement_returned: 'SUPPLEMENT_RETURNED',
                aging: 'UNDER_REVIEW_APPLICATIONS',
                near_deadline: 'ALL_SUBMITTED_APPLICATIONS',
                committee_flagged: 'COMMITTEE_ATTENTION',
              };
              return (
                <div
                  key={att.id}
                  className="p-2.5 rounded-[9px] bg-[#F8FBFD] border border-[#E2EDF5] flex items-center justify-between gap-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-bold text-[#0F2335]">
                      {att.title}
                    </div>
                    <div className="text-[11.5px] text-[#526B7C] truncate">
                      {att.supporting}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      triggerDrillDown({
                        targetTab:
                          att.id === 'aging' ? 'progress' : 'reports',
                        reportPreset: presetMap[att.id],
                        sourceLabel: `Cần chú ý · ${att.title}`,
                      })
                    }
                    className="shrink-0 px-2.5 py-1 rounded-[6px] bg-white hover:bg-[#EAF6FC] border border-[#CFE0EC] text-[11.5px] font-bold text-[#0B64A0] transition-colors cursor-pointer"
                  >
                    Xem danh sách
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Underlying Filtered Applications Table */}
      <section className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-extrabold text-[#0F2335]">
              Danh sách hồ sơ trong phạm vi đang xem ({filteredApps.length} hồ sơ)
            </h2>
            <p className="text-[12px] text-[#526B7C]">
              Khớp chính xác với biểu đồ phân bố trạng thái và bộ lọc phía trên.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              triggerDrillDown({
                targetTab: 'reports',
                reportPreset: 'ALL_SUBMITTED_APPLICATIONS',
                sourceLabel: 'Tổng quan · Danh sách hồ sơ đang lọc',
              })
            }
          >
            <FileSpreadsheet size={14} className="mr-1.5" />
            Mở trong Danh sách &amp; xuất dữ liệu
          </Button>
        </div>
        <SharedOperationalTable<StaffApplicationRecord>
          variant="operational"
          density="compact"
          ariaLabel="Danh sách hồ sơ theo bộ lọc thống kê"
          columns={underlyingAppColumns}
          data={filteredApps}
          getRowKey={(r) => r.applicationId}
          emptyStateTitle="Chưa có hồ sơ trong phạm vi này."
          pageSize={10}
          unitLabel="hồ sơ"
        />
      </section>
    </div>
  );
};
