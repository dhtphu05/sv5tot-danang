import React from 'react';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface RealisticDocumentPreviewProps {
  fileName: string;
  fileType?: string;
  page?: number;
  totalPage?: number;
  zoomLevel?: number; // percentage, e.g. 100
  highlightRegion?: string | null; // e.g. 'award-name', 'date', 'student-name', 'authority'
  onSelectRegion?: (regionId: string) => void;
}

/**
 * High-fidelity Vietnamese Certificate & Document Preview
 * Realistic layout for official demo screenshots:
 * - National header, official emblem, typography
 * - Student recipient details
 * - Red seal stamp & signature
 * - Highlightable regions tied to recognized fields
 */
export const RealisticCertificatePreview: React.FC<RealisticDocumentPreviewProps> = ({
  fileName,
  fileType = 'pdf',
  page = 1,
  zoomLevel = 100,
  highlightRegion = null,
  onSelectRegion,
}) => {
  const isImage = /\.(jpe?g|png|webp)$/i.test(fileName) || fileType === 'webp' || fileType === 'jpg' || fileType === 'png';
  const isIelts = fileName.toLowerCase().includes('ielts');
  const isBlurry = fileName.toLowerCase().includes('scan_mo') || fileName.toLowerCase().includes('mo.pdf');

  const scale = zoomLevel / 100;

  // -----------------------------------------------------------------
  // SCENARIO A: IMAGE EVIDENCE (e.g. Anh_hoat_dong_Mua_he_xanh.webp)
  // -----------------------------------------------------------------
  if (isImage) {
    return (
      <div
        className="flex items-center justify-center p-8 transition-transform duration-150 origin-top"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative bg-white rounded-[12px] shadow-lg border border-[#DCE7EE] overflow-hidden max-w-[560px] w-full select-none">
          <div className="relative aspect-4/3 bg-linear-to-br from-[#126A9C] via-[#0D78AE] to-[#18A6E0] p-6 text-white flex flex-col justify-between overflow-hidden">
            {/* Background geometric decorative shapes */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-[12px]">
                  HSV
                </span>
                <span className="text-[12px] font-semibold tracking-wide uppercase opacity-90">
                  Hội Sinh viên ĐH Bách khoa - ĐH Đà Nẵng
                </span>
              </div>
              <span className="text-[11px] font-medium bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                Mùa hè xanh 2026
              </span>
            </div>

            <div className="relative z-10 my-auto text-center py-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[11px] font-medium mb-3 backdrop-blur-xs">
                <CheckCircle2 size={13} />
                <span>Hoạt động tình nguyện cấp Trường</span>
              </div>
              <h3 className="text-[20px] font-extrabold tracking-tight text-white leading-tight">
                Chiến dịch Mùa hè xanh 2026
              </h3>
              <p className="text-[13px] text-white/90 mt-1 max-w-md mx-auto">
                Địa bàn Huyện Hòa Vang, Thành phố Đà Nẵng · Đội hình Công nghệ thông tin
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between text-[11px] pt-4 border-t border-white/20 text-white/80">
              <span>Địa điểm: Xã Hòa Phú, Hòa Vang</span>
              <span>Thời gian: 12/07/2026 → 14/07/2026</span>
            </div>
          </div>

          <div className="p-4 bg-white flex items-center justify-between text-[12px] text-[#607483]">
            <span>Ảnh chụp thực tế minh chứng hoạt động</span>
            <span className="font-semibold text-[#172A3A]">Độ phân giải: 1920 × 1440 · WEBP</span>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // SCENARIO B: IELTS CERTIFICATE (Hội nhập tốt)
  // -----------------------------------------------------------------
  if (isIelts) {
    return (
      <div
        className="flex items-center justify-center p-8 transition-transform duration-150 origin-top"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative bg-white shadow-xl border border-[#DCE7EE] w-[595px] min-h-[820px] p-10 flex flex-col justify-between text-[#172A3A] select-none rounded-[4px]">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-[#DCE7EE]">
            <div>
              <h2 className="text-[22px] font-black tracking-wider text-[#C5221F]">IELTS</h2>
              <span className="text-[12px] font-bold text-[#607483] uppercase tracking-wider">
                Test Report Form
              </span>
            </div>
            <div className="text-right text-[11.5px] text-[#607483]">
              <div>Candidate Number: <strong>014820</strong></div>
              <div>Centre Number: <strong>VN120</strong></div>
            </div>
          </div>

          {/* Candidate Details */}
          <div className="my-6 space-y-4">
            <div
              onClick={() => onSelectRegion && onSelectRegion('student-name')}
              className={`p-3 rounded-[6px] transition-colors cursor-pointer ${
                highlightRegion === 'student-name' ? 'bg-[#18A6E0]/15 ring-2 ring-[#18A6E0]' : ''
              }`}
            >
              <div className="text-[11px] font-bold text-[#607483] uppercase">Candidate Name</div>
              <div className="text-[18px] font-bold tracking-tight text-[#172A3A]">
                NGUYEN MINH ANH
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-bold text-[#607483] uppercase">Date of Birth</div>
                <div className="text-[14px] font-semibold">15/09/2004</div>
              </div>
              <div
                onClick={() => onSelectRegion && onSelectRegion('date')}
                className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
                  highlightRegion === 'date' ? 'bg-[#E99A18]/20 ring-2 ring-[#E99A18]' : ''
                }`}
              >
                <div className="text-[11px] font-bold text-[#607483] uppercase">Test Date</div>
                <div className="text-[14px] font-semibold text-[#172A3A]">12/03/2026</div>
              </div>
            </div>

            {/* Score Grid */}
            <div
              onClick={() => onSelectRegion && onSelectRegion('score')}
              className={`mt-6 p-4 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[8px] transition-colors cursor-pointer ${
                highlightRegion === 'score' ? 'bg-[#18A6E0]/15 ring-2 ring-[#18A6E0]' : ''
              }`}
            >
              <div className="text-[12px] font-bold text-[#466474] uppercase mb-3">
                Test Results
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="p-2 bg-white rounded-[6px] border border-[#DCE7EE]">
                  <div className="text-[10.5px] text-[#607483]">Listening</div>
                  <div className="text-[16px] font-black text-[#172A3A]">5.5</div>
                </div>
                <div className="p-2 bg-white rounded-[6px] border border-[#DCE7EE]">
                  <div className="text-[10.5px] text-[#607483]">Reading</div>
                  <div className="text-[16px] font-black text-[#172A3A]">6.0</div>
                </div>
                <div className="p-2 bg-white rounded-[6px] border border-[#DCE7EE]">
                  <div className="text-[10.5px] text-[#607483]">Writing</div>
                  <div className="text-[16px] font-black text-[#172A3A]">5.0</div>
                </div>
                <div className="p-2 bg-white rounded-[6px] border border-[#DCE7EE]">
                  <div className="text-[10.5px] text-[#607483]">Speaking</div>
                  <div className="text-[16px] font-black text-[#172A3A]">5.5</div>
                </div>
                <div className="p-2 bg-[#EAF6FC] rounded-[6px] border-2 border-[#18A6E0]">
                  <div className="text-[10.5px] font-bold text-[#0D78AE]">OVERALL</div>
                  <div className="text-[18px] font-black text-[#126A9C]">5.5</div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Stamp */}
          <div className="pt-6 border-t border-[#DCE7EE] flex items-center justify-between text-[11px] text-[#728391]">
            <span>British Council & IDP Education</span>
            <span className="font-semibold text-[#1A934E] flex items-center gap-1">
              <ShieldCheck size={14} />
              <span>Official Verification Stamp Active</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // SCENARIO C: FAILED / BLURRY SCAN (Chung_nhan_scan_mo.pdf)
  // -----------------------------------------------------------------
  if (isBlurry) {
    return (
      <div
        className="flex items-center justify-center p-8 transition-transform duration-150 origin-top"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative bg-white shadow-xl border border-[#DCE7EE] w-[595px] min-h-[780px] p-10 flex flex-col justify-center items-center text-center select-none rounded-[4px] filter blur-[3.5px] opacity-75">
          <div className="w-16 h-16 rounded-full bg-gray-200 mb-4" />
          <div className="h-6 w-64 bg-gray-300 rounded mb-3" />
          <div className="h-4 w-48 bg-gray-200 rounded mb-8" />
          <div className="h-4 w-80 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded mb-2" />
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // SCENARIO D: PAGE 2 OF MULTI-PAGE NCKH DECISION (Section 12)
  // -----------------------------------------------------------------
  if (page === 2) {
    return (
      <div
        className="flex items-center justify-center p-8 transition-transform duration-150 origin-top"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative bg-white shadow-xl border border-[#DCE7EE] w-[595px] min-h-[820px] p-10 flex flex-col justify-between text-[#172A3A] select-none rounded-[4px] font-serif">
          <div>
            <div className="text-center pb-4 border-b border-[#DCE7EE]">
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#172A3A]">
                DANH SÁCH KHEN THƯỞNG SINH VIÊN ĐẠT GIẢI NCKH NĂM HỌC 2026–2027
              </h4>
              <p className="text-[11.5px] italic text-[#607483] mt-0.5">
                (Kèm theo Quyết định số 482/QĐ-ĐHBK ngày 20 tháng 05 năm 2026)
              </p>
            </div>

            <div className="mt-6">
              <table className="w-full text-left text-[11px] border border-[#CBD5E1]">
                <thead className="bg-[#F1F5F9] font-bold text-[#1E293B]">
                  <tr>
                    <th className="p-2 border border-[#CBD5E1] w-8 text-center">STT</th>
                    <th className="p-2 border border-[#CBD5E1]">Họ và tên</th>
                    <th className="p-2 border border-[#CBD5E1]">Lớp / Khoa</th>
                    <th className="p-2 border border-[#CBD5E1]">Tên đề tài</th>
                    <th className="p-2 border border-[#CBD5E1] text-center">Giải</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-[#FEF9EE] font-semibold text-[#874200]">
                    <td className="p-2 border border-[#CBD5E1] text-center">01</td>
                    <td className="p-2 border border-[#CBD5E1]">Nguyễn Minh Anh</td>
                    <td className="p-2 border border-[#CBD5E1]">22T_CLC1 - CNTT</td>
                    <td className="p-2 border border-[#CBD5E1]">Thị giác máy tính nhận diện văn bản tự động</td>
                    <td className="p-2 border border-[#CBD5E1] text-center font-bold text-[#B75B00]">Giải Nhì</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-[#CBD5E1] text-center">02</td>
                    <td className="p-2 border border-[#CBD5E1]">Trần Hoàng Long</td>
                    <td className="p-2 border border-[#CBD5E1]">22ECE - Điện tử</td>
                    <td className="p-2 border border-[#CBD5E1]">Mô hình IoT giám sát chất lượng không khí</td>
                    <td className="p-2 border border-[#CBD5E1] text-center">Giải Ba</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-[#CBD5E1] text-center">03</td>
                    <td className="p-2 border border-[#CBD5E1]">Lê Thị Mai Khanh</td>
                    <td className="p-2 border border-[#CBD5E1]">22FAST - Tiên tiến</td>
                    <td className="p-2 border border-[#CBD5E1]">Thuật toán tối ưu hóa tuyến đường vận chuyển</td>
                    <td className="p-2 border border-[#CBD5E1] text-center">Giải Ba</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <div className="text-center font-sans text-[11.5px] w-56">
              <p className="italic text-[#607483]">Đà Nẵng, ngày 20 tháng 05 năm 2026</p>
              <p className="font-bold text-[#172A3A] uppercase mt-1">TRƯỞNG PHÒNG KH&CN</p>
              <div className="h-16 flex items-center justify-center my-1 italic text-[#94A3B8]">
                [Đã ký điện tử]
              </div>
              <p className="font-bold text-[#172A3A]">PGS. TS. Trần Quốc Hùng</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------
  // SCENARIO E: PRIMARY HERO DEMO — PAGE 1 OF OFFICIAL NCKH CERTIFICATE
  // (Giay_chung_nhan_NCKH.pdf / Quyet_dinh_cong_nhan_...pdf)
  // -----------------------------------------------------------------
  return (
    <div
      className="flex items-center justify-center p-8 transition-transform duration-150 origin-top"
      style={{ transform: `scale(${scale})` }}
    >
      <div className="relative bg-[#FFFEFC] shadow-2xl border border-[#D5DFE6] w-[595px] min-h-[820px] p-10 flex flex-col justify-between text-[#172A3A] select-none rounded-[4px] ring-1 ring-black/[0.03]">
        {/* Ornate Document Border */}
        <div className="absolute inset-4 border-2 border-[#126A9C]/30 pointer-events-none rounded-[2px]" />
        <div className="absolute inset-5 border border-[#126A9C]/20 pointer-events-none rounded-[1px]" />

        {/* National Header */}
        <div className="relative z-10 text-center font-serif">
          <div className="text-[12px] font-bold text-[#172A3A] uppercase tracking-wider">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </div>
          <div className="text-[12px] font-semibold text-[#172A3A]">
            Độc lập – Tự do – Hạnh phúc
          </div>
          <div className="w-32 h-[1px] bg-[#172A3A] mx-auto mt-1 mb-4 opacity-40" />

          <div
            onClick={() => onSelectRegion && onSelectRegion('authority')}
            className={`cursor-pointer p-1.5 rounded-[4px] transition-colors inline-block ${
              highlightRegion === 'authority' ? 'bg-[#18A6E0]/20 ring-2 ring-[#18A6E0]' : ''
            }`}
          >
            <div className="text-[11.5px] font-bold text-[#0D78AE] uppercase tracking-wide">
              ĐẠI HỌC ĐÀ NẴNG
            </div>
            <div className="text-[13px] font-black text-[#126A9C] uppercase tracking-wider">
              TRƯỜNG ĐẠI HỌC BÁCH KHOA
            </div>
          </div>
        </div>

        {/* Certificate Emblem & Title */}
        <div className="relative z-10 text-center my-4 font-serif">
          <div className="w-12 h-12 rounded-full bg-[#126A9C]/10 text-[#126A9C] flex items-center justify-center mx-auto mb-3 shadow-2xs border border-[#126A9C]/20">
            <Award size={26} strokeWidth={2} />
          </div>

          <h1 className="text-[26px] font-black tracking-tight text-[#126A9C] uppercase mb-1">
            GIẤY CHỨNG NHẬN
          </h1>
          <h2
            onClick={() => onSelectRegion && onSelectRegion('award-name')}
            className={`text-[16px] font-extrabold text-[#B75B00] uppercase tracking-wide inline-block p-1.5 rounded-[6px] transition-colors cursor-pointer ${
              highlightRegion === 'award-name' ? 'bg-[#E99A18]/25 ring-2 ring-[#E99A18]' : ''
            }`}
          >
            GIẢI NHÌ HỘI NGHỊ SINH VIÊN NGHIÊN CỨU KHOA HỌC 2026
          </h2>
        </div>

        {/* Recipient Information */}
        <div className="relative z-10 text-center space-y-2.5 my-2">
          <p className="text-[13px] italic text-[#475569] font-serif">
            Hiệu trưởng Trường Đại học Bách khoa chứng nhận:
          </p>

          <div
            onClick={() => onSelectRegion && onSelectRegion('student-name')}
            className={`p-2 rounded-[6px] transition-colors cursor-pointer inline-block ${
              highlightRegion === 'student-name' ? 'bg-[#18A6E0]/20 ring-2 ring-[#18A6E0]' : ''
            }`}
          >
            <div className="text-[21px] font-black text-[#172A3A] tracking-wider uppercase font-serif">
              NGUYỄN MINH ANH
            </div>
            <div className="text-[12px] font-semibold text-[#607483] font-sans mt-0.5">
              Mã số sinh viên: 102220123 · Lớp: 22T_CLC1 · Khoa: Công nghệ Thông tin
            </div>
          </div>

          <div className="pt-2 max-w-md mx-auto text-[13px] text-[#334155] leading-relaxed font-serif">
            Đã đạt thành tích xuất sắc với công trình nghiên cứu:
            <div className="font-bold text-[#172A3A] text-[14px] mt-1">
              "Ứng dụng thị giác máy tính nhận diện văn bản tự động"
            </div>
          </div>
        </div>

        {/* Footer: Date & Official Seal */}
        <div className="relative z-10 flex items-end justify-between pt-6 border-t border-[#E3EBF1]/60 mt-4">
          <div className="text-[11px] text-[#607483] font-sans max-w-[200px]">
            <div>Số vào sổ: <strong>482/QĐ-ĐHBK</strong></div>
            <div>Cấp thành tích: <strong>Cấp trường</strong></div>
          </div>

          {/* Date & Signature with subtle date highlight (Section 24) */}
          <div className="text-center font-serif text-[12px] relative">
            <div
              onClick={() => onSelectRegion && onSelectRegion('date')}
              className={`p-1.5 rounded-[4px] transition-colors cursor-pointer inline-block ${
                highlightRegion === 'date'
                  ? 'bg-[#E99A18]/30 ring-2 ring-[#E99A18]'
                  : 'hover:bg-black/5'
              }`}
            >
              <span className="italic text-[#172A3A] font-semibold">
                Đà Nẵng, ngày 20 tháng 05 năm 2026
              </span>
            </div>

            <div className="font-bold text-[#172A3A] uppercase mt-1 tracking-wider text-[12.5px]">
              HIỆU TRƯỞNG
            </div>

            {/* Simulated Official Red Seal Stamp */}
            <div className="relative my-2 h-20 flex items-center justify-center">
              {/* Circular Red Seal */}
              <div className="w-24 h-24 rounded-full border-2 border-[#DC2626] text-[#DC2626] flex items-center justify-center text-center p-1 opacity-85 rotate-[-8deg] shadow-xs">
                <div className="w-21 h-21 rounded-full border border-dashed border-[#DC2626] flex flex-col items-center justify-center p-1 text-[8.5px] font-bold uppercase leading-tight">
                  <span>TRƯỜNG ĐH BÁCH KHOA</span>
                  <span className="text-[7.5px] font-normal my-0.5">★ ĐÀ NẴNG ★</span>
                  <span className="text-[7.5px]">ĐÃ KÝ</span>
                </div>
              </div>
            </div>

            <div className="font-bold text-[#172A3A] text-[13px] font-sans">
              PGS. TS. Nguyễn Đình Lâm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
