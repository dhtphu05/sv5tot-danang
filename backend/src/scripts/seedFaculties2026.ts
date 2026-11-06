/**
 * 5TOT Đà Nẵng — Seed Script: 49 Khoa thuộc 08 Trường / Viện thành viên ĐHĐN tại Đà Nẵng (Cập nhật 2026)
 */

import 'dotenv/config';
import { dbManager } from '../shared/database/prismaClient';

export const FACULTIES_SEED_2026 = [
  // 1. Trường Đại học Bách khoa (DUT) - 09 Khoa
  { id: 'fac-dut-dtttnt', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-udn', code: 'DUT_DT_AI', name: 'Khoa Điện tử và Trí tuệ nhân tạo' },
  { id: 'fac-dut-ckgtnl', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-udn', code: 'DUT_CKGT_NL', name: 'Khoa Cơ khí Giao thông và Năng lượng' },
  { id: 'fac-dut-hmtss', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-udn', code: 'DUT_HOA_MT_SS', name: 'Khoa Hóa, Môi trường và Khoa học Sự sống' },
  { id: 'fac-dut-xd', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-udn', code: 'DUT_XD', name: 'Khoa Xây dựng' },
  { id: 'fac-dut-dien', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-udn', code: 'DUT_DIEN', name: 'Khoa Điện' },
  { id: 'fac-dut-ck', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-udn', code: 'DUT_CK', name: 'Khoa Cơ khí' },
  { id: 'fac-dut-cntt', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-udn', code: 'DUT_CNTT', name: 'Khoa Công nghệ Thông tin' },
  { id: 'fac-dut-qldacn', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-udn', code: 'DUT_QLDA_CN', name: 'Khoa Quản lý Dự án và Công nghiệp' },
  { id: 'fac-dut-kt', institutionId: 'inst-dut', schoolReviewUnitId: 'unit-udn', code: 'DUT_KT', name: 'Khoa Kiến trúc' },

  // 2. Trường Đại học Kinh tế (DUE) - 08 Khoa
  { id: 'fac-due-qtkd', institutionId: 'inst-due', schoolReviewUnitId: 'unit-udn', code: 'DUE_QTKD', name: 'Khoa Quản trị kinh doanh' },
  { id: 'fac-due-kt', institutionId: 'inst-due', schoolReviewUnitId: 'unit-udn', code: 'DUE_KT', name: 'Khoa Kinh tế' },
  { id: 'fac-due-ketoan', institutionId: 'inst-due', schoolReviewUnitId: 'unit-udn', code: 'DUE_KETOAN', name: 'Khoa Kế toán' },
  { id: 'fac-due-luat', institutionId: 'inst-due', schoolReviewUnitId: 'unit-udn', code: 'DUE_LUAT', name: 'Khoa Luật' },
  { id: 'fac-due-llct', institutionId: 'inst-due', schoolReviewUnitId: 'unit-udn', code: 'DUE_LLCT', name: 'Khoa Lý luận chính trị' },
  { id: 'fac-due-tcnh', institutionId: 'inst-due', schoolReviewUnitId: 'unit-udn', code: 'DUE_TCNH', name: 'Khoa Tài chính - Ngân hàng' },
  { id: 'fac-due-dlkdqt', institutionId: 'inst-due', schoolReviewUnitId: 'unit-udn', code: 'DUE_DL_KDQT', name: 'Khoa Du lịch và Kinh doanh quốc tế' },
  { id: 'fac-due-tmdtcns', institutionId: 'inst-due', schoolReviewUnitId: 'unit-udn', code: 'DUE_TMDT_MKT_CNS', name: 'Khoa Thương mại điện tử - Marketing và Công nghệ số' },

  // 3. Trường Đại học Sư phạm (UED) - 08 Khoa
  { id: 'fac-ued-toantin', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-udn', code: 'UED_TOAN_TIN', name: 'Khoa Toán - Tin' },
  { id: 'fac-ued-lyhoa', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-udn', code: 'UED_LY_HOA', name: 'Khoa Lý - Hóa' },
  { id: 'fac-ued-snnmt', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-udn', code: 'UED_SINH_NN_MT', name: 'Khoa Sinh - Nông nghiệp - Môi trường' },
  { id: 'fac-ued-nvtt', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-udn', code: 'UED_VAN_TT', name: 'Khoa Ngữ văn - Truyền thông' },
  { id: 'fac-ued-sdct', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-udn', code: 'UED_SU_DIA_CT', name: 'Khoa Sử - Địa - Chính trị' },
  { id: 'fac-ued-tlgdctxh', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-udn', code: 'UED_TL_GD_CTXH', name: 'Khoa Tâm lý - Giáo dục - Công tác xã hội' },
  { id: 'fac-ued-gdthmn', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-udn', code: 'UED_GDTH_MN', name: 'Khoa Giáo dục Tiểu học - Mầm non' },
  { id: 'fac-ued-gdnttc', institutionId: 'inst-ued', schoolReviewUnitId: 'unit-udn', code: 'UED_GDNT_TC', name: 'Khoa Giáo dục Nghệ thuật - Thể chất' },

  // 4. Trường Đại học Ngoại ngữ (UFL) - 09 Khoa
  { id: 'fac-ufl-ta', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-udn', code: 'UFL_TA', name: 'Khoa Tiếng Anh' },
  { id: 'fac-ufl-tacn', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-udn', code: 'UFL_TACN', name: 'Khoa Tiếng Anh chuyên ngành' },
  { id: 'fac-ufl-spnn', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-udn', code: 'UFL_SPNN', name: 'Khoa Sư phạm Ngoại ngữ' },
  { id: 'fac-ufl-tq', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-udn', code: 'UFL_TQ', name: 'Khoa Ngôn ngữ và Văn hóa Trung Quốc' },
  { id: 'fac-ufl-qth', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-udn', code: 'UFL_QTH', name: 'Khoa Quốc tế học' },
  { id: 'fac-ufl-hq', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-udn', code: 'UFL_HQ', name: 'Khoa Ngôn ngữ và Văn hóa Hàn Quốc' },
  { id: 'fac-ufl-chauau', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-udn', code: 'UFL_CAU_AU', name: 'Khoa Ngôn ngữ và Văn hóa Châu Âu' },
  { id: 'fac-ufl-nhatban', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-udn', code: 'UFL_NB', name: 'Khoa Ngôn ngữ và Văn hóa Nhật Bản' },
  { id: 'fac-ufl-vndna', institutionId: 'inst-ufl', schoolReviewUnitId: 'unit-udn', code: 'UFL_VN_DNA', name: 'Khoa Ngôn ngữ và Văn hóa Việt Nam – Đông Nam Á' },

  // 5. Trường Đại học Sư phạm Kỹ thuật (UTE) - 05 Khoa
  { id: 'fac-ute-ck', institutionId: 'inst-ute', schoolReviewUnitId: 'unit-udn', code: 'UTE_CK', name: 'Khoa Cơ khí' },
  { id: 'fac-ute-ddt', institutionId: 'inst-ute', schoolReviewUnitId: 'unit-udn', code: 'UTE_D_DT', name: 'Khoa Điện - Điện tử' },
  { id: 'fac-ute-ktxd', institutionId: 'inst-ute', schoolReviewUnitId: 'unit-udn', code: 'UTE_KTXD', name: 'Khoa Kỹ thuật Xây dựng' },
  { id: 'fac-ute-cnhhmt', institutionId: 'inst-ute', schoolReviewUnitId: 'unit-udn', code: 'UTE_CNHH_MT', name: 'Khoa Công nghệ Hóa học - Môi trường' },
  { id: 'fac-ute-cns', institutionId: 'inst-ute', schoolReviewUnitId: 'unit-udn', code: 'UTE_CNS', name: 'Khoa Công nghệ số' },

  // 6. Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU) - 03 Khoa
  { id: 'fac-vku-khmt', institutionId: 'inst-vku', schoolReviewUnitId: 'unit-udn', code: 'VKU_KHMT', name: 'Khoa Khoa học máy tính' },
  { id: 'fac-vku-ktmtdt', institutionId: 'inst-vku', schoolReviewUnitId: 'unit-udn', code: 'VKU_KTMT_DT', name: 'Khoa Kỹ thuật máy tính và Điện tử' },
  { id: 'fac-vku-ktstmdt', institutionId: 'inst-vku', schoolReviewUnitId: 'unit-udn', code: 'VKU_KTS_TMDT', name: 'Khoa Kinh tế số và Thương mại điện tử' },

  // 7. Trường Y Dược (SMP) - 04 Khoa
  { id: 'fac-smp-y', institutionId: 'inst-smp', schoolReviewUnitId: 'unit-udn', code: 'SMP_Y', name: 'Khoa Y' },
  { id: 'fac-smp-rhm', institutionId: 'inst-smp', schoolReviewUnitId: 'unit-udn', code: 'SMP_RHM', name: 'Khoa Răng - Hàm - Mặt' },
  { id: 'fac-smp-duoc', institutionId: 'inst-smp', schoolReviewUnitId: 'unit-udn', code: 'SMP_DUOC', name: 'Khoa Dược' },
  { id: 'fac-smp-ddktyh', institutionId: 'inst-smp', schoolReviewUnitId: 'unit-udn', code: 'SMP_DD_KTYH', name: 'Khoa Điều dưỡng và Kỹ thuật y học' },

  // 8. Viện Nghiên cứu và Đào tạo Việt - Anh (VNUK) - 03 Khoa
  { id: 'fac-vnuk-ktkd', institutionId: 'inst-vnuk', schoolReviewUnitId: 'unit-udn', code: 'VNUK_KT_KD', name: 'Khoa Kinh tế và Kinh doanh' },
  { id: 'fac-vnuk-cntttt', institutionId: 'inst-vnuk', schoolReviewUnitId: 'unit-udn', code: 'VNUK_CNTT_TT', name: 'Khoa Công nghệ thông tin và Truyền thông' },
  { id: 'fac-vnuk-khcn', institutionId: 'inst-vnuk', schoolReviewUnitId: 'unit-udn', code: 'VNUK_KH_CN', name: 'Khoa Khoa học và Công nghệ' },
];

export async function runFacultySeed() {
  const prisma = await dbManager.getClient();
  console.log('Seeding 49 canonical faculties for 08 UDN member institutions in Da Nang...');
  let count = 0;
  for (const fac of FACULTIES_SEED_2026) {
    await prisma.facultyDepartment.upsert({
      where: {
        institutionId_code: {
          institutionId: fac.institutionId,
          code: fac.code,
        },
      },
      update: {
        schoolReviewUnitId: fac.schoolReviewUnitId,
        name: fac.name,
        isActive: true,
      },
      create: {
        id: fac.id,
        institutionId: fac.institutionId,
        schoolReviewUnitId: fac.schoolReviewUnitId,
        code: fac.code,
        name: fac.name,
        isActive: true,
      },
    });
    count++;
  }
  console.log(`✅ Successfully seeded/verified ${count} faculties in database.`);
}

if (process.argv[1]?.endsWith('seedFaculties2026.ts')) {
  runFacultySeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Failed to seed faculties:', err);
      process.exit(1);
    });
}
