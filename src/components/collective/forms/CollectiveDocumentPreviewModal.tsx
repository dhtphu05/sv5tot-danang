import React from 'react';
import { Download, X, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../buttons/Button';
import { FileTypeIcon } from '../../evidence/FileTypeIcon';
import { RealisticCertificatePreview } from '../../evidence/detail/documentPreviews/RealisticCertificatePreview';
import { ApplicationEvidence } from '../../../demo/fixtures/studentApplication';

export interface CollectiveDocumentPreviewModalProps {
  previewFile: ApplicationEvidence | null;
  previewBlobUrl: string | null;
  isLoadingPreview: boolean;
  onClose: () => void;
  onDownload: (file: ApplicationEvidence) => void;
}

export const CollectiveDocumentPreviewModal: React.FC<CollectiveDocumentPreviewModalProps> = ({
  previewFile,
  previewBlobUrl,
  isLoadingPreview,
  onClose,
  onDownload,
}) => {
  if (!previewFile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white rounded-[16px] shadow-2xl border border-[#DCE7EE] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F8FBFD] border-b border-[#DCE7EE] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 truncate">
            <FileTypeIcon fileName={previewFile.name} fileType={previewFile.fileType} size="md" />
            <div className="truncate">
              <h3 className="font-bold text-[15px] text-[#172A3A] truncate">{previewFile.name}</h3>
              <div className="text-[11.5px] text-[#607483] flex items-center gap-2 mt-0.5">
                <span>{previewFile.size}</span>
                <span>·</span>
                <span>Tải lên {previewFile.uploadedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onDownload(previewFile)}
              className="gap-1.5"
            >
              <Download size={14} />
              <span>Tải về</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-[#728391] hover:text-[#172A3A] hover:bg-[#EEF4F8] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#F1F5F9] flex items-center justify-center min-h-[460px]">
          {isLoadingPreview ? (
            <div className="text-center py-12 text-[#607483]">
              <div className="w-8 h-8 border-3 border-[#0D78AE] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[13px]">Đang mở tệp tài liệu...</p>
            </div>
          ) : previewBlobUrl ? (
            previewFile.fileType === 'pdf' ? (
              <iframe
                src={previewBlobUrl}
                title={previewFile.name}
                className="w-full h-[580px] bg-white rounded-[10px] border border-[#DCE7EE] shadow-sm"
              />
            ) : previewFile.fileType === 'jpg' || previewFile.fileType === 'png' || previewFile.fileType === 'webp' ? (
              <div className="max-h-[580px] flex items-center justify-center p-4 bg-white rounded-[10px] border border-[#DCE7EE] shadow-sm">
                <img
                  src={previewBlobUrl}
                  alt={previewFile.name}
                  className="max-h-[540px] max-w-full object-contain rounded"
                />
              </div>
            ) : (
              <div className="p-8 bg-white border border-[#DCE7EE] rounded-[16px] text-center max-w-md w-full shadow-md space-y-4">
                <div className="w-16 h-16 rounded-[14px] bg-[#EAF6FC] text-[#0D78AE] flex items-center justify-center mx-auto">
                  <FileSpreadsheet size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-[16px] text-[#172A3A]">{previewFile.name}</h4>
                  <p className="text-[12.5px] text-[#607483] mt-1">
                    Tệp bảng tính danh sách minh chứng ({previewFile.size})
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => onDownload(previewFile)}
                  className="gap-1.5 w-full justify-center"
                >
                  <Download size={16} />
                  <span>Tải về tệp bảng tính</span>
                </Button>
              </div>
            )
          ) : (
            <RealisticCertificatePreview
              fileName={previewFile.name}
              fileType={previewFile.fileType}
            />
          )}
        </div>
      </div>
    </div>
  );
};
