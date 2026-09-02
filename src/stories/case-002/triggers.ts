import type { EvidenceTrigger, EvidenceTriggerContext } from "@/stories/types";

function rowHas(row: Record<string, unknown>, field: string, value: string): boolean {
  return String(row[field] ?? "").toLowerCase() === value.toLowerCase();
}
function anyRow(pred: (row: Record<string, unknown>) => boolean, rows: Record<string, unknown>[]): boolean {
  return rows.some(pred);
}

export const CASE_002_EVIDENCE_TRIGGERS: EvidenceTrigger[] = [
  {
    evidenceId: "EVD-001",
    name: "Arvind's Last Dining Record",
    description: "Arvind Rao's final dining transaction at 23:15 places him alive before returning to A-17.",
    category: "MOVEMENT",
    significance: "Establishes the victim was alive shortly before the tunnel.",
    test: (c) =>
      c.tableName === "dining_transactions" &&
      anyRow((r) => rowHas(r, "passenger_id", "P006"), c.rows) &&
      c.rowCount > 0,
  },
  {
    evidenceId: "EVD-002",
    name: "Locked Cabin — No Access",
    description: "Access logs show A-17 was locked and all unlock attempts during the murder window were DENIED.",
    category: "SECURITY",
    significance: "The locked-room paradox: the murder happened without cabin entry.",
    test: (c) =>
      c.tableName === "access_logs" &&
      /a-17/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  {
    evidenceId: "EVD-003",
    name: "CCTV Low-Light During Tunnel",
    description: "CCTV shows no person entering A-17 during the tunnel.",
    category: "SECURITY",
    significance: "Corroborates that no one physically entered A-17.",
    test: (c) =>
      c.tableName === "cctv_metadata" &&
      /23:4[789]|23:5[012]|low_light/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  {
    evidenceId: "EVD-004",
    name: "Suspicious Maintenance Action",
    description: "A maintenance log at 23:48:16 shows STATE_CHANGE on ACTUATOR in A-coach during the tunnel.",
    category: "SECURITY",
    significance: "A mechanical component was manipulated during the murder window.",
    test: (c) =>
      (c.tableName === "maintenance_logs" && /state_change|actuator/i.test(c.sqlUpper) && c.rowCount > 0) ||
      (c.tableName === "maintenance_logs" && /carriage.*a|a.*coach/i.test(c.sqlUpper) && c.rowCount >= 3),
  },
  {
    evidenceId: "EVD-005",
    name: "A-17 Pressure Spike",
    description: "Train sensor at 23:48:19 recorded a PRESSURE SPIKE on A-17 service line.",
    category: "SECURITY",
    significance: "An abnormal mechanical event occurred inside A-17 during the death window.",
    test: (c) =>
      c.tableName === "train_sensors" &&
      /pressure|spike/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  {
    evidenceId: "EVD-006",
    name: "Dev's Security Console Access",
    description: "Access log at 23:46:51 shows credential DEV-Sec accessing the SECURITY-CONSOLE.",
    category: "SECURITY",
    significance: "Directly contradicts Dev's alibi. His credential was used seconds before the tunnel.",
    test: (c) =>
      (c.tableName === "access_logs" && /dev-sec/i.test(c.sqlUpper) && c.rowCount > 0) ||
      anyRow((r) => String(r.credential_id ?? "").toUpperCase() === "DEV-SEC", c.rows),
  },
  {
    evidenceId: "EVD-007",
    name: "Actuator Deployed and Retracted",
    description: "Train sensors show ACTUATOR_STATE changed to DEPLOYED at 23:48:16 and RETRACTED at 23:48:21.",
    category: "SECURITY",
    significance: "A concealed mechanism was deployed and retracted during the murder.",
    test: (c) =>
      c.tableName === "train_sensors" &&
      /actuator/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  {
    evidenceId: "EVD-008",
    name: "Medical Report — Mechanism Wound",
    description: "The medical report describes the wound as consistent with a retractable mechanism.",
    category: "PHYSICAL",
    significance: "Corroborates that the weapon was a mechanical device.",
    test: (c) => c.tableName === "medical_report" && c.rowCount > 0,
  },
  {
    evidenceId: "EVD-009",
    name: "Kabir's Suspicious Dining Charge",
    description: "Kabir Malhotra has a dining transaction at 23:38 in the Service Corridor.",
    category: "MOVEMENT",
    significance: "Red herring — places Kabir near a service area but chronology clears him.",
    test: (c) =>
      c.tableName === "dining_transactions" &&
      anyRow((r) => /service corridor/i.test(String(r.location ?? "")), c.rows),
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
