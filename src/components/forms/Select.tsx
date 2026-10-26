import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, helperText, error, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-[13px] font-medium text-[#1D1D1F] select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            className={`w-full h-10 px-3.5 pr-9 text-[14px] text-[#1D1D1F] bg-[#F5F5F7] hover:bg-[#EFEFF2] focus:bg-white rounded-[10px] border border-transparent focus:border-[#22A9E0]/30 transition-all duration-150 ease-out outline-none focus:ring-3 focus:ring-[#22A9E0]/15 appearance-none cursor-pointer disabled:bg-black/[0.03] disabled:text-slate-400 disabled:cursor-not-allowed ${
              error ? 'ring-2 ring-red-500/20 border-red-500/40' : ''
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-[#86868B]">
            <ChevronDown size={15} strokeWidth={2} />
          </div>
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

Select.displayName = 'Select';
