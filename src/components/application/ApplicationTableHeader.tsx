import React from 'react';
import { Info } from 'lucide-react';

export interface ApplicationTableHeaderProps {
  className?: string;
  isSticky?: boolean;
  isCompact?: boolean;
  isReviewMode?: boolean;
}

/**
 * 5-Column Administrative Dossier Table Header (Matching Central HSV Portal Layout):
 * STT | Tiêu chí | Tiêu chuẩn cụ thể | Yêu cầu minh chứng | Kết quả (hoặc Đánh giá)
 */
export const ApplicationTableHeader: React.FC<ApplicationTableHeaderProps> = ({
  className = '',
  isSticky = false,
  isReviewMode = false,
}) => {
  return (
    <div
      className={`hidden md:grid admin-dossier-header-grid items-stretch bg-[#F8FAFC] text-[12.5px] font-bold text-[#1E293B] select-none border-b border-[#DFE5EC] ${
        isSticky ? 'sticky top-[96px] z-[15]' : ''
      } ${className}`}
    >
      {/* Col 1: STT */}
      <div className="flex items-center justify-center py-2.5 px-2 border-r border-[#DFE5EC]">
        <span>STT</span>
      </div>

      {/* Col 2: Tiêu chí */}
      <div className="flex items-center justify-center py-2.5 px-3 border-r border-[#DFE5EC] text-center">
        <span>Tiêu chí</span>
      </div>

      {/* Col 3: Tiêu chuẩn cụ thể */}
      <div className="flex items-center justify-center py-2.5 px-4 border-r border-[#DFE5EC] text-center">
        <span>Tiêu chuẩn cụ thể</span>
      </div>

      {/* Col 4: Yêu cầu minh chứng */}
      <div className="flex items-center justify-center py-2.5 px-4 border-r border-[#DFE5EC] text-center">
        <span>Yêu cầu minh chứng</span>
      </div>

      {/* Col 5: Kết quả / Đánh giá */}
      <div className="flex items-center justify-center gap-1 py-2.5 px-3 text-center">
        <span>{isReviewMode ? 'Kết quả & Đánh giá' : 'Kết quả'}</span>
        <span
          title={
            isReviewMode
              ? 'Kết quả kê khai của ứng viên và thao tác thẩm định của cán bộ'
              : 'Nhấn dấu (+) để kê khai nội dung và đính kèm minh chứng'
          }
          className="text-[#007EE5] inline-flex items-center"
        >
          <Info size={13} strokeWidth={2.2} />
        </span>
      </div>
    </div>
  );
};
