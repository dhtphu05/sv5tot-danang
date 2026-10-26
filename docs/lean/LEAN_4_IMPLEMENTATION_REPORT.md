# 5TOT ĐÀ NẴNG — LEAN-4 IMPLEMENTATION REPORT
## Production Lean School Preliminary Review, Recommendation Selection & One-Time City Forwarding

**Author:** Technical Engineering Team  
**Governing Authority:** Thành Đoàn Đà Nẵng  
**Operating Organization:** Hội Sinh viên Việt Nam Thành phố Đà Nẵng  
**Award Season:** 2026–2027 (Active Award Season `season-2026-2027`)  
**Status:** 100% Implemented & Verified (285 Passing Tests, 0 Failures)

---

### 1. Executive Summary & Core Philosophy

> **"The School reviewer manages applications, not forwarding engine states."**

LEAN-4 completes the School Preliminary Review workflow, transforming what was once a technical batch engine into a streamlined, high-usability reviewer experience:

1. **Step 1 — Open Preliminary Review List:** The reviewer opens "Danh sách hồ sơ sơ tuyển" and immediately sees compact 5-criterion outcomes (`ĐĐ`, `HT`, `TL`, `TN`, `HN`) with color-coded dot badges and overall score summaries ("Đạt 5/5 tiêu chí", "Đạt 4/5 (1 Chưa đạt)", etc.).
2. **Step 2 — Record Authoritative Human Recommendation:** Clear separation between "criteria passed" and "human recommendation". Passing 5/5 does not automate recommendation; the reviewer records an authoritative human decision (`recommended` / `not_recommended` / `pending`) with optional notes and mandatory rejection reasons.
3. **Step 3 — Select Applications Directly with Checkboxes:** Reviewers select applications directly using checkboxes with persistent multi-selection across member institutions, "Select all in view", and "Select all recommended". A persistent floating bar tracks selections and allows one-click forwarding.
4. **Step 4 — Attach Official School Decision Document:** Exactly 1 official PDF decision document per School Review Unit per award season (e.g. `182/QĐ-ĐHĐN`), complete with legal metadata (decision number, signer, title, date, size, URL).
5. **Step 5 — Forward Once with Confirmation:** A single, professional confirmation ("Gửi danh sách lên Thành phố") transitions all selected applications atomically to City Intake (`reviewStage = 'CITY'`, `schoolPreliminaryStatus = 'forwarded_to_city'`), enforces idempotency, prevents duplicate clicks, and freezes evaluations.

---

### 2. Architectural Invariants Enforced

| Invariant | Implementation Mechanism | Verification Test |
| :--- | :--- | :--- |
| **One Review Unit = One Batch** | Exactly 1 consolidated batch per Review Unit per season (`unit-udn` or independent schools). | `SF01`, `SF03`, `SF07`, `S3-01` |
| **8 UDN Members Consolidated** | 8 member institutions (`DUT`, `DUE`, `UED`, `UFL`, `UTE`, `VKU`, `VNUK`, `SMP`) map to `unit-udn` in 1 shared scope while preserving original student institutions. | `SF01`, `SF03`, `SF04`, `S3-02` |
| **Criterion Outcome vs Recommendation** | 5/5 passed is an objective standard check; School recommendation is an authoritative human decision. They are never conflated. | `SF10`, `SF17`, `SF18`, `SF19` |
| **5 Distinct Count Dimensions** | (1) Total reviewed, (2) Criteria passed, (3) School recommended, (4) Selected for forwarding, (5) Forwarded to City. | `SF21`, `SF23`, `SF28` |
| **1 Official PDF Decision** | 1 legal decision document per Review Unit per season (`182/QĐ-ĐHĐN`), attached and previewable before submission. | `SF31`, `SF32`, `SF35` |
| **One-Time Idempotent Forwarding** | Single submission; subsequent requests return existing batch without duplication or error. | `SF38`, `SF39` |
| **Immediate City Intake** | Applications transition to `reviewStage: 'CITY'` and are immediately available for City Council. | `SF37`, `SF41` |
| **Season 2026–2027 Canonicalization** | Default season is canonicalized to `season-2026-2027` with full backward compatibility. | `SF42`, `S3-01` |

---

### 3. File Modifications & Components

#### 3.1 Domain Selectors & Models (`src/staff/schoolSelectors.ts` & `src/staff/schoolReviewTypes.ts`)
- Added `CompactCriterionOutcome`, `ApplicationCriteriaSummary`, and `getApplicationCriteriaSummary(app, workspace)` returning `ĐĐ`, `HT`, `TL`, `TN`, `HN` with status dots (`#16A34A` passed, `#DC2626` failed, `#D97706` supplement, `#0284C7` under review, `#94A3B8` unreviewed).
- Extended `SchoolForwardingRecommendation` to `'recommended' | 'not_recommended' | 'pending'`.
- Enhanced `getSchoolRecommendationQueue` to check `app.schoolRecommendation`, `app.schoolReviewSummary.recommendation`, and preliminary status flags.

#### 3.2 Workflow Mutators (`src/entities/committee/committeeWorkflowMutators.ts`)
- Updated `applyRecordSchoolRecommendation` to record human recommendation, notes, and reason on both `app` and `app.schoolReviewSummary`.
- Updated status mapping: `recommended` -> `recommended_forwarding`, `not_recommended` -> `not_recommended`, `pending` -> `preliminary_completed`.

#### 3.3 Server Routes & Demo Adapter (`server/individualAndSchoolRoutes.ts` & `src/entities/services/demoAdapter.ts`)
- Canonicalized default active season across all `/api/school-review/batch/*` endpoints to `season-2026-2027`.
- Atomic state update in batch confirmation: transitions `reviewStage` to `'CITY'` and `schoolPreliminaryStatus` to `'forwarded_to_city'`.

#### 3.4 School Backoffice Views (`src/staff/components/school/SchoolBackofficeViews.tsx`)
- Checkbox multi-selection column with "Select all in view" toggle.
- Compact 5-criterion outcomes (`ĐĐ`, `HT`, `TL`, `TN`, `HN`) rendered on every table row with tooltip details and overall summary badge.
- School Recommendation column rendering current human recommendation with inline "Ghi kết luận" / "Đổi kết luận" trigger.
- Inline Recommendation Modal with criteria summary preview, radio selection, mandatory rejection reason, and officer notes.
- Persistent Sticky Bottom Selection Bar with live selection counters and "Chuẩn bị gửi Thành phố (N)" navigation.

#### 3.5 School Forwarding Table Widget (`src/widgets/school-backoffice/SchoolForwardingTable.tsx`)
- Rendered compact 5-criterion outcomes on every application card across all recommendation tabs.

---

### 4. Verification & Test Results

- **New Suite:** `src/test/lean4SchoolForwarding.test.ts`
  - Total Scenarios: 42 (SF01 through SF42)
  - Results: **42 passed, 0 failed**
- **Full Test Suite:** `npm test`
  - Total Suites: 36
  - Total Tests: **285 passed, 0 failed**
- **Lint Check:** `npm run lint` (`tsc --noEmit`) -> **0 errors**
- **Build Compilation:** `compile_applet` -> **Build succeeded**
