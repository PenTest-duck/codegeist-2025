/**
 * Frontend Type Definitions
 * Re-exports backend types for type safety
 */

// Re-export backend types
export type {
  CurrentStatus,
  TimingAnalysis,
  LoadAnalysis,
  StrengthAnalysis,
  CollaborationAnalysis,
  TrendAnalysis,
} from '../../backend/models/analysis';

// Frontend-specific types
export interface ForgeContext {
  extension?: {
    type?: string;
  };
  accountId?: string;
  [key: string]: any;
}
