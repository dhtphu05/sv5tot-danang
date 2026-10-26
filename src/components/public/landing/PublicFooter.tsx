/**
 * 5TOT Đà Nẵng — Minimal Institutional Footer (Approved Visual Reference)
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Section 3 & 45:
 * - Minimal institutional footer aligned to the 1280px primary container.
 */

import React from 'react';
import { HsvEmblem } from '../../brand/HsvLogo';

export interface PublicFooterProps {
  onOpenGuidanceModal?: (tab: 'criteria' | 'guide') => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  onOpenGuidanceModal,
}) => {
  return (
    <footer className="w-full py-4 bg-white/80 backdrop-blur-xs border-t border-[#E5EFF6] text-[12px] text-[#526B7E] shrink-0 relative z-20">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <HsvEmblem size={22} />
          <span className="font-semibold text-[#526B7E] uppercase tracking-wider text-[11px]">
            CƠ QUAN QUẢN LÝ:{' '}
            <strong className="text-[#0F2335] font-extrabold">
              THÀNH ĐOÀN ĐÀ NẴNG
            </strong>
          </span>
          <span className="text-[#C5D8E6]">·</span>
          <span className="font-semibold text-[#526B7E] uppercase tracking-wider text-[11px]">
            ĐƠN VỊ VẬN HÀNH NGHIỆP VỤ:{' '}
            <strong className="text-[#0B64A0] font-extrabold">
              HỘI SINH VIÊN VIỆT NAM THÀNH PHỐ ĐÀ NẴNG
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-[#526B7E] font-medium">
          <span>
            Hệ thống xét duyệt Sinh viên 5 tốt cấp Thành phố Đà Nẵng · Năm học
            2026–2027
          </span>
          {onOpenGuidanceModal && (
            <>
              <span className="text-[#C5D8E6]">·</span>
              <button
                type="button"
                onClick={() => onOpenGuidanceModal('criteria')}
                className="font-bold text-[#0D6EB0] hover:underline cursor-pointer"
              >
                Văn bản - Hướng dẫn
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
