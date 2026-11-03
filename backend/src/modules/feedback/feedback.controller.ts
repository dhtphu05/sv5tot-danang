/**
 * 5TOT ĐHĐN — Feedback & Bug Report Controller
 */

import type { Request, Response, RequestHandler } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { createFeedbackSchema } from './feedback.schemas';
import type { FeedbackService } from './feedback.service';

export class FeedbackController {
  constructor(private service: FeedbackService) {}

  public submitFeedback: RequestHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const parseResult = createFeedbackSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: firstIssue?.message || 'Dữ liệu gửi lên không hợp lệ.',
        errors: parseResult.error.flatten(),
      });
      return;
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      undefined;

    const result = await this.service.submitFeedback(req.actor, parseResult.data, clientIp);

    res.status(201).json(result);
  });
}
