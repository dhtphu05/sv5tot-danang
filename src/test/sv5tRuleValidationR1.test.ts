/**
 * 5TOT ĐHĐN — Automated Verification Suite for Phase SV5T-R1
 * Validates 10 Mandatory Rule Scenarios:
 * 1. Declaration with content but without evidence.
 * 2. Academic: Declaring TC2.2 while omitting mandatory TC2.1 (GPA).
 * 3. Partial evidence across declared items.
 * 4. Physical: Exactly 1 valid option selected among TC3.1–TC3.4.
 * 5. Volunteer: Using TC4.2 (Campaign) or TC4.3 (Award) without 3-day restriction.
 * 6. Integration: Having TC5.1 but omitting TC5.3 (Activity).
 * 7. Integration: Having TC5.3 but omitting Language/Intl (Group C).
 * 8. Optional Priority criteria: Not flagged as missing when undeclared.
 * 9. Multiline Vietnamese declaration titles and score validations.
 * 10. Submission states: Submitted, Supplement Required, and Under Review.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_STUDENT_APPLICATION,
  StudentApplicationData,
  ApplicationCriterion,
} from '../demo/fixtures/studentApplication';
import {
  computeDynamicPreSubmitAdvisories,
  computeCriteriaAdvisoryStatuses,
} from '../entities/application/studentApplicationMutators';
import { validateDeclarationValue } from '../components/application/AddEditDeclarationModal';
import { getApplicationDisplayState } from '../demo/studentSelectors';

describe('PHASE SV5T-R1 — Comprehensive 5-Criteria Validation Suite', () => {
  // Helper to build a clean blank application
  const createBlankApplication = (): StudentApplicationData => {
    const raw = JSON.parse(JSON.stringify(INITIAL_STUDENT_APPLICATION)) as StudentApplicationData;
    for (const c of raw.criteria) {
      for (const r of c.requirements) {
        r.declarations = [];
        r.status = 'undeclared';
      }
    }
    return raw;
  };

  // Helper to add declaration to requirement
  const addDeclaration = (
    app: StudentApplicationData,
    critId: string,
    reqId: string,
    val: string,
    filesCount = 1
  ) => {
    const crit = app.criteria.find((c) => c.id === critId);
    const req = crit?.requirements.find((r) => r.id === reqId);
    if (!req) throw new Error(`Requirement ${reqId} not found`);

    const files = Array.from({ length: filesCount }, (_, i) => ({
      id: `ev-${reqId}-${Date.now()}-${i}`,
      name: `Minh_chung_${reqId}_${i + 1}.pdf`,
      fileType: 'pdf',
      size: '1.2 MB',
      uploadedAt: '03/11/2026',
      status: 'ready' as const,
      url: `/files/minhchung_${i}.pdf`,
    }));

    req.declarations.push({
      id: `decl-${reqId}-${Date.now()}`,
      value: val,
      detail: 'Xác nhận hợp lệ',
      date: '03/11/2026',
      evidenceFiles: files,
    });
    req.status = filesCount > 0 ? 'has_evidence' : 'declared';
  };

  // ---------------------------------------------------------------------------
  // SCENARIO 1: Declaration without evidence
  // ---------------------------------------------------------------------------
  test('Scenario 1: Kê khai một tiêu chuẩn nhưng không đính kèm minh chứng', () => {
    const app = createBlankApplication();
    // Add GPA without evidence files
    addDeclaration(app, 'academic', 'academic-gpa', '3.65 / 4.00', 0);

    const advisories = computeDynamicPreSubmitAdvisories(app.criteria);
    const noEvAdv = advisories.find((a) => a.id === 'adv-no-ev-academic-gpa');

    assert.ok(noEvAdv, 'Phải phát hiện và gắn cảnh báo thiếu tệp minh chứng cho GPA');
    assert.strictEqual(noEvAdv?.actionLabel, 'Bổ sung');
    assert.ok(noEvAdv?.message.includes('chưa đính kèm bảng điểm'));
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 2: Academic TC2.2 declared but TC2.1 (GPA) omitted
  // ---------------------------------------------------------------------------
  test('Scenario 2: Kê khai TC2.2 (NCKH) nhưng bỏ trống TC2.1 (GPA)', () => {
    const app = createBlankApplication();
    // Declare NCKH with evidence, but leave GPA completely empty
    addDeclaration(
      app,
      'academic',
      'academic-nckh',
      'Đề tài NCKH Sinh viên cấp Trường đạt giải Nhì',
      1
    );

    const advisories = computeDynamicPreSubmitAdvisories(app.criteria);
    const missingGpaAdv = advisories.find((a) => a.id === 'adv-missing-academic-gpa');

    assert.ok(missingGpaAdv, 'Bắt buộc phải phát hiện thiếu GPA (TC2.1)');
    assert.strictEqual(missingGpaAdv?.requirementId, 'academic-gpa');
    assert.strictEqual(missingGpaAdv?.actionLabel, 'Kê khai');

    const statuses = computeCriteriaAdvisoryStatuses(app.criteria, advisories);
    const acaStatus = statuses.find((s) => s.id === 'academic');

    assert.strictEqual(
      acaStatus?.statusLabel,
      'Chưa đủ điều kiện',
      'Tiêu chí Học tập tốt phải báo "Chưa đủ điều kiện", không được báo "Đã có thông tin"'
    );
    assert.strictEqual(acaStatus?.statusTone, 'advisory');
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 3: Partial evidence across declared items
  // ---------------------------------------------------------------------------
  test('Scenario 3: Đã có một minh chứng nhưng thiếu loại minh chứng khác theo yêu cầu', () => {
    const app = createBlankApplication();
    // Declare GPA with file, but declare NCKH without file
    addDeclaration(app, 'academic', 'academic-gpa', '3.70 / 4.00', 1);
    addDeclaration(app, 'academic', 'academic-nckh', 'Đề tài Nghiên cứu khoa học sinh viên', 0);

    const advisories = computeDynamicPreSubmitAdvisories(app.criteria);
    const nckhNoEv = advisories.find((a) => a.id === 'adv-no-ev-academic-academic-nckh');

    assert.ok(nckhNoEv, 'Phải chỉ rõ mục NCKH chưa đính kèm tệp minh chứng');

    const statuses = computeCriteriaAdvisoryStatuses(app.criteria, advisories);
    const acaStatus = statuses.find((s) => s.id === 'academic');
    assert.strictEqual(acaStatus?.statusLabel, 'Thiếu minh chứng');
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 4: Physical: Exactly 1 valid option selected among TC3.1–TC3.4
  // ---------------------------------------------------------------------------
  test('Scenario 4: Chỉ chọn một phương án hợp lệ của Thể lực tốt (TC3.4 - Điểm GDTC)', () => {
    const app = createBlankApplication();
    // Declare only TC3.4 (PE Grade) with evidence
    addDeclaration(app, 'physical', 'physical-pe-grade', 'Điểm Giáo dục thể chất loại Giỏi (8.5/10)', 1);

    const advisories = computeDynamicPreSubmitAdvisories(app.criteria);
    const physAdvisories = advisories.filter((a) => a.criterionId === 'physical');

    assert.strictEqual(
      physAdvisories.length,
      0,
      'Không được báo thiếu các phương án khác khi đã chọn 1 phương án Thể lực tốt hợp lệ'
    );

    const statuses = computeCriteriaAdvisoryStatuses(app.criteria, advisories);
    const physStatus = statuses.find((s) => s.id === 'physical');
    assert.strictEqual(physStatus?.statusLabel, 'Đã có thông tin');
    assert.strictEqual(physStatus?.statusTone, 'ready');
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 5: Volunteer: Using TC4.2 or TC4.3 without 3-day restriction
  // ---------------------------------------------------------------------------
  test('Scenario 5: Chỉ dùng TC4.2 (Chiến dịch Mùa hè xanh) để kê khai Tình nguyện tốt', () => {
    const app = createBlankApplication();
    // Declare only TC4.2 (Campaign)
    addDeclaration(
      app,
      'volunteer',
      'volunteer-campaign',
      'Giấy chứng nhận Chiến dịch Tình nguyện Mùa hè xanh 2026',
      1
    );

    const advisories = computeDynamicPreSubmitAdvisories(app.criteria);
    const volAdvisories = advisories.filter((a) => a.criterionId === 'volunteer');

    const hasInsufficientDays = volAdvisories.some((a) => a.id === 'adv-volunteer-days-insufficient');
    assert.strictEqual(
      hasInsufficientDays,
      false,
      'Không được cảnh báo thiếu 3 ngày tình nguyện khi sinh viên đã chọn phương án Chiến dịch'
    );

    const statuses = computeCriteriaAdvisoryStatuses(app.criteria, advisories);
    const volStatus = statuses.find((s) => s.id === 'volunteer');
    assert.strictEqual(volStatus?.statusLabel, 'Đã có thông tin');
    assert.strictEqual(volStatus?.statusTone, 'ready');
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 6: Integration: Having TC5.1 but omitting TC5.3 (Activity)
  // ---------------------------------------------------------------------------
  test('Scenario 6: Hội nhập tốt có TC5.1 (Khóa kỹ năng) nhưng thiếu TC5.3 (Hoạt động hội nhập)', () => {
    const app = createBlankApplication();
    // Declare Group A (TC5.1) and Group C (TC5.4), but leave TC5.3 empty
    addDeclaration(app, 'integration', 'integration-skills', 'Khóa tập huấn kỹ năng thực hành xã hội', 1);
    addDeclaration(app, 'integration', 'integration-lang', 'Chứng chỉ tiếng Anh IELTS 6.5', 1);

    const advisories = computeDynamicPreSubmitAdvisories(app.criteria);
    const missingActAdv = advisories.find((a) => a.id === 'adv-missing-integration-group-b');

    assert.ok(missingActAdv, 'Phải phát hiện thiếu Hoạt động về hội nhập cấp khoa trở lên (TC5.3)');
    assert.strictEqual(missingActAdv?.requirementId, 'integration-activity');

    const statuses = computeCriteriaAdvisoryStatuses(app.criteria, advisories);
    const intStatus = statuses.find((s) => s.id === 'integration');
    assert.strictEqual(intStatus?.statusLabel, 'Chưa đủ điều kiện');
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 7: Integration: Having TC5.3 but omitting Language/Intl (Group C)
  // ---------------------------------------------------------------------------
  test('Scenario 7: Hội nhập tốt có TC5.3 nhưng thiếu nhóm Ngoại ngữ / Giao lưu quốc tế (Group C)', () => {
    const app = createBlankApplication();
    // Declare Group A (TC5.1) and Group B (TC5.3), but omit Group C
    addDeclaration(app, 'integration', 'integration-skills', 'Khóa tập huấn kỹ năng', 1);
    addDeclaration(app, 'integration', 'integration-activity', 'Ngày hội Sinh viên Hội nhập Quốc tế', 1);

    const advisories = computeDynamicPreSubmitAdvisories(app.criteria);
    const missingLangAdv = advisories.find((a) => a.id === 'adv-missing-integration-group-c');

    assert.ok(missingLangAdv, 'Phải phát hiện thiếu tiêu chuẩn Ngoại ngữ / Giao lưu quốc tế (Group C)');
    assert.strictEqual(missingLangAdv?.requirementId, 'integration-lang');

    const statuses = computeCriteriaAdvisoryStatuses(app.criteria, advisories);
    const intStatus = statuses.find((s) => s.id === 'integration');
    assert.strictEqual(intStatus?.statusLabel, 'Chưa đủ điều kiện');
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 8: Optional priority criteria not flagged as missing
  // ---------------------------------------------------------------------------
  test('Scenario 8: Không khai các tiêu chí ưu tiên (TC1.3–1.6, TC2.9–2.11, TC3.5, TC5.7)', () => {
    const app = createBlankApplication();
    // Satisfy all mandatory conditions across 5 criteria without any priority items:
    // TC1: ĐRL + Cam kết không vi phạm
    addDeclaration(app, 'ethics', 'ethics-score', 'Điểm rèn luyện 88/100', 1);
    addDeclaration(app, 'ethics', 'ethics-law', 'Không vi phạm pháp luật và nội quy', 0);

    // TC2: GPA + NCKH
    addDeclaration(app, 'academic', 'academic-gpa', '3.55/4.00', 1);
    addDeclaration(app, 'academic', 'academic-nckh', 'Đề tài NCKH cấp Khoa', 1);

    // TC3: Thể lực (TC3.4)
    addDeclaration(app, 'physical', 'physical-pe-grade', 'Điểm GDTC loại Khá', 1);

    // TC4: Tình nguyện (TC4.2)
    addDeclaration(app, 'volunteer', 'volunteer-campaign', 'Chiến dịch Mùa hè xanh', 1);

    // TC5: Hội nhập (TC5.1, TC5.3, TC5.4)
    addDeclaration(app, 'integration', 'integration-skills', 'Khóa kỹ năng xã hội', 1);
    addDeclaration(app, 'integration', 'integration-activity', 'Diễn đàn Hội nhập Sinh viên', 1);
    addDeclaration(app, 'integration', 'integration-lang', 'Chứng chỉ TOEIC 650', 1);

    const advisories = computeDynamicPreSubmitAdvisories(app.criteria);
    assert.strictEqual(
      advisories.length,
      0,
      'Khi đã đủ các tiêu chuẩn bắt buộc, việc không khai tiêu chí ưu tiên không được coi là lỗi thiếu'
    );

    const statuses = computeCriteriaAdvisoryStatuses(app.criteria, advisories);
    for (const st of statuses) {
      assert.strictEqual(
        st.statusLabel,
        'Đã có thông tin',
        `Tiêu chí ${st.name} phải báo "Đã có thông tin"`
      );
      assert.strictEqual(st.statusTone, 'ready');
    }
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 9: Multiline Vietnamese declaration titles and validation
  // ---------------------------------------------------------------------------
  test('Scenario 9: Kê khai tên dài nhiều dòng và kiểm tra validation', () => {
    const multilineTitle = `Đề tài Nghiên cứu khoa học sinh viên cấp Đại học Đà Nẵng:
"Ứng dụng mô hình học sâu và thị giác máy tính trong phân loại tự động"
Năm học 2025–2026, Quyết định số 456/QĐ-ĐHĐN`;

    const validationResult = validateDeclarationValue('academic-nckh', multilineTitle);
    assert.strictEqual(validationResult, null, 'Văn bản nhiều dòng hợp lệ phải vượt qua validation');

    // Test GPA scale 4 capping
    const invalidGpa = validateDeclarationValue('academic-gpa', '4.50 / 4.00');
    assert.ok(invalidGpa?.includes('không được vượt quá trần 4.00'));

    const validGpa = validateDeclarationValue('academic-gpa', '3.82 / 4.00');
    assert.strictEqual(validGpa, null);
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 10: Submission states: Submitted, Supplement Required, Under Review
  // ---------------------------------------------------------------------------
  test('Scenario 10: Hiển thị đúng trạng thái hồ sơ qua getApplicationDisplayState', () => {
    // 1. Draft
    const draftState = getApplicationDisplayState('draft');
    assert.strictEqual(draftState.canonicalState, 'DRAFT');
    assert.strictEqual(draftState.label, 'Đang hoàn thiện');

    // 2. Submitted
    const submittedState = getApplicationDisplayState('submitted');
    assert.strictEqual(submittedState.canonicalState, 'SUBMITTED');
    assert.strictEqual(submittedState.label, 'Đã gửi hồ sơ');

    // 3. Under Review
    const underReviewState = getApplicationDisplayState('under_review');
    assert.strictEqual(underReviewState.canonicalState, 'UNDER_REVIEW');
    assert.strictEqual(underReviewState.label, 'Đang được xem xét');

    // 4. Supplement Required
    const supplementState = getApplicationDisplayState('supplement_required');
    assert.strictEqual(supplementState.canonicalState, 'SUPPLEMENT_REQUIRED');
    assert.strictEqual(supplementState.label, 'Cần bổ sung');

    // 5. Supplement Sent
    const supplementSentState = getApplicationDisplayState('supplement_sent');
    assert.strictEqual(supplementSentState.canonicalState, 'SUPPLEMENT_SUBMITTED');
    assert.strictEqual(supplementSentState.label, 'Đã gửi bổ sung');
  });
});
