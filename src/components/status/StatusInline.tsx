import React from 'react';
import { REQUIREMENT_STATUS_MAP, RequirementStatus } from '../../tokens';

export interface StatusInlineProps {
  status: RequirementStatus;
  customLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Status Inline Variant 1:
 * Minimal, clean text with dot indicator.
 * Used across the application table without noisy pill containers.
 */
export const StatusInline: React.FC<StatusInlineProps> = ({
  status,
  customLabel,
  size = 'md',
  className = '',
}) => {
  const config = REQUIREMENT_STATUS_MAP[status] || {
    label: status,
    dotColor: '#86868B',
    bgSoft: 'rgba(0,0,0,0.04)',
    textColor: '#6E6E73',
  };

  const label = customLabel || config.label;
  const dotSizeClass = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const textSizeClass = size === 'sm' ? 'text-[12px]' : 'text-[13px]';

  return (
    <div className={`inline-flex items-center gap-1.5 ${textSizeClass} font-medium whitespace-nowrap select-none ${className}`}>
      <span
        className={`rounded-full shrink-0 ${dotSizeClass}`}
        style={{ backgroundColor: config.dotColor }}
        aria-hidden="true"
      />
      <span style={{ color: config.textColor }}>{label}</span>
    </div>
  );
};
