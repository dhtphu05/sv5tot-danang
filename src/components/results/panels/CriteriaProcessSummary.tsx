import React from 'react';
import { Check, Clock, ExternalLink } from 'lucide-react';
import { FinalResultData } from '../resultTypes';

export interface CriteriaProcessSummaryProps {
  activeResult: FinalResultData;
  onOpenApplication: (critId?: string) => void;
}

export const CriteriaProcessSummary: React.FC<CriteriaProcessSummaryProps> = ({
  activeResult,
  onOpenApplication,
}) => {
  return (
    <section
      aria-label="Tóm tắt quá trình xét 5 tiêu chí"
      className="lg:col-span-7 bg-white rounded-[14px] border border-[#DCE7EE] shadow-2xs overflow-hidden"
    >
      <div className="px-5 py-3.5 bg-[#F8FBFD] border-b border-[#DCE7EE] flex items-center justify-between gap-2">
        <div>
          <h3 className="text-[14.5px] font-bold text-[#172A3A]">
            Tóm tắt quá trình xét 5 tiêu chí
          </h3>
          <p className="text-[12px] text-[#607483]">
            Trạng thái hoàn tất rà soát đối với 5 tiêu chí trong hồ sơ đã nộp của bạn
          </p>
        </div>
        <span className="text-[12px] font-semibold text-[#0D78AE] tabular-nums">
          5 tiêu chí Sinh viên 5 tốt
        </span>
      </div>

      <div className="divide-y divide-[#E6EFF5]">
        {activeResult.criterionOutcomes.map((crit) => {
          const isCriterionDone =
            crit.processStatusLabel === 'Đã hoàn tất xét' ||
            crit.processStatusLabel === 'Đã được xem xét';

          return (
            <div
              key={crit.criterionId}
              className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-[#F8FBFD] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-[7px] bg-[#EAF6FC] text-[#0D78AE] font-extrabold text-[12px] flex items-center justify-center shrink-0 tabular-nums">
                  {crit.criterionNumber}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-[#172A3A] truncate">
                    Tiêu chí {crit.criterionNumber}: {crit.criterionName}
                  </p>
                  <p className="text-[12px] text-[#607483] truncate">
                    {crit.summaryDetail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[12px] font-semibold ${
                    isCriterionDone
                      ? 'bg-[#EAFBF1] text-[#136F3A]'
                      : 'bg-[#EAF6FC] text-[#0D78AE]'
                  }`}
                >
                  {isCriterionDone ? (
                    <Check size={12} strokeWidth={2.5} />
                  ) : (
                    <Clock size={12} />
                  )}
                  {crit.processStatusLabel}
                </span>

                <button
                  type="button"
                  onClick={() => onOpenApplication(crit.criterionId)}
                  className="text-[12px] font-semibold text-[#0D78AE] hover:text-[#126A9C] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
