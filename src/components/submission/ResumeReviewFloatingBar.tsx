import React from 'react';
import { ArrowRight, FileCheck, X } from 'lucide-react';
import { Button } from '../buttons/Button';

export interface ResumeReviewFloatingBarProps {
  isVisible: boolean;
  onResume: () => void;
  onDismiss: () => void;
  advisoryCount?: number;
}

export const ResumeReviewFloatingBar: React.FC<ResumeReviewFloatingBarProps> = ({
  isVisible,
  onResume,
  onDismiss,
  advisoryCount = 0,
}) => {
  if (!isVisible) return null;

  return (
    <aside
      aria-label="Thanh tiếp tục rà soát hồ sơ"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[92%] sm:w-auto bg-[#172A3A] text-white rounded-[14px] px-4 py-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.22)] border border-[#2B4356] flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200 select-none"
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-1">
        <div className="w-7 h-7 rounded-[8px] bg-[#18A6E0]/20 text-[#18A6E0] flex items-center justify-center shrink-0">
          <FileCheck size={16} strokeWidth={2.2} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-semibold text-white truncate">
            Đang tạm dừng rà soát hồ sơ
          </span>
          <span className="text-[11.5px] text-[#A2B7C8] truncate">
            {advisoryCount > 0
              ? `Còn ${advisoryCount} gợi ý rà soát trước khi gửi`
              : 'Hồ sơ đã sẵn sàng để gửi'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="primary"
          size="sm"
          onClick={onResume}
          iconTrailing={<ArrowRight size={13} />}
          className="bg-[#18A6E0] hover:bg-[#1390C5] text-white text-[12px] font-semibold h-8 px-3"
        >
          Quay lại kiểm tra hồ sơ
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-[6px] text-[#A2B7C8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Đóng thông báo này"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
};
