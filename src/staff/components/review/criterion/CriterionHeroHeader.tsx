import React from 'react';
import { BookOpen, Eye, CheckCircle2 } from 'lucide-react';
import { CriterionId, EvidenceFile } from '../../../../types/application';
import {
  CriterionToken,
  CRITERION_REVIEW_STATUS_META,
} from '../../../reviewTokens';
import {
  ReviewScopePointer,
  StaffCriterionReviewStatus,
} from '../../../reviewTypes';
import { VolunteerQuantitativeAggregation } from '../../../reviewSelectors';

export interface CriterionHeroHeaderProps {
  criterionId: CriterionId;
  criterionToken: CriterionToken;
  criterionStatus: StaffCriterionReviewStatus;
  volunteerAgg: VolunteerQuantitativeAggregation | null;
  allCriterionEvidence: {
    evidence: EvidenceFile;
    requirementId: string;
    requirementTitle: string;
    declarationId: string;
    declarationTitle: string;
  }[];
  canMutate: boolean;
  onOpenRegulation: (criterionId: CriterionId, reqId?: string) => void;
  onOpenEvidenceViewer: (
    evidence: EvidenceFile,
    allScopeEvidence: EvidenceFile[],
    scope: ReviewScopePointer,
    scopeTitle: string,
    declarationTitle: string
  ) => void;
  onCompleteCriterion: (criterionId: CriterionId) => void;
  onReopenCriterion?: (criterionId: CriterionId) => void;
}

export const CriterionHeroHeader: React.FC<CriterionHeroHeaderProps> = ({
  criterionId,
  criterionToken,
  criterionStatus,
  volunteerAgg,
  allCriterionEvidence,
  canMutate,
  onOpenRegulation,
  onOpenEvidenceViewer,
  onCompleteCriterion,
  onReopenCriterion,
}) => {
  const statusMeta = CRITERION_REVIEW_STATUS_META[criterionStatus];

  return (
    <section
      aria-label="Thông tin tiêu chí và quy định áp dụng"
      className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(23,42,58,0.04)]"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-2.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold"
              style={{
                backgroundColor:
                  criterionToken.number === 3
                    ? '#FEF3C7'
                    : criterionToken.number === 1
                    ? '#E8F8F0'
                    : criterionToken.number === 2
                    ? '#F3E8FF'
                    : criterionToken.number === 4
                    ? '#E0F2FE'
                    : '#E8F8F0',
                color:
                  criterionToken.number === 3
                    ? '#D97706'
                    : criterionToken.number === 1
                    ? '#10B981'
                    : criterionToken.number === 2
                    ? '#8B5CF6'
                    : criterionToken.number === 4
                    ? '#0284C7'
                    : '#10B981',
              }}
            >
              0{criterionToken.number} · {criterionToken.name}
            </span>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold"
              style={{
                backgroundColor: statusMeta.bgColor,
                color: statusMeta.textColor,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: statusMeta.dotColor }}
              />
              <span>{statusMeta.label}</span>
            </span>

            {volunteerAgg && (
              <span className="text-[12px] font-semibold text-[#1E5635] bg-[#EAFBF1] px-3 py-1 rounded-full tabular-nums">
                Tổng hợp kê khai: {volunteerAgg.summaryText}
              </span>
            )}
          </div>

          <p className="text-[13.5px] text-[#607483] leading-relaxed max-w-[820px]">
            Xem các yêu cầu, kê khai và minh chứng của sinh viên. Nội dung do sinh viên kê khai được giữ nguyên vẹn (chỉ xem).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 pt-0.5 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => onOpenRegulation(criterionId)}
            className="h-[42px] px-3.5 rounded-[12px] bg-[#F5F7FA] hover:bg-[#EEF3F7] text-[#172A3A] font-semibold text-[13px] inline-flex items-center gap-2 transition-colors cursor-pointer border-0"
          >
            <BookOpen size={15} className="text-[#607483]" />
            <span>Xem quy định áp dụng</span>
          </button>

          {allCriterionEvidence.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const first = allCriterionEvidence[0];
                onOpenEvidenceViewer(
                  first.evidence,
                  allCriterionEvidence.map((item) => item.evidence),
                  {
                    criterionId,
                    requirementId: first.requirementId,
                    declarationId: first.declarationId,
                  },
                  first.requirementTitle,
                  first.declarationTitle
                );
              }}
              className="h-[42px] px-3.5 rounded-[12px] bg-[#F5F7FA] hover:bg-[#EEF3F7] text-[#526B7C] font-semibold text-[13px] inline-flex items-center gap-2 transition-colors cursor-pointer border-0"
            >
              <Eye size={15} className="text-[#607483]" />
              <span>Mở toàn bộ minh chứng ({allCriterionEvidence.length})</span>
            </button>
          )}

          {criterionStatus === 'completed' ? (
            <div className="flex items-center gap-2">
              <span className="h-[42px] px-3.5 rounded-[12px] bg-[#EAFBF1] text-[#136F3A] font-bold text-[13px] inline-flex items-center gap-2 border border-[#C3EDD2]">
                <CheckCircle2 size={16} />
                <span>Đã hoàn tất xét tiêu chí</span>
              </span>
              {canMutate && onReopenCriterion && (
                <button
                  type="button"
                  onClick={() => onReopenCriterion(criterionId)}
                  className="text-[11.5px] font-semibold text-[#607483] hover:text-[#0F2335] underline cursor-pointer px-1"
                  title="Mở lại tiêu chí này để chỉnh sửa kết quả thẩm định"
                >
                  Mở lại
                </button>
              )}
            </div>
          ) : canMutate ? (
            <button
              type="button"
              onClick={() => onCompleteCriterion(criterionId)}
              className="h-[42px] px-4 rounded-[12px] bg-[#1680DE] hover:bg-[#1371C4] text-white font-bold text-[13px] inline-flex items-center gap-2 transition-all cursor-pointer border-0 shadow-sm"
              title="Xác nhận hoàn tất xét các nội dung trong tiêu chí này"
            >
              <CheckCircle2 size={16} />
              <span>Hoàn tất xét tiêu chí</span>
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
};
