/**
 * 信息检索结果类型定义
 */

export interface Source {
  name: string;
  url: string;
  reliability: number; // 0-1
}

export interface RetrievedInfo {
  query: string;
  content: string;
  sources: Source[];
  timestamp: Date;
  confidence: number; // 0-1
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  conflictingSources: Source[];
  supportingSources: Source[];
}
