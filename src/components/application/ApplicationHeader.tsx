import React from 'react';
import { Send, CheckCircle2, ArrowDownCircle } from 'lucide-react';
import { Button } from '../buttons/Button';
import { StudentApplicationData } from '../../demo/fixtures/studentApplication';
import { ApplicationSubmissionState } from '../submission/submissionTypes';

export interface ApplicationHeaderProps {
  application: StudentApplicationData;
  isCompact?: boolean;
  submissionState?: ApplicationSubmissionState;
  onSubmitClick?: () => void;
  onViewSupplement?: () => void;
  onViewResult?: () => void;
  className?: string;
}

export const ApplicationHeader: React.FC<ApplicationHeaderProps> = ({
  application,
  isCompact = false,
  submissionState = 'draft',
  onSubmitClick,
  onViewSupplement,
  onViewResult,
  className = '',
}) => {
  const { student, season, eligibilityStatus } = application;
  const isPostSubmit = submissionState !== 'draft';
  const isSupplementRequired = submissionState === 'supplement_required';
  const isSupplementSent = submissionState === 'supplement_sent';
  const isResultPublished = submissionState === 'result_published';

  const getStatusBadgeConfig = () => {
    switch (submissionState) {
      case 'submitted':
        return {
          label: 'Đã gửi hồ sơ',
          style: 'text-[#047857] bg-[#ECFDF5] border-[#A7F3D0]',
        };
      case 'under_review':
        return {
          label: 'Đang xét hồ sơ',
          style: 'text-[#0066CC] bg-[#EFF6FF] border-[#BFDBFE]',
        };
      case 'supplement_required':
        return {
          label: 'Cần bổ sung',
          style: 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]',
        };
      case 'supplement_sent':
        return {
          label: 'Đã gửi bổ sung',
          style: 'text-[#0066CC] bg-[#EFF6FF] border-[#BFDBFE]',
        };
      case 'all_reviewed':
        return {
          label: 'Đã hoàn tất xét 5 tiêu chí',
          style: 'text-[#047857] bg-[#ECFDF5] border-[#A7F3D0]',
        };
      case 'result_published':
        return {
          label: 'Đã có kết quả chính thức',
          style: 'text-[#047857] bg-[#ECFDF5] border-[#A7F3D0]',
        };
      case 'draft':
      default:
        return {
          label: 'Đang hoàn thiện',
          style: 'text-[#475569] bg-[#F8FAFC] border-[#CBD5E1]',
        };
    }
  };

  const badgeConfig = getStatusBadgeConfig();

  return (
    <header
      className={`sticky top-[50px] z-20 bg-white border-b border-[#DFE5EC] transition-all duration-150 select-none ${
        isCompact ? 'py-2 px-5 lg:px-7' : 'py-3 px-5 lg:px-7'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Compact Administrative Dossier Title & Status */}
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          <h1 className="text-[15px] sm:text-[16px] font-bold text-[#0F172A] tracking-tight">
            Bảng kê khai tiêu chuẩn “Sinh viên 5 tốt” cấp Thành phố Đà Nẵng ({season})
          </h1>
          <span
            className={`text-[11.5px] font-semibold px-2 py-0.5 rounded-[4px] shrink-0 border ${badgeConfig.style}`}
          >
            {badgeConfig.label}
          </span>
          {!isCompact && !isSupplementRequired && !isSupplementSent && eligibilityStatus && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[11.5px] font-medium text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-[4px] shrink-0">
              <CheckCircle2 size={12} strokeWidth={2.2} />
              <span>{eligibilityStatus}</span>
            </span>
          )}
          {isCompact && (
            <span className="hidden sm:inline text-[12px] text-[#64748B] truncate">
              · {student.fullName} ({student.studentId})
            </span>
          )}
        </div>

        {/* Right: Primary Submission / Supplement Action */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {isResultPublished ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewResult}
              className="border-[#A7F3D0] bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#047857]"
            >
              Xem kết quả
            </Button>
          ) : isSupplementRequired ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewSupplement}
              iconLeading={<ArrowDownCircle size={14} className="text-[#B45309]" />}
              className="border-[#FDE68A] bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#92400E]"
            >
              Xem yêu cầu bổ sung
            </Button>
          ) : !isPostSubmit ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onSubmitClick}
              iconLeading={<Send size={13.5} />}
              className="bg-[#10A37F] hover:bg-[#0D8C6D] text-white"
            >
              Kiểm tra & gửi hồ sơ
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
