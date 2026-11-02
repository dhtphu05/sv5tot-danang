import React, { useState, useEffect } from 'react';
import { Download, X, FileSpreadsheet, FileText, ExternalLink, AlertCircle } from 'lucide-react';
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
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [previewBlobUrl, previewFile?.id]);

  if (!previewFile) return null;

  const nameLower = (previewFile.name || '').toLowerCase();
  const typeLower = (previewFile.fileType || '').toLowerCase();
  const isPdf = typeLower === 'pdf' || nameLower.endsWith('.pdf');
  const isImage =
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(typeLower) ||
    /\.(jpe?g|png|webp|gif|svg)$/i.test(nameLower);
  const isWord =
    ['doc', 'docx'].includes(typeLower) || /\.(docx?)$/i.test(nameLower);
  const isSpreadsheet =
    ['xls', 'xlsx', 'csv'].includes(typeLower) || /\.(xlsx?|csv)$/i.test(nameLower);

  const isRealisticFixture =
    nameLower.includes('ielts') ||
    nameLower.includes('nckh') ||
    nameLower.includes('giay_chung_nhan') ||
    nameLower.includes('scan_mo') ||
    nameLower.includes('mua_he_xanh');

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
            {previewBlobUrl && (
              <a
                href={previewBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-[6px] text-[#728391] hover:text-[#0D78AE] hover:bg-[#EEF4F8] transition-colors cursor-pointer"
                title="Mở trong tab mới"
              >
                <ExternalLink size={18} />
              </a>
            )}

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
            isPdf ? (
              <div className="w-full flex flex-col items-center gap-2.5">
                <iframe
                  src={previewBlobUrl}
                  title={previewFile.name}
                  className="w-full h-[580px] bg-white rounded-[10px] border border-[#DCE7EE] shadow-sm"
                />
                <div className="text-[12px] text-[#64748B]">
                  Nếu tài liệu PDF không tự động hiển thị trong khung,{' '}
                  <a
                    href={previewBlobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0D78AE] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    mở trực tiếp trong tab mới <ExternalLink size={12} />
                  </a>{' '}
                  hoặc tải về máy tính.
                </div>
              </div>
            ) : isImage ? (
              imageError ? (
                <div className="p-8 bg-white border border-[#DCE7EE] rounded-[16px] text-center max-w-md w-full shadow-md space-y-4">
                  <div className="w-16 h-16 rounded-[14px] bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mx-auto">
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[16px] text-[#172A3A]">{previewFile.name}</h4>
                    <p className="text-[12.5px] text-[#607483] mt-1">
                      Không thể tải trực tiếp hình ảnh từ bộ lưu trữ đám mây. Bạn có thể mở liên kết gốc trong tab mới hoặc tải về máy tính.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={previewBlobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[9px] bg-[#EAF6FC] text-[#0D78AE] hover:bg-[#D8EDF9] text-[13px] font-semibold transition-colors"
                    >
                      <ExternalLink size={15} />
                      <span>Mở trong tab mới</span>
                    </a>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => onDownload(previewFile)}
                      className="flex-1 gap-1.5 justify-center"
                    >
                      <Download size={15} />
                      <span>Tải về tệp ảnh</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-h-[580px] flex items-center justify-center p-4 bg-white rounded-[10px] border border-[#DCE7EE] shadow-sm">
                  <img
                    src={previewBlobUrl}
                    alt={previewFile.name}
                    onError={() => setImageError(true)}
                    className="max-h-[540px] max-w-full object-contain rounded"
                  />
                </div>
              )
            ) : isWord ? (
              <div className="p-8 bg-white border border-[#DCE7EE] rounded-[16px] text-center max-w-md w-full shadow-md space-y-4">
                <div className="w-16 h-16 rounded-[14px] bg-[#EAF6FC] text-[#0D78AE] flex items-center justify-center mx-auto">
                  <FileText size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-[16px] text-[#172A3A]">{previewFile.name}</h4>
                  <p className="text-[12.5px] text-[#607483] mt-1">
                    Tệp tài liệu văn bản Word ({previewFile.size})
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => onDownload(previewFile)}
                    className="gap-1.5 w-full justify-center"
                  >
                    <Download size={16} />
                    <span>Tải về tệp Word ({typeLower.toUpperCase()})</span>
                  </Button>
                  {previewBlobUrl.startsWith('http') && (
                    <a
                      href={previewBlobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] text-[12px] text-[#0D78AE] hover:bg-[#F0F8FD]"
                    >
                      <ExternalLink size={13} />
                      <span>Mở liên kết tải trực tiếp</span>
                    </a>
                  )}
                </div>
              </div>
            ) : isSpreadsheet ? (
              <div className="p-8 bg-white border border-[#DCE7EE] rounded-[16px] text-center max-w-md w-full shadow-md space-y-4">
                <div className="w-16 h-16 rounded-[14px] bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto">
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
            ) : (
              <div className="p-8 bg-white border border-[#DCE7EE] rounded-[16px] text-center max-w-md w-full shadow-md space-y-4">
                <div className="w-16 h-16 rounded-[14px] bg-[#F1F5F9] text-[#475569] flex items-center justify-center mx-auto">
                  <FileTypeIcon fileName={previewFile.name} fileType={previewFile.fileType} size="md" />
                </div>
                <div>
                  <h4 className="font-bold text-[16px] text-[#172A3A]">{previewFile.name}</h4>
                  <p className="text-[12.5px] text-[#607483] mt-1">
                    Tệp tài liệu đính kèm ({previewFile.size})
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => onDownload(previewFile)}
                  className="gap-1.5 w-full justify-center"
                >
                  <Download size={16} />
                  <span>Tải về tệp tài liệu</span>
                </Button>
              </div>
            )
          ) : isRealisticFixture ? (
            <RealisticCertificatePreview
              fileName={previewFile.name}
              fileType={previewFile.fileType}
            />
          ) : (
            <div className="p-8 bg-white border border-[#DCE7EE] rounded-[16px] text-center max-w-md w-full shadow-md space-y-4">
              <div className="w-16 h-16 rounded-[14px] bg-[#EAF6FC] text-[#0D78AE] flex items-center justify-center mx-auto">
                <FileTypeIcon fileName={previewFile.name} fileType={previewFile.fileType} size="md" />
              </div>
              <div>
                <h4 className="font-bold text-[16px] text-[#172A3A]">{previewFile.name}</h4>
                <div className="text-[12px] text-[#607483] mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
                  <span className="font-semibold text-[#334155]">{previewFile.fileType?.toUpperCase()}</span>
                  <span>·</span>
                  <span>{previewFile.size}</span>
                  <span>·</span>
                  <span>Tải lên {previewFile.uploadedAt}</span>
                </div>
                <p className="text-[12.5px] text-[#607483] mt-2 leading-relaxed">
                  Tài liệu minh chứng đã được lưu trữ trong hệ thống đề cử. Nhấn nút bên dưới để tải tệp về máy tính và kiểm tra toàn bộ nội dung.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={() => onDownload(previewFile)}
                className="gap-1.5 w-full justify-center"
              >
                <Download size={16} />
                <span>Tải về để xem tệp</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
