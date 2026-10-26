import React from 'react';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { RequirementStatus } from '../../tokens';
import { FileTypeIcon } from './FileTypeIcon';

export interface EvidenceFileItem {
  id: string;
  name: string;
  fileType?: string;
  size?: string;
  uploadedAt?: string;
  status?: RequirementStatus;
  url?: string;
  aiSuggestedInfo?: {
    achievementName?: string;
    date?: string;
    issuingAuthority?: string;
  };
}

export interface EvidenceFileChipProps {
  file: EvidenceFileItem;
  onClick?: (file: EvidenceFileItem) => void;
  showStatusIndicator?: boolean;
}

export const EvidenceFileChip: React.FC<EvidenceFileChipProps> = ({
  file,
  onClick,
  showStatusIndicator = true,
}) => {
  // Truncate filename gracefully (e.g. "Chung_chi_tieng_anh_b1.pdf" -> "Chung_chi_ti...b1.pdf" if too long)
  const truncateFilename = (str: string, max = 20) => {
    if (str.length <= max) return str;
    const ext = str.split('.').pop() || '';
    const nameWithoutExt = str.substring(0, str.lastIndexOf('.')) || str;
    const charsToShow = max - ext.length - 4;
    return `${nameWithoutExt.substring(0, charsToShow)}...${ext ? '.' + ext : ''}`;
  };

  const isAttention = file.status === 'needs_verification';
  const isReady = file.status === 'ready' || file.status === 'has_evidence';

  return (
    <button
      type="button"
      onClick={() => onClick && onClick(file)}
      title={`${file.name}${file.size ? ` (${file.size})` : ''}`}
      className="inline-flex items-center gap-1.5 h-7 px-2.5 py-0.5 rounded-[6px] bg-[#F1F6F9] hover:bg-[#E4EDF3] border border-[#E3EBF1] text-[#172A3A] text-[12px] font-medium transition-colors cursor-pointer select-none group max-w-[200px]"
    >
      <FileTypeIcon fileName={file.name} fileType={file.fileType} size="sm" />
      <span className="truncate">{truncateFilename(file.name)}</span>
      {showStatusIndicator && isAttention && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#E99A18] shrink-0 ml-0.5"
          title="Cần bạn kiểm tra"
        />
      )}
    </button>
  );
};

export interface EvidenceSummaryProps {
  files: EvidenceFileItem[];
  maxVisible?: number;
  onFileClick?: (file: EvidenceFileItem) => void;
  onViewAllClick?: () => void;
  className?: string;
}

export const EvidenceSummary: React.FC<EvidenceSummaryProps> = ({
  files,
  maxVisible = 2,
  onFileClick,
  onViewAllClick,
  className = '',
}) => {
  if (!files || files.length === 0) {
    return <span className="text-[12.5px] text-[#728391] italic">Chưa có minh chứng</span>;
  }

  const visibleFiles = files.slice(0, maxVisible);
  const remainingCount = files.length - maxVisible;

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {visibleFiles.map((file) => (
        <EvidenceFileChip key={file.id} file={file} onClick={onFileClick} />
      ))}
      {remainingCount > 0 && (
        <button
          type="button"
          onClick={onViewAllClick}
          className="inline-flex items-center justify-center h-7 px-2 rounded-[6px] bg-[#EAF6FC] hover:bg-[#D0E8F5] border border-[#D0E8F5] text-[#0D78AE] text-[11.5px] font-bold transition-colors cursor-pointer"
          title={`Xem thêm ${remainingCount} minh chứng`}
        >
          +{remainingCount}
        </button>
      )}
    </div>
  );
};
