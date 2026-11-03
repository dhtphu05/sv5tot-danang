/**
 * 5TOT ĐHĐN — Feedback Validation Schemas
 */

import { z } from 'zod';

export const createFeedbackSchema = z.object({
  category: z.enum(['BUG', 'SUGGESTION', 'OTHER']).default('BUG'),
  content: z
    .string()
    .trim()
    .min(5, 'Nội dung góp ý / báo lỗi cần tối thiểu 5 ký tự.')
    .max(5000, 'Nội dung quá dài (tối đa 5.000 ký tự).'),
  senderEmail: z
    .string()
    .trim()
    .email('Địa chỉ email không đúng định dạng.')
    .optional()
    .or(z.literal('')),
  senderName: z.string().trim().max(100).optional(),
  guestEmail: z
    .string()
    .trim()
    .email('Địa chỉ email không đúng định dạng.')
    .optional()
    .or(z.literal('')),
  guestName: z.string().trim().max(100).optional(),
  senderPhone: z.string().trim().max(20).optional(),
  pageUrl: z.string().trim().max(2000).optional(),
  deviceInfo: z.record(z.string(), z.unknown()).optional(),
  images: z.array(z.string()).max(5, 'Đính kèm tối đa 5 hình ảnh.').optional(),
});
