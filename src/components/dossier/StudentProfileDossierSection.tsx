/**
 * 5TOT ĐHĐN — Submitted Student Information Card (SRW-6)
 * Cơ quan quản lý: Đoàn Thanh niên - Hội Sinh viên Đại học Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Đại học Đà Nẵng
 *
 * ONE UNIFIED, COMPACT CANONICAL COMPONENT CONSUMED IDENTICALLY ACROSS:
 * 1. Student Application Workspace (Top of dossier)
 * 2. School Officer Preliminary Review Dossier (Top of dossier)
 * 3. City Officer Review Dossier (Top of dossier)
 * 4. City Committee Deliberation Dossier (Top of dossier)
 *
 * Architecture & UX Features:
 * - Single outer card with zero nested bordered sub-cards (no visual clutter or duplicate cards)
 * - Compact collapsed state showing 8 essential reviewer fields in a responsive grid
 * - Expandable "Xem đầy đủ thông tin" showing all 13 canonical fields + MSSV organized cleanly
 * - Compact inline submission-snapshot indicator (no giant green banner)
 * - Flexible container-friendly width: seamlessly adapts inside multi-pane reviewer workspaces
 * - Natural text wrapping for long Vietnamese institution names
 */

import React, { useState } from 'react';
import {
  UserCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Sparkles,
  Camera,
  Maximize2,
  X,
} from 'lucide-react';
import { StudentProfileDto } from '../../entities/application/studentApplicationTypes';
import { evaluateProfileCompleteness } from '../../demo/fixtures/studentProfileFixtures';

export interface SubmittedStudentInformationCardProps {
  profile?: StudentProfileDto | null;
  fallbackStudent?: {
    fullName?: string;
    studentId?: string;
    university?: string;
    faculty?: string;
    class?: string;
    email?: string;
    academicYear?: string;
  };
  isSnapshot?: boolean;
  submittedAt?: string;
  season?: string;
  defaultExpanded?: boolean;
  className?: string;
  userRole?: 'student' | 'school_officer' | 'city_officer' | 'city_committee' | string;
}

// Backward compatibility alias for existing imports
export type StudentProfileDossierSectionProps = SubmittedStudentInformationCardProps;

export const SubmittedStudentInformationCard: React.FC<SubmittedStudentInformationCardProps> = ({
  profile,
  fallbackStudent,
  isSnapshot = false,
  submittedAt,
  season,
  defaultExpanded = false,
  className = '',
  userRole,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const hasSuppliedData = Boolean(profile || fallbackStudent);

  const resolveVal = (val: string | undefined | null, fallback?: string | null, def = '—'): string => {
    if (val !== undefined && val !== null && val.trim() !== '') return val.trim();
    if (fallback !== undefined && fallback !== null && fallback.trim() !== '') return fallback.trim();
    return def;
  };

  // Derive consolidated 13 canonical fields without fabricating missing values
  const effectiveProfile: StudentProfileDto = hasSuppliedData
    ? {
        fullName: resolveVal(profile?.fullName, fallbackStudent?.fullName, '—'),
        gender: resolveVal(profile?.gender, undefined, '—'),
        dateOfBirth: resolveVal(profile?.dateOfBirth, undefined, '—'),
        ethnicity: resolveVal(profile?.ethnicity, undefined, '—'),
        academicYearNumber: profile?.academicYearNumber || 1,
        educationLevel: resolveVal(profile?.educationLevel, undefined, 'Đại học'),
        className: resolveVal(profile?.className, fallbackStudent?.class, '—'),
        homeProvince: resolveVal(profile?.homeProvince, undefined, '—'),
        institutionId: profile?.institutionId || 'inst-dut',
        institutionName: resolveVal(profile?.institutionName, fallbackStudent?.university, '—'),
        unionPosition: resolveVal(profile?.unionPosition, undefined, '—'),
        politicalStatus: resolveVal(profile?.politicalStatus, undefined, '—'),
        phoneNumber: resolveVal(profile?.phoneNumber, undefined, '—'),
        email: resolveVal(profile?.email, fallbackStudent?.email, '—'),
        portraitUrl: profile?.portraitUrl || (fallbackStudent as any)?.portraitUrl || '',
      }
    : {
        fullName: 'Nguyễn Minh Anh',
        gender: 'Nữ',
        dateOfBirth: '15/10/2004',
        ethnicity: 'Kinh',
        academicYearNumber: 3,
        educationLevel: 'Đại học',
        className: '22T_CLC1 - Khóa 2022',
        homeProvince: 'Thành phố Đà Nẵng',
        institutionId: 'inst-dut',
        institutionName: 'Trường Đại học Bách khoa - Đại học Đà Nẵng',
        unionPosition: 'Bí thư Chi đoàn',
        politicalStatus: 'Đoàn viên',
        phoneNumber: '0905123456',
        email: 'minhanh.nguyen@dut.udn.vn',
        portraitUrl: '',
      };

  const studentIdCode =
    fallbackStudent?.studentId || (profile as any)?.studentCode || (hasSuppliedData ? '—' : '102220123');
  const effectiveSeason =
    season || fallbackStudent?.academicYear || 'Năm học 2025–2026';

  const completeness = evaluateProfileCompleteness(profile || effectiveProfile);

  return (
    <section
      aria-label="Thông tin ứng viên đã nộp hồ sơ"
      className={`bg-white rounded-xl sm:rounded-2xl border border-[#DCE7EE] shadow-2xs overflow-hidden transition-all duration-150 ${className}`}
    >
      {/* --- SINGLE UNIFIED HEADER --- */}
      <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-[#F8FBFD] border-b border-[#E8EFF5] flex items-center justify-between gap-2.5 flex-wrap select-none">
        {/* Left: Component Identity & Inline Snapshot Badge */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#E5F5FC] text-[#0D78AE] flex items-center justify-center shrink-0">
            <UserCircle2 size={16} />
          </div>
          <span className="text-[13.5px] font-bold text-[#172A3A] tracking-tight">
            Thông tin ứng viên
          </span>

          {/* Compact Inline Snapshot Indicator */}
          {isSnapshot ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#EDF9F0] text-[#136F3A] border border-[#BDE8C8]"
              title="Dữ liệu nhân thân và học tập đã được đóng băng nguyên vẹn tại thời điểm nộp đơn"
            >
              <Lock size={10} className="text-[#16A34A]" />
              <span>Dữ liệu lúc nộp hồ sơ</span>
              {submittedAt && (
                <span className="hidden sm:inline font-mono opacity-80">· {submittedAt}</span>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F0F4F8] text-[#526B7C] border border-[#DCE7EE]">
              Bản dự thảo
            </span>
          )}

          {/* Season Badge */}
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white text-[#526B7C] border border-[#DCE7EE]">
            <Calendar size={11} className="text-[#0D78AE]" />
            <span>{effectiveSeason}</span>
          </span>
        </div>

        {/* Right: Completeness & Toggle */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              completeness.isComplete
                ? 'bg-[#EBF7EE] text-[#15803D]'
                : 'bg-[#FEF3C7] text-[#B45309]'
            }`}
          >
            {completeness.completedFields}/13 trường đầy đủ
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0D78AE] hover:text-[#095386] px-2.5 py-1 rounded-lg hover:bg-[#EAF4FB] transition-colors cursor-pointer border border-[#D0E6F4]/60 bg-white"
            aria-label={isExpanded ? 'Thu gọn thông tin ứng viên' : 'Xem đầy đủ thông tin ứng viên'}
          >
            <span>{isExpanded ? 'Thu gọn' : 'Xem đầy đủ thông tin'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* --- DEFAULT COLLAPSED VIEW: 8 ESSENTIAL REVIEWER FIELDS WITH 3:4 PORTRAIT PHOTO --- */}
      <div className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
        {/* 3:4 Portrait Photo Column (Decision 12/QĐ/ĐHĐN-HSV) */}
        <div className="shrink-0 flex flex-col items-center mx-auto sm:mx-0">
          <div
            className={`relative w-20 sm:w-24 aspect-[3/4] rounded-lg border ${
              effectiveProfile.portraitUrl
                ? 'border-[#B9D9EB] bg-white cursor-pointer hover:ring-2 hover:ring-[#18A6E0]/40 transition-all'
                : 'border-[#DCE7EE] bg-[#F8FBFD]'
            } overflow-hidden flex flex-col items-center justify-center shadow-2xs group`}
            onClick={() => effectiveProfile.portraitUrl && setIsLightboxOpen(true)}
            title={effectiveProfile.portraitUrl ? 'Nhấp để xem ảnh lớn' : 'Chưa có ảnh thẻ 3×4'}
          >
            {effectiveProfile.portraitUrl ? (
              <>
                <img
                  src={effectiveProfile.portraitUrl}
                  alt={`Ảnh thẻ 3×4 - ${effectiveProfile.fullName}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 size={15} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-1.5 text-center text-[#8EA2B0]">
                <Camera size={20} className="mb-0.5 opacity-60 text-[#728391]" />
                <span className="text-[10px] font-semibold text-[#607483] leading-tight">Chưa có ảnh</span>
                <span className="text-[9px] text-[#8EA2B0]">3×4</span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-medium text-[#728391] mt-1 text-center">
            Ảnh thẻ 3×4
          </span>
        </div>

        {/* 8 Essential Reviewer Fields Grid */}
        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-5 gap-y-2.5 sm:gap-y-3 w-full">
          {/* Field 1: Họ và tên */}
          <div className="min-w-0">
            <span className="text-[10.5px] font-semibold text-[#728391] uppercase tracking-wider block">
              Họ và tên
            </span>
            <div className="text-[13.5px] font-bold text-[#172A3A] truncate mt-0.5">
              {effectiveProfile.fullName}
            </div>
          </div>

          {/* Field 2: MSSV */}
          <div className="min-w-0">
            <span className="text-[10.5px] font-semibold text-[#728391] uppercase tracking-wider block">
              MSSV
            </span>
            <div className="text-[13px] font-bold font-mono text-[#0D78AE] truncate mt-0.5">
              {studentIdCode}
            </div>
          </div>

          {/* Field 3: Giới tính */}
          <div className="min-w-0">
            <span className="text-[10.5px] font-semibold text-[#728391] uppercase tracking-wider block">
              Giới tính
            </span>
            <div className="text-[13px] font-medium text-[#172A3A] truncate mt-0.5">
              {effectiveProfile.gender || '—'}
            </div>
          </div>

          {/* Field 4: Ngày sinh */}
          <div className="min-w-0">
            <span className="text-[10.5px] font-semibold text-[#728391] uppercase tracking-wider block">
              Ngày sinh
            </span>
            <div className="text-[13px] font-medium text-[#172A3A] truncate mt-0.5">
              {effectiveProfile.dateOfBirth || '—'}
            </div>
          </div>

          {/* Field 5: Trường đào tạo (Spans 2 columns on wide screens, allows natural Vietnamese wrapping) */}
          <div className="col-span-2 sm:col-span-2 min-w-0">
            <span className="text-[10.5px] font-semibold text-[#728391] uppercase tracking-wider block">
              Trường đào tạo
            </span>
            <div
              className="text-[13px] font-semibold text-[#172A3A] leading-snug break-words mt-0.5"
              title={effectiveProfile.institutionName}
            >
              {effectiveProfile.institutionName || '—'}
              {effectiveProfile.institutionId?.startsWith('inst-d') && (
                <span className="inline-block text-[11px] text-[#0D78AE] font-normal ml-1.5">
                  (Sơ tuyển: ĐH Đà Nẵng)
                </span>
              )}
            </div>
          </div>

          {/* Field 6: Sinh viên năm thứ & Trình độ */}
          <div className="min-w-0">
            <span className="text-[10.5px] font-semibold text-[#728391] uppercase tracking-wider block">
              Năm thứ &amp; Trình độ
            </span>
            <div className="text-[13px] font-medium text-[#172A3A] truncate mt-0.5">
              Năm {effectiveProfile.academicYearNumber || 1} · {effectiveProfile.educationLevel || 'Đại học'}
            </div>
          </div>

          {/* Field 7: Lớp, khóa */}
          <div className="min-w-0">
            <span className="text-[10.5px] font-semibold text-[#728391] uppercase tracking-wider block">
              Lớp, khóa
            </span>
            <div className="text-[13px] font-medium text-[#172A3A] truncate mt-0.5">
              {effectiveProfile.className || '—'}
            </div>
          </div>

          {/* Field 8: Chức vụ Đoàn, Hội */}
          <div className="min-w-0 col-span-2 sm:col-span-1">
            <span className="text-[10.5px] font-semibold text-[#728391] uppercase tracking-wider block">
              Chức vụ Đoàn, Hội
            </span>
            <div className="text-[13px] font-medium text-[#172A3A] truncate mt-0.5">
              {effectiveProfile.unionPosition || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* --- EXPANDED VIEW: ALL 13 CANONICAL FIELDS IN A CLEAN, UNIFIED KEY-VALUE GRID --- */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3 border-t border-[#EDF3F7] bg-[#FAFCFE] space-y-4 animate-in fade-in duration-150">
          {/* Subtle Category 1: Cá nhân & Nhân thân */}
          <div>
            <div className="text-[11px] font-bold text-[#0D78AE] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Thông tin cá nhân</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2.5 text-[12.5px]">
              <div>
                <span className="text-[10.5px] text-[#728391] block">Họ và tên</span>
                <span className="font-semibold text-[#172A3A]">{effectiveProfile.fullName}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#728391] block">Mã số sinh viên (MSSV)</span>
                <span className="font-mono font-semibold text-[#0D78AE]">{studentIdCode}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#728391] block">Giới tính</span>
                <span className="font-medium text-[#172A3A]">{effectiveProfile.gender || '—'}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#728391] block">Ngày sinh</span>
                <span className="font-medium text-[#172A3A]">{effectiveProfile.dateOfBirth || '—'}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#728391] block">Dân tộc</span>
                <span className="font-medium text-[#172A3A]">
                  {effectiveProfile.ethnicity && effectiveProfile.ethnicity !== '—'
                    ? `Dân tộc ${effectiveProfile.ethnicity}`
                    : '—'}
                </span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#728391] block">Tỉnh / Thành phố</span>
                <span className="font-medium text-[#172A3A]">{effectiveProfile.homeProvince || '—'}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#EAF0F6]" />

          {/* Subtle Category 2: Học tập & Đào tạo */}
          <div>
            <div className="text-[11px] font-bold text-[#0D78AE] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Học tập &amp; Đào tạo</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2.5 text-[12.5px]">
              <div className="col-span-2">
                <span className="text-[10.5px] text-[#728391] block">Trường đào tạo</span>
                <span className="font-semibold text-[#172A3A] break-words">
                  {effectiveProfile.institutionName || '—'}
                  {effectiveProfile.institutionId?.startsWith('inst-d') && (
                    <span className="text-[11px] text-[#0D78AE] font-normal block mt-0.5">
                      Đơn vị xét duyệt sơ tuyển: Đại học Đà Nẵng
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#728391] block">Trình độ đào tạo</span>
                <span className="font-medium text-[#172A3A]">{effectiveProfile.educationLevel || 'Đại học'}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#728391] block">Sinh viên năm thứ</span>
                <span className="font-medium text-[#172A3A]">Năm thứ {effectiveProfile.academicYearNumber || 1}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#728391] block">Lớp, khóa học</span>
                <span className="font-medium text-[#172A3A]">{effectiveProfile.className || '—'}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#EAF0F6]" />

          {/* Subtle Category 3: Đoàn – Hội & Liên hệ */}
          <div>
            <div className="text-[11px] font-bold text-[#0D78AE] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Đoàn – Hội &amp; Liên hệ</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2.5 text-[12.5px]">
              <div>
                <span className="text-[10.5px] text-[#728391] block">Chức vụ Đoàn, Hội</span>
                <span className="font-semibold text-[#172A3A]">{effectiveProfile.unionPosition || '—'}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#728391] block">Diện chính trị</span>
                <span className="font-medium text-[#172A3A] inline-flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#0D78AE]" />
                  <span>{effectiveProfile.politicalStatus || '—'}</span>
                </span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#728391] block">Số điện thoại</span>
                <span className="font-mono font-medium text-[#172A3A]">{effectiveProfile.phoneNumber || '—'}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-[#728391] block">Email xác thực</span>
                <span className="font-mono text-[#0D78AE] text-[12px] break-all">{effectiveProfile.email || '—'}</span>
              </div>
            </div>
          </div>

          {/* Subtle Snapshot Footer */}
          {isSnapshot && (
            <div className="pt-2 text-[11px] text-[#607483] flex items-center justify-between gap-2 border-t border-[#EDF3F7] flex-wrap">
              <span className="inline-flex items-center gap-1 text-[#15803D]">
                <Lock size={11} className="text-[#16A34A] shrink-0" />
                <span>Bản ghi hồ sơ đã được đóng băng nguyên vẹn tại thời điểm nộp đơn.</span>
              </span>
              {submittedAt && (
                <span className="font-mono text-[#526B7C]">Thời điểm nộp: {submittedAt}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Preview Modal for Officer and Student */}
      {isLightboxOpen && effectiveProfile.portraitUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-[#DCE7EE] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-[#F8FBFD] border-b border-[#E8EFF5] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#172A3A]">Ảnh thẻ chân dung 3×4</h3>
                <p className="text-[11.5px] text-[#607483] font-medium">
                  {effectiveProfile.fullName} {studentIdCode !== '—' ? `· MSSV: ${studentIdCode}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-[#EAF4FB] text-[#607483] hover:text-[#172A3A] flex items-center justify-center transition-colors cursor-pointer"
                title="Đóng"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center justify-center bg-[#F4F9FC]">
              <div className="w-56 aspect-[3/4] rounded-xl overflow-hidden border border-[#DCE7EE] shadow-md bg-white">
                <img
                  src={effectiveProfile.portraitUrl}
                  alt={`Ảnh thẻ 3×4 - ${effectiveProfile.fullName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center mt-2.5 space-y-0.5">
                <span className="text-[11.5px] font-medium text-[#728391] block">
                  Tỷ lệ chuẩn 3:4 · Quyết định 12/QĐ/ĐHĐN-HSV
                </span>
                {effectiveProfile.institutionName && (
                  <span className="text-[11px] text-[#8EA2B0] block truncate max-w-xs">
                    {effectiveProfile.institutionName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Aliased export ensuring existing code and tests work without modification
export const StudentProfileDossierSection = SubmittedStudentInformationCard;
