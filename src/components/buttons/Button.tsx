import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      iconLeading,
      iconTrailing,
      isLoading = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Size configurations — Crisp administrative geometry
    const sizeClasses = {
      sm: 'h-8 px-3 text-[12.5px] font-semibold gap-1.5 rounded-[5px]',
      md: 'h-9.5 px-4 text-[13.5px] font-semibold gap-2 rounded-[6px]',
      lg: 'h-11 px-5 text-[14.5px] font-semibold gap-2.5 rounded-[6px]',
    }[size];

    // Variant configurations — HSV Ocean Blue & Emerald Teal Administrative System
    const variantClasses = {
      primary:
        'bg-[#10A37F] text-white hover:bg-[#0D8C6D] active:bg-[#0A755B] disabled:bg-slate-200 disabled:text-slate-400 shadow-none font-semibold',
      secondary:
        'bg-white text-[#1E293B] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8] active:bg-[#F1F5F9] disabled:bg-slate-50 disabled:text-slate-400 font-semibold',
      quiet:
        'bg-transparent text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] active:bg-[#E2E8F0] disabled:text-slate-300 font-medium',
      danger:
        'bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B] disabled:bg-slate-200 disabled:text-slate-400 font-semibold',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center select-none transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10A37F]/35 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          iconLeading && <span className="shrink-0">{iconLeading}</span>
        )}
        <span className="inline-flex items-center gap-1.5">{children}</span>
        {!isLoading && iconTrailing && <span className="shrink-0">{iconTrailing}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
