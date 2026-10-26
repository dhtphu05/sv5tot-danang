import React from 'react';
import { Building2, FileSpreadsheet } from 'lucide-react';
import {
  AnalyticsTabId,
  StaffApplicationRecord,
} from '../../../types';
import {
  AnalyticsFilterState,
  InstitutionAnalyticsRow,
} from '../../../analyticsSelectors';
import { ReportPresetId } from '../../../exportService';
import {
  OperationalTableColumn,
  SharedOperationalTable,
} from '../../shared/SharedOperationalTable';
import { OperationalHorizontalBarChart } from '../OperationalChart';
import { Button } from '../../../../components/buttons/Button';

export interface AnalyticsInstitutionsTabProps {
  filters: AnalyticsFilterState;
  setFilters: React.Dispatch<React.SetStateAction<AnalyticsFilterState>>;
  institutionSummary: InstitutionAnalyticsRow[];
  seasonMetrics: {
    publishedCount: number;
  };
  canSeeUnpublished: boolean;
  activeInstitutionName: string | null;
  filteredApps: StaffApplicationRecord[];
  underlyingAppColumns: OperationalTableColumn<StaffApplicationRecord>[];
  triggerDrillDown: (payload: {
    targetTab: AnalyticsTabId;
    sourceLabel: string;
    reportPreset?: ReportPresetId;
    filterPatch?: Partial<AnalyticsFilterState>;
  }) => void;
}

export const AnalyticsInstitutionsTab: React.FC<AnalyticsInstitutionsTabProps> = ({
  filters,
  setFilters,
  institutionSummary,
  seasonMetrics,
  canSeeUnpublished,
  activeInstitutionName,
  filteredApps,
  underlyingAppColumns,
  triggerDrillDown,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15.5px] font-extrabold text-[#0F2335] flex items-center gap-2">
            <Building2 size={17} className="text-[#0D78AE]" />
            <span>Thống kê hồ sơ theo đơn vị đào tạo</span>
          </h2>
          <p className="text-[12.5px] text-[#526B7C]">
            Tổng hợp số lượng hồ sơ tiếp nhận, tiến độ thẩm định và kết quả theo từng trường/đơn vị trực thuộc (sắp xếp hành chính theo tên đơn vị, không xếp hạng).
          </p>
        </div>
        {filters.institutionId !== 'all' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setFilters((prev: AnalyticsFilterState) => ({ ...prev, institutionId: 'all' }))
            }
          >
            Hiển thị tất cả 14 đơn vị
          </Button>
        )}
      </div>

      {/* 1. Institution Summary Table First */}
      <SharedOperationalTable<InstitutionAnalyticsRow>
        variant="operational"
        density="compact"
        ariaLabel="Bảng tổng hợp hồ sơ theo đơn vị đào tạo"
        data={institutionSummary}
        getRowKey={(r) => r.institutionId}
        selectedRowKey={
          filters.institutionId !== 'all' ? filters.institutionId : null
        }
        onSelectRow={(row) =>
          setFilters((prev: AnalyticsFilterState) => ({
            ...prev,
            institutionId:
              prev.institutionId === row.institutionId
                ? 'all'
                : row.institutionId,
          }))
        }
        unitLabel="đơn vị đào tạo"
        pageSize={15}
        columns={[
          {
            key: 'institutionName',
            header: 'Đơn vị',
            renderCell: (row) => (
              <div className="font-bold text-[#0F2335] text-[13px]">
                {row.institutionName}
              </div>
            ),
          },
          {
            key: 'totalSubmitted',
            header: 'Tổng hồ sơ',
            align: 'center',
            renderCell: (row) => (
              <span className="font-extrabold text-[#0F2335] tabular-nums">
                {row.totalSubmitted}
              </span>
            ),
          },
          {
            key: 'underReviewCount',
            header: 'Đang xét',
            align: 'center',
            renderCell: (row) => (
              <span className="font-bold text-[#0B64A0] tabular-nums">
                {row.underReviewCount}
              </span>
            ),
          },
          {
            key: 'waitingSupplementCount',
            header: 'Chờ bổ sung',
            align: 'center',
            renderCell: (row) => (
              <span className="font-bold text-[#B45309] tabular-nums">
                {row.waitingSupplementCount}
              </span>
            ),
          },
          {
            key: 'completedReviewCount',
            header: 'Đã hoàn tất xét',
            align: 'center',
            renderCell: (row) => (
              <span className="font-bold text-[#0F766E] tabular-nums">
                {row.completedReviewCount}
              </span>
            ),
          },
          {
            key: 'decidedCount',
            header: 'Đã có kết quả',
            align: 'center',
            renderCell: (row) => (
              <span className="font-bold text-[#172A3A] tabular-nums">
                {row.decidedCount}
              </span>
            ),
          },
          ...(seasonMetrics.publishedCount > 0 || canSeeUnpublished
            ? [
                {
                  key: 'recognizedCount',
                  header:
                    seasonMetrics.publishedCount > 0
                      ? 'Được công nhận'
                      : 'Được công nhận (Nội bộ HĐ)',
                  align: 'center' as const,
                  renderCell: (row: InstitutionAnalyticsRow) => (
                    <span className="font-extrabold text-[#136F3A] tabular-nums">
                      {row.recognizedCount}
                    </span>
                  ),
                },
              ]
            : []),
          {
            key: 'action',
            header: 'Thao tác',
            align: 'right',
            renderCell: (row) => (
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilters((prev: AnalyticsFilterState) => ({
                      ...prev,
                      institutionId: row.institutionId,
                    }));
                  }}
                  className="px-2.5 py-1 rounded-[6px] border border-[#CFE0EC] bg-white hover:bg-[#EAF6FC] text-[11.5px] font-bold text-[#0B64A0] cursor-pointer"
                >
                  Xem chi tiết
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerDrillDown({
                      targetTab: 'reports',
                      filterPatch: { institutionId: row.institutionId },
                      reportPreset: 'BY_INSTITUTION',
                      sourceLabel: `Theo đơn vị · ${row.institutionName}`,
                    });
                  }}
                  className="px-2.5 py-1 rounded-[6px] border border-[#CFE0EC] bg-[#F8FBFD] hover:bg-[#EAF6FC] text-[11.5px] font-semibold text-[#172A3A] cursor-pointer"
                >
                  Xuất DS
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* 2. Restrained Horizontal Bar Chart */}
      <OperationalHorizontalBarChart
        title="Số hồ sơ theo đơn vị"
        subtitle="Nhấn vào một đơn vị để lọc danh sách hồ sơ chi tiết bên dưới."
        unitLabel="hồ sơ"
        maxItems={14}
        selectedId={
          filters.institutionId !== 'all' ? filters.institutionId : null
        }
        onSelectBar={(instId) =>
          setFilters((prev: AnalyticsFilterState) => ({
            ...prev,
            institutionId: prev.institutionId === instId ? 'all' : instId,
          }))
        }
        items={institutionSummary.map((r) => ({
          id: r.institutionId,
          label: r.institutionName,
          value: r.totalSubmitted,
          secondaryValue: r.completedReviewCount,
          secondaryLabel: 'Hoàn tất xét',
          barColor: '#0D78AE',
        }))}
      />

      {/* 3. Institution Detail Drill-Down Section when an Institution is selected */}
      {filters.institutionId !== 'all' && (
        <section className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-[15px] font-extrabold text-[#0F2335]">
                Danh sách hồ sơ thuộc {activeInstitutionName} ({filteredApps.length} hồ sơ)
              </h3>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                triggerDrillDown({
                  targetTab: 'reports',
                  reportPreset: 'BY_INSTITUTION',
                  sourceLabel: `Theo đơn vị · ${activeInstitutionName}`,
                })
              }
            >
              <FileSpreadsheet size={14} className="mr-1.5" />
              Xuất danh sách đơn vị này
            </Button>
          </div>
          <SharedOperationalTable<StaffApplicationRecord>
            variant="operational"
            density="compact"
            ariaLabel={`Danh sách hồ sơ của ${activeInstitutionName}`}
            columns={underlyingAppColumns}
            data={filteredApps}
            getRowKey={(r) => r.applicationId}
            pageSize={10}
          />
        </section>
      )}
    </div>
  );
};
