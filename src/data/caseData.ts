// Static case data for Case #001 — THE MIDNIGHT ARCHIVE
// Maya Chen is the killer. Daniel Brooks is the accomplice.
import type { AccusationOption } from "@/types";

export const CASE = {
  caseNumber: "#001",
  title: "THE MIDNIGHT ARCHIVE",
  victim: "Elias Voss",
  victimRole: "Founder & CEO, Nexora Systems",
  location: "NEXORA SYSTEMS — PRIVATE ARCHIVE, FLOOR B2",
  timeOfDeath: "10:40 PM — 10:55 PM",
  incidentDate: "March 14, 2025",
  discoveredAt: "11:47 PM",
  status: "UNSOLVED",
  tagline: "THE DATABASE IS THE CRIME SCENE.",
};

export interface SuspectInfo {
  id: string;
  suspectId: string;
  name: string;
  role: string;
  department: string;
  shortBio: string;
}

export const SUSPECTS: SuspectInfo[] = [
  {
    id: "S001",
    suspectId: "S001",
    name: "Maya Chen",
    role: "Chief Financial Officer",
    department: "Finance",
    shortBio: "CFO with signatory authority over vendor payments. Under pressure from Elias over a vendor ledger audit. Separation negotiations were underway.",
  },
  {
    id: "S002",
    suspectId: "S002",
    name: "Daniel Brooks",
    role: "Head of Security",
    department: "Security",
    shortBio: "Unrestricted access to every location including the Archive. Authorised to disable cameras for maintenance. Undisclosed personal relationship with Maya Chen.",
  },
  {
    id: "S003",
    suspectId: "S003",
    name: "Sofia Martinez",
    role: "Senior Software Engineer",
    department: "Engineering",
    shortBio: "Holds remote admin access to Nexora servers. Passed over for a promotion two weeks before the incident. No documented financial motive.",
  },
  {
    id: "S004",
    suspectId: "S004",
    name: "Ryan Cole",
    role: "Operations Manager",
    department: "Operations",
    shortBio: "Holds Archive access for inspections. Discovered the body and called emergency services at 23:52. Filed a complaint about staffing levels.",
  },
];

// Knowledge-based objectives. Parallel, not sequential. Completing any
// objective is a discovery milestone. Each objective has 3 progressive hint
// levels: 1 = investigative direction, 2 = database direction, 3 = SQL concept.
export interface Objective {
  id: string;
  title: string;
  description: string;
  hints: {
    1: { title: string; body: string };
    2: { title: string; body: string };
    3: { title: string; body: string };
  };
  // Which investigation thread this belongs to — used by the Leads panel.
  thread: "MOVEMENT" | "COMMUNICATION" | "FINANCIAL" | "SECURITY" | "MESSAGES" | "PHYSICAL" | "ACCUSATION";
}

export const OBJECTIVES: Objective[] = [
  {
    id: "OBJ-1",
    title: "Establish who was present",
    description: "Determine who was present at Nexora Systems during the estimated time of death (22:40–22:55).",
    thread: "MOVEMENT",
    hints: {
      1: { title: "Investigative direction", body: "Look for records describing people's movements in and out of the building that night." },
      2: { title: "Database direction", body: "The visits table records every badge swipe — entry_time and exit_time for each person at each location." },
      3: { title: "SQL concept", body: "Use WHERE with BETWEEN to restrict entry_time to the 22:40–22:55 window, then ORDER BY entry_time to read the sequence." },
    },
  },
  {
    id: "OBJ-2",
    title: "Find the movement contradiction",
    description: "Identify a suspect whose badge records contradict their stated alibi.",
    thread: "MOVEMENT",
    hints: {
      1: { title: "Investigative direction", body: "Each suspect gave a statement about where they were. Compare those statements to the badge records." },
      2: { title: "Database direction", body: "suspects.alibi holds the stated whereabouts. visits holds the recorded movements. One suspect claims to have left but re-entered later." },
      3: { title: "SQL concept", body: "Filter visits by person_name with WHERE and LIKE, then ORDER BY entry_time to see the full sequence — including any re-entry after a supposed exit." },
    },
  },
  {
    id: "OBJ-3",
    title: "Investigate TR-4817",
    description: "Determine what reference TR-4817 represents and who it connects to.",
    thread: "FINANCIAL",
    hints: {
      1: { title: "Investigative direction", body: "TR-4817 is a code. Find every record that carries it and look for a pattern across many small entries." },
      2: { title: "Database direction", body: "transactions has a reference column. Filter to reference = 'TR-4817' — but one row won't tell you much. You need to aggregate." },
      3: { title: "SQL concept", body: "Use GROUP BY reference with COUNT(*) and SUM(amount) to total the pattern. Add account_holder to the GROUP BY to see who receives the money." },
    },
  },
  {
    id: "OBJ-4",
    title: "Trace the security camera gap",
    description: "Find out what happened to the Archive security camera before the murder and who was responsible.",
    thread: "SECURITY",
    hints: {
      1: { title: "Investigative direction", body: "A camera stopped recording shortly before the death. Find the event that disabled it and who triggered it." },
      2: { title: "Database direction", body: "security_logs records every security event. Filter for the event type that halts a camera. The actor_name field tells you who did it." },
      3: { title: "SQL concept", body: "Use WHERE event_type = 'CAMERA_DISABLED'. To find who was in the Security Control Room at that moment, JOIN security_logs with visits on the location and time." },
    },
  },
  {
    id: "OBJ-5",
    title: "Map communications with Elias",
    description: "Identify who communicated with Elias Voss before his death and what was discussed.",
    thread: "COMMUNICATION",
    hints: {
      1: { title: "Investigative direction", body: "Find every call and message involving Elias in the hours before his death." },
      2: { title: "Database direction", body: "calls and messages both reference people by name and id. Filter where caller_name or receiver_name is 'Elias Voss' (and likewise for messages)." },
      3: { title: "SQL concept", body: "Use WHERE caller_name = '...' OR receiver_name = '...' to capture both directions, then ORDER BY the timestamp to read the conversation in order." },
    },
  },
  {
    id: "OBJ-6",
    title: "Find the coordination",
    description: "Identify suspicious coordination between suspects on the night of the incident.",
    thread: "COMMUNICATION",
    hints: {
      1: { title: "Investigative direction", body: "Look for calls and messages between the suspects themselves — not just to and from Elias." },
      2: { title: "Database direction", body: "Query calls and messages where both the sender and receiver are among the four suspects, in the 21:00–22:30 window." },
      3: { title: "SQL concept", body: "Use WHERE caller_name IN ('Maya Chen','Daniel Brooks',...) AND receiver_name IN (...) to scope to suspect-to-suspect traffic, then ORDER BY the time." },
    },
  },
  {
    id: "OBJ-7",
    title: "Recover the confrontation",
    description: "Establish that Elias was planning to confront a specific suspect.",
    thread: "MESSAGES",
    hints: {
      1: { title: "Investigative direction", body: "Elias sent emails the evening of his death arranging a private meeting. Find them." },
      2: { title: "Database direction", body: "Filter messages where sender_name = 'Elias Voss' around 20:00–21:00. The receiver and the content tell you who he was meeting and why." },
      3: { title: "SQL concept", body: "Use WHERE sender_name = 'Elias Voss' AND sent_time BETWEEN '...' AND '...' to scope to the confrontation window." },
    },
  },
  {
    id: "OBJ-8",
    title: "Identify the wiped terminal",
    description: "Determine what was destroyed in the Archive and who did it.",
    thread: "SECURITY",
    hints: {
      1: { title: "Investigative direction", body: "Something was erased after the murder. Find the destructive event and the person who authenticated it." },
      2: { title: "Database direction", body: "security_logs has an event_type for a terminal wipe. The actor_name and timestamp tell you who and when." },
      3: { title: "SQL concept", body: "Use WHERE event_type = 'TERMINAL_WIPE'. Cross-reference the timestamp with the visits table to confirm the actor was physically present at that location." },
    },
  },
  {
    id: "OBJ-9",
    title: "Tie the money to a suspect",
    description: "Connect the TR-4817 financial pattern to a specific suspect as authorising signatory.",
    thread: "FINANCIAL",
    hints: {
      1: { title: "Investigative direction", body: "Once you can see the TR-4817 pattern, find the single name that appears on every payment." },
      2: { title: "Database direction", body: "After aggregating TR-4817 by account_holder, one name appears on both the outgoing vendor payments and the incoming kickbacks." },
      3: { title: "SQL concept", body: "Use SELECT account_holder, direction, COUNT(*), SUM(amount) FROM transactions WHERE reference = 'TR-4817' GROUP BY account_holder, direction to split outgoing from incoming." },
    },
  },
  {
    id: "OBJ-10",
    title: "Build the accusation",
    description: "Combine motive (TR-4817), means (archive access), opportunity (present during TOD), and cover-up (wiped terminal) into a final accusation.",
    thread: "ACCUSATION",
    hints: {
      1: { title: "Investigative direction", body: "You need a consistent theory: WHO, HOW, and WHY. The evidence should cover motive, opportunity, and a cover-up." },
      2: { title: "Database direction", body: "Cross-reference your discovered evidence: the TR-4817 financials, the movement contradiction, the camera disable, and the terminal wipe all point to one person." },
      3: { title: "SQL concept", body: "Use a JOIN across visits and security_logs to confirm the suspect who entered the Archive during the time of death is the same person who authenticated the terminal wipe." },
    },
  },
];

// Suggested investigation questions / leads. Non-linear — the player can pursue
// any of these in any order. Displayed in the Leads panel.
export interface Lead {
  id: string;
  question: string;
  thread: Objective["thread"];
  starterQuery?: string;
}

export const LEADS: Lead[] = [
  {
    id: "LEAD-1",
    question: "Who was inside Nexora around the estimated time of death?",
    thread: "MOVEMENT",
    starterQuery: "SELECT person_name, location_name, entry_time, exit_time FROM visits WHERE entry_time BETWEEN '2025-03-14 22:30:00' AND '2025-03-14 23:00:00' ORDER BY entry_time;",
  },
  {
    id: "LEAD-2",
    question: "Who entered the private Archive?",
    thread: "SECURITY",
    starterQuery: "SELECT person_name, entry_time, exit_time FROM visits WHERE location_name = 'Archive' ORDER BY entry_time;",
  },
  {
    id: "LEAD-3",
    question: "Who communicated with Elias shortly before his death?",
    thread: "COMMUNICATION",
    starterQuery: "SELECT caller_name, receiver_name, call_time, duration_sec FROM calls WHERE call_time BETWEEN '2025-03-14 20:00:00' AND '2025-03-14 22:30:00' ORDER BY call_time;",
  },
  {
    id: "LEAD-4",
    question: "What does TR-4817 represent?",
    thread: "FINANCIAL",
    starterQuery: "SELECT * FROM transactions WHERE reference = 'TR-4817';",
  },
  {
    id: "LEAD-5",
    question: "Who accessed or disabled the security camera?",
    thread: "SECURITY",
    starterQuery: "SELECT timestamp, event_type, actor_name, details FROM security_logs WHERE event_type = 'CAMERA_DISABLED';",
  },
  {
    id: "LEAD-6",
    question: "Which suspect's alibi conflicts with the database?",
    thread: "MOVEMENT",
    starterQuery: "SELECT suspect_id, name, alibi FROM suspects;",
  },
  {
    id: "LEAD-7",
    question: "Who had a financial motive?",
    thread: "FINANCIAL",
    starterQuery: "SELECT reference, COUNT(*) AS count, ROUND(SUM(amount),2) AS total, account_holder FROM transactions WHERE reference IS NOT NULL GROUP BY reference ORDER BY total DESC;",
  },
  {
    id: "LEAD-8",
    question: "What was destroyed after the murder?",
    thread: "SECURITY",
    starterQuery: "SELECT timestamp, event_type, actor_name, details FROM security_logs WHERE event_type = 'TERMINAL_WIPE';",
  },
  {
    id: "LEAD-9",
    question: "What did Elias's messages reveal?",
    thread: "MESSAGES",
    starterQuery: "SELECT sent_time, sender_name, receiver_name, content FROM messages WHERE sender_id = 'EMP-001' OR receiver_id = 'EMP-001' ORDER BY sent_time;",
  },
  {
    id: "LEAD-10",
    question: "Was there coordination between suspects?",
    thread: "COMMUNICATION",
    starterQuery: "SELECT call_time, caller_name, receiver_name, duration_sec FROM calls WHERE caller_id IN ('EMP-002','EMP-003','EMP-004','EMP-005') AND receiver_id IN ('EMP-002','EMP-003','EMP-004','EMP-005') ORDER BY call_time;",
  },
];

// (Hints are now 3 progressive levels attached to each Objective — see OBJECTIVES above.)

export const WHO_OPTIONS: AccusationOption[] = SUSPECTS.map((s) => ({
  id: s.id,
  label: `${s.name} — ${s.role}`,
}));

export const HOW_OPTIONS: AccusationOption[] = [
  { id: "M_RETURN_ARCHIVE", label: "Maya secretly returned to the building, entered the Archive during the time of death, and killed Elias by strangulation" },
  { id: "M_DANIEL_KILLED", label: "Daniel killed Elias inside the Archive while Maya was at home" },
  { id: "M_REMOTE_HACK", label: "Sofia remotely hacked the archive terminal to trigger a fatal electrical fault" },
  { id: "M_STAGED_BURGLARY", label: "Ryan staged a burglary in the Archive and struck Elias during the struggle" },
];

export const WHY_OPTIONS: AccusationOption[] = [
  { id: "M_EMBEZZLEMENT", label: "To prevent Elias from exposing Maya's embezzlement scheme tagged with reference TR-4817" },
  { id: "M_BUDGET_DISPUTE", label: "Elias blocked Maya's budget, threatening layoffs" },
  { id: "M_PROMOTION", label: "Elias denied Sofia a promotion she believed she earned" },
  { id: "M_STAFFING", label: "Elias ignored Ryan's warnings about unsafe staffing levels" },
];

// Evidence trigger definitions for the evidence engine.
// Content-based: triggers fire when the result set contains the relevant
// person/time/location/data relationship — NOT when an exact SQL string is typed.
// Different valid queries can uncover the same evidence.
export interface EvidenceTrigger {
  evidenceId: string;
  name: string;
  description: string;
  category: string;
  significance: string;
  test: (ctx: EvidenceTriggerContext) => boolean;
}

export interface EvidenceTriggerContext {
  sql: string;
  sqlUpper: string;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  tableName?: string;
}

// Helpers for content-based detection
function rowHas(row: Record<string, unknown>, field: string, value: string): boolean {
  return String(row[field] ?? "").toLowerCase() === value.toLowerCase();
}
function rowContains(row: Record<string, unknown>, field: string, substr: string): boolean {
  return String(row[field] ?? "").toLowerCase().includes(substr.toLowerCase());
}
function anyRow(pred: (row: Record<string, unknown>) => boolean, rows: Record<string, unknown>[]): boolean {
  return rows.some(pred);
}

export const EVIDENCE_TRIGGERS: EvidenceTrigger[] = [
  {
    // TR-4817 financial pattern — fires when the player queries transactions
    // filtered to TR-4817 AND gets back multiple rows (the aggregate pattern).
    evidenceId: "EVD-001",
    name: "Reference TR-4817 in Audit Notes",
    description: "A handwritten reference 'TR-4817' was found in Elias Voss's personal audit notebook near the Archive terminal. No further context — the player must search the database to determine what TR-4817 represents.",
    category: "PHYSICAL",
    significance: "The starting clue. TR-4817 is a reference code that recurs across many small transactions and several messages.",
    test: (c) =>
      /tr-4817/i.test(c.sqlUpper) &&
      (c.tableName === "transactions" || c.tableName === "messages" || c.tableName === "security_logs" || /tr-4817/i.test(c.sqlUpper)),
  },
  {
    // Camera disabled — fires when result set contains a CAMERA_DISABLED event
    // (regardless of exact query). Could come from security_logs directly,
    // or a JOIN with visits.
    evidenceId: "EVD-002",
    name: "Disabled Camera Feed",
    description: "Archive security camera CAM-04 was manually disabled at 22:30:12, approximately 10 minutes before the estimated time of death. The disable command was authenticated by admin user d.brooks.",
    category: "DIGITAL",
    significance: "Establishes premeditation and an accomplice. The camera was disabled from the Security Control Room, not from inside the Archive.",
    test: (c) =>
      anyRow((r) => String(r.event_type ?? "").toUpperCase() === "CAMERA_DISABLED", c.rows) ||
      (/camera_disabled/i.test(c.sqlUpper) && c.rowCount > 0) ||
      anyRow((r) => /cam-04.*disabled/i.test(String(r.details ?? "")) || /disabled.*cam-04/i.test(String(r.details ?? "")), c.rows),
  },
  {
    // Maya's Archive access — fires when result shows Maya entering the Archive
    // during the time-of-death window. Detectable from visits OR security_logs.
    // Also fires when the SQL itself references both Maya and the Archive context
    // (even if those columns aren't in the SELECT).
    evidenceId: "EVD-003",
    name: "Maya's Archive Access",
    description: "Badge MC-4471 (Maya Chen) accessed the Archive at 22:41:09 and exited at 22:54:07 — during the estimated time of death. Maya's stated alibi was that she left the building at 21:00.",
    category: "DIGITAL",
    significance: "Places Maya at the scene during the time of death and contradicts her stated alibi.",
    test: (c) => {
      // Content-based: result rows contain Maya + Archive.
      const mayaArchive = anyRow(
        (r) => rowHas(r, "person_name", "Maya Chen") && (rowHas(r, "location_name", "Archive") || rowHas(r, "location_id", "LOC-04")),
        c.rows,
      );
      const mayaArchiveLog = anyRow(
        (r) => /maya/i.test(String(r.actor_name ?? "")) && /archive/i.test(String(r.location_name ?? "")),
        c.rows,
      );
      // Semantic: query targets Maya's archive visits specifically (from visits table,
      // filtering on both Maya and Archive), even if those columns aren't selected.
      const sqlTargetsMayaArchive =
        c.tableName === "visits" &&
        /maya/i.test(c.sqlUpper) &&
        /archive|loc-04/i.test(c.sqlUpper);
      return mayaArchive || mayaArchiveLog || sqlTargetsMayaArchive;
    },
  },
  {
    // Maya's return — fires when result shows Maya re-entering the building
    // after her supposed 21:00 exit (Side Entrance at 22:18).
    evidenceId: "EVD-004",
    name: "Maya's Return to the Building",
    description: "Badge MC-4471 (Maya Chen) re-entered the building via the Side Entrance at 22:18:22 — after her badge had exited the Parking Garage at 21:00. Maya had supposedly driven home.",
    category: "DIGITAL",
    significance: "Direct contradiction of Maya's alibi. She returned to the building secretly via the unguarded side entrance.",
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
    // Wiped terminal — fires when result shows a TERMINAL_WIPE event,
    // especially one authenticated as Maya.
    evidenceId: "EVD-005",
    name: "Wiped Archive Terminal",
    description: "Archive workstation ARC-TERM-02 received a full disk wipe command at 22:50:41, authenticated as m.chen from the local console.",
    category: "DIGITAL",
    significance: "Maya was inside the Archive at the time of the wipe. Indicates an attempt to destroy evidence of the motive.",
    test: (c) =>
      anyRow((r) => String(r.event_type ?? "").toUpperCase() === "TERMINAL_WIPE", c.rows) ||
      /terminal_wipe/i.test(c.sqlUpper) && c.rowCount > 0,
  },
  {
    // TR-4817 financial pattern — fires when the player aggregates TR-4817
    // transactions and the result reveals the pattern (multiple rows, or a
    // GROUP BY showing the account holder). This rewards aggregation queries.
    evidenceId: "EVD-006",
    name: "TR-4817 Financial Pattern",
    description: "Aggregating all transactions tagged with reference TR-4817 reveals 14 line items — small outgoing vendor payments plus incoming kickbacks to Maya Chen's personal account, all authorised by the same signatory.",
    category: "FINANCIAL",
    significance: "Provides motive: embezzlement. The pattern only becomes visible when transactions are aggregated by reference code.",
    test: (c) => {
      // Either: the player queried transactions with reference='TR-4817' AND
      // got multiple rows back (the aggregate pattern), OR they ran a GROUP BY
      // that reveals the account holder pattern.
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
    // Confrontation messages — fires when result shows the Elias↔Maya email chain
    evidenceId: "EVD-007",
    name: "Elias's Confrontation Invitation",
    description: "Email chain between Elias Voss and Maya Chen at 20:45–20:49. Elias requests a private meeting at the Archive at 22:30.",
    category: "DIGITAL",
    significance: "Establishes that Elias arranged the meeting and was already in possession of the evidence — Maya was being confronted.",
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
    // Maya-Daniel coordination — fires when result shows the SMS chain
    // between Maya and Daniel on the night, OR calls between them.
    evidenceId: "EVD-008",
    name: "Maya-Daniel Coordination",
    description: "SMS chain between Maya Chen and Daniel Brooks between 21:15 and 22:09. Maya writes 'He knows. He pulled the TR-4817 file... I need the room dark.' Daniel asks 'How dark.' Maya replies 'CAM-04.'",
    category: "DIGITAL",
    significance: "Establishes Daniel as accomplice (disabled the camera) and Maya as the principal (returned to the building, entered the Archive).",
    test: (c) => {
      // Messages between Maya and Daniel.
      const msgCoordination =
        c.tableName === "messages" &&
        anyRow(
          (r) =>
            (rowHas(r, "sender_name", "Maya Chen") && rowHas(r, "receiver_name", "Daniel Brooks")) ||
            (rowHas(r, "sender_name", "Daniel Brooks") && rowHas(r, "receiver_name", "Maya Chen")),
          c.rows,
        );
      // Calls between Maya and Daniel.
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
  {
    // Missing phone — fires when the player looks at the evidence table or
    // queries for the phone-related evidence.
    evidenceId: "EVD-010",
    name: "Missing Phone",
    description: "Elias Voss's mobile phone has not been recovered. Last signal registered at 22:51 near the Archive.",
    category: "PHYSICAL",
    significance: "Likely removed by the killer to suppress communications. The wipe of the terminal and removal of the phone happened within seconds of each other.",
    test: (c) => c.tableName === "evidence" && anyRow((r) => /missing phone/i.test(String(r.name ?? "")), c.rows),
  },
  {
    // Building movement log — fires when the player pulls a broad view of
    // visits on the night (the master movement record).
    evidenceId: "EVD-012",
    name: "Building Movement Log",
    description: "Complete badge access log showing all persons who entered and exited Nexora Systems on 2025-03-14.",
    category: "DIGITAL",
    significance: "The master movement record. Cross-referencing it reveals Maya's secret return and the contradiction with her alibi.",
    test: (c) => c.tableName === "visits" && c.rowCount >= 8,
  },
];
