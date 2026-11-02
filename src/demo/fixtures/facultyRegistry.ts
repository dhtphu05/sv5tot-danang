/**
 * 5TOT ĐHĐN — Danh mục 52 Khoa trực thuộc 09 Đơn vị đào tạo ĐHĐN (Cập nhật 2026)
 * Cơ quan quản lý: Đoàn Thanh niên - Hội Sinh viên Đại học Đà Nẵng
 * Phục vụ định tuyến đăng ký tài khoản, hồ sơ sinh viên và xét sơ tuyển.
 */

export interface CanonicalFaculty {
  id: string;
  institutionId: string;
  schoolReviewUnitId: string;
  code: string;
  name: string;
  isActive: boolean;
}

export const CANONICAL_FACULTIES_2026: CanonicalFaculty[] = [
  // 1. Trường Đại học Bách khoa (DUT) - 09 Khoa
  { id: 'fac-dut-dtttnt', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-dut', code: 'DUT_DT_AI', name: 'Khoa Điện tử và Trí tuệ nhân tạo', isActive: true },
  { id: 'fac-dut-ckgtnl', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-dut', code: 'DUT_CKGT_NL', name: 'Khoa Cơ khí Giao thông và Năng lượng', isActive: true },
  { id: 'fac-dut-hmtss', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-dut', code: 'DUT_HOA_MT_SS', name: 'Khoa Hóa, Môi trường và Khoa học Sự sống', isActive: true },
  { id: 'fac-dut-xd', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-dut', code: 'DUT_XD', name: 'Khoa Xây dựng', isActive: true },
  { id: 'fac-dut-dien', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-dut', code: 'DUT_DIEN', name: 'Khoa Điện', isActive: true },
  { id: 'fac-dut-ck', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-dut', code: 'DUT_CK', name: 'Khoa Cơ khí', isActive: true },
  { id: 'fac-dut-cntt', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-dut', code: 'DUT_CNTT', name: 'Khoa Công nghệ Thông tin', isActive: true },
  { id: 'fac-dut-qldacn', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-dut', code: 'DUT_QLDA_CN', name: 'Khoa Quản lý Dự án và Công nghiệp', isActive: true },
  { id: 'fac-dut-kt', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-dut', code: 'DUT_KT', name: 'Khoa Kiến trúc', isActive: true },

  // 2. Trường Đại học Kinh tế (DUE) - 08 Khoa
  { id: 'fac-due-qtkd', institutionId: 'inst-due', schoolReviewUnitId: 'unit-due', code: 'DUE_QTKD', name: 'Khoa Quản trị kinh doanh', isActive: true },
  { id: 'fac-due-kt', institutionId: 'inst-due', schoolReviewUnitId: 'unit-due', code: 'DUE_KT', name: 'Khoa Kinh tế', isActive: true },
  { id: 'fac-due-ketoan', institutionId: 'inst-due', schoolReviewUnitId: 'unit-due', code: 'DUE_KETOAN', name: 'Khoa Kế toán', isActive: true },
  { id: 'fac-due-luat', institutionId: 'inst-due', schoolReviewUnitId: 'unit-due', code: 'DUE_LUAT', name: 'Khoa Luật', isActive: true },
  { id: 'fac-due-llct', institutionId: 'inst-due', schoolReviewUnitId: 'unit-due', code: 'DUE_LLCT', name: 'Khoa Lý luận chính trị', isActive: true },
  { id: 'fac-due-tcnh', institutionId: 'inst-due', schoolReviewUnitId: 'unit-due', code: 'DUE_TCNH', name: 'Khoa Tài chính - Ngân hàng', isActive: true },
  { id: 'fac-due-dlkdqt', institutionId: 'inst-due', schoolReviewUnitId: 'unit-due', code: 'DUE_DL_KDQT', name: 'Khoa Du lịch và Kinh doanh quốc tế', isActive: true },
  { id: 'fac-due-tmdtcns', institutionId: 'inst-due', schoolReviewUnitId: 'unit-due', code: 'DUE_TMDT_MKT_CNS', name: 'Khoa Thương mại điện tử - Marketing và Công nghệ số', isActive: true },

  // 3. Trường Đại học Sư phạm (UED) - 08 Khoa
  { id: 'fac-ued-toantin', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-ued', code: 'UED_TOAN_TIN', name: 'Khoa Toán - Tin', isActive: true },
  { id: 'fac-ued-lyhoa', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-ued', code: 'UED_LY_HOA', name: 'Khoa Lý - Hóa', isActive: true },
  { id: 'fac-ued-snnmt', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-ued', code: 'UED_SINH_NN_MT', name: 'Khoa Sinh - Nông nghiệp - Môi trường', isActive: true },
  { id: 'fac-ued-nvtt', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-ued', code: 'UED_VAN_TT', name: 'Khoa Ngữ văn - Truyền thông', isActive: true },
  { id: 'fac-ued-sdct', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-ued', code: 'UED_SU_DIA_CT', name: 'Khoa Sử - Địa - Chính trị', isActive: true },
  { id: 'fac-ued-tlgdctxh', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-ued', code: 'UED_TL_GD_CTXH', name: 'Khoa Tâm lý - Giáo dục - Công tác xã hội', isActive: true },
  { id: 'fac-ued-gdthmn', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-ued', code: 'UED_GDTH_MN', name: 'Khoa Giáo dục Tiểu học - Mầm non', isActive: true },
  { id: 'fac-ued-gdnttc', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-ued', code: 'UED_GDNT_TC', name: 'Khoa Giáo dục Nghệ thuật - Thể chất', isActive: true },

  // 4. Trường Đại học Ngoại ngữ (UFL) - 09 Khoa
  { id: 'fac-ufl-ta', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-ufl', code: 'UFL_TA', name: 'Khoa Tiếng Anh', isActive: true },
  { id: 'fac-ufl-tacn', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-ufl', code: 'UFL_TACN', name: 'Khoa Tiếng Anh chuyên ngành', isActive: true },
  { id: 'fac-ufl-spnn', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-ufl', code: 'UFL_SPNN', name: 'Khoa Sư phạm Ngoại ngữ', isActive: true },
  { id: 'fac-ufl-tq', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-ufl', code: 'UFL_TQ', name: 'Khoa Ngôn ngữ và Văn hóa Trung Quốc', isActive: true },
  { id: 'fac-ufl-qth', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-ufl', code: 'UFL_QTH', name: 'Khoa Quốc tế học', isActive: true },
  { id: 'fac-ufl-hq', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-ufl', code: 'UFL_HQ', name: 'Khoa Ngôn ngữ và Văn hóa Hàn Quốc', isActive: true },
  { id: 'fac-ufl-chauau', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-ufl', code: 'UFL_CAU_AU', name: 'Khoa Ngôn ngữ và Văn hóa Châu Âu', isActive: true },
  { id: 'fac-ufl-nhatban', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-ufl', code: 'UFL_NB', name: 'Khoa Ngôn ngữ và Văn hóa Nhật Bản', isActive: true },
  { id: 'fac-ufl-vndna', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-ufl', code: 'UFL_VN_DNA', name: 'Khoa Ngôn ngữ và Văn hóa Việt Nam – Đông Nam Á', isActive: true },

  // 5. Trường Đại học Sư phạm Kỹ thuật (UTE) - 05 Khoa
  { id: 'fac-ute-ck', institutionId: 'inst-ute', schoolReviewUnitId: 'unit-ute', code: 'UTE_CK', name: 'Khoa Cơ khí', isActive: true },
  { id: 'fac-ute-ddt', institutionId: 'inst-ute', schoolReviewUnitId: 'unit-ute', code: 'UTE_D_DT', name: 'Khoa Điện - Điện tử', isActive: true },
  { id: 'fac-ute-ktxd', institutionId: 'inst-ute', schoolReviewUnitId: 'unit-ute', code: 'UTE_KTXD', name: 'Khoa Kỹ thuật Xây dựng', isActive: true },
  { id: 'fac-ute-cnhhmt', institutionId: 'inst-ute', schoolReviewUnitId: 'unit-ute', code: 'UTE_CNHH_MT', name: 'Khoa Công nghệ Hóa học - Môi trường', isActive: true },
  { id: 'fac-ute-cns', institutionId: 'inst-ute', schoolReviewUnitId: 'unit-ute', code: 'UTE_CNS', name: 'Khoa Công nghệ số', isActive: true },

  // 6. Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU) - 03 Khoa
  { id: 'fac-vku-khmt', institutionId: 'inst-vku', schoolReviewUnitId: 'unit-vku', code: 'VKU_KHMT', name: 'Khoa Khoa học máy tính', isActive: true },
  { id: 'fac-vku-ktmtdt', institutionId: 'inst-vku', schoolReviewUnitId: 'unit-vku', code: 'VKU_KTMT_DT', name: 'Khoa Kỹ thuật máy tính và Điện tử', isActive: true },
  { id: 'fac-vku-ktstmdt', institutionId: 'inst-vku', schoolReviewUnitId: 'unit-vku', code: 'VKU_KTS_TMDT', name: 'Khoa Kinh tế số và Thương mại điện tử', isActive: true },

  // 7. Trường Y Dược (SMP) - 04 Khoa
  { id: 'fac-smp-y', institutionId: 'inst-smp', schoolReviewUnitId: 'unit-smp', code: 'SMP_Y', name: 'Khoa Y', isActive: true },
  { id: 'fac-smp-rhm', institutionId: 'inst-smp', schoolReviewUnitId: 'unit-smp', code: 'SMP_RHM', name: 'Khoa Răng - Hàm - Mặt', isActive: true },
  { id: 'fac-smp-duoc', institutionId: 'inst-smp', schoolReviewUnitId: 'unit-smp', code: 'SMP_DUOC', name: 'Khoa Dược', isActive: true },
  { id: 'fac-smp-ddktyh', institutionId: 'inst-smp', schoolReviewUnitId: 'unit-smp', code: 'SMP_DD_KTYH', name: 'Khoa Điều dưỡng và Kỹ thuật y học', isActive: true },

  // 8. Viện Nghiên cứu và Đào tạo Việt - Anh (VNUK) - 03 Khoa
  { id: 'fac-vnuk-ktkd', institutionId: 'inst-vnuk', schoolReviewUnitId: 'unit-vnuk', code: 'VNUK_KT_KD', name: 'Khoa Kinh tế và Kinh doanh', isActive: true },
  { id: 'fac-vnuk-cntttt', institutionId: 'inst-vnuk', schoolReviewUnitId: 'unit-vnuk', code: 'VNUK_CNTT_TT', name: 'Khoa Công nghệ thông tin và Truyền thông', isActive: true },
  { id: 'fac-vnuk-khcn', institutionId: 'inst-vnuk', schoolReviewUnitId: 'unit-vnuk', code: 'VNUK_KH_CN', name: 'Khoa Khoa học và Công nghệ', isActive: true },

  // 9. Phân hiệu Đại học Đà Nẵng tại Kon Tum (UDCK / KONTUM) - 03 Khoa
  { id: 'fac-kontum-kt', institutionId: 'inst-kontum', schoolReviewUnitId: 'unit-kontum', code: 'KONTUM_KT', name: 'Khoa Kinh tế', isActive: true },
  { id: 'fac-kontum-lsp', institutionId: 'inst-kontum', schoolReviewUnitId: 'unit-kontum', code: 'KONTUM_LUAT_SP', name: 'Khoa Luật và Sư phạm', isActive: true },
  { id: 'fac-kontum-cn', institutionId: 'inst-kontum', schoolReviewUnitId: 'unit-kontum', code: 'KONTUM_CN', name: 'Khoa Công nghệ', isActive: true },
];

/**
 * Lấy danh sách Khoa theo institutionId
 */
export function getFacultiesByInstitution(institutionId?: string | null): CanonicalFaculty[] {
  if (!institutionId) return [];
  return CANONICAL_FACULTIES_2026.filter((f) => f.institutionId === institutionId && f.isActive);
}

/**
 * Tìm Khoa theo id
 */
export function getFacultyById(id?: string | null): CanonicalFaculty | undefined {
  if (!id) return undefined;
  return CANONICAL_FACULTIES_2026.find((f) => f.id === id);
}
