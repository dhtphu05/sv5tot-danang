import React, { useState } from 'react';
import { Info, Send } from 'lucide-react';
import {
  CRITERIA,
  CriterionDefinition,
  MOCK_STUDENT,
  RequirementStatus,
} from '../../tokens';
import { InstitutionLockup } from '../../components/brand/HsvLogo';
import { Button } from '../../components/buttons/Button';
import { StickyAppHeader } from '../../components/shell/StickyAppHeader';
import { ApplicationTable } from '../../components/table/ApplicationTable';
import { CriterionHeader } from '../../components/table/CriterionHeader';
import { RequirementRow, RequirementData } from '../../components/table/RequirementRow';
import { EvidenceFileItem } from '../../components/evidence/EvidenceFileChip';
import { RightInspector } from '../../components/inspector/RightInspector';
import { RegulationInspectorContent } from '../../components/inspector/RegulationInspectorContent';
import { EvidenceInspectorContent } from '../../components/inspector/EvidenceInspectorContent';
import { Dialog } from '../../components/feedback/Dialog';
import { PLAYGROUND_INITIAL_REQUIREMENTS } from '../playgroundData';

export const InteractiveAppTab: React.FC = () => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>('academic-nckh');
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({
    ethics: true,
    academic: true,
    volunteer: true,
  });

  const [inspectorMode, setInspectorMode] = useState<'none' | 'regulation' | 'evidence'>('none');
  const [activeCriterionForReg, setActiveCriterionForReg] = useState<CriterionDefinition>(
    CRITERIA.academic
  );
  const [activeEvidenceForInspect, setActiveEvidenceForInspect] =
    useState<EvidenceFileItem | null>(null);

  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isCompactHeaderDemo, setIsCompactHeaderDemo] = useState(false);

  const [requirements, setRequirements] = useState<Record<string, RequirementData[]>>(
    PLAYGROUND_INITIAL_REQUIREMENTS
  );

  const handleToggleCriterion = (criterionId: string) => {
    setExpandedCriteria((prev) => ({
      ...prev,
      [criterionId]: !prev[criterionId],
    }));
  };

  const handleOpenRegulation = (criterion: CriterionDefinition) => {
    setActiveCriterionForReg(criterion);
    setInspectorMode('regulation');
  };

  const handleInspectEvidence = (file: EvidenceFileItem) => {
    setActiveEvidenceForInspect(file);
    setInspectorMode('evidence');
  };

  const handleConfirmEvidence = (fileId: string) => {
    setRequirements((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((cat) => {
        updated[cat] = updated[cat].map((req) => {
          const fileMatch = req.evidenceFiles.find((f) => f.id === fileId);
          if (fileMatch) {
            const newFiles = req.evidenceFiles.map((f) =>
              f.id === fileId ? { ...f, status: 'ready' as RequirementStatus } : f
            );
            return {
              ...req,
              evidenceFiles: newFiles,
              status: 'ready' as RequirementStatus,
              recommendation: undefined,
            };
          }
          return req;
        });
      });
      return updated;
    });

    if (activeEvidenceForInspect && activeEvidenceForInspect.id === fileId) {
      setActiveEvidenceForInspect((prev) =>
        prev ? { ...prev, status: 'ready' as RequirementStatus } : null
      );
    }
  };

  const handleUpdateDeclaration = (
    criterionId: string,
    reqId: string,
    newDeclaration: { value: string; detail?: string }
  ) => {
    setRequirements((prev) => ({
      ...prev,
      [criterionId]: prev[criterionId].map((req) =>
        req.id === reqId
          ? {
              ...req,
              declarationValue: newDeclaration.value,
              declarationDetail: newDeclaration.detail,
              status: 'declared' as RequirementStatus,
            }
          : req
      ),
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Context Banner */}
      <div className="p-4 rounded-[12px] bg-white border border-black/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InstitutionLockup size={36} />
          <div className="h-6 w-[1px] bg-black/[0.08] mx-1 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-[#1D1D1F]">
              Không gian nộp hồ sơ Sinh viên 5 tốt (Mô phỏng thực tế)
            </span>
            <span className="text-[12.5px] text-[#6E6E73]">
              Cấu trúc 1 hồ sơ · Đúng 5 tiêu chí chuẩn · Không thẻ viền hộp rườm rà · Đường phân tách siêu mảnh
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="quiet"
            onClick={() => setIsCompactHeaderDemo(!isCompactHeaderDemo)}
          >
            {isCompactHeaderDemo ? 'Đổi sang Header Mở rộng' : 'Thử Header Thu gọn khi cuộn'}
          </Button>
        </div>
      </div>

      {/* Sticky Application Header Demo */}
      <div className="rounded-[14px] overflow-hidden border border-black/[0.05] shadow-sm bg-white">
        <StickyAppHeader
          isCompact={isCompactHeaderDemo}
          statusLabel="Đang hoàn thiện"
          onSubmitClick={() => setIsSubmitDialogOpen(true)}
        />

        {/* The Canonical Application Table */}
        <div className="p-0">
          <ApplicationTable>
            {/* CRITERION 1: ĐẠO ĐỨC TỐT */}
            <div className="border-b border-black/[0.05]">
              <CriterionHeader
                criterion={CRITERIA.ethics}
                isExpanded={expandedCriteria.ethics}
                onToggleExpand={() => handleToggleCriterion('ethics')}
                metadataSummary="2 nội dung · 2 minh chứng"
                statusLabel="Đã khai báo"
                onOpenRegulation={handleOpenRegulation}
              />
              {expandedCriteria.ethics && (
                <div className="divide-y divide-black/[0.04]">
                  {requirements.ethics.map((req) => (
                    <RequirementRow
                      key={req.id}
                      data={req}
                      isExpanded={expandedRowId === req.id}
                      onToggleExpand={() =>
                        setExpandedRowId(expandedRowId === req.id ? null : req.id)
                      }
                      onOpenRegulation={() => handleOpenRegulation(CRITERIA.ethics)}
                      onInspectEvidence={handleInspectEvidence}
                      onUpdateDeclaration={(updated) =>
                        handleUpdateDeclaration('ethics', req.id, updated)
                      }
                      onAddEvidence={() => {
                        setExpandedRowId(req.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* CRITERION 2: HỌC TẬP TỐT */}
            <div className="border-b border-black/[0.05]">
              <CriterionHeader
                criterion={CRITERIA.academic}
                isExpanded={expandedCriteria.academic}
                onToggleExpand={() => handleToggleCriterion('academic')}
                metadataSummary="2 nội dung · 4 minh chứng"
                statusLabel="Cần bạn kiểm tra"
                onOpenRegulation={handleOpenRegulation}
              />
              {expandedCriteria.academic && (
                <div className="divide-y divide-black/[0.04]">
                  {requirements.academic.map((req) => (
                    <RequirementRow
                      key={req.id}
                      data={req}
                      isExpanded={expandedRowId === req.id}
                      onToggleExpand={() =>
                        setExpandedRowId(expandedRowId === req.id ? null : req.id)
                      }
                      onOpenRegulation={() => handleOpenRegulation(CRITERIA.academic)}
                      onInspectEvidence={handleInspectEvidence}
                      onUpdateDeclaration={(updated) =>
                        handleUpdateDeclaration('academic', req.id, updated)
                      }
                      onAddEvidence={() => {
                        setExpandedRowId(req.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* CRITERION 3: TÌNH NGUYỆN TỐT */}
            <div>
              <CriterionHeader
                criterion={CRITERIA.volunteer}
                isExpanded={expandedCriteria.volunteer}
                onToggleExpand={() => handleToggleCriterion('volunteer')}
                metadataSummary="2 nội dung · 3 minh chứng"
                statusLabel="Đã khai báo"
                onOpenRegulation={handleOpenRegulation}
              />
              {expandedCriteria.volunteer && (
                <div className="divide-y divide-black/[0.04]">
                  {requirements.volunteer.map((req) => (
                    <RequirementRow
                      key={req.id}
                      data={req}
                      isExpanded={expandedRowId === req.id}
                      onToggleExpand={() =>
                        setExpandedRowId(expandedRowId === req.id ? null : req.id)
                      }
                      onOpenRegulation={() => handleOpenRegulation(CRITERIA.volunteer)}
                      onInspectEvidence={handleInspectEvidence}
                      onUpdateDeclaration={(updated) =>
                        handleUpdateDeclaration('volunteer', req.id, updated)
                      }
                      onAddEvidence={() => {
                        setExpandedRowId(req.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </ApplicationTable>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-[12px] border border-black/[0.05]">
        <div className="flex items-center gap-2 text-[13px] text-[#6E6E73]">
          <Info size={16} className="text-[#22A9E0]" />
          <span>
            Hồ sơ được lưu nháp tự động. Bạn có thể kiểm tra lại tất cả minh chứng trước khi gửi chính thức.
          </span>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsSubmitDialogOpen(true)}
          iconLeading={<Send size={15} />}
        >
          Kiểm tra & gửi hồ sơ
        </Button>
      </div>

      {/* Right Inspectors */}
      <RightInspector
        isOpen={inspectorMode === 'regulation'}
        onClose={() => setInspectorMode('none')}
        title="Quy chế áp dụng"
        subtitle={`${activeCriterionForReg.name} · Năm học 2026–2027`}
      >
        <RegulationInspectorContent criterion={activeCriterionForReg} />
      </RightInspector>

      <RightInspector
        isOpen={inspectorMode === 'evidence' && activeEvidenceForInspect !== null}
        onClose={() => setInspectorMode('none')}
        title="Chi tiết minh chứng & Thẩm tra"
        subtitle={activeEvidenceForInspect?.name}
      >
        {activeEvidenceForInspect && (
          <EvidenceInspectorContent
            file={activeEvidenceForInspect}
            onConfirmVerification={handleConfirmEvidence}
            onClose={() => setInspectorMode('none')}
          />
        )}
      </RightInspector>

      {/* Dialog Confirm Submit */}
      <Dialog
        isOpen={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        title="Gửi hồ sơ xét chọn Sinh viên 5 tốt?"
        description="Sau khi gửi, cán bộ Hội Sinh viên sẽ bắt đầu thẩm định các tiêu chí đã khai báo. Bạn vẫn có thể bổ sung minh chứng nếu nhận được yêu cầu."
        primaryAction={{
          label: 'Xác nhận gửi hồ sơ',
          onClick: () => {
            setIsSubmitSuccess(true);
            setTimeout(() => {
              setIsSubmitDialogOpen(false);
              setIsSubmitSuccess(false);
            }, 600);
          },
          isLoading: isSubmitSuccess,
        }}
        secondaryAction={{
          label: 'Kiểm tra lại',
          onClick: () => setIsSubmitDialogOpen(false),
        }}
      >
        <div className="p-3 bg-[#F9FAFB] rounded-[10px] text-[13px] text-[#6E6E73] space-y-1.5 border border-black/[0.04]">
          <div className="flex justify-between">
            <span>Sinh viên:</span>
            <span className="font-semibold text-[#1D1D1F]">{MOCK_STUDENT.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span>Tiêu chí đã hoàn tất:</span>
            <span className="font-medium text-[#1A934E]">5 / 5 tiêu chí</span>
          </div>
          <div className="flex justify-between">
            <span>Tổng số minh chứng:</span>
            <span className="font-medium text-[#1D1D1F]">9 tài liệu</span>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
