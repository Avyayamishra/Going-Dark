// Shared type definitions for the GOING DARK game.

export interface QueryHistoryItem {
  id: string;
  sql: string;
  executedAt: number;
  ok: boolean;
  rowCount: number;
  durationMs: number;
  errorTitle?: string;
}

export interface DiscoveredEvidence {
  id: string;
  evidenceId: string;
  name: string;
  description: string;
  category: string;
  significance: string;
  discoveredAt: number;
  triggerQuery?: string;
  source?: string;
}

export interface InvestigationNote {
  id: string;
  text: string;
  createdAt: number;
}

export interface HintItem {
  id: string;
  level: number;
  title: string;
  body: string;
  revealedAt: number;
}

export interface AccusationRecord {
  who: string;
  how: string;
  why: string;
  evidence: string[];
  correct: boolean;
  correctCount: number;
  evidenceCoverage: number;
  submittedAt: number;
}

export interface TimelineEvent {
  id: string;
  time: string;
  label: string;
  description?: string;
  evidenceId?: string;
  addedAt: number;
}

export interface AccusationOption {
  id: string;
  label: string;
}
