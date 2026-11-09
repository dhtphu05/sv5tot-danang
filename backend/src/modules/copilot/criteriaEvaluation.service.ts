/**
 * 5TOT Đà Nẵng — Criteria Preliminary Evaluation Engine (Backend V2)
 * Cơ quan chỉ đạo: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Combines OpenAI Vision/Document OCR extractions with deterministic SV5T 2025–2026
 * criteria rules (Hướng dẫn số 14-HD/BTK-HSVTP) to classify each declaration,
 * criterion, and application into:
 * - preliminary_meets ("Đạt sơ bộ")
 * - insufficient_evidence ("Cần kiểm tra thêm")
 * - preliminary_not_meets ("Chưa đạt")
 */

import { getEnvironment } from '../../config/environment';
import {
  extractEvidenceWithOpenAI,
  type OcrEvidenceExtraction,
  type OpenAiRuntimeOptions,
} from './openaiOcr.service';

export type PreliminaryStatusCode =
  | 'preliminary_meets'
  | 'insufficient_evidence'
  | 'preliminary_not_meets';

export interface ScopeEvaluationPayload {
  criterionId: string;
  criterionName: string;
  criterionNumber: number;
  requirementId: string;
  requirementTitle: string;
  declarationId?: string;
  declarationTitle?: string;
  declarationDetail?: string;
  evidenceList: Array<{
    id: string;
    name: string;
    fileType?: string;
    fileSize?: number;
    url?: string;
    base64?: string;
    studentNote?: string;
    uploadDate?: string;
  }>;
  studentInfo?: {
    fullName: string;
    studentCode: string;
    schoolName: string;
    faculty?: string;
    academicYear?: string;
  };
  reviewStage?: 'SCHOOL' | 'CITY' | 'COMMITTEE';
  forceRefresh?: boolean;
}

export interface ScopeEvaluationResult {
  suggestedVerdict: 'SATISFIED' | 'SUPPLEMENT_REQUIRED' | 'CONSIDERATION_NEEDED' | 'UNSUITABLE';
  preliminaryStatus: PreliminaryStatusCode;
  preliminaryBadgeLabel: 'Đạt sơ bộ' | 'Cần kiểm tra thêm' | 'Chưa đạt (Sơ bộ)';
  confidenceScore: number;
  headlineSummary: string;
  detailedAnalysis: string;
  declaredSummary: string;
  extractedSummary: string;
  ocrExtractions: OcrEvidenceExtraction[];
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
  aiSource: 'openai' | 'rule_engine' | 'gemini-3.8-flash';
}

export interface FullApplicationEvalRequest {
  applicationId: string;
  studentInfo?: {
    fullName: string;
    studentCode: string;
    schoolName: string;
    faculty?: string;
    academicYear?: string;
  };
  criteria: Array<{
    criterionId: string;
    criterionName: string;
    criterionNumber: number;
    declarations: Array<{
      declarationId: string;
      requirementId: string;
      requirementTitle: string;
      declaredValue: string;
      declaredDetail?: string;
      evidenceList: Array<{
        id: string;
        name: string;
        fileType?: string;
        url?: string;
        base64?: string;
        studentNote?: string;
      }>;
    }>;
  }>;
  forceRefresh?: boolean;
}

export interface FullApplicationEvalResponse {
  applicationId: string;
  overallVerdict: PreliminaryStatusCode;
  overallBadgeLabel: 'Đạt sơ bộ 5/5 tiêu chí' | 'Cần kiểm tra thêm' | 'Chưa đạt (Sơ bộ)';
  headlineSummary: string;
  passedCriteriaCount: number;
  verifyNeededCriteriaCount: number;
  failedCriteriaCount: number;
  criteriaResults: Record<
    string,
    {
      criterionId: string;
      criterionName: string;
      criterionNumber: number;
      status: PreliminaryStatusCode;
      badgeLabel: 'Đạt sơ bộ' | 'Cần kiểm tra thêm' | 'Chưa đạt';
      headline: string;
      declarations: Record<string, ScopeEvaluationResult>;
    }
  >;
  evaluatedAt: string;
  aiSource: 'openai' | 'rule_engine';
}

const applicationEvalCache = new Map<string, FullApplicationEvalResponse>();

export function inferEducationLevelFromSchool(schoolName?: string): 'Đại học' | 'Cao đẳng' {
  const lower = (schoolName || '').toLowerCase();
  if (
    lower.includes('cao đẳng') ||
    lower.includes('fpt polytechnic') ||
    lower.includes('btec fpt') ||
    lower.includes('thaco') ||
    lower.includes('cđ ')
  ) {
    return 'Cao đẳng';
  }
  return 'Đại học';
}

function evaluateMandatoryThresholdBreach(
  criterionId: string,
  requirementTitle: string,
  declaredTitle: string,
  extractions: OcrEvidenceExtraction[],
  schoolName?: string
): {
  isHardFail: boolean;
  isVerifyNeeded: boolean;
  reason?: string;
} {
  const lowerCrit = (criterionId || '').toLowerCase();
  const lowerReq = `${requirementTitle} ${declaredTitle}`.toLowerCase();
  const primaryMetric = extractions.find((e) => typeof e.numericMetric === 'number')?.numericMetric;
  const eduLevel = inferEducationLevelFromSchool(schoolName);

  // 1. Academic GPA Check (Đại học >= 3.2/4.0 or >= 8.0/10; Cao đẳng >= 3.0/4.0 or >= 7.5/10)
  if (
    lowerCrit.includes('academic') &&
    (lowerReq.includes('gpa') || lowerReq.includes('điểm trung bình'))
  ) {
    if (typeof primaryMetric === 'number') {
      const isScale4 = declaredTitle.includes('/4') || primaryMetric <= 4.0;
      const minScale4 = schoolName ? (eduLevel === 'Cao đẳng' ? 3.0 : 3.2) : 3.0;
      const minScale10 = schoolName ? (eduLevel === 'Cao đẳng' ? 7.5 : 8.0) : 7.5;
      if (isScale4 && primaryMetric < minScale4) {
        return {
          isHardFail: true,
          isVerifyNeeded: false,
          reason: `Điểm trung bình học tập đọc được (${primaryMetric}/4.0) thấp hơn ngưỡng quy chuẩn tối thiểu (${minScale4.toFixed(1)}/4.0 đối với hệ ${eduLevel}).`,
        };
      }
      if (!isScale4 && primaryMetric < minScale10) {
        return {
          isHardFail: true,
          isVerifyNeeded: false,
          reason: `Điểm trung bình học tập hệ 10 (${primaryMetric}/10) thấp hơn ngưỡng tối thiểu quy định (${minScale10.toFixed(1)}/10 đối với hệ ${eduLevel}).`,
        };
      }
    }
  }

  // 2. Ethics Conduct Score Check (>= 80/100)
  if (lowerCrit.includes('ethics') && lowerReq.includes('rèn luyện')) {
    if (typeof primaryMetric === 'number' && primaryMetric > 10 && primaryMetric < 80) {
      return {
        isHardFail: true,
        isVerifyNeeded: false,
        reason: `Điểm rèn luyện (${primaryMetric}/100) chưa đạt ngưỡng tối thiểu 80/100 điểm theo quy chế.`,
      };
    }
  }

  // 3. Volunteer Days Check (>= 5 days cumulative)
  if (lowerCrit.includes('volunteer') && lowerReq.includes('ngày')) {
    const totalDays = extractions.reduce(
      (sum, e) => sum + (typeof e.numericMetric === 'number' ? e.numericMetric : 0),
      0
    );
    if (totalDays > 0 && totalDays < 5) {
      return {
        isHardFail: false,
        isVerifyNeeded: true,
        reason: `Minh chứng hiện tại xác nhận ${totalDays.toString().replace(/^(\d)$/, '0$1')} ngày tình nguyện (quy chế yêu cầu tích lũy tối thiểu 05 ngày/năm học). Cần kiểm tra hoặc yêu cầu bổ sung thêm giấy chứng nhận.`,
      };
    }
  }

  return { isHardFail: false, isVerifyNeeded: false };
}

export async function evaluateScopeWithOpenAiAndRules(
  payload: ScopeEvaluationPayload,
  options?: OpenAiRuntimeOptions
): Promise<ScopeEvaluationResult> {
  const evidenceList = Array.isArray(payload.evidenceList) ? payload.evidenceList : [];
  const hasEvidence = evidenceList.length > 0;
  const declaredSummary =
    payload.declarationTitle || payload.requirementTitle || 'Đã kê khai theo tiêu chuẩn';

  if (!hasEvidence) {
    const draftSupplementMessage = `Kính gửi sinh viên ${payload.studentInfo?.fullName || ''}, nội dung kê khai "${declaredSummary}" thuộc ${payload.criterionName} hiện chưa có tệp minh chứng đính kèm. Đề nghị bạn bổ sung bản chụp/scan văn bản xác nhận có dấu hợp lệ.`;
    return {
      suggestedVerdict: 'SUPPLEMENT_REQUIRED',
      preliminaryStatus: 'insufficient_evidence',
      preliminaryBadgeLabel: 'Cần kiểm tra thêm',
      confidenceScore: 98,
      headlineSummary: 'Chưa đính kèm tệp minh chứng cho nội dung kê khai này.',
      detailedAnalysis: `Sinh viên đã kê khai "${declaredSummary}" nhưng chưa tải lên tệp minh chứng đối chiếu. Cán bộ có thể gửi yêu cầu bổ sung minh chứng.`,
      declaredSummary,
      extractedSummary: 'Chưa có tệp minh chứng đính kèm',
      ocrExtractions: [],
      complianceChecks: [
        {
          item: 'Đính kèm minh chứng xác thực',
          passed: false,
          detail: 'Chưa có tệp minh chứng tải lên cho mục kê khai này.',
        },
      ],
      evidenceAssessment: [],
      flaggedRisks: ['Thiếu tệp minh chứng để đối chiếu thông tin kê khai.'],
      draftInternalNote: `[Đánh giá sơ bộ] Mục "${declaredSummary}" thiếu tệp minh chứng đính kèm.`,
      draftSupplementMessage,
      regulationCitation: `Hướng dẫn số 14-HD/BTK-HSVTP · Tiêu chí 0${payload.criterionNumber} (${payload.criterionName})`,
      aiSource: 'rule_engine',
    };
  }

  // Run OCR across all evidence items in parallel
  const ocrExtractions = await Promise.all(
    evidenceList.map((ev) =>
      extractEvidenceWithOpenAI(
        {
          evidenceId: ev.id,
          fileName: ev.name,
          mimeType: ev.fileType,
          fileUrl: ev.url,
          fileBase64: ev.base64,
          studentNote: ev.studentNote,
          studentFullName: payload.studentInfo?.fullName,
          studentCode: payload.studentInfo?.studentCode,
          schoolName: payload.studentInfo?.schoolName,
          criterionId: payload.criterionId,
          criterionName: payload.criterionName,
          requirementId: payload.requirementId,
          requirementTitle: payload.requirementTitle,
          declaredValue: payload.declarationTitle || payload.requirementTitle,
          declaredDetail: payload.declarationDetail,
          forceRefresh: payload.forceRefresh,
        },
        options
      )
    )
  );

  const usedOpenAi = ocrExtractions.some((e) => e.aiSource === 'openai');
  const thresholdCheck = evaluateMandatoryThresholdBreach(
    payload.criterionId,
    payload.requirementTitle,
    declaredSummary,
    ocrExtractions,
    payload.studentInfo?.schoolName
  );

  const hasMismatch = ocrExtractions.some((e) => e.matchWithDeclaration === 'mismatch');
  const hasPartialOrUnclear = ocrExtractions.some(
    (e) =>
      e.matchWithDeclaration === 'partial' ||
      !e.isReadable ||
      e.hasRedStampOrSignature === 'unclear' ||
      e.hasRedStampOrSignature === 'missing'
  );

  const extractedSummary = ocrExtractions
    .map((e) => `${e.documentType}: ${e.extractedValue}`)
    .join(' · ');

  let suggestedVerdict: ScopeEvaluationResult['suggestedVerdict'] = 'SATISFIED';
  let preliminaryStatus: PreliminaryStatusCode = 'preliminary_meets';
  let preliminaryBadgeLabel: ScopeEvaluationResult['preliminaryBadgeLabel'] = 'Đạt sơ bộ';
  let headlineSummary = 'Thông tin đọc từ minh chứng khớp với kê khai và đạt chuẩn quy chế.';
  let draftSupplementMessage: string | undefined;
  const flaggedRisks: string[] = [];

  if (thresholdCheck.isHardFail) {
    suggestedVerdict = 'UNSUITABLE';
    preliminaryStatus = 'preliminary_not_meets';
    preliminaryBadgeLabel = 'Chưa đạt (Sơ bộ)';
    headlineSummary = thresholdCheck.reason || 'Chưa đạt ngưỡng bắt buộc của quy chế.';
    flaggedRisks.push(headlineSummary);
  } else if (thresholdCheck.isVerifyNeeded || hasMismatch) {
    suggestedVerdict = 'SUPPLEMENT_REQUIRED';
    preliminaryStatus = 'insufficient_evidence';
    preliminaryBadgeLabel = 'Cần kiểm tra thêm';
    const mismatchNote =
      thresholdCheck.reason ||
      ocrExtractions.find((e) => e.discrepancyNote)?.discrepancyNote ||
      'Có sự chênh lệch giữa số liệu kê khai và thông tin đọc được trên minh chứng.';
    headlineSummary = mismatchNote;
    flaggedRisks.push(mismatchNote);
    draftSupplementMessage = `Kính gửi sinh viên ${payload.studentInfo?.fullName || ''}, qua đối chiếu mục "${declaredSummary}" (${payload.criterionName}), hệ thống ghi nhận: ${mismatchNote} Đề nghị bạn kiểm tra và bổ sung minh chứng xác nhận đầy đủ theo quy định.`;
  } else if (hasPartialOrUnclear) {
    suggestedVerdict = 'CONSIDERATION_NEEDED';
    preliminaryStatus = 'insufficient_evidence';
    preliminaryBadgeLabel = 'Cần kiểm tra thêm';
    const unclearNote =
      ocrExtractions.find((e) => e.discrepancyNote)?.discrepancyNote ||
      'Tệp minh chứng cần cán bộ kiểm tra trực tiếp dấu xác nhận hoặc tính tương đương.';
    headlineSummary = unclearNote;
    flaggedRisks.push(unclearNote);
    draftSupplementMessage = `Kính gửi sinh viên ${payload.studentInfo?.fullName || ''}, tệp minh chứng tại mục "${declaredSummary}" chưa hiển thị rõ dấu xác nhận hoặc thông tin ngày cấp. Đề nghị bạn tải lại bản chụp/scan rõ nét hơn.`;
  }

  const complianceChecks: ScopeEvaluationResult['complianceChecks'] = [
    {
      item: 'Đối chiếu nội dung kê khai và tệp minh chứng',
      passed: preliminaryStatus === 'preliminary_meets' ? true : preliminaryStatus === 'preliminary_not_meets' ? false : 'warning',
      detail: headlineSummary,
    },
    {
      item: 'Ngưỡng tiêu chuẩn quy chế năm học 2025–2026',
      passed: !thresholdCheck.isHardFail,
      detail: thresholdCheck.isHardFail
        ? thresholdCheck.reason || 'Chưa đạt ngưỡng bắt buộc.'
        : `Đáp ứng quy chuẩn ${payload.criterionName} theo Hướng dẫn số 14-HD/BTK-HSVTP.`,
    },
    {
      item: 'Thẩm quyền ban hành và dấu xác nhận',
      passed: ocrExtractions.every((e) => e.hasRedStampOrSignature === 'verified') ? true : 'warning',
      detail: ocrExtractions
        .map(
          (e) =>
            `${e.fileName}: ${e.issuingAuthority} (${
              e.hasRedStampOrSignature === 'verified'
                ? 'Có dấu/xác nhận hợp lệ'
                : 'Cần kiểm tra dấu xác nhận'
            })`
        )
        .join('; '),
    },
  ];

  const evidenceAssessment: ScopeEvaluationResult['evidenceAssessment'] = ocrExtractions.map(
    (e) => ({
      fileName: e.fileName,
      validityStatus:
        e.matchWithDeclaration === 'mismatch'
          ? 'supplement_needed'
          : e.hasRedStampOrSignature !== 'verified' || !e.isReadable
          ? 'suspicious'
          : 'valid',
      observation: `${e.documentType} · Đọc được: "${e.extractedValue}" · Đơn vị cấp: ${e.issuingAuthority}${
        e.discrepancyNote ? ` (${e.discrepancyNote})` : ''
      }`,
    })
  );

  return {
    suggestedVerdict,
    preliminaryStatus,
    preliminaryBadgeLabel,
    confidenceScore: preliminaryStatus === 'preliminary_meets' ? 95 : 88,
    headlineSummary,
    detailedAnalysis: `Kê khai: "${declaredSummary}". Đọc từ ${ocrExtractions.length} minh chứng: "${extractedSummary}". ${headlineSummary}`,
    declaredSummary,
    extractedSummary,
    ocrExtractions,
    complianceChecks,
    evidenceAssessment,
    flaggedRisks,
    draftInternalNote: `[Đánh giá sơ bộ: ${preliminaryBadgeLabel}] ${headlineSummary} (Trích xuất: ${extractedSummary}).`,
    draftSupplementMessage,
    regulationCitation: `Hướng dẫn số 14-HD/BTK-HSVTP · Tiêu chí 0${payload.criterionNumber} (${payload.criterionName})`,
    aiSource: usedOpenAi ? 'openai' : 'rule_engine',
  };
}

export async function evaluateFullApplicationWithOcr(
  payload: FullApplicationEvalRequest,
  options?: OpenAiRuntimeOptions
): Promise<FullApplicationEvalResponse> {
  if (!payload.forceRefresh && applicationEvalCache.has(payload.applicationId)) {
    return applicationEvalCache.get(payload.applicationId)!;
  }

  let passedCriteriaCount = 0;
  let verifyNeededCriteriaCount = 0;
  let failedCriteriaCount = 0;
  let usedOpenAi = false;

  const criteriaResults: FullApplicationEvalResponse['criteriaResults'] = {};

  for (const crit of payload.criteria) {
    const declarationsMap: Record<string, ScopeEvaluationResult> = {};
    const declResults: ScopeEvaluationResult[] = [];

    for (const decl of crit.declarations) {
      const res = await evaluateScopeWithOpenAiAndRules(
        {
          criterionId: crit.criterionId,
          criterionName: crit.criterionName,
          criterionNumber: crit.criterionNumber,
          requirementId: decl.requirementId,
          requirementTitle: decl.requirementTitle,
          declarationId: decl.declarationId,
          declarationTitle: decl.declaredValue,
          declarationDetail: decl.declaredDetail,
          evidenceList: decl.evidenceList,
          studentInfo: payload.studentInfo,
          forceRefresh: payload.forceRefresh,
        },
        options
      );
      if (res.aiSource === 'openai') usedOpenAi = true;
      declarationsMap[decl.declarationId] = res;
      declResults.push(res);
    }

    let critStatus: PreliminaryStatusCode = 'preliminary_meets';
    let critBadgeLabel: 'Đạt sơ bộ' | 'Cần kiểm tra thêm' | 'Chưa đạt' = 'Đạt sơ bộ';
    let critHeadline = `Tiêu chí 0${crit.criterionNumber} (${crit.criterionName}): Các mục kê khai và minh chứng khớp quy chế.`;

    if (declResults.length === 0) {
      critStatus = 'insufficient_evidence';
      critBadgeLabel = 'Cần kiểm tra thêm';
      critHeadline = `Tiêu chí 0${crit.criterionNumber} (${crit.criterionName}): Chưa có mục kê khai hoặc minh chứng.`;
      verifyNeededCriteriaCount++;
    } else if (declResults.some((d) => d.preliminaryStatus === 'preliminary_not_meets')) {
      critStatus = 'preliminary_not_meets';
      critBadgeLabel = 'Chưa đạt';
      const firstFail = declResults.find((d) => d.preliminaryStatus === 'preliminary_not_meets');
      critHeadline = firstFail?.headlineSummary || 'Có điều kiện bắt buộc chưa đạt ngưỡng.';
      failedCriteriaCount++;
    } else if (declResults.some((d) => d.preliminaryStatus === 'insufficient_evidence')) {
      critStatus = 'insufficient_evidence';
      critBadgeLabel = 'Cần kiểm tra thêm';
      const firstVerify = declResults.find((d) => d.preliminaryStatus === 'insufficient_evidence');
      critHeadline = firstVerify?.headlineSummary || 'Có minh chứng cần kiểm tra thêm hoặc bổ sung.';
      verifyNeededCriteriaCount++;
    } else {
      passedCriteriaCount++;
    }

    criteriaResults[crit.criterionId] = {
      criterionId: crit.criterionId,
      criterionName: crit.criterionName,
      criterionNumber: crit.criterionNumber,
      status: critStatus,
      badgeLabel: critBadgeLabel,
      headline: critHeadline,
      declarations: declarationsMap,
    };
  }

  let overallVerdict: PreliminaryStatusCode = 'preliminary_meets';
  let overallBadgeLabel: FullApplicationEvalResponse['overallBadgeLabel'] = 'Đạt sơ bộ 5/5 tiêu chí';
  let headlineSummary = 'Toàn bộ 05 tiêu chí đều có minh chứng khớp kê khai và đạt ngưỡng sơ bộ.';

  if (failedCriteriaCount > 0) {
    overallVerdict = 'preliminary_not_meets';
    overallBadgeLabel = 'Chưa đạt (Sơ bộ)';
    headlineSummary = `Phát hiện ${failedCriteriaCount} tiêu chí chưa đạt ngưỡng quy chuẩn bắt buộc.`;
  } else if (verifyNeededCriteriaCount > 0 || passedCriteriaCount < 5) {
    overallVerdict = 'insufficient_evidence';
    overallBadgeLabel = 'Cần kiểm tra thêm';
    headlineSummary = `Đã đạt sơ bộ ${passedCriteriaCount}/5 tiêu chí · Có ${verifyNeededCriteriaCount} tiêu chí cần cán bộ kiểm tra thêm.`;
  }

  const response: FullApplicationEvalResponse = {
    applicationId: payload.applicationId,
    overallVerdict,
    overallBadgeLabel,
    headlineSummary,
    passedCriteriaCount,
    verifyNeededCriteriaCount,
    failedCriteriaCount,
    criteriaResults,
    evaluatedAt: new Date().toISOString(),
    aiSource: usedOpenAi ? 'openai' : 'rule_engine',
  };

  applicationEvalCache.set(payload.applicationId, response);
  return response;
}

export async function askOpenAiWithRegulations(
  question: string,
  context?: Record<string, string | undefined>,
  options?: OpenAiRuntimeOptions
): Promise<{ answer: string; model: string }> {
  let apiKey = options?.apiKey;
  let model = options?.model || 'gpt-4o-mini';
  let baseUrl = options?.baseUrl || 'https://api.openai.com/v1';

  if (apiKey === undefined) {
    try {
      const env = getEnvironment();
      apiKey = env.OPENAI_API_KEY;
      model = env.OPENAI_MODEL || 'gpt-4o-mini';
      baseUrl = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    } catch {
      // ignore
    }
  }

  const fetchFn = options?.fetchImpl || globalThis.fetch;

  if (apiKey && fetchFn) {
    try {
      const response = await fetchFn(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'Bạn là Cố vấn Quy chế xét chọn danh hiệu "Sinh viên 5 tốt" cấp Thành phố Đà Nẵng năm học 2025–2026 (Hướng dẫn số 14-HD/BTK-HSVTP). Trả lời ngắn gọn, chính xác, ngôn ngữ hành chính dễ hiểu cho cán bộ xét duyệt.\n' +
                'Các ngưỡng chuẩn:\n' +
                '1. Đạo đức tốt: ĐRL >= 80/100, không vi phạm kỷ luật + 1 điều kiện tự chọn.\n' +
                '2. Học tập tốt: GPA >= 3.2/4.0 (8.0/10) đối với ĐH, >= 3.0/4.0 (7.5/10) đối với CĐ + 1 hoạt động NCKH/thi học thuật.\n' +
                '3. Thể lực tốt: Danh hiệu Thanh niên khỏe hoặc giải thể thao từ cấp Trường.\n' +
                '4. Tình nguyện tốt: >= 05 ngày tình nguyện/năm (hiến máu tính 1 ngày/lần) hoặc giấy khen tình nguyện từ cấp Khoa/Trường.\n' +
                '5. Hội nhập tốt: Đạt cả Nhóm A (Kỹ năng/Đoàn-Hội/Giao lưu quốc tế) và Nhóm B (Ngoại ngữ B1 / IELTS >= 4.5 / TOEIC >= 405 / GPA ngoại ngữ >= 3.0/4.0).',
            },
            {
              role: 'user',
              content: `Ngữ cảnh hồ sơ: ${JSON.stringify(context || {})}\nCâu hỏi của cán bộ: ${question}`,
            },
          ],
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        const answer = data?.choices?.[0]?.message?.content?.trim();
        if (answer) {
          return { answer, model };
        }
      }
    } catch {
      // Fall through to deterministic answer
    }
  }

  const q = question.toLowerCase();
  if (q.includes('ielts') || q.includes('chứng chỉ') || q.includes('ngoại ngữ') || q.includes('thời hạn')) {
    return {
      answer:
        'Theo Hướng dẫn số 14-HD/BTK-HSVTP xét chọn Sinh viên 5 tốt cấp Thành phố Đà Nẵng năm học 2025–2026:\n- Chuẩn năng lực ngoại ngữ: Chứng chỉ tiếng Anh B1 trở lên, IELTS >= 4.5, TOEIC >= 405, TOEFL iBT >= 53, hoặc điểm trung bình các học phần ngoại ngữ tích lũy đạt từ 3.0/4.0 (7.5/10) trở lên.\n- Đối với sinh viên chuyên ngành ngoại ngữ: Áp dụng đối với Ngoại ngữ thứ hai.',
      model: 'rule_engine',
    };
  }
  if (q.includes('nckh') || q.includes('học tập') || q.includes('gpa')) {
    return {
      answer:
        'Đối với Tiêu chuẩn Học tập tốt (Hướng dẫn số 14-HD/BTK-HSVTP):\n- Điểm trung bình học tập cả năm học đạt từ 3.2/4.0 (8.0/10) đối với sinh viên Đại học/Học viện; hoặc từ 3.0/4.0 (7.5/10) đối với sinh viên Cao đẳng.\n- Đạt thêm ít nhất 01 trong 06 tiêu chí NCKH hoặc thi học thuật cấp Khoa/Trường trở lên.',
      model: 'rule_engine',
    };
  }
  if (q.includes('tình nguyện') || q.includes('hiến máu')) {
    return {
      answer:
        'Đối với Tiêu chuẩn Tình nguyện tốt (Hướng dẫn số 14-HD/BTK-HSVTP):\n- Đạt ít nhất 01 trong 02 tiêu chuẩn: (1) Tham gia ít nhất 05 ngày tình nguyện/năm cộng dồn; hoặc (2) Được khen thưởng hoạt động tình nguyện từ cấp Khoa trở lên.\n- Hiến máu tình nguyện trong năm học xét chọn được tính cộng dồn 01 ngày tình nguyện/lần.',
      model: 'rule_engine',
    };
  }
  return {
    answer: `Theo Hướng dẫn số 14-HD/BTK-HSVTP của Hội Sinh viên Việt Nam TP. Đà Nẵng: Mọi nội dung kê khai cần đối chiếu chính xác với văn bản minh chứng có thẩm quyền ban hành, ngày ký và con dấu xác nhận. Với câu hỏi "${question}", cán bộ vui lòng kiểm tra thời điểm diễn ra hoạt động trong năm học 2025–2026.`,
    model: 'rule_engine',
  };
}
