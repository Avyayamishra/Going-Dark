import type { EvidenceTrigger, EvidenceTriggerContext } from "@/stories/types";

function rowHas(row: Record<string, unknown>, field: string, value: string): boolean {
  return String(row[field] ?? "").toLowerCase() === value.toLowerCase();
}
function anyRow(pred: (row: Record<string, unknown>) => boolean, rows: Record<string, unknown>[]): boolean {
  return rows.some(pred);
}

export const CASE_001_EVIDENCE_TRIGGERS: EvidenceTrigger[] = [
  {
    evidenceId: "EVD-001",
    name: "Seven-Minute Telemetry Gap",
    description: "KOSMOS-9147's telemetry record shows a gap between 02:13 and 02:21 UTC.",
    category: "SECURITY",
    significance: "Proves the satellite was tampered with during a specific window.",
    test: (c) =>
      c.tableName === "satellite_events" &&
      /02:1[3-9]|02:2[0-1]|between/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  {
    evidenceId: "EVD-002",
    name: "RUS-77A Authentication",
    description: "Access ID RUS-77A successfully authenticated with KOSMOS-9147 during the incident.",
    category: "SECURITY",
    significance: "Identifies the credential used in the breach.",
    test: (c) =>
      (c.tableName === "access_logs" && /rus-77a/i.test(c.sqlUpper) && c.rowCount > 0) ||
      anyRow((r) => String(r.access_id ?? "").toUpperCase() === "RUS-77A", c.rows),
  },
  {
    evidenceId: "EVD-003",
    name: "Sokolov's Credential Ownership",
    description: "Credential RUS-77A officially belongs to Colonel Viktor Sokolov (AGT-001).",
    category: "SECURITY",
    significance: "Links the access ID to Sokolov.",
    test: (c) =>
      c.tableName === "credentials" &&
      /rus-77a/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  {
    evidenceId: "EVD-004",
    name: "Sokolov's Location Contradiction",
    description: "Sokolov was at a different location during the incident — someone else used his credential.",
    category: "MOVEMENT",
    significance: "Proves Sokolov did not personally use RUS-77A.",
    test: (c) =>
      c.tableName === "agent_movements" &&
      /agt-001|sokolov/i.test(c.sqlUpper) &&
      c.rowCount >= 2,
  },
  {
    evidenceId: "EVD-005",
    name: "Anya-Dmitri Communication Pattern",
    description: "Anya Petrova and Dmitri Volkov communicated 8 times before the incident.",
    category: "COMMUNICATION",
    significance: "Establishes coordination between two suspects.",
    test: (c) => {
      if (c.tableName !== "communications") return false;
      const anyaDmitri = anyRow(
        (r) =>
          (rowHas(r, "sender_id", "AGT-003") && rowHas(r, "receiver_id", "AGT-004")) ||
          (rowHas(r, "sender_id", "AGT-004") && rowHas(r, "receiver_id", "AGT-003")),
        c.rows,
      );
      const hasGroupBy = /group\s+by/i.test(c.sqlUpper);
      const showsPairAggregation = hasGroupBy && c.rowCount >= 1;
      return anyaDmitri || showsPairAggregation;
    },
  },
  {
    evidenceId: "EVD-006",
    name: "TR-914 Financial Pattern",
    description: "Anya Petrova received 5 payments tagged TR-914.",
    category: "FINANCIAL",
    significance: "Provides motive: payment for the satellite operation.",
    test: (c) =>
      c.tableName === "financial_records" &&
      /tr-914/i.test(c.sqlUpper) &&
      c.rowCount >= 3,
  },
  {
    evidenceId: "EVD-007",
    name: "TR-914 Cross-Table References",
    description: "TR-914 appears in both financial_records and communications message hashes.",
    category: "COMMUNICATION",
    significance: "Connects financial payments to communications.",
    test: (c) =>
      c.tableName === "communications" &&
      /tr-914/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  {
    evidenceId: "EVD-008",
    name: "Identity Trail Manipulation",
    description: "RUS-77A was used to claim 4 different identities.",
    category: "SECURITY",
    significance: "Proves the identity trail was deliberately manipulated.",
    test: (c) =>
      c.tableName === "identity_events" &&
      (/count.*distinct|group\s+by/i.test(c.sqlUpper)) &&
      (c.rowCount > 0 || /rus-77a/i.test(c.sqlUpper)),
  },
  {
    evidenceId: "EVD-009",
    name: "Anya's Location at Uplink Facility",
    description: "Anya Petrova was at the Plesetsk Uplink Station during the entire incident window.",
    category: "MOVEMENT",
    significance: "Places Anya at the scene of the satellite breach.",
    test: (c) =>
      c.tableName === "agent_movements" &&
      /agt-003|petrova/i.test(c.sqlUpper) &&
      c.rowCount >= 2,
  },
  {
    evidenceId: "EVD-010",
    name: "Ethan Hunt's False Trail",
    description: "Ethan Hunt's movements contradict his mission assignment.",
    category: "MOVEMENT",
    significance: "Reveals Ethan was deliberately inserted to create a false trail.",
    test: (c) =>
      c.tableName === "mission_records" &&
      /agt-002|ethan/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
];

export function discoverEvidenceFromResult(
  ctx: EvidenceTriggerContext,
  triggers: EvidenceTrigger[],
  alreadyDiscovered: string[],
): EvidenceTrigger[] {
  const already = new Set(alreadyDiscovered);
  return triggers.filter((t) => !already.has(t.evidenceId)).filter((t) => {
    try { return t.test(ctx); } catch { return false; }
  });
}
