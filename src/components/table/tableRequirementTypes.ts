import { RequirementStatus } from '../../tokens';
import { EvidenceFileItem } from '../evidence/EvidenceFileChip';

export interface RequirementData {
  id: string;
  criterionId: string;
  title: string;
  ruleBadge: string;
  ruleHelper?: string;
  declarationValue: string;
  declarationDetail?: string;
  declarationDate?: string;
  evidenceFiles: EvidenceFileItem[];
  status: RequirementStatus;
  recommendation?: {
    variant: 'info' | 'recommendation' | 'hard_blocker';
    message: string;
    actionLabel?: string;
  };
}
