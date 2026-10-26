import React from 'react';
import { Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../../buttons/Button';
import { Input } from '../../forms/Input';
import { CollectiveApplication, ViolationConfirmationStatus } from '../../../staff/collectiveTypes';

export interface TT04ComplianceFormProps {
  application: CollectiveApplication;
  isEditing: boolean;
  isReadOnly: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (e: React.FormEvent) => void;
  tt04ViolationStatus: ViolationConfirmationStatus;
  setTt04ViolationStatus: (val: ViolationConfirmationStatus) => void;
  tt04ConfirmingUnit: string;
  setTt04ConfirmingUnit: (val: string) => void;
  tt04ConfirmationDate: string;
  setTt04ConfirmationDate: (val: string) => void;
  tt04DocNumber: string;
  setTt04DocNumber: (val: string) => void;
  tt04Notes: string;
  setTt04Notes: (val: string) => void;
  formErrors: Record<string, string>;
}

export const TT04ComplianceForm: React.FC<TT04ComplianceFormProps> = ({
  application,
  isEditing,
  isReadOnly,
  onStartEdit,
  onCancelEdit,
  onSave,
  tt04ViolationStatus,
  setTt04ViolationStatus,
  tt04ConfirmingUnit,
  setTt04ConfirmingUnit,
  tt04ConfirmationDate,
  setTt04ConfirmationDate,
  tt04DocNumber,
  setTt04DocNumber,
  tt04Notes,
  setTt04Notes,
  formErrors,
}) => {
  const { tt04 } = application;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[14.5px] text-[#172A3A]">
          Kê khai chấp hành pháp luật và quy chế kỷ luật
        </h3>
        {isEditing && (
          <span className="text-[11.5px] font-bold text-[#0D78AE] bg-[#EAF6FC] px-2.5 py-0.5 rounded-full">
            Đang chỉnh sửa
          </span>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={onSave} className="p-5 bg-[#F8FBFD] border border-[#CFE3F0] rounded-[14px] space-y-4">
          <div>
            <label className="block text-[12.5px] font-bold text-[#172A3A] mb-2">
              Tình trạng xác nhận không vi phạm quy định <span className="text-[#DC2626]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setTt04ViolationStatus('no_violations')}
                className={`p-3 rounded-[10px] border text-left cursor-pointer transition-all ${
                  tt04ViolationStatus === 'no_violations'
                    ? 'bg-white border-[#16A34A] text-[#16A34A] font-bold shadow-xs ring-2 ring-[#16A34A]/20'
                    : 'bg-white/80 border-[#DCE7EE] text-[#475569] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center">
                    {tt04ViolationStatus === 'no_violations' && <span className="w-2 h-2 rounded-full bg-current" />}
                  </span>
                  <span>Không vi phạm quy định</span>
                </div>
                <div className="text-[11px] text-[#607483] mt-1 pl-5">100% sinh viên chấp hành tốt pháp luật & nội quy</div>
              </button>

              <button
                type="button"
                onClick={() => setTt04ViolationStatus('needs_clarification')}
                className={`p-3 rounded-[10px] border text-left cursor-pointer transition-all ${
                  tt04ViolationStatus === 'needs_clarification'
                    ? 'bg-white border-[#D97706] text-[#D97706] font-bold shadow-xs ring-2 ring-[#D97706]/20'
                    : 'bg-white/80 border-[#DCE7EE] text-[#475569] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center">
                    {tt04ViolationStatus === 'needs_clarification' && <span className="w-2 h-2 rounded-full bg-current" />}
                  </span>
                  <span>Có trường hợp cần làm rõ</span>
                </div>
                <div className="text-[11px] text-[#607483] mt-1 pl-5">Đang chờ xác minh từ phía Khoa/Trường</div>
              </button>

              <button
                type="button"
                onClick={() => setTt04ViolationStatus('has_violations')}
                className={`p-3 rounded-[10px] border text-left cursor-pointer transition-all ${
                  tt04ViolationStatus === 'has_violations'
                    ? 'bg-white border-[#DC2626] text-[#DC2626] font-bold shadow-xs ring-2 ring-[#DC2626]/20'
                    : 'bg-white/80 border-[#DCE7EE] text-[#475569] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center">
                    {tt04ViolationStatus === 'has_violations' && <span className="w-2 h-2 rounded-full bg-current" />}
                  </span>
                  <span>Chưa thể xác nhận</span>
                </div>
                <div className="text-[11px] text-[#607483] mt-1 pl-5">Chưa có văn bản xác nhận từ đơn vị</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Đơn vị xác nhận *"
                value={tt04ConfirmingUnit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTt04ConfirmingUnit(e.target.value)}
                placeholder="Ví dụ: Ban Chủ nhiệm Khoa Điện tử - Viễn thông"
              />
              {formErrors.confirmingUnit && (
                <div className="text-[11.5px] text-[#DC2626] mt-1">{formErrors.confirmingUnit}</div>
              )}
            </div>

            <Input
              label="Thời điểm / Kỳ xác nhận"
              value={tt04ConfirmationDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTt04ConfirmationDate(e.target.value)}
              placeholder="Ví dụ: 05/06/2026"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Số công văn / giấy xác nhận"
              value={tt04DocNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTt04DocNumber(e.target.value)}
              placeholder="Ví dụ: 48/XN-KĐTVT"
            />
            <Input
              label="Phạm vi năm học xét"
              disabled={true}
              value={application.tt04.scopeYear}
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-[#172A3A] mb-1">
              Ghi chú nội dung xác nhận (tùy chọn)
            </label>
            <textarea
              rows={2}
              value={tt04Notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTt04Notes(e.target.value)}
              placeholder="Nhập ghi chú thêm về tình hình chấp hành nội quy..."
              className="w-full p-3 bg-white border border-[#DCE7EE] rounded-[8px] text-[13px] outline-none focus:border-[#0D78AE]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#DCE7EE]">
            <Button type="button" variant="quiet" onClick={onCancelEdit}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" className="gap-1.5">
              <Check size={15} />
              <span>Lưu kê khai</span>
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-5 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[14px] space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <span className="text-[11.5px] text-[#607483] font-semibold uppercase tracking-wider block">
                Tình trạng chấp hành kỷ luật
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-[6px] font-bold text-[13px] inline-flex items-center gap-1.5 ${
                    tt04.noViolationsConfirmed
                      ? 'bg-[#EDF9F1] text-[#16A34A] border border-[#C6EED5]'
                      : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                  }`}
                >
                  {tt04.noViolationsConfirmed ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>
                    {tt04.noViolationsConfirmed
                      ? '100% sinh viên không vi phạm pháp luật và quy định'
                      : 'Chưa có xác nhận không vi phạm'}
                  </span>
                </span>
              </div>
            </div>

            {!isReadOnly && (
              <Button type="button" variant="secondary" size="sm" onClick={onStartEdit}>
                Chỉnh sửa
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[12.5px]">
            <div className="p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="text-[#607483] block text-[11px]">Đơn vị xác nhận:</span>
              <strong className="text-[#172A3A] mt-0.5 block">{tt04.confirmingUnitName || 'Chưa cung cấp'}</strong>
            </div>
            <div className="p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="text-[#607483] block text-[11px]">Số công văn / giấy xác nhận:</span>
              <strong className="text-[#172A3A] mt-0.5 block">{tt04.confirmationDocNumber || 'Chưa cung cấp'}</strong>
            </div>
            <div className="p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="text-[#607483] block text-[11px]">Thời điểm xác nhận:</span>
              <strong className="text-[#172A3A] mt-0.5 block">{tt04.confirmationDate || 'Chưa cung cấp'}</strong>
            </div>
          </div>

          {tt04.notes && (
            <div className="text-[12px] text-[#475569] p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="font-semibold text-[#172A3A]">Ghi chú: </span>
              {tt04.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
