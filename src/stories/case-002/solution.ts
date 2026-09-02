import type { StorySolution, ObjectiveTrigger } from "@/stories/types";
import type { EvidenceTriggerContext } from "@/stories/types";

function rowHas(row: Record<string, unknown>, field: string, value: string): boolean {
  return String(row[field] ?? "").toLowerCase() === value.toLowerCase();
}
function anyRow(pred: (row: Record<string, unknown>) => boolean, rows: Record<string, unknown>[]): boolean {
  return rows.some(pred);
}

export const CASE_002_OBJECTIVE_TRIGGERS: ObjectiveTrigger[] = [
  {
    objectiveId: "OBJ-1",
    test: (c) =>
      (c.tableName === "passengers" || c.tableName === "tickets" || c.tableName === "cabin_assignments") &&
      /coach|cabin/i.test(c.sqlUpper) &&
      c.rowCount >= 5,
  },
  {
    objectiveId: "OBJ-2",
    test: (c) =>
      c.tableName === "dining_transactions" &&
      /arvind|p006/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  {
    objectiveId: "OBJ-3",
    test: (c) =>
      (c.tableName === "station_logs" || c.tableName === "cctv_metadata") &&
      c.rowCount >= 5,
  },
  {
    objectiveId: "OBJ-4",
    test: (c) =>
      (c.tableName === "train_sensors" || c.tableName === "cctv_metadata" || c.tableName === "access_logs" || c.tableName === "maintenance_logs") &&
      /23:4[789]|23:5[012]|between/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  {
    objectiveId: "OBJ-5",
    test: (c) =>
      c.tableName === "access_logs" &&
      /a-17/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  {
    objectiveId: "OBJ-6",
    test: (c) =>
      c.tableName === "maintenance_logs" &&
      /carriage.*a|a.*coach|'a'/i.test(c.sqlUpper) &&
      c.rowCount >= 2,
  },
  {
    objectiveId: "OBJ-7",
    test: (c) =>
      (c.tableName === "access_logs" && /dev-sec/i.test(c.sqlUpper) && c.rowCount > 0) ||
      anyRow((r) => String(r.credential_id ?? "").toUpperCase() === "DEV-SEC", c.rows),
  },
  {
    objectiveId: "OBJ-8",
    test: (c) =>
      c.tableName === "train_sensors" &&
      /23:4[6-9]|23:5[0-2]|between|carriage/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
];

/**
 * Python objective triggers — evaluated against the user's Python code + stdout
 * after each Python execution. The tests look for evidence that the player wrote
 * the right kind of loop and surfaced the right kind of data.
 */
export const CASE_002_PYTHON_OBJECTIVE_TRIGGERS: ObjectiveTrigger[] = [
  {
    // OBJ-PY1: loop over train_sensors, filter A + PRESSURE, surface the fatal spike
    objectiveId: "OBJ-PY1",
    test: (c) => {
      if (c.language !== "python") return false;
      const code = c.pythonCode ?? "";
      const stdout = c.pythonStdout ?? "";
      // Must iterate over train_sensors
      if (!/train_sensors/.test(code)) return false;
      // Must contain a for-loop
      if (!/\bfor\b.*:/.test(code)) return false;
      // Must filter by PRESSURE in the code
      if (!/PRESSURE|pressure/i.test(code)) return false;
      // Stdout must surface the fatal spike value OR a timestamp in the 23:48 window
      // (the spike occurred at 23:48:19 with value SPIKE)
      const stdoutHasSpike = /SPIKE/i.test(stdout);
      const stdoutHasMurderTimestamp = /23:48:\d{2}/.test(stdout);
      return Boolean(stdoutHasSpike || stdoutHasMurderTimestamp);
    },
  },
  {
    // OBJ-PY2: cross-reference DEV-Sec access with maintenance actions
    objectiveId: "OBJ-PY2",
    test: (c) => {
      if (c.language !== "python") return false;
      const code = c.pythonCode ?? "";
      const stdout = c.pythonStdout ?? "";
      // Must reference access_logs AND maintenance_logs
      if (!/access_logs/.test(code)) return false;
      if (!/maintenance_logs/.test(code)) return false;
      // Must filter for DEV-Sec
      if (!/DEV-Sec|dev_sec/i.test(code)) return false;
      // Must contain a nested or chained loop
      const hasNestedLoop = (code.match(/\bfor\b/g) ?? []).length >= 2;
      // Stdout must mention both an access event and a maintenance action
      const stdoutMentionsAccess = /DEV-Sec|access/i.test(stdout);
      const stdoutMentionsMaintenance = /maintenance|actuator|state_change|STATE_CHANGE|component/i.test(stdout);
      return Boolean(hasNestedLoop && stdoutMentionsAccess && stdoutMentionsMaintenance);
    },
  },
  {
    // OBJ-PY3: build a merged timeline from multiple sources, sorted by timestamp
    objectiveId: "OBJ-PY3",
    test: (c) => {
      if (c.language !== "python") return false;
      const code = c.pythonCode ?? "";
      const stdout = c.pythonStdout ?? "";
      // Must reference at least 3 of the 4 source tables
      const sources = ["train_sensors", "access_logs", "maintenance_logs", "cctv_metadata"];
      const referencedCount = sources.filter((s) => code.includes(s)).length;
      if (referencedCount < 3) return false;
      // Must sort by timestamp
      if (!/\.sort\s*\(/.test(code) || !/timestamp/.test(code)) return false;
      // Stdout must contain at least 5 timeline events (timestamps)
      const timestampCount = (stdout.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/g) ?? []).length;
      return timestampCount >= 5;
    },
  },
];

export const CASE_002_SOLUTION: StorySolution = {
  who: "P003", // Dev Singh
  how: "M_TRAIN_MECHANISM",
  why: "M_SELL_SECRETS",
  objectiveTriggers: CASE_002_OBJECTIVE_TRIGGERS,
  pythonObjectiveTriggers: CASE_002_PYTHON_OBJECTIVE_TRIGGERS,
  reconstruction: [
    "Dev Singh, Arvind Rao's longtime head of security, had been secretly selling company security and logistics intelligence to a competing infrastructure consortium. Arvind discovered the betrayal and planned to expose Dev during a confidential meeting in Delhi.",
    "Weeks before the journey, Dev secretly modified a retractable maintenance spike inside a service assembly behind the decorative wall of A-coach. The spike was connected to a concealed actuator aligned with the service path near A-17's writing desk. Dev knew Arvind always worked at the desk after dinner.",
    "At 23:46:51, Dev's credential (DEV-Sec) accessed the security console — an action he later denied. At 23:47, the train entered Khandala Tunnel, switching CCTV to low-light mode. At 23:48:16, the hidden actuator changed state to DEPLOYED. At 23:48:19, the A-17 service-line sensor recorded a pressure spike — the moment of the fatal wound. At 23:48:20, the system returned to normal. At 23:48:21, the actuator retracted.",
    "The cabin door never opened. Nobody entered A-17. No conventional weapon remained inside. The murder weapon was part of the train — a modified component that extended, struck, and retracted through an existing service aperture. The locked-room mystery was never about who entered the room. It was about what could reach the room without entering it.",
  ],
};
