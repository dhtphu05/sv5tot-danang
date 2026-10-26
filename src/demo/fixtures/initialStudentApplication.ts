import {
  StudentApplicationData,
} from '../../entities/application/studentApplicationTypes';
import { DEFAULT_CANONICAL_STUDENT_PROFILE } from './studentProfileFixtures';

export const INITIAL_STUDENT_APPLICATION: StudentApplicationData = {
  applicationId: 'APP-2026-DN-102220123',
  season: 'Năm học 2025–2026',
  status: 'Đang hoàn thiện',
  eligibilityStatus: 'Đã xác nhận điều kiện nộp hồ sơ',
  applicantProfileSnapshot: DEFAULT_CANONICAL_STUDENT_PROFILE,
  student: {
    fullName: 'Nguyễn Minh Anh',
    studentId: '102220123',
    university: 'Trường Đại học Bách khoa - Đại học Đà Nẵng',
    faculty: 'Khoa Công nghệ Thông tin',
    class: '22T_CLC1',
    email: 'minhanh.nguyen@dut.udn.vn',
  },
  criteria: [
    // =========================================================================
    // CRITERION 1: ĐẠO ĐỨC TỐT (Yêu cầu chính + Lựa chọn bổ sung)
    // =========================================================================
    {
      id: 'ethics',
      number: 1,
      name: 'Đạo đức tốt',
      shortSummary: '3 nội dung đã kê khai · 3 minh chứng',
      statusLabel: 'Đã kê khai',
      groups: [
        {
          id: 'ethics-foundation',
          criterionId: 'ethics',
          title: 'Yêu cầu chính',
          groupType: 'ALL_REQUIRED',
          ruleBadge: 'Yêu cầu bắt buộc',
          ruleHelper: 'Cần đạt chuẩn rèn luyện và không vi phạm quy chế',
          minApplicable: 2,
          requirements: [
            {
              id: 'ethics-score',
              code: 'TC1.1',
              criterionId: 'ethics',
              groupId: 'ethics-foundation',
              title: 'Điểm rèn luyện cả năm học',
              ruleBadge: 'Yêu cầu bắt buộc',
              ruleHelper: 'Từ 90 điểm trở lên (Loại Xuất sắc)',
              declarationMode: 'single',
              status: 'ready',
              declarations: [
                {
                  id: 'decl-drl',
                  value: '93 / 100 điểm',
                  detail: 'Loại Xuất sắc cả năm học (HK1: 92 điểm, HK2: 94 điểm)',
                  date: '15/07/2026',
                  metadata: {
                    hk1: '92',
                    hk2: '94',
                    rank: 'Xuất sắc',
                  },
                  evidenceFiles: [
                    {
                      id: 'ev-drl-1',
                      name: 'Bang_diem_ren_luyen_2026.pdf',
                      fileType: 'pdf',
                      size: '1.2 MB',
                      uploadedAt: '16/07/2026',
                      status: 'ready',
                    },
                  ],
                },
              ],
            },
            {
              id: 'ethics-law',
              code: 'TC1.2',
              criterionId: 'ethics',
              groupId: 'ethics-foundation',
              title: 'Chấp hành pháp luật và nội quy nhà trường',
              ruleBadge: 'Yêu cầu bắt buộc',
              ruleHelper: 'Không vi phạm pháp luật và quy chế sinh viên',
              declarationMode: 'single',
              status: 'ready',
              declarations: [
                {
                  id: 'decl-law',
                  value: 'Không vi phạm pháp luật & nội quy sinh viên',
                  detail: 'Xác nhận tư cách đạo đức tốt từ Ban cán sự lớp & Cố vấn học tập',
                  date: '20/07/2026',
                  evidenceFiles: [
                    {
                      id: 'ev-law-1',
                      name: 'Giay_xac_nhan_hanh_kiem.pdf',
                      fileType: 'pdf',
                      size: '890 KB',
                      uploadedAt: '22/07/2026',
                      status: 'ready',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'ethics-supplement',
          criterionId: 'ethics',
          title: 'Thành tích / Hoạt động phù hợp',
          groupType: 'AT_LEAST_N',
          ruleBadge: 'Cần ít nhất 1 nội dung',
          ruleHelper: 'Sinh viên có thể kê khai nhiều nội dung nếu có thành tích thực tế',
          minApplicable: 1,
          requirements: [
            {
              id: 'ethics-commendation',
              code: 'TC1.3',
              criterionId: 'ethics',
              groupId: 'ethics-supplement',
              title: 'Khen thưởng rèn luyện đạo đức / Gương người tốt việc tốt',
              ruleBadge: 'Tùy chọn phù hợp',
              ruleHelper: 'Nhận giấy khen của Đoàn - Hội từ cấp Trường trở lên',
              declarationMode: 'single',
              status: 'ready',
              declarations: [
                {
                  id: 'decl-ethics-award',
                  value: 'Giấy khen Bí thư Đoàn trường ĐH Bách khoa',
                  detail: 'Về thành tích xuất sắc trong công tác Đoàn và phong trào thanh niên trường ĐH Bách khoa',
                  date: '26/03/2026',
                  metadata: {
                    organizer: 'Đoàn trường ĐH Bách khoa',
                  },
                  evidenceFiles: [
                    {
                      id: 'ev-gk-1',
                      name: 'Giay_khen_Doan_truong.pdf',
                      fileType: 'pdf',
                      size: '2.4 MB',
                      uploadedAt: '28/03/2026',
                      status: 'ready',
                    },
                  ],
                },
                {
                  id: 'decl-ethics-award-2',
                  value: 'Danh hiệu Thanh niên tiên tiến làm theo lời Bác cấp Trường 2026',
                  detail: 'Tuyên dương điển hình học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh năm học 2025–2026',
                  date: '19/05/2026',
                  metadata: {
                    organizer: 'Đảng ủy & Đoàn trường ĐH Bách khoa',
                  },
                  evidenceFiles: [
                    {
                      id: 'ev-gk-2',
                      name: 'Chung_nhan_Thanh_nien_tien_tien_2026.pdf',
                      fileType: 'pdf',
                      size: '1.6 MB',
                      uploadedAt: '21/05/2026',
                      status: 'ready',
                    },
                  ],
                },
              ],
            },
            {
              id: 'ethics-party',
              code: 'TC1.4',
              criterionId: 'ethics',
              groupId: 'ethics-supplement',
              title: 'Bồi dưỡng nhận thức về Đảng / Đoàn viên ưu tú',
              ruleBadge: 'Tùy chọn phù hợp',
              ruleHelper: 'Đã hoàn thành lớp nhận thức về Đảng hoặc là Đoàn viên ưu tú',
              declarationMode: 'single',
              status: 'can_supplement',
              isOptionalEmpty: true,
              declarations: [],
            },
            {
              id: 'ethics-politics',
              code: 'TC1.5',
              criterionId: 'ethics',
              groupId: 'ethics-supplement',
              title: 'Cuộc thi tìm hiểu chính trị, tư tưởng, truyền thống',
              ruleBadge: 'Tùy chọn phù hợp',
              ruleHelper: 'Tham gia và đạt giải cuộc thi tìm hiểu Chủ nghĩa Mác - Lênin, Tư tưởng Hồ Chí Minh',
              declarationMode: 'single',
              status: 'can_supplement',
              isOptionalEmpty: true,
              declarations: [],
            },
          ],
        },
      ],
      requirements: [], // Populated automatically below
    },

    // =========================================================================
    // CRITERION 2: HỌC TẬP TỐT (Kết quả học tập + Thành tích học thuật)
    // Demonstrates multiple valid declarations declared in academic-achievements
    // =========================================================================
    {
      id: 'academic',
      number: 2,
      name: 'Học tập tốt',
      shortSummary: '3 nội dung đã kê khai · 5 minh chứng',
      statusLabel: 'Cần kiểm tra',
      groups: [
        {
          id: 'academic-foundation',
          criterionId: 'academic',
          title: 'Kết quả học tập',
          groupType: 'ALL_REQUIRED',
          ruleBadge: 'Yêu cầu bắt buộc',
          ruleHelper: 'GPA tích lũy cả năm học xét chọn',
          minApplicable: 1,
          requirements: [
            {
              id: 'academic-gpa',
              code: 'TC2.1',
              criterionId: 'academic',
              groupId: 'academic-foundation',
              title: 'Điểm trung bình năm học (GPA)',
              ruleBadge: 'Yêu cầu bắt buộc',
              ruleHelper: 'Từ 3.40/4.00 trở lên (hệ tín chỉ) hoặc 8.5/10 (hệ niên chế)',
              declarationMode: 'single',
              status: 'ready',
              declarations: [
                {
                  id: 'decl-gpa',
                  value: '3.45 / 4.00',
                  detail: 'Xếp loại Giỏi toàn khóa học 2026–2027, tổng số 42 tín chỉ',
                  date: '10/08/2026',
                  evidenceFiles: [
                    {
                      id: 'ev-gpa-1',
                      name: 'Bang_diem_2026_2027.pdf',
                      fileType: 'pdf',
                      size: '3.1 MB',
                      uploadedAt: '12/08/2026',
                      status: 'ready',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'academic-achievements',
          criterionId: 'academic',
          title: 'Thành tích học thuật & Nghiên cứu khoa học',
          groupType: 'AT_LEAST_N',
          ruleBadge: 'Cần ít nhất 1 nội dung',
          ruleHelper: 'Sinh viên có thể kê khai nhiều nội dung học thuật nếu có thành tích thực tế',
          minApplicable: 1,
          requirements: [
            {
              id: 'academic-nckh',
              code: 'TC2.2',
              criterionId: 'academic',
              groupId: 'academic-achievements',
              title: 'Nghiên cứu khoa học và sáng tạo sinh viên',
              ruleBadge: 'Tùy chọn phù hợp',
              ruleHelper: 'Đề tài NCKH nghiệm thu đạt loại Khá trở lên hoặc đạt giải thưởng NCKH các cấp',
              declarationMultiplicity: 'MULTIPLE',
              addActionLabel: 'Thêm thành tích nghiên cứu',
              allowMultipleEvidence: true,
              declarationMode: 'single',
              allowMultipleDeclarations: true,
              status: 'needs_verification',
              recommendation: {
                id: 'rec-academic',
                criterionId: 'academic',
                criterionName: 'Học tập tốt',
                message: 'Tài liệu quyết định khen thưởng có một thông tin được hệ thống nhận diện tự động. Bạn vui lòng kiểm tra lại.',
                suggestedActionLabel: 'Kiểm tra tài liệu',
              },
              declarations: [
                {
                  id: 'decl-nckh-1',
                  value: 'Giải Nhì Hội nghị Sinh viên Nghiên cứu khoa học 2026',
                  detail: 'Đề tài: Ứng dụng thị giác máy tính nhận diện văn bản tự động · Nghiệm thu Xuất sắc cấp Thành phố',
                  date: '20/05/2026',
                  evidenceFiles: [
                    {
                      id: 'ev-nckh-1',
                      name: 'Quyet_dinh_cong_nhan_thanh_tich_nghien_cuu_khoa_hoc_sinh_vien_cap_thanh_pho_2026.pdf',
                      fileType: 'pdf',
                      size: '1.8 MB',
                      uploadedAt: '22/05/2026',
                      status: 'needs_verification',
                      aiSuggestedInfo: {
                        achievementName: 'Giải Nhì Hội nghị Sinh viên Nghiên cứu khoa học 2026',
                        date: '20/05/2026',
                        issuingAuthority: 'Sở Khoa học & Công nghệ phối hợp Thành Đoàn Đà Nẵng',
                      },
                    },
                    {
                      id: 'ev-nckh-2',
                      name: 'Giay_chung_nhan_giai_nhi_NCKH_2026.pdf',
                      fileType: 'pdf',
                      size: '850 KB',
                      uploadedAt: '22/05/2026',
                      status: 'ready',
                    },
                  ],
                },
                {
                  id: 'decl-nckh-2',
                  value: 'Đề tài NCKH được công nhận cấp trường năm học 2025–2026',
                  detail: 'Đề tài: Nghiên cứu mô hình ngôn ngữ lớn ứng dụng tra cứu học vụ · Đạt loại Xuất sắc',
                  date: '15/06/2026',
                  evidenceFiles: [
                    {
                      id: 'ev-nckh-3',
                      name: 'Giay_xac_nhan_de_tai_NCKH_cap_truong.pdf',
                      fileType: 'pdf',
                      size: '1.2 MB',
                      uploadedAt: '18/06/2026',
                      status: 'ready',
                    },
                  ],
                },
              ],
            },
            {
              id: 'academic-paper',
              code: 'TC2.3',
              criterionId: 'academic',
              groupId: 'academic-achievements',
              title: 'Bài báo / Công trình học thuật công bố',
              ruleBadge: 'Tùy chọn phù hợp',
              ruleHelper: 'Bài báo đăng kỷ yếu hội thảo ISBN hoặc tạp chí chuyên ngành ISSN / Scopus',
              declarationMode: 'single',
              status: 'ready',
              declarations: [
                {
                  id: 'decl-paper',
                  value: 'Bài báo khoa học tại Hội thảo Quốc gia SOICT 2026',
                  detail: 'Chỉ số ISBN 978-604-67-2100-3 · Đồng tác giả chính · Nghiên cứu mô hình ngôn ngữ tiếng Việt',
                  date: '15/06/2026',
                  evidenceFiles: [
                    {
                      id: 'ev-paper-1',
                      name: 'Bai_bao_khoa_hoc_SOICT_2026.pdf',
                      fileType: 'pdf',
                      size: '2.1 MB',
                      uploadedAt: '20/06/2026',
                      status: 'ready',
                    },
                  ],
                },
              ],
            },
            {
              id: 'academic-competition',
              code: 'TC2.4',
              criterionId: 'academic',
              groupId: 'academic-achievements',
              title: 'Đội tuyển / Cuộc thi học thuật các cấp',
              ruleBadge: 'Tùy chọn phù hợp',
              ruleHelper: 'Đạt giải cuộc thi học thuật, sáng tạo khởi nghiệp, hoặc thành viên đội tuyển thi cấp quốc gia',
              declarationMode: 'single',
              status: 'can_supplement',
              isOptionalEmpty: true,
              declarations: [],
            },
            {
              id: 'academic-innovation',
              code: 'TC2.5',
              criterionId: 'academic',
              groupId: 'academic-achievements',
              title: 'Sản phẩm sáng tạo / Giải pháp kỹ thuật',
              ruleBadge: 'Tùy chọn phù hợp',
              ruleHelper: 'Có sản phẩm phần mềm, thiết bị kỹ thuật hoặc sáng kiến được ứng dụng thực tiễn',
              declarationMode: 'single',
              status: 'can_supplement',
              isOptionalEmpty: true,
              declarations: [],
            },
            {
              id: 'academic-olympic',
              code: 'TC2.6',
              criterionId: 'academic',
              groupId: 'academic-achievements',
              title: 'Giải thưởng Olympic chuyên ngành',
              ruleBadge: 'Tùy chọn phù hợp',
              ruleHelper: 'Đạt giải kỳ thi Olympic Toán, Vật lý, Tin học, Cơ học sinh viên toàn quốc',
              declarationMode: 'single',
              status: 'can_supplement',
              isOptionalEmpty: true,
              declarations: [],
            },
          ],
        },
      ],
      requirements: [],
    },

    // =========================================================================
    // CRITERION 3: THỂ LỰC TỐT (2 hình thức, CẢ HAI đều đã kê khai!)
    // Implements Prompt Section 12–14: BOTH declared, 2/2 hình thức đã kê khai
    // =========================================================================
    {
      id: 'physical',
      number: 3,
      name: 'Thể lực tốt',
      shortSummary: '2/2 hình thức đã kê khai · 3 minh chứng',
      statusLabel: 'Cần kiểm tra',
      groups: [
        {
          id: 'physical-forms',
          criterionId: 'physical',
          title: 'Hình thức xác nhận thể lực',
          groupType: 'AT_LEAST_N',
          ruleBadge: 'Cần ít nhất 1 trong 2 hình thức',
          ruleHelper: 'Sinh viên đạt một trong hai hình thức; nếu có cả hai có thể kê khai đầy đủ cả hai để hội đồng thẩm định',
          minApplicable: 1,
          requirements: [
            {
              id: 'physical-khoe',
              code: 'TC3.1',
              criterionId: 'physical',
              groupId: 'physical-forms',
              title: 'Danh hiệu Sinh viên khỏe',
              ruleBadge: 'Hình thức 1',
              ruleHelper: 'Đạt chứng nhận "Sinh viên khỏe" do Hội Sinh viên hoặc Bộ môn GDTC cấp Trường tổ chức',
              declarationMode: 'single',
              status: 'needs_verification',
              recommendation: {
                id: 'rec-physical',
                criterionId: 'physical',
                criterionName: 'Thể lực tốt',
                message: 'Bạn có thể kiểm tra lại thời gian cấp trên giấy chứng nhận Sinh viên khỏe.',
                suggestedActionLabel: 'Kiểm tra tài liệu',
              },
              declarations: [
                {
                  id: 'decl-physical',
                  value: 'Sinh viên khỏe cấp trường năm học 2025–2026',
                  detail: 'Đạt chuẩn 4/4 nội dung rèn luyện thể lực sinh viên Đại học Bách khoa',
                  date: '28/04/2026',
                  evidenceFiles: [
                    {
                      id: 'ev-phy-1',
                      name: 'Giay_chung_nhan_sinh_vien_khoe.pdf',
                      fileType: 'pdf',
                      size: '1.4 MB',
                      uploadedAt: '02/05/2026',
                      status: 'needs_verification',
                      aiSuggestedInfo: {
                        achievementName: 'Chứng nhận Sinh viên khỏe cấp Trường 2026',
                        date: '28/04/2026',
                        issuingAuthority: 'Bộ môn Giáo dục Thể chất - ĐH Bách khoa',
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'physical-sport',
              code: 'TC3.2',
              criterionId: 'physical',
              groupId: 'physical-forms',
              title: 'Thành tích thể thao các cấp',
              ruleBadge: 'Hình thức 2',
              ruleHelper: 'Tham gia và đạt giải thi đấu thể thao từ cấp Trường trở lên hoặc thành viên đội tuyển',
              declarationMultiplicity: 'MULTIPLE',
              addActionLabel: 'Thêm thành tích thể thao',
              allowMultipleEvidence: true,
              declarationMode: 'single',
              allowMultipleDeclarations: true,
              status: 'ready',
              declarations: [
                {
                  id: 'decl-sport-1',
                  value: 'Huy chương Bạc Giải bóng chuyền sinh viên cấp Thành phố 2026',
                  detail: 'Hội thao Sinh viên Đại học Đà Nẵng 2026 · Vận động viên đội tuyển bóng chuyền ĐH Bách khoa',
                  date: '22/03/2026',
                  evidenceFiles: [
                    {
                      id: 'ev-sport-1',
                      name: 'Huy_chuong_bac_bong_chuyen.pdf',
                      fileType: 'pdf',
                      size: '1.9 MB',
                      uploadedAt: '25/03/2026',
                      status: 'ready',
                    },
                    {
                      id: 'ev-sport-2',
                      name: 'Giay_khen_Hoi_thao_UD.pdf',
                      fileType: 'pdf',
                      size: '1.3 MB',
                      uploadedAt: '26/03/2026',
                      status: 'ready',
                    },
                  ],
                },
                {
                  id: 'decl-sport-2',
                  value: 'Giải Ba Bóng đá sinh viên Đại học Đà Nẵng 2026',
                  detail: 'Giải bóng đá truyền thống sinh viên toàn Đại học Đà Nẵng 2026',
                  date: '18/04/2026',
                  evidenceFiles: [
                    {
                      id: 'ev-sport-3',
                      name: 'Giay_chung_nhan_giai_ba_bong_da.pdf',
                      fileType: 'pdf',
                      size: '1.5 MB',
                      uploadedAt: '20/04/2026',
                      status: 'ready',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      requirements: [],
    },

    // =========================================================================
    // CRITERION 4: TÌNH NGUYỆN TỐT (Repeatable group, 3 activities)
    // Implements Prompt Section 15–17: Repeatable declarations with aggregation
    // =========================================================================
    {
      id: 'volunteer',
      number: 4,
      name: 'Tình nguyện tốt',
      shortSummary: '3 hoạt động đã khai · 4 minh chứng · 5 ngày hoạt động',
      statusLabel: 'Đã kê khai',
      groups: [
        {
          id: 'volunteer-activities-group',
          criterionId: 'volunteer',
          title: 'Hoạt động tình nguyện vì cộng đồng',
          groupType: 'REPEATABLE_COLLECTION',
          ruleBadge: 'Có thể kê khai nhiều hoạt động',
          ruleHelper: 'Tham gia ít nhất 02 hoạt động tình nguyện hoặc tối thiểu 05 ngày tình nguyện trong năm học',
          minApplicable: 1,
          requirements: [
            {
              id: 'volunteer-activities',
              code: 'TC4.1',
              criterionId: 'volunteer',
              groupId: 'volunteer-activities-group',
              title: 'Hoạt động tình nguyện vì cộng đồng',
              ruleBadge: 'Có thể thêm nhiều hoạt động',
              ruleHelper: 'Tham gia các chiến dịch tình nguyện hoặc hoạt động cộng đồng',
              declarationMode: 'repeatable',
              allowMultipleDeclarations: true,
              status: 'ready',
              declarations: [
                {
                  id: 'decl-vol-1',
                  value: 'Chiến dịch Mùa hè xanh 2026',
                  detail: 'Thời gian: 12/07/2026 → 14/07/2026 (3 ngày) · Địa bàn Huyện Hòa Vang',
                  date: '14/07/2026',
                  metadata: {
                    duration: '3 ngày',
                    organizer: 'Đoàn trường ĐH Bách khoa',
                  },
                  evidenceFiles: [
                    {
                      id: 'ev-vol-1a',
                      name: 'Giay_xac_nhan_MHX.pdf',
                      fileType: 'pdf',
                      size: '1.5 MB',
                      uploadedAt: '25/07/2026',
                      status: 'ready',
                    },
                    {
                      id: 'ev-vol-1b',
                      name: 'Anh_hoat_dong_Mua_he_xanh.webp',
                      fileType: 'webp',
                      size: '2.8 MB',
                      uploadedAt: '25/07/2026',
                      status: 'ready',
                    },
                  ],
                },
                {
                  id: 'decl-vol-2',
                  value: 'Chủ nhật xanh lần 2',
                  detail: 'Ngày: 18/08/2026 (1 ngày) · Dọn vệ sinh môi trường bãi biển Nguyễn Tất Thành',
                  date: '18/08/2026',
                  metadata: {
                    duration: '1 ngày',
                    organizer: 'Đoàn phường Hòa Khánh Bắc',
                  },
                  evidenceFiles: [
                    {
                      id: 'ev-vol-2',
                      name: 'Bao_cao_thanh_tich_tinh_nguyen.docx',
                      fileType: 'docx',
                      size: '980 KB',
                      uploadedAt: '20/08/2026',
                      status: 'ready',
                    },
                  ],
                },
                {
                  id: 'decl-vol-3',
                  value: 'Hiến máu tình nguyện',
                  detail: 'Ngày: 03/09/2026 (1 buổi) · Điểm hiến máu Bệnh viện Đà Nẵng',
                  date: '03/09/2026',
                  metadata: {
                    duration: '1 buổi',
                    organizer: 'Hội Chữ thập đỏ TP. Đà Nẵng',
                  },
                  evidenceFiles: [
                    {
                      id: 'ev-vol-3',
                      name: 'Giay_chung_nhan_hien_mau.pdf',
                      fileType: 'pdf',
                      size: '1.1 MB',
                      uploadedAt: '05/09/2026',
                      status: 'ready',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      requirements: [],
    },

    // =========================================================================
    // CRITERION 5: HỘI NHẬP TỐT (Yêu cầu nền + Lựa chọn bổ sung)
    // Implements Prompt Section 18–19
    // =========================================================================
    {
      id: 'integration',
      number: 5,
      name: 'Hội nhập tốt',
      shortSummary: '3 nội dung đã kê khai · 3 minh chứng',
      statusLabel: 'Cần kiểm tra',
      groups: [
        {
          id: 'integration-skills-award',
          criterionId: 'integration',
          title: 'Nhóm A: Kỹ năng hoặc Khen thưởng Đoàn - Hội',
          groupType: 'AT_LEAST_N',
          ruleBadge: 'Cần ít nhất 1 trong 2 hình thức (Bắt buộc)',
          ruleHelper: 'Bắt buộc đạt ít nhất một trong hai hình thức: Khóa kỹ năng thực hành xã hội HOẶC Khen thưởng Đoàn/Hội từ cấp khoa trở lên',
          minApplicable: 1,
          requirements: [
            {
              id: 'integration-skills',
              code: 'TC5.1',
              criterionId: 'integration',
              groupId: 'integration-skills-award',
              title: 'Hoàn thành khóa trang bị kỹ năng thực hành xã hội',
              ruleBadge: 'Hình thức A1',
              ruleHelper: 'Hoàn thành ít nhất 01 khóa trang bị kỹ năng thực hành xã hội do các cấp tổ chức',
              declarationMode: 'single',
              status: 'ready',
              declarations: [
                {
                  id: 'decl-skills-1',
                  value: 'Khóa tập huấn Kỹ năng thực hành xã hội và làm việc nhóm 2026',
                  detail: 'Do Hội Sinh viên TP. Đà Nẵng tổ chức · Đạt chứng nhận hoàn thành khóa tập huấn tháng 04/2026',
                  date: '20/04/2026',
                  evidenceFiles: [
                    {
                      id: 'ev-skills-1',
                      name: 'Chung_nhan_khoa_ky_nang_thuc_hanh_xa_hoi.pdf',
                      fileType: 'pdf',
                      size: '1.4 MB',
                      uploadedAt: '25/04/2026',
                      status: 'ready',
                    },
                  ],
                },
              ],
            },
            {
              id: 'integration-union-award',
              code: 'TC5.2',
              criterionId: 'integration',
              groupId: 'integration-skills-award',
              title: 'Khen thưởng công tác Đoàn - Hội từ cấp khoa trở lên',
              ruleBadge: 'Hình thức A2',
              ruleHelper: 'Được Hội Sinh viên hoặc Đoàn Thanh niên từ cấp khoa trở lên khen thưởng thành tích xuất sắc',
              declarationMode: 'single',
              status: 'can_supplement',
              isOptionalEmpty: true,
              declarations: [],
            },
          ],
        },
        {
          id: 'integration-languages-intl',
          criterionId: 'integration',
          title: 'Nhóm B: Ngoại ngữ, Hoạt động quốc tế hoặc Cuộc thi',
          groupType: 'AT_LEAST_N',
          ruleBadge: 'Cần ít nhất 1 trong 3 hình thức (Bắt buộc)',
          ruleHelper: 'Bắt buộc đạt ít nhất một trong ba hình thức: Chuẩn ngoại ngữ, Giao lưu quốc tế, hoặc Cuộc thi ngoại ngữ từ giải Ba trở lên',
          minApplicable: 1,
          requirements: [
            {
              id: 'integration-lang',
              code: 'TC5.3',
              criterionId: 'integration',
              groupId: 'integration-languages-intl',
              title: 'Tiêu chuẩn năng lực ngoại ngữ',
              ruleBadge: 'Hình thức B1',
              ruleHelper: 'Chứng chỉ C/B1, TOEIC >= 405, TOEFL iBT >= 53, IELTS >= 4.5, hoặc ĐTB học phần ngoại ngữ >= 3.0/4 hoặc 7.5/10; Ngoại ngữ 2 cho SV chuyên ngành',
              declarationMode: 'single',
              status: 'needs_verification',
              recommendation: {
                id: 'rec-integration',
                criterionId: 'integration',
                criterionName: 'Hội nhập tốt',
                message: 'Một minh chứng ngoại ngữ còn thông tin cần bạn xác nhận.',
                suggestedActionLabel: 'Kiểm tra tài liệu',
              },
              declarations: [
                {
                  id: 'decl-lang',
                  value: 'IELTS 7.0 Academic',
                  detail: 'Overall Band Score 7.0 (Listening: 7.5, Reading: 7.5, Writing: 6.5, Speaking: 6.5)',
                  date: '12/03/2026',
                  evidenceFiles: [
                    {
                      id: 'ev-ielts-1',
                      name: 'IELTS_Certificate.pdf',
                      fileType: 'pdf',
                      size: '1.7 MB',
                      uploadedAt: '15/03/2026',
                      status: 'needs_verification',
                      aiSuggestedInfo: {
                        achievementName: 'IELTS Academic - Overall 7.0',
                        date: '12/03/2026',
                        issuingAuthority: 'IDP Education Vietnam',
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'integration-intl',
              code: 'TC5.4',
              criterionId: 'integration',
              groupId: 'integration-languages-intl',
              title: 'Tham gia hoạt động giao lưu, hợp tác quốc tế từ cấp khoa trở lên',
              ruleBadge: 'Hình thức B2',
              ruleHelper: 'Tham gia hội nghị, hội thảo quốc tế, giao lưu thanh niên sinh viên quốc tế từ cấp khoa trở lên (không yêu cầu giải thưởng)',
              declarationMode: 'single',
              status: 'ready',
              declarations: [
                {
                  id: 'decl-inter-act',
                  value: 'Đại biểu Diễn đàn Thanh niên ASEAN - Đà Nẵng 2026',
                  detail: 'Tham gia với vai trò đại biểu thanh niên Việt Nam · Tham luận chuyên đề Chuyển đổi số trong sinh viên ASEAN',
                  date: '18/05/2026',
                  evidenceFiles: [
                    {
                      id: 'ev-inter-1',
                      name: 'Giay_xac_nhan_giao_luu_ASEAN.pdf',
                      fileType: 'pdf',
                      size: '1.6 MB',
                      uploadedAt: '22/05/2026',
                      status: 'ready',
                    },
                  ],
                },
              ],
            },
            {
              id: 'integration-contest',
              code: 'TC5.5',
              criterionId: 'integration',
              groupId: 'integration-languages-intl',
              title: 'Cuộc thi kiến thức hoặc sử dụng ngoại ngữ từ cấp khoa trở lên',
              ruleBadge: 'Hình thức B3',
              ruleHelper: 'Tham gia VÀ đạt giải Ba trở lên tại cuộc thi kiến thức hoặc sử dụng ngoại ngữ từ cấp khoa trở lên',
              declarationMode: 'single',
              status: 'can_supplement',
              isOptionalEmpty: true,
              declarations: [],
            },
          ],
        },
      ],
      requirements: [],
    },
  ],
};

// Populate flattened requirements from groups for each criterion
for (const crit of INITIAL_STUDENT_APPLICATION.criteria) {
  if ((!crit.requirements || crit.requirements.length === 0) && crit.groups) {
    crit.requirements = crit.groups.flatMap((g) => g.requirements || []);
  }
}

import { CRITERIA_DEFINITIONS_LIST, resolveMultiplicity } from './criteriaDefinitions';

