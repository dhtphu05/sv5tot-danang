import React from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { CriterionDefinition } from '../../tokens';
import { Button } from '../buttons/Button';

export interface CriterionHeaderProps {
  criterion: CriterionDefinition;
  isExpanded: boolean;
  onToggleExpand: () => void;
  metadataSummary: string; // e.g. "2 nội dung · 4 minh chứng"
  statusLabel?: string;
  onOpenRegulation?: (criterion: CriterionDefinition) => void;
  className?: string;
}

export const CriterionHeader: React.FC<CriterionHeaderProps> = ({
  criterion,
  isExpanded,
  onToggleExpand,
  metadataSummary,
  statusLabel = 'Đã khai báo',
  onOpenRegulation,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-between px-6 py-4 transition-colors cursor-pointer select-none bg-[#FAFAFB] hover:bg-[#F2F3F5] ${className}`}
      onClick={onToggleExpand}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          aria-label={isExpanded ? 'Thu gọn tiêu chí' : 'Mở rộng tiêu chí'}
          className="text-[#6E6E73] hover:text-[#1D1D1F] transition-transform duration-200"
          style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          <ChevronDown size={18} strokeWidth={2.2} />
        </button>

        {/* Subtle accent icon badge */}
        <div
          className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[12px] font-bold shrink-0"
          style={{
            backgroundColor: criterion.accentSoft,
            color: criterion.accentColor,
          }}
        >
          {criterion.number}
        </div>

        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">
            {criterion.name}
          </span>
          <span className="text-[13px] text-[#86868B] hidden sm:inline-block">
            {metadataSummary}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-[12.5px] font-medium text-[#16689E] bg-[#22A9E0]/10 px-2.5 py-1 rounded-[6px]">
          {statusLabel}
        </span>

        {onOpenRegulation && (
          <Button
            size="sm"
            variant="quiet"
            onClick={() => onOpenRegulation(criterion)}
            iconLeading={<BookOpen size={14} />}
            className="text-[12.5px] text-[#6E6E73] hover:text-[#22A9E0]"
          >
            Xem quy định
          </Button>
        )}
      </div>
    </div>
  );
};
