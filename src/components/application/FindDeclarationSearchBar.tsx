import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { CRITERIA, CriterionDefinition } from '../../tokens';
import { CRITERIA_DEFINITIONS } from '../../demo/fixtures/criteriaDefinitions';

export interface DeclarationSearchItem {
  id: string;
  criterionId: CriterionDefinition['id'];
  requirementId: string;
  code: string;
  title: string;
  groupTitle: string;
  explanation: string;
  keywords: string[];
  exampleLabel?: string;
}

/**
 * Normalizes Vietnamese string: removes accents, lowers case, trims extra spaces
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Authoritative Index of all declaration pathways across the 5 Criteria for Season 2025–2026
 */
export const DECLARATION_CATALOG_INDEX: DeclarationSearchItem[] = [
  // =================== TIÊU CHÍ 1: ĐẠO ĐỨC TỐT ===================
  {
    id: 'search-eth-score',
    criterionId: 'ethics',
    requirementId: 'ethics-score',
    code: 'TC1.1',
    title: 'Điểm rèn luyện cả năm học',
    groupTitle: 'Yêu cầu điểm rèn luyện & Chuẩn mực',
    explanation: 'Điểm rèn luyện từ 80/100 điểm trở lên hoặc xếp loại Giỏi (đơn vị đặc thù)',
    keywords: ['diem ren luyen', 'drl', 'ren luyen', 'xep loai ren luyen', 'loai gioi', 'xuat sac', 'bang diem ren luyen', 'diem 80', 'diem', 'dao duc'],
    exampleLabel: 'Ví dụ: 85/100 điểm hoặc Xếp loại Giỏi',
  },
  {
    id: 'search-eth-law',
    criterionId: 'ethics',
    requirementId: 'ethics-law',
    code: 'TC1.2',
    title: 'Không vi phạm pháp luật, quy chế, nội quy',
    groupTitle: 'Yêu cầu điểm rèn luyện & Chuẩn mực',
    explanation: 'Xác nhận chấp hành tốt pháp luật, nội quy nhà trường và địa phương',
    keywords: ['chap hanh phap luat', 'khong vi pham', 'noi quy', 'quy che', 'ky luat', 'hanh kiem', 'cam ket khong vi pham', 'cu tru', 'dia phuong'],
    exampleLabel: 'Ví dụ: Bản xác nhận đạo đức từ Ban cán sự lớp & Khoa',
  },
  {
    id: 'search-eth-party',
    criterionId: 'ethics',
    requirementId: 'ethics-party',
    code: 'TC1.3',
    title: 'Là Đảng viên Đảng Cộng sản Việt Nam',
    groupTitle: 'Tiêu chuẩn bổ sung (Đạo đức)',
    explanation: 'Đảng viên chính thức hoặc Đảng viên dự bị',
    keywords: ['dang vien', 'ket nap dang', 'the dang', 'dang cong san', 'chi bo', 'dang bo', 'du bi', 'chinh thuc', 'dang'],
    exampleLabel: 'Ví dụ: Quyết định kết nạp Đảng / Thẻ Đảng viên',
  },
  {
    id: 'search-eth-pol-team',
    criterionId: 'ethics',
    requirementId: 'ethics-politics-team',
    code: 'TC1.4',
    title: 'Thành viên đội thi tìm hiểu chủ nghĩa Mác–Lênin, tư tưởng Hồ Chí Minh',
    groupTitle: 'Tiêu chuẩn bổ sung (Đạo đức)',
    explanation: 'Thành viên chính thức đội thi từ cấp chi đoàn trở lên (không yêu cầu đạt giải)',
    keywords: ['doi thi mac lenin', 'mac-lenin', 'mac lenin', 'tu tuong ho chi minh', 'anh sang soi duong', 'chinh tri', 'ly luan', 'tu tuong', 'doi tuyen ly luan', 'chi doan'],
    exampleLabel: 'Ví dụ: Thành viên đội thi Ánh sáng soi đường cấp Thành phố',
  },
  {
    id: 'search-eth-pol-paper',
    criterionId: 'ethics',
    requirementId: 'ethics-politics-paper',
    code: 'TC1.5',
    title: 'Tham luận / bài viết tại diễn đàn học thuật về chủ nghĩa Mác–Lênin, tư tưởng HCM',
    groupTitle: 'Tiêu chuẩn bổ sung (Đạo đức)',
    explanation: 'Có bài viết hoặc tham luận được trình bày tại diễn đàn học thuật chính trị',
    keywords: ['tham luan mac lenin', 'bai viet mac lenin', 'dien dan hoc thuat', 'toa dam chinh tri', 'tu tuong hcm', 'ky yeu chinh tri', 'bai bao mac lenin'],
    exampleLabel: 'Ví dụ: Tham luận tại Tọa đàm Khoa học Đảng ủy Trường',
  },
  {
    id: 'search-eth-commend',
    criterionId: 'ethics',
    requirementId: 'ethics-commendation',
    code: 'TC1.6',
    title: 'Thanh niên tiêu biểu, gương người tốt việc tốt, dũng cảm cứu người',
    groupTitle: 'Tiêu chuẩn bổ sung (Đạo đức)',
    explanation: 'Thanh niên tiêu biểu, gương người tốt việc tốt, dũng cảm cứu người được biểu dương',
    keywords: ['thanh nien tieu bieu', 'thanh nien tien tien', 'guong nguoi tot viec tot', 'dung cam cuu nguoi', 'khen thuong dao duc', 'bieu duong', 'giay khen dao duc', 'nguoi tot viec tot'],
    exampleLabel: 'Ví dụ: Tuyên dương Gương người tốt việc tốt cấp Trường',
  },

  // =================== TIÊU CHÍ 2: HỌC TẬP TỐT ===================
  {
    id: 'search-aca-gpa',
    criterionId: 'academic',
    requirementId: 'academic-gpa',
    code: 'TC2.1',
    title: 'Điểm trung bình học tập cả năm học (GPA)',
    groupTitle: 'Kết quả học tập năm học',
    explanation: 'Đại học: GPA >= 3.2/4 hoặc >= 8.0/10; Cao đẳng: GPA >= 3.0/4 hoặc >= 7.5/10',
    keywords: ['gpa', 'diem trung binh', 'diem hoc tap', 'bang diem', 'hoc luc', 'tin chi', 'nien che', 'diem nam hoc', '3.2', '8.0', '3.0', '7.5', 'hoc tap'],
    exampleLabel: 'Ví dụ: GPA cả năm 3.45 / 4.00 (hệ tín chỉ)',
  },
  {
    id: 'search-aca-nckh',
    criterionId: 'academic',
    requirementId: 'academic-nckh',
    code: 'TC2.2',
    title: 'Đề tài nghiên cứu khoa học sinh viên đạt giải cấp khoa trở lên',
    groupTitle: 'Thành tích học thuật & NCKH',
    explanation: 'Đề tài NCKH sinh viên đạt giải từ cấp khoa trở lên (bắt buộc có giải)',
    keywords: ['de tai nckh', 'nghien cuu khoa hoc', 'de tai', 'nckh', 'giai nckh', 'nghiem thu', 'sinh vien nghien cuu', 'hoi nghi nckh', 'giai nhat nckh', 'giai nhi nckh'],
    exampleLabel: 'Ví dụ: Giải Nhì Hội nghị Sinh viên Nghiên cứu khoa học',
  },
  {
    id: 'search-aca-paper',
    criterionId: 'academic',
    requirementId: 'academic-paper',
    code: 'TC2.3',
    title: 'Bài viết đăng trên tạp chí chuyên ngành',
    groupTitle: 'Thành tích học thuật & NCKH',
    explanation: 'Bài viết được đăng trên tạp chí chuyên ngành (không yêu cầu giải thưởng)',
    keywords: ['bai viet tap chi', 'bai bao khoa hoc', 'tap chi chuyen nganh', 'bai bao', 'issn', 'scopus', 'cong bo khoa hoc', 'paper', 'journal'],
    exampleLabel: 'Ví dụ: Bài báo đăng trên Tạp chí Khoa học & Công nghệ có chỉ số ISSN',
  },
  {
    id: 'search-aca-pres',
    criterionId: 'academic',
    requirementId: 'academic-presentation',
    code: 'TC2.4',
    title: 'Bài tham luận tham gia hội thảo khoa học từ cấp khoa trở lên',
    groupTitle: 'Thành tích học thuật & NCKH',
    explanation: 'Tham luận khoa học trình bày tại hội thảo hoặc đăng kỷ yếu (không yêu cầu giải thưởng)',
    keywords: ['tham luan hoi thao', 'hoi thao khoa hoc', 'ky yeu hoi thao', 'bao cao hoi thao', 'isbn', 'hoi nghi khoa hoc', 'tham luan'],
    exampleLabel: 'Ví dụ: Tham luận tại Hội thảo Khoa học Quốc gia có ISBN',
  },
  {
    id: 'search-aca-prod',
    criterionId: 'academic',
    requirementId: 'academic-product',
    code: 'TC2.5',
    title: 'Sản phẩm sáng tạo được cấp bằng sáng chế, giấy phép xuất bản, hoặc giải thưởng cấp trường',
    groupTitle: 'Thành tích học thuật & NCKH',
    explanation: 'Sản phẩm sáng tạo có bằng độc quyền sáng chế, giấy phép xuất bản hoặc giải thưởng cấp trường trở lên',
    keywords: ['san pham sang tao', 'sang che', 'bang sang che', 'giay phep xuat ban', 'giai phap ky thuat', 'phan mem sang tao', 'bang doc quyen', 'sang kien'],
    exampleLabel: 'Ví dụ: Bằng độc quyền sáng chế hoặc Giấy phép xuất bản phần mềm',
  },
  {
    id: 'search-aca-team',
    criterionId: 'academic',
    requirementId: 'academic-team',
    code: 'TC2.6',
    title: 'Thành viên các đội tuyển tham gia kỳ thi học thuật cấp trường trở lên',
    groupTitle: 'Thành tích học thuật & NCKH',
    explanation: 'Thành viên chính thức đội tuyển thi học thuật cấp trường trở lên (không yêu cầu đạt giải)',
    keywords: ['doi tuyen hoc thuat', 'ky thi hoc thuat', 'olympic', 'doi tuyen', 'thanh vien doi tuyen', 'thi hoc thuat', 'thi chuyen mon'],
    exampleLabel: 'Ví dụ: Đội tuyển Olympic Tin học Sinh viên Trường ĐH Bách khoa',
  },
  {
    id: 'search-aca-innov',
    criterionId: 'academic',
    requirementId: 'academic-innovation',
    code: 'TC2.7',
    title: 'Giải thưởng cuộc thi ý tưởng sáng tạo từ cấp trường trở lên',
    groupTitle: 'Thành tích học thuật & NCKH',
    explanation: 'Đạt giải thưởng cuộc thi ý tưởng sáng tạo, khởi nghiệp từ cấp trường trở lên',
    keywords: ['y tuong sang tao', 'khoi nghiep', 'cuoc thi sang tao', 'hackathon', 'doi moi sang tao', 'giai thuong sang tao', 'startup'],
    exampleLabel: 'Ví dụ: Giải Nhất Cuộc thi Ý tưởng Khởi nghiệp Đổi mới sáng tạo',
  },

  // =================== TIÊU CHÍ 3: THỂ LỰC TỐT ===================
  {
    id: 'search-phy-khoe',
    criterionId: 'physical',
    requirementId: 'physical-khoe',
    code: 'TC3.1',
    title: 'Danh hiệu Thanh niên khỏe từ cấp trường trở lên (Sinh viên khỏe)',
    groupTitle: 'Hình thức xác nhận thể lực',
    explanation: 'Đạt danh hiệu "Thanh niên khỏe" hoặc "Sinh viên khỏe" cấp Trường trở lên',
    keywords: ['thanh nien khoe', 'sinh vien khoe', 'tieu chuan the luc', 'chung nhan the luc', 'giao duc the chat', 'the luc', 'chung nhan sinh vien khoe', 'gdtc'],
    exampleLabel: 'Ví dụ: Giấy chứng nhận Thanh niên khỏe (Sinh viên khỏe) cấp Trường',
  },
  {
    id: 'search-phy-sport',
    criterionId: 'physical',
    requirementId: 'physical-sport',
    code: 'TC3.2',
    title: 'Tham gia và đạt giải hoạt động thể thao phong trào từ cấp khoa trở lên',
    groupTitle: 'Hình thức xác nhận thể lực',
    explanation: 'Tham gia VÀ đạt giải tại giải đấu thể thao từ cấp khoa trở lên',
    keywords: ['giai the thao', 'thanh tich the thao', 'giai bong da', 'bong chuyen', 'cau long', 'boi loi', 'dien kinh', 'chay bo', 'huy chuong', 'giai nhat the thao', 'giai nhi the thao', 'giai ba the thao', 'hoi thao'],
    exampleLabel: 'Ví dụ: Huy chương Bạc Giải bóng chuyền sinh viên Đại học Đà Nẵng',
  },

  // =================== TIÊU CHÍ 4: TÌNH NGUYỆN TỐT ===================
  {
    id: 'search-vol-act',
    criterionId: 'volunteer',
    requirementId: 'volunteer-activities',
    code: 'TC4.1',
    title: 'Hoạt động tình nguyện tích lũy (Chiến dịch, Mùa hè xanh, Chủ nhật xanh, Mái ấm)',
    groupTitle: 'Hoạt động tình nguyện tích lũy',
    explanation: 'Tham gia tối thiểu 05 ngày tình nguyện trong năm học, tích lũy qua các hoạt động',
    keywords: ['tinh nguyen', 'hoat dong tinh nguyen', 'ngay tinh nguyen', 'mua he xanh', 'chu nhat xanh', 'tiep suc mua thi', 'xuan tinh nguyen', 'mai am', 'bao tro xa hoi', 'an sinh xa hoi'],
    exampleLabel: 'Ví dụ: 3 ngày Mùa hè xanh + 1 ngày Chủ nhật xanh',
  },
  {
    id: 'search-vol-blood',
    criterionId: 'volunteer',
    requirementId: 'volunteer-activities',
    code: 'TC4.1-HM',
    title: 'Hiến máu tình nguyện (Quy đổi 01 ngày tình nguyện tương đương)',
    groupTitle: 'Hoạt động tình nguyện tích lũy',
    explanation: 'Mỗi lần hiến máu tình nguyện quy đổi 01 ngày tương đương theo ví dụ quy chuẩn',
    keywords: ['hien mau', 'hien mau tinh nguyen', 'hien mau nhan dao', 'chung nhan hien mau', 'giot hong', 'hien mau cuu nguoi', 'chung nhan mau'],
    exampleLabel: 'Ví dụ: Giấy chứng nhận hiến máu tình nguyện đợt 1 (quy đổi 1 ngày)',
  },
  {
    id: 'search-vol-award',
    criterionId: 'volunteer',
    requirementId: 'volunteer-award',
    code: 'TC4.2',
    title: 'Khen thưởng hoạt động tình nguyện từ cấp khoa trở lên',
    groupTitle: 'Khen thưởng hoạt động tình nguyện',
    explanation: 'Được khen thưởng về hoạt động tình nguyện từ cấp khoa trở lên trong năm học',
    keywords: ['khen thuong tinh nguyen', 'giay khen tinh nguyen', 'bang khen tinh nguyen', 'thanh tich tinh nguyen', 'khen thuong mua he xanh'],
    exampleLabel: 'Ví dụ: Giấy khen Thành tích xuất sắc Chiến dịch Mùa hè xanh',
  },

  // =================== TIÊU CHÍ 5: HỘI NHẬP TỐT ===================
  {
    id: 'search-int-skills',
    criterionId: 'integration',
    requirementId: 'integration-skills',
    code: 'TC5.1',
    title: 'Hoàn thành khóa trang bị kỹ năng thực hành xã hội',
    groupTitle: 'Nhóm A: Kỹ năng hoặc Đoàn - Hội',
    explanation: 'Hoàn thành ít nhất một khóa tập huấn kỹ năng thực hành xã hội (không yêu cầu giải thưởng)',
    keywords: ['khoa ky nang', 'ky nang thuc hanh xa hoi', 'ky nang mem', 'tap huan ky nang', 'chung nhan ky nang', 'ky nang giao tiep', 'ky nang lanh dao'],
    exampleLabel: 'Ví dụ: Giấy chứng nhận Khóa tập huấn Kỹ năng thực hành xã hội',
  },
  {
    id: 'search-int-union',
    criterionId: 'integration',
    requirementId: 'integration-union-award',
    code: 'TC5.2',
    title: 'Khen thưởng công tác Đoàn - Hội từ cấp khoa trở lên',
    groupTitle: 'Nhóm A: Kỹ năng hoặc Đoàn - Hội',
    explanation: 'Khen thưởng thành tích xuất sắc trong công tác Đoàn/Hội từ cấp khoa trở lên trong năm học',
    keywords: ['khen thuong doan hoi', 'bang khen hoi sinh vien', 'giay khen doan truong', 'cong tac doan', 'phong trao sinh vien', 'cong tac hoi', 'can bo doan xuat sac'],
    exampleLabel: 'Ví dụ: Giấy khen Thành tích xuất sắc công tác Hội cấp Trường',
  },
  {
    id: 'search-int-lang',
    criterionId: 'integration',
    requirementId: 'integration-lang',
    code: 'TC5.3',
    title: 'Chuẩn năng lực ngoại ngữ (IELTS, TOEIC, TOEFL, B1, Điểm học phần, Ngoại ngữ 2)',
    groupTitle: 'Nhóm B: Ngoại ngữ & Hội nhập',
    explanation: 'IELTS >= 4.5, TOEIC >= 405, TOEFL >= 53, C/B1; hoặc ĐTB học phần >= 3.0/4 hoặc 7.5/10; Ngoại ngữ 2 cho SV chuyên ngành',
    keywords: ['ielts', 'toeic', 'toefl', 'b1', 'tieng anh', 'chung chi ngoai ngu', 'ngoai ngu', 'ngoai ngu 2', 'chuyen nganh ngoai ngu', 'diem hoc phan ngoai ngu', 'diem tieng anh', '405', '4.5', '53', 'tieng phap', 'tieng trung', 'tieng nhat', 'tieng han'],
    exampleLabel: 'Ví dụ: IELTS 6.5 (hoặc TOEIC 650, hoặc ĐTB học phần ngoại ngữ 3.2/4)',
  },
  {
    id: 'search-int-intl',
    criterionId: 'integration',
    requirementId: 'integration-intl',
    code: 'TC5.4',
    title: 'Tham gia hoạt động giao lưu, hợp tác quốc tế từ cấp khoa trở lên',
    groupTitle: 'Nhóm B: Ngoại ngữ & Hội nhập',
    explanation: 'Hội nghị, hội thảo quốc tế, giao lưu thanh niên sinh viên quốc tế từ cấp khoa trở lên (không yêu cầu giải thưởng)',
    keywords: ['giao luu quoc te', 'hoi thao quoc te', 'hoi nghi quoc te', 'dien dan thanh nien', 'trao doi sinh vien', 'asean', 'hop tac quoc te', 'quoc te'],
    exampleLabel: 'Ví dụ: Đại biểu Diễn đàn Thanh niên ASEAN - Đà Nẵng 2026',
  },
  {
    id: 'search-int-contest',
    criterionId: 'integration',
    requirementId: 'integration-contest',
    code: 'TC5.5',
    title: 'Cuộc thi kiến thức hoặc sử dụng ngoại ngữ từ cấp khoa trở lên (Giải Ba trở lên)',
    groupTitle: 'Nhóm B: Ngoại ngữ & Hội nhập',
    explanation: 'Tham gia VÀ đạt giải Ba trở lên tại cuộc thi ngoại ngữ hoặc kiến thức từ cấp khoa trở lên',
    keywords: ['cuoc thi ngoai ngu', 'hung bien tieng anh', 'olympic tieng anh', 'giai ba tieng anh', 'cuoc thi kien thuc', 'mun', 'tieng anh sinh vien'],
    exampleLabel: 'Ví dụ: Giải Ba Hội thi Hùng biện tiếng Anh sinh viên Đà Nẵng',
  },
];

export interface FindDeclarationSearchBarProps {
  onSelectRequirement: (criterionId: CriterionDefinition['id'], requirementId: string) => void;
  className?: string;
}

export const FindDeclarationSearchBar: React.FC<FindDeclarationSearchBarProps> = ({
  onSelectRequirement,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const normQuery = normalizeVietnamese(searchTerm);
    const queryTokens = normQuery.split(/\s+/).filter(Boolean);

    return DECLARATION_CATALOG_INDEX.filter((item) => {
      const normTitle = normalizeVietnamese(item.title);
      const normCode = normalizeVietnamese(item.code);
      const normGroup = normalizeVietnamese(item.groupTitle);
      const normExpl = normalizeVietnamese(item.explanation);
      const normKeywords = item.keywords.map(normalizeVietnamese);

      // Exact substring match
      if (normTitle.includes(normQuery) || normCode.includes(normQuery)) return true;

      // Check keywords
      if (normKeywords.some((k) => k.includes(normQuery) || normQuery.includes(k))) return true;

      // Token match
      return queryTokens.every(
        (token) =>
          normTitle.includes(token) ||
          normGroup.includes(token) ||
          normExpl.includes(token) ||
          normKeywords.some((k) => k.includes(token))
      );
    });
  }, [searchTerm]);

  const handleSelect = (item: DeclarationSearchItem) => {
    onSelectRequirement(item.criterionId, item.requirementId);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-[#18A6E0] pointer-events-none flex items-center">
          <Search size={16} strokeWidth={2.4} />
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm nội dung kê khai (ví dụ: IELTS, Hiến máu, Đề tài NCKH, Thanh niên khỏe, Đảng viên, Mùa hè xanh...)"
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#DCE7EE] focus:border-[#18A6E0] focus:ring-2 focus:ring-[#18A6E0]/20 rounded-[10px] text-[13px] text-[#172A3A] placeholder-[#728391] outline-hidden transition-all shadow-2xs font-medium"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute right-3 text-[#728391] hover:text-[#172A3A] p-0.5 rounded-full hover:bg-[#F3F8FC] cursor-pointer"
            title="Xóa tìm kiếm"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && searchTerm.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#DCE7EE] rounded-[12px] shadow-popover z-30 max-h-[380px] overflow-y-auto divide-y divide-[#E3EBF1]">
          {searchResults.length > 0 ? (
            <div>
              <div className="px-3.5 py-2 bg-[#F8FBFD] border-b border-[#E3EBF1] flex items-center justify-between text-[11.5px] text-[#607483] font-semibold">
                <span>Tìm thấy {searchResults.length} nội dung phù hợp</span>
                <span className="text-[#18A6E0]">Nhấn để mở form kê khai</span>
              </div>

              {searchResults.map((item) => {
                const criterionToken = CRITERIA[item.criterionId];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full px-3.5 py-2.5 text-left flex items-start gap-3 hover:bg-[#F4F9FD] transition-colors cursor-pointer group"
                  >
                    {/* Criterion Number Badge */}
                    <div
                      className="w-6 h-6 rounded-[6px] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5"
                      style={{
                        backgroundColor: criterionToken?.accentSoft || '#EAF6FC',
                        color: criterionToken?.accentColor || '#18A6E0',
                      }}
                    >
                      {criterionToken?.number || '·'}
                    </div>

                    {/* Content Details */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-[#607483]">
                          {item.code} · {criterionToken?.name}
                        </span>
                        <span className="text-[10.5px] px-1.5 py-0.2 rounded-[4px] bg-[#EAF6FC] text-[#126A9C] font-medium">
                          {item.groupTitle}
                        </span>
                      </div>

                      <span className="text-[13px] font-bold text-[#172A3A] group-hover:text-[#18A6E0] transition-colors mt-0.5 truncate">
                        {item.title}
                      </span>

                      <p className="text-[11.5px] text-[#607483] leading-relaxed line-clamp-1 mt-0.5">
                        {item.explanation}
                      </p>

                      {item.exampleLabel && (
                        <span className="text-[11px] text-[#0D78AE] font-medium mt-0.5">
                          {item.exampleLabel}
                        </span>
                      )}
                    </div>

                    {/* Action Arrow */}
                    <div className="shrink-0 flex items-center text-[#18A6E0] group-hover:translate-x-1 transition-transform self-center">
                      <ArrowRight size={15} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center flex flex-col items-center gap-1.5 text-[#607483]">
              <Sparkles size={20} className="text-[#18A6E0]" />
              <span className="text-[13px] font-semibold text-[#172A3A]">
                Không tìm thấy nội dung phù hợp với "{searchTerm}"
              </span>
              <p className="text-[12px] text-[#607483] max-w-md">
                Gợi ý: Thử tìm theo từ khóa như <i>IELTS, Hiến máu, Đề tài NCKH, Thanh niên khỏe, Đảng viên, Mùa hè xanh, Bằng khen</i>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
