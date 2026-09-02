import type { ObjectiveDefinition } from "@/stories/types";

export const CASE_001_OBJECTIVES: ObjectiveDefinition[] = [
  {
    id: "OBJ-1",
    title: "Filter satellite_events by incident window",
    description:
      "Write a SELECT statement against the satellite_events table, using WHERE timestamp BETWEEN '2025-03-15 01:50:00' AND '2025-03-15 02:30:00' and ORDER BY timestamp, to identify which satellite emitted CRITICAL events during the incident window. Inspect the satellite_id, event_type, and severity columns of each returned row.",
    thread: "SECURITY",
    language: "sql",
    starterQuery:
      "SELECT * FROM satellite_events WHERE timestamp BETWEEN '2025-03-15 01:50:00' AND '2025-03-15 02:30:00' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Filter the telemetry log to the incident window — events outside it are noise." },
      2: { title: "Database direction", body: "The satellite_events table records all telemetry. Filter by timestamp using WHERE ... BETWEEN ... AND ... ORDER BY timestamp." },
      3: { title: "SQL technique", body: "Use SELECT * FROM satellite_events WHERE timestamp BETWEEN '2025-03-15 01:50:00' AND '2025-03-15 02:30:00' ORDER BY timestamp;" },
    },
  },
  {
    id: "OBJ-2",
    title: "Isolate the seven-minute telemetry gap",
    description:
      "Write a SELECT statement that filters satellite_events to the 02:13–02:21 UTC window using WHERE timestamp BETWEEN, then ORDER BY timestamp. Compare the boundary rows to confirm there is a 7-minute-42-second gap with no events between TELEMETRY_LOSS and TELEMETRY_RESTORE.",
    thread: "SECURITY",
    language: "sql",
    starterQuery:
      "SELECT * FROM satellite_events WHERE timestamp BETWEEN '2025-03-15 02:13:00' AND '2025-03-15 02:21:00' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "There is a gap in the telemetry record. Find the events immediately before and after it." },
      2: { title: "Database direction", body: "Query satellite_events filtered to the 02:13:00–02:21:00 window with WHERE ... BETWEEN ... AND ... ORDER BY timestamp." },
      3: { title: "SQL technique", body: "Use WHERE timestamp BETWEEN '2025-03-15 02:13:00' AND '2025-03-15 02:21:00' ORDER BY timestamp. Note the gap between the two boundary rows." },
    },
  },
  {
    id: "OBJ-3",
    title: "Use SELECT DISTINCT to list authenticating access IDs",
    description:
      "Use SELECT DISTINCT access_id FROM access_logs WHERE satellite_id = 'SAT-9147' AND result = 'SUCCESS' to enumerate the access IDs that successfully authenticated with the satellite. Click each returned row to inspect the credential identity.",
    thread: "SECURITY",
    language: "sql",
    starterQuery:
      "SELECT DISTINCT access_id FROM access_logs WHERE satellite_id = 'SAT-9147' AND result = 'SUCCESS';",
    hints: {
      1: { title: "Investigative direction", body: "Someone authenticated with the satellite during the incident. Find the access_id they used." },
      2: { title: "Database direction", body: "access_logs records authentication events. Filter for the target satellite and SUCCESS, then use DISTINCT to deduplicate." },
      3: { title: "SQL technique", body: "Use SELECT DISTINCT access_id FROM access_logs WHERE satellite_id = 'SAT-9147' AND result = 'SUCCESS';" },
    },
  },
  {
    id: "OBJ-4",
    title: "JOIN credentials to agents to identify the owner",
    description:
      "Write a JOIN between credentials and agents on c.owner_id = a.agent_id, filtered by WHERE c.access_id = 'RUS-77A', to find the registered owner of the credential that authenticated with the satellite.",
    thread: "MOVEMENT",
    language: "sql",
    starterQuery:
      "SELECT c.access_id, c.status, a.name, a.codename, a.role FROM credentials c JOIN agents a ON c.owner_id = a.agent_id WHERE c.access_id = 'RUS-77A';",
    hints: {
      1: { title: "Investigative direction", body: "The credential RUS-77A belongs to someone. Find out who they are." },
      2: { title: "Database direction", body: "The credentials table maps access_id to owner_id. The agents table has the names. Join them on owner_id = agent_id." },
      3: { title: "SQL technique", body: "Use JOIN ... ON c.owner_id = a.agent_id WHERE c.access_id = 'RUS-77A'." },
    },
  },
  {
    id: "OBJ-5",
    title: "JOIN agent_movements with locations to verify the owner's alibi",
    description:
      "JOIN agent_movements with locations on am.location_id = l.location_id, filtering by WHERE am.agent_id = 'AGT-001' AND am.arrived_at BETWEEN '2025-03-15 01:00:00' AND '2025-03-15 03:00:00'. Inspect the location_name column to confirm whether the credential owner was physically present at the uplink facility during the incident.",
    thread: "MOVEMENT",
    language: "sql",
    starterQuery:
      "SELECT am.agent_id, am.arrived_at, am.departed_at, l.name AS location_name, l.description FROM agent_movements am JOIN locations l ON am.location_id = l.location_id WHERE am.agent_id = 'AGT-001' AND am.arrived_at BETWEEN '2025-03-15 01:00:00' AND '2025-03-15 03:00:00';",
    hints: {
      1: { title: "Investigative direction", body: "If the credential owner was somewhere else, someone else must have used it." },
      2: { title: "Database direction", body: "agent_movements records where each agent was. JOIN with locations to get the human-readable name. Filter by agent_id and a time range." },
      3: { title: "SQL technique", body: "Use JOIN agent_movements am ... ON am.location_id = l.location_id WHERE am.agent_id = 'AGT-001' AND am.arrived_at BETWEEN ... AND ..." },
    },
  },
  {
    id: "OBJ-6",
    title: "GROUP BY communication pairs and COUNT messages",
    description:
      "Write an aggregate query: SELECT sender_id, receiver_id, COUNT(*) AS msg_count FROM communications WHERE timestamp BETWEEN '2025-03-14 20:00:00' AND '2025-03-15 02:30:00' GROUP BY sender_id, receiver_id ORDER BY msg_count DESC LIMIT 5. Identify the most-frequent communication pair before the incident.",
    thread: "COMMUNICATION",
    language: "sql",
    starterQuery:
      "SELECT sender_id, receiver_id, COUNT(*) AS msg_count FROM communications WHERE timestamp BETWEEN '2025-03-14 20:00:00' AND '2025-03-15 02:30:00' GROUP BY sender_id, receiver_id ORDER BY msg_count DESC LIMIT 5;",
    hints: {
      1: { title: "Investigative direction", body: "Look for unusual communication patterns before the incident — the most-frequent pair is the conspiracy." },
      2: { title: "Database direction", body: "communications has sender_id and receiver_id. Group by the pair and count messages per pair." },
      3: { title: "SQL technique", body: "Use GROUP BY sender_id, receiver_id with COUNT(*), then ORDER BY msg_count DESC LIMIT 5." },
    },
  },
  {
    id: "OBJ-7",
    title: "Filter financial_records by reference code TR-914",
    description:
      "Write a JOIN between financial_records and agents on fr.agent_id = a.agent_id, filtered by WHERE fr.reference_code = 'TR-914', to list every payment tagged with the conspiracy's reference code. Inspect which agents received money and how much.",
    thread: "FINANCIAL",
    language: "sql",
    starterQuery:
      "SELECT fr.record_id, fr.agent_id, a.name, a.codename, fr.amount, fr.currency, fr.transaction_time, fr.reference_code FROM financial_records fr JOIN agents a ON fr.agent_id = a.agent_id WHERE fr.reference_code = 'TR-914' ORDER BY fr.transaction_time;",
    hints: {
      1: { title: "Investigative direction", body: "Follow the money. Reference code TR-914 connects financial activity to the operation." },
      2: { title: "Database direction", body: "financial_records has a reference_code column. Filter WHERE reference_code = 'TR-914', then JOIN agents to see names." },
      3: { title: "SQL technique", body: "Use WHERE fr.reference_code = 'TR-914' JOIN agents a ON fr.agent_id = a.agent_id." },
    },
  },
  {
    id: "OBJ-8",
    title: "GROUP BY access_id and use HAVING to find identity anomalies",
    description:
      "Write SELECT access_id, COUNT(DISTINCT claimed_identity) AS identity_count FROM identity_events GROUP BY access_id HAVING COUNT(DISTINCT claimed_identity) > 1; to find access IDs that were used under more than one claimed identity — proof the identity trail was manipulated.",
    thread: "SECURITY",
    language: "sql",
    starterQuery:
      "SELECT access_id, COUNT(DISTINCT claimed_identity) AS identity_count, GROUP_CONCAT(DISTINCT claimed_identity) AS identities FROM identity_events GROUP BY access_id HAVING COUNT(DISTINCT claimed_identity) > 1;",
    hints: {
      1: { title: "Investigative direction", body: "Someone used RUS-77A under different claimed names. Prove the identity trail was manipulated." },
      2: { title: "Database direction", body: "identity_events records claimed_identity per access_id. Group by access_id and count distinct identities, filtering for > 1." },
      3: { title: "SQL technique", body: "Use GROUP BY access_id with COUNT(DISTINCT claimed_identity) and HAVING COUNT(DISTINCT claimed_identity) > 1." },
    },
  },
  {
    id: "OBJ-9",
    title: "Use UNION ALL to merge movements and comms into one timeline",
    description:
      "Use UNION ALL to combine rows from agent_movements (for AGT-003's movements) and communications (for AGT-003's sent messages), with a literal type column, then ORDER BY timestamp to reconstruct the suspect's timeline across both data sources.",
    thread: "MOVEMENT",
    language: "sql",
    starterQuery:
      "SELECT 'movement' AS type, arrived_at AS timestamp, location_id AS detail FROM agent_movements WHERE agent_id = 'AGT-003' UNION ALL SELECT 'communication' AS type, timestamp, receiver_id AS detail FROM communications WHERE sender_id = 'AGT-003' UNION ALL SELECT 'financial' AS type, transaction_time, reference_code AS detail FROM financial_records WHERE agent_id = 'AGT-003' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "For the main suspect, combine their movements, comms, and financials into one chronological timeline." },
      2: { title: "Database direction", body: "Query agent_movements, communications, and financial_records for the suspect. Use UNION ALL to stack the rows." },
      3: { title: "SQL technique", body: "Use UNION ALL to combine SELECT statements with matching column counts, then ORDER BY timestamp." },
    },
  },
  {
    id: "OBJ-10",
    title: "Use subqueries with IN to converge all evidence threads",
    description:
      "Use subqueries with the IN operator to find the agent who appears in BOTH the RUS-77A credential owner list AND the TR-914 financial records. This single query converges all evidence threads onto the culprit.",
    thread: "ACCUSATION",
    language: "sql",
    starterQuery:
      "SELECT a.agent_id, a.name, a.codename, a.role, a.agency FROM agents a WHERE a.agent_id IN (SELECT owner_id FROM credentials WHERE access_id = 'RUS-77A') OR a.agent_id IN (SELECT agent_id FROM financial_records WHERE reference_code = 'TR-914') OR a.agent_id IN (SELECT sender_id FROM communications WHERE receiver_id IN (SELECT agent_id FROM financial_records WHERE reference_code = 'TR-914'));",
    hints: {
      1: { title: "Investigative direction", body: "All threads converge on one person. Who connects RUS-77A, TR-914, the comms, and the location?" },
      2: { title: "Database direction", body: "Use IN with subqueries against credentials, financial_records, and communications to find the agent appearing in all of them." },
      3: { title: "SQL technique", body: "Use WHERE agent_id IN (SELECT ...) with multiple OR'd subqueries to converge evidence." },
    },
  },
];
