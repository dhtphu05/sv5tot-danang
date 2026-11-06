/**
 * 5TOT Đà Nẵng — Self-Service Change Password Modal
 * Reusable across all authenticated portals:
 * - Cán bộ sơ tuyển cấp Trường (SCHOOL_OFFICER)
 * - Cán bộ xét duyệt / Quản lý / Hội đồng / Quản trị (CITY_OFFICER, CITY_MANAGER, CITY_COMMITTEE, ADMIN)
 * - Sinh viên & Người lập hồ sơ Tập thể (STUDENT, COLLECTIVE_PREPARER)
 */

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { resolveDomainServices } from '../../entities/services/modeResolver';
import { Button } from '../buttons/Button';

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountName?: string;
  accountEmail?: string;
  roleLabel?: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  accountName,
  accountEmail,
  roleLabel,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setIsSubmitting(false);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMessage('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận chưa khớp với mật khẩu mới.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resolveDomainServices().auth.changePassword({
        currentPassword,
        newPassword,
      });
      setSuccessMessage(
        res.message || 'Đổi mật khẩu thành công. Phiên làm việc đã được bảo mật.'
      );
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Không thể đổi mật khẩu lúc này. Vui lòng kiểm tra lại thông tin.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-modal-title"
    >
      <div className="bg-white rounded-[16px] border border-[#D4E2EC] max-w-[460px] w-full p-6 shadow-xl space-y-4 text-[#172A3A]">
        <div className="flex items-start justify-between gap-3 border-b border-[#EEF4F8] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#EBF6FC] text-[#0D78AE] flex items-center justify-center shrink-0">
              <KeyRound size={18} />
            </div>
            <div>
              <h2
                id="change-password-modal-title"
                className="text-[16px] font-extrabold text-[#0F2335]"
              >
                Đổi mật khẩu tài khoản
              </h2>
              <p className="text-[11.5px] text-[#526B7C]">
                Cập nhật mật khẩu bảo mật trên hệ thống 5TOT Đà Nẵng
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

        {(accountName || accountEmail) && (
          <div className="px-3.5 py-2.5 rounded-[10px] bg-[#F8FBFD] border border-[#E2EDF5] text-[12px] flex items-center justify-between gap-2">
            <div className="min-w-0">
              {roleLabel && (
                <div className="text-[10.5px] font-bold text-[#0D78AE] uppercase tracking-wide">
                  {roleLabel}
                </div>
              )}
              {accountName && (
                <div className="font-bold text-[#0F2335] truncate">
                  {accountName}
                </div>
              )}
              {accountEmail && (
                <div className="text-[#607483] truncate">{accountEmail}</div>
              )}
            </div>
            <ShieldCheck size={16} className="text-[#0D78AE] shrink-0" />
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4">
            <div className="p-4 rounded-[12px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[13px] space-y-1.5">
              <div className="font-extrabold flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Đã cập nhật mật khẩu mới</span>
              </div>
              <p className="text-[12.5px] leading-relaxed">{successMessage}</p>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="primary" size="sm" onClick={onClose}>
                Hoàn tất
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
              <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                Mật khẩu hiện tại <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu đang sử dụng"
                  className="w-full px-3 py-2 pr-9 text-[13px] bg-[#F8FBFD] border border-[#DCE7EE] rounded-[9px] outline-none focus:border-[#0D78AE] focus:bg-white"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrent((v) => !v)}
                  aria-label={showCurrent ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#607483] hover:text-[#172A3A] cursor-pointer"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                Mật khẩu mới <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full px-3 py-2 pr-9 text-[13px] bg-[#F8FBFD] border border-[#DCE7EE] rounded-[9px] outline-none focus:border-[#0D78AE] focus:bg-white"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#607483] hover:text-[#172A3A] cursor-pointer"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-[11px] text-[#607483] mt-1">
                Khuyến nghị kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
              </p>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                Xác nhận mật khẩu mới <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-3 py-2 pr-9 text-[13px] bg-[#F8FBFD] border border-[#DCE7EE] rounded-[9px] outline-none focus:border-[#0D78AE] focus:bg-white"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={
                    showConfirm ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#607483] hover:text-[#172A3A] cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
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
                {isSubmitting ? 'Đang cập nhật...' : 'Lưu mật khẩu mới'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
