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
          bg: 'bg-[#ECFDF5]',
          text: 'text-[#047857]',
          border: 'border-[#A7F3D0]',
          dot: 'bg-[#10A37F]',
        };
      case 'declared':
        return {
          bg: 'bg-[#EFF6FF]',
          text: 'text-[#0066CC]',
          border: 'border-[#BFDBFE]',
          dot: 'bg-[#007EE5]',
        };
      case 'needs_verification':
      case 'requires_supplement':
        return {
          bg: 'bg-[#FFFBEB]',
          text: 'text-[#B45309]',
          border: 'border-[#FDE68A]',
          dot: 'bg-[#D97706]',
        };
      case 'reading_document':
      case 'reviewing':
        return {
          bg: 'bg-[#EFF6FF]',
          text: 'text-[#0066CC]',
          border: 'border-[#BFDBFE]',
          dot: 'bg-[#007EE5]',
        };
      case 'read_failed':
        return {
          bg: 'bg-[#FEF2F2]',
          text: 'text-[#991B1B]',
          border: 'border-[#FECACA]',
          dot: 'bg-[#DC2626]',
        };
      case 'undeclared':
      case 'can_supplement':
      case 'awaiting_officer':
      default:
        return {
          bg: 'bg-[#F8FAFC]',
          text: 'text-[#475569]',
          border: 'border-[#E2E8F0]',
          dot: 'bg-[#94A3B8]',
        };
    }
  };

  const config = REQUIREMENT_STATUS_MAP[status] || {
    label: status,
    dotColor: '#64748B',
    bgSoft: 'rgba(0,0,0,0.04)',
    textColor: '#475569',
  };

  const style = getStatusStyles(status);
  const rawLabel = customLabel || config.label;
  const label = shortenStatusLabel(rawLabel);

  return (
    <span
      className={`inline-flex items-center gap-1.5 h-[25px] px-2 rounded-[4px] text-[11.5px] font-semibold whitespace-nowrap select-none border transition-colors ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
};
