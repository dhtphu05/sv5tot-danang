/**
 * 5TOT Đà Nẵng — Official Regulations & Operational Guidance Modal
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Provides immediate access to official City-level selection criteria (14-HD/BTK-HSVTP),
 * dossier rules, and evidence submission instructions directly from the public portal.
 */

import React, { useEffect } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Building2,
  ClipboardCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { CRITERIA } from '../../../tokens';

export interface OfficialGuidanceModalProps {
  isOpen: boolean;
  activeTab: 'criteria' | 'guide';
  onTabChange: (tab: 'criteria' | 'guide') => void;
  onClose: () => void;
  onStartApplication: () => void;
}

const CRITERIA_REGULATION_SUMMARY = [
  {
    id: 'ethics',
    number: '01',
    name: 'Tiêu chí Đạo đức tốt',
    accentColor: CRITERIA.ethics.accentColor,
    mandatory: [
      'Điểm rèn luyện trung bình năm học đạt từ 80/100 điểm trở lên (hoặc xếp loại Tốt trở lên đối với các trường không chấm thang điểm 100).',
      'Không vi phạm pháp luật và các quy chế, nội quy của nhà trường, quy định của địa phương và cộng đồng.',
    ],
    supplementary:
      'Đạt ít nhất 01 điều kiện tự chọn: Tham gia cuộc thi tìm hiểu chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh hoặc đạt danh hiệu “Thanh niên tiên tiến làm theo lời Bác” các cấp.',
  },
  {
    id: 'academic',
    number: '02',
    name: 'Tiêu chí Học tập tốt',
    accentColor: CRITERIA.academic.accentColor,
    mandatory: [
      'Điểm trung bình chung học tập (GPA) cả năm học đạt từ 3.2/4.0 (hoặc 8.0/10.0) trở lên đối với hệ Đại học; từ 2.8/4.0 (hoặc 7.5/10.0) trở lên đối với hệ Cao đẳng.',
    ],
    supplementary:
      'Đạt ít nhất 01 trong 04 điều kiện nghiên cứu khoa học / học thuật: Đề tài NCKH đạt loại Tốt cấp Khoa trở lên, bài báo khoa học, sản phẩm sáng tạo được cấp bằng/giải thưởng, hoặc thành viên đội tuyển thi học thuật cấp Quốc gia/Quốc tế.',
  },
  {
    id: 'physical',
    number: '03',
    name: 'Tiêu chí Thể lực tốt',
    accentColor: CRITERIA.physical.accentColor,
    mandatory: [
      'Đạt ít nhất 01 trong 02 điều kiện: Đạt danh hiệu “Sinh viên khỏe” từ cấp Trường trở lên HOẶC đạt giải tại các giải thể thao phong trào từ cấp Trường trở lên (đối với sinh viên khuyết tật áp dụng hướng dẫn rèn luyện riêng).',
    ],
    supplementary:
      'Khuyến khích duy trì rèn luyện thể dục thể thao định kỳ tại câu lạc bộ hoặc đội tuyển thể thao sinh viên.',
  },
  {
    id: 'volunteer',
    number: '04',
    name: 'Tiêu chí Tình nguyện tốt',
    accentColor: CRITERIA.volunteer.accentColor,
    mandatory: [
      'Đạt ít nhất 01 trong 02 điều kiện: Tham gia ít nhất 05 ngày tình nguyện/năm học có xác nhận của Đoàn Thanh niên – Hội Sinh viên HOẶC được khen thưởng từ cấp Khoa/Trường trở lên về hoạt động tình nguyện.',
    ],
    supplementary:
      'Tính theo các chiến dịch Mùa hè xanh, Tiếp sức mùa thi, Xuân tình nguyện, Chủ nhật xanh và các hoạt động tình nguyện vì cộng đồng trong năm học.',
  },
  {
    id: 'integration',
    number: '05',
    name: 'Tiêu chí Hội nhập tốt',
    accentColor: CRITERIA.integration.accentColor,
    mandatory: [
      'Đạt chuẩn ngoại ngữ (chứng chỉ trình độ B1 trở lên hoặc tương đương, hoặc GPA các học phần ngoại ngữ trong năm học đạt >= 3.2/4.0 đối với hệ Đại học, >= 2.8/4.0 đối với hệ Cao đẳng).',
      'Và đạt ít nhất 01 điều kiện kỹ năng / hội nhập: Hoàn thành tối thiểu 01 khóa trang bị kỹ năng thực hành xã hội hoặc được khen thưởng cấp Trường trở lên, HOẶC tham gia ít nhất 01 hoạt động hội nhập quốc tế / thi Olympic Tiếng Anh đạt giải.',
    ],
    supplementary:
      'Ưu tiên xét chọn đối với sinh viên có thêm các thành tích đặc biệt xuất sắc, hiến máu tình nguyện, cán bộ Đoàn – Hội tiêu biểu hoặc giải thưởng sáng tạo trẻ.',
  },
];

export const OfficialGuidanceModal: React.FC<OfficialGuidanceModalProps> = ({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  onStartApplication,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="official-guidance-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2231]/55 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[820px] max-h-[88vh] bg-white rounded-[12px] border border-[#CFE0EC] shadow-elevated flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Masthead */}
        <div className="px-6 py-4 bg-[#F5F9FC] border-b border-[#CFE0EC] flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="text-[10.5px] font-extrabold uppercase tracking-[0.07em] text-[#126A9C]">
              THÀNH ĐOÀN ĐÀ NẴNG · HỘI SINH VIÊN VIỆT NAM TP. ĐÀ NẴNG
            </div>
            <h2
              id="official-guidance-modal-title"
              className="text-[17px] font-extrabold text-[#172A3A] mt-0.5"
            >
              Văn bản quy định & Hướng dẫn kê khai hồ sơ xét duyệt cấp Thành phố
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ hướng dẫn"
            className="p-1.5 rounded-[8px] text-[#466474] hover:text-[#172A3A] hover:bg-[#E6EFF5] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 bg-white border-b border-[#DCE7EE] flex items-center gap-6 shrink-0">
          <button
            type="button"
            onClick={() => onTabChange('criteria')}
            className={`py-3 text-[13px] font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'criteria'
                ? 'border-[#126A9C] text-[#126A9C]'
                : 'border-transparent text-[#466474] hover:text-[#172A3A]'
            }`}
          >
            01. Tóm tắt 05 tiêu chuẩn xét chọn
          </button>
          <button
            type="button"
            onClick={() => onTabChange('guide')}
            className={`py-3 text-[13px] font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-[#126A9C] text-[#126A9C]'
                : 'border-transparent text-[#466474] hover:text-[#172A3A]'
            }`}
          >
            02. Quy trình kê khai & Nộp minh chứng trực tuyến
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-[13px] text-[#2B4356]">
          {activeTab === 'criteria' ? (
            <>
              <div className="p-3.5 rounded-[8px] bg-[#F3F8FC] border border-[#CFE0EC] flex items-start gap-2.5">
                <Info
                  size={16}
                  className="text-[#126A9C] shrink-0 mt-0.5"
                />
                <div className="leading-relaxed">
                  <span className="font-bold text-[#172A3A]">
                    Căn cứ Hướng dẫn số 14-HD/BTK-HSVTP xét chọn danh hiệu “Sinh viên 5 tốt” cấp Thành phố Đà Nẵng năm học 2025–2026:
                  </span>{' '}
                  Sinh viên đề nghị xét chọn tại 31 cơ sở đào tạo trên địa bàn Thành phố cần hoàn thành kê khai trực tuyến đầy đủ cả 05 tiêu chí và đính kèm tệp minh chứng có xác nhận hợp lệ.
                </div>
              </div>

              <div className="space-y-3">
                {CRITERIA_REGULATION_SUMMARY.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[9px] border border-[#DCE7EE] bg-white overflow-hidden"
                  >
                    <div className="px-4 py-2.5 bg-[#F8FBFD] border-b border-[#E6EFF5] flex items-center gap-2.5">
                      <span
                        className="w-2 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: item.accentColor }}
                      />
                      <span
                        className="text-[12px] font-extrabold tabular-nums"
                        style={{ color: item.accentColor }}
                      >
                        {item.number}
                      </span>
                      <span className="text-[13.5px] font-extrabold text-[#172A3A]">
                        {item.name}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="space-y-1">
                        <div className="text-[11.5px] font-bold uppercase tracking-wider text-[#466474]">
                          Điều kiện bắt buộc:
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-[#172A3A]">
                          {item.mandatory.map((m, idx) => (
                            <li key={idx}>{m}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-1 text-[12.5px] text-[#466474]">
                        <span className="font-bold text-[#172A3A]">
                          Điều kiện tự chọn / bổ trợ:{' '}
                        </span>
                        {item.supplementary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-[9px] border border-[#DCE7EE] bg-[#F8FBFD] space-y-1.5">
                  <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wider text-[#126A9C]">
                    <Building2 size={15} />
                    <span>Bước 1 · Xác thực đơn vị đào tạo</span>
                  </div>
                  <p className="text-[#2B4356] leading-relaxed">
                    Sinh viên đăng ký tài khoản theo đúng cơ sở đào tạo trong 31 Đại học, Học viện, Trường Đại học, Cao đẳng tại Đà Nẵng và mã số sinh viên chính thức.
                  </p>
                </div>

                <div className="p-4 rounded-[9px] border border-[#DCE7EE] bg-[#F8FBFD] space-y-1.5">
                  <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wider text-[#126A9C]">
                    <FileText size={15} />
                    <span>Bước 2 · Kê khai & đính kèm minh chứng</span>
                  </div>
                  <p className="text-[#2B4356] leading-relaxed">
                    Kê khai thông tin theo từng tiêu chí (01–05) và ảnh chân dung 3×4. Mỗi nội dung kê khai đính kèm tệp minh chứng rõ nét (PDF, JPG, PNG hoặc DOCX xác nhận).
                  </p>
                </div>

                <div className="p-4 rounded-[9px] border border-[#DCE7EE] bg-[#F8FBFD] space-y-1.5">
                  <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wider text-[#126A9C]">
                    <ClipboardCheck size={15} />
                    <span>Bước 3 · Sơ tuyển cấp Trường / Khối ĐHĐN</span>
                  </div>
                  <p className="text-[#2B4356] leading-relaxed">
                    Hồ sơ của 08 đơn vị thuộc ĐHĐN được đầu mối Hội Sinh viên ĐHĐN tổng hợp trình Thành phố; hồ sơ của 23 trường độc lập trình trực tiếp từ trường lên Thành phố.
                  </p>
                </div>

                <div className="p-4 rounded-[9px] border border-[#DCE7EE] bg-[#F8FBFD] space-y-1.5">
                  <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wider text-[#126A9C]">
                    <CheckCircle2 size={15} />
                    <span>Bước 4 · Thẩm định & Công nhận cấp Thành phố</span>
                  </div>
                  <p className="text-[#2B4356] leading-relaxed">
                    Ban Thư ký và Hội đồng xét duyệt Hội Sinh viên Việt Nam TP. Đà Nẵng thẩm định hồ sơ, phản hồi bổ sung (nếu cần) và ra Quyết định công nhận danh hiệu cấp Thành phố.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-[9px] border border-[#CFE0EC] bg-white space-y-2">
                <div className="text-[12px] font-extrabold uppercase tracking-wider text-[#172A3A]">
                  Quy định về tệp minh chứng hợp lệ
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[#2B4356]">
                  <li>
                    Bảng điểm học tập và kết quả rèn luyện cần có xác nhận của Phòng Đào tạo / Phòng Công tác Sinh viên hoặc trích xuất hợp lệ từ hệ thống quản lý đào tạo chính thức của nhà trường.
                  </li>
                  <li>
                    Giấy chứng nhận, bằng khen, quyết định công nhận hoạt động tình nguyện, nghiên cứu khoa học, hội nhập cần thể hiện rõ họ tên sinh viên, thời gian tổ chức trong năm học xét chọn và dấu xác nhận của đơn vị cấp.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#F5F9FC] border-t border-[#CFE0EC] flex items-center justify-between gap-4 shrink-0">
          <span className="text-[12px] font-medium text-[#466474]">
            Ban Thư ký Hội Sinh viên Việt Nam TP. Đà Nẵng · Đợt xét chọn 2025–2026
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-[36px] px-4 rounded-[8px] border border-[#CFE0EC] bg-white hover:bg-[#F3F8FC] text-[12.5px] font-bold text-[#172A3A] transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartApplication();
              }}
              className="inline-flex items-center gap-1.5 h-[36px] px-4 rounded-[8px] bg-[#126A9C] hover:bg-[#0E5680] text-white text-[12.5px] font-bold transition-colors cursor-pointer"
            >
              <span>Bắt đầu hồ sơ</span>
              <ArrowRight size={13.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
