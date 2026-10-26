import React from 'react';
import {
  X,
  Check,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../../../../components/buttons/Button';
import { FileTypeIcon } from '../../../../components/evidence/FileTypeIcon';
import { ApplicationEvidence } from '../../../../demo/fixtures/studentApplication';
import {
  CollectiveApplication,
  CollectiveRequirementId,
  CityEvidenceJudgment,
} from '../../../collectiveTypes';

interface CollectiveEvidenceReviewModalProps {
  activeEvidenceModalFile: ApplicationEvidence | null;
  onClose: () => void;
  app: CollectiveApplication;
  activeReqId: CollectiveRequirementId;
  currentReqMeta: {
    code: string;
    shortTitle: string;
  };
  evidenceJudgmentDraft: CityEvidenceJudgment;
  onChangeEvidenceJudgmentDraft: (status: CityEvidenceJudgment) => void;
  evidenceNoteDraft: string;
  onChangeEvidenceNoteDraft: (note: string) => void;
  onSaveEvidenceJudgment: () => void;
}

export const CollectiveEvidenceReviewModal: React.FC<CollectiveEvidenceReviewModalProps> = ({
  activeEvidenceModalFile,
  onClose,
  app,
  activeReqId,
  currentReqMeta,
  evidenceJudgmentDraft,
  onChangeEvidenceJudgmentDraft,
  evidenceNoteDraft,
  onChangeEvidenceNoteDraft,
  onSaveEvidenceJudgment,
}) => {
  if (!activeEvidenceModalFile) return null;

  const tt01 = app.tt01;
  const tt02 = app.tt02;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-5xl h-[88vh] bg-white rounded-[16px] shadow-2xl border border-[#DCE7EE] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-3.5 border-b border-[#DCE7EE] bg-[#F8FBFD] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileTypeIcon
              fileName={activeEvidenceModalFile.name}
              fileType={activeEvidenceModalFile.fileType}
              size="md"
            />
            <div>
              <h3 className="font-extrabold text-[15px] text-[#172A3A]">
                {activeEvidenceModalFile.name}
              </h3>
              <div className="text-[11.5px] text-[#607483] flex items-center gap-2">
                <span>
                  Điều kiện: <strong>{currentReqMeta.code} — {currentReqMeta.shortTitle}</strong>
                </span>
                <span>·</span>
                <span>Kích thước: {activeEvidenceModalFile.size}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-[#728391] hover:text-[#172A3A] hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Document Preview (65%) & Right Inspector (35%) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document Preview */}
          <div className="flex-1 bg-[#EEF4F8] p-6 overflow-y-auto flex items-center justify-center">
            {activeEvidenceModalFile.fileType === 'pdf' ? (
              /* Realistic Certificate Document Simulator */
              <div className="w-full max-w-xl bg-white shadow-xl rounded-[8px] p-8 border border-[#CFE3F0] text-center space-y-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#475569] border-b pb-2">
                  <div>
                    HỘI SINH VIÊN VIỆT NAM<br />
                    <strong>{app.institutionName.toUpperCase()}</strong>
                  </div>
                  <div>
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br />
                    Độc lập - Tự do - Hạnh phúc
                  </div>
                </div>

                <div className="py-2">
                  <div className="text-[12px] font-bold text-[#728391]">
                    Số: {activeReqId === 'TT01' ? tt01.decisionNumber || '118/QĐ-HSV' : '42/QĐ-HSV'}
                  </div>
                  <h4 className="text-[18px] font-extrabold text-[#0D78AE] uppercase tracking-wide mt-2">
                    {activeReqId === 'TT01'
                      ? 'QUYẾT ĐỊNH CÔNG NHẬN'
                      : activeReqId === 'TT04'
                      ? 'GIẤY XÁC NHẬN CHẤP HÀNH NỘI QUY'
                      : 'DANH SÁCH KHEN THƯỞNG'}
                  </h4>
                  <p className="text-[13px] font-semibold text-[#172A3A] mt-1">
                    Danh hiệu &ldquo;Tập thể Sinh viên 5 tốt cấp Trường&rdquo;
                  </p>
                </div>

                <div className="text-[12.5px] text-[#334E68] text-left leading-relaxed bg-[#F8FBFD] p-3.5 rounded border border-[#E2EDF5]">
                  <div>Đơn vị được công nhận: <strong>{app.collectiveName}</strong></div>
                  <div>Cơ sở đào tạo: <strong>{app.institutionName}</strong></div>
                  <div>Niên khóa xét chọn: <strong>{app.academicYear}</strong></div>
                  <div>Ngày ban hành: <strong>{activeReqId === 'TT01' ? tt01.decisionDate : '30/05/2026'}</strong></div>
                </div>

                <div className="pt-4 flex items-center justify-between text-[12px]">
                  <div className="text-left text-[#607483]">
                    Nơi nhận:<br />
                    - BGH Nhà trường;<br />
                    - Các Chi hội trực thuộc;<br />
                    - Lưu VP.
                  </div>
                  <div className="text-center font-bold text-[#172A3A]">
                    TM. BAN THƯ KÝ HỘI SINH VIÊN<br />
                    CHỦ TỊCH<br />
                    <div className="h-10 flex items-center justify-center text-[#DC2626] font-serif font-black italic">
                      [Đã ký &amp; Đóng dấu mộc đỏ]
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Formatted Spreadsheet Preview for XLSX Member Rosters */
              <div className="w-full max-w-2xl bg-white shadow-xl rounded-[8px] p-5 border border-[#CFE3F0] space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-[#16A34A]" />
                    <span className="font-bold text-[13px] text-[#172A3A]">
                      Bảng tính Excel: {activeEvidenceModalFile.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#16A34A] font-bold bg-[#EDF9F1] px-2 py-0.5 rounded">
                    Định dạng hợp lệ
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto border border-[#E2E8F0] rounded">
                  <table className="w-full text-[11.5px] text-left">
                    <thead className="bg-[#F8FBFD] border-b text-[#475569]">
                      <tr>
                        <th className="py-2 px-3">STT</th>
                        <th className="py-2 px-3">MSSV</th>
                        <th className="py-2 px-3">Họ và tên</th>
                        <th className="py-2 px-3">Lớp / Chi hội</th>
                        <th className="py-2 px-3 text-center">Tình trạng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {(tt02.structuredMembers || []).slice(0, 10).map((m, idx) => (
                        <tr key={m.id}>
                          <td className="py-1.5 px-3 tabular-nums">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-mono font-semibold text-[#0D78AE]">
                            {m.studentCode}
                          </td>
                          <td className="py-1.5 px-3 font-medium">{m.fullName}</td>
                          <td className="py-1.5 px-3 text-[#607483]">
                            {m.className || app.facultyName}
                          </td>
                          <td className="py-1.5 px-3 text-center font-bold text-[#16A34A]">
                            Hợp lệ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Evidence Review Controls (Section 34) */}
          <div className="w-88 shrink-0 border-l border-[#DCE7EE] bg-white p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="border-b border-[#EEF4F8] pb-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#607483]">
                  THẨM ĐỊNH TỪNG MINH CHỨNG
                </div>
                <h4 className="font-bold text-[14px] text-[#172A3A] mt-1">
                  {activeEvidenceModalFile.name}
                </h4>
              </div>

              <div className="space-y-2">
                <label className="block text-[12px] font-bold text-[#172A3A]">
                  Kết luận thẩm định minh chứng:
                </label>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeEvidenceJudgmentDraft('suitable')}
                    className={`p-2.5 rounded-[8px] border text-left cursor-pointer transition-all ${
                      evidenceJudgmentDraft === 'suitable'
                        ? 'bg-[#EDF9F1] border-[#16A34A] text-[#136F3A] font-bold ring-2 ring-[#16A34A]/20'
                        : 'bg-white border-[#DCE7EE] text-[#475569]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-[#16A34A]" />
                      <span>Phù hợp (Tệp gốc hợp lệ)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeEvidenceJudgmentDraft('needs_supplement')}
                    className={`p-2.5 rounded-[8px] border text-left cursor-pointer transition-all ${
                      evidenceJudgmentDraft === 'needs_supplement'
                        ? 'bg-[#FEF6EB] border-[#D97706] text-[#B45309] font-bold ring-2 ring-[#D97706]/20'
                        : 'bg-white border-[#DCE7EE] text-[#475569]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-[#D97706]" />
                      <span>Cần bổ sung (Thiếu trang / mờ)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeEvidenceJudgmentDraft('needs_consideration')}
                    className={`p-2.5 rounded-[8px] border text-left cursor-pointer transition-all ${
                      evidenceJudgmentDraft === 'needs_consideration'
                        ? 'bg-[#F5F3FF] border-[#7C3AED] text-[#5B21B6] font-bold ring-2 ring-[#7C3AED]/20'
                        : 'bg-white border-[#DCE7EE] text-[#475569]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#7C3AED]" />
                      <span>Cần xem xét thêm</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeEvidenceJudgmentDraft('unsuitable')}
                    className={`p-2.5 rounded-[8px] border text-left cursor-pointer transition-all ${
                      evidenceJudgmentDraft === 'unsuitable'
                        ? 'bg-[#FEF2F2] border-[#DC2626] text-[#B91C1C] font-bold ring-2 ring-[#DC2626]/20'
                        : 'bg-white border-[#DCE7EE] text-[#475569]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <X size={14} className="text-[#DC2626]" />
                      <span>Không phù hợp</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12px] font-bold text-[#172A3A]">
                  Ghi chú xét duyệt minh chứng:
                </label>
                <textarea
                  rows={3}
                  value={evidenceNoteDraft}
                  onChange={(e) => onChangeEvidenceNoteDraft(e.target.value)}
                  placeholder="Ghi nhận xét đối chiếu tài liệu (con dấu, chữ ký, số quyết định)..."
                  className="w-full p-2.5 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[8px] text-[12px] outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EEF4F8] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={onClose}
              >
                Đóng
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={onSaveEvidenceJudgment}
              >
                Lưu kết quả xét minh chứng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
