import React from 'react';
import {
  XCircle,
  Flag,
  CheckCircle2,
  MessageSquareWarning,
  Eye,
  Info,
  PlayCircle,
  Lock,
} from 'lucide-react';
import { SelectedReviewScope, StaffItemReviewStatus } from '../../../reviewTypes';

interface InspectorJudgmentSectionProps {
  canMutate: boolean;
  statusMeta: {
    label: string;
    bgColor: string;
    textColor: string;
  };
  isUnsuitableFormOpen: boolean;
  setIsUnsuitableFormOpen: (val: boolean) => void;
  unsuitableInput: string;
  setUnsuitableInput: (val: string) => void;
  unsuitableError: string | null;
  setUnsuitableError: (val: string | null) => void;
  handleUnsuitableSubmit: (e: React.FormEvent) => void;
  isConsiderationFormOpen?: boolean;
  setIsConsiderationFormOpen?: (val: boolean) => void;
  considerationInput?: string;
  setConsiderationInput?: (val: string) => void;
  considerationError?: string | null;
  setConsiderationError?: (val: string | null) => void;
  handleConsiderationSubmit?: (e: React.FormEvent) => void;
  onUpdateStatus: (scope: SelectedReviewScope, status: StaffItemReviewStatus) => void;
  selectedScope: SelectedReviewScope;
  currentScopeStatus: StaffItemReviewStatus;
  supplementEligibility: { allowed: boolean };
  activeSupplement: unknown;
  onOpenSupplementModal: (scope: SelectedReviewScope) => void;
  hasStartedReview: boolean;
  onStartReview?: () => void;
  disabledReason?: string;
}

export const InspectorJudgmentSection: React.FC<InspectorJudgmentSectionProps> = ({
  canMutate,
  statusMeta,
  isUnsuitableFormOpen,
  setIsUnsuitableFormOpen,
  unsuitableInput,
  setUnsuitableInput,
  unsuitableError,
  setUnsuitableError,
  handleUnsuitableSubmit,
  isConsiderationFormOpen,
  setIsConsiderationFormOpen,
  considerationInput,
  setConsiderationInput,
  considerationError,
  setConsiderationError,
  handleConsiderationSubmit,
  onUpdateStatus,
  selectedScope,
  currentScopeStatus,
  supplementEligibility,
  activeSupplement,
  onOpenSupplementModal,
  hasStartedReview,
  onStartReview,
  disabledReason,
}) => {
  if (!canMutate) {
    return (
      <div className="p-3.5 bg-[#F8FBFD] border-t border-[#F0F4F8] space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#0F2335] uppercase tracking-wider">
            E. Kết luận xét kê khai
          </span>
          <span
            className="text-[10.5px] font-bold px-2 py-0.5 rounded"
            style={{
              backgroundColor: statusMeta.bgColor,
              color: statusMeta.textColor,
            }}
          >
            {statusMeta.label}
          </span>
        </div>

        {!hasStartedReview && onStartReview ? (
          <div className="p-3 rounded-[10px] bg-[#EAF5FC] border border-[#CDE5F6] space-y-2 text-[12px]">
            <div className="flex items-start gap-2 text-[#0B64A0]">
              <Info size={15} className="text-[#1680DE] shrink-0 mt-0.5" />
              <span>Hãy bắt đầu xét hồ sơ trước để ghi nhận kết luận xét duyệt kê khai.</span>
            </div>
            <button
              type="button"
              onClick={onStartReview}
              className="w-full h-[36px] rounded-[8px] bg-[#1680DE] hover:bg-[#1371C4] active:bg-[#0F5EA5] text-white font-bold text-[12px] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-0 shadow-xs"
            >
              <PlayCircle size={14} />
              <span>Bắt đầu xét hồ sơ</span>
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-[10px] bg-[#F4F7FA] border border-[#E2E8F0] text-[12px] text-[#607483] flex items-center gap-2">
            <Lock size={14} className="shrink-0 text-[#8394A3]" />
            <span>
              {disabledReason ||
                'Hồ sơ này không còn được phân công cho bạn hoặc đang ở chế độ chỉ đọc.'}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-[#F8FBFD] border-t border-[#F0F4F8] space-y-2 shrink-0">
      {/* Section Header with Current Judgment Summary */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#0F2335] uppercase tracking-wider">
          E. Kết luận xét kê khai
        </span>
        <span
          className="text-[10.5px] font-bold px-2 py-0.5 rounded"
          style={{
            backgroundColor: statusMeta.bgColor,
            color: statusMeta.textColor,
          }}
        >
          {statusMeta.label}
        </span>
      </div>

      {/* INLINE FORM: KHÔNG PHÙ HỢP (Prompt 22.3 Section 4) */}
      {isUnsuitableFormOpen && (
        <form
          onSubmit={handleUnsuitableSubmit}
          className="p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] space-y-2"
        >
          <div className="flex items-center justify-between">
            <label
              htmlFor="unsuitable-reason-input"
              className="text-[11.5px] font-bold text-[#DC2626] flex items-center gap-1"
            >
              <XCircle size={13} />
              <span>Lý do không phù hợp (Nội bộ):</span>
            </label>
            <button
              type="button"
              onClick={() => setIsUnsuitableFormOpen(false)}
              className="text-[11px] text-[#8295A5] hover:text-[#172A3A]"
            >
              Đóng
            </button>
          </div>
          <textarea
            id="unsuitable-reason-input"
            rows={2}
            value={unsuitableInput}
            onChange={(e) => {
              setUnsuitableInput(e.target.value);
              if (unsuitableError) setUnsuitableError(null);
            }}
            placeholder="Nhập lý do nội bộ (ví dụ: thành tích ngoài thời gian năm học xét chọn)..."
            className="w-full p-2 text-[12px] bg-white border border-[#FCA5A5] rounded-[6px] text-[#172A3A] outline-none"
          />
          {unsuitableError && (
            <p className="text-[11px] font-semibold text-[#DC2626]">
              {unsuitableError}
            </p>
          )}
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsUnsuitableFormOpen(false)}
              className="px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold text-[#526B7C] hover:bg-white cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded-[6px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11.5px] font-bold cursor-pointer border-0"
            >
              Lưu kết luận Không phù hợp
            </button>
          </div>
        </form>
      )}

      {/* INLINE FORM: CẦN XEM XÉT THÊM (Sections 54–57) */}
      {isConsiderationFormOpen && (
        <form
          onSubmit={(e) => {
            if (handleConsiderationSubmit) {
              handleConsiderationSubmit(e);
            } else {
              e.preventDefault();
            }
          }}
          className="p-3 rounded-[10px] bg-[#F5F3FF] border border-[#DDD6FE] space-y-2"
        >
          <div className="flex items-center justify-between">
            <label
              htmlFor="consideration-reason-input"
              className="text-[11.5px] font-bold text-[#5B21B6] flex items-center gap-1"
            >
              <Flag size={13} />
              <span>Lý do cần xem xét thêm (Nội bộ):</span>
            </label>
            <button
              type="button"
              onClick={() => setIsConsiderationFormOpen?.(false)}
              className="text-[11px] text-[#8295A5] hover:text-[#172A3A]"
            >
              Đóng
            </button>
          </div>
          <textarea
            id="consideration-reason-input"
            rows={2}
            value={considerationInput || ''}
            onChange={(e) => {
              setConsiderationInput?.(e.target.value);
              if (considerationError) setConsiderationError?.(null);
            }}
            placeholder="Ví dụ: Minh chứng có thông tin chưa thống nhất với phần kê khai."
            className="w-full p-2 text-[12px] bg-white border border-[#C4B5FD] rounded-[6px] text-[#172A3A] outline-none"
          />
          {considerationError && (
            <p className="text-[11px] font-semibold text-[#DC2626]">
              {considerationError}
            </p>
          )}
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsConsiderationFormOpen?.(false)}
              className="px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold text-[#526B7C] hover:bg-white cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 rounded-[6px] bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-[11.5px] font-bold cursor-pointer border-0"
            >
              Lưu & Đánh dấu Cần xem xét thêm
            </button>
          </div>
        </form>
      )}

      {/* CLEAN ACTION HIERARCHY (Prompt 22.3 Section 4) */}
      {!isUnsuitableFormOpen && !isConsiderationFormOpen && (
        <div className="space-y-2">
          {/* Primary: Xác nhận phù hợp */}
          <button
            type="button"
            onClick={() => onUpdateStatus(selectedScope, 'suitable')}
            className={`w-full h-[40px] px-4 rounded-[12px] font-bold text-[13px] inline-flex items-center justify-center gap-2 transition-all cursor-pointer border-0 shadow-2xs ${
              currentScopeStatus === 'suitable'
                ? 'bg-[#EAFBF1] text-[#136F3A] ring-2 ring-[#B6E6C9]'
                : 'bg-[#1680DE] hover:bg-[#1371C4] text-white'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>
              {currentScopeStatus === 'suitable'
                ? 'Đã xác nhận phù hợp'
                : 'Xác nhận phù hợp'}
            </span>
          </button>

          {/* Secondary: Yêu cầu bổ sung */}
          <button
            type="button"
            disabled={!supplementEligibility.allowed && !activeSupplement}
            onClick={() => onOpenSupplementModal(selectedScope)}
            className="w-full h-[36px] px-3 rounded-[10px] bg-[#FEF6EB] hover:bg-[#FDE9CE] text-[#B45309] font-bold text-[12px] border border-[#FADDB6] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <MessageSquareWarning size={14} />
            <span>Yêu cầu bổ sung</span>
          </button>

          {/* Secondary Action: Không đạt yêu cầu */}
          <button
            type="button"
            onClick={() => setIsUnsuitableFormOpen(true)}
            className={`w-full h-[36px] px-3 rounded-[10px] text-[12px] font-semibold border inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              currentScopeStatus === 'unsuitable'
                ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] font-bold'
                : 'bg-white hover:bg-[#FEF2F2] text-[#B91C1C] border-[#FCDEDE]'
            }`}
          >
            <XCircle size={14} />
            <span>
              {currentScopeStatus === 'unsuitable'
                ? 'Đã ghi nhận Không đạt'
                : 'Không đạt yêu cầu'}
            </span>
          </button>

          {/* Auxiliary actions: Đã xem & Hoàn tất xét */}
          <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-[#607483]">
            {currentScopeStatus !== 'viewed' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(selectedScope, 'viewed')}
                className="hover:text-[#172A3A] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <Eye size={12} />
                <span>Đã xem</span>
              </button>
            )}
            {currentScopeStatus !== 'review_completed' && (
              <button
                type="button"
                onClick={() =>
                  onUpdateStatus(selectedScope, 'review_completed')
                }
                className="hover:text-[#136F3A] hover:underline cursor-pointer ml-auto"
              >
                Hoàn tất xét
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
