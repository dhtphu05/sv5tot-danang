import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

export interface PortalBreadcrumbBarProps {
  activeNavId: string;
  onNavigateHome?: () => void;
  rightMeta?: React.ReactNode;
}

const STUDENT_NAV_BREADCRUMB_LABELS: Record<string, string> = {
  overview: 'Tổng quan tiến độ xét chọn năm học 2025–2026',
  profile: 'Hồ sơ lý lịch cá nhân ứng viên (13 trường chuẩn)',
  application: 'Tiêu chuẩn danh hiệu “Sinh viên 5 tốt” cấp Thành phố Đà Nẵng',
  collective: 'Tiêu chuẩn danh hiệu “Tập thể Sinh viên 5 tốt” cấp Thành phố Đà Nẵng',
  'white-bird': 'Giải thưởng “9/1” cấp Thành phố Đà Nẵng',
  evidence: 'Kho minh chứng trực tuyến của tôi',
  notifications: 'Thông báo & Yêu cầu bổ sung',
  results: 'Kết quả xét chọn & Chứng nhận danh hiệu',
  'design-system': 'Hệ thống thiết kế giao diện (QA)',
};

export const PortalBreadcrumbBar: React.FC<PortalBreadcrumbBarProps> = ({
  activeNavId,
  onNavigateHome,
  rightMeta,
}) => {
  const currentTitle =
    STUDENT_NAV_BREADCRUMB_LABELS[activeNavId] ||
    'Cổng xét chọn Danh hiệu và Giải thưởng Sinh viên TP. Đà Nẵng';

  return (
    <div className="w-full bg-white border-b border-[#DFE5EC] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-[12.5px] select-none print:hidden">
      <nav aria-label="Đường dẫn điều hướng" className="flex items-center gap-1.5 min-w-0">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-[#475569] hover:text-[#007EE5] font-medium transition-colors cursor-pointer shrink-0"
        >
          <Home size={13.5} className="text-[#1E293B]" />
          <span>Trang chủ</span>
        </button>
        <ChevronRight size={13} className="text-[#94A3B8] shrink-0" />
        <span className="font-bold text-[#0F172A] truncate" title={currentTitle}>
          {currentTitle}
        </span>
      </nav>
      {rightMeta && <div className="shrink-0 hidden md:flex items-center gap-2">{rightMeta}</div>}
    </div>
  );
};
