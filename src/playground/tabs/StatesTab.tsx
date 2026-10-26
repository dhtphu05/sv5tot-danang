import React from "react";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { TableRowSkeleton } from "../../components/feedback/Skeleton";
import { RecommendationBanner } from "../../components/status/RecommendationBanner";
import { StatusInline } from "../../components/status/StatusInline";
import { StatusChip } from "../../components/status/StatusChip";
import { Button } from "../../components/buttons/Button";
import { Sparkles, CheckCircle2 } from "lucide-react";

export const StatesTab: React.FC = () => {
  return (
          <div className="flex flex-col gap-10">
            {/* 1. Official Status Vocabulary */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight">
                  1. Ngôn ngữ trạng thái chuẩn tắc (Status Language)
                </h2>
                <span className="text-[12.5px] text-[#6E6E73]">
                  Tuyệt đối KHÔNG dùng: AI PASS, OCR SUCCESS, FAILED
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-[14px] border border-black/[0.05]">
                <div className="space-y-3">
                  <h4 className="text-[13px] font-semibold text-[#6E6E73] uppercase mb-2">
                    Dạng Inline (Dot + Label — Dùng trong Bảng chính)
                  </h4>
                  <div className="space-y-2.5">
                    <StatusInline status="declared" />
                    <StatusInline status="has_evidence" />
                    <StatusInline status="ready" />
                    <StatusInline status="needs_verification" />
                    <StatusInline status="awaiting_officer" />
                    <StatusInline status="requires_supplement" />
                    <StatusInline status="review_completed" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[13px] font-semibold text-[#6E6E73] uppercase mb-2">
                    Dạng Compact Chip (Khi cần đóng khung nhỏ)
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    <StatusChip status="declared" />
                    <StatusChip status="has_evidence" />
                    <StatusChip status="ready" />
                    <StatusChip status="needs_verification" />
                    <StatusChip status="awaiting_officer" />
                    <StatusChip status="requires_supplement" />
                    <StatusChip status="review_completed" />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Recommendations & Advisories */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight">
                2. Khối thông báo gợi ý & Kiểm tra (Recommendation Banners)
              </h2>
              <div className="space-y-3 bg-white p-6 rounded-[14px] border border-black/[0.05]">
                <RecommendationBanner
                  variant="info"
                  title="Thông tin hệ thống nhận diện"
                  message="Dữ liệu điểm GPA 3.45 được trích xuất từ bảng điểm số 102220123. Bạn có thể kiểm tra thêm."
                />
                <RecommendationBanner
                  variant="recommendation"
                  title="Điểm cần lưu ý kiểm tra"
                  message="Có một vài điểm bạn có thể kiểm tra thêm: Ngày cấp chứng chỉ NCKH chưa có mộc xác thực số."
                  action={{
                    label: 'Kiểm tra tệp',
                    onClick: () => {},
                  }}
                />
                <RecommendationBanner
                  variant="hard_blocker"
                  title="Yêu cầu bắt buộc còn thiếu"
                  message="Tiêu chí Học tập tốt yêu cầu ít nhất 1 chứng chỉ ngoại ngữ chuẩn đầu ra trước khi gửi hồ sơ."
                />
              </div>
            </section>

            {/* 3. Skeleton Loading & Empty / Error States */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[20px] font-bold text-[#1D1D1F] tracking-tight">
                3. Trạng thái Tải dữ liệu, Trống & Lỗi (Skeleton, Empty & Error)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-white rounded-[14px] border border-black/[0.05] flex flex-col justify-between">
                  <span className="text-[12px] font-semibold text-[#6E6E73] uppercase mb-2">
                    Skeleton Khung hàng (Geometry Matching)
                  </span>
                  <div className="space-y-2">
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </div>
                </div>

                <div className="p-4 bg-white rounded-[14px] border border-black/[0.05]">
                  <span className="text-[12px] font-semibold text-[#6E6E73] uppercase mb-2 block">
                    Trạng thái trống (Empty State)
                  </span>
                  <EmptyState
                    title="Chưa có minh chứng nào"
                    description="Thêm tài liệu để sử dụng trong hồ sơ xét chọn của bạn."
                    action={{
                      label: 'Tải minh chứng đầu tiên',
                      onClick: () => {},
                    }}
                  />
                </div>

                <div className="p-4 bg-white rounded-[14px] border border-black/[0.05]">
                  <span className="text-[12px] font-semibold text-[#6E6E73] uppercase mb-2 block">
                    Trạng thái lỗi bình tĩnh (Calm Error)
                  </span>
                  <ErrorState
                    title="Chưa thể tải dữ liệu quy chế"
                    description="Hệ thống chưa thể nạp dữ liệu từ máy chủ. Vui lòng thử lại sau giây lát."
                    onRetry={() => {}}
                  />
                </div>
              </div>
            </section>
          </div>
  );
};
