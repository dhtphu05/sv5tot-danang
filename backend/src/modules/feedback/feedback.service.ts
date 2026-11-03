/**
 * 5TOT ĐHĐN — User Feedback & Bug Telemetry Domain Service
 */

import { dbManager } from '../../shared/database/prismaClient';
import { ResendEmailService } from '../../shared/email/resendEmail.service';
import type { IEmailService, FeedbackNotificationEmailData } from '../../shared/email/email.types';
import { logger } from '../../shared/logging/logger';
import { ApiError } from '../../shared/errors/apiError';
import type { AuthenticatedActor } from '../authorization/authorization.types';
import type { CreateFeedbackInput, UserFeedbackDto } from './feedback.types';

export class FeedbackService {
  private inMemoryFeedbacks: UserFeedbackDto[] = [];
  private rateLimitMap = new Map<string, number[]>();
  private emailService: IEmailService;

  constructor(emailService?: IEmailService) {
    this.emailService = emailService || new ResendEmailService();
  }

  /**
   * Enforces in-memory sliding window rate limit: max 5 requests per 10 minutes per IP/User.
   */
  public checkRateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000): void {
    const now = Date.now();
    const timestamps = (this.rateLimitMap.get(key) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= limit) {
      throw ApiError.tooManyRequests(300);
    }

    timestamps.push(now);
    this.rateLimitMap.set(key, timestamps);
  }

  public async submitFeedback(
    actor: AuthenticatedActor | null | undefined,
    input: CreateFeedbackInput,
    clientIp?: string
  ): Promise<{ success: boolean; id: string; message: string }> {
    // 1. Rate Limiting Check
    const rateLimitKey = actor?.userId || clientIp || 'anonymous_guest';
    this.checkRateLimit(rateLimitKey);

    // 2. Resolve User Identity
    let userId: string | null = null;
    let senderName = (input.senderName || input.guestName || '').trim();
    let senderEmail = (input.senderEmail || input.guestEmail || '').trim().toLowerCase();
    let senderPhone = (input.senderPhone || '').trim() || null;
    let institutionId: string | null = null;
    let studentCode: string | undefined = undefined;
    let userRole = 'GUEST';

    if (actor) {
      userId = actor.userId;
      senderEmail = actor.email.toLowerCase();
      senderName = actor.fullName || senderName || 'Người dùng đã đăng nhập';
      institutionId = actor.institutionId || null;
      userRole = actor.activeRole || 'USER';
      studentCode = (actor as any).studentCode;
    } else {
      if (!senderEmail) {
        throw ApiError.badRequest(
          'Vui lòng cung cấp địa chỉ email liên hệ để chúng tôi kiểm tra.',
          'SENDER_EMAIL_REQUIRED'
        );
      }
      if (!senderName) {
        senderName = 'Khách truy cập';
      }
    }

    const category = input.category || 'BUG';
    const content = input.content.trim();
    const pageUrl = input.pageUrl?.trim() || null;
    const images = Array.isArray(input.images) ? input.images.slice(0, 5) : [];
    const deviceInfo = input.deviceInfo || null;
    const now = new Date();

    let feedbackId = `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // 3. Persist to Neon PostgreSQL with fallback
    try {
      const prisma = await dbManager.getClient();
      const saved = await prisma.userFeedback.create({
        data: {
          id: feedbackId,
          userId,
          senderName,
          senderEmail,
          senderPhone,
          institutionId,
          category,
          content,
          pageUrl,
          deviceInfo: deviceInfo ? JSON.parse(JSON.stringify(deviceInfo)) : undefined,
          images,
          status: 'PENDING',
        },
      });
      feedbackId = saved.id;
    } catch (dbErr: any) {
      logger.warn(
        `[FeedbackService:DB_FALLBACK] Could not persist feedback to PostgreSQL Neon: ${dbErr?.message || dbErr}. Storing in-memory.`
      );
      this.inMemoryFeedbacks.push({
        id: feedbackId,
        userId,
        senderName,
        senderEmail,
        senderPhone,
        institutionId,
        category,
        content,
        pageUrl,
        deviceInfo,
        images,
        status: 'PENDING',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    }

    // 4. Dispatch Email Alert to Tech Team asynchronously
    const deviceSummary = this.formatDeviceSummary(deviceInfo);
    const emailPayload: FeedbackNotificationEmailData = {
      to: ['vanngocnhuy30032006@gmail.com', 'dhtphu05@gmail.com'],
      senderName,
      senderEmail,
      senderPhone: senderPhone || undefined,
      studentCode,
      userRole,
      category,
      content,
      pageUrl: pageUrl || undefined,
      deviceSummary,
      images,
      submittedAt: now,
    };

    // Fire and forget or background dispatch so email transport delay never blocks HTTP response
    if (this.emailService.sendFeedbackNotificationEmail) {
      this.emailService.sendFeedbackNotificationEmail(emailPayload).catch((emailErr) => {
        logger.error(`[FeedbackService:EMAIL_ERROR] Failed to dispatch feedback email: ${emailErr?.message || emailErr}`);
      });
    }

    logger.info(
      `[FeedbackService:SUCCESS] Feedback [${feedbackId}] received from ${senderEmail} (Category: ${category})`
    );

    return {
      success: true,
      id: feedbackId,
      message: 'Cảm ơn bạn đã đóng góp ý kiến giúp hoàn thiện hệ thống Sinh viên 5 tốt Đại học Đà Nẵng.',
    };
  }

  private formatDeviceSummary(info: Record<string, unknown> | null | undefined): string | undefined {
    if (!info) return undefined;
    const parts: string[] = [];
    if (info['browser']) parts.push(`Trình duyệt: ${info['browser']}`);
    if (info['os']) parts.push(`HĐH: ${info['os']}`);
    if (info['screenResolution']) parts.push(`Màn hình: ${info['screenResolution']}`);
    if (info['userAgent']) parts.push(`Agent: ${info['userAgent']}`);
    return parts.length > 0 ? parts.join(' | ') : undefined;
  }

  public getInMemoryFeedbacks(): UserFeedbackDto[] {
    return [...this.inMemoryFeedbacks];
  }

  public clearRateLimitsForTesting(): void {
    this.rateLimitMap.clear();
  }
}
