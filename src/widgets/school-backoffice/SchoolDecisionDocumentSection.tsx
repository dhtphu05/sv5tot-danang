/**
 * 5TOT Đà Nẵng — School Decision Document Section Widget (FSD Widgets Layer)
 * LEAN-4.2: PDF-Only Official Document Upload.
 * Eliminates manual input fields for Số hiệu văn bản, Ngày ban hành, Người ký, Chức vụ.
 * Preserves historical metadata for viewing without requiring fabrication or manual input.
 */

import React, { RefObject } from 'react';
import { FileText, Eye, Trash2, FileCheck2, CheckCircle2, Upload, FileUp } from 'lucide-react';
import { DecisionDocumentMetadata } from '../../staff/schoolReviewTypes';
import { Button } from '../../components/buttons/Button';

export interface SchoolDecisionDocumentSectionProps {
  isUdn: boolean;
  unitName: string;
  batchStatus: 'DRAFT' | 'FORWARDED';
  decisionDoc: DecisionDocumentMetadata | null;
  onRemoveDecisionDoc: () => void;
  onPreviewDecisionDoc: (doc: DecisionDocumentMetadata) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  // Optional legacy props kept for caller compatibility
  docNumberInput?: string;
  onSetDocNumberInput?: (val: string) => void;
  docTitleInput?: string;
  onSetDocTitleInput?: (val: string) => void;
  docDateInput?: string;
  onSetDocDateInput?: (val: string) => void;
  docSignerInput?: string;
  onSetDocSignerInput?: (val: string) => void;
  docSignerTitleInput?: string;
  onSetDocSignerTitleInput?: (val: string) => void;
  isEditingDocMeta?: boolean;
  onSetIsEditingDocMeta?: (val: boolean) => void;
  onSaveDocMeta?: () => void;
}

export const SchoolDecisionDocumentSection: React.FC<
  SchoolDecisionDocumentSectionProps
> = ({
  isUdn,
  unitName,
  batchStatus,
  decisionDoc,
  onRemoveDecisionDoc,
  onPreviewDecisionDoc,
  onFileUpload,
  fileInputRef,
}) => {
  // Check if historical metadata is present on existing document
  const hasHistoricalMeta = Boolean(
    decisionDoc?.decisionNumber ||
    decisionDoc?.decisionDate ||
    decisionDoc?.signedByName
  );

  return (
    <div className="bg-white rounded-[6px] border border-[#DFE5EC] p-4 sm:p-5 space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFE5EC] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[5px] bg-[#EFF6FF] text-[#007EE5] border border-[#BFDBFE] flex items-center justify-center">
            <FileText size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[14.5px] font-bold text-[#0F172A]">
                Văn bản đề nghị xét chọn (.PDF)
              </h2>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-[3px] bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                Bắt buộc đính kèm
              </span>
            </div>
            <p className="text-[12px] text-[#475569] mt-0.5">
              {isUdn
                ? 'Đính kèm 01 tệp văn bản / tờ trình PDF đề xuất chính thức của Đại học Đà Nẵng (tổng hợp chung cho 08 trường thành viên).'
                : `Đính kèm 01 tệp văn bản / tờ trình PDF đề nghị chính thức có chữ ký và đóng dấu của ${unitName}.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {decisionDoc && (
            <Button
              variant="secondary"
              size="sm"
              iconLeading={<Eye size={13} />}
              onClick={() => onPreviewDecisionDoc(decisionDoc)}
            >
              Xem văn bản
            </Button>
          )}

          {batchStatus === 'DRAFT' && decisionDoc && (
            <Button
              variant="quiet"
              size="sm"
              iconLeading={<Trash2 size={13} className="text-[#DC2626]" />}
              onClick={onRemoveDecisionDoc}
            >
              Gỡ bỏ tệp
            </Button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={onFileUpload}
        className="hidden"
      />

      {/* Uploaded File Presentation */}
      {decisionDoc ? (
        <div className="p-3.5 bg-[#F8FAFC] border border-[#DFE5EC] rounded-[5px] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-[5px] bg-[#ECFDF5] text-[#10A37F] border border-[#A7F3D0] flex items-center justify-center shrink-0">
                <FileCheck2 size={19} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#0F172A] truncate">
                  {decisionDoc.fileName}
                </div>
                <div className="text-[11.5px] text-[#64748B] flex items-center gap-2 mt-0.5">
                  <span>{(((decisionDoc.fileSize || 0) / (1024 * 1024))).toFixed(2)} MB</span>
                  <span>·</span>
                  <span className="text-[#047857] font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Tệp PDF đã đính kèm hợp lệ
                  </span>
                </div>
              </div>
            </div>

            {batchStatus === 'DRAFT' && (
              <Button
                variant="secondary"
                size="sm"
                iconLeading={<FileUp size={13} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Thay đổi tệp PDF
              </Button>
            )}
          </div>

          {hasHistoricalMeta && (
            <div className="pt-2.5 border-t border-[#DFE5EC] grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11.5px] text-[#475569]">
              {decisionDoc.decisionNumber && (
                <div>
                  <span className="font-semibold text-[#0F172A]">Số hiệu lưu trữ:</span>{' '}
                  <span className="font-mono font-bold text-[#007EE5]">{decisionDoc.decisionNumber}</span>
                </div>
              )}
              {decisionDoc.decisionDate && (
                <div>
                  <span className="font-semibold text-[#0F172A]">Ngày ban hành:</span>{' '}
                  <span>{decisionDoc.decisionDate}</span>
                </div>
              )}
              {(decisionDoc.signedByName || decisionDoc.signedByTitle) && (
                <div>
                  <span className="font-semibold text-[#0F172A]">Người ký:</span>{' '}
                  <span>
                    {decisionDoc.signedByName}
                    {decisionDoc.signedByTitle ? ` (${decisionDoc.signedByTitle})` : ''}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-5 border border-dashed border-[#94A3B8] hover:border-[#007EE5] rounded-[5px] bg-[#F8FAFC] hover:bg-[#EFF6FF]/40 text-center cursor-pointer transition-colors space-y-2"
        >
          <div className="w-9 h-9 rounded-[5px] bg-[#EFF6FF] text-[#007EE5] border border-[#BFDBFE] flex items-center justify-center mx-auto">
            <Upload size={18} />
          </div>
          <div>
            <div className="text-[13px] font-bold text-[#0F172A]">
              Tải lên tệp văn bản đề nghị (.PDF)
            </div>
            <p className="text-[12px] text-[#64748B] mt-0.5">
              Nhấn để chọn tệp văn bản / tờ trình PDF đã ký và đóng dấu của đơn vị (tối đa 20 MB).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
