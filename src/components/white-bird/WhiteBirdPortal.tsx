/**
 * 5TOT Đại học Đà Nẵng — Giải thưởng "Cánh chim trắng" Student Account Tab & Workspace
 * Căn cứ Quy chế Giải thưởng "Cánh chim trắng" ban hành kèm theo Quyết định số 14-QĐ/ĐHĐN-HSV ngày 04/10/2022
 * của Ban Thư ký Hội Sinh viên Việt Nam Đại học Đà Nẵng.
 * Cơ quan Thường trực Giải thưởng: Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Feather,
  Sparkles,
  Flame,
  Lightbulb,
  Plus,
  FileCheck2,
  FolderArchive,
  Award,
  CheckCircle2,
  Clock,
  Upload,
  Eye,
  Download,
  Trash2,
  Send,
  ShieldCheck,
  Building2,
  User,
  Users,
  AlertCircle,
  FileText,
  Info,
  Mail,
} from 'lucide-react';
import { StudentProfileDto } from '../../entities/application/studentApplicationTypes';
import { ApplicationEvidence } from '../../demo/fixtures/studentApplication';
import {
  saveEvidenceFile,
  deleteEvidenceFile,
  getEvidenceBlobUrl,
  downloadEvidenceFile,
} from '../../staff/demoEvidenceStorage';
import { CollectiveDocumentPreviewModal } from '../../features/evidence-upload';
import { Button } from '../buttons/Button';
import { Input } from '../forms/Input';
import {
  WHITE_BIRD_CATEGORIES,
  WHITE_BIRD_NOMINATING_UNIT_LABELS,
  WHITE_BIRD_NOMINATING_SUBJECT_OPTIONS,
  WhiteBirdApplication,
  WhiteBirdApplicationStatus,
  WhiteBirdCategory,
  WhiteBirdNominatingUnitType,
  WhiteBirdRequirementId,
} from './whiteBirdTypes';
import {
  getAllWhiteBirdApplications,
  hydrateWhiteBirdStore,
  subscribeToWhiteBirdStore,
  createWhiteBirdApplication,
  updateWhiteBirdWB01,
  updateWhiteBirdWB02,
  updateWhiteBirdWB03,
  addWhiteBirdEvidence,
  removeWhiteBirdEvidence,
  validateWhiteBirdReadiness,
  submitWhiteBirdApplication,
} from './whiteBirdStore';
import { CreateWhiteBirdModal } from './CreateWhiteBirdModal';

export interface WhiteBirdPortalProps {
  currentEmail?: string;
  studentIdentity?: {
    fullName: string;
    studentId: string;
    university: string;
  };
  studentProfileSnapshot?: StudentProfileDto | null;
}

type WhiteBirdPortalTabId = 'overview' | 'workspace' | 'evidence' | 'results';

const getRequirementCompletionStatus = (
  isReady: boolean,
  appStatus?: WhiteBirdApplicationStatus,
  options?: { isOptional?: boolean; hasOptionalData?: boolean }
): { label: string; badgeClass: string } => {
  if (appStatus && appStatus !== 'draft' && appStatus !== 'supplement_returned') {
    return {
      label: 'Đang chờ thẩm định',
      badgeClass: 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]',
    };
  }
  if (options?.isOptional) {
    if (options.hasOptionalData) {
      return {
        label: 'Đã bổ sung minh họa',
        badgeClass: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
      };
    }
    return {
      label: 'Không bắt buộc',
      badgeClass: 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]',
    };
  }
  if (isReady) {
    return {
      label: 'Đã hoàn thiện kê khai',
      badgeClass: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
    };
  }
  return {
    label: 'Chưa hoàn thiện',
    badgeClass: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
  };
};

export const WhiteBirdPortal: React.FC<WhiteBirdPortalProps> = ({
  currentEmail = '',
  studentIdentity,
  studentProfileSnapshot,
}) => {
  const [storeTick, setStoreTick] = useState(0);
  const [activeTab, setActiveTab] = useState<WhiteBirdPortalTabId>('overview');
  const [activeReqId, setActiveReqId] = useState<WhiteBirdRequirementId>('WB01');
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'warn';
  } | null>(null);

  // Evidence upload & preview state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTargetReqId, setUploadTargetReqId] = useState<WhiteBirdRequirementId>('WB01');
  const [previewFile, setPreviewFile] = useState<ApplicationEvidence | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'success' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  useEffect(() => {
    void hydrateWhiteBirdStore();
    return subscribeToWhiteBirdStore(() => {
      setStoreTick((t) => t + 1);
    });
  }, []);

  const effectiveEmail = (
    studentProfileSnapshot?.email ||
    currentEmail ||
    ''
  )
    .trim()
    .toLowerCase();
  const effectiveStudentId = (studentIdentity?.studentId || '').trim();
  const effectiveUserName =
    studentProfileSnapshot?.fullName ||
    studentIdentity?.fullName ||
    'Sinh viên ĐHĐN';
  const effectiveUniversity =
    studentProfileSnapshot?.institutionName ||
    studentIdentity?.university ||
    'Trường Đại học Bách khoa – ĐHĐN';

  const userApps = useMemo(() => {
    void storeTick;
    const all = getAllWhiteBirdApplications();
    const matched = all.filter((app) => {
      const appEmail = (app.preparedByUserEmail || '').trim().toLowerCase();
      const appSid = (app.studentId || '').trim();
      if (effectiveEmail && appEmail === effectiveEmail) return true;
      if (effectiveStudentId && appSid === effectiveStudentId) return true;
      return false;
    });
    return matched;
  }, [storeTick, effectiveEmail, effectiveStudentId]);

  const activeApp: WhiteBirdApplication | null = useMemo(() => {
    if (userApps.length === 0) return null;
    return userApps.find((a) => a.id === selectedAppId) || userApps[0];
  }, [userApps, selectedAppId]);

  const handleWB01NominatorTypeChange = (newType: WhiteBirdNominatingUnitType) => {
    if (!activeApp) return;
    const currentName = activeApp.requirements.wb01.nominatingUnitName || '';
    const currentType = activeApp.requirements.wb01.nominatingUnitType;
    if (newType === currentType) return;

    const knownDefaults = [
      '',
      `Ban Thư ký Hội Sinh viên ${activeApp.institutionName}`.toLowerCase(),
      `Ban Thư ký Hội Sinh viên Việt Nam ${activeApp.institutionName}`.toLowerCase(),
      `Ban Chấp hành Liên chi Hội ${activeApp.facultyName || 'Khoa'}`.toLowerCase(),
      'Ban Chấp hành Liên chi Hội'.toLowerCase(),
      'Ban Chấp hành Liên chi hội'.toLowerCase(),
      `Ban Chủ nhiệm CLB/Đội/Nhóm trực thuộc HSV ${activeApp.institutionName}`.toLowerCase(),
      'Ban Chủ nhiệm CLB/Đội/Nhóm trực thuộc HSV Đại học Đà Nẵng'.toLowerCase(),
    ];

    const isCurrentDefault =
      knownDefaults.includes(currentName.trim().toLowerCase()) ||
      currentName.trim().toLowerCase().startsWith('ban thư ký hội sinh viên');

    let updatedName = currentName;

    if (newType === 'UV_BCH_HSV_DHDN') {
      if (isCurrentDefault) {
        updatedName = '';
      }
    } else {
      if (isCurrentDefault || !currentName.trim()) {
        if (newType === 'BTK_HSV_TRUONG') {
          updatedName = `Ban Thư ký Hội Sinh viên ${activeApp.institutionName}`;
        } else if (newType === 'BCH_LIEN_CHI_HOI') {
          updatedName = activeApp.facultyName
            ? `Ban Chấp hành Liên chi Hội ${activeApp.facultyName}`
            : 'Ban Chấp hành Liên chi Hội';
        } else if (newType === 'BCN_CLB_TRUONG' || newType === 'BCN_CLB_DOI_NHOM') {
          updatedName = `Ban Chủ nhiệm CLB/Đội/Nhóm trực thuộc HSV ${activeApp.institutionName}`;
        } else if (newType === 'BCN_CLB_DHDN') {
          updatedName = 'Ban Chủ nhiệm CLB/Đội/Nhóm trực thuộc HSV Đại học Đà Nẵng';
        }
      }
    }

    updateWhiteBirdWB01(activeApp.id, {
      nominatingUnitType: newType,
      nominatingUnitName: updatedName,
    });
  };

  const handleCreateSubmit = (data: {
    nominationTitle: string;
    category: WhiteBirdCategory;
    nomineeType: 'INDIVIDUAL' | 'COLLECTIVE';
    nomineeName: string;
    studentId: string;
    institutionId: string;
    institutionName: string;
    schoolReviewUnitId: string;
    schoolReviewUnitName: string;
    facultyName: string;
    className: string;
    contactPhone: string;
  }) => {
    const created = createWhiteBirdApplication({
      ...data,
      preparedByUserId: effectiveStudentId
        ? `student-${effectiveStudentId}`
        : `user-${Date.now()}`,
      preparedByUserName: effectiveUserName,
      preparedByUserEmail: effectiveEmail || 'sinhvien@udn.vn',
    });
    setSelectedAppId(created.id);
    setIsCreateModalOpen(false);
    setActiveTab('workspace');
    setActiveReqId('WB01');
    showToast(`Đã khởi tạo hồ sơ Giải thưởng Cánh chim trắng: ${created.nominationTitle}`);
  };

  const triggerUploadForReq = (reqId: WhiteBirdRequirementId) => {
    setUploadTargetReqId(reqId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeApp) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const newEvidenceId = `ev-cct-${Date.now()}-${i}`;
        const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
        const fileTypeMap: Record<string, ApplicationEvidence['fileType']> = {
          pdf: 'pdf',
          jpg: 'jpg',
          jpeg: 'jpg',
          png: 'png',
          webp: 'webp',
          xlsx: 'xlsx',
          xls: 'xlsx',
          docx: 'docx',
          doc: 'docx',
        };
        const resolvedType = fileTypeMap[ext] || 'pdf';
        const sizeKb = Math.max(1, Math.round(file.size / 1024));
        const sizeFormatted =
          sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

        await saveEvidenceFile(newEvidenceId, file, file.name, resolvedType, {
          size: sizeFormatted,
          reqId: uploadTargetReqId,
          applicationId: activeApp.id,
          ownerTrack: 'COLLECTIVE',
        });

        const newItem: ApplicationEvidence = {
          id: newEvidenceId,
          name: file.name,
          fileType: resolvedType,
          size: sizeFormatted,
          uploadedAt: new Date().toLocaleDateString('vi-VN'),
          status: 'ready',
          url: `/api/v2/portal/evidence/${encodeURIComponent(newEvidenceId)}`,
        };
        addWhiteBirdEvidence(activeApp.id, uploadTargetReqId, newItem);
      }
      showToast(`Đã tải lên ${files.length} tệp minh chứng cho ${uploadTargetReqId}`);
    } catch {
      showToast('Không thể tải lên tệp minh chứng. Vui lòng thử lại.', 'warn');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteEvidence = async (
    reqId: WhiteBirdRequirementId,
    evidenceId: string
  ) => {
    if (
      !activeApp ||
      (activeApp.status !== 'draft' && activeApp.status !== 'supplement_requested')
    ) {
      return;
    }
    await deleteEvidenceFile(evidenceId).catch(() => {});
    removeWhiteBirdEvidence(activeApp.id, reqId, evidenceId);
    showToast('Đã xóa tệp minh chứng');
  };

  const handleOpenPreview = async (file: ApplicationEvidence) => {
    setPreviewFile(file);
    setIsLoadingPreview(true);
    try {
      const url = await getEvidenceBlobUrl(file.id);
      setPreviewBlobUrl(url);
    } catch {
      setPreviewBlobUrl(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    if (previewBlobUrl && previewBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    setPreviewFile(null);
    setPreviewBlobUrl(null);
  };

  const handleDownloadFile = async (file: ApplicationEvidence) => {
    const ok = await downloadEvidenceFile(file.id, file.name);
    if (!ok) {
      showToast('Đang tải tệp về máy tính...');
    }
  };

  const handleSubmitDossier = () => {
    if (!activeApp) return;
    const wasSupplement = activeApp.status === 'supplement_requested';
    const res = submitWhiteBirdApplication(activeApp.id);
    if (!res.success) {
      showToast(res.error || 'Chưa đủ điều kiện nộp hồ sơ', 'warn');
      return;
    }
    showToast(
      wasSupplement
        ? 'Đã gửi lại hồ sơ bổ sung Giải thưởng Cánh chim trắng trực tiếp lên Văn phòng Hội Sinh viên ĐHĐN!'
        : 'Đã nộp thẳng hồ sơ Giải thưởng Cánh chim trắng về Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng!'
    );
    setActiveTab('overview');
  };

  // ---------------------------------------------------------------------------
  // EMPTY STATE: NO WHITE BIRD APPLICATION YET
  // ---------------------------------------------------------------------------
  if (!activeApp) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12 min-w-0">
        {/* Hero Banner */}
        <div className="rounded-[16px] bg-gradient-to-r from-[#0B3B5B] via-[#0D5C8C] to-[#0D78AE] text-white p-6 md:p-7 shadow-sm border border-[#0D5C8C]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-[700px]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-[11.5px] font-bold tracking-wide uppercase">
                <Feather size={14} />
                <span>Giải thưởng “Cánh chim trắng” · Quyết định số 14-QĐ/ĐHĐN-HSV ngày 04/10/2022</span>
              </div>
              <h1 className="text-[22px] md:text-[24px] font-extrabold tracking-tight text-white">
                Khởi tạo & Kê khai Hồ sơ Giải thưởng “Cánh chim trắng”
              </h1>
              <p className="text-[13.5px] text-sky-100 leading-relaxed">
                Giải thưởng cao quý của Ban Thư ký Hội Sinh viên Việt Nam Đại học Đà Nẵng
                nhằm tôn vinh các cá nhân, tập thể có mô hình sáng kiến hiệu quả, cống hiến xuất sắc
                nhiều năm liền trong công tác Hội hoặc có dự án khởi nghiệp, đề tài nghiên cứu khoa học
                ứng dụng thực tiễn cao.
              </p>
            </div>
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-[11px] bg-white text-[#0B3B5B] hover:bg-sky-50 font-bold text-[13.5px] shadow-md transition-all cursor-pointer"
              >
                <Plus size={17} strokeWidth={2.4} />
                <span>Khởi tạo hồ sơ Giải thưởng Cánh chim trắng</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Official Categories Grid */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3.5">
            <div>
              <h2 className="text-[16px] font-bold text-[#172A3A]">
                3 hạng mục xét trao Giải thưởng “Cánh chim trắng”
              </h2>
              <p className="text-[12px] text-[#607483] mt-0.5">
                Theo Điều 3 và Điều 6 Quy chế ban hành kèm theo Quyết định số 14-QĐ/ĐHĐN-HSV.
              </p>
            </div>
            <span className="text-[12px] font-semibold text-[#0D78AE] shrink-0">
              Cơ quan Thường trực: Văn phòng Hội Sinh viên ĐHĐN
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {(
              [
                {
                  code: 'UOM_MAM' as WhiteBirdCategory,
                  icon: <Sparkles size={19} className="text-[#0D78AE]" />,
                  accentBg: 'bg-[#EBF6FC]',
                  badge: 'Cá nhân hoặc Tập thể',
                },
                {
                  code: 'TRUYEN_LUA' as WhiteBirdCategory,
                  icon: <Flame size={19} className="text-[#D97706]" />,
                  accentBg: 'bg-[#FEF3C7]',
                  badge: 'Chỉ dành cho Cá nhân',
                },
                {
                  code: 'SANG_TAO' as WhiteBirdCategory,
                  icon: <Lightbulb size={19} className="text-[#0284C7]" />,
                  accentBg: 'bg-[#E0F2FE]',
                  badge: 'Cá nhân hoặc Tập thể',
                },
              ] as const
            ).map((item) => {
              const meta = WHITE_BIRD_CATEGORIES[item.code];
              return (
                <div
                  key={item.code}
                  className="bg-white rounded-[14px] border border-[#E2EEF6] p-5 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Header: Icon & Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`w-10 h-10 rounded-[10px] ${item.accentBg} flex items-center justify-center shrink-0`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#334155] border border-[#E2E8F0]">
                        {item.badge}
                      </span>
                    </div>

                    {/* Category Title & Citations */}
                    <div>
                      <h3 className="text-[16px] font-bold text-[#172A3A]">{meta.name}</h3>
                      <p className="text-[11.5px] font-semibold text-[#0D78AE] mt-0.5">
                        {meta.articleRef}
                      </p>
                      <p className="text-[12.5px] text-[#475569] mt-2 leading-relaxed">
                        {meta.targetDescription}
                      </p>
                    </div>

                    {/* Tiêu chuẩn xét trao (Điều 4) - Hiển thị trực tiếp */}
                    <div className="pt-3 border-t border-[#EDF2F7]">
                      <div className="text-[12px] font-bold text-[#172A3A] mb-2 flex items-center justify-between">
                        <span>Tiêu chuẩn xét trao:</span>
                        <span className="text-[11px] font-medium text-[#64748B]">
                          {meta.standardsArticleRef}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11.5px] text-[#475569]">
                        {meta.standards.map((std) => (
                          <div key={std.number} className="flex items-start gap-1.5 leading-snug">
                            <span className="font-bold text-[#0D78AE] shrink-0 mt-0.5">
                              {std.number}.
                            </span>
                            <div>
                              <strong className="text-[#1E293B] font-semibold">{std.label}:</strong>{' '}
                              <span>{std.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hồ sơ đề nghị xét trao (Điều 6) */}
                    <div className="pt-3 border-t border-[#EDF2F7]">
                      <div className="text-[12px] font-bold text-[#172A3A] mb-2 flex items-center justify-between">
                        <span>Hồ sơ đề nghị xét trao:</span>
                        <span className="text-[11px] font-medium text-[#64748B]">
                          {meta.dossierArticleRef}
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-[11.5px] text-[#55697B]">
                        {meta.dossierItems.map((dossier) => (
                          <li key={dossier.code} className="flex items-start gap-1.5 leading-snug">
                            <CheckCircle2
                              size={13}
                              className={`shrink-0 mt-0.5 ${
                                dossier.isOptional ? 'text-[#D97706]' : 'text-[#0D78AE]'
                              }`}
                            />
                            <div>
                              <span className="font-bold text-[#1E293B]">{dossier.code}:</span>{' '}
                              <span>{dossier.title}</span>{' '}
                              {dossier.isOptional ? (
                                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#FEF3C7]/80 text-[#B45309] border border-[#FDE68A]">
                                  Nếu có
                                </span>
                              ) : (
                                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#E0F2FE]/80 text-[#0369A1]">
                                  Bắt buộc
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Business Notes */}
        <div className="rounded-[12px] bg-[#F8FCF9] border border-[#DCFCE7] p-4 text-[12px] text-[#334155] shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-[#15803D] mb-2">
            <Info size={15} />
            <span>Ghi chú nghiệp vụ quan trọng theo Quy chế Giải thưởng (Quyết định số 14-QĐ/ĐHĐN-HSV)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11.5px] leading-relaxed">
            <div className="p-3 rounded-[8px] bg-white border border-[#E8F5E9]">
              <strong className="text-[#15803D] block mb-1">Điều 3 · Nguyên tắc trao thưởng:</strong>
              Mỗi cá nhân, tập thể chỉ có thể nhận Giải thưởng của mỗi hạng mục một lần duy nhất.
            </div>
            <div className="p-3 rounded-[8px] bg-white border border-[#E8F5E9]">
              <strong className="text-[#15803D] block mb-1">Khoản 4.1 Điều 4 · Thời gian tính thành tích:</strong>
              Thành tích, mô hình, giải pháp, sáng kiến, đề tài, dự án đề nghị xét trao Giải thưởng được tính trong năm học xét trao cho đến thời điểm kết thúc nhận hồ sơ đề nghị xét trao.
            </div>
            <div className="p-3 rounded-[8px] bg-white border border-[#E8F5E9]">
              <strong className="text-[#15803D] block mb-1">Điều 9 · Số lượng Giải thưởng:</strong>
              Hằng năm, Hội đồng Giải thưởng xét, trao Giải thưởng cho:
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[#475569]">
                <li>05 mô hình, giải pháp, sáng kiến tiêu biểu nhất ở hạng mục “Cánh chim ươm mầm”.</li>
                <li>05 cá nhân có thành tích xuất sắc nhất ở hạng mục “Cánh chim truyền lửa”.</li>
                <li>05 dự án, đề tài tiêu biểu nhất ở hạng mục “Cánh chim sáng tạo”.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Official Regulation Summary Cards */}
        <div className="bg-white rounded-[14px] border border-[#E2EEF6] p-5 grid grid-cols-1 md:grid-cols-3 gap-5 shadow-xs">
          <div className="p-3.5 rounded-[10px] bg-[#F8FBFD] border border-[#E2EEF6] flex flex-col justify-between">
            <div>
              <div className="text-[12px] font-bold text-[#0D5C8C] uppercase tracking-wide mb-1.5">
                Điều 5 · Thẩm quyền đề xuất xét trao
              </div>
              <ul className="text-[11.5px] text-[#475569] space-y-1.5 leading-relaxed list-disc list-inside">
                <li>Ủy viên Ban Chấp hành Hội Sinh viên Việt Nam Đại học Đà Nẵng.</li>
                <li>Ban Thư ký Hội Sinh viên Việt Nam các Trường Đại học thành viên Đại học Đà Nẵng; Ban Chủ nhiệm (hoặc tương đương) của các CLB/Đội/Nhóm trực thuộc Hội Sinh viên Việt Nam Đại học Đà Nẵng.</li>
                <li>Ban Chấp hành Liên chi Hội; Ban Chủ nhiệm (hoặc tương đương) của các CLB/Đội/Nhóm trực thuộc Hội Sinh viên Việt Nam các Trường thành viên Đại học Đà Nẵng.</li>
              </ul>
            </div>
          </div>
          <div className="p-3.5 rounded-[10px] bg-[#F8FBFD] border border-[#E2EEF6] flex flex-col justify-between">
            <div>
              <div className="text-[12px] font-bold text-[#0D5C8C] uppercase tracking-wide mb-1.5">
                Điều 11 · Hình thức Giải thưởng
              </div>
              <ol className="text-[11.5px] text-[#475569] space-y-1.5 leading-relaxed list-decimal list-inside">
                <li>Một biểu trưng “Giải thưởng Cánh chim trắng” dành cho cá nhân, tập thể được giải tương ứng với hạng mục được trao.</li>
                <li>Giấy khen của Ban Chấp hành Hội Sinh viên Việt Nam Đại học Đà Nẵng.</li>
                <li>Phần thưởng bằng tiền mặt hoặc hiện vật (tùy thuộc vào nguồn xã hội hóa hằng năm).</li>
              </ol>
            </div>
          </div>
          <div className="p-3.5 rounded-[10px] bg-[#F8FBFD] border border-[#E2EEF6] flex flex-col justify-between">
            <div>
              <div className="text-[12px] font-bold text-[#0D5C8C] uppercase tracking-wide mb-1.5">
                Điều 7 · Quy trình & Thời hạn tiếp nhận
              </div>
              <p className="text-[11.5px] text-[#475569] leading-relaxed">
                Hồ sơ đề nghị xét trao Giải thưởng gửi về Cơ quan Thường trực Giải thưởng (Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng) trước ngày 30/11 hằng năm để Cơ quan Thường trực thẩm định và trình Hội đồng xét duyệt.
              </p>
            </div>
          </div>
        </div>

        <CreateWhiteBirdModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
          initialUserName={effectiveUserName}
          initialUserEmail={effectiveEmail}
          initialStudentId={effectiveStudentId}
          initialUniversity={effectiveUniversity}
          initialInstitutionId={studentProfileSnapshot?.institutionId}
          initialClassName={studentProfileSnapshot?.className}
          initialPhone={studentProfileSnapshot?.phoneNumber}
        />
      </div>
    );
  }
  // ---------------------------------------------------------------------------
  // ACTIVE APPLICATION WORKSPACE
  // ---------------------------------------------------------------------------
  const categoryMeta = WHITE_BIRD_CATEGORIES[activeApp.category];
  const readiness = validateWhiteBirdReadiness(activeApp);
  const isReadOnly = activeApp.status !== 'draft' && activeApp.status !== 'supplement_requested';
  const allEvidenceFiles = [
    ...activeApp.requirements.wb01.evidenceFiles.map((f) => ({ ...f, reqId: 'WB01' as const })),
    ...activeApp.requirements.wb02.evidenceFiles.map((f) => ({ ...f, reqId: 'WB02' as const })),
    ...activeApp.requirements.wb03.evidenceFiles.map((f) => ({ ...f, reqId: 'WB03' as const })),
  ];

  const statusBadge = (() => {
    switch (activeApp.status) {
      case 'submitted':
      case 'under_review':
        return {
          label: 'Đã nộp thẳng về Văn phòng Hội Sinh viên ĐHĐN · Đang thẩm định',
          cls: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
        };
      case 'supplement_returned':
        return {
          label: 'Đã gửi lại hồ sơ bổ sung · Đang chờ cấp ĐHĐN thẩm định lại',
          cls: 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]',
        };
      case 'awaiting_committee':
        return {
          label: 'Đã qua thẩm định · Đang trình Hội đồng xét duyệt Giải thưởng Cánh chim trắng ĐHĐN',
          cls: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
        };
      case 'recognized':
        return {
          label: 'Đạt Giải thưởng “Cánh chim trắng” cấp Đại học Đà Nẵng',
          cls: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]',
        };
      case 'supplement_requested':
        return {
          label: 'Yêu cầu bổ sung hồ sơ từ Văn phòng Hội Sinh viên ĐHĐN',
          cls: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
        };
      case 'not_recognized':
        return {
          label: 'Chưa đạt Giải thưởng kỳ này',
          cls: 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]',
        };
      default:
        return {
          label: 'Bản nháp đang kê khai',
          cls: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]',
        };
    }
  })();

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-12 min-w-0">
      {/* Hidden file input for WB01-WB03 evidence uploads */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-[11px] shadow-lg border text-[13px] font-semibold flex items-center gap-2.5 ${
            toastMessage.type === 'warn'
              ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
              : 'bg-[#0F172A] border-[#1E293B] text-white'
          }`}
        >
          <CheckCircle2
            size={16}
            className={toastMessage.type === 'warn' ? 'text-[#D97706]' : 'text-[#38BDF8]'}
          />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Supplement Request Alert Banner from UDN */}
      {activeApp.status === 'supplement_requested' && (
        <div className="bg-[#FFFBEB] border border-[#F59E0B] rounded-[13px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[12.5px] font-extrabold text-[#B45309] uppercase tracking-wide flex items-center gap-1.5">
              <AlertCircle size={15} />
              <span>Yêu cầu bổ sung hồ sơ từ Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng</span>
            </div>
            <p className="text-[13px] text-[#78350F] font-medium">
              {activeApp.supplementRequestNote ||
                'Vui lòng kiểm tra và bổ sung thông tin/minh chứng theo yêu cầu của Cán bộ thẩm định cấp Đại học Đà Nẵng, sau đó nhấn “Gửi lại hồ sơ bổ sung về Văn phòng HSV ĐHĐN”.'}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => setActiveTab('workspace')}
          >
            Bổ sung & Gửi lại ngay
          </Button>
        </div>
      )}

      {/* Top Context Bar */}
      <div className="bg-white rounded-[14px] border border-[#DCE7EE] p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[10px] bg-[#E5F5FC] border border-[#CBE4F5] text-[#0D78AE] flex items-center justify-center shrink-0">
              <Feather size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#EBF6FC] text-[#0D78AE] border border-[#CBE4F5]">
                  {categoryMeta.name}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] inline-flex items-center gap-1">
                  {activeApp.nomineeType === 'INDIVIDUAL' ? (
                    <>
                      <User size={12} /> Cá nhân: {activeApp.nomineeName}
                    </>
                  ) : (
                    <>
                      <Users size={12} /> Tập thể / Nhóm: {activeApp.nomineeName}
                    </>
                  )}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.cls}`}
                >
                  {statusBadge.label}
                </span>
              </div>
              <h1 className="text-[16.5px] font-extrabold text-[#172A3A] truncate mt-1">
                {activeApp.nominationTitle}
              </h1>
              <div className="text-[12px] text-[#607483] flex flex-wrap items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 font-medium text-[#334155]">
                  <Building2 size={13} className="text-[#0D78AE]" />
                  {activeApp.institutionName}
                </span>
                <span>·</span>
                <span>Mã hồ sơ: {activeApp.id}</span>
                <span>·</span>
                <span>Năm học {activeApp.academicYear}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {userApps.length > 1 && (
              <select
                value={activeApp.id}
                onChange={(e) => setSelectedAppId(e.target.value)}
                aria-label="Chuyển đổi hồ sơ Giải thưởng Cánh chim trắng"
                className="text-[12.5px] font-semibold text-[#172A3A] bg-[#F8FBFD] border border-[#DCE7EE] rounded-lg px-2.5 py-1.5"
              >
                {userApps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {WHITE_BIRD_CATEGORIES[app.category].shortName}: {app.nominationTitle}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-bold bg-[#E5F5FC] text-[#0D78AE] hover:bg-[#D0ECFA] transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Tạo đề cử mới</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-[#EDF3F8] overflow-x-auto">
          {(
            [
              {
                id: 'overview' as const,
                label: 'Tổng quan đề cử',
                icon: <Feather size={15} />,
              },
              {
                id: 'workspace' as const,
                label: `Kê khai hồ sơ & Minh chứng (${readiness.readyCount}/${readiness.totalRequired})`,
                icon: <FileCheck2 size={15} />,
              },
              {
                id: 'evidence' as const,
                label: `Kho minh chứng (${allEvidenceFiles.length})`,
                icon: <FolderArchive size={15} />,
              },
              {
                id: 'results' as const,
                label: 'Kết quả xét trao',
                icon: <Award size={15} />,
              },
            ]
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-[9px] text-[13px] font-semibold transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#0D78AE] text-white shadow-xs'
                    : 'text-[#55697B] hover:text-[#172A3A] hover:bg-[#F3F8FC]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              [
                {
                  id: 'WB01' as const,
                  code: 'Thành phần WB01 · Điều 5',
                  title: 'Văn bản đề nghị xét trao Giải thưởng',
                  ready: readiness.wb01Ready,
                  filesCount: activeApp.requirements.wb01.evidenceFiles.length,
                  desc:
                    activeApp.requirements.wb01.nominatingUnitName ||
                    'Chưa kê khai đơn vị giới thiệu đề cử',
                  isOptional: false,
                  hasOptionalData: false,
                },
                {
                  id: 'WB02' as const,
                  code: 'Thành phần WB02 · Điều 6',
                  title: categoryMeta.wb02Title,
                  ready: readiness.wb02Ready,
                  filesCount: activeApp.requirements.wb02.evidenceFiles.length,
                  desc:
                    activeApp.requirements.wb02.reportTitle ||
                    'Chưa hoàn thiện báo cáo thuyết minh / thành tích',
                  isOptional: false,
                  hasOptionalData: false,
                },
                {
                  id: 'WB03' as const,
                  code: readiness.isWb03Optional
                    ? 'Thành phần WB03 · Khoản 6.1 Điều 6 (Tùy chọn)'
                    : 'Thành phần WB03 · Điều 6',
                  title: readiness.isWb03Optional
                    ? 'Hình ảnh, sản phẩm minh họa (nếu có)'
                    : categoryMeta.wb03Title,
                  ready: readiness.wb03Ready,
                  filesCount: activeApp.requirements.wb03.evidenceFiles.length,
                  desc:
                    activeApp.requirements.wb03.awardOrRecognitionSummary ||
                    (readiness.isWb03Optional
                      ? 'Bạn có thể bổ sung hình ảnh, sản phẩm hoặc tài liệu minh họa (không bắt buộc)'
                      : 'Chưa kê khai tóm tắt minh chứng hiệu quả / giải thưởng'),
                  isOptional: readiness.isWb03Optional,
                  hasOptionalData: readiness.wb03HasData,
                },
              ]
            ).map((card) => {
              const status = getRequirementCompletionStatus(
                card.ready,
                activeApp.status,
                card.isOptional ? { isOptional: true, hasOptionalData: card.hasOptionalData } : undefined
              );
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-[13px] border border-[#DCE7EE] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold text-[#0D78AE] uppercase">
                        {card.code}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${status.badgeClass}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-bold text-[#172A3A]">{card.title}</h3>
                    <p className="text-[12px] text-[#55697B] mt-1.5 line-clamp-2">{card.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EDF3F8] flex items-center justify-between">
                    <span className="text-[11.5px] font-semibold text-[#607483]">
                      {card.filesCount} tệp đính kèm
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReqId(card.id);
                        setActiveTab('workspace');
                      }}
                      className="text-[12px] font-bold text-[#0D78AE] hover:underline cursor-pointer"
                    >
                      {isReadOnly ? 'Xem chi tiết →' : 'Kê khai ngay →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Readiness & Submission Banner */}
          <div className="bg-white rounded-[13px] border border-[#DCE7EE] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#0D78AE]" />
                <h3 className="text-[15px] font-bold text-[#172A3A]">
                  {activeApp.category === 'UOM_MAM'
                    ? `Tiến độ: ${readiness.readyCount}/${readiness.totalRequired} thành phần bắt buộc`
                    : `Tiến độ hoàn thiện hồ sơ Giải thưởng “Cánh chim trắng”: ${readiness.readyCount}/3 thành phần`}
                </h3>
              </div>
              {readiness.missingReasons.length > 0 ? (
                <ul className="list-disc list-inside text-[12.5px] text-[#607483] space-y-0.5">
                  {readiness.missingReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12.5px] text-[#15803D] font-medium">
                  {activeApp.category === 'UOM_MAM'
                    ? (readiness.wb03HasData
                        ? 'Hồ sơ đã hoàn tất 2/2 thành phần bắt buộc (WB01, WB02) và đã đính kèm tài liệu minh họa (WB03).'
                        : 'Hồ sơ đã hoàn tất 2/2 thành phần bắt buộc (WB01, WB02). Bạn có thể nộp ngay hoặc bổ sung hình ảnh, sản phẩm minh họa ở WB03 (không bắt buộc).')
                    : 'Hồ sơ đã đáp ứng đầy đủ 3 thành phần theo Điều 6 Quy chế Giải thưởng Cánh chim trắng (QĐ 14-QĐ/ĐHĐN-HSV).'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveTab('workspace')}
              >
                Mở không gian kê khai
              </Button>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="primary"
                  disabled={!readiness.canSubmit}
                  onClick={handleSubmitDossier}
                >
                  <Send size={15} className="mr-1.5" />
                  Nộp hồ sơ Giải thưởng (${readiness.readyCount}/${readiness.totalRequired})
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKSPACE (WB01, WB02, WB03) */}
      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 min-w-0">
          {/* Left Rail: 3 Requirements */}
          <div className="lg:col-span-4 space-y-2.5 min-w-0">
            {(
              [
                {
                  id: 'WB01' as const,
                  badge: 'Điều 5 Quy chế',
                  title: 'WB01 · Văn bản đề nghị xét trao',
                  subtitle: 'Giới thiệu của cấp bộ Hội có thẩm quyền',
                  ready: readiness.wb01Ready,
                  files: activeApp.requirements.wb01.evidenceFiles.length,
                  isOptional: false,
                  hasOptionalData: false,
                },
                {
                  id: 'WB02' as const,
                  badge: 'Điều 6 Quy chế',
                  title: `WB02 · ${categoryMeta.wb02Title}`,
                  subtitle: 'Thuyết minh nội dung & Cam kết quy chế',
                  ready: readiness.wb02Ready,
                  files: activeApp.requirements.wb02.evidenceFiles.length,
                  isOptional: false,
                  hasOptionalData: false,
                },
                {
                  id: 'WB03' as const,
                  badge: readiness.isWb03Optional ? 'Khoản 6.1 Điều 6 (Tùy chọn)' : 'Điều 6 Quy chế',
                  title: readiness.isWb03Optional
                    ? 'WB03 · Hình ảnh, sản phẩm minh họa'
                    : `WB03 · ${categoryMeta.wb03Title}`,
                  subtitle: readiness.isWb03Optional
                    ? 'Tài liệu, sản phẩm minh họa (nếu có)'
                    : 'Bằng khen, giải thưởng & Hình ảnh thực tế',
                  ready: readiness.wb03Ready,
                  files: activeApp.requirements.wb03.evidenceFiles.length,
                  isOptional: readiness.isWb03Optional,
                  hasOptionalData: readiness.wb03HasData,
                },
              ]
            ).map((req) => {
              const isSelected = activeReqId === req.id;
              const status = getRequirementCompletionStatus(
                req.ready,
                activeApp.status,
                req.isOptional ? { isOptional: true, hasOptionalData: req.hasOptionalData } : undefined
              );
              return (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => setActiveReqId(req.id)}
                  className={`w-full text-left p-4 rounded-[12px] border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBF6FC] border-[#0D78AE] ring-2 ring-[#0D78AE]/15'
                      : 'bg-white border-[#DCE7EE] hover:bg-[#F8FBFD]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold text-[#0D78AE] uppercase">
                      {req.badge}
                    </span>
                    <span
                      className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="text-[13.5px] font-bold text-[#172A3A]">{req.title}</div>
                  <div className="text-[11.5px] text-[#607483] mt-0.5">
                    {req.subtitle} · {req.files} tệp đính kèm
                  </div>
                </button>
              );
            })}

            {/* Submit Box on Rail */}
            <div className="bg-white rounded-[12px] border border-[#DCE7EE] p-4 space-y-3">
              <div className="text-[12.5px] font-bold text-[#172A3A]">
                Gửi hồ sơ về Cơ quan Thường trực
              </div>
              <p className="text-[11.5px] text-[#607483] leading-relaxed">
                {activeApp.category === 'UOM_MAM'
                  ? 'Sau khi hoàn tất 2 thành phần bắt buộc (WB01, WB02), sinh viên nộp hồ sơ trực tuyến về Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng (WB03 là thành phần tùy chọn nếu có).'
                  : 'Sau khi hoàn tất cả 3 mục WB01, WB02, WB03, sinh viên nộp hồ sơ trực tuyến về Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng.'}
              </p>
              {!isReadOnly ? (
                <Button
                  type="button"
                  variant="primary"
                  className="w-full justify-center"
                  disabled={!readiness.canSubmit}
                  onClick={handleSubmitDossier}
                >
                  <Send size={15} className="mr-1.5" />
                  Nộp hồ sơ Giải thưởng ({readiness.readyCount}/{readiness.totalRequired})
                </Button>
              ) : (
                <div className="p-2.5 rounded-lg bg-[#E0F2FE] text-[#0369A1] text-[12px] font-bold text-center">
                  Hồ sơ đã được nộp ngày{' '}
                  {activeApp.submittedAt
                    ? new Date(activeApp.submittedAt).toLocaleDateString('vi-VN')
                    : ''}
                </div>
              )}
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-8 bg-white rounded-[14px] border border-[#DCE7EE] p-5 md:p-6 space-y-5 min-w-0">
            {activeReqId === 'WB01' && (() => {
              const wb01Data = activeApp.requirements.wb01;
              const isIndividualNominator = wb01Data.nominatingUnitType === 'UV_BCH_HSV_DHDN';
              const unitNamePlaceholder = isIndividualNominator
                ? 'VD: Đồng chí Nguyễn Văn A – Ủy viên BCH Hội Sinh viên Đại học Đà Nẵng'
                : wb01Data.nominatingUnitType === 'BCH_LIEN_CHI_HOI'
                ? 'VD: Ban Chấp hành Liên chi Hội Khoa Công nghệ Thông tin'
                : wb01Data.nominatingUnitType === 'BCN_CLB_DHDN'
                ? 'VD: Ban Chủ nhiệm CLB Sinh viên Nghiên cứu Khoa học ĐHĐN'
                : wb01Data.nominatingUnitType === 'BCN_CLB_TRUONG' ||
                  wb01Data.nominatingUnitType === 'BCN_CLB_DOI_NHOM'
                ? 'VD: Ban Chủ nhiệm CLB Học thuật & Sáng tạo DUT'
                : 'VD: Ban Thư ký Hội Sinh viên Trường Đại học Bách khoa – ĐHĐN';

              const signerPlaceholder = isIndividualNominator
                ? 'VD: Nguyễn Văn A (Ủy viên Ban Chấp hành Hội Sinh viên ĐHĐN)'
                : 'VD: Lê Văn B (Chủ tịch Hội Sinh viên Trường / Bí thư LCH)';

              const statusMeta = getRequirementCompletionStatus(readiness.wb01Ready, activeApp.status);

              return (
                <div className="space-y-4">
                  <div className="border-b border-[#EDF3F8] pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D78AE]">
                          Thành phần WB01 · Điều 5 Quy chế (QĐ 14-QĐ/ĐHĐN-HSV)
                        </span>
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${statusMeta.badgeClass}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <h2 className="text-[16px] font-bold text-[#172A3A] mt-0.5">
                        Văn bản đề nghị xét trao Giải thưởng “Cánh chim trắng”
                      </h2>
                      <p className="text-[12.5px] text-[#607483] mt-0.5 leading-relaxed">
                        Kê khai thông tin tổ chức, cá nhân có thẩm quyền đề nghị xét trao theo Điều 5 Quy chế ban hành kèm Quyết định số 14-QĐ/ĐHĐN-HSV và đính kèm văn bản đề nghị xét trao theo Khoản 6.1 Điều 6.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="wb01-nominator-subject-select"
                        className="block text-[12.5px] font-bold text-[#172A3A] mb-1.5"
                      >
                        Chủ thể đề nghị xét trao Giải thưởng (Điều 5) <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="wb01-nominator-subject-select"
                        disabled={isReadOnly}
                        value={wb01Data.nominatingUnitType}
                        onChange={(e) =>
                          handleWB01NominatorTypeChange(e.target.value as WhiteBirdNominatingUnitType)
                        }
                        className="w-full px-3 py-2.5 text-[13px] font-semibold text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE]"
                      >
                        <optgroup label="Cá nhân có thẩm quyền đề xuất (Điều 5)">
                          {WHITE_BIRD_NOMINATING_SUBJECT_OPTIONS.filter((o) => o.category === 'Cá nhân').map(
                            (opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label} ({opt.articleRef})
                              </option>
                            )
                          )}
                        </optgroup>
                        <optgroup label="Tổ chức có thẩm quyền đề xuất (Điều 5)">
                          {WHITE_BIRD_NOMINATING_SUBJECT_OPTIONS.filter((o) => o.category === 'Tổ chức').map(
                            (opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label} ({opt.articleRef})
                              </option>
                            )
                          )}
                        </optgroup>
                      </select>
                      <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                        {isIndividualNominator
                          ? 'Ủy viên Ban Chấp hành Hội Sinh viên Việt Nam Đại học Đà Nẵng là chủ thể có thẩm quyền đề xuất xét trao theo Điều 5 của Quy chế.'
                          : 'Cấp bộ Hội / Đơn vị trực thuộc có thẩm quyền đề xuất xét trao theo Điều 5 của Quy chế.'}
                      </p>
                    </div>

                    <div>
                      <Input
                        label={
                          isIndividualNominator
                            ? 'Tên cá nhân đề nghị xét trao (Ủy viên BCH HSV ĐHĐN) *'
                            : 'Tên tổ chức/cá nhân đề nghị xét trao *'
                        }
                        disabled={isReadOnly}
                        value={wb01Data.nominatingUnitName}
                        onChange={(e) =>
                          updateWhiteBirdWB01(activeApp.id, {
                            nominatingUnitName: e.target.value,
                          })
                        }
                        placeholder={unitNamePlaceholder}
                      />
                      <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                        {isIndividualNominator
                          ? 'Nhập họ tên Ủy viên Ban Chấp hành HSV ĐHĐN giới thiệu đề xuất.'
                          : 'Nhập tên Ban Thư ký HSV trường, Liên chi Hội hoặc CLB/Đội/Nhóm đề nghị.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Số hiệu văn bản đề nghị xét trao (nếu có)"
                      disabled={isReadOnly}
                      value={wb01Data.nominatingDocumentNumber}
                      onChange={(e) =>
                        updateWhiteBirdWB01(activeApp.id, {
                          nominatingDocumentNumber: e.target.value,
                        })
                      }
                      placeholder={
                        isIndividualNominator
                          ? 'VD: Giấy giới thiệu (nếu có)'
                          : 'VD: 45-TTr/HSV hoặc Số công văn'
                      }
                    />
                    <Input
                      label="Ngày ký văn bản đề nghị (nếu có)"
                      type="date"
                      disabled={isReadOnly}
                      value={wb01Data.nominatingDate}
                      onChange={(e) =>
                        updateWhiteBirdWB01(activeApp.id, {
                          nominatingDate: e.target.value,
                        })
                      }
                    />
                    <Input
                      label="Họ tên người ký văn bản đề nghị và chức vụ (nếu có)"
                      disabled={isReadOnly}
                      value={wb01Data.nominatorSignerName}
                      onChange={(e) =>
                        updateWhiteBirdWB01(activeApp.id, {
                          nominatorSignerName: e.target.value,
                        })
                      }
                      placeholder={signerPlaceholder}
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#172A3A] mb-1">
                      Tóm tắt nhận xét, đánh giá & lý do đề nghị xét trao Giải thưởng <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11.5px] text-[#64748B] mb-1.5 leading-snug">
                      <em>(Thông tin hỗ trợ kê khai trên hệ thống nhằm tổng hợp nhanh hồ sơ; không thay thế cho Văn bản đề nghị xét trao chính thức theo Khoản 6.1 Điều 6)</em>
                    </p>
                    <textarea
                      rows={3}
                      disabled={isReadOnly}
                      value={wb01Data.endorsementSummary}
                      onChange={(e) =>
                        updateWhiteBirdWB01(activeApp.id, {
                          endorsementSummary: e.target.value,
                        })
                      }
                      placeholder="Nhập tóm tắt nội dung nhận xét, đánh giá của tổ chức/cá nhân đề nghị đối với cá nhân/tập thể..."
                      className="w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE]"
                    />
                  </div>
                </div>
              );
            })()}

            {activeReqId === 'WB02' && (() => {
              const wb02Data = activeApp.requirements.wb02;
              const statusMeta = getRequirementCompletionStatus(readiness.wb02Ready, activeApp.status);

              if (activeApp.category === 'UOM_MAM') {
                const leadRep = wb02Data.leadRepresentative !== undefined
                  ? wb02Data.leadRepresentative
                  : (activeApp.nomineeType === 'COLLECTIVE' ? `${activeApp.preparedByUserName}${activeApp.studentId ? ` (${activeApp.studentId})` : ''}` : '');

                // Kiểm tra 4 tiêu chuẩn để hiển thị khuyến nghị rà soát (không hard-block submission)
                const missingStandards: { id: string; name: string }[] = [];
                if (!wb02Data.solutionAndExecution?.trim()) missingStandards.push({ id: 'wb02-sec-solution', name: 'Tính mới, sáng tạo' });
                if (!wb02Data.impactAndResults?.trim()) missingStandards.push({ id: 'wb02-sec-impact', name: 'Tính hiệu quả' });
                if (!wb02Data.scalabilityAndSpread?.trim()) missingStandards.push({ id: 'wb02-sec-scalability', name: 'Tính lan tỏa' });
                if (!wb02Data.exemplaryNature?.trim()) missingStandards.push({ id: 'wb02-sec-exemplary', name: 'Tính điển hình' });

                return (
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="border-b border-[#EDF3F8] pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D78AE]">
                            Thành phần WB02 · Điểm a khoản 4.2 Điều 4 & Khoản 6.1 Điều 6 (QĐ 14-QĐ/ĐHĐN-HSV)
                          </span>
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${statusMeta.badgeClass}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <h2 className="text-[16px] font-bold text-[#172A3A] mt-0.5">
                          WB02 · Báo cáo thuyết minh và cam kết tính sáng tạo
                        </h2>
                        <p className="text-[12.5px] text-[#607483] mt-0.5 leading-relaxed">
                          Thuyết minh chi tiết theo 4 tiêu chuẩn xét trao (Tính mới, sáng tạo; Tính hiệu quả; Tính lan tỏa; Tính điển hình) và cam kết tính sáng tạo theo Quy chế Giải thưởng.
                        </p>
                      </div>
                    </div>

                    {/* Section 1: Thông tin mô hình & Thời gian */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <Input
                          label="Tên mô hình, giải pháp, sáng kiến *"
                          disabled={isReadOnly}
                          value={wb02Data.reportTitle}
                          onChange={(e) =>
                            updateWhiteBirdWB02(activeApp.id, {
                              reportTitle: e.target.value,
                            })
                          }
                          placeholder="VD: Mô hình Số hóa Sổ tay Sinh viên 5 tốt & Ngân hàng Minh chứng trực tuyến"
                        />
                      </div>
                      <Input
                        label="Thời gian triển khai thực tế *"
                        disabled={isReadOnly}
                        value={wb02Data.implementationPeriod}
                        onChange={(e) =>
                          updateWhiteBirdWB02(activeApp.id, {
                            implementationPeriod: e.target.value,
                          })
                        }
                        placeholder="VD: Tháng 10/2024 – Tháng 05/2025"
                      />
                    </div>

                    {/* Tóm tắt thông tin người phụ trách & Liên hệ */}
                    <div className="p-3.5 rounded-[12px] bg-[#F8FBFD] border border-[#DCE7EE] flex flex-wrap items-center justify-between gap-3 text-[12px]">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-[#0D78AE]" />
                        <span className="text-[#64748B]">Đơn vị:</span>
                        <strong className="text-[#172A3A]">{activeApp.institutionName}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-[#0D78AE]" />
                        <span className="text-[#64748B]">Người lập hồ sơ:</span>
                        <strong className="text-[#172A3A]">
                          {activeApp.preparedByUserName} {activeApp.studentId ? `(${activeApp.studentId})` : ''}
                        </strong>
                      </div>
                      {(currentEmail || studentProfileSnapshot?.email) && (
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-[#0D78AE]" />
                          <span className="text-[#64748B]">Email:</span>
                          <span className="text-[#334155]">{currentEmail || studentProfileSnapshot?.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Section Thông tin Người chịu trách nhiệm chính & Thành viên (Tập thể/Nhóm) */}
                    {activeApp.nomineeType === 'COLLECTIVE' ? (
                      <div className="p-4 rounded-[12px] bg-[#F8FBFD] border border-[#DCE7EE] space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold uppercase tracking-wider text-[#0D78AE]">
                            Thông tin ban điều hành / nhóm tác giả mô hình
                          </span>
                          <span className="text-[11.5px] text-[#64748B]">
                            Tập thể đề cử: <strong className="text-[#172A3A]">{activeApp.nomineeName}</strong>
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          <div>
                            <Input
                              label="Họ tên người chịu trách nhiệm chính của mô hình *"
                              disabled={isReadOnly}
                              value={leadRep}
                              onChange={(e) =>
                                updateWhiteBirdWB02(activeApp.id, {
                                  leadRepresentative: e.target.value,
                                })
                              }
                              placeholder="VD: Nguyễn Văn A (MSSV 102220084, Trưởng nhóm / Chủ nhiệm CLB)"
                            />
                            <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                              Theo Mẫu báo cáo, hồ sơ cần ghi rõ họ tên và vai trò của người trực tiếp chịu trách nhiệm chính điều hành mô hình.
                            </p>
                          </div>
                          <div>
                            <label className="block text-[12.5px] font-bold text-[#172A3A] mb-1">
                              Các thành viên khác trong ban điều hành / nhóm tác giả (nếu có)
                            </label>
                            <textarea
                              rows={3}
                              disabled={isReadOnly}
                              value={wb02Data.coAuthorsOrTeamMembers}
                              onChange={(e) =>
                                updateWhiteBirdWB02(activeApp.id, {
                                  coAuthorsOrTeamMembers: e.target.value,
                                })
                              }
                              placeholder="Họ và tên – Vai trò – Đơn vị (mỗi thành viên trên một dòng)&#10;VD:&#10;Nguyễn Văn A – Đồng tác giả – Khoa CNTT, Trường ĐH Bách khoa&#10;Trần Thị B – Kỹ thuật – CLB Học thuật"
                              className="w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE] resize-y min-h-[85px] max-h-[220px]"
                            />
                            <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                              Nhập danh sách các thành viên khác trong ban điều hành / nhóm tác giả (nếu có). Không cần nhập lại người chịu trách nhiệm chính.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[12.5px] font-bold text-[#172A3A] mb-1">
                          Các thành viên khác / Người hỗ trợ (nếu có)
                        </label>
                        <textarea
                          rows={2}
                          disabled={isReadOnly}
                          value={wb02Data.coAuthorsOrTeamMembers}
                          onChange={(e) =>
                            updateWhiteBirdWB02(activeApp.id, {
                              coAuthorsOrTeamMembers: e.target.value,
                            })
                          }
                          placeholder="Họ và tên – Vai trò – Đơn vị (nếu có hỗ trợ triển khai mô hình)"
                          className="w-full px-3.5 py-2 text-[12.5px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE] resize-y min-h-[65px]"
                        />
                      </div>
                    )}

                    {/* Bối cảnh, sự cần thiết & mục tiêu (Thông tin bổ sung - Giản lược & bảo toàn dữ liệu) */}
                    <div className="p-3.5 rounded-[11px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[12.5px] font-bold text-[#334155]">
                          Bối cảnh và mục tiêu hình thành (Thông tin bổ sung)
                        </label>
                        <span className="text-[11px] text-[#64748B] italic">Không bắt buộc</span>
                      </div>
                      <p className="text-[11.5px] text-[#64748B] leading-snug">
                        Tóm tắt bối cảnh thực tiễn công tác Hội và phong trào sinh viên tại cơ sở cùng mục tiêu hướng tới để làm rõ hơn tính mới, sáng tạo.
                      </p>
                      <textarea
                        rows={2}
                        disabled={isReadOnly}
                        value={wb02Data.contextAndObjectives}
                        onChange={(e) =>
                          updateWhiteBirdWB02(activeApp.id, {
                            contextAndObjectives: e.target.value,
                          })
                        }
                        placeholder="Trình bày ngắn gọn bối cảnh và lý do ra đời của mô hình, sáng kiến..."
                        className="w-full px-3.5 py-2 text-[12.5px] text-[#172A3A] bg-white border border-[#CBD5E1] rounded-[8px] focus:outline-none focus:border-[#0D78AE] resize-y min-h-[65px]"
                      />
                    </div>

                    {/* Banner Khuyến nghị 4 tiêu chuẩn (Khi có tiêu chuẩn chưa có nội dung) */}
                    {missingStandards.length > 0 && (
                      <div className="p-3.5 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] text-[12.5px] flex items-start gap-2.5">
                        <Info size={16} className="text-[#3B82F6] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold">Khuyến nghị hoàn thiện nội dung thuyết minh:</span>
                          <p className="text-[12px] text-[#1E3A8A]">
                            Bạn chưa thuyết minh đầy đủ 4 tiêu chuẩn xét trao theo Điểm a khoản 4.2 Điều 4. Vui lòng rà soát các mục còn trống:
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {missingStandards.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(item.id);
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    el.focus();
                                  }
                                }}
                                className="px-2.5 py-1 rounded-md bg-white border border-[#93C5FD] text-[11.5px] font-semibold text-[#1D4ED8] hover:bg-[#DBEAFE] cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              >
                                <span>→ {item.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section 3: 4 Tiêu chuẩn Thuyết minh theo Điểm a khoản 4.2 Điều 4 */}
                    <div className="space-y-4 pt-1">
                      <div className="border-b border-[#EDF3F8] pb-1.5">
                        <h3 className="text-[13.5px] font-extrabold text-[#172A3A] uppercase tracking-wide">
                          Thuyết minh chi tiết theo 4 tiêu chuẩn xét trao (Điểm a khoản 4.2 Điều 4)
                        </h3>
                      </div>

                      {/* Tiêu chuẩn 1: Tính mới, sáng tạo */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="wb02-sec-solution"
                          className="block text-[12.5px] font-bold text-[#172A3A]"
                        >
                          1. Tính mới, sáng tạo của mô hình, giải pháp, sáng kiến <span className="text-red-500">*</span>
                        </label>
                        <p className="text-[11.5px] text-[#64748B] leading-snug">
                          Mô tả nội dung mới của mô hình, giải pháp, sáng kiến; điểm khác biệt, cải tiến so với các hình thức tương tự đã áp dụng trong công tác Hội và phong trào sinh viên trước ngày nộp hồ sơ.
                        </p>
                        <textarea
                          id="wb02-sec-solution"
                          rows={4}
                          disabled={isReadOnly}
                          value={wb02Data.solutionAndExecution}
                          onChange={(e) =>
                            updateWhiteBirdWB02(activeApp.id, {
                              solutionAndExecution: e.target.value,
                            })
                          }
                          placeholder="Trình bày chi tiết tính mới của giải pháp, phương thức triển khai mới, ứng dụng chuyển đổi số hoặc sáng kiến nổi bật so với các cách làm trước đây..."
                          className="w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE] resize-y min-h-[100px]"
                        />
                      </div>

                      {/* Tiêu chuẩn 2: Tính hiệu quả */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="wb02-sec-impact"
                          className="block text-[12.5px] font-bold text-[#172A3A]"
                        >
                          2. Quá trình triển khai và tính hiệu quả thực tiễn <span className="text-red-500">*</span>
                        </label>
                        <p className="text-[11.5px] text-[#64748B] leading-snug">
                          Mô tả quá trình triển khai, kết quả áp dụng vào thực tiễn công tác Hội và phong trào sinh viên; sự ghi nhận của lãnh đạo địa phương hoặc đơn vị cùng cấp; mức độ hưởng ứng tích cực của sinh viên (khuyến khích kèm số liệu thực tế nếu có).
                        </p>
                        <textarea
                          id="wb02-sec-impact"
                          rows={4}
                          disabled={isReadOnly}
                          value={wb02Data.impactAndResults}
                          onChange={(e) =>
                            updateWhiteBirdWB02(activeApp.id, {
                              impactAndResults: e.target.value,
                            })
                          }
                          placeholder="Trình bày kết quả áp dụng cụ thể vào thực tiễn, số lượng hội viên sinh viên tham gia/hưởng ứng, đánh giá và ghi nhận của lãnh đạo đơn vị, tác động tích cực đến phong trào..."
                          className="w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE] resize-y min-h-[100px]"
                        />
                      </div>

                      {/* Tiêu chuẩn 3: Tính lan tỏa */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="wb02-sec-scalability"
                          className="block text-[12.5px] font-bold text-[#172A3A]"
                        >
                          3. Khả năng lan tỏa và nhân rộng
                        </label>
                        <p className="text-[11.5px] text-[#64748B] leading-snug">
                          Trình bày khả năng nghiên cứu triển khai mô hình, giải pháp, sáng kiến trong phạm vi rộng hơn (trong trường thành viên, các liên chi hội, cụm thi đua hoặc toàn ĐHĐN).
                        </p>
                        <textarea
                          id="wb02-sec-scalability"
                          rows={3}
                          disabled={isReadOnly}
                          value={wb02Data.scalabilityAndSpread || ''}
                          onChange={(e) =>
                            updateWhiteBirdWB02(activeApp.id, {
                              scalabilityAndSpread: e.target.value,
                            })
                          }
                          placeholder="Nêu rõ tiềm năng, điều kiện và phương án để mô hình có thể được chuyển giao, nhân rộng và áp dụng hiệu quả cho các đơn vị bạn..."
                          className="w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE] resize-y min-h-[85px]"
                        />
                      </div>

                      {/* Tiêu chuẩn 4: Tính điển hình */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="wb02-sec-exemplary"
                          className="block text-[12.5px] font-bold text-[#172A3A]"
                        >
                          4. Tính điển hình, tiêu biểu của mô hình
                        </label>
                        <p className="text-[11.5px] text-[#64748B] leading-snug">
                          Làm rõ tính tiêu biểu của mô hình, giải pháp, sáng kiến so với các mô hình, giải pháp, sáng kiến cùng cấp, cùng nội dung và lĩnh vực áp dụng.
                        </p>
                        <textarea
                          id="wb02-sec-exemplary"
                          rows={3}
                          disabled={isReadOnly}
                          value={wb02Data.exemplaryNature || ''}
                          onChange={(e) =>
                            updateWhiteBirdWB02(activeApp.id, {
                              exemplaryNature: e.target.value,
                            })
                          }
                          placeholder="Phân tích tính tiêu biểu, nổi trội của mô hình so với các hoạt động tương tự trong năm học..."
                          className="w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE] resize-y min-h-[85px]"
                        />
                      </div>
                    </div>

                    {/* Section 4: Cam kết tính sáng tạo */}
                    <div className="space-y-2 pt-2 border-t border-[#EDF3F8]">
                      <label className="flex items-start gap-2.5 p-3.5 rounded-[10px] bg-[#F4F9FD] border border-[#CBE4F5] hover:bg-[#EBF6FC] transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          checked={Boolean(wb02Data.commitmentConfirmed)}
                          onChange={(e) =>
                            updateWhiteBirdWB02(activeApp.id, {
                              commitmentConfirmed: e.target.checked,
                            })
                          }
                          className="mt-1 w-4 h-4 accent-[#0D78AE]"
                        />
                        <span className="text-[12.5px] font-semibold text-[#172A3A] leading-relaxed">
                          Tôi/Đại diện tập thể cam kết thông tin trong báo cáo là trung thực, mô hình, giải pháp, sáng kiến được kê khai có tính sáng tạo và chịu trách nhiệm về nội dung cung cấp.
                        </span>
                      </label>
                      <p className="text-[11.5px] text-[#64748B] leading-snug">
                        * Lời cam kết về tính sáng tạo là thành phần bắt buộc trong Báo cáo thuyết minh theo Khoản 6.1 Điều 6 Quy chế.
                      </p>
                    </div>
                  </div>
                );
              }

              // Fallback for TRUYEN_LUA and SANG_TAO
              return (
                <div className="space-y-4">
                  <div className="border-b border-[#EDF3F8] pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D78AE]">
                          Thành phần WB02 · {categoryMeta.articleRef}
                        </span>
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${statusMeta.badgeClass}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <h2 className="text-[16px] font-bold text-[#172A3A] mt-0.5">
                        {categoryMeta.wb02Title}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <Input
                        label={
                          activeApp.category === 'TRUYEN_LUA'
                            ? 'Tiêu đề báo cáo thành tích cá nhân nhiều năm liền *'
                            : 'Tên dự án khởi nghiệp / Đề tài nghiên cứu khoa học *'
                        }
                        disabled={isReadOnly}
                        value={wb02Data.reportTitle}
                        onChange={(e) =>
                          updateWhiteBirdWB02(activeApp.id, {
                            reportTitle: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Input
                      label="Giai đoạn triển khai / cống hiến *"
                      disabled={isReadOnly}
                      value={wb02Data.implementationPeriod}
                      onChange={(e) =>
                        updateWhiteBirdWB02(activeApp.id, {
                          implementationPeriod: e.target.value,
                        })
                      }
                      placeholder="VD: 2023 – 2026"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#172A3A] mb-1.5">
                      {activeApp.category === 'TRUYEN_LUA'
                        ? 'Quá trình giữ chức vụ và rèn luyện, phấn đấu trong nhiều năm liền'
                        : 'Bối cảnh xuất phát, tính cấp thiết và mục tiêu của dự án / đề tài'}
                    </label>
                    <textarea
                      rows={3}
                      disabled={isReadOnly}
                      value={wb02Data.contextAndObjectives}
                      onChange={(e) =>
                        updateWhiteBirdWB02(activeApp.id, {
                          contextAndObjectives: e.target.value,
                        })
                      }
                      placeholder="Trình bày bối cảnh, mục tiêu hoặc các cột mốc rèn luyện..."
                      className="w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE] resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#172A3A] mb-1.5">
                      {activeApp.category === 'TRUYEN_LUA'
                        ? 'Các đóng góp tiêu biểu cho sự phát triển chung của công tác Hội và phong trào sinh viên ĐHĐN *'
                        : 'Nội dung khoa học, công nghệ, điểm đổi mới sáng tạo và tính thiết thực của dự án / đề tài *'}
                    </label>
                    <textarea
                      rows={4}
                      disabled={isReadOnly}
                      value={wb02Data.solutionAndExecution}
                      onChange={(e) =>
                        updateWhiteBirdWB02(activeApp.id, {
                          solutionAndExecution: e.target.value,
                        })
                      }
                      placeholder="Mô tả chi tiết nội dung triển khai..."
                      className="w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE] resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#172A3A] mb-1.5">
                      {activeApp.category === 'TRUYEN_LUA'
                        ? 'Hiệu quả và thành tích cụ thể đã đạt được *'
                        : 'Kết quả định lượng đạt được, hiệu quả thực tiễn & khả năng ứng dụng *'}
                    </label>
                    <textarea
                      rows={3}
                      disabled={isReadOnly}
                      value={wb02Data.impactAndResults}
                      onChange={(e) =>
                        updateWhiteBirdWB02(activeApp.id, {
                          impactAndResults: e.target.value,
                        })
                      }
                      placeholder="VD: Thu hút hơn 2.500 hội viên sinh viên tham gia..."
                      className="w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE] resize-y"
                    />
                  </div>

                  {activeApp.nomineeType === 'COLLECTIVE' && (
                    <Input
                      label="Danh sách thành viên nhóm tác giả / Ban điều hành tập thể"
                      disabled={isReadOnly}
                      value={wb02Data.coAuthorsOrTeamMembers}
                      onChange={(e) =>
                        updateWhiteBirdWB02(activeApp.id, {
                          coAuthorsOrTeamMembers: e.target.value,
                        })
                      }
                      placeholder="Nhập họ tên, MSSV, vai trò các thành viên chính..."
                    />
                  )}

                  <label className="flex items-start gap-2.5 p-3.5 rounded-[10px] bg-[#F4F9FD] border border-[#CBE4F5] cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      checked={Boolean(wb02Data.commitmentConfirmed)}
                      onChange={(e) =>
                        updateWhiteBirdWB02(activeApp.id, {
                          commitmentConfirmed: e.target.checked,
                        })
                      }
                      className="mt-1 w-4 h-4 accent-[#0D78AE]"
                    />
                    <span className="text-[12.5px] font-semibold text-[#172A3A] leading-relaxed">
                      {categoryMeta.wb02CommitmentLabel}
                    </span>
                  </label>
                </div>
              );
            })()}

            {activeReqId === 'WB03' && (() => {
              const wb03Data = activeApp.requirements.wb03;
              const statusMeta = getRequirementCompletionStatus(
                readiness.wb03Ready,
                activeApp.status,
                readiness.isWb03Optional ? { isOptional: true, hasOptionalData: readiness.wb03HasData } : undefined
              );

              if (activeApp.category === 'UOM_MAM') {
                return (
                  <div className="space-y-4">
                    <div className="border-b border-[#EDF3F8] pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D78AE]">
                            Thành phần WB03 · Khoản 6.1 Điều 6 (QĐ 14-QĐ/ĐHĐN-HSV) · Tùy chọn
                          </span>
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${statusMeta.badgeClass}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <h2 className="text-[16px] font-bold text-[#172A3A] mt-0.5">
                          WB03 – Hình ảnh, sản phẩm minh họa (nếu có)
                        </h2>
                        <p className="text-[12.5px] text-[#607483] mt-0.5 leading-relaxed">
                          Bạn có thể bổ sung hình ảnh, sản phẩm hoặc tài liệu minh họa cho mô hình, giải pháp, sáng kiến. Thành phần này không bắt buộc.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12.5px] font-bold text-[#172A3A] mb-1.5">
                        Mô tả hình ảnh, sản phẩm minh họa (nếu có)
                      </label>
                      <textarea
                        rows={3}
                        disabled={isReadOnly}
                        value={wb03Data.awardOrRecognitionSummary}
                        onChange={(e) =>
                          updateWhiteBirdWB03(activeApp.id, {
                            awardOrRecognitionSummary: e.target.value,
                          })
                        }
                        placeholder="Mô tả khái quát về các hình ảnh hoạt động, sản phẩm mẫu hoặc bài báo minh họa đính kèm (nếu có)..."
                        className="w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE] resize-y min-h-[80px]"
                      />
                    </div>

                    <Input
                      label="Liên kết hình ảnh, video, sản phẩm hoặc tài liệu minh họa (nếu có)"
                      disabled={isReadOnly}
                      value={wb03Data.mediaAndProductLinks}
                      onChange={(e) =>
                        updateWhiteBirdWB03(activeApp.id, {
                          mediaAndProductLinks: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                );
              }

              // Fallback for TRUYEN_LUA and SANG_TAO (Mandatory WB03)
              return (
                <div className="space-y-4">
                  <div className="border-b border-[#EDF3F8] pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D78AE]">
                          Thành phần WB03 · {categoryMeta.articleRef}
                        </span>
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${statusMeta.badgeClass}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <h2 className="text-[16px] font-bold text-[#172A3A] mt-0.5">
                        {categoryMeta.wb03Title}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Cấp công nhận / giải thưởng cao nhất đạt được *"
                      disabled={isReadOnly}
                      value={activeApp.requirements.wb03.highestAwardLevel}
                      onChange={(e) =>
                        updateWhiteBirdWB03(activeApp.id, {
                          highestAwardLevel: e.target.value,
                        })
                      }
                      placeholder="VD: Giải Nhất cấp Đại học Đà Nẵng / Bằng khen HSV ĐHĐN"
                    />
                    <Input
                      label="Số quyết định / Số giấy chứng nhận & Ngày cấp"
                      disabled={isReadOnly}
                      value={activeApp.requirements.wb03.decisionNumbersAndDates}
                      onChange={(e) =>
                        updateWhiteBirdWB03(activeApp.id, {
                          decisionNumbersAndDates: e.target.value,
                        })
                      }
                      placeholder="VD: QĐ số 189/QĐ-ĐHĐN ngày 15/05/2026"
                    />
                  </div>

                  <div>
                    <label className="block text-[12.5px] font-bold text-[#172A3A] mb-1.5">
                      {activeApp.category === 'TRUYEN_LUA'
                        ? 'Danh mục Quyết định chức vụ Hội, Bằng khen, Giấy khen và thành tích tiêu biểu *'
                        : 'Tóm tắt giải thưởng đạt được (từ cấp ĐHĐN trở lên) và minh chứng ứng dụng thực tế *'}
                    </label>
                    <textarea
                      rows={4}
                      disabled={isReadOnly}
                      value={activeApp.requirements.wb03.awardOrRecognitionSummary}
                      onChange={(e) =>
                        updateWhiteBirdWB03(activeApp.id, {
                          awardOrRecognitionSummary: e.target.value,
                        })
                      }
                      placeholder="Liệt kê rõ tên giải thưởng, bằng khen, quyết định công nhận hoặc kết quả nghiệm thu..."
                      className="w-full px-3.5 py-2.5 text-[13px] text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE]"
                    />
                  </div>

                  <Input
                    label="Liên kết hình ảnh hoạt động, sản phẩm mẫu, bài báo hoặc video minh họa (nếu có)"
                    disabled={isReadOnly}
                    value={activeApp.requirements.wb03.mediaAndProductLinks}
                    onChange={(e) =>
                      updateWhiteBirdWB03(activeApp.id, {
                        mediaAndProductLinks: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
              );
            })()}

            {/* Evidence Attachments Section for Current Requirement */}
            <div className="pt-4 border-t border-[#EDF3F8] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-[13.5px] font-bold text-[#172A3A]">
                    {activeReqId === 'WB03' && activeApp.category === 'UOM_MAM'
                      ? 'Tệp minh họa đính kèm (nếu có)'
                      : activeReqId === 'WB02' && activeApp.category === 'UOM_MAM'
                      ? 'Báo cáo thuyết minh theo mẫu và minh chứng về tính hiệu quả'
                      : `Tệp minh chứng đính kèm cho ${activeReqId}`}
                  </h3>
                  <p className="text-[11.5px] text-[#607483]">
                    {activeReqId === 'WB03' && activeApp.category === 'UOM_MAM'
                      ? 'Hỗ trợ hình ảnh, tài liệu minh họa (PDF, JPG, PNG, DOCX, XLSX – Tối đa 25MB/tệp, không bắt buộc)'
                      : activeReqId === 'WB02' && activeApp.category === 'UOM_MAM'
                      ? 'Đính kèm Báo cáo thuyết minh theo mẫu (có cam kết tính sáng tạo) cùng các minh chứng về tính hiệu quả thực tiễn (Khoản 6.1 Điều 6).'
                      : 'Hỗ trợ PDF, JPG, PNG, DOCX, XLSX (Tối đa 25MB/tệp)'}
                  </p>
                </div>
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isUploading}
                    onClick={() => triggerUploadForReq(activeReqId)}
                  >
                    <Upload size={14} className="mr-1.5" />
                    {isUploading
                      ? 'Đang tải lên...'
                      : activeReqId === 'WB03' && activeApp.category === 'UOM_MAM'
                      ? 'Tải tệp minh họa WB03 (nếu có)'
                      : `Tải tệp minh chứng ${activeReqId}`}
                  </Button>
                )}
              </div>

              {(() => {
                const reqKey = activeReqId.toLowerCase() as 'wb01' | 'wb02' | 'wb03';
                const files = activeApp.requirements[reqKey].evidenceFiles || [];
                if (files.length === 0) {
                  return (
                    <div className="p-5 rounded-[10px] border border-dashed border-[#C8D9E6] bg-[#F8FBFD] text-center text-[12.5px] text-[#607483]">
                      {activeReqId === 'WB03' && activeApp.category === 'UOM_MAM' ? (
                        <span>
                          Chưa đính kèm hình ảnh hoặc sản phẩm minh họa. Bạn có thể nhấn{' '}
                          <strong>“Tải tệp minh họa WB03 (nếu có)”</strong> để bổ sung tài liệu minh
                          họa cho mô hình (thành phần này không bắt buộc).
                        </span>
                      ) : (
                        <span>
                          Chưa có tệp minh chứng nào cho {activeReqId}. Nhấn{' '}
                          <strong>“Tải tệp minh chứng {activeReqId}”</strong> để đính kèm hồ sơ.
                        </span>
                      )}
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-[9px] bg-[#F8FBFD] border border-[#DCE7EE]"
                      >
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-[#172A3A] truncate">
                            {file.name}
                          </div>
                          <div className="text-[11px] text-[#607483]">
                            {file.fileType.toUpperCase()} · {file.size} · Tải lên {file.uploadedAt}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(file)}
                            className="px-2.5 py-1 rounded-md text-[12px] font-semibold bg-white border border-[#DCE7EE] text-[#0D78AE] hover:bg-[#EBF6FC] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={13} /> Xem
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(file)}
                            className="px-2.5 py-1 rounded-md text-[12px] font-semibold bg-white border border-[#DCE7EE] text-[#475569] hover:bg-[#F1F5F9] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download size={13} /> Tải
                          </button>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => handleDeleteEvidence(activeReqId, file.id)}
                              className="p-1.5 rounded-md text-[#DC2626] hover:bg-[#FEE2E2] cursor-pointer"
                              title="Xóa tệp"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EVIDENCE REPOSITORY */}
      {activeTab === 'evidence' && (
        <div className="bg-white rounded-[14px] border border-[#DCE7EE] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[#172A3A]">
                Kho minh chứng Giải thưởng “Cánh chim trắng” ({allEvidenceFiles.length} tệp)
              </h2>
              <p className="text-[12.5px] text-[#607483]">
                Tổng hợp toàn bộ văn bản đề nghị (WB01), báo cáo thuyết minh (WB02) và minh chứng
                giải thưởng / hiệu quả (WB03).
              </p>
            </div>
          </div>

          {allEvidenceFiles.length === 0 ? (
            <div className="p-8 text-center rounded-[12px] bg-[#F8FBFD] border border-dashed border-[#C8D9E6] text-[13px] text-[#607483]">
              Chưa có tệp minh chứng nào được tải lên.
            </div>
          ) : (
            <div className="space-y-2">
              {allEvidenceFiles.map((file) => (
                <div
                  key={`${file.reqId}-${file.id}`}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-[10px] bg-[#F8FBFD] border border-[#DCE7EE]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#E5F5FC] text-[#0D78AE]">
                      {file.reqId}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold text-[#172A3A] truncate">
                        {file.name}
                      </div>
                      <div className="text-[11.5px] text-[#607483]">
                        {file.fileType.toUpperCase()} · {file.size} · Ngày tải lên: {file.uploadedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(file)}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-white border border-[#DCE7EE] text-[#0D78AE] hover:bg-[#EBF6FC] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} /> Xem trực tiếp
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(file)}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-white border border-[#DCE7EE] text-[#475569] hover:bg-[#F1F5F9] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={13} /> Tải xuống
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: RESULTS */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-[14px] border border-[#DCE7EE] p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-[11px] bg-[#E5F5FC] text-[#0D78AE] flex items-center justify-center shrink-0">
              {activeApp.status === 'recognized' ? (
                <Award size={22} />
              ) : activeApp.status === 'submitted' ||
                activeApp.status === 'under_review' ||
                activeApp.status === 'supplement_returned' ||
                activeApp.status === 'awaiting_committee' ? (
                <Clock size={22} />
              ) : (
                <AlertCircle size={22} />
              )}
            </div>
            <div className="space-y-2 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D78AE]">
                Hội đồng xét duyệt Giải thưởng “Cánh chim trắng” · Hội Sinh viên Việt Nam ĐHĐN
              </span>
              <h2 className="text-[17px] font-extrabold text-[#172A3A] mt-0.5">
                {statusBadge.label}
              </h2>
              <p className="text-[13px] text-[#55697B] mt-1 leading-relaxed">
                {activeApp.status === 'draft'
                  ? 'Hồ sơ hiện đang ở trạng thái Bản nháp. Vui lòng hoàn tất đủ 3 mục WB01, WB02, WB03 và nhấn “Nộp về Văn phòng HSV ĐHĐN” để gửi thẳng hồ sơ lên Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng.'
                  : activeApp.status === 'recognized'
                  ? `Chúc mừng! Đề cử "${activeApp.nominationTitle}" (${categoryMeta.name}) đã được Hội đồng xét duyệt cấp Đại học Đà Nẵng quyết định trao Giải thưởng “Cánh chim trắng” (${
                      activeApp.decisionNumber || 'Quyết định của Ban Thư ký HSV ĐHĐN'
                    }).`
                  : activeApp.status === 'not_recognized'
                  ? 'Hội đồng xét duyệt cấp Đại học Đà Nẵng đã hoàn tất phiên họp xét chọn. Hồ sơ đề cử chưa đạt Giải thưởng trong kỳ xét này.'
                  : 'Hồ sơ đề cử đã được nộp thẳng và tiếp nhận tại Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng (Cơ quan Thường trực Giải thưởng) để thẩm định và trình Hội đồng xét duyệt Giải thưởng Cánh chim trắng.'}
              </p>
              {(activeApp.councilNote || activeApp.decisionNumber) && (
                <div className="p-3.5 rounded-[10px] bg-[#F8FBFD] border border-[#DCE7EE] text-[12.5px] text-[#334155] space-y-1">
                  {activeApp.decisionNumber && (
                    <div>
                      <strong>Số Quyết định:</strong> {activeApp.decisionNumber}
                      {activeApp.decisionDate
                        ? ` · Ngày ban hành: ${new Date(
                            activeApp.decisionDate
                          ).toLocaleDateString('vi-VN')}`
                        : ''}
                    </div>
                  )}
                  {activeApp.councilNote && (
                    <div>
                      <strong>Nhận xét / Kết luận của Hội đồng cấp ĐHĐN:</strong>{' '}
                      {activeApp.councilNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <CollectiveDocumentPreviewModal
        previewFile={previewFile}
        previewBlobUrl={previewBlobUrl}
        isLoadingPreview={isLoadingPreview}
        onClose={handleClosePreview}
        onDownload={handleDownloadFile}
      />

      {/* Create New Nomination Modal */}
      <CreateWhiteBirdModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        initialUserName={effectiveUserName}
        initialUserEmail={effectiveEmail}
        initialStudentId={effectiveStudentId}
        initialUniversity={effectiveUniversity}
        initialInstitutionId={studentProfileSnapshot?.institutionId}
        initialClassName={studentProfileSnapshot?.className}
        initialPhone={studentProfileSnapshot?.phoneNumber}
      />
    </div>
  );
};
