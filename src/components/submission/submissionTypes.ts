export type EligibilityState = 'verified' | 'direct_city' | 'not_found';

export type DeadlineState =
  | 'active'
  | 'not_open'
  | 'closed'
  | 'exception'
  | 'not_configured';

export type ApplicationSubmissionState =
  | 'draft'               // Đang hoàn thiện
  | 'submitted'           // Đã gửi hồ sơ
  | 'under_review'        // Đang xét hồ sơ
  | 'supplement_required' // Cần bổ sung
  | 'supplement_sent'     // Đã gửi bổ sung / Chờ tiếp tục xét
  | 'all_reviewed'        // Đã hoàn tất xét 5 tiêu chí (Đang chờ kết quả chính thức)
  | 'result_published';   // Đã có kết quả chính thức (Prompt 11 Section 4 & 44)

export interface PreSubmitAdvisoryItem {
  id: string;
  criterionId: 'ethics' | 'academic' | 'physical' | 'volunteer' | 'integration';
  criterionName: string;
  criterionNumber: number;
  requirementId: string;
  message: string;
  evidenceFileId?: string;
  actionLabel?: string;
  targetType: 'evidence' | 'regulation' | 'row';
}

export type DemoScenarioId =
  | 'scenario_a' // Main: 2 recommendations, verified eligibility, deadline active, submission allowed
  | 'scenario_b' // No recommendations: all clear, submission allowed
  | 'scenario_c' // Prerequisite block: missing prerequisite, submit disabled
  | 'scenario_d' // Deadline not open: opens in future, submit disabled
  | 'scenario_e' // Deadline closed: ended, submit disabled
  | 'scenario_f' // Deadline exception: personal extension to 20/10/2026
  | 'scenario_g' // Season not configured: unannounced deadline
  | 'scenario_h' // Submitted: read-only workspace, 'Đã gửi hồ sơ'
  | 'scenario_i' // Under review: 'Đang xét hồ sơ'
  | 'scenario_j' // All 5 reviewed: 'Đã hoàn tất xét 5 tiêu chí'
  | 'tracking_a' // Prompt 9 State A: Đã gửi hồ sơ
  | 'tracking_b' // Prompt 9 State B: Đang xét hồ sơ (Hero)
  | 'tracking_c' // Prompt 9 State C: Cần bổ sung
  | 'tracking_d' // Prompt 9 State D: Đã gửi bổ sung / Chờ tiếp tục xét
  | 'tracking_e'; // Prompt 9 State E: Đã hoàn tất xét 5 tiêu chí

export interface TrackingActivity {
  id: string;
  timestamp: string;
  message: string;
  criterionId?: 'ethics' | 'academic' | 'physical' | 'volunteer' | 'integration';
  criterionName?: string;
}

export interface SupplementRequestInfo {
  criterionId: 'ethics' | 'academic' | 'physical' | 'volunteer' | 'integration';
  criterionName: string;
  requirementId: string;
  requirementTitle: string;
  message: string;
  deadline: string;
}
