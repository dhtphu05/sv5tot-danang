import {
  isMatchingDeclarationId,
  isMatchingRequirementId,
  isSupplementActionAllowed,
} from '../supplement/supplementHelpers';
import React from 'react';
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  ApplicationRequirement,
  ApplicationDeclaration,
  ApplicationEvidence,
} from '../../demo/fixtures/studentApplication';
import { CriterionDefinition, RequirementStatus } from '../../tokens';
import { StatusChip } from '../status/StatusChip';
import { EvidenceCell } from './EvidenceCell';
import { ExpandedRequirement } from './ExpandedRequirement';
import { SupplementRequest, SupplementChangeRecord } from '../supplement/supplementTypes';

export interface RequirementRowProps {
  requirement: ApplicationRequirement;
  criterionToken?: CriterionDefinition;
  hasParentGroup?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  isExpanded: boolean;
  isHighlighted?: boolean;
  isAlternativeOption?: boolean;
  isGroupSatisfied?: boolean;
  groupType?: string;
  onToggleExpand: () => void;
  onUpdateDeclaration?: (
    reqId: string,
    declarationId: string,
    updated: { value: string; detail?: string }
  ) => void;
  onAddDeclaration?: (reqId: string, newDecl: ApplicationDeclaration) => void;
  onDeleteDeclaration?: (reqId: string, declId: string) => void;
  onOpenRegulation: (criterionId: string, sectionId?: string) => void;
  onInspectEvidence: (file: ApplicationEvidence) => void;
  onAddEvidence?: (reqId: string, declId: string, files: FileList | File[]) => void;
  onDeleteEvidence?: (reqId: string, declId: string, fileId: string) => void;
  onOpenAddDeclaration?: (reqId: string) => void;
  onOpenEditDeclaration?: (reqId: string, decl: ApplicationDeclaration) => void;
  onOpenAddEvidenceModal?: (reqId: string, declId: string, declTitle: string) => void;
  readOnly?: boolean;
  isSupplementMode?: boolean;
  supplementRequest?: SupplementRequest | null;
  supplementChanges?: SupplementChangeRecord | null;
  isSupplementWindowClosed?: boolean;
  isSupplementSubmitting?: boolean;
  onSendSupplement?: (requestId: string, explanationNote?: string) => void;
  onUpdateExplanation?: (requestId: string, explanation: string) => void;
  customReviewStatus?: { status: RequirementStatus; customLabel?: string };
  reviewerActionSlot?: React.ReactNode;
  renderDeclarationReviewerSlot?: (
    req: ApplicationRequirement,
    decl: ApplicationDeclaration,
    criterionId: string
  ) => React.ReactNode;
  className?: string;
}

function getEvidenceRequirementDescription(req: ApplicationRequirement): string {
  const code = (req.code || '').toUpperCase();
  if (code === 'TC1.1') {
    return 'Bảng điểm đánh giá kết quả rèn luyện năm học có xác nhận của nhà trường.';
  }
  if (code === 'TC1.2') {
    return 'Văn bản hoặc xác nhận của nhà trường/đơn vị không vi phạm pháp luật, quy chế.';
  }
  if (code === 'TC2.1') {
    return 'Bảng điểm trung bình chung học tập cả năm học có xác nhận của nhà trường.';
  }
  if (code.startsWith('TC3')) {
    return 'Bản scan Giấy chứng nhận “Sinh viên khỏe” hoặc giấy chứng nhận huy chương/giải thưởng thể thao.';
  }
  if (code.startsWith('TC4')) {
    return 'Giấy chứng nhận tham gia hoạt động tình nguyện, hiến máu hoặc giấy khen công tác tình nguyện.';
  }
  if (code === 'TC5.1') {
    return 'Bản scan chứng chỉ ngoại ngữ hoặc bảng điểm học phần ngoại ngữ có xác nhận của trường.';
  }
  if (req.id === 'other-achievements-general') {
    return 'Bản scan bằng khen, giấy khen, giấy chứng nhận thành tích tiêu biểu khác (nếu có).';
  }
  return 'Bản scan giấy chứng nhận, bằng khen, giấy khen hoặc xác nhận hợp lệ của đơn vị cấp.';
}

export const RequirementRow: React.FC<RequirementRowProps> = ({
  requirement,
  hasParentGroup = false,
  isExpanded,
  isHighlighted = false,
  isAlternativeOption = false,
  isGroupSatisfied = false,
  groupType,
  onToggleExpand,
  onUpdateDeclaration,
  onAddDeclaration,
  onDeleteDeclaration,
  onOpenRegulation,
  onInspectEvidence,
  onAddEvidence,
  onDeleteEvidence,
  onOpenAddDeclaration,
  onOpenEditDeclaration,
  onOpenAddEvidenceModal,
  readOnly = false,
  isSupplementMode = false,
  supplementRequest = null,
  supplementChanges = null,
  isSupplementWindowClosed = false,
  isSupplementSubmitting = false,
  onSendSupplement,
  reviewerActionSlot,
  renderDeclarationReviewerSlot,
  className = '',
}) => {
  const allEvidenceFiles: ApplicationEvidence[] = requirement.declarations.flatMap(
    (d) => d.evidenceFiles || []
  );

  const primaryDecl = requirement.declarations[0];
  const declarationCount = requirement.declarations.length;
  const isRepeatable =
    requirement.declarationMultiplicity === 'MULTIPLE' ||
    requirement.allowMultipleDeclarations ||
    groupType === 'REPEATABLE_COLLECTION' ||
    requirement.id === 'other-achievements-general';

  const hasFlaggedEvidence = allEvidenceFiles.some((f) => f.status === 'needs_verification');
  const hasActiveSupplementForRow = Boolean(
    isSupplementMode &&
      supplementRequest &&
      supplementRequest.status === 'active' &&
      (isMatchingRequirementId(supplementRequest.requirementId, requirement.id) ||
        supplementRequest.scopeLevel === 'criterion' ||
        (supplementRequest.declarationId &&
          requirement.declarations.some((d) =>
            isMatchingDeclarationId(supplementRequest.declarationId, d.id)
          )))
  );

  const canEditDeclarations = !readOnly || hasActiveSupplementForRow;
  const canManageRowEvidence =
    !readOnly ||
    (hasActiveSupplementForRow &&
      !isSupplementWindowClosed &&
      isSupplementActionAllowed(supplementRequest?.allowedActions, 'addEvidence'));

  const getRowStatus = (): { status: RequirementStatus; customLabel?: string } => {
    if (hasActiveSupplementForRow) {
      return { status: 'requires_supplement', customLabel: 'Cần bổ sung' };
    }
    if (readOnly && requirement.reviewStatus) {
      if (
        requirement.reviewStatus === 'Đã được xem xét' ||
        requirement.reviewStatus === 'Đã hoàn tất xét'
      ) {
        return { status: 'review_completed', customLabel: requirement.reviewStatus };
      }
      if (requirement.reviewStatus === 'Đang xét') {
        return { status: 'reviewing', customLabel: 'Đang xét' };
      }
      if (requirement.reviewStatus === 'Cần bổ sung') {
        return { status: 'requires_supplement', customLabel: 'Cần bổ sung' };
      }
      if (
        requirement.reviewStatus === 'Đang chờ tiếp tục xét' ||
        requirement.reviewStatus === 'Đã gửi bổ sung'
      ) {
        return { status: 'awaiting_officer', customLabel: requirement.reviewStatus };
      }
      return { status: 'reviewing', customLabel: requirement.reviewStatus };
    }
    if (declarationCount === 0) {
      if (isAlternativeOption && isGroupSatisfied) {
        return { status: 'can_supplement', customLabel: 'Tùy chọn khác' };
      }
      return { status: 'undeclared', customLabel: 'Chưa kê khai' };
    }
    if (requirement.status === 'needs_verification' || hasFlaggedEvidence) {
      return { status: 'needs_verification', customLabel: 'Cần kiểm tra' };
    }
    if (allEvidenceFiles.length > 0) {
      return { status: 'has_evidence', customLabel: 'Có minh chứng' };
    }
    return { status: 'declared', customLabel: 'Đã kê khai' };
  };

  const rowStatusConfig = getRowStatus();
  const evidenceGuideText = getEvidenceRequirementDescription(requirement);
  const specificCriteriaDetail =
    requirement.regulationSnippet || requirement.ruleHelper || '';

  return (
    <div
      id={`req-row-${requirement.id}`}
      className={`group/row transition-colors duration-150 border-b border-[#DFE5EC] last:border-b-0 scroll-anchor-target ${
        hasActiveSupplementForRow
          ? 'bg-[#FFFDF5] shadow-[inset_3px_0_0_0_#D97706]'
          : isHighlighted
          ? 'bg-[#ECFDF5]/60 shadow-[inset_3px_0_0_0_#10A37F]'
          : isExpanded
          ? 'bg-[#F8FAFC]/75'
          : 'bg-white hover:bg-[#F8FAFC]/60'
      } ${className}`}
    >
      {/* Mobile Structured View (< 768px) */}
      <div className="block md:hidden p-3.5 space-y-2.5 select-none">
        <div
          onClick={onToggleExpand}
          className="flex items-start justify-between gap-2 cursor-pointer"
        >
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="text-[#64748B] shrink-0 mt-0.5">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            <div className="min-w-0">
              <span className="text-[13px] font-semibold text-[#0F172A] leading-relaxed block">
                {requirement.code && (
                  <span className="text-[#0066CC] font-bold mr-1.5">{requirement.code}.</span>
                )}
                {requirement.title}
              </span>
              {specificCriteriaDetail && (
                <span className="text-[11.5px] text-[#475569] block mt-0.5 leading-snug">
                  {specificCriteriaDetail}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] p-2.5 rounded-[4px] border border-[#E2E8F0] space-y-1.5">
          {declarationCount === 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#64748B]">Chưa kê khai</span>
              {canEditDeclarations && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenAddDeclaration) onOpenAddDeclaration(requirement.id);
                    else onToggleExpand();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#007EE5] text-white text-[11.5px] font-semibold cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Kê khai</span>
                </button>
              )}
            </div>
          ) : (
            requirement.declarations.map((decl, idx) => (
              <div key={decl.id} className="flex items-start justify-between gap-2 text-[12.5px]">
                <span className="text-[#0066CC] font-medium break-words">
                  {idx + 1}. {decl.value}
                </span>
                {canEditDeclarations && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {onOpenEditDeclaration && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditDeclaration(requirement.id, decl);
                        }}
                        className="text-[#007EE5] p-1 cursor-pointer"
                        aria-label="Chỉnh sửa kê khai"
                      >
                        <Pencil size={12.5} />
                      </button>
                    )}
                    {!isSupplementMode && onDeleteDeclaration && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDeclaration(requirement.id, decl.id);
                        }}
                        className="text-[#DC2626] p-1 cursor-pointer"
                        aria-label="Xóa kê khai"
                      >
                        <Trash2 size={12.5} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <EvidenceCell
            files={allEvidenceFiles}
            editable={!readOnly}
            isDeclarationEmpty={declarationCount === 0}
            onFileClick={onInspectEvidence}
            onExpandListClick={onToggleExpand}
          />
          {reviewerActionSlot ? (
            reviewerActionSlot
          ) : (
            <StatusChip
              status={rowStatusConfig.status}
              customLabel={rowStatusConfig.customLabel}
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Desktop 3-Subcolumn Administrative Row (Cols 3, 4, 5 inside CriterionSection) */}
      <div
        onClick={onToggleExpand}
        className="hidden md:grid admin-dossier-row-grid items-stretch cursor-pointer min-h-[54px] select-none"
      >
        {/* Col 3: Tiêu chuẩn cụ thể */}
        <div className="px-4 py-3 border-r border-[#DFE5EC] flex items-start gap-2 min-w-0">
          <span className="text-[#64748B] group-hover/row:text-[#0F172A] mt-1 shrink-0">
            {isExpanded ? (
              <ChevronDown size={13} strokeWidth={2.1} />
            ) : (
              <ChevronRight size={13} strokeWidth={2.1} />
            )}
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="text-[12.5px] font-semibold text-[#0F172A] leading-relaxed break-words">
              {requirement.code && (
                <span className="text-[#0066CC] font-bold mr-1.5">{requirement.code}.</span>
              )}
              {requirement.title}
            </div>
            {specificCriteriaDetail && (
              <p className="text-[12px] text-[#475569] leading-relaxed break-words font-normal">
                {specificCriteriaDetail}
              </p>
            )}
          </div>
        </div>

        {/* Col 4: Yêu cầu minh chứng + Tệp đã đính kèm */}
        <div
          className="px-3.5 py-3 border-r border-[#DFE5EC] flex flex-col justify-start gap-2 min-w-0"
          onClick={(e) => {
            if (allEvidenceFiles.length > 0) e.stopPropagation();
          }}
        >
          <p className="text-[12px] text-[#334155] leading-relaxed break-words">
            {evidenceGuideText}
          </p>
          {(allEvidenceFiles.length > 0 || (canManageRowEvidence && declarationCount > 0)) && (
            <div onClick={(e) => e.stopPropagation()}>
              <EvidenceCell
                files={allEvidenceFiles}
                editable={canManageRowEvidence}
                isDeclarationEmpty={declarationCount === 0}
                onFileClick={onInspectEvidence}
                onExpandListClick={onToggleExpand}
                onAddClick={
                  canManageRowEvidence && primaryDecl && onOpenAddEvidenceModal
                    ? () => {
                        onOpenAddEvidenceModal(
                          requirement.id,
                          primaryDecl.id,
                          primaryDecl.value
                        );
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>

        {/* Col 5: Kết quả (+ trigger / Numbered declarations with Edit & Delete / Reviewer Slot) */}
        <div
          className={`px-3.5 py-3 flex flex-col min-w-0 ${
            declarationCount === 0 && !reviewerActionSlot ? 'justify-center' : 'justify-start'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {reviewerActionSlot ? (
            <div className="space-y-2">
              {declarationCount > 0 ? (
                <div className="space-y-1">
                  {requirement.declarations.map((decl, idx) => (
                    <div
                      key={decl.id}
                      onClick={onToggleExpand}
                      className="text-[12px] text-[#0066CC] hover:underline font-medium leading-snug break-words cursor-pointer"
                    >
                      {idx + 1}. {decl.value}
                      {decl.detail ? (
                        <span className="text-[#64748B] font-normal"> ({decl.detail})</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[12px] text-[#94A3B8] italic">Chưa kê khai</div>
              )}
              <div className="flex items-center justify-end">{reviewerActionSlot}</div>
            </div>
          ) : declarationCount === 0 ? (
            <div className="flex items-center justify-center w-full h-full">
              {canEditDeclarations ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAddDeclaration) {
                      onOpenAddDeclaration(requirement.id);
                    } else {
                      onToggleExpand();
                    }
                  }}
                  title="Kê khai nội dung này"
                  aria-label={`Kê khai ${requirement.title}`}
                  className="w-7 h-7 rounded-[4px] text-[#007EE5] hover:text-white hover:bg-[#10A37F] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus size={17} strokeWidth={2.5} />
                </button>
              ) : (
                <StatusChip
                  status={rowStatusConfig.status}
                  customLabel={rowStatusConfig.customLabel}
                  size="sm"
                />
              )}
            </div>
          ) : (
            <div className="space-y-1.5 w-full">
              {requirement.declarations.map((decl, idx) => (
                <div
                  key={decl.id}
                  className="flex items-start justify-between gap-2 text-[12.5px] leading-snug group/decl"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (canEditDeclarations && onOpenEditDeclaration) {
                        onOpenEditDeclaration(requirement.id, decl);
                      } else {
                        onToggleExpand();
                      }
                    }}
                    className="text-left text-[#0066CC] hover:underline font-medium break-words min-w-0 flex-1 cursor-pointer"
                    title={decl.detail ? `${decl.value} — ${decl.detail}` : decl.value}
                  >
                    <span>
                      {idx + 1}. {decl.value}
                    </span>
                    {decl.detail && (
                      <span className="block text-[11px] text-[#64748B] font-normal mt-0.5">
                        {decl.detail}
                      </span>
                    )}
                  </button>

                  {canEditDeclarations && (
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {onOpenEditDeclaration && (
                        <button
                          type="button"
                          onClick={() => onOpenEditDeclaration(requirement.id, decl)}
                          title="Chỉnh sửa kê khai"
                          aria-label="Chỉnh sửa kê khai"
                          className="p-1 rounded-[3px] text-[#007EE5] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                        >
                          <Pencil size={12.5} />
                        </button>
                      )}
                      {!isSupplementMode && onDeleteDeclaration && (
                        <button
                          type="button"
                          onClick={() => onDeleteDeclaration(requirement.id, decl.id)}
                          title="Xóa kê khai"
                          aria-label="Xóa kê khai"
                          className="p-1 rounded-[3px] text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                        >
                          <Trash2 size={12.5} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add extra declaration (+) button for repeatable items, matching screenshot */}
              {canEditDeclarations && isRepeatable && (
                <div className="pt-1 flex justify-center border-t border-dashed border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAddDeclaration) {
                        onOpenAddDeclaration(requirement.id);
                      } else {
                        onToggleExpand();
                      }
                    }}
                    title="Thêm kê khai mới"
                    className="w-6 h-6 rounded-[4px] text-[#007EE5] hover:text-white hover:bg-[#10A37F] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                  </button>
                </div>
              )}

              {readOnly && (
                <div className="pt-1 flex justify-end">
                  <StatusChip
                    status={rowStatusConfig.status}
                    customLabel={rowStatusConfig.customLabel}
                    size="sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Inline Detail Band (Preserves full inline supplement & multi-evidence workspace) */}
      {isExpanded && (
        <div className="border-t border-[#DFE5EC] bg-[#F8FAFC] py-3 min-w-0 overflow-hidden">
          <ExpandedRequirement
            requirement={requirement}
            hasParentGroup={hasParentGroup}
            onUpdateDeclaration={onUpdateDeclaration}
            onAddDeclaration={onAddDeclaration}
            onDeleteDeclaration={onDeleteDeclaration}
            onOpenRegulation={onOpenRegulation}
            onInspectEvidence={onInspectEvidence}
            onAddEvidence={onAddEvidence}
            onDeleteEvidence={onDeleteEvidence}
            onOpenAddDeclaration={onOpenAddDeclaration}
            onOpenEditDeclaration={onOpenEditDeclaration}
            onOpenAddEvidenceModal={onOpenAddEvidenceModal}
            readOnly={readOnly}
            isSupplementMode={isSupplementMode}
            supplementRequest={supplementRequest}
            supplementChanges={supplementChanges}
            isSupplementWindowClosed={isSupplementWindowClosed}
            isSupplementSubmitting={isSupplementSubmitting}
            onSendSupplement={onSendSupplement}
            reviewerActionSlot={reviewerActionSlot}
            renderDeclarationReviewerSlot={renderDeclarationReviewerSlot}
          />
        </div>
      )}
    </div>
  );
};
