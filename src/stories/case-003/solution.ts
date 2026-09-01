import type { StorySolution, ObjectiveTrigger } from "@/stories/types";
import type { EvidenceTriggerContext } from "@/stories/types";

function rowHas(row: Record<string, unknown>, field: string, value: string): boolean {
  return String(row[field] ?? "").toLowerCase() === value.toLowerCase();
}
function anyRow(pred: (row: Record<string, unknown>) => boolean, rows: Record<string, unknown>[]): boolean {
  return rows.some(pred);
}

export const CASE_003_OBJECTIVE_TRIGGERS: ObjectiveTrigger[] = [
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
    test: () => false,
  },
];

export const CASE_003_SOLUTION: StorySolution = {
  who: "P003", // Dev Singh
  how: "M_TRAIN_MECHANISM",
  why: "M_SELL_SECRETS",
  objectiveTriggers: CASE_003_OBJECTIVE_TRIGGERS,
  reconstruction: [
    "Dev Singh, Arvind Rao's longtime head of security, had been secretly selling company security and logistics intelligence to a competing infrastructure consortium. Arvind discovered the betrayal and planned to expose Dev during a confidential meeting in Delhi.",
    "Weeks before the journey, Dev secretly modified a retractable maintenance spike inside a service assembly behind the decorative wall of A-coach. The spike was connected to a concealed actuator aligned with the service path near A-17's writing desk. Dev knew Arvind always worked at the desk after dinner.",
    "At 23:46:51, Dev's credential (DEV-Sec) accessed the security console — an action he later denied. At 23:47, the train entered Khandala Tunnel, switching CCTV to low-light mode. At 23:48:16, the hidden actuator changed state to DEPLOYED. At 23:48:19, the A-17 service-line sensor recorded a pressure spike — the moment of the fatal wound. At 23:48:20, the system returned to normal. At 23:48:21, the actuator retracted.",
    "The cabin door never opened. Nobody entered A-17. No conventional weapon remained inside. The murder weapon was part of the train — a modified component that extended, struck, and retracted through an existing service aperture. The locked-room mystery was never about who entered the room. It was about what could reach the room without entering it.",
  ],
};
