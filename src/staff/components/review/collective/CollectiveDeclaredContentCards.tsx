import React from 'react';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Search,
  Award,
} from 'lucide-react';
import {
  CollectiveApplication,
  CollectiveRequirementId,
} from '../../../collectiveTypes';

interface CollectiveDeclaredContentCardsProps {
  app: CollectiveApplication;
  activeReqId: CollectiveRequirementId;
  memberSearchQuery: string;
  onChangeMemberSearchQuery: (val: string) => void;
  tt02ParticipationRate: number;
  tt02MeetsThreshold: boolean;
  tt03TotalMembers: number;
  tt03MinMembersRequired: number;
  tt03RecognitionRate: number;
  tt03MeetsThreshold: boolean;
}

export const CollectiveDeclaredContentCards: React.FC<CollectiveDeclaredContentCardsProps> = ({
  app,
  activeReqId,
  memberSearchQuery,
  onChangeMemberSearchQuery,
  tt02ParticipationRate,
  tt02MeetsThreshold,
  tt03TotalMembers,
  tt03MinMembersRequired,
  tt03RecognitionRate,
  tt03MeetsThreshold,
}) => {
  const { tt01, tt02, tt03, tt04 } = app;

  return (
    <>
      {/* TT01 Declared Content (Section 21, 22) */}
      {activeReqId === 'TT01' && (
        <div className="p-4 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[12px] space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-[#172A3A] text-[13.5px]">
              Thông tin kê khai từ Tập thể (Chỉ đọc):
            </div>
            <span className="text-[11px] bg-[#EAF6FC] text-[#0D78AE] font-bold px-2 py-0.5 rounded">
              Điều kiện tiên quyết
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12.5px] bg-white p-3.5 rounded-[8px] border border-[#E2EDF5]">
            <div>
              <span className="text-[#607483]">Công nhận cấp Trường: </span>
              <strong className={tt01.isRecognizedSchoolLevel ? 'text-[#16A34A]' : 'text-[#DC2626]'}>
                {tt01.isRecognizedSchoolLevel ? 'Đã công nhận' : 'Chưa công nhận'}
              </strong>
            </div>
            <div>
              <span className="text-[#607483]">Năm học công nhận: </span>
              <strong>{tt01.recognizedAcademicYear}</strong>
            </div>
            <div>
              <span className="text-[#607483]">Đơn vị ra quyết định: </span>
              <strong>{tt01.issuingUnitName || '—'}</strong>
            </div>
            <div>
              <span className="text-[#607483]">Số QĐ / Ngày ký: </span>
              <strong>{tt01.decisionNumber || '—'} ({tt01.decisionDate || '—'})</strong>
            </div>
            {tt01.referenceNotes && (
              <div className="col-span-2 pt-2 border-t border-[#EEF4F8] text-[#526B7C]">
                <span className="text-[#607483]">Ghi chú kê khai: </span>
                {tt01.referenceNotes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TT02 Declared Content & Numbers (Section 23, 24) */}
      {activeReqId === 'TT02' && (
        <div className="p-4 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[12px] space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-bold text-[#172A3A] text-[13.5px]">
              Số liệu tham gia phong trào (Kê khai từ Tập thể):
            </div>
            <span className="text-[11px] font-bold text-[#0D78AE] bg-[#EAF6FC] px-2 py-0.5 rounded">
              Yêu cầu 100%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white border border-[#DCE7EE] rounded-[8px]">
              <div className="text-[11.5px] text-[#607483]">Tổng số thành viên (Mẫu số)</div>
              <div className="text-[20px] font-black text-[#172A3A] mt-1 tabular-nums">{tt02.totalMembers}</div>
            </div>
            <div className="p-3 bg-white border border-[#DCE7EE] rounded-[8px]">
              <div className="text-[11.5px] text-[#607483]">Số SV tham gia phong trào</div>
              <div className="text-[20px] font-black text-[#172A3A] mt-1 tabular-nums">{tt02.participatingCount}</div>
            </div>
            <div className="p-3 bg-white border border-[#DCE7EE] rounded-[8px]">
              <div className="text-[11.5px] text-[#607483]">Tỷ lệ kê khai (Ngưỡng 100%)</div>
              <div
                className={`text-[20px] font-black mt-1 tabular-nums ${
                  tt02MeetsThreshold ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {tt02ParticipationRate.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Threshold warning / pass message */}
          {tt02MeetsThreshold ? (
            <div className="p-3 bg-[#EDF9F1] border border-[#C6EED5] rounded-[8px] text-[12px] text-[#136F3A] flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#16A34A] shrink-0" />
              <span>Số liệu do tập thể kê khai đạt tỷ lệ tham gia 100% theo quy định ({tt02.participatingCount}/{tt02.totalMembers}).</span>
            </div>
          ) : (
            <div className="p-3 bg-[#FEF6EB] border border-[#FADDB6] rounded-[8px] text-[12px] text-[#8C3A19] flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#D97706] shrink-0" />
              <span>
                Cảnh báo: Tỷ lệ kê khai ({tt02ParticipationRate.toFixed(1)}%) chưa đạt ngưỡng 100% bắt buộc ({tt02.participatingCount}/{tt02.totalMembers} sinh viên).
              </span>
            </div>
          )}

          {/* Structured Member Roster Preview */}
          {tt02.structuredMembers && tt02.structuredMembers.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#EEF4F8]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="font-bold text-[#172A3A] text-[12.5px] flex items-center gap-1.5">
                  <FileSpreadsheet size={15} className="text-[#0D78AE]" />
                  <span>Danh sách thành viên chi hội ({tt02.structuredMembers.length} sinh viên)</span>
                </div>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#728391]" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => onChangeMemberSearchQuery(e.target.value)}
                    placeholder="Tìm MSSV, họ tên..."
                    className="h-7 pl-7 pr-2.5 text-[11.5px] bg-white border border-[#DCE7EE] rounded-[6px] outline-none"
                  />
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border border-[#DCE7EE] rounded-[8px] bg-white">
                <table className="w-full text-[12px] text-left">
                  <thead className="bg-[#F8FBFD] border-b border-[#EEF4F8] text-[#607483] sticky top-0">
                    <tr>
                      <th className="py-1.5 px-3 font-semibold">STT</th>
                      <th className="py-1.5 px-3 font-semibold">MSSV</th>
                      <th className="py-1.5 px-3 font-semibold">Họ và tên</th>
                      <th className="py-1.5 px-3 font-semibold">Chi hội / Lớp</th>
                      <th className="py-1.5 px-3 font-semibold text-center">Tham gia phong trào</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {tt02.structuredMembers
                      .filter((m) =>
                        memberSearchQuery
                          ? m.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                            m.studentCode.includes(memberSearchQuery)
                          : true
                      )
                      .slice(0, 15)
                      .map((m, idx) => (
                        <tr key={m.id} className="hover:bg-[#F8FCFF]">
                          <td className="py-1.5 px-3 text-[#728391] tabular-nums">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-mono text-[#0D78AE] font-semibold">{m.studentCode}</td>
                          <td className="py-1.5 px-3 font-medium text-[#172A3A]">{m.fullName}</td>
                          <td className="py-1.5 px-3 text-[#607483]">{m.className || app.facultyName}</td>
                          <td className="py-1.5 px-3 text-center">
                            <span className="text-[10.5px] font-bold text-[#16A34A] bg-[#EDF9F1] px-1.5 py-0.5 rounded">
                              Có tham gia
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TT03 Declared Content & Numbers (Section 25, 26, 27) */}
      {activeReqId === 'TT03' && (
        <div className="p-4 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[12px] space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-bold text-[#172A3A] text-[13.5px]">
              Thành viên đạt Sinh viên 5 tốt cấp Trường (Kê khai):
            </div>
            <span className="text-[11px] font-bold text-[#0D78AE] bg-[#EAF6FC] px-2 py-0.5 rounded">
              Ngưỡng tối thiểu &ge; 20%
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white border border-[#DCE7EE] rounded-[8px]">
              <div className="text-[11px] text-[#607483]">Tổng thành viên (TT02)</div>
              <div className="text-[18px] font-black text-[#172A3A] mt-1 tabular-nums">{tt03TotalMembers}</div>
            </div>
            <div className="p-3 bg-white border border-[#DCE7EE] rounded-[8px]">
              <div className="text-[11px] text-[#607483]">Số đạt SV5T Trường</div>
              <div className="text-[18px] font-black text-[#172A3A] mt-1 tabular-nums">{tt03.recognizedCount}</div>
            </div>
            <div className="p-3 bg-white border border-[#DCE7EE] rounded-[8px]">
              <div className="text-[11px] text-[#607483]">Tối thiểu cần đạt (20%)</div>
              <div className="text-[18px] font-black text-[#334E68] mt-1 tabular-nums">{tt03MinMembersRequired} SV</div>
            </div>
            <div className="p-3 bg-white border border-[#DCE7EE] rounded-[8px]">
              <div className="text-[11px] text-[#607483]">Tỷ lệ kê khai thực tế</div>
              <div
                className={`text-[18px] font-black mt-1 tabular-nums ${
                  tt03MeetsThreshold ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {tt03RecognitionRate.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Exact Threshold Check */}
          {tt03MeetsThreshold ? (
            <div className="p-3 bg-[#EDF9F1] border border-[#C6EED5] rounded-[8px] text-[12px] text-[#136F3A] flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#16A34A] shrink-0" />
              <span>
                Số liệu kê khai đạt ngưỡng tối thiểu 20%: {tt03.recognizedCount}/{tt03TotalMembers} thành viên ({tt03RecognitionRate.toFixed(2)}% &ge; 20%).
              </span>
            </div>
          ) : (
            <div className="p-3 bg-[#FEF6EB] border border-[#FADDB6] rounded-[8px] text-[12px] text-[#8C3A19] flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#D97706] shrink-0" />
              <span>
                Cảnh báo ngưỡng: Số liệu {tt03.recognizedCount}/{tt03TotalMembers} thành viên ({tt03RecognitionRate.toFixed(2)}%) chưa đạt mức tối thiểu 20% (yêu cầu ít nhất {tt03MinMembersRequired} sinh viên).
              </span>
            </div>
          )}

          {/* Recognized Members List Preview */}
          {tt03.structuredRecognizedMembers && tt03.structuredRecognizedMembers.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#EEF4F8]">
              <div className="font-bold text-[#172A3A] text-[12.5px] flex items-center gap-1.5">
                <Award size={15} className="text-[#0D78AE]" />
                <span>Danh sách sinh viên đạt SV5T cấp Trường ({tt03.structuredRecognizedMembers.length} thành viên)</span>
              </div>

              <div className="max-h-40 overflow-y-auto border border-[#DCE7EE] rounded-[8px] bg-white">
                <table className="w-full text-[12px] text-left">
                  <thead className="bg-[#F8FBFD] border-b border-[#EEF4F8] text-[#607483] sticky top-0">
                    <tr>
                      <th className="py-1.5 px-3 font-semibold">STT</th>
                      <th className="py-1.5 px-3 font-semibold">MSSV</th>
                      <th className="py-1.5 px-3 font-semibold">Họ và tên</th>
                      <th className="py-1.5 px-3 font-semibold">Quyết định công nhận</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {tt03.structuredRecognizedMembers.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-[#F8FCFF]">
                        <td className="py-1.5 px-3 text-[#728391] tabular-nums">{idx + 1}</td>
                        <td className="py-1.5 px-3 font-mono text-[#0D78AE] font-semibold">{m.studentCode}</td>
                        <td className="py-1.5 px-3 font-medium text-[#172A3A]">{m.fullName}</td>
                        <td className="py-1.5 px-3 text-[#475569]">
                          {m.recognitionDecisionNumber || 'QĐ HSV Trường'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TT04 Declared Content (Section 29, 30) */}
      {activeReqId === 'TT04' && (
        <div className="p-4 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[12px] space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-[#172A3A] text-[13.5px]">
              Xác nhận chấp hành pháp luật & các quy định (Chỉ đọc):
            </div>
            <span className="text-[11px] font-bold text-[#0D78AE] bg-[#EAF6FC] px-2 py-0.5 rounded">
              Điều kiện bắt buộc
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12.5px] bg-white p-3.5 rounded-[8px] border border-[#E2EDF5]">
            <div>
              <span className="text-[#607483]">Tình trạng xác nhận: </span>
              <strong className={tt04.noViolationsConfirmed ? 'text-[#16A34A]' : 'text-[#DC2626]'}>
                {tt04.noViolationsConfirmed ? '100% không vi phạm' : 'Chưa xác nhận'}
              </strong>
            </div>
            <div>
              <span className="text-[#607483]">Đơn vị xác nhận: </span>
              <strong>{tt04.confirmingUnitName || '—'}</strong>
            </div>
            <div>
              <span className="text-[#607483]">Số văn bản xác nhận: </span>
              <strong>{tt04.confirmationDocNumber || '—'}</strong>
            </div>
            <div>
              <span className="text-[#607483]">Ngày xác nhận / Niên khóa: </span>
              <strong>{tt04.confirmationDate || '—'} (Năm học {tt04.scopeYear})</strong>
            </div>
            {tt04.notes && (
              <div className="col-span-2 pt-2 border-t border-[#EEF4F8] text-[#526B7C]">
                <span className="text-[#607483]">Ghi chú: </span>
                {tt04.notes}
              </div>
            )}
          </div>

          <div className="p-3 bg-[#EAF6FC] border border-[#CFE3F0] rounded-[8px] text-[12px] text-[#0B64A0] flex items-start gap-2">
            <Info size={16} className="shrink-0 mt-0.5" />
            <span>
              <strong>Lưu ý nghiệp vụ:</strong> Việc không có hồ sơ kỷ luật không đương nhiên đồng nghĩa với việc không vi phạm. Cán bộ đối chiếu với văn bản xác nhận của Ban Chủ nhiệm Khoa hoặc Phòng Công tác sinh viên.
            </span>
          </div>
        </div>
      )}
    </>
  );
};
