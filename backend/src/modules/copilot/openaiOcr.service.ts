/**
 * 5TOT Đà Nẵng — OpenAI Vision & Document OCR Service (Backend V2)
 * Cơ quan chỉ đạo: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Extracts structured facts from student evidence files (images & PDFs)
 * using OpenAI (gpt-4o-mini / gpt-4o) Structured Outputs (json_schema),
 * with deterministic fallback when OPENAI_API_KEY is not configured.
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { getEnvironment, normalizeOpenAiKey, resetEnvironmentCache } from '../../config/environment';
import { portalState } from '../domainPortal/domainPortal.state';
import { hydrateEvidenceRecordFromNeonDb } from '../domainPortal/domainPortal.dbSync';
import { r2StorageClient } from '../../shared/storage/r2StorageClient';

export function resolveLiveOpenAiConfig(): {
  apiKey: string;
  model: string;
  baseUrl: string;
} {
  let apiKey = '';
  let model = 'gpt-5';
  let baseUrl = 'https://api.openai.com/v1';

  try {
    const env = getEnvironment();
    apiKey = env.OPENAI_API_KEY || '';
    model = env.OPENAI_MODEL || 'gpt-5';
    baseUrl = env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  } catch {
    // ignore
  }

  const candidateFiles = [
    path.resolve(process.cwd(), 'backend/.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env'),
  ];
  for (const envPath of candidateFiles) {
    try {
      if (fs.existsSync(envPath)) {
        const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
        const candidateKey = normalizeOpenAiKey(parsed.OPENAI_API_KEY);
        if (candidateKey) {
          apiKey = candidateKey;
          process.env.OPENAI_API_KEY = candidateKey;
          if (parsed.OPENAI_MODEL?.trim()) {
            model = parsed.OPENAI_MODEL.trim();
            process.env.OPENAI_MODEL = model;
          }
          if (parsed.OPENAI_BASE_URL?.trim()) {
            baseUrl = parsed.OPENAI_BASE_URL.trim().replace(/\/+$/, '');
            process.env.OPENAI_BASE_URL = baseUrl;
          }
          resetEnvironmentCache();
          break;
        }
      }
    } catch {
      // ignore file read error
    }
  }

  return { apiKey, model, baseUrl };
}

export interface OcrExtractionRequest {
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
  requirementId?: string;
  requirementTitle?: string;
  declaredValue?: string;
  declaredDetail?: string;
  forceRefresh?: boolean;
}

export interface OcrEvidenceExtraction {
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

export interface OpenAiRuntimeOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

const ocrCache = new Map<string, OcrEvidenceExtraction>();
const ocrCacheByEvidenceId = new Map<string, OcrEvidenceExtraction>();

const OCR_DISK_CACHE_PATH = path.resolve(process.cwd(), '.data/ocr_extractions_cache.json');

function loadOcrDiskCache(): void {
  try {
    if (fs.existsSync(OCR_DISK_CACHE_PATH)) {
      const raw = fs.readFileSync(OCR_DISK_CACHE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as Record<string, OcrEvidenceExtraction>;
      if (parsed && typeof parsed === 'object') {
        for (const [evId, ext] of Object.entries(parsed)) {
          if (ext && ext.evidenceId) {
            ocrCacheByEvidenceId.set(evId, ext);
          }
        }
      }
    }
  } catch {
    // ignore disk cache read errors
  }
}

function saveOcrDiskCache(): void {
  try {
    const dir = path.dirname(OCR_DISK_CACHE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const obj: Record<string, OcrEvidenceExtraction> = {};
    for (const [evId, ext] of ocrCacheByEvidenceId.entries()) {
      obj[evId] = ext;
    }
    fs.writeFileSync(OCR_DISK_CACHE_PATH, JSON.stringify(obj, null, 2), 'utf8');
  } catch {
    // ignore disk cache write errors
  }
}

loadOcrDiskCache();

export function clearOcrCache(): void {
  ocrCache.clear();
  ocrCacheByEvidenceId.clear();
}

export function getCachedOcrExtraction(cacheKey: string): OcrEvidenceExtraction | undefined {
  return ocrCache.get(cacheKey);
}

export function getOcrExtractionByEvidenceId(evidenceId: string): OcrEvidenceExtraction | undefined {
  return ocrCacheByEvidenceId.get(evidenceId);
}

export function getAllCachedOcrExtractions(): Record<string, OcrEvidenceExtraction> {
  const result: Record<string, OcrEvidenceExtraction> = {};
  for (const [evId, ext] of ocrCacheByEvidenceId.entries()) {
    result[evId] = ext;
  }
  return result;
}

export function buildOcrCacheKey(req: OcrExtractionRequest): string {
  return `${req.evidenceId}::${req.fileName}::${req.declaredValue || ''}`;
}

function parseNumericFromText(text: string): number | undefined {
  if (!text) return undefined;
  const gpaMatch = text.match(/(\d+[.,]\d+)\s*\/\s*(4(?:\.0)?|10(?:\.0)?)/i);
  if (gpaMatch) {
    return parseFloat(gpaMatch[1].replace(',', '.'));
  }
  const dayMatch = text.match(/(\d+)\s*(?:ngày|buổi|lần|điểm)/i);
  if (dayMatch) {
    return parseFloat(dayMatch[1]);
  }
  const genericNum = text.match(/(\d+(?:[.,]\d+)?)/);
  if (genericNum) {
    return parseFloat(genericNum[1].replace(',', '.'));
  }
  return undefined;
}

function reconcileCachedExtractionWithDeclaration(
  cached: OcrEvidenceExtraction,
  declaredValue?: string
): OcrEvidenceExtraction {
  if (!declaredValue || !declaredValue.trim()) {
    return cached;
  }
  const declaredNum = parseNumericFromText(declaredValue);
  if (
    typeof declaredNum === 'number' &&
    typeof cached.numericMetric === 'number' &&
    Math.abs(declaredNum - cached.numericMetric) >= 0.5 &&
    !declaredValue.includes('2025') &&
    !declaredValue.includes('2026')
  ) {
    return {
      ...cached,
      matchWithDeclaration: 'mismatch',
      discrepancyNote:
        cached.discrepancyNote ||
        `Nội dung tên kê khai ghi nhận "${declaredValue}", nhưng số liệu đọc từ tệp minh chứng là "${cached.extractedValue}".`,
    };
  }
  return cached;
}

export function buildDeterministicOcrExtraction(
  req: OcrExtractionRequest,
  reason?: string
): OcrEvidenceExtraction {
  return {
    evidenceId: req.evidenceId,
    fileName: req.fileName,
    isReadable: false,
    documentType: 'Tệp minh chứng đính kèm',
    extractedStudentName: req.studentFullName || undefined,
    extractedStudentCode: req.studentCode || undefined,
    extractedValue: 'Thiếu dữ liệu (chưa trích xuất được nội dung chi tiết từ tệp)',
    numericMetric: undefined,
    issuingAuthority: 'Cần kiểm tra trực tiếp trên tệp minh chứng',
    issueDate: 'Cần kiểm tra trực tiếp',
    hasRedStampOrSignature: 'unclear',
    matchWithDeclaration: 'partial',
    discrepancyNote:
      reason ||
      'Thiếu dữ liệu: Hệ thống chưa đọc được nội dung chi tiết từ tệp minh chứng. Đề nghị cán bộ mở tệp để kiểm tra trực tiếp hoặc yêu cầu sinh viên tải lại bản rõ nét.',
    extractedAt: new Date().toISOString(),
    aiSource: 'rule_engine',
    modelUsed: 'none',
  };
}

const OCR_JSON_SCHEMA = {
  name: 'sv5t_evidence_ocr',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      isReadable: {
        type: 'boolean',
        description: 'Tài liệu có đọc được nội dung chữ rõ ràng hay không',
      },
      documentType: {
        type: 'string',
        description: 'Loại giấy tờ đọc được từ tệp (VD: Bảng điểm học tập năm học, Giấy chứng nhận tình nguyện, Chứng chỉ ngoại ngữ, Quyết định khen thưởng)',
      },
      extractedStudentName: {
        type: 'string',
        description: 'Họ và tên sinh viên đọc được trên minh chứng (nếu có)',
      },
      extractedStudentCode: {
        type: 'string',
        description: 'Mã số sinh viên đọc được trên minh chứng (nếu có)',
      },
      extractedValue: {
        type: 'string',
        description: 'Tóm tắt đầy đủ kết quả/thành tích/số liệu đọc được trực tiếp từ minh chứng (VD: GPA cả năm 3.52/4.0 - ĐRL 88/100, Tham gia 05 ngày Chiến dịch Mùa hè xanh, IELTS 6.5)',
      },
      numericMetric: {
        type: ['number', 'null'],
        description: 'Giá trị số học quan trọng trích xuất được từ minh chứng (VD: điểm GPA 3.52, điểm rèn luyện 88, số ngày tình nguyện 5, điểm IELTS 6.5)',
      },
      issuingAuthority: {
        type: 'string',
        description: 'Cơ quan / Đơn vị cấp văn bản minh chứng đọc được trên dấu đỏ hoặc tiêu đề văn bản',
      },
      issueDate: {
        type: 'string',
        description: 'Ngày tháng năm ban hành hoặc năm học ghi trên minh chứng',
      },
      hasRedStampOrSignature: {
        type: 'string',
        enum: ['verified', 'missing', 'unclear'],
        description: 'Tình trạng con dấu đỏ hoặc chữ ký xác nhận có thẩm quyền trên tệp minh chứng',
      },
      matchWithDeclaration: {
        type: 'string',
        enum: ['matched', 'mismatch', 'partial'],
        description: 'Đánh giá tính hợp lệ của minh chứng: matched khi đủ dữ liệu đạt chuẩn; partial hoặc mismatch khi thiếu dữ liệu hoặc số liệu cần kiểm tra lại',
      },
      discrepancyNote: {
        type: ['string', 'null'],
        description: 'Giải thích ngắn gọn bằng tiếng Việt nếu thiếu dữ liệu, ảnh mờ, số liệu cần kiểm tra lại, hoặc thiếu dấu xác nhận',
      },
    },
    required: [
      'isReadable',
      'documentType',
      'extractedStudentName',
      'extractedStudentCode',
      'extractedValue',
      'numericMetric',
      'issuingAuthority',
      'issueDate',
      'hasRedStampOrSignature',
      'matchWithDeclaration',
      'discrepancyNote',
    ],
    additionalProperties: false,
  },
};

function tryLoadLocalEvidenceFileAsDataUrl(fileName?: string, fileUrl?: string): string {
  const candidates: string[] = [];
  const baseName = path.basename(fileName || fileUrl || '');
  if (baseName) {
    candidates.push(
      path.resolve(process.cwd(), 'public/minhchung_test', baseName),
      path.resolve(process.cwd(), '../public/minhchung_test', baseName)
    );
  }
  if (fileUrl && fileUrl.startsWith('/minhchung_test/')) {
    const decoded = decodeURIComponent(fileUrl.replace(/^\/minhchung_test\//, ''));
    candidates.push(
      path.resolve(process.cwd(), 'public/minhchung_test', decoded),
      path.resolve(process.cwd(), '../public/minhchung_test', decoded)
    );
  }

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        const stat = fs.statSync(candidate);
        if (stat.isFile() && stat.size > 0 && stat.size <= 15 * 1024 * 1024) {
          const buf = fs.readFileSync(candidate);
          const ext = path.extname(candidate).toLowerCase();
          const mime =
            ext === '.pdf'
              ? 'application/pdf'
              : ext === '.png'
              ? 'image/png'
              : ext === '.webp'
              ? 'image/webp'
              : 'image/jpeg';
          return `data:${mime};base64,${buf.toString('base64')}`;
        }
      }
    } catch {
      // ignore local file read error
    }
  }
  return '';
}

export async function extractEvidenceWithOpenAI(
  req: OcrExtractionRequest,
  options?: OpenAiRuntimeOptions
): Promise<OcrEvidenceExtraction> {
  const liveConfig = resolveLiveOpenAiConfig();
  const apiKey = options?.apiKey !== undefined ? normalizeOpenAiKey(options.apiKey) || '' : liveConfig.apiKey;
  const model = options?.model || liveConfig.model || 'gpt-5';
  const baseUrl = (options?.baseUrl || liveConfig.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const fetchFn = options?.fetchImpl || globalThis.fetch;

  const cacheKey = buildOcrCacheKey(req);
  if (!req.forceRefresh) {
    if (ocrCache.has(cacheKey)) {
      const cached = ocrCache.get(cacheKey)!;
      if (cached.aiSource === 'openai') {
        return cached;
      }
    }
    if (req.evidenceId && ocrCacheByEvidenceId.has(req.evidenceId)) {
      const byId = ocrCacheByEvidenceId.get(req.evidenceId)!;
      if (byId.aiSource === 'openai') {
        const reconciled = reconcileCachedExtractionWithDeclaration(byId, req.declaredValue);
        ocrCache.set(cacheKey, reconciled);
        return reconciled;
      }
    }
  }

  if (!apiKey || !fetchFn) {
    return buildDeterministicOcrExtraction(
      req,
      'Thiếu dữ liệu: Chưa cấu hình khóa kết nối OpenAI OCR nên chưa thể bóc tách tự động tệp minh chứng.'
    );
  }

  const systemPrompt = [
    'Bạn là hệ thống OCR bóc tách dữ liệu minh chứng phục vụ xét chọn danh hiệu "Sinh viên 5 tốt" cấp Thành phố Đà Nẵng năm học 2025–2026 (Hướng dẫn số 14-HD/BTK-HSVTP).',
    'Nhiệm vụ: Đọc trực tiếp nội dung tệp minh chứng (ảnh chụp/scan hoặc PDF) để bóc tách dữ liệu chi tiết giúp cán bộ xét duyệt.',
    'LƯU Ý VỀ BIỂU MẪU KÊ KHAI: Hiện tại sinh viên chỉ nhập "Tên kê khai" ngắn gọn và tải tệp minh chứng lên (không có các trường nhập liệu chi tiết riêng lẻ). Bạn phải tự đọc từ tệp minh chứng để lấy: loại giấy tờ (documentType), họ tên (extractedStudentName), MSSV (extractedStudentCode), kết quả/điểm số/thành tích cụ thể (extractedValue), con số định lượng (numericMetric), đơn vị cấp (issuingAuthority), ngày cấp/năm học (issueDate), và mộc dấu/chữ ký (hasRedStampOrSignature).',
    'QUY TẮC AN TOÀN TUYỆT ĐỐI (KHÔNG BAO GIỜ ĐÁNH RỚT / KHÔNG BỊA DỮ LIỆU):',
    '1. TUYỆT ĐỐI KHÔNG tự bịa ra điểm số, số ngày, hoặc tên cơ quan cấp nếu trên tệp minh chứng không hiển thị.',
    '2. KHÔNG BAO GIỜ kết luận sinh viên "Không đạt" hay "Chưa đạt". Để phòng ngừa rủi ro OCR đọc nhầm chữ số trên bản scan mờ hoặc thiếu trang, mọi trường hợp số liệu đọc được thấp hơn chuẩn (VD: GPA < 3.2, ĐRL < 80, tình nguyện < 5 ngày), lệch với tên kê khai, ảnh mờ, hoặc thiếu dấu xác nhận đều phải chuyển về trạng thái "Thiếu dữ liệu" (đặt matchWithDeclaration = "partial" hoặc "mismatch" và bắt đầu discrepancyNote bằng "Thiếu dữ liệu / Cần kiểm tra: ...").',
    '3. Chỉ đặt matchWithDeclaration = "matched" khi bạn đọc được rõ ràng nội dung tệp minh chứng và các thông tin trên tệp đầy đủ, hợp lệ theo tiêu chí.',
    'Ngôn ngữ trả về: Tiếng Việt hành chính, trung thực, rõ ràng.',
  ].join('\n');

  const userContextText = [
    `Thông tin sinh viên trên hồ sơ: ${req.studentFullName || 'Đang cập nhật'} (MSSV: ${req.studentCode || 'Đang cập nhật'}, Trường: ${req.schoolName || 'ĐH Đà Nẵng'})`,
    `Tiêu chí xét duyệt: ${req.criterionName || req.criterionId || 'Sinh viên 5 tốt'}`,
    `Yêu cầu tiêu chuẩn: ${req.requirementTitle || 'Theo quy chế Sinh viên 5 tốt'}`,
    `Tên kê khai của sinh viên: "${req.declaredValue || '(Đang tải tệp minh chứng - hãy tự bóc tách thông tin từ tệp)'}"`,
    `Tên tệp minh chứng: "${req.fileName}"`,
    req.studentNote ? `Ghi chú tệp: "${req.studentNote}"` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const userContentParts: Array<Record<string, unknown>> = [
    {
      type: 'text',
      text: userContextText,
    },
  ];

  let rawUrl = req.fileBase64 || req.fileUrl || '';
  if (
    req.evidenceId &&
    (!rawUrl || (!rawUrl.startsWith('data:') && !rawUrl.startsWith('https://') && !rawUrl.startsWith('http://')))
  ) {
    try {
      let record = portalState.evidenceIndex.get(req.evidenceId);
      if (!record || (!record.r2ObjectKey && !record.base64Content)) {
        const hydrated = await hydrateEvidenceRecordFromNeonDb(req.evidenceId);
        if (hydrated) {
          record = hydrated;
        }
      }
      if (record?.base64Content && record.base64Content.startsWith('data:')) {
        rawUrl = record.base64Content;
      } else if (record?.base64Content) {
        const ext = path.extname(record.name || req.fileName).toLowerCase();
        const mime = ext === '.pdf' ? 'application/pdf' : ext === '.png' ? 'image/png' : 'image/jpeg';
        rawUrl = `data:${mime};base64,${record.base64Content}`;
      } else if (record?.r2ObjectKey && r2StorageClient.isConfigured()) {
        const presigned = await r2StorageClient.createPresignedGetUrl({
          objectKey: record.r2ObjectKey,
          fileName: record.name || req.fileName,
          mimeType: req.mimeType || 'application/octet-stream',
        });
        if (presigned?.viewUrl) {
          rawUrl = presigned.viewUrl;
        }
      }
    } catch {
      // ignore evidence lookup error
    }
  }

  if (!rawUrl || (!rawUrl.startsWith('data:') && !rawUrl.startsWith('https://') && !rawUrl.startsWith('http://'))) {
    const localDataUrl = tryLoadLocalEvidenceFileAsDataUrl(req.fileName, req.fileUrl);
    if (localDataUrl) {
      rawUrl = localDataUrl;
    }
  }

  const isImage =
    /\.(jpg|jpeg|png|webp|gif)$/i.test(req.fileName) ||
    rawUrl.startsWith('data:image/') ||
    Boolean(req.mimeType && req.mimeType.startsWith('image/'));

  const isPdfExtOrMime =
    /\.pdf$/i.test(req.fileName) ||
    req.mimeType === 'application/pdf' ||
    rawUrl.startsWith('data:application/pdf');

  // If PDF is hosted via HTTP(S) (e.g. Cloudflare R2 presigned URL), fetch and convert to data:application/pdf;base64
  if (
    isPdfExtOrMime &&
    (rawUrl.startsWith('https://') || rawUrl.startsWith('http://')) &&
    !options?.fetchImpl
  ) {
    try {
      const pdfCtrl = new AbortController();
      const pdfTimer = setTimeout(() => pdfCtrl.abort(), 10000);
      const pdfRes = await fetch(rawUrl, { signal: pdfCtrl.signal });
      clearTimeout(pdfTimer);
      if (pdfRes.ok) {
        const buf = Buffer.from(await pdfRes.arrayBuffer());
        if (buf.byteLength > 0 && buf.byteLength <= 15 * 1024 * 1024) {
          rawUrl = `data:application/pdf;base64,${buf.toString('base64')}`;
        }
      }
    } catch {
      // fallback if remote PDF fetch fails
    }
  }

  const isPdfData =
    rawUrl.startsWith('data:application/pdf') ||
    (isPdfExtOrMime && rawUrl.startsWith('data:'));

  if (rawUrl && isImage && (rawUrl.startsWith('data:image/') || rawUrl.startsWith('https://') || rawUrl.startsWith('http://'))) {
    userContentParts.push({
      type: 'image_url',
      image_url: {
        url: rawUrl,
        detail: 'high',
      },
    });
  } else if (rawUrl && isPdfData) {
    userContentParts.push({
      type: 'file',
      file: {
        filename: req.fileName || 'evidence.pdf',
        file_data: rawUrl,
      },
    });
  }

  const isReasoningModel = /^(gpt-5|o1|o3|o4)/i.test(model);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const requestBody: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContentParts },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: OCR_JSON_SCHEMA,
      },
    };

    if (isReasoningModel) {
      requestBody.reasoning_effort = 'low';
    } else {
      requestBody.temperature = 0.1;
    }

    const response = await fetchFn(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAI HTTP ${response.status}`);
    }

    const data: any = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Empty OpenAI response content');
    }

    const parsed = JSON.parse(rawContent);
    const extraction: OcrEvidenceExtraction = {
      evidenceId: req.evidenceId,
      fileName: req.fileName,
      isReadable: Boolean(parsed.isReadable),
      documentType: parsed.documentType || 'Văn bản minh chứng',
      extractedStudentName: parsed.extractedStudentName || req.studentFullName,
      extractedStudentCode: parsed.extractedStudentCode || req.studentCode,
      extractedValue: parsed.extractedValue || 'Thiếu dữ liệu đọc từ tệp minh chứng',
      numericMetric: typeof parsed.numericMetric === 'number' ? parsed.numericMetric : undefined,
      issuingAuthority: parsed.issuingAuthority || 'Cần kiểm tra trên tệp minh chứng',
      issueDate: parsed.issueDate || 'Cần kiểm tra trên tệp minh chứng',
      hasRedStampOrSignature: parsed.hasRedStampOrSignature || 'unclear',
      matchWithDeclaration: parsed.isReadable ? (parsed.matchWithDeclaration || 'partial') : 'partial',
      discrepancyNote: parsed.discrepancyNote || undefined,
      extractedAt: new Date().toISOString(),
      aiSource: 'openai',
      modelUsed: model,
    };

    ocrCache.set(cacheKey, extraction);
    if (req.evidenceId) {
      ocrCacheByEvidenceId.set(req.evidenceId, extraction);
      if (!options?.fetchImpl) {
        saveOcrDiskCache();
      }
    }
    return extraction;
  } catch (err: any) {
    return buildDeterministicOcrExtraction(
      req,
      `Thiếu dữ liệu: Không thể trích xuất tự động tệp "${req.fileName}" (${err?.message || 'lỗi kết nối OCR'}). Cán bộ vui lòng kiểm tra trực tiếp tệp đính kèm.`
    );
  }
}
