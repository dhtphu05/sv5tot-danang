/**
 * 5TOT ĐHĐN — User Feedback & Bug Telemetry Floating Widget
 * Thiết kế đồng bộ chuẩn mực theo hệ thống giao diện ĐHĐN:
 * - Màu chủ đạo: Xanh ĐHĐN (#07457E, #0B64A0), viền #DCE7EE, nền phụ #F8FBFD.
 * - Icon hệ thống Lucide sắc sảo, không dùng emoji cẩu thả.
 * - Hỗ trợ dán ảnh màn hình trực tiếp bằng Ctrl+V hoặc chọn tệp (tối đa 3 ảnh).
 * - Thu thập ngầm URL, độ phân giải màn hình, User Agent và tài khoản đang đăng nhập.
 * - Phím tắt gửi nhanh Ctrl+Enter / Cmd+Enter.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquarePlus,
  X,
  Paperclip,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Bug,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';
import { apiRequest, getApiActorContext, hasActiveAuthSession } from '../../shared/api/httpClient';

export type FeedbackCategory = 'BUG' | 'SUGGESTION' | 'OTHER';

export interface FeedbackFloatingWidgetProps {
  className?: string;
  defaultCategory?: FeedbackCategory;
}

export const FeedbackFloatingWidget: React.FC<FeedbackFloatingWidgetProps> = ({
  className = '',
  defaultCategory = 'BUG',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory);
  const [content, setContent] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isLoggedIn = hasActiveAuthSession();
  const actor = getApiActorContext();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmitSuccess(false);
      setErrorMessage(null);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle Ctrl+V (paste screenshot directly into textarea or modal)
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const clipboardItems = e.clipboardData?.items;
    if (!clipboardItems) return;

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          if (images.length >= 3) {
            setErrorMessage('Chỉ được đính kèm tối đa 3 ảnh màn hình.');
            return;
          }
          if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('Dung lượng mỗi ảnh không được vượt quá 5MB.');
            return;
          }

          const reader = new FileReader();
          reader.onload = (uploadEvent) => {
            const base64 = uploadEvent.target?.result as string;
            if (base64) {
              setImages((prev) => (prev.length < 3 ? [...prev, base64] : prev));
              setErrorMessage(null);
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  }, [images.length]);

  // Handle file input upload
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - images.length;
    if (remainingSlots <= 0) {
      setErrorMessage('Đã đạt giới hạn tối đa 3 ảnh.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    for (const file of filesToProcess) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`Tệp "${file.name}" vượt quá 5MB.`);
        continue;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        if (base64) {
          setImages((prev) => (prev.length < 3 ? [...prev, base64] : prev));
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset file input so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit feedback
  const handleSubmit = async () => {
    const trimmedContent = content.trim();
    if (trimmedContent.length < 5) {
      setErrorMessage('Vui lòng nhập nội dung phản hồi chi tiết tối thiểu 5 ký tự.');
      return;
    }

    if (!isLoggedIn && !guestEmail.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email để Ban Kỹ thuật liên hệ phản hồi.');
      return;
    }

    if (!isLoggedIn && guestEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail.trim())) {
        setErrorMessage('Địa chỉ email không đúng định dạng.');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Capture invisible context telemetry
    const deviceInfo = {
      screenWidth: typeof window !== 'undefined' ? window.screen.width : null,
      screenHeight: typeof window !== 'undefined' ? window.screen.height : null,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : null,
      windowHeight: typeof window !== 'undefined' ? window.innerHeight : null,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      language: typeof navigator !== 'undefined' ? navigator.language : null,
    };

    try {
      await apiRequest('/api/v2/feedback', {
        method: 'POST',
        body: {
          category,
          content: trimmedContent,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          senderEmail: !isLoggedIn ? guestEmail.trim() : undefined,
          senderName: !isLoggedIn ? 'Khách truy cập' : undefined,
          guestEmail: !isLoggedIn ? guestEmail.trim() : undefined,
          guestName: !isLoggedIn ? 'Khách truy cập' : undefined,
          deviceInfo,
          images,
        },
      });

      setSubmitSuccess(true);
      setContent('');
      setImages([]);

      // Automatically close modal after 2.5 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSubmitSuccess(false);
      }, 2500);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setErrorMessage(apiErr.message || 'Không thể gửi phản ánh. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* 1. Sleek Floating Launcher Pill */}
      <div className={`fixed bottom-5 right-5 z-40 select-none ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Đóng góp ý kiến & Báo lỗi hệ thống"
          aria-label="Mở cửa sổ Góp ý & Báo lỗi"
          className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-white text-[#172A3A] border border-[#DCE7EE] shadow-[0_4px_16px_rgba(15,35,53,0.08)] hover:shadow-[0_8px_24px_rgba(15,35,53,0.12)] hover:border-[#07457E]/50 hover:bg-[#F8FBFD] active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-[#EAF2F7] text-[#07457E] flex items-center justify-center shrink-0 group-hover:bg-[#07457E] group-hover:text-white transition-colors duration-200">
            <MessageSquarePlus size={14} strokeWidth={2.2} />
          </div>
          <span className="text-[13px] font-bold tracking-tight text-[#172A3A] pr-0.5 hidden sm:inline">
            Góp ý & Báo lỗi
          </span>
        </button>
      </div>

      {/* 2. Feedback Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onKeyDown={handleKeyDown}
          className="fixed inset-0 z-50 bg-[#0F2335]/40 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          {/* Click backdrop to close */}
          <div
            className="absolute inset-0"
            onClick={() => !isSubmitting && setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            onPaste={handlePaste}
            className="relative w-full max-w-[480px] bg-white rounded-[16px] shadow-[0_20px_50px_rgba(15,35,53,0.18)] border border-[#DCE7EE] overflow-hidden z-10 transition-all select-none animate-in fade-in zoom-in-95 duration-150"
          >
            {submitSuccess ? (
              /* Success State */
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3.5">
                <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shadow-xs">
                  <CheckCircle2 size={30} strokeWidth={2.2} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[16px] font-bold text-[#172A3A]">
                    Đã gửi tới Ban Kỹ thuật thành công!
                  </h3>
                  <p className="text-[13px] text-[#607483] leading-relaxed max-w-sm">
                    Cảm ơn bạn đã phản hồi. Thông tin đã được chuyển trực tiếp tới đội ngũ kỹ thuật để kiểm tra và xử lý.
                  </p>
                </div>
              </div>
            ) : (
              /* Interactive Form State */
              <div className="flex flex-col">
                {/* Header */}
                <div className="px-5 py-4 border-b border-[#E3EBF1] flex items-start justify-between bg-white shrink-0">
                  <div className="flex flex-col pr-4">
                    <h3 className="text-[16px] font-bold text-[#172A3A] tracking-tight">
                      Đóng góp ý kiến & Báo lỗi
                    </h3>
                    <p className="text-[12.5px] text-[#607483] mt-0.5">
                      Phản ánh của bạn được chuyển trực tiếp đến Ban Kỹ thuật phát triển hệ thống.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Đóng"
                    className="p-1.5 rounded-[8px] text-[#728391] hover:text-[#172A3A] hover:bg-[#F1F6F9] transition-colors cursor-pointer shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5 flex flex-col space-y-3.5">
                  {/* Category Segment Tabs */}
                  <div className="p-1 bg-[#F1F5F9] rounded-[10px] grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setCategory('BUG')}
                      className={`py-1.5 px-2 rounded-[7px] text-[12.5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        category === 'BUG'
                          ? 'bg-white text-[#B91C1C] font-bold shadow-xs'
                          : 'text-[#607483] hover:text-[#172A3A] font-medium'
                      }`}
                    >
                      <Bug size={14} className={category === 'BUG' ? 'text-[#B91C1C]' : 'text-[#607483]'} />
                      <span>Báo lỗi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory('SUGGESTION')}
                      className={`py-1.5 px-2 rounded-[7px] text-[12.5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        category === 'SUGGESTION'
                          ? 'bg-white text-[#07457E] font-bold shadow-xs'
                          : 'text-[#607483] hover:text-[#172A3A] font-medium'
                      }`}
                    >
                      <Lightbulb size={14} className={category === 'SUGGESTION' ? 'text-[#07457E]' : 'text-[#607483]'} />
                      <span>Góp ý</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategory('OTHER')}
                      className={`py-1.5 px-2 rounded-[7px] text-[12.5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        category === 'OTHER'
                          ? 'bg-white text-[#172A3A] font-bold shadow-xs'
                          : 'text-[#607483] hover:text-[#172A3A] font-medium'
                      }`}
                    >
                      <MessageSquare size={14} className={category === 'OTHER' ? 'text-[#172A3A]' : 'text-[#607483]'} />
                      <span>Khác</span>
                    </button>
                  </div>

                  {/* Textarea Input */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[12.5px] font-bold text-[#172A3A]">
                      Nội dung phản ánh <span className="text-[#D32F2F]">*</span>
                    </label>
                    <div className="relative rounded-[10px] border border-[#DCE7EE] focus-within:border-[#07457E] focus-within:ring-2 focus-within:ring-[#07457E]/15 transition-all bg-white p-3">
                      <textarea
                        ref={textareaRef}
                        rows={4}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={
                          category === 'BUG'
                            ? 'Mô tả chi tiết lỗi bạn gặp phải (bước thao tác, vị trí lỗi... Bạn có thể nhấn Ctrl+V để dán ảnh màn hình)'
                            : category === 'SUGGESTION'
                            ? 'Mô tả ý tưởng hoặc đề xuất cải tiến tính năng / giao diện của bạn...'
                            : 'Nhập nội dung cần phản hồi hoặc thắc mắc cần hỗ trợ...'
                        }
                        className="w-full text-[13.5px] text-[#172A3A] placeholder:text-[#94A3B8] bg-transparent resize-none outline-hidden leading-relaxed"
                      />

                      {/* Image attachments preview */}
                      {images.length > 0 && (
                        <div className="flex items-center gap-2.5 pt-2.5 mt-2 border-t border-[#F1F5F9] flex-wrap">
                          {images.map((imgSrc, idx) => (
                            <div
                              key={idx}
                              className="relative w-14 h-14 rounded-[8px] border border-[#DCE7EE] overflow-hidden group shrink-0 bg-[#F8FAFC]"
                            >
                              <img
                                src={imgSrc}
                                alt={`Đính kèm ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                aria-label="Xóa ảnh này"
                                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 hover:bg-[#D32F2F] text-white flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <X size={10} strokeWidth={2.5} />
                              </button>
                            </div>
                          ))}
                          {images.length < 3 && (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              title="Thêm ảnh"
                              className="w-14 h-14 rounded-[8px] border border-dashed border-[#CBD5E1] hover:border-[#07457E] hover:bg-[#F0F7FD] flex flex-col items-center justify-center text-[#64748B] hover:text-[#07457E] transition-colors cursor-pointer"
                            >
                              <ImageIcon size={15} />
                              <span className="text-[9.5px] mt-0.5 font-medium">+ Thêm</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Guest Email Field */}
                  {!isLoggedIn && (
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[12.5px] font-bold text-[#172A3A]">
                        Email nhận phản hồi <span className="text-[#D32F2F]">*</span>
                      </label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="Nhập email của bạn để Ban Kỹ thuật liên hệ lại..."
                        className="w-full h-[40px] px-3.5 rounded-[10px] border border-[#DCE7EE] text-[13px] text-[#172A3A] placeholder:text-[#94A3B8] focus:border-[#07457E] focus:ring-2 focus:ring-[#07457E]/15 outline-hidden transition-all"
                      />
                    </div>
                  )}

                  {/* Error Banner */}
                  {errorMessage && (
                    <div className="p-2.5 rounded-[8px] bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[12px] font-medium leading-tight">
                      {errorMessage}
                    </div>
                  )}

                  {/* Bottom Action Strip */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#F1F5F9]">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Tải ảnh màn hình từ máy hoặc bấm Ctrl+V để dán"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[7px] text-[#607483] hover:text-[#07457E] hover:bg-[#F1F6F9] text-[12px] font-medium transition-colors cursor-pointer"
                      >
                        <Paperclip size={14} />
                        <span>{images.length > 0 ? `${images.length}/3 ảnh` : 'Đính kèm ảnh (Ctrl+V)'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11.5px] text-[#94A3B8] hidden sm:inline font-mono">
                        Ctrl+↵
                      </span>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || content.trim().length < 5}
                        className="h-[38px] px-4 rounded-[8px] bg-[#07457E] text-white text-[13px] font-bold shadow-xs hover:bg-[#063B6C] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Đang gửi...</span>
                          </>
                        ) : (
                          <span>Gửi phản ánh</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};