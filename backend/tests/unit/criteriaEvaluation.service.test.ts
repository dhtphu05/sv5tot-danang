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
                declarationId: 'd-eth',
                requirementId: 'eth-1',
                requirementTitle: 'Điểm rèn luyện >= 80',
                declaredValue: 'Điểm rèn luyện 88/100',
                evidenceList: [{ id: 'ev-eth', name: 'Bang_DRL_88.pdf' }],
              },
            ],
          },
          {
            criterionId: 'academic',
            criterionName: 'Học tập tốt',
            criterionNumber: 2,
            declarations: [
              {
                declarationId: 'd-acad',
                requirementId: 'acad-1',
                requirementTitle: 'GPA >= 3.2/4.0',
                declaredValue: 'GPA: 3.55/4.0',
                evidenceList: [{ id: 'ev-acad', name: 'Bang_diem_355.pdf' }],
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
                requirementId: 'phys-1',
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
                requirementId: 'vol-1',
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
                declarationId: 'd-int',
                requirementId: 'int-1',
                requirementTitle: 'Chứng chỉ ngoại ngữ B1 / IELTS >= 4.5',
                declaredValue: 'IELTS 6.5',
                evidenceList: [{ id: 'ev-int', name: 'IELTS_65.pdf' }],
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
});
