/**
 * 5TOT Đại học Đà Nẵng — Submit White Bird Award Application Confirmation Modal
 * Căn cứ Quy chế Giải thưởng "Cánh chim trắng" ban hành kèm theo Quyết định số 14-QĐ/ĐHĐN-HSV ngày 04/10/2022
 * của Ban Thư ký Hội Sinh viên Việt Nam Đại học Đà Nẵng.
 *
 * Modal xác nhận nộp hồ sơ dùng chung cho cả 3 hạng mục:
 * - Hạng mục “Cánh chim ươm mầm” (WB01, WB02 bắt buộc; WB03 tùy chọn)
 * - Hạng mục “Cánh chim truyền lửa” (WB01, WB02, WB03 bắt buộc; chỉ cá nhân)
 * - Hạng mục “Cánh chim sáng tạo” (WB01, WB02, WB03 bắt buộc; cá nhân hoặc tập thể)
 */

import React, { useEffect, useRef } from 'react';
import {
  Send,
  X,
  FileCheck2,
  AlertCircle,
  FolderOpen,
  Calendar,
  Building2,
  Users,
  User,
  Loader2,
  Feather,
} from 'lucide-react';
import { Button } from '../buttons/Button';
import {
  WhiteBirdApplication,
  WhiteBirdCategoryMeta,
} from './whiteBirdTypes';
import { WhiteBirdReadinessResult } from './whiteBirdStore';

export interface SubmitWhiteBirdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isSubmitting?: boolean;
  application: WhiteBirdApplication;
  readiness: WhiteBirdReadinessResult;
  categoryMeta: WhiteBirdCategoryMeta;
  allEvidenceFilesCount: number;
}

export const SubmitWhiteBirdModal: React.FC<SubmitWhiteBirdModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  application,
  readiness,
  categoryMeta,
  allEvidenceFilesCount,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key (if not currently submitting)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Focus trap / auto-focus
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isResubmitting = application.status === 'supplement_requested';
  const isIndividual = application.nomineeType === 'INDIVIDUAL';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-[2px] p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-white-bird-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-[16px] border border-[#DCE7EE] shadow-2xl w-full max-w-[560px] max-h-[92dvh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 outline-none"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2EEF6] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#EBF6FC] text-[#0D78AE] flex items-center justify-center shrink-0">
              <Send size={18} />
            </div>
            <div>
              <h2
                id="submit-white-bird-modal-title"
                className="text-[16px] font-bold text-[#172A3A]"
              >
                Xác nhận nộp hồ sơ Giải thưởng
              </h2>
              <p className="text-[11px] text-[#607483] mt-0.5">
                Cơ quan tiếp nhận: Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors disabled:opacity-50"
            aria-label="Đóng hộp thoại"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Main Description */}
          <p className="text-[13px] text-[#334155] leading-relaxed">
            Bạn vui lòng kiểm tra thông tin trước khi gửi hồ sơ đề nghị xét trao Giải thưởng ‘Cánh chim trắng’ đến Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng.
          </p>

          {/* Dossier Summary Card */}
          <div className="rounded-[12px] bg-[#F8FBFD] border border-[#DCE7EE] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#EDF3F8] pb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D78AE] flex items-center gap-1.5">
                <Feather size={13} />
                Tóm tắt hồ sơ đề nghị xét trao
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EBF6FC] text-[#0D78AE] border border-[#CDE5F5]">
                {categoryMeta.shortName}
              </span>
            </div>

            <div className="space-y-2.5 text-[12.5px]">
              {/* Nomination title */}
              <div>
                <span className="text-[#64748B] block text-[11px] font-medium">Tên hồ sơ đề cử:</span>
                <span className="font-bold text-[#172A3A] leading-snug break-words">
                  {application.nominationTitle}
                </span>
              </div>

              {/* Nominee & Object */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-[#EDF3F8]/70">
                <div>
                  <span className="text-[#64748B] block text-[11px] font-medium">Đối tượng xét trao:</span>
                  <span className="font-semibold text-[#172A3A] flex items-center gap-1.5 mt-0.5">
                    {isIndividual ? (
                      <>
                        <User size={13} className="text-[#0D78AE]" />
                        Cá nhân
                      </>
                    ) : (
                      <>
                        <Users size={13} className="text-[#0D78AE]" />
                        Tập thể
                      </>
                    )}
                    <span className="text-[#64748B] font-normal truncate">({application.nomineeName})</span>
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px] font-medium">Năm học / Mùa xét:</span>
                  <span className="font-semibold text-[#172A3A] flex items-center gap-1.5 mt-0.5">
                    <Calendar size={13} className="text-[#0D78AE]" />
                    {application.academicYear || '2025–2026'}
                  </span>
                </div>
              </div>

              {/* Institution / Unit */}
              <div className="pt-1 border-t border-[#EDF3F8]/70">
                <span className="text-[#64748B] block text-[11px] font-medium">Đơn vị:</span>
                <span className="font-semibold text-[#172A3A] flex items-center gap-1.5 mt-0.5">
                  <Building2 size={13} className="text-[#0D78AE] shrink-0" />
                  <span className="break-words">
                    {application.institutionName}
                    {application.facultyName ? ` — ${application.facultyName}` : ''}
                  </span>
                </span>
              </div>

              {/* Readiness Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EDF3F8]">
                <div className="p-2.5 rounded-[8px] bg-white border border-[#DCE7EE]">
                  <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <FileCheck2 size={13} className="text-emerald-600" />
                    Thành phần bắt buộc:
                  </div>
                  <div className="text-[14px] font-bold text-emerald-700 mt-0.5">
                    {readiness.readyCount}/{readiness.totalRequired} hoàn thiện
                  </div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-white border border-[#DCE7EE]">
                  <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <FolderOpen size={13} className="text-[#0D78AE]" />
                    Minh chứng đính kèm:
                  </div>
                  <div className="text-[14px] font-bold text-[#0D78AE] mt-0.5">
                    {allEvidenceFilesCount} tệp đính kèm
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Notice Box */}
          <div className="rounded-[10px] bg-[#F1F8FD] border border-[#CDE5F5] p-3 text-[12px] text-[#1E3A5F] flex items-start gap-2.5 leading-relaxed">
            <AlertCircle size={16} className="text-[#0D78AE] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[#0D5C8C] mb-0.5">Lưu ý trước khi nộp:</span>
              Sau khi nộp, hồ sơ sẽ được chuyển đến cơ quan tiếp nhận để xem xét. Vui lòng kiểm tra thông tin và minh chứng trước khi xác nhận.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#E2EEF6] bg-[#F8FAFC] flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 text-[13px]"
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={isSubmitting || !readiness.canSubmit}
            onClick={onConfirm}
            className="px-5 py-2 text-[13px] font-bold"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="mr-2 animate-spin" />
                Đang gửi hồ sơ...
              </>
            ) : (
              <>
                <Send size={15} className="mr-1.5" />
                {isResubmitting ? 'Xác nhận gửi lại hồ sơ' : 'Xác nhận nộp hồ sơ'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
