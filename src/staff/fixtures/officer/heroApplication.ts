import {
  StudentApplicationData,
  ApplicationDeclaration,
  INITIAL_STUDENT_APPLICATION,
  buildCriteriaFromDefinitions,
} from '../../../demo/fixtures/studentApplication';
import { HERO_SUPPLEMENT_REQUEST } from '../../../demo/fixtures/supplementScenarios';

export function buildHeroStudentApplicationForOfficer(
  includeReturnedSupplement: boolean = false
): StudentApplicationData {
  const base: StudentApplicationData = JSON.parse(
    JSON.stringify(INITIAL_STUDENT_APPLICATION)
  );

  // 1. ETHICS: Ensure clean declarations with stable IDs
  const ethicsCrit = base.criteria.find((c) => c.id === 'ethics');
  if (ethicsCrit) {
    ethicsCrit.requirements = [
      {
        id: 'ethics-score',
        criterionId: 'ethics',
        groupId: 'ethics-foundation',
        title: 'Điểm rèn luyện cả năm học',
        ruleBadge: 'Yêu cầu bắt buộc',
        declarationMode: 'single',
        status: 'ready',
        declarations: [
          {
            id: 'decl-eth-1',
            value: 'Điểm rèn luyện năm học 2025–2026: 93 / 100 điểm',
            detail: 'Xếp loại Xuất sắc · Phòng Công tác Sinh viên xác nhận',
            date: '15/06/2026',
            status: 'ready',
            evidenceFiles: [
              {
                id: 'ev-eth-score-1',
                name: 'Bang_diem_ren_luyen_2025_2026.pdf',
                fileType: 'pdf',
                size: '420 KB',
                uploadedAt: '10/10/2026',
                status: 'ready',
              },
            ],
            evidence: [
              {
                id: 'ev-eth-score-1',
                name: 'Bang_diem_ren_luyen_2025_2026.pdf',
                fileType: 'pdf',
                size: '420 KB',
                uploadedAt: '10/10/2026',
                status: 'ready',
              },
            ],
          },
        ],
      },
      {
        id: 'ethics-law',
        criterionId: 'ethics',
        groupId: 'ethics-foundation',
        title: 'Chấp hành pháp luật và nội quy nhà trường',
        ruleBadge: 'Yêu cầu bắt buộc',
        declarationMode: 'single',
        status: 'ready',
        declarations: [
          {
            id: 'decl-eth-2',
            value: 'Chấp hành nghiêm chỉnh pháp luật và quy chế sinh viên',
            detail: 'Không bị kỷ luật; xác nhận của Khoa Công nghệ Thông tin',
            date: '20/06/2026',
            status: 'ready',
            evidenceFiles: [
              {
                id: 'ev-eth-law-1',
                name: 'Giay_xac_nhan_khong_vi_pham_quy_che.pdf',
                fileType: 'pdf',
                size: '310 KB',
                uploadedAt: '10/10/2026',
                status: 'ready',
              },
            ],
            evidence: [
              {
                id: 'ev-eth-law-1',
                name: 'Giay_xac_nhan_khong_vi_pham_quy_che.pdf',
                fileType: 'pdf',
                size: '310 KB',
                uploadedAt: '10/10/2026',
                status: 'ready',
              },
            ],
          },
        ],
      },
      {
        id: 'ethics-commendation',
        criterionId: 'ethics',
        groupId: 'ethics-supplement',
        title: 'Khen thưởng rèn luyện đạo đức / Gương người tốt việc tốt',
        ruleBadge: 'Tùy chọn phù hợp',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'ready',
        declarations: [
          {
            id: 'decl-eth-3',
            value: 'Giấy khen Sinh viên tiêu biểu trong rèn luyện cấp Trường',
            detail: 'Quyết định số 42/QĐ-ĐTN của Đoàn Trường ĐH Bách khoa - ĐHĐN',
            date: '26/03/2026',
            status: 'ready',
            evidenceFiles: [
              {
                id: 'ev-eth-comm-1',
                name: 'Quyet_dinh_khen_thuong_42_QD_DTN.pdf',
                fileType: 'pdf',
                size: '680 KB',
                uploadedAt: '10/10/2026',
                status: 'ready',
              },
            ],
            evidence: [
              {
                id: 'ev-eth-comm-1',
                name: 'Quyet_dinh_khen_thuong_42_QD_DTN.pdf',
                fileType: 'pdf',
                size: '680 KB',
                uploadedAt: '10/10/2026',
                status: 'ready',
              },
            ],
          },
        ],
      },
      {
        id: 'ethics-party',
        criterionId: 'ethics',
        groupId: 'ethics-supplement',
        title: 'Bồi dưỡng nhận thức về Đảng / Đoàn viên ưu tú',
        ruleBadge: 'Tùy chọn phù hợp',
        declarationMode: 'single',
        status: 'can_supplement',
        declarations: [],
      },
      {
        id: 'ethics-politics',
        criterionId: 'ethics',
        groupId: 'ethics-supplement',
        title: 'Cuộc thi tìm hiểu chính trị, tư tưởng, truyền thống',
        ruleBadge: 'Tùy chọn phù hợp',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'can_supplement',
        declarations: [],
      },
    ];
  }

  // 2. ACADEMIC (Third Demo — Section 110: NCKH with 2 declarations & multiple evidence files)
  const academicCrit = base.criteria.find((c) => c.id === 'academic');
  if (academicCrit) {
    const nckhEv1 = [
      {
        id: 'ev-aca-nckh-1a',
        name: 'Giay_chung_nhan_NCKH.pdf',
        fileType: 'pdf' as const,
        size: '1.2 MB',
        uploadedAt: '11/10/2026',
        status: 'ready' as const,
      },
      {
        id: 'ev-aca-nckh-1b',
        name: 'Quyet_dinh_cong_nhan_giai_NCKH_2026.pdf',
        fileType: 'pdf' as const,
        size: '890 KB',
        uploadedAt: '11/10/2026',
        status: 'ready' as const,
      },
      {
        id: 'ev-aca-nckh-1c',
        name: 'Ky_yeu_tom_tat_cong_trinh_NCKH_2026.pdf',
        fileType: 'pdf' as const,
        size: '2.1 MB',
        uploadedAt: '11/10/2026',
        status: 'ready' as const,
      },
    ];
    const nckhEv2 = [
      {
        id: 'ev-aca-nckh-2a',
        name: 'Bien_ban_nghiem_thu_de_tai_cap_khoa.pdf',
        fileType: 'pdf' as const,
        size: '760 KB',
        uploadedAt: '11/10/2026',
        status: 'needs_verification' as const,
      },
      {
        id: 'ev-aca-nckh-2b',
        name: 'Xac_nhan_ung_dung_thuc_nghiem.jpg',
        fileType: 'jpg' as const,
        size: '1.1 MB',
        uploadedAt: '11/10/2026',
        status: 'ready' as const,
      },
    ];

    academicCrit.requirements = [
      {
        id: 'academic-gpa',
        criterionId: 'academic',
        groupId: 'academic-foundation',
        title: 'Điểm trung bình năm học (GPA)',
        ruleBadge: 'Yêu cầu bắt buộc',
        declarationMode: 'single',
        status: 'ready',
        declarations: [
          {
            id: 'decl-aca-gpa-1',
            value: 'Điểm trung bình tích lũy năm học: 3.58 / 4.00',
            detail: 'Xếp loại Xuất sắc · Không có học phần dưới điểm C hoặc điểm F',
            date: '25/06/2026',
            status: 'ready',
            evidenceFiles: [
              {
                id: 'ev-aca-gpa-1',
                name: 'Bang_diem_hoc_tap_chinh_thuc_2025_2026.pdf',
                fileType: 'pdf',
                size: '540 KB',
                uploadedAt: '10/10/2026',
                status: 'ready',
              },
            ],
            evidence: [
              {
                id: 'ev-aca-gpa-1',
                name: 'Bang_diem_hoc_tap_chinh_thuc_2025_2026.pdf',
                fileType: 'pdf',
                size: '540 KB',
                uploadedAt: '10/10/2026',
                status: 'ready',
              },
            ],
          },
        ],
      },
      {
        id: 'academic-nckh',
        criterionId: 'academic',
        groupId: 'academic-achievements',
        title: 'Nghiên cứu khoa học và sáng tạo sinh viên',
        ruleBadge: 'Tùy chọn phù hợp',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'needs_verification',
        declarations: [
          {
            id: 'decl-aca-nckh-1',
            value: 'Giải Nhì Hội nghị Sinh viên Nghiên cứu khoa học 2026',
            detail:
              'Đơn vị tổ chức: Trường Đại học Bách khoa - ĐH Đà Nẵng · Chủ nhiệm đề tài',
            date: '18/05/2026',
            status: 'ready',
            evidenceFiles: nckhEv1,
            evidence: nckhEv1,
          },
          {
            id: 'decl-aca-nckh-2',
            value:
              'Đề tài NCKH cấp Khoa: Ứng dụng xử lý ngôn ngữ tự nhiên hỗ trợ tra cứu văn bản Đoàn - Hội',
            detail:
              'Đơn vị tổ chức: Khoa Công nghệ Thông tin · Nghiệm thu đạt loại Tốt',
            date: '02/06/2026',
            status: 'needs_verification',
            evidenceFiles: nckhEv2,
            evidence: nckhEv2,
          },
        ],
      },
      {
        id: 'academic-paper',
        criterionId: 'academic',
        groupId: 'academic-achievements',
        title: 'Bài báo / Công trình học thuật công bố',
        ruleBadge: 'Tùy chọn phù hợp',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'can_supplement',
        declarations: [],
      },
      {
        id: 'academic-competition',
        criterionId: 'academic',
        groupId: 'academic-achievements',
        title: 'Đội tuyển / Cuộc thi học thuật các cấp',
        ruleBadge: 'Tùy chọn phù hợp',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'ready',
        declarations: [
          {
            id: 'decl-aca-comp-1',
            value: 'Giải Nhất Cuộc thi Lập trình sinh viên Đà Nẵng CodeStorm 2026',
            detail: 'Đơn vị tổ chức: Hội Sinh viên TP. Đà Nẵng phối hợp Khoa CNTT',
            date: '12/04/2026',
            status: 'ready',
            evidenceFiles: [
              {
                id: 'ev-aca-comp-1',
                name: 'Giay_khen_Giai_Nhat_CodeStorm_2026.pdf',
                fileType: 'pdf',
                size: '950 KB',
                uploadedAt: '11/10/2026',
                status: 'ready',
              },
            ],
            evidence: [
              {
                id: 'ev-aca-comp-1',
                name: 'Giay_khen_Giai_Nhat_CodeStorm_2026.pdf',
                fileType: 'pdf',
                size: '950 KB',
                uploadedAt: '11/10/2026',
                status: 'ready',
              },
            ],
          },
        ],
      },
      {
        id: 'academic-innovation',
        criterionId: 'academic',
        groupId: 'academic-achievements',
        title: 'Sản phẩm sáng tạo / Giải pháp kỹ thuật',
        ruleBadge: 'Tùy chọn phù hợp',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'can_supplement',
        declarations: [],
      },
      {
        id: 'academic-olympic',
        criterionId: 'academic',
        groupId: 'academic-achievements',
        title: 'Giải thưởng Olympic chuyên ngành',
        ruleBadge: 'Tùy chọn phù hợp',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'can_supplement',
        declarations: [],
      },
    ];
  }

  // 3. PHYSICAL (Second Demo — Section 23, 25, 109: Thành tích thể thao with 3 declarations)
  const physicalCrit = base.criteria.find((c) => c.id === 'physical');
  if (physicalCrit) {
    const sportEv1 = [
      {
        id: 'ev-phy-sport-1a',
        name: 'Quyet_dinh_giai_bong_chuyen.pdf',
        fileType: 'pdf' as const,
        size: '780 KB',
        uploadedAt: '12/03/2026',
        status: 'ready' as const,
      },
      {
        id: 'ev-phy-sport-1b',
        name: 'Giay_khen_HCB_bong_chuyen_2026.jpg',
        fileType: 'jpg' as const,
        size: '1.4 MB',
        uploadedAt: '22/03/2026',
        status: 'ready' as const,
      },
    ];
    const sportEv2 = [
      {
        id: 'ev-phy-sport-2a',
        name: 'Chung_nhan_Giai_Ba_Bong_da_DHDN.pdf',
        fileType: 'pdf' as const,
        size: '640 KB',
        uploadedAt: '15/04/2026',
        status: 'ready' as const,
      },
    ];
    const sportEv3 = [
      {
        id: 'ev-phy-sport-3a',
        name: 'Giay_xac_nhan_cau_long_cap_truong_scan_mo.jpg',
        fileType: 'jpg' as const,
        size: '920 KB',
        uploadedAt: '10/05/2026',
        status: 'needs_verification' as const,
      },
    ];

    physicalCrit.requirements = [
      {
        id: 'physical-khoe',
        criterionId: 'physical',
        groupId: 'physical-forms',
        title: 'Danh hiệu Sinh viên khỏe',
        ruleBadge: 'Hình thức 1',
        declarationMode: 'single',
        status: 'ready',
        declarations: [
          {
            id: 'decl-phy-khoe-1',
            value: 'Chứng nhận Danh hiệu Sinh viên khỏe cấp Trường năm học 2025–2026',
            detail:
              'Đơn vị tổ chức: Hội Sinh viên Trường ĐH Bách khoa - ĐH Đà Nẵng',
            date: '15/05/2026',
            status: 'ready',
            evidenceFiles: [
              {
                id: 'ev-phy-khoe-1',
                name: 'Giay_chung_nhan_Sinh_vien_khoe_2026.pdf',
                fileType: 'pdf',
                size: '610 KB',
                uploadedAt: '11/10/2026',
                status: 'ready',
              },
            ],
            evidence: [
              {
                id: 'ev-phy-khoe-1',
                name: 'Giay_chung_nhan_Sinh_vien_khoe_2026.pdf',
                fileType: 'pdf',
                size: '610 KB',
                uploadedAt: '11/10/2026',
                status: 'ready',
              },
            ],
          },
        ],
      },
      {
        id: 'physical-sport',
        criterionId: 'physical',
        groupId: 'physical-forms',
        title: 'Thành tích thể thao các cấp',
        ruleBadge: 'Hình thức 2',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'needs_verification',
        declarations: [
          {
            id: 'decl-phy-sport-1',
            value: 'Huy chương Bạc Giải bóng chuyền sinh viên TP. Đà Nẵng 2026',
            detail:
              'Đơn vị tổ chức: Hội Sinh viên Việt Nam TP. Đà Nẵng · Nội dung đồng đội nam/nữ',
            date: '22/03/2026',
            status: 'ready',
            evidenceFiles: sportEv1,
            evidence: sportEv1,
          },
          {
            id: 'decl-phy-sport-2',
            value: 'Giải Ba Giải bóng đá sinh viên Đại học Đà Nẵng 2026',
            detail:
              'Đơn vị tổ chức: Đại học Đà Nẵng · Hội thao Sinh viên truyền thống lần thứ XIV',
            date: '14/04/2026',
            status: 'ready',
            evidenceFiles: sportEv2,
            evidence: sportEv2,
          },
          {
            id: 'decl-phy-sport-3',
            value: 'Huy chương Đồng Giải cầu lông sinh viên cấp Trường 2026',
            detail:
              'Đơn vị tổ chức: Đoàn Thanh niên - Hội Sinh viên Trường ĐH Bách khoa',
            date: '10/05/2026',
            status: 'needs_verification',
            evidenceFiles: sportEv3,
            evidence: sportEv3,
          },
        ],
      },
    ];
  }

  // 4. VOLUNTEER (Primary Demo — Sections 50–53, 90, 107, 108: 3 declarations)
  const volunteerCrit = base.criteria.find((c) => c.id === 'volunteer');
  if (volunteerCrit) {
    const mhxEvidence: ApplicationDeclaration['evidenceFiles'] = [
      {
        id: 'ev-vol-mhx-1',
        name: 'Giay_xac_nhan_Mua_he_xanh_2026.pdf',
        fileType: 'pdf',
        size: '840 KB',
        uploadedAt: '11/10/2026',
        status: 'needs_verification',
      },
    ];

    if (includeReturnedSupplement) {
      mhxEvidence.push({
        id: 'ev-vol-mhx-supp-new',
        name: 'Giay_xac_nhan_thoi_gian_MHX.pdf',
        fileType: 'pdf',
        size: '620 KB',
        uploadedAt: '17/10/2026',
        status: 'ready',
        isNewlyAddedSupplement: true,
      });
    }

    const cnxEv = [
      {
        id: 'ev-vol-cnx-1',
        name: 'Bao_cao_tinh_nguyen.docx',
        fileType: 'docx',
        size: '480 KB',
        uploadedAt: '11/10/2026',
        status: 'ready' as const,
      },
      {
        id: 'ev-vol-cnx-2',
        name: 'Danh_sach_xac_nhan_Chu_nhat_xanh_dot2.pdf',
        fileType: 'pdf',
        size: '530 KB',
        uploadedAt: '11/10/2026',
        status: 'ready' as const,
      },
    ];

    const hmEv = [
      {
        id: 'ev-vol-hm-1',
        name: 'Giay_chung_nhan_hien_mau_tinh_nguyen_2026.jpg',
        fileType: 'jpg',
        size: '1.1 MB',
        uploadedAt: '11/10/2026',
        status: 'ready' as const,
      },
    ];

    volunteerCrit.requirements = [
      {
        id: 'volunteer-activities',
        criterionId: 'volunteer',
        groupId: 'volunteer-activities-group',
        title: 'Hoạt động tình nguyện vì cộng đồng',
        ruleBadge: 'Có thể thêm nhiều hoạt động',
        declarationMode: 'repeatable',
        allowMultipleDeclarations: true,
        status: includeReturnedSupplement ? 'ready' : 'needs_verification',
        declarations: [
          {
            id: 'decl-vol-mhx',
            value: 'Chiến dịch tình nguyện Mùa hè xanh 2026',
            detail: includeReturnedSupplement
              ? 'Đơn vị tổ chức: Đoàn Trường ĐH Bách khoa · Mặt trận xã Hòa Bắc, huyện Hòa Vang (5 ngày)'
              : 'Đơn vị tổ chức: Đoàn Trường ĐH Bách khoa · Mặt trận xã Hòa Bắc, huyện Hòa Vang (3 ngày)',
            date: '12/07/2026 – 16/07/2026',
            status: includeReturnedSupplement ? 'ready' : 'needs_verification',
            evidenceFiles: mhxEvidence,
            evidence: mhxEvidence,
          },
          {
            id: 'decl-vol-cnx',
            value: 'Ngày Chủ nhật xanh cấp Thành phố đợt 2/2026',
            detail:
              'Đơn vị tổ chức: Thành Đoàn – Hội Sinh viên TP. Đà Nẵng · Ra quân vệ sinh môi trường biển (1 ngày)',
            date: '18/08/2026',
            status: 'ready',
            evidenceFiles: cnxEv,
            evidence: cnxEv,
          },
          {
            id: 'decl-vol-hm',
            value: 'Ngày hội Hiến máu tình nguyện "Giọt hồng Bách khoa" 2026',
            detail:
              'Đơn vị tổ chức: Hội Chữ thập đỏ TP. Đà Nẵng & Đoàn Trường ĐH Bách khoa (1 ngày)',
            date: '05/04/2026',
            status: 'ready',
            evidenceFiles: hmEv,
            evidence: hmEv,
          },
        ],
      },
    ];
  }

  // 5. INTEGRATION
  const integrationCrit = base.criteria.find((c) => c.id === 'integration');
  if (integrationCrit) {
    const ieltsEv = [
      {
        id: 'ev-ielts-1',
        name: 'Chung_chi_IELTS_7.0_Nguyen_Minh_Anh.pdf',
        fileType: 'pdf',
        size: '1.3 MB',
        uploadedAt: '11/10/2026',
        status: 'ready' as const,
      },
    ];
    const aseanEv = [
      {
        id: 'ev-int-asean-1',
        name: 'Giay_chung_nhan_Dai_bieu_ASEAN_DaNang_2026.pdf',
        fileType: 'pdf',
        size: '870 KB',
        uploadedAt: '11/10/2026',
        status: 'ready' as const,
      },
    ];

    integrationCrit.requirements = [
      {
        id: 'integration-lang',
        criterionId: 'integration',
        groupId: 'integration-foundation',
        title: 'Chứng chỉ ngoại ngữ chuẩn quốc tế',
        ruleBadge: 'Yêu cầu bắt buộc',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'ready',
        declarations: [
          {
            id: 'decl-int-1',
            value: 'Chứng chỉ tiếng Anh quốc tế IELTS Academic 7.0',
            detail:
              'Đơn vị cấp: Hội đồng Anh (British Council) · Listening 7.5, Reading 7.5, Writing 6.5, Speaking 6.5',
            date: '15/06/2026',
            status: 'ready',
            evidenceFiles: ieltsEv,
            evidence: ieltsEv,
          },
        ],
      },
      {
        id: 'integration-intl',
        criterionId: 'integration',
        groupId: 'integration-activities',
        title: 'Tham gia chương trình giao lưu, tình nguyện quốc tế',
        ruleBadge: 'Tùy chọn phù hợp',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'ready',
        declarations: [
          {
            id: 'decl-int-2',
            value: 'Đại biểu Diễn đàn Giao lưu Sinh viên ASEAN – Đà Nẵng 2026',
            detail:
              'Đơn vị tổ chức: Thành Đoàn Đà Nẵng & Liên hiệp các tổ chức hữu nghị Thành phố',
            date: '22/05/2026',
            status: 'ready',
            evidenceFiles: aseanEv,
            evidence: aseanEv,
          },
        ],
      },
      {
        id: 'integration-contest',
        criterionId: 'integration',
        groupId: 'integration-activities',
        title: 'Cuộc thi ngoại ngữ / Kiến thức hội nhập quốc tế',
        ruleBadge: 'Tùy chọn phù hợp',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'can_supplement',
        declarations: [],
      },
      {
        id: 'integration-digital',
        criterionId: 'integration',
        groupId: 'integration-activities',
        title: 'Chứng chỉ kỹ năng số & Công nghệ thông tin quốc tế',
        ruleBadge: 'Tùy chọn phù hợp',
        declarationMode: 'single',
        allowMultipleDeclarations: true,
        status: 'can_supplement',
        declarations: [],
      },
    ];
  }

  base.criteria = buildCriteriaFromDefinitions(base.criteria);
  return base;
}

