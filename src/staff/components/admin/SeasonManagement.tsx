/**
 * 5TOT Đà Nẵng — Season Management (Quản lý mùa xét chọn & Lộ trình T01–T07)
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Implements ADMIN-REVAMP Sections 6 & 7 + ADMIN-REVAMP.1 Sections 3–7:
 * - Central-style 5TOT Selection Timeline (T01–T07) including parallel Collective track (T04)
 * - Guided Create Season with "Sao chép cấu hình từ mùa trước" (copyFromSeasonId)
 * - 8-Gate Season Readiness Validation Checklist ("Kiểm tra cấu hình")
 * - Controlled Season Activation ("Kích hoạt mùa xét") preserving at most 1 active season
 * - Close / Archive lifecycle and protection against deleting seasons with applications
 */

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  Lock,
  X,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Play,
  Archive,
  Trash2,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  buildCentralTimelineMilestones,
  formatAcademicYearLabel,
  formatShortAcademicYear,
} from '@5tot/contracts';
import {
  Season,
  SeasonReadinessReport,
  SeasonStatus,
} from '../../adminTypes';
import { StaffRouteId } from '../../types';
import { Button } from '../../../components/buttons/Button';
import { validateSeasonConfiguration } from '../../adminSelectors';

export interface SeasonManagementProps {
  seasons: Season[];
  onCreateSeason: (
    season: Omit<
      Season,
      | 'id'
      | 'participatingInstitutionCount'
      | 'applicationCount'
      | 'createdAt'
      | 'updatedAt'
    > & { copyFromSeasonId?: string }
  ) => void;
  onUpdateSeason: (
    id: string,
    updates: Partial<Season>,
    reason?: string
  ) => void;
  onActivateSeason: (
    id: string,
    reason?: string
  ) => { success: boolean; readiness?: SeasonReadinessReport } | void;
  onCheckSeasonReadiness?: (seasonId: string) => SeasonReadinessReport | null;
  onCloseOrArchiveSeason?: (
    id: string,
    targetStatus: 'closed' | 'archived',
    reason?: string
  ) => void;
  onDeleteDraftSeason?: (id: string) => { success: boolean; error?: string };
  onSelectManageDeadlines: () => void;
  onSelectRoute?: (routeId: StaffRouteId) => void;
}

export const SeasonManagement: React.FC<SeasonManagementProps> = ({
  seasons,
  onCreateSeason,
  onUpdateSeason,
  onActivateSeason,
  onCheckSeasonReadiness,
  onCloseOrArchiveSeason,
  onDeleteDraftSeason,
  onSelectManageDeadlines,
  onSelectRoute,
}) => {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    seasons.find((s) => s.isCurrentActive)?.id || seasons[0]?.id || ''
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createErrors, setCreateErrors] = useState<string[]>([]);
  const [readinessReport, setReadinessReport] =
    useState<SeasonReadinessReport | null>(null);
  const [isEditingTimeline, setIsEditingTimeline] = useState(false);

  const activeOrLatestSeason =
    seasons.find((s) => s.isCurrentActive) || seasons[0];

  const [createForm, setCreateForm] = useState({
    schoolYear: '2026–2027',
    title:
      'Đợt xét chọn Danh hiệu "Sinh viên 5 Tốt" cấp Thành phố Năm học 2026–2027',
    copyFromSeasonId: activeOrLatestSeason?.id || 'season-2025-2026',
    submissionStart: '01/10/2026 08:00 (GMT+7)',
    submissionDeadline: '20/10/2026 17:00 (GMT+7)',
    schoolReviewStart: '05/10/2026 08:00 (GMT+7)',
    schoolReviewDeadline: '23/10/2026 17:00 (GMT+7)',
    schoolForwardingDeadline: '25/10/2026 17:00 (GMT+7)',
    collectiveSubmissionStart: '01/10/2026 08:00 (GMT+7)',
    collectiveSubmissionDeadline: '25/10/2026 17:00 (GMT+7)',
    reviewStart: '26/10/2026 08:00 (GMT+7)',
    reviewDeadline: '05/11/2026 17:00 (GMT+7)',
    supplementStart: '26/10/2026 08:00 (GMT+7)',
    supplementDeadline: '02/11/2026 17:00 (GMT+7)',
    committeeDate: '08/11/2026 08:30 (GMT+7)',
    publicationTargetDate: '12/11/2026 09:00 (GMT+7)',
    criteriaVersionId: 'crit-ver-2026-2027-draft',
    criteriaVersionLabel:
      'v1.0 (2026–2027) — Bản dự thảo sao chép từ mùa 2025–2026',
  });

  const selectedSeason =
    seasons.find((s) => s.id === selectedSeasonId) || seasons[0];

  const [timelineDraft, setTimelineDraft] = useState({
    submissionStart: selectedSeason?.submissionStart || '',
    submissionDeadline: selectedSeason?.submissionDeadline || '',
    schoolForwardingDeadline:
      selectedSeason?.schoolForwardingDeadline ||
      selectedSeason?.reviewStart ||
      '',
    collectiveSubmissionStart:
      selectedSeason?.collectiveSubmissionStart ||
      selectedSeason?.submissionStart ||
      '',
    collectiveSubmissionDeadline:
      selectedSeason?.collectiveSubmissionDeadline ||
      selectedSeason?.schoolForwardingDeadline ||
      '',
    reviewDeadline: selectedSeason?.reviewDeadline || '',
    supplementDeadline: selectedSeason?.supplementDeadline || '',
    committeeDate: selectedSeason?.committeeDate || '',
    publicationTargetDate: selectedSeason?.publicationTargetDate || '',
  });

  const getStatusBadge = (status: SeasonStatus) => {
    switch (status) {
      case 'accepting':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[11.5px] font-bold bg-[#EAFBF1] text-[#136F3A] border border-[#B6E6C9]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
            <span>Đang tiếp nhận hồ sơ</span>
          </span>
        );
      case 'reviewing':
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[11.5px] font-bold bg-[#EBF6FC] text-[#0D78AE] border border-[#CCE7F6]">
            <span>Đang thẩm định hồ sơ</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[11.5px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            <span>Bản nháp (Chuẩn bị)</span>
          </span>
        );
      case 'archived':
      case 'closed':
      case 'concluded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[11.5px] font-bold bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
            <span>
              {status === 'archived' ? 'Đã lưu trữ lịch sử' : 'Đã kết thúc'}
            </span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[11.5px] font-bold bg-[#FEF6EB] text-[#B45309] border border-[#FADDB6]">
            <span>Sắp mở</span>
          </span>
        );
    }
  };

  const selectedMilestones = selectedSeason
    ? selectedSeason.centralMilestones &&
      selectedSeason.centralMilestones.length > 0
      ? selectedSeason.centralMilestones
      : buildCentralTimelineMilestones({
          academicYear: formatShortAcademicYear(selectedSeason.schoolYear),
          individualSubmissionOpenAt: '2025-10-01T01:00:00.000Z',
          individualSubmissionCloseAt: '2025-10-20T10:00:00.000Z',
          schoolReviewOpenAt: '2025-10-05T01:00:00.000Z',
          schoolReviewCloseAt: '2025-10-23T10:00:00.000Z',
          schoolForwardingCloseAt: '2025-10-25T10:00:00.000Z',
          collectiveSubmissionOpenAt: '2025-10-01T01:00:00.000Z',
          collectiveSubmissionCloseAt: '2025-10-25T10:00:00.000Z',
          cityReviewOpenAt: '2025-10-26T01:00:00.000Z',
          cityReviewCloseAt: '2025-11-05T10:00:00.000Z',
          supplementDeadlineAt: '2025-11-02T10:00:00.000Z',
          committeeSessionAt: '2025-11-08T01:30:00.000Z',
          resultPublicationAt: '2025-11-12T02:00:00.000Z',
        })
    : [];

  return (
    <div className="p-6 max-w-[1360px] w-full mx-auto space-y-5">
      {/* 1. Header */}
      <div className="border-b border-[#DCE7EE] pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[12px] font-semibold text-[#526B7C]">
            Chu kỳ xét chọn · Cấp Thành phố Đà Nẵng
          </div>
          <h1 className="text-[20px] font-extrabold text-[#0F2335] mt-0.5 flex items-center gap-2">
            <Calendar size={20} className="text-[#0D78AE]" />
            <span>Quản lý mùa xét chọn</span>
          </h1>
          <p className="text-[12.5px] text-[#526B7C] mt-1">
            Khởi tạo mùa xét mới, sao chép cấu hình từ mùa trước, kiểm tra 8
            điều kiện sẵn sàng và vận hành lộ trình thời gian chuẩn Trung ương
            (T01–T07).
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setCreateErrors([]);
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-1.5"
        >
          <Plus size={15} />
          <span>Tạo mùa xét mới</span>
        </Button>
      </div>

      {/* 2. Season Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {seasons.map((season) => {
          const isSelected = selectedSeason?.id === season.id;
          const shortYear = formatShortAcademicYear(season.schoolYear);
          return (
            <button
              key={season.id}
              type="button"
              onClick={() => {
                setSelectedSeasonId(season.id);
                setReadinessReport(null);
                setIsEditingTimeline(false);
              }}
              className={`text-left p-4 rounded-[12px] border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-white border-[#0D78AE] shadow-md ring-1 ring-[#0D78AE]'
                  : 'bg-white border-[#D4E2EC] hover:border-[#0D78AE]/50 hover:bg-[#F8FBFD]'
              }`}
            >
              {season.isCurrentActive && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10.5px] font-bold bg-[#EAFBF1] text-[#136F3A] border border-[#B6E6C9]">
                  Đang hoạt động
                </span>
              )}

              <div className="text-[12px] text-[#526B7C] font-semibold">
                {formatAcademicYearLabel(shortYear)}
              </div>
              <div className="text-[17px] font-extrabold text-[#0F2335] mt-0.5">
                {shortYear}
              </div>

              <div className="mt-2.5">{getStatusBadge(season.status)}</div>

              <div className="mt-3.5 pt-3 border-t border-[#EEF4F8] space-y-1 text-[11.5px] text-[#526B7C]">
                <div className="flex items-center justify-between">
                  <span>Hạn nộp Cá nhân (T01):</span>
                  <span className="font-semibold text-[#172A3A] truncate max-w-[170px]">
                    {season.submissionDeadline}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hạn Trường gửi TP (T03):</span>
                  <span className="font-semibold text-[#172A3A] truncate max-w-[170px]">
                    {season.schoolForwardingDeadline || season.reviewStart}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hạn nộp Tập thể (T04):</span>
                  <span className="font-semibold text-[#172A3A] truncate max-w-[170px]">
                    {season.collectiveSubmissionDeadline ||
                      season.submissionDeadline}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Hồ sơ phát sinh:</span>
                  <span className="font-extrabold text-[#0F2335] tabular-nums">
                    {season.applicationCount} Cá nhân ·{' '}
                    {season.collectiveApplicationCount ?? 0} Tập thể
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Detailed Season Configuration View */}
      {selectedSeason && (
        <div className="bg-white rounded-[12px] border border-[#D4E2EC] p-6 shadow-2xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EEF4F8] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[#0D78AE] uppercase tracking-[0.04em]">
                  Chi tiết cấu hình mùa xét ·{' '}
                  {formatAcademicYearLabel(selectedSeason.schoolYear)}
                </span>
                {selectedSeason.isCurrentActive && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EAFBF1] text-[#136F3A]">
                    Mùa xét chính thức hiện hành
                  </span>
                )}
              </div>
              <h2 className="text-[18px] font-extrabold text-[#0F2335] mt-1">
                {selectedSeason.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onCheckSeasonReadiness && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const report = onCheckSeasonReadiness(selectedSeason.id);
                    setReadinessReport(report);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Kiểm tra cấu hình</span>
                </Button>
              )}

              {!selectedSeason.isCurrentActive &&
                selectedSeason.status !== 'archived' &&
                selectedSeason.status !== 'closed' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const res = onActivateSeason(
                        selectedSeason.id,
                        `Kích hoạt chính thức mùa xét ${formatAcademicYearLabel(selectedSeason.schoolYear)}`
                      );
                      if (res && 'readiness' in res && res.readiness) {
                        setReadinessReport(res.readiness);
                      }
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Play size={14} />
                    <span>Kích hoạt mùa xét</span>
                  </Button>
                )}

              {selectedSeason.isCurrentActive && onCloseOrArchiveSeason && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    onCloseOrArchiveSeason(
                      selectedSeason.id,
                      'closed',
                      'Hoàn tất đợt xét chọn và khóa tiếp nhận mùa xét'
                    )
                  }
                  className="flex items-center gap-1.5"
                >
                  <Archive size={14} />
                  <span>Kết thúc mùa xét</span>
                </Button>
              )}

              {!selectedSeason.isCurrentActive &&
                selectedSeason.status === 'draft' &&
                selectedSeason.applicationCount === 0 &&
                onDeleteDraftSeason && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onDeleteDraftSeason(selectedSeason.id)}
                    className="flex items-center gap-1.5 text-[#B91C1C]"
                  >
                    <Trash2 size={14} />
                    <span>Xóa bản nháp</span>
                  </Button>
                )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setTimelineDraft({
                    submissionStart: selectedSeason.submissionStart,
                    submissionDeadline: selectedSeason.submissionDeadline,
                    schoolForwardingDeadline:
                      selectedSeason.schoolForwardingDeadline ||
                      selectedSeason.reviewStart,
                    collectiveSubmissionStart:
                      selectedSeason.collectiveSubmissionStart ||
                      selectedSeason.submissionStart,
                    collectiveSubmissionDeadline:
                      selectedSeason.collectiveSubmissionDeadline ||
                      selectedSeason.submissionDeadline,
                    reviewDeadline: selectedSeason.reviewDeadline,
                    supplementDeadline: selectedSeason.supplementDeadline,
                    committeeDate: selectedSeason.committeeDate,
                    publicationTargetDate: selectedSeason.publicationTargetDate,
                  });
                  setIsEditingTimeline((v) => !v);
                }}
                className="flex items-center gap-1.5"
              >
                <Clock size={14} />
                <span>
                  {isEditingTimeline
                    ? 'Đóng chỉnh sửa mốc'
                    : 'Điều chỉnh lộ trình T01–T07'}
                </span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={onSelectManageDeadlines}
                className="flex items-center gap-1.5"
              >
                <Clock size={14} />
                <span>Bảng mốc thời gian</span>
              </Button>
            </div>
          </div>

          {/* 8-Gate Readiness Validation Panel */}
          {readinessReport && (
            <div
              data-testid="season-readiness-checklist"
              className={`p-4 rounded-[10px] border space-y-3 ${
                readinessReport.readyToActivate
                  ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                  : 'bg-[#FFFBEB] border-[#FDE68A]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {readinessReport.readyToActivate ? (
                    <CheckCircle2 size={18} className="text-[#16A34A]" />
                  ) : (
                    <AlertTriangle size={18} className="text-[#D97706]" />
                  )}
                  <h3 className="text-[14px] font-extrabold text-[#0F2335]">
                    Danh mục kiểm tra sẵn sàng trước khi kích hoạt mùa xét (8
                    điều kiện)
                  </h3>
                </div>
                <span className="text-[12px] font-bold text-[#172A3A]">
                  {readinessReport.summaryMessageVi}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(readinessReport.items || readinessReport.checks || []).map((item) => (
                  <div
                    key={item.key}
                    className="p-3 rounded-[8px] bg-white border border-[#E2EDF5] flex items-start justify-between gap-2 text-[12px]"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#0F2335] flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.passed ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
                          }`}
                        />
                        <span>{item.labelVi}</span>
                      </div>
                      <div className="text-[#526B7C]">{item.detailVi}</div>
                    </div>
                    {!item.passed && onSelectRoute && (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectRoute(item.actionRoute as StaffRouteId)
                        }
                        className="px-2.5 py-1 rounded text-[11px] font-bold text-[#0D78AE] bg-[#EBF6FC] hover:bg-[#DCEEFA] shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{item.actionLabelVi}</span>
                        <ArrowRight size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inline Timeline Editor */}
          {isEditingTimeline && (
            <div className="p-4 rounded-[10px] bg-[#F8FBFD] border border-[#CCE7F6] space-y-3">
              <div className="text-[13px] font-extrabold text-[#0F2335]">
                Chỉnh sửa trực tiếp mốc thời gian mùa xét{' '}
                {formatAcademicYearLabel(selectedSeason.schoolYear)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[12px]">
                <div>
                  <label className="font-bold text-[#172A3A] block mb-1">
                    Mở nhận Cá nhân (T01)
                  </label>
                  <input
                    type="text"
                    value={timelineDraft.submissionStart}
                    onChange={(e) =>
                      setTimelineDraft({
                        ...timelineDraft,
                        submissionStart: e.target.value,
                      })
                    }
                    className="w-full h-[36px] px-2.5 bg-white border border-[#DCE7EE] rounded-[6px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#172A3A] block mb-1">
                    Hạn nộp Cá nhân (T01)
                  </label>
                  <input
                    type="text"
                    value={timelineDraft.submissionDeadline}
                    onChange={(e) =>
                      setTimelineDraft({
                        ...timelineDraft,
                        submissionDeadline: e.target.value,
                      })
                    }
                    className="w-full h-[36px] px-2.5 bg-white border border-[#DCE7EE] rounded-[6px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#172A3A] block mb-1">
                    Hạn Trường gửi TP (T03)
                  </label>
                  <input
                    type="text"
                    value={timelineDraft.schoolForwardingDeadline}
                    onChange={(e) =>
                      setTimelineDraft({
                        ...timelineDraft,
                        schoolForwardingDeadline: e.target.value,
                      })
                    }
                    className="w-full h-[36px] px-2.5 bg-white border border-[#DCE7EE] rounded-[6px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#172A3A] block mb-1">
                    Hạn nộp Tập thể (T04)
                  </label>
                  <input
                    type="text"
                    value={timelineDraft.collectiveSubmissionDeadline}
                    onChange={(e) =>
                      setTimelineDraft({
                        ...timelineDraft,
                        collectiveSubmissionDeadline: e.target.value,
                      })
                    }
                    className="w-full h-[36px] px-2.5 bg-white border border-[#DCE7EE] rounded-[6px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingTimeline(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onUpdateSeason(
                      selectedSeason.id,
                      timelineDraft,
                      'Cập nhật lộ trình thời gian T01–T07 từ màn hình Quản lý mùa xét'
                    );
                    setIsEditingTimeline(false);
                  }}
                >
                  Lưu mốc thời gian
                </Button>
              </div>
            </div>
          )}

          {/* Core Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-[13px]">
            <div className="p-3.5 rounded-[9px] bg-[#F8FBFD] border border-[#E2EDF5]">
              <span className="text-[#526B7C] text-[11.5px] block font-semibold">
                Năm học áp dụng
              </span>
              <div className="font-extrabold text-[#0F2335] text-[15px] mt-0.5">
                {formatShortAcademicYear(selectedSeason.schoolYear)}
              </div>
              {selectedSeason.applicationCount > 0 && (
                <div className="text-[11px] text-[#526B7C] flex items-center gap-1 mt-1">
                  <Lock size={11} className="text-[#94A3B8]" />
                  <span>
                    Bảo vệ lịch sử (Có {selectedSeason.applicationCount} hồ sơ)
                  </span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-[9px] bg-[#F8FBFD] border border-[#E2EDF5]">
              <span className="text-[#526B7C] text-[11.5px] block font-semibold">
                Khung tiêu chuẩn liên kết
              </span>
              <div className="font-bold text-[#0D78AE] mt-0.5 truncate">
                {selectedSeason.criteriaVersionLabel ||
                  selectedSeason.criteriaVersionName}
              </div>
              <div className="text-[11px] text-[#526B7C] mt-1">
                05 Tiêu chuẩn Cá nhân &amp; 04 Tiêu chuẩn Tập thể (TT01–TT04)
              </div>
            </div>

            <div className="p-3.5 rounded-[9px] bg-[#F8FBFD] border border-[#E2EDF5]">
              <span className="text-[#526B7C] text-[11.5px] block font-semibold">
                Hạn nộp Cá nhân (T01) &amp; Tập thể (T04)
              </span>
              <div className="font-bold text-[#0F2335] mt-0.5 text-[12px]">
                CN: {selectedSeason.submissionDeadline}
              </div>
              <div className="text-[11px] text-[#0D78AE] font-semibold mt-1">
                TT: {selectedSeason.collectiveSubmissionDeadline || selectedSeason.submissionDeadline}
              </div>
            </div>

            <div className="p-3.5 rounded-[9px] bg-[#F8FBFD] border border-[#E2EDF5]">
              <span className="text-[#526B7C] text-[11.5px] block font-semibold">
                Quy mô tiếp nhận
              </span>
              <div className="font-bold text-[#0F2335] mt-0.5">
                {selectedSeason.participatingInstitutionCount} đơn vị đào tạo
              </div>
              <div className="text-[11px] text-[#526B7C] mt-1">
                {selectedSeason.applicationCount} hồ sơ Cá nhân ·{' '}
                {selectedSeason.collectiveApplicationCount ?? 0} Tập thể
              </div>
            </div>
          </div>

          {/* Central-Style 5TOT Timeline (T01–T07) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[13.5px] font-extrabold text-[#0F2335] flex items-center gap-2">
                <Layers size={16} className="text-[#0D78AE]" />
                <span>
                  Lộ trình thời gian xét chọn chuẩn Trung ương (T01–T07)
                </span>
              </h3>
              <span className="text-[11.5px] text-[#526B7C]">
                Hồ sơ Tập thể (T04) nộp trực tiếp về Thành phố song song với
                nhánh Cá nhân (T01–T03)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[12px]">
              {selectedMilestones.map((ms) => (
                <div
                  key={ms.code}
                  className="p-3 rounded-[9px] bg-[#F8FBFD] border border-[#DCE7EE] flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-extrabold bg-[#EBF6FC] text-[#0D78AE]">
                        {ms.code} ·{' '}
                        {ms.track === 'INDIVIDUAL'
                          ? 'Cá nhân'
                          : ms.track === 'COLLECTIVE'
                            ? 'Tập thể (Song song)'
                            : 'Chung'}
                      </span>
                      <span
                        className={`text-[10.5px] font-bold ${
                          ms.state === 'OPEN'
                            ? 'text-[#16A34A]'
                            : ms.state === 'COMPLETED'
                              ? 'text-[#64748B]'
                              : 'text-[#B45309]'
                        }`}
                      >
                        {ms.badgeLabelVi}
                      </span>
                    </div>
                    <div className="font-bold text-[#0F2335] mt-1.5">
                      {ms.labelVi}
                    </div>
                    <p className="text-[11px] text-[#526B7C] mt-0.5">
                      {ms.descriptionVi}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#E2EDF5] text-[11px] font-semibold text-[#172A3A] tabular-nums">
                    {ms.openAtVi ? `${ms.openAtVi} → ` : ''}
                    {ms.closeAtVi}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Create Season Modal with "Sao chép cấu hình từ mùa trước" */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[14px] border border-[#D4E2EC] max-w-[640px] w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EEF4F8] pb-3">
              <div>
                <h2 className="text-[16px] font-extrabold text-[#0F2335]">
                  Tạo mùa xét mới &amp; Sao chép cấu hình
                </h2>
                <span className="text-[11.5px] text-[#526B7C]">
                  Trạng thái ban đầu: <strong>Bản nháp (Chuẩn bị)</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-[#607483] hover:text-[#0F2335]"
              >
                <X size={16} />
              </button>
            </div>

            {createErrors.length > 0 && (
              <div className="p-3 rounded-[8px] bg-[#FEF2F2] border border-[#FECACA] text-[12px] text-[#B91C1C] space-y-1">
                {createErrors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const validation = validateSeasonConfiguration(
                  {
                    schoolYear: createForm.schoolYear,
                    title: createForm.title,
                  },
                  seasons
                );
                if (!validation.isValid) {
                  setCreateErrors(validation.errors);
                  return;
                }

                onCreateSeason({
                  schoolYear: createForm.schoolYear.trim(),
                  title: createForm.title.trim(),
                  status: 'draft',
                  isCurrentActive: false,
                  submissionStart: createForm.submissionStart,
                  submissionDeadline: createForm.submissionDeadline,
                  schoolReviewStart: createForm.schoolReviewStart,
                  schoolReviewDeadline: createForm.schoolReviewDeadline,
                  schoolForwardingDeadline: createForm.schoolForwardingDeadline,
                  collectiveSubmissionStart:
                    createForm.collectiveSubmissionStart,
                  collectiveSubmissionDeadline:
                    createForm.collectiveSubmissionDeadline,
                  reviewStart: createForm.reviewStart,
                  reviewDeadline: createForm.reviewDeadline,
                  supplementStart: createForm.supplementStart,
                  supplementDeadline: createForm.supplementDeadline,
                  committeeDate: createForm.committeeDate,
                  publicationTargetDate: createForm.publicationTargetDate,
                  criteriaVersionId: createForm.criteriaVersionId,
                  criteriaVersionLabel: createForm.criteriaVersionLabel,
                  copyFromSeasonId: createForm.copyFromSeasonId || undefined,
                });
                setIsCreateOpen(false);
              }}
              className="space-y-3.5 text-[13px]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                    Năm học (Định dạng YYYY–YYYY){' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.schoolYear}
                    onChange={(e) => {
                      const yr = e.target.value;
                      setCreateForm({
                        ...createForm,
                        schoolYear: yr,
                        title: `Đợt xét chọn Danh hiệu "Sinh viên 5 Tốt" cấp Thành phố ${formatAcademicYearLabel(yr)}`,
                      });
                    }}
                    placeholder="2026–2027"
                    className="w-full h-[40px] px-3 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[8px] outline-none focus:border-[#0D78AE] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#172A3A] mb-1 flex items-center gap-1">
                    <Copy size={12} className="text-[#0D78AE]" />
                    <span>Sao chép cấu hình từ mùa trước</span>
                  </label>
                  <select
                    value={createForm.copyFromSeasonId}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        copyFromSeasonId: e.target.value,
                      })
                    }
                    className="w-full h-[40px] px-3 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[8px] outline-none focus:border-[#0D78AE] focus:bg-white"
                  >
                    <option value="">Không sao chép (Khởi tạo trống)</option>
                    {seasons.map((s) => (
                      <option key={s.id} value={s.id}>
                        Sao chép tiêu chuẩn &amp; đơn vị từ{' '}
                        {formatAcademicYearLabel(s.schoolYear)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                  Tên hiển thị đợt xét <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, title: e.target.value })
                  }
                  className="w-full h-[40px] px-3 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[8px] outline-none focus:border-[#0D78AE] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                    Mở nhận hồ sơ Cá nhân (T01)
                  </label>
                  <input
                    type="text"
                    value={createForm.submissionStart}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        submissionStart: e.target.value,
                      })
                    }
                    className="w-full h-[38px] px-3 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[8px]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                    Hạn nộp hồ sơ Cá nhân (T01)
                  </label>
                  <input
                    type="text"
                    value={createForm.submissionDeadline}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        submissionDeadline: e.target.value,
                      })
                    }
                    className="w-full h-[38px] px-3 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[8px]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                    Hạn Trường gửi danh sách lên TP (T03)
                  </label>
                  <input
                    type="text"
                    value={createForm.schoolForwardingDeadline}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        schoolForwardingDeadline: e.target.value,
                      })
                    }
                    className="w-full h-[38px] px-3 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[8px]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#172A3A] mb-1">
                    Hạn nộp Tập thể trực tiếp lên TP (T04)
                  </label>
                  <input
                    type="text"
                    value={createForm.collectiveSubmissionDeadline}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        collectiveSubmissionDeadline: e.target.value,
                      })
                    }
                    className="w-full h-[38px] px-3 bg-[#F8FBFD] border border-[#DCE7EE] rounded-[8px]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#EBF6FC] border border-[#CCE7F6] text-[11.5px] text-[#0A527A]">
                Khi chọn <strong>Sao chép cấu hình từ mùa trước</strong>, hệ
                thống chỉ sao chép khung 05 tiêu chuẩn Cá nhân, 04 tiêu chuẩn
                Tập thể (TT01–TT04), danh mục đơn vị tham gia và mẫu thông báo;{' '}
                <strong>tuyệt đối không sao chép</strong> hồ sơ sinh viên, minh
                chứng, tờ trình cấp Trường hay quyết định Hội đồng.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EEF4F8]">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Hủy
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Lưu bản nháp mùa xét
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
