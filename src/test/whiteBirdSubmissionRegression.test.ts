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
  getAllWhiteBirdApplications,
} from '../components/white-bird/whiteBirdStore.js';
import { WhiteBirdApplication } from '../components/white-bird/whiteBirdTypes.js';

describe('White Bird Application — WB03 Optional for UOM_MAM & WB02 Refinement Regression Suite', () => {
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
      institutionId: 'DUT',
      institutionName: 'Trường Đại học Bách khoa – ĐHĐN',
      facultyName: 'Khoa Công nghệ Thông tin',
      academicYear: '2025–2026',
      preparedByUserName: 'Nguyễn Văn A',
      preparedByStudentId: '102220084',
    });
  }

  it('1. WB01 + WB02 hoàn thiện, WB03 trống → canSubmit = true, không bị WB03 chặn nộp', () => {
    const app = createTestApplication('UOM_MAM', 'COLLECTIVE');

    // Fill WB01
    updateWhiteBirdWB01(app.id, {
      nominatingUnitName: 'Ban Thư ký Hội Sinh viên Trường ĐH Bách khoa',
      endorsementSummary: 'Mô hình xuất sắc được Hội Sinh viên trường đánh giá cao',
    });
    addWhiteBirdEvidence(app.id, 'WB01', {
      id: 'wb01-test-file-1',
      name: 'Van_ban_gioi_thieu.pdf',
      fileType: 'pdf',
      size: '2.4 MB',
      uploadedAt: '01/11/2026',
      url: '/blob/wb01.pdf',
    });

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
      coAuthorsOrTeamMembers: 'Trần Thị B – Kỹ thuật\nLê Văn C – Thiết kế',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', {
      id: 'wb02-test-file-1',
      name: 'Bao_cao_thuyet_minh.pdf',
      fileType: 'pdf',
      size: '4.8 MB',
      uploadedAt: '01/11/2026',
      url: '/blob/wb02.pdf',
    });

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
    addWhiteBirdEvidence(app.id, 'WB01', {
      id: 'f-wb01',
      name: 'VB_De_Nghi.pdf',
      fileType: 'pdf',
      size: '1.2 MB',
      uploadedAt: '01/11/2026',
    });

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Mô hình Đổi mới Sáng tạo',
      implementationPeriod: '2024–2025',
      solutionAndExecution: 'Phương pháp triển khai mới',
      impactAndResults: 'Hiệu quả cao trong toàn trường',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', {
      id: 'f-wb02',
      name: 'BC_Thuyet_Minh.pdf',
      fileType: 'pdf',
      size: '3.1 MB',
      uploadedAt: '01/11/2026',
    });

    // Add WB03 illustration file and description
    updateWhiteBirdWB03(app.id, {
      awardOrRecognitionSummary: 'Hình ảnh hoạt động tập huấn chuyển đổi số',
      mediaAndProductLinks: 'https://youtube.com/watch?v=demo',
    });
    addWhiteBirdEvidence(app.id, 'WB03', {
      id: 'f-wb03',
      name: 'Hinh_anh_hoat_dong.jpg',
      fileType: 'jpg',
      size: '1.5 MB',
      uploadedAt: '01/11/2026',
    });

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
    addWhiteBirdEvidence(app.id, 'WB01', { id: 'f1', name: 'vb.pdf', fileType: 'pdf', size: '1MB', uploadedAt: 'today' });

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Mô hình A',
      implementationPeriod: '2024-2025',
      solutionAndExecution: 'Giải pháp tốt',
      impactAndResults: 'Hiệu quả cao',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', { id: 'f2', name: 'bc.pdf', fileType: 'pdf', size: '1MB', uploadedAt: 'today' });

    // Add WB03 file
    addWhiteBirdEvidence(app.id, 'WB03', { id: 'f3', name: 'demo.png', fileType: 'png', size: '500KB', uploadedAt: 'today' });
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
    addWhiteBirdEvidence(app.id, 'WB01', { id: 'f1', name: 'vb.pdf', fileType: 'pdf', size: '1MB', uploadedAt: 'today' });

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

  it('6. Auto-save WB03 và WB02 hoạt động bảo toàn toàn bộ trường mới', () => {
    const app = createTestApplication('UOM_MAM', 'COLLECTIVE');
    updateWhiteBirdWB02(app.id, {
      scalabilityAndSpread: 'Có thể áp dụng cho 5 trường thành viên',
      exemplaryNature: 'Được tuyên dương là sáng kiến tiêu biểu cấp cơ sở',
      leadRepresentative: 'Nguyễn Văn A – Trưởng ban điều hành',
      coAuthorsOrTeamMembers: 'Nguyễn Văn A – Trưởng nhóm\nTrần Văn B – Lập trình',
    });

    const updated = getAllWhiteBirdApplications().find((a) => a.id === app.id)!;
    assert.strictEqual(updated.requirements.wb02.scalabilityAndSpread, 'Có thể áp dụng cho 5 trường thành viên');
    assert.strictEqual(updated.requirements.wb02.exemplaryNature, 'Được tuyên dương là sáng kiến tiêu biểu cấp cơ sở');
    assert.strictEqual(updated.requirements.wb02.leadRepresentative, 'Nguyễn Văn A – Trưởng ban điều hành');
    assert.strictEqual(updated.requirements.wb02.coAuthorsOrTeamMembers, 'Nguyễn Văn A – Trưởng nhóm\nTrần Văn B – Lập trình');
  });

  it('7. Kho minh chứng cập nhật đúng tổng số lượng tệp của cả 3 mục', () => {
    const app = createTestApplication('UOM_MAM', 'COLLECTIVE');
    addWhiteBirdEvidence(app.id, 'WB01', { id: 'f1', name: 'vb.pdf', fileType: 'pdf', size: '1MB', uploadedAt: 'today' });
    addWhiteBirdEvidence(app.id, 'WB02', { id: 'f2', name: 'bc.pdf', fileType: 'pdf', size: '2MB', uploadedAt: 'today' });
    addWhiteBirdEvidence(app.id, 'WB03', { id: 'f3', name: 'img.png', fileType: 'png', size: '500KB', uploadedAt: 'today' });

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
    addWhiteBirdEvidence(app.id, 'WB01', { id: 'tl-1', name: 'vb.pdf', fileType: 'pdf', size: '1MB', uploadedAt: 'today' });

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Báo cáo thành tích cá nhân xuất sắc nhiều năm liền',
      implementationPeriod: '2023–2026',
      solutionAndExecution: 'Đóng góp tích cực vào công tác Hội',
      impactAndResults: 'Được tặng nhiều bằng khen',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', { id: 'tl-2', name: 'bc.pdf', fileType: 'pdf', size: '2MB', uploadedAt: 'today' });

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
    addWhiteBirdEvidence(app.id, 'WB03', { id: 'tl-3', name: 'bang_khen.pdf', fileType: 'pdf', size: '1MB', uploadedAt: 'today' });

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
    addWhiteBirdEvidence(app.id, 'WB01', { id: 'st-1', name: 'vb.pdf', fileType: 'pdf', size: '1MB', uploadedAt: 'today' });

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Dự án khởi nghiệp công nghệ AI',
      implementationPeriod: '2025',
      solutionAndExecution: 'Mô hình AI mới',
      impactAndResults: 'Ứng dụng vào 10 doanh nghiệp',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', { id: 'st-2', name: 'bc.pdf', fileType: 'pdf', size: '2MB', uploadedAt: 'today' });

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
    addWhiteBirdEvidence(app.id, 'WB01', { id: 'b-wb01', name: 'vb.pdf', fileType: 'pdf', size: '1MB', uploadedAt: 'today' });

    updateWhiteBirdWB02(app.id, {
      reportTitle: 'Mô hình X',
      implementationPeriod: '2024-2025',
      solutionAndExecution: 'Giải pháp X',
      impactAndResults: 'Hiệu quả X',
      commitmentConfirmed: true,
    });
    addWhiteBirdEvidence(app.id, 'WB02', { id: 'b-wb02', name: 'bc.pdf', fileType: 'pdf', size: '1MB', uploadedAt: 'today' });

    // WB03 is empty
    const res = submitWhiteBirdApplication(app.id);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.application?.status, 'submitted');
    assert.strictEqual(res.application?.submittedAt !== undefined, true);

    const fromStore = getAllWhiteBirdApplications().find((a) => a.id === app.id);
    assert.strictEqual(fromStore?.status, 'submitted');
    assert.strictEqual(fromStore?.requirements.wb03.evidenceFiles.length, 0);
  });
});
