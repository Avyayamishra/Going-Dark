"use client";

import { EVIDENCE_TRIGGERS, type EvidenceTrigger, type EvidenceTriggerContext } from "@/data/caseData";
import type { DiscoveredEvidence } from "@/types";

/**
 * Evaluate evidence triggers against a query result. Returns the evidence
 * definitions that are newly satisfied (not already discovered).
 */
export function discoverEvidenceFromResult(
  ctx: EvidenceTriggerContext,
  alreadyDiscovered: DiscoveredEvidence[],
): EvidenceTrigger[] {
  const already = new Set(alreadyDiscovered.map((e) => e.evidenceId));
  return EVIDENCE_TRIGGERS.filter((t) => !already.has(t.evidenceId)).filter((t) => safeTest(t, ctx));
}

function safeTest(trigger: EvidenceTrigger, ctx: EvidenceTriggerContext): boolean {
  try {
    return trigger.test(ctx);
  } catch {
    return false;
  }
}
