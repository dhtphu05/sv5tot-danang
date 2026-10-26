import React from 'react';

export interface ApplicationTableProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Application Table Primitive
 * Borderless, continuous canvas surface, hairline horizontal dividers.
 * No box borders, no card walls, no vertical dividers.
 */
export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`w-full bg-white rounded-[14px] overflow-hidden ${className}`}>
      {/* Table Header Row */}
      <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-[#FAFAFB] text-[12px] font-semibold text-[#6E6E73] uppercase tracking-wider select-none border-b border-black/[0.05]">
        <div className="col-span-5 flex items-center">Tiêu chuẩn & Nội dung xét</div>
        <div className="col-span-3 flex items-center">Khai báo của sinh viên</div>
        <div className="col-span-2 flex items-center">Minh chứng</div>
        <div className="col-span-2 flex items-center justify-end">Trạng thái</div>
      </div>
      {/* Table Body Content */}
      <div className="divide-y divide-black/[0.05]">{children}</div>
    </div>
  );
};
