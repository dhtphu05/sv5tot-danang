/**
 * 5TOT Đà Nẵng — Official Public Entry Page (Rebuilt from Approved Visual Reference)
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Sections 1–51:
 * - Page architecture:
 *   1. InstitutionalHeader
 *   2. HeroIdentity
 *   3. AuthorityMeta
 *   4. SelectionCyclePanel
 *   5. PublicActionRow
 *   6. FiveCriteriaStrip
 *   7. ApplicationPreview
 *   8. PublicFooter (minimal institutional footer)
 *   9. OfficialGuidanceModal (for "Quy định 05 tiêu chuẩn" & "Hướng dẫn nộp minh chứng")
 */

import React, { useState } from 'react';
import { InstitutionalHeader } from './landing/InstitutionalHeader';
import { PublicHero } from './landing/PublicHero';
import { PublicFooter } from './landing/PublicFooter';
import { OfficialGuidanceModal } from './landing/OfficialGuidanceModal';

export interface PublicEntryPageProps {
  isAuthenticated?: boolean;
  onStartApplication: () => void;
  onNavigateToLogin: () => void;
  onNavigateToCollectiveLogin?: () => void;
  onEnterAuthenticatedHome?: () => void;
}

export type PublicLandingPageProps = PublicEntryPageProps;

export const PublicEntryPage: React.FC<PublicEntryPageProps> = ({
  isAuthenticated = false,
  onStartApplication,
  onNavigateToLogin,
  onNavigateToCollectiveLogin,
  onEnterAuthenticatedHome,
}) => {
  const [guidanceModalOpen, setGuidanceModalOpen] = useState<boolean>(false);
  const [guidanceModalTab, setGuidanceModalTab] = useState<
    'criteria' | 'guide'
  >('criteria');

  const handleOpenGuidanceModal = (tab: 'criteria' | 'guide') => {
    setGuidanceModalTab(tab);
    setGuidanceModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#F5FAFE] via-[#FAFDFF] to-[#F1F8FD] text-[#0F2335] overflow-x-clip">
      {/* 1. InstitutionalHeader */}
      <InstitutionalHeader
        isAuthenticated={isAuthenticated}
        onStartApplication={onStartApplication}
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToCollectiveLogin={onNavigateToCollectiveLogin}
        onEnterAuthenticatedHome={onEnterAuthenticatedHome}
      />

      {/* 2–7. MainHero (HeroIdentity, AuthorityMeta, SelectionCyclePanel, PublicActionRow, FiveCriteriaStrip, ApplicationPreview) */}
      <main className="flex-1 flex flex-col">
        <PublicHero
          isAuthenticated={isAuthenticated}
          onStartApplication={onStartApplication}
          onNavigateToLogin={onNavigateToLogin}
          onEnterAuthenticatedHome={onEnterAuthenticatedHome}
          onOpenGuidanceModal={handleOpenGuidanceModal}
        />
      </main>

      {/* 8. Minimal Institutional Footer */}
      <PublicFooter onOpenGuidanceModal={handleOpenGuidanceModal} />

      {/* Official Regulations & Operational Guidance Modal */}
      <OfficialGuidanceModal
        isOpen={guidanceModalOpen}
        activeTab={guidanceModalTab}
        onTabChange={setGuidanceModalTab}
        onClose={() => setGuidanceModalOpen(false)}
        onStartApplication={onStartApplication}
      />
    </div>
  );
};

export const PublicLandingPage = PublicEntryPage;
