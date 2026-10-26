import React from 'react';
import { Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../../buttons/Button';
import { Input } from '../../forms/Input';
import { CollectiveApplication, SchoolRecognitionStatus } from '../../../staff/collectiveTypes';

export interface TT01RecognitionFormProps {
  application: CollectiveApplication;
  isEditing: boolean;
  isReadOnly: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (e: React.FormEvent) => void;
  tt01RecognitionStatus: SchoolRecognitionStatus;
  setTt01RecognitionStatus: (val: SchoolRecognitionStatus) => void;
  tt01CollectiveName: string;
  setTt01CollectiveName: (val: string) => void;
  tt01IssuingUnit: string;
  setTt01IssuingUnit: (val: string) => void;
  tt01DecisionNumber: string;
  setTt01DecisionNumber: (val: string) => void;
  tt01DecisionDate: string;
  setTt01DecisionDate: (val: string) => void;
  tt01Notes: string;
  setTt01Notes: (val: string) => void;
  formErrors: Record<string, string>;
}

export const TT01RecognitionForm: React.FC<TT01RecognitionFormProps> = ({
  application,
  isEditing,
  isReadOnly,
  onStartEdit,
  onCancelEdit,
  onSave,
  tt01RecognitionStatus,
  setTt01RecognitionStatus,
  tt01CollectiveName,
  setTt01CollectiveName,
  tt01IssuingUnit,
  setTt01IssuingUnit,
  tt01DecisionNumber,
  setTt01DecisionNumber,
  tt01DecisionDate,
  setTt01DecisionDate,
  tt01Notes,
  setTt01Notes,
  formErrors,
}) => {
  const { tt01 } = application;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[14.5px] text-[#172A3A]">
          Thông tin kê khai công nhận danh hiệu cấp Trường
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
              Trạng thái công nhận danh hiệu cấp Trường <span className="text-[#DC2626]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setTt01RecognitionStatus('recognized')}
                className={`p-3 rounded-[10px] border text-left cursor-pointer transition-all ${
                  tt01RecognitionStatus === 'recognized'
                    ? 'bg-white border-[#16A34A] text-[#16A34A] font-bold shadow-xs ring-2 ring-[#16A34A]/20'
                    : 'bg-white/80 border-[#DCE7EE] text-[#475569] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center">
                    {tt01RecognitionStatus === 'recognized' && <span className="w-2 h-2 rounded-full bg-current" />}
                  </span>
                  <span>Đã được công nhận</span>
                </div>
                <div className="text-[11px] text-[#607483] mt-1 pl-5">Có quyết định khen thưởng cấp Trường</div>
              </button>

              <button
                type="button"
                onClick={() => setTt01RecognitionStatus('not_recognized')}
                className={`p-3 rounded-[10px] border text-left cursor-pointer transition-all ${
                  tt01RecognitionStatus === 'not_recognized'
                    ? 'bg-white border-[#DC2626] text-[#DC2626] font-bold shadow-xs ring-2 ring-[#DC2626]/20'
                    : 'bg-white/80 border-[#DCE7EE] text-[#475569] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center">
                    {tt01RecognitionStatus === 'not_recognized' && <span className="w-2 h-2 rounded-full bg-current" />}
                  </span>
                  <span>Chưa được công nhận</span>
                </div>
                <div className="text-[11px] text-[#607483] mt-1 pl-5">Chưa đạt hoặc chưa xét ở cấp cơ sở</div>
              </button>

              <button
                type="button"
                onClick={() => setTt01RecognitionStatus('clarifying')}
                className={`p-3 rounded-[10px] border text-left cursor-pointer transition-all ${
                  tt01RecognitionStatus === 'clarifying'
                    ? 'bg-white border-[#D97706] text-[#D97706] font-bold shadow-xs ring-2 ring-[#D97706]/20'
                    : 'bg-white/80 border-[#DCE7EE] text-[#475569] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center">
                    {tt01RecognitionStatus === 'clarifying' && <span className="w-2 h-2 rounded-full bg-current" />}
                  </span>
                  <span>Cần làm rõ / Chưa xác định</span>
                </div>
                <div className="text-[11px] text-[#607483] mt-1 pl-5">Đang chờ ký duyệt hoặc trích lục</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Tên tập thể được công nhận"
                value={tt01CollectiveName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTt01CollectiveName(e.target.value)}
                placeholder="Ví dụ: Chi hội 21TCLC_DT1"
              />
            </div>
            <div>
              <Input
                label="Năm học công nhận"
                disabled={true}
                value={application.tt01.recognizedAcademicYear}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Đơn vị ra quyết định công nhận *"
                value={tt01IssuingUnit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTt01IssuingUnit(e.target.value)}
                placeholder="Ví dụ: Hội Sinh viên Trường Đại học Bách khoa"
              />
              {formErrors.issuingUnit && (
                <div className="text-[11.5px] text-[#DC2626] mt-1">{formErrors.issuingUnit}</div>
              )}
            </div>
            <div>
              <Input
                label="Số / ký hiệu quyết định công nhận *"
                value={tt01DecisionNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTt01DecisionNumber(e.target.value)}
                placeholder="Ví dụ: 112/QĐ-HSV-ĐHBK"
              />
              {formErrors.decisionNumber && (
                <div className="text-[11.5px] text-[#DC2626] mt-1">{formErrors.decisionNumber}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ngày ban hành quyết định"
              value={tt01DecisionDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTt01DecisionDate(e.target.value)}
              placeholder="Ví dụ: 28/05/2026"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-semibold text-[#172A3A] mb-1">
              Ghi chú / Thông tin tham chiếu thêm (tùy chọn)
            </label>
            <textarea
              rows={2}
              value={tt01Notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTt01Notes(e.target.value)}
              placeholder="Nhập ghi chú thêm hoặc trích lục quyết định..."
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
                Trạng thái công nhận cấp cơ sở
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-[6px] font-bold text-[13px] inline-flex items-center gap-1.5 ${
                    tt01.isRecognizedSchoolLevel
                      ? 'bg-[#EDF9F1] text-[#16A34A] border border-[#C6EED5]'
                      : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                  }`}
                >
                  {tt01.isRecognizedSchoolLevel ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>
                    {tt01.isRecognizedSchoolLevel
                      ? 'Đã đạt danh hiệu cấp Trường năm học 2025–2026'
                      : 'Chưa đạt danh hiệu cấp Trường hoặc chưa khai báo'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 text-[12.5px]">
            <div className="p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="text-[#607483] block text-[11px]">Đơn vị công nhận:</span>
              <strong className="text-[#172A3A] mt-0.5 block">{tt01.issuingUnitName || 'Chưa cung cấp'}</strong>
            </div>
            <div className="p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="text-[#607483] block text-[11px]">Số / Ký hiệu quyết định:</span>
              <strong className="text-[#172A3A] mt-0.5 block">{tt01.decisionNumber || 'Chưa cung cấp'}</strong>
            </div>
            <div className="p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="text-[#607483] block text-[11px]">Ngày ban hành:</span>
              <strong className="text-[#172A3A] mt-0.5 block">{tt01.decisionDate || 'Chưa cung cấp'}</strong>
            </div>
          </div>

          {tt01.referenceNotes && (
            <div className="text-[12px] text-[#475569] p-3 bg-white border border-[#E2EDF5] rounded-[9px]">
              <span className="font-semibold text-[#172A3A]">Ghi chú: </span>
              {tt01.referenceNotes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
