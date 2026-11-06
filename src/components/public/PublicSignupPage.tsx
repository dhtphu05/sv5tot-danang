/**
 * 5TOT Đà Nẵng — Official Student Signup Page
 * Cơ quan chỉ đạo: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Prompt 14 Sections 27–49, 56–68, 93–95, 98C–E:
 * - Student-only public signup (~520px width, no role selector).
 * - Title: "Tạo tài khoản sinh viên"
 * - Supporting: "Đăng ký để bắt đầu hoặc tiếp tục chuẩn bị hồ sơ Sinh viên 5 tốt cấp Thành phố Đà Nẵng."
 * - Fields: Họ và tên, Email, Trường / đơn vị đào tạo (searchable InstitutionCombobox),
 *   Khoa / Ban đào tạo (dropdown for 08 UDN schools, direct text input for 23 standalone institutions),
 *   Mã số sinh viên, Mật khẩu ("Ít nhất 8 ký tự."), Xác nhận mật khẩu ("Mật khẩu xác nhận chưa khớp.").
 */

import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { HsvEmblem } from '../brand/HsvLogo';
import { Button } from '../buttons/Button';
import { InstitutionCombobox } from './InstitutionCombobox';
import { ParticipatingInstitution } from '../../demo/fixtures/institutionRegistry';
import { CanonicalFaculty, getFacultiesByInstitution } from '../../demo/fixtures/facultyRegistry';
import { StudentRegistrationPayload } from './publicTypes';
import { resolveDomainServices } from '../../entities/services/modeResolver';
import { setApiActorContext } from '../../shared/api/httpClient';

export interface PublicSignupPageProps {
  onSignupSuccess: (payload: StudentRegistrationPayload) => void;
  onNavigateToLogin: (prefillEmail?: string) => void;
  onNavigateToLanding: () => void;
  /** QA Preset Overrides for Primary Screenshots C, D, E */
  presetMode?:
    | 'normal'
    | 'combobox_open'
    | 'validation_errors'
    | 'institution_load_error';
}

export const PublicSignupPage: React.FC<PublicSignupPageProps> = ({
  onSignupSuccess,
  onNavigateToLogin,
  onNavigateToLanding,
  presetMode = 'normal',
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] =
    useState<ParticipatingInstitution | null>(null);
  const [availableFaculties, setAvailableFaculties] = useState<CanonicalFaculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<CanonicalFaculty | null>(null);
  const [customFacultyName, setCustomFacultyName] = useState<string>('');
  const [facultyError, setFacultyError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [confirmTouched, setConfirmTouched] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAccountCreatedTransition, setIsAccountCreatedTransition] =
    useState<boolean>(false);

  // Field-level errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isEmailConflict, setIsEmailConflict] = useState<boolean>(false);
  const [institutionError, setInstitutionError] = useState<string | null>(null);
  const [studentCodeError, setStudentCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  // Combobox QA state
  const [forceComboboxOpen, setForceComboboxOpen] = useState<boolean>(false);
  const [comboboxInitQuery, setComboboxInitQuery] = useState<string>('');
  const [forceInstLoadError, setForceInstLoadError] = useState<boolean>(false);

  // Apply QA presets for Primary Screenshots C, D, E
  useEffect(() => {
    setNameError(null);
    setEmailError(null);
    setIsEmailConflict(false);
    setInstitutionError(null);
    setStudentCodeError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setFacultyError(null);
    setForceComboboxOpen(false);
    setComboboxInitQuery('');
    setForceInstLoadError(false);

    if (presetMode === 'combobox_open') {
      // Primary Screenshot C: Signup with institution selector open 1440×900
      setFullName('Nguyễn Minh Anh');
      setEmail('minhanh.nguyen@dut.udn.vn');
      setStudentCode('102220123');
      setSelectedInstitution(null);
      setComboboxInitQuery('Đại học');
      setForceComboboxOpen(true);
    } else if (presetMode === 'validation_errors') {
      // Primary Screenshot D: Signup validation & conflict errors
      setFullName('Nguyễn Minh Anh');
      setEmail('minhanh.nguyen@dut.udn.vn');
      setIsEmailConflict(true);
      setEmailError('Email này đã được sử dụng.');
      setStudentCode('102220123');
      setStudentCodeError(
        'Mã số sinh viên này đã được sử dụng cho một tài khoản khác.'
      );
      setSelectedInstitution({
        id: 'inst-dut',
        officialName: 'Trường Đại học Bách khoa - Đại học Đà Nẵng',
        organizationContext: 'Đại học Đà Nẵng',
        searchKeywords: ['bach khoa'],
      });
      setPassword('matkhau123');
      setConfirmPassword('matkhau999');
      setConfirmTouched(true);
      setConfirmPasswordError('Mật khẩu xác nhận chưa khớp.');
    } else if (presetMode === 'institution_load_error') {
      // Primary Screenshot E: Institution load failure
      setFullName('Nguyễn Minh Anh');
      setEmail('minhanh.nguyen@dut.udn.vn');
      setStudentCode('102220123');
      setSelectedInstitution(null);
      setForceComboboxOpen(true);
      setForceInstLoadError(true);
    }
  }, [presetMode]);

  // Load and update faculties when selectedInstitution changes
  useEffect(() => {
    if (selectedInstitution?.id) {
      const staticFacs = getFacultiesByInstitution(selectedInstitution.id);
      setAvailableFaculties(staticFacs);
      fetch(`/api/v2/institutions/${encodeURIComponent(selectedInstitution.id)}/faculties`)
        .then((r) => r.json())
        .then((res) => {
          if (res?.success && Array.isArray(res.data?.faculties) && res.data.faculties.length > 0) {
            setAvailableFaculties(res.data.faculties);
          }
        })
        .catch(() => {});
    } else {
      setAvailableFaculties([]);
    }
    setSelectedFaculty(null);
    setCustomFacultyName('');
    setFacultyError(null);
  }, [selectedInstitution?.id]);

  const handleConfirmBlur = () => {
    if (confirmPassword.length > 0) {
      setConfirmTouched(true);
      if (password && confirmPassword !== password) {
        setConfirmPasswordError('Mật khẩu xác nhận chưa khớp.');
      } else {
        setConfirmPasswordError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isAccountCreatedTransition) return;

    let hasError = false;

    if (!fullName.trim()) {
      setNameError('Vui lòng nhập họ và tên.');
      hasError = true;
    } else {
      setNameError(null);
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Vui lòng nhập địa chỉ email.');
      setIsEmailConflict(false);
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError(
        'Vui lòng nhập địa chỉ email hợp lệ (ví dụ: name@example.com).'
      );
      setIsEmailConflict(false);
      hasError = true;
    } else {
      setEmailError(null);
      setIsEmailConflict(false);
    }

    if (!selectedInstitution) {
      setInstitutionError('Vui lòng chọn trường hoặc đơn vị đào tạo.');
      hasError = true;
    } else {
      setInstitutionError(null);
    }

    if (selectedInstitution) {
      if (availableFaculties.length > 0 && !selectedFaculty) {
        setFacultyError('Vui lòng chọn Khoa hoặc đơn vị đào tạo.');
        hasError = true;
      } else if (availableFaculties.length === 0 && !customFacultyName.trim()) {
        setFacultyError('Vui lòng nhập tên Khoa / Viện / Ngành đào tạo.');
        hasError = true;
      } else {
        setFacultyError(null);
      }
    } else {
      setFacultyError(null);
    }

    const trimmedCode = studentCode.trim();
    if (!trimmedCode) {
      setStudentCodeError('Vui lòng nhập mã số sinh viên.');
      hasError = true;
    } else {
      setStudentCodeError(null);
    }

    if (!password || password.length < 8) {
      setPasswordError('Mật khẩu cần có ít nhất 8 ký tự.');
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (!confirmPassword || confirmPassword !== password) {
      setConfirmTouched(true);
      setConfirmPasswordError('Mật khẩu xác nhận chưa khớp.');
      hasError = true;
    } else {
      setConfirmPasswordError(null);
    }

    if (hasError) return;

    const resolvedFacultyDeptId =
      availableFaculties.length > 0 ? selectedFaculty?.id : undefined;
    const resolvedFacultyName =
      availableFaculties.length > 0
        ? selectedFaculty?.name
        : customFacultyName.trim() || undefined;

    setIsSubmitting(true);
    try {
      const services = resolveDomainServices();
      if (services.auth.registerStudent) {
        const session = await services.auth.registerStudent({
          fullName: fullName.trim(),
          email: trimmedEmail,
          studentCode: trimmedCode,
          institutionId: selectedInstitution!.id,
          institutionName: selectedInstitution!.officialName,
          facultyDepartmentId: resolvedFacultyDeptId,
          facultyName: resolvedFacultyName,
          password,
        });
        if (session?.user) {
          setApiActorContext({
            userId: session.user.id,
            userName: session.user.fullName,
            userEmail: session.user.email,
            role: session.user.role,
            unitId: session.user.unitId,
            token: session.token,
          });
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      const errCode = err?.code || err?.errorCode;
      if (errCode === 'EMAIL_CONFLICT') {
        setIsEmailConflict(true);
        setEmailError('Email này đã được sử dụng.');
        return;
      }
      if (errCode === 'STUDENT_CODE_CONFLICT') {
        setStudentCodeError(
          'Mã số sinh viên này đã được sử dụng cho một tài khoản khác.'
        );
        return;
      }
      setEmailError(err?.message || 'Chưa thể tạo tài khoản lúc này. Vui lòng thử lại.');
      return;
    }

    // Brief Account-Created Transition (Prompt 14 Sections 46 & 48)
    setIsSubmitting(false);
    setIsAccountCreatedTransition(true);

    setTimeout(() => {
      onSignupSuccess({
        fullName: fullName.trim(),
        email: trimmedEmail,
        studentId: trimmedCode,
        institutionId: selectedInstitution!.id,
        institutionName: selectedInstitution!.officialName,
        facultyDepartmentId: resolvedFacultyDeptId,
        facultyName: resolvedFacultyName,
      });
    }, 650);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#1E293B] flex flex-col lg:flex-row font-sans">
      {/* Left Column: Ocean-Blue Institutional Identity & Registration Guide */}
      <aside className="lg:w-[40%] xl:w-[38%] bg-[#007EE5] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
        <div>
          <button
            type="button"
            onClick={onNavigateToLanding}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-white/12 hover:bg-white/20 border border-white/20 text-[12.5px] font-semibold text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Trang thông tin chung</span>
          </button>

          <div className="mt-7 lg:mt-10 flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-full bg-white p-1.5 flex items-center justify-center shrink-0">
              <HsvEmblem size={40} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/85">
                THÀNH ĐOÀN ĐÀ NẴNG
              </div>
              <div className="text-[13px] font-extrabold uppercase tracking-[0.03em] text-white mt-0.5">
                HỘI SINH VIÊN VIỆT NAM TP. ĐÀ NẴNG
              </div>
            </div>
          </div>

          <h2 className="mt-6 text-[22px] sm:text-[24px] font-extrabold leading-snug tracking-tight text-white">
            Đăng ký tài khoản Sinh viên dự xét cấp Thành phố Đà Nẵng
          </h2>
          <p className="mt-2.5 text-[13px] text-white/88 leading-relaxed">
            Mỗi sinh viên sử dụng 01 tài khoản duy nhất gắn với mã số sinh viên và đơn vị đào tạo để lập hồ sơ trực tuyến.
          </p>

          <div className="mt-6 hidden sm:flex flex-col gap-2.5">
            <div className="px-3.5 py-2.5 rounded-[5px] bg-white/10 border border-white/18 text-[12px]">
              <div className="font-bold text-white">Bước 1 · Chọn đúng cơ sở đào tạo</div>
              <div className="text-white/80 mt-0.5">
                Hệ thống tự động định tuyến hồ sơ về đúng một trong 24 đơn vị xét sơ tuyển trên địa bàn Thành phố.
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-[5px] bg-white/10 border border-white/18 text-[12px]">
              <div className="font-bold text-white">Bước 2 · Kê khai bảng 05 tiêu chí</div>
              <div className="text-white/80 mt-0.5">
                Nhập kết quả định lượng và đính kèm tệp minh chứng PDF/hình ảnh cho từng tiêu chuẩn.
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-[5px] bg-white/10 border border-white/18 text-[12px]">
              <div className="font-bold text-white">Bước 3 · Theo dõi xét duyệt 2 cấp</div>
              <div className="text-white/80 mt-0.5">
                Nhận thông báo bổ sung minh chứng và kết quả công nhận chính thức ngay trên cổng.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-white/18 text-[11.5px] text-white/80">
          5TOT Đà Nẵng · Hội Sinh viên Việt Nam Thành phố Đà Nẵng
        </div>
      </aside>

      {/* Right Column: Flat Administrative Registration Form */}
      <main className="flex-1 bg-white flex flex-col justify-between p-6 sm:p-9 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-[540px] mx-auto my-auto py-2">
          {isAccountCreatedTransition ? (
            <div
              role="status"
              aria-live="polite"
              className="bg-[#F8FAFC] rounded-[6px] border border-[#A7F3D0] p-8 text-center flex flex-col items-center gap-3"
            >
              <div className="w-11 h-11 rounded-full bg-[#ECFDF5] text-[#10A37F] flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <h1 className="text-[19px] font-extrabold text-[#0F172A]">
                Tài khoản đã được tạo.
              </h1>
              <p className="text-[13.5px] text-[#475569]">
                Đang chuyển đến Trang chủ sinh viên...
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-5 pb-3.5 border-b border-[#DFE5EC]">
                <div className="inline-flex items-center px-2 py-0.5 rounded-[3px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#0F766E] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  Đăng ký sinh viên
                </div>
                <h1 className="text-[22px] font-extrabold text-[#0F172A] tracking-tight">
                  Tạo tài khoản sinh viên
                </h1>
                <p className="text-[13px] text-[#475569] mt-1 leading-relaxed">
                  Đăng ký để bắt đầu hoặc tiếp tục chuẩn bị hồ sơ Sinh viên 5 tốt cấp Thành phố Đà Nẵng.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* 1. Họ và tên */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="signup-fullname"
                      className="text-[12.5px] font-bold text-[#0F172A]"
                    >
                      Họ và tên
                    </label>
                    <input
                      id="signup-fullname"
                      name="name"
                      type="text"
                      autoComplete="name"
                      disabled={isSubmitting}
                      value={fullName}
                      placeholder="Ví dụ: Nguyễn Minh Anh"
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (nameError) setNameError(null);
                      }}
                      aria-invalid={!!nameError}
                      aria-describedby={
                        nameError ? 'signup-fullname-error' : undefined
                      }
                      className={`w-full h-[42px] px-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] bg-white border rounded-[5px] outline-none transition-colors ${
                        nameError
                          ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
                          : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#007EE5] focus:ring-2 focus:ring-[#007EE5]/15'
                      }`}
                    />
                    {nameError && (
                      <p
                        id="signup-fullname-error"
                        role="alert"
                        className="text-[12px] font-medium text-[#DC2626] flex items-center gap-1 mt-0.5"
                      >
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{nameError}</span>
                      </p>
                    )}
                  </div>

                  {/* 4. Mã số sinh viên */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="signup-student-code"
                      className="text-[12.5px] font-bold text-[#0F172A]"
                    >
                      Mã số sinh viên
                    </label>
                    <input
                      id="signup-student-code"
                      name="studentCode"
                      type="text"
                      disabled={isSubmitting}
                      value={studentCode}
                      placeholder="Ví dụ: 102220123"
                      onChange={(e) => {
                        setStudentCode(e.target.value);
                        if (studentCodeError) setStudentCodeError(null);
                      }}
                      aria-invalid={!!studentCodeError}
                      aria-describedby={
                        studentCodeError ? 'signup-student-code-error' : undefined
                      }
                      className={`w-full h-[42px] px-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] bg-white border rounded-[5px] outline-none transition-colors tabular-nums ${
                        studentCodeError
                          ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
                          : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#007EE5] focus:ring-2 focus:ring-[#007EE5]/15'
                      }`}
                    />
                    {studentCodeError && (
                      <p
                        id="signup-student-code-error"
                        role="alert"
                        className="text-[12px] font-medium text-[#DC2626] flex items-center gap-1 mt-0.5"
                      >
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{studentCodeError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Email */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="signup-email"
                    className="text-[12.5px] font-bold text-[#0F172A]"
                  >
                    Email
                  </label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    value={email}
                    placeholder="name@example.com"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) {
                        setEmailError(null);
                        setIsEmailConflict(false);
                      }
                    }}
                    aria-invalid={!!emailError}
                    aria-describedby={
                      emailError ? 'signup-email-error' : undefined
                    }
                    className={`w-full h-[42px] px-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] bg-white border rounded-[5px] outline-none transition-colors ${
                      emailError
                        ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
                        : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#007EE5] focus:ring-2 focus:ring-[#007EE5]/15'
                    }`}
                  />
                  {emailError && (
                    <div
                      id="signup-email-error"
                      role="alert"
                      className="text-[12px] font-medium text-[#DC2626] flex items-center justify-between gap-2 flex-wrap mt-0.5"
                    >
                      <span className="flex items-center gap-1.5">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{emailError}</span>
                      </span>
                      {isEmailConflict && (
                        <button
                          type="button"
                          onClick={() => onNavigateToLogin(email.trim())}
                          className="font-bold text-[#007EE5] hover:underline cursor-pointer"
                        >
                          Đăng nhập →
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Trường / đơn vị đào tạo — Searchable Combobox */}
                <InstitutionCombobox
                  selectedInstitution={selectedInstitution}
                  onSelect={(inst) => {
                    setSelectedInstitution(inst);
                    if (institutionError) setInstitutionError(null);
                  }}
                  error={institutionError || undefined}
                  disabled={isSubmitting}
                  forceOpen={forceComboboxOpen}
                  initialSearchQuery={comboboxInitQuery}
                  forceLoadError={forceInstLoadError}
                  onRetryLoadError={() => setForceInstLoadError(false)}
                />

                {/* 3b. Khoa / Đơn vị đào tạo */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="signup-faculty"
                      className="text-[12.5px] font-bold text-[#0F172A]"
                    >
                      Khoa / Viện / Ngành đào tạo <span className="text-[#DC2626]">*</span>
                    </label>
                    {selectedInstitution && availableFaculties.length > 0 && (
                      <span className="text-[11px] font-medium text-[#64748B]">
                        {availableFaculties.length} khoa
                      </span>
                    )}
                  </div>
                  {selectedInstitution && availableFaculties.length === 0 ? (
                    <input
                      id="signup-faculty"
                      name="facultyName"
                      type="text"
                      disabled={isSubmitting}
                      value={customFacultyName}
                      placeholder="Ví dụ: Khoa Công nghệ Thông tin / Ngành Quản trị Kinh doanh"
                      onChange={(e) => {
                        setCustomFacultyName(e.target.value);
                        if (facultyError) setFacultyError(null);
                      }}
                      aria-invalid={!!facultyError}
                      aria-describedby={facultyError ? 'signup-faculty-error' : undefined}
                      className={`w-full h-[42px] px-3 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] bg-white border rounded-[5px] outline-none transition-colors ${
                        facultyError
                          ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
                          : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#007EE5] focus:ring-2 focus:ring-[#007EE5]/15'
                      }`}
                    />
                  ) : (
                    <select
                      id="signup-faculty"
                      name="faculty"
                      disabled={isSubmitting || !selectedInstitution}
                      value={selectedFaculty?.id || ''}
                      onChange={(e) => {
                        const fac = availableFaculties.find((f) => f.id === e.target.value) || null;
                        setSelectedFaculty(fac);
                        if (facultyError) setFacultyError(null);
                      }}
                      aria-invalid={!!facultyError}
                      aria-describedby={facultyError ? 'signup-faculty-error' : undefined}
                      className={`w-full h-[42px] px-3 text-[13.5px] text-[#0F172A] bg-white border rounded-[5px] outline-none transition-colors cursor-pointer ${
                        !selectedInstitution ? 'bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed' : ''
                      } ${
                        facultyError
                          ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
                          : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#007EE5] focus:ring-2 focus:ring-[#007EE5]/15'
                      }`}
                    >
                      <option value="">
                        {!selectedInstitution
                          ? '-- Vui lòng chọn trường trước --'
                          : '-- Chọn Khoa đào tạo --'}
                      </option>
                      {availableFaculties.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {facultyError && (
                    <p
                      id="signup-faculty-error"
                      role="alert"
                      className="text-[12px] font-medium text-[#DC2626] flex items-center gap-1.5 mt-0.5"
                    >
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{facultyError}</span>
                    </p>
                  )}
                </div>

                {/* 5. Mật khẩu & 6. Xác nhận mật khẩu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="signup-password"
                        className="text-[12.5px] font-bold text-[#0F172A]"
                      >
                        Mật khẩu
                      </label>
                      <span className="text-[11px] text-[#64748B]">
                        Ít nhất 8 ký tự.
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        value={password}
                        placeholder="Tối thiểu 8 ký tự"
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                          if (
                            confirmTouched &&
                            confirmPassword &&
                            e.target.value === confirmPassword
                          ) {
                            setConfirmPasswordError(null);
                          }
                        }}
                        aria-invalid={!!passwordError}
                        aria-describedby={
                          passwordError ? 'signup-password-error' : undefined
                        }
                        className={`w-full h-[42px] pl-3 pr-10 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] bg-white border rounded-[5px] outline-none transition-colors ${
                          passwordError
                            ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
                            : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#007EE5] focus:ring-2 focus:ring-[#007EE5]/15'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                        }
                        className="absolute right-2.5 p-1 text-[#64748B] hover:text-[#0F172A] rounded cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {passwordError && (
                      <p
                        id="signup-password-error"
                        role="alert"
                        className="text-[12px] font-medium text-[#DC2626] flex items-center gap-1 mt-0.5"
                      >
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{passwordError}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="signup-confirm-password"
                      className="text-[12.5px] font-bold text-[#0F172A]"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="signup-confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        value={confirmPassword}
                        placeholder="Nhập lại mật khẩu"
                        onBlur={handleConfirmBlur}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (
                            confirmPasswordError &&
                            e.target.value === password
                          ) {
                            setConfirmPasswordError(null);
                          }
                        }}
                        aria-invalid={!!confirmPasswordError}
                        aria-describedby={
                          confirmPasswordError
                            ? 'signup-confirm-password-error'
                            : undefined
                        }
                        className={`w-full h-[42px] pl-3 pr-10 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] bg-white border rounded-[5px] outline-none transition-colors ${
                          confirmPasswordError
                            ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
                            : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#007EE5] focus:ring-2 focus:ring-[#007EE5]/15'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={
                          showConfirmPassword
                            ? 'Ẩn mật khẩu xác nhận'
                            : 'Hiện mật khẩu xác nhận'
                        }
                        className="absolute right-2.5 p-1 text-[#64748B] hover:text-[#0F172A] rounded cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    </div>
                    {confirmPasswordError && (
                      <p
                        id="signup-confirm-password-error"
                        role="alert"
                        className="text-[12px] font-medium text-[#DC2626] flex items-center gap-1 mt-0.5"
                      >
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{confirmPasswordError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="pt-1.5">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full font-bold justify-center h-[44px]"
                  >
                    {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                  </Button>
                </div>
              </form>

              {/* Secondary Link to Login */}
              <div className="mt-5 pt-4 border-t border-[#DFE5EC] flex items-center justify-between gap-2 flex-wrap text-[13px] text-[#475569]">
                <span>Đã có tài khoản sinh viên?</span>
                <button
                  type="button"
                  onClick={() => onNavigateToLogin()}
                  className="font-bold text-[#007EE5] hover:underline cursor-pointer"
                >
                  Đăng nhập →
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="text-center text-[11.5px] text-[#64748B] pt-4 border-t border-[#F1F5F9]">
          Hệ thống quản lý và xét chọn Sinh viên 5 tốt cấp Thành phố Đà Nẵng · Hội Sinh viên Việt Nam TP. Đà Nẵng
        </footer>
      </main>
    </div>
  );
};
