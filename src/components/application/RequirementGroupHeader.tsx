import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ApplicationRequirementGroup } from '../../demo/fixtures/studentApplication';
import { CriterionDefinition } from '../../tokens';

export interface RequirementGroupHeaderProps {
  group: ApplicationRequirementGroup;
  criterionToken?: CriterionDefinition;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

/**
 * Administrative Sub-Group Rule Band (Inside Cols 3–5 of CriterionSection)
 * Renders bold official condition lines matching the Central HSV table:
 * - "Tiêu chí bắt buộc:"
 * - "Tiêu chí đạt thêm (đạt thêm 01 trong các điều kiện sau):"
 */
export const RequirementGroupHeader: React.FC<RequirementGroupHeaderProps> = ({
  group,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  const getAdministrativeRuleTitle = (): string => {
    if (group.groupType === 'ALL_REQUIRED') {
      const count = group.requirements?.length || 0;
      return count > 1
        ? `Tiêu chí bắt buộc (đạt đồng thời cả ${String(count).padStart(2, '0')} điều kiện sau):`
        : 'Tiêu chí bắt buộc:';
    }
    if (group.groupType === 'REPEATABLE_COLLECTION' || (group.groupType as string) === 'REPEATABLE') {
      return `${group.title} (${group.ruleBadge}):`;
    }
    if (group.groupType === 'OPTIONAL') {
      return `${group.title} (không bắt buộc):`;
    }
    const minSel = group.minSelections || 1;
    const totalCount = group.requirements?.length || 0;
    return totalCount > 0
      ? `Tiêu chí đạt thêm (đạt ít nhất ${String(minSel).padStart(2, '0')} trong ${String(totalCount).padStart(2, '0')} điều kiện sau):`
      : `Tiêu chí đạt thêm (đạt ít nhất ${String(minSel).padStart(2, '0')} trong các điều kiện sau):`;
  };

  const declaredRequirements = group.requirements.filter(
    (r) => r.declarations && r.declarations.length > 0
  );
  const declaredCount = declaredRequirements.length;

  const progressText =
    group.groupType === 'REPEATABLE_COLLECTION' || (group.groupType as string) === 'REPEATABLE'
      ? `${group.requirements.reduce((sum, r) => sum + (r.declarations?.length || 0), 0)} hoạt động`
      : declaredCount > 0
      ? `Đã khai ${declaredCount} mục`
      : '';

  return (
    <div
      onClick={onToggleCollapse}
      className={`px-4 py-2 bg-[#F8FAFC] border-b border-[#DFE5EC] flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F1F5F9]/70 transition-colors select-none ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {onToggleCollapse && (
          <ChevronDown
            size={13.5}
            strokeWidth={2.3}
            className="text-[#475569] shrink-0 transition-transform duration-150"
            style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
          />
        )}
        <span className="text-[12.5px] font-bold text-[#0F172A] leading-snug">
          {getAdministrativeRuleTitle()}
        </span>
      </div>

      {progressText && (
        <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.2 rounded-[3px] shrink-0">
          {progressText}
        </span>
      )}
    </div>
  );
};
