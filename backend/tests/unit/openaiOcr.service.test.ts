import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractEvidenceWithOpenAI,
  clearOcrCache,
  type OcrExtractionRequest,
} from '../../src/modules/copilot/openaiOcr.service';
import { parseEnvironment } from '../../src/config/environment';

describe('OpenAI OCR Service & Environment', () => {
  beforeEach(() => {
    clearOcrCache();
  });

  it('parses OPENAI_API_KEY, OPENAI_MODEL, and OPENAI_BASE_URL with sensible defaults', () => {
    const env = parseEnvironment({
      NODE_ENV: 'development',
      OPENAI_API_KEY: 'sk-test-123',
    });
    assert.equal(env.OPENAI_API_KEY, 'sk-test-123');
    assert.equal(env.OPENAI_MODEL, 'gpt-5');
    assert.equal(env.OPENAI_BASE_URL, 'https://api.openai.com/v1');
  });

  it('returns honest unverified state (no mock pass) when OPENAI_API_KEY is not configured', async () => {
    const req: OcrExtractionRequest = {
      evidenceId: 'ev-gpa-1',
      fileName: 'Bang_diem_HK2_2025_2026.pdf',
      studentFullName: 'Nguyễn Văn An',
      studentCode: '102220123',
      criterionId: 'academic',
      requirementTitle: 'Điểm trung bình học tập cả năm học (GPA)',
      declaredValue: 'GPA: 3.45/4.0 (8.6/10)',
    };

    const result = await extractEvidenceWithOpenAI(req, { apiKey: '' });
    assert.equal(result.evidenceId, 'ev-gpa-1');
    assert.equal(result.isReadable, false);
    assert.ok(result.extractedValue.includes('Thiếu dữ liệu'));
    assert.equal(result.matchWithDeclaration, 'partial');
    assert.equal(result.hasRedStampOrSignature, 'unclear');
    assert.equal(result.aiSource, 'rule_engine');
  });

  it('calls OpenAI chat completions with json_schema and gpt-5 when OPENAI_API_KEY is provided', async () => {
    let fetchCalled = 0;
    const captured: { body?: Record<string, unknown> } = {};
    const mockFetch = async (_url: unknown, init?: RequestInit) => {
      fetchCalled++;
      if (init?.body && typeof init.body === 'string') {
        captured.body = JSON.parse(init.body) as Record<string, unknown>;
      }
      return {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  isReadable: true,
                  documentType: 'Giấy chứng nhận Mùa hè xanh',
                  extractedStudentName: 'Nguyễn Văn An',
                  extractedStudentCode: '102220123',
                  extractedValue: '04 ngày tình nguyện Chiến dịch Mùa hè xanh 2026',
                  numericMetric: 4,
                  issuingAuthority: 'Đoàn Trường Đại học Bách khoa - ĐHĐN',
                  issueDate: '15/08/2026',
                  hasRedStampOrSignature: 'verified',
                  matchWithDeclaration: 'mismatch',
                  discrepancyNote: 'Minh chứng ghi nhận 04 ngày, sinh viên kê khai 05 ngày.',
                }),
              },
            },
          ],
        }),
      } as any;
    };

    const req: OcrExtractionRequest = {
      evidenceId: 'ev-vol-1',
      fileName: 'GCN_MuaHeXanh_2026.jpg',
      fileUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      studentFullName: 'Nguyễn Văn An',
      studentCode: '102220123',
      criterionId: 'volunteer',
      requirementTitle: 'Tham gia ít nhất 05 ngày tình nguyện/năm',
      declaredValue: '05 ngày Chiến dịch Mùa hè xanh',
    };

    const result = await extractEvidenceWithOpenAI(req, {
      apiKey: 'sk-live-key',
      model: 'gpt-5',
      fetchImpl: mockFetch,
    });

    assert.equal(fetchCalled, 1);
    assert.equal(captured.body?.model, 'gpt-5');
    assert.equal(captured.body?.reasoning_effort, 'low');
    assert.equal(captured.body?.temperature, undefined);
    assert.equal(result.aiSource, 'openai');
    assert.equal(result.modelUsed, 'gpt-5');
    assert.equal(result.numericMetric, 4);
    assert.equal(result.matchWithDeclaration, 'mismatch');
    assert.ok(result.discrepancyNote?.includes('04 ngày'));
  });
});
