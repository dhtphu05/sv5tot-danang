import React, { useEffect, useRef, useState } from 'react';

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={`absolute z-40 mt-2 min-w-[200px] bg-white rounded-[13px] shadow-[0_10px_35px_rgba(0,0,0,0.10)] border border-black/[0.04] p-1.5 animate-in fade-in zoom-in-95 duration-120 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};
