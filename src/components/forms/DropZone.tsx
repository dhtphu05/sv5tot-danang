import React, { useRef, useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

export interface DropZoneProps {
  onFilesSelected?: (files: FileList | File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
  subtext?: string;
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  multiple = true,
  maxSizeMB = 100,
  label = 'Kéo thả minh chứng vào đây hoặc bấm để chọn tệp',
  subtext = 'Định dạng hỗ trợ: PDF, JPG, PNG, WEBP (tối đa 100MB/tệp)',
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onFilesSelected) {
        onFilesSelected(e.dataTransfer.files);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (onFilesSelected) {
        onFilesSelected(e.target.files);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center p-6 text-center rounded-[12px] cursor-pointer transition-all duration-180 select-none ${
        isDragOver
          ? 'bg-[#22A9E0]/8 border border-dashed border-[#22A9E0] scale-[0.995]'
          : 'bg-[#F9FAFB] hover:bg-[#F2F4F7] border border-dashed border-black/10 hover:border-black/20'
      } ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2.5 text-[#22A9E0]">
        <UploadCloud size={20} strokeWidth={1.8} />
      </div>
      <p className="text-[13.5px] font-medium text-[#1D1D1F] max-w-sm mb-1">
        {label}
      </p>
      <p className="text-[12px] text-[#86868B]">{subtext}</p>
    </div>
  );
};
