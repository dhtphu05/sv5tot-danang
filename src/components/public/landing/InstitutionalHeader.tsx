/**
 * 5TOT Đà Nẵng — Institutional Header (Approved Visual Reference)
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Sections 6, 7, 38, 48:
 * - Height ~74px, white surface, very subtle bottom border.
 * - LEFT: Official HSV logo +
 *   Line 1: THÀNH ĐOÀN ĐÀ NẴNG (12–13px uppercase, moderate letter spacing, muted blue-gray)
 *   Line 2: HỘI SINH VIÊN VIỆT NAM THÀNH PHỐ ĐÀ NẴNG (17–20px, 700–800 weight, brand deep blue)
 * - RIGHT: Đăng nhập + [Bắt đầu hồ sơ →] in brand blue.
 */

import React from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { HsvEmblem } from '../../brand/HsvLogo';

export interface InstitutionalHeaderProps {
  isAuthenticated?: boolean;
  onStartApplication: () => void;
  onNavigateToLogin: () => void;
  onNavigateToCollectiveLogin?: () => void;
  onEnterAuthenticatedHome?: () => void;
}

export const InstitutionalHeader: React.FC<InstitutionalHeaderProps> = ({
  isAuthenticated = false,
  onStartApplication,
  onNavigateToLogin,
  onNavigateToCollectiveLogin,
  onEnterAuthenticatedHome,
}) => {
  const handlePrimaryClick = () => {
    if (isAuthenticated && onEnterAuthenticatedHome) {
      onEnterAuthenticatedHome();
    } else {
      onStartApplication();
    }
  };

  const handleSecondaryClick = () => {
    if (isAuthenticated && onEnterAuthenticatedHome) {
      onEnterAuthenticatedHome();
    } else {
      onNavigateToLogin();
    }
  };

  return (
    <header className="w-full h-[74px] bg-white/95 backdrop-blur-xs border-b border-[#E5EFF6] shrink-0 relative z-20">
      <div className="max-w-[1280px] h-full mx-auto px-6 sm:px-10 lg:px-12 flex items-center justify-between gap-4">
        {/* LEFT: Official HSV Logo + Two-Line Institutional Masthead */}
        <div className="flex items-center gap-3.5 min-w-0">
          <HsvEmblem size={44} />
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[12px] sm:text-[12.5px] font-semibold uppercase tracking-[0.06em] text-[#4A6275] leading-snug">
              THÀNH ĐOÀN ĐÀ NẴNG
            </span>
            <span className="text-[15.5px] sm:text-[18px] lg:text-[19px] font-extrabold uppercase tracking-[-0.01em] text-[#0B64A0] leading-tight truncate">
              HỘI SINH VIÊN VIỆT NAM THÀNH PHỐ ĐÀ NẴNG
            </span>
          </div>
        </div>

        {/* RIGHT: Đăng nhập + Cổng Tập thể + Primary CTA [Bắt đầu hồ sơ →] */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {onNavigateToCollectiveLogin && (
            <button
              type="button"
              onClick={onNavigateToCollectiveLogin}
              className="hidden sm:inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#4A6275] hover:text-[#0B64A0] transition-colors cursor-pointer px-2 py-1.5"
              title="Cổng dành cho Chi hội, Liên Chi hội đăng ký Tập thể SV5T"
            >
              <Users size={15} />
              <span>Cổng Tập thể</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSecondaryClick}
            className="text-[14.5px] sm:text-[15px] font-bold text-[#0F2335] hover:text-[#0D6EB0] transition-colors duration-150 cursor-pointer whitespace-nowrap px-2 py-1.5"
          >
            {isAuthenticated ? 'Trang chủ sinh viên' : 'Đăng nhập'}
          </button>

          <button
            type="button"
            onClick={handlePrimaryClick}
            className="group inline-flex items-center gap-2 h-[42px] px-5 rounded-[10px] bg-[#0B64A0] hover:bg-[#095386] text-white text-[14.5px] font-bold shadow-[0_4px_12px_rgba(11,100,160,0.18)] transition-all duration-150 hover:-translate-y-[1px] cursor-pointer whitespace-nowrap"
          >
            <span>{isAuthenticated ? 'Vào hồ sơ' : 'Bắt đầu hồ sơ'}</span>
            <ArrowRight
              size={15}
              className="transition-transform duration-150 group-hover:translate-x-[2.5px]"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
