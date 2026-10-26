import React from 'react';
import { UploadCloud, FolderArchive, AlertCircle, Trash2 } from 'lucide-react';
import { ApplicationEvidence, PersonalLibraryItem } from '../../../demo/fixtures/studentApplication';
import { Button } from '../../buttons/Button';
import { DropZone } from '../../forms/DropZone';
import { FileTypeIcon } from '../../evidence/FileTypeIcon';

export interface InlineEvidenceSectionProps {
  attachedFiles: ApplicationEvidence[];
  inlineEvidenceMode: 'none' | 'upload' | 'library';
  setInlineEvidenceMode: (mode: 'none' | 'upload' | 'library') => void;
  duplicateNotice: string | null;
  handleInlineUploadFiles: (files: File[]) => void;
  filteredLibrary: PersonalLibraryItem[];
  librarySearch: string;
  setLibrarySearch: (q: string) => void;
  handleToggleLibraryItem: (item: PersonalLibraryItem) => void;
  handleRemoveAttachedFile: (fileId: string) => void;
}

export const InlineEvidenceSection: React.FC<InlineEvidenceSectionProps> = ({
  attachedFiles,
  inlineEvidenceMode,
  setInlineEvidenceMode,
  duplicateNotice,
  handleInlineUploadFiles,
  filteredLibrary,
  librarySearch,
  setLibrarySearch,
  handleToggleLibraryItem,
  handleRemoveAttachedFile,
}) => {
  return (
    <div className="pt-2 border-t border-[#E3EBF1] space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[13.5px] font-bold text-[#172A3A]">
            Tệp minh chứng đính kèm ({attachedFiles.length})
          </h4>
          <p className="text-[11.5px] text-[#607483]">
            Đính kèm ít nhất 01 tệp minh chứng hợp lệ để cán bộ xét duyệt
          </p>
        </div>

        {/* Action Buttons to open inline upload or library */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setInlineEvidenceMode(inlineEvidenceMode === 'upload' ? 'none' : 'upload')}
            iconLeading={<UploadCloud size={13} />}
            className="text-[11.5px] h-8"
          >
            Tải tệp mới
          </Button>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={() => setInlineEvidenceMode(inlineEvidenceMode === 'library' ? 'none' : 'library')}
            iconLeading={<FolderArchive size={13} />}
            className="text-[11.5px] h-8 text-[#126A9C] hover:bg-[#EAF6FC]"
          >
            Kho cá nhân
          </Button>
        </div>
      </div>

      {duplicateNotice && (
        <div className="p-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] text-[12px] text-[#DC2626] flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{duplicateNotice}</span>
        </div>
      )}

      {/* Inline Upload Zone */}
      {inlineEvidenceMode === 'upload' && (
        <div className="p-3 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[10px] animate-in fade-in duration-150">
          <DropZone
            onFilesSelected={(files: File[] | FileList) => handleInlineUploadFiles(Array.from(files))}
            label="Kéo thả tệp minh chứng vào đây hoặc nhấn để chọn"
            subtext="PDF, JPG, PNG, DOCX (tối đa 15MB)"
          />
        </div>
      )}

      {/* Inline Personal Library Selector */}
      {inlineEvidenceMode === 'library' && (
        <div className="p-3.5 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[10px] space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-bold text-[#172A3A]">
              Chọn từ Kho minh chứng cá nhân
            </span>
            <input
              type="text"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Tìm trong kho..."
              className="px-2.5 py-1 bg-white border border-[#DCE7EE] rounded-[6px] text-[11.5px] outline-hidden"
            />
          </div>

          <div className="max-h-[160px] overflow-y-auto divide-y divide-[#E3EBF1] border border-[#DCE7EE] rounded-[8px] bg-white">
            {filteredLibrary.length > 0 ? (
              filteredLibrary.map((item) => {
                const isAdded = attachedFiles.some((f) => f.name.toLowerCase() === item.name.toLowerCase());

                return (
                  <div
                    key={item.id}
                    className="px-3 py-2 flex items-center justify-between hover:bg-[#F4F9FD] text-[12px]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileTypeIcon fileName={item.name} fileType={item.fileType} size="sm" />
                      <span className="font-medium text-[#172A3A] truncate">{item.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleLibraryItem(item)}
                      disabled={isAdded}
                      className={`px-2 py-0.5 rounded-[4px] text-[11px] font-semibold cursor-pointer ${
                        isAdded
                          ? 'bg-[#EDF9F1] text-[#1B7C49]'
                          : 'bg-[#EAF6FC] text-[#126A9C] hover:bg-[#D0E8F5]'
                      }`}
                    >
                      {isAdded ? 'Đã chọn' : '+ Chọn'}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-[12px] text-[#607483]">
                Không có tệp phù hợp trong kho cá nhân
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attached Files List */}
      {attachedFiles.length > 0 ? (
        <div className="divide-y divide-[#E3EBF1] border border-[#DCE7EE] rounded-[10px] bg-white overflow-hidden shadow-2xs">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="px-3.5 py-2.5 flex items-center justify-between hover:bg-[#F8FBFD] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileTypeIcon fileName={file.name} fileType={file.fileType} size="md" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[12.5px] font-semibold text-[#172A3A] truncate">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-[#728391]">
                    {file.size} · Tải lên {file.uploadedAt}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveAttachedFile(file.id)}
                className="p-1 text-[#728391] hover:text-[#DC2626] rounded-[4px] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                title="Gỡ tệp này"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3.5 border border-dashed border-[#DCE7EE] rounded-[10px] text-center text-[12px] text-[#728391]">
          Chưa đính kèm minh chứng. Bạn có thể tải lên tệp PDF hoặc ảnh chụp chứng nhận.
        </div>
      )}
    </div>
  );
};
