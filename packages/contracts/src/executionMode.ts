/**
 * 5TOT Đà Nẵng — Canonical Execution Mode Vocabulary (@5tot/contracts)
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 */

export type ExecutionMode = 'DEMO' | 'BACKEND';

export const EXECUTION_MODES = {
  DEMO: 'DEMO' as const,
  BACKEND: 'BACKEND' as const,
};
