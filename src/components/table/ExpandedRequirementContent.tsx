import React from 'react';
import { RequirementData } from './tableRequirementTypes';
import { EvidenceFileItem } from '../evidence/EvidenceFileChip';
import { EvidenceExpandedList } from '../evidence/EvidenceCompactRow';
import { RecommendationBanner } from '../status/RecommendationBanner';
import { InlineEditor } from './InlineEditor';
import { Button } from '../buttons/Button';
import { BookOpen, Edit3 } from 'lucide-react';

export interface ExpandedRequirementContentProps {
  data: RequirementData;
  isEditing: boolean;
  onSetEditing: (editing: boolean) => void;
  onUpdateDeclaration?: (newDeclaration: { value: string; detail?: string }) => void;
  onInspectEvidence?: (file: EvidenceFileItem) => void;
  onAddEvidence?: () => void;
  onDeleteEvidence?: (file: EvidenceFileItem) => void;
  onOpenRegulation?: () => void;
}

export const ExpandedRequirementContent: React.FC<ExpandedRequirementContentProps> = ({
  data,
  isEditing,
  onSetEditing,
  onUpdateDeclaration,
  onInspectEvidence,
  onAddEvidence,
  onDeleteEvidence,
  onOpenRegulation,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Contextual Recommendation / Advisory Check if present */}
      {data.recommendation && (
        <RecommendationBanner
          variant={data.recommendation.variant}
          message={data.recommendation.message}
          action={
            data.recommendation.actionLabel
              ? {
                  label: data.recommendation.actionLabel,
                  onClick: () => {
                    if (data.evidenceFiles[0] && onInspectEvidence) {
                      onInspectEvidence(data.evidenceFiles[0]);
                    }
                  },
                }
              : undefined
          }
        />
      )}

      {/* Main Content Split: Declaration on Left, Evidence on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Declaration Details or Inline Editor */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-[#6E6E73] uppercase tracking-wide">
              Khai báo của sinh viên
            </span>
            {!isEditing && (
              <Button
                size="sm"
                variant="quiet"
                onClick={() => onSetEditing(true)}
                iconLeading={<Edit3 size={13} />}
                className="h-7 px-2.5 text-[12px] text-[#22A9E0] hover:text-[#16689E]"
              >
                Chỉnh sửa
              </Button>
            )}
          </div>

          {isEditing ? (
            <InlineEditor
              initialValue={data.declarationValue}
              initialDetail={data.declarationDetail}
              onSave={(updated) => {
                if (onUpdateDeclaration) onUpdateDeclaration(updated);
                onSetEditing(false);
              }}
              onCancel={() => onSetEditing(false)}
            />
          ) : (
            <div className="p-3.5 bg-white rounded-[10px] border border-black/[0.04]">
              <div className="text-[14px] font-medium text-[#1D1D1F]">
                {data.declarationValue || (
                  <span className="text-[#86868B] italic font-normal">Chưa có thông tin khai báo</span>
                )}
              </div>
              {data.declarationDetail && (
                <div className="text-[13px] text-[#6E6E73] mt-1 leading-relaxed">
                  {data.declarationDetail}
                </div>
              )}
              {data.declarationDate && (
                <div className="text-[11.5px] text-[#86868B] mt-2">
                  Ngày ghi nhận: {data.declarationDate}
                </div>
              )}
            </div>
          )}

          {/* Contextual regulation helper */}
          {onOpenRegulation && (
            <div className="flex items-center gap-1.5 text-[12.5px] text-[#6E6E73]">
              <span>Cần xem quy định xét chọn?</span>
              <button
                type="button"
                onClick={onOpenRegulation}
                className="text-[#22A9E0] hover:text-[#16689E] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <BookOpen size={13} />
                <span>Xem quy chế chi tiết</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Evidence List & Add Evidence */}
        <div className="lg:col-span-6 bg-white p-3.5 rounded-[10px] border border-black/[0.04]">
          <EvidenceExpandedList
            files={data.evidenceFiles}
            onVerify={onInspectEvidence}
            onView={onInspectEvidence}
            onDelete={onDeleteEvidence}
            onAddEvidence={onAddEvidence}
          />
        </div>
      </div>
    </div>
  );
};
