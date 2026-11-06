/**
 * 5TOT Đà Nẵng — Officer Application Review Header (ReviewApplicationHeader)
 * Cơ quan quản lý: Thành Đoàn - Hội Sinh viên Thành phố Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Prompt 17 Sections 8, 9, 10, 11, 77, 101:
 * - Sticky compact header showing Student identity, MSSV, school, school year,
 *   application state, Officer assignment ("Cán bộ phụ trách", never "Assignee"),
 *   submission date, internal deadline, and operational review progress ("X / 5 tiêu chí đã hoàn tất xét").
 * - Limited, high-utility actions: "Tìm trong hồ sơ", "Thông tin hồ sơ", "Lịch sử xử lý".
 */

import React from 'react';
import {
  ArrowLeft,
  Search,
  X,
  FileText,
  History,
  PlayCircle,
  PanelRightOpen,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { StaffApplicationRecord } from '../../types';
import { getStaffApplicationStatusMeta } from '../../statusMap';
import {
  ReviewStage,
  SCHOOL_PRELIMINARY_STATUS_META,
  SchoolPreliminaryStatus,
} from '../../schoolReviewTypes';
import { resolveSchoolPreliminaryStatus } from '../../schoolSelectors';
import { AiAmbientIndicator } from '../../../features/ai-review-copilot';

export interface ReviewApplicationHeaderProps {
  applicationRecord: StaffApplicationRecord;
  completedCriteriaCount: number;
  canCompleteApplication: boolean;
  isApplicationCompleted: boolean;
  searchQuery: string;
  reviewProgressSummary?: string;
  onSearchChange: (q: string) => void;
  onBackToQueue: () => void;
  onOpenApplicationInfo: () => void;
  onOpenHistory: () => void;
  onOpenAiSummary?: () => void;
  onOpenAgentActivity?: () => void;
  onOpenDemoTour?: () => void;
  attentionCount?: number;
  onOpenCompleteDialog: () => void;
  historyCount: number;
  isRightInspectorOpenOnCompact?: boolean;
  onToggleRightInspectorOnCompact?: () => void;
  hasStartedReview?: boolean;
  onStartReview?: () => void;
  reviewStage?: ReviewStage;
  schoolReviewUnitName?: string;
  isReadOnly?: boolean;
}

export const ReviewApplicationHeader: React.FC<ReviewApplicationHeaderProps> = ({
  applicationRecord,
  completedCriteriaCount,
  canCompleteApplication,
  isApplicationCompleted,
  searchQuery,
  reviewProgressSummary,
  onSearchChange,
  onBackToQueue,
  onOpenApplicationInfo,
  onOpenHistory,
  onOpenAiSummary,
  onOpenAgentActivity,
  onOpenDemoTour,
  attentionCount = 2,
  onOpenCompleteDialog,
  historyCount,
  isRightInspectorOpenOnCompact = false,
  onToggleRightInspectorOnCompact,
  hasStartedReview = true,
  onStartReview,
  reviewStage = 'CITY',
  schoolReviewUnitName,
  isReadOnly = false,
}) => {
  const isSchoolStage = reviewStage === 'SCHOOL';

  // In School stage, use SchoolPreliminaryStatus metadata
  const schoolStatus: SchoolPreliminaryStatus = resolveSchoolPreliminaryStatus(applicationRecord);
  const schoolStatusMeta = SCHOOL_PRELIMINARY_STATUS_META[schoolStatus];

  const cityStatusMeta = getStaffApplicationStatusMeta(
    applicationRecord.workflowStatus
  );

  const statusLabel = isSchoolStage ? schoolStatusMeta.label : cityStatusMeta.label;
  const statusBg = isSchoolStage ? schoolStatusMeta.badgeBg : '#E1F0FD';
  const statusText = isSchoolStage ? schoolStatusMeta.badgeText : '#1988DF';
  const statusDot = isSchoolStage ? schoolStatusMeta.dotColor : '#1988DF';

  return (
    <div className="w-full space-y-2.5">
      {/* Read-Only Historical Notice */}
      {isReadOnly && (
        <div className="p-2.5 px-3.5 rounded-[5px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-[12.5px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold">Lưu ý:</span>
            <span>
              Hồ sơ này đã được chuyển giao lên cấp Thành phố Đà Nẵng. Toàn bộ thông tin xét sơ tuyển cấp Trường được lưu trữ để tra cứu lịch sử (chế độ chỉ đọc).
            </span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-[4px] bg-[#DBEAFE] text-[#1D4ED8] shrink-0">
            Chỉ đọc
          </span>
        </div>
      )}

      {/* Unified Flat Administrative Dossier Header & Search Toolbar */}
      <div className="w-full bg-white rounded-[6px] border border-[#DFE5EC] p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Back Button */}
            <button
              type="button"
              onClick={onBackToQueue}
              title={isSchoolStage ? 'Quay lại danh sách hồ sơ cấp Trường' : 'Quay lại danh sách hồ sơ'}
              className="h-[34px] px-3 rounded-[5px] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#1E293B] font-semibold text-[12.5px] inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 select-none mt-0.5"
            >
              <ArrowLeft size={14.5} />
              <span>{isSchoolStage ? 'Danh sách xét sơ' : 'Danh sách hồ sơ'}</span>
            </button>

            {/* Student Identity & Status */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[19px] sm:text-[21px] font-extrabold text-[#0F172A] tracking-tight truncate">
                  {applicationRecord.student.fullName}
                </h1>
                <span className="px-2 py-0.5 rounded-[4px] text-[11.5px] font-bold font-mono bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] tabular-nums">
                  MSSV: {applicationRecord.student.studentCode}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[11.5px] font-bold border"
                  style={{
                    backgroundColor: statusBg,
                    color: statusText,
                    borderColor: isSchoolStage ? schoolStatusMeta.badgeBorder : '#CBE5F6',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: statusDot }}
                  />
                  {statusLabel}
                </span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#ECFDF5] border border-[#A7F3D0] text-[11.5px] font-semibold text-[#065F46]">
                  <span className="font-bold">
                    {isSchoolStage ? 'Tiến độ sơ tuyển:' : 'Tiến độ thẩm định:'}
                  </span>
                  <strong className="tabular-nums font-bold text-[#047857]">
                    {completedCriteriaCount}/5 tiêu chí
                  </strong>
                  {reviewProgressSummary && (
                    <span className="text-[#047857]/85 font-normal">
                      ({reviewProgressSummary})
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[12px] text-[#475569] mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[#0F172A]">
                  {applicationRecord.institution.officialName}
                </span>
                <span>·</span>
                {isSchoolStage && (
                  <>
                    <span className="text-[#007EE5] font-semibold">
                      Đơn vị xét sơ:{' '}
                      {schoolReviewUnitName ||
                        applicationRecord.schoolReviewUnitName ||
                        applicationRecord.institution.officialName}
                    </span>
                    <span>·</span>
                  </>
                )}
                <span>{applicationRecord.schoolYear || 'Năm học 2025–2026'}</span>
                <span>·</span>
                <span>
                  {isSchoolStage ? 'Cán bộ sơ tuyển:' : 'Cán bộ thẩm định:'}{' '}
                  <strong className="font-semibold text-[#0F172A]">
                    {isSchoolStage
                      ? applicationRecord.schoolReviewSummary?.recommendingOfficerName ||
                        applicationRecord.assignment?.officerName ||
                        'Tổ sơ tuyển cấp Trường'
                      : applicationRecord.assignment?.officerName || 'Tổ thẩm định cấp Thành phố Đà Nẵng'}
                  </strong>
                </span>
                <span>·</span>
                <span className="tabular-nums">Ngày nộp: {applicationRecord.submittedAt}</span>
              </div>
            </div>
          </div>

          {/* Compact Search & Actions */}
          <div className="flex items-center gap-2 flex-wrap lg:shrink-0">
            <div className="w-full sm:w-[230px] h-[34px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-[5px] flex items-center px-2.5 gap-2 focus-within:border-[#007EE5] focus-within:bg-white transition-colors">
              <Search size={14} className="text-[#64748B] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm trong hồ sơ..."
                aria-label="Tìm trong hồ sơ"
                className="w-full h-full bg-transparent border-0 text-[12.5px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Xóa tìm kiếm"
                  className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenApplicationInfo}
              title="Thông tin hồ sơ"
              className="w-[34px] h-[34px] rounded-[5px] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              <FileText size={14.5} />
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className="h-[34px] px-3 rounded-[5px] bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] font-semibold text-[12.5px] flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
            >
              <History size={14.5} className="text-[#007EE5]" />
              <span>Lịch sử</span>
              {historyCount > 0 && (
                <span className="text-[11.5px] font-bold text-[#64748B] tabular-nums">
                  ({historyCount})
                </span>
              )}
            </button>

            {!hasStartedReview && onStartReview && !isReadOnly && (
              <button
                type="button"
                onClick={onStartReview}
                className="h-[34px] px-3.5 rounded-[5px] bg-[#10A37F] hover:bg-[#0D8A6B] text-white font-semibold text-[12.5px] flex items-center gap-1.5 cursor-pointer transition-colors border-0 shrink-0"
              >
                <PlayCircle size={14.5} />
                <span>{isSchoolStage ? 'Bắt đầu xét sơ tuyển' : 'Bắt đầu xét hồ sơ'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

