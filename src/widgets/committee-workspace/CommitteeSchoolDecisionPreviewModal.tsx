/**
 * 5TOT Đà Nẵng — Committee School Common Decision Preview Modal (SRW-4 Section 11)
 * Displays the authoritative School Decision document from the forwarded batch
 * (e.g. Quyết định số 182/QĐ-ĐHĐN của Đại học Đà Nẵng).
 */

import React from 'react';
import { X, FileText, Download, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/buttons/Button';

export interface CommitteeSchoolDecisionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionNumber?: string;
  unitName?: string;
}

export const CommitteeSchoolDecisionPreviewModal: React.FC<
  CommitteeSchoolDecisionPreviewModalProps
> = ({
  isOpen,
  onClose,
  decisionNumber = '182/QĐ-ĐHĐN',
  unitName = 'Đại học Đà Nẵng',
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Văn bản Quyết định từ cơ sở"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2335]/50 backdrop-blur-[2px]"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-3xl bg-white rounded-[16px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F2335] text-white flex items-center justify-between border-b border-[#223B4E]">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-[#38BDF8]" />
            <div>
              <h3 className="font-bold text-[14.5px]">
                Quyết định đề xuất danh sách xét chọn — {unitName}
              </h3>
              <p className="text-[12px] text-[#94A3B8]">
                Số hiệu: {decisionNumber} · Văn bản đính kèm đợt chuyển cấp Thành phố
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng xem trước"
          >
            <X size={18} />
          </button>
        </div>

        {/* Document Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-[#F1F5F9]">
          <div className="max-w-[680px] mx-auto bg-white rounded-md shadow-md p-8 sm:p-12 text-[#1E293B] border border-[#CBD5E1] space-y-6 font-serif">
            <div className="flex items-start justify-between text-center pb-4 border-b border-gray-300 gap-4">
              <div className="w-1/2 text-left">
                <div className="text-[12px] font-bold uppercase tracking-wider text-gray-700">
                  ỦY BAN NHÂN DÂN THÀNH PHỐ ĐÀ NẴNG
                </div>
                <div className="text-[13px] font-extrabold uppercase text-[#0B64A0] mt-0.5">
                  {unitName.toUpperCase()}
                </div>
                <div className="text-[12px] text-gray-600 font-mono mt-1">
                  Số: {decisionNumber}
                </div>
              </div>

              <div className="w-1/2 text-center">
                <div className="text-[12px] font-bold uppercase text-gray-800">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="text-[12.5px] font-bold text-gray-800 underline underline-offset-4 decoration-1">
                  Độc lập – Tự do – Hạnh phúc
                </div>
                <div className="text-[11.5px] italic text-gray-600 mt-2">
                  Đà Nẵng, ngày 18 tháng 10 năm 2026
                </div>
              </div>
            </div>

            <div className="text-center space-y-2 pt-2">
              <h2 className="text-[16px] font-bold uppercase tracking-wide text-gray-900">
                QUYẾT ĐỊNH
              </h2>
              <div className="text-[13px] font-semibold text-gray-700 italic max-w-[480px] mx-auto">
                Về việc đề xuất danh sách sinh viên đạt tiêu chuẩn danh hiệu &ldquo;Sinh viên 5 tốt&rdquo; cấp Thành phố năm học 2025–2026
              </div>
            </div>

            <div className="text-[13px] leading-relaxed space-y-3 text-justify text-gray-800">
              <p>
                - Căn cứ Hướng dẫn liên tịch số 42/HDLT-TĐ-HSV giữa Thành Đoàn Đà Nẵng và Hội Sinh viên Việt Nam thành phố Đà Nẵng về việc xét chọn danh hiệu &ldquo;Sinh viên 5 tốt&rdquo; năm học 2025–2026;
              </p>
              <p>
                - Căn cứ kết quả thẩm định sơ tuyển cấp Trường của Hội đồng xét chọn Đại học Đà Nẵng bao gồm các trường đại học thành viên,
              </p>

              <div className="text-center font-bold text-[14px] uppercase pt-2">
                QUYẾT NGHỊ:
              </div>

              <p>
                <strong>Điều 1.</strong> Đề xuất Hội đồng xét chọn cấp Thành phố — Hội Sinh viên Việt Nam thành phố Đà Nẵng xem xét, công nhận danh hiệu &ldquo;Sinh viên 5 tốt&rdquo; cấp Thành phố năm học 2025–2026 đối với các sinh viên đủ điều kiện theo danh sách đính kèm.
              </p>
              <p>
                <strong>Điều 2.</strong> Hồ sơ đề xuất của các cá nhân đính kèm đã được kiểm tra tính hợp lệ và nguyên trạng minh chứng theo đúng Quy chế xét chọn hiện hành.
              </p>
            </div>

            <div className="pt-6 flex justify-between items-end border-t border-gray-200 text-[12.5px]">
              <div className="text-left text-gray-600 italic text-[11.5px]">
                <div>Nơi nhận:</div>
                <div>- Hội Sinh viên TP Đà Nẵng;</div>
                <div>- Ban Giám đốc ĐHĐN;</div>
                <div>- Lưu: VT, ĐTN.</div>
              </div>

              <div className="text-center">
                <div className="font-bold uppercase text-gray-800">
                  GIÁM ĐỐC ĐẠI HỌC ĐÀ NẴNG
                </div>
                <div className="text-[11px] italic text-gray-500 my-4">
                  (Đã ký điện tử &amp; đóng dấu)
                </div>
                <div className="font-bold text-[#0B64A0] text-[13.5px]">
                  PGS.TS. Nguyễn Ngọc Vũ
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] text-[#16A34A] font-semibold">
            <CheckCircle2 size={15} />
            <span>Văn bản đề xuất hợp lệ · Khóa đồng bộ theo đợt UDN</span>
          </div>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
