import React from 'react';
import { RequirementDefinition } from '../../../../demo/fixtures/criteriaDefinitions';

interface InspectorRegulationSectionProps {
  criterionRegulation?: any;
  selectedRequirementDef?: RequirementDefinition;
}

export const InspectorRegulationSection: React.FC<InspectorRegulationSectionProps> = ({
  criterionRegulation,
  selectedRequirementDef,
}) => {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5 text-[12.5px] text-[#172A3A] min-w-0">
      <div className="p-3 rounded-[9px] bg-[#F4FAFF] border border-[#CBE5F6] space-y-1">
        <div className="text-[11px] font-bold text-[#0B64A0]">
          Văn bản quy định áp dụng ({criterionRegulation?.effectiveYear})
        </div>
        <div className="font-bold text-[#0F2335]">
          {criterionRegulation?.source.documentName}
        </div>
        <div className="text-[11.5px] text-[#4A6275]">
          Số hiệu: {criterionRegulation?.source.documentNumber} · Ban hành:{' '}
          {criterionRegulation?.source.issuedDate}
        </div>
      </div>

      {/* Specific Requirement Regulation Detail */}
      {selectedRequirementDef && (
        <div className="p-3 rounded-[9px] bg-[#F8FBFD] border border-[#DCE7EE] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-bold text-[#0D78AE]">
              {selectedRequirementDef.code}
            </span>
            <span className="text-[11px] font-bold text-[#334E68]">
              {selectedRequirementDef.ruleBadge}
            </span>
          </div>
          <h4 className="font-bold text-[#0F2335]">
            {selectedRequirementDef.title}
          </h4>
          <div className="space-y-1.5 text-[12px] text-[#334E68]">
            <div>
              <strong className="text-[#0F2335]">Điều kiện tối thiểu: </strong>
              <span>
                {selectedRequirementDef.ruleHelper ||
                  selectedRequirementDef.regulationSnippet}
              </span>
            </div>
            <div>
              <strong className="text-[#0F2335]">Quy định chi tiết: </strong>
              <span>{selectedRequirementDef.regulationSnippet}</span>
            </div>
            <div>
              <strong className="text-[#0F2335]">Hình thức kê khai: </strong>
              <span>
                {selectedRequirementDef.declarationMultiplicity === 'SINGLE'
                  ? 'Kê khai 01 kết quả chính thức trong năm học.'
                  : 'Có thể kê khai nhiều hoạt động / thành tích phù hợp.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Accepted Evidence Guidance */}
      {criterionRegulation && (
        <div className="p-3 rounded-[9px] bg-white border border-[#DCE7EE] space-y-2">
          <div className="font-bold text-[#0F2335] text-[12.5px]">
            Hướng dẫn thẩm định minh chứng
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[12px] text-[#334E68]">
            {criterionRegulation.evidencePreparation.items.map(
              (item: string, idx: number) => (
                <li key={idx}>{item}</li>
              )
            )}
          </ul>
        </div>
      )}

      {/* Full Regulation Excerpt */}
      {criterionRegulation && (
        <div className="p-3 rounded-[9px] bg-[#F8FBFD] border border-[#DCE7EE] space-y-1.5">
          <div className="font-bold text-[#0F2335] text-[12px]">
            Trích lục văn bản hướng dẫn
          </div>
          <pre className="whitespace-pre-wrap font-sans text-[11.5px] text-[#334E68] leading-relaxed">
            {criterionRegulation.source.fullExcerpt}
          </pre>
        </div>
      )}
    </div>
  );
};
