/**
 * 5TOT ĐHĐN — Feedback & Bug Telemetry Domain Service Unit Tests
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { FeedbackService } from '../../src/modules/feedback/feedback.service';
import type { IEmailService, SendEmailOptions, SendEmailResult, FeedbackNotificationEmailData } from '../../src/shared/email/email.types';
import type { AuthenticatedActor } from '../../src/modules/authorization/authorization.types';

class FakeEmailService implements IEmailService {
  public sentEmails: SendEmailOptions[] = [];
  public sentFeedbackData: FeedbackNotificationEmailData[] = [];
  public shouldFail = false;

  public async send(options: SendEmailOptions): Promise<SendEmailResult> {
    this.sentEmails.push(options);
    if (this.shouldFail) {
      return {
        success: false,
        error: 'Simulated email provider error',
        originalRecipient: String(options.to),
        effectiveRecipient: String(options.to),
        isRerouted: false,
        timestamp: new Date().toISOString(),
      };
    }
    return {
      success: true,
      id: `fake-email-${Date.now()}`,
      originalRecipient: String(options.to),
      effectiveRecipient: String(options.to),
      isRerouted: false,
      timestamp: new Date().toISOString(),
    };
  }

  public async sendFeedbackNotificationEmail(data: FeedbackNotificationEmailData): Promise<SendEmailResult> {
    this.sentFeedbackData.push(data);
    return this.send({
      to: data.to || ['vanngocnhuy30032006@gmail.com', 'dhtphu05@gmail.com'],
      subject: `[FEEDBACK] ${data.category}`,
      html: `<p>${data.content}</p>`,
    });
  }

  public async sendPasswordResetEmail(): Promise<SendEmailResult> {
    return { success: true, originalRecipient: '', effectiveRecipient: '', isRerouted: false, timestamp: '' };
  }

  public async sendSupplementRequestEmail(): Promise<SendEmailResult> {
    return { success: true, originalRecipient: '', effectiveRecipient: '', isRerouted: false, timestamp: '' };
  }
}

describe('Backend V2: Feedback & Bug Telemetry Domain Service Unit Tests', () => {
  let fakeEmail: FakeEmailService;
  let service: FeedbackService;

  beforeEach(() => {
    fakeEmail = new FakeEmailService();
    service = new FeedbackService(fakeEmail);
    service.clearRateLimitsForTesting();
  });

  it('submits feedback successfully for an authenticated student actor', async () => {
    const actor: AuthenticatedActor = {
      userId: 'user-dut-student-01',
      email: 'student.dut@dut.udn.vn',
      fullName: 'Nguyễn Văn Sinh Viên',
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
      institutionId: 'inst-dut',
      sessionId: 'sess-01',
      schoolReviewUnitId: null,
    };

    const result = await service.submitFeedback(actor, {
      category: 'BUG',
      content: 'Nút lưu minh chứng bị vô hiệu hóa khi đổi tab.',
      pageUrl: 'https://sinhvien5tot.udn.vn/application?criterion=dao-duc-tot',
      deviceInfo: { browser: 'Chrome 122', os: 'Windows 11' },
      images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='],
    });

    assert.equal(result.success, true);
    assert.ok(result.id);
    assert.match(result.message, /Cảm ơn bạn đã đóng góp ý kiến/);

    // Verify email payload dispatched to both tech team addresses
    assert.equal(fakeEmail.sentFeedbackData.length, 1);
    const sent = fakeEmail.sentFeedbackData[0];
    assert.equal(sent.senderName, 'Nguyễn Văn Sinh Viên');
    assert.equal(sent.senderEmail, 'student.dut@dut.udn.vn');
    assert.equal(sent.category, 'BUG');
    assert.equal(sent.images?.length, 1);
    assert.deepEqual(sent.to, ['vanngocnhuy30032006@gmail.com', 'dhtphu05@gmail.com']);
  });

  it('submits feedback successfully for a guest with email', async () => {
    const result = await service.submitFeedback(null, {
      category: 'SUGGESTION',
      senderEmail: 'guest.candidate@gmail.com',
      senderName: 'Trần Thị Khách',
      content: 'Giao diện nên có thêm nút in phiếu đăng ký ra PDF.',
      pageUrl: 'https://sinhvien5tot.udn.vn/',
    });

    assert.equal(result.success, true);
    assert.equal(fakeEmail.sentFeedbackData.length, 1);
    const sent = fakeEmail.sentFeedbackData[0];
    assert.equal(sent.senderName, 'Trần Thị Khách');
    assert.equal(sent.senderEmail, 'guest.candidate@gmail.com');
    assert.equal(sent.category, 'SUGGESTION');
  });

  it('rejects guest submission without email with 400 Bad Request', async () => {
    await assert.rejects(
      async () => {
        await service.submitFeedback(null, {
          category: 'BUG',
          content: 'Không bấm được đăng ký tài khoản.',
        });
      },
      (err: any) => {
        return err.status === 400 && err.code === 'SENDER_EMAIL_REQUIRED';
      }
    );
  });

  it('enforces rate limiting: blocks more than 5 requests in 10 minutes with 429 Too Many Requests', async () => {
    const actor: AuthenticatedActor = {
      userId: 'user-rate-tester',
      email: 'rate.tester@dut.udn.vn',
      fullName: 'Rate Tester',
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
      institutionId: 'inst-dut',
      sessionId: 'sess-rate',
      schoolReviewUnitId: null,
    };

    // 5 allowed submissions
    for (let i = 0; i < 5; i++) {
      const res = await service.submitFeedback(actor, {
        category: 'BUG',
        content: `Mô tả lỗi test lần ${i + 1}`,
      });
      assert.equal(res.success, true);
    }

    // 6th submission triggers 429
    await assert.rejects(
      async () => {
        await service.submitFeedback(actor, {
          category: 'BUG',
          content: 'Mô tả lỗi test lần thứ 6 vượt hạn mức.',
        });
      },
      (err: any) => {
        return err.status === 429 && err.code === 'TOO_MANY_REQUESTS';
      }
    );
  });

  it('does NOT fail user submission when email dispatch experiences network failure', async () => {
    fakeEmail.shouldFail = true;

    const actor: AuthenticatedActor = {
      userId: 'user-safe-email-test',
      email: 'test@dut.udn.vn',
      fullName: 'Safe Email Tester',
      roles: ['STUDENT'],
      activeRole: 'STUDENT',
      institutionId: 'inst-dut',
      sessionId: 'sess-test',
      schoolReviewUnitId: null,
    };

    const res = await service.submitFeedback(actor, {
      category: 'OTHER',
      content: 'Góp ý kiểm thử lỗi email không ảnh hưởng người dùng.',
    });

    assert.equal(res.success, true);
    assert.ok(res.id);
  });
});
