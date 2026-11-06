import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  ChevronDown,
  UserCircle,
  KeyRound,
  LogOut,
  Building2,
} from 'lucide-react';
import { HsvEmblem } from '../brand/HsvLogo';

export interface PortalTopHeaderProps {
  title?: string;
  subtitle?: string;
  userName: string;
  userSubLabel?: string;
  userEmail?: string;
  universityLabel?: string;
  roleBadge?: string;
  notificationCount?: number;
  onToggleSidebar?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
  logoutLabel?: string;
  rightSlot?: React.ReactNode;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[parts.length - 2][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

export const PortalTopHeader: React.FC<PortalTopHeaderProps> = ({
  title = '5TOT Đà Nẵng',
  subtitle = 'Hội Sinh viên Việt Nam TP. Đà Nẵng',
  userName,
  userSubLabel,
  userEmail,
  universityLabel,
  roleBadge,
  notificationCount = 0,
  onToggleSidebar,
  onOpenNotifications,
  onOpenProfile,
  onOpenChangePassword,
  onLogout,
  logoutLabel = 'Cổng thông tin & Đăng xuất',
  rightSlot,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 h-[50px] w-full bg-[#007EE5] text-white border-b border-[#006BC7] px-3 sm:px-5 flex items-center justify-between gap-3 select-none print:hidden">
      {/* Left: HSV Emblem + Hamburger Sidebar Toggle + Institutional Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/95 p-0.5 flex items-center justify-center shadow-2xs shrink-0">
            <HsvEmblem size={26} className="shrink-0" />
          </div>
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Đóng mở thanh điều hướng"
              title="Thu gọn / Mở rộng menu điều hướng"
              className="p-1.5 rounded-[4px] text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <Menu size={18} strokeWidth={2.1} />
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 min-w-0 pl-1 border-l border-white/20">
          <span className="text-[13.5px] font-bold tracking-tight text-white truncate">
            {title}
          </span>
          <span className="hidden lg:inline text-white/55 text-[12px]">·</span>
          <span className="hidden lg:inline text-[12px] font-medium text-white/90 truncate">
            {subtitle}
          </span>
          {roleBadge && (
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#10A37F] text-white text-[11px] font-bold tracking-wide">
              {roleBadge}
            </span>
          )}
        </div>
      </div>

      {/* Right: Optional Context Slot + Notifications + User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {rightSlot}

        {onOpenNotifications && (
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Thông báo"
            title={
              notificationCount > 0
                ? `${notificationCount} thông báo cần chú ý`
                : 'Thông báo'
            }
            className="relative p-1.5 rounded-[4px] text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <Bell size={17} strokeWidth={2} />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        )}

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-[5px] hover:bg-white/15 transition-colors cursor-pointer max-w-[240px]"
          >
            <span className="w-6.5 h-6.5 rounded-full bg-white text-[#007EE5] font-extrabold text-[11px] flex items-center justify-center shrink-0">
              {getInitials(userName)}
            </span>
            <span className="text-[12.5px] font-semibold text-white truncate">
              {userName}
            </span>
            <ChevronDown size={14} className="text-white/85 shrink-0" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1.5 w-[264px] bg-white text-[#1E293B] rounded-[6px] border border-[#DFE5EC] shadow-popover py-1.5 z-50">
              <div className="px-3.5 py-2.5 border-b border-[#E2E8F0] space-y-0.5">
                <div className="text-[13px] font-bold text-[#0F172A] truncate">
                  {userName}
                </div>
                {userSubLabel && (
                  <div className="text-[11.5px] font-medium text-[#475569] truncate">
                    {userSubLabel}
                  </div>
                )}
                {userEmail && (
                  <div className="text-[11px] text-[#64748B] truncate">
                    {userEmail}
                  </div>
                )}
                {universityLabel && (
                  <div className="pt-1 flex items-center gap-1 text-[11px] text-[#007EE5] font-medium truncate">
                    <Building2 size={11.5} className="shrink-0" />
                    <span className="truncate">{universityLabel}</span>
                  </div>
                )}
              </div>

              <div className="py-1">
                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full px-3.5 py-2 text-left text-[12.5px] font-medium text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A] flex items-center gap-2.5 cursor-pointer"
                  >
                    <UserCircle size={15} className="text-[#007EE5] shrink-0" />
                    <span>Thông tin tài khoản</span>
                  </button>
                )}

                {onOpenChangePassword && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenChangePassword();
                    }}
                    className="w-full px-3.5 py-2 text-left text-[12.5px] font-medium text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A] flex items-center gap-2.5 cursor-pointer"
                  >
                    <KeyRound size={15} className="text-[#10A37F] shrink-0" />
                    <span>Đổi mật khẩu</span>
                  </button>
                )}
              </div>

              {onLogout && (
                <div className="pt-1 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3.5 py-2 text-left text-[12.5px] font-semibold text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut size={15} className="shrink-0" />
                    <span>{logoutLabel}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
