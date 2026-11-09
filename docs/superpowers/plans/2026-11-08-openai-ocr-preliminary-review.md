# OpenAI OCR & Preliminary Criteria Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate OpenAI (`gpt-4o-mini` / `gpt-4o`) Vision & Document OCR with a deterministic SV5T 2025–2026 Criteria Preliminary Evaluation Engine and a non-tech friendly Officer Review UX using 100% `lucide-react` icons.

**Architecture:** A hybrid AI pipeline in Backend V2 (`openaiOcr.service.ts` + `criteriaEvaluation.service.ts`) extracts structured fields from student evidence images/PDFs via OpenAI Structured Outputs (`json_schema`), cross-checks them against SV5T Da Nang 2025–2026 criteria rules, caches results on evidence upload/submission, and surfaces `Đạt sơ bộ` / `Cần kiểm tra thêm` / `Chưa đạt` badges, side-by-side declaration vs. OCR cards, and 1-click review actions across the Officer Review UI.

**Tech Stack:** TypeScript, Express (Backend V2), OpenAI Chat Completions / Structured Outputs REST API (`fetch`), React 19, Tailwind CSS, `lucide-react`, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-08-openai-ocr-preliminary-review-design.md`

## Global Constraints

- **Zero Emoji Icons in UI:** Strictly use `lucide-react` icons (`CheckCircle2`, `AlertTriangle`, `XCircle`, `FileCheck2`, `ScanSearch`, `CheckCheck`, `RefreshCw`, `MessageSquareWarning`, `Sparkles`, `Check`).
- **Administrative Vietnamese Copy (`5TOT_PRODUCT_LANGUAGE_GUIDE.md`):** Use natural phrases (`Đạt sơ bộ`, `Cần kiểm tra thêm`, `Chưa đạt`, `Thông tin đọc từ minh chứng`, `Khớp thông tin kê khai`). Never show `OCR confidence`, `JSON payload`, `API`, or `LLM` on user-facing screens.
- **Human Authority Invariant:** AI preliminary assessments are advisory; official judgments (`suitable`, `unsuitable`, `needs_supplement`) require officer confirmation (via 1-click accept or manual buttons).
- **Graceful Fallback:** When `OPENAI_API_KEY` is not set or OpenAI returns an error/timeout, automatically fall back to deterministic rule-based extraction and evaluation without throwing unhandled errors.

---

### Task 1: Backend OpenAI Environment & Structured Vision OCR Service

**Files:**
- Modify: `backend/src/config/environment.ts`
- Modify: `.env.example`
- Create: `backend/src/modules/copilot/openaiOcr.service.ts`
- Test: `backend/tests/unit/openaiOcr.service.test.ts`

**Interfaces:**
- Produces:
  - `BackendEnvironment.OPENAI_API_KEY?: string`
  - `BackendEnvironment.OPENAI_MODEL: string`
  - `BackendEnvironment.OPENAI_BASE_URL: string`
  - `OcrEvidenceExtraction` interface
  - `extractEvidenceWithOpenAI(input: OcrExtractionRequest): Promise<OcrEvidenceExtraction>`

- [ ] **Step 1: Write the failing unit test for `openaiOcr.service.ts` and environment config**

Create `backend/tests/unit/openaiOcr.service.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractEvidenceWithOpenAI,
  clearOcrCache,
  type OcrExtractionRequest,
} from '../../src/modules/copilot/openaiOcr.service';
import { parseEnvironment } from '../../src/config/environment';

describe('OpenAI OCR Service & Environment', () => {
  beforeEach(() => {
    clearOcrCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses OPENAI_API_KEY, OPENAI_MODEL, and OPENAI_BASE_URL with sensible defaults', () => {
    const env = parseEnvironment({
      NODE_ENV: 'development',
      OPENAI_API_KEY: 'sk-test-123',
    });
    expect(env.OPENAI_API_KEY).toBe('sk-test-123');
    expect(env.OPENAI_MODEL).toBe('gpt-4o-mini');
    expect(env.OPENAI_BASE_URL).toBe('https://api.openai.com/v1');
  });

  it('falls back deterministically when OPENAI_API_KEY is not configured', async () => {
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
    expect(result.evidenceId).toBe('ev-gpa-1');
    expect(result.isReadable).toBe(true);
    expect(result.documentType).toContain('Bảng điểm');
    expect(result.matchWithDeclaration).toBe('matched');
    expect(result.aiSource).toBe('rule_engine');
  });

  it('calls OpenAI chat completions with json_schema when OPENAI_API_KEY is provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
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
    });
    vi.stubGlobal('fetch', mockFetch);

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
      model: 'gpt-4o-mini',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.aiSource).toBe('openai');
    expect(result.numericMetric).toBe(4);
    expect(result.matchWithDeclaration).toBe('mismatch');
    expect(result.discrepancyNote).toContain('04 ngày');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run backend/tests/unit/openaiOcr.service.test.ts`
Expected: FAIL because `openaiOcr.service.ts` does not exist yet.

- [ ] **Step 3: Implement environment fields and `openaiOcr.service.ts`**

Update `backend/src/config/environment.ts` to add `OPENAI_API_KEY`, `OPENAI_MODEL`, and `OPENAI_BASE_URL`, update `.env.example`, and create `backend/src/modules/copilot/openaiOcr.service.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run backend/tests/unit/openaiOcr.service.test.ts`
Expected: PASS

---

### Task 2: Criteria Preliminary Evaluation Service & Backend Copilot Routes

**Files:**
- Create: `backend/src/modules/copilot/criteriaEvaluation.service.ts`
- Modify: `backend/src/modules/copilot/copilot.routes.ts`
- Test: `backend/tests/unit/criteriaEvaluation.service.test.ts`

**Interfaces:**
- Consumes: `extractEvidenceWithOpenAI`, `OcrEvidenceExtraction` from `openaiOcr.service.ts`
- Produces:
  - `evaluateDeclarationPreliminary(payload)`
  - `evaluateFullApplicationPreliminary(payload)`
  - Express routes in `copilot.routes.ts`:
    - `POST /api/v2/copilot/ocr-evidence`
    - `POST /api/v2/copilot/evaluate-application`
    - `POST /api/v2/copilot/analyze-scope` (upgraded to use OpenAI OCR + Criteria Evaluation)
    - `POST /api/v2/copilot/ask` (upgraded to use OpenAI with regulation grounding + fallback)
    - `POST /api/v2/copilot/dossier-summary` (upgraded to use OpenAI + fallback)

- [ ] **Step 1: Write the failing unit test for `criteriaEvaluation.service.ts`**

Create `backend/tests/unit/criteriaEvaluation.service.test.ts` testing:
1. Full 5/5 criteria passing application -> `preliminary_meets` (`Đạt sơ bộ`).
2. Volunteer days discrepancy (4 days extracted vs 5 days required) -> `insufficient_evidence` (`Cần kiểm tra thêm`) with pre-drafted supplement request.
3. Academic GPA below threshold (e.g., 2.8/4.0 < 3.2/4.0) or missing mandatory evidence -> `preliminary_not_meets` (`Chưa đạt`).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run backend/tests/unit/criteriaEvaluation.service.test.ts`
Expected: FAIL because `criteriaEvaluation.service.ts` does not exist yet.

- [ ] **Step 3: Implement `criteriaEvaluation.service.ts` and upgrade `copilot.routes.ts`**

Implement `backend/src/modules/copilot/criteriaEvaluation.service.ts` and wire all endpoints into `backend/src/modules/copilot/copilot.routes.ts` (making route handlers `async` and supporting both live OpenAI and deterministic fallback).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run backend/tests/unit/criteriaEvaluation.service.test.ts`
Expected: PASS

---

### Task 3: Frontend Copilot API Client & Automatic OCR Trigger on Evidence Upload

**Files:**
- Modify: `src/shared/api/copilotApi.ts`
- Modify: `src/components/application/AddEvidenceModal.tsx`

**Interfaces:**
- Consumes: Backend endpoints `/api/v2/copilot/ocr-evidence`, `/api/v2/copilot/evaluate-application`, `/api/v2/copilot/analyze-scope`
- Produces:
  - `OcrEvidenceExtractionResult`
  - `ApplicationPreliminaryEvaluationResponse`
  - `triggerEvidenceOcr(payload)`
  - `fetchApplicationPreliminaryEvaluation(payload, forceRefresh)`
  - `getCachedEvidenceOcr(evidenceId, fileName, declaredValue)`

- [ ] **Step 1: Extend `src/shared/api/copilotApi.ts` with OCR and full-application evaluation client functions + local cache**
- [ ] **Step 2: Update `src/components/application/AddEvidenceModal.tsx` so newly added evidence files automatically trigger background OCR (`triggerEvidenceOcr`) and display a subtle `lucide-react` `FileCheck2` indicator when recognized**
- [ ] **Step 3: Verify TypeScript compilation (`npx tsc --noEmit`)**

---

### Task 4: Non-Tech Friendly Officer Review UX (4 Touchpoints with 100% Lucide Icons)

**Files:**
- Modify: `src/widgets/staff-backoffice/staffTableColumns.tsx`
- Modify: `src/widgets/officer-review/OfficerReviewAiQuietSection.tsx`
- Modify: `src/staff/components/review/OfficerReviewWorkspace.tsx`
- Modify: `src/staff/components/review/InlineRowReviewControls.tsx`
- Modify: `src/staff/components/review/EvidenceReviewViewer.tsx`

**Interfaces:**
- Touchpoint 1 (`staffTableColumns.tsx`): Renders preliminary assessment badge (`Đạt sơ bộ 5/5`, `Cần kiểm tra thêm`, `Chưa đạt sơ bộ`) with `CheckCircle2` / `AlertTriangle` / `XCircle` icons in the application queue table.
- Touchpoint 2 (`OfficerReviewAiQuietSection.tsx` & `OfficerReviewWorkspace.tsx`): Displays the scannable top preliminary status bar with 5 criterion pills, a **"Áp dụng Đạt cho các mục hợp lệ"** (`CheckCheck`) 1-click batch button, and a **"Phân tích lại"** (`RefreshCw`) button that triggers live OpenAI evaluation.
- Touchpoint 3 (`InlineRowReviewControls.tsx`): Displays a clean side-by-side comparison box (**"Sinh viên kê khai"** vs. **"Đọc từ minh chứng"**) with status badge (`Đạt sơ bộ` / `Cần kiểm tra thêm` / `Chưa đạt`) and 1-click **"Chốt Đạt"** or **"Yêu cầu bổ sung (có gợi ý)"** buttons.
- Touchpoint 4 (`EvidenceReviewViewer.tsx`): Displays structured OCR fields extracted from the document alongside a **"Quét lại tệp này"** (`RefreshCw`) button calling `triggerEvidenceOcr`.

- [ ] **Step 1: Update `OfficerReviewAiQuietSection.tsx` and `OfficerReviewWorkspace.tsx` to render the always-visible, scannable Preliminary Evaluation Strip with 1-click batch accept and live OpenAI re-evaluation**
- [ ] **Step 2: Update `InlineRowReviewControls.tsx` to display the inline "Kê khai vs. Đọc từ minh chứng" comparison card and 1-click action buttons**
- [ ] **Step 3: Update `EvidenceReviewViewer.tsx` to show live/cached OpenAI OCR extracted fields and the "Quét lại tệp này" button**
- [ ] **Step 4: Update `staffTableColumns.tsx` to show the preliminary status pill in the Officer Queue table**
- [ ] **Step 5: Run full typecheck, unit tests, and build verification**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS with 0 errors.
