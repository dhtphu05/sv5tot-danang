import React, { useState } from 'react';
import { FileText, History, Upload, X, Send } from 'lucide-react';
import { CollectiveApplication } from '../../../collectiveTypes';
import { DocumentViewer } from '../../../../components/evidence/detail/DocumentViewer';
import { Button } from '../../../../components/buttons/Button';

export interface CollectiveCommitteeModalsProps {
  appData: CollectiveApplication;
  selectedEvidenceUrl: string | null;
  selectedEvidenceTitle: string;
  onCloseEvidenceViewer: () => void;
  showAuditModal: boolean;
  onCloseAuditModal: () => void;
  showPublicationModal: boolean;
  onClosePublicationModal: () => void;
  publicationDecisionNumber: string;
  setPublicationDecisionNumber: (val: string) => void;
  onPublish: () => void;
}

export const CollectiveCommitteeModals: React.FC<CollectiveCommitteeModalsProps> = ({
  appData,
  selectedEvidenceUrl,
  selectedEvidenceTitle,
  onCloseEvidenceViewer,
  showAuditModal,
  onCloseAuditModal,
  showPublicationModal,
  onClosePublicationModal,
  publicationDecisionNumber,
  setPublicationDecisionNumber,
  onPublish,
}) => {
  const [uploadedDecisionPdf, setUploadedDecisionPdf] = useState<{
    fileName: string;
    fileUrl: string;
  } | null>(null);

  return (
    <>
      {/* Document Viewer Modal */}
      {selectedEvidenceUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-4xl h-[85vh] bg-white rounded-[14px] shadow-2xl overflow-hidden flex flex-col border border-[#DCE7EE]">
            <div className="px-5 py-3 bg-[#F8FBFD] border-b border-[#DCE7EE] flex items-center justify-between">
              <div className="font-bold text-[14px] text-[#0F2335]">{selectedEvidenceTitle}</div>
              <button
                type="button"
                onClick={onCloseEvidenceViewer}
                className="p-1 rounded-[6px] hover:bg-[#EEF4F8] text-[#526B7C] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <DocumentViewer
                fileName={selectedEvidenceTitle}
                fileUrl={selectedEvidenceUrl || undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {showAuditModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs select-none"
        >
          <div className="w-full max-w-xl bg-white rounded-[14px] shadow-2xl border border-[#DCE7EE] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 bg-[#F8FBFD] border-b border-[#DCE7EE] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={16} className="text-[#0D78AE]" />
                <h3 className="font-bold text-[14px] text-[#0F2335]">
                  Nhật ký hồ sơ {appData.collectiveName}
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseAuditModal}
                className="p-1 rounded text-[#607483] hover:text-[#0F2335]"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3">
              {(appData.auditHistory || []).slice().reverse().map((aud) => (
                <div key={aud.id} className="p-3 rounded-[8px] bg-[#F8FBFD] border border-[#E2EDF5] text-[12px]">
                  <div className="font-bold text-[#0F2335]">{aud.action}</div>
                  <div className="text-[#475569] mt-0.5">{aud.details}</div>
                  <div className="text-[11px] text-[#728391] mt-1">
                    {aud.actorName} ({aud.actorRole}) · {new Date(aud.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Publication Confirmation Modal */}
      {showPublicationModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2335]/55 backdrop-blur-xs select-none"
        >
          <div className="w-full max-w-lg bg-white rounded-[14px] shadow-2xl border border-[#CFE0EC] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-[#F8FBFD] border-b border-[#DCE7EE] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Send size={16} className="text-[#0B64A0]" />
                <h3 className="font-extrabold text-[15px] text-[#0F2335]">
                  XÁC NHẬN CÔNG BỐ KẾT QUẢ
                </h3>
              </div>
              <button
                type="button"
                onClick={onClosePublicationModal}
                className="p-1 rounded text-[#607483] hover:text-[#0F2335]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-[13px] overflow-y-auto">
              <p className="text-[#172A3A]">
                Sau khi công bố, tập thể <strong>{appData.collectiveName}</strong> sẽ có thể xem kết quả xét chọn chính thức trên Cổng tập thể.
              </p>

              <div className="p-3.5 rounded-[10px] bg-[#F6FAFD] border border-[#CFE0EC] space-y-2 text-[12.5px]">
                <div className="flex justify-between">
                  <span className="text-[#526B7C]">Loại hồ sơ:</span>
                  <strong className="text-[#0F2335]">Tập thể Sinh viên 5 tốt</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#526B7C]">Tên tập thể:</span>
                  <strong className="text-[#0F2335]">{appData.collectiveName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#526B7C]">Đơn vị đào tạo:</span>
                  <strong className="text-[#0F2335]">{appData.institutionName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#526B7C]">Năm học:</span>
                  <strong className="text-[#0F2335]">{appData.academicYear}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E2EDF5]">
                  <span className="text-[#526B7C]">Kết luận chính thức:</span>
                  <strong className={appData.committeeOutcome === 'recognized' ? 'text-[#16A34A]' : 'text-[#DC2626]'}>
                    {appData.committeeOutcome === 'recognized' ? 'Công nhận danh hiệu' : 'Chưa được công nhận'}
                  </strong>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                    Tải lên Quyết định công nhận (.PDF) &amp; Số quyết định:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={publicationDecisionNumber}
                      onChange={(e) => setPublicationDecisionNumber(e.target.value)}
                      placeholder="Nhập số quyết định (tùy chọn)..."
                      className="flex-1 h-[36px] px-3 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[7px] text-[13px] outline-none focus:border-[#0D78AE]"
                    />
                    <label className="inline-flex items-center gap-1.5 h-[36px] px-3 rounded-[7px] bg-[#0B64A0] hover:bg-[#095386] text-white text-[12px] font-bold cursor-pointer shrink-0">
                      <Upload size={13} />
                      <span>Tải tệp PDF</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = URL.createObjectURL(file);
                          setUploadedDecisionPdf({ fileName: file.name, fileUrl: url });
                          if (!publicationDecisionNumber.trim()) {
                            setPublicationDecisionNumber(file.name);
                          }
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {uploadedDecisionPdf && (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-[7px] bg-[#EAF6FC] border border-[#CBE5F6] flex items-center justify-between text-[12px] text-[#0B64A0]">
                      <div className="flex items-center gap-1.5 truncate">
                        <FileText size={14} className="shrink-0" />
                        <span className="font-bold truncate">{uploadedDecisionPdf.fileName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedDecisionPdf(null)}
                        className="text-[#DC2626] font-semibold text-[11px] hover:underline cursor-pointer shrink-0"
                      >
                        Gỡ tệp
                      </button>
                    </div>
                    <div className="h-[240px] rounded-[7px] overflow-hidden border border-[#DCE7EE] bg-[#525659]">
                      <iframe
                        src={uploadedDecisionPdf.fileUrl}
                        title={uploadedDecisionPdf.fileName}
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3.5 bg-[#F8FBFD] border-t border-[#DCE7EE] flex items-center justify-end gap-2.5">
              <Button
                variant="quiet"
                size="sm"
                onClick={onClosePublicationModal}
              >
                Quay lại
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onPublish}
              >
                Xác nhận công bố
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
