import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { PortalTopHeader } from './PortalTopHeader';
import { PortalBreadcrumbBar } from './PortalBreadcrumbBar';
import { FeedbackFloatingWidget } from '../feedback/FeedbackFloatingWidget';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { getApiActorContext } from '../../shared/api/httpClient';
import { MOCK_STUDENT } from '../../tokens';

export interface AppShellProps {
  children: React.ReactNode;
  activeNavId?: string;
  onNavSelect?: (id: string) => void;
  notificationCount?: number;
  studentName?: string;
  studentId?: string;
  studentUniversity?: string;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeNavId = 'overview',
  onNavSelect,
  notificationCount = 0,
  studentName = MOCK_STUDENT.fullName,
  studentId = MOCK_STUDENT.studentId,
  studentUniversity = MOCK_STUDENT.university,
  className = '',
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const actorCtx = getApiActorContext();

  const handleNavSelect = (id: string) => {
    setIsMobileNavOpen(false);
    onNavSelect?.(id);
  };

  const handleHamburgerToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsMobileNavOpen((prev) => !prev);
    } else {
      setIsDesktopCollapsed((prev) => !prev);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#F4F6F9] text-[#1E293B] ${className}`}>
      {/* 1. Full-Width Top Institutional Blue Bar (#007EE5) */}
      <PortalTopHeader
        title="5TOT Đà Nẵng"
        subtitle="Hội Sinh viên Việt Nam Thành phố Đà Nẵng"
        userName={studentName}
        userSubLabel={studentId ? `MSSV: ${studentId}` : undefined}
        userEmail={actorCtx?.userEmail}
        universityLabel={studentUniversity}
        notificationCount={notificationCount}
        onToggleSidebar={handleHamburgerToggle}
        onOpenNotifications={() => handleNavSelect('notifications')}
        onOpenProfile={() => handleNavSelect('profile')}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onLogout={() => handleNavSelect('public-entry')}
      />

      {/* Mobile Slide-Over Drawer (< 768px) */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-[248px] max-w-[82vw] h-full bg-white shadow-xl z-50 flex flex-col">
            <div className="h-[50px] px-3.5 bg-[#007EE5] text-white flex items-center justify-between">
              <span className="text-[12.5px] font-bold uppercase tracking-wide">
                Danh mục chức năng
              </span>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1 rounded-[4px] text-white/85 hover:text-white hover:bg-white/15 cursor-pointer"
                aria-label="Đóng menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav
                activeId={activeNavId}
                onSelect={handleNavSelect}
                onOpenChangePassword={() => {
                  setIsMobileNavOpen(false);
                  setIsChangePasswordOpen(true);
                }}
                notificationCount={notificationCount}
                studentName={studentName}
                studentId={studentId}
                studentUniversity={studentUniversity}
                className="w-full border-r-0 h-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Below-Header Workspace Frame: Collapsible White Sidebar + Breadcrumb + Main Content */}
      <div className="flex flex-1 min-h-[calc(100dvh-50px)]">
        <SidebarNav
          activeId={activeNavId}
          onSelect={onNavSelect}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          collapsed={isDesktopCollapsed}
          notificationCount={notificationCount}
          studentName={studentName}
          studentId={studentId}
          studentUniversity={studentUniversity}
          className="hidden md:flex"
        />

        <main className="flex-1 flex flex-col min-w-0 w-full">
          <PortalBreadcrumbBar
            activeNavId={activeNavId}
            onNavigateHome={() => handleNavSelect('overview')}
          />
          <div className="flex-1 flex flex-col min-w-0 w-full">{children}</div>
        </main>
      </div>

      <FeedbackFloatingWidget />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        accountName={actorCtx?.userName || studentName}
        accountEmail={actorCtx?.userEmail}
        roleLabel={
          actorCtx?.role === 'COLLECTIVE_PREPARER'
            ? 'Người lập hồ sơ Tập thể'
            : 'Tài khoản Sinh viên'
        }
      />
    </div>
  );
};

export const PageLayout: React.FC<{
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}> = ({ children, maxWidth = 'max-w-7xl', className = '' }) => {
  return (
    <div className={`w-full ${maxWidth} mx-auto px-5 lg:px-7 py-5 ${className}`}>
      {children}
    </div>
  );
};
