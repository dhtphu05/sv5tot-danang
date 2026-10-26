/**
 * 5TOT Đà Nẵng — School Overview Page (FSD Pages Layer)
 * Renders 8 actionable summary cards, priority work queue ("Cần xử lý hôm nay"), and featured applications table.
 */

import React from 'react';
import { ArrowRight, Clock, Building2, FileText, CheckCircle2 } from 'lucide-react';
import {
  StaffApplicationRecord,
  StaffRouteId,
  StaffUser,
} from '../../staff/types';
import {
  SchoolOperationalMetrics,
  SchoolPriorityQueueItem,
} from '../../staff/schoolSelectors';
import {
  OperationalTableColumn,
  SharedOperationalTable,
} from '../../staff/components/shared/SharedOperationalTable';
import { Button } from '../../components/buttons/Button';

export interface SchoolOverviewPageProps {
  currentUser: StaffUser;
  unitName: string;
  unitShortName?: string;
  schoolApps: StaffApplicationRecord[];
  metrics: SchoolOperationalMetrics;
  priorityQueues: SchoolPriorityQueueItem[];
  registryColumns: OperationalTableColumn<StaffApplicationRecord>[];
  onSelectRoute: (routeId: StaffRouteId) => void;
  onOpenApplicationReview: (applicationId: string) => void;
  onSetStatusFilter: (filter: string) => void;
  onSetSupplementTab: (tab: 'all' | 'waiting' | 'returned' | 'completed') => void;
}

export const SchoolOverviewPage: React.FC<SchoolOverviewPageProps> = ({
  currentUser,
  unitName,
  unitShortName,
  schoolApps,
  metrics,
  priorityQueues,
  registryColumns,
  onSelectRoute,
  onOpenApplicationReview,
  onSetStatusFilter,
  onSetSupplementTab,
}) => {
  const UDN_MEMBERS = [
    { id: 'inst-dut', code: 'DUT', name: 'ĐH Bách khoa' },
    { id: 'inst-due', code: 'DUE', name: 'ĐH Kinh tế' },
    { id: 'inst-ued', code: 'UED', name: 'ĐH Sư phạm' },
    { id: 'inst-ufl', code: 'UFL', name: 'ĐH Ngoại ngữ' },
    { id: 'inst-ute', code: 'UTE', name: 'ĐH SP Kỹ thuật' },
    { id: 'inst-vku', code: 'VKU', name: 'ĐH CNTT Việt - Hàn' },
    { id: 'inst-vnuk', code: 'VNUK', name: 'Viện VNUK' },
    { id: 'inst-smp', code: 'SMP', name: 'Khoa Y Dược' },
  ];

  const memberBreakdowns = UDN_MEMBERS.map((m) => {
    const apps = schoolApps.filter(
      (a) =>
        a.institution.id === m.id ||
        a.applicantProfileSnapshot?.institutionId === m.id ||
        a.institution.officialName.toLowerCase().includes(m.name.toLowerCase()) ||
        a.institution.officialName.toLowerCase().includes(m.code.toLowerCase())
    );
    const recCount = apps.filter(
      (a) =>
        a.schoolPreliminaryStatus === 'recommended_forwarding' ||
        a.schoolPreliminaryStatus === 'forwarded_to_city' ||
        a.schoolReviewSummary?.recommendation === 'recommended'
    ).length;
    return {
      ...m,
      count: apps.length,
      recCount,
    };
  });

  return (
    <div className="p-6 max-w-[1280px] w-full mx-auto space-y-6">
      {/* Top Institutional Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DCE7EE] pb-4">
        <div>
          <div className="text-[12px] font-semibold text-[#526B7C] flex items-center gap-1.5">
            <span>5TOT Đà Nẵng</span>
            <span>·</span>
            <span className="text-[#0D78AE] font-bold">
              Xét sơ tuyển cấp Trường
            </span>
            <span>·</span>
            <span>{unitName}</span>
          </div>
          <h1 className="text-[21px] font-extrabold text-[#0F2335] mt-0.5">
            Bàn làm việc xét sơ tuyển · {currentUser.fullName}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => onSelectRoute('school_analytics')}
          >
            Thống kê tiến độ
          </Button>
        </div>
      </div>

      {/* UDN 8-Member Breakdown Strip & Consolidated Forwarding Status (UX-S3) */}
      <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[12px] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[#E0E7FF] text-[#4338CA] flex items-center justify-center shrink-0">
              <Building2 size={18} />
            </div>
            <div>
              <div className="text-[13.5px] font-bold text-[#0F2335] flex items-center gap-2">
                <span>Khối Đại học Đà Nẵng (08 trường thành viên &amp; đơn vị trực thuộc)</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">
                  QĐ 182/QĐ-ĐHĐN
                </span>
              </div>
              <div className="text-[11.5px] text-[#64748B]">
                Toàn bộ hồ sơ đề xuất từ 08 trường thành viên được tổng hợp thành 01 Đợt chuyển giao duy nhất tới Hội Sinh viên Thành phố.
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSelectRoute('school_awaiting_forward')}
            iconLeading={<FileText size={13} />}
          >
            Đợt chuyển giao ({metrics.recommendedForwarding} hồ sơ sẵn sàng)
          </Button>
        </div>

        {/* 8 Member Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-[#E2E8F0]">
          {memberBreakdowns.map((m) => (
            <div
              key={m.id}
              className="p-2 rounded-[8px] bg-white border border-[#E2E8F0] text-center"
            >
              <div className="font-bold text-[12px] text-[#0F2335]">{m.code}</div>
              <div className="text-[11px] text-[#64748B] truncate" title={m.name}>
                {m.name}
              </div>
              <div className="text-[11.5px] font-extrabold text-[#0D78AE] mt-1 tabular-nums">
                {m.count} hồ sơ
              </div>
              {m.recCount > 0 && (
                <div className="text-[10px] text-[#16A34A] font-bold flex items-center justify-center gap-0.5 mt-0.5">
                  <CheckCircle2 size={10} />
                  <span>{m.recCount} đề xuất</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 8 Actionable Summary Cards */}
      <div className="bg-white rounded-[12px] border border-[#D4E2EC] shadow-2xs overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E6EFF5]">
          <button
            type="button"
            onClick={() => {
              onSetStatusFilter('all');
              onSelectRoute('school_applications');
            }}
            className="p-4 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[12px] font-semibold text-[#526B7C]">
              Tổng hồ sơ đã nhận
            </div>
            <div className="text-[24px] font-extrabold text-[#0F2335] tabular-nums mt-1">
              {metrics.totalReceived}
            </div>
            <div className="text-[11.5px] text-[#607483] mt-1">
              Thuộc đơn vị {unitShortName || unitName}
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onSetStatusFilter('pending_intake');
              onSelectRoute('school_applications');
            }}
            className="p-4 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[12px] font-semibold text-[#526B7C]">
              Chờ bắt đầu xét
            </div>
            <div className="text-[24px] font-extrabold text-[#172A3A] tabular-nums mt-1">
              {metrics.pendingIntake}
            </div>
            <div className="text-[11.5px] text-[#0D78AE] font-semibold mt-1">
              Cần tiếp nhận sơ tuyển →
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onSetStatusFilter('under_review');
              onSelectRoute('school_applications');
            }}
            className="p-4 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[12px] font-semibold text-[#526B7C]">
              Đang xét sơ tuyển
            </div>
            <div className="text-[24px] font-extrabold text-[#0369A1] tabular-nums mt-1">
              {metrics.underReview}
            </div>
            <div className="text-[11.5px] text-[#0369A1] font-semibold mt-1">
              Đang rà soát 05 tiêu chí →
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onSetStatusFilter('supplement');
              onSelectRoute('school_applications');
            }}
            className="p-4 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[12px] font-semibold text-[#526B7C] flex items-center justify-between">
              <span>SV đã gửi bổ sung</span>
              {metrics.supplementReturned > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
              )}
            </div>
            <div className="text-[24px] font-extrabold text-[#0B64A0] tabular-nums mt-1">
              {metrics.supplementReturned}
            </div>
            <div className="text-[11.5px] text-[#0D78AE] font-semibold mt-1">
              Cần kiểm tra minh chứng mới →
            </div>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#E6EFF5] border-t border-[#E6EFF5]">
          <button
            type="button"
            onClick={() => {
              onSetStatusFilter('supplement');
              onSelectRoute('school_applications');
            }}
            className="p-4 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[12px] font-semibold text-[#526B7C]">
              Chờ sinh viên bổ sung
            </div>
            <div className="text-[24px] font-extrabold text-[#B45309] tabular-nums mt-1">
              {metrics.waitingSupplement}
            </div>
            <div className="text-[11.5px] text-[#607483] mt-1">
              Đang mở cổng cho sinh viên
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onSetStatusFilter('preliminary_completed');
              onSelectRoute('school_applications');
            }}
            className="p-4 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[12px] font-semibold text-[#526B7C]">
              Đã hoàn tất xét sơ tuyển
            </div>
            <div className="text-[24px] font-extrabold text-[#1D4ED8] tabular-nums mt-1">
              {metrics.preliminaryCompleted}
            </div>
            <div className="text-[11.5px] text-[#607483] mt-1">
              5/5 tiêu chí đã hoàn tất
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectRoute('school_awaiting_forward')}
            className="p-4 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[12px] font-semibold text-[#526B7C]">
              Chờ đề xuất chuyển
            </div>
            <div className="text-[24px] font-extrabold text-[#15803D] tabular-nums mt-1">
              {metrics.recommendedForwarding}
            </div>
            <div className="text-[11.5px] text-[#15803D] font-semibold mt-1">
              Sẵn sàng chuyển giao S3 →
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectRoute('school_awaiting_forward')}
            className="p-4 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer"
          >
            <div className="text-[12px] font-semibold text-[#526B7C]">
              Đã chuyển Thành phố
            </div>
            <div className="text-[24px] font-extrabold text-[#047857] tabular-nums mt-1">
              {metrics.forwardedToCity}
            </div>
            <div className="text-[11.5px] text-[#607483] mt-1">
              Lịch sử lưu trữ (chỉ đọc)
            </div>
          </button>
        </div>
      </div>

      {/* Priority Work Queue */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#0F2335] flex items-center gap-2">
              <Clock size={17} className="text-[#0D78AE]" />
              <span>Cần xử lý hôm nay</span>
            </h2>
            <p className="text-[12.5px] text-[#526B7C] mt-0.5">
              Các hồ sơ có phản hồi bổ sung, hồ sơ mới hoặc hồ sơ đã rà soát xong cần hoàn tất xét sơ tuyển.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {priorityQueues.map((item) => (
            <div
              key={item.category}
              className="bg-white rounded-[11px] border border-[#DCE7EE] p-4 flex flex-col justify-between hover:border-[#BED6E8] transition-colors"
            >
              <div>
                <div className="text-[12px] font-bold text-[#526B7C]">
                  {item.categoryLabel}
                </div>
                <div className="text-[26px] font-extrabold text-[#0F2335] tabular-nums mt-1">
                  {item.count}
                </div>
                {item.applications.length > 0 ? (
                  <div className="mt-2 space-y-1.5 border-t border-[#EEF4F8] pt-2">
                    {item.applications.slice(0, 2).map((app) => (
                      <div
                        key={app.applicationId}
                        onClick={() =>
                          onOpenApplicationReview(app.applicationId)
                        }
                        className="text-[12px] text-[#172A3A] font-semibold truncate hover:text-[#0D78AE] cursor-pointer"
                      >
                        {app.student.fullName} ({app.student.studentCode})
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11.5px] text-[#8EA1AF] italic mt-2 border-t border-[#EEF4F8] pt-2">
                    Hiện không có hồ sơ tồn đọng
                  </div>
                )}
              </div>

              {item.applications.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (item.category === 'supplement_returned') {
                      onSetSupplementTab('returned');
                      onSelectRoute('school_supplements');
                    } else {
                      onSelectRoute('school_applications');
                    }
                  }}
                  className="mt-3 text-[12px] font-bold text-[#0D78AE] hover:text-[#095386] flex items-center gap-1 cursor-pointer"
                >
                  <span>Mở xử lý danh sách</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Applications Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#0F2335]">
              Hồ sơ sinh viên thuộc {unitName}
            </h2>
            <p className="text-[12.5px] text-[#526B7C] mt-0.5">
              Danh sách hồ sơ mới nhất trong thẩm quyền xét sơ tuyển.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSelectRoute('school_applications')}
          >
            Xem toàn bộ ({schoolApps.length})
          </Button>
        </div>

        <SharedOperationalTable
          variant="operational"
          ariaLabel="Bảng hồ sơ sinh viên cấp Trường"
          columns={registryColumns}
          data={schoolApps.slice(0, 8)}
          getRowKey={(app) => app.applicationId}
          onSelectRow={(app: StaffApplicationRecord) =>
            onOpenApplicationReview(app.applicationId)
          }
          unitLabel="hồ sơ"
        />
      </section>
    </div>
  );
};
