/**
 * 5TOT Đà Nẵng — Approved City-Level Staff Backoffice Shell (StaffAppShell)
 * Cơ quan chỉ đạo: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements role-based navigation and capability-based permissions for:
 * - Cán bộ xét duyệt (CITY_OFFICER)
 * - Quản lý xét duyệt (CITY_MANAGER)
 * - Hội đồng xét chọn (CITY_COMMITTEE)
 * - Quản trị hệ thống (ADMIN)
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  AlertCircle,
  MessageSquareWarning,
  UserCheck,
  BarChart3,
  Clock,
  Scale,
  Award,
  Bell,
  Building2,
  Users,
  Calendar,
  Sliders,
  History,
  ShieldCheck,
  Settings2,
  LogOut,
  Feather,
  KeyRound,
} from 'lucide-react';
import { formatAcademicYearLabel } from '@5tot/contracts';
import {
  StaffRole,
  StaffRouteId,
  StaffUser,
} from '../../types';
import {
  canAccessStaffRoute,
  resolveActiveSidebarNavId,
} from '../../permissions';
import { Season } from '../../adminTypes';
import { AwardProgramContextBar } from './AwardProgramContextBar';
import { PortalTopHeader } from '../../../components/shell/PortalTopHeader';
import { FeedbackFloatingWidget } from '../../../components/feedback/FeedbackFloatingWidget';
import { ChangePasswordModal } from '../../../components/auth/ChangePasswordModal';

export interface StaffAppShellProps {
  currentUser: StaffUser;
  activeRouteId: StaffRouteId;
  onSelectRoute: (routeId: StaffRouteId) => void;
  onSwitchRole?: (role: StaffRole) => void;
  onSwitchToStudentApp?: () => void;
  onLogout?: () => void;
  assignedCount?: number;
  attentionCount?: number;
  supplementCount?: number;
  unassignedCount?: number;
  committeeCount?: number;
  committeeWaitingDecisionCount?: number;
  unreadNotificationCount?: number;
  // School Review Unit Badges (Prompt S2)
  schoolTotalCount?: number;
  schoolPendingCount?: number;
  schoolSupplementCount?: number;
  schoolAwaitingForwardCount?: number;
  collectivePendingCount?: number;
  currentSeason?: Season;
  seasons?: Season[];
  onSwitchSeason?: (seasonId: string) => void;
  children: React.ReactNode;
}

interface StaffNavItemConfig {
  id: StaffRouteId;
  label: string;
  managerLabel?: string;
  committeeLabel?: string;
  icon: React.ReactNode;
  group:
    | 'core'
    | 'management'
    | 'committee'
    | 'info'
    | 'admin_gov'
    | 'admin_sys'
    | 'school';
  badgeKey?:
    | 'assigned'
    | 'attention'
    | 'supplement'
    | 'unassigned'
    | 'committee'
    | 'committee_decisions'
    | 'notifications'
    | 'school_total'
    | 'school_pending'
    | 'school_supplement'
    | 'school_awaiting_forward'
    | 'collective_pending';
}

const ALL_STAFF_NAV_ITEMS: StaffNavItemConfig[] = [
  // SCHOOL OFFICER NAVIGATION (LEAN-4.2 Deduplicated 4 Core Destinations)
  {
    id: 'school_overview',
    label: 'Tổng quan',
    icon: <LayoutDashboard size={15.5} />,
    group: 'school',
  },
  {
    id: 'school_applications',
    label: 'Hồ sơ sơ tuyển',
    icon: <FolderKanban size={15.5} />,
    group: 'school',
    badgeKey: 'school_total',
  },
  {
    id: 'school_awaiting_forward',
    label: 'Danh sách đề nghị',
    icon: <UserCheck size={15.5} />,
    group: 'school',
    badgeKey: 'school_awaiting_forward',
  },
  {
    id: 'school_notifications',
    label: 'Thông báo',
    icon: <Bell size={15.5} />,
    group: 'school',
    badgeKey: 'notifications',
  },
  // CITY STAFF CORE NAVIGATION
  {
    id: 'overview',
    label: 'Tổng quan',
    icon: <LayoutDashboard size={15.5} />,
    group: 'core',
  },
  {
    id: 'applications',
    label: 'Hồ sơ cá nhân',
    managerLabel: 'Hồ sơ cá nhân',
    icon: <FolderKanban size={15.5} />,
    group: 'core',
    badgeKey: 'assigned',
  },
  {
    id: 'attention',
    label: 'Hồ sơ cần xử lý',
    managerLabel: 'Hồ sơ cần xử lý',
    icon: <AlertCircle size={15.5} />,
    group: 'core',
    badgeKey: 'attention',
  },
  {
    id: 'supplements',
    label: 'Yêu cầu bổ sung',
    icon: <MessageSquareWarning size={15.5} />,
    group: 'core',
    badgeKey: 'supplement',
  },
  {
    id: 'collective_review',
    label: 'Hồ sơ tập thể',
    managerLabel: 'Hồ sơ tập thể',
    icon: <Users size={15.5} />,
    group: 'core',
    badgeKey: 'collective_pending',
  },
  {
    id: 'white_bird_review',
    label: 'Giải thưởng 9/1',
    managerLabel: 'Giải thưởng 9/1',
    committeeLabel: 'Giải thưởng 9/1',
    icon: <Feather size={15.5} />,
    group: 'core',
  },
  {
    id: 'deadlines',
    label: 'Mốc thời gian',
    icon: <Clock size={15.5} />,
    group: 'management',
  },
  {
    id: 'committee',
    label: 'Hồ sơ xét chọn',
    icon: <Scale size={15.5} />,
    group: 'committee',
    badgeKey: 'committee',
  },
  {
    id: 'committee_decisions',
    label: 'Hồ sơ chờ quyết định',
    icon: <FolderKanban size={15.5} />,
    group: 'committee',
    badgeKey: 'committee_decisions',
  },
  {
    id: 'results',
    label: 'Kết quả xét chọn',
    icon: <Award size={15.5} />,
    group: 'committee',
  },
  {
    id: 'recognition',
    label: 'Quyết định công nhận',
    icon: <Calendar size={15.5} />,
    group: 'committee',
  },
  {
    id: 'analytics',
    label: 'Thống kê đợt xét',
    committeeLabel: 'Thống kê',
    icon: <BarChart3 size={15.5} />,
    group: 'info',
  },
  {
    id: 'notifications',
    label: 'Thông báo nghiệp vụ',
    committeeLabel: 'Thông báo',
    icon: <Bell size={15.5} />,
    group: 'info',
    badgeKey: 'notifications',
  },
  // ADMIN CONTROL PLANE NAVIGATION (Phase UX-S4 Level 2)
  // Quản trị chương trình (Award Program Admin)
  {
    id: 'admin_season',
    label: 'Mùa xét chọn',
    icon: <Calendar size={15.5} />,
    group: 'admin_gov',
  },
  {
    id: 'admin_criteria',
    label: 'Tiêu chí xét chọn',
    icon: <Sliders size={15.5} />,
    group: 'admin_gov',
  },
  {
    id: 'admin_deadlines',
    label: 'Mốc thời gian',
    icon: <Clock size={15.5} />,
    group: 'admin_gov',
  },
  {
    id: 'admin_institutions',
    label: 'Đơn vị & phân tuyến',
    icon: <Building2 size={15.5} />,
    group: 'admin_gov',
  },
  // Quản trị hệ thống (System & Security Admin)
  {
    id: 'admin_users',
    label: 'Người dùng & cán bộ',
    icon: <Users size={15.5} />,
    group: 'admin_sys',
  },
  {
    id: 'admin_permissions',
    label: 'Quyền truy cập',
    icon: <ShieldCheck size={15.5} />,
    group: 'admin_sys',
  },
  {
    id: 'admin_operations',
    label: 'Vận hành & cấu hình',
    icon: <Settings2 size={15.5} />,
    group: 'admin_sys',
  },
  {
    id: 'admin_audit',
    label: 'Lịch sử hoạt động',
    icon: <History size={15.5} />,
    group: 'admin_sys',
  },
];

export const StaffAppShell: React.FC<StaffAppShellProps> = ({
  currentUser,
  activeRouteId,
  onSelectRoute,
  onLogout,
  assignedCount = 0,
  attentionCount = 0,
  supplementCount = 0,
  unassignedCount = 0,
  committeeCount = 0,
  committeeWaitingDecisionCount = 0,
  unreadNotificationCount = 0,
  schoolTotalCount = 0,
  schoolPendingCount = 0,
  schoolSupplementCount = 0,
  schoolAwaitingForwardCount = 0,
  collectivePendingCount = 0,
  currentSeason,
  seasons,
  onSwitchSeason,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const activeSidebarId = resolveActiveSidebarNavId(activeRouteId, currentUser);

  const visibleNavItems = ALL_STAFF_NAV_ITEMS.filter((item) => {
    if (currentUser.primaryRole === 'SCHOOL_OFFICER') {
      return item.group === 'school';
    }
    if (item.group === 'school') {
      return false;
    }
    if (currentUser.primaryRole === 'CITY_OFFICER') {
      if (item.group !== 'core' && item.id !== 'notifications') {
        return false;
      }
    }
    if (currentUser.primaryRole === 'CITY_COMMITTEE') {
      const allowedForCommittee: StaffRouteId[] = [
        'overview',
        'committee',
        'committee_decisions',
        'results',
        'recognition',
        'collective_review',
        'white_bird_review',
        'analytics',
        'notifications',
      ];
      if (!allowedForCommittee.includes(item.id)) {
        return false;
      }
    }
    if (currentUser.primaryRole === 'ADMIN') {
      const allowedForAdmin: StaffRouteId[] = [
        'overview',
        'admin_institutions',
        'admin_users',
        'admin_season',
        'admin_criteria',
        'admin_deadlines',
        'admin_permissions',
        'admin_operations',
        'admin_audit',
      ];
      if (!allowedForAdmin.includes(item.id)) {
        return false;
      }
    }
    return canAccessStaffRoute(currentUser, item.id);
  });

  const getBadgeValue = (
    badgeKey?: StaffNavItemConfig['badgeKey']
  ): number => {
    switch (badgeKey) {
      case 'assigned':
        return assignedCount;
      case 'attention':
        return attentionCount;
      case 'supplement':
        return supplementCount;
      case 'unassigned':
        return unassignedCount;
      case 'committee':
        return committeeCount;
      case 'committee_decisions':
        return committeeWaitingDecisionCount;
      case 'notifications':
        return unreadNotificationCount;
      case 'school_total':
        return schoolTotalCount;
      case 'school_pending':
        return schoolPendingCount;
      case 'school_supplement':
        return schoolSupplementCount;
      case 'school_awaiting_forward':
        return schoolAwaitingForwardCount;
      case 'collective_pending':
        return collectivePendingCount ?? 0;
      default:
        return 0;
    }
  };

  const notificationRouteTarget: StaffRouteId | null =
    currentUser.primaryRole === 'SCHOOL_OFFICER'
      ? 'school_notifications'
      : currentUser.primaryRole !== 'ADMIN' &&
          canAccessStaffRoute(currentUser, 'notifications')
        ? 'notifications'
        : null;

  return (
    <div className="min-h-screen bg-[#F4F6F9] print:bg-white text-[#1E293B] flex flex-col font-sans">
      {/* Top Ocean-Blue Administrative Bar (#007EE5) */}
      <PortalTopHeader
        title="5TOT Đà Nẵng"
        subtitle={
          currentUser.primaryRole === 'SCHOOL_OFFICER'
            ? `Sơ tuyển cấp Trường · ${currentUser.unitLabel || 'Đơn vị đào tạo'}`
            : 'Hệ thống Thẩm định & Xét chọn Cấp Thành phố'
        }
        userName={currentUser.fullName}
        userSubLabel={currentUser.roleLabel}
        userEmail={currentUser.email}
        universityLabel={currentUser.unitLabel}
        roleBadge={currentUser.roleLabel}
        notificationCount={unreadNotificationCount}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenNotifications={
          notificationRouteTarget
            ? () => onSelectRoute(notificationRouteTarget)
            : undefined
        }
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onLogout={onLogout}
        logoutLabel="Đăng xuất hệ thống"
      />

      <div className="flex flex-1 min-h-[calc(100dvh-50px)] items-start">
        {/* Left Synchronized Light Administrative Sidebar */}
        <aside
          aria-label="Điều hướng nghiệp vụ cán bộ"
          className={`${
            isSidebarCollapsed ? 'w-[60px]' : 'w-[238px]'
          } sticky top-[50px] h-[calc(100dvh-50px)] overflow-y-auto shrink-0 bg-white text-[#1E293B] flex flex-col justify-between border-r border-[#DFE5EC] transition-all duration-150 select-none z-30 print:hidden`}
        >
          <div>
            {/* Compact Scope Card */}
            {!isSidebarCollapsed && (
              <div className="mx-2.5 mt-2.5 mb-1.5 px-3 py-2 rounded-[4px] bg-[#F8FAFC] border border-[#E2E8F0] text-[11px]">
                <div className="font-bold text-[#0F172A] text-[11.5px] truncate">
                  {currentUser.primaryRole === 'SCHOOL_OFFICER'
                    ? 'Sơ tuyển cấp Trường / Đơn vị'
                    : 'Hệ thống xét duyệt Thành phố'}
                </div>
                <div className="text-[#007EE5] font-semibold text-[11px] mt-0.5 truncate">
                  {currentUser.primaryRole === 'SCHOOL_OFFICER'
                    ? currentUser.unitLabel || 'Cơ sở đào tạo tại Đà Nẵng'
                    : formatAcademicYearLabel(
                        currentSeason?.schoolYear || '2025–2026'
                      )}
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="p-2 space-y-0.5">
              {visibleNavItems.map((item, idx) => {
                const isActive = activeSidebarId === item.id;
                const badgeVal = getBadgeValue(item.badgeKey);
                const displayLabel =
                  currentUser.primaryRole === 'CITY_MANAGER' && item.managerLabel
                    ? item.managerLabel
                    : currentUser.primaryRole === 'CITY_COMMITTEE' &&
                      item.committeeLabel
                    ? item.committeeLabel
                    : item.label;

                const prevItem = idx > 0 ? visibleNavItems[idx - 1] : null;
                const showGroupHeader =
                  !isSidebarCollapsed &&
                  item.group !== 'core' &&
                  item.group !== 'school' &&
                  (!prevItem || prevItem.group !== item.group);

                const groupTitle =
                  item.group === 'committee'
                    ? 'HỘI ĐỒNG XÉT CHỌN'
                    : item.group === 'info'
                    ? 'THỐNG KÊ & THÔNG BÁO'
                    : item.group === 'management'
                    ? 'ĐIỀU PHỐI TIẾN ĐỘ'
                    : item.group === 'admin_gov'
                    ? 'QUẢN TRỊ CHƯƠNG TRÌNH'
                    : item.group === 'admin_sys'
                    ? 'QUẢN TRỊ HỆ THỐNG'
                    : null;

                const isAwardTrackIcon =
                  item.id === 'white_bird_review' ||
                  item.id === 'collective_review' ||
                  item.id === 'results' ||
                  item.id === 'recognition';

                return (
                  <React.Fragment key={item.id}>
                    {showGroupHeader && groupTitle && (
                      <div className="pt-3 pb-1 px-2.5 text-[10px] font-bold tracking-[0.07em] text-[#64748B] uppercase">
                        {groupTitle}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectRoute(item.id)}
                      title={isSidebarCollapsed ? displayLabel : undefined}
                      className={`w-full flex items-center ${
                        isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-2.5'
                      } gap-2 py-2 rounded-[4px] text-[12.5px] transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#10A37F] text-white font-semibold'
                          : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`shrink-0 ${
                            isActive
                              ? 'text-white'
                              : isAwardTrackIcon
                                ? 'text-[#EA8C00]'
                                : 'text-[#64748B]'
                          }`}
                        >
                          {item.icon}
                        </span>
                        {!isSidebarCollapsed && (
                          <span className="truncate">{displayLabel}</span>
                        )}
                      </div>

                      {!isSidebarCollapsed && badgeVal > 0 && (
                        <span
                          className={`px-1.5 py-0.5 text-[10.5px] font-bold rounded-[3px] tabular-nums shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeKey === 'attention' ||
                                item.badgeKey === 'unassigned' ||
                                item.badgeKey === 'committee'
                              ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                              : 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]'
                          }`}
                        >
                          {badgeVal}
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* Bottom Quick Account Footer */}
          <div className="p-2.5 bg-[#F8FAFC] border-t border-[#DFE5EC] space-y-1.5">
            {!isSidebarCollapsed ? (
              <>
                <div className="px-2.5 py-1.5 rounded-[4px] bg-white border border-[#E2E8F0]">
                  <div className="text-[10.5px] font-bold text-[#007EE5] truncate">
                    {currentUser.roleLabel}
                  </div>
                  <div className="text-[12px] font-bold text-[#0F172A] truncate">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10.5px] text-[#64748B] truncate">
                    {currentUser.email}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-[4px] bg-white hover:bg-[#F1F5F9] border border-[#DFE5EC] text-[#334155] text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <KeyRound size={12.5} className="text-[#10A37F] shrink-0" />
                    <span>Mật khẩu</span>
                  </button>

                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-[4px] bg-white hover:bg-[#FEF2F2] border border-[#DFE5EC] hover:border-[#FECACA] text-[#DC2626] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut size={12.5} className="shrink-0" />
                      <span>Đăng xuất</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(true)}
                  title="Đổi mật khẩu"
                  aria-label="Đổi mật khẩu"
                  className="w-8 h-8 rounded-[4px] bg-white hover:bg-[#F1F5F9] border border-[#DFE5EC] text-[#334155] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <KeyRound size={13.5} className="text-[#10A37F]" />
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Đăng xuất hệ thống"
                    aria-label="Đăng xuất hệ thống"
                    className="w-8 h-8 rounded-[4px] bg-white hover:bg-[#FEF2F2] border border-[#DFE5EC] text-[#DC2626] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <LogOut size={13.5} />
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Viewport */}
        <div className="flex-1 min-w-0 flex flex-col">
          <AwardProgramContextBar
            currentUser={currentUser}
            activeRouteId={activeRouteId}
            currentSeason={currentSeason}
            seasons={seasons}
            onSwitchSeason={onSwitchSeason}
            onOpenSeasonManagement={() => onSelectRoute('admin_season')}
          />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
      <FeedbackFloatingWidget />
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        accountName={currentUser.fullName}
        accountEmail={currentUser.email}
        roleLabel={currentUser.roleLabel}
      />
    </div>
  );
};
