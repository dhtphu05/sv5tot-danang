/**
 * 5TOT Đà Nẵng — School Forwarding Pre-Validation & Final Action Bar Widget (FSD Widgets Layer)
 * LEAN-4.2: Simplified validation bar without the 4 large green cards.
 * Displays a single concise contextual error message when invalid, and enables the button directly when valid.
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { Button } from '../../components/buttons/Button';

export interface PreValidationCheckItem {
  label: string;
  passed: boolean;
  message?: string;
}

export interface SchoolForwardingPreValidationBarProps {
  selectedCount: number;
  validationChecklist?: PreValidationCheckItem[];
  canForwardBatch: boolean;
  onOpenBatchConfirm: () => void;
  contextualError?: string | null;
  batchStatus?: 'DRAFT' | 'FORWARDED';
}

export const SchoolForwardingPreValidationBar: React.FC<
  SchoolForwardingPreValidationBarProps
> = ({
  selectedCount,
  validationChecklist = [],
  canForwardBatch,
  onOpenBatchConfirm,
  contextualError,
  batchStatus = 'DRAFT',
}) => {
  // If batch is already forwarded, show read-only locked notice
  if (batchStatus === 'FORWARDED') {
    return (
      <div className="bg-[#F8FAFC] rounded-[6px] border border-[#DFE5EC] p-4 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-2 text-[#475569] font-medium">
          <CheckCircle2 size={16} className="text-[#10A37F] shrink-0" />
          <span>Danh sách đề xuất của đơn vị đã được trình lên cấp Thành phố Đà Nẵng và đang ở trạng thái khóa lưu trữ.</span>
        </div>
        <div className="text-[12px] font-semibold text-[#64748B]">
          Đã trình: <strong className="font-extrabold text-[#0F172A]">{selectedCount}</strong> hồ sơ
        </div>
      </div>
    );
  }

  const firstFailingCheck = validationChecklist.find((c) => !c.passed);
  const resolvedError =
    contextualError ||
    firstFailingCheck?.message ||
    (selectedCount === 0
      ? 'Chưa chọn hồ sơ nào để trình lên cấp Thành phố Đà Nẵng.'
      : 'Vui lòng đính kèm tệp văn bản PDF đề nghị của đơn vị để tiếp tục.');

  return (
    <div className="bg-white rounded-[6px] border border-[#DFE5EC] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {canForwardBatch ? (
            <div className="flex items-center gap-2 text-[#047857] text-[13px] font-semibold">
              <CheckCircle2 size={17} className="text-[#10A37F] shrink-0" />
              <span>
                Sẵn sàng trình danh sách lên Hội Sinh viên Thành phố Đà Nẵng (<strong className="font-bold">{selectedCount}</strong> hồ sơ đã chọn, đã kèm tệp PDF văn bản đề nghị).
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#DC2626] text-[13px] font-medium">
              <AlertCircle size={17} className="text-[#DC2626] shrink-0" />
              <span>{resolvedError}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[12px] font-semibold text-[#475569]">
            Đã chọn: <strong className="font-extrabold text-[#007EE5]">{selectedCount}</strong> hồ sơ
          </span>

          <Button
            variant="primary"
            size="md"
            disabled={!canForwardBatch}
            iconLeading={<Send size={15} />}
            onClick={onOpenBatchConfirm}
          >
            Trình danh sách lên Thành phố
          </Button>
        </div>
      </div>
    </div>
  );
};
