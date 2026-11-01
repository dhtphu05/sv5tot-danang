/**
 * 5TOT Đại học Đà Nẵng — Create White Bird Award ("Giải thưởng Cánh chim trắng") Application Modal
 * Căn cứ Quy chế Giải thưởng "Cánh chim trắng" ban hành kèm theo Quyết định số 14-QĐ/ĐHĐN-HSV ngày 04/10/2022
 * của Ban Thư ký Hội Sinh viên Việt Nam Đại học Đà Nẵng.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Feather,
  Sparkles,
  Flame,
  Lightbulb,
  User,
  Users,
  Building2,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import {
  AUTHORITATIVE_SCHOOL_REVIEW_UNITS,
  SchoolReviewUnitId,
} from '../../staff/schoolReviewTypes';
import { resolveInstitutionFromUniversity } from '../../demo/fixtures/studentApplication';
import { Button } from '../buttons/Button';
import { Input } from '../forms/Input';
import {
  WHITE_BIRD_CATEGORIES,
  WhiteBirdCategory,
  WhiteBirdNomineeType,
} from './whiteBirdTypes';

export interface CreateWhiteBirdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nominationTitle: string;
    category: WhiteBirdCategory;
    nomineeType: WhiteBirdNomineeType;
    nomineeName: string;
    studentId: string;
    institutionId: string;
    institutionName: string;
    schoolReviewUnitId: SchoolReviewUnitId;
    schoolReviewUnitName: string;
    facultyName: string;
    className: string;
    contactPhone: string;
  }) => void;
  initialCategory?: WhiteBirdCategory;
  initialUserName?: string;
  initialUserEmail?: string;
  initialStudentId?: string;
  initialUniversity?: string;
  initialInstitutionId?: string;
  initialFaculty?: string;
  initialClassName?: string;
  initialPhone?: string;
  academicYear?: string;
}

const CATEGORY_CARDS: Array<{
  code: WhiteBirdCategory;
  badge: string;
  icon: React.ReactNode;
}> = [
  {
    code: 'UOM_MAM',
    badge: 'Cá nhân hoặc Tập thể',
    icon: <Sparkles size={16} className="text-[#0D78AE]" />,
  },
  {
    code: 'TRUYEN_LUA',
    badge: 'Chỉ dành cho Cá nhân',
    icon: <Flame size={16} className="text-[#D97706]" />,
  },
  {
    code: 'SANG_TAO',
    badge: 'Cá nhân hoặc Tập thể',
    icon: <Lightbulb size={16} className="text-[#0284C7]" />,
  },
];

export const CreateWhiteBirdModal: React.FC<CreateWhiteBirdModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCategory,
  initialUserName = 'Sinh viên ĐHĐN',
  initialUserEmail = '',
  initialStudentId = '',
  initialUniversity = '',
  initialInstitutionId = '',
  initialFaculty = '',
  initialClassName = '',
  initialPhone = '',
  academicYear = '2025–2026',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const defaultResolvedUnit = useMemo(() => {
    if (initialInstitutionId) {
      const matched = AUTHORITATIVE_SCHOOL_REVIEW_UNITS.find((u) =>
        u.memberInstitutionIds.includes(initialInstitutionId)
      );
      if (matched) return matched;
    }
    if (initialUniversity) {
      const resolved = resolveInstitutionFromUniversity(initialUniversity);
      const matched = AUTHORITATIVE_SCHOOL_REVIEW_UNITS.find(
        (u) =>
          u.id === resolved.schoolReviewUnitId ||
          u.memberInstitutionIds.includes(resolved.institutionId)
      );
      if (matched) return matched;
    }
    return AUTHORITATIVE_SCHOOL_REVIEW_UNITS[0];
  }, [initialInstitutionId, initialUniversity]);

  const [category, setCategory] = useState<WhiteBirdCategory | null>(initialCategory || null);
  const [categoryError, setCategoryError] = useState<string>('');
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [nomineeType, setNomineeType] = useState<WhiteBirdNomineeType>('INDIVIDUAL');
  const [selectedUnitId, setSelectedUnitId] = useState<SchoolReviewUnitId>(
    defaultResolvedUnit.id
  );
  const [nomineeName, setNomineeName] = useState<string>(initialUserName);
  const [nominationTitle, setNominationTitle] = useState<string>('');
  const [facultyName, setFacultyName] = useState<string>(initialFaculty || '');
  const [className, setClassName] = useState<string>(initialClassName || '');
  const [contactPhone, setContactPhone] = useState<string>(initialPhone || '');

  // Inline error states
  const [titleError, setTitleError] = useState<string>('');
  const [nomineeError, setNomineeError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Prevent background page scroll & handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset or initialize state when opening
  useEffect(() => {
    if (!isOpen) return;
    setCategory(initialCategory || null);
    setCategoryError('');
    setIsDossierOpen(false);
    setIsSubmitting(false);

    if (initialCategory === 'TRUYEN_LUA') {
      setNomineeType('INDIVIDUAL');
    } else {
      setNomineeType('INDIVIDUAL');
    }

    setSelectedUnitId(defaultResolvedUnit.id);
    setNomineeName(initialUserName || '');
    setNominationTitle('');
    setFacultyName(initialFaculty || '');
    setClassName(initialClassName || '');
    setContactPhone(initialPhone || '');

    setTitleError('');
    setNomineeError('');
    setPhoneError('');
  }, [
    isOpen,
    initialCategory,
    defaultResolvedUnit.id,
    initialUserName,
    initialFaculty,
    initialClassName,
    initialPhone,
  ]);

  const handleSelectCategory = (nextCat: WhiteBirdCategory) => {
    setCategory(nextCat);
    setCategoryError('');
    setIsDossierOpen(false);

    if (nextCat === 'TRUYEN_LUA') {
      setNomineeType('INDIVIDUAL');
      if (nomineeName.startsWith('Nhóm') || nomineeName.startsWith('Tập thể')) {
        setNomineeName(initialUserName || '');
      }
    }
  };

  const handleSelectNomineeType = (nextType: WhiteBirdNomineeType) => {
    if (category === 'TRUYEN_LUA' && nextType === 'COLLECTIVE') return;
    setNomineeType(nextType);
    if (nextType === 'INDIVIDUAL') {
      setNomineeName(initialUserName || '');
    } else if (nomineeName === initialUserName || !nomineeName.trim()) {
      setNomineeName(
        initialClassName
          ? `Tập thể Chi hội ${initialClassName}`
          : 'Nhóm sinh viên nghiên cứu / sáng kiến'
      );
    }
  };

  const selectedUnit = useMemo(() => {
    return (
      AUTHORITATIVE_SCHOOL_REVIEW_UNITS.find((u) => u.id === selectedUnitId) ||
      defaultResolvedUnit
    );
  }, [selectedUnitId, defaultResolvedUnit]);

  if (!isOpen) return null;

  const categoryMeta = category ? WHITE_BIRD_CATEGORIES[category] : null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let hasError = false;

    if (!category) {
      setCategoryError('Vui lòng chọn 1 trong 3 hạng mục Giải thưởng để tiếp tục.');
      hasError = true;
    }

    if (!nominationTitle.trim()) {
      setTitleError('Vui lòng nhập tên đề cử / mô hình / dự án / đề tài.');
      hasError = true;
    }

    if (!nomineeName.trim()) {
      setNomineeError('Vui lòng nhập tên cá nhân hoặc tập thể được đề cử.');
      hasError = true;
    }

    if (!contactPhone.trim()) {
      setPhoneError('Vui lòng nhập số điện thoại liên hệ.');
      hasError = true;
    }

    if (hasError || !category) {
      return;
    }

    setIsSubmitting(true);
    const instId = selectedUnit.memberInstitutionIds[0] || 'inst-dut';

    try {
      onSubmit({
        nominationTitle: nominationTitle.trim(),
        category,
        nomineeType: category === 'TRUYEN_LUA' ? 'INDIVIDUAL' : nomineeType,
        nomineeName: nomineeName.trim() || initialUserName,
        studentId: initialStudentId || 'SV-UDN',
        institutionId: instId,
        institutionName: selectedUnit.officialName,
        schoolReviewUnitId: selectedUnit.id,
        schoolReviewUnitName: selectedUnit.officialName,
        facultyName: facultyName.trim() || 'Khoa / Đơn vị trực thuộc',
        className: className.trim() || 'Chi hội Sinh viên',
        contactPhone: contactPhone.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const titlePlaceholder =
    category === 'UOM_MAM'
      ? 'VD: Mô hình Số hóa Sổ tay Sinh viên 5 tốt & Ngân hàng Minh chứng'
      : category === 'TRUYEN_LUA'
      ? `VD: Hồ sơ đề cử Cánh chim truyền lửa — ${initialUserName || 'Cán bộ Hội tiêu biểu'}`
      : category === 'SANG_TAO'
      ? 'VD: Dự án Khởi nghiệp Hệ thống IoT Cảnh báo ngập lụt đô thị thông minh'
      : 'VD: Nhập tên mô hình, giải pháp, dự án hoặc đề tài đề cử...';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 backdrop-blur-[2px] p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-white-bird-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-[16px] border border-[#DCE7EE] shadow-2xl w-full max-w-[720px] max-h-[90dvh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b border-[#E2EEF6] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#EBF6FC] text-[#0D78AE] flex items-center justify-center shrink-0">
              <Feather size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="create-white-bird-modal-title"
                  className="text-[17px] font-bold text-[#172A3A]"
                >
                  Khởi tạo hồ sơ Cánh chim trắng
                </h2>
                <span className="text-[11px] font-medium text-[#0D78AE] bg-[#EBF6FC] px-2 py-0.5 rounded-full border border-[#D0E6F5]">
                  QĐ 14-QĐ/ĐHĐN-HSV
                </span>
              </div>
              <p className="text-[12px] text-[#607483] mt-0.5">
                Năm học {academicYear} · Tạo hồ sơ đề cử
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#607483] hover:text-[#172A3A] hover:bg-[#F1F5F9] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng hộp thoại"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* 1. Selection Cards */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-bold text-[#172A3A]">
                  Chọn hạng mục Giải thưởng <span className="text-red-500">*</span>
                </label>
                {categoryError && (
                  <span className="text-[11.5px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    {categoryError}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CATEGORY_CARDS.map((card) => {
                  const meta = WHITE_BIRD_CATEGORIES[card.code];
                  const isSelected = category === card.code;
                  return (
                    <button
                      key={card.code}
                      type="button"
                      onClick={() => handleSelectCategory(card.code)}
                      className={`text-left p-3.5 rounded-[12px] border transition-all cursor-pointer flex flex-col justify-between relative ${
                        isSelected
                          ? 'bg-[#F0F7FC] border-[#0D78AE] ring-2 ring-[#0D78AE]/20 shadow-xs'
                          : categoryError
                          ? 'bg-white border-red-300 hover:border-red-400 hover:bg-[#FEF2F2]'
                          : 'bg-white border-[#DCE7EE] hover:border-[#B5CEDF] hover:bg-[#F9FCFE]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#0D78AE] text-white'
                                : 'bg-[#F1F5F9] text-[#475569]'
                            }`}
                          >
                            {card.icon}
                          </span>
                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0D78AE] bg-[#E0F2FE] px-2 py-0.5 rounded-full">
                              <Check size={12} strokeWidth={2.6} />
                              <span>Đã chọn</span>
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[13.5px] font-bold text-[#172A3A] leading-tight">
                          {meta.shortName}
                        </div>
                        <div className="text-[11.5px] font-medium text-[#64748B] mt-1">
                          {card.badge}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Dossier Requirements Disclosure Link */}
            {categoryMeta && (
              <div className="rounded-[10px] bg-[#F8FAFC] border border-[#E2EEF6] overflow-hidden text-[12px]">
                <button
                  type="button"
                  onClick={() => setIsDossierOpen(!isDossierOpen)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-[#0D78AE] hover:bg-[#F1F7FB] transition-colors cursor-pointer text-[12px] font-semibold"
                >
                  <span className="flex items-center gap-1.5">
                    <Info size={14} className="shrink-0" />
                    <span>Xem thành phần hồ sơ cần chuẩn bị theo Điều 6</span>
                  </span>
                  {isDossierOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {isDossierOpen && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-[#EDF2F7] space-y-1.5 text-[11.5px] text-[#475569] animate-in fade-in duration-100">
                    <div className="font-semibold text-[#1E293B] mb-1">
                      Hồ sơ đề nghị xét trao ({categoryMeta.dossierArticleRef}):
                    </div>
                    {categoryMeta.dossierItems.map((item) => (
                      <div key={item.code} className="flex items-start gap-1.5 leading-snug">
                        <span className="font-bold text-[#0D78AE] shrink-0">{item.code}:</span>
                        <div>
                          <span>{item.title}</span>{' '}
                          {item.isOptional ? (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                              Nếu có
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#E0F2FE] text-[#0369A1]">
                              Bắt buộc
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Progressive Disclosure Form */}
            {!category ? (
              <div className="p-6 rounded-[12px] bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-[#EBF6FC] text-[#0D78AE] mx-auto flex items-center justify-center">
                  <Feather size={18} />
                </div>
                <p className="text-[13px] font-semibold text-[#1E293B]">
                  Chọn một hạng mục ở trên để bắt đầu tạo hồ sơ.
                </p>
                <p className="text-[12px] text-[#64748B]">
                  Hệ thống sẽ hiển thị các trường khai báo phù hợp theo hạng mục đã chọn.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                {/* Student Preparer Banner */}
                <div className="p-3 rounded-[9px] bg-[#F4F9FD] border border-[#D4E7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[12px] text-[#2B4255]">
                  <div>
                    <span className="font-bold text-[#0D5C8C]">Sinh viên lập hồ sơ đề cử:</span>{' '}
                    <span className="font-semibold text-[#172A3A]">{initialUserName}</span>
                    {initialStudentId ? ` · MSSV ${initialStudentId}` : ''}
                    {initialUserEmail ? ` · ${initialUserEmail}` : ''}
                  </div>
                  <span className="text-[11px] font-medium text-[#64748B] shrink-0">
                    Bản nháp sinh viên khởi tạo
                  </span>
                </div>

                {/* Row 1: Nominee Type & Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12.5px] font-bold text-[#172A3A] mb-1.5">
                      Đối tượng xét trao <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectNomineeType('INDIVIDUAL')}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-[9px] border text-[12.5px] font-bold transition-colors cursor-pointer ${
                          nomineeType === 'INDIVIDUAL'
                            ? 'bg-[#E5F5FC] border-[#0D78AE] text-[#0D78AE]'
                            : 'bg-white border-[#DCE7EE] text-[#55697B] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <User size={15} />
                        <span>Cá nhân</span>
                      </button>
                      <button
                        type="button"
                        disabled={category === 'TRUYEN_LUA'}
                        onClick={() => handleSelectNomineeType('COLLECTIVE')}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-[9px] border text-[12.5px] font-bold transition-colors ${
                          category === 'TRUYEN_LUA'
                            ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                            : nomineeType === 'COLLECTIVE'
                            ? 'bg-[#E5F5FC] border-[#0D78AE] text-[#0D78AE] cursor-pointer'
                            : 'bg-white border-[#DCE7EE] text-[#55697B] hover:bg-[#F8FAFC] cursor-pointer'
                        }`}
                      >
                        <Users size={15} />
                        <span>Tập thể / Nhóm</span>
                      </button>
                    </div>
                    {category === 'TRUYEN_LUA' && (
                      <p className="text-[11px] text-[#D97706] mt-1 font-medium">
                        * Hạng mục “Cánh chim truyền lửa” chỉ xét trao cho Cá nhân theo Điều 3.
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="wb-unit-select"
                      className="block text-[12.5px] font-bold text-[#172A3A] mb-1.5"
                    >
                      Trường thành viên / Đơn vị trực thuộc ĐHĐN <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2
                        size={15}
                        className="w-4 h-4 text-[#607483] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      />
                      <select
                        id="wb-unit-select"
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(e.target.value as SchoolReviewUnitId)}
                        className="w-full pl-9 pr-3 py-2.5 text-[13px] font-semibold text-[#172A3A] bg-white border border-[#C8D9E6] rounded-[9px] focus:outline-none focus:border-[#0D78AE]"
                      >
                        {AUTHORITATIVE_SCHOOL_REVIEW_UNITS.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.officialName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 2: Nomination Title */}
                <div>
                  <Input
                    label={
                      category === 'UOM_MAM'
                        ? 'Tên mô hình, giải pháp, sáng kiến *'
                        : category === 'TRUYEN_LUA'
                        ? 'Tiêu đề hồ sơ đề cử *'
                        : 'Tên dự án khởi nghiệp đổi mới sáng tạo / Đề tài NCKH *'
                    }
                    value={nominationTitle}
                    onChange={(e) => {
                      setNominationTitle(e.target.value);
                      if (titleError) setTitleError('');
                    }}
                    placeholder={titlePlaceholder}
                    error={titleError}
                  />
                </div>

                {/* Row 3: Nominee Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <Input
                      label={
                        nomineeType === 'INDIVIDUAL'
                          ? 'Họ và tên cá nhân được đề cử *'
                          : 'Tên tập thể / Nhóm tác giả *'
                      }
                      value={nomineeName}
                      onChange={(e) => {
                        setNomineeName(e.target.value);
                        if (nomineeError) setNomineeError('');
                      }}
                      placeholder={
                        nomineeType === 'INDIVIDUAL'
                          ? initialUserName
                          : 'VD: Nhóm sinh viên nghiên cứu SmartFlood'
                      }
                      error={nomineeError}
                    />
                    {nomineeType === 'COLLECTIVE' && (
                      <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                        Người đại diện / chịu trách nhiệm chính: <strong>{initialUserName}</strong>
                        {initialStudentId ? ` (${initialStudentId})` : ''}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Số điện thoại liên hệ *"
                      value={contactPhone}
                      onChange={(e) => {
                        setContactPhone(e.target.value);
                        if (phoneError) setPhoneError('');
                      }}
                      placeholder="VD: 0905123456"
                      error={phoneError}
                    />
                  </div>
                </div>

                {/* Row 4: Faculty & Class */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <Input
                    label="Khoa / Ban chuyên môn / Liên chi hội"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    placeholder="VD: Khoa Công nghệ Thông tin"
                  />
                  <Input
                    label="Lớp sinh hoạt / Chi hội"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="VD: Chi hội Sinh viên"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-3.5 bg-[#F8FBFD] border-t border-[#E2EEF6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <span className="text-[12px] text-[#607483]">
              Bạn có thể tiếp tục kê khai và bổ sung minh chứng sau khi tạo hồ sơ.
            </span>
            <div className="flex items-center gap-2.5 sm:ml-auto">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo hồ sơ'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
