import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  FileQuestion,
  RotateCcw,
} from 'lucide-react';
import { RealisticCertificatePreview } from './documentPreviews/RealisticCertificatePreview';

export interface DocumentViewerProps {
  fileName: string;
  fileType?: string;
  totalPage?: number;
  highlightRegion?: string | null;
  onSelectRegion?: (regionId: string) => void;
  isLoading?: boolean;
  isFailed?: boolean;
  onRetryPreview?: () => void;
}

/**
 * DocumentViewer (Left Pane)
 * Dominant visual workspace with neutral document canvas (#EEF3F7),
 * Apple-inspired floating toolbar, zoom controls, and multi-page navigation.
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  fileName,
  fileType = 'pdf',
  totalPage = 2,
  highlightRegion = null,
  onSelectRegion,
  isLoading = false,
  isFailed = false,
  onRetryPreview,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(160, z + 15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(65, z - 15));
  const handleResetZoom = () => setZoomLevel(100);

  // Page handlers
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPage, p + 1));

  const isPdf = fileName.toLowerCase().endsWith('.pdf') || fileType === 'pdf';

  return (
    <div className="relative flex-1 h-full bg-[#EEF3F7] overflow-auto flex flex-col min-w-0 select-none">
      {/* Floating Apple-inspired Viewer Toolbar (Section 10 & 11) */}
      <div className="sticky top-4 z-20 mx-auto pointer-events-none mt-3">
        <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_20px_rgba(23,42,58,0.12)] border border-[#DCE7EE] text-[12px] text-[#172A3A]">
          {/* Multi-page controls (Section 10 & 12) */}
          {isPdf && totalPage > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 rounded-full text-[#607483] hover:text-[#172A3A] hover:bg-[#F1F6F9] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft size={15} strokeWidth={2.4} />
              </button>
              <span className="font-semibold px-1 text-[11.5px] tabular-nums text-[#172A3A]">
                {currentPage} / {totalPage}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= totalPage}
                className="p-1 rounded-full text-[#607483] hover:text-[#172A3A] hover:bg-[#F1F6F9] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Trang tiếp theo"
              >
                <ChevronRight size={15} strokeWidth={2.4} />
              </button>

              <div className="w-[1px] h-4 bg-[#DCE7EE] mx-1" />
            </>
          )}

          {/* Zoom controls */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 65}
            className="p-1 rounded-full text-[#607483] hover:text-[#172A3A] hover:bg-[#F1F6F9] disabled:opacity-30 transition-colors cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut size={14} strokeWidth={2.2} />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="font-semibold text-[11px] px-1 hover:text-[#126A9C] cursor-pointer tabular-nums text-[#172A3A]"
            title="Đặt lại mức thu phóng 100%"
          >
            {zoomLevel}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 160}
            className="p-1 rounded-full text-[#607483] hover:text-[#172A3A] hover:bg-[#F1F6F9] disabled:opacity-30 transition-colors cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn size={14} strokeWidth={2.2} />
          </button>

          <div className="w-[1px] h-4 bg-[#DCE7EE] mx-1" />

          {/* Fit Width */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1 rounded-full text-[#607483] hover:text-[#172A3A] hover:bg-[#F1F6F9] transition-colors cursor-pointer"
            title="Khớp chiều rộng"
          >
            <Maximize2 size={13} strokeWidth={2.2} />
          </button>

          {/* Open Original */}
          <button
            type="button"
            onClick={() => window.open('#', '_blank')}
            className="p-1 rounded-full text-[#607483] hover:text-[#126A9C] hover:bg-[#F1F6F9] transition-colors cursor-pointer"
            title="Mở tài liệu gốc"
          >
            <ExternalLink size={13} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Loading Skeleton State (Section 13) */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <div className="w-[500px] h-[700px] bg-white rounded-[4px] shadow-md border border-[#DCE7EE] p-8 flex flex-col gap-4 animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded mx-auto" />
            <div className="h-4 w-32 bg-gray-200 rounded mx-auto mb-8" />
            <div className="h-10 w-64 bg-gray-200 rounded mx-auto mb-6" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
          <p className="mt-4 text-[13px] font-medium text-[#607483]">
            Đang mở tài liệu...
          </p>
        </div>
      )}

      {/* Preview Failure Fallback (Section 14) */}
      {!isLoading && isFailed && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="p-8 bg-white rounded-[12px] border border-[#DCE7EE] shadow-sm max-w-md flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mb-3">
              <FileQuestion size={24} />
            </div>
            <h4 className="text-[15px] font-bold text-[#172A3A]">
              Không thể hiển thị bản xem trước
            </h4>
            <p className="text-[12.5px] text-[#607483] mt-1.5 leading-relaxed">
              Tệp <strong>{fileName}</strong> có định dạng hoặc kích thước không thể kết xuất xem trực tiếp.
              Các thông tin nhận diện ở bảng bên phải vẫn sẵn sàng để kiểm tra.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {onRetryPreview && (
                <button
                  type="button"
                  onClick={onRetryPreview}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#126A9C] bg-[#EAF6FC] border border-[#D0E8F5] rounded-[6px] hover:bg-[#D0E8F5] transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Thử tải lại</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => window.open('#', '_blank')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-[#126A9C] hover:bg-[#0D78AE] rounded-[6px] transition-colors cursor-pointer"
              >
                <ExternalLink size={13} />
                <span>Mở tài liệu gốc</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render Document Page */}
      {!isLoading && !isFailed && (
        <div className="flex-1 flex flex-col items-center justify-start pb-12 pt-2">
          <RealisticCertificatePreview
            fileName={fileName}
            fileType={fileType}
            page={currentPage}
            totalPage={totalPage}
            zoomLevel={zoomLevel}
            highlightRegion={highlightRegion}
            onSelectRegion={onSelectRegion}
          />
        </div>
      )}
    </div>
  );
};
