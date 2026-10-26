import React from 'react';
import { Image as ImageIcon, FileText, FileSpreadsheet } from 'lucide-react';

export type FileCategory = 'pdf' | 'doc' | 'xls' | 'image' | 'generic';

/**
 * Detect file category from file name or explicit fileType string
 */
export function getFileCategory(fileName: string, fileType?: string): FileCategory {
  const name = (fileName || '').toLowerCase();
  const type = (fileType || '').toLowerCase();

  if (type === 'pdf' || name.endsWith('.pdf')) {
    return 'pdf';
  }
  if (
    type === 'doc' ||
    type === 'docx' ||
    name.endsWith('.doc') ||
    name.endsWith('.docx')
  ) {
    return 'doc';
  }
  if (
    type === 'xls' ||
    type === 'xlsx' ||
    type === 'csv' ||
    name.endsWith('.xls') ||
    name.endsWith('.xlsx') ||
    name.endsWith('.csv')
  ) {
    return 'xls';
  }
  if (
    type === 'jpg' ||
    type === 'jpeg' ||
    type === 'png' ||
    type === 'webp' ||
    type === 'image' ||
    /\.(jpe?g|png|webp|gif|svg)$/i.test(name)
  ) {
    return 'image';
  }

  return 'generic';
}

export interface FileTypeIconProps {
  fileName: string;
  fileType?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Reusable FileTypeIcon with restrained 5TOT institutional styling
 * - PDF: soft red accent
 * - Word (DOC/DOCX): soft blue accent
 * - Excel (XLS/XLSX): soft green accent
 * - Image (JPG/PNG/WEBP): soft purple/cyan accent
 * - Generic: neutral document icon
 */
export const FileTypeIcon: React.FC<FileTypeIconProps> = ({
  fileName,
  fileType,
  size = 'sm',
  className = '',
}) => {
  const category = getFileCategory(fileName, fileType);

  if (size === 'sm') {
    // Micro badge for collapsed chip rows (16x16)
    switch (category) {
      case 'pdf':
        return (
          <span
            className={`w-4 h-4 rounded-[3px] bg-[#FEF2F2] border border-[#FCA5A5]/60 text-[#DC2626] font-bold text-[8px] flex items-center justify-center shrink-0 select-none tracking-tight ${className}`}
            title="Tài liệu PDF"
          >
            PDF
          </span>
        );
      case 'doc':
        return (
          <span
            className={`w-4 h-4 rounded-[3px] bg-[#EFF6FF] border border-[#93C5FD]/60 text-[#1D4ED8] font-bold text-[8px] flex items-center justify-center shrink-0 select-none tracking-tight ${className}`}
            title="Tài liệu Word"
          >
            DOC
          </span>
        );
      case 'xls':
        return (
          <span
            className={`w-4 h-4 rounded-[3px] bg-[#F0FDF4] border border-[#86EFAC]/60 text-[#15803D] font-bold text-[8px] flex items-center justify-center shrink-0 select-none tracking-tight ${className}`}
            title="Bảng tính Excel"
          >
            XLS
          </span>
        );
      case 'image':
        return (
          <span
            className={`w-4 h-4 rounded-[3px] bg-[#FAF5FF] border border-[#D8B4FE]/60 text-[#7E22CE] font-bold text-[7.5px] flex items-center justify-center shrink-0 select-none tracking-tight ${className}`}
            title="Tệp hình ảnh"
          >
            IMG
          </span>
        );
      case 'generic':
      default:
        return (
          <span
            className={`w-4 h-4 rounded-[3px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] flex items-center justify-center shrink-0 select-none ${className}`}
            title="Tài liệu"
          >
            <FileText size={10} strokeWidth={2.2} />
          </span>
        );
    }
  }

  // Medium / Large: For expanded evidence list and inspector (26x26)
  switch (category) {
    case 'pdf':
      return (
        <span
          className={`w-6 h-6 rounded-[5px] bg-[#FEF2F2] border border-[#FCA5A5]/60 text-[#DC2626] font-bold text-[9.5px] flex items-center justify-center shrink-0 select-none shadow-2xs ${className}`}
          title="Tài liệu PDF"
        >
          PDF
        </span>
      );
    case 'doc':
      return (
        <span
          className={`w-6 h-6 rounded-[5px] bg-[#EFF6FF] border border-[#93C5FD]/60 text-[#1D4ED8] font-bold text-[9.5px] flex items-center justify-center shrink-0 select-none shadow-2xs ${className}`}
          title="Tài liệu Word"
        >
          DOC
        </span>
      );
    case 'xls':
      return (
        <span
          className={`w-6 h-6 rounded-[5px] bg-[#F0FDF4] border border-[#86EFAC]/60 text-[#15803D] font-bold text-[9.5px] flex items-center justify-center shrink-0 select-none shadow-2xs ${className}`}
          title="Bảng tính Excel"
        >
          XLS
        </span>
      );
    case 'image':
      return (
        <span
          className={`w-6 h-6 rounded-[5px] bg-[#FAF5FF] border border-[#D8B4FE]/60 text-[#7E22CE] flex items-center justify-center shrink-0 select-none shadow-2xs ${className}`}
          title="Hình ảnh"
        >
          <ImageIcon size={13} strokeWidth={2.2} />
        </span>
      );
    case 'generic':
    default:
      return (
        <span
          className={`w-6 h-6 rounded-[5px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] flex items-center justify-center shrink-0 select-none shadow-2xs ${className}`}
          title="Tài liệu"
        >
          <FileText size={13} strokeWidth={2.2} />
        </span>
      );
  }
};
