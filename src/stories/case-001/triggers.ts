import type { EvidenceTrigger, EvidenceTriggerContext } from "@/stories/types";

// Content-based trigger helpers
function rowHas(row: Record<string, unknown>, field: string, value: string): boolean {
  return String(row[field] ?? "").toLowerCase() === value.toLowerCase();
}
function anyRow(pred: (row: Record<string, unknown>) => boolean, rows: Record<string, unknown>[]): boolean {
  return rows.some(pred);
}

export const CASE_001_EVIDENCE_TRIGGERS: EvidenceTrigger[] = [
  {
    evidenceId: "EVD-001",
    name: "Reference TR-4817 in Audit Notes",
    description: "A handwritten reference 'TR-4817' found in Elias Voss's personal audit notebook near the Archive terminal.",
    category: "PHYSICAL",
    significance: "The starting clue. TR-4817 is a reference code that recurs across many small transactions and several messages.",
    test: (c) =>
      /tr-4817/i.test(c.sqlUpper) &&
      (c.tableName === "transactions" || c.tableName === "messages" || c.tableName === "security_logs"),
  },
  {
    evidenceId: "EVD-002",
    name: "Disabled Camera Feed",
    description: "Archive camera CAM-04 manually disabled at 22:30:12 by admin user d.brooks from the Security Control Room.",
    category: "SECURITY",
    significance: "Establishes premeditation and an accomplice. Disabled remotely, not from inside the Archive.",
    test: (c) =>
      anyRow((r) => String(r.event_type ?? "").toUpperCase() === "CAMERA_DISABLED", c.rows) ||
      (/camera_disabled/i.test(c.sqlUpper) && c.rowCount > 0) ||
      anyRow((r) => /cam-04.*disabled/i.test(String(r.details ?? "")) || /disabled.*cam-04/i.test(String(r.details ?? "")), c.rows),
  },
  {
    evidenceId: "EVD-003",
    name: "Maya's Archive Access",
    description: "Badge MC-4471 (Maya Chen) entered the Archive at 22:41:09 and exited at 22:54:07 — during the estimated time of death.",
    category: "MOVEMENT",
    significance: "Places Maya at the scene during the time of death and contradicts her alibi.",
    test: (c) => {
      const mayaArchive = anyRow(
        (r) => rowHas(r, "person_name", "Maya Chen") && (rowHas(r, "location_name", "Archive") || rowHas(r, "location_id", "LOC-04")),
        c.rows,
      );
      const mayaArchiveLog = anyRow(
        (r) => /maya/i.test(String(r.actor_name ?? "")) && /archive/i.test(String(r.location_name ?? "")),
        c.rows,
      );
      const sqlTargetsMayaArchive =
        c.tableName === "visits" && /maya/i.test(c.sqlUpper) && /archive|loc-04/i.test(c.sqlUpper);
      return mayaArchive || mayaArchiveLog || sqlTargetsMayaArchive;
    },
  },
  {
    evidenceId: "EVD-004",
    name: "Maya's Return to the Building",
    description: "Badge MC-4471 re-entered via the Side Entrance at 22:18:22 — after exiting the Parking Garage at 21:00.",
    category: "MOVEMENT",
    significance: "Direct contradiction of Maya's alibi. She returned secretly via the unguarded side entrance.",
    test: (c) =>
      anyRow(
        (r) => rowHas(r, "person_name", "Maya Chen") && (rowHas(r, "location_name", "Side Entrance") || rowHas(r, "location_id", "LOC-11")),
        c.rows,
      ) ||
      anyRow(
        (r) => /maya/i.test(String(r.actor_name ?? "")) && /side entrance/i.test(String(r.location_name ?? "")),
        c.rows,
      ),
  },
  {
    evidenceId: "EVD-005",
    name: "Wiped Archive Terminal",
    description: "Archive workstation ARC-TERM-02 wiped at 22:50:41, authenticated as m.chen from the local console.",
    category: "SECURITY",
    significance: "Maya was inside the Archive at the time. Indicates an attempt to destroy evidence of the motive.",
    test: (c) =>
      anyRow((r) => String(r.event_type ?? "").toUpperCase() === "TERMINAL_WIPE", c.rows) ||
      (/terminal_wipe/i.test(c.sqlUpper) && c.rowCount > 0),
  },
  {
    evidenceId: "EVD-006",
    name: "TR-4817 Financial Pattern",
    description: "14 transactions tagged reference TR-4817: small outgoing vendor payments + incoming kickbacks to Maya Chen's account, all authorised by the same signatory.",
    category: "FINANCIAL",
    significance: "Provides motive: embezzlement. Only visible when transactions are aggregated by reference code.",
    test: (c) => {
      const queriedTR4817 = /tr-4817/i.test(c.sqlUpper) && c.tableName === "transactions";
      const hasMultipleTR4817Rows = queriedTR4817 && c.rowCount >= 3;
      const hasGroupBy = /group\s+by/i.test(c.sqlUpper);
      const showsMayaAggregation =
        hasGroupBy &&
        c.tableName === "transactions" &&
        anyRow((r) => /maya/i.test(String(r.account_holder ?? "")), c.rows) &&
        (c.columns.includes("count") || c.columns.includes("total") || c.columns.some((col) => /count|sum|total/i.test(col)));
      return hasMultipleTR4817Rows || showsMayaAggregation;
    },
  },
  {
    evidenceId: "EVD-007",
    name: "Elias's Confrontation Invitation",
    description: "Email chain Elias↔Maya at 20:45–20:49. Elias requests a private meeting at the Archive at 22:30.",
    category: "MESSAGE",
    significance: "Establishes Elias arranged the meeting and already had the evidence — Maya was being confronted.",
    test: (c) =>
      c.tableName === "messages" &&
      anyRow(
        (r) =>
          (rowHas(r, "sender_name", "Elias Voss") && rowHas(r, "receiver_name", "Maya Chen")) ||
          (rowHas(r, "sender_name", "Maya Chen") && rowHas(r, "receiver_name", "Elias Voss")),
        c.rows,
      ),
  },
  {
    evidenceId: "EVD-008",
    name: "Maya-Daniel Coordination",
    description: "SMS chain Maya↔Daniel 21:15–22:09: 'He knows. He pulled the TR-4817 file... I need the room dark.' 'How dark.' 'CAM-04.'",
    category: "COMMUNICATION",
    significance: "Establishes Daniel as accomplice (camera) and Maya as principal (returned, entered Archive).",
    test: (c) => {
      const msgCoordination =
        c.tableName === "messages" &&
        anyRow(
          (r) =>
            (rowHas(r, "sender_name", "Maya Chen") && rowHas(r, "receiver_name", "Daniel Brooks")) ||
            (rowHas(r, "sender_name", "Daniel Brooks") && rowHas(r, "receiver_name", "Maya Chen")),
          c.rows,
        );
      const callCoordination =
        c.tableName === "calls" &&
        anyRow(
          (r) =>
            (rowHas(r, "caller_name", "Maya Chen") && rowHas(r, "receiver_name", "Daniel Brooks")) ||
            (rowHas(r, "caller_name", "Daniel Brooks") && rowHas(r, "receiver_name", "Maya Chen")),
          c.rows,
        );
      return msgCoordination || callCoordination;
    },
  },
  // EVD-010 (Missing Phone) — previously discovered via the evidence table,
  // which is now hidden from players. This evidence is discovered via the
  // timeline when the player finds the wiped terminal (EVD-005) instead.
  {
    evidenceId: "EVD-010",
    name: "Missing Phone",
    description: "Elias Voss's phone unrecovered. Last signal at 22:51 near the Archive.",
    category: "PHYSICAL",
    significance: "Likely removed by the killer to suppress communications.",
    test: (c) =>
      // Fires when the player finds the terminal wipe — the phone went dark
      // at almost the same time (22:51 vs 22:50:41).
      anyRow((r) => String(r.event_type ?? "").toUpperCase() === "TERMINAL_WIPE", c.rows),
  },
  {
    evidenceId: "EVD-012",
    name: "Building Movement Log",
    description: "Complete badge access log for 2025-03-14 establishing who was present.",
    category: "MOVEMENT",
    significance: "The master movement record. Cross-referencing reveals Maya's secret return.",
    test: (c) => c.tableName === "visits" && c.rowCount >= 8,
  },
];

// Helper for the evidence engine.
export function discoverEvidenceFromResult(
  ctx: EvidenceTriggerContext,
  triggers: EvidenceTrigger[],
  alreadyDiscovered: string[],
): EvidenceTrigger[] {
  const already = new Set(alreadyDiscovered);
  return triggers.filter((t) => !already.has(t.evidenceId)).filter((t) => safeTest(t, ctx));
}

function safeTest(trigger: EvidenceTrigger, ctx: EvidenceTriggerContext): boolean {
  try {
    return trigger.test(ctx);
  } catch {
    return false;
  }
}
