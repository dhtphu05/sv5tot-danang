import React from 'react';
import { Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../../buttons/Button';
import { Input } from '../../forms/Input';
import { CollectiveApplication } from '../../../staff/collectiveTypes';

export interface TT03SchoolAwardFormProps {
  application: CollectiveApplication;
  isEditing: boolean;
  isReadOnly: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (e: React.FormEvent) => void;
  sharedTotalMembers: number;
  minRequiredSv5tCount: number;
  tt03RecognizedCount: number;
  setTt03RecognizedCount: (val: number) => void;
  tt03IssuingInstitution: string;
  setTt03IssuingInstitution: (val: string) => void;
  tt03Notes: string;
  setTt03Notes: (val: string) => void;
  formErrors: Record<string, string>;
  isTT03ThresholdMet: boolean;
  recognitionRate: number;
  editingRecognitionRate: number;
}

export const TT03SchoolAwardForm: React.FC<TT03SchoolAwardFormProps> = ({
  application,
  isEditing,
  isReadOnly,
  onStartEdit,
  onCancelEdit,
  onSave,
  sharedTotalMembers,
  minRequiredSv5tCount,
  tt03RecognizedCount,
  setTt03RecognizedCount,
  tt03IssuingInstitution,
  setTt03IssuingInstitution,
  tt03Notes,
  setTt03Notes,
  formErrors,
  isTT03ThresholdMet,
  recognitionRate,
  editingRecognitionRate,
}) => {
  const { tt03 } = application;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[14.5px] text-[#172A3A]">
          Kê khai số lượng sinh viên đạt danh hiệu SV5T cấp Trường (Yêu cầu &ge; 20%)
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
              <label className="block text-[12.5px] font-semibold text-[#172A3A] mb-1">
                Tổng số sinh viên (Kế thừa từ Tiêu chuẩn 02)
              </label>
              <div className="h-[40px] px-3.5 bg-[#EEF4F8] border border-[#DCE7EE] rounded-[8px] flex items-center justify-between font-bold text-[#172A3A]">
                <span>{sharedTotalMembers} sinh viên</span>
                <span className="text-[11px] font-normal text-[#607483]">Mẫu số dùng chung</span>
              </div>
            </div>

            <div>
              <Input
                label="Số sinh viên đạt danh hiệu SV5T cấp Trường *"
                type="number"
                min="0"
                value={String(tt03RecognizedCount)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = parseInt(e.target.value, 10);
                  setTt03RecognizedCount(isNaN(val) ? 0 : val);
                }}
                placeholder="Ví dụ: 9"
              />
              {formErrors.recognizedCount && (
                <div className="text-[11.5px] text-[#DC2626] mt-1">{formErrors.recognizedCount}</div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-[12px] border bg-white border-[#DCE7EE] flex items-center justify-between gap-4">
            <div>
              <div className="text-[11.5px] font-bold text-[#607483] uppercase tracking-wider">
                Tỷ lệ đạt SV5T cấp Trường tính toán
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[24px] font-black text-[#172A3A]">
                  {editingRecognitionRate.toFixed(2)}%
                </span>
                <span className="text-[12.5px] text-[#607483]">
                  ({tt03RecognizedCount} / {sharedTotalMembers} sinh viên)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] font-bold text-[12.5px] ${
                  sharedTotalMembers > 0 && tt03RecognizedCount * 100 >= sharedTotalMembers * 20
                    ? 'bg-[#EDF9F1] text-[#16A34A] border border-[#C6EED5]'
                    : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                }`}
              >
                {sharedTotalMembers > 0 && tt03RecognizedCount * 100 >= sharedTotalMembers * 20 ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <AlertTriangle size={15} />
                )}
                <span>
                  {sharedTotalMembers > 0 && tt03RecognizedCount * 100 >= sharedTotalMembers * 20
                    ? 'Số liệu đạt ngưỡng >= 20%'
                    : 'Chưa đủ ngưỡng 20%'}
                </span>
              </span>
              <div className="text-[11px] text-[#728391] mt-1">
                Số lượng tối thiểu cần đạt ({sharedTotalMembers} SV): <strong>{minRequiredSv5tCount}</strong> sinh viên
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Đơn vị cấp quyết định công nhận cá nhân"
              value={tt03IssuingInstitution}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTt03IssuingInstitution(e.target.value)}
              placeholder="Ví dụ: Hội Sinh viên Trường Đại học Bách khoa"
            />
            <Input
              label="Ghi chú thêm"
              value={tt03Notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTt03Notes(e.target.value)}
              placeholder="Ví dụ: Kèm theo Quyết định số 115/QĐ-HSV"
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
                Tỷ lệ sinh viên đạt SV5T cấp Trường theo kê khai
              </div>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-[28px] font-black text-[#172A3A] tabular-nums">
                  {recognitionRate.toFixed(2)}%
                </span>
                <span className="text-[13.5px] text-[#607483]">
                  ({tt03.recognizedCount} / {sharedTotalMembers} sinh viên)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-bold text-[12.5px] ${
                  isTT03ThresholdMet
                    ? 'bg-[#EDF9F1] text-[#16A34A] border border-[#C6EED5]'
                    : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                }`}
              >
                {isTT03ThresholdMet ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{isTT03ThresholdMet ? 'Số liệu kê khai đạt ngưỡng ≥ 20%' : 'Chưa đủ ngưỡng 20%'}</span>
              </span>

              {!isReadOnly && (
                <Button type="button" variant="secondary" size="sm" onClick={onStartEdit}>
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[12.5px]">
            <div className="p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="text-[#607483] block text-[11px]">Số lượng tối thiểu cần đạt:</span>
              <strong className="text-[#172A3A] mt-0.5 block">{minRequiredSv5tCount} sinh viên</strong>
            </div>
            <div className="p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="text-[#607483] block text-[11px]">Đơn vị cấp quyết định cá nhân:</span>
              <strong className="text-[#172A3A] mt-0.5 block">{tt03.issuingInstitutionName || 'Cấp Trường'}</strong>
            </div>
            <div className="p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="text-[#607483] block text-[11px]">Năm học công nhận:</span>
              <strong className="text-[#172A3A] mt-0.5 block">{tt03.recognizedAcademicYear}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
