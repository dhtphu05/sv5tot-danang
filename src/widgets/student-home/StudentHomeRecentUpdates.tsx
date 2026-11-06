/**
 * 5TOT Đà Nẵng — Student Home Recent Updates & Notifications Preview (FSD Widgets Layer)
 */

import React from 'react';
import { Bell, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { StudentNotificationItem } from '../../components/notifications/notificationTypes';
import { Button } from '../../components/buttons/Button';

export interface StudentHomeRecentUpdatesProps {
  recentUpdates: StudentNotificationItem[];
  unresolvedActionableCount: number;
  isUpdatesError: boolean;
  onToggleUpdatesError: () => void;
  onOpenNotifications: () => void;
  onActivateNotification: (item: StudentNotificationItem) => void;
  submissionState?: string;
}

export const StudentHomeRecentUpdates: React.FC<StudentHomeRecentUpdatesProps> = ({
  recentUpdates,
  unresolvedActionableCount,
  isUpdatesError,
  onToggleUpdatesError,
  onOpenNotifications,
  onActivateNotification,
  submissionState = 'draft',
}) => {
  return (
    <section
      aria-label="Cập nhật gần đây"
      className="bg-white rounded-[6px] border border-[#DFE5EC] overflow-hidden"
    >
      <div className="px-5 py-3 border-b border-[#DFE5EC] bg-[#F8FAFC] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-[#007EE5]" />
          <h2 className="text-[14.5px] font-bold text-[#0F172A]">
            Cập nhật &amp; Thông báo gần đây
          </h2>
          {unresolvedActionableCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]">
              {unresolvedActionableCount} cần xử lý
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenNotifications}
          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-[#10A37F] hover:text-[#0D8A6B] hover:underline cursor-pointer"
        >
          <span>Xem tất cả thông báo</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {isUpdatesError ? (
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FFFDFB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[4px] bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
              <AlertCircle size={16} />
            </div>
            <div>
              <h3 className="text-[13.5px] font-bold text-[#0F172A]">
                Chưa thể tải danh sách cập nhật gần đây
              </h3>
              <p className="text-[12.5px] text-[#64748B]">
                Trạng thái hồ sơ và 5 tiêu chí phía trên vẫn hiển thị bình thường.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            iconLeading={<RefreshCw size={13} />}
            onClick={onToggleUpdatesError}
          >
            Thử lại
          </Button>
        </div>
      ) : recentUpdates.length === 0 ? (
        <div className="p-6 text-center text-[13px] text-[#64748B]">
          Hiện chưa có thông báo hoặc cập nhật mới.
        </div>
      ) : (
        <div className="divide-y divide-[#E2E8F0]">
          {recentUpdates.map((item) => {
            const isUnresolvedAction =
              item.isActionable && !item.isActionResolved;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onActivateNotification(item)}
                className={`w-full px-5 py-3 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors cursor-pointer group ${
                  isUnresolvedAction
                    ? 'bg-[#FFFDF7] hover:bg-[#FEF7E6]'
                    : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold ${
                        isUnresolvedAction
                          ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]'
                          : item.isActionable && item.isActionResolved
                          ? 'bg-[#ECFDF5] text-[#0F766E] border border-[#A7F3D0]'
                          : 'bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]'
                      }`}
                    >
                      {item.isActionable && item.isActionResolved
                        ? 'Đã xử lý'
                        : item.criterionName ||
                          (item.isActionable ? 'Cần xử lý' : 'Cập nhật')}
                    </span>
                    <span className="text-[13.5px] font-bold text-[#0F172A] group-hover:text-[#007EE5] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[11.5px] text-[#64748B] tabular-nums">
                      · {item.timestamp}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#64748B] line-clamp-1">
                    {item.message}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 text-[12px] font-bold text-[#10A37F] shrink-0 self-end sm:self-center">
                  <span>
                    {submissionState !== 'draft' && item.actionLabel === 'Tiếp tục hồ sơ'
                      ? 'Xem hồ sơ'
                      : item.actionLabel || 'Xem chi tiết'}
                  </span>
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
