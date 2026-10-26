import React from 'react';
import { Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../../buttons/Button';
import { Input } from '../../forms/Input';
import { CollectiveApplication } from '../../../staff/collectiveTypes';

export interface TT02ParticipationFormProps {
  application: CollectiveApplication;
  isEditing: boolean;
  isReadOnly: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (e: React.FormEvent) => void;
  tt02TotalMembers: number;
  setTt02TotalMembers: (val: number) => void;
  tt02Participating: number;
  setTt02Participating: (val: number) => void;
  tt02CensusDate: string;
  setTt02CensusDate: (val: string) => void;
  tt02Notes: string;
  setTt02Notes: (val: string) => void;
  formErrors: Record<string, string>;
  isTT02ThresholdMet: boolean;
  participationRate: number;
  editingParticipationRate: number;
}

export const TT02ParticipationForm: React.FC<TT02ParticipationFormProps> = ({
  application,
  isEditing,
  isReadOnly,
  onStartEdit,
  onCancelEdit,
  onSave,
  tt02TotalMembers,
  setTt02TotalMembers,
  tt02Participating,
  setTt02Participating,
  tt02CensusDate,
  setTt02CensusDate,
  tt02Notes,
  setTt02Notes,
  formErrors,
  isTT02ThresholdMet,
  participationRate,
  editingParticipationRate,
}) => {
  const { tt02 } = application;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[14.5px] text-[#172A3A]">
          Kê khai số lượng sinh viên tham gia phong trào (Yêu cầu 100%)
        </h3>
        {isEditing && (
          <span className="text-[11.5px] font-bold text-[#0D78AE] bg-[#EAF6FC] px-2.5 py-0.5 rounded-full">
            Đang chỉnh sửa
          </span>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={onSave} className="p-5 bg-[#F8FBFD] border border-[#CFE3F0] rounded-[14px] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Tổng số sinh viên thuộc tập thể (Mẫu số chung) *"
                type="number"
                min="1"
                value={String(tt02TotalMembers)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = parseInt(e.target.value, 10);
                  setTt02TotalMembers(isNaN(val) ? 0 : val);
                }}
                placeholder="Ví dụ: 42"
              />
              <span className="text-[11px] text-[#607483] mt-1 block">
                * Đây là mẫu số dùng chung cho cả Tiêu chuẩn 02 và Tiêu chuẩn 03.
              </span>
              {formErrors.totalMembers && (
                <div className="text-[11.5px] text-[#DC2626] mt-1">{formErrors.totalMembers}</div>
              )}
            </div>

            <div>
              <Input
                label="Số sinh viên tham gia phong trào (Tử số) *"
                type="number"
                min="0"
                value={String(tt02Participating)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = parseInt(e.target.value, 10);
                  setTt02Participating(isNaN(val) ? 0 : val);
                }}
                placeholder="Ví dụ: 42"
              />
              {formErrors.participating && (
                <div className="text-[11.5px] text-[#DC2626] mt-1">{formErrors.participating}</div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-[12px] border bg-white border-[#DCE7EE] flex items-center justify-between gap-4">
            <div>
              <div className="text-[11.5px] font-bold text-[#607483] uppercase tracking-wider">
                Tỷ lệ tham gia tính toán
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[24px] font-black text-[#172A3A]">
                  {editingParticipationRate.toFixed(1)}%
                </span>
                <span className="text-[12.5px] text-[#607483]">
                  ({tt02Participating} / {tt02TotalMembers} sinh viên)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] font-bold text-[12.5px] ${
                  tt02TotalMembers > 0 && tt02Participating === tt02TotalMembers
                    ? 'bg-[#EDF9F1] text-[#16A34A] border border-[#C6EED5]'
                    : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                }`}
              >
                {tt02TotalMembers > 0 && tt02Participating === tt02TotalMembers ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <AlertTriangle size={15} />
                )}
                <span>
                  {tt02TotalMembers > 0 && tt02Participating === tt02TotalMembers
                    ? 'Số liệu đạt ngưỡng 100%'
                    : 'Chưa đủ ngưỡng 100%'}
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Thời điểm chốt danh sách sinh viên"
              value={tt02CensusDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTt02CensusDate(e.target.value)}
              placeholder="Ví dụ: 01/06/2026"
            />
            <Input
              label="Ghi chú về kỳ thống kê"
              value={tt02Notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTt02Notes(e.target.value)}
              placeholder="Ví dụ: Toàn bộ sinh viên tham gia đầy đủ phong trào"
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
            <div>
              <div className="text-[12px] font-bold text-[#607483] uppercase tracking-wider">
                Tỷ lệ sinh viên tham gia phong trào theo kê khai
              </div>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-[28px] font-black text-[#172A3A] tabular-nums">
                  {participationRate.toFixed(1)}%
                </span>
                <span className="text-[13.5px] text-[#607483]">
                  ({tt02.participatingCount} / {tt02.totalMembers} sinh viên)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-bold text-[12.5px] ${
                  isTT02ThresholdMet
                    ? 'bg-[#EDF9F1] text-[#16A34A] border border-[#C6EED5]'
                    : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                }`}
              >
                {isTT02ThresholdMet ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{isTT02ThresholdMet ? 'Số liệu kê khai đạt 100%' : 'Chưa đủ ngưỡng 100%'}</span>
              </span>

              {!isReadOnly && (
                <Button type="button" variant="secondary" size="sm" onClick={onStartEdit}>
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[12.5px]">
            <div className="p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="text-[#607483] block text-[11px]">Thời điểm chốt danh sách:</span>
              <strong className="text-[#172A3A] mt-0.5 block">{tt02.censusDate || 'Chưa cung cấp'}</strong>
            </div>
            <div className="p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="text-[#607483] block text-[11px]">Ghi chú kỳ thống kê:</span>
              <strong className="text-[#172A3A] mt-0.5 block">{tt02.notes || 'Không có ghi chú'}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
