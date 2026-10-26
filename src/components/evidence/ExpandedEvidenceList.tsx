import React, { useState } from 'react';
import {
  Plus,
  Eye,
  MoreHorizontal,
  Trash2,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { ApplicationEvidence } from '../../demo/fixtures/studentApplication';
import { RequirementStatus } from '../../tokens';
import { FileTypeIcon } from './FileTypeIcon';

export interface ExpandedEvidenceListProps {
  files: ApplicationEvidence[];
  onViewFile: (file: ApplicationEvidence) => void;
  onAddEvidence?: () => void;
  onDetachEvidence?: (fileId: string) => void;
  onRetryEvidence?: (fileId: string) => void;
  readOnly?: boolean;
  isSupplementContext?: boolean;
  className?: string;
}

export const ExpandedEvidenceList: React.FC<ExpandedEvidenceListProps> = ({
  files = [],
  onViewFile,
  onAddEvidence,
  onDetachEvidence,
  onRetryEvidence,
  readOnly = false,
  isSupplementContext = false,
  className = '',
}) => {
  // If > 6 files, initial view shows 5 files with "Xem thêm N minh chứng" button
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const initialLimit = 5;
  const shouldTruncateList = files.length > 6 && !isShowingAll;
  const visibleFiles = shouldTruncateList ? files.slice(0, initialLimit) : files;
  const hiddenCount = files.length - initialLimit;

  // Friendly status label for EXCEPTIONS ONLY (Prompt Section 1, 2, 3, 15 & 16)
  // Normal ready evidence does NOT show a repeated green badge everywhere!
  const renderStatusBadge = (status: RequirementStatus) => {
    switch (status) {
      case 'needs_verification':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B75B00] bg-[#FEF6EB] border border-[#FADDB6] px-2 py-0.5 rounded-[5px] shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E99A18] shrink-0" />
            <span>Cần kiểm tra</span>
          </span>
        );
      case 'reading_document':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D78AE] bg-[#EAF6FC] border border-[#D0E8F5] px-2 py-0.5 rounded-[5px] shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#18A6E0] animate-pulse shrink-0" />
            <span>Đang đọc</span>
          </span>
        );
      case 'read_failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#991B1B] bg-[#FEF2F2] border border-[#FCA5A5] px-2 py-0.5 rounded-[5px] shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" />
            <span>Không thể đọc</span>
          </span>
        );
      case 'awaiting_officer':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6E6E73] bg-[#F1F5F8] border border-[#DDE6ED] px-2 py-0.5 rounded-[5px] shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#86868B] shrink-0" />
            <span>Chờ cán bộ kiểm tra</span>
          </span>
        );
      case 'ready':
      case 'has_evidence':
      default:
        // Ready files show NO status badge (clean typography & icon only)
        return null;
    }
  };

  return (
    <div className={`flex flex-col gap-2.5 w-full min-w-0 ${className}`}>
      {/* Streamlined Header bar (Prompt Section 12, 14 & 21: baseline aligned min-h-[26px]) */}
      <div className="flex items-center justify-between min-w-0 pb-1.5 border-b border-[#E3EBF1] min-h-[26px]">
        <span className="text-[12.5px] font-semibold text-[#172A3A]">
          Minh chứng đính kèm · {files.length}
        </span>

        {!readOnly && onAddEvidence && (
          <button
            type="button"
            onClick={onAddEvidence}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#126A9C] hover:text-[#0D78AE] hover:underline cursor-pointer transition-colors shrink-0"
            title="Đính kèm minh chứng"
          >
            <Plus size={12} strokeWidth={2.4} />
            <span>Đính kèm minh chứng</span>
          </button>
        )}
      </div>

      {/* Empty list notice */}
      {files.length === 0 && (
        <div className="py-4 text-center text-[12.5px] text-[#728391] italic bg-[#F8FBFD] rounded-[8px] border border-dashed border-[#DCE7EE]">
          Chưa có tài liệu minh chứng nào được gắn vào nội dung này.
        </div>
      )}

      {/* Compact flat rows with FileTypeIcon (Section 10 & 16) */}
      {files.length > 0 && (
        <div className="divide-y divide-[#E3EBF1] border border-[#DCE7EE] bg-white rounded-[10px] overflow-hidden min-w-0 shadow-2xs">
          {visibleFiles.map((file) => {
            const isMenuOpen = activeMenuId === file.id;

            return (
              <div
                key={file.id}
                className="py-2.5 px-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 group/row hover:bg-[#F8FBFD] transition-colors min-w-0"
              >
                {/* File Identity & Metadata */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <FileTypeIcon fileName={file.name} fileType={file.fileType} size="md" />

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap sm:flex-nowrap">
                      <button
                        type="button"
                        onClick={() => onViewFile(file)}
                        className="text-[13px] font-bold text-[#172A3A] hover:text-[#0D78AE] hover:underline truncate max-w-full min-w-0 text-left cursor-pointer transition-colors"
                        title={`${file.name} (Bấm để xem)`}
                      >
                        {file.name}
                      </button>
                      {file.isNewlyAddedSupplement ? (
                        <span className="text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] border border-[#BAE6FD] px-1.5 py-0.1 rounded shrink-0 whitespace-nowrap">
                          Mới bổ sung
                        </span>
                      ) : isSupplementContext ? (
                        <span className="text-[10px] text-[#607483] bg-[#F1F6F9] px-1.5 py-0.1 rounded shrink-0 whitespace-nowrap">
                          Đã có trong hồ sơ
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#728391] mt-0.5 truncate tabular-nums">
                      <span>{(file.fileType || 'tài liệu').toUpperCase()}</span>
                      {file.size && (
                        <>
                          <span className="text-[#B9CCD9]">·</span>
                          <span>{file.size}</span>
                        </>
                      )}
                      {file.uploadedAt && (
                        <>
                          <span className="text-[#B9CCD9]">·</span>
                          <span>Tải lên {file.uploadedAt}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge: Exception only (Prompt Section 1, 2, 3 & 15) */}
                {renderStatusBadge(file.status) && (
                  <div className="shrink-0">{renderStatusBadge(file.status)}</div>
                )}

                {/* Actions: Streamlined direct inspection and options */}
                <div className="flex items-center gap-1 shrink-0 relative">
                  <button
                    type="button"
                    onClick={() => onViewFile(file)}
                    className="p-1.5 rounded-[6px] text-[#728391] hover:text-[#0D78AE] hover:bg-[#EAF6FC] transition-colors cursor-pointer"
                    title="Xem chi tiết minh chứng"
                  >
                    <Eye size={15} strokeWidth={2} />
                  </button>

                  {!readOnly && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : file.id);
                        }}
                        className="p-1 rounded-[6px] text-[#728391] hover:text-[#172A3A] hover:bg-[#EAF6FC] transition-colors cursor-pointer"
                        title="Tùy chọn khác"
                      >
                        <MoreHorizontal size={14} />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-[8px] border border-[#DCE7EE] shadow-md py-1 z-30 text-[12px] flex flex-col animate-in fade-in zoom-in-95 duration-100">
                            {file.status === 'read_failed' && onRetryEvidence && (
                              <button
                                type="button"
                                onClick={() => {
                                  onRetryEvidence(file.id);
                                  setActiveMenuId(null);
                                }}
                                className="px-3 py-1.5 text-left text-[#126A9C] hover:bg-[#EAF6FC] flex items-center gap-2 cursor-pointer font-semibold"
                              >
                                <RotateCcw size={13} />
                                <span>Thử xử lý lại</span>
                              </button>
                            )}

                            {onDetachEvidence && (
                              <button
                                type="button"
                                onClick={() => {
                                  onDetachEvidence(file.id);
                                  setActiveMenuId(null);
                                }}
                                className="px-3 py-1.5 text-left text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2 cursor-pointer font-medium border-t border-[#F1F5F8]"
                              >
                                <Trash2 size={13} />
                                <span>Gỡ khỏi nội dung này</span>
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* "Xem thêm N minh chứng" button if > 6 files */}
      {shouldTruncateList && (
        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={() => setIsShowingAll(true)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-[6px] bg-[#F1F6F9] hover:bg-[#E4EDF3] border border-[#E3EBF1] text-[#0D78AE] text-[12px] font-semibold transition-colors cursor-pointer"
          >
            <span>Xem thêm {hiddenCount} minh chứng</span>
            <ChevronDown size={13} strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  );
};
