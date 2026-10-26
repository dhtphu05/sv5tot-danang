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
    // Size configurations
    const sizeClasses = {
      sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-[8px]',
      md: 'h-10 px-4 text-[14px] font-medium gap-2 rounded-[10px]',
      lg: 'h-11 px-5 text-[15px] font-medium gap-2.5 rounded-[12px]',
    }[size];

    // Variant configurations
    const variantClasses = {
      primary:
        'bg-[#22A9E0] text-white hover:bg-[#1995C9] active:bg-[#1582B0] active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 disabled:scale-100 shadow-none font-medium',
      secondary:
        'bg-black/[0.045] text-[#1D1D1F] hover:bg-black/[0.075] active:bg-black/[0.1] disabled:bg-black/[0.02] disabled:text-slate-400 font-medium',
      quiet:
        'bg-transparent text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.035] active:bg-black/[0.06] disabled:text-slate-300 font-medium',
      danger:
        'bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B] disabled:bg-slate-200 disabled:text-slate-400 font-medium',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center select-none transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22A9E0]/40 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
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
