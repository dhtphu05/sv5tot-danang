import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../buttons/Button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'danger';
    isLoading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  maxWidth?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  maxWidth = 'max-w-md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Soft dark translucent backdrop */}
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog box: 18px radius, restrained shadow, no heavy borders */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white rounded-[18px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-6 overflow-hidden flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col pr-4">
            <h3 className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-[13.5px] text-[#6E6E73] mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[7px] text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.05] transition-colors cursor-pointer"
            aria-label="Đóng hộp thoại"
          >
            <X size={17} />
          </button>
        </div>

        {children && <div className="text-[14px] text-[#1D1D1F]">{children}</div>}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          {secondaryAction && (
            <Button
              variant="secondary"
              size="md"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'primary'}
              size="md"
              onClick={primaryAction.onClick}
              isLoading={primaryAction.isLoading}
            >
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
