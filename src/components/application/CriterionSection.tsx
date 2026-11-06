import {
  isMatchingDeclarationId,
  isMatchingRequirementId,
} from '../supplement/supplementHelpers';
import React, { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import {
  ApplicationCriterion,
  ApplicationRequirement,
  ApplicationDeclaration,
  ApplicationEvidence,
} from '../../demo/fixtures/studentApplication';
import { RequirementRow } from './RequirementRow';
import { RequirementGroupHeader } from './RequirementGroupHeader';
import { CRITERIA, RequirementStatus } from '../../tokens';
import { StatusChip } from '../status/StatusChip';
import { SupplementRequest, SupplementChangeRecord } from '../supplement/supplementTypes';

export interface CriterionSectionProps {
  criterion: ApplicationCriterion;
  isExpanded: boolean;
  onToggleExpand: () => void;
  expandedRowId?: string | null;
  expandedRowMap?: Record<string, boolean>;
  highlightedRequirementId?: string | null;
  onToggleRowExpand: (reqId: string) => void;
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
  supplementRequests?: SupplementRequest[];
  supplementChangesMap?: Record<string, SupplementChangeRecord>;
  isSupplementWindowClosed?: boolean;
  isSupplementSubmitting?: boolean;
  onSendSupplement?: (requestId: string, explanationNote?: string) => void;
  onUpdateExplanation?: (requestId: string, explanation: string) => void;
  customStatusLabel?: string;
  customStatusVariant?: RequirementStatus;
  requirementReviewStatuses?: Record<
    string,
    { status: RequirementStatus; customLabel?: string }
  >;
  renderRowReviewerSlot?: (
    req: ApplicationRequirement,
    criterionId: string
  ) => React.ReactNode;
  renderDeclarationReviewerSlot?: (
    req: ApplicationRequirement,
    decl: ApplicationDeclaration,
    criterionId: string
  ) => React.ReactNode;
  renderCriterionConclusionSlot?: (criterionId: string) => React.ReactNode;
}

export const CriterionSection: React.FC<CriterionSectionProps> = ({
  criterion,
  isExpanded,
  onToggleExpand,
  expandedRowId,
  expandedRowMap,
  highlightedRequirementId = null,
  onToggleRowExpand,
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
  supplementRequests = [],
  supplementChangesMap = {},
  isSupplementWindowClosed = false,
  isSupplementSubmitting = false,
  onSendSupplement,
  customStatusLabel,
  customStatusVariant,
  requirementReviewStatuses,
  renderRowReviewerSlot,
  renderDeclarationReviewerSlot,
  renderCriterionConclusionSlot,
}) => {
  const isOtherAchievements = (criterion.id as string) === 'other_achievements';
  const token =
    CRITERIA[criterion.id] ||
    (isOtherAchievements
      ? ({
          id: 'integration',
          number: 6,
          name: 'Thành tích khác',
          accentColor: '#0D9488',
          accentSoft: 'rgba(13, 148, 136, 0.10)',
          bgTint: '#F8FAFC',
        } as any)
      : undefined);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const criterionRequests = supplementRequests.filter(
    (r) =>
      r.criterionId === criterion.id ||
      criterion.requirements.some(
        (req) =>
          isMatchingRequirementId(r.requirementId, req.id) ||
          (r.declarationId &&
            req.declarations?.some((d) => isMatchingDeclarationId(r.declarationId, d.id)))
      )
  );
  const hasActiveSupplement = criterionRequests.some((r) => r.status === 'active');

  const hasDeclaredItems = criterion.requirements.some(
    (r) => r.declarations && r.declarations.length > 0
  );

  const resolvedStatusLabel =
    customStatusLabel ||
    (criterion.statusLabel &&
    criterion.statusLabel !== 'Chưa kê khai' &&
    criterion.statusLabel !== 'Đã kê khai'
      ? criterion.statusLabel
      : hasDeclaredItems
      ? 'Đã kê khai'
      : 'Chưa kê khai');

  const getCriterionStatus = (label: string): RequirementStatus => {
    if (label === 'Chưa kê khai' || label === 'Chưa có kê khai') return 'undeclared';
    if (label === 'Đã được xem xét' || label === 'Đã hoàn tất xét')
      return 'review_completed';
    if (label === 'Đang xét') return 'reviewing';
    if (
      label === 'Cần bổ sung' ||
      label === 'Có thể kiểm tra thêm' ||
      label === 'Có thể bổ sung'
    )
      return 'requires_supplement';
    if (
      label === 'Đang chờ tiếp tục xét' ||
      label === 'Đã gửi bổ sung' ||
      label === 'Chờ cán bộ kiểm tra'
    )
      return 'awaiting_officer';
    if (label === 'Cần bạn kiểm tra' || label === 'Cần kiểm tra')
      return 'needs_verification';
    return 'declared';
  };

  const getCriterionProgressSummary = () => {
    if (isOtherAchievements) {
      const allDecls = criterion.requirements.flatMap((r) => r.declarations || []);
      return allDecls.length > 0 ? `${allDecls.length} thành tích` : 'Không bắt buộc';
    }
    if (criterion.id === 'volunteer') {
      const volActReq = criterion.requirements.find(
        (r) => r.id === 'volunteer-activities'
      );
      const volAwardReq = criterion.requirements.find((r) => r.id === 'volunteer-award');
      const awardCount = volAwardReq?.declarations?.length || 0;
      const actDecls = volActReq?.declarations || [];

      if (awardCount > 0 && actDecls.length === 0) {
        return `${awardCount} giấy khen`;
      }

      let totalDays = 0;
      for (const d of actDecls) {
        const text = `${d.value} ${d.detail || ''} ${d.metadata?.duration || ''}`.toLowerCase();
        if (
          d.metadata?.volActivityType === 'blood_donation' ||
          text.includes('hiến máu') ||
          text.includes('hien mau')
        ) {
          totalDays += 1;
        } else if (d.metadata?.days || d.metadata?.volDaysCount) {
          const parsed = parseInt(
            d.metadata.days || d.metadata.volDaysCount || '1',
            10
          );
          totalDays += isNaN(parsed) ? 1 : parsed;
        } else {
          const match = text.match(/(\d+)\s*ngày/);
          totalDays += match ? parseInt(match[1], 10) : 1;
        }
      }
      return `${totalDays}/5 ngày TN${awardCount > 0 ? ` + ${awardCount} GK` : ''}`;
    }

    const declaredCount = criterion.requirements.filter(
      (r) => r.declarations && r.declarations.length > 0
    ).length;
    return `${declaredCount} mục đã khai`;
  };

  const progressSummary = getCriterionProgressSummary();

  const getReqSupplementProps = (req: ApplicationRequirement) => {
    let reqSupplement: SupplementRequest | null | undefined = criterionRequests.find(
      (r) => {
        if (r.status !== 'active') return false;
        if (isMatchingRequirementId(r.requirementId, req.id)) return true;
        if (
          r.declarationId &&
          req.declarations?.some((d) => isMatchingDeclarationId(r.declarationId, d.id))
        )
          return true;
        return false;
      }
    );

    if (!reqSupplement) {
      reqSupplement = criterionRequests.find(
        (r) => r.status === 'active' && r.scopeLevel === 'criterion'
      );
    }

    if (!reqSupplement) {
      reqSupplement =
        criterionRequests.find((r) => {
          if (isMatchingRequirementId(r.requirementId, req.id)) return true;
          if (
            r.declarationId &&
            req.declarations?.some((d) => isMatchingDeclarationId(r.declarationId, d.id))
          )
            return true;
          return false;
        }) ||
        criterionRequests.find((r) => r.scopeLevel === 'criterion') ||
        null;
    }

    const reqChanges = reqSupplement
      ? supplementChangesMap[reqSupplement.id] || null
      : null;
    return { reqSupplement, reqChanges };
  };

  const renderRequirementsStack = () => {
    if (!isExpanded) {
      return (
        <div
          onClick={onToggleExpand}
          className="px-4 py-3.5 bg-[#F8FAFC]/60 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F1F5F9] transition-colors"
        >
          <span className="text-[12.5px] text-[#475569] font-medium">
            Đang thu gọn ({progressSummary}) — Nhấn để mở chi tiết các tiêu chuẩn của mục{' '}
            <strong className="text-[#0F172A]">{criterion.name}</strong>
          </span>
          <StatusChip
            status={customStatusVariant || getCriterionStatus(resolvedStatusLabel)}
            customLabel={resolvedStatusLabel}
            size="sm"
          />
        </div>
      );
    }

    return (
      <div className="bg-white">
        {criterion.groups && criterion.groups.length > 0 ? (
          <div>
            {criterion.groups.map((group) => {
              const isGroupCollapsed = !!collapsedGroups[group.id];
              const isAtLeastNOrOptional =
                group.groupType === 'AT_LEAST_N' || group.groupType === 'OPTIONAL';
              const declaredCountInGroup = group.requirements.filter(
                (r) => r.declarations && r.declarations.length > 0
              ).length;
              const isGroupSatisfied =
                group.groupType === 'AT_LEAST_N'
                  ? declaredCountInGroup >= (group.minSelections || 1)
                  : group.groupType === 'OPTIONAL';

              return (
                <div
                  key={group.id}
                  className="border-b border-[#DFE5EC] last:border-b-0"
                >
                  <RequirementGroupHeader
                    group={group}
                    criterionToken={token}
                    isCollapsed={isGroupCollapsed}
                    onToggleCollapse={() => toggleGroupCollapse(group.id)}
                  />

                  {!isGroupCollapsed && (
                    <div>
                      {group.requirements.map((req, reqIdx) => {
                        const { reqSupplement, reqChanges } = getReqSupplementProps(req);
                        return (
                          <RequirementRow
                            key={req.id}
                            requirement={req}
                            criterionToken={token}
                            hasParentGroup={true}
                            isAlternativeOption={isAtLeastNOrOptional}
                            isGroupSatisfied={isGroupSatisfied}
                            groupType={group.groupType}
                            isFirstInGroup={reqIdx === 0}
                            isLastInGroup={reqIdx === group.requirements.length - 1}
                            isExpanded={
                              expandedRowMap
                                ? !!expandedRowMap[req.id]
                                : expandedRowId === req.id
                            }
                            isHighlighted={highlightedRequirementId === req.id}
                            onToggleExpand={() => onToggleRowExpand(req.id)}
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
                            supplementRequest={reqSupplement}
                            supplementChanges={reqChanges}
                            isSupplementWindowClosed={isSupplementWindowClosed}
                            isSupplementSubmitting={isSupplementSubmitting}
                            onSendSupplement={onSendSupplement}
                            customReviewStatus={requirementReviewStatuses?.[req.id]}
                            reviewerActionSlot={
                              renderRowReviewerSlot
                                ? renderRowReviewerSlot(req, criterion.id)
                                : undefined
                            }
                            renderDeclarationReviewerSlot={renderDeclarationReviewerSlot}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {criterion.requirements.map((req) => {
              const { reqSupplement, reqChanges } = getReqSupplementProps(req);
              return (
                <RequirementRow
                  key={req.id}
                  requirement={req}
                  criterionToken={token}
                  hasParentGroup={false}
                  isExpanded={
                    expandedRowMap ? !!expandedRowMap[req.id] : expandedRowId === req.id
                  }
                  isHighlighted={highlightedRequirementId === req.id}
                  onToggleExpand={() => onToggleRowExpand(req.id)}
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
                  supplementRequest={reqSupplement}
                  supplementChanges={reqChanges}
                  isSupplementWindowClosed={isSupplementWindowClosed}
                  isSupplementSubmitting={isSupplementSubmitting}
                  onSendSupplement={onSendSupplement}
                  customReviewStatus={requirementReviewStatuses?.[req.id]}
                  reviewerActionSlot={
                    renderRowReviewerSlot
                      ? renderRowReviewerSlot(req, criterion.id)
                      : undefined
                  }
                  renderDeclarationReviewerSlot={renderDeclarationReviewerSlot}
                />
              );
            })}
          </div>
        )}

        {renderCriterionConclusionSlot && (
          <div className="border-t border-[#DFE5EC]">
            {renderCriterionConclusionSlot(criterion.id)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id={`criterion-section-${criterion.id}`}
      className="border-b border-[#DFE5EC] last:border-b-0 scroll-anchor-target bg-white"
    >
      {/* Mobile Criterion Accordion Bar (< 768px) */}
      <div
        onClick={onToggleExpand}
        className={`flex md:hidden items-center justify-between gap-2 px-4 py-3 border-b border-[#DFE5EC] cursor-pointer select-none ${
          hasActiveSupplement ? 'bg-[#FFFBEB]' : 'bg-[#F8FAFC]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 rounded-[4px] bg-[#007EE5] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
            {isOtherAchievements ? '+' : criterion.number}
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-[#0F172A] truncate">
              {criterion.name}
            </div>
            <div className="text-[11px] text-[#64748B]">{progressSummary}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusChip
            status={customStatusVariant || getCriterionStatus(resolvedStatusLabel)}
            customLabel={resolvedStatusLabel}
            size="sm"
          />
          <ChevronDown
            size={15}
            className="text-[#475569] transition-transform"
            style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
          />
        </div>
      </div>

      {/* Mobile Body */}
      <div className="block md:hidden">{isExpanded && renderRequirementsStack()}</div>

      {/* Desktop 5-Column Administrative Row-Spanned Layout (>= 768px) */}
      <div className="hidden md:grid admin-dossier-criterion-split items-stretch">
        {/* Col 1: STT (Row-spanned top-aligned with sticky number) */}
        <div
          onClick={onToggleExpand}
          title={isExpanded ? 'Nhấn để thu gọn tiêu chí' : 'Nhấn để mở rộng tiêu chí'}
          className={`border-r border-[#DFE5EC] flex items-start justify-center p-2 pt-3.5 text-[13px] font-bold text-[#1E293B] cursor-pointer select-none ${
            hasActiveSupplement ? 'bg-[#FFFBEB]/60' : 'bg-white hover:bg-[#F8FAFC]'
          }`}
        >
          <span className="sticky top-[112px]">
            {isOtherAchievements ? '+' : criterion.number}
          </span>
        </div>

        {/* Col 2: Tiêu chí (Row-spanned top-aligned with sticky label, regulation & status meta) */}
        <div
          className={`border-r border-[#DFE5EC] p-3 pt-3.5 flex flex-col items-center justify-start text-center select-none ${
            hasActiveSupplement ? 'bg-[#FFFBEB]/60' : 'bg-white'
          }`}
        >
          <div className="sticky top-[112px] flex flex-col items-center gap-1.5 w-full">
            <button
              type="button"
              onClick={onToggleExpand}
              className="text-[13px] font-bold text-[#0F172A] hover:text-[#007EE5] leading-snug cursor-pointer"
            >
              {criterion.name}
            </button>

            <span className="text-[11px] text-[#64748B] font-medium tabular-nums">
              {progressSummary}
            </span>

            {(hasActiveSupplement || customStatusLabel || readOnly) && (
              <StatusChip
                status={customStatusVariant || getCriterionStatus(resolvedStatusLabel)}
                customLabel={
                  hasActiveSupplement ? 'Cần bổ sung' : resolvedStatusLabel
                }
                size="sm"
              />
            )}

            {!isOtherAchievements && (
              <button
                type="button"
                onClick={() => onOpenRegulation(criterion.id)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#007EE5] hover:underline cursor-pointer mt-0.5"
              >
                <BookOpen size={11.5} />
                <span>Quy định</span>
              </button>
            )}
          </div>
        </div>

        {/* Cols 3–5 Merged Stack: Group Rule Headers + Requirement Rows + Reviewer Conclusion */}
        <div className="min-w-0 flex flex-col justify-start">
          {renderRequirementsStack()}
        </div>
      </div>
    </div>
  );
};
