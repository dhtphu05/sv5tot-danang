/**
 * 5TOT Đà Nẵng — Contextual AI Review Copilot & OpenAI OCR Client API
 * Cơ quan quản lý: Thành Đoàn - Hội Sinh viên Thành phố Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 */

import { getApiBaseUrl } from './httpClient';

export interface CopilotEvidenceItem {
  id: string;
  name: string;
  fileType?: string;
  fileSize?: number;
  url?: string;
  base64?: string;
  studentNote?: string;
  uploadDate?: string;
}

export interface CopilotStudentInfo {
  fullName: string;
  studentCode: string;
  schoolName: string;
  faculty?: string;
  academicYear?: string;
}

export interface OcrEvidenceExtractionResult {
  evidenceId: string;
  fileName: string;
  isReadable: boolean;
  documentType: string;
  extractedStudentName?: string;
  extractedStudentCode?: string;
  extractedValue: string;
  numericMetric?: number;
  issuingAuthority: string;
  issueDate: string;
  hasRedStampOrSignature: 'verified' | 'missing' | 'unclear';
  matchWithDeclaration: 'matched' | 'mismatch' | 'partial';
  discrepancyNote?: string;
  extractedAt: string;
  aiSource: 'openai' | 'rule_engine';
  modelUsed: string;
}

export interface CopilotScopeAnalysisRequest {
  criterionId: string;
  criterionName: string;
  criterionNumber: number;
  requirementId: string;
  requirementTitle: string;
  declarationId?: string;
  declarationTitle?: string;
  declarationDetail?: string;
  evidenceList: CopilotEvidenceItem[];
  studentInfo?: CopilotStudentInfo;
  reviewStage?: 'SCHOOL' | 'CITY' | 'COMMITTEE';
  forceRefresh?: boolean;
}

export interface CopilotScopeAnalysisResponse {
  suggestedVerdict: 'SATISFIED' | 'SUPPLEMENT_REQUIRED' | 'CONSIDERATION_NEEDED' | 'UNSUITABLE';
  preliminaryStatus?: 'preliminary_meets' | 'insufficient_evidence' | 'preliminary_not_meets';
  preliminaryBadgeLabel?: 'Đạt sơ bộ' | 'Cần kiểm tra thêm' | 'Chưa đạt (Sơ bộ)';
  confidenceScore: number;
  headlineSummary: string;
  detailedAnalysis: string;
  declaredSummary?: string;
  extractedSummary?: string;
  ocrExtractions?: OcrEvidenceExtractionResult[];
  complianceChecks: Array<{
    item: string;
    passed: boolean | 'warning';
    detail: string;
  }>;
  evidenceAssessment: Array<{
    fileName: string;
    validityStatus: 'valid' | 'suspicious' | 'supplement_needed';
    observation: string;
  }>;
  flaggedRisks: string[];
  draftInternalNote: string;
  draftSupplementMessage?: string;
  regulationCitation: string;
  aiSource: 'openai' | 'gemini-3.8-flash' | 'rule_engine';
}

export interface CopilotAskRequest {
  question: string;
  context?: {
    studentName?: string;
    schoolName?: string;
    criterionName?: string;
    requirementTitle?: string;
    declarationValue?: string;
  };
}

export interface CopilotAskResponse {
  answer: string;
  model: string;
}

export interface CopilotDossierSummaryResponse {
  candidateRating: 'XUẤT SẮC' | 'TIÊU BIỂU' | 'ĐẠT CHUẨN' | 'CẦN HỘI CHẨN';
  committeeReadiness: 'ĐỦ ĐIỀU KIỆN BIỂU QUYẾT' | 'CHỜ BỔ SUNG' | 'CHƯA ĐẠT CHUẨN';
  overallVerdict: string;
  criteriaReadinessMatrix: Array<{
    criterionName: string;
    status: 'Đạt' | 'Cần lưu ý' | 'Chưa đạt';
    highlight: string;
  }>;
  exceptionalAchievements: string[];
  potentialCaveats: string[];
  recommendedCommitteeVote: string;
  executiveMemo: string;
}

export interface DeclarationQuickOcrInsight {
  status: 'preliminary_meets' | 'insufficient_evidence' | 'preliminary_not_meets';
  badgeLabel: 'Đạt sơ bộ' | 'Cần kiểm tra thêm' | 'Chưa đạt (Sơ bộ)';
  declaredText: string;
  extractedText: string;
  authorityText: string;
  stampVerified: boolean;
  reasonText: string;
  draftSupplementMessage?: string;
  aiSource: 'openai' | 'rule_engine';
}

// Client-side caches for instant 0ms rendering + localStorage persistence across student/officer views
const OCR_STORAGE_KEY = '5tot_ocr_extractions_v2';
const analysisCache = new Map<string, CopilotScopeAnalysisResponse>();
const ocrExtractionCache = new Map<string, OcrEvidenceExtractionResult>();
const inFlightOcrIds = new Set<string>();
const listeners = new Set<() => void>();
let serverCacheHydrated = false;

function loadOcrCacheFromStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(OCR_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, OcrEvidenceExtractionResult>;
    if (parsed && typeof parsed === 'object') {
      for (const [evId, ext] of Object.entries(parsed)) {
        if (ext && ext.evidenceId) {
          ocrExtractionCache.set(evId, ext);
        }
      }
    }
  } catch {
    // ignore storage errors
  }
}

function saveOcrCacheToStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const obj: Record<string, OcrEvidenceExtractionResult> = {};
    for (const [evId, ext] of ocrExtractionCache.entries()) {
      obj[evId] = ext;
    }
    window.localStorage.setItem(OCR_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // ignore storage errors
  }
}

loadOcrCacheFromStorage();

export function subscribeCopilotOcrUpdates(listener: () => void): () => void {
  listeners.add(listener);
  if (!serverCacheHydrated) {
    void hydrateCopilotOcrCacheFromServer();
  }
  return () => listeners.delete(listener);
}

function notifyOcrListeners(): void {
  for (const l of listeners) {
    try {
      l();
    } catch {
      // ignore listener errors
    }
  }
}

export function isEvidenceOcrInFlight(evidenceId: string): boolean {
  return inFlightOcrIds.has(evidenceId);
}

export function getExactEvidenceOcrResult(evidenceId: string): OcrEvidenceExtractionResult | undefined {
  return ocrExtractionCache.get(evidenceId);
}

export async function hydrateCopilotOcrCacheFromServer(): Promise<void> {
  if (serverCacheHydrated) return;
  serverCacheHydrated = true;
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v2/copilot/ocr-cache`);
    if (!response.ok) return;
    const data = await response.json();
    const extractions = data?.extractions as Record<string, OcrEvidenceExtractionResult> | undefined;
    if (extractions && typeof extractions === 'object') {
      let updated = false;
      for (const [evId, ext] of Object.entries(extractions)) {
        if (ext && ext.evidenceId) {
          const current = ocrExtractionCache.get(evId);
          if (!current || (ext.aiSource === 'openai' && current.aiSource !== 'openai')) {
            ocrExtractionCache.set(evId, ext);
            updated = true;
          }
        }
      }
      if (updated) {
        saveOcrCacheToStorage();
        notifyOcrListeners();
      }
    }
  } catch {
    // ignore network errors during background cache hydration
  }
}

export function buildLocalFallbackOcr(params: {
  evidenceId: string;
  fileName: string;
  declaredValue?: string;
  requirementTitle?: string;
  criterionId?: string;
  studentName?: string;
}): OcrEvidenceExtractionResult {
  return {
    evidenceId: params.evidenceId,
    fileName: params.fileName,
    isReadable: false,
    documentType: 'Tệp minh chứng đính kèm',
    extractedStudentName: params.studentName || undefined,
    extractedValue: 'Đang chờ đọc dữ liệu chi tiết từ tệp minh chứng',
    numericMetric: undefined,
    issuingAuthority: 'Cần kiểm tra trực tiếp trên tệp minh chứng',
    issueDate: 'Cần kiểm tra trực tiếp',
    hasRedStampOrSignature: 'unclear',
    matchWithDeclaration: 'partial',
    discrepancyNote:
      'Cần kiểm tra thêm: Tệp minh chứng đang chờ trích xuất OCR hoặc cần cán bộ kiểm tra trực tiếp trên bản gốc.',
    extractedAt: new Date().toISOString(),
    aiSource: 'rule_engine',
    modelUsed: 'none',
  };
}

export function getCachedEvidenceOcrSync(params: {
  evidenceId: string;
  fileName: string;
  declaredValue?: string;
  requirementTitle?: string;
  criterionId?: string;
  studentName?: string;
}): OcrEvidenceExtractionResult {
  const existing = ocrExtractionCache.get(params.evidenceId);
  if (existing) {
    return existing;
  }
  return buildLocalFallbackOcr(params);
}

const inFlightPromises = new Map<string, Promise<OcrEvidenceExtractionResult>>();

export async function triggerEvidenceOcr(
  payload: {
    evidenceId: string;
    fileName: string;
    mimeType?: string;
    fileUrl?: string;
    fileBase64?: string;
    studentNote?: string;
    studentFullName?: string;
    studentCode?: string;
    schoolName?: string;
    criterionId?: string;
    criterionName?: string;
    requirementTitle?: string;
    declaredValue?: string;
  },
  forceRefresh = false
): Promise<OcrEvidenceExtractionResult> {
  if (!forceRefresh && ocrExtractionCache.has(payload.evidenceId)) {
    const existing = ocrExtractionCache.get(payload.evidenceId)!;
    if (existing.aiSource === 'openai') {
      return existing;
    }
  }

  if (!forceRefresh && inFlightPromises.has(payload.evidenceId)) {
    return inFlightPromises.get(payload.evidenceId)!;
  }

  inFlightOcrIds.add(payload.evidenceId);
  notifyOcrListeners();

  const task = (async (): Promise<OcrEvidenceExtractionResult> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v2/copilot/ocr-evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          forceRefresh,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: OcrEvidenceExtractionResult = await response.json();
      inFlightOcrIds.delete(payload.evidenceId);
      inFlightPromises.delete(payload.evidenceId);
      ocrExtractionCache.set(payload.evidenceId, result);
      saveOcrCacheToStorage();
      notifyOcrListeners();
      return result;
    } catch {
      inFlightOcrIds.delete(payload.evidenceId);
      inFlightPromises.delete(payload.evidenceId);
      const fallback = buildLocalFallbackOcr({
        evidenceId: payload.evidenceId,
        fileName: payload.fileName,
        declaredValue: payload.declaredValue,
        requirementTitle: payload.requirementTitle,
        criterionId: payload.criterionId,
        studentName: payload.studentFullName,
      });
      ocrExtractionCache.set(payload.evidenceId, fallback);
      saveOcrCacheToStorage();
      notifyOcrListeners();
      return fallback;
    }
  })();

  inFlightPromises.set(payload.evidenceId, task);
  return task;
}

export interface CriterionConditionCheckItem {
  id: string;
  groupTitle: string;
  label: string;
  ruleBadge: string;
  status: 'met' | 'verify_needed' | 'missing';
  detail: string;
  declaredCount: number;
  passedCount: number;
  requiredCount: number;
}

export interface CriterionHolisticEvaluation {
  criterionId: string;
  criterionNumber: number;
  criterionName: string;
  verdict: 'preliminary_meets' | 'insufficient_evidence';
  badgeLabel: 'Đạt sơ bộ' | 'Cần kiểm tra thêm';
  headline: string;
  detail: string;
  metConditionsCount: number;
  totalConditionsCount: number;
  conditionChecklist: CriterionConditionCheckItem[];
  supportedRequirements: string[];
  insufficientRequirements: string[];
}

export function extractVolunteerDaysFromDeclaration(
  decl: { value?: string; detail?: string; metadata?: Record<string, any>; evidenceFiles?: Array<{ id: string; name: string; url?: string; status?: string }>; evidence?: Array<{ id: string; name: string; url?: string; status?: string }> },
  studentName?: string
): { days: number; isEvidenceValid: boolean } {
  const files = decl.evidenceFiles || decl.evidence || [];
  if (files.length === 0) {
    const text = `${decl.value || ''} ${decl.detail || ''}`.toLowerCase();
    const m = text.match(/(\d+)\s*ngày/i);
    const days = m ? parseInt(m[1], 10) : text.includes('hiến máu') || text.includes('hien mau') ? 1 : 0;
    return { days, isEvidenceValid: false };
  }

  const extractions = files.map((ev) =>
    getCachedEvidenceOcrSync({
      evidenceId: ev.id,
      fileName: ev.name,
      declaredValue: decl.value || '',
      requirementTitle: 'Hoạt động tình nguyện tích lũy',
      criterionId: 'volunteer',
      studentName,
    })
  );

  let ocrDays = 0;
  for (const e of extractions) {
    if (typeof e.numericMetric === 'number' && e.numericMetric > 0 && e.numericMetric <= 365) {
      ocrDays += e.numericMetric;
    } else {
      const m = (e.extractedValue || '').match(/(\d+)\s*ngày/i);
      if (m) {
        ocrDays += parseInt(m[1], 10);
      } else if ((e.extractedValue || '').toLowerCase().includes('hiến máu')) {
        ocrDays += 1;
      }
    }
  }

  if (ocrDays === 0) {
    const metaDays = decl.metadata?.days || decl.metadata?.volDaysCount;
    if (metaDays) {
      const parsed = parseInt(String(metaDays), 10);
      if (!isNaN(parsed) && parsed > 0) ocrDays = parsed;
    }
  }

  if (ocrDays === 0) {
    const text = `${decl.value || ''} ${decl.detail || ''}`.toLowerCase();
    const m = text.match(/(\d+)\s*ngày/i);
    if (m) {
      ocrDays = parseInt(m[1], 10);
    } else if (
      decl.metadata?.volActivityType === 'blood_donation' ||
      text.includes('hiến máu') ||
      text.includes('hien mau')
    ) {
      ocrDays = 1;
    } else {
      ocrDays = 1;
    }
  }

  const hasMismatch = extractions.some((e) => e.matchWithDeclaration === 'mismatch');
  const hasFlaggedFile = files.some((ev) => ev.status === 'needs_verification');
  const hasPartial =
    hasFlaggedFile ||
    extractions.some(
      (e) =>
        e.matchWithDeclaration === 'partial' ||
        e.hasRedStampOrSignature !== 'verified' ||
        !e.isReadable
    );

  return {
    days: ocrDays,
    isEvidenceValid: !hasMismatch && !hasPartial,
  };
}

export function evaluateDeclarationQuickInsight(params: {
  criterionId: string;
  requirementId?: string;
  requirementTitle: string;
  declaredValue: string;
  evidenceFiles: Array<{ id: string; name: string; url?: string; status?: string }>;
  studentName?: string;
  allRequirementDeclarations?: Array<{
    id?: string;
    value?: string;
    detail?: string;
    metadata?: Record<string, any>;
    evidenceFiles?: Array<{ id: string; name: string; url?: string; status?: string }>;
    evidence?: Array<{ id: string; name: string; url?: string; status?: string }>;
  }>;
  cumulativeVolunteerDays?: number;
  hasValidVolunteerAward?: boolean;
}): DeclarationQuickOcrInsight {
  const {
    criterionId,
    requirementId,
    requirementTitle,
    declaredValue,
    evidenceFiles,
    studentName,
    allRequirementDeclarations,
    cumulativeVolunteerDays,
    hasValidVolunteerAward,
  } = params;

  const validFiles = (evidenceFiles || []).filter(
    (ev) => ev && typeof ev.name === 'string' && ev.name.trim().length > 0
  );

  const regCitation = 'Theo Hướng dẫn số 14-HD/BTK-HSVTP (Hội Sinh viên TP. Đà Nẵng)';

  if (validFiles.length === 0) {
    return {
      status: 'insufficient_evidence',
      badgeLabel: 'Cần kiểm tra thêm',
      declaredText: declaredValue || requirementTitle,
      extractedText: 'Chưa có tệp minh chứng đính kèm',
      authorityText: 'Bắt buộc đính kèm tệp xác nhận theo quy chế',
      stampVerified: false,
      reasonText: `${regCitation}: Mọi nội dung kê khai bắt buộc phải có văn bản minh chứng đối chiếu (bản scan/ảnh chụp văn bản, giấy chứng nhận hoặc quyết định có dấu mộc và chữ ký xác nhận). Kê khai này hiện chưa tải lên tệp minh chứng.`,
      draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, căn cứ Hướng dẫn số 14-HD/BTK-HSVTP của Ban Thư ký Hội Sinh viên Việt Nam TP. Đà Nẵng, nội dung kê khai "${declaredValue || requirementTitle}" hiện chưa có tệp minh chứng đính kèm. Đề nghị bạn bổ sung bản chụp/scan văn bản xác nhận có con dấu và chữ ký hợp lệ để hội đồng xét chọn có căn cứ thẩm định.`,
      aiSource: 'rule_engine',
    };
  }

  const extractions = validFiles.map((ev) =>
    getCachedEvidenceOcrSync({
      evidenceId: ev.id,
      fileName: ev.name,
      declaredValue,
      requirementTitle,
      criterionId,
      studentName,
    })
  );

  const usedOpenAi = extractions.some((e) => e.aiSource === 'openai');
  const primary = extractions[0];
  const authorityWithDate = `${primary.issuingAuthority}${primary.issueDate ? ` · ${primary.issueDate}` : ''}`;
  const hasMismatch = extractions.some((e) => e.matchWithDeclaration === 'mismatch');
  const hasFlaggedFile = validFiles.some((ev) => ev.status === 'needs_verification');
  const hasPartial =
    hasFlaggedFile ||
    extractions.some(
      (e) =>
        e.matchWithDeclaration === 'partial' ||
        e.hasRedStampOrSignature !== 'verified' ||
        !e.isReadable
    );

  // Because student forms only collect "Tên kê khai" + Evidence File, evaluate thresholds from OCR-extracted metrics & text first.
  // Never return preliminary_not_meets ("Chưa đạt") — convert any shortfall to insufficient_evidence ("Cần kiểm tra thêm").
  const combinedSourceText = `${primary.extractedValue || ''} ${declaredValue || ''}`;
  const lowerContext = `${requirementTitle || ''} ${declaredValue || ''} ${primary.documentType || ''} ${primary.extractedValue || ''}`.toLowerCase();

  // 1. Mandatory Academic GPA Check (TC2.1)
  const gpaMatch = combinedSourceText.match(/(\d+[.,]\d+)\s*\/\s*4/);
  const gpaVal =
    typeof primary.numericMetric === 'number' && primary.numericMetric <= 4.0
      ? primary.numericMetric
      : gpaMatch
      ? parseFloat(gpaMatch[1].replace(',', '.'))
      : undefined;
  if (
    criterionId === 'academic' &&
    (lowerContext.includes('gpa') || lowerContext.includes('điểm trung bình') || lowerContext.includes('bảng điểm')) &&
    typeof gpaVal === 'number' &&
    gpaVal < 3.2
  ) {
    const reason = `${regCitation} - TC2.1 (Điểm TB học tập cả năm): Yêu cầu tối thiểu đạt GPA >= 3.2/4.0 (8.0/10) đối với bậc Đại học/Học viện hoặc >= 3.0/4.0 (7.5/10) đối với bậc Cao đẳng. Điểm đọc sơ bộ (${gpaVal}/4.0) chưa đạt ngưỡng quy chuẩn hoặc cần đối chiếu lại bảng điểm gốc có xác nhận của trường.`;
    return {
      status: 'insufficient_evidence',
      badgeLabel: 'Cần kiểm tra thêm',
      declaredText: declaredValue || requirementTitle,
      extractedText: `${primary.documentType}: ${primary.extractedValue}`,
      authorityText: authorityWithDate,
      stampVerified: primary.hasRedStampOrSignature === 'verified',
      reasonText: reason,
      draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, căn cứ Hướng dẫn số 14-HD/BTK-HSVTP, tiêu chuẩn TC2.1 yêu cầu điểm TB học tập cả năm đạt từ 3.2/4.0 (Đại học) hoặc 3.0/4.0 (Cao đẳng). Dữ liệu đọc từ minh chứng (${gpaVal}/4.0) chưa đạt hoặc chưa rõ cả năm học. Đề nghị bạn kiểm tra và bổ sung bảng điểm năm học hoàn chỉnh có xác nhận.`,
      aiSource: usedOpenAi ? 'openai' : 'rule_engine',
    };
  }

  // 2. Mandatory Ethics Conduct Score Check (TC1.1: >= 80/100)
  const drlMatch = combinedSourceText.match(/(\d+)\s*\/\s*100/);
  const drlVal =
    typeof primary.numericMetric === 'number' && primary.numericMetric > 10 && primary.numericMetric <= 100
      ? primary.numericMetric
      : drlMatch
      ? parseFloat(drlMatch[1])
      : undefined;
  if (
    criterionId === 'ethics' &&
    (lowerContext.includes('rèn luyện') || lowerContext.includes('đrl')) &&
    typeof drlVal === 'number' &&
    drlVal < 80
  ) {
    const reason = `${regCitation} - TC1.1 (Điểm rèn luyện): Yêu cầu điểm rèn luyện cả năm học đạt từ 80/100 điểm trở lên (hoặc xếp loại Giỏi). Điểm đọc sơ bộ (${drlVal}/100) chưa đạt ngưỡng hoặc cần kiểm tra lại bản gốc có dấu đỏ.`;
    return {
      status: 'insufficient_evidence',
      badgeLabel: 'Cần kiểm tra thêm',
      declaredText: declaredValue || requirementTitle,
      extractedText: `${primary.documentType}: ${primary.extractedValue}`,
      authorityText: authorityWithDate,
      stampVerified: primary.hasRedStampOrSignature === 'verified',
      reasonText: reason,
      draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, căn cứ Hướng dẫn số 14-HD/BTK-HSVTP, tiêu chuẩn TC1.1 yêu cầu điểm rèn luyện cả năm đạt từ 80/100 điểm trở lên. Dữ liệu đọc sơ bộ (${drlVal}/100) chưa đạt ngưỡng. Đề nghị bạn bổ sung văn bản xác nhận điểm rèn luyện năm học có dấu xác nhận.`,
      aiSource: usedOpenAi ? 'openai' : 'rule_engine',
    };
  }

  // 3. Volunteer Days Check (TC4.1: >= 5 days cumulative across activities, OR TC4.2 award)
  const isVolunteerDaysReq =
    criterionId === 'volunteer' &&
    (requirementId === 'volunteer-activities' ||
      lowerContext.includes('05 ngày') ||
      lowerContext.includes('5 ngày') ||
      lowerContext.includes('tích lũy'));
  if (isVolunteerDaysReq) {
    const itemDaysInfo = extractVolunteerDaysFromDeclaration(
      { value: declaredValue, evidenceFiles: validFiles },
      studentName
    );
    const itemDays = itemDaysInfo.days;

    let totalDays = cumulativeVolunteerDays;
    if (totalDays === undefined && Array.isArray(allRequirementDeclarations) && allRequirementDeclarations.length > 0) {
      totalDays = allRequirementDeclarations.reduce(
        (sum, d) => sum + extractVolunteerDaysFromDeclaration(d, studentName).days,
        0
      );
    }
    if (totalDays === undefined) {
      totalDays = itemDays;
    }

    if (totalDays > 0 && totalDays < 5 && !hasValidVolunteerAward) {
      const reason =
        Array.isArray(allRequirementDeclarations) && allRequirementDeclarations.length > 1
          ? `${regCitation} - TC4.1: Yêu cầu tích lũy tối thiểu 05 ngày tình nguyện/năm học (hiến máu = 01 ngày/lần) HOẶC giấy khen cấp Khoa trở lên (TC4.2). Hoạt động này góp ${itemDays} ngày, tổng tích lũy hiện mới đạt ${totalDays}/05 ngày (còn thiếu ${5 - totalDays} ngày).`
          : `${regCitation} - TC4.1: Hoạt động xác nhận ${itemDays} ngày tình nguyện. Quy chế yêu cầu tích lũy cộng dồn tối thiểu 05 ngày/năm học hoặc có giấy khen tình nguyện từ cấp Khoa trở lên (TC4.2).`;
      return {
        status: 'insufficient_evidence',
        badgeLabel: 'Cần kiểm tra thêm',
        declaredText: declaredValue || requirementTitle,
        extractedText: `${primary.documentType}: ${primary.extractedValue} (Góp ${itemDays} ngày · Tổng tích lũy: ${totalDays}/05 ngày)`,
        authorityText: authorityWithDate,
        stampVerified: primary.hasRedStampOrSignature === 'verified',
        reasonText: reason,
        draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, căn cứ Hướng dẫn số 14-HD/BTK-HSVTP, tiêu chuẩn TC4.1 yêu cầu tích lũy tối thiểu 05 ngày tình nguyện/năm học (hoặc có giấy khen cấp Khoa trở lên theo TC4.2). Hiện tổng số ngày tích lũy mới đạt ${totalDays}/05 ngày. Đề nghị bạn bổ sung thêm minh chứng hoạt động tình nguyện.`,
        aiSource: usedOpenAi ? 'openai' : 'rule_engine',
      };
    }
  }

  if (hasMismatch) {
    const mismatchItem = extractions.find((e) => e.matchWithDeclaration === 'mismatch') || primary;
    const reason =
      mismatchItem.discrepancyNote ||
      `${regCitation}: Số liệu đọc từ tệp minh chứng có sự chênh lệch so với nội dung kê khai hoặc cần đối chiếu lại bản gốc.`;
    return {
      status: 'insufficient_evidence',
      badgeLabel: 'Cần kiểm tra thêm',
      declaredText: declaredValue || requirementTitle,
      extractedText: `${mismatchItem.documentType}: ${mismatchItem.extractedValue}`,
      authorityText: `${mismatchItem.issuingAuthority}${mismatchItem.issueDate ? ` · ${mismatchItem.issueDate}` : ''}`,
      stampVerified: mismatchItem.hasRedStampOrSignature === 'verified',
      reasonText: reason,
      draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, qua đối chiếu theo Hướng dẫn số 14-HD/BTK-HSVTP tại mục "${declaredValue || requirementTitle}", hệ thống ghi nhận: ${reason} Đề nghị bạn kiểm tra và bổ sung minh chứng xác nhận đầy đủ theo quy chế.`,
      aiSource: usedOpenAi ? 'openai' : 'rule_engine',
    };
  }

  if (hasPartial) {
    const partialItem =
      extractions.find((e) => e.matchWithDeclaration === 'partial' || e.hasRedStampOrSignature !== 'verified') ||
      primary;
    const reason =
      partialItem.discrepancyNote ||
      `${regCitation}: Cần cán bộ kiểm tra trực tiếp con dấu mộc đỏ, chữ ký của đơn vị ban hành hoặc tính tương đương của văn bản minh chứng.`;
    return {
      status: 'insufficient_evidence',
      badgeLabel: 'Cần kiểm tra thêm',
      declaredText: declaredValue || requirementTitle,
      extractedText: `${partialItem.documentType}: ${partialItem.extractedValue}`,
      authorityText: `${partialItem.issuingAuthority}${partialItem.issueDate ? ` · ${partialItem.issueDate}` : ''}`,
      stampVerified: partialItem.hasRedStampOrSignature === 'verified',
      reasonText: reason,
      draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, minh chứng tại mục "${declaredValue || requirementTitle}" cần làm rõ thêm con dấu xác nhận hoặc tính tương đương theo Hướng dẫn số 14-HD/BTK-HSVTP. Đề nghị bạn bổ sung tài liệu rõ nét hơn.`,
      aiSource: usedOpenAi ? 'openai' : 'rule_engine',
    };
  }

  return {
    status: 'preliminary_meets',
    badgeLabel: 'Đạt sơ bộ',
    declaredText: declaredValue || requirementTitle,
    extractedText: `${primary.documentType}: ${primary.extractedValue}`,
    authorityText: authorityWithDate,
    stampVerified: true,
    reasonText: `${regCitation}: Thông tin chi tiết trích xuất từ tệp minh chứng hợp lệ, có dấu xác nhận và đáp ứng ngưỡng tiêu chuẩn quy chế.`,
    aiSource: usedOpenAi ? 'openai' : 'rule_engine',
  };
}

const REQ_ALIAS_MAP: Record<string, string[]> = {
  'ethics-score': ['tc1.1', 'ethics-score', 'drl'],
  'ethics-law': ['tc1.2', 'ethics-law'],
  'ethics-party': ['tc1.3', 'ethics-party'],
  'ethics-politics-team': ['tc1.4', 'ethics-politics-team'],
  'ethics-politics-paper': ['tc1.5', 'ethics-politics-paper'],
  'ethics-commendation': ['tc1.6', 'ethics-commendation'],
  'academic-gpa': ['tc2.1', 'academic-gpa', 'gpa'],
  'academic-nckh': ['tc2.2', 'academic-nckh'],
  'academic-paper': ['tc2.3', 'academic-paper'],
  'academic-presentation': ['tc2.4', 'academic-presentation'],
  'academic-product': ['tc2.5', 'academic-product'],
  'academic-team': ['tc2.6', 'academic-team'],
  'academic-innovation': ['tc2.7', 'academic-innovation'],
  'physical-fitness': ['tc3.1', 'physical-fitness'],
  'physical-sports': ['tc3.2', 'physical-sports'],
  'volunteer-days': ['tc4.1', 'volunteer-days'],
  'volunteer-blood': ['tc4.2', 'volunteer-blood'],
  'volunteer-award': ['tc4.3', 'volunteer-award'],
  'integration-skills': ['tc5.1', 'integration-skills'],
  'integration-union-award': ['tc5.2', 'integration-union-award'],
  'integration-lang': ['tc5.3', 'integration-lang'],
  'integration-intl': ['tc5.4', 'integration-intl'],
  'integration-contest': ['tc5.5', 'integration-contest'],
};

function matchesRequirement(req: any, targetId: string): boolean {
  if (!req) return false;
  const targetNorm = targetId.toLowerCase().trim();
  const rId = (req.id || '').toLowerCase().trim();
  const rCode = (req.code || '').toLowerCase().trim();
  if (rId === targetNorm || rCode === targetNorm) return true;
  for (const [canonical, aliases] of Object.entries(REQ_ALIAS_MAP)) {
    const isTarget = canonical === targetNorm || aliases.includes(targetNorm);
    if (isTarget) {
      if (
        canonical === rId ||
        aliases.includes(rId) ||
        canonical === rCode ||
        aliases.includes(rCode)
      ) {
        return true;
      }
    }
  }
  return false;
}

function getDeclarationsFromAppCriterion(studentApp: any, criterionId: string, requirementId: string): any[] {
  const crit = studentApp?.criteria?.find((c: any) => c.id === criterionId);
  if (!crit) return [];
  const reqListFromGroups =
    Array.isArray(crit.groups) && crit.groups.length > 0
      ? crit.groups.flatMap((g: any) => g.requirements || [])
      : [];
  const reqListFromDirect = Array.isArray(crit.requirements) ? crit.requirements : [];
  const reqList = reqListFromGroups.length > 0 ? reqListFromGroups : reqListFromDirect;

  const matchingReqs = reqList.filter((r: any) => matchesRequirement(r, requirementId));
  const byId = new Map<string, any>();
  for (const req of matchingReqs) {
    for (const d of req.declarations || []) {
      if (d?.id) byId.set(d.id, d);
    }
  }
  return Array.from(byId.values());
}

/**
 * Holistic Criterion-Level Structural Evaluation (Macro + Micro)
 * Checks both individual evidence OCR AND the mandatory/optional group rules required to pass each criterion
 * under Hướng dẫn số 14-HD/BTK-HSVTP (Sinh viên 5 tốt cấp Thành phố Đà Nẵng 2025–2026).
 */
export function evaluateCriterionHolisticConditions(
  criterionId: string,
  studentApp: any
): CriterionHolisticEvaluation {
  const metaMap: Record<string, { number: number; name: string }> = {
    ethics: { number: 1, name: 'Đạo đức tốt' },
    academic: { number: 2, name: 'Học tập tốt' },
    physical: { number: 3, name: 'Thể lực tốt' },
    volunteer: { number: 4, name: 'Tình nguyện tốt' },
    integration: { number: 5, name: 'Hội nhập tốt' },
  };
  const meta = metaMap[criterionId] || { number: 1, name: criterionId };
  const conditionChecklist: CriterionConditionCheckItem[] = [];
  const supportedRequirements: string[] = [];
  const insufficientRequirements: string[] = [];

  const checkSingleMandatoryRequirement = (
    reqId: string,
    groupTitle: string,
    label: string,
    ruleBadge: string
  ): CriterionConditionCheckItem => {
    const decls = getDeclarationsFromAppCriterion(studentApp, criterionId, reqId);
    if (decls.length === 0) {
      insufficientRequirements.push(label);
      return {
        id: reqId,
        groupTitle,
        label,
        ruleBadge,
        status: 'missing',
        detail: `Chưa kê khai điều kiện bắt buộc: ${label}`,
        declaredCount: 0,
        passedCount: 0,
        requiredCount: 1,
      };
    }

    let passedCount = 0;
    let firstPassText = '';
    let firstIssueText = '';

    for (const d of decls) {
      const rawFiles = d.evidenceFiles || d.evidence || [];
      const validFiles = rawFiles.filter(
        (f: any) =>
          f &&
          typeof (f.name || f.fileName || f.url || f.id) === 'string' &&
          (f.name || f.fileName || f.url || f.id).trim().length > 0
      );
      const isPledge = reqId === 'ethics-law' || reqId === 'tc1.2';
      if (!isPledge && validFiles.length === 0) {
        if (!firstIssueText) {
          firstIssueText = 'Chưa tải lên tệp minh chứng đối chiếu theo Hướng dẫn số 14-HD/BTK-HSVTP.';
        }
        continue;
      }

      const insight = evaluateDeclarationQuickInsight({
        criterionId,
        requirementId: reqId,
        requirementTitle: label,
        declaredValue: d.value || label,
        evidenceFiles: validFiles,
        allRequirementDeclarations: decls,
      });
      if (insight.status === 'preliminary_meets') {
        passedCount++;
        if (!firstPassText) firstPassText = insight.extractedText;
      } else {
        if (!firstIssueText) firstIssueText = insight.reasonText;
      }
    }

    if (passedCount > 0) {
      supportedRequirements.push(label);
      return {
        id: reqId,
        groupTitle,
        label,
        ruleBadge,
        status: 'met',
        detail: `Đạt sơ bộ: ${firstPassText}`,
        declaredCount: decls.length,
        passedCount,
        requiredCount: 1,
      };
    }

    insufficientRequirements.push(label);
    return {
      id: reqId,
      groupTitle,
      label,
      ruleBadge,
      status: 'verify_needed',
      detail:
        firstIssueText ||
        'Cần kiểm tra thêm tệp minh chứng của mục bắt buộc này theo Hướng dẫn số 14-HD/BTK-HSVTP.',
      declaredCount: decls.length,
      passedCount: 0,
      requiredCount: 1,
    };
  };

  const checkAtLeastOneInGroup = (
    groupId: string,
    groupTitle: string,
    label: string,
    ruleBadge: string,
    reqOptions: Array<{ id: string; title: string }>
  ): CriterionConditionCheckItem => {
    let declaredOptionCount = 0;
    let passedOptionCount = 0;
    let firstPassedSummary = '';
    let firstVerifySummary = '';

    for (const opt of reqOptions) {
      const decls = getDeclarationsFromAppCriterion(studentApp, criterionId, opt.id);
      if (decls.length === 0) continue;
      declaredOptionCount++;

      let optPassed = false;
      for (const d of decls) {
        const rawFiles = d.evidenceFiles || d.evidence || [];
        const validFiles = rawFiles.filter(
          (f: any) =>
            f &&
            typeof (f.name || f.fileName || f.url || f.id) === 'string' &&
            (f.name || f.fileName || f.url || f.id).trim().length > 0
        );
        if (validFiles.length === 0) {
          if (!firstVerifySummary) {
            firstVerifySummary = `${opt.title}: Chưa tải lên tệp minh chứng đối chiếu theo Hướng dẫn số 14-HD/BTK-HSVTP`;
          }
          continue;
        }

        const insight = evaluateDeclarationQuickInsight({
          criterionId,
          requirementId: opt.id,
          requirementTitle: opt.title,
          declaredValue: d.value || opt.title,
          evidenceFiles: validFiles,
          allRequirementDeclarations: decls,
        });
        if (insight.status === 'preliminary_meets') {
          optPassed = true;
          if (!firstPassedSummary) {
            firstPassedSummary = `${opt.title} (${insight.extractedText})`;
          }
        } else if (!firstVerifySummary) {
          firstVerifySummary = `${opt.title}: ${insight.reasonText}`;
        }
      }
      if (optPassed) {
        passedOptionCount++;
        supportedRequirements.push(opt.title);
      } else {
        insufficientRequirements.push(opt.title);
      }
    }

    if (declaredOptionCount === 0) {
      insufficientRequirements.push(label);
      return {
        id: groupId,
        groupTitle,
        label,
        ruleBadge,
        status: 'missing',
        detail: `Chưa kê khai: Bắt buộc đạt ít nhất 01/${String(reqOptions.length).padStart(
          2,
          '0'
        )} hình thức thuộc nhóm này và phải đính kèm tệp minh chứng theo Hướng dẫn số 14-HD/BTK-HSVTP`,
        declaredCount: 0,
        passedCount: 0,
        requiredCount: 1,
      };
    }

    if (passedOptionCount >= 1) {
      return {
        id: groupId,
        groupTitle,
        label,
        ruleBadge,
        status: 'met',
        detail: `Đạt sơ bộ (${passedOptionCount}/${reqOptions.length} hình thức có minh chứng hợp lệ): ${firstPassedSummary}`,
        declaredCount: declaredOptionCount,
        passedCount: passedOptionCount,
        requiredCount: 1,
      };
    }

    return {
      id: groupId,
      groupTitle,
      label,
      ruleBadge,
      status: 'verify_needed',
      detail:
        firstVerifySummary ||
        'Đã kê khai nhưng thiếu tệp minh chứng hợp lệ hoặc cần kiểm tra thêm theo Hướng dẫn số 14-HD/BTK-HSVTP.',
      declaredCount: declaredOptionCount,
      passedCount: 0,
      requiredCount: 1,
    };
  };

  if (criterionId === 'ethics') {
    conditionChecklist.push(
      checkSingleMandatoryRequirement(
        'ethics-score',
        'Điều kiện bắt buộc (1/2)',
        'Điểm rèn luyện cả năm >= 80/100 (hoặc loại Giỏi)',
        'Bắt buộc'
      ),
      checkSingleMandatoryRequirement(
        'ethics-law',
        'Điều kiện bắt buộc (2/2)',
        'Không vi phạm pháp luật, quy chế, nội quy',
        'Bắt buộc'
      ),
      checkAtLeastOneInGroup(
        'ethics-supplement',
        'Tiêu chuẩn bổ sung (Đạt ít nhất 01/04 hình thức)',
        'Đạt ít nhất 01/04 hình thức: Đảng viên / Đội thi Mác–Lênin / Tham luận / Gương người tốt việc tốt',
        'Tối thiểu 01/04',
        [
          { id: 'ethics-party', title: 'Là Đảng viên Đảng Cộng sản Việt Nam' },
          { id: 'ethics-politics-team', title: 'Thành viên đội thi tìm hiểu Mác–Lênin, tư tưởng HCM' },
          { id: 'ethics-politics-paper', title: 'Tham luận / bài viết về Mác–Lênin, tư tưởng HCM' },
          { id: 'ethics-commendation', title: 'Thanh niên tiêu biểu, gương người tốt việc tốt' },
        ]
      )
    );
  } else if (criterionId === 'academic') {
    conditionChecklist.push(
      checkSingleMandatoryRequirement(
        'academic-gpa',
        'Điều kiện bắt buộc',
        'Điểm TB học tập cả năm học (GPA >= 3.2/4.0 ĐH hoặc >= 3.0/4.0 CĐ)',
        'Bắt buộc'
      ),
      checkAtLeastOneInGroup(
        'academic-achievements',
        'Thành tích học thuật & NCKH (Đạt ít nhất 01/06 hình thức)',
        'Đạt ít nhất 01/06 hình thức: Đề tài NCKH / Bài báo / Hội thảo / Sáng tạo / Đội tuyển học thuật',
        'Tối thiểu 01/06',
        [
          { id: 'academic-nckh', title: 'Đề tài NCKH sinh viên đạt giải cấp Khoa trở lên' },
          { id: 'academic-paper', title: 'Bài viết đăng trên tạp chí chuyên ngành' },
          { id: 'academic-presentation', title: 'Bài tham luận tham gia hội thảo khoa học cấp Khoa trở lên' },
          { id: 'academic-product', title: 'Sản phẩm sáng tạo có bằng sáng chế / giải thưởng cấp Trường' },
          { id: 'academic-team', title: 'Thành viên đội tuyển thi học thuật cấp Trường trở lên' },
          { id: 'academic-innovation', title: 'Giải thưởng cuộc thi ý tưởng sáng tạo cấp Trường trở lên' },
        ]
      )
    );
  } else if (criterionId === 'physical') {
    conditionChecklist.push(
      checkAtLeastOneInGroup(
        'physical-forms',
        'Hình thức xác nhận thể lực (Đạt ít nhất 01/02 hình thức)',
        'Đạt ít nhất 01/02 hình thức: Danh hiệu «Thanh niên khỏe» cấp Trường+ HOẶC Đạt giải thể thao cấp Khoa+',
        'Tối thiểu 01/02',
        [
          { id: 'physical-khoe', title: 'Danh hiệu Thanh niên khỏe từ cấp Trường trở lên' },
          { id: 'physical-sport', title: 'Tham gia và đạt giải hoạt động thể thao phong trào cấp Khoa trở lên' },
        ]
      )
    );
  } else if (criterionId === 'volunteer') {
    const actDecls = getDeclarationsFromAppCriterion(studentApp, 'volunteer', 'volunteer-activities');
    const awardDecls = getDeclarationsFromAppCriterion(studentApp, 'volunteer', 'volunteer-award');

    let totalDeclaredDays = 0;
    let verifiedDays = 0;
    for (const d of actDecls) {
      const info = extractVolunteerDaysFromDeclaration(d);
      totalDeclaredDays += info.days;
      if (info.isEvidenceValid) {
        verifiedDays += info.days;
      }
    }

    let hasValidAward = false;
    let awardVerifyReason = '';
    for (const d of awardDecls) {
      const files = d.evidenceFiles || d.evidence || [];
      const insight = evaluateDeclarationQuickInsight({
        criterionId: 'volunteer',
        requirementId: 'volunteer-award',
        requirementTitle: 'Khen thưởng hoạt động tình nguyện từ cấp Khoa trở lên',
        declaredValue: d.value || 'Khen thưởng tình nguyện',
        evidenceFiles: files,
      });
      if (insight.status === 'preliminary_meets') {
        hasValidAward = true;
      } else if (!awardVerifyReason) {
        awardVerifyReason = insight.reasonText;
      }
    }

    const totalDecls = actDecls.length + awardDecls.length;
    if (totalDecls === 0) {
      insufficientRequirements.push('Tích lũy >= 05 ngày tình nguyện hoặc Khen thưởng tình nguyện cấp Khoa+');
      conditionChecklist.push({
        id: 'volunteer-activities-group',
        groupTitle: 'Phương án tình nguyện (Đạt ít nhất 01/02 hình thức)',
        label: 'Tích lũy >= 05 ngày tình nguyện/năm (hiến máu = 01 ngày/lần) HOẶC Khen thưởng tình nguyện cấp Khoa+',
        ruleBadge: 'Tối thiểu 01/02',
        status: 'missing',
        detail: 'Chưa kê khai hoạt động tình nguyện tích lũy (>= 05 ngày) hoặc khen thưởng tình nguyện cấp Khoa trở lên',
        declaredCount: 0,
        passedCount: 0,
        requiredCount: 1,
      });
    } else if (verifiedDays >= 5 || hasValidAward) {
      supportedRequirements.push(
        verifiedDays >= 5
          ? `Tích lũy ${verifiedDays}/05 ngày tình nguyện (${actDecls.length} hoạt động)`
          : 'Khen thưởng hoạt động tình nguyện cấp Khoa trở lên'
      );
      conditionChecklist.push({
        id: 'volunteer-activities-group',
        groupTitle: 'Phương án tình nguyện (Đạt ít nhất 01/02 hình thức)',
        label: 'Tích lũy >= 05 ngày tình nguyện/năm (hiến máu = 01 ngày/lần) HOẶC Khen thưởng tình nguyện cấp Khoa+',
        ruleBadge: 'Tối thiểu 01/02',
        status: 'met',
        detail:
          verifiedDays >= 5
            ? `Đạt sơ bộ: Đã tích lũy đủ ${verifiedDays}/05 ngày tình nguyện qua ${actDecls.length} hoạt động có minh chứng hợp lệ`
            : 'Đạt sơ bộ: Có giấy khen hoạt động tình nguyện từ cấp Khoa trở lên hợp lệ',
        declaredCount: totalDecls,
        passedCount: 1,
        requiredCount: 1,
      });
    } else {
      insufficientRequirements.push('Hoạt động tình nguyện tích lũy (Tối thiểu 05 ngày/năm)');
      const detailText =
        totalDeclaredDays > 0 && totalDeclaredDays < 5
          ? `Mới tích lũy ${totalDeclaredDays}/05 ngày tình nguyện qua ${actDecls.length} hoạt động (còn thiếu ${5 - totalDeclaredDays} ngày) và chưa có giấy khen tình nguyện cấp Khoa trở lên`
          : awardVerifyReason ||
            `Đã kê khai ${totalDeclaredDays}/05 ngày tình nguyện (đã xác thực sơ bộ ${verifiedDays} ngày) — cần kiểm tra thêm tệp minh chứng`;
      conditionChecklist.push({
        id: 'volunteer-activities-group',
        groupTitle: 'Phương án tình nguyện (Đạt ít nhất 01/02 hình thức)',
        label: 'Tích lũy >= 05 ngày tình nguyện/năm (hiến máu = 01 ngày/lần) HOẶC Khen thưởng tình nguyện cấp Khoa+',
        ruleBadge: 'Tối thiểu 01/02',
        status: 'verify_needed',
        detail: detailText,
        declaredCount: totalDecls,
        passedCount: 0,
        requiredCount: 1,
      });
    }
  } else if (criterionId === 'integration') {
    conditionChecklist.push(
      checkAtLeastOneInGroup(
        'integration-skills-award',
        'Nhóm A bắt buộc (Đạt ít nhất 01/02 hình thức)',
        'Nhóm A: Khóa kỹ năng thực hành xã hội HOẶC Khen thưởng công tác Đoàn - Hội cấp Khoa+',
        'Nhóm A (01/02)',
        [
          { id: 'integration-skills', title: 'Hoàn thành khóa trang bị kỹ năng thực hành xã hội' },
          { id: 'integration-union-award', title: 'Khen thưởng công tác Đoàn - Hội từ cấp Khoa trở lên' },
        ]
      ),
      checkAtLeastOneInGroup(
        'integration-languages-intl',
        'Nhóm B bắt buộc (Đạt ít nhất 01/03 hình thức)',
        'Nhóm B: Chuẩn ngoại ngữ (B1 / IELTS >= 4.5 / TOEIC >= 405 / ĐTB >= 3.0) HOẶC Giao lưu quốc tế HOẶC Giải Ba+ cuộc thi ngoại ngữ',
        'Nhóm B (01/03)',
        [
          { id: 'integration-lang', title: 'Tiêu chuẩn năng lực ngoại ngữ' },
          { id: 'integration-intl', title: 'Tham gia hoạt động giao lưu, hợp tác quốc tế cấp Khoa trở lên' },
          { id: 'integration-contest', title: 'Đạt từ Giải Ba trở lên cuộc thi kiến thức / ngoại ngữ cấp Khoa trở lên' },
        ]
      )
    );
  }

  const metConditionsCount = conditionChecklist.filter((c) => c.status === 'met').length;
  const totalConditionsCount = conditionChecklist.length;
  const missingItems = conditionChecklist.filter((c) => c.status === 'missing');
  const verifyItems = conditionChecklist.filter((c) => c.status === 'verify_needed');

  const isAllMet = totalConditionsCount > 0 && metConditionsCount === totalConditionsCount;
  const verdict: 'preliminary_meets' | 'insufficient_evidence' = isAllMet
    ? 'preliminary_meets'
    : 'insufficient_evidence';
  const badgeLabel = isAllMet ? 'Đạt sơ bộ' : 'Cần kiểm tra thêm';

  let headline = '';
  let detail = '';

  if (isAllMet) {
    headline = `Tiêu chí 0${meta.number} (${meta.name}): Toàn bộ thông tin kê khai đối chiếu khớp với minh chứng và đạt đủ ${metConditionsCount}/${totalConditionsCount} nhóm điều kiện quy chế.`;
    detail = conditionChecklist.map((c) => `✓ ${c.label}: ${c.detail}`).join(' · ');
  } else if (missingItems.length === totalConditionsCount) {
    headline = `Tiêu chí 0${meta.number} (${meta.name}): Chưa kê khai (${0}/${totalConditionsCount} điều kiện bắt buộc).`;
    detail = `Để đạt tiêu chí này, sinh viên cần đáp ứng đủ ${totalConditionsCount} điều kiện: ${conditionChecklist
      .map((c) => c.label)
      .join('; ')}.`;
  } else if (missingItems.length > 0) {
    headline = `Mới đạt ${metConditionsCount}/${totalConditionsCount} điều kiện tiêu chí · Còn thiếu: ${missingItems
      .map((m) => m.groupTitle || m.label)
      .join(', ')}.`;
    detail = conditionChecklist
      .map((c) => `${c.status === 'met' ? '✓' : '!'} ${c.detail}`)
      .join(' · ');
  } else {
    headline = `Đạt ${metConditionsCount}/${totalConditionsCount} điều kiện tiêu chí · Cần kiểm tra: ${
      verifyItems[0]?.detail || 'Cần đối chiếu thêm tệp minh chứng.'
    }`;
    detail = conditionChecklist
      .map((c) => `${c.status === 'met' ? '✓' : '!'} ${c.detail}`)
      .join(' · ');
  }

  return {
    criterionId,
    criterionNumber: meta.number,
    criterionName: meta.name,
    verdict,
    badgeLabel,
    headline,
    detail,
    metConditionsCount,
    totalConditionsCount,
    conditionChecklist,
    supportedRequirements,
    insufficientRequirements,
  };
}

export async function fetchCopilotScopeAnalysis(
  payload: CopilotScopeAnalysisRequest,
  forceRefresh = false
): Promise<CopilotScopeAnalysisResponse> {
  const cacheKey = `${payload.criterionId}:${payload.requirementId}:${payload.declarationId || 'none'}:${payload.evidenceList.map(e => e.id).join(',')}`;
  
  if (!forceRefresh && analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey)!;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/v2/copilot/analyze-scope`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      forceRefresh,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  const result: CopilotScopeAnalysisResponse = await response.json();
  if (Array.isArray(result.ocrExtractions)) {
    for (const ext of result.ocrExtractions) {
      ocrExtractionCache.set(ext.evidenceId, ext);
    }
    notifyOcrListeners();
  }
  analysisCache.set(cacheKey, result);
  return result;
}

export async function askCopilotContext(payload: CopilotAskRequest): Promise<CopilotAskResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/v2/copilot/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export async function fetchCopilotDossierSummary(
  applicationData: any,
  criteriaProgress: any
): Promise<CopilotDossierSummaryResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/v2/copilot/dossier-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ applicationData, criteriaProgress }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}
