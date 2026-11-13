/**
 * 5TOT Đà Nẵng — Officer Review Preliminary OCR & Criteria Assessment Bar
 * - Scannable at a glance for non-tech officers ("Nhìn là hiểu")
 * - 100% Lucide icons (zero emojis)
 * - 1-Click batch accept for valid preliminary items + Live OpenAI re-analysis trigger
 * - Advisory only: Final judgment always belongs to the reviewing officer
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  CheckCheck,
  RefreshCw,
  FileCheck2,
} from 'lucide-react';
import {
  ApplicationPreliminaryVerdictState,
  CriterionPreliminaryAssessment,
  AiFinding,
} from '../../features/ai-review-copilot';
import { CriterionId } from '../../types/application';

export interface OfficerReviewAiQuietSectionProps {
  verdict: ApplicationPreliminaryVerdictState;
  onOpenDetailedSummary: () => void;
  onInspectFinding?: (finding: AiFinding) => void;
  completedCriteriaCount: number;
  validUnreviewedDeclarationsCount?: number;
  onBatchAcceptValidDeclarations?: () => void;
  onReanalyzeAllEvidence?: () => void;
  isReanalyzing?: boolean;
  onSelectCriterion?: (criterionId: CriterionId) => void;
}

export const OfficerReviewAiQuietSection: React.FC<
  OfficerReviewAiQuietSectionProps
> = ({
  verdict,
  onOpenDetailedSummary,
  validUnreviewedDeclarationsCount = 0,
  onBatchAcceptValidDeclarations,
  onReanalyzeAllEvidence,
  isReanalyzing = false,
  onSelectCriterion,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const verdictTone =
    verdict.verdict === 'preliminary_meets'
      ? {
          text: '#136F3A',
          bg: '#EAFBF1',
          border: '#B6E6C9',
          label: 'Đạt sơ bộ 5/5 tiêu chí',
          Icon: CheckCircle2,
        }
      : {
          text: '#B45309',
          bg: '#FEF6EB',
          border: '#FADDB6',
          label: 'Cần kiểm tra thêm minh chứng',
          Icon: AlertTriangle,
        };

  const VerdictIcon = verdictTone.Icon;

  return (
    <div className="bg-white rounded-[10px] border border-[#DCE7EE] overflow-hidden shadow-2xs">
      <div className="p-3 px-3.5 bg-[#F8FBFD] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-7 h-7 rounded-[7px] bg-[#EAF5FC] text-[#0D78AE] flex items-center justify-center shrink-0 border border-[#CBE5F6]">
            <FileCheck2 size={15} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-extrabold text-[#0F2335]">
              Đánh giá sơ bộ & Đọc minh chứng (OCR)
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] text-[11.5px] font-bold border"
              style={{
                color: verdictTone.text,
                backgroundColor: verdictTone.bg,
                borderColor: verdictTone.border,
              }}
            >
              <VerdictIcon size={12.5} className="shrink-0" />
              <span>{verdictTone.label}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onBatchAcceptValidDeclarations && validUnreviewedDeclarationsCount > 0 && (
            <button
              type="button"
              onClick={onBatchAcceptValidDeclarations}
              className="inline-flex items-center gap-1.5 h-[30px] px-3 rounded-[6px] bg-[#16A34A] hover:bg-[#15803D] text-white text-[12px] font-bold transition-colors cursor-pointer border-0 shadow-2xs"
              title="Tự động đánh dấu Đạt cho tất cả các mục kê khai có minh chứng hợp lệ"
            >
              <CheckCheck size={13.5} />
              <span>Áp dụng Đạt cho các mục hợp lệ ({validUnreviewedDeclarationsCount})</span>
            </button>
          )}

          {onReanalyzeAllEvidence && (
            <button
              type="button"
              onClick={onReanalyzeAllEvidence}
              disabled={isReanalyzing}
              className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[6px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[12px] font-semibold text-[#334E68] transition-colors cursor-pointer disabled:opacity-60"
              title="Quét lại toàn bộ minh chứng bằng OpenAI"
            >
              <RefreshCw size={12.5} className={isReanalyzing ? 'animate-spin text-[#0D78AE]' : ''} />
              <span>{isReanalyzing ? 'Đang quét minh chứng...' : 'Phân tích lại'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenDetailedSummary}
            className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[6px] border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[12px] font-bold text-[#0066CC] transition-colors cursor-pointer"
          >
            <Sparkles size={12.5} />
            <span>Báo cáo chi tiết</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 h-[30px] px-2 rounded-[6px] border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[12px] font-bold text-[#334E68] transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
            {isExpanded ? <ChevronUp size={13.5} /> : <ChevronDown size={13.5} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 px-3.5 border-t border-[#EEF4F8] bg-white space-y-2.5">
          <div className="text-[12px] text-[#475569] flex items-center justify-between gap-2 flex-wrap">
            <span>
              {verdict.headline} — Bấm vào từng tiêu chí bên dưới để chuyển nhanh tới vị trí cần kiểm tra:
            </span>
            <span className="text-[11px] text-[#64748B] font-medium">
              Gợi ý sơ bộ hỗ trợ cán bộ · Quyết định chính thức do cán bộ xác nhận
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11.5px]">
            {Object.entries(verdict.criteriaAssessments).map(([critId, rawAssessment]) => {
              const assessment = rawAssessment as CriterionPreliminaryAssessment;
              const isMeets = assessment.status === 'meets';

              return (
                <button
                  key={critId}
                  type="button"
                  onClick={() => {
                    onSelectCriterion?.(critId as CriterionId);
                    const el = document.getElementById(`criterion-section-${critId}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`p-2.5 rounded-[8px] border text-left transition-all cursor-pointer space-y-1 ${
                    isMeets
                      ? 'bg-[#F8FEFA] hover:bg-[#EAFBF1] border-[#C6EED5]'
                      : 'bg-[#FFFBEB] hover:bg-[#FEF3C7] border-[#FDE68A]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-[#0F2335] truncate">
                      {assessment.criterionNumber}. {assessment.criterionName}
                    </span>
                    {isMeets ? (
                      <CheckCircle2 size={13} className="text-[#16A34A] shrink-0" />
                    ) : (
                      <AlertTriangle size={13} className="text-[#D97706] shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[11px] font-bold ${
                        isMeets ? 'text-[#136F3A]' : 'text-[#B45309]'
                      }`}
                    >
                      {isMeets ? 'Đạt sơ bộ' : 'Cần kiểm tra thêm'}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#526B7C] line-clamp-1">
                    {assessment.headline}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
