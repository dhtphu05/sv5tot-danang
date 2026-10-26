import React from 'react';
import { History, X, Send } from 'lucide-react';
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
              <DocumentViewer fileName={selectedEvidenceTitle} />
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
          <div className="w-full max-w-lg bg-white rounded-[14px] shadow-2xl border border-[#CFE0EC] overflow-hidden flex flex-col">
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

            <div className="p-5 space-y-4 text-[13px]">
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

              <div>
                <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                  Số quyết định công bố:
                </label>
                <input
                  type="text"
                  value={publicationDecisionNumber}
                  onChange={(e) => setPublicationDecisionNumber(e.target.value)}
                  placeholder="VD: 86/QĐ-HSV-TP"
                  className="w-full h-[36px] px-3 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[7px] text-[13px] outline-none focus:border-[#0D78AE]"
                />
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
