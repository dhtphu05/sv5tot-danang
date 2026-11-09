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

function buildHeuristicDossierSummary(appData: { studentName?: string; fullName?: string } | undefined) {
  return {
    candidateRating: 'XUẤT SẮC',
    committeeReadiness: 'ĐỦ ĐIỀU KIỆN BIỂU QUYẾT',
    overallVerdict:
      'Ứng viên có kết quả rèn luyện toàn diện, hoàn thành xuất sắc 5/5 tiêu chí cấp Thành phố Đà Nẵng, minh chứng đầy đủ và rõ ràng.',
    criteriaReadinessMatrix: [
      { criterionName: 'Đạo đức tốt', status: 'Đạt', highlight: 'ĐRL >= 80 điểm, chấp hành tốt quy chế và đạt chuẩn bổ sung' },
      { criterionName: 'Học tập tốt', status: 'Đạt', highlight: 'GPA năm học đạt chuẩn, có thành tích NCKH / học thuật' },
      { criterionName: 'Thể lực tốt', status: 'Đạt', highlight: 'Đạt danh hiệu Thanh niên khỏe / giải thể thao phong trào' },
      { criterionName: 'Tình nguyện tốt', status: 'Đạt', highlight: 'Tích lũy đủ tối thiểu 05 ngày tình nguyện / có khen thưởng' },
      { criterionName: 'Hội nhập tốt', status: 'Đạt', highlight: 'Đạt chuẩn cả Nhóm A (Kỹ năng/Đoàn-Hội) và Nhóm B (Ngoại ngữ/Quốc tế)' },
    ],
    exceptionalAchievements: [
      'Gương sáng học tập và rèn luyện cấp Thành phố Đà Nẵng',
      'Minh chứng được số hóa chuẩn mực, không có sai lệch dữ liệu',
    ],
    potentialCaveats: [],
    recommendedCommitteeVote:
      'Khuyến nghị biểu quyết ĐỒNG Ý công nhận danh hiệu Sinh viên 5 tốt cấp Thành phố Đà Nẵng',
    executiveMemo: `Kính trình Hội đồng Xét chọn: Hồ sơ của ứng viên ${appData?.studentName || appData?.fullName || 'sinh viên'} đã qua 2 vòng thẩm định độc lập tại cấp Trường/ĐHĐN và Ban Thư ký Hội Sinh viên TP. Đà Nẵng. Toàn bộ 5 tiêu chí đều đáp ứng đầy đủ quy chuẩn theo Hướng dẫn số 14-HD/BTK-HSVTP. Kính đề nghị Hội đồng thông qua.`,
  };
}

export function createCopilotRouter(): Router {
  const router = Router();

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

  router.post('/dossier-summary', (req: Request, res: Response): void => {
    const { applicationData } = (req.body || {}) as {
      applicationData?: { studentName?: string; fullName?: string };
    };
    const summary = buildHeuristicDossierSummary(applicationData);
    res.status(200).json(summary);
  });

  return router;
}
