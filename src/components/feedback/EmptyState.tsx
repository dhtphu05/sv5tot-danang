import React from 'react';
import { FileText, FolderPlus } from 'lucide-react';
import { Button } from '../buttons/Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center select-none ${className}`}
    >
      <div className="w-11 h-11 rounded-full bg-black/[0.035] flex items-center justify-center text-[#86868B] mb-3 shrink-0">
        {icon || <FileText size={20} strokeWidth={1.8} />}
      </div>
      <h4 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">
        {title}
      </h4>
      {description && (
        <p className="text-[13px] text-[#6E6E73] max-w-sm mt-1 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button variant="secondary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
