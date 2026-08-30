import type { StorySolution, ObjectiveTrigger } from "@/stories/types";
import type { EvidenceTriggerContext } from "@/stories/types";

// Helpers
function rowHas(row: Record<string, unknown>, field: string, value: string): boolean {
  return String(row[field] ?? "").toLowerCase() === value.toLowerCase();
}
function anyRow(pred: (row: Record<string, unknown>) => boolean, rows: Record<string, unknown>[]): boolean {
  return rows.some(pred);
}

// Objective triggers: complete objectives when the player runs relevant queries.
// These fire based on query content + result patterns, independent of evidence discovery.
export const CASE_001_OBJECTIVE_TRIGGERS: ObjectiveTrigger[] = [
  // OBJ-1: who was present during TOD — fires when querying visits in the TOD window
  {
    objectiveId: "OBJ-1",
    test: (c) =>
      c.tableName === "visits" &&
      /22:[34]\d|22:5\d|between/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  // OBJ-2: movement contradiction — fires when querying a suspect's visits and seeing re-entry
  {
    objectiveId: "OBJ-2",
    test: (c) =>
      c.tableName === "visits" &&
      /maya/i.test(c.sqlUpper) &&
      c.rowCount >= 5,
  },
  // OBJ-3: investigate TR-4817 — fires when querying transactions with TR-4817
  {
    objectiveId: "OBJ-3",
    test: (c) =>
      c.tableName === "transactions" &&
      /tr-4817/i.test(c.sqlUpper) &&
      c.rowCount >= 3,
  },
  // OBJ-4: camera gap — fires when finding CAMERA_DISABLED events
  {
    objectiveId: "OBJ-4",
    test: (c) =>
      c.tableName === "security_logs" &&
      (/camera_disabled/i.test(c.sqlUpper) || anyRow((r) => String(r.event_type ?? "").toUpperCase() === "CAMERA_DISABLED", c.rows)),
  },
  // OBJ-5: communications with Elias — fires when querying calls/messages involving Elias
  {
    objectiveId: "OBJ-5",
    test: (c) =>
      (c.tableName === "calls" || c.tableName === "messages") &&
      /elias/i.test(c.sqlUpper) &&
      c.rowCount >= 3,
  },
  // OBJ-6: coordination — fires when finding Maya-Daniel messages or calls
  {
    objectiveId: "OBJ-6",
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
  // OBJ-7: confrontation — fires when finding Elias→Maya messages around 20:45
  {
    objectiveId: "OBJ-7",
    test: (c) =>
      c.tableName === "messages" &&
      /elias/i.test(c.sqlUpper) &&
      /maya/i.test(c.sqlUpper) &&
      c.rowCount > 0,
  },
  // OBJ-8: wiped terminal — fires when finding TERMINAL_WIPE events
  {
    objectiveId: "OBJ-8",
    test: (c) =>
      c.tableName === "security_logs" &&
      (/terminal_wipe/i.test(c.sqlUpper) || anyRow((r) => String(r.event_type ?? "").toUpperCase() === "TERMINAL_WIPE", c.rows)),
  },
  // OBJ-9: tie money to suspect — fires when aggregating TR-4817 by account_holder
  {
    objectiveId: "OBJ-9",
    test: (c) =>
      c.tableName === "transactions" &&
      /tr-4817/i.test(c.sqlUpper) &&
      /group\s+by/i.test(c.sqlUpper) &&
      anyRow((r) => /maya/i.test(String(r.account_holder ?? "")), c.rows),
  },
  // OBJ-10: build accusation — fires when the player has enough evidence (checked separately)
  {
    objectiveId: "OBJ-10",
    test: () => false, // OBJ-10 completes via the accusation flow, not queries
  },
];

export const CASE_001_SOLUTION: StorySolution = {
  who: "S001", // Maya Chen
  how: "M_RETURN_ARCHIVE",
  why: "M_EMBEZZLEMENT",
  objectiveTriggers: CASE_001_OBJECTIVE_TRIGGERS,
  reconstruction: [
    "Over several months, CFO Maya Chen embezzled funds from Nexora Systems through a scheme of small vendor payments tagged with the reference code TR-4817. Fourteen transactions — outward payments to five shell consulting firms, with kickbacks routed back to her personal account — totalled tens of thousands of dollars. Individually, each payment looked routine. Aggregated, they were a confession.",
    "On the night of March 14, CEO Elias Voss completed an audit that exposed the pattern. He invited Maya to a private meeting at the Archive at 22:30 — ostensibly to walk her through the file. Maya messaged Daniel Brooks, Head of Security: \u201CHe knows. He pulled the TR-4817 file\u2026 I need the room dark.\u201D Daniel disabled the Archive camera, CAM-04, from the Security Control Room at 22:30. Maya, who had supposedly driven home at 21:00, secretly re-entered the building through the unguarded Side Entrance at 22:18.",
    "She entered the Archive at 22:41 — during the estimated time of death — and killed Elias by manual strangulation. She then wiped the archive terminal at 22:50, authenticated as herself, to destroy the local copy of the audit, took Elias\u2019s phone to suppress his messages, and exited at 22:54. Daniel sent a final confirmation by SMS: \u201CDone. Drive safe.\u201D Ryan Cole discovered the body at 23:47.",
  ],
};
