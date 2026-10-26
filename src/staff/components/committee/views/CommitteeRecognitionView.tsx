import React from 'react';
import {
  AlertCircle,
  FileText,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { StaffRouteId } from '../../../types';
import { CURRENT_STAFF_SEASON } from '../../../fixtures/staffDataset';
import {
  PublicationReadinessResult,
  canFinalizeResults,
} from '../../../committeeSelectors';
import { Button } from '../../../../components/buttons/Button';

export interface CommitteeRecognitionViewProps {
  publicationReadiness: PublicationReadinessResult;
  finalizationCheck: ReturnType<typeof canFinalizeResults>;
  onSelectRoute: (routeId: StaffRouteId) => void;
  onOpenApplicationWorkspace: (applicationId: string) => void;
  onFinalizeResultSet: () => void;
  onOpenPublicationDialog: () => void;
  renderCommitteeScenarioStrip: () => React.ReactNode;
}

export const CommitteeRecognitionView: React.FC<CommitteeRecognitionViewProps> = ({
  publicationReadiness,
  finalizationCheck,
  onSelectRoute,
  onOpenApplicationWorkspace,
  onFinalizeResultSet,
  onOpenPublicationDialog,
  renderCommitteeScenarioStrip,
}) => {
  return (
    <div className="p-6 max-w-[1120px] w-full mx-auto space-y-5">
      {renderCommitteeScenarioStrip()}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#DCE7EE] pb-4">
        <div>
          <div className="text-[12px] font-bold text-[#0B64A0]">
            {CURRENT_STAFF_SEASON.schoolYear} · {CURRENT_STAFF_SEASON.scopeLabel}
          </div>
          <h1 className="text-[21px] font-extrabold text-[#0F2335] mt-0.5">
            Quyết định công nhận &amp; Công bố kết quả
          </h1>
          <p className="text-[13px] text-[#4A6275] mt-0.5">
            Thông tin hoàn tất quyết định xét chọn và điều khiển công bố kết quả chính thức theo thẩm quyền.
          </p>
        </div>
      </div>

      {/* Authoritative Season & Result Set Context (Section 58) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <section className="bg-white rounded-[12px] border border-[#D4E2EC] p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#E6EFF5] pb-3">
              <h2 className="text-[15.5px] font-extrabold text-[#0F2335]">
                Thông tin đợt xét chọn &amp; Danh sách kết luận
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-[6px] text-[11.5px] font-bold border ${
                  publicationReadiness.isAlreadyPublished
                    ? 'bg-[#EAFBF1] text-[#136F3A] border-[#B6E6C9]'
                    : publicationReadiness.canPublish
                    ? 'bg-[#EAF6FC] text-[#0B64A0] border-[#CBE5F6]'
                    : 'bg-[#FEF6EB] text-[#B45309] border-[#FADDB6]'
                }`}
              >
                {publicationReadiness.isAlreadyPublished
                  ? 'Đã công bố'
                  : publicationReadiness.canPublish
                  ? 'Sẵn sàng công bố'
                  : 'Chưa công bố'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[13px]">
              <div className="p-3.5 rounded-[9px] bg-[#F8FBFD] border border-[#E2EDF5]">
                <div className="text-[11.5px] text-[#526B7C]">
                  Đơn vị tổ chức / vận hành
                </div>
                <div className="font-bold text-[#0F2335] mt-0.5">
                  Hội Sinh viên Việt Nam Thành phố Đà Nẵng
                </div>
              </div>

              <div className="p-3.5 rounded-[9px] bg-[#F8FBFD] border border-[#E2EDF5]">
                <div className="text-[11.5px] text-[#526B7C]">
                  Đợt xét chọn &amp; Cấp danh hiệu
                </div>
                <div className="font-bold text-[#0F2335] mt-0.5">
                  {CURRENT_STAFF_SEASON.schoolYear} · Cấp Thành phố Đà Nẵng
                </div>
              </div>

              <div className="p-3.5 rounded-[9px] bg-[#F8FBFD] border border-[#E2EDF5]">
                <div className="text-[11.5px] text-[#526B7C]">
                  Được công nhận Sinh viên 5 tốt cấp Thành phố
                </div>
                <div className="text-[16px] font-extrabold text-[#136F3A] tabular-nums mt-0.5">
                  {publicationReadiness.recognizedCount} sinh viên
                </div>
              </div>

              <div className="p-3.5 rounded-[9px] bg-[#F8FBFD] border border-[#E2EDF5]">
                <div className="text-[11.5px] text-[#526B7C]">
                  Chưa được công nhận trong đợt xét này
                </div>
                <div className="text-[16px] font-extrabold text-[#334E68] tabular-nums mt-0.5">
                  {publicationReadiness.notRecognizedCount} sinh viên
                </div>
              </div>
            </div>

            {/* Official Document Factual Placeholder */}
            <div className="p-4 rounded-[10px] bg-[#F6FAFD] border border-[#DCE7EE] flex items-start gap-3">
              <FileText
                size={18}
                className="text-[#526B7C] shrink-0 mt-0.5"
              />
              <div className="space-y-1 text-[13px]">
                <div className="font-bold text-[#0F2335]">
                  Văn bản quyết định hành chính
                </div>
                <p className="text-[#4A6275]">
                  Chưa có văn bản quyết định được cập nhật.
                </p>
                <p className="text-[11.5px] text-[#607483]">
                  Hệ thống chỉ hiển thị siêu dữ liệu quyết định chính thức khi được cấu hình từ hồ sơ lưu trữ của Ban Thư ký Hội Sinh viên Thành phố.
                </p>
              </div>
            </div>
          </section>

          {/* Incomplete Result Set Blocking List if applicable (Section 66) */}
          {publicationReadiness.undecidedCount > 0 && (
            <section className="bg-white rounded-[12px] border border-[#FADDB6] overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 bg-[#FEF6EB] border-b border-[#FADDB6] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[#92400E] font-extrabold text-[14px]">
                  <AlertCircle size={16} className="text-[#D97706]" />
                  <span>
                    Còn {publicationReadiness.undecidedCount} hồ sơ chưa có kết luận xét chọn.
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelectRoute('committee')}
                >
                  Mở danh sách Hội đồng
                </Button>
              </div>
              <div className="divide-y divide-[#EEF4F8]">
                {publicationReadiness.undecidedApplications.map((app) => (
                  <div
                    key={app.applicationId}
                    className="px-5 py-3 flex items-center justify-between gap-3 text-[13px]"
                  >
                    <div>
                      <strong className="font-bold text-[#0F2335]">
                        {app.student.fullName}
                      </strong>{' '}
                      <span className="text-[#526B7C] font-mono">
                        ({app.student.studentCode})
                      </span>
                      <div className="text-[12px] text-[#607483]">
                        {app.institution.officialName}
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        onOpenApplicationWorkspace(app.applicationId)
                      }
                    >
                      Xem hồ sơ
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Finalization & Authorized Publication Workflow */}
        <div className="space-y-4">
          <section className="bg-white rounded-[12px] border border-[#D4E2EC] p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <Send size={16} className="text-[#0B64A0]" />
              <h2 className="text-[15px] font-extrabold text-[#0F2335]">
                Quy trình Hoàn tất &amp; Công bố
              </h2>
            </div>
            <div className="space-y-2.5 text-[12.5px]">
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-[8px] bg-[#F8FBFD] border border-[#E2EDF5]">
                <span className="text-[#4A6275]">1. Kết luận xét chọn:</span>
                <span
                  className={`font-bold ${
                    publicationReadiness.isAllDecided
                      ? 'text-[#136F3A]'
                      : 'text-[#B45309]'
                  }`}
                >
                  {publicationReadiness.decidedCount}/
                  {publicationReadiness.totalRecords} hồ sơ
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-[8px] bg-[#F8FBFD] border border-[#E2EDF5]">
                <span className="text-[#4A6275]">2. Hoàn tất quyết định:</span>
                <span
                  className={`font-bold ${
                    publicationReadiness.isResultSetFinalized
                      ? 'text-[#136F3A]'
                      : 'text-[#B45309]'
                  }`}
                >
                  {publicationReadiness.isResultSetFinalized
                    ? 'Đã hoàn tất'
                    : 'Chưa hoàn tất'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-[8px] bg-[#F8FBFD] border border-[#E2EDF5]">
                <span className="text-[#4A6275]">3. Công bố kết quả:</span>
                <span
                  className={`font-bold ${
                    publicationReadiness.isAlreadyPublished
                      ? 'text-[#136F3A]'
                      : 'text-[#334E68]'
                  }`}
                >
                  {publicationReadiness.isAlreadyPublished
                    ? 'Đã công bố'
                    : 'Chưa công bố'}
                </span>
              </div>
            </div>

            {publicationReadiness.blockingMessage &&
              !publicationReadiness.isAlreadyPublished && (
                <div className="p-3 rounded-[9px] bg-[#FEF6EB] border border-[#FADDB6] text-[12px] text-[#92400E] space-y-1">
                  <div className="font-bold">Điều kiện trước khi công bố:</div>
                  <p>{publicationReadiness.blockingMessage}</p>
                </div>
              )}

            {!publicationReadiness.isAlreadyPublished && (
              <div className="space-y-2.5 pt-1">
                {!publicationReadiness.isResultSetFinalized && (
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={!finalizationCheck.allowed}
                    onClick={onFinalizeResultSet}
                    className="w-full justify-center"
                  >
                    Hoàn tất quyết định danh sách
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="md"
                  disabled={!publicationReadiness.canPublish}
                  onClick={onOpenPublicationDialog}
                  className="w-full justify-center"
                >
                  Công bố kết quả
                </Button>
              </div>
            )}

            {publicationReadiness.isAlreadyPublished && (
              <div className="p-3 rounded-[9px] bg-[#EAFBF1] border border-[#B6E6C9] text-[12.5px] text-[#136F3A] flex items-start gap-2">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <div>
                  <strong>Đã công bố kết quả chính thức.</strong> Sinh viên Nguyễn Minh Anh và các hồ sơ trong đợt xét đã nhận được kết quả trên hệ thống.
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
