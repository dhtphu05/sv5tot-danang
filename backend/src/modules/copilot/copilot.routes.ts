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

import { Router, type Request, type Response } from 'express';
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
              'Bạn là Thư ký Hội đồng Xét chọn danh hiệu "Sinh viên 5 tốt" cấp Thành phố Đà Nẵng năm học 2025–2026. ' +
              'Hãy tổng hợp nhận định tờ trình dựa trên dữ liệu thực tế của hồ sơ và kết quả OCR. ' +
              'QUY TẮC BẮT BUỘC: Không bao giờ kết luận "CHƯA ĐẠT CHUẨN" hay "Không đạt". Nếu bất kỳ tiêu chí nào chưa rõ hoặc thiếu minh chứng, hãy đặt committeeReadiness = "CHỜ BỔ SUNG" và ghi rõ "Thiếu dữ liệu" cần kiểm tra thêm.',
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
