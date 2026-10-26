import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className = '', id, rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-[#1D1D1F] select-none">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={`w-full p-3 text-[14px] text-[#1D1D1F] placeholder:text-[#86868B] bg-[#F5F5F7] hover:bg-[#EFEFF2] focus:bg-white rounded-[10px] border border-transparent focus:border-[#22A9E0]/30 transition-all duration-150 ease-out outline-none focus:ring-3 focus:ring-[#22A9E0]/15 resize-y disabled:bg-black/[0.03] disabled:text-slate-400 disabled:cursor-not-allowed ${
            error ? 'ring-2 ring-red-500/20 border-red-500/40 bg-red-50/20' : ''
          } ${className}`}
          {...props}
        />
        {error ? (
          <span className="text-[12px] font-medium text-[#DC2626]">{error}</span>
        ) : helperText ? (
          <span className="text-[12px] text-[#86868B]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
