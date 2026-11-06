/**
 * 5TOT Đà Nẵng — Responsive HTML & Plain Text Email Templates
 * Cơ quan chỉ đạo: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 *
 * Provides standardized, responsive, accessible email templates with unified typography,
 * consistent institutional branding, and neutral administrative tone.
 */

import type { SupplementRequestEmailData, SubmissionConfirmationEmailData } from './email.types';

// ============================================================================
// 1. Text & Security Utilities
// ============================================================================

export function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function resolveEmailSubjectTag(awardTitle?: string): string {
  if (!awardTitle) return '5TOT Đà Nẵng';
  const lower = awardTitle.toLowerCase();
  if (
    lower.includes('9/1') ||
    lower.includes('9-1') ||
    lower.includes('cánh chim trắng') ||
    lower.includes('canh chim trang')
  ) {
    return 'Giải thưởng 9/1 Đà Nẵng';
  }
  if (lower.includes('tập thể') || lower.includes('tap the')) {
    return 'Tập thể 5TOT Đà Nẵng';
  }
  return '5TOT Đà Nẵng';
}

export function resolveAwardName(awardTitle?: string): string {
  if (!awardTitle) return 'danh hiệu Sinh viên 5 tốt Thành phố Đà Nẵng';
  const lower = awardTitle.toLowerCase();
  if (
    lower.includes('9/1') ||
    lower.includes('9-1') ||
    lower.includes('cánh chim trắng') ||
    lower.includes('canh chim trang')
  ) {
    return 'Giải thưởng 9/1 Thành phố Đà Nẵng';
  }
  if (lower.includes('tập thể') || lower.includes('tap the')) {
    return 'danh hiệu Tập thể Sinh viên 5 tốt Thành phố Đà Nẵng';
  }
  if (lower.startsWith('danh hiệu') || lower.startsWith('giải thưởng')) {
    return awardTitle;
  }
  return `danh hiệu ${awardTitle}`;
}

export function parseFlexibleDateTime(input?: string | Date | null): Date | undefined {
  if (!input) return undefined;
  if (input instanceof Date) return isNaN(input.getTime()) ? undefined : input;
  const s = String(input).trim();
  if (!s) return undefined;

  const standardParsed = Date.parse(s);
  if (!isNaN(standardParsed)) return new Date(standardParsed);

  const vnMatch = s.match(/(\d{1,2}):(\d{2})\s*(?:[·,\-]\s*)?(?:ngày\s+)?(\d{1,2})\/(\d{1,2})\/(\d{4})/i);
  if (vnMatch) {
    const [, hour, min, day, month, year] = vnMatch;
    const isoStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${min.padStart(2, '0')}:00+07:00`;
    const d = new Date(isoStr);
    if (!isNaN(d.getTime())) return d;
  }

  const dateOnlyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dateOnlyMatch) {
    const [, day, month, year] = dateOnlyMatch;
    const isoStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T23:59:59+07:00`;
    const d = new Date(isoStr);
    if (!isNaN(d.getTime())) return d;
  }

  return undefined;
}

export function formatVietnameseDateTime(date?: string | Date | null): string {
  const d = parseFlexibleDateTime(date);
  if (!d) return '';

  try {
    const parts = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false,
    }).formatToParts(d);
    const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return `${map.hour}:${map.minute}, ngày ${map.day}/${map.month}/${map.year}`;
  } catch {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${minutes}, ngày ${day}/${month}/${year}`;
  }
}

export function formatRequiredActions(actionStr?: string): string {
  if (!actionStr) return 'Bổ sung minh chứng mới';
  const actionMap: Record<string, string> = {
    addEvidence: 'Bổ sung minh chứng mới',
    editDeclaration: 'Chỉnh sửa thông tin kê khai',
    replaceEvidence: 'Thay thế minh chứng hiện tại',
    addDeclaration: 'Kê khai thêm thông tin / hoạt động mới',
    explanation: 'Giải trình / xác nhận nội dung',
  };
  const parts = actionStr.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean);
  const mapped = parts.map((p) => actionMap[p] || p);
  return mapped.join(', ') || actionStr;
}

export function resolveCriterionName(code: string): string {
  if (!code) return 'Tiêu chuẩn xét chọn';
  const normalized = code.trim().toLowerCase();

  if (
    normalized === 'tc1' ||
    normalized === 'tc01' ||
    normalized === 'ethics' ||
    normalized === 'dao_duc_tot' ||
    normalized === 'dao-duc-tot'
  ) {
    return 'Tiêu chuẩn 1: Đạo đức tốt';
  }
  if (
    normalized === 'tc2' ||
    normalized === 'tc02' ||
    normalized === 'academic' ||
    normalized === 'hoc_tap_tot' ||
    normalized === 'hoc-tap-tot'
  ) {
    return 'Tiêu chuẩn 2: Học tập tốt';
  }
  if (
    normalized === 'tc3' ||
    normalized === 'tc03' ||
    normalized === 'physical' ||
    normalized === 'the_luc_tot' ||
    normalized === 'the-luc-tot'
  ) {
    return 'Tiêu chuẩn 3: Thể lực tốt';
  }
  if (
    normalized === 'tc4' ||
    normalized === 'tc04' ||
    normalized === 'volunteer' ||
    normalized === 'tinh_nguyen_tot' ||
    normalized === 'tinh-nguyen-tot'
  ) {
    return 'Tiêu chuẩn 4: Tình nguyện tốt';
  }
  if (
    normalized === 'tc5' ||
    normalized === 'tc05' ||
    normalized === 'integration' ||
    normalized === 'hoi_nhap_tot' ||
    normalized === 'hoi-nhap-tot'
  ) {
    return 'Tiêu chuẩn 5: Hội nhập tốt';
  }

  return `Tiêu chuẩn / Tiêu chí: ${code}`;
}

// ============================================================================
// 2. Shared Email Base Layout
// ============================================================================

export interface SharedEmailLayoutOptions {
  title: string;
  preheaderText?: string;
  badgeHtml?: string;
  greetingName: string;
  introHtml: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  noticeHtml?: string;
  hideFallbackUrl?: boolean;
}

export function renderSharedEmailLayout(options: SharedEmailLayoutOptions): string {
  const {
    title,
    preheaderText,
    badgeHtml = '',
    greetingName,
    introHtml,
    contentHtml,
    ctaText,
    ctaUrl,
    noticeHtml = '',
    hideFallbackUrl = false,
  } = options;

  const escapedName = escapeHtml(greetingName);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 32px 16px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .header {
      background-color: #0D78AE;
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }
    .org-title {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0 0 6px 0;
      color: #ffffff;
    }
    .system-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #f0f9ff;
    }
    .content {
      padding: 32px 24px;
      font-size: 15px;
      color: #1e293b;
    }
    .status-badge {
      display: inline-block;
      font-weight: 600;
      font-size: 13px;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    .status-badge-success {
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 14px;
    }
    .main-text {
      margin: 0 0 16px 0;
      line-height: 1.6;
      color: #334155;
    }
    .detail-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 18px;
      margin: 18px 0;
    }
    .detail-row {
      margin-bottom: 10px;
      font-size: 14px;
      line-height: 1.5;
    }
    .detail-row:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      font-weight: 600;
      color: #475569;
      display: inline-block;
      min-width: 140px;
    }
    .detail-value {
      color: #0f172a;
    }
    .mono-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #0D78AE;
      font-size: 14.5px;
    }
    .status-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12.5px;
      font-weight: 600;
      background-color: #e0f2fe;
      color: #0369a1;
    }
    .deadline-highlight {
      color: #b91c1c;
      font-weight: 700;
    }
    .reason-box {
      background-color: #eff6ff;
      border-left: 3px solid #0D78AE;
      padding: 12px 14px;
      margin-top: 8px;
      border-radius: 0 6px 6px 0;
      font-size: 14px;
      color: #1e3a8a;
      line-height: 1.5;
      white-space: pre-line;
    }
    .guidance-box {
      background-color: #f0fdf4;
      border-left: 3px solid #10b981;
      padding: 14px 16px;
      margin: 20px 0;
      font-size: 13.5px;
      color: #065f46;
      border-radius: 0 6px 6px 0;
      line-height: 1.6;
    }
    .notice-box {
      background-color: #fffbeb;
      border-left: 3px solid #f59e0b;
      padding: 12px 16px;
      margin: 20px 0;
      font-size: 13.5px;
      color: #92400e;
      border-radius: 0 4px 4px 0;
      line-height: 1.6;
    }
    .cta-container {
      text-align: center;
      margin: 26px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #0D78AE;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      padding: 13px 28px;
      border-radius: 6px;
      min-height: 44px;
      box-sizing: border-box;
      line-height: 20px;
    }
    .fallback-section {
      margin-top: 22px;
      font-size: 13px;
      color: #64748b;
    }
    .fallback-url-box {
      font-size: 12px;
      color: #0D78AE;
      word-break: break-all;
      overflow-wrap: break-word;
      background-color: #f8fafc;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      margin-top: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .fallback-url-box a {
      color: #0D78AE;
      text-decoration: underline;
      word-break: break-all;
      overflow-wrap: break-word;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer a {
      color: #0D78AE;
      text-decoration: none;
    }
    @media only screen and (max-width: 480px) {
      .wrapper {
        padding: 12px 8px;
      }
      .content {
        padding: 24px 16px;
      }
      .cta-button {
        display: block;
        width: 100%;
        padding: 14px 16px;
      }
      .detail-label {
        display: block;
        margin-bottom: 2px;
      }
    }
  </style>
</head>
<body>
  ${preheaderText ? `<!-- Preheader preview text for email clients -->
  <div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(preheaderText)}
  </div>` : ''}
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="org-title">HỘI SINH VIÊN VIỆT NAM THÀNH PHỐ ĐÀ NẴNG</div>
        <div class="system-title">Hệ thống xét chọn danh hiệu và giải thưởng sinh viên · 5TOT Đà Nẵng</div>
      </div>

      <div class="content">
        ${badgeHtml ? `${badgeHtml}\n` : ''}
        <div class="greeting">Kính gửi ${escapedName},</div>
        ${introHtml}

        ${contentHtml}

        ${noticeHtml ? `${noticeHtml}\n` : ''}

        ${ctaText && ctaUrl ? `
        <div class="cta-container">
          <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" class="cta-button">
            ${escapeHtml(ctaText)}
          </a>
        </div>
        ` : ''}

        ${!hideFallbackUrl && ctaUrl ? `
        <div class="fallback-section">
          <p style="margin: 0 0 6px 0;">Nếu nút trên không hoạt động, vui lòng sao chép liên kết sau và mở trong trình duyệt:</p>
          <div class="fallback-url-box">
            <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer">${ctaUrl}</a>
          </div>
        </div>
        ` : ''}
      </div>

      <div class="footer">
        <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng</p>
        <p style="margin: 0 0 6px 0;">Email hỗ trợ: <a href="mailto:hoisinhvien@danang.gov.vn">hoisinhvien@danang.gov.vn</a></p>
        <p style="margin: 0; font-size: 11.5px; color: #94a3b8;">Đây là email được gửi tự động từ hệ thống. Vui lòng không trả lời trực tiếp.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// 3. Password Reset Templates
// ============================================================================

export interface PasswordResetTemplateParams {
  userName: string;
  userEmail?: string;
  resetUrl: string;
  expiresInMinutes?: number;
  requestedAt?: Date | string;
}

export function buildPasswordResetHtmlTemplate({
  userName,
  userEmail,
  resetUrl,
  expiresInMinutes = 15,
  requestedAt,
}: PasswordResetTemplateParams): string {
  const formattedTime = formatVietnameseDateTime(requestedAt || new Date());
  const preheader = `Liên kết đặt lại mật khẩu của bạn có hiệu lực trong ${expiresInMinutes} phút. Vui lòng nhấn để thiết lập mật khẩu mới.`;
  const accountDisplay = userEmail ? escapeHtml(userEmail) : escapeHtml(userName);

  const contextCardHtml = `
    <div class="detail-card">
      <div class="detail-row">
        <span class="detail-label">Tài khoản:</span>
        <span class="detail-value" style="font-weight: 600;">${accountDisplay}</span>
      </div>
      ${formattedTime ? `
      <div class="detail-row">
        <span class="detail-label">Thời gian yêu cầu:</span>
        <span class="detail-value">${escapeHtml(formattedTime)}</span>
      </div>` : ''}
      <div class="detail-row">
        <span class="detail-label">Thời hạn liên kết:</span>
        <span class="detail-value deadline-highlight">${expiresInMinutes} phút (chỉ sử dụng một lần)</span>
      </div>
    </div>
  `;

  const noticeHtml = `
    <div class="notice-box">
      <p style="margin: 0 0 6px 0;">• Liên kết có hiệu lực trong ${expiresInMinutes} phút và chỉ sử dụng một lần.</p>
      <p style="margin: 0 0 6px 0;">• Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu hiện tại của bạn sẽ không thay đổi.</p>
      <p style="margin: 0; font-size: 12.5px; color: #b45309;">• Lưu ý: Vì lý do an toàn, tuyệt đối không chuyển tiếp email hoặc chia sẻ liên kết này cho bất kỳ ai khác.</p>
    </div>
  `;

  return renderSharedEmailLayout({
    title: 'Yêu cầu đặt lại mật khẩu – 5TOT Đà Nẵng',
    preheaderText: preheader,
    greetingName: userName,
    introHtml: `<p class="main-text">Hệ thống đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấn vào nút bên dưới để thiết lập mật khẩu mới.</p>`,
    contentHtml: contextCardHtml,
    ctaText: 'Đặt lại mật khẩu',
    ctaUrl: resetUrl,
    noticeHtml,
  });
}

export function buildPasswordResetPlainTextTemplate({
  userName,
  userEmail,
  resetUrl,
  expiresInMinutes = 15,
  requestedAt,
}: PasswordResetTemplateParams): string {
  const formattedTime = formatVietnameseDateTime(requestedAt || new Date());
  const accountDisplay = userEmail || userName;

  return `HỘI SINH VIÊN VIỆT NAM THÀNH PHỐ ĐÀ NẴNG
Hệ thống xét chọn danh hiệu và giải thưởng sinh viên · 5TOT Đà Nẵng

YÊU CẦU ĐẶT LẠI MẬT KHẨU

Kính gửi ${userName},

Hệ thống đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấn vào liên kết bên dưới để thiết lập mật khẩu mới:

${resetUrl}

THÔNG TIN YÊU CẦU:
• Tài khoản: ${accountDisplay}
${formattedTime ? `• Thời gian yêu cầu: ${formattedTime}\n` : ''}• Thời hạn liên kết: ${expiresInMinutes} phút và chỉ sử dụng một lần.

LƯU Ý:
• Liên kết có hiệu lực trong ${expiresInMinutes} phút và chỉ sử dụng một lần.
• Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu hiện tại của bạn sẽ không thay đổi.

Nếu nút trên không hoạt động, vui lòng sao chép liên kết sau và mở trong trình duyệt:
${resetUrl}

---
Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng
Email hỗ trợ: hoisinhvien@danang.gov.vn
Đây là email được gửi tự động từ hệ thống. Vui lòng không trả lời trực tiếp.`;
}

export interface PasswordChangedTemplateParams {
  userName: string;
  userEmail?: string;
  changedAt?: Date | string;
}

export function buildPasswordChangedHtmlTemplate({
  userName,
  userEmail,
  changedAt,
}: PasswordChangedTemplateParams): string {
  const formattedTime = formatVietnameseDateTime(changedAt || new Date());
  const accountDisplay = userEmail ? escapeHtml(userEmail) : escapeHtml(userName);

  const contextCardHtml = `
    <div class="detail-card">
      <div class="detail-row">
        <span class="detail-label">Tài khoản:</span>
        <span class="detail-value" style="font-weight: 600;">${accountDisplay}</span>
      </div>
      ${formattedTime ? `
      <div class="detail-row">
        <span class="detail-label">Thời gian cập nhật:</span>
        <span class="detail-value">${escapeHtml(formattedTime)}</span>
      </div>` : ''}
      <div class="detail-row">
        <span class="detail-label">Trạng thái:</span>
        <span class="status-badge status-badge-success" style="margin: 0; padding: 2px 10px; font-size: 12px;">Đã đổi mật khẩu thành công</span>
      </div>
    </div>
  `;

  const noticeHtml = `
    <div class="reason-box" style="background-color: #fef2f2; border-left-color: #ef4444; color: #991b1b; padding: 14px 16px;">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #b91c1c;">CẢNH BÁO BẢO MẬT QUAN TRỌNG:</p>
      <p style="margin: 0 0 6px 0; line-height: 1.5;">Nếu chính bạn đã thực hiện thay đổi này, bạn có thể an tâm sử dụng mật khẩu mới để đăng nhập.</p>
      <p style="margin: 0; line-height: 1.5;">Nếu bạn <strong>KHÔNG</strong> thực hiện thay đổi mật khẩu, rất có thể tài khoản của bạn đã bị người khác truy cập trái phép. Vui lòng liên hệ ngay với Ban Thư ký Hội Sinh viên Thành phố Đà Nẵng qua email <a href="mailto:hoisinhvien@danang.gov.vn" style="color: #b91c1c; font-weight: 700; text-decoration: underline;">hoisinhvien@danang.gov.vn</a> để được hỗ trợ khóa tài khoản và kiểm tra khẩn cấp.</p>
    </div>
  `;

  return renderSharedEmailLayout({
    title: 'Mật khẩu tài khoản đã được thay đổi – 5TOT Đà Nẵng',
    preheaderText: 'Mật khẩu tài khoản Sinh viên 5 tốt của bạn đã được cập nhật thành công.',
    greetingName: userName,
    introHtml: `<p class="main-text">Thông báo bảo mật: Mật khẩu cho tài khoản Sinh viên 5 tốt của bạn vừa được thay đổi thành công.</p>`,
    contentHtml: contextCardHtml,
    noticeHtml,
    hideFallbackUrl: true,
  });
}

export function buildPasswordChangedPlainTextTemplate({
  userName,
  userEmail,
  changedAt,
}: PasswordChangedTemplateParams): string {
  const formattedTime = formatVietnameseDateTime(changedAt || new Date());
  const accountDisplay = userEmail || userName;

  return `HỘI SINH VIÊN VIỆT NAM THÀNH PHỐ ĐÀ NẴNG
Hệ thống xét chọn danh hiệu và giải thưởng sinh viên · 5TOT Đà Nẵng

THÔNG BÁO THAY ĐỔI MẬT KHẨU TÀI KHOẢN

Chào ${userName},

Mật khẩu cho tài khoản Sinh viên 5 tốt (${accountDisplay}) đã được thay đổi thành công${formattedTime ? ` vào lúc ${formattedTime}` : ''}.

Nếu chính bạn đã thực hiện thay đổi này, bạn có thể an tâm sử dụng mật khẩu mới để đăng nhập.

CẢNH BÁO BẢO MẬT QUAN TRỌNG:
Nếu bạn KHÔNG thực hiện thay đổi này, rất có thể tài khoản của bạn đã bị người khác truy cập trái phép. Vui lòng liên hệ ngay với Ban Thư ký Hội Sinh viên Thành phố Đà Nẵng qua email hoisinhvien@danang.gov.vn để được hỗ trợ khóa tài khoản khẩn cấp.

---
Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng
Email hỗ trợ: hoisinhvien@danang.gov.vn
Đây là email được gửi tự động từ hệ thống. Vui lòng không trả lời trực tiếp.`;
}

// ============================================================================
// 4. Submission Confirmation Templates
// ============================================================================

export function buildSubmissionConfirmationHtmlTemplate(
  data: SubmissionConfirmationEmailData
): string {
  const actionUrl = data.actionUrl || 'https://sv5t.danang.vn';
  const submittedTimeStr = formatVietnameseDateTime(data.submittedAt || new Date());
  const seasonDisplayName = data.seasonName || 'Năm học 2025 - 2026';
  const awardName = resolveAwardName(data.awardTitle);
  const instName = String(data.institutionName || 'Cơ sở đào tạo tại Đà Nẵng').trim();
  const unitName = String(data.schoolReviewUnitName || '').trim();

  // Deduplication: If unitName is missing, identical to instName, or a substring, don't show duplicate row
  const hasSeparateReviewUnit =
    unitName.length > 0 &&
    unitName.toLowerCase() !== instName.toLowerCase() &&
    !unitName.toLowerCase().includes(instName.toLowerCase()) &&
    !instName.toLowerCase().includes(unitName.toLowerCase());

  const statusDisplay = data.statusName || 'Chờ xét sơ tuyển';

  const detailCardHtml = `
    <div class="detail-card">
      <div class="detail-row">
        <span class="detail-label">Mã hồ sơ:</span>
        <span class="detail-value"><strong class="mono-code">${escapeHtml(data.applicationCode)}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Năm học xét chọn:</span>
        <span class="detail-value">${escapeHtml(seasonDisplayName)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Trường/Đơn vị:</span>
        <span class="detail-value">${escapeHtml(instName)}</span>
      </div>
      ${hasSeparateReviewUnit ? `
      <div class="detail-row">
        <span class="detail-label">Đơn vị tiếp nhận:</span>
        <span class="detail-value">${escapeHtml(unitName)}</span>
      </div>` : ''}
      <div class="detail-row">
        <span class="detail-label">Thời gian nộp:</span>
        <span class="detail-value">${submittedTimeStr}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Trạng thái hiện tại:</span>
        <span class="detail-value"><span class="status-tag">${escapeHtml(statusDisplay)}</span></span>
      </div>
    </div>
  `;

  const guidanceHtml = `
    <div class="guidance-box">
      <p style="margin: 0 0 6px 0;">Hồ sơ sẽ được đơn vị phụ trách xem xét theo quy trình xét chọn. Trường hợp cần bổ sung hoặc làm rõ minh chứng, bạn sẽ nhận được thông báo qua hệ thống và email đã đăng ký.</p>
      <p style="margin: 0;">Bạn có thể theo dõi tiến độ xử lý hồ sơ bằng nút bên dưới.</p>
    </div>
  `;

  return renderSharedEmailLayout({
    title: `Xác nhận nộp hồ sơ – ${data.applicationCode}`,
    badgeHtml: `<div class="status-badge status-badge-success">&#10003; Đã nộp hồ sơ thành công</div>`,
    greetingName: data.studentName,
    introHtml: `
      <p class="main-text">Hệ thống đã tiếp nhận hồ sơ đăng ký xét chọn ${escapeHtml(awardName)} của bạn.</p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">Thông tin hồ sơ được ghi nhận như sau:</p>
    `,
    contentHtml: detailCardHtml + guidanceHtml,
    ctaText: 'Theo dõi hồ sơ',
    ctaUrl: actionUrl,
  });
}

export function buildSubmissionConfirmationPlainTextTemplate(
  data: SubmissionConfirmationEmailData
): string {
  const actionUrl = data.actionUrl || 'https://sv5t.danang.vn';
  const submittedTimeStr = formatVietnameseDateTime(data.submittedAt || new Date());
  const seasonDisplayName = data.seasonName || 'Năm học 2025 - 2026';
  const awardName = resolveAwardName(data.awardTitle);
  const instName = String(data.institutionName || 'Cơ sở đào tạo tại Đà Nẵng').trim();
  const unitName = String(data.schoolReviewUnitName || '').trim();

  const hasSeparateReviewUnit =
    unitName.length > 0 &&
    unitName.toLowerCase() !== instName.toLowerCase() &&
    !unitName.toLowerCase().includes(instName.toLowerCase()) &&
    !instName.toLowerCase().includes(unitName.toLowerCase());

  const statusDisplay = data.statusName || 'Chờ xét sơ tuyển';

  return `HỘI SINH VIÊN VIỆT NAM THÀNH PHỐ ĐÀ NẴNG
Hệ thống xét chọn danh hiệu và giải thưởng sinh viên · 5TOT Đà Nẵng

XÁC NHẬN NỘP HỒ SƠ

Kính gửi ${data.studentName},

Hệ thống đã tiếp nhận hồ sơ đăng ký xét chọn ${awardName} của bạn.

Thông tin hồ sơ được ghi nhận như sau:
- Mã hồ sơ: ${data.applicationCode}
- Năm học xét chọn: ${seasonDisplayName}
- Trường/Đơn vị: ${instName}
${hasSeparateReviewUnit ? `- Đơn vị tiếp nhận: ${unitName}\n` : ''}- Thời gian nộp: ${submittedTimeStr}
- Trạng thái hiện tại: ${statusDisplay}

Hồ sơ sẽ được đơn vị phụ trách xem xét theo quy trình xét chọn. Trường hợp cần bổ sung hoặc làm rõ minh chứng, bạn sẽ nhận được thông báo qua hệ thống và email đã đăng ký.

Bạn có thể theo dõi tiến độ xử lý hồ sơ tại liên kết sau:
${actionUrl}

---
Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng
Email hỗ trợ: hoisinhvien@danang.gov.vn
Đây là email được gửi tự động từ hệ thống. Vui lòng không trả lời trực tiếp.`;
}

// ============================================================================
// 5. Evidence Supplement Request Templates
// ============================================================================

export function buildSupplementRequestHtmlTemplate(data: SupplementRequestEmailData): string {
  const criterionDisplayName = data.criterionName || resolveCriterionName(data.criterionOrReqCode);
  const actionUrl = data.actionUrl || 'https://sv5t.danang.vn';
  const deadlineStr = formatVietnameseDateTime(data.deadlineAt);
  const actionDisplay = formatRequiredActions(data.requiredAction);
  const awardName = resolveAwardName(data.awardTitle);
  const instName = String(data.institutionName || 'Cơ sở đào tạo tại Đà Nẵng').trim();

  // If declaration title is long, truncate cleanly for email layout
  let declDisplay = data.declarationTitle ? String(data.declarationTitle).trim() : '';
  if (declDisplay.length > 300) {
    declDisplay = `${declDisplay.slice(0, 297)}...`;
  }

  const detailCardHtml = `
    <div class="detail-card">
      <div class="detail-row">
        <span class="detail-label">Mã hồ sơ:</span>
        <span class="detail-value"><strong class="mono-code">${escapeHtml(data.applicationCode)}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Trường/Đơn vị:</span>
        <span class="detail-value">${escapeHtml(instName)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Tiêu chuẩn:</span>
        <span class="detail-value"><strong>${escapeHtml(criterionDisplayName)}</strong></span>
      </div>
      ${data.requirementTitle ? `
      <div class="detail-row">
        <span class="detail-label">Tiêu chí:</span>
        <span class="detail-value"><strong>${escapeHtml(data.requirementTitle)}</strong></span>
      </div>` : ''}
      ${declDisplay ? `
      <div class="detail-row">
        <span class="detail-label">Nội dung kê khai:</span>
        <span class="detail-value">${escapeHtml(declDisplay)}</span>
      </div>` : ''}
      <div class="detail-row" style="margin-top: 12px;">
        <span class="detail-label" style="display: block; margin-bottom: 4px;">Nội dung yêu cầu của cán bộ:</span>
        <div class="reason-box">
          ${escapeHtml(data.requestReason)}
        </div>
      </div>
      ${actionDisplay ? `
      <div class="detail-row" style="margin-top: 10px;">
        <span class="detail-label">Hành động cần thực hiện:</span>
        <span class="detail-value">${escapeHtml(actionDisplay)}</span>
      </div>` : ''}
      ${deadlineStr ? `
      <div class="detail-row" style="margin-top: 10px;">
        <span class="detail-label">Thời hạn hoàn thành:</span>
        <span class="detail-value"><span class="deadline-highlight">${deadlineStr}</span></span>
      </div>` : ''}
    </div>
  `;

  const noticeHtml = `
    <div class="notice-box">
      ${deadlineStr
        ? 'Vui lòng hoàn thành và gửi lại nội dung bổ sung trước thời hạn nêu trên để hồ sơ được tiếp tục xem xét.'
        : 'Vui lòng truy cập hệ thống để xem yêu cầu và thực hiện bổ sung theo hướng dẫn.'}
    </div>
  `;

  return renderSharedEmailLayout({
    title: `Yêu cầu bổ sung minh chứng – ${data.applicationCode}`,
    greetingName: data.studentName,
    introHtml: `<p class="main-text">Trong quá trình xét duyệt hồ sơ ${escapeHtml(awardName)}, đơn vị phụ trách đề nghị bạn bổ sung hoặc làm rõ minh chứng theo thông tin dưới đây.</p>`,
    contentHtml: detailCardHtml,
    ctaText: 'Xem yêu cầu và bổ sung minh chứng',
    ctaUrl: actionUrl,
    noticeHtml,
  });
}

export function buildSupplementRequestPlainTextTemplate(data: SupplementRequestEmailData): string {
  const criterionDisplayName = data.criterionName || resolveCriterionName(data.criterionOrReqCode);
  const actionUrl = data.actionUrl || 'https://sv5t.danang.vn';
  const deadlineStr = formatVietnameseDateTime(data.deadlineAt);
  const actionDisplay = formatRequiredActions(data.requiredAction);
  const awardName = resolveAwardName(data.awardTitle);
  const instName = String(data.institutionName || 'Cơ sở đào tạo tại Đà Nẵng').trim();

  return `HỘI SINH VIÊN VIỆT NAM THÀNH PHỐ ĐÀ NẴNG
Hệ thống xét chọn danh hiệu và giải thưởng sinh viên · 5TOT Đà Nẵng

YÊU CẦU BỔ SUNG MINH CHỨNG

Kính gửi ${data.studentName},

Trong quá trình xét duyệt hồ sơ ${awardName}, đơn vị phụ trách đề nghị bạn bổ sung hoặc làm rõ minh chứng theo thông tin dưới đây.

THÔNG TIN YÊU CẦU BỔ SUNG:
- Mã hồ sơ: ${data.applicationCode}
- Trường/Đơn vị: ${instName}
- Tiêu chuẩn: ${criterionDisplayName}
${data.requirementTitle ? `- Tiêu chí: ${data.requirementTitle}\n` : ''}${data.declarationTitle ? `- Nội dung kê khai: ${data.declarationTitle}\n` : ''}- Nội dung yêu cầu của cán bộ: ${data.requestReason}
${actionDisplay ? `- Hành động cần thực hiện: ${actionDisplay}\n` : ''}${deadlineStr ? `- Thời hạn hoàn thành: ${deadlineStr}\n` : ''}
LƯU Ý:
${deadlineStr ? 'Vui lòng hoàn thành và gửi lại nội dung bổ sung trước thời hạn nêu trên để hồ sơ được tiếp tục xem xét.' : 'Vui lòng truy cập hệ thống để xem yêu cầu và thực hiện bổ sung theo hướng dẫn.'}

Bạn có thể truy cập liên kết sau để xem yêu cầu và bổ sung minh chứng:
${actionUrl}

---
Ban Thư ký Hội Sinh viên Việt Nam Thành phố Đà Nẵng
Email hỗ trợ: hoisinhvien@danang.gov.vn
Đây là email được gửi tự động từ hệ thống. Vui lòng không trả lời trực tiếp.`;
}

// ============================================================================
// 6. Feedback & Bug Report Notification Templates
// ============================================================================

export function buildFeedbackNotificationHtmlTemplate(data: {
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
}): string {
  const categoryConfig = {
    BUG: {
      label: 'BÁO LỖI KỸ THUẬT',
      badgeBg: '#FEF2F2',
      badgeColor: '#991B1B',
      badgeBorder: '#FCA5A5',
    },
    SUGGESTION: {
      label: 'GÓP Ý TÍNH NĂNG & GIAO DIỆN',
      badgeBg: '#EFF6FF',
      badgeColor: '#1D4ED8',
      badgeBorder: '#BFDBFE',
    },
    OTHER: {
      label: 'Ý KIẾN ĐÓNG GÓP KHÁC',
      badgeBg: '#F8FAFC',
      badgeColor: '#334155',
      badgeBorder: '#CBD5E1',
    },
  }[data.category] || {
    label: 'GÓP Ý NGƯỜI DÙNG',
    badgeBg: '#F8FAFC',
    badgeColor: '#334155',
    badgeBorder: '#CBD5E1',
  };

  const roleLabelMap: Record<string, string> = {
    GUEST: 'Khách (Chưa đăng nhập)',
    STUDENT: 'Sinh viên',
    STAFF: 'Cán bộ / Chuyên viên',
    ADMIN: 'Quản trị viên',
    MANAGER: 'Cán bộ quản lý',
  };
  const roleLabel = data.userRole ? (roleLabelMap[data.userRole] || data.userRole) : '';

  const submittedTime = data.submittedAt
    ? formatVietnameseDateTime(data.submittedAt)
    : formatVietnameseDateTime(new Date());

  const cleanPreview = data.content.trim().replace(/\r?\n/g, ' ').slice(0, 80);

  // Build context rows cleanly
  const rows: { label: string; valueHtml: string }[] = [];
  rows.push({
    label: 'Người phản hồi:',
    valueHtml: `<strong>${escapeHtml(data.senderName)}</strong>${
      roleLabel
        ? ` <span style="display: inline-block; font-size: 11px; background-color: #EAF2F7; color: #07457E; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin-left: 6px; vertical-align: middle;">${escapeHtml(
            roleLabel
          )}</span>`
        : ''
    }`,
  });
  rows.push({
    label: 'Email liên hệ:',
    valueHtml: `<a href="mailto:${escapeHtml(
      data.senderEmail
    )}" style="color: #07457E; font-weight: 600; text-decoration: underline;">${escapeHtml(
      data.senderEmail
    )}</a>`,
  });

  if (data.senderPhone) {
    rows.push({
      label: 'Số điện thoại:',
      valueHtml: `<span style="color: #172A3A; font-weight: 500;">${escapeHtml(data.senderPhone)}</span>`,
    });
  }

  if (data.studentCode || data.institutionName) {
    const instParts: string[] = [];
    if (data.studentCode) {
      instParts.push(`<strong>MSSV:</strong> ${escapeHtml(data.studentCode)}`);
    }
    if (data.institutionName) {
      instParts.push(escapeHtml(data.institutionName));
    }
    rows.push({
      label: 'Đơn vị / Cơ sở:',
      valueHtml: instParts.join(' &bull; '),
    });
  }

  if (data.pageUrl) {
    rows.push({
      label: 'Trang ghi nhận:',
      valueHtml: `<a href="${escapeHtml(
        data.pageUrl
      )}" target="_blank" rel="noopener noreferrer" style="color: #0D78AE; text-decoration: underline; font-size: 12.5px; word-break: break-all;">${escapeHtml(
        data.pageUrl
      )}</a>`,
    });
  }

  if (data.deviceSummary) {
    rows.push({
      label: 'Môi trường thiết bị:',
      valueHtml: `<span style="color: #64748B; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11.5px;">${escapeHtml(
        data.deviceSummary
      )}</span>`,
    });
  }

  const tableRowsHtml = rows
    .map((row, index) => {
      const isLast = index === rows.length - 1;
      const borderStyle = isLast ? '' : 'border-bottom: 1px solid #E2E8F0;';
      return `
        <tr>
          <td style="padding: 10px 14px; font-weight: 600; color: #64748B; width: 145px; vertical-align: top; ${borderStyle}">
            ${row.label}
          </td>
          <td style="padding: 10px 14px; color: #172A3A; vertical-align: top; ${borderStyle}">
            ${row.valueHtml}
          </td>
        </tr>
      `;
    })
    .join('');

  const imagesHtml =
    data.images && data.images.length > 0
      ? `
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
        <div style="margin-bottom: 14px;">
          <div style="font-size: 13px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 4px;">
            Ảnh chụp màn hình đính kèm (${data.images.length} tệp):
          </div>
          <p style="margin: 0; font-size: 12.5px; color: #64748B; line-height: 1.5;">
            Hình ảnh đã được đính kèm trực tiếp theo thư và hiển thị bên dưới. Bạn có thể bấm vào ảnh để xem hoặc tải về từ mục tệp đính kèm.
          </p>
        </div>
        <div>
          ${data.images
            .map(
              (_, idx) => `
            <div style="border: 1px solid #DCE7EE; border-radius: 8px; overflow: hidden; background-color: #FFFFFF; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(15,35,53,0.04);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FBFD; border-bottom: 1px solid #E2E8F0;">
                <tr>
                  <td align="left" style="padding: 8px 14px; font-size: 12px; font-weight: 700; color: #07457E;">
                    Ảnh ${idx + 1}
                  </td>
                  <td align="right" style="padding: 8px 14px; font-size: 11.5px; color: #64748B; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                    screenshot-${idx + 1}
                  </td>
                </tr>
              </table>
              <div style="padding: 12px; background-color: #F1F5F9; text-align: center;">
                <img src="cid:screenshot-${idx + 1}" alt="Ảnh đính kèm ${idx + 1}" style="max-width: 100%; height: auto; max-height: 520px; object-fit: contain; border-radius: 4px; display: inline-block; box-shadow: 0 1px 3px rgba(0,0,0,0.08);" />
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `
      : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Thông báo Góp ý & Báo lỗi — 5TOT Đà Nẵng</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F4F7F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #172A3A; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 12px 8px !important; }
      .email-card { border-radius: 6px !important; }
      .email-content { padding: 18px 16px !important; }
      .header-box { padding: 18px 16px !important; }
      .action-table td { display: block !important; width: 100% !important; text-align: left !important; }
      .action-table td.action-note { margin-top: 12px !important; text-align: left !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 16px; background-color: #F4F7F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #172A3A; -webkit-font-smoothing: antialiased;">
  <!-- Hidden Preheader -->
  <div style="display:none;font-size:1px;color:#F4F7F9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
    [${escapeHtml(categoryConfig.label)}] Phản hồi từ ${escapeHtml(data.senderName)}: ${escapeHtml(cleanPreview)}
  </div>

  <div class="email-wrapper" style="width: 100%; box-sizing: border-box;">
    <div class="email-card" style="max-width: 640px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #DCE7EE; box-shadow: 0 4px 16px rgba(15, 35, 53, 0.06); overflow: hidden;">
      
      <!-- Header: Official City Navy -->
      <div class="header-box" style="background-color: #07457E; padding: 22px 28px; border-bottom: 3px solid #0D78AE;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: rgba(255, 255, 255, 0.85); margin-bottom: 4px;">
          Thành Đoàn Đà Nẵng · Hội Sinh viên Việt Nam Thành phố Đà Nẵng
        </div>
        <div style="font-size: 17px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.01em;">
          Hệ thống 5TOT Đà Nẵng · Phản hồi & Báo lỗi Kỹ thuật
        </div>
      </div>

      <div class="email-content" style="padding: 26px 28px;">
        
        <!-- Category Badge & Timestamp Strip (Bulletproof Table) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
          <tr>
            <td align="left" style="vertical-align: middle;">
              <span style="display: inline-block; background-color: ${categoryConfig.badgeBg}; color: ${categoryConfig.badgeColor}; border: 1px solid ${categoryConfig.badgeBorder}; padding: 4px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em;">
                ${categoryConfig.label}
              </span>
            </td>
            <td align="right" style="vertical-align: middle; font-size: 12px; color: #64748B;">
              Thời gian gửi: <span style="color: #334155; font-weight: 600;">${submittedTime}</span>
            </td>
          </tr>
        </table>

        <!-- Metadata Context Table -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; font-size: 13px; margin-bottom: 22px; background-color: #F8FBFD; border: 1px solid #DCE7EE; border-radius: 8px; overflow: hidden;">
          ${tableRowsHtml}
        </table>

        <!-- Content Body -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.03em;">
            Nội dung chi tiết:
          </div>
          <div style="background-color: #FFFFFF; border: 1px solid #DCE7EE; border-left: 4px solid #07457E; border-radius: 6px; padding: 16px 18px; font-size: 14px; line-height: 1.65; color: #172A3A; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${escapeHtml(data.content)}</div>
        </div>

        <!-- Attached Screenshots -->
        ${imagesHtml}

        <!-- Direct Reply Action Bar (Bulletproof Table) -->
        <div style="margin-top: 26px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
          <table role="presentation" class="action-table" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" style="vertical-align: middle;">
                <a href="mailto:${escapeHtml(data.senderEmail)}?subject=Re: [5TOT Đà Nẵng] Phản hồi góp ý / báo lỗi kỹ thuật" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #07457E; color: #FFFFFF !important; font-size: 13px; font-weight: 700; padding: 11px 20px; border-radius: 6px; text-decoration: none; box-sizing: border-box;">
                  Soạn thư trả lời ${escapeHtml(data.senderName)} &rarr;
                </a>
              </td>
              <td class="action-note" align="right" style="vertical-align: middle; font-size: 12px; color: #64748B; line-height: 1.4;">
                <span style="display: block; font-weight: 600; color: #334155;">Đội ngũ Kỹ thuật Hệ thống 5TOT Đà Nẵng</span>
                <span style="font-size: 11px; color: #94A3B8;">Nhấn nút để mở ứng dụng email phản hồi</span>
              </td>
            </tr>
          </table>
        </div>

      </div>

      <!-- Footer -->
      <div style="background-color: #F8FBFD; padding: 20px 28px; text-align: center; border-top: 1px solid #E3EBF1; font-size: 12px; color: #64748B; line-height: 1.6;">
        <p style="margin: 0 0 6px 0;">
          Email thông báo tự động được chuyển tiếp tới Ban Kỹ thuật:
          <br>
          <a href="mailto:vanngocnhuy30032006@gmail.com" style="color: #07457E; font-weight: 600; text-decoration: none;">vanngocnhuy30032006@gmail.com</a>
          <span style="color: #CBD5E1; margin: 0 6px;">&bull;</span>
          <a href="mailto:dhtphu05@gmail.com" style="color: #07457E; font-weight: 600; text-decoration: none;">dhtphu05@gmail.com</a>
        </p>
        <p style="margin: 0; font-size: 11px; color: #94A3B8;">
          &copy; 2026 Hội Sinh viên Việt Nam Thành phố Đà Nẵng &middot; Hệ thống 5TOT Đà Nẵng
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
}

export function buildFeedbackNotificationPlainTextTemplate(data: {
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
}): string {
  const categoryLabel = {
    BUG: 'BÁO LỖI KỸ THUẬT',
    SUGGESTION: 'GÓP Ý TÍNH NĂNG & GIAO DIỆN',
    OTHER: 'Ý KIẾN ĐÓNG GÓP KHÁC',
  }[data.category] || 'GÓP Ý';

  const roleLabelMap: Record<string, string> = {
    GUEST: 'Khách (Chưa đăng nhập)',
    STUDENT: 'Sinh viên',
    STAFF: 'Cán bộ / Chuyên viên',
    ADMIN: 'Quản trị viên',
    MANAGER: 'Cán bộ quản lý',
  };
  const roleLabel = data.userRole ? (roleLabelMap[data.userRole] || data.userRole) : 'Khách';

  const submittedTime = data.submittedAt
    ? formatVietnameseDateTime(data.submittedAt)
    : formatVietnameseDateTime(new Date());

  return [
    '=== [5TOT ĐÀ NẴNG] THÔNG BÁO GÓP Ý & BÁO LỖI KỸ THUẬT ===',
    `Thời gian gửi: ${submittedTime}`,
    `Phân loại: ${categoryLabel}`,
    `Người gửi: ${data.senderName} (${roleLabel})`,
    `Email liên hệ: ${data.senderEmail}`,
    data.senderPhone ? `Số điện thoại: ${data.senderPhone}` : '',
    data.studentCode ? `MSSV: ${data.studentCode}` : '',
    data.institutionName ? `Đơn vị / Cơ sở: ${data.institutionName}` : '',
    data.pageUrl ? `Trang ghi nhận: ${data.pageUrl}` : '',
    data.deviceSummary ? `Thiết bị & Môi trường: ${data.deviceSummary}` : '',
    '',
    '--- NỘI DUNG PHẢN ÁNH ---',
    data.content,
    '',
    data.images && data.images.length > 0 ? `[Đính kèm ${data.images.length} tệp ảnh chụp màn hình]` : '',
    '',
    '---',
    'Email thông báo tự động được chuyển tiếp tới Ban Kỹ thuật:',
    'vanngocnhuy30032006@gmail.com · dhtphu05@gmail.com',
    '© 2026 Hội Sinh viên Việt Nam Thành phố Đà Nẵng · Hệ thống 5TOT Đà Nẵng',
  ]
    .filter(Boolean)
    .join('\n');
}
