import React, { useState } from 'react';
import { ChevronRight, Edit3, ChevronDown } from 'lucide-react';
import { RequirementStatus } from '../../tokens';
import { StatusInline } from '../status/StatusInline';
import { EvidenceFileItem } from '../evidence/EvidenceFileChip';
import { EvidenceSummary } from '../evidence/EvidenceFileChip';
import { Button } from '../buttons/Button';
import { ExpandedRequirementContent } from './ExpandedRequirementContent';
import { RequirementData } from './tableRequirementTypes';

export type { RequirementData };

export interface RequirementRowProps {
  data: RequirementData;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onOpenRegulation?: () => void;
  onInspectEvidence?: (file: EvidenceFileItem) => void;
  onUpdateDeclaration?: (newDeclaration: { value: string; detail?: string }) => void;
  onAddEvidence?: () => void;
  onDeleteEvidence?: (file: EvidenceFileItem) => void;
  className?: string;
}

export const RequirementRow: React.FC<RequirementRowProps> = ({
  data,
  isExpanded = false,
  onToggleExpand,
  onOpenRegulation,
  onInspectEvidence,
  onUpdateDeclaration,
  onAddEvidence,
  onDeleteEvidence,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div
      className={`group/row transition-colors duration-150 ${
        isExpanded ? 'bg-[#22A9E0]/[0.02]' : 'hover:bg-black/[0.015]'
      } ${className}`}
    >
      {/* Main Collapsed Row */}
      <div
        onClick={onToggleExpand}
        className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center cursor-pointer min-h-[58px]"
      >
        {/* Col 1: Requirement Title & Rule Level 1 Badge */}
        <div className="col-span-5 flex items-center gap-3 pr-2 min-w-0">
          <div className="flex items-center gap-2 shrink-0 text-[#86868B] group-hover/row:text-[#1D1D1F] transition-transform duration-200">
            {isExpanded ? (
              <ChevronDown size={16} strokeWidth={2.2} />
            ) : (
              <ChevronRight size={16} strokeWidth={2.2} />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-medium text-[#1D1D1F] group-hover/row:text-[#16689E] transition-colors leading-snug line-clamp-2">
              {data.title}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11.5px] font-medium text-[#6E6E73] bg-black/[0.04] px-1.5 py-0.5 rounded-[4px] shrink-0">
                {data.ruleBadge}
              </span>
              {data.ruleHelper && (
                <span className="text-[11.5px] text-[#86868B] truncate hidden xl:inline">
                  {data.ruleHelper}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Col 2: Student Declaration Value */}
        <div className="col-span-3 min-w-0 pr-3">
          <div className="text-[13.5px] font-medium text-[#1D1D1F] truncate">
            {data.declarationValue || (
              <span className="text-[#86868B] italic font-normal">Chưa khai báo</span>
            )}
          </div>
          {data.declarationDetail && (
            <div className="text-[12px] text-[#6E6E73] truncate">
              {data.declarationDetail}
            </div>
          )}
        </div>

        {/* Col 3: Contextual Evidence Summary */}
        <div
          className="col-span-2 min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          <EvidenceSummary
            files={data.evidenceFiles}
            maxVisible={1}
            onFileClick={onInspectEvidence}
            onViewAllClick={onToggleExpand}
          />
        </div>

        {/* Col 4: Status & Contextual Actions */}
        <div className="col-span-2 flex items-center justify-end gap-2.5">
          {/* Status Inline */}
          <StatusInline status={data.status} size="sm" />

          {/* Quick Actions (revealed smoothly on hover/focus) */}
          <div
            className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="quiet"
              onClick={() => {
                if (!isExpanded && onToggleExpand) onToggleExpand();
                setIsEditing(true);
              }}
              title="Chỉnh sửa khai báo"
              className="h-7 px-2 text-[12px] text-[#6E6E73] hover:text-[#16689E]"
            >
              <Edit3 size={13} />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Area */}
      {isExpanded && (
        <div className="border-t border-black/[0.04] bg-[#FAFBFD] px-6 py-5">
          <ExpandedRequirementContent
            data={data}
            isEditing={isEditing}
            onSetEditing={setIsEditing}
            onUpdateDeclaration={onUpdateDeclaration}
            onInspectEvidence={onInspectEvidence}
            onAddEvidence={onAddEvidence}
            onDeleteEvidence={onDeleteEvidence}
            onOpenRegulation={onOpenRegulation}
          />
        </div>
      )}
    </div>
  );
};
