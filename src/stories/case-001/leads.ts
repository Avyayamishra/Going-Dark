import type { LeadDefinition } from "@/stories/types";

export const CASE_001_LEADS: LeadDefinition[] = [
  {
    id: "LEAD-1",
    question: "Which satellite had critical events during the incident window?",
    thread: "SECURITY",
    starterQuery: "SELECT * FROM satellite_events WHERE timestamp BETWEEN '2025-03-15 01:50:00' AND '2025-03-15 02:30:00' ORDER BY timestamp;",
  },
  {
    id: "LEAD-2",
    question: "What events occurred during the seven-minute gap (02:13–02:21)?",
    thread: "SECURITY",
    starterQuery: "SELECT * FROM satellite_events WHERE timestamp BETWEEN '2025-03-15 02:13:00' AND '2025-03-15 02:21:00' ORDER BY timestamp;",
  },
  {
    id: "LEAD-3",
    question: "Which access IDs were used to authenticate with the satellite?",
    thread: "SECURITY",
    starterQuery: "SELECT DISTINCT access_id FROM access_logs WHERE satellite_id = 'SAT-9147' AND result = 'SUCCESS';",
  },
  {
    id: "LEAD-4",
    question: "Who owns credential RUS-77A?",
    thread: "MOVEMENT",
    starterQuery: "SELECT c.*, a.name, a.codename FROM credentials c JOIN agents a ON c.owner_id = a.agent_id WHERE c.access_id = 'RUS-77A';",
  },
  {
    id: "LEAD-5",
    question: "Where was the credential owner during the incident?",
    thread: "MOVEMENT",
    starterQuery: "SELECT am.*, l.name FROM agent_movements am JOIN locations l ON am.location_id = l.location_id WHERE am.agent_id = 'AGT-001';",
  },
  {
    id: "LEAD-6",
    question: "Who communicated most before the incident?",
    thread: "COMMUNICATION",
    starterQuery: "SELECT sender_id, receiver_id, COUNT(*) AS cnt FROM communications WHERE timestamp < '2025-03-15 02:30:00' GROUP BY sender_id, receiver_id ORDER BY cnt DESC LIMIT 10;",
  },
  {
    id: "LEAD-7",
    question: "Who received payments tagged TR-914?",
    thread: "FINANCIAL",
    starterQuery: "SELECT * FROM financial_records WHERE reference_code = 'TR-914';",
  },
  {
    id: "LEAD-8",
    question: "Was RUS-77A used under multiple identities?",
    thread: "SECURITY",
    starterQuery: "SELECT access_id, COUNT(DISTINCT claimed_identity) AS identities FROM identity_events GROUP BY access_id HAVING COUNT(DISTINCT claimed_identity) > 1;",
  },
  {
    id: "LEAD-9",
    question: "Which agents were near the uplink facility?",
    thread: "MOVEMENT",
    starterQuery: "SELECT am.*, a.name, l.name AS loc_name FROM agent_movements am JOIN agents a ON am.agent_id = a.agent_id JOIN locations l ON am.location_id = l.location_id WHERE am.location_id = 'LOC-01';",
  },
  {
    id: "LEAD-10",
    question: "What does TR-914 connect to?",
    thread: "FINANCIAL",
    starterQuery: "SELECT * FROM communications WHERE message_hash LIKE '%TR-914%';",
  },
];
