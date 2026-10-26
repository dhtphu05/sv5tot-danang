import React from 'react';
import { Info, AlertCircle, AlertTriangle } from 'lucide-react';

export type RecommendationVariant = 'info' | 'recommendation' | 'hard_blocker';

export interface RecommendationBannerProps {
  variant?: RecommendationVariant;
  title?: string;
  message: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const RecommendationBanner: React.FC<RecommendationBannerProps> = ({
  variant = 'recommendation',
  title,
  message,
  action,
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-[#22A9E0]/8',
      text: 'text-[#16689E]',
      icon: <Info size={16} strokeWidth={2} className="text-[#22A9E0] shrink-0 mt-0.5" />,
      actionText: 'text-[#16689E] hover:text-[#0E4C75]',
    },
    recommendation: {
      bg: 'bg-[#D97706]/8',
      text: 'text-[#92400E]',
      icon: <AlertCircle size={16} strokeWidth={2} className="text-[#D97706] shrink-0 mt-0.5" />,
      actionText: 'text-[#B45309] hover:text-[#78350F]',
    },
    hard_blocker: {
      bg: 'bg-[#DC2626]/8',
      text: 'text-[#991B1B]',
      icon: <AlertTriangle size={16} strokeWidth={2} className="text-[#DC2626] shrink-0 mt-0.5" />,
      actionText: 'text-[#DC2626] hover:text-[#7F1D1D]',
    },
  }[variant];

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-[10px] text-[13px] leading-relaxed select-none ${styles.bg} ${styles.text} ${className}`}
    >
      {styles.icon}
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div>{message}</div>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={`shrink-0 font-medium text-[12.5px] underline underline-offset-2 cursor-pointer transition-colors ${styles.actionText}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
