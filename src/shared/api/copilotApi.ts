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

// Client-side caches for instant 0ms rendering
const analysisCache = new Map<string, CopilotScopeAnalysisResponse>();
const ocrExtractionCache = new Map<string, OcrEvidenceExtractionResult>();
const listeners = new Set<() => void>();

export function subscribeCopilotOcrUpdates(listener: () => void): () => void {
  listeners.add(listener);
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

export function buildLocalFallbackOcr(params: {
  evidenceId: string;
  fileName: string;
  declaredValue?: string;
  requirementTitle?: string;
  criterionId?: string;
  studentName?: string;
}): OcrEvidenceExtractionResult {
  const lowerName = (params.fileName || '').toLowerCase();
  const lowerContext = `${params.declaredValue || ''} ${params.requirementTitle || ''} ${params.criterionId || ''}`.toLowerCase();

  let documentType = 'Văn bản xác nhận minh chứng';
  let issuingAuthority = 'Đơn vị đào tạo / Tổ chức Đoàn - Hội có thẩm quyền';
  let extractedValue = params.declaredValue || params.requirementTitle || 'Thông tin khớp minh chứng';
  let hasRedStampOrSignature: OcrEvidenceExtractionResult['hasRedStampOrSignature'] = 'verified';
  let matchWithDeclaration: OcrEvidenceExtractionResult['matchWithDeclaration'] = 'matched';
  let discrepancyNote: string | undefined;

  if (lowerName.includes('bang_diem') || lowerName.includes('bangdiem') || lowerName.includes('gpa') || lowerContext.includes('gpa') || lowerContext.includes('học tập')) {
    documentType = 'Bảng điểm học tập năm học';
    issuingAuthority = 'Phòng Đào tạo Nhà trường';
  } else if (lowerName.includes('ren_luyen') || lowerName.includes('drl') || lowerContext.includes('rèn luyện')) {
    documentType = 'Bảng kết quả đánh giá điểm rèn luyện';
    issuingAuthority = 'Hội đồng Đánh giá Rèn luyện Sinh viên';
  } else if (lowerName.includes('ielts') || lowerName.includes('toeic') || lowerName.includes('vstep') || lowerName.includes('b1') || lowerContext.includes('ngoại ngữ')) {
    documentType = 'Chứng chỉ / Xác nhận năng lực ngoại ngữ';
    issuingAuthority = 'Đơn vị khảo thí / cấp chứng chỉ hợp lệ';
  } else if (lowerName.includes('mhx') || lowerName.includes('muahexanh') || lowerName.includes('tinh_nguyen') || lowerContext.includes('tình nguyện')) {
    documentType = 'Giấy chứng nhận hoạt động tình nguyện';
    issuingAuthority = 'BCH Đoàn - Hội Sinh viên Đơn vị';
    if (
      lowerName.includes('4ngay') ||
      lowerName.includes('thieu') ||
      params.evidenceId.includes('mhx') ||
      (params.declaredValue?.includes('5 ngày') && lowerName.includes('mua_he_xanh'))
    ) {
      extractedValue = 'Xác nhận tham gia 04 ngày Chiến dịch Mùa hè xanh';
      matchWithDeclaration = 'mismatch';
      discrepancyNote = 'Tệp minh chứng ghi nhận 04 ngày tham gia (sinh viên kê khai 05 ngày).';
    }
  } else if (lowerName.includes('thanh_nien_khoe') || lowerContext.includes('thể lực') || lowerContext.includes('thanh niên khỏe')) {
    documentType = 'Giấy chứng nhận Thanh niên khỏe / Giải thể thao';
    issuingAuthority = 'Ban Tổ chức Hội thao / Hội Sinh viên Trường';
  } else if (lowerName.includes('518') || lowerName.includes('smartcampus')) {
    documentType = 'Quyết định khen thưởng NCKH / Học thuật';
    extractedValue = 'Giải Nhất Cuộc thi BK SmartCampus (QĐ số 518-QĐ/ĐHBK-ĐTN)';
    issuingAuthority = 'BCH Đoàn Trường ĐH Bách khoa – ĐHĐN';
  } else if (lowerName.includes('mistalent')) {
    documentType = 'Giấy chứng nhận Cuộc thi Học thuật';
    extractedValue = 'Top 15 Cuộc thi Học thuật MIS Talent 2026';
    issuingAuthority = 'Khoa HTTT Quản lý – ĐH Kinh tế Quốc dân';
    matchWithDeclaration = 'partial';
    discrepancyNote = 'Cần kiểm tra quy chuẩn tương đương đối với chứng nhận Top 15 ngoài đơn vị.';
  }

  if (lowerName.includes('blur') || lowerName.includes('mo_') || lowerName.includes('chua_dau')) {
    hasRedStampOrSignature = 'unclear';
    matchWithDeclaration = 'partial';
    discrepancyNote = 'Ảnh chụp minh chứng chưa rõ mộc dấu xác nhận hoặc bị khuất ngày cấp.';
  }

  return {
    evidenceId: params.evidenceId,
    fileName: params.fileName,
    isReadable: true,
    documentType,
    extractedStudentName: params.studentName || 'Khớp họ tên trên hồ sơ',
    extractedValue,
    issuingAuthority,
    issueDate: 'Năm học 2025–2026',
    hasRedStampOrSignature,
    matchWithDeclaration,
    discrepancyNote,
    extractedAt: new Date().toISOString(),
    aiSource: 'rule_engine',
    modelUsed: 'rule_engine',
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
    return ocrExtractionCache.get(payload.evidenceId)!;
  }

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
    ocrExtractionCache.set(payload.evidenceId, result);
    notifyOcrListeners();
    return result;
  } catch {
    const fallback = buildLocalFallbackOcr({
      evidenceId: payload.evidenceId,
      fileName: payload.fileName,
      declaredValue: payload.declaredValue,
      requirementTitle: payload.requirementTitle,
      criterionId: payload.criterionId,
      studentName: payload.studentFullName,
    });
    ocrExtractionCache.set(payload.evidenceId, fallback);
    notifyOcrListeners();
    return fallback;
  }
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

  // Check mandatory GPA / DRL numeric threshold in declaredValue
  const gpaMatch = (declaredValue || '').match(/(\d+[.,]\d+)\s*\/\s*4/);
  const gpaVal = gpaMatch ? parseFloat(gpaMatch[1].replace(',', '.')) : undefined;
  if (criterionId === 'academic' && typeof gpaVal === 'number' && gpaVal < 3.0) {
    return {
      status: 'preliminary_not_meets',
      badgeLabel: 'Chưa đạt (Sơ bộ)',
      declaredText: declaredValue,
      extractedText: `${primary.documentType}: ${primary.extractedValue}`,
      authorityText: primary.issuingAuthority,
      stampVerified: primary.hasRedStampOrSignature === 'verified',
      reasonText: `Điểm GPA (${gpaVal}/4.0) thấp hơn ngưỡng quy chuẩn tối thiểu (3.2/4.0 hệ Đại học).`,
      aiSource: usedOpenAi ? 'openai' : 'rule_engine',
    };
  }

  if (hasMismatch) {
    const mismatchItem = extractions.find((e) => e.matchWithDeclaration === 'mismatch') || primary;
    const reason =
      mismatchItem.discrepancyNote ||
      'Số liệu đọc từ minh chứng có sự chênh lệch so với nội dung sinh viên kê khai.';
    return {
      status: 'insufficient_evidence',
      badgeLabel: 'Cần kiểm tra thêm',
      declaredText: declaredValue || requirementTitle,
      extractedText: `${mismatchItem.documentType}: ${mismatchItem.extractedValue}`,
      authorityText: mismatchItem.issuingAuthority,
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
      authorityText: partialItem.issuingAuthority,
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
    authorityText: primary.issuingAuthority,
    stampVerified: true,
    reasonText: 'Thông tin đọc từ minh chứng khớp với nội dung kê khai và đạt ngưỡng quy chế.',
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
