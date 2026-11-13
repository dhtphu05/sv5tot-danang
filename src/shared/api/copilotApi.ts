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

export function evaluateDeclarationQuickInsight(params: {
  criterionId: string;
  requirementTitle: string;
  declaredValue: string;
  evidenceFiles: Array<{ id: string; name: string; url?: string; status?: string }>;
  studentName?: string;
}): DeclarationQuickOcrInsight {
  const { criterionId, requirementTitle, declaredValue, evidenceFiles, studentName } = params;

  if (!evidenceFiles || evidenceFiles.length === 0) {
    return {
      status: 'insufficient_evidence',
      badgeLabel: 'Cần kiểm tra thêm',
      declaredText: declaredValue || requirementTitle,
      extractedText: 'Chưa có tệp minh chứng đính kèm',
      authorityText: 'Cần sinh viên bổ sung tệp xác nhận',
      stampVerified: false,
      reasonText: 'Mục kê khai này chưa có tệp minh chứng đính kèm để đối chiếu.',
      draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, nội dung kê khai "${declaredValue || requirementTitle}" hiện chưa có tệp minh chứng đính kèm. Đề nghị bạn bổ sung bản chụp/scan văn bản xác nhận có dấu hợp lệ.`,
      aiSource: 'rule_engine',
    };
  }

  const extractions = evidenceFiles.map((ev) =>
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
  const hasFlaggedFile = evidenceFiles.some((ev) => ev.status === 'needs_verification');
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

  // 1. Mandatory Academic GPA Check
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
    const reason = `Cần kiểm tra thêm: Điểm GPA đọc sơ bộ từ minh chứng (${gpaVal}/4.0) thấp hơn ngưỡng quy chuẩn (3.2/4.0 hệ Đại học, 3.0/4.0 hệ Cao đẳng) hoặc cần kiểm tra lại bản gốc.`;
    return {
      status: 'insufficient_evidence',
      badgeLabel: 'Cần kiểm tra thêm',
      declaredText: declaredValue || requirementTitle,
      extractedText: `${primary.documentType}: ${primary.extractedValue}`,
      authorityText: authorityWithDate,
      stampVerified: primary.hasRedStampOrSignature === 'verified',
      reasonText: reason,
      draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, qua đọc minh chứng tại mục "${declaredValue || requirementTitle}", hệ thống ghi nhận điểm GPA sơ bộ (${gpaVal}/4.0) cần kiểm tra lại so với quy chuẩn. Đề nghị bạn kiểm tra và bổ sung bảng điểm cả năm học rõ nét.`,
      aiSource: usedOpenAi ? 'openai' : 'rule_engine',
    };
  }

  // 2. Mandatory Ethics Conduct Score Check (>= 80/100)
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
    const reason = `Cần kiểm tra thêm: Điểm rèn luyện đọc sơ bộ từ minh chứng (${drlVal}/100) chưa đủ ngưỡng 80/100 điểm hoặc cần kiểm tra lại bản gốc.`;
    return {
      status: 'insufficient_evidence',
      badgeLabel: 'Cần kiểm tra thêm',
      declaredText: declaredValue || requirementTitle,
      extractedText: `${primary.documentType}: ${primary.extractedValue}`,
      authorityText: authorityWithDate,
      stampVerified: primary.hasRedStampOrSignature === 'verified',
      reasonText: reason,
      draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, qua đọc minh chứng tại mục "${declaredValue || requirementTitle}", hệ thống ghi nhận điểm rèn luyện sơ bộ (${drlVal}/100) cần kiểm tra lại so với ngưỡng 80/100 điểm. Đề nghị bạn bổ sung bản xác nhận điểm rèn luyện đầy đủ.`,
      aiSource: usedOpenAi ? 'openai' : 'rule_engine',
    };
  }

  // 3. Volunteer Days Check (>= 5 days cumulative)
  if (criterionId === 'volunteer' && lowerContext.includes('ngày')) {
    const totalDays = extractions.reduce((sum, e) => {
      if (typeof e.numericMetric === 'number' && e.numericMetric > 0 && e.numericMetric <= 365) {
        return sum + e.numericMetric;
      }
      const m = (e.extractedValue || '').match(/(\d+)\s*ngày/i);
      return sum + (m ? parseInt(m[1], 10) : 0);
    }, 0);
    if (totalDays > 0 && totalDays < 5) {
      const reason = `Cần kiểm tra thêm: Minh chứng xác nhận ${totalDays} ngày tình nguyện (quy chế yêu cầu tích lũy tối thiểu 05 ngày/năm học).`;
      return {
        status: 'insufficient_evidence',
        badgeLabel: 'Cần kiểm tra thêm',
        declaredText: declaredValue || requirementTitle,
        extractedText: `${primary.documentType}: ${primary.extractedValue}`,
        authorityText: authorityWithDate,
        stampVerified: primary.hasRedStampOrSignature === 'verified',
        reasonText: reason,
        draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, qua đọc minh chứng tại mục "${declaredValue || requirementTitle}", hệ thống ghi nhận ${totalDays} ngày tình nguyện (quy chế yêu cầu tối thiểu 05 ngày/năm). Đề nghị bạn bổ sung thêm giấy chứng nhận hoạt động tình nguyện.`,
        aiSource: usedOpenAi ? 'openai' : 'rule_engine',
      };
    }
  }

  if (hasMismatch) {
    const mismatchItem = extractions.find((e) => e.matchWithDeclaration === 'mismatch') || primary;
    const reason =
      mismatchItem.discrepancyNote ||
      'Cần kiểm tra thêm: Số liệu đọc từ minh chứng có sự chênh lệch hoặc cần đối chiếu lại.';
    return {
      status: 'insufficient_evidence',
      badgeLabel: 'Cần kiểm tra thêm',
      declaredText: declaredValue || requirementTitle,
      extractedText: `${mismatchItem.documentType}: ${mismatchItem.extractedValue}`,
      authorityText: `${mismatchItem.issuingAuthority}${mismatchItem.issueDate ? ` · ${mismatchItem.issueDate}` : ''}`,
      stampVerified: mismatchItem.hasRedStampOrSignature === 'verified',
      reasonText: reason,
      draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, qua đối chiếu mục "${declaredValue || requirementTitle}", hệ thống ghi nhận: ${reason} Đề nghị bạn kiểm tra và bổ sung minh chứng xác nhận đầy đủ theo quy chế.`,
      aiSource: usedOpenAi ? 'openai' : 'rule_engine',
    };
  }

  if (hasPartial) {
    const partialItem =
      extractions.find((e) => e.matchWithDeclaration === 'partial' || e.hasRedStampOrSignature !== 'verified') ||
      primary;
    const reason =
      partialItem.discrepancyNote ||
      'Cần cán bộ kiểm tra trực tiếp dấu xác nhận hoặc tính tương đương của minh chứng.';
    return {
      status: 'insufficient_evidence',
      badgeLabel: 'Cần kiểm tra thêm',
      declaredText: declaredValue || requirementTitle,
      extractedText: `${partialItem.documentType}: ${partialItem.extractedValue}`,
      authorityText: `${partialItem.issuingAuthority}${partialItem.issueDate ? ` · ${partialItem.issueDate}` : ''}`,
      stampVerified: partialItem.hasRedStampOrSignature === 'verified',
      reasonText: reason,
      draftSupplementMessage: `Kính gửi sinh viên ${studentName || ''}, minh chứng tại mục "${declaredValue || requirementTitle}" cần làm rõ thêm dấu xác nhận hoặc quy chuẩn tương đương. Đề nghị bạn bổ sung tài liệu rõ nét hơn.`,
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
    reasonText: 'Thông tin chi tiết bóc tách từ tệp minh chứng hợp lệ và đạt ngưỡng quy chế.',
    aiSource: usedOpenAi ? 'openai' : 'rule_engine',
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
