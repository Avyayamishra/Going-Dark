import type { ObjectiveDefinition } from "@/stories/types";

export const CASE_002_OBJECTIVES: ObjectiveDefinition[] = [
  {
    id: "OBJ-1",
    title: "Find the satellite",
    description: "Which satellite experienced critical events between 01:50 and 02:30 UTC?",
    thread: "SECURITY",
    starterQuery: "SELECT * FROM satellite_events WHERE timestamp BETWEEN '2025-03-15 01:50:00' AND '2025-03-15 02:30:00' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Look for satellite telemetry events during the incident window." },
      2: { title: "Database direction", body: "The satellite_events table records all telemetry. Filter by timestamp using BETWEEN." },
      3: { title: "SQL concept", body: "Use WHERE with BETWEEN to filter timestamps, then ORDER BY to see the sequence." },
    },
  },
  {
    id: "OBJ-2",
    title: "Find the seven-minute gap",
    description: "What happened between 02:13 and 02:21 UTC? Events are missing from the telemetry record.",
    thread: "SECURITY",
    starterQuery: "SELECT * FROM satellite_events WHERE timestamp BETWEEN '2025-03-15 02:13:00' AND '2025-03-15 02:21:00' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "There's a gap in the telemetry. Find what events exist in that window." },
      2: { title: "Database direction", body: "Query satellite_events filtered to the 02:13–02:21 window." },
      3: { title: "SQL concept", body: "Use WHERE with BETWEEN and ORDER BY timestamp to see the timeline." },
    },
  },
  {
    id: "OBJ-3",
    title: "Find the access ID",
    description: "Which access IDs successfully authenticated with the satellite during the incident?",
    thread: "SECURITY",
    starterQuery: "SELECT DISTINCT access_id FROM access_logs WHERE satellite_id = 'SAT-9147' AND result = 'SUCCESS';",
    hints: {
      1: { title: "Investigative direction", body: "Someone authenticated with the satellite. Find their access ID." },
      2: { title: "Database direction", body: "access_logs records authentication events. Filter for successful authentications." },
      3: { title: "SQL concept", body: "Use SELECT DISTINCT to see unique access_id values, with WHERE for the satellite and result." },
    },
  },
  {
    id: "OBJ-4",
    title: "Who owns the credential?",
    description: "Who is registered as the owner of credential RUS-77A?",
    thread: "MOVEMENT",
    starterQuery: "SELECT c.*, a.name, a.codename FROM credentials c JOIN agents a ON c.owner_id = a.agent_id WHERE c.access_id = 'RUS-77A';",
    hints: {
      1: { title: "Investigative direction", body: "The access ID RUS-77A belongs to someone. Find out who." },
      2: { title: "Database direction", body: "credentials table maps access_id to owner_id. agents table has the names." },
      3: { title: "SQL concept", body: "Use JOIN to connect credentials with agents on owner_id = agent_id." },
    },
  },
  {
    id: "OBJ-5",
    title: "Where was the credential owner?",
    description: "Where was the credential owner recorded during the satellite incident?",
    thread: "MOVEMENT",
    starterQuery: "SELECT am.*, l.name AS location_name FROM agent_movements am JOIN locations l ON am.location_id = l.location_id WHERE am.agent_id = 'AGT-001' AND am.arrived_at BETWEEN '2025-03-15 01:00:00' AND '2025-03-15 03:00:00';",
    hints: {
      1: { title: "Investigative direction", body: "If the credential owner was somewhere else, someone else used it." },
      2: { title: "Database direction", body: "agent_movements shows where each agent was. Join with locations to see names." },
      3: { title: "SQL concept", body: "JOIN agent_movements with locations, filter by agent_id and time range with BETWEEN." },
    },
  },
  {
    id: "OBJ-6",
    title: "Find the communication pattern",
    description: "Which pair of agents communicated most frequently before the incident?",
    thread: "COMMUNICATION",
    starterQuery: "SELECT sender_id, receiver_id, COUNT(*) AS msg_count FROM communications WHERE timestamp BETWEEN '2025-03-14 20:00:00' AND '2025-03-15 02:30:00' GROUP BY sender_id, receiver_id ORDER BY msg_count DESC LIMIT 5;",
    hints: {
      1: { title: "Investigative direction", body: "Look for unusual communication patterns before the incident." },
      2: { title: "Database direction", body: "communications table has sender_id and receiver_id. Count messages per pair." },
      3: { title: "SQL concept", body: "Use GROUP BY sender_id, receiver_id with COUNT(*), then ORDER BY count DESC LIMIT 5." },
    },
  },
  {
    id: "OBJ-7",
    title: "Find the financial connection",
    description: "Which agents received unusual financial transfers with reference TR-914?",
    thread: "FINANCIAL",
    starterQuery: "SELECT fr.*, a.name, a.codename FROM financial_records fr JOIN agents a ON fr.agent_id = a.agent_id WHERE fr.reference_code = 'TR-914';",
    hints: {
      1: { title: "Investigative direction", body: "Follow the money. Reference code TR-914 connects financial activity to the operation." },
      2: { title: "Database direction", body: "financial_records has a reference_code column. Filter for TR-914." },
      3: { title: "SQL concept", body: "Use WHERE reference_code = 'TR-914' and JOIN with agents to see names." },
    },
  },
  {
    id: "OBJ-8",
    title: "Find the identity anomaly",
    description: "Which access IDs were associated with more than one claimed identity?",
    thread: "SECURITY",
    starterQuery: "SELECT access_id, COUNT(DISTINCT claimed_identity) AS identity_count FROM identity_events GROUP BY access_id HAVING COUNT(DISTINCT claimed_identity) > 1;",
    hints: {
      1: { title: "Investigative direction", body: "Someone used RUS-77A under different names. Prove the identity trail was manipulated." },
      2: { title: "Database direction", body: "identity_events records claimed identities per access_id. Look for access_ids used under multiple identities." },
      3: { title: "SQL concept", body: "Use GROUP BY access_id with COUNT(DISTINCT claimed_identity) and HAVING > 1." },
    },
  },
  {
    id: "OBJ-9",
    title: "Build the timeline",
    description: "Reconstruct the timeline of the suspect's movements, communications, and financial activity during the incident.",
    thread: "MOVEMENT",
    starterQuery: "SELECT 'movement' AS type, arrived_at AS timestamp, location_id FROM agent_movements WHERE agent_id = 'AGT-003' UNION SELECT 'communication' AS type, timestamp, receiver_id FROM communications WHERE sender_id = 'AGT-003' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "For the main suspect, combine their movements, communications, and financials into one timeline." },
      2: { title: "Database direction", body: "Query agent_movements, communications, and financial_records for the suspect. Use UNION to combine them." },
      3: { title: "SQL concept", body: "Use UNION ALL to combine results from multiple tables, with ORDER BY timestamp to create the timeline." },
    },
  },
  {
    id: "OBJ-10",
    title: "Build the accusation",
    description: "Connect all evidence threads — credentials, communications, financials, identity, movements — to identify the culprit.",
    thread: "ACCUSATION",
    starterQuery: "SELECT a.name, a.codename, a.role FROM agents a WHERE a.agent_id IN (SELECT owner_id FROM credentials WHERE access_id = 'RUS-77A') OR a.agent_id IN (SELECT agent_id FROM financial_records WHERE reference_code = 'TR-914');",
    hints: {
      1: { title: "Investigative direction", body: "All threads converge on one person. Who connects RUS-77A, TR-914, the communications, and the location?" },
      2: { title: "Database direction", body: "Cross-reference credentials, financial_records, communications, and agent_movements." },
      3: { title: "SQL concept", body: "Use subqueries with IN to find agents connected to multiple evidence threads simultaneously." },
    },
  },
];
