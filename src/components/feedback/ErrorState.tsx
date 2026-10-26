import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../buttons/Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Chưa thể tải dữ liệu',
  description = 'Vui lòng kiểm tra kết nối mạng và thử lại.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center select-none ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-red-500/[0.08] flex items-center justify-center text-[#DC2626] mb-3 shrink-0">
        <AlertCircle size={20} strokeWidth={1.8} />
      </div>
      <h4 className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">
        {title}
      </h4>
      <p className="text-[13px] text-[#6E6E73] max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          iconLeading={<RotateCcw size={13} />}
        >
          Thử lại
        </Button>
      )}
    </div>
  );
};
