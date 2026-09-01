import type { ObjectiveDefinition } from "@/stories/types";

export const CASE_003_OBJECTIVES: ObjectiveDefinition[] = [
  {
    id: "OBJ-1",
    title: "Establish who was aboard",
    description: "Determine who was aboard the train and who could have had legitimate access to A-coach.",
    thread: "MOVEMENT",
    starterQuery: "SELECT p.name, t.coach, t.cabin FROM passengers p JOIN tickets t ON p.passenger_id = t.passenger_id WHERE t.coach IN ('A','B','C') ORDER BY t.coach;",
    hints: {
      1: { title: "Investigative direction", body: "Find all passengers assigned to coaches A, B, and C and list their cabin numbers." },
      2: { title: "Database direction", body: "Join passengers with tickets. Filter by coach using WHERE coach IN ('A','B','C')." },
      3: { title: "Technique", body: "Use SELECT with JOIN and WHERE ... IN to list passengers and their cabin assignments." },
    },
  },
  {
    id: "OBJ-2",
    title: "Build the victim's evening",
    description: "Reconstruct Arvind Rao's movements before the murder using dining transactions.",
    thread: "MOVEMENT",
    starterQuery: "SELECT p.name, d.timestamp, d.location, d.item, d.amount FROM passengers p JOIN dining_transactions d ON p.passenger_id = d.passenger_id WHERE p.name = 'Arvind Rao' ORDER BY d.timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Trace Arvind Rao's dining and movement records before the murder." },
      2: { title: "Database direction", body: "Join passengers with dining_transactions. Filter for Arvind Rao and sort by timestamp." },
      3: { title: "Technique", body: "Use JOIN, WHERE, and ORDER BY to reconstruct the timeline." },
    },
  },
  {
    id: "OBJ-3",
    title: "Find contradictions in alibis",
    description: "Find a suspect whose stated movements do not match the train's records. Compare station logs and CCTV metadata.",
    thread: "COMMUNICATION",
    starterQuery: "SELECT s.passenger_id, s.station, s.event_type, s.timestamp FROM station_logs s ORDER BY s.timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Compare what suspects claim with what the station logs and CCTV show." },
      2: { title: "Database direction", body: "Query station_logs and cctv_metadata. Look for records after a suspect claims they returned to their cabin." },
      3: { title: "Technique", body: "Use multiple table queries with timestamp filtering to find contradictions." },
    },
  },
  {
    id: "OBJ-4",
    title: "Isolate the 11:47 tunnel window",
    description: "Isolate everything that happened while the train was inside the Khandala Tunnel (23:47–23:52).",
    thread: "SECURITY",
    starterQuery: "SELECT * FROM train_sensors WHERE timestamp >= '2025-03-16 23:47:00' AND timestamp <= '2025-03-16 23:52:00' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Filter all train system records to the four-minute tunnel window." },
      2: { title: "Database direction", body: "Query train_sensors, cctv_metadata, access_logs, and maintenance_logs between 23:47 and 23:52." },
      3: { title: "Technique", body: "Use WHERE with timestamp >= AND <= to filter to the murder window." },
    },
  },
  {
    id: "OBJ-5",
    title: "The impossible access",
    description: "Prove whether anyone actually entered A-17 during the murder window. Check access_logs for A-17 between 23:47 and 23:52.",
    thread: "SECURITY",
    starterQuery: "SELECT * FROM access_logs WHERE cabin_id = 'A-17' AND timestamp >= '2025-03-16 23:47:00' AND timestamp <= '2025-03-16 23:52:00' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Did anyone successfully open the cabin door during the murder?" },
      2: { title: "Database direction", body: "Search access_logs for A-17 during the tunnel window. Check result column for SUCCESS vs DENIED." },
      3: { title: "Technique", body: "Use WHERE cabin_id = 'A-17' AND timestamp BETWEEN ... to filter access attempts." },
    },
  },
  {
    id: "OBJ-6",
    title: "Follow the infrastructure",
    description: "Determine whether a train component was manipulated before the murder. Search maintenance_logs for unusual A-coach actions.",
    thread: "SECURITY",
    starterQuery: "SELECT * FROM maintenance_logs WHERE carriage = 'A' AND timestamp >= '2025-03-16 23:15:00' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Look for maintenance actions on A-coach that aren't routine inspections." },
      2: { title: "Database direction", body: "Query maintenance_logs for carriage='A' in the 30 minutes before 23:47. Distinguish INSPECT from STATE_CHANGE." },
      3: { title: "Technique", body: "Use WHERE carriage='A' AND timestamp >= ... to filter, then look at the action column." },
    },
  },
  {
    id: "OBJ-7",
    title: "Identify the trigger",
    description: "Find the event that connects a suspect to the hidden weapon mechanism. Correlate maintenance_logs, train_sensors, and access_logs.",
    thread: "ACCUSATION",
    starterQuery: "SELECT * FROM access_logs WHERE credential_id = 'DEV-Sec' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Look for a security credential used near the critical time. Who has SECURITY access?" },
      2: { title: "Database direction", body: "Search access_logs for credential 'DEV-Sec'. Then correlate the timestamp with maintenance_logs and train_sensors." },
      3: { title: "Technique", body: "Use multiple queries to correlate: access_logs (credential_id), maintenance_logs (timestamp, carriage), train_sensors (timestamp, carriage)." },
    },
  },
  {
    id: "OBJ-8",
    title: "Reconstruct the murder",
    description: "Combine all evidence: no cabin access, maintenance actuator change, sensor pressure spike, and Dev's credential at the security console. Explain how the murder happened without anyone entering A-17.",
    thread: "ACCUSATION",
    starterQuery: "SELECT ts.timestamp, ts.sensor, ts.value, ts.carriage, ts.source FROM train_sensors ts WHERE ts.carriage = 'A' AND ts.timestamp >= '2025-03-16 23:46:00' AND ts.timestamp <= '2025-03-16 23:52:00' ORDER BY ts.timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Put all the pieces together: the security console access, the actuator state change, the pressure spike, the locked cabin." },
      2: { title: "Database direction", body: "Correlate access_logs (DEV-Sec at 23:46:51), maintenance_logs (actuator at 23:48:16), train_sensors (pressure spike at 23:48:19)." },
      3: { title: "Technique", body: "The weapon was part of the train. Dev triggered it remotely through the security console. Nobody entered A-17." },
    },
  },
];
