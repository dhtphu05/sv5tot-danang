/**
 * 5TOT ĐHĐN — Feedback & Bug Report Domain Types
 */

export type FeedbackCategory = 'BUG' | 'SUGGESTION' | 'OTHER';

export interface CreateFeedbackInput {
  category?: FeedbackCategory;
  content: string;
  senderEmail?: string;
  senderName?: string;
  senderPhone?: string;
  pageUrl?: string;
  deviceInfo?: Record<string, unknown>;
  images?: string[];
}

export interface UserFeedbackDto {
  id: string;
  userId?: string | null;
  senderName: string;
  senderEmail: string;
  senderPhone?: string | null;
  institutionId?: string | null;
  category: FeedbackCategory;
  content: string;
  pageUrl?: string | null;
  deviceInfo?: Record<string, unknown> | null;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}
