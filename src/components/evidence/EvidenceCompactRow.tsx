import React from 'react';
import { FileText, Eye, CheckCircle2, Trash2, ArrowUpRight } from 'lucide-react';
import { EvidenceFileItem } from './EvidenceFileChip';
import { StatusInline } from '../status/StatusInline';
import { Button } from '../buttons/Button';

export interface EvidenceCompactRowProps {
  file: EvidenceFileItem;
  onVerify?: (file: EvidenceFileItem) => void;
  onView?: (file: EvidenceFileItem) => void;
  onDelete?: (file: EvidenceFileItem) => void;
  readOnly?: boolean;
}

export const EvidenceCompactRow: React.FC<EvidenceCompactRowProps> = ({
  file,
  onVerify,
  onView,
  onDelete,
  readOnly = false,
}) => {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-[8px] hover:bg-[#F3F8FC] transition-colors group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-[7px] bg-[#EAF6FC] flex items-center justify-center shrink-0 text-[#126A9C]">
          <FileText size={16} strokeWidth={1.8} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-medium text-[#172A3A] truncate">
              {file.name}
            </span>
            {file.status && (
              <StatusInline status={file.status} size="sm" />
            )}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#607483]">
            {file.size && <span>{file.size}</span>}
            {file.size && file.uploadedAt && <span>·</span>}
            {file.uploadedAt && <span>Tải lên {file.uploadedAt}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity shrink-0">
        {file.status === 'needs_verification' && onVerify && (
          <Button
            size="sm"
            variant="quiet"
            onClick={() => onVerify(file)}
            className="text-[#B75B00] hover:bg-[#FEF6EB] h-7 px-2.5 text-[12px]"
          >
            Kiểm tra
          </Button>
        )}
        {onView && (
          <Button
            size="sm"
            variant="quiet"
            onClick={() => onView(file)}
            className="h-7 px-2.5 text-[12px] text-[#172A3A] hover:text-[#0D78AE]"
            iconLeading={<Eye size={13} />}
          >
            Xem
          </Button>
        )}
        {!readOnly && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(file)}
            title="Xóa minh chứng này"
            className="p-1.5 text-[#728391] hover:text-[#DC2626] hover:bg-red-50 rounded-[6px] transition-colors cursor-pointer"
          >
            <Trash2 size={13} strokeWidth={1.8} />
          </button>
        )}
      </div>
    </div>
  );
};

export const EvidenceExpandedList: React.FC<{
  files: EvidenceFileItem[];
  onVerify?: (file: EvidenceFileItem) => void;
  onView?: (file: EvidenceFileItem) => void;
  onDelete?: (file: EvidenceFileItem) => void;
  onAddEvidence?: () => void;
  readOnly?: boolean;
}> = ({ files, onVerify, onView, onDelete, onAddEvidence, readOnly = false }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[12.5px] font-semibold text-[#607483] uppercase tracking-wide">
          Minh chứng đính kèm ({files.length})
        </span>
        {!readOnly && onAddEvidence && (
          <button
            type="button"
            onClick={onAddEvidence}
            className="text-[12.5px] font-medium text-[#18A6E0] hover:text-[#126A9C] transition-colors cursor-pointer"
          >
            + Thêm minh chứng
          </button>
        )}
      </div>
      {files.length === 0 ? (
        <div className="py-4 text-center text-[13px] text-[#728391] bg-[#F8FBFD] rounded-[8px] border border-dashed border-[#DCE7EE]">
          Chưa có minh chứng đính kèm
        </div>
      ) : (
        <div className="divide-y divide-black/[0.04]">
          {files.map((file) => (
            <EvidenceCompactRow
              key={file.id}
              file={file}
              onVerify={onVerify}
              onView={onView}
              onDelete={onDelete}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
};
