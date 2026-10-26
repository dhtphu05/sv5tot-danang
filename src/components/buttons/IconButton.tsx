import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'quiet' | 'secondary' | 'brand';
  isActive?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      label,
      size = 'md',
      variant = 'quiet',
      isActive = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-7 h-7 rounded-[7px] text-[15px]',
      md: 'w-8 h-8 rounded-[8px] text-[18px]',
      lg: 'w-10 h-10 rounded-[10px] text-[20px]',
    }[size];

    const variantClasses = {
      quiet: isActive
        ? 'bg-[#22A9E0]/10 text-[#16689E]'
        : 'bg-transparent text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04] active:bg-black/[0.08]',
      secondary: isActive
        ? 'bg-[#22A9E0]/15 text-[#16689E]'
        : 'bg-black/[0.04] text-[#1D1D1F] hover:bg-black/[0.07] active:bg-black/[0.1]',
      brand:
        'bg-[#22A9E0] text-white hover:bg-[#1995C9] active:bg-[#1582B0]',
    }[variant];

    return (
      <button
        ref={ref}
        title={label}
        aria-label={label}
        disabled={disabled}
        className={`inline-flex items-center justify-center transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22A9E0]/40 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
