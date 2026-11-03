/**
 * 5TOT ĐHĐN — Email Service Contracts & Data Transfer Objects
 * Cơ quan quản lý: Đoàn Thanh niên - Hội Sinh viên Đại học Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Đại học Đà Nẵng
 */

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  contentId?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  idempotencyKey?: string;
  metadata?: Record<string, string>;
  attachments?: EmailAttachment[];
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  originalRecipient: string;
  effectiveRecipient: string;
  isRerouted: boolean;
  error?: string;
  timestamp: string;
}

export interface PasswordResetEmailData {
  to: string;
  userName: string;
  resetToken: string;
  resetUrl?: string;
  expiresInMinutes?: number;
  requestedAt?: Date | string;
}

export interface PasswordChangedEmailData {
  to: string;
  userName: string;
  userEmail?: string;
  changedAt?: Date | string;
}

export interface SupplementRequestEmailData {
  to: string;
  studentName: string;
  applicationCode: string;
  awardTitle?: string;
  seasonName?: string;
  institutionName?: string;
  schoolReviewUnitName?: string;
  criterionOrReqCode: string;
  criterionName?: string;
  requirementTitle?: string;
  declarationTitle?: string;
  requestReason: string;
  requiredAction?: string;
  deadlineAt?: Date | string;
  reviewerNameSnapshot?: string;
  actionUrl?: string;
}

export interface SubmissionConfirmationEmailData {
  to: string;
  studentName: string;
  applicationCode: string;
  awardTitle?: string;
  seasonName?: string;
  institutionName?: string;
  schoolReviewUnitName?: string;
  submittedAt?: Date | string;
  statusName?: string;
  actionUrl?: string;
}


export interface FeedbackNotificationEmailData {
  to?: string | string[];
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  studentCode?: string;
  institutionName?: string;
  userRole?: string;
  category: 'BUG' | 'SUGGESTION' | 'OTHER';
  content: string;
  pageUrl?: string;
  deviceSummary?: string;
  images?: string[];
  submittedAt?: Date | string;
}

export interface IEmailService {
  send(options: SendEmailOptions): Promise<SendEmailResult>;
  sendPasswordResetEmail(data: PasswordResetEmailData): Promise<SendEmailResult>;
  sendPasswordChangedEmail?(data: PasswordChangedEmailData): Promise<SendEmailResult>;
  sendSupplementRequestEmail(data: SupplementRequestEmailData): Promise<SendEmailResult>;
  sendSubmissionConfirmationEmail?(data: SubmissionConfirmationEmailData): Promise<SendEmailResult>;
  canIssuePasswordResetFor?(accountEmail: string): boolean;
  sendFeedbackNotificationEmail?(data: FeedbackNotificationEmailData): Promise<SendEmailResult>;
}
