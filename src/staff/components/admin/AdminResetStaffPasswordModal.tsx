/**
 * 5TOT Đà Nẵng — Admin Staff Password Reset Modal
 * Allows System Administrators to assign a custom or cryptographically generated
 * temporary password to any staff account, persist the Argon2 hash to Neon PostgreSQL,
 * revoke active sessions, and copy the credential for secure handover.
 */

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { StaffAccount } from '../../adminTypes';
import { Button } from '../../../components/buttons/Button';

export interface AdminResetStaffPasswordResult {
  success: boolean;
  error?: string;
}

export interface AdminResetStaffPasswordModalProps {
  isOpen: boolean;
  staff: StaffAccount | null;
  onClose: () => void;
  onConfirmReset: (
    id: string,
    reason?: string,
    newTemporaryPassword?: string
  ) => Promise<AdminResetStaffPasswordResult> | AdminResetStaffPasswordResult | void;
}

function generateStrongReadablePassword(): string {
  const digits = '23456789';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const symbols = '@#!$';
  const buf = new Uint32Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < buf.length; i += 1) {
      buf[i] = Math.floor(Math.random() * 100000);
    }
  }
  const d = `${digits[buf[0] % digits.length]}${digits[buf[1] % digits.length]}${
    digits[buf[2] % digits.length]
  }${digits[buf[3] % digits.length]}`;
  const u = `${upper[buf[4] % upper.length]}${lower[buf[5] % lower.length]}${
    lower[buf[6] % lower.length]
  }`;
  const sym = symbols[buf[7] % symbols.length];
  return `Dn5Tot${sym}${u}${d}`;
}

export const AdminResetStaffPasswordModal: React.FC<
  AdminResetStaffPasswordModalProps
> = ({ isOpen, staff, onClose, onConfirmReset }) => {
  const [newPassword, setNewPassword] = useState('');
  const [reason, setReason] = useState(
    'Cấp lại mật khẩu và thu hồi phiên đăng nhập theo yêu cầu nghiệp vụ'
  );
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedPassword, setCompletedPassword] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (isOpen && staff) {
      setNewPassword(generateStrongReadablePassword());
      setReason(
        'Cấp lại mật khẩu và thu hồi phiên đăng nhập theo yêu cầu nghiệp vụ'
      );
      setShowPassword(true);
      setCopied(false);
      setIsSubmitting(false);
      setErrorMessage(null);
      setCompletedPassword(null);
    }
  }, [isOpen, staff]);

  if (!isOpen || !staff) return null;

  const handleCopy = async (textToCopy: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Clipboard API unavailable in non-secure context
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmedPwd = newPassword.trim();
    if (trimmedPwd.length < 8) {
      setErrorMessage('Mật khẩu cấp mới phải có tối thiểu 8 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      const outcome = await onConfirmReset(
        staff.id,
        reason.trim() || undefined,
        trimmedPwd
      );
      if (outcome && outcome.success === false) {
        setErrorMessage(
          outcome.error ||
            'Không thể cập nhật mật khẩu trên máy chủ. Vui lòng thử lại.'
        );
        return;
      }
      setCompletedPassword(trimmedPwd);
    } catch (err) {
      setErrorMessage(
        err instanceof Error && err.message
          ? err.message
          : 'Không thể kết nối máy chủ để đặt lại mật khẩu.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-reset-staff-pwd-title"
    >
      <div className="bg-white rounded-[16px] border border-[#D4E2EC] max-w-[500px] w-full p-6 shadow-xl space-y-4 text-[#172A3A]">
        <div className="flex items-start justify-between gap-3 border-b border-[#EEF4F8] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#FEF6EB] text-[#B45309] flex items-center justify-center shrink-0">
              <KeyRound size={18} />
            </div>
            <div>
              <h2
                id="admin-reset-staff-pwd-title"
                className="text-[16px] font-extrabold text-[#0F2335]"
              >
                Đặt lại mật khẩu cán bộ
              </h2>
              <p className="text-[11.5px] text-[#526B7C]">
                Cập nhật mã băm Argon2 trên cơ sở dữ liệu và thu hồi phiên đăng nhập cũ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="p-1.5 rounded-[8px] text-[#607483] hover:text-[#0F2335] hover:bg-[#F3F8FC] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-3.5 rounded-[10px] bg-[#F8FBFD] border border-[#E2EDF5] text-[12.5px] space-y-0.5">
          <div className="text-[11px] font-bold text-[#0D78AE] uppercase">
            {staff.roleLabel} · {staff.unitLabel}
          </div>
          <div className="font-extrabold text-[#0F2335]">{staff.fullName}</div>
          <div className="text-[#526B7C] font-mono text-[12px]">{staff.email}</div>
        </div>

        {completedPassword ? (
          <div className="space-y-4">
            <div className="p-4 rounded-[12px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] space-y-2.5">
              <div className="font-extrabold text-[13.5px] flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Đã đặt lại mật khẩu và thu hồi phiên cũ thành công</span>
              </div>
              <p className="text-[12px] leading-relaxed">
                Vui lòng sao chép mật khẩu mới dưới đây để bàn giao bảo mật cho cán bộ{' '}
                <strong>{staff.fullName}</strong>:
              </p>
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-[8px] bg-white border border-[#A7F3D0]">
                <code className="font-mono font-bold text-[13.5px] text-[#0F2335] select-all">
                  {completedPassword}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(completedPassword)}
                  className="px-2.5 py-1 rounded-[6px] text-[11.5px] font-bold bg-[#065F46] text-white hover:bg-[#047857] flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="button" variant="primary" size="sm" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMessage && (
              <div className="p-3 rounded-[10px] bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-[12.5px] flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[12px] font-bold text-[#172A3A]">
                  Mật khẩu mới cấp cho cán bộ <span className="text-[#DC2626]">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPassword(generateStrongReadablePassword());
                      setCopied(false);
                    }}
                    className="px-2 py-0.5 rounded-[6px] text-[11px] font-bold text-[#0D78AE] bg-[#EBF6FC] hover:bg-[#DCEEFA] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Tạo ngẫu nhiên</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(newPassword)}
                    className="px-2 py-0.5 rounded-[6px] text-[11px] font-bold text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                  className="w-full px-3 py-2 pr-9 text-[13px] font-mono bg-[#F8FBFD] border border-[#DCE7EE] rounded-[9px] outline-none focus:border-[#0D78AE] focus:bg-white"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#607483] hover:text-[#172A3A] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                Lý do cấp lại mật khẩu (ghi nhật ký kiểm toán)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Nhập lý do nghiệp vụ..."
                className="w-full p-2.5 text-[12.5px] bg-[#F8FBFD] border border-[#DCE7EE] rounded-[9px] outline-none focus:border-[#0D78AE] focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EEF4F8]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang cập nhật DB...' : 'Xác nhận đặt lại mật khẩu'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
