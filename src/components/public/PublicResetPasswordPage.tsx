/**
 * 5TOT ĐHĐN — Public Reset Password Page
 * Cơ quan quản lý: Đoàn Thanh niên - Hội Sinh viên Đại học Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Đại học Đà Nẵng
 *
 * Implements high-standard Reset Password UI/UX conforming 100% to common design system:
 * - Identical institutional lockup header (UdnEmblem + HsvEmblem size 40, exact 3-line title)
 * - Exact max-w-[436px] container & shadow-elevated card
 * - In-card h1 (22px font-extrabold text-[#172A3A]) and subtext
 * - Real-time password strength meter
 * - Instant match validation for confirm password
 * - Graceful handling of expired or invalid tokens with single-click resend CTA
 * - Auto-redirect countdown on success
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Clock,
} from 'lucide-react';
import { UdnEmblem, HsvEmblem } from '../brand/HsvLogo';
import { Button } from '../buttons/Button';
import { apiRequest } from '../../shared/api/httpClient';

export interface PublicResetPasswordPageProps {
  onNavigateToLogin: (prefillEmail?: string) => void;
  onNavigateToForgotPassword: () => void;
  onNavigateToLanding: () => void;
  initialToken?: string;
  initialEmail?: string;
}

interface PasswordStrength {
  score: number; // 0: None, 1: Weak, 2: Medium, 3: Strong
  label: string;
  colorClass: string;
}

function evaluatePasswordStrength(pwd: string): PasswordStrength {
  if (!pwd) return { score: 0, label: '', colorClass: '' };
  if (pwd.length < 8) {
    return { score: 1, label: 'Mật khẩu yếu (cần tối thiểu 8 ký tự)', colorClass: 'bg-[#EF4444]' };
  }
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

  if (hasLetter && hasNumber && hasSpecial) {
    return { score: 3, label: 'Mật khẩu rất mạnh', colorClass: 'bg-[#10B981]' };
  }
  if ((hasLetter && hasNumber) || (hasLetter && hasSpecial)) {
    return { score: 3, label: 'Mật khẩu mạnh', colorClass: 'bg-[#10B981]' };
  }
  return { score: 2, label: 'Mật khẩu trung bình (nên kết hợp thêm số hoặc ký tự)', colorClass: 'bg-[#F59E0B]' };
}

export const PublicResetPasswordPage: React.FC<PublicResetPasswordPageProps> = ({
  onNavigateToLogin,
  onNavigateToForgotPassword,
  onNavigateToLanding,
  initialToken = '',
  initialEmail = '',
}) => {
  const [token, setToken] = useState<string>(initialToken);
  const [email, setEmail] = useState<string>(initialEmail);

  // Read URL query params on mount if not provided via props
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      const urlEmail = params.get('email');
      if (urlToken && !token) setToken(urlToken.trim());
      if (urlEmail && !email) setEmail(urlEmail.trim());
    }
  }, [token, email]);

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTokenExpiredOrInvalid, setIsTokenExpiredOrInvalid] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);

  // Auto redirect timer on success
  useEffect(() => {
    if (!isSuccess) return;
    if (redirectCountdown <= 0) {
      onNavigateToLogin(email);
      return;
    }
    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isSuccess, redirectCountdown, email, onNavigateToLogin]);

  const strength = evaluatePasswordStrength(newPassword);
  const isMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    setIsTokenExpiredOrInvalid(false);

    const cleanToken = token.trim();
    if (!cleanToken) {
      setErrorMessage('Mã liên kết khôi phục không hợp lệ hoặc để trống. Vui lòng sử dụng liên kết trong email.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest<{ success: boolean; message: string }>(
        '/api/v2/auth/reset-password',
        {
          method: 'POST',
          body: {
            token: cleanToken,
            newPassword,
          },
        }
      );

      setIsSuccess(true);
      setRedirectCountdown(3);
    } catch (err: any) {
      const msg = err?.message || '';
      const code = err?.code || '';

      if (
        code === 'EXPIRED_RESET_TOKEN' ||
        code === 'INVALID_RESET_TOKEN' ||
        msg.toLowerCase().includes('hết hạn') ||
        msg.toLowerCase().includes('không hợp lệ') ||
        msg.toLowerCase().includes('qua sử dụng')
      ) {
        setIsTokenExpiredOrInvalid(true);
        setErrorMessage(
          'Liên kết khôi phục đã hết hạn hoặc đã qua sử dụng. Vui lòng gửi lại yêu cầu mới.'
        );
      } else {
        setErrorMessage(msg || 'Không thể đặt lại mật khẩu lúc này. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F8FC] text-[#172A3A] flex flex-col justify-between px-4 py-5 sm:py-7">
      {/* Top Bar: Back to Landing + Institutional Ownership */}
      <div className="max-w-[1120px] w-full mx-auto flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onNavigateToLanding}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#466474] hover:text-[#126A9C] transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Cổng xét chọn Danh hiệu và Giải thưởng Sinh viên ĐHĐN</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#607483]">
          <span>HỘI SINH VIÊN VIỆT NAM · ĐẠI HỌC ĐÀ NẴNG</span>
        </div>
      </div>

      {/* Main Centered Login Container (exact 436px width — common UI contract) */}
      <main className="w-full max-w-[436px] mx-auto my-auto py-3">
        {/* Institutional Lockup Header (exact identical style as Login & Signup) */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="flex items-center gap-2.5">
            <UdnEmblem size={40} />
            <HsvEmblem size={40} />
          </div>
          <div className="mt-2 text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#466474]">
            HỘI SINH VIÊN VIỆT NAM
          </div>
          <div className="text-[11.5px] font-extrabold uppercase tracking-[0.05em] text-[#126A9C]">
            ĐẠI HỌC ĐÀ NẴNG
          </div>
          <div className="text-[14px] font-extrabold text-[#172A3A] mt-1">
            Cổng xét chọn Danh hiệu & Giải thưởng Sinh viên · ĐHĐN
          </div>
        </div>

        {/* Card (shadow-elevated rounded-[16px]) */}
        <div className="bg-white rounded-[16px] border border-[#DCE7EE] shadow-elevated p-6 sm:p-7">
          {isSuccess ? (
            /* STATE 3: SUCCESS STATE */
            <div className="text-center py-2 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={30} />
              </div>

              <div>
                <h1 className="text-[20px] font-extrabold text-[#065F46] tracking-tight">
                  Đổi mật khẩu thành công!
                </h1>
                <p className="text-[13px] text-[#475569] mt-2 leading-relaxed">
                  Mật khẩu tài khoản của bạn đã được cập nhật an toàn. Toàn bộ phiên đăng nhập cũ trên các thiết bị khác đã được thu hồi.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold justify-center h-[46px]"
                  onClick={() => onNavigateToLogin(email)}
                >
                  Đăng nhập ngay
                </Button>
                <p className="text-[12px] text-[#64748B]">
                  Tự động chuyển về trang Đăng nhập sau <strong>{redirectCountdown}s</strong>...
                </p>
              </div>
            </div>
          ) : isTokenExpiredOrInvalid ? (
            /* STATE 2: EXPIRED / INVALID TOKEN FRIENDLY RECOVERY */
            <div className="text-center py-2 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-center justify-center mx-auto shadow-sm">
                <Clock size={28} />
              </div>

              <div>
                <h1 className="text-[18px] font-extrabold text-[#991B1B] tracking-tight">
                  Liên kết đã hết hạn hoặc không hợp lệ
                </h1>
                <p className="text-[13px] text-[#475569] mt-2 leading-relaxed">
                  Vì lý do bảo mật, mỗi liên kết đặt lại mật khẩu chỉ có hiệu lực trong thời gian giới hạn và chỉ sử dụng được <strong>một lần</strong>.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full font-bold justify-center h-[46px]"
                  onClick={onNavigateToForgotPassword}
                >
                  Gửi lại yêu cầu đặt mật khẩu mới
                </Button>

                <div>
                  <button
                    type="button"
                    onClick={() => onNavigateToLogin(email)}
                    className="font-semibold text-[13px] text-[#0D78AE] hover:text-[#126A9C] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Quay lại trang Đăng nhập</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STATE 1: RESET PASSWORD FORM */
            <>
              <div className="mb-5">
                <h1 className="text-[22px] font-extrabold text-[#172A3A] tracking-tight">
                  Thiết lập mật khẩu mới
                </h1>
                <p className="text-[13px] text-[#607483] mt-1 leading-relaxed">
                  Tạo mật khẩu mới an toàn cho tài khoản của bạn.
                </p>
              </div>

              {email && (
                <div className="mb-4 p-3 rounded-[10px] bg-[#F0F8FD] border border-[#CFE3F0] text-[#0D78AE] text-[12.5px] flex items-center gap-2">
                  <KeyRound size={15} className="shrink-0 text-[#0D78AE]" />
                  <span>
                    Thiết lập mật khẩu cho: <strong className="font-bold text-[#0F172A]">{email}</strong>
                  </span>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-4 p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-[13px] font-medium flex items-start gap-2.5"
                >
                  <AlertCircle size={15} className="text-[#DC2626] shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Token input (only if missing in URL) */}
                {!token && (
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="reset-token"
                      className="text-[13px] font-bold text-[#172A3A]"
                    >
                      Mã xác nhận / Token từ email
                    </label>
                    <input
                      id="reset-token"
                      name="token"
                      type="text"
                      disabled={isSubmitting}
                      value={token}
                      placeholder="Dán mã khôi phục từ email..."
                      onChange={(e) => {
                        setToken(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full h-[46px] px-3.5 text-[13px] font-mono text-[#172A3A] bg-white border border-[#DCE7EE] rounded-[10px] outline-none hover:border-[#B8CEDC] focus:border-[#18A6E0] focus:ring-2 focus:ring-[#18A6E0]/20 transition-all"
                    />
                  </div>
                )}

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reset-new-password"
                    className="text-[13px] font-bold text-[#172A3A]"
                  >
                    Mật khẩu mới
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="reset-new-password"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      value={newPassword}
                      placeholder="Tối thiểu 8 ký tự"
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full h-[46px] pl-3.5 pr-11 text-[13.5px] text-[#172A3A] placeholder:text-[#728391] bg-white border border-[#DCE7EE] rounded-[10px] outline-none hover:border-[#B8CEDC] focus:border-[#18A6E0] focus:ring-2 focus:ring-[#18A6E0]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute right-2.5 p-1.5 text-[#607483] hover:text-[#172A3A] rounded-[6px] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword.length > 0 && (
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-1.5 h-1.5 w-full">
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            strength.score >= 1 ? strength.colorClass : 'bg-[#E2E8F0]'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            strength.score >= 2 ? strength.colorClass : 'bg-[#E2E8F0]'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            strength.score >= 3 ? strength.colorClass : 'bg-[#E2E8F0]'
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="text-[#64748B]">{strength.label}</span>
                        <span className="text-[#94A3B8]">Tối thiểu 8 ký tự</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reset-confirm-password"
                    className="text-[13px] font-bold text-[#172A3A]"
                  >
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="reset-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      value={confirmPassword}
                      placeholder="Nhập lại mật khẩu mới"
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full h-[46px] pl-3.5 pr-11 text-[13.5px] text-[#172A3A] placeholder:text-[#728391] bg-white border border-[#DCE7EE] rounded-[10px] outline-none hover:border-[#B8CEDC] focus:border-[#18A6E0] focus:ring-2 focus:ring-[#18A6E0]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute right-2.5 p-1.5 text-[#607483] hover:text-[#172A3A] rounded-[6px] transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Instant Match Feedback */}
                  {isMatch && (
                    <p className="text-[12px] font-medium text-[#059669] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={13} />
                      <span>Mật khẩu xác nhận trùng khớp</span>
                    </p>
                  )}
                  {isMismatch && (
                    <p className="text-[12px] font-medium text-[#DC2626] flex items-center gap-1 mt-0.5">
                      <AlertCircle size={13} />
                      <span>Mật khẩu xác nhận chưa khớp</span>
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting || (confirmPassword.length > 0 && !isMatch)}
                    className="w-full font-bold justify-center h-[46px]"
                  >
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </Button>
                </div>
              </form>

              <div className="mt-5 pt-4 border-t border-[#EEF4F8] text-center text-[13.5px] space-y-2">
                <div>
                  <button
                    type="button"
                    onClick={() => onNavigateToLogin(email)}
                    className="font-semibold text-[#0D78AE] hover:text-[#126A9C] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Quay lại trang Đăng nhập</span>
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={onNavigateToForgotPassword}
                    className="text-[12.5px] text-[#607483] hover:text-[#0D78AE] hover:underline cursor-pointer"
                  >
                    Yêu cầu gửi lại liên kết mới?
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="text-center text-[12px] text-[#607483]">
        Hệ thống quản lý và xét chọn Sinh viên 5 tốt cấp Đại học Đà Nẵng · Hội Sinh viên Việt Nam Đại học Đà Nẵng
      </footer>
    </div>
  );
};
