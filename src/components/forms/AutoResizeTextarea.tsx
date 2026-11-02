import React, { useRef, useLayoutEffect, useCallback, useEffect } from 'react';

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
  label?: string;
  helperText?: string;
  error?: string;
}

export const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  (
    {
      minHeight = 84,
      maxHeight = 360,
      label,
      helperText,
      error,
      className = '',
      id,
      value,
      onChange,
      rows = 3,
      style,
      ...props
    },
    forwardedRef
  ) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      // Reset height to 'auto' to correctly compute scrollHeight on deletion
      el.style.height = 'auto';
      const scrollH = el.scrollHeight;
      const targetH = Math.min(Math.max(scrollH, minHeight), maxHeight);
      el.style.height = `${targetH}px`;
      el.style.overflowY = scrollH > maxHeight ? 'auto' : 'hidden';
    }, [minHeight, maxHeight]);

    useLayoutEffect(() => {
      resize();
    }, [value, resize]);

    useEffect(() => {
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }, [resize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      resize();
      onChange?.(e);
    };

    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-[12.5px] font-bold text-[#172A3A] select-none">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={setRef}
          rows={rows}
          value={value}
          onChange={handleChange}
          style={{ minHeight, maxHeight, ...style }}
          className={`w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE] resize-y transition-[border-color,box-shadow] duration-150 disabled:bg-[#F8FAFC] disabled:text-[#64748B] disabled:cursor-not-allowed ${
            error ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' : ''
          } ${className}`}
          {...props}
        />
        {error ? (
          <span className="text-[11.5px] font-semibold text-[#DC2626]">{error}</span>
        ) : helperText ? (
          <span className="text-[11.5px] text-[#64748B] leading-snug">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
