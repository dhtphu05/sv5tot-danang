import React, { useState } from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import {
  AnalyticsFilterState,
  AnalyticsWorkflowGroupKey,
  AnalyticsSubmittedPeriodKey,
  AnalyticsResultFilterKey,
  DEFAULT_ANALYTICS_FILTERS,
  WORKFLOW_BUCKET_META,
} from '../../analyticsSelectors';
import { CITY_REVIEW_OFFICERS } from '../../fixtures/staffDataset';

export interface AnalyticsFilterBarProps {
  filters: AnalyticsFilterState;
  setFilters: React.Dispatch<React.SetStateAction<AnalyticsFilterState>>;
  institutions: Array<{ id: string; name: string }>;
  canSeeUnpublished: boolean;
  activeInstitutionName: string | null;
  filteredAppsCount: number;
  totalAppsCount: number;
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  filters,
  setFilters,
  institutions,
  canSeeUnpublished,
  activeInstitutionName,
  filteredAppsCount,
  totalAppsCount,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const hasActiveFilters =
    filters.institutionId !== 'all' ||
    filters.workflowGroup !== 'all' ||
    filters.officerId !== 'all' ||
    filters.submittedPeriod !== 'all' ||
    filters.resultFilter !== 'all' ||
    filters.searchQuery.trim() !== '';

  const handleClearAllFilters = () => {
    setFilters(DEFAULT_ANALYTICS_FILTERS);
  };

  return (
    <div className="bg-white rounded-[12px] border border-[#D4E2EC] p-3.5 space-y-3 shadow-2xs print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary 1: Season */}
          <select
            value={filters.season}
            onChange={(e) =>
              setFilters((prev: AnalyticsFilterState) => ({ ...prev, season: e.target.value }))
            }
            aria-label="Chọn năm học"
            className="h-[36px] px-3 rounded-[8px] bg-[#F8FBFD] border border-[#CFE0EC] text-[12.5px] font-bold text-[#0F2335] outline-none cursor-pointer"
          >
            <option value="Năm học 2025–2026">Năm học 2025–2026 (Đang mở)</option>
            <option value="Năm học 2026–2027">Năm học 2026–2027 (Bản nháp)</option>
          </select>

          {/* Primary 2: Institution */}
          <select
            value={filters.institutionId}
            onChange={(e) =>
              setFilters((prev: AnalyticsFilterState) => ({
                ...prev,
                institutionId: e.target.value,
              }))
            }
            aria-label="Lọc theo đơn vị đào tạo"
            className="h-[36px] px-3 rounded-[8px] bg-[#F8FBFD] border border-[#CFE0EC] text-[12.5px] font-semibold text-[#172A3A] max-w-[290px] truncate outline-none cursor-pointer"
          >
            <option value="all">Tất cả đơn vị đào tạo (14 trường)</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>

          {/* Primary 3: Workflow Status Group */}
          <select
            value={filters.workflowGroup}
            onChange={(e) =>
              setFilters((prev: AnalyticsFilterState) => ({
                ...prev,
                workflowGroup: e.target.value as AnalyticsWorkflowGroupKey,
              }))
            }
            aria-label="Lọc theo trạng thái hồ sơ"
            className="h-[36px] px-3 rounded-[8px] bg-[#F8FBFD] border border-[#CFE0EC] text-[12.5px] font-semibold text-[#172A3A] outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái hồ sơ</option>
            <option value="unassigned">Chưa phân công</option>
            <option value="under_review">Đang xét</option>
            <option value="supplement_waiting">Chờ bổ sung</option>
            <option value="supplement_returned">Đã nhận bổ sung</option>
            <option value="review_completed">Đã hoàn tất xét</option>
            <option value="waiting_decision">Chờ quyết định</option>
            <option value="decided">Đã có kết quả</option>
          </select>

          {/* Search input */}
          <div className="relative min-w-[210px]">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#607483]"
            />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                setFilters((prev: AnalyticsFilterState) => ({
                  ...prev,
                  searchQuery: e.target.value,
                }))
              }
              placeholder="Tìm sinh viên, MSSV, mã hồ sơ..."
              className="h-[36px] w-full pl-8 pr-3 rounded-[8px] bg-[#F8FBFD] border border-[#CFE0EC] text-[12.5px] outline-none focus:border-[#0D78AE] focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 h-[36px] px-3 rounded-[8px] border text-[12.5px] font-semibold transition-colors cursor-pointer ${
              showAdvancedFilters
                ? 'bg-[#EAF6FC] border-[#0D78AE] text-[#0B64A0]'
                : 'bg-white border-[#CFE0EC] text-[#172A3A] hover:bg-[#F8FBFD]'
            }`}
          >
            <Filter size={13} />
            <span>Bộ lọc</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1 h-[36px] px-3 rounded-[8px] border border-[#CFE0EC] bg-white hover:bg-[#FEF2F2] text-[12px] font-bold text-[#B91C1C] transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible More Filters */}
      {showAdvancedFilters && (
        <div className="pt-3 border-t border-[#E6EFF5] grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#526B7C] mb-1">
              Cán bộ phụ trách
            </label>
            <select
              value={filters.officerId}
              onChange={(e) =>
                setFilters((prev: AnalyticsFilterState) => ({ ...prev, officerId: e.target.value }))
              }
              className="w-full h-[34px] px-2.5 rounded-[7px] bg-[#F8FBFD] border border-[#CFE0EC] text-[12.5px] font-medium text-[#172A3A]"
            >
              <option value="all">Tất cả cán bộ xét duyệt</option>
              <option value="unassigned">Chưa phân công cán bộ</option>
              {CITY_REVIEW_OFFICERS.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#526B7C] mb-1">
              Thời gian nộp hồ sơ
            </label>
            <select
              value={filters.submittedPeriod}
              onChange={(e) =>
                setFilters((prev: AnalyticsFilterState) => ({
                  ...prev,
                  submittedPeriod: e.target.value as AnalyticsSubmittedPeriodKey,
                }))
              }
              className="w-full h-[34px] px-2.5 rounded-[7px] bg-[#F8FBFD] border border-[#CFE0EC] text-[12.5px] font-medium text-[#172A3A]"
            >
              <option value="all">Toàn đợt tiếp nhận (01/10 – 15/10/2026)</option>
              <option value="early_oct">Đợt đầu (01/10 – 10/10/2026)</option>
              <option value="mid_oct">Đợt cao điểm (11/10 – 15/10/2026)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#526B7C] mb-1">
              Kết quả xét chọn
            </label>
            <select
              value={filters.resultFilter}
              onChange={(e) =>
                setFilters((prev: AnalyticsFilterState) => ({
                  ...prev,
                  resultFilter: e.target.value as AnalyticsResultFilterKey,
                }))
              }
              className="w-full h-[34px] px-2.5 rounded-[7px] bg-[#F8FBFD] border border-[#CFE0EC] text-[12.5px] font-medium text-[#172A3A]"
            >
              <option value="all">Tất cả trạng thái kết quả</option>
              <option value="recognized">Được công nhận</option>
              <option value="not_recognized">Chưa được công nhận</option>
              <option value="published">Đã công bố chính thức</option>
              {canSeeUnpublished && (
                <option value="unpublished">Đã có kết luận · Chưa công bố</option>
              )}
            </select>
          </div>
        </div>
      )}

      {/* Active Scope Filter Summary Strip */}
      <div className="pt-2 border-t border-[#EEF4F8] flex flex-wrap items-center justify-between gap-2 text-[12px]">
        <div className="flex flex-wrap items-center gap-1.5 text-[#4A6275]">
          <span className="font-bold text-[#172A3A]">Đang xem:</span>
          <span className="px-2 py-0.5 rounded-[5px] bg-[#F1F6FA] border border-[#DCE7EE] font-semibold text-[#0F2335]">
            {filters.season}
          </span>
          {activeInstitutionName && (
            <span className="px-2 py-0.5 rounded-[5px] bg-[#EAF6FC] border border-[#CBE5F6] font-bold text-[#0B64A0]">
              {activeInstitutionName}
            </span>
          )}
          {filters.workflowGroup !== 'all' && (
            <span className="px-2 py-0.5 rounded-[5px] bg-[#EAF6FC] border border-[#CBE5F6] font-bold text-[#0B64A0]">
              Trạng thái: {WORKFLOW_BUCKET_META[filters.workflowGroup].label}
            </span>
          )}
          {filters.officerId !== 'all' && (
            <span className="px-2 py-0.5 rounded-[5px] bg-[#EAF6FC] border border-[#CBE5F6] font-bold text-[#0B64A0]">
              Cán bộ:{' '}
              {filters.officerId === 'unassigned'
                ? 'Chưa phân công'
                : CITY_REVIEW_OFFICERS.find((o) => o.id === filters.officerId)?.fullName}
            </span>
          )}
        </div>

        <span className="text-[12px] font-bold text-[#0F2335] tabular-nums">
          Phạm vi hiện tại: {filteredAppsCount} / {totalAppsCount} hồ sơ
        </span>
      </div>
    </div>
  );
};
