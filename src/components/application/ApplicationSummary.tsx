import React from 'react';
import { Info } from 'lucide-react';

export interface ApplicationSummaryProps {
  criterionCount?: number;
  declaredCount?: number;
  evidenceCount?: number;
  recommendationCount?: number;
  className?: string;
}

/**
 * Level-Headed Workspace Summary (Prompt Section 6 & 17)
 * Eliminates redundant "5 tiêu chí" and KPI-like cards.
 * Clean factual presentation:
 *   13 kê khai · 17 minh chứng      ⓘ 3 gợi ý cần xem
 */
export const ApplicationSummary: React.FC<ApplicationSummaryProps> = ({
  declaredCount = 10,
  evidenceCount = 18,
  recommendationCount = 2,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-3 text-[12.5px] bg-[#F4F9FD] border border-[#DCE7EE] rounded-[8px] px-3.5 py-1.5 select-none min-w-0 flex-wrap ${className}`}
    >
      {/* Primary informative text (not loud KPI blocks) */}
      <div className="flex items-center gap-1.5 text-[#466474] font-medium shrink-0">
        <span className="font-semibold text-[#172A3A]">{declaredCount}</span>
        <span>kê khai</span>
        <span className="text-[#B9CCD9]" aria-hidden="true">·</span>
        <span className="font-semibold text-[#172A3A]">{evidenceCount}</span>
        <span>minh chứng</span>
      </div>

      {/* Actionable recommendation signal (action-oriented, highest dynamic priority) */}
      {recommendationCount > 0 && (
        <div className="flex items-center gap-1.5 font-semibold text-[#B45309] bg-[#FEF6EB] px-2 py-0.5 rounded-[5px] border border-[#FADDB6] shrink-0">
          <Info size={13} strokeWidth={2.2} className="text-[#D97706] shrink-0" />
          <span>{recommendationCount} gợi ý cần xem</span>
        </div>
      )}
    </div>
  );
};
