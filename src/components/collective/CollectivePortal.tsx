/**
 * 5TOT Đà Nẵng — Collective Portal & Student Account Collective Tab (FSD Route Composition)
 * Cơ quan chỉ đạo: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 * Niên khóa áp dụng: Năm học 2025–2026
 *
 * Decomposed into Feature-Sliced portal modules:
 * - portal/CollectiveOverviewTab: Status dashboard, metrics overview & quick actions
 * - portal/CollectiveEvidenceTab: Complete repository of evidence attachments
 * - portal/CollectiveSupplementsTab: Official City supplement requests & history
 * - portal/CollectiveResultsTab: Final recognition decision, certificate & decree
 * - portal/CollectiveAccountTab: Account profile and collective profile switcher
 * - CollectiveWorkspace: Dedicated 4-requirement editing & submission workspace
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Building2,
  FileText,
  FileCheck2,
  Bell,
  Award,
  LogOut,
  Plus,
  Clock,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import {
  getAllCollectiveApplications,
  createCollectiveApplication,
  subscribeToCollectiveStore,
  hydrateCollectiveStore,
} from '../../staff/collectiveStore';
import { isBackendMode } from '../../shared/config/executionMode';
import { resolveDomainServices } from '../../entities/services/modeResolver';
import {
  CollectiveApplication,
  CollectiveType,
  COLLECTIVE_REQUIREMENTS_META,
  COLLECTIVE_TYPE_LABELS,
} from '../../staff/collectiveTypes';
import { SchoolReviewUnitId } from '../../staff/schoolReviewTypes';
import { CollectiveWorkspace } from './CollectiveWorkspace';
import { CollectiveResultModal } from './CollectiveResultModal';
import { CreateCollectiveModal } from './CreateCollectiveModal';
import { CollectiveOverviewTab } from './portal/CollectiveOverviewTab';
import { CollectiveEvidenceTab } from './portal/CollectiveEvidenceTab';
import { CollectiveSupplementsTab } from './portal/CollectiveSupplementsTab';
import { CollectiveResultsTab } from './portal/CollectiveResultsTab';
import { CollectiveAccountTab } from './portal/CollectiveAccountTab';
import { Button } from '../buttons/Button';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { PortalTopHeader } from '../shell/PortalTopHeader';
import {
  calculateParticipationRate,
  calculateRecognitionRate,
} from '../../entities/collective/collectiveCalculations';

export type CollectivePortalTab =
  | 'overview'
  | 'application'
  | 'evidence'
  | 'supplements'
  | 'notifications'
  | 'results'
  | 'account';

export interface CollectivePortalProps {
  initialAppId?: string;
  currentEmail?: string;
  studentIdentity?: {
    fullName: string;
    studentId: string;
    university: string;
  };
  studentProfileSnapshot?: {
    institutionId?: string;
    institutionName?: string;
    faculty?: string;
    className?: string;
    phone?: string;
    email?: string;
  } | null;
  embeddedInStudentPortal?: boolean;
  onLogout?: () => void;
  onSwitchToIndividual?: () => void;
  onSwitchToStudentPortal?: () => void;
}

export const CollectivePortal: React.FC<CollectivePortalProps> = ({
  initialAppId,
  currentEmail,
  studentIdentity,
  studentProfileSnapshot,
  embeddedInStudentPortal = true,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<CollectivePortalTab>('overview');
  const [selectedAppId, setSelectedAppId] = useState<string>(initialAppId || '');
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [storeVersion, setStoreVersion] = useState(0);

  const effectiveEmail = (
    currentEmail ||
    studentProfileSnapshot?.email ||
    ''
  )
    .trim()
    .toLowerCase();
  const effectiveStudentId = (studentIdentity?.studentId || '').trim();
  const effectiveStudentName =
    (studentIdentity?.fullName || '').trim() || 'Sinh viên Đà Nẵng';
  const effectiveUniversity =
    studentProfileSnapshot?.institutionName ||
    studentIdentity?.university ||
    '';

  // Subscribe to persistent store updates
  useEffect(() => {
    const unsubscribe = subscribeToCollectiveStore(() => {
      setStoreVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isBackendMode()) return;
    let cancelled = false;
    resolveDomainServices()
      .collective.listApplications()
      .then((colApps) => {
        if (!cancelled && Array.isArray(colApps)) {
          hydrateCollectiveStore(colApps);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [effectiveEmail, effectiveStudentId]);

  const allApps = useMemo(() => {
    void storeVersion;
    return getAllCollectiveApplications();
  }, [storeVersion]);

  const myApps = useMemo(() => {
    return allApps.filter((a) => {
      const appEmail = (a.preparedByUserEmail || '').trim().toLowerCase();
      const appUserId = (a.preparedByUserId || '').trim();
      if (effectiveEmail && appEmail === effectiveEmail) return true;
      if (
        effectiveStudentId &&
        (appUserId === effectiveStudentId ||
          appUserId === `user-${effectiveStudentId}` ||
          appUserId === `student-${effectiveStudentId}`)
      ) {
        return true;
      }
      return false;
    });
  }, [allApps, effectiveEmail, effectiveStudentId]);

  useEffect(() => {
    if (initialAppId) {
      setSelectedAppId(initialAppId);
      return;
    }
    if (myApps.length > 0) {
      if (!selectedAppId || !myApps.some((a) => a.id === selectedAppId)) {
        setSelectedAppId(myApps[0].id);
      }
    } else if (selectedAppId && !allApps.some((a) => a.id === selectedAppId)) {
      setSelectedAppId('');
    }
  }, [myApps, allApps, initialAppId, selectedAppId]);

  const currentApp: CollectiveApplication | undefined = useMemo(() => {
    if (selectedAppId) {
      return myApps.find((a) => a.id === selectedAppId) || allApps.find((a) => a.id === selectedAppId);
    }
    return myApps[0];
  }, [myApps, allApps, selectedAppId]);

  const tt01 = currentApp?.tt01 || {
    isRecognizedSchoolLevel: false,
    recognizedAcademicYear: '2025–2026',
    issuingUnitName: '',
    decisionNumber: '',
    decisionDate: '',
    evidenceFiles: [],
  };
  const tt02 = currentApp?.tt02 || {
    totalMembers: 0,
    participatingCount: 0,
    censusDate: '',
    evidenceFiles: [],
    structuredMembers: [],
  };
  const tt03 = currentApp?.tt03 || {
    recognizedCount: 0,
    recognizedAcademicYear: '2025–2026',
    issuingInstitutionName: '',
    evidenceFiles: [],
    structuredRecognizedMembers: [],
  };
  const tt04 = currentApp?.tt04 || {
    noViolationsConfirmed: false,
    confirmingUnitName: '',
    confirmationDate: '',
    scopeYear: '2025–2026',
    evidenceFiles: [],
  };
  const status = currentApp?.status || 'draft';

  const participationRate = calculateParticipationRate(
    tt02.participatingCount,
    tt02.totalMembers
  );
  const recognitionRate = calculateRecognitionRate(
    tt03.recognizedCount,
    tt02.totalMembers
  );

  const allEvidence = useMemo(() => {
    const list: Array<any> = [];
    tt01.evidenceFiles?.forEach((f) => list.push({ ...f, reqCode: 'TT01' }));
    tt02.evidenceFiles?.forEach((f) => list.push({ ...f, reqCode: 'TT02' }));
    tt03.evidenceFiles?.forEach((f) => list.push({ ...f, reqCode: 'TT03' }));
    tt04.evidenceFiles?.forEach((f) => list.push({ ...f, reqCode: 'TT04' }));
    return list;
  }, [tt01, tt02, tt03, tt04]);

  const pendingSupplement = currentApp?.supplementRequests?.find(
    (s) => s.status === 'pending'
  );

  const navItems = [
    { id: 'overview', label: 'Tổng quan tập thể', icon: <Building2 size={15} /> },
    { id: 'application', label: 'Kê khai 04 Tiêu chuẩn', icon: <FileText size={15} /> },
    {
      id: 'evidence',
      label: 'Kho minh chứng',
      icon: <FileCheck2 size={15} />,
      badge: allEvidence.length,
      badgeColor: 'bg-[#0D78AE]/10 text-[#0D78AE]',
    },
    {
      id: 'supplements',
      label: 'Yêu cầu bổ sung',
      icon: <Clock size={15} />,
      badge: pendingSupplement ? 1 : 0,
      badgeColor: 'bg-[#D97706]/15 text-[#D97706]',
    },
    {
      id: 'results',
      label: 'Kết quả xét chọn',
      icon: <Award size={15} />,
      badge: status === 'published' ? 1 : undefined,
      badgeColor: 'bg-[#16A34A]/15 text-[#16A34A]',
    },
    {
      id: 'account',
      label: `Danh sách tập thể (${myApps.length})`,
      icon: <Users size={15} />,
    },
  ];

  const handleCreateSubmit = (payload: {
    collectiveName: string;
    collectiveType: CollectiveType;
    institutionId: string;
    institutionName: string;
    schoolReviewUnitId: SchoolReviewUnitId;
    schoolReviewUnitName: string;
    facultyName: string;
    contactPhone: string;
  }) => {
    const created = createCollectiveApplication({
      collectiveName: payload.collectiveName,
      collectiveType: payload.collectiveType,
      institutionId: payload.institutionId,
      institutionName: payload.institutionName,
      schoolReviewUnitId: payload.schoolReviewUnitId,
      schoolReviewUnitName: payload.schoolReviewUnitName,
      facultyName: payload.facultyName,
      contactPhone: payload.contactPhone,
      preparedByUserId:
        effectiveStudentId ||
        currentApp?.preparedByUserId ||
        `user-${Date.now()}`,
      preparedByUserName:
        effectiveStudentName ||
        currentApp?.preparedByUserName ||
        'Sinh viên phụ trách tập thể',
      preparedByUserEmail:
        effectiveEmail ||
        currentApp?.preparedByUserEmail ||
        `${effectiveStudentId || 'sv'}@udn.vn`,
    });
    setSelectedAppId(created.id);
    setIsCreateModalOpen(false);
    setActiveTab('application');
  };

  // =========================================================================
  // EMPTY STATE: KHI SINH VIÊN CHƯA KHỞI TẠO HỒ SƠ TẬP THỂ NÀO
  // =========================================================================
  if (!currentApp) {
    return (
      <div className="flex-1 w-full max-w-6xl mx-auto px-5 lg:px-7 py-6 space-y-5 text-[#1E293B] animate-in fade-in duration-150">
        {/* Flat Administrative Onboarding Box */}
        <div className="bg-white rounded-[6px] border border-[#DFE5EC] border-t-[3px] border-t-[#007EE5] p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[4px] bg-[#EFF6FF] text-[#0066CC] text-[11px] font-bold tracking-wide border border-[#BFDBFE]">
              <Users size={13} />
              <span>HẠNG MỤC XÉT CHỌN TẬP THỂ · NĂM HỌC 2025–2026</span>
            </div>
            <h1 className="text-[20px] sm:text-[22px] font-extrabold text-[#0F172A] tracking-tight">
              Hồ sơ Tập thể “Sinh viên 5 tốt” cấp Thành phố Đà Nẵng
            </h1>
            <p className="text-[13px] text-[#475569] leading-relaxed">
              Khởi tạo và kê khai trực tiếp hồ sơ đề nghị xét chọn danh hiệu{' '}
              <strong className="text-[#0F172A]">Tập thể Sinh viên 5 tốt cấp Thành phố</strong>{' '}
              (Chi hội, Liên chi hội, Chi đoàn, Liên chi đoàn hoặc CLB/Đội/Nhóm) ngay trong tài khoản của bạn.
            </p>
            <div className="pt-1 flex items-center gap-3 text-[12.5px] text-[#475569] flex-wrap">
              <span>
                Người phụ trách:{' '}
                <strong className="text-[#0F172A]">{effectiveStudentName}</strong>
                {effectiveStudentId ? ` (MSSV: ${effectiveStudentId})` : ''}
              </span>
              {effectiveUniversity && (
                <>
                  <span>·</span>
                  <span>
                    Đơn vị: <strong className="text-[#007EE5]">{effectiveUniversity}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 font-semibold h-[42px] px-5"
            >
              <Plus size={17} />
              <span>Khởi tạo hồ sơ Tập thể SV5T</span>
            </Button>
          </div>
        </div>

        {/* 4 Criteria Overview Grid */}
        <div className="space-y-2.5">
          <h2 className="text-[14.5px] font-bold text-[#0F172A]">
            04 Tiêu chuẩn xét chọn Tập thể Sinh viên 5 tốt cấp Thành phố
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {(['TT01', 'TT02', 'TT03', 'TT04'] as const).map((code) => {
              const meta = COLLECTIVE_REQUIREMENTS_META[code];
              return (
                <div
                  key={code}
                  className="bg-white rounded-[6px] border border-[#DFE5EC] p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#0066CC] bg-[#EFF6FF] border border-[#BFDBFE] px-2 py-0.5 rounded-[4px]">
                      {meta.code} — {meta.shortTitle}
                    </span>
                    <span className="text-[11px] font-semibold text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-[4px]">
                      {meta.ruleBadge}
                    </span>
                  </div>
                  <div className="text-[13.5px] font-bold text-[#0F172A]">
                    {meta.title}
                  </div>
                  <p className="text-[12.5px] text-[#475569] leading-relaxed">
                    {meta.ruleHelper}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Direct Submission Regulatory Info */}
        <div className="p-4 bg-[#F8FAFC] border border-[#DFE5EC] border-l-[3px] border-l-[#10A37F] rounded-[4px] flex items-start gap-3 text-[12.5px] text-[#334155]">
          <ShieldCheck size={18} className="shrink-0 text-[#10A37F] mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-bold text-[13px] text-[#0F172A]">
              Quy trình khởi tạo và nộp hồ sơ Tập thể:
            </span>
            <p>
              Sau khi nhấn <strong>“Khởi tạo hồ sơ Tập thể SV5T”</strong>, bạn kê khai đầy đủ 04 tiêu chuẩn, danh sách thành viên và minh chứng kèm theo, sau đó nộp trực tiếp lên{' '}
              <strong>Hội Sinh viên Việt Nam Thành phố Đà Nẵng</strong> để thẩm định và xét chọn.
            </p>
          </div>
        </div>

        <CreateCollectiveModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onContinueExisting={(appId) => {
            setSelectedAppId(appId);
            setActiveTab('application');
          }}
          initialUserName={effectiveStudentName}
          initialUserEmail={effectiveEmail}
          initialStudentId={effectiveStudentId}
          initialUniversity={effectiveUniversity}
          initialInstitutionId={studentProfileSnapshot?.institutionId}
          initialFaculty={studentProfileSnapshot?.faculty}
          initialClassName={studentProfileSnapshot?.className}
          initialPhone={studentProfileSnapshot?.phone}
          onSubmit={handleCreateSubmit}
        />
      </div>
    );
  }

  return (
    <div
      className={
        embeddedInStudentPortal
          ? 'flex-1 flex flex-col min-h-screen bg-[#F4F6F9] text-[#1E293B] select-text'
          : 'min-h-screen flex flex-col bg-[#F4F6F9] text-[#1E293B] select-text'
      }
    >
      {!embeddedInStudentPortal && (
        <PortalTopHeader
          title="5TOT Đà Nẵng"
          subtitle="Cổng xét chọn Tập thể Sinh viên 5 tốt cấp Thành phố"
          roleBadge="Cổng Tập thể"
          userName={effectiveStudentName}
          userEmail={effectiveEmail || undefined}
          universityLabel={effectiveUniversity || currentApp.institutionName}
          onOpenProfile={() => setActiveTab('account')}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onLogout={onLogout}
          logoutLabel="Đăng xuất"
        />
      )}

      <div className={embeddedInStudentPortal ? 'flex-1 flex flex-col' : 'flex flex-1 min-h-[calc(100dvh-50px)]'}>
        {/* Top Horizontal Sub-Navigation when embedded inside Student Account */}
        {embeddedInStudentPortal ? (
          <div className="bg-white border-b border-[#DFE5EC] px-5 lg:px-7 py-3 sticky top-[50px] z-20">
            <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-[5px] bg-[#007EE5] text-white flex items-center justify-center font-bold shrink-0">
                    <Users size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-bold text-[#0F172A] truncate">
                        {currentApp.collectiveName}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569]">
                        {COLLECTIVE_TYPE_LABELS[currentApp.collectiveType] || currentApp.collectiveType}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[#64748B] truncate">
                      {currentApp.institutionName} · {currentApp.facultyName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {myApps.length > 1 && (
                    <select
                      value={currentApp.id}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      aria-label="Chuyển đổi hồ sơ tập thể"
                      className="h-[32px] px-2.5 bg-white border border-[#CBD5E1] rounded-[5px] text-[12.5px] font-semibold text-[#1E293B] outline-none focus:border-[#007EE5]"
                    >
                      {myApps.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.collectiveName} ({COLLECTIVE_TYPE_LABELS[app.collectiveType]})
                        </option>
                      ))}
                    </select>
                  )}

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Khởi tạo tập thể mới</span>
                  </Button>
                </div>
              </div>

              {/* Flat Administrative Sub-tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pt-1.5 border-t border-[#E2E8F0]">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id as CollectivePortalTab)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[12.5px] whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#10A37F] text-white font-semibold'
                          : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] font-medium'
                      }`}
                    >
                      <span className={isActive ? 'text-white' : 'text-[#64748B]'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded-[4px] tabular-nums ${
                            isActive
                              ? 'bg-white/25 text-white'
                              : item.badgeColor || 'bg-[#E2E8F0] text-[#475569]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Standalone Light Sub-Sidebar Navigation */
          <aside className="w-[238px] bg-white border-r border-[#DFE5EC] flex flex-col shrink-0 z-20">
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as CollectivePortalTab)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[4px] text-[13px] transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#10A37F] text-white font-semibold'
                        : 'text-[#334155] hover:text-[#0F172A] hover:bg-[#F1F5F9] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={isActive ? 'text-white' : 'text-[#64748B]'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded-[4px] tabular-nums ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : item.badgeColor || 'bg-[#E2E8F0] text-[#475569]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {onLogout && (
              <div className="p-2.5 border-t border-[#DFE5EC] bg-[#F8FAFC] space-y-1">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-[4px] text-[12px] font-medium text-[#334155] hover:bg-[#E2E8F0]/60 transition-colors cursor-pointer"
                >
                  <span>Đổi mật khẩu</span>
                  <KeyRound size={13} className="text-[#10A37F]" />
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-[4px] text-[12px] font-medium text-[#475569] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                >
                  <span>Đăng xuất</span>
                  <LogOut size={13} />
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* TAB 1: TỔNG QUAN */}
        {activeTab === 'overview' && (
          <CollectiveOverviewTab
            currentApp={currentApp}
            participationRate={participationRate}
            recognitionRate={recognitionRate}
            allEvidence={allEvidence}
            onGoToApplication={() => setActiveTab('application')}
            onGoToSupplements={() => setActiveTab('supplements')}
            onOpenResultModal={() => setIsResultModalOpen(true)}
          />
        )}

        {/* TAB 2: KHÔNG GIAN KÊ KHAI 04 TIÊU CHUẨN */}
        {activeTab === 'application' && (
          <CollectiveWorkspace
            application={currentApp}
            onBackToList={() => setActiveTab('overview')}
            currentUserEmail={currentApp.preparedByUserEmail}
            currentUserName={currentApp.preparedByUserName}
          />
        )}

        {/* TAB 3: KHO MINH CHỨNG */}
        {activeTab === 'evidence' && (
          <CollectiveEvidenceTab
            currentApp={currentApp}
            allEvidence={allEvidence}
            onGoToApplication={() => setActiveTab('application')}
          />
        )}

        {/* TAB 4: YÊU CẦU BỔ SUNG */}
        {activeTab === 'supplements' && (
          <CollectiveSupplementsTab
            currentApp={currentApp}
            onGoToApplication={() => setActiveTab('application')}
          />
        )}

        {/* TAB 5: THÔNG BÁO */}
        {activeTab === 'notifications' && (
          <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-[20px] font-black text-[#172A3A]">
                Hộp thư & Thông báo xét duyệt
              </h2>
              <p className="text-[13px] text-[#607483] mt-0.5">
                Các cập nhật chính thức từ Hội Sinh viên TP. Đà Nẵng về tiến độ hồ sơ tập thể
              </p>
            </div>

            <div className="p-4 bg-white border border-[#DCE7EE] rounded-[14px] space-y-3">
              <div className="flex items-center gap-2.5 font-bold text-[13.5px] text-[#172A3A]">
                <Bell size={16} className="text-[#0D78AE]" />
                <span>Tiến trình tiếp nhận hồ sơ</span>
              </div>
              <p className="text-[12.5px] text-[#607483] leading-relaxed">
                Hồ sơ {currentApp.collectiveName} hiện đang ở trạng thái:{' '}
                <strong className="text-[#172A3A]">{currentApp.status}</strong>. Mọi yêu cầu điều chỉnh hoặc quyết định công nhận sẽ được thông báo trực tiếp tại đây.
              </p>
            </div>
          </div>
        )}

        {/* TAB 6: KẾT QUẢ XÉT CHỌN */}
        {activeTab === 'results' && (
          <CollectiveResultsTab
            currentApp={currentApp}
            onOpenResultModal={() => setIsResultModalOpen(true)}
          />
        )}

        {/* TAB 7: DANH SÁCH / QUẢN LÝ TẬP THỂ */}
        {activeTab === 'account' && (
          <CollectiveAccountTab
            currentApp={currentApp}
            allApps={myApps.length > 0 ? myApps : [currentApp]}
            onSelectApp={(appId) => {
              setSelectedAppId(appId);
              setActiveTab('overview');
            }}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onLogout={embeddedInStudentPortal ? undefined : onLogout}
          />
        )}
        </div>
      </div>

      {/* Result Certificate Modal */}
      <CollectiveResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        application={currentApp}
      />

      {/* Create New Collective Application Modal */}
      <CreateCollectiveModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onContinueExisting={(appId) => {
          setSelectedAppId(appId);
          setActiveTab('application');
        }}
        initialUserName={effectiveStudentName}
        initialUserEmail={effectiveEmail}
        initialStudentId={effectiveStudentId}
        initialUniversity={effectiveUniversity}
        initialInstitutionId={studentProfileSnapshot?.institutionId}
        initialFaculty={studentProfileSnapshot?.faculty}
        initialClassName={studentProfileSnapshot?.className}
        initialPhone={studentProfileSnapshot?.phone}
        onSubmit={handleCreateSubmit}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        accountName={currentApp.preparedByUserName || effectiveStudentName}
        accountEmail={currentApp.preparedByUserEmail || effectiveEmail}
        roleLabel="Người phụ trách hồ sơ Tập thể"
      />
    </div>
  );
};

