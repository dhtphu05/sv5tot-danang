import React from 'react';
import { MessageSquareWarning, FileSpreadsheet } from 'lucide-react';
import { AnalyticsTabId } from '../../../types';
import {
  SupplementDetailRow,
} from '../../../analyticsSelectors';
import { ReportPresetId } from '../../../exportService';
import { SharedOperationalTable } from '../../shared/SharedOperationalTable';
import { OperationalHorizontalBarChart } from '../OperationalChart';
import { Button } from '../../../../components/buttons/Button';

export interface AnalyticsSupplementsTabProps {
  supplementData: {
    summary: {
      totalSupplementRequests: number;
      waitingStudentCount: number;
      studentReturnedCount: number;
      waitingOfficerResumeCount: number;
      resumedOrClosedCount: number;
    };
    byCriterion: {
      criterionId: string;
      criterionNumber: number;
      criterionName: string;
      supplementRequestCount: number;
      considerationFlagCount: number;
      accentColor: string;
    }[];
    detailRows: SupplementDetailRow[];
  };
  triggerDrillDown: (payload: {
    targetTab: AnalyticsTabId;
    sourceLabel: string;
    reportPreset?: ReportPresetId;
  }) => void;
}

export const AnalyticsSupplementsTab: React.FC<AnalyticsSupplementsTabProps> = ({
  supplementData,
  triggerDrillDown,
}) => {
  return (
    <div className="space-y-4">
      {/* Supplement Summary Strip */}
      <div className="bg-white rounded-[12px] border border-[#D4E2EC] shadow-2xs overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E6EFF5]">
          <div className="p-3.5">
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Tổng yêu cầu bổ sung
            </div>
            <div className="text-[22px] font-extrabold text-[#0F2335] tabular-nums mt-0.5">
              {supplementData.summary.totalSupplementRequests}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Số yêu cầu bổ sung phát sinh
            </div>
          </div>
          <div className="p-3.5">
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Đang chờ sinh viên
            </div>
            <div className="text-[22px] font-extrabold text-[#B45309] tabular-nums mt-0.5">
              {supplementData.summary.waitingStudentCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Chưa gửi phản hồi
            </div>
          </div>
          <div className="p-3.5">
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Sinh viên đã gửi bổ sung
            </div>
            <div className="text-[22px] font-extrabold text-[#0B64A0] tabular-nums mt-0.5">
              {supplementData.summary.studentReturnedCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Đã tải thêm minh chứng/kê khai
            </div>
          </div>
          <div className="p-3.5">
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Chờ cán bộ tiếp tục xét
            </div>
            <div className="text-[22px] font-extrabold text-[#0284C7] tabular-nums mt-0.5">
              {supplementData.summary.waitingOfficerResumeCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Cần kiểm tra nội dung mới
            </div>
          </div>
          <div className="p-3.5">
            <div className="text-[11.5px] font-semibold text-[#526B7C]">
              Đã tiếp tục xét
            </div>
            <div className="text-[22px] font-extrabold text-[#136F3A] tabular-nums mt-0.5">
              {supplementData.summary.resumedOrClosedCount}
            </div>
            <div className="text-[11px] text-[#607483] mt-0.5">
              Đã đóng yêu cầu bổ sung
            </div>
          </div>
        </div>
      </div>

      {/* 5-Criterion Supplement & Flag Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OperationalHorizontalBarChart
          title="Yêu cầu bổ sung theo tiêu chí"
          subtitle="Số yêu cầu bổ sung phát sinh theo 05 tiêu chí (số liệu thực tế phục vụ hướng dẫn minh chứng)."
          unitLabel="yêu cầu"
          items={supplementData.byCriterion.map((c) => ({
            id: c.criterionId,
            label: `0${c.criterionNumber}. ${c.criterionName}`,
            value: c.supplementRequestCount,
            barColor: c.accentColor,
          }))}
        />
        <OperationalHorizontalBarChart
          title="Số nội dung được chuyển “Cần xem xét thêm”"
          subtitle="Số mục chuyên môn Cán bộ chuyển Hội đồng xem xét theo từng tiêu chí."
          unitLabel="nội dung"
          items={supplementData.byCriterion.map((c) => ({
            id: c.criterionId,
            label: `0${c.criterionNumber}. ${c.criterionName}`,
            value: c.considerationFlagCount,
            barColor: '#6D28D9',
          }))}
        />
      </div>

      {/* Supplement Detail Table */}
      <section className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-[15px] font-extrabold text-[#0F2335] flex items-center gap-2">
              <MessageSquareWarning size={16} className="text-[#0D78AE]" />
              <span>
                Danh sách yêu cầu bổ sung ({supplementData.detailRows.length} yêu cầu)
              </span>
            </h3>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              triggerDrillDown({
                targetTab: 'reports',
                reportPreset: 'SUPPLEMENT_LIST',
                sourceLabel: 'Thống kê bổ sung · Xuất danh sách yêu cầu bổ sung',
              })
            }
          >
            <FileSpreadsheet size={14} className="mr-1.5" />
            Xuất danh sách yêu cầu bổ sung
          </Button>
        </div>
        <SharedOperationalTable<SupplementDetailRow>
          variant="operational"
          density="compact"
          ariaLabel="Bảng chi tiết yêu cầu bổ sung"
          data={supplementData.detailRows}
          getRowKey={(r) => r.id}
          emptyStateTitle="Không có yêu cầu bổ sung phù hợp với bộ lọc."
          unitLabel="yêu cầu bổ sung"
          columns={[
            {
              key: 'student',
              header: 'Sinh viên',
              renderCell: (row) => (
                <div>
                  <div className="font-bold text-[#0F2335]">
                    {row.studentName}
                  </div>
                  <div className="text-[11.5px] text-[#526B7C] tabular-nums">
                    {row.studentCode}
                  </div>
                </div>
              ),
            },
            {
              key: 'institution',
              header: 'Đơn vị',
              renderCell: (row) => (
                <span className="text-[12.5px] text-[#172A3A]">
                  {row.institutionName}
                </span>
              ),
            },
            {
              key: 'criterion',
              header: 'Tiêu chí',
              renderCell: (row) => (
                <span className="font-bold text-[#0B64A0] text-[12.5px]">
                  {row.criterionName}
                </span>
              ),
            },
            {
              key: 'content',
              header: 'Nội dung',
              renderCell: (row) => (
                <div className="max-w-[230px]">
                  <div className="text-[12.5px] font-semibold text-[#172A3A] line-clamp-1">
                    {row.declarationTitle}
                  </div>
                  <div className="text-[11px] text-[#607483] line-clamp-1">
                    {row.requirementTitle}
                  </div>
                </div>
              ),
            },
            {
              key: 'officer',
              header: 'Cán bộ phụ trách',
              hideBelowLg: true,
              renderCell: (row) => (
                <span className="text-[12.5px] text-[#172A3A]">
                  {row.officerName}
                </span>
              ),
            },
            {
              key: 'requestedAt',
              header: 'Ngày yêu cầu',
              align: 'center',
              renderCell: (row) => (
                <span className="text-[12px] text-[#4A6275] tabular-nums">
                  {row.requestedAt}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Trạng thái',
              renderCell: (row) => (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-[5px] text-[11.5px] font-bold border ${
                    row.staffStatus === 'waiting_student'
                      ? 'bg-[#FEF6EB] text-[#B45309] border-[#FADDB6]'
                      : row.staffStatus === 'student_returned'
                      ? 'bg-[#EAF6FC] text-[#0B64A0] border-[#CBE5F6]'
                      : 'bg-[#EAFBF1] text-[#136F3A] border-[#B6E6C9]'
                  }`}
                >
                  {row.statusLabel}
                </span>
              ),
            },
            {
              key: 'updatedAt',
              header: 'Cập nhật gần nhất',
              align: 'center',
              hideBelowXl: true,
              renderCell: (row) => (
                <span className="text-[12px] text-[#526B7C] tabular-nums">
                  {row.updatedAt}
                </span>
              ),
            },
          ]}
        />
      </section>
    </div>
  );
};
