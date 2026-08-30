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
    test: (c) => c.tableName === "satellite_events" && /01:5|02:[0-3]|between/i.test(c.sqlUpper) && c.rowCount > 0,
  },
  {
    objectiveId: "OBJ-2",
    test: (c) => c.tableName === "satellite_events" && /02:1[3-9]|02:2[0-1]|between/i.test(c.sqlUpper) && c.rowCount >= 0,
  },
  {
    objectiveId: "OBJ-3",
    test: (c) => c.tableName === "access_logs" && (/distinct|rus-77a/i.test(c.sqlUpper)) && c.rowCount > 0,
  },
  {
    objectiveId: "OBJ-4",
    test: (c) => c.tableName === "credentials" && /rus-77a|join/i.test(c.sqlUpper) && c.rowCount > 0,
  },
  {
    objectiveId: "OBJ-5",
    test: (c) => c.tableName === "agent_movements" && /agt-001|sokolov/i.test(c.sqlUpper) && c.rowCount > 0,
  },
  {
    objectiveId: "OBJ-6",
    test: (c) => c.tableName === "communications" && /group\s+by|count/i.test(c.sqlUpper) && c.rowCount > 0,
  },
  {
    objectiveId: "OBJ-7",
    test: (c) => c.tableName === "financial_records" && /tr-914/i.test(c.sqlUpper) && c.rowCount > 0,
  },
  {
    objectiveId: "OBJ-8",
    test: (c) => c.tableName === "identity_events" && (/count.*distinct|group\s+by/i.test(c.sqlUpper)) && c.rowCount > 0,
  },
  {
    objectiveId: "OBJ-9",
    test: (c) => /union/i.test(c.sqlUpper) && c.rowCount > 0,
  },
  {
    objectiveId: "OBJ-10",
    test: () => false,
  },
];

export const CASE_002_SOLUTION: StorySolution = {
  who: "AGT-003", // Anya Petrova
  how: "M_CRED_THEFT",
  why: "M_EXTRACT_KEY",
  objectiveTriggers: CASE_002_OBJECTIVE_TRIGGERS,
  reconstruction: [
    "Anya Petrova, an FSB Intelligence Analyst, orchestrated the breach of KOSMOS-9147. She stole Colonel Viktor Sokolov's credential RUS-77A — not through hacking, but through her position inside the intelligence network. Sokolov was officially at the Moscow Secure Facility during the entire incident, hundreds of kilometers from the Plesetsk Uplink Station where the satellite access originated.",
    "In the hours before the breach, Anya communicated with Dmitri Volkov of GRU Cyber Operations 8 times — far more than any other pair. Their messages referenced TR-914, a code that also appeared in financial records: 5 separate payments to Anya and 2 to Dmitri. The payments were structured to look routine individually, but together they funded a coordinated intelligence operation.",
    "At 01:58 UTC, RUS-77A authenticated with KOSMOS-9147. At 02:05, the identity trail was manipulated — RUS-77A was used to claim 4 different identities, proving the access was deliberate deception. At 02:13, the satellite's telemetry went dark for exactly 7 minutes and 42 seconds. During this gap, classified orbital communication keys were extracted. Anya remained at the uplink facility throughout.",
    "Ethan Hunt was deliberately inserted into the investigation trail. His mission assignment placed him elsewhere, but his movement records show him at the uplink facility. This was not a mistake — it was designed to create an intelligence incident that would cause multiple agencies to suspect one another. The satellite breach was only one part of a much larger operation.",
  ],
};
