/**
 * 5TOT Đà Nẵng — Public Forgot Password Page
 * Cơ quan chỉ đạo: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements high-standard Forgot Password UI/UX conforming 100% to common design system:
 * - Identical institutional lockup header (HsvEmblem size 42, exact 3-line title)
 * - Exact max-w-[436px] container & shadow-elevated card
 * - In-card h1 (22px font-extrabold text-[#172A3A]) and subtext
 * - Smart webmail deep-links (Gmail/Outlook)
 * - 60s resend cooldown timer
 * - Backward navigation & email prefill
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  Mail,
  ExternalLink,
  RotateCw,
  Edit3,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { HsvEmblem } from '../brand/HsvLogo';
import { Button } from '../buttons/Button';
import { apiRequest } from '../../shared/api/httpClient';

export interface PublicForgotPasswordPageProps {
  onNavigateToLogin: (prefillEmail?: string) => void;
  onNavigateToLanding: () => void;
  initialEmail?: string;
}

function resolveWebmailUrl(emailStr: string): { label: string; url: string } {
  const domain = emailStr.split('@')[1]?.toLowerCase() || '';
  if (domain === 'gmail.com') {
    return { label: 'Mở ứng dụng Gmail', url: 'https://mail.google.com' };
  }
  if (
    domain === 'outlook.com' ||
    domain === 'hotmail.com' ||
    domain === 'live.com' ||
    domain.endsWith('.udn.vn')
  ) {
    return { label: 'Mở Microsoft Outlook', url: 'https://outlook.office.com' };
  }
  return { label: 'Mở hòm thư điện tử', url: `mailto:${emailStr}` };
}

export const PublicForgotPasswordPage: React.FC<PublicForgotPasswordPageProps> = ({
  onNavigateToLogin,
  onNavigateToLanding,
  initialEmail = '',
}) => {
  const [email, setEmail] = useState<string>(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);

  // Synchronize initialEmail prop changes if any
  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Resend cooldown timer tick
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateEmailFormat = (val: string): string | null => {
    const trimmed = val.trim();
    if (!trimmed) return 'Vui lòng nhập địa chỉ email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Vui lòng nhập địa chỉ email hợp lệ (ví dụ: name@example.com).';
    }
    return null;
  };

  const dispatchResetRequest = async (targetEmail: string): Promise<boolean> => {
    try {
      await apiRequest<{ success: boolean; message: string }>(
        '/api/v2/auth/forgot-password',
        {
          method: 'POST',
          body: { email: targetEmail.trim() },
        }
      );
      return true;
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu lúc này. Vui lòng thử lại sau.'
      );
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);
    const err = validateEmailFormat(email);
    if (err) {
      setErrorMessage(err);
      return;
    }

    setIsSubmitting(true);
    const ok = await dispatchResetRequest(email);
    setIsSubmitting(false);

    if (ok) {
      setIsSuccess(true);
      setResendCooldown(60); // 60 seconds cooldown
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);

    const ok = await dispatchResetRequest(email);
    setIsResending(false);

    if (ok) {
      setResendCooldown(60);
    }
  };

  const webmail = resolveWebmailUrl(email);

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
          <span>Cổng xét chọn Danh hiệu và Giải thưởng Sinh viên TP. Đà Nẵng</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#607483]">
          <span>THÀNH ĐOÀN ĐÀ NẴNG · HỘI SINH VIÊN VIỆT NAM TP. ĐÀ NẴNG</span>
        </div>
      </div>

      {/* Main Centered Login Container (exact 436px width — common UI contract) */}
      <main className="w-full max-w-[436px] mx-auto my-auto py-3">
        {/* Institutional Lockup Header (exact identical style as Login & Signup) */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="flex items-center gap-2.5">
            <HsvEmblem size={42} />
          </div>
          <div className="mt-2 text-[10.5px] font-bold uppercase tracking-[0.07em] text-[#466474]">
            THÀNH ĐOÀN ĐÀ NẴNG
          </div>
          <div className="text-[11.5px] font-extrabold uppercase tracking-[0.05em] text-[#126A9C]">
            HỘI SINH VIÊN VIỆT NAM THÀNH PHỐ ĐÀ NẴNG
          </div>
          <div className="text-[14px] font-extrabold text-[#172A3A] mt-1">
            5TOT Đà Nẵng · Cổng xét chọn Danh hiệu & Giải thưởng Sinh viên
          </div>
        </div>

        {/* Card (shadow-elevated rounded-[16px]) */}
        <div className="bg-white rounded-[16px] border border-[#DCE7EE] shadow-elevated p-6 sm:p-7">
          {isSuccess ? (
            /* STATE 2: CHECK YOUR INBOX */
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center mx-auto shadow-sm">
                <Mail size={26} className="text-[#0D78AE]" />
              </div>

              <div>
                <h1 className="text-[20px] font-extrabold text-[#172A3A] tracking-tight">
                  Kiểm tra hộp thư của bạn
                </h1>
                <p className="text-[13px] text-[#475569] mt-1.5 leading-relaxed">
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến địa chỉ:
                </p>
                <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-[13px] font-semibold text-[#0F172A] max-w-full truncate">
                  <span className="truncate">{email.trim()}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setErrorMessage(null);
                    }}
                    title="Đổi địa chỉ email khác"
                    className="text-[#0D78AE] hover:text-[#0369A1] hover:underline cursor-pointer flex items-center gap-1 text-[11.5px] font-medium shrink-0 ml-1"
                  >
                    <Edit3 size={12} />
                    <span>Đổi</span>
                  </button>
                </div>
              </div>

              {/* Smart Webmail Button */}
              <div className="pt-2">
                <a
                  href={webmail.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 h-[46px] px-4 rounded-[10px] bg-[#0D78AE] hover:bg-[#126A9C] text-white font-bold text-[14px] transition-colors shadow-sm"
                >
                  <span>{webmail.label}</span>
                  <ExternalLink size={15} />
                </a>
              </div>

              {/* Guidance & Reassurance Box */}
              <div className="p-3.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-left space-y-2 text-[12.5px] text-[#475569]">
                <div className="flex items-start gap-2">
                  <Clock size={14} className="text-[#0D78AE] shrink-0 mt-0.5" />
                  <span>
                    Liên kết có hiệu lực trong <strong>15 phút</strong> và chỉ sử dụng được <strong>một lần</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                  <span>
                    Không thấy thư? Vui lòng kiểm tra mục <strong>Thư rác (Spam)</strong> hoặc mục <strong>Quảng cáo (Promotions)</strong>.
                  </span>
                </div>
              </div>

              {/* Resend Cooldown Section */}
              <div className="pt-1 text-[13px] text-[#64748B]">
                {resendCooldown > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-[#64748B]">
                    <RotateCw size={13} className="animate-spin text-[#94A3B8]" />
                    <span>Gửi lại email sau <strong>{resendCooldown}s</strong></span>
                  </span>
                ) : (
                  <span>
                    Chưa nhận được email?{' '}
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={handleResend}
                      className="font-semibold text-[#0D78AE] hover:text-[#126A9C] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isResending ? 'Đang gửi lại...' : 'Gửi lại ngay'}
                    </button>
                  </span>
                )}
              </div>

              {/* Back to Login */}
              <div className="pt-3 border-t border-[#EEF4F8]">
                <button
                  type="button"
                  onClick={() => onNavigateToLogin(email)}
                  className="font-semibold text-[13px] text-[#475569] hover:text-[#172A3A] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Quay lại trang Đăng nhập</span>
                </button>
              </div>
            </div>
          ) : (
            /* STATE 1: FORM INPUT */
            <>
              <div className="mb-5">
                <h1 className="text-[22px] font-extrabold text-[#172A3A] tracking-tight">
                  Quên mật khẩu
                </h1>
                <p className="text-[13px] text-[#607483] mt-1 leading-relaxed">
                  Nhập địa chỉ email tài khoản để nhận liên kết đặt lại mật khẩu mới.
                </p>
              </div>

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
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="forgot-email"
                    className="text-[13px] font-bold text-[#172A3A]"
                  >
                    Email tài khoản
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="forgot-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      disabled={isSubmitting}
                      value={email}
                      placeholder="name@example.com"
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full h-[46px] pl-3.5 pr-10 text-[13.5px] text-[#172A3A] placeholder:text-[#728391] bg-white border border-[#DCE7EE] rounded-[10px] outline-none hover:border-[#B8CEDC] focus:border-[#18A6E0] focus:ring-2 focus:ring-[#18A6E0]/20 transition-all"
                    />
                    <Mail size={16} className="absolute right-3.5 text-[#8FA2AF] pointer-events-none" />
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full font-bold justify-center h-[46px]"
                  >
                    {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi liên kết đặt lại mật khẩu'}
                  </Button>
                </div>
              </form>

              <div className="mt-5 pt-4 border-t border-[#EEF4F8] text-center text-[13.5px]">
                <button
                  type="button"
                  onClick={() => onNavigateToLogin(email)}
                  className="font-semibold text-[#0D78AE] hover:text-[#126A9C] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Quay lại trang Đăng nhập</span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="text-center text-[12px] text-[#607483]">
        Hệ thống quản lý và xét chọn Sinh viên 5 tốt cấp Thành phố Đà Nẵng · Hội Sinh viên Việt Nam TP. Đà Nẵng
      </footer>
    </div>
  );
};
