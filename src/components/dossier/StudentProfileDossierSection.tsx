/**
 * 5TOT Đà Nẵng — Administrative Candidate Summary Box (SRW-6)
 * Cơ quan quản lý: Thành Đoàn - Hội Sinh viên Thành phố Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Flat 4-column administrative candidate metadata header + Cấp/Trạng thái summary matrix,
 * preserving the 3:4 portrait photo preview and 13-field expandable details across:
 * 1. Student Application Workspace
 * 2. School Officer Preliminary Review Dossier
 * 3. City Officer Review Dossier
 * 4. City Committee Deliberation Dossier
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle2,
  Camera,
  Maximize2,
  X,
} from 'lucide-react';
import { StudentProfileDto } from '../../entities/application/studentApplicationTypes';
import { evaluateProfileCompleteness } from '../../demo/fixtures/studentProfileFixtures';
import { resolveSchoolReviewUnit } from '../../staff/schoolReviewTypes';

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
  unitStatusLabel?: string;
  cityStatusLabel?: string;
  className?: string;
  userRole?: 'student' | 'school_officer' | 'city_officer' | 'city_committee' | string;
}

export type StudentProfileDossierSectionProps = SubmittedStudentInformationCardProps;

export const SubmittedStudentInformationCard: React.FC<SubmittedStudentInformationCardProps> = ({
  profile,
  fallbackStudent,
  isSnapshot = false,
  submittedAt,
  season,
  defaultExpanded = false,
  unitStatusLabel,
  cityStatusLabel,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  const hasSuppliedData = Boolean(profile || fallbackStudent);

  const resolveVal = (val: string | undefined | null, fallback?: string | null, def = '—'): string => {
    if (val !== undefined && val !== null && val.trim() !== '') return val.trim();
    if (fallback !== undefined && fallback !== null && fallback.trim() !== '') return fallback.trim();
    return def;
  };

  const effectiveProfile: StudentProfileDto = hasSuppliedData
    ? {
        fullName: resolveVal(profile?.fullName, fallbackStudent?.fullName, '—'),
        gender: resolveVal(profile?.gender, undefined, '—'),
        dateOfBirth: resolveVal(profile?.dateOfBirth, undefined, '—'),
        ethnicity: resolveVal(profile?.ethnicity, undefined, '—'),
        academicYearNumber: profile?.academicYearNumber || 1,
        educationLevel: resolveVal(profile?.educationLevel, undefined, 'Đại học'),
        className: resolveVal(profile?.className, fallbackStudent?.class, '—'),
        homeProvince: resolveVal(profile?.homeProvince, undefined, 'Đà Nẵng'),
        institutionId: profile?.institutionId || 'inst-dut',
        institutionName: resolveVal(profile?.institutionName, fallbackStudent?.university, '—'),
        unionPosition: resolveVal(profile?.unionPosition, undefined, '—'),
        politicalStatus: resolveVal(profile?.politicalStatus, undefined, 'Đoàn viên'),
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

  const classSchoolComposite = [
    effectiveProfile.className !== '—' ? effectiveProfile.className : null,
    fallbackStudent?.faculty ? fallbackStudent.faculty : null,
    effectiveProfile.institutionName !== '—' ? effectiveProfile.institutionName : null,
  ]
    .filter(Boolean)
    .join(', ');

  const resolvedUnitStatus =
    unitStatusLabel || (isSnapshot ? 'Đã tiếp nhận' : 'Đang kê khai');
  const resolvedCityStatus =
    cityStatusLabel || (isSnapshot ? 'Chờ xét chọn' : '—');

  return (
    <section
      aria-label="Thông tin ứng viên đã nộp hồ sơ"
      className={`bg-white rounded-[4px] border border-[#DFE5EC] overflow-hidden ${className}`}
    >
      {/* Flat 4-Column Administrative Summary Grid (Matching Central HSV Dossier Top Box) */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Compact 3:4 Portrait + Left 3 Administrative Metadata Columns */}
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-4 items-start">
          {/* 3:4 Portrait Photo Thumbnail */}
          <div className="shrink-0 flex flex-col items-center">
            <div
              className={`relative w-16 sm:w-[70px] aspect-[3/4] rounded-[4px] border ${
                effectiveProfile.portraitUrl
                  ? 'border-[#CBD5E1] bg-white cursor-pointer hover:border-[#007EE5] transition-colors'
                  : 'border-[#DFE5EC] bg-[#F8FAFC]'
              } overflow-hidden flex flex-col items-center justify-center group`}
              onClick={() => effectiveProfile.portraitUrl && setIsLightboxOpen(true)}
              title={effectiveProfile.portraitUrl ? 'Nhấp để xem ảnh lớn' : 'Ảnh thẻ 3×4'}
            >
              {effectiveProfile.portraitUrl ? (
                <>
                  <img
                    src={effectiveProfile.portraitUrl}
                    alt={`Ảnh thẻ 3×4 - ${effectiveProfile.fullName}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 size={13} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-1 text-center text-[#94A3B8]">
                  <Camera size={16} className="mb-0.5 text-[#94A3B8]" />
                  <span className="text-[9px] font-semibold text-[#64748B] leading-tight">Ảnh 3×4</span>
                </div>
              )}
            </div>
          </div>

          {/* 3 Inline Administrative Key-Value Columns */}
          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 text-[12.5px] leading-relaxed text-[#334155]">
            {/* Column 1 */}
            <div className="space-y-1.5 min-w-0">
              <div>
                <strong className="font-bold text-[#0F172A]">Tên:</strong>{' '}
                <span>{effectiveProfile.fullName}</span>
              </div>
              <div>
                <strong className="font-bold text-[#0F172A]">Tỉnh/TP:</strong>{' '}
                <span>{effectiveProfile.homeProvince || 'Đà Nẵng'}</span>
              </div>
              <div>
                <strong className="font-bold text-[#0F172A]">Ngày sinh:</strong>{' '}
                <span>{effectiveProfile.dateOfBirth || '—'}</span>
              </div>
              <div>
                <strong className="font-bold text-[#0F172A]">Dân tộc:</strong>{' '}
                <span>{effectiveProfile.ethnicity || '—'}</span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-1.5 min-w-0">
              <div>
                <strong className="font-bold text-[#0F172A]">Sinh viên năm thứ:</strong>{' '}
                <span>{effectiveProfile.academicYearNumber || 1}</span>
                <span className="text-[#64748B]"> ({effectiveProfile.educationLevel || 'Đại học'})</span>
              </div>
              <div className="break-words">
                <strong className="font-bold text-[#0F172A]">Lớp, khoa, trường:</strong>{' '}
                <span>{classSchoolComposite || '—'}</span>
              </div>
              <div>
                <strong className="font-bold text-[#0F172A]">MSSV:</strong>{' '}
                <span className="font-mono text-[#0066CC] font-semibold">{studentIdCode}</span>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-1.5 min-w-0">
              <div className="break-words">
                <strong className="font-bold text-[#0F172A]">Chức vụ Đoàn, Hội:</strong>{' '}
                <span>{effectiveProfile.unionPosition || '—'}</span>
              </div>
              <div>
                <strong className="font-bold text-[#0F172A]">Đảng viên/Đoàn viên:</strong>{' '}
                <span>{effectiveProfile.politicalStatus || '—'}</span>
              </div>
              <div>
                <strong className="font-bold text-[#0F172A]">Số điện thoại:</strong>{' '}
                <span className="tabular-nums">{effectiveProfile.phoneNumber || '—'}</span>
              </div>
              <div className="break-all">
                <strong className="font-bold text-[#0F172A]">Email:</strong>{' '}
                <span>{effectiveProfile.email || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4th Column: Mini Bordered Administrative Level / Recognition Table */}
        <div className="w-full lg:w-[258px] shrink-0 flex flex-col justify-between gap-2">
          <table className="w-full border-collapse border border-[#DFE5EC] text-[12px]">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#0F172A]">
                <th className="border border-[#DFE5EC] px-2.5 py-1.5 text-left font-bold">
                  Cấp xét chọn
                </th>
                <th className="border border-[#DFE5EC] px-2.5 py-1.5 text-left font-bold">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="text-[#334155]">
              <tr>
                <td className="border border-[#DFE5EC] px-2.5 py-1.5 font-semibold text-[#0F172A]">
                  Cấp Đơn vị
                </td>
                <td className="border border-[#DFE5EC] px-2.5 py-1.5 text-[#475569]">
                  {resolvedUnitStatus}
                </td>
              </tr>
              <tr>
                <td className="border border-[#DFE5EC] px-2.5 py-1.5 font-semibold text-[#0F172A]">
                  Cấp Thành phố
                </td>
                <td className="border border-[#DFE5EC] px-2.5 py-1.5 text-[#047857] font-medium">
                  {resolvedCityStatus}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex items-center justify-between gap-2 text-[11px] text-[#64748B]">
            <span>
              {completeness.completedFields}/13 trường · {effectiveSeason}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center gap-0.5 font-semibold text-[#007EE5] hover:underline cursor-pointer"
              aria-label={isExpanded ? 'Thu gọn thông tin ứng viên' : 'Xem đầy đủ thông tin ứng viên'}
            >
              <span>{isExpanded ? 'Thu gọn' : 'Chi tiết 13 trường'}</span>
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Full 13-Field View */}
      {isExpanded && (
        <div className="px-4 pb-4 sm:px-5 pt-3 border-t border-[#DFE5EC] bg-[#F8FAFC] space-y-3 text-[12px]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            <div>
              <span className="text-[10.5px] text-[#64748B] block">Họ và tên</span>
              <span className="font-semibold text-[#0F172A]">{effectiveProfile.fullName}</span>
            </div>
            <div>
              <span className="text-[10.5px] text-[#64748B] block">Giới tính</span>
              <span className="font-medium text-[#1E293B]">{effectiveProfile.gender || '—'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10.5px] text-[#64748B] block">Đơn vị xét duyệt sơ tuyển</span>
              <span className="font-medium text-[#0066CC]">
                {(() => {
                  const unitRes = effectiveProfile.institutionId
                    ? resolveSchoolReviewUnit(effectiveProfile.institutionId)
                    : null;
                  return unitRes?.unit ? unitRes.unit.officialName : effectiveProfile.institutionName;
                })()}
              </span>
            </div>
            <div>
              <span className="text-[10.5px] text-[#64748B] block">Trình độ đào tạo</span>
              <span className="font-medium text-[#1E293B]">{effectiveProfile.educationLevel || 'Đại học'}</span>
            </div>
            <div>
              <span className="text-[10.5px] text-[#64748B] block">Diện chính trị</span>
              <span className="font-medium text-[#1E293B] inline-flex items-center gap-1">
                <CheckCircle2 size={11.5} className="text-[#10A37F]" />
                <span>{effectiveProfile.politicalStatus || '—'}</span>
              </span>
            </div>
            <div className="col-span-2 flex items-end">
              {isSnapshot && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#047857]">
                  <Lock size={11} className="shrink-0" />
                  <span>
                    Dữ liệu chốt lúc nộp hồ sơ{submittedAt ? ` (${submittedAt})` : ''}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Portrait Lightbox Modal */}
      {isLightboxOpen && effectiveProfile.portraitUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="bg-white rounded-[6px] max-w-sm w-full overflow-hidden shadow-xl border border-[#DFE5EC]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#DFE5EC] flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-[#0F172A]">Ảnh thẻ chân dung 3×4</h3>
                <p className="text-[11px] text-[#64748B]">
                  {effectiveProfile.fullName} {studentIdCode !== '—' ? `· MSSV: ${studentIdCode}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-7 h-7 rounded-[4px] hover:bg-[#E2E8F0] text-[#475569] flex items-center justify-center cursor-pointer"
                title="Đóng"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-4 flex flex-col items-center justify-center bg-white">
              <div className="w-52 aspect-[3/4] rounded-[4px] overflow-hidden border border-[#DFE5EC] bg-[#F8FAFC]">
                <img
                  src={effectiveProfile.portraitUrl}
                  alt={`Ảnh thẻ 3×4 - ${effectiveProfile.fullName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] text-[#64748B] mt-2">
                Tỷ lệ chuẩn 3:4 · Hướng dẫn 14-HD/BTK-HSVTP
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export const StudentProfileDossierSection = SubmittedStudentInformationCard;
