import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeading?: React.ReactNode;
  iconTrailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      iconLeading,
      iconTrailing,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-[#1D1D1F] select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {iconLeading && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#86868B]">
              {iconLeading}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-10 px-3.5 text-[14px] text-[#1D1D1F] placeholder:text-[#86868B] bg-[#F5F5F7] hover:bg-[#EFEFF2] focus:bg-white rounded-[10px] border border-transparent focus:border-[#22A9E0]/30 transition-all duration-150 ease-out outline-none focus:ring-3 focus:ring-[#22A9E0]/15 disabled:bg-black/[0.03] disabled:text-slate-400 disabled:cursor-not-allowed ${
              iconLeading ? 'pl-9' : ''
            } ${iconTrailing ? 'pr-9' : ''} ${
              error ? 'ring-2 ring-red-500/20 border-red-500/40 bg-red-50/20' : ''
            } ${className}`}
            {...props}
          />
          {iconTrailing && (
            <div className="absolute right-3 flex items-center text-[#86868B]">
              {iconTrailing}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-[12px] font-medium text-[#DC2626]">{error}</span>
        ) : helperText ? (
          <span className="text-[12px] text-[#86868B]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
