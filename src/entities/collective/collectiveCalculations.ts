/**
 * 5TOT Đà Nẵng — Collective Criteria Threshold Calculations
 * Cơ quan quản lý: Thành Đoàn Đà Nẵng
 * Đơn vị tổ chức / vận hành nghiệp vụ: Hội Sinh viên Việt Nam Thành phố Đà Nẵng
 * Niên khóa áp dụng: Năm học 2025–2026
 *
 * Re-exports the single authoritative shared domain policy from @5tot/contracts
 * (Zero duplicate business implementation across Frontend & Backend).
 */

export {
  COLLECTIVE_TT02_REQUIRED_PERCENTAGE,
  COLLECTIVE_TT03_MIN_PERCENTAGE,
  calculateParticipationRate,
  isTT02ParticipationMet,
  calculateRecognitionRate,
  getMinimumRequiredRecognizedMembers,
  isTT03RecognitionMet,
} from '@5tot/contracts';
