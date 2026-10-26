import React from 'react';
import { Download, Plus, FolderArchive } from 'lucide-react';
import { Button } from '../../buttons/Button';
import { FileTypeIcon } from '../../evidence/FileTypeIcon';
import { CollectiveApplication } from '../../../staff/collectiveTypes';
import { ApplicationEvidence } from '../../../demo/fixtures/studentApplication';
import { downloadEvidenceFile } from '../../../staff/demoEvidenceStorage';

export interface CollectiveEvidenceTabProps {
  currentApp: CollectiveApplication;
  allEvidence: Array<ApplicationEvidence & { reqCode?: string }>;
  onGoToApplication: () => void;
}

export const CollectiveEvidenceTab: React.FC<CollectiveEvidenceTabProps> = ({
  currentApp: _currentApp,
  allEvidence,
  onGoToApplication,
}) => {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-5 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#172A3A]">
            Kho minh chứng & tài liệu tập thể
          </h2>
          <p className="text-[12.5px] text-[#607483] mt-0.5">
            Tổng số {allEvidence.length} tài liệu đính kèm phục vụ thẩm định xét chọn 04 tiêu chuẩn
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={onGoToApplication}
          className="gap-1.5"
        >
          <Plus size={15} />
          <span>Đính kèm thêm minh chứng</span>
        </Button>
      </div>

      {allEvidence.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allEvidence.map((ev) => (
            <div
              key={ev.id}
              className="p-4 bg-white border border-[#DCE7EE] rounded-[14px] shadow-2xs flex items-center justify-between gap-3 hover:border-[#0D78AE] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileTypeIcon fileName={ev.name} fileType={ev.fileType} size="md" />
                <div className="min-w-0">
                  <div className="font-bold text-[13.5px] text-[#172A3A] truncate" title={ev.name}>
                    {ev.name}
                  </div>
                  <div className="text-[11.5px] text-[#728391] mt-0.5">
                    {ev.size} · Tiêu chuẩn: <strong>{ev.reqCode || 'TT'}</strong> · Ngày tải: {ev.uploadedAt}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#EAF6FC] text-[#0D78AE]">
                  {ev.reqCode || 'TT'}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => downloadEvidenceFile(ev.id, ev.name)}
                  className="gap-1 text-[11.5px] px-2 py-1"
                >
                  <Download size={13} />
                  <span>Tải về</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-dashed border-[#DCE7EE] rounded-[16px] text-[#607483] space-y-2">
          <FolderArchive size={36} className="mx-auto text-[#94A3B8]" />
          <div className="font-bold text-[14px] text-[#172A3A]">Chưa có tài liệu minh chứng nào</div>
          <p className="text-[12.5px]">Hãy vào Không gian kê khai để đính kèm quyết định và danh sách chứng minh.</p>
        </div>
      )}
    </div>
  );
};
