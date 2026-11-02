/**
 * 5TOT Đại học Đà Nẵng — Giải thưởng "Cánh chim trắng" Store & Backend Sync
 * Căn cứ Quyết định số 14-QĐ/ĐHĐN-HSV ngày 04/10/2022 của Ban Thư ký Hội Sinh viên Việt Nam Đại học Đà Nẵng.
 * Hồ sơ Giải thưởng Cánh chim trắng được nộp thẳng lên Văn phòng Hội Sinh viên Việt Nam Đại học Đà Nẵng.
 */

import { isBackendMode } from '../../shared/config/executionMode';
import { apiRequest } from '../../shared/api/httpClient';
import {
  WhiteBirdApplication,
  WhiteBirdCategory,
  WhiteBirdEvidenceItem,
  WhiteBirdNomineeType,
  WhiteBirdRequirementId,
  WhiteBirdRequirementJudgment,
  WhiteBirdWB01Declaration,
  WhiteBirdWB02Declaration,
  WhiteBirdWB03Declaration,
  WhiteBirdTruyenLuaEvidenceCategory,
  WHITE_BIRD_TRUYEN_LUA_CATEGORY_LABELS,
  isValidOptionalHttpUrl,
} from './whiteBirdTypes';

const LOCAL_STORAGE_KEY = '5tot_white_bird_applications_store';

type StoreListener = () => void;
const listeners = new Set<StoreListener>();

function notifyListeners(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToWhiteBirdStore(listener: StoreListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function loadFromStorage(): WhiteBirdApplication[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let storeApps: WhiteBirdApplication[] = loadFromStorage();

function saveToStorage(apps: WhiteBirdApplication[]): void {
  storeApps = apps;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps));
    } catch {
      // ignore storage quota errors
    }
  }
  notifyListeners();
}

function syncAppToBackend(app: WhiteBirdApplication): void {
  if (!isBackendMode()) return;
  apiRequest<{ success: boolean; data: WhiteBirdApplication }>(
    `/api/v2/portal/white-bird/applications/${encodeURIComponent(app.id)}`,
    {
      method: 'PUT',
      body: { application: app },
    }
  ).catch(() => {});
}

export function getAllWhiteBirdApplications(): WhiteBirdApplication[] {
  return [...storeApps];
}

/**
 * Trả về danh sách hồ sơ Giải thưởng Cánh chim trắng đã nộp thẳng lên Đại học Đà Nẵng.
 * Tuyệt đối không hiển thị hồ sơ đang lưu nháp ('draft') của sinh viên ở cổng cán bộ / Hội đồng ĐHĐN.
 */
export function getSubmittedWhiteBirdApplicationsForUdn(): WhiteBirdApplication[] {
  return storeApps.filter((app) => app.status !== 'draft');
}

export async function hydrateWhiteBirdStore(): Promise<WhiteBirdApplication[]> {
  if (!isBackendMode()) {
    storeApps = loadFromStorage();
    notifyListeners();
    return storeApps;
  }
  try {
    const res = await apiRequest<{ success: boolean; data: WhiteBirdApplication[] }>(
      '/api/v2/portal/white-bird/applications'
    );
    if (res && Array.isArray(res.data)) {
      const validRecords = res.data.filter((remote) => Boolean(remote?.id));
      saveToStorage(validRecords);
    }
  } catch {
    // fallback to local storage
  }
  return storeApps;
}

export function createWhiteBirdApplication(payload: {
  nominationTitle: string;
  category: WhiteBirdCategory;
  nomineeType: WhiteBirdNomineeType;
  nomineeName: string;
  studentId: string;
  institutionId: string;
  institutionName: string;
  schoolReviewUnitId: string;
  schoolReviewUnitName: string;
  facultyName: string;
  className: string;
  academicYear?: string;
  contactPhone: string;
  preparedByUserId: string;
  preparedByUserName: string;
  preparedByUserEmail: string;
}): WhiteBirdApplication {
  const now = new Date().toISOString();
  const id = `CCT-2026-DN-${Date.now().toString(36).toUpperCase()}`;
  const academicYear = payload.academicYear || '2025–2026';
  const resolvedNominationTitle =
    payload.category === 'TRUYEN_LUA'
      ? (payload.nominationTitle?.trim() || `Báo cáo thành tích cá nhân – ${payload.nomineeName.trim()}`)
      : payload.nominationTitle.trim();

  const newApp: WhiteBirdApplication = {
    id,
    nominationTitle: resolvedNominationTitle,
    category: payload.category,
    nomineeType: payload.category === 'TRUYEN_LUA' ? 'INDIVIDUAL' : payload.nomineeType,
    nomineeName: payload.nomineeName.trim(),
    studentId: (payload.studentId || '').trim(),
    institutionId: payload.institutionId,
    institutionName: payload.institutionName,
    schoolReviewUnitId: payload.schoolReviewUnitId || `unit-${payload.institutionId.toLowerCase()}`,
    schoolReviewUnitName: payload.schoolReviewUnitName || `Hội Sinh viên ${payload.institutionName}`,
    facultyName: (payload.facultyName || '').trim(),
    className: (payload.className || '').trim(),
    academicYear,
    contactPhone: (payload.contactPhone || '').trim(),
    preparedByUserId: payload.preparedByUserId,
    preparedByUserName: payload.preparedByUserName,
    preparedByUserEmail: payload.preparedByUserEmail,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    wb01Judgment: 'not_reviewed',
    wb02Judgment: 'not_reviewed',
    wb03Judgment: 'not_reviewed',
    requirements: {
      wb01: {
        nominatingUnitType: 'BTK_HSV_TRUONG',
        nominatingUnitName: `Ban Thư ký Hội Sinh viên ${payload.institutionName}`,
        nominatingDocumentNumber: '',
        nominatingDate: '',
        nominatorSignerName: '',
        endorsementSummary: '',
        evidenceFiles: [],
      },
      wb02: {
        reportTitle:
          payload.category === 'TRUYEN_LUA'
            ? `Báo cáo thành tích cá nhân – ${payload.nomineeName.trim()}`
            : resolvedNominationTitle,
        implementationPeriod: `Năm học ${academicYear}`,
        contextAndObjectives: '',
        solutionAndExecution: '',
        impactAndResults: '',
        scalabilityAndSpread: '',
        exemplaryNature: '',
        leadRepresentative:
          payload.nomineeType === 'COLLECTIVE'
            ? `${payload.preparedByUserName}${payload.studentId ? ` (${payload.studentId})` : ''}`
            : '',
        leadUnit: payload.facultyName ? `${payload.facultyName} – ${payload.institutionName}` : payload.institutionName,
        leadPhone: payload.contactPhone || '',
        leadEmail: payload.preparedByUserEmail || '',
        presentationLink: '',
        coAuthorsOrTeamMembers:
          payload.nomineeType === 'COLLECTIVE'
            ? `${payload.preparedByUserName} (${payload.studentId}) - Đại diện nhóm tác giả / tập thể`
            : '',
        commitmentConfirmed: false,
        evidenceFiles: [],
        ...(payload.category === 'TRUYEN_LUA'
          ? {
              nomineeFaculty: payload.facultyName || '',
              nomineeClass: payload.className || '',
              nomineePhone: payload.contactPhone || '',
              nomineeEmail: payload.preparedByUserEmail || '',
              nomineeCurrentRole: '',
              nomineeYearOfStudy: '',
              nomineePoliticalStatus: 'DOAN_VIEN',
              officerTerms: [],
              annualAchievements: [],
              academicAndPriority: {
                gpaText: '',
                trainingScoreText: '',
                sv5tRecognitions: '',
                volunteerActivities: '',
                scientificResearch: '',
                otherAwards: '',
              },
            }
          : {}),
      },
      wb03: {
        awardOrRecognitionSummary: '',
        highestAwardLevel: '',
        decisionNumbersAndDates: '',
        mediaAndProductLinks: '',
        practicalApplicationNote: '',
        evidenceFiles: [],
      },
    },
  };

  const next = [newApp, ...storeApps];
  saveToStorage(next);
  syncAppToBackend(newApp);
  return newApp;
}

export function updateWhiteBirdBasicInfo(
  appId: string,
  updates: Partial<
    Pick<
      WhiteBirdApplication,
      | 'nominationTitle'
      | 'category'
      | 'nomineeType'
      | 'nomineeName'
      | 'facultyName'
      | 'className'
      | 'contactPhone'
    >
  >
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const nextCategory = updates.category ?? current.category;
  const nextNomineeType =
    nextCategory === 'TRUYEN_LUA'
      ? 'INDIVIDUAL'
      : updates.nomineeType ?? current.nomineeType;

  const updated: WhiteBirdApplication = {
    ...current,
    ...updates,
    category: nextCategory,
    nomineeType: nextNomineeType,
    updatedAt: new Date().toISOString(),
  };

  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}

export function updateWhiteBirdWB01(
  appId: string,
  patch: Partial<WhiteBirdWB01Declaration>
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const updated: WhiteBirdApplication = {
    ...current,
    updatedAt: new Date().toISOString(),
    requirements: {
      ...current.requirements,
      wb01: {
        ...current.requirements.wb01,
        ...patch,
      },
    },
  };
  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}

export function updateWhiteBirdWB02(
  appId: string,
  patch: Partial<WhiteBirdWB02Declaration>
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const updated: WhiteBirdApplication = {
    ...current,
    updatedAt: new Date().toISOString(),
    requirements: {
      ...current.requirements,
      wb02: {
        ...current.requirements.wb02,
        ...patch,
      },
    },
  };
  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}

export function updateWhiteBirdWB03(
  appId: string,
  patch: Partial<WhiteBirdWB03Declaration>
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const updated: WhiteBirdApplication = {
    ...current,
    updatedAt: new Date().toISOString(),
    requirements: {
      ...current.requirements,
      wb03: {
        ...current.requirements.wb03,
        ...patch,
      },
    },
  };
  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}

export function addWhiteBirdEvidence(
  appId: string,
  reqId: WhiteBirdRequirementId,
  evidence: WhiteBirdEvidenceItem
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const key = reqId.toLowerCase() as 'wb01' | 'wb02' | 'wb03';
  const existingFiles = current.requirements[key].evidenceFiles || [];
  const updated: WhiteBirdApplication = {
    ...current,
    updatedAt: new Date().toISOString(),
    requirements: {
      ...current.requirements,
      [key]: {
        ...current.requirements[key],
        evidenceFiles: [...existingFiles, evidence],
      },
    },
  };
  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}

export function removeWhiteBirdEvidence(
  appId: string,
  reqId: WhiteBirdRequirementId,
  evidenceId: string
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const key = reqId.toLowerCase() as 'wb01' | 'wb02' | 'wb03';
  const existingFiles = current.requirements[key].evidenceFiles || [];
  const updated: WhiteBirdApplication = {
    ...current,
    updatedAt: new Date().toISOString(),
    requirements: {
      ...current.requirements,
      [key]: {
        ...current.requirements[key],
        evidenceFiles: existingFiles.filter((f) => f.id !== evidenceId),
      },
    },
  };
  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}

export function updateWhiteBirdEvidenceCategory(
  appId: string,
  reqId: WhiteBirdRequirementId,
  evidenceId: string,
  category: WhiteBirdTruyenLuaEvidenceCategory
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const key = reqId.toLowerCase() as 'wb01' | 'wb02' | 'wb03';
  const existingFiles = current.requirements[key].evidenceFiles || [];
  const updatedFiles = existingFiles.map((f) =>
    f.id === evidenceId ? { ...f, evidenceCategory: category } : f
  );
  const updated: WhiteBirdApplication = {
    ...current,
    updatedAt: new Date().toISOString(),
    requirements: {
      ...current.requirements,
      [key]: {
        ...current.requirements[key],
        evidenceFiles: updatedFiles,
      },
    },
  };
  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}

export function updateWhiteBirdEvidenceMetadata(
  appId: string,
  reqId: WhiteBirdRequirementId,
  evidenceId: string,
  patch: Partial<
    Pick<
      WhiteBirdEvidenceItem,
      'documentReference' | 'academicYear' | 'notes' | 'evidenceCategory' | 'customCategoryLabel'
    >
  >
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const key = reqId.toLowerCase() as 'wb01' | 'wb02' | 'wb03';
  const existingFiles = current.requirements[key].evidenceFiles || [];
  const updatedFiles = existingFiles.map((f) =>
    f.id === evidenceId ? { ...f, ...patch } : f
  );
  const updated: WhiteBirdApplication = {
    ...current,
    updatedAt: new Date().toISOString(),
    requirements: {
      ...current.requirements,
      [key]: {
        ...current.requirements[key],
        evidenceFiles: updatedFiles,
      },
    },
  };
  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}

export function synthesizeTruyenLuaWb03Summary(files?: WhiteBirdEvidenceItem[]): string {
  if (!files || files.length === 0) return '';
  const lines: string[] = [];
  files.forEach((file, index) => {
    const catLabel = file.evidenceCategory
      ? WHITE_BIRD_TRUYEN_LUA_CATEGORY_LABELS[file.evidenceCategory] || file.evidenceCategory
      : 'Tài liệu minh chứng';
    const docRef = file.documentReference?.trim() ? ` — Số hiệu: ${file.documentReference.trim()}` : '';
    const yr = file.academicYear?.trim() ? ` — Năm học: ${file.academicYear.trim()}` : '';
    lines.push(`${index + 1}. [${catLabel}] ${file.name}${docRef}${yr}`);
  });
  return lines.join('\n');
}

export interface WhiteBirdReadinessResult {
  wb01Ready: boolean;
  wb02Ready: boolean;
  wb03Ready: boolean;
  isWb03Optional: boolean;
  wb03HasData: boolean;
  readyCount: number;
  totalRequired: number;
  canSubmit: boolean;
  missingReasons: string[];
}

export function validateWhiteBirdReadiness(app: WhiteBirdApplication): WhiteBirdReadinessResult {
  const missingReasons: string[] = [];
  const { wb01, wb02, wb03 } = app.requirements;

  const isTruyenLua = app.category === 'TRUYEN_LUA';

  const wb01Ready =
    Boolean(wb01.nominatingUnitName.trim()) &&
    Boolean(wb01.endorsementSummary.trim()) &&
    wb01.evidenceFiles.length > 0;
  if (!wb01Ready) {
    missingReasons.push(
      isTruyenLua
        ? 'WB01: Cần kê khai tổ chức/cá nhân đề nghị theo Điều 5 và đính kèm ít nhất 01 tệp văn bản đề nghị xét trao (Khoản 6.2 Điều 6).'
        : 'WB01: Cần kê khai tổ chức/cá nhân đề nghị, nội dung tóm tắt nhận xét và đính kèm ít nhất 01 tệp văn bản đề nghị xét trao (Điều 5, Điều 6).'
    );
  }

  const hasInvalidWb02Url =
    Boolean(wb02.presentationLink?.trim()) && !isValidOptionalHttpUrl(wb02.presentationLink);

  const hasTruyenLuaContent =
    isTruyenLua &&
    ((wb02.officerTerms && wb02.officerTerms.length > 0) ||
      Boolean(wb02.solutionAndExecution?.trim()) ||
      Boolean(wb02.contextAndObjectives?.trim()));

  const wb02HasRequiredContent = isTruyenLua
    ? hasTruyenLuaContent
    : Boolean(wb02.solutionAndExecution.trim()) && Boolean(wb02.impactAndResults.trim());

  const wb02Ready =
    Boolean(wb02.reportTitle.trim()) &&
    wb02HasRequiredContent &&
    wb02.commitmentConfirmed &&
    wb02.evidenceFiles.length > 0 &&
    !hasInvalidWb02Url;
  if (!wb02Ready) {
    if (hasInvalidWb02Url) {
      missingReasons.push(
        'WB02: Liên kết bài trình bày/video demo không đúng định dạng URL (vui lòng nhập URL bắt đầu bằng http:// hoặc https://, hoặc để trống).'
      );
    } else {
      missingReasons.push(
        isTruyenLua
          ? 'WB02: Cần hoàn thiện Báo cáo thành tích cá nhân theo mẫu, kê khai quá trình công tác Đoàn - Hội, xác nhận lời cam kết và đính kèm tệp báo cáo có xác nhận (Khoản 6.2 Điều 6).'
          : 'WB02: Cần hoàn thiện nội dung Báo cáo thuyết minh / Báo cáo thành tích, xác nhận lời cam kết và đính kèm tệp báo cáo (Điều 6).'
      );
    }
  }

  const isWb03Optional = app.category === 'UOM_MAM';
  const hasInvalidWb03Url =
    Boolean(wb03.mediaAndProductLinks?.trim()) && !isValidOptionalHttpUrl(wb03.mediaAndProductLinks);

  const wb03HasData =
    Boolean(wb03.awardOrRecognitionSummary?.trim()) ||
    Boolean(wb03.mediaAndProductLinks?.trim()) ||
    wb03.evidenceFiles.length > 0;

  let wb03Ready = false;
  let totalRequired = 3;
  let readyCount = 0;
  let canSubmit = false;

  if (isWb03Optional) {
    // Khoản 6.1 Điều 6: WB03 là hình ảnh, sản phẩm minh họa (nếu có) -> TÙY CHỌN, không chặn nộp
    totalRequired = 2;
    readyCount = [wb01Ready, wb02Ready].filter(Boolean).length;
    canSubmit = wb01Ready && wb02Ready && !hasInvalidWb03Url;
    wb03Ready = wb03HasData && !hasInvalidWb03Url;
    if (hasInvalidWb03Url) {
      missingReasons.push(
        'WB03: Liên kết tra cứu/minh chứng không đúng định dạng URL (vui lòng nhập URL bắt đầu bằng http:// hoặc https://, hoặc để trống).'
      );
    }
  } else {
    // Khoản 6.2 và 6.3 Điều 6: WB03 là bắt buộc cho Cánh chim truyền lửa & Cánh chim sáng tạo
    totalRequired = 3;
    const hasTruyenLuaEvidenceContent =
      isTruyenLua &&
      (Boolean(wb03.awardOrRecognitionSummary?.trim()) || wb03.evidenceFiles.length > 0);

    wb03Ready =
      (isTruyenLua ? hasTruyenLuaEvidenceContent : Boolean(wb03.awardOrRecognitionSummary?.trim())) &&
      wb03.evidenceFiles.length > 0 &&
      !hasInvalidWb03Url;
    if (!wb03Ready) {
      if (hasInvalidWb03Url) {
        missingReasons.push(
          'WB03: Liên kết tra cứu/minh chứng không đúng định dạng URL (vui lòng nhập URL bắt đầu bằng http:// hoặc https://, hoặc để trống).'
        );
      } else {
        missingReasons.push(
          app.category === 'TRUYEN_LUA'
            ? 'WB03: Cần đính kèm tài liệu minh chứng chức vụ / thành tích tiêu biểu (Khoản 6.2 Điều 6).'
            : 'WB03: Cần kê khai tóm tắt giải thưởng đạt được và đính kèm minh chứng từ cấp ĐHĐN trở lên (Khoản 6.3 Điều 6).'
        );
      }
    }
    readyCount = [wb01Ready, wb02Ready, wb03Ready].filter(Boolean).length;
    canSubmit = wb01Ready && wb02Ready && wb03Ready;
  }

  return {
    wb01Ready,
    wb02Ready,
    wb03Ready,
    isWb03Optional,
    wb03HasData,
    readyCount,
    totalRequired,
    canSubmit,
    missingReasons,
  };
}

export function submitWhiteBirdApplication(appId: string): {
  success: boolean;
  error?: string;
  application?: WhiteBirdApplication;
} {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) {
    return { success: false, error: 'Không tìm thấy hồ sơ Giải thưởng Cánh chim trắng.' };
  }
  const current = storeApps[idx];
  const readiness = validateWhiteBirdReadiness(current);
  if (!readiness.canSubmit) {
    const defaultMsg =
      current.category === 'UOM_MAM'
        ? 'Hồ sơ chưa hoàn thiện đủ 2 thành phần bắt buộc (WB01, WB02) theo Điều 6.'
        : 'Hồ sơ chưa hoàn thiện đủ 3 thành phần theo Điều 6.';
    return {
      success: false,
      error: readiness.missingReasons[0] || defaultMsg,
    };
  }

  const now = new Date().toISOString();
  const isResubmittingSupplement = current.status === 'supplement_requested';
  const updated: WhiteBirdApplication = {
    ...current,
    status: isResubmittingSupplement ? 'supplement_returned' : 'submitted',
    submittedAt: current.submittedAt || now,
    ...(isResubmittingSupplement ? { supplementRespondedAt: now } : {}),
    updatedAt: now,
  };
  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return { success: true, application: updated };
}

/**
 * Cán bộ xét duyệt cấp Đại học Đà Nẵng chấm từng thành phần WB01, WB02, WB03
 */
export function reviewWhiteBirdRequirement(
  appId: string,
  reqId: WhiteBirdRequirementId,
  judgment: WhiteBirdRequirementJudgment,
  reviewerNote: string,
  officerName: string
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const now = new Date().toISOString();

  const judgmentField =
    reqId === 'WB01'
      ? 'wb01Judgment'
      : reqId === 'WB02'
      ? 'wb02Judgment'
      : 'wb03Judgment';
  const noteField =
    reqId === 'WB01'
      ? 'wb01ReviewerNote'
      : reqId === 'WB02'
      ? 'wb02ReviewerNote'
      : 'wb03ReviewerNote';

  const nextStatus =
    current.status === 'submitted' || current.status === 'supplement_returned'
      ? 'under_review'
      : current.status;

  const updated: WhiteBirdApplication = {
    ...current,
    [judgmentField]: judgment,
    [noteField]: reviewerNote,
    reviewedByOfficerName: officerName,
    reviewedAt: now,
    status: nextStatus,
    updatedAt: now,
  };

  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}

/**
 * Cán bộ / Quản lý cấp Đại học Đà Nẵng yêu cầu sinh viên bổ sung hồ sơ Giải thưởng Cánh chim trắng
 */
export function requestWhiteBirdSupplementFromUdn(
  appId: string,
  supplementNote: string,
  officerName: string
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const now = new Date().toISOString();

  const updated: WhiteBirdApplication = {
    ...current,
    status: 'supplement_requested',
    supplementRequestNote: supplementNote.trim(),
    supplementRequestedAt: now,
    reviewedByOfficerName: officerName,
    updatedAt: now,
  };

  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}

/**
 * Cán bộ / Quản lý cấp Đại học Đà Nẵng hoàn tất thẩm định và trình Hội đồng xét duyệt Giải thưởng Cánh chim trắng
 */
export function completeWhiteBirdOfficerReviewForCommittee(
  appId: string,
  summaryNote: string,
  officerName: string
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const now = new Date().toISOString();

  const updated: WhiteBirdApplication = {
    ...current,
    status: 'awaiting_committee',
    wb01Judgment: current.wb01Judgment === 'not_reviewed' ? 'approved' : current.wb01Judgment,
    wb02Judgment: current.wb02Judgment === 'not_reviewed' ? 'approved' : current.wb02Judgment,
    wb03Judgment: current.wb03Judgment === 'not_reviewed' ? 'approved' : current.wb03Judgment,
    councilNote: summaryNote.trim() || current.councilNote,
    reviewedByOfficerName: officerName,
    reviewedAt: now,
    committeeSubmittedAt: now,
    updatedAt: now,
  };

  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}

/**
 * Hội đồng xét duyệt cấp Đại học Đà Nẵng ra quyết định Công nhận / Không công nhận Giải thưởng Cánh chim trắng
 */
export function recordWhiteBirdCommitteeDecision(
  appId: string,
  outcome: 'recognized' | 'not_recognized',
  decisionNumber: string,
  councilNote: string,
  decidedByName: string
): WhiteBirdApplication | null {
  const idx = storeApps.findIndex((a) => a.id === appId);
  if (idx < 0) return null;
  const current = storeApps[idx];
  const now = new Date().toISOString();

  const updated: WhiteBirdApplication = {
    ...current,
    status: outcome,
    decisionNumber:
      decisionNumber.trim() || (outcome === 'recognized' ? '14-QĐ/ĐHĐN-HSV-CCT' : ''),
    decisionDate: now,
    councilNote: councilNote.trim(),
    decidedByName,
    updatedAt: now,
  };

  const next = [...storeApps];
  next[idx] = updated;
  saveToStorage(next);
  syncAppToBackend(updated);
  return updated;
}
