import React from 'react';
import {
  ArrowRight,
  MessageSquare,
  Sparkles,
  PlayCircle,
} from 'lucide-react';
import {
  CriterionId,
  RequirementDefinition,
  ApplicationDeclaration,
  EvidenceFile,
} from '../../../../types/application';
import {
  ITEM_REVIEW_STATUS_META,
  EVIDENCE_REVIEW_STATUS_META,
} from '../../../reviewTokens';
import {
  ReviewWorkspaceState,
  ReviewScopePointer,
  StaffItemReviewStatus,
} from '../../../reviewTypes';
import { getDeclarationReviewState, getScopeReviewRecord } from '../../../reviewSelectors';
import { FileTypeIcon } from '../../../../components/evidence/FileTypeIcon';
import { AiAttentionMarker } from '../../../../features/ai-review-copilot/AiAttentionMarker';
import { AiFinding } from '../../../../features/ai-review-copilot/copilotTypes';
import { AiDeclarationInsightRow } from '../../../../features/ai-review-copilot/AiDeclarationInsightRow';
import { AiEvidenceBadge } from '../../../../features/ai-review-copilot/AiEvidenceBadge';
import {
  getDeclarationAiInsight,
  getEvidenceAiInsight,
} from '../../../../features/ai-review-copilot/demoCopilotFixtures';

export interface CriterionDeclarationCardProps {
  criterionId: CriterionId;
  reqDef: RequirementDefinition;
  decl: ApplicationDeclaration;
  idx: number;
  totalDeclarations: number;
  workspaceState: ReviewWorkspaceState;
  selectedScope: ReviewScopePointer;
  isEvidenceExpanded: boolean;
  canMutate: boolean;
  aiFinding?: AiFinding;
  isGuidedFocus?: boolean;
  onOpenFindingPopover?: (finding: AiFinding, e: React.MouseEvent<HTMLButtonElement>) => void;
  onExpandEvidence: () => void;
  onSelectScope: (scope: ReviewScopePointer) => void;
  onOpenDeclarationReview?: (scope: ReviewScopePointer) => void;
  onQuickUpdateStatus?: (
    scope: ReviewScopePointer,
    status: StaffItemReviewStatus
  ) => void;
  onContinueReviewAfterSupplement: (scope: ReviewScopePointer) => void;
  onOpenRequestSupplement: (scope: ReviewScopePointer, initialDraft?: string) => void;
  onOpenRegulation?: (criterionId: CriterionId, reqId?: string) => void;
  onSaveInternalNote?: (scope: ReviewScopePointer, note: string) => void;
  onOpenEvidenceViewer: (
    evidence: EvidenceFile,
    allScopeEvidence: EvidenceFile[],
    scope: ReviewScopePointer,
    scopeTitle: string,
    declarationTitle: string
  ) => void;
  onOpenFeedback?: (finding: AiFinding) => void;
  onOpenExplainability?: (finding: AiFinding) => void;
}

export const CriterionDeclarationCard: React.FC<CriterionDeclarationCardProps> = ({
  criterionId,
  reqDef,
  decl,
  idx,
  totalDeclarations,
  workspaceState,
  selectedScope,
  isEvidenceExpanded,
  canMutate,
  aiFinding,
  isGuidedFocus = false,
  onOpenFindingPopover,
  onExpandEvidence,
  onSelectScope,
  onOpenDeclarationReview,
  onQuickUpdateStatus,
  onContinueReviewAfterSupplement,
  onOpenRequestSupplement,
  onOpenRegulation,
  onSaveInternalNote,
  onOpenEvidenceViewer,
  onOpenFeedback,
  onOpenExplainability,
}) => {
  const declStatus = getDeclarationReviewState(
    workspaceState,
    reqDef.id,
    decl.id
  );
  const declStatusMeta = ITEM_REVIEW_STATUS_META[declStatus];
  const declRecord = getScopeReviewRecord(
    workspaceState,
    reqDef.id,
    decl.id
  );
  const isDeclSelected =
    selectedScope.requirementId === reqDef.id &&
    selectedScope.declarationId === decl.id;

  const suppDiff = declRecord?.supplementDiff;
  const declEvidenceList = decl.evidence || decl.evidenceFiles || [];
  const visibleEvidence = isEvidenceExpanded
    ? declEvidenceList
    : declEvidenceList.slice(0, 3);
  const hiddenEvidenceCount = declEvidenceList.length - visibleEvidence.length;

  const declInsight = getDeclarationAiInsight(decl.id);

  return (
    <div
      id={`declaration-card-${decl.id}`}
      onClick={() =>
        onSelectScope({
          criterionId,
          requirementId: reqDef.id,
          declarationId: decl.id,
        })
      }
      className={`rounded-[16px] p-4 transition-all cursor-pointer ${
        isGuidedFocus
          ? 'bg-[#F0F8FD] ring-2 ring-[#0D78AE] shadow-md ai-spotlight-active'
          : isDeclSelected
          ? 'bg-[#F0F7FD] ring-2 ring-[#1680DE]'
          : declStatus === 'needs_supplement'
          ? 'bg-[#FFFDF9] hover:bg-[#FEF9EE]'
          : declStatus === 'supplement_returned'
          ? 'bg-[#F5FBFF] hover:bg-[#EBF6FE]'
          : 'bg-[#F5F8FB] hover:bg-[#EEF3F8]'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        <div className="lg:col-span-7 space-y-1.5 min-w-0">
          <div className="flex items-start gap-2">
            {totalDeclarations > 1 && (
              <span className="w-5 h-5 rounded-[6px] bg-white text-[#0F2335] font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5 tabular-nums shadow-xs">
                {idx + 1}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11.5px] text-[#607483] font-medium">Trạng thái:</span>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold border"
                    style={{
                      backgroundColor: declStatusMeta.bgColor,
                      color: declStatusMeta.textColor,
                      borderColor: declStatusMeta.borderColor,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: declStatusMeta.dotColor }}
                    />
                    <span>{declStatusMeta.label}</span>
                  </span>

                  {/* AI Attention Spotlight Marker */}
                  {aiFinding && onOpenFindingPopover && (
                    <AiAttentionMarker
                      finding={aiFinding}
                      onClick={onOpenFindingPopover}
                    />
                  )}
                </div>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2"
                >
                  {declStatus === 'not_reviewed' && canMutate && (
                    <button
                      type="button"
                      onClick={() =>
                        onQuickUpdateStatus?.(
                          {
                            criterionId,
                            requirementId: reqDef.id,
                            declarationId: decl.id,
                          },
                          'viewed'
                        )
                      }
                      title="Đánh dấu đã xem nội dung kê khai"
                      className="px-2 py-1 rounded-[6px] bg-white hover:bg-[#EEF3F8] text-[#526B7C] text-[11px] font-medium border border-[#DCE7EE] cursor-pointer transition-colors"
                    >
                      Đã xem
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenDeclarationReview) {
                        onOpenDeclarationReview({
                          criterionId,
                          requirementId: reqDef.id,
                          declarationId: decl.id,
                        });
                      } else {
                        onSelectScope({
                          criterionId,
                          requirementId: reqDef.id,
                          declarationId: decl.id,
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#1680DE] hover:bg-[#1371C4] active:bg-[#0F5EA5] text-white text-[12px] font-bold shadow-xs transition-colors cursor-pointer border-0 select-none"
                  >
                    <span>Xét kê khai</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              <h4 className="text-[14px] font-bold text-[#172A3A] leading-snug break-words">
                {decl.value}
              </h4>
              {decl.detail && (
                <p className="text-[12.5px] text-[#4A6275] mt-1 break-words">
                  {decl.detail}
                </p>
              )}
              <div className="flex items-center gap-3 flex-wrap text-[12px] text-[#607483] mt-1 tabular-nums">
                {decl.date && (
                  <span>
                    Ngày ghi nhận:{' '}
                    <strong className="font-semibold text-[#334E68]">
                      {decl.date}
                    </strong>
                  </span>
                )}
                <span>·</span>
                <span>Minh chứng · {declEvidenceList.length}</span>
              </div>

              {/* Level 3: Declaration Card Contextual AI Insight */}
              {declInsight && (
                <AiDeclarationInsightRow
                  insight={declInsight}
                  onInspectEvidence={(evId) => {
                    const targetEv =
                      declEvidenceList.find((e) => e.id === evId) ||
                      declEvidenceList[0];
                    if (targetEv) {
                      onOpenEvidenceViewer(
                        targetEv,
                        declEvidenceList,
                        {
                          criterionId,
                          requirementId: reqDef.id,
                          declarationId: decl.id,
                        },
                        reqDef.title,
                        decl.value
                      );
                    }
                  }}
                  onViewRegulation={() =>
                    onOpenRegulation?.(criterionId, reqDef.id)
                  }
                  onInsertInternalNote={(note) =>
                    onSaveInternalNote?.(
                      {
                        criterionId,
                        requirementId: reqDef.id,
                        declarationId: decl.id,
                      },
                      note
                    )
                  }
                  onOpenSupplementWithDraft={(draft) =>
                    onOpenRequestSupplement(
                      {
                        criterionId,
                        requirementId: reqDef.id,
                        declarationId: decl.id,
                      },
                      draft
                    )
                  }
                  onOpenFeedback={
                    onOpenFeedback && aiFinding
                      ? () => onOpenFeedback(aiFinding)
                      : undefined
                  }
                  onOpenExplainability={
                    onOpenExplainability && aiFinding
                      ? () => onOpenExplainability(aiFinding)
                      : undefined
                  }
                  isSpotlighted={isGuidedFocus}
                />
              )}
            </div>
          </div>

          {declRecord?.internalNote && (
            <div className="mt-2.5 px-3 py-2 rounded-[10px] bg-white/90 text-[12px] text-[#334E68] flex items-start gap-2">
              <MessageSquare
                size={13}
                className="text-[#1680DE] shrink-0 mt-0.5"
              />
              <div className="min-w-0">
                <span className="font-bold text-[#0F2335]">
                  Ghi chú nội bộ:{' '}
                </span>
                <span className="break-words">{declRecord.internalNote}</span>
              </div>
            </div>
          )}

          {declRecord?.considerationReason && (
            <div className="mt-2.5 px-3 py-2 rounded-[10px] bg-[#F5F3FF] text-[12px] text-[#5B21B6]">
              <strong className="font-bold">
                Lý do cần xem xét thêm (Nội bộ):{' '}
              </strong>
              <span>{declRecord.considerationReason}</span>
            </div>
          )}

          {suppDiff && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-2.5 p-3 rounded-[12px] bg-[#EAF6FC] space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[12px] font-extrabold text-[#0B64A0] flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>
                    Sinh viên đã gửi bổ sung · {suppDiff.returnedAt}
                  </span>
                </span>

                {declStatus === 'supplement_returned' && canMutate && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onQuickUpdateStatus?.(
                          {
                            criterionId,
                            requirementId: reqDef.id,
                            declarationId: decl.id,
                          },
                          'suitable'
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[7px] bg-[#16A34A] hover:bg-[#15803D] text-white text-[11.5px] font-bold shadow-2xs transition-colors cursor-pointer border-0"
                      title="Xác nhận nội dung bổ sung Đạt"
                    >
                      <span>Đạt sau BS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onQuickUpdateStatus?.(
                          {
                            criterionId,
                            requirementId: reqDef.id,
                            declarationId: decl.id,
                          },
                          'unsuitable'
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[7px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11.5px] font-bold shadow-2xs transition-colors cursor-pointer border-0"
                      title="Đánh giá nội dung bổ sung Chưa đạt"
                    >
                      <span>Chưa đạt</span>
                    </button>
                  </div>
                )}
              </div>

              {suppDiff.explanationNote && (
                <div className="p-2 bg-white rounded-[7px] border border-[#BAE6FD] text-[#0F172A] text-[12px] leading-relaxed">
                  <span className="font-bold text-[#0369A1] block text-[11px] mb-0.5">
                    Giải trình của sinh viên:
                  </span>
                  “{suppDiff.explanationNote}”
                </div>
              )}

              <div className="text-[11.5px] text-[#172A3A] space-y-1">
                {suppDiff.addedEvidenceNames.length > 0 && (
                  <div>
                    <strong className="font-bold text-[#0B64A0]">
                      Mới bổ sung:{' '}
                    </strong>
                    <span className="font-mono font-semibold">
                      {suppDiff.addedEvidenceNames.join(', ')}
                    </span>
                  </div>
                )}
                {suppDiff.fieldChanges.map((fc, fIdx) => (
                  <div key={fIdx}>
                    <strong className="font-bold text-[#0B64A0]">
                      Cập nhật {fc.fieldLabel}:{' '}
                    </strong>
                    <span className="line-through text-[#607483] mr-1">
                      {fc.beforeValue}
                    </span>
                    <span className="font-bold text-[#136F3A]">
                      → {fc.afterValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="lg:col-span-5 space-y-2 min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          {declEvidenceList.length === 0 ? (
            <div className="p-3 rounded-[12px] bg-[#FEF6EB] text-[12px] text-[#B45309] flex items-center justify-between gap-2">
              <span className="font-semibold">Chưa có minh chứng.</span>
              {canMutate && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenRequestSupplement({
                      criterionId,
                      requirementId: reqDef.id,
                      declarationId: decl.id,
                    })
                  }
                  className="font-bold underline hover:text-[#92400E] cursor-pointer"
                >
                  Yêu cầu bổ sung
                </button>
              )}
            </div>
          ) : (
            <>
              {visibleEvidence.map((ev) => {
                const isNewSuppFile =
                  suppDiff?.addedEvidenceIds.includes(ev.id) ||
                  ev.id.includes('supp-new');

                return (
                  <div
                    key={ev.id}
                    className="px-3 py-2 rounded-[10px] bg-white hover:bg-[#F8FBFD] flex items-center justify-between gap-2 transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileTypeIcon
                        fileName={ev.name}
                        fileType={ev.fileType}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            title={ev.name}
                            className="text-[12.5px] font-semibold text-[#172A3A] truncate max-w-[170px]"
                          >
                            {ev.name}
                          </span>
                          {isNewSuppFile && (
                            <span className="px-1.5 py-0.2 rounded bg-[#EAFBF1] text-[#136F3A] text-[10px] font-bold shrink-0">
                              Mới bổ sung
                            </span>
                          )}
                          {(() => {
                            const evRec =
                              workspaceState.evidenceRecords?.[ev.id];
                            const evSt = evRec?.status || 'not_reviewed';
                            if (evSt === 'not_reviewed') return null;
                            const meta = EVIDENCE_REVIEW_STATUS_META[evSt];
                            return (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold shrink-0"
                                style={{
                                  backgroundColor: meta.bgColor,
                                  color: meta.textColor,
                                  border: `1px solid ${meta.borderColor}`,
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: meta.dotColor,
                                  }}
                                />
                                {meta.shortLabel}
                              </span>
                            );
                          })()}

                          {/* Level 4: Individual Evidence Item AI Insight Badge */}
                          {(() => {
                            const evInsight = getEvidenceAiInsight(ev.id);
                            if (!evInsight) return null;
                            return (
                              <AiEvidenceBadge
                                insight={evInsight}
                                onOpenViewer={() => {
                                  onSelectScope({
                                    criterionId,
                                    requirementId: reqDef.id,
                                    declarationId: decl.id,
                                  });
                                  onOpenEvidenceViewer(
                                    ev,
                                    declEvidenceList,
                                    {
                                      criterionId,
                                      requirementId: reqDef.id,
                                      declarationId: decl.id,
                                    },
                                    reqDef.title,
                                    decl.value
                                  );
                                }}
                                onCompareWithDeclaration={() => {
                                  onSelectScope({
                                    criterionId,
                                    requirementId: reqDef.id,
                                    declarationId: decl.id,
                                  });
                                }}
                                onOpenSupplementWithDraft={(draft) => {
                                  onOpenRequestSupplement(
                                    {
                                      criterionId,
                                      requirementId: reqDef.id,
                                      declarationId: decl.id,
                                    },
                                    draft
                                  );
                                }}
                              />
                            );
                          })()}
                        </div>
                        <div className="text-[11px] text-[#607483] uppercase tabular-nums">
                          {ev.fileType} · {ev.uploadedAt || '11/10/2026'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectScope({
                          criterionId,
                          requirementId: reqDef.id,
                          declarationId: decl.id,
                        });
                        onOpenEvidenceViewer(
                          ev,
                          declEvidenceList,
                          {
                            criterionId,
                            requirementId: reqDef.id,
                            declarationId: decl.id,
                          },
                          reqDef.title,
                          decl.value
                        );
                      }}
                      className="text-[11.5px] font-bold text-[#1680DE] hover:underline shrink-0 cursor-pointer"
                    >
                      Xem & xét minh chứng
                    </button>
                  </div>
                );
              })}

              {hiddenEvidenceCount > 0 && (
                <button
                  type="button"
                  onClick={onExpandEvidence}
                  className="text-[11.5px] font-bold text-[#1680DE] hover:underline pl-1 cursor-pointer"
                >
                  +{hiddenEvidenceCount} minh chứng khác
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
