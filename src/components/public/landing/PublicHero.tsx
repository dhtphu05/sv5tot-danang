/**
 * 5TOT Đà Nẵng — Main Public Portal Content & Decorative HSV Brand Artwork
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Sections 3–5, 8–28, 33–48:
 * - Centered primary container (max-width: 1280px).
 * - Right-side decorative brand artwork: large low-opacity HSV emblem / flame-star motif
 *   with soft circular rings and pale cyan/blue depth on the upper-right.
 * - Composes:
 *   1. HeroIdentity
 *   2. AuthorityMeta
 *   3. SelectionCyclePanel
 *   4. PublicActionRow
 *   5. FiveCriteriaStrip
 *   6. ApplicationPreview
 * - Single subtle GSAP entrance timeline (~1.15s) respecting prefers-reduced-motion.
 */

import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CriterionDefinition } from '../../../tokens';
import { HeroIdentity } from './HeroIdentity';
import { AuthorityMeta } from './AuthorityMeta';
import { SelectionCyclePanel } from './SelectionCyclePanel';
import { PublicActionRow } from './PublicActionRow';
import { FiveCriteriaStrip } from './FiveCriteriaStrip';
import { ApplicationPreview } from './ApplicationPreview';

gsap.registerPlugin(useGSAP);

export interface PublicHeroProps {
  isAuthenticated?: boolean;
  onStartApplication: () => void;
  onNavigateToLogin: () => void;
  onEnterAuthenticatedHome?: () => void;
  onOpenGuidanceModal?: (tab: 'criteria' | 'guide') => void;
}

export const PublicHero: React.FC<PublicHeroProps> = ({
  isAuthenticated = false,
  onStartApplication,
  onNavigateToLogin,
  onEnterAuthenticatedHome,
  onOpenGuidanceModal,
}) => {
  const [hoveredCriterionId, setHoveredCriterionId] = useState<
    CriterionDefinition['id'] | null
  >(null);
  const scopeRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (typeof window === 'undefined') return;
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (prefersReduced) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(
        '.gsap-hero-eyebrow',
        {
          y: 10,
          opacity: 0,
          duration: 0.4,
        },
        0.04
      )
        .from(
          '.gsap-hero-headline',
          {
            y: 26,
            opacity: 0,
            duration: 0.55,
          },
          0.1
        )
        .from(
          '.gsap-hero-copy',
          {
            y: 14,
            opacity: 0,
            duration: 0.45,
          },
          0.22
        )
        .from(
          '.gsap-authority-item',
          {
            y: 12,
            opacity: 0,
            duration: 0.42,
            stagger: 0.06,
          },
          0.32
        )
        .from(
          '.gsap-selection-panel',
          {
            y: 18,
            opacity: 0,
            duration: 0.48,
          },
          0.44
        )
        .from(
          '.gsap-action-row',
          {
            y: 14,
            opacity: 0,
            duration: 0.42,
          },
          0.54
        )
        .from(
          '.gsap-criteria-section',
          {
            y: 14,
            opacity: 0,
            duration: 0.45,
          },
          0.62
        )
        .from(
          '.gsap-application-preview',
          {
            y: 22,
            scale: 0.985,
            opacity: 0,
            duration: 0.55,
          },
          0.7
        );
    },
    { scope: scopeRef }
  );

  return (
    <section
      ref={scopeRef}
      aria-labelledby="public-portal-heading"
      className="relative flex-1 pt-8 sm:pt-10 lg:pt-11 pb-10 overflow-hidden"
    >
      {/* ================================================================= */}
      {/* DECORATIVE CANVAS & UPPER-RIGHT HSV BRAND ARTWORK (Sections 4 & 12) */}
      {/* ================================================================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      >
        {/* Soft upper-left cool ambient light */}
        <div
          className="absolute -top-36 -left-24 w-[680px] h-[440px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(212, 236, 252, 0.55) 0%, rgba(245, 250, 254, 0) 72%)',
          }}
        />

        {/* Upper-right HSV Emblem Artwork positioned relative to the primary container */}
        <div className="max-w-[1280px] mx-auto relative h-full">
          <div className="hidden md:block absolute -top-12 -right-24 lg:-right-20 w-[520px] lg:w-[620px] h-[520px] lg:h-[620px]">
            {/* Soft cyan-blue radial glow behind emblem */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 54% 46%, rgba(41, 169, 229, 0.25) 0%, rgba(120, 202, 242, 0.15) 42%, rgba(244, 250, 254, 0) 72%)',
              }}
            />

            {/* Large Low-Opacity HSV Flame-Star & Circular Rings SVG */}
            <svg
              viewBox="0 0 620 620"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                <radialGradient
                  id="heroEmblemDisc"
                  cx="50%"
                  cy="46%"
                  r="50%"
                  fx="50%"
                  fy="46%"
                >
                  <stop offset="0%" stopColor="#3BB4EC" stopOpacity="0.34" />
                  <stop offset="65%" stopColor="#6BC5F0" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#BCE4F9" stopOpacity="0.02" />
                </radialGradient>
                <linearGradient
                  id="heroRingStroke"
                  x1="80"
                  y1="40"
                  x2="540"
                  y2="540"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#58B9EB" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              {/* Outer decorative sweeping arcs */}
              <circle
                cx="340"
                cy="275"
                r="268"
                stroke="url(#heroRingStroke)"
                strokeWidth="1.5"
              />
              <circle
                cx="340"
                cy="275"
                r="234"
                fill="url(#heroEmblemDisc)"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeOpacity="0.78"
              />
              <circle
                cx="340"
                cy="275"
                r="204"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeOpacity="0.55"
              />

              {/* Subtle diagonal light sweep arc */}
              <path
                d="M135 165C205 75 340 42 465 95"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeOpacity="0.7"
              />

              {/* Official HSV Five-Pointed Star + Dove & Flame Motif (Authentic 487.1x487.1 geometry centered at 340,275) */}
              <g
                transform="translate(116, 55) scale(0.92)"
                fill="#FFFFFF"
                fillOpacity="0.92"
                fillRule="evenodd"
              >
                {/* Five-Pointed Star */}
                <polygon points="134.32 123.92 142.73 149.9 170.05 149.82 147.9 165.89 156.4 191.87 134.32 175.72 112.26 191.87 120.76 165.89 98.6 149.82 125.92 149.9 134.32 123.92" />

                {/* Official White Dove & Student Flame Motif (Left/Main Body) */}
                <path d="m107.43,267.75c35.06,46.56-1.41,112.59,113.84,139.82-10.91-103.76,40.8-127.74,61.04-207.12-21.15-52.71-29.89-110.84-12.24-174.22-22.57,10.08-42.55,26.89-59.12,52.71-56.54,92.36,24.15,170.73-1.17,212.7-45.55,47.21-41.89-64.13-94.94-27.32-2.5,1.18-5,2.25-7.41,3.42Z" />

                {/* Official White Dove & Student Flame Motif (Right Wing/Flame) */}
                <path d="m228.1,408.4c59.63,7.83,108.01-9.99,137.91-62.96,23.06-49.72,21.31-98.94,2.67-147.99-5.83,60.38-27.32,105.77-66.04,134.82,43.88-77.53,65.62-161.22-14.24-267.49,40.39,189.22-87.85,217.78-60.29,343.62Z" />
              </g>

              {/* Soft bottom wave fade */}
              <path
                d="M195 405C265 442 410 442 480 405"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeLinecap="round"
                strokeOpacity="0.65"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* PRIMARY CENTERED CONTAINER (max-width: 1280px — Section 5)        */}
      {/* ================================================================= */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-12 space-y-6">
        {/* 1. HeroIdentity (Eyebrow + Main Headline + Supporting Copy) */}
        <HeroIdentity />

        {/* 2. AuthorityMeta (Cơ quan quản lý | Đơn vị tổ chức | Năm học 2026–2027) */}
        <AuthorityMeta />

        {/* 3. SelectionCyclePanel (Thông tin đợt xét chọn Năm học 2026–2027) */}
        <SelectionCyclePanel />

        {/* 4. PublicActionRow ([Bắt đầu hồ sơ →] [Đăng nhập hệ thống] | Quy định & Hướng dẫn) */}
        <PublicActionRow
          isAuthenticated={isAuthenticated}
          onStartApplication={onStartApplication}
          onNavigateToLogin={onNavigateToLogin}
          onEnterAuthenticatedHome={onEnterAuthenticatedHome}
          onOpenGuidanceModal={onOpenGuidanceModal}
        />

        {/* 5. FiveCriteriaStrip (05 TIÊU CHUẨN XÉT CHỌN SINH VIÊN 5 TỐT) */}
        <div className="pt-1">
          <FiveCriteriaStrip
            activeCriterionId={hoveredCriterionId}
            onHoverCriterion={setHoveredCriterionId}
          />
        </div>

        {/* 6. ApplicationPreview (Simplified Real 5TOT System Preview) */}
        <div className="pt-1">
          <ApplicationPreview highlightedCriterionId={hoveredCriterionId} />
        </div>
      </div>
    </section>
  );
};
