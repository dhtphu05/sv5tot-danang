import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateScopeWithOpenAiAndRules,
  evaluateFullApplicationWithOcr,
} from '../../src/modules/copilot/criteriaEvaluation.service';
import { clearOcrCache } from '../../src/modules/copilot/openaiOcr.service';

describe('Criteria Preliminary Evaluation Service', () => {
  beforeEach(() => {
    clearOcrCache();
  });

  it('marks scope as SATISFIED when OpenAI OCR extracts matching evidence that meets SV5T threshold', async () => {
    const mockFetch = async () =>
      ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  isReadable: true,
                  documentType: 'Bảng điểm học tập',
                  extractedStudentName: 'Nguyễn Văn An',
                  extractedStudentCode: '102220123',
                  extractedValue: 'GPA: 3.45/4.0 (8.6/10)',
                  numericMetric: 3.45,
                  issuingAuthority: 'Phòng Đào tạo - Trường ĐH Bách khoa ĐHĐN',
                  issueDate: '10/06/2026',
                  hasRedStampOrSignature: 'verified',
                  matchWithDeclaration: 'matched',
                  discrepancyNote: null,
                }),
              },
            },
          ],
        }),
      }) as any;

    const res = await evaluateScopeWithOpenAiAndRules(
      {
        criterionId: 'academic',
        criterionName: 'Học tập tốt',
        criterionNumber: 2,
        requirementId: 'academic-gpa',
        requirementTitle: 'Điểm trung bình học tập cả năm học đạt từ 3.2/4.0 trở lên',
        declarationId: 'decl-gpa-1',
        declarationTitle: 'Bảng điểm năm học',
        evidenceList: [
          {
            id: 'ev-gpa-1',
            name: 'Bang_diem_HK2_2025_2026.pdf',
          },
        ],
        studentInfo: {
          fullName: 'Nguyễn Văn An',
          studentCode: '102220123',
          schoolName: 'Trường Đại học Bách khoa - ĐHĐN',
        },
      },
      { apiKey: 'sk-test-key', fetchImpl: mockFetch }
    );

    assert.equal(res.suggestedVerdict, 'SATISFIED');
    assert.equal(res.preliminaryStatus, 'preliminary_meets');
    assert.equal(res.ocrExtractions.length, 1);
    assert.equal(res.ocrExtractions[0].matchWithDeclaration, 'matched');
  });

  it('marks scope as SUPPLEMENT_REQUIRED when volunteer days in evidence are fewer than required (4 vs 5)', async () => {
    const mockFetch = async () =>
      ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  isReadable: true,
                  documentType: 'Giấy chứng nhận tình nguyện',
                  extractedStudentName: 'Nguyễn Văn An',
                  extractedStudentCode: '102220123',
                  extractedValue: 'Tham gia 04 ngày Chiến dịch Mùa hè xanh',
                  numericMetric: 4,
                  issuingAuthority: 'Đoàn Trường ĐH Bách khoa - ĐHĐN',
                  issueDate: '20/08/2026',
                  hasRedStampOrSignature: 'verified',
                  matchWithDeclaration: 'mismatch',
                  discrepancyNote:
                    'Kê khai 05 ngày nhưng văn bản minh chứng chỉ ghi nhận 04 ngày tham gia Chiến dịch Mùa hè xanh.',
                }),
              },
            },
          ],
        }),
      }) as any;

    const res = await evaluateScopeWithOpenAiAndRules(
      {
        criterionId: 'volunteer',
        criterionName: 'Tình nguyện tốt',
        criterionNumber: 4,
        requirementId: 'volunteer-days',
        requirementTitle: 'Tham gia ít nhất 05 ngày tình nguyện/năm',
        declarationId: 'decl-vol-1',
        declarationTitle: 'Tham gia Chiến dịch Mùa hè xanh',
        evidenceList: [
          {
            id: 'ev-mhx-discrepancy',
            name: 'GCN_MuaHeXanh_4ngay.jpg',
          },
        ],
        studentInfo: {
          fullName: 'Nguyễn Văn An',
          studentCode: '102220123',
          schoolName: 'Trường Đại học Bách khoa - ĐHĐN',
        },
      },
      { apiKey: 'sk-test-key', fetchImpl: mockFetch }
    );

    assert.equal(res.suggestedVerdict, 'SUPPLEMENT_REQUIRED');
    assert.equal(res.preliminaryStatus, 'insufficient_evidence');
    assert.equal(res.preliminaryBadgeLabel, 'Cần kiểm tra thêm');
    assert.ok(res.draftSupplementMessage?.includes('04 ngày'));
  });

  it('converts threshold shortfall (GPA 2.85/4.0) to SUPPLEMENT_REQUIRED / insufficient_evidence (never returns Chưa đạt)', async () => {
    const mockFetch = async () =>
      ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  isReadable: true,
                  documentType: 'Bảng điểm học tập',
                  extractedStudentName: 'Trần Thị B',
                  extractedStudentCode: '102220999',
                  extractedValue: 'GPA: 2.85/4.0',
                  numericMetric: 2.85,
                  issuingAuthority: 'Trường Đại học Kinh tế - ĐHĐN',
                  issueDate: '15/06/2026',
                  hasRedStampOrSignature: 'verified',
                  matchWithDeclaration: 'matched',
                  discrepancyNote: null,
                }),
              },
            },
          ],
        }),
      }) as any;

    const res = await evaluateScopeWithOpenAiAndRules(
      {
        criterionId: 'academic',
        criterionName: 'Học tập tốt',
        criterionNumber: 2,
        requirementId: 'academic-gpa',
        requirementTitle: 'Điểm trung bình học tập cả năm học đạt từ 3.2/4.0 trở lên',
        declarationId: 'decl-gpa-low',
        declarationTitle: 'GPA: 2.85/4.0',
        evidenceList: [
          {
            id: 'ev-gpa-low',
            name: 'Bang_diem_285.pdf',
          },
        ],
        studentInfo: {
          fullName: 'Trần Thị B',
          studentCode: '102220999',
          schoolName: 'Trường Đại học Kinh tế - ĐHĐN',
        },
      },
      { apiKey: 'sk-test-key', fetchImpl: mockFetch }
    );

    assert.equal(res.suggestedVerdict, 'SUPPLEMENT_REQUIRED');
    assert.equal(res.preliminaryStatus, 'insufficient_evidence');
    assert.equal(res.preliminaryBadgeLabel, 'Cần kiểm tra thêm');
  });

  it('evaluates full application across 5 criteria and returns overall preliminary status', async () => {
    const mockFetch = async () =>
      ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  isReadable: true,
                  documentType: 'Minh chứng hợp lệ',
                  extractedStudentName: 'Nguyễn Văn An',
                  extractedStudentCode: '102220123',
                  extractedValue: 'Đạt chuẩn theo quy chế',
                  numericMetric: 90,
                  issuingAuthority: 'Trường Đại học Bách khoa - ĐHĐN',
                  issueDate: '10/06/2026',
                  hasRedStampOrSignature: 'verified',
                  matchWithDeclaration: 'matched',
                  discrepancyNote: null,
                }),
              },
            },
          ],
        }),
      }) as any;

    const appEval = await evaluateFullApplicationWithOcr(
      {
        applicationId: 'APP-2026-001',
        forceRefresh: true,
        studentInfo: {
          fullName: 'Nguyễn Văn An',
          studentCode: '102220123',
          schoolName: 'Trường Đại học Bách khoa - ĐHĐN',
        },
        criteria: [
          {
            criterionId: 'ethics',
            criterionName: 'Đạo đức tốt',
            criterionNumber: 1,
            declarations: [
              {
                declarationId: 'd-eth-1',
                requirementId: 'ethics-score',
                requirementTitle: 'Điểm rèn luyện >= 80',
                declaredValue: 'Điểm rèn luyện 88/100',
                evidenceList: [{ id: 'ev-eth-1', name: 'Bang_DRL_88.pdf' }],
              },
              {
                declarationId: 'd-eth-2',
                requirementId: 'ethics-law',
                requirementTitle: 'Không vi phạm pháp luật và quy chế',
                declaredValue: 'Cam kết không vi phạm',
                evidenceList: [{ id: 'ev-eth-2', name: 'Giay_xac_nhan_khong_vi_pham.pdf' }],
              },
              {
                declarationId: 'd-eth-3',
                requirementId: 'ethics-commendation',
                requirementTitle: 'Gương người tốt việc tốt, thanh niên tiêu biểu',
                declaredValue: 'Thanh niên tiên tiến làm theo lời Bác',
                evidenceList: [{ id: 'ev-eth-3', name: 'Giay_khen_TNTT.pdf' }],
              },
            ],
          },
          {
            criterionId: 'academic',
            criterionName: 'Học tập tốt',
            criterionNumber: 2,
            declarations: [
              {
                declarationId: 'd-acad-1',
                requirementId: 'academic-gpa',
                requirementTitle: 'GPA >= 3.2/4.0',
                declaredValue: 'GPA: 3.55/4.0',
                evidenceList: [{ id: 'ev-acad-1', name: 'Bang_diem_355.pdf' }],
              },
              {
                declarationId: 'd-acad-2',
                requirementId: 'academic-nckh',
                requirementTitle: 'Đề tài NCKH đạt giải cấp Khoa trở lên',
                declaredValue: 'Giải Nhất NCKH cấp Trường',
                evidenceList: [{ id: 'ev-acad-2', name: 'GCN_NCKH.pdf' }],
              },
            ],
          },
          {
            criterionId: 'physical',
            criterionName: 'Thể lực tốt',
            criterionNumber: 3,
            declarations: [
              {
                declarationId: 'd-phys',
                requirementId: 'physical-fitness',
                requirementTitle: 'Danh hiệu Thanh niên khỏe',
                declaredValue: 'Đạt danh hiệu Thanh niên khỏe cấp Trường',
                evidenceList: [{ id: 'ev-phys', name: 'GCN_Thanh_nien_khoe.pdf' }],
              },
            ],
          },
          {
            criterionId: 'volunteer',
            criterionName: 'Tình nguyện tốt',
            criterionNumber: 4,
            declarations: [
              {
                declarationId: 'd-vol',
                requirementId: 'volunteer-days',
                requirementTitle: 'Tham gia >= 05 ngày tình nguyện',
                declaredValue: '06 ngày tình nguyện Mùa hè xanh',
                evidenceList: [{ id: 'ev-vol', name: 'GCN_MuaHeXanh_6ngay.pdf' }],
              },
            ],
          },
          {
            criterionId: 'integration',
            criterionName: 'Hội nhập tốt',
            criterionNumber: 5,
            declarations: [
              {
                declarationId: 'd-int-1',
                requirementId: 'integration-skills',
                requirementTitle: 'Khóa kỹ năng thực hành xã hội',
                declaredValue: 'Chứng nhận kỹ năng mềm',
                evidenceList: [{ id: 'ev-int-1', name: 'GCN_KyNang.pdf' }],
              },
              {
                declarationId: 'd-int-2',
                requirementId: 'integration-lang',
                requirementTitle: 'Chứng chỉ ngoại ngữ B1 / IELTS >= 4.5',
                declaredValue: 'IELTS 6.5',
                evidenceList: [{ id: 'ev-int-2', name: 'IELTS_65.pdf' }],
              },
            ],
          },
        ],
      },
      { apiKey: 'sk-test-key', fetchImpl: mockFetch }
    );

    assert.equal(appEval.overallVerdict, 'preliminary_meets');
    assert.equal(appEval.passedCriteriaCount, 5);
  });

  it('requires all mandatory + at-least-N group conditions per criterion (e.g., GPA alone without 1/6 academic achievement is insufficient_evidence)', async () => {
    const mockFetch = async () =>
      ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  isReadable: true,
                  documentType: 'Bảng điểm học tập',
                  extractedStudentName: 'Nguyễn Văn An',
                  extractedStudentCode: '102220123',
                  extractedValue: 'GPA: 3.65/4.0',
                  numericMetric: 3.65,
                  issuingAuthority: 'Trường Đại học Bách khoa - ĐHĐN',
                  issueDate: '10/06/2026',
                  hasRedStampOrSignature: 'verified',
                  matchWithDeclaration: 'matched',
                  discrepancyNote: null,
                }),
              },
            },
          ],
        }),
      }) as any;

    const appEval = await evaluateFullApplicationWithOcr(
      {
        applicationId: 'APP-2026-INCOMPLETE-CRIT',
        studentInfo: {
          fullName: 'Nguyễn Văn An',
          studentCode: '102220123',
          schoolName: 'Trường Đại học Bách khoa - ĐHĐN',
        },
        criteria: [
          {
            criterionId: 'academic',
            criterionName: 'Học tập tốt',
            criterionNumber: 2,
            declarations: [
              {
                declarationId: 'd-acad-only-gpa',
                requirementId: 'academic-gpa',
                requirementTitle: 'Điểm trung bình học tập cả năm học (GPA)',
                declaredValue: 'Bảng điểm năm học',
                evidenceList: [{ id: 'ev-acad-only-gpa', name: 'Bang_diem_365.pdf' }],
              },
            ],
          },
        ],
      },
      { apiKey: 'sk-test-key', fetchImpl: mockFetch }
    );

    assert.equal(appEval.criteriaResults['academic'].status, 'insufficient_evidence');
    assert.equal(appEval.criteriaResults['academic'].badgeLabel, 'Cần kiểm tra thêm');
    assert.ok(appEval.criteriaResults['academic'].headline.includes('01/06'));
  });

  it('strictly requires at least 01/04 sub-criteria with valid evidence for Tiêu chí Đạo đức tốt (ethics) — missing sub-criteria returns insufficient_evidence', async () => {
    const mockFetch = async () =>
      ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  isReadable: true,
                  documentType: 'Bảng điểm rèn luyện',
                  extractedStudentName: 'Nguyễn Văn An',
                  extractedStudentCode: '102220123',
                  extractedValue: 'Điểm rèn luyện: 93/100',
                  numericMetric: 93,
                  issuingAuthority: 'Trường Đại học Bách khoa - ĐHĐN',
                  issueDate: '10/06/2026',
                  hasRedStampOrSignature: 'verified',
                  matchWithDeclaration: 'matched',
                  discrepancyNote: null,
                }),
              },
            },
          ],
        }),
      }) as any;

    const appEval = await evaluateFullApplicationWithOcr(
      {
        applicationId: 'APP-2026-ETHICS-NO-SUPP',
        studentInfo: {
          fullName: 'Nguyễn Văn An',
          studentCode: '102220123',
          schoolName: 'Trường Đại học Bách khoa - ĐHĐN',
        },
        criteria: [
          {
            criterionId: 'ethics',
            criterionName: 'Đạo đức tốt',
            criterionNumber: 1,
            declarations: [
              {
                declarationId: 'd-eth-score-only',
                requirementId: 'ethics-score',
                requirementTitle: 'Điểm rèn luyện cả năm học',
                declaredValue: 'Điểm rèn luyện 93/100',
                evidenceList: [{ id: 'ev-eth-score', name: 'Bang_DRL_93.pdf' }],
              },
              {
                declarationId: 'd-eth-law-only',
                requirementId: 'ethics-law',
                requirementTitle: 'Không vi phạm pháp luật',
                declaredValue: 'Cam kết không vi phạm',
                evidenceList: [],
              },
            ],
          },
        ],
      },
      { apiKey: 'sk-test-key', fetchImpl: mockFetch }
    );

    assert.equal(appEval.criteriaResults['ethics'].status, 'insufficient_evidence');
    assert.equal(appEval.criteriaResults['ethics'].badgeLabel, 'Cần kiểm tra thêm');
    assert.ok(appEval.criteriaResults['ethics'].headline.includes('tiêu chuẩn bổ sung'));
    assert.ok(appEval.criteriaResults['ethics'].headline.includes('01/04'));
  });

  it('strictly marks ethics as insufficient_evidence when sub-criterion is declared but has empty evidence list', async () => {
    const mockFetch = async () =>
      ({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  isReadable: true,
                  documentType: 'Bảng điểm rèn luyện',
                  extractedStudentName: 'Nguyễn Văn An',
                  extractedStudentCode: '102220123',
                  extractedValue: 'Điểm rèn luyện: 93/100',
                  numericMetric: 93,
                  issuingAuthority: 'Trường Đại học Bách khoa - ĐHĐN',
                  issueDate: '10/06/2026',
                  hasRedStampOrSignature: 'verified',
                  matchWithDeclaration: 'matched',
                  discrepancyNote: null,
                }),
              },
            },
          ],
        }),
      }) as any;

    const appEval = await evaluateFullApplicationWithOcr(
      {
        applicationId: 'APP-2026-ETHICS-EMPTY-SUPP-EV',
        studentInfo: {
          fullName: 'Nguyễn Văn An',
          studentCode: '102220123',
          schoolName: 'Trường Đại học Bách khoa - ĐHĐN',
        },
        criteria: [
          {
            criterionId: 'ethics',
            criterionName: 'Đạo đức tốt',
            criterionNumber: 1,
            declarations: [
              {
                declarationId: 'd-eth-score',
                requirementId: 'ethics-score',
                requirementTitle: 'Điểm rèn luyện cả năm học',
                declaredValue: 'Điểm rèn luyện 93/100',
                evidenceList: [{ id: 'ev-eth-score', name: 'Bang_DRL_93.pdf' }],
              },
              {
                declarationId: 'd-eth-law',
                requirementId: 'ethics-law',
                requirementTitle: 'Không vi phạm pháp luật',
                declaredValue: 'Cam kết không vi phạm',
                evidenceList: [],
              },
              {
                declarationId: 'd-eth-party-no-ev',
                requirementId: 'ethics-party',
                requirementTitle: 'Là Đảng viên Đảng Cộng sản Việt Nam',
                declaredValue: 'Đảng viên chính thức',
                evidenceList: [], // deliberately empty!
              },
            ],
          },
        ],
      },
      { apiKey: 'sk-test-key', fetchImpl: mockFetch }
    );

    assert.equal(appEval.criteriaResults['ethics'].status, 'insufficient_evidence');
    assert.equal(appEval.criteriaResults['ethics'].badgeLabel, 'Cần kiểm tra thêm');
  });
});
