import { Send } from 'lucide-react';
import { Button } from '../buttons/Button';
import { MOCK_STUDENT } from '../../tokens';

export interface StickyAppHeaderProps {
  isCompact?: boolean;
  statusLabel?: string;
  onSubmitClick?: () => void;
  className?: string;
}

export const StickyAppHeader: React.FC<StickyAppHeaderProps> = ({
  isCompact = false,
  statusLabel = 'Đang hoàn thiện',
  onSubmitClick,
  className = '',
}) => {
  return (
    <header
      className={`sticky top-0 z-30 bg-white/95 backdrop-blur-[8px] border-b border-black/[0.06] transition-all duration-200 ease-out select-none ${
        isCompact ? 'py-2.5 px-6' : 'py-5 px-8'
      } ${className}`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Side: Title & Student Context */}
        <div className="flex flex-col min-w-0 pr-4">
          {isCompact ? (
            /* Compact Bar State */
            <div className="flex items-center gap-3">
              <span className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight truncate">
                {MOCK_STUDENT.fullName}
              </span>
              <span className="text-[12.5px] text-[#86868B] hidden sm:inline">·</span>
              <span className="text-[12.5px] text-[#6E6E73] hidden sm:inline truncate">
                Hồ sơ SV5T {MOCK_STUDENT.schoolYear}
              </span>
              <span className="text-[11.5px] font-medium text-[#16689E] bg-[#22A9E0]/10 px-2 py-0.5 rounded-[4px]">
                {statusLabel}
              </span>
            </div>
          ) : (
            /* Expanded Header State */
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[26px] font-bold text-[#1D1D1F] tracking-tight">
                  Hồ sơ Sinh viên 5 tốt
                </h1>
                <span className="text-[12.5px] font-semibold text-[#16689E] bg-[#22A9E0]/10 px-2.5 py-1 rounded-[6px]">
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#6E6E73] mt-1 flex-wrap">
                <span className="font-medium text-[#1D1D1F]">{MOCK_STUDENT.fullName}</span>
                <span>·</span>
                <span>MSSV: {MOCK_STUDENT.studentId}</span>
                <span>·</span>
                <span>{MOCK_STUDENT.university}</span>
                <span>·</span>
                <span className="text-[#86868B]">{MOCK_STUDENT.schoolYear}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size={isCompact ? 'sm' : 'md'}
            onClick={onSubmitClick}
            iconLeading={<Send size={isCompact ? 13 : 15} />}
          >
            {isCompact ? 'Kiểm tra & gửi' : 'Kiểm tra & gửi hồ sơ'}
          </Button>
        </div>
      </div>
    </header>
  );
};
