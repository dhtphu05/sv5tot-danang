import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  sizeVariant?: 'sm' | 'md';
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Tìm minh chứng...',
      sizeVariant = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState('');
    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e.target.value);
      setInternalValue(e.target.value);
    };

    const handleClear = () => {
      if (onChange) onChange('');
      setInternalValue('');
      if (onClear) onClear();
    };

    const heightClass = sizeVariant === 'sm' ? 'h-8 text-[13px]' : 'h-9 text-[13.5px]';

    return (
      <div className={`relative flex items-center w-full max-w-sm ${className}`}>
        <Search
          size={sizeVariant === 'sm' ? 14 : 16}
          strokeWidth={2}
          className="absolute left-3 text-[#86868B] pointer-events-none shrink-0"
        />
        <input
          ref={ref}
          type="text"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full ${heightClass} pl-9 pr-8 text-[#1D1D1F] placeholder:text-[#86868B] bg-[#F5F5F7] hover:bg-[#EFEFF2] focus:bg-white rounded-[9px] border border-transparent focus:border-[#22A9E0]/20 transition-all duration-150 ease-out outline-none focus:ring-2 focus:ring-[#22A9E0]/15`}
          {...props}
        />
        {currentValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.05] transition-colors"
            title="Xóa tìm kiếm"
            aria-label="Xóa tìm kiếm"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
