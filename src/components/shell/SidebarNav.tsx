import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FolderArchive,
  Bell,
  Award,
  Layers,
  LogOut,
  UserCircle,
  Users,
  Feather,
  KeyRound,
} from 'lucide-react';
import { MOCK_STUDENT } from '../../tokens';
import { useDevQaMode } from '../../demo/useDevQaMode';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  isAwardTrack?: boolean;
}

export interface SidebarNavProps {
  activeId?: string;
  onSelect?: (id: string) => void;
  onOpenCollectiveTrack?: () => void;
  onOpenChangePassword?: () => void;
  collapsed?: boolean;
  notificationCount?: number;
  studentName?: string;
  studentId?: string;
  studentUniversity?: string;
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeId = 'overview',
  onSelect,
  onOpenChangePassword,
  collapsed = false,
  notificationCount = 0,
  studentName = MOCK_STUDENT.fullName,
  studentId = MOCK_STUDENT.studentId,
  className = '',
}) => {
  const [isQaMode] = useDevQaMode();

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Tổng quan',
      icon: <LayoutDashboard size={16} strokeWidth={2} />,
    },
    {
      id: 'application',
      label: 'Sinh viên 5 tốt cấp TP',
      icon: <FileSpreadsheet size={16} strokeWidth={2} />,
      isAwardTrack: true,
    },
    {
      id: 'collective',
      label: 'Tập thể Sinh viên 5 tốt',
      icon: <Users size={16} strokeWidth={2} />,
      isAwardTrack: true,
    },
    {
      id: 'white-bird',
      label: 'Giải thưởng 9/1',
      icon: <Feather size={16} strokeWidth={2} />,
      isAwardTrack: true,
    },
    {
      id: 'profile',
      label: 'Thông tin cá nhân',
      icon: <UserCircle size={16} strokeWidth={2} />,
    },
    {
      id: 'evidence',
      label: 'Kho minh chứng',
      icon: <FolderArchive size={16} strokeWidth={2} />,
    },
    {
      id: 'notifications',
      label: 'Thông báo',
      icon: <Bell size={16} strokeWidth={2} />,
      badge: notificationCount,
    },
    {
      id: 'results',
      label: 'Kết quả xét chọn',
      icon: <Award size={16} strokeWidth={2} />,
    },
  ];

  const handleNavClick = (id: string) => {
    onSelect?.(id);
  };

  return (
    <aside
      aria-label="Điều hướng hệ thống Sinh viên 5 tốt"
      className={`${
        collapsed ? 'w-[60px]' : 'w-[238px]'
      } md:h-[calc(100dvh-50px)] md:sticky md:top-[50px] self-start z-30 bg-white border-r border-[#DFE5EC] flex flex-col select-none shrink-0 transition-all duration-150 ${className}`}
    >
      {/* Primary Navigation List — Matching Central HSV Emerald Active Pill & Amber Track Icons */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col py-2">
        <nav className="px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[4px] text-[13px] transition-colors cursor-pointer group ${
                  isActive
                    ? 'bg-[#10A37F] text-white font-semibold'
                    : 'text-[#334155] hover:text-[#0F172A] hover:bg-[#F1F5F9] font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`shrink-0 ${
                      isActive
                        ? 'text-white'
                        : item.isAwardTrack
                        ? 'text-[#EA8C00]'
                        : 'text-[#64748B] group-hover:text-[#0F172A]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge !== undefined && Number(item.badge) > 0 && (
                  <span
                    aria-label={`${item.badge} nội dung cần xử lý`}
                    className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded-[4px] tabular-nums ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-[#FEF3C7] text-[#B45309]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {isQaMode && !collapsed && (
          <div className="px-2 pt-3 mt-2 border-t border-[#E2E8F0]">
            <span className="px-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Công cụ phát triển (QA)
            </span>
            <button
              type="button"
              onClick={() => handleNavClick('design-system')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-[4px] text-[12.5px] font-medium transition-colors cursor-pointer ${
                activeId === 'design-system'
                  ? 'bg-[#10A37F] text-white font-semibold'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Layers size={15} strokeWidth={2} />
                <span className="truncate">Hệ thống thiết kế</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Compact Footer Quick Actions */}
      {!collapsed && (
        <div className="mt-auto shrink-0 p-2.5 border-t border-[#DFE5EC] bg-[#F8FAFC] space-y-1">
          <div className="px-2 py-1 text-[11px] text-[#64748B] truncate">
            Ứng viên: <strong className="text-[#1E293B]">{studentName}</strong>
            {studentId ? ` · ${studentId}` : ''}
          </div>
          {onOpenChangePassword && (
            <button
              type="button"
              onClick={onOpenChangePassword}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-[4px] text-[12px] font-medium text-[#334155] hover:bg-[#E2E8F0]/60 transition-colors cursor-pointer"
            >
              <span>Đổi mật khẩu</span>
              <KeyRound size={13} className="text-[#10A37F] shrink-0" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleNavClick('public-entry')}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-[4px] text-[12px] font-medium text-[#475569] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
          >
            <span>Cổng thông tin & Đăng xuất</span>
            <LogOut size={13} className="shrink-0" />
          </button>
        </div>
      )}
    </aside>
  );
};
