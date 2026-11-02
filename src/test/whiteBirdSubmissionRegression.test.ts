import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateWhiteBirdReadiness,
  submitWhiteBirdApplication,
  hydrateWhiteBirdStore,
  createWhiteBirdApplication,
  updateWhiteBirdWB01,
  updateWhiteBirdWB02,
  updateWhiteBirdWB03,
  addWhiteBirdEvidence,
  removeWhiteBirdEvidence,
  updateWhiteBirdEvidenceCategory,
  getAllWhiteBirdApplications,
} from '../components/white-bird/whiteBirdStore.js';
import {
  WhiteBirdApplication,
  WhiteBirdEvidenceItem,
  WhiteBirdOfficerTerm,
  WhiteBirdAnnualAchievement,
  calculateOfficerServiceMonths,
  checkConsecutiveAnnualAchievements,
  evaluateTruyenLuaPosition,
  isValidOptionalHttpUrl,
} from '../components/white-bird/whiteBirdTypes.js';

describe('White Bird Application — WB03 Optional for UOM_MAM & WB02 Refinement Regression Suite', () => {
  function mockEv(id: string, name: string, fileType = 'pdf'): WhiteBirdEvidenceItem {
    return {
      id,
      name,
      fileType,
      size: '1.5 MB',
      uploadedAt: '01/11/2026',
      status: 'has_evidence',
      url: `/blob/${name}`,
    };
  }

  // Helper to create a clean test app
  function createTestApplication(
    category: 'UOM_MAM' | 'TRUYEN_LUA' | 'SANG_TAO' = 'UOM_MAM',
    nomineeType: 'INDIVIDUAL' | 'COLLECTIVE' = 'COLLECTIVE'
  ): WhiteBirdApplication {
    hydrateWhiteBirdStore();
    return createWhiteBirdApplication({
      category,
      nomineeType,
      nomineeName: nomineeType === 'COLLECTIVE' ? 'CLB Sinh viên Nghiên cứu Khoa học DUT' : 'Nguyễn Văn A',
      nominationTitle: 'Mô hình Số hóa Sổ tay Sinh viên 5 tốt & Ngân hàng Minh chứng trực tuyến',
      studentId: '102220084',
      institutionId: 'DUT',
      institutionName: 'Trường Đại học Bách khoa – ĐHĐN',
      schoolReviewUnitId: 'unit-dut',
      schoolReviewUnitName: 'Hội Sinh viên ĐH Bách khoa',
      facultyName: 'Khoa Công nghệ Thông tin',
      className: '22T_DT1',
      academicYear: '2025–2026',
      contactPhone: '0905123456',
      preparedByUserId: 'usr-test-1',
      preparedByUserName: 'Nguyễn Văn A',
      preparedByUserEmail: 'nguyenvana@dut.udn.vn',
    });
  }

  it('1. WB01 + WB02 hoàn thiện, WB03 trống → canSubmit = true, không bị WB03 chặn nộp', () => {
    const app = createTestApplication('UOM_MAM', 'COLLECTIVE');

    // Fill WB01
    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'Ban Thư ký Hội Sinh viên Trường ĐH Bách khoa',
      endorsementSummary: 'Mô hình xuất sắc được Hội Sinh viên trường đánh giá cao',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('wb01-test-file-1', 'Van_ban_gioi_thieu.pdf'));

    // Fill WB02
    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Mô hình Số hóa Sổ tay Sinh viên 5 tốt',
      implementationPeriod: '10/2024 – 05/2025',
      contextAndObjectives: 'Xuất phát từ nhu cầu quản lý minh chứng trực quan của sinh viên',
      solutionAndExecution: 'Phát triển hệ thống web app hỗ trợ tự động tính điểm tiêu chí',
      impactAndResults: 'Hơn 5000 sinh viên tại ĐH Bách khoa đã sử dụng thành công',
      scalabilityAndSpread: 'Có khả năng áp dụng cho toàn bộ các trường thành viên ĐHĐN',
      exemplaryNature: 'Là mô hình tiên phong chuyển đổi số trong phong trào sinh viên',
      leadRepresentative: 'Nguyễn Văn A (MSSV 102220084, Trưởng nhóm)',
      leadUnit: 'Khoa Công nghệ Thông tin, Trường ĐH Bách khoa',
      leadPhone: '0905123456',
      leadEmail: 'nguyenvana@dut.udn.vn',
      presentationLink: 'https://youtube.com/watch?v=demo',
      coAuthorsOrTeamMembers: 'Trần Thị B – Kỹ thuật\nLê Văn C – Thiết kế',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('wb02-test-file-1', 'Bao_cao_thuyet_minh.pdf'));

    // WB03 is kept empty!
    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    const readiness = validateWhiteBirdReadiness(updated);

    assert.strictEqual(readiness.wb01Ready, true, 'WB01 should be ready');
    assert.strictEqual(readiness.wb02Ready, true, 'WB02 should be ready');
    assert.strictEqual(readiness.isWb03Optional, true, 'WB03 must be optional for UOM_MAM');
    assert.strictEqual(readiness.totalRequired, 2, 'Total required must be 2 for UOM_MAM');
    assert.strictEqual(readiness.readyCount, 2, 'Ready count must be 2/2');
    assert.strictEqual(readiness.canSubmit, true, 'canSubmit must be true even with empty WB03');
    assert.strictEqual(readiness.missingReasons.length, 0, 'No missing reasons when WB01 & WB02 are ready');

    // Submit should succeed
    const submitRes = submitWhiteBirdApplication(app.id);
    assert.strictEqual(submitRes.success, true, 'Submission must succeed');
    assert.strictEqual(submitRes.application?.status, 'submitted', 'Status must transition to submitted');
  });

  it('2. WB01 + WB02 hoàn thiện, WB03 có tệp → trạng thái hợp lệ, readyCount vẫn là 2/2', () => {
    const app = createTestApplication('UOM_MAM', 'COLLECTIVE');
    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'Ban Thư ký Hội Sinh viên Trường ĐH Bách khoa',
      endorsementSummary: 'Mô hình xuất sắc được đánh giá cao',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('f-wb01', 'VB_De_Nghi.pdf'));

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Mô hình Đổi mới Sáng tạo',
      implementationPeriod: '2024–2025',
      solutionAndExecution: 'Phương pháp triển khai mới',
      impactAndResults: 'Hiệu quả cao trong toàn trường',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('f-wb02', 'BC_Thuyet_Minh.pdf'));

    // Add WB03 illustration file and description
    updateWhiteBirdWB03(app.id, {
      awardOrRecognitionSummary: 'Hình ảnh hoạt động tập huấn chuyển đổi số',
      mediaAndProductLinks: 'https://youtube.com/watch?v=demo',
    });
    addWhiteBirdEvidence(app.id, 'WB03', mockEv('f-wb03', 'Hinh_anh_hoat_dong.jpg', 'jpg'));

    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    const readiness = validateWhiteBirdReadiness(updated);

    assert.strictEqual(readiness.canSubmit, true);
    assert.strictEqual(readiness.totalRequired, 2);
    assert.strictEqual(readiness.readyCount, 2);
    assert.strictEqual(readiness.wb03HasData, true, 'wb03HasData must be true when files/text present');
    assert.strictEqual(readiness.wb03Ready, true);

    const submitRes = submitWhiteBirdApplication(app.id);
    assert.strictEqual(submitRes.success, true);
  });

  it('3. Thêm rồi xóa tệp WB03 → tiến độ bắt buộc không thay đổi (vẫn 2/2)', () => {
    const app = createTestApplication('UOM_MAM', 'COLLECTIVE');
    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'Ban Thư ký Hội Sinh viên Trường',
      endorsementSummary: 'Tốt',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('f1', 'vb.pdf'));

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Mô hình A',
      implementationPeriod: '2024-2025',
      solutionAndExecution: 'Giải pháp tốt',
      impactAndResults: 'Hiệu quả cao',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('f2', 'bc.pdf'));

    // Add WB03 file
    addWhiteBirdEvidence(app.id, 'WB03', mockEv('f3', 'demo.png', 'png'));
    let ready = validateWhiteBirdReadiness(getAllWhiteBirdApplications().find((a) => a.id === app.id)!);
    assert.strictEqual(ready.readyCount, 2);
    assert.strictEqual(ready.totalRequired, 2);
    assert.strictEqual(ready.canSubmit, true);

    // Remove WB03 file
    removeWhiteBirdEvidence(app.id, 'WB03', 'f3');
    ready = validateWhiteBirdReadiness(getAllWhiteBirdApplications().find((a) => a.id === app.id)!);
    assert.strictEqual(ready.readyCount, 2, 'Ready count remains 2 after removing optional file');
    assert.strictEqual(ready.totalRequired, 2);
    assert.strictEqual(ready.canSubmit, true, 'canSubmit remains true after removing optional file');
  });

  it('4. WB01 hoặc WB02 chưa hoàn thiện → canSubmit = false, khóa nộp đúng quy tắc', () => {
    const app = createTestApplication('UOM_MAM', 'COLLECTIVE');

    // Only WB01 filled
    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'Ban Thư ký Hội Sinh viên Trường',
      endorsementSummary: 'Tốt',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('f1', 'vb.pdf'));

    const ready1 = validateWhiteBirdReadiness(getAllWhiteBirdApplications().find((a) => a.id === app.id)!);
    assert.strictEqual(ready1.readyCount, 1);
    assert.strictEqual(ready1.totalRequired, 2);
    assert.strictEqual(ready1.canSubmit, false);
    assert.ok(ready1.missingReasons.some((r) => r.includes('WB02')));

    const submitRes = submitWhiteBirdApplication(app.id);
    assert.strictEqual(submitRes.success, false);
    assert.ok(submitRes.error?.includes('WB02'));
  });

  it('5. Dữ liệu WB03 đã nhập từ trước (highestAwardLevel, decisionNumbers) vẫn đọc được', () => {
    const app = createTestApplication('UOM_MAM', 'COLLECTIVE');
    updateWhiteBirdWB03(app.id, {
      highestAwardLevel: 'Giải Ba cấp ĐHĐN',
      decisionNumbersAndDates: 'QĐ 123/QĐ-ĐHĐN ngày 12/03/2025',
      awardOrRecognitionSummary: 'Ảnh chụp lễ trao giải',
      mediaAndProductLinks: 'https://danang.vn/award',
    });

    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    assert.strictEqual(updated.requirements.wb03.highestAwardLevel, 'Giải Ba cấp ĐHĐN');
    assert.strictEqual(updated.requirements.wb03.decisionNumbersAndDates, 'QĐ 123/QĐ-ĐHĐN ngày 12/03/2025');
    assert.strictEqual(updated.requirements.wb03.awardOrRecognitionSummary, 'Ảnh chụp lễ trao giải');
    assert.strictEqual(updated.requirements.wb03.mediaAndProductLinks, 'https://danang.vn/award');
  });

  it('6. Auto-save WB03 và WB02 hoạt động bảo toàn toàn bộ trường mới (bao gồm thông tin Người đại diện)', () => {
    const app = createTestApplication('UOM_MAM', 'COLLECTIVE');
    updateWhiteBirdWB02(app.id, {
      scalabilityAndSpread: 'Có thể áp dụng cho 5 trường thành viên',
      exemplaryNature: 'Được tuyên dương là sáng kiến tiêu biểu cấp cơ sở',
      leadRepresentative: 'Nguyễn Văn A – Trưởng ban điều hành',
      leadUnit: 'Lớp 22T_DT1, Khoa CNTT, Trường ĐH Bách khoa',
      leadPhone: '0905999888',
      leadEmail: 'lead@dut.udn.vn',
      presentationLink: 'https://canva.com/design/demo',
      coAuthorsOrTeamMembers: 'Nguyễn Văn A – Trưởng nhóm\nTrần Văn B – Lập trình',
    });

    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    assert.strictEqual(updated.requirements.wb02.scalabilityAndSpread, 'Có thể áp dụng cho 5 trường thành viên');
    assert.strictEqual(updated.requirements.wb02.exemplaryNature, 'Được tuyên dương là sáng kiến tiêu biểu cấp cơ sở');
    assert.strictEqual(updated.requirements.wb02.leadRepresentative, 'Nguyễn Văn A – Trưởng ban điều hành');
    assert.strictEqual(updated.requirements.wb02.leadUnit, 'Lớp 22T_DT1, Khoa CNTT, Trường ĐH Bách khoa');
    assert.strictEqual(updated.requirements.wb02.leadPhone, '0905999888');
    assert.strictEqual(updated.requirements.wb02.leadEmail, 'lead@dut.udn.vn');
    assert.strictEqual(updated.requirements.wb02.presentationLink, 'https://canva.com/design/demo');
    assert.strictEqual(updated.requirements.wb02.coAuthorsOrTeamMembers, 'Nguyễn Văn A – Trưởng nhóm\nTrần Văn B – Lập trình');
  });

  it('7. Kho minh chứng cập nhật đúng tổng số lượng tệp của cả 3 mục', () => {
    const app = createTestApplication('UOM_MAM', 'COLLECTIVE');
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('f1', 'vb.pdf'));
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('f2', 'bc.pdf'));
    addWhiteBirdEvidence(app.id, 'WB03', mockEv('f3', 'img.png', 'png'));

    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    const totalFiles =
      updated.requirements.wb01.evidenceFiles.length +
      updated.requirements.wb02.evidenceFiles.length +
      updated.requirements.wb03.evidenceFiles.length;
    assert.strictEqual(totalFiles, 3);
  });

  it('8. Không ảnh hưởng WB03 của Cánh chim truyền lửa (TRUYEN_LUA) — WB03 vẫn bắt buộc (3/3)', () => {
    const app = createTestApplication('TRUYEN_LUA', 'INDIVIDUAL');
    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'BCH Liên chi Hội',
      endorsementSummary: 'Ủy viên gương mẫu',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('tl-1', 'vb.pdf'));

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Báo cáo thành tích cá nhân xuất sắc nhiều năm liền',
      implementationPeriod: '2023–2026',
      solutionAndExecution: 'Đóng góp tích cực vào công tác Hội',
      impactAndResults: 'Được tặng nhiều bằng khen',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('tl-2', 'bc.pdf'));

    // Leave WB03 empty
    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    const readiness = validateWhiteBirdReadiness(updated);

    assert.strictEqual(readiness.isWb03Optional, false, 'WB03 must NOT be optional for TRUYEN_LUA');
    assert.strictEqual(readiness.totalRequired, 3, 'Total required must be 3 for TRUYEN_LUA');
    assert.strictEqual(readiness.readyCount, 2, 'Ready count is 2/3 when WB03 is empty');
    assert.strictEqual(readiness.canSubmit, false, 'canSubmit must be false for TRUYEN_LUA when WB03 is empty');
    assert.ok(readiness.missingReasons.some((r) => r.includes('WB03')));

    // Once WB03 is filled with summary and file
    updateWhiteBirdWB03(app.id, {
      awardOrRecognitionSummary: 'Bằng khen Trung ương Hội Sinh viên Việt Nam năm 2024, 2025',
    });
    addWhiteBirdEvidence(app.id, 'WB03', mockEv('tl-3', 'bang_khen.pdf'));

    const updatedReady = validateWhiteBirdReadiness(getAllWhiteBirdApplications().find((a) => a.id === app.id)!);
    assert.strictEqual(updatedReady.readyCount, 3, 'Ready count is 3/3');
    assert.strictEqual(updatedReady.canSubmit, true, 'canSubmit is true');
  });

  it('9. Không ảnh hưởng WB03 của Cánh chim sáng tạo (SANG_TAO) — WB03 vẫn bắt buộc (3/3)', () => {
    const app = createTestApplication('SANG_TAO', 'INDIVIDUAL');
    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'Đơn vị giới thiệu',
      endorsementSummary: 'Đề tài xuất sắc',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('st-1', 'vb.pdf'));

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Dự án khởi nghiệp công nghệ AI',
      implementationPeriod: '2025',
      solutionAndExecution: 'Mô hình AI mới',
      impactAndResults: 'Ứng dụng vào 10 doanh nghiệp',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('st-2', 'bc.pdf'));

    // Leave WB03 empty
    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    const readiness = validateWhiteBirdReadiness(updated);

    assert.strictEqual(readiness.isWb03Optional, false, 'WB03 must NOT be optional for SANG_TAO');
    assert.strictEqual(readiness.totalRequired, 3, 'Total required must be 3 for SANG_TAO');
    assert.strictEqual(readiness.canSubmit, false, 'canSubmit must be false for SANG_TAO when WB03 is empty');
  });

  it('10. Đồng bộ backend: Hồ sơ Cánh chim ươm mầm nộp thành công đồng bộ nguyên vẹn lên store & backend sync', () => {
    const app = createTestApplication('UOM_MAM', 'COLLECTIVE');
    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'Hội Sinh viên ĐHĐN',
      endorsementSummary: 'Xuất sắc',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('b-wb01', 'vb.pdf'));

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Mô hình X',
      implementationPeriod: '2024-2025',
      solutionAndExecution: 'Giải pháp X',
      impactAndResults: 'Hiệu quả X',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('b-wb02', 'bc.pdf'));

    // WB03 is empty
    const res = submitWhiteBirdApplication(app.id);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.application?.status, 'submitted');
    assert.strictEqual(res.application?.submittedAt !== undefined, true);

    const fromStore = getAllWhiteBirdApplications().find((a) => a.id === app.id);
    assert.strictEqual(fromStore?.status, 'submitted');
    assert.strictEqual(fromStore?.requirements.wb03.evidenceFiles.length, 0);
  });

  it('11. Cánh chim sáng tạo (SANG_TAO) Cá nhân: Hoàn thiện đủ WB01, WB02, WB03 → canSubmit = true, readyCount = 3/3, nộp thành công', () => {
    const app = createTestApplication('SANG_TAO', 'INDIVIDUAL');

    // WB01
    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'Ban Thư ký Hội Sinh viên Trường ĐH Bách khoa',
      endorsementSummary: 'Đề tài xuất sắc đạt giải cao trong nghiên cứu khoa học',
      nominatingDocumentNumber: '12/TTr-HSV',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('st-ind-wb01', 'Van_ban_de_nghi_ST.pdf'));

    // WB02
    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Nghiên cứu ứng dụng công nghệ Edge AI trong giám sát giao thông đô thị',
      implementationPeriod: '09/2024 – 05/2026',
      contextAndObjectives: 'Giải quyết bài toán ùn tắc và giám sát phương tiện theo thời gian thực',
      solutionAndExecution: 'Phát triển mô hình nhận diện AI tối ưu chạy trên phần cứng nhúng',
      impactAndResults: 'Thử nghiệm đạt độ chính xác 96%, giảm độ trễ xử lý 40%',
      leadRepresentative: 'Nguyễn Văn A',
      leadUnit: 'Khoa CNTT – Trường ĐH Bách khoa',
      leadPhone: '0905123456',
      leadEmail: 'nguyenvana@dut.udn.vn',
      presentationLink: 'https://youtube.com/watch?v=demo-st',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('st-ind-wb02', 'Bao_cao_thuyet_minh_ST.pdf'));

    // WB03
    updateWhiteBirdWB03(app.id, {
      highestAwardLevel: 'Cấp Đại học Đà Nẵng',
      decisionNumbersAndDates: 'QĐ số 412/QĐ-ĐHĐN ngày 19/05/2026',
      awardOrRecognitionSummary: 'Giải Nhất Cuộc thi Sinh viên Nghiên cứu Khoa học cấp Đại học Đà Nẵng năm học 2025–2026',
      mediaAndProductLinks: 'https://udn.vn/tin-tuc/trao-giai-nckh-2026',
      practicalApplicationNote: 'Đã chuyển giao thử nghiệm tại Trung tâm Điều hành giao thông thông minh',
    });
    addWhiteBirdEvidence(app.id, 'WB03', mockEv('st-ind-wb03', 'Quyet_dinh_khen_thuong_NCKH_DHDN.pdf'));

    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    const readiness = validateWhiteBirdReadiness(updated);

    assert.strictEqual(readiness.wb01Ready, true);
    assert.strictEqual(readiness.wb02Ready, true);
    assert.strictEqual(readiness.wb03Ready, true);
    assert.strictEqual(readiness.isWb03Optional, false);
    assert.strictEqual(readiness.readyCount, 3);
    assert.strictEqual(readiness.totalRequired, 3);
    assert.strictEqual(readiness.canSubmit, true);

    const submitRes = submitWhiteBirdApplication(app.id);
    assert.strictEqual(submitRes.success, true);
    assert.strictEqual(submitRes.application?.status, 'submitted');
  });

  it('12. Cánh chim sáng tạo (SANG_TAO) Tập thể: Kê khai đầy đủ người chịu trách nhiệm chính, danh sách thành viên nhóm, cam kết bản quyền & minh chứng giải thưởng → lưu trữ đầy đủ, canSubmit = true', () => {
    const app = createTestApplication('SANG_TAO', 'COLLECTIVE');

    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'Ban Chấp hành Liên chi Hội Khoa Điện tử Viễn thông',
      endorsementSummary: 'Dự án khởi nghiệp đổi mới sáng tạo xuất sắc',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('st-col-wb01', 'Van_ban_LCH.pdf'));

    const teamList =
      '1. Nguyễn Văn A – MSSV 102220084 – Trưởng nhóm / Nghiên cứu chính\n2. Trần Thị B – MSSV 102220085 – Kỹ sư phần cứng IoT\n3. Lê Văn C – MSSV 102220086 – Phát triển ứng dụng Web/Mobile';

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Dự án Khởi nghiệp Thiết bị cảnh báo ngập lụt đô thị thông minh SmartFlood',
      implementationPeriod: 'Năm học 2025–2026',
      contextAndObjectives: 'Ứng phó tình trạng ngập lụt cục bộ tại khu vực đô thị Đà Nẵng',
      solutionAndExecution: 'Hệ thống cảm biến đo mức nước siêu âm kết nối truyền thông LoRaWAN',
      impactAndResults: 'Triển khai thử nghiệm 15 điểm đo tại quận Liên Chiểu, cảnh báo tin cậy cho 10.000 hộ dân',
      leadRepresentative: 'Nguyễn Văn A (Trưởng nhóm sáng lập)',
      leadUnit: 'Khoa Điện tử Viễn thông, Trường ĐH Bách khoa',
      leadPhone: '0905123456',
      leadEmail: 'nguyenvana@dut.udn.vn',
      coAuthorsOrTeamMembers: teamList,
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('st-col-wb02', 'Thuyet_minh_du_an_SmartFlood.pdf'));

    updateWhiteBirdWB03(app.id, {
      highestAwardLevel: 'Cấp Thành phố',
      decisionNumbersAndDates: 'QĐ số 89/QĐ-UBND ngày 28/04/2026',
      awardOrRecognitionSummary: 'Giải Nhì Cuộc thi Khởi nghiệp Đổi mới sáng tạo thành phố Đà Nẵng Festival Startup 2026',
    });
    addWhiteBirdEvidence(app.id, 'WB03', mockEv('st-col-wb03', 'Giay_chung_nhan_giai_thuong_startup.pdf'));

    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    const readiness = validateWhiteBirdReadiness(updated);

    assert.strictEqual(readiness.canSubmit, true);
    assert.strictEqual(readiness.readyCount, 3);
    assert.strictEqual(readiness.totalRequired, 3);
    assert.strictEqual(updated.requirements.wb02.coAuthorsOrTeamMembers, teamList);
    assert.strictEqual(updated.requirements.wb02.leadRepresentative, 'Nguyễn Văn A (Trưởng nhóm sáng lập)');
  });

  it('13. Kiểm tra tính nhất quán điều kiện nộp hồ sơ của cả 3 hạng mục: Ươm mầm (2/2), Truyền lửa (3/3), Sáng tạo (3/3)', () => {
    // 1. UOM_MAM: totalRequired = 2
    const uomMam = createTestApplication('UOM_MAM', 'COLLECTIVE');
    const uomMamReady = validateWhiteBirdReadiness(uomMam);
    assert.strictEqual(uomMamReady.isWb03Optional, true);
    assert.strictEqual(uomMamReady.totalRequired, 2);

    // 2. TRUYEN_LUA: totalRequired = 3, only INDIVIDUAL
    const truyenLua = createTestApplication('TRUYEN_LUA', 'INDIVIDUAL');
    assert.strictEqual(truyenLua.nomineeType, 'INDIVIDUAL');
    const truyenLuaReady = validateWhiteBirdReadiness(truyenLua);
    assert.strictEqual(truyenLuaReady.isWb03Optional, false);
    assert.strictEqual(truyenLuaReady.totalRequired, 3);

    // 3. SANG_TAO: totalRequired = 3, INDIVIDUAL or COLLECTIVE
    const sangTaoInd = createTestApplication('SANG_TAO', 'INDIVIDUAL');
    const sangTaoCol = createTestApplication('SANG_TAO', 'COLLECTIVE');
    assert.strictEqual(sangTaoInd.nomineeType, 'INDIVIDUAL');
    assert.strictEqual(sangTaoCol.nomineeType, 'COLLECTIVE');
    assert.strictEqual(validateWhiteBirdReadiness(sangTaoInd).totalRequired, 3);
    assert.strictEqual(validateWhiteBirdReadiness(sangTaoCol).totalRequired, 3);
  });

  it('14. URL Validation: isValidOptionalHttpUrl cho phép để trống, chấp nhận http/https hợp lệ, từ chối văn bản thô', () => {
    assert.strictEqual(isValidOptionalHttpUrl(''), true, 'Empty string is valid optional URL');
    assert.strictEqual(isValidOptionalHttpUrl('   '), true, 'Whitespace string is valid optional URL');
    assert.strictEqual(isValidOptionalHttpUrl(undefined), true, 'undefined is valid optional URL');
    assert.strictEqual(isValidOptionalHttpUrl(null), true, 'null is valid optional URL');
    assert.strictEqual(isValidOptionalHttpUrl('https://udn.vn/nckh'), true, 'HTTPS URL is valid');
    assert.strictEqual(isValidOptionalHttpUrl('http://startup.vn/demo'), true, 'HTTP URL is valid');
    assert.strictEqual(isValidOptionalHttpUrl('https://drive.google.com/file/d/123/view'), true, 'Google Drive URL is valid');

    // Invalid non-URL strings
    assert.strictEqual(isValidOptionalHttpUrl('không có link'), false, 'Plain text is rejected');
    assert.strictEqual(isValidOptionalHttpUrl('udn.vn/demo'), false, 'Missing protocol is rejected');
    assert.strictEqual(isValidOptionalHttpUrl('ftp://ftp.example.com'), false, 'FTP protocol is rejected');
    assert.strictEqual(isValidOptionalHttpUrl('file:///C:/test.pdf'), false, 'File protocol is rejected');
  });

  it('15. Cánh chim sáng tạo: Ô liên kết WB03 có văn bản sai định dạng URL sẽ bị chặn nộp; khi sửa đúng URL hoặc xóa trống thì nộp thành công', () => {
    const app = createTestApplication('SANG_TAO', 'INDIVIDUAL');

    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'Ban Thư ký Hội Sinh viên Trường ĐH Sư phạm Kỹ thuật',
      endorsementSummary: 'Đề tài xuất sắc',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('st15-wb01', 'Van_ban_gioi_thieu.pdf'));

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Hệ thống cảm biến đo nồng độ bụi mịn PM2.5 sử dụng năng lượng mặt trời',
      implementationPeriod: 'Năm học 2025–2026',
      contextAndObjectives: 'Ô nhiễm không khí tại các khu công nghiệp',
      solutionAndExecution: 'Thiết kế node cảm biến IoT năng lượng mặt trời',
      impactAndResults: 'Cung cấp dữ liệu quan trắc liên tục cho thành phố',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('st15-wb02', 'Bao_cao_thuyet_minh.pdf'));

    // Set WB03 with invalid URL (regular plain text)
    updateWhiteBirdWB03(app.id, {
      highestAwardLevel: 'Cấp Toàn quốc / Trung ương',
      awardOrRecognitionSummary: 'Giải Ba Cuộc thi Ý tưởng Khởi nghiệp Sáng tạo Sinh viên Toàn quốc năm 2025',
      mediaAndProductLinks: 'Bài viết đăng trên báo Giáo dục và Thời đại', // Invalid text, not URL!
    });
    addWhiteBirdEvidence(app.id, 'WB03', mockEv('st15-wb03', 'Chung_nhan_giai_ba.pdf'));

    let updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    let readiness = validateWhiteBirdReadiness(updated);

    assert.strictEqual(readiness.wb03Ready, false, 'WB03 must be not ready due to invalid URL');
    assert.strictEqual(readiness.canSubmit, false, 'Cannot submit when URL format is invalid');
    assert.ok(
      readiness.missingReasons.some((r) => r.includes('định dạng URL')),
      'Must contain missing reason about invalid URL format'
    );

    // Now fix: clear the optional URL field (empty string)
    updateWhiteBirdWB03(app.id, {
      mediaAndProductLinks: '',
    });
    updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    readiness = validateWhiteBirdReadiness(updated);

    assert.strictEqual(readiness.wb03Ready, true, 'WB03 must be ready when optional URL is empty');
    assert.strictEqual(readiness.canSubmit, true, 'Can submit when optional URL is empty');

    // Or set a valid HTTPS URL
    updateWhiteBirdWB03(app.id, {
      mediaAndProductLinks: 'https://giaoducthoidai.vn/trao-giai-khoi-nghiep-sinh-vien-2025',
    });
    updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    readiness = validateWhiteBirdReadiness(updated);

    assert.strictEqual(readiness.wb03Ready, true, 'WB03 must be ready with valid URL');
    assert.strictEqual(readiness.canSubmit, true, 'Can submit with valid URL');
    assert.strictEqual(readiness.readyCount, 3);

    const submitRes = submitWhiteBirdApplication(app.id);
    assert.strictEqual(submitRes.success, true);
  });

  it('16. Cánh chim sáng tạo Tập thể: Danh sách thành viên nhóm coAuthorsOrTeamMembers là thông tin hỗ trợ, không bắt buộc chặn nộp nếu để trống', () => {
    const app = createTestApplication('SANG_TAO', 'COLLECTIVE');

    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'Ban Thư ký Hội Sinh viên Trường ĐH Bách khoa',
      endorsementSummary: 'Đề tài sáng tạo xuất sắc',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('st16-wb01', 'Van_ban_gioi_thieu.pdf'));

    // WB02 without coAuthorsOrTeamMembers (left blank)
    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Dự án Nền tảng học tập số thông minh cho học sinh miền núi',
      implementationPeriod: 'Năm học 2025–2026',
      contextAndObjectives: 'Bối cảnh chuyển đổi số giáo dục vùng khó khăn',
      solutionAndExecution: 'Phát triển nền tảng học ngoại tuyến trên Raspberry Pi',
      impactAndResults: 'Triển khai tại 12 điểm trường',
      leadRepresentative: 'Nguyễn Văn A (Trưởng nhóm)',
      coAuthorsOrTeamMembers: '', // Left blank!
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('st16-wb02', 'Bao_cao_thuyet_minh.pdf'));

    updateWhiteBirdWB03(app.id, {
      highestAwardLevel: 'Cấp Bộ / Ngành',
      awardOrRecognitionSummary: 'Giải Nhất Cuộc thi Khoa học Kỹ thuật cấp Bộ',
    });
    addWhiteBirdEvidence(app.id, 'WB03', mockEv('st16-wb03', 'Giay_khen_bo.pdf'));

    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    const readiness = validateWhiteBirdReadiness(updated);

    assert.strictEqual(readiness.wb02Ready, true, 'WB02 should be ready even if team members list is empty');
    assert.strictEqual(readiness.canSubmit, true, 'Collective dossier can submit without mandatory team members list');
  });

  it('17. Cánh chim truyền lửa: calculateOfficerServiceMonths ghép khoảng công tác chính xác, không tính trùng lặp (Điểm c khoản 4.2 Điều 4)', () => {
    // Term 1: 09/2023 - 06/2025 (22 months)
    // Term 2: 01/2024 - 12/2024 (12 months, completely inside Term 1)
    const overlappingTerms: WhiteBirdOfficerTerm[] = [
      {
        id: 'term-1',
        position: 'Chi hội trưởng',
        unit: 'Chi hội 21TCLC_DT1',
        unitType: 'WITH_HOI',
        startMonthYear: '09/2023',
        endMonthYear: '06/2025',
      },
      {
        id: 'term-2',
        position: 'Ủy viên Ban Chấp hành Liên chi Hội',
        unit: 'Liên chi Hội Khoa CNTT',
        unitType: 'WITH_HOI',
        startMonthYear: '01/2024',
        endMonthYear: '12/2024',
      },
    ];

    const result = calculateOfficerServiceMonths(overlappingTerms);
    assert.strictEqual(result.mergedIntervalsCount, 1, 'Overlapping terms must merge into 1 single interval');
    assert.strictEqual(result.totalMonths, 22, 'Must be 22 months, NOT 34 months (no double counting)');
    assert.strictEqual(result.meetsTwoYearsRequirement, false, '22 months < 24 months, not yet 2 years');
    assert.ok(result.recommendation?.includes('24 tháng'), 'Must provide recommendation for >= 24 months');

    // Now add Term 3: 07/2025 - 10/2025 (4 additional months)
    const extendedTerms: WhiteBirdOfficerTerm[] = [
      ...overlappingTerms,
      {
        id: 'term-3',
        position: 'Phó Chủ nhiệm CLB',
        unit: 'CLB Tin học',
        unitType: 'WITH_HOI',
        startMonthYear: '07/2025',
        endMonthYear: '10/2025',
      },
    ];

    const extendedResult = calculateOfficerServiceMonths(extendedTerms);
    assert.strictEqual(extendedResult.totalMonths, 26, '22 + 4 = 26 months');
    assert.strictEqual(extendedResult.meetsTwoYearsRequirement, true, '26 months >= 24 months -> meets 2 years requirement');
    assert.strictEqual(extendedResult.recommendation, undefined, 'No missing recommendation when requirement is met');
  });

  it('18. Cánh chim truyền lửa: checkConsecutiveAnnualAchievements kiểm tra đúng tính liên tục trong 2 năm học', () => {
    // 2 consecutive years: 2023–2024 and 2024–2025
    const consecutiveAchievements: WhiteBirdAnnualAchievement[] = [
      {
        id: 'ach-1',
        academicYear: '2023–2024',
        roleOrPosition: 'Chi hội trưởng',
        achievementSummary: 'Hoàn thành xuất sắc nhiệm vụ công tác Hội cấp trường',
        awardLevel: 'TRUONG',
      },
      {
        id: 'ach-2',
        academicYear: '2024–2025',
        roleOrPosition: 'UV BCH Liên chi Hội',
        achievementSummary: 'Được tặng Giấy khen Hội Sinh viên Đại học Đà Nẵng',
        awardLevel: 'DHDN',
      },
    ];

    const resultConsecutive = checkConsecutiveAnnualAchievements(consecutiveAchievements);
    assert.strictEqual(resultConsecutive.hasTwoConsecutiveYears, true, '2023–2024 and 2024–2025 are consecutive');
    assert.ok(resultConsecutive.consecutiveYears !== null);
    assert.strictEqual(resultConsecutive.consecutiveYears[0], '2023–2024');
    assert.strictEqual(resultConsecutive.consecutiveYears[1], '2024–2025');

    // Non-consecutive years: 2022–2023 and 2024–2025 (gap in 2023-2024)
    const gapAchievements: WhiteBirdAnnualAchievement[] = [
      {
        id: 'ach-gap-1',
        academicYear: '2022–2023',
        roleOrPosition: 'Chi hội trưởng',
        achievementSummary: 'Khen thưởng cấp trường',
        awardLevel: 'TRUONG',
      },
      {
        id: 'ach-gap-2',
        academicYear: '2024–2025',
        roleOrPosition: 'UV BCH LCH',
        achievementSummary: 'Khen thưởng cấp ĐHĐN',
        awardLevel: 'DHDN',
      },
    ];

    const resultGap = checkConsecutiveAnnualAchievements(gapAchievements);
    assert.strictEqual(resultGap.hasTwoConsecutiveYears, false, '2022–2023 and 2024–2025 are NOT consecutive');
    assert.ok(resultGap.explanation.includes('tính liên tục'));
  });

  it('19. Cánh chim truyền lửa: evaluateTruyenLuaPosition kiểm tra đúng chức vụ tối thiểu theo loại hình đơn vị', () => {
    // Đơn vị có Hội: Chi hội trưởng trở lên -> hợp lệ
    const termsWithHoi: WhiteBirdOfficerTerm[] = [
      {
        id: 'term-hoi',
        position: 'Chi hội trưởng Chi hội 21TCLC_DT1',
        unit: 'Khoa CNTT',
        unitType: 'WITH_HOI',
        startMonthYear: '09/2023',
        endMonthYear: '06/2025',
      },
    ];
    const evalHoi = evaluateTruyenLuaPosition(termsWithHoi);
    assert.strictEqual(evalHoi.hasEligiblePosition, true, 'Chi hội trưởng is eligible for WITH_HOI');

    // Đơn vị không có Hội: Bí thư Chi đoàn trở lên -> hợp lệ
    const termsWithoutHoi: WhiteBirdOfficerTerm[] = [
      {
        id: 'term-doan',
        position: 'Bí thư Chi đoàn K45',
        unit: 'Phân hiệu Kon Tum',
        unitType: 'WITHOUT_HOI',
        startMonthYear: '09/2023',
        endMonthYear: '06/2025',
      },
    ];
    const evalDoan = evaluateTruyenLuaPosition(termsWithoutHoi);
    assert.strictEqual(evalDoan.hasEligiblePosition, true, 'Bí thư Chi đoàn is eligible for WITHOUT_HOI');

    // Chức vụ không đủ ngưỡng (Hội viên thường)
    const termsInvalid: WhiteBirdOfficerTerm[] = [
      {
        id: 'term-member',
        position: 'Hội viên tích cực',
        unit: 'Chi hội 21TCLC_DT1',
        unitType: 'WITH_HOI',
        startMonthYear: '09/2023',
        endMonthYear: '06/2025',
      },
    ];
    const evalInvalid = evaluateTruyenLuaPosition(termsInvalid);
    assert.strictEqual(evalInvalid.hasEligiblePosition, false, 'Regular member is not eligible');
  });

  it('20. Cánh chim truyền lửa (TRUYEN_LUA) End-to-End: Kê khai đủ 3/3 thành phần theo Khoản 6.2 Điều 6, gắn loại minh chứng WB03 và nộp thành công', () => {
    // 1. Tạo hồ sơ Cánh chim truyền lửa (chỉ cho Cá nhân)
    const app = createWhiteBirdApplication({
      nominationTitle: 'Hồ sơ đề cử Cánh chim truyền lửa — Nguyễn Văn A',
      category: 'TRUYEN_LUA',
      nomineeType: 'INDIVIDUAL',
      nomineeName: 'Nguyễn Văn A',
      studentId: '102210001',
      institutionId: 'DUT',
      institutionName: 'Trường Đại học Bách khoa – ĐHĐN',
      schoolReviewUnitId: 'unit-dut',
      schoolReviewUnitName: 'Hội Sinh viên Trường Đại học Bách khoa',
      facultyName: 'Khoa Công nghệ Thông tin',
      className: '21TCLC_DT1',
      academicYear: '2025–2026',
      contactPhone: '0905123456',
      preparedByUserId: 'user-filer-1',
      preparedByUserName: 'Trần Thị B (Bí thư LCH)',
      preparedByUserEmail: 'tranthib@udn.vn',
    });

    assert.strictEqual(app.category, 'TRUYEN_LUA');
    assert.strictEqual(app.nomineeType, 'INDIVIDUAL');
    assert.strictEqual(app.nomineeName, 'Nguyễn Văn A');
    assert.strictEqual(app.preparedByUserName, 'Trần Thị B (Bí thư LCH)');

    // 2. Kê khai WB01: Văn bản đề nghị của cấp bộ Hội có thẩm quyền (Điều 5, Điều 6)
    updateWhiteBirdWB01(app.id, {
      nominatingUnitType: 'BCH_LIEN_CHI_HOI',
      nominatingUnitName: 'Ban Chấp hành Liên chi Hội Khoa Công nghệ Thông tin',
      nominatingDocumentNumber: '12-TTr/LCH-CNTT',
      nominatingDate: '2026-04-10',
      nominatorSignerName: 'Trần Thị B (Bí thư LCH)',
      endorsementSummary: 'Đồng chí Nguyễn Văn A là cán bộ Hội gương mẫu, có thời gian cống hiến 3 năm liền và đạt nhiều thành tích xuất sắc.',
    });
    addWhiteBirdEvidence(app.id, 'WB01', mockEv('tl20-wb01', 'Van_ban_de_nghi_xet_trao.pdf'));

    // 3. Kê khai WB02: Báo cáo thành tích cá nhân theo mẫu
    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Báo cáo thành tích cá nhân đề nghị xét trao Giải thưởng Cánh chim trắng — Nguyễn Văn A',
      implementationPeriod: 'Giai đoạn 2023 – 2026',
      nomineeDateOfBirth: '15/08/2003',
      nomineeGender: 'NAM',
      nomineeEthnicity: 'Kinh',
      nomineeCurrentRole: 'Chi hội trưởng Chi hội 21TCLC_DT1',
      officerTerms: [
        {
          id: 'term-1',
          position: 'Chi hội phó',
          unit: 'Chi hội 21TCLC_DT1',
          unitType: 'WITH_HOI',
          startMonthYear: '09/2023',
          endMonthYear: '06/2024',
        },
        {
          id: 'term-2',
          position: 'Chi hội trưởng',
          unit: 'Chi hội 21TCLC_DT1',
          unitType: 'WITH_HOI',
          startMonthYear: '09/2024',
          endMonthYear: '06/2026',
          isCurrent: true,
        },
      ],
      annualAchievements: [
        {
          id: 'ach-1',
          academicYear: '2023–2024',
          roleOrPosition: 'Chi hội phó',
          achievementSummary: 'Hoàn thành xuất sắc nhiệm vụ công tác Hội cấp trường',
          awardLevel: 'TRUONG',
          documentReference: 'QĐ số 45/QĐ-HSV ngày 19/05/2024',
        },
        {
          id: 'ach-2',
          academicYear: '2024–2025',
          roleOrPosition: 'Chi hội trưởng',
          achievementSummary: 'Giấy khen Ban Thư ký Hội Sinh viên Đại học Đà Nẵng',
          awardLevel: 'DHDN',
          documentReference: 'QĐ số 89/QĐ-HSV-ĐHĐN ngày 20/05/2025',
        },
      ],
      academicAndPriority: {
        gpaText: '3.58 / 4.0',
        trainingScoreText: '95 / 100',
        sv5tRecognitions: 'Sinh viên 5 tốt cấp Trường năm 2024, Cấp ĐHĐN năm 2025',
        volunteerActivities: 'Đội phó Chiến dịch Mùa hè xanh 2024',
      },
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', mockEv('tl20-wb02', 'Bao_cao_thanh_tich_co_xac_nhan.pdf'));

    // 4. Kê khai WB03: Tài liệu minh chứng chức vụ & thành tích (KHÔNG bắt buộc highestAwardLevel)
    updateWhiteBirdWB03(app.id, {
      awardOrRecognitionSummary: '1. Quyết định công nhận Chi hội trưởng 21TCLC_DT1\n2. Giấy khen HSV trường 2023-2024\n3. Bằng khen HSV ĐHĐN 2024-2025',
      decisionNumbersAndDates: 'QĐ số 45/QĐ-HSV, QĐ số 89/QĐ-HSV-ĐHĐN',
    });
    const evCv = mockEv('tl20-wb03-1', 'Quyet_dinh_chuc_vu.pdf');
    const evTk = mockEv('tl20-wb03-2', 'Bang_khen_hai_nam.pdf');
    addWhiteBirdEvidence(app.id, 'WB03', evCv);
    addWhiteBirdEvidence(app.id, 'WB03', evTk);

    // Gắn thẻ / category cho minh chứng WB03
    updateWhiteBirdEvidenceCategory(app.id, 'WB03', evCv.id, 'CHUC_VU');
    updateWhiteBirdEvidenceCategory(app.id, 'WB03', evTk.id, 'THANH_TICH_2_NAM');

    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    assert.strictEqual(
      updated.requirements.wb03.evidenceFiles.find((f) => f.id === evCv.id)?.evidenceCategory,
      'CHUC_VU',
      'Evidence category CHUC_VU must be saved'
    );
    assert.strictEqual(
      updated.requirements.wb03.evidenceFiles.find((f) => f.id === evTk.id)?.evidenceCategory,
      'THANH_TICH_2_NAM',
      'Evidence category THANH_TICH_2_NAM must be saved'
    );

    // 5. Kiểm tra tính sẵn sàng nộp (readiness)
    const readiness = validateWhiteBirdReadiness(updated);
    assert.strictEqual(readiness.isWb03Optional, false, 'WB03 is mandatory for TRUYEN_LUA');
    assert.strictEqual(readiness.totalRequired, 3, 'Must require 3 components (WB01, WB02, WB03)');
    assert.strictEqual(readiness.wb01Ready, true, 'WB01 is ready');
    assert.strictEqual(readiness.wb02Ready, true, 'WB02 is ready');
    assert.strictEqual(readiness.wb03Ready, true, 'WB03 is ready');
    assert.strictEqual(readiness.readyCount, 3, 'All 3 components are ready');
    assert.strictEqual(readiness.canSubmit, true, 'canSubmit must be true');
    assert.strictEqual(readiness.missingReasons.length, 0, 'No missing reasons');

    // 6. Nộp hồ sơ
    const submitResult = submitWhiteBirdApplication(app.id);
    assert.strictEqual(submitResult.success, true, 'Submission must succeed');
    assert.strictEqual(submitResult.application?.status, 'submitted', 'Status must be updated to submitted');
  });
});
