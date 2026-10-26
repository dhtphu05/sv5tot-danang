import React from 'react';
import { Plus, Eye, Download, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../buttons/Button';
import { FileTypeIcon } from '../../evidence/FileTypeIcon';
import {
  CollectiveRequirementId,
  COLLECTIVE_REQUIREMENTS_META,
} from '../../../staff/collectiveTypes';
import { ApplicationEvidence } from '../../../demo/fixtures/studentApplication';

export interface CollectiveEvidenceAreaProps {
  activeReqId: CollectiveRequirementId;
  evidenceFiles: ApplicationEvidence[];
  isReadOnly: boolean;
  isUploading: boolean;
  onTriggerUpload: (reqId: CollectiveRequirementId) => void;
  onOpenPreview: (file: ApplicationEvidence) => void;
  onDownloadFile: (file: ApplicationEvidence) => void;
  onDeleteEvidence: (reqId: CollectiveRequirementId, fileId: string) => void;
}

export const CollectiveEvidenceArea: React.FC<CollectiveEvidenceAreaProps> = ({
  activeReqId,
  evidenceFiles,
  isReadOnly,
  isUploading,
  onTriggerUpload,
  onOpenPreview,
  onDownloadFile,
  onDeleteEvidence,
}) => {
  return (
    <div className="pt-4 border-t border-[#EEF4F8] space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h4 className="font-bold text-[14px] text-[#172A3A]">
            Tài liệu minh chứng cho {COLLECTIVE_REQUIREMENTS_META[activeReqId].code}
          </h4>
          <div className="text-[11.5px] text-[#607483] mt-0.5">
            {activeReqId === 'TT01' && 'Gợi ý: Quyết định công nhận danh hiệu cấp Trường · Trích lục danh sách khen thưởng'}
            {activeReqId === 'TT02' && 'Gợi ý: Danh sách sinh viên chi hội · Báo cáo tham gia phong trào Sinh viên 5 tốt'}
            {activeReqId === 'TT03' && 'Gợi ý: Quyết định công nhận SV5T cá nhân cấp Trường · Danh sách trích lục sinh viên đạt'}
            {activeReqId === 'TT04' && 'Gợi ý: Văn bản xác nhận không vi phạm kỷ luật của Ban Chủ nhiệm Khoa / Nhà trường'}
          </div>
        </div>

        {!isReadOnly && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onTriggerUpload(activeReqId)}
            disabled={isUploading}
            className="gap-1.5 shadow-2xs"
          >
            <Plus size={14} />
            <span>{isUploading ? 'Đang tải lên...' : 'Thêm minh chứng'}</span>
          </Button>
        )}
      </div>

      {evidenceFiles.length > 0 ? (
        <div className="space-y-2.5">
          {evidenceFiles.map((file) => (
            <div
              key={file.id}
              className="p-3.5 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[12px] flex items-center justify-between gap-3 hover:border-[#B8CEDC] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileTypeIcon fileName={file.name} fileType={file.fileType} size="md" />
                <div className="min-w-0">
                  <div className="font-semibold text-[#172A3A] truncate text-[13px]">{file.name}</div>
                  <div className="text-[11px] text-[#607483] flex items-center gap-2 mt-0.5">
                    <span>{file.size}</span>
                    <span>·</span>
                    <span>Tải lên {file.uploadedAt}</span>
                    <span>·</span>
                    <span className="text-[#16A34A] font-semibold bg-[#EDF9F1] px-1.5 py-0.2 rounded">
                      Đã lưu trữ
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onOpenPreview(file)}
                  className="gap-1 text-[12px] px-2.5 py-1"
                >
                  <Eye size={13} />
                  <span>Xem</span>
                </Button>

                <button
                  type="button"
                  onClick={() => onDownloadFile(file)}
                  className="p-1.5 text-[#607483] hover:text-[#0D78AE] hover:bg-[#EEF4F8] rounded-[6px] transition-colors cursor-pointer"
                  title="Tải về tệp gốc"
                >
                  <Download size={15} />
                </button>

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => onDeleteEvidence(activeReqId, file.id)}
                    className="p-1.5 text-[#DC2626] hover:text-[#991B1B] hover:bg-[#FEF2F2] rounded-[6px] transition-colors cursor-pointer"
                    title="Xóa tệp minh chứng này"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-[#FEF6EB] border border-[#FADDB6] rounded-[10px] text-[12.5px] text-[#8C3A19] flex items-start gap-2.5">
          <AlertTriangle size={18} className="shrink-0 text-[#D97706] mt-0.5" />
          <div>
            <span className="font-bold">
              Chưa có tệp minh chứng đính kèm cho {COLLECTIVE_REQUIREMENTS_META[activeReqId].code}.
            </span>
            <p className="mt-0.5 text-[#B45309]">
              Vui lòng bấm nút <strong>"+ Thêm minh chứng"</strong> để tải lên tệp PDF, Excel hoặc hình ảnh quyết định/xác nhận từ máy tính của bạn. Tệp sẽ được lưu trữ tự động và tồn tại bền vững qua các lần tải lại trang.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
