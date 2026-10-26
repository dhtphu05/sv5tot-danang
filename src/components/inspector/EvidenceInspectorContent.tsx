import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Eye, Download, Info } from 'lucide-react';
import { EvidenceFileItem } from '../evidence/EvidenceFileChip';
import { Button } from '../buttons/Button';
import { StatusChip } from '../status/StatusChip';
import { StatusInline } from '../status/StatusInline';
import { FileTypeIcon } from '../evidence/FileTypeIcon';

export interface EvidenceInspectorContentProps {
  file: EvidenceFileItem;
  onConfirmVerification?: (fileId: string) => void;
  onClose?: () => void;
  readOnly?: boolean;
  supplementContext?: {
    criterionName: string;
    declarationTitle?: string;
  } | null;
}

export const EvidenceInspectorContent: React.FC<EvidenceInspectorContentProps> = ({
  file,
  onConfirmVerification,
  onClose,
  readOnly = false,
  supplementContext = null,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(
    file.status === 'ready' || file.status === 'has_evidence'
  );

  const handleConfirm = () => {
    setIsConfirmed(true);
    if (onConfirmVerification) {
      onConfirmVerification(file.id);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-[13.5px] leading-relaxed text-[#172A3A]">
      {/* Supplement Orientation Context (Prompt 10 Section 45) */}
      {supplementContext && (
        <div className="p-3 bg-[#FEF6EB] border border-[#FADDB6] rounded-[10px] flex flex-col gap-0.5 text-[12px] text-[#8C3A19]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B75B00]">
            Đang bổ sung cho:
          </span>
          <span className="font-bold text-[13px] text-[#8C3A19]">
            {supplementContext.criterionName}
            {supplementContext.declarationTitle ? ` · ${supplementContext.declarationTitle}` : ''}
          </span>
        </div>
      )}

      {/* File Card Overview */}
      <div className="p-4 bg-[#F8FBFD] rounded-[12px] border border-[#DCE7EE] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <FileTypeIcon fileName={file.name} fileType={file.fileType} size="lg" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-[#172A3A] text-[14px] truncate" title={file.name}>
              {file.name}
            </span>
            <div className="flex items-center gap-2 text-[12px] text-[#607483] mt-0.5">
              <span>{file.size || '1.8 MB'}</span>
              <span>·</span>
              <span>{file.uploadedAt || '12/10/2026'}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {file.status && (
            <StatusChip
              status={isConfirmed ? 'ready' : file.status}
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Advisory Recognition Box */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[12.5px] font-semibold text-[#607483]">
            {readOnly ? 'Thông tin được sử dụng trong hồ sơ' : 'Thông tin đọc từ tài liệu'}
          </h3>
          <span className="text-[11.5px] text-[#0D78AE] bg-[#EAF6FC] border border-[#D0E8F5] px-1.5 py-0.2 rounded-[4px] font-medium">
            {readOnly ? 'Đã ghi nhận' : 'Gợi ý tự động'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-[10px] border border-[#DCE7EE] space-y-3 shadow-2xs">
          <div>
            <div className="text-[11.5px] text-[#728391]">Tên thành tích / Nội dung</div>
            <div className="text-[13.5px] font-semibold text-[#172A3A] mt-0.5">
              {file.aiSuggestedInfo?.achievementName ||
                'Giải Nhì Hội nghị Sinh viên Nghiên cứu Khoa học cấp Trường 2026'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-[#E3EBF1]">
            <div>
              <div className="text-[11.5px] text-[#728391]">Ngày cấp</div>
              <div className="text-[13px] font-medium text-[#172A3A] mt-0.5">
                {file.aiSuggestedInfo?.date || '20/05/2026'}
              </div>
            </div>
            <div>
              <div className="text-[11.5px] text-[#728391]">Đơn vị ban hành</div>
              <div className="text-[13px] font-medium text-[#172A3A] mt-0.5">
                {file.aiSuggestedInfo?.issuingAuthority || 'Trường Đại học Bách khoa'}
              </div>
            </div>
          </div>
        </div>

        {/* Read-only or Confirm Action Box (Section 20) */}
        {readOnly ? (
          <div className="p-3 bg-[#F8FBFD] border border-[#DCE7EE] text-[#466474] rounded-[8px] flex items-start gap-2.5 text-[12.5px] leading-relaxed">
            <Info size={15} className="text-[#0D78AE] shrink-0 mt-0.5" />
            <span>
              Hồ sơ đã được gửi nên thông tin này hiện chỉ có thể xem.
            </span>
          </div>
        ) : !isConfirmed ? (
          <div className="flex flex-col gap-2 pt-1">
            <Button
              variant="primary"
              onClick={handleConfirm}
              iconLeading={<CheckCircle2 size={16} />}
              className="w-full h-10"
            >
              Xác nhận thông tin đúng
            </Button>
            <p className="text-[12px] text-[#607483] leading-snug">
              Kiểm tra các trường thông tin được trích xuất từ tài liệu. Bạn có thể sửa trực tiếp nếu thông tin chưa chính xác.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-[#EDF9F1] border border-[#C6EED5] text-[#1B7C49] rounded-[8px] flex items-center gap-2 text-[13px] font-medium">
            <CheckCircle2 size={16} className="text-[#1A934E] shrink-0" />
            <span>Bạn đã xác nhận thông tin từ tài liệu này.</span>
          </div>
        )}
      </div>

      {/* Official Reviewer Authority Footnote */}
      <div className="p-3 bg-[#F8FBFD] rounded-[8px] border border-[#DCE7EE] text-[12px] text-[#607483] flex items-start gap-2">
        <Info size={14} className="shrink-0 mt-0.5 text-[#0D78AE]" />
        <span>
          {readOnly ? (
            <>
              <strong className="text-[#172A3A]">Quy trình:</strong> Minh chứng này được chuyển đến Hội đồng xét chọn để tiến hành thẩm định chính thức.
            </>
          ) : (
            <>
              <strong className="text-[#172A3A]">Lưu ý:</strong> Việc xác nhận thông tin không đồng nghĩa minh chứng đã được duyệt.
              Cán bộ Hội Sinh viên sẽ thực hiện thẩm định sau khi hồ sơ được nộp chính thức.
            </>
          )}
        </span>
      </div>

      {/* Document Action Previews */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#E3EBF1]">
        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          iconLeading={<Eye size={14} />}
          onClick={() => {}}
        >
          Xem tài liệu gốc
        </Button>
        <Button
          size="sm"
          variant="quiet"
          className="flex-1 text-[#172A3A]"
          iconLeading={<Download size={14} />}
          onClick={() => {}}
        >
          Tải xuống
        </Button>
      </div>
    </div>
  );
};
