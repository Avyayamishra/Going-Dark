import type { ObjectiveDefinition } from "@/stories/types";

export const CASE_001_OBJECTIVES: ObjectiveDefinition[] = [
  {
    id: "OBJ-1",
    title: "Establish who was present",
    description: "Determine who was present at Nexora Systems during the estimated time of death (22:40–22:55).",
    thread: "MOVEMENT",
    starterQuery: "SELECT person_name, location_name, entry_time, exit_time FROM visits WHERE entry_time BETWEEN '2025-03-14 22:30:00' AND '2025-03-14 23:00:00' ORDER BY entry_time;",
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
    starterQuery: "SELECT person_name, location_name, entry_time, exit_time FROM visits WHERE person_name LIKE '%Maya%' ORDER BY entry_time;",
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
    starterQuery: "SELECT * FROM transactions WHERE reference = 'TR-4817';",
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
    starterQuery: "SELECT timestamp, event_type, actor_name, details FROM security_logs WHERE event_type = 'CAMERA_DISABLED';",
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
    starterQuery: "SELECT call_time, caller_name, receiver_name, duration_sec FROM calls WHERE caller_name = 'Elias Voss' OR receiver_name = 'Elias Voss' ORDER BY call_time;",
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
    starterQuery: "SELECT sent_time, sender_name, receiver_name, content FROM messages WHERE (sender_name = 'Maya Chen' AND receiver_name = 'Daniel Brooks') OR (sender_name = 'Daniel Brooks' AND receiver_name = 'Maya Chen') ORDER BY sent_time;",
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
    starterQuery: "SELECT sent_time, sender_name, receiver_name, content FROM messages WHERE sender_name = 'Elias Voss' AND sent_time BETWEEN '2025-03-14 20:00:00' AND '2025-03-14 21:00:00' ORDER BY sent_time;",
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
    starterQuery: "SELECT timestamp, event_type, actor_name, details FROM security_logs WHERE event_type = 'TERMINAL_WIPE';",
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
    starterQuery: "SELECT account_holder, direction, COUNT(*) AS cnt, SUM(amount) AS total FROM transactions WHERE reference = 'TR-4817' GROUP BY account_holder, direction;",
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
    starterQuery: "SELECT v.person_name, v.location_name, v.entry_time, v.exit_time, sl.event_type, sl.actor_name FROM visits v JOIN security_logs sl ON v.person_id = sl.person_id WHERE v.location_name = 'Archive' AND sl.event_type IN ('TERMINAL_WIPE', 'CAMERA_DISABLED') ORDER BY v.entry_time;",
    hints: {
      1: { title: "Investigative direction", body: "You need a consistent theory: WHO, HOW, and WHY. The evidence should cover motive, opportunity, and a cover-up." },
      2: { title: "Database direction", body: "Cross-reference your discovered evidence: the TR-4817 financials, the movement contradiction, the camera disable, and the terminal wipe all point to one person." },
      3: { title: "SQL concept", body: "Use a JOIN across visits and security_logs to confirm the suspect who entered the Archive during the time of death is the same person who authenticated the terminal wipe." },
    },
  },
];
