import React from 'react';
import { History, X } from 'lucide-react';
import { Button } from '../../../../components/buttons/Button';
import { CollectiveApplication } from '../../../collectiveTypes';

interface CollectiveAuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: CollectiveApplication;
}

export const CollectiveAuditHistoryModal: React.FC<CollectiveAuditHistoryModalProps> = ({
  isOpen,
  onClose,
  app,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-[16px] shadow-2xl border border-[#DCE7EE] p-6 flex flex-col overflow-hidden space-y-4">
        <div className="flex items-center justify-between border-b border-[#EEF4F8] pb-3">
          <div className="flex items-center gap-2 text-[#0D78AE]">
            <History size={18} />
            <h3 className="font-extrabold text-[16px] text-[#172A3A]">
              Lịch sử xử lý &amp; Nhật ký kiểm toán hồ sơ
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#728391] hover:text-[#172A3A] cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-[12.5px]">
          {app.auditHistory && app.auditHistory.length > 0 ? (
            <div className="space-y-2">
              {app.auditHistory.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[10px] space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#607483]">
                    <span className="font-bold text-[#172A3A]">{ev.actorName} ({ev.actorRole})</span>
                    <span>{ev.timestamp}</span>
                  </div>
                  <div className="font-semibold text-[#0D78AE]">{ev.action}</div>
                  {ev.details && <div className="text-[#384E60]">{ev.details}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-[#728391]">
              Chưa có sự kiện kiểm toán nào được ghi lại.
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-[#EEF4F8] flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};
