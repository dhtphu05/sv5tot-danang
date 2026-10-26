import React from 'react';

export const SkeletonBox: React.FC<{
  className?: string;
  width?: string | number;
  height?: string | number;
}> = ({ className = '', width, height }) => {
  return (
    <div
      className={`bg-black/[0.06] rounded-[6px] animate-pulse ${className}`}
      style={{ width, height }}
    />
  );
};

export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-3 px-6 py-4 items-center border-b border-black/[0.04]">
      <div className="col-span-5 flex items-center gap-3">
        <SkeletonBox width={14} height={14} className="rounded-full" />
        <div className="space-y-1.5 flex-1">
          <SkeletonBox width="70%" height={15} />
          <SkeletonBox width="40%" height={12} />
        </div>
      </div>
      <div className="col-span-3 space-y-1">
        <SkeletonBox width="85%" height={14} />
      </div>
      <div className="col-span-2">
        <SkeletonBox width={110} height={26} className="rounded-[6px]" />
      </div>
      <div className="col-span-2 flex justify-end">
        <SkeletonBox width={90} height={20} className="rounded-[4px]" />
      </div>
    </div>
  );
};

export const InspectorSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 p-1 animate-pulse">
      <SkeletonBox width="100%" height={64} className="rounded-[10px]" />
      <div className="space-y-2">
        <SkeletonBox width="40%" height={14} />
        <SkeletonBox width="100%" height={90} className="rounded-[10px]" />
      </div>
      <div className="space-y-2">
        <SkeletonBox width="35%" height={14} />
        <SkeletonBox width="100%" height={110} className="rounded-[10px]" />
      </div>
    </div>
  );
};
