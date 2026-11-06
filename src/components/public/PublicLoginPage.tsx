/**
 * 5TOT Đà Nẵng — Official Student Login Page
 * Cơ quan chỉ đạo: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements Prompt 14 Sections 18–26, 55, 57–64, 71–72, 92, 98B:
 * - Fits cleanly at 1366×768 without scrolling (~436px width).
 * - Clear institutional identity at top.
 * - Persistent labels, 46px input height, show/hide password toggle, Enter submits.
 * - Friendly error copy ("Email hoặc mật khẩu chưa chính xác." / "Chưa thể đăng nhập lúc này. Vui lòng thử lại.")
 *   that retains entered email without wiping the form.
 * - Supports Session Expired notice (Section 72) and Safe Internal Return URL preservation (Section 71).
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Info, Clock } from 'lucide-react';
import { HsvEmblem } from '../brand/HsvLogo';
import { Button } from '../buttons/Button';
import { SafeInternalReturnTarget } from './publicTypes';
import { resolveDomainServices } from '../../entities/services/modeResolver';
import { setApiActorContext } from '../../shared/api/httpClient';
import type { AuthSessionPayload } from '../../entities/services/contracts';

export type LoginSimulatedOutcome =
  | 'success'
  | 'invalid_credentials'
  | 'general_error';

export interface PublicLoginPageProps {
  onLoginSuccess: (email: string, session?: AuthSessionPayload) => void;
  onQuickOfficerLogin?: () => void;
  onNavigateToSignup: () => void;
  onNavigateToLanding: () => void;
  onNavigateToCollectiveLogin?: () => void;
  onNavigateToForgotPassword?: (prefillEmail?: string) => void;
  sessionExpired?: boolean;
  returnTarget?: SafeInternalReturnTarget | null;
  initialEmail?: string;
  presetError?: 'invalid_credentials' | 'general_error' | null;
}

export const PublicLoginPage: React.FC<PublicLoginPageProps> = ({
  onLoginSuccess,
  onNavigateToSignup,
  onNavigateToLanding,
  onNavigateToCollectiveLogin,
  onNavigateToForgotPassword,
  sessionExpired = false,
  returnTarget = null,
  initialEmail = '',
  presetError = null,
}) => {
  const [email, setEmail] = useState<string>(initialEmail);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [emailFieldError, setEmailFieldError] = useState<string | null>(null);
  const [passwordFieldError, setPasswordFieldError] = useState<string | null>(
    null
  );
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync QA preset props
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    if (presetError === 'invalid_credentials') {
      setServerError('Email hoặc mật khẩu chưa chính xác.');
      if (!email) setEmail('minhanh.nguyen@dut.udn.vn');
    } else if (presetError === 'general_error') {
      setServerError('Chưa thể đăng nhập lúc này. Vui lòng thử lại.');
      if (!email) setEmail('minhanh.nguyen@dut.udn.vn');
    } else {
      setServerError(null);
    }
  }, [presetError]);

  const validateEmailFormat = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Vui lòng nhập địa chỉ email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Vui lòng nhập địa chỉ email hợp lệ (ví dụ: name@example.com).';
    }
    return null;
  };

  const handleEmailBlur = () => {
    if (email.trim().length > 0) {
      setEmailFieldError(validateEmailFormat(email));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setServerError(null);
    const eErr = validateEmailFormat(email);
    const pErr = !password ? 'Vui lòng nhập mật khẩu.' : null;

    setEmailFieldError(eErr);
    setPasswordFieldError(pErr);

    if (eErr || pErr) return;

    setIsSubmitting(true);
    try {
      const services = resolveDomainServices();
      const session = await services.auth.loginWithCredentials({
        email: email.trim(),
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
      setIsSubmitting(false);
      onLoginSuccess(email.trim(), session);
    } catch (err: any) {
      setIsSubmitting(false);
      const errCode = err?.code || err?.errorCode;
      if (errCode === 'INVALID_CREDENTIALS' || err?.status === 401) {
        setServerError('Email hoặc mật khẩu chưa chính xác.');
      } else {
        setServerError(err?.message || 'Chưa thể đăng nhập lúc này. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#1E293B] flex flex-col lg:flex-row font-sans">
      {/* Left Column: Ocean-Blue Institutional Identity Panel */}
      <aside className="lg:w-[42%] xl:w-[40%] bg-[#007EE5] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
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

          <h2 className="mt-6 text-[22px] sm:text-[25px] font-extrabold leading-snug tracking-tight text-white">
            Hệ thống Quản lý &amp; Xét chọn Danh hiệu Sinh viên Cấp Thành phố
          </h2>
          <p className="mt-2.5 text-[13px] text-white/88 leading-relaxed max-w-[460px]">
            Cổng tiếp nhận hồ sơ trực tuyến, rà soát minh chứng và thẩm định hai cấp
            áp dụng cho 31 cơ sở đào tạo đại học, học viện, cao đẳng trên địa bàn TP. Đà Nẵng.
          </p>

          <div className="mt-6 hidden sm:grid grid-cols-1 gap-2.5 max-w-[460px]">
            <div className="px-3.5 py-2.5 rounded-[5px] bg-white/10 border border-white/18">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12.5px] font-bold text-white">
                  01. Danh hiệu &ldquo;Sinh viên 5 tốt&rdquo; cấp Thành phố
                </span>
                <span className="px-1.5 py-0.5 rounded-[3px] bg-[#10A37F] text-[10.5px] font-bold text-white shrink-0">
                  14-HD/BTK
                </span>
              </div>
              <div className="text-[11.5px] text-white/80 mt-0.5">
                Kê khai bảng 05 tiêu chí chuẩn và đính kèm minh chứng trực tuyến.
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-[5px] bg-white/10 border border-white/18">
              <div className="text-[12.5px] font-bold text-white">
                02. Danh hiệu &ldquo;Tập thể Sinh viên 5 tốt&rdquo; (TT01–TT04)
              </div>
              <div className="text-[11.5px] text-white/80 mt-0.5">
                Dành cho Liên chi hội, Chi hội trực thuộc các trường đại học, cao đẳng.
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-[5px] bg-white/10 border border-white/18">
              <div className="text-[12.5px] font-bold text-white">
                03. Giải thưởng 9/1 cấp Thành phố Đà Nẵng
              </div>
              <div className="text-[11.5px] text-white/80 mt-0.5">
                Tôn vinh cán bộ Hội, sinh viên tiêu biểu truyền lửa và ươm mầm phong trào.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-white/18 text-[11.5px] text-white/80 flex items-center justify-between gap-2 flex-wrap">
          <span>5TOT Đà Nẵng · Cổng hồ sơ trực tuyến</span>
          {onNavigateToCollectiveLogin && (
            <button
              type="button"
              onClick={onNavigateToCollectiveLogin}
              className="font-bold text-white underline underline-offset-2 hover:text-white/90 cursor-pointer"
            >
              Cổng Tập thể →
            </button>
          )}
        </div>
      </aside>

      {/* Right Column: Flat Administrative Login Workspace */}
      <main className="flex-1 bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-12">
        <div className="hidden lg:flex items-center justify-end text-[11.5px] font-semibold text-[#64748B]">
          <span>Phiên làm việc bảo mật · Năm học 2025–2026</span>
        </div>

        <div className="w-full max-w-[430px] mx-auto my-auto py-4">
          <div className="mb-6 pb-4 border-b border-[#DFE5EC]">
            <div className="inline-flex items-center px-2 py-0.5 rounded-[3px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#0F766E] text-[11px] font-bold uppercase tracking-wider mb-2">
              Xác thực tài khoản
            </div>
            <h1 className="text-[22px] font-extrabold text-[#0F172A] tracking-tight">
              Đăng nhập hệ thống
            </h1>
            <p className="text-[13px] text-[#475569] mt-1">
              Dành cho Sinh viên, Tập thể và Cán bộ thẩm định các cấp.
            </p>
          </div>

          {/* Session Expired Notice */}
          {sessionExpired && (
            <div
              role="status"
              className="mb-4 p-3 rounded-[5px] bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[12.5px] flex items-start gap-2.5"
            >
              <Clock size={15} className="text-[#D97706] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Phiên đăng nhập đã hết hạn.</p>
                <p className="text-[12px] mt-0.5">
                  Vui lòng đăng nhập lại.
                </p>
              </div>
            </div>
          )}

          {/* Safe Internal Return Target Notice */}
          {returnTarget && (
            <div
              role="status"
              className="mb-4 p-3 rounded-[5px] bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] text-[12.5px] flex items-start gap-2"
            >
              <Info size={14} className="shrink-0 mt-0.5" />
              <span>
                Sau khi đăng nhập, hệ thống sẽ mở trực tiếp:{' '}
                <strong className="font-bold">{returnTarget.label}</strong>
              </span>
            </div>
          )}

          {/* Server / Form-level Error Banner */}
          {serverError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-[5px] bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[12.5px] font-medium flex items-start gap-2.5"
            >
              <AlertCircle size={15} className="text-[#DC2626] shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-email"
                className="text-[12.5px] font-bold text-[#0F172A]"
              >
                Địa chỉ Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                disabled={isSubmitting}
                value={email}
                placeholder="name@example.com"
                onBlur={handleEmailBlur}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailFieldError) setEmailFieldError(null);
                  if (serverError) setServerError(null);
                }}
                aria-invalid={!!emailFieldError}
                aria-describedby={
                  emailFieldError ? 'login-email-error' : undefined
                }
                className={`w-full h-[44px] px-3.5 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] bg-white border rounded-[5px] outline-none transition-colors ${
                  emailFieldError
                    ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
                    : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#007EE5] focus:ring-2 focus:ring-[#007EE5]/15'
                }`}
              />
              {emailFieldError && (
                <p
                  id="login-email-error"
                  role="alert"
                  className="text-[12px] font-medium text-[#DC2626] flex items-center gap-1.5 mt-0.5"
                >
                  <AlertCircle size={13.5} className="shrink-0" />
                  <span>{emailFieldError}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-[12.5px] font-bold text-[#0F172A]"
                >
                  Mật khẩu
                </label>
                {onNavigateToForgotPassword && (
                  <button
                    type="button"
                    onClick={() => onNavigateToForgotPassword(email.trim())}
                    className="text-[12px] font-semibold text-[#007EE5] hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  value={password}
                  placeholder="Nhập mật khẩu của bạn"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordFieldError) setPasswordFieldError(null);
                    if (serverError) setServerError(null);
                  }}
                  aria-invalid={!!passwordFieldError}
                  aria-describedby={
                    passwordFieldError ? 'login-password-error' : undefined
                  }
                  className={`w-full h-[44px] pl-3.5 pr-11 text-[13.5px] text-[#0F172A] placeholder:text-[#94A3B8] bg-white border rounded-[5px] outline-none transition-colors ${
                    passwordFieldError
                      ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15'
                      : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#007EE5] focus:ring-2 focus:ring-[#007EE5]/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-2.5 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-[4px] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordFieldError && (
                <p
                  id="login-password-error"
                  role="alert"
                  className="text-[12px] font-medium text-[#DC2626] flex items-center gap-1.5 mt-0.5"
                >
                  <AlertCircle size={13.5} className="shrink-0" />
                  <span>{passwordFieldError}</span>
                </p>
              )}
            </div>

            {/* Primary Login Button */}
            <div className="pt-1.5">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full font-bold justify-center h-[44px]"
              >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </div>
          </form>

          {/* Secondary Link to Signup */}
          <div className="mt-6 pt-4 border-t border-[#DFE5EC] flex items-center justify-between gap-2 flex-wrap text-[13px] text-[#475569]">
            <span>Chưa có tài khoản sinh viên?</span>
            <button
              type="button"
              onClick={onNavigateToSignup}
              className="font-bold text-[#10A37F] hover:text-[#0D8A6B] hover:underline cursor-pointer"
            >
              Đăng ký tài khoản mới →
            </button>
          </div>
        </div>

        <footer className="text-center text-[11.5px] text-[#64748B] pt-4 border-t border-[#F1F5F9]">
          Hệ thống quản lý và xét chọn Sinh viên 5 tốt cấp Thành phố Đà Nẵng · Hội Sinh viên Việt Nam TP. Đà Nẵng
        </footer>
      </main>
    </div>
  );
};
