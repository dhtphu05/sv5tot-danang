/**
 * 5TOT Đại học Đà Nẵng — Modal kiểm tra và xác nhận nộp hồ sơ Giải thưởng "Cánh chim trắng"
 * Căn cứ Quy chế Giải thưởng ban hành kèm theo Quyết định số 14-QĐ/ĐHĐN-HSV ngày 04/10/2022
 * của Ban Thư ký Hội Sinh viên Việt Nam Đại học Đà Nẵng.
 *
 * Thiết kế lại hoàn chỉnh:
 * 1. Thông tin hồ sơ chuẩn bị nộp (Nổi bật tên hồ sơ, đối tượng, đơn vị, năm học).
 * 2. Bảng kiểm tra thành phần hồ sơ (WB01, WB02, WB03 theo đúng quy chế từng hạng mục,
 *    trạng thái kê khai, số tệp thực tế, hành động Kiểm tra/Chỉnh sửa).
 * 3. Sau khi nộp (Giải thích rõ 3 hậu quả thực tế về tiếp nhận, tạm khóa chỉnh sửa và theo dõi).
 * 4. Xử lý cảnh báo (Hồ sơ hoàn thành, Hồ sơ chưa hoàn thành, Cảnh báo hỗ trợ kiểm tra hình thức).
 * 5. Footer (Quay lại chỉnh sửa, Xác nhận nộp hồ sơ với loading, chống double-submit, hiển thị lỗi).
 */

import React, { useEffect, useRef } from 'react';
import {
  Send,
  X,
  FileCheck2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderOpen,
  Calendar,
  Building2,
  Users,
  User,
  Loader2,
  Eye,
  ArrowRight,
  Info,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Button } from '../buttons/Button';
import {
  WhiteBirdApplication,
  WhiteBirdCategoryMeta,
  WhiteBirdRequirementId,
} from './whiteBirdTypes';
import { WhiteBirdReadinessResult } from './whiteBirdStore';

export interface SubmitWhiteBirdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isSubmitting?: boolean;
  application: WhiteBirdApplication;
  readiness: WhiteBirdReadinessResult;
  categoryMeta: WhiteBirdCategoryMeta;
  allEvidenceFilesCount: number;
  onNavigateToRequirement?: (reqId: WhiteBirdRequirementId) => void;
  submissionError?: string | null;
}

interface ComponentCheckItem {
  id: WhiteBirdRequirementId;
  code: string;
  name: string;
  description: string;
  isOptional: boolean;
  isReady: boolean;
  filesCount: number;
  specialNote?: string;
}

export const SubmitWhiteBirdModal: React.FC<SubmitWhiteBirdModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  application,
  readiness,
  categoryMeta,
  allEvidenceFilesCount,
  onNavigateToRequirement,
  submissionError,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key (if not currently submitting)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Focus trap / auto-focus
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isResubmitting = application.status === 'supplement_requested';
  const isIndividual = application.nomineeType === 'INDIVIDUAL';
  const category = application.category;

  // Build checklist items based on category rules
  const checklistItems: ComponentCheckItem[] = [
    {
      id: 'WB01',
      code: 'WB01',
      name: 'Văn bản đề nghị xét trao Giải thưởng',
      description: 'Văn bản của các tổ chức, cá nhân có thẩm quyền theo Điều 5 Quy chế',
      isOptional: false,
      isReady: readiness.wb01Ready,
      filesCount: application.requirements.wb01.evidenceFiles.length,
    },
    {
      id: 'WB02',
      code: 'WB02',
      name:
        category === 'UOM_MAM'
          ? 'Báo cáo thuyết minh mô hình, giải pháp, sáng kiến & Cam kết sáng tạo'
          : category === 'TRUYEN_LUA'
          ? 'Báo cáo thành tích cá nhân theo mẫu'
          : 'Báo cáo thuyết minh dự án, đề tài NCKH, khởi nghiệp & Cam kết bản quyền',
      description:
        category === 'UOM_MAM'
          ? 'Thuyết minh theo 4 tiêu chuẩn (Điểm a khoản 4.2 Điều 4) và cam kết tính sáng tạo theo Khoản 6.1 Điều 6'
          : category === 'TRUYEN_LUA'
          ? 'Quá trình công tác Đoàn - Hội từ 2 năm trở lên và thành tích xuất sắc 2 năm liên tục theo Khoản 6.2 Điều 6'
          : 'Thuyết minh bối cảnh, tính mới, hiệu quả ứng dụng và cam kết bản quyền theo Mẫu báo cáo & Khoản 6.3 Điều 6',
      isOptional: false,
      isReady: readiness.wb02Ready,
      filesCount: application.requirements.wb02.evidenceFiles.length,
    },
    {
      id: 'WB03',
      code: 'WB03',
      name:
        category === 'UOM_MAM'
          ? 'Hình ảnh, sản phẩm minh họa'
          : category === 'TRUYEN_LUA'
          ? 'Tài liệu minh chứng về thông tin chức vụ, bằng khen và thành tích tiêu biểu'
          : 'Minh chứng đạt giải thưởng tại các cuộc thi liên quan',
      description:
        category === 'UOM_MAM'
          ? 'Hình ảnh hoạt động, sản phẩm mẫu, phóng sự hoặc tài liệu minh họa mô hình theo Khoản 6.1 Điều 6'
          : category === 'TRUYEN_LUA'
          ? 'Quyết định công nhận chức vụ Hội/Đoàn, Bằng khen, Giấy khen tiêu biểu các cấp theo Khoản 6.2 Điều 6'
          : 'Bản scan Quyết định khen thưởng hoặc Giấy chứng nhận đạt giải từ cấp Đại học Đà Nẵng trở lên',
      isOptional: readiness.isWb03Optional,
      isReady: readiness.wb03Ready,
      filesCount: application.requirements.wb03.evidenceFiles.length,
      specialNote:
        category === 'TRUYEN_LUA'
          ? 'Quyết định chức vụ từ Chi hội trưởng / Bí thư Chi đoàn trở lên & khen thưởng từ cấp trường trở lên (Khoản 6.2 Điều 6)'
          : category === 'SANG_TAO'
          ? 'Giải thưởng từ cấp Đại học Đà Nẵng trở lên (không dùng giấy chứng nhận tham gia)'
          : category === 'UOM_MAM'
          ? 'Thành phần tùy chọn (nếu có). Không làm giảm tiến độ xét nộp nếu không có minh họa'
          : undefined,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-[2px] p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-white-bird-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-[16px] border border-[#DCE7EE] shadow-2xl w-full max-w-[720px] max-h-[92dvh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 outline-none"
      >
        {/* Fixed Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E2EEF6] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[10px] bg-[#EBF6FC] text-[#0D78AE] flex items-center justify-center shrink-0">
              <FileCheck2 size={20} />
            </div>
            <div className="min-w-0">
              <h2
                id="submit-white-bird-modal-title"
                className="text-[16px] sm:text-[17px] font-bold text-[#172A3A] truncate"
              >
                Kiểm tra & Xác nhận nộp hồ sơ Giải thưởng
              </h2>
              <p className="text-[11.5px] text-[#607483] mt-0.5 truncate">
                Cơ quan tiếp nhận: Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors disabled:opacity-50 shrink-0 ml-2"
            aria-label="Đóng hộp thoại"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* A. THÔNG TIN HỒ SƠ CHUẨN BỊ NỘP */}
          <div className="rounded-[12px] bg-[#F8FBFD] border border-[#DCE7EE] p-4 sm:p-4.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D78AE]">
                Hồ sơ đề nghị xét trao
              </span>
              <span className="text-[11.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF6FC] text-[#0D78AE] border border-[#CDE5F5]">
                {categoryMeta.name}
              </span>
            </div>

            {/* Nomination Title (Prominent, natural wrapping, NO ellipsis) */}
            <div className="text-[16px] sm:text-[17.5px] font-bold text-[#172A3A] leading-snug break-words">
              {application.nominationTitle}
            </div>

            {/* Essential Metadata */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-2 border-t border-[#EDF3F8] text-[12px] text-[#334155]">
              <div className="flex items-center gap-1.5">
                {isIndividual ? (
                  <User size={13.5} className="text-[#0D78AE] shrink-0" />
                ) : (
                  <Users size={13.5} className="text-[#0D78AE] shrink-0" />
                )}
                <span className="text-[#64748B]">Đối tượng:</span>
                <strong className="text-[#172A3A]">
                  {isIndividual ? 'Cá nhân' : 'Tập thể'} ({application.nomineeName})
                </strong>
              </div>

              <div className="flex items-center gap-1.5">
                <Building2 size={13.5} className="text-[#0D78AE] shrink-0" />
                <span className="text-[#64748B]">Đơn vị:</span>
                <span className="font-semibold text-[#172A3A]">
                  {application.institutionName}
                  {application.facultyName ? ` — ${application.facultyName}` : ''}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar size={13.5} className="text-[#0D78AE] shrink-0" />
                <span className="text-[#64748B]">Mùa xét:</span>
                <span className="font-semibold text-[#172A3A]">
                  {application.academicYear || '2025–2026'}
                </span>
              </div>

              {application.requirements.wb01.nominatingUnitName && (
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13.5} className="text-[#0D78AE] shrink-0" />
                  <span className="text-[#64748B]">Đề xuất (Điều 5):</span>
                  <span className="font-semibold text-[#172A3A] truncate max-w-[240px]">
                    {application.requirements.wb01.nominatingUnitName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* B. KIỂM TRA THÀNH PHẦN HỒ SƠ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-[#EDF3F8] pb-2">
              <div>
                <h3 className="text-[13.5px] font-bold text-[#172A3A] uppercase tracking-wide">
                  Kiểm tra thành phần hồ sơ (Điều 6 Quy chế)
                </h3>
                <p className="text-[11.5px] text-[#607483] mt-0.5">
                  Đối chiếu tình trạng kê khai và tệp minh chứng đính kèm thực tế trước khi gửi
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-[#64748B] block">Tiến độ bắt buộc</span>
                <span
                  className={`text-[13px] font-bold ${
                    readiness.canSubmit ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {readiness.readyCount}/{readiness.totalRequired} hoàn thành
                </span>
              </div>
            </div>

            {/* Checklist Rows */}
            <div className="space-y-2.5">
              {checklistItems.map((item) => {
                const hasFiles = item.filesCount > 0;
                const isReady = item.isReady;

                return (
                  <div
                    key={item.id}
                    className={`rounded-[10px] p-3.5 border transition-all ${
                      item.isOptional
                        ? 'bg-[#FBFDFE] border-[#DCE7EE]'
                        : isReady
                        ? 'bg-white border-[#DCE7EE]'
                        : 'bg-[#FFFDFB] border-[#F8D7DA]/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Left: Code, Name, Details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-extrabold text-[#0D78AE]">
                            {item.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.isOptional
                                ? 'bg-[#F1F5F9] text-[#475569]'
                                : 'bg-[#EBF6FC] text-[#0D78AE]'
                            }`}
                          >
                            {item.isOptional ? 'Tùy chọn' : 'Bắt buộc'}
                          </span>
                          <span className="text-[13px] font-bold text-[#172A3A] leading-snug">
                            {item.name}
                          </span>
                        </div>

                        <p className="text-[11.5px] text-[#607483] leading-relaxed">
                          {item.description}
                        </p>

                        {/* Special Note (if any) */}
                        {item.specialNote && (
                          <div className="text-[11px] text-[#0D5C8C] flex items-center gap-1 font-medium pt-0.5">
                            <Info size={12} className="shrink-0 text-[#0D78AE]" />
                            <span>{item.specialNote}</span>
                          </div>
                        )}

                        {/* Actual Attached Files Metric */}
                        <div className="pt-0.5 flex items-center gap-1.5 text-[11px]">
                          {hasFiles ? (
                            <span className="font-semibold text-[#0D78AE] inline-flex items-center gap-1">
                              <FolderOpen size={12.5} />
                              {item.filesCount} tệp đính kèm thực tế
                            </span>
                          ) : (
                            <span className="text-[#94A3B8] inline-flex items-center gap-1">
                              <FolderOpen size={12.5} />
                              Chưa có tệp đính kèm
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Status badge & Jump/Edit button */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EDF3F8]">
                        {/* Status Label */}
                        <div>
                          {item.isOptional ? (
                            hasFiles ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF6FC] text-[#0D78AE] border border-[#BAE6FD]">
                                <CheckCircle2 size={12} />
                                Đã đính kèm minh họa
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                                Tùy chọn (Chưa có tệp)
                              </span>
                            )
                          ) : isReady ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={12} />
                              Đã kê khai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock size={12} />
                              Chưa hoàn thành
                            </span>
                          )}
                        </div>

                        {/* Navigate Action Button */}
                        {onNavigateToRequirement && (
                          <button
                            type="button"
                            onClick={() => onNavigateToRequirement(item.id)}
                            className={`px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                              !isReady && !item.isOptional
                                ? 'bg-amber-100/70 hover:bg-amber-100 text-amber-800'
                                : 'bg-[#F1F5F9] hover:bg-[#E2EEF6] text-[#334155]'
                            }`}
                          >
                            {!isReady && !item.isOptional ? (
                              <>
                                <span>Chỉnh sửa</span>
                                <ArrowRight size={11} />
                              </>
                            ) : (
                              <>
                                <Eye size={11} />
                                <span>Kiểm tra</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alert Experience: Ready vs Incomplete */}
            {readiness.canSubmit ? (
              <div className="p-3.5 rounded-[10px] bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-[12px] flex items-start gap-2.5 leading-relaxed">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-emerald-800 mb-0.5">
                    Hồ sơ đã hoàn thành đầy đủ các thành phần bắt buộc ({readiness.readyCount}/{readiness.totalRequired}):
                  </span>
                  Các trường thông tin và {allEvidenceFilesCount} tệp minh chứng đính kèm đã đáp ứng điều kiện hình thức để nộp về Cơ quan Thường trực Giải thưởng.
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-[10px] bg-amber-50 border border-amber-200 text-amber-900 text-[12px] space-y-2 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                  <span>Hồ sơ chưa đủ điều kiện nộp ({readiness.readyCount}/{readiness.totalRequired} thành phần bắt buộc):</span>
                </div>
                <ul className="space-y-1.5 text-[11.5px] text-amber-900">
                  {readiness.missingReasons.map((reason, idx) => {
                    const targetReqId: WhiteBirdRequirementId | null =
                      reason.startsWith('WB01')
                        ? 'WB01'
                        : reason.startsWith('WB02')
                        ? 'WB02'
                        : reason.startsWith('WB03')
                        ? 'WB03'
                        : null;
                    return (
                      <li key={idx} className="flex items-start justify-between gap-2 bg-white/70 p-1.5 rounded-[6px] border border-amber-200/60">
                        <span className="flex-1 leading-snug">• {reason}</span>
                        {targetReqId && onNavigateToRequirement && (
                          <button
                            type="button"
                            onClick={() => onNavigateToRequirement(targetReqId)}
                            className="shrink-0 text-[11px] font-bold text-[#0D78AE] hover:underline cursor-pointer inline-flex items-center gap-0.5"
                          >
                            <span>Bổ sung {targetReqId}</span>
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Note on Formal Check vs Content Review */}
            <div className="p-2.5 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] flex items-start gap-2 leading-relaxed">
              <ShieldCheck size={14} className="text-[#0D78AE] shrink-0 mt-0.5" />
              <div>
                <strong>Lưu ý về minh chứng:</strong> Hệ thống thực hiện kiểm tra điều kiện hình thức (số lượng tệp và trường bắt buộc); tính hợp lệ chuyên môn của chữ ký, con dấu và quyết định công nhận sẽ do Hội đồng xét duyệt thẩm định sau khi tiếp nhận.
              </div>
            </div>
          </div>

          {/* C. SAU KHI NỘP (3 ý thực tế, minh bạch về hậu quả nộp hồ sơ) */}
          <div className="rounded-[12px] bg-[#F1F8FD] border border-[#CDE5F5] p-4 text-[12.5px] text-[#1E3A5F] space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-[#0D5C8C]">
              <AlertCircle size={15} className="shrink-0 text-[#0D78AE]" />
              <span>Quy trình tiếp nhận và xử lý sau khi nộp hồ sơ:</span>
            </div>

            <ol className="list-decimal pl-5 space-y-1.5 text-[12px] text-[#1E3A5F] leading-relaxed">
              <li>
                <strong>Cơ quan tiếp nhận:</strong> Hồ sơ được chuyển trực tiếp đến Cơ quan Thường trực Giải thưởng: <strong>Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng</strong> để phân công cán bộ thẩm định.
              </li>
              <li>
                <strong>Trạng thái & Quyền chỉnh sửa:</strong> Hồ sơ chuyển từ trạng thái <em>Bản nháp</em> sang <em>Đã nộp / Đang thẩm định</em> và tạm khóa chỉnh sửa; sinh viên sẽ được mở khóa bổ sung nếu Cơ quan Thường trực gửi yêu cầu bổ sung hồ sơ.
              </li>
              <li>
                <strong>Theo dõi tiến độ:</strong> Sinh viên theo dõi tiến độ thẩm định, thông báo bổ sung và quyết định công nhận tại mục <strong>“Kết quả xét trao”</strong> trên hệ thống.
              </li>
            </ol>
          </div>

          {/* Error Message Alert (if submission failed) */}
          {submissionError && (
            <div className="p-3 rounded-[9px] bg-red-50 border border-red-200 text-red-700 text-[12px] flex items-start gap-2">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Không thể nộp hồ sơ:</strong>
                {submissionError}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#E2EEF6] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-[12px] text-[#64748B]">
            {readiness.canSubmit ? (
              <span className="font-semibold text-emerald-700 inline-flex items-center gap-1">
                <CheckCircle2 size={13} />
                Đủ điều kiện nộp ({readiness.readyCount}/{readiness.totalRequired} thành phần)
              </span>
            ) : (
              <span className="font-semibold text-amber-700 inline-flex items-center gap-1">
                <AlertTriangle size={13} />
                Chưa hoàn tất thành phần bắt buộc ({readiness.readyCount}/{readiness.totalRequired})
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-[13px]"
            >
              Quay lại chỉnh sửa
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isSubmitting || !readiness.canSubmit}
              onClick={onConfirm}
              className="px-5 py-2 text-[13px] font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="mr-2 animate-spin" />
                  Đang nộp hồ sơ...
                </>
              ) : (
                <>
                  <Send size={15} className="mr-1.5" />
                  {isResubmitting ? 'Xác nhận gửi lại hồ sơ' : 'Xác nhận nộp hồ sơ'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
