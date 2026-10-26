import React from 'react';
import { REQUIREMENT_STATUS_MAP, RequirementStatus } from '../../tokens';

export interface StatusChipProps {
  status: RequirementStatus;
  customLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Helper to shorten verbose labels for table cell density (Prompt Section 9 & 18)
 * At narrow or standard desktop widths, ensures status chips never wrap to 2 lines.
 */
export const shortenStatusLabel = (label: string): string => {
  if (!label) return '';
  if (label === 'Cần bạn kiểm tra') return 'Cần kiểm tra';
  if (label === 'Có thể kiểm tra thêm') return 'Có thể bổ sung';
  if (label === 'Đang đọc tài liệu') return 'Đang đọc';
  if (label === 'Không thể đọc tài liệu') return 'Không thể đọc';
  return label;
};

/**
 * Status Chip:
 * Compact rounded status token (Prompt Section 9 & 18):
 * - Height: 28–30px (h-[28px])
 * - Radius: 8px (rounded-[8px])
 * - Text: 12px (text-[12px] font-semibold)
 * - Single-line guaranteed: whitespace-nowrap
 * - Strict color discipline:
 *   - Green: confirmed operational state (ready, has_evidence, review_completed)
 *   - Amber: requires attention (needs_verification, requires_supplement)
 *   - Blue: informational / current (declared, reading_document, reviewing)
 *   - Neutral: optional / waiting (can_supplement, awaiting_officer)
 *   - Red: actual failure only (read_failed)
 */
export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  customLabel,
  size = 'md',
  className = '',
}) => {
  const getStatusStyles = (st: RequirementStatus) => {
    switch (st) {
      case 'has_evidence':
      case 'ready':
      case 'review_completed':
        return {
          bg: 'bg-[#EDF9F1]',
          text: 'text-[#1B7C49]',
          border: 'border-[#C6EED5]',
          dot: 'bg-[#1A934E]',
        };
      case 'declared':
        return {
          bg: 'bg-[#EDF9F1]',
          text: 'text-[#1B7C49]',
          border: 'border-[#C6EED5]',
          dot: 'bg-[#1A934E]',
        };
      case 'needs_verification':
      case 'requires_supplement':
        return {
          bg: 'bg-[#FEF6EB]',
          text: 'text-[#B75B00]',
          border: 'border-[#FADDB6]',
          dot: 'bg-[#E99A18]',
        };
      case 'reading_document':
      case 'reviewing':
        return {
          bg: 'bg-[#EBF5FA]',
          text: 'text-[#0D78AE]',
          border: 'border-[#D0E8F5]',
          dot: 'bg-[#18A6E0]',
        };
      case 'read_failed':
        return {
          bg: 'bg-[#FEF2F2]',
          text: 'text-[#991B1B]',
          border: 'border-[#FCA5A5]',
          dot: 'bg-[#DC2626]',
        };
      case 'undeclared':
      case 'can_supplement':
      case 'awaiting_officer':
      default:
        return {
          bg: 'bg-[#F1F5F8]',
          text: 'text-[#4F6777]',
          border: 'border-[#DDE6ED]',
          dot: 'bg-[#728391]',
        };
    }
  };

  const config = REQUIREMENT_STATUS_MAP[status] || {
    label: status,
    dotColor: '#728391',
    bgSoft: 'rgba(0,0,0,0.04)',
    textColor: '#4F6777',
  };

  const style = getStatusStyles(status);
  const rawLabel = customLabel || config.label;
  const label = shortenStatusLabel(rawLabel);

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-[28px] px-2.5 rounded-[8px] text-[12px] font-semibold whitespace-nowrap select-none border transition-colors ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
};
