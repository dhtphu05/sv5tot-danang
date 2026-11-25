/**
 * 5TOT Đà Nẵng — Contextual AI Review Copilot & OpenAI OCR Express Routes (Backend V2)
 * Cơ quan chỉ đạo: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Provides OpenAI Vision/Document OCR and Preliminary Criteria Evaluation grounded in 2025–2026 5TOT regulations:
 * 1. POST /api/v2/copilot/ocr-evidence
 * 2. POST /api/v2/copilot/evaluate-application
 * 3. POST /api/v2/copilot/analyze-scope
 * 4. POST /api/v2/copilot/ask
 * 5. POST /api/v2/copilot/dossier-summary
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { resolveSessionActor } from '../domainPortal/domainPortal.state';
import {
  extractEvidenceWithOpenAI,
  getAllCachedOcrExtractions,
  resolveLiveOpenAiConfig,
  type OcrExtractionRequest,
  type OcrEvidenceExtraction,
} from './openaiOcr.service';
import {
  evaluateScopeWithOpenAiAndRules,
  evaluateFullApplicationWithOcr,
  askOpenAiWithRegulations,
  type ScopeEvaluationPayload,
  type ScopeEvaluationResult,
  type FullApplicationEvalRequest,
} from './criteriaEvaluation.service';

export type CopilotScopeAnalysisPayload = ScopeEvaluationPayload;
export type CopilotScopeAnalysisResult = ScopeEvaluationResult;
export type { OcrExtractionRequest, OcrEvidenceExtraction };

async function generateLiveDossierSummary(
  appData: Record<string, any> | undefined,
  criteriaProgress: any
) {
  const studentName = appData?.studentName || appData?.fullName || 'sinh viên';
  const liveConfig = resolveLiveOpenAiConfig();
  const ocrExtractions = getAllCachedOcrExtractions();

  if (liveConfig.apiKey && typeof globalThis.fetch === 'function') {
    try {
      const isReasoning = /^(gpt-5|o1|o3|o4)/i.test(liveConfig.model);
      const reqBody: Record<string, unknown> = {
        model: liveConfig.model,
        messages: [
          {
            role: 'system',
            content:
              'Bạn là Thư ký Hội đồng Xét chọn danh hiệu "Sinh viên 5 tốt" cấp Thành phố Đà Nẵng năm học 2025–2026 (Hướng dẫn số 14-HD/BTK-HSVTP).\n' +
              'Hãy tổng hợp nhận định tờ trình dựa trên dữ liệu thực tế của hồ sơ, kết quả OCR từng tệp minh chứng VÀ cấu trúc điều kiện bắt buộc để Đạt từng tiêu chí:\n' +
              '1. Đạo đức tốt: Phải đạt ĐỒNG THỜI (a) Điểm rèn luyện cả năm >= 80/100 (hoặc loại Giỏi), (b) Không vi phạm pháp luật/quy chế, VÀ (c) Đạt ít nhất 01/04 tiêu chuẩn bổ sung (Đảng viên / Đội thi Mác–Lênin / Tham luận Mác–Lênin / Gương người tốt việc tốt).\n' +
              '2. Học tập tốt: Phải đạt ĐỒNG THỜI (a) GPA cả năm >= 3.2/4.0 (ĐH) hoặc >= 3.0/4.0 (CĐ), VÀ (b) Đạt ít nhất 01/06 thành tích học thuật/NCKH (Đề tài NCKH đạt giải / Bài báo tạp chí / Tham luận hội thảo / Sản phẩm sáng tạo / Đội tuyển học thuật / Giải thưởng sáng tạo).\n' +
              '3. Thể lực tốt: Đạt ít nhất 01/02 hình thức (Danh hiệu Thanh niên khỏe cấp Trường+ HOẶC Đạt giải thể thao phong trào cấp Khoa+).\n' +
              '4. Tình nguyện tốt: Đạt ít nhất 01/02 hình thức (Tích lũy cộng dồn >= 05 ngày tình nguyện/năm, hiến máu tính 01 ngày/lần HOẶC Khen thưởng tình nguyện cấp Khoa+).\n' +
              '5. Hội nhập tốt: Phải đạt ĐỒNG THỜI cả Nhóm A (ít nhất 01/02: Khóa kỹ năng thực hành xã hội HOẶC Khen thưởng Đoàn-Hội cấp Khoa+) VÀ Nhóm B (ít nhất 01/03: Chuẩn ngoại ngữ B1/IELTS >= 4.5/TOEIC >= 405/ĐTB ngoại ngữ >= 3.0 HOẶC Giao lưu quốc tế HOẶC Giải Ba+ cuộc thi ngoại ngữ/kiến thức).\n' +
              'QUY TẮC BẮT BUỘC: Không chỉ nhìn từng minh chứng lẻ mà phải chỉ rõ tiêu chí đã đủ các nhóm điều kiện bắt buộc + tự chọn hay còn thiếu nhóm điều kiện nào. Không bao giờ kết luận "CHƯA ĐẠT CHUẨN" hay "Không đạt" — nếu thiếu nhóm điều kiện hoặc minh chứng cần kiểm tra, hãy đặt committeeReadiness = "CHỜ BỔ SUNG", status = "Cần lưu ý" và nêu rõ điều kiện còn thiếu.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              studentName,
              applicationData: appData,
              criteriaProgress,
              ocrExtractions,
            }),
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'sv5t_dossier_summary',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                candidateRating: {
                  type: 'string',
                  enum: ['XUẤT SẮC', 'TIÊU BIỂU', 'ĐẠT CHUẨN', 'CẦN HỘI CHẨN'],
                },
                committeeReadiness: {
                  type: 'string',
                  enum: ['ĐỦ ĐIỀU KIỆN BIỂU QUYẾT', 'CHỜ BỔ SUNG'],
                },
                overallVerdict: { type: 'string' },
                criteriaReadinessMatrix: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      criterionName: { type: 'string' },
                      status: { type: 'string', enum: ['Đạt', 'Cần lưu ý'] },
                      highlight: { type: 'string' },
                    },
                    required: ['criterionName', 'status', 'highlight'],
                    additionalProperties: false,
                  },
                },
                exceptionalAchievements: {
                  type: 'array',
                  items: { type: 'string' },
                },
                potentialCaveats: {
                  type: 'array',
                  items: { type: 'string' },
                },
                recommendedCommitteeVote: { type: 'string' },
                executiveMemo: { type: 'string' },
              },
              required: [
                'candidateRating',
                'committeeReadiness',
                'overallVerdict',
                'criteriaReadinessMatrix',
                'exceptionalAchievements',
                'potentialCaveats',
                'recommendedCommitteeVote',
                'executiveMemo',
              ],
              additionalProperties: false,
            },
          },
        },
      };
      if (isReasoning) {
        reqBody.reasoning_effort = 'low';
      } else {
        reqBody.temperature = 0.2;
      }

      const res = await fetch(`${liveConfig.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${liveConfig.apiKey}`,
        },
        body: JSON.stringify(reqBody),
      });
      if (res.ok) {
        const data: any = await res.json();
        const raw = data?.choices?.[0]?.message?.content;
        if (raw) {
          return JSON.parse(raw);
        }
      }
    } catch {
      // fall through to conservative insufficient-data summary
    }
  }

  return {
    candidateRating: 'CẦN HỘI CHẨN',
    committeeReadiness: 'CHỜ BỔ SUNG',
    overallVerdict:
      'Thiếu dữ liệu: Hệ thống cần thêm dữ liệu bóc tách từ tệp minh chứng của 5 tiêu chí trước khi tổng hợp tờ trình.',
    criteriaReadinessMatrix: [
      { criterionName: 'Đạo đức tốt', status: 'Cần lưu ý', highlight: 'Cần đối chiếu trực tiếp tệp minh chứng điểm rèn luyện' },
      { criterionName: 'Học tập tốt', status: 'Cần lưu ý', highlight: 'Cần đối chiếu trực tiếp bảng điểm năm học và NCKH' },
      { criterionName: 'Thể lực tốt', status: 'Cần lưu ý', highlight: 'Cần đối chiếu trực tiếp giấy chứng nhận thể lực' },
      { criterionName: 'Tình nguyện tốt', status: 'Cần lưu ý', highlight: 'Cần đối chiếu trực tiếp số ngày hoạt động tình nguyện' },
      { criterionName: 'Hội nhập tốt', status: 'Cần lưu ý', highlight: 'Cần đối chiếu trực tiếp chứng chỉ ngoại ngữ và kỹ năng' },
    ],
    exceptionalAchievements: [],
    potentialCaveats: ['Thiếu dữ liệu trích xuất tự động từ một số tệp minh chứng.'],
    recommendedCommitteeVote: 'Đề nghị cán bộ kiểm tra trực tiếp các tệp minh chứng đang báo Thiếu dữ liệu.',
    executiveMemo: `Hồ sơ của ứng viên ${studentName} hiện đang ở trạng thái Thiếu dữ liệu trích xuất tự động. Đề nghị cán bộ rà soát trực tiếp tệp minh chứng đính kèm.`,
  };
}

export function createCopilotRouter(): Router {
  const router = Router();

  // Enforce City-level role isolation: Unit-level officers (SCHOOL_OFFICER) are strictly blocked from AI features
  router.use((req: Request, res: Response, next: NextFunction): void => {
    const actor = resolveSessionActor(req);
    if (actor.role === 'SCHOOL_OFFICER') {
      res.status(403).json({
        success: false,
        errorCode: 'FORBIDDEN_ROLE',
        code: 'FORBIDDEN_ROLE',
        error: 'Tính năng AI chỉ hỗ trợ cho cán bộ cấp Thành phố. Cán bộ cấp đơn vị không có quyền sử dụng.',
      });
      return;
    }
    next();
  });

  router.get('/ocr-cache', (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      extractions: getAllCachedOcrExtractions(),
    });
  });

  router.post('/ocr-evidence', async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = (req.body || {}) as OcrExtractionRequest;
      if (!payload.evidenceId || !payload.fileName) {
        res.status(400).json({
          success: false,
          error: 'Thiếu mã minh chứng hoặc tên tệp để đọc nội dung.',
        });
        return;
      }

      const extraction = await extractEvidenceWithOpenAI(payload);
      res.status(200).json(extraction);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Không thể đọc nội dung tệp minh chứng lúc này.',
      });
    }
  });

  router.post('/evaluate-application', async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = (req.body || {}) as FullApplicationEvalRequest;
      if (!payload.applicationId || !Array.isArray(payload.criteria)) {
        res.status(400).json({
          success: false,
          error: 'Thiếu mã hồ sơ hoặc danh sách tiêu chí để đánh giá sơ bộ.',
        });
        return;
      }

      const evaluation = await evaluateFullApplicationWithOcr(payload);
      res.status(200).json(evaluation);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Không thể đánh giá sơ bộ hồ sơ lúc này.',
      });
    }
  });

  router.post('/analyze-scope', async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = (req.body || {}) as CopilotScopeAnalysisPayload;
      if (!payload.criterionId || !payload.requirementTitle) {
        res.status(400).json({
          success: false,
          error: 'Thiếu dữ liệu tiêu chuẩn hoặc yêu cầu để phân tích.',
        });
        return;
      }

      const result = await evaluateScopeWithOpenAiAndRules(payload);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Không thể phân tích mục kê khai lúc này.',
      });
    }
  });

  router.post('/ask', async (req: Request, res: Response): Promise<void> => {
    try {
      const { question, context } = (req.body || {}) as {
        question?: string;
        context?: Record<string, string | undefined>;
      };
      if (!question || typeof question !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Câu hỏi không được để trống.',
        });
        return;
      }

      const result = await askOpenAiWithRegulations(question, context);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Không thể xử lý câu hỏi lúc này.',
      });
    }
  });

  router.post('/dossier-summary', async (req: Request, res: Response): Promise<void> => {
    try {
      const { applicationData, criteriaProgress } = (req.body || {}) as {
        applicationData?: Record<string, any>;
        criteriaProgress?: any;
      };
      const summary = await generateLiveDossierSummary(applicationData, criteriaProgress);
      res.status(200).json(summary);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err?.message || 'Không thể tổng hợp hồ sơ lúc này.',
      });
    }
  });

  return router;
}
