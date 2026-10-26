import React from 'react';
import { Info, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../buttons/Button';

export interface ApplicationPreSubmitSummaryProps {
  onCheckFurtherClick: () => void;
  onSubmitClick: () => void;
  recommendationsCount?: number;
  className?: string;
}

export const ApplicationPreSubmitSummary: React.FC<ApplicationPreSubmitSummaryProps> = ({
  onCheckFurtherClick,
  onSubmitClick,
  recommendationsCount = 2,
  className = '',
}) => {
  return (
    <div
      className={`p-6 bg-white rounded-[14px] border border-[#DCE7EE] shadow-2xs flex flex-col gap-4 select-none w-full min-w-0 ${className}`}
    >
      <div className="flex items-start justify-between flex-wrap gap-2 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-[17px] font-bold text-[#172A3A] tracking-tight">
              Kiểm tra trước khi gửi hồ sơ
            </h3>
            {recommendationsCount > 0 ? (
              <span className="text-[11.5px] font-semibold text-[#B75B00] bg-[#FEF6EB] border border-[#FADDB6] px-2 py-0.5 rounded-[5px]">
                {recommendationsCount} gợi ý kiểm tra thêm
              </span>
            ) : (
              <span className="text-[11.5px] font-semibold text-[#1B7C49] bg-[#EDF9F1] border border-[#C6EED5] px-2 py-0.5 rounded-[5px]">
                Hồ sơ sẵn sàng
              </span>
            )}
          </div>
          <p className="text-[13px] text-[#607483] mt-1 leading-relaxed">
            {recommendationsCount > 0
              ? `Có ${recommendationsCount} nội dung bạn có thể kiểm tra lại để đảm bảo hồ sơ đầy đủ và chính xác nhất trước khi nộp.`
              : 'Các tiêu chuẩn đã có thông tin khai báo đầy đủ. Bạn có thể mở bảng rà soát và gửi hồ sơ bất kỳ lúc nào.'}
          </p>
        </div>
      </div>

      {/* The Recommendations Preview or All Clear Notice */}
      {recommendationsCount > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 min-w-0">
            <div className="p-3.5 bg-[#F8FBFD] rounded-[10px] border border-[#DCE7EE] flex items-start gap-3 min-w-0">
              <div className="w-6 h-6 rounded-[6px] bg-[#FEF6EB] text-[#B75B00] border border-[#FADDB6] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[12px]">
                3
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13.5px] font-bold text-[#172A3A] truncate">
                  Thể lực tốt
                </span>
                <span className="text-[12.5px] text-[#607483] mt-0.5 leading-snug line-clamp-2">
                  Bạn có thể kiểm tra lại ngày cấp chứng nhận "Sinh viên khỏe".
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#F8FBFD] rounded-[10px] border border-[#DCE7EE] flex items-start gap-3 min-w-0">
              <div className="w-6 h-6 rounded-[6px] bg-[#FEF6EB] text-[#B75B00] border border-[#FADDB6] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[12px]">
                5
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13.5px] font-bold text-[#172A3A] truncate">
                  Hội nhập tốt
                </span>
                <span className="text-[12.5px] text-[#607483] mt-0.5 leading-snug line-clamp-2">
                  Hệ thống nhận diện được ngày cấp chứng chỉ IELTS. Bạn có thể kiểm tra lại.
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FEF7EB] border border-[#FBD38D]/40 rounded-[8px] text-[12.5px] text-[#9C4221] flex items-center gap-2 min-w-0">
            <Info size={14} className="text-[#D97706] shrink-0" />
            <span className="leading-snug">
              Các nội dung trên là gợi ý và không ngăn bạn gửi hồ sơ xét chọn chính thức.
            </span>
          </div>
        </>
      ) : (
        <div className="p-3.5 bg-[#EDF9F1] border border-[#C6EED5] rounded-[10px] text-[12.5px] text-[#1B7C49] flex items-center gap-2.5">
          <CheckCircle2 size={16} className="text-[#1A934E] shrink-0" />
          <span>Hồ sơ đã được rà soát. Bạn có thể gửi hồ sơ khi sẵn sàng.</span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#DCE7EE] flex-wrap">
        <Button
          variant="secondary"
          onClick={onCheckFurtherClick}
          className="text-[#466474] font-semibold"
        >
          Kiểm tra thêm
        </Button>
        <Button
          variant="primary"
          onClick={onSubmitClick}
          iconTrailing={<ArrowRight size={15} />}
          className="bg-[#18A6E0] hover:bg-[#1390C5] font-semibold"
        >
          Gửi hồ sơ
        </Button>
      </div>
    </div>
  );
};
