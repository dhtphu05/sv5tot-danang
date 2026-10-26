/**
 * 5TOT Đà Nẵng — School Batch Forwarding Confirmation, Decision Preview & Snapshot Modals
 * FSD Layer: widgets/school-backoffice
 * LEAN-4.1 Correction: Direct School Finalization — Select, Attach and Forward
 * Removed second per-student recommendation modal.
 * Clean, concise final confirmation dialog displaying unit, season, count, doc reference, and student list.
 */

import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  X,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { StaffApplicationRecord, StaffUser } from '../../staff/types';
import {
  DecisionDocumentMetadata,
} from '../../staff/schoolReviewTypes';
import { getApplicationCriteriaSummary } from '../../staff/schoolSelectors';
import { Dialog } from '../../components/feedback/Dialog';
import { Button } from '../../components/buttons/Button';
import { CRITERIA_LIST } from '../../tokens';

export interface SchoolForwardingModalsProps {
  currentUser: StaffUser;
  unitName: string;
  seasonCode?: string;

  // Optional legacy props maintained for interface compatibility
  recModalApp?: StaffApplicationRecord | null;
  onCloseRecModal?: () => void;
  recChoice?: any;
  onSetRecChoice?: (choice: any) => void;
  recNotes?: string;
  onSetRecNotes?: (notes: string) => void;
  recReason?: string;
  onSetRecReason?: (reason: string) => void;
  recError?: string | null;
  onClearRecError?: () => void;
  onSaveRecommendation?: () => void;

  // MODAL 1: One-Time Consolidated Batch Forwarding Confirmation
  isBatchConfirmOpen: boolean;
  onCloseBatchConfirm: () => void;
  selectedApps: StaffApplicationRecord[];
  institutionBreakdown: { id: string; name: string; count: number }[];
  decisionDoc: DecisionDocumentMetadata | null;
  forwardBatchNote: string;
  onSetForwardBatchNote: (note: string) => void;
  onConfirmBatchForward: () => void;
  isConfirmingBatch?: boolean;

  // MODAL 2: Interactive Decision Document Preview
  previewDecisionDoc: DecisionDocumentMetadata | null;
  onCloseDecisionDocPreview: () => void;

  // MODAL 3: Historical Frozen Snapshot Modal
  snapshotModalApp: StaffApplicationRecord | null;
  onCloseSnapshotModal: () => void;
}

export const SchoolForwardingModals: React.FC<SchoolForwardingModalsProps> = ({
  unitName,
  seasonCode = '2026–2027',
  isBatchConfirmOpen,
  onCloseBatchConfirm,
  selectedApps,
  institutionBreakdown,
  decisionDoc,
  forwardBatchNote,
  onSetForwardBatchNote,
  onConfirmBatchForward,
  isConfirmingBatch = false,
  previewDecisionDoc,
  onCloseDecisionDocPreview,
  snapshotModalApp,
  onCloseSnapshotModal,
}) => {
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const normalizedSeason = seasonCode.startsWith('Năm học')
    ? seasonCode
    : `Năm học ${seasonCode}`;

  return (
    <>
      {/* ===================================================================== */}
      {/* MODAL 1: XÁC NHẬN GỬI DANH SÁCH LÊN THÀNH PHỐ (LEAN-4.1) */}
      {/* ===================================================================== */}
      {isBatchConfirmOpen && (
        <Dialog
          isOpen={isBatchConfirmOpen}
          onClose={isConfirmingBatch ? () => {} : onCloseBatchConfirm}
          title="Xác nhận gửi danh sách lên Thành phố"
          description={`Xác nhận gửi ${selectedApps.length} hồ sơ của ${unitName} lên Hội Sinh viên Thành phố?`}
          maxWidth="max-w-2xl"
          primaryAction={{
            label: isConfirmingBatch ? 'Đang gửi...' : 'Xác nhận gửi',
            onClick: onConfirmBatchForward,
            variant: 'primary',
            isLoading: isConfirmingBatch,
          }}
          secondaryAction={{
            label: 'Quay lại',
            onClick: onCloseBatchConfirm,
          }}
        >
          <div className="space-y-3.5 pt-1 text-[#172A3A]">
            {/* Warning Callout */}
            <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] flex items-start gap-2.5 text-[12.5px] text-[#92400E]">
              <AlertTriangle size={16} className="text-[#D97706] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                Mỗi đơn vị chỉ được gửi danh sách một lần duy nhất trong năm học. Sau khi gửi, danh sách đề xuất và văn bản đính kèm sẽ được cố định và chuyển sang Hội đồng Thành phố thẩm định.
              </div>
            </div>

            {/* Scope & Award Season Metadata */}
            <div className="grid grid-cols-2 gap-2.5 text-[12px]">
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px]">
                <span className="text-[#64748B] text-[11px] font-semibold block">
                  Đơn vị sơ tuyển:
                </span>
                <span className="font-bold text-[#0F172A] mt-0.5 block truncate">
                  {unitName}
                </span>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px]">
                <span className="text-[#64748B] text-[11px] font-semibold block">
                  Năm học xét chọn:
                </span>
                <span className="font-bold text-[#0F172A] mt-0.5 block">
                  {normalizedSeason}
                </span>
              </div>
            </div>

            {/* Attached Decision Document Reference */}
            {decisionDoc && (
              <div className="p-2.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-[8px] flex items-center justify-between gap-3 text-[12px]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-[6px] bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                    <FileCheck2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#15803D] truncate">
                      {decisionDoc.decisionNumber ? `Văn bản số ${decisionDoc.decisionNumber}` : 'Văn bản đề nghị xét chọn (.PDF)'}
                    </div>
                    <div className="text-[11px] text-[#166534] truncate">
                      {decisionDoc.fileName}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-white text-[#15803D] rounded border border-[#86EFAC] shrink-0">
                  Đã đính kèm tệp PDF
                </span>
              </div>
            )}

            {/* Member Institution Breakdown (Collapsible if multiple institutions) */}
            {institutionBreakdown.length > 1 && (
              <div className="border border-[#E2E8F0] rounded-[8px] overflow-hidden text-[12px]">
                <button
                  type="button"
                  onClick={() => setShowBreakdown((prev) => !prev)}
                  className="w-full px-3 py-2 bg-[#FAFCFE] flex items-center justify-between text-[#0D78AE] font-semibold hover:bg-[#F0F6FA] cursor-pointer"
                >
                  <span>Phân bổ theo trường thành viên ({selectedApps.length} hồ sơ)</span>
                  <span className="text-[11px] text-[#64748B]">
                    {showBreakdown ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
                  </span>
                </button>
                {showBreakdown && (
                  <div className="p-2 bg-white space-y-1 max-h-28 overflow-y-auto divide-y divide-[#F1F5F9]">
                    {institutionBreakdown.map((item) => (
                      <div
                        key={item.id}
                        className="pt-1 flex items-center justify-between text-[11.5px]"
                      >
                        <span className="text-[#334155] truncate pr-2">
                          {item.name}
                        </span>
                        <span className="font-bold font-mono text-[#0D78AE]">
                          {item.count} hồ sơ
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Accurate List of Selected Students (LEAN-4.1 requirement) */}
            <div className="border border-[#E2E8F0] rounded-[8px] overflow-hidden text-[12px]">
              <div className="bg-[#F8FAFC] px-3 py-2 font-bold text-[#526B7C] border-b border-[#E2E8F0] flex justify-between items-center">
                <span>Danh sách sinh viên đề xuất ({selectedApps.length} hồ sơ)</span>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-[#F1F5F9] bg-white">
                {selectedApps.length === 0 ? (
                  <div className="p-4 text-center text-[#94A3B8]">
                    Chưa có hồ sơ nào được chọn
                  </div>
                ) : (
                  selectedApps.map((app, idx) => (
                    <div
                      key={app.applicationId}
                      className="px-3 py-2 flex items-center justify-between text-[12px] hover:bg-[#F9FCFE]"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="text-[#94A3B8] font-mono tabular-nums w-5 text-right shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="font-bold text-[#0F172A] truncate">
                          {app.student?.fullName || 'Sinh viên'}
                        </span>
                        <span className="text-[#64748B] font-mono text-[11.5px] shrink-0">
                          ({app.student?.studentCode || '—'})
                        </span>
                      </div>
                      <span className="text-[#0D78AE] font-medium text-[11.5px] truncate max-w-[220px] shrink-0">
                        {app.institution?.officialName || 'Đơn vị đào tạo'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Optional Forwarding Note */}
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#172A3A] block">
                Ghi chú kèm theo danh sách (tùy chọn):
              </label>
              <textarea
                rows={2}
                value={forwardBatchNote}
                onChange={(e) => onSetForwardBatchNote(e.target.value)}
                placeholder="Ghi chú thêm nếu cần lưu ý với Hội đồng xét chọn cấp Thành phố..."
                className="w-full p-2 text-[12px] border border-[#DCE7EE] rounded-[8px] bg-white focus:outline-none focus:border-[#0D78AE]"
              />
            </div>
          </div>
        </Dialog>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: XEM TRƯỚC VĂN BẢN QUYẾT ĐỊNH CHÍNH THỨC */}
      {/* ===================================================================== */}
      {previewDecisionDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={onCloseDecisionDocPreview}
            aria-hidden="true"
          />

          <div
            className="relative z-10 w-full max-w-3xl bg-white rounded-[16px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0F2335] text-white flex items-center justify-between border-b border-[#223B4E]">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-[#38BDF8]" />
                <div>
                  <h3 className="font-bold text-[14.5px]">
                    Xem trước Văn bản Quyết định đề nghị xét chọn
                  </h3>
                  <p className="text-[12px] text-[#94A3B8]">
                    {previewDecisionDoc.decisionNumber ? `Số hiệu: ${previewDecisionDoc.decisionNumber} · ` : ''}
                    {previewDecisionDoc.fileName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseDecisionDocPreview}
                className="text-[#94A3B8] hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Đóng xem trước"
              >
                <X size={18} />
              </button>
            </div>

            {/* Document Body (Simulated Vietnamese Official Letterhead) */}
            <div className="p-8 overflow-y-auto flex-1 bg-[#F1F5F9]">
              <div className="max-w-[680px] mx-auto bg-white rounded-md shadow-md p-8 sm:p-12 text-[#1E293B] border border-[#CBD5E1] space-y-6 font-serif">
                {/* Official Letterhead */}
                <div className="flex items-start justify-between text-center pb-4 border-b border-gray-300 gap-4">
                  <div className="w-1/2 text-left">
                    <div className="text-[12px] font-bold uppercase tracking-wider text-gray-700">
                      ỦY BAN NHÂN DÂN THÀNH PHỐ ĐÀ NẴNG
                    </div>
                    <div className="text-[13px] font-extrabold uppercase text-[#0B64A0] mt-0.5">
                      {unitName.toUpperCase()}
                    </div>
                    {previewDecisionDoc.decisionNumber && (
                      <div className="text-[12px] text-gray-600 font-mono mt-1">
                        Số: {previewDecisionDoc.decisionNumber}
                      </div>
                    )}
                  </div>

                  <div className="w-1/2 text-center">
                    <div className="text-[12px] font-bold uppercase text-gray-800">
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                    </div>
                    <div className="text-[12.5px] font-bold text-gray-800 underline underline-offset-4 decoration-1">
                      Độc lập – Tự do – Hạnh phúc
                    </div>
                    <div className="text-[11.5px] italic text-gray-600 mt-2">
                      Đà Nẵng, ngày{' '}
                      {previewDecisionDoc.decisionDate
                        ? new Date(previewDecisionDoc.decisionDate).getDate()
                        : 18}{' '}
                      tháng{' '}
                      {previewDecisionDoc.decisionDate
                        ? new Date(previewDecisionDoc.decisionDate).getMonth() + 1
                        : 10}{' '}
                      năm{' '}
                      {previewDecisionDoc.decisionDate
                        ? new Date(previewDecisionDoc.decisionDate).getFullYear()
                        : 2026}
                    </div>
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center space-y-1.5 pt-2">
                  <h2 className="text-[18px] font-extrabold uppercase text-gray-900 tracking-wide">
                    QUYẾT ĐỊNH
                  </h2>
                  <p className="text-[13.5px] font-bold text-gray-700 max-w-lg mx-auto">
                    {previewDecisionDoc.decisionTitle ||
                      `Về việc đề xuất danh sách sinh viên đạt danh hiệu "Sinh viên 5 tốt" cấp Thành phố ${normalizedSeason}`}
                  </p>
                </div>

                {/* Preamble */}
                <div className="space-y-2 text-[12.5px] leading-relaxed text-gray-700 italic">
                  <p>
                    - Căn cứ Hướng dẫn liên tịch số 02-HD/TWHSV về tiêu chuẩn xét chọn danh hiệu &quot;Sinh viên 5 tốt&quot; cấp Thành phố;
                  </p>
                  <p>
                    - Căn cứ kết quả xét sơ tuyển của Hội đồng sơ duyệt các trường đại học thành viên và đơn vị trực thuộc;
                  </p>
                  <p>
                    - Xét đề nghị của Ban Thư ký Hội Sinh viên {unitName},
                  </p>
                </div>

                {/* Resolves */}
                <div className="space-y-3 pt-2 text-[13px] text-gray-900">
                  <div className="font-bold uppercase text-center text-[14px]">
                    QUYẾT ĐỊNH:
                  </div>
                  <p>
                    <strong>Điều 1.</strong> Thống nhất đề xuất Hội Sinh viên Việt Nam TP. Đà Nẵng xét chọn danh hiệu &quot;Sinh viên 5 tốt&quot; cấp Thành phố {normalizedSeason} cho các cá nhân sinh viên tiêu biểu thuộc danh sách kèm theo Quyết định này.
                  </p>
                  <p>
                    <strong>Điều 2.</strong> Ban Thư ký Hội Sinh viên và các đơn vị trực thuộc {unitName} chịu trách nhiệm thi hành Quyết định này./.
                  </p>
                </div>

                {/* Sign-off & Digital Stamp */}
                <div className="pt-8 flex justify-between items-end">
                  <div className="text-[11.5px] text-gray-500 italic space-y-0.5">
                    <div>Nơi nhận:</div>
                    <div>- Hội Sinh viên TP. Đà Nẵng (báo cáo);</div>
                    <div>- Các trường thành viên (thực hiện);</div>
                    <div>- Lưu: VT, HSV.</div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="text-[12.5px] font-bold uppercase text-gray-800">
                      {previewDecisionDoc.signedByTitle || 'GIÁM ĐỐC'}
                    </div>
                    <div className="text-[11px] italic text-[#16A34A] py-3 flex items-center justify-center gap-1">
                      <ShieldCheck size={16} />
                      <span>Đã ký số xác thực (Digital Signature)</span>
                    </div>
                    <div className="text-[13.5px] font-bold text-gray-900">
                      {previewDecisionDoc.signedByName || 'PGS.TS. Nguyễn Ngọc Vũ'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-[12px] text-gray-500 font-mono">
                Tệp: {previewDecisionDoc.fileName} (
                {(previewDecisionDoc.fileSize / (1024 * 1024)).toFixed(1)} MB)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onCloseDecisionDocPreview}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: BẢN LƯU VẾT XÉT SƠ TUYỂN CẤP TRƯỜNG (SNAPSHOT) */}
      {/* ===================================================================== */}
      {snapshotModalApp && (
        <Dialog
          isOpen={Boolean(snapshotModalApp)}
          onClose={onCloseSnapshotModal}
          title="Bản lưu vết xét sơ tuyển cấp Trường"
          description="Bản ghi nhận trạng thái đánh giá và nhận xét của cấp Trường tại thời điểm bàn giao lên cấp Thành phố."
          maxWidth="max-w-xl"
          secondaryAction={{
            label: 'Đóng',
            onClick: onCloseSnapshotModal,
          }}
        >
          <div className="space-y-4 pt-1 text-[#172A3A]">
            <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-mono font-bold text-[#0D78AE]">
                  {snapshotModalApp.applicationId}
                </span>
                <span className="font-bold text-[#16A34A] text-[11.5px]">
                  Đã chuyển cấp Thành phố
                </span>
              </div>
              <div className="text-[14px] font-bold text-[#0F2335]">
                {snapshotModalApp.student.fullName} (MSSV: {snapshotModalApp.student.studentCode})
              </div>
              <div className="text-[12px] text-[#526B7C]">
                {snapshotModalApp.institution.officialName} · Năm học {snapshotModalApp.schoolYear}
              </div>
            </div>

            {/* Criteria Outcomes Snapshot */}
            <div className="space-y-2">
              <span className="text-[12.5px] font-bold text-[#0F2335] block">
                Kết quả đánh giá 5 tiêu chí:
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-[12px]">
                {(() => {
                  const summary = getApplicationCriteriaSummary(snapshotModalApp);
                  return CRITERIA_LIST.map((crit) => {
                    const item = summary.items.find(
                      (i) => i.criterionId === crit.id
                    );
                    const isPassed = item?.status === 'passed';
                    const isFailed = item?.status === 'failed';
                    return (
                      <div
                        key={crit.id}
                        className="p-2 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between"
                      >
                        <span className="font-medium text-[#1E293B]">
                          Tiêu chí {crit.number}: {crit.name}
                        </span>
                        <span
                          className={`font-bold text-[11.5px] ${
                            isPassed
                              ? 'text-[#16A34A]'
                              : isFailed
                              ? 'text-[#DC2626]'
                              : 'text-[#64748B]'
                          }`}
                        >
                          {isPassed ? 'Đạt' : isFailed ? 'Chưa đạt' : 'Đang xét'}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {snapshotModalApp.schoolReviewSummary?.officerNotes && (
              <div className="p-3 bg-[#F0FDF4] border border-[#DCFCE7] rounded-[8px] text-[12px] text-[#15803D]">
                <span className="font-bold block mb-0.5">Nhận xét của đơn vị:</span>
                <span>{snapshotModalApp.schoolReviewSummary.officerNotes}</span>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
};
