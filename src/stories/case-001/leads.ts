import type { LeadDefinition } from "@/stories/types";

export const CASE_001_LEADS: LeadDefinition[] = [
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
