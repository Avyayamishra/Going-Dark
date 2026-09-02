import type { ObjectiveDefinition } from "@/stories/types";

export const CASE_002_OBJECTIVES: ObjectiveDefinition[] = [
  // ---------- SQL investigation objectives ----------
  {
    id: "OBJ-1",
    title: "JOIN passengers with tickets to list who was aboard",
    description:
      "Write a JOIN between passengers and tickets on p.passenger_id = t.passenger_id, filtered by WHERE t.coach IN ('A','B','C') and ORDER BY t.coach, t.cabin, to enumerate every passenger aboard the train and their cabin assignment. Inspect the rows to find who was assigned to A-coach near cabin A-17.",
    thread: "MOVEMENT",
    language: "sql",
    starterQuery:
      "SELECT p.passenger_id, p.name, t.coach, t.cabin, t.booking_class FROM passengers p JOIN tickets t ON p.passenger_id = t.passenger_id WHERE t.coach IN ('A','B','C') ORDER BY t.coach, t.cabin;",
    hints: {
      1: { title: "Investigative direction", body: "List everyone aboard and identify the passengers whose cabins are in A-coach." },
      2: { title: "Database direction", body: "JOIN passengers with tickets. Filter by coach IN ('A','B','C') to focus on the relevant coaches." },
      3: { title: "SQL technique", body: "Use JOIN ... ON p.passenger_id = t.passenger_id WHERE t.coach IN ('A','B','C') ORDER BY t.coach, t.cabin." },
    },
  },
  {
    id: "OBJ-2",
    title: "Reconstruct Arvind Rao's last movements with ORDER BY",
    description:
      "JOIN passengers with dining_transactions on p.passenger_id = d.passenger_id, filtered by WHERE p.name = 'Arvind Rao', and ORDER BY d.timestamp to reconstruct the victim's last movements before the murder. Note his last activity time and location.",
    thread: "MOVEMENT",
    language: "sql",
    starterQuery:
      "SELECT d.timestamp, d.location, d.item, d.amount FROM passengers p JOIN dining_transactions d ON p.passenger_id = d.passenger_id WHERE p.name = 'Arvind Rao' ORDER BY d.timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Trace Arvind Rao's dining and movement records before the murder to establish his last activity." },
      2: { title: "Database direction", body: "JOIN passengers with dining_transactions. Filter for Arvind Rao and ORDER BY timestamp." },
      3: { title: "SQL technique", body: "Use JOIN ... ON p.passenger_id = d.passenger_id WHERE p.name = 'Arvind Rao' ORDER BY d.timestamp." },
    },
  },
  {
    id: "OBJ-3",
    title: "Compare station_logs with cctv_metadata to find alibi contradictions",
    description:
      "Write two SELECT queries — one against station_logs and one against cctv_metadata — to compare each suspect's stated movements with the recorded events. Look for any suspect whose cabin assignment contradicts their station_logs entry, or any CCTV record showing a subject where they should not be.",
    thread: "COMMUNICATION",
    language: "sql",
    starterQuery:
      "SELECT s.passenger_id, s.station, s.event_type, s.timestamp FROM station_logs s ORDER BY s.timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Compare what suspects claim with what the station logs and CCTV show. Look for movement after they supposedly returned to their cabin." },
      2: { title: "Database direction", body: "Query station_logs and cctv_metadata separately. Look for records after a suspect claims they returned to their cabin." },
      3: { title: "SQL technique", body: "Use SELECT * FROM station_logs ORDER BY timestamp; then SELECT * FROM cctv_metadata ORDER BY timestamp;" },
    },
  },
  {
    id: "OBJ-4",
    title: "Filter train_sensors to the 4-minute tunnel window with BETWEEN",
    description:
      "Use WHERE timestamp BETWEEN '2025-03-16 23:47:00' AND '2025-03-16 23:52:00' on train_sensors, cctv_metadata, access_logs, and maintenance_logs to isolate everything that happened during the four-minute Khandala Tunnel crossing. ORDER BY timestamp to read the sequence.",
    thread: "SECURITY",
    language: "sql",
    starterQuery:
      "SELECT * FROM train_sensors WHERE timestamp >= '2025-03-16 23:47:00' AND timestamp <= '2025-03-16 23:52:00' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Filter all train system records to the four-minute tunnel window." },
      2: { title: "Database direction", body: "Query train_sensors, cctv_metadata, access_logs, and maintenance_logs between 23:47 and 23:52." },
      3: { title: "SQL technique", body: "Use WHERE timestamp BETWEEN '2025-03-16 23:47:00' AND '2025-03-16 23:52:00' ORDER BY timestamp." },
    },
  },
  {
    id: "OBJ-5",
    title: "Prove no one entered A-17 by filtering access_logs",
    description:
      "Write SELECT * FROM access_logs WHERE cabin_id = 'A-17' AND timestamp BETWEEN '2025-03-16 23:47:00' AND '2025-03-16 23:52:00' ORDER BY timestamp; — then inspect the result column to confirm every access attempt was DENIED. This proves no one physically opened the cabin door during the murder.",
    thread: "SECURITY",
    language: "sql",
    starterQuery:
      "SELECT * FROM access_logs WHERE cabin_id = 'A-17' AND timestamp >= '2025-03-16 23:47:00' AND timestamp <= '2025-03-16 23:52:00' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Did anyone successfully open the cabin door during the murder window? Inspect the result column for SUCCESS vs DENIED." },
      2: { title: "Database direction", body: "Search access_logs for A-17 during the tunnel window. The result column tells you if any attempt succeeded." },
      3: { title: "SQL technique", body: "Use WHERE cabin_id = 'A-17' AND timestamp BETWEEN ... AND ... ORDER BY timestamp." },
    },
  },
  {
    id: "OBJ-6",
    title: "Filter maintenance_logs for unusual A-coach actions",
    description:
      "Write SELECT * FROM maintenance_logs WHERE carriage = 'A' AND timestamp >= '2025-03-16 23:15:00' ORDER BY timestamp; — then inspect the action column to distinguish routine INSPECT entries from STATE_CHANGE entries. A STATE_CHANGE on a hidden component is the key lead.",
    thread: "SECURITY",
    language: "sql",
    starterQuery:
      "SELECT * FROM maintenance_logs WHERE carriage = 'A' AND timestamp >= '2025-03-16 23:15:00' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Look for maintenance actions on A-coach that aren't routine inspections. STATE_CHANGE on a non-routine component is the smoking gun." },
      2: { title: "Database direction", body: "Query maintenance_logs WHERE carriage = 'A' in the 30 minutes before 23:47. Look at the action column to distinguish INSPECT from STATE_CHANGE." },
      3: { title: "SQL technique", body: "Use WHERE carriage = 'A' AND timestamp >= '2025-03-16 23:15:00' ORDER BY timestamp." },
    },
  },
  {
    id: "OBJ-7",
    title: "Find which suspect used the DEV-Sec credential",
    description:
      "Write SELECT * FROM access_logs WHERE credential_id = 'DEV-Sec' ORDER BY timestamp; — then cross-reference the timestamp with the suspect list to determine which suspect owns the DEV-Sec credential. The credential was used at the security console moments before the murder.",
    thread: "ACCUSATION",
    language: "sql",
    starterQuery:
      "SELECT * FROM access_logs WHERE credential_id = 'DEV-Sec' ORDER BY timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Find the suspect who owns the DEV-Sec credential. They accessed the security console moments before the murder." },
      2: { title: "Database direction", body: "Search access_logs for credential_id = 'DEV-Sec'. The cabin_id and timestamp will tell you what they accessed and when." },
      3: { title: "SQL technique", body: "Use WHERE credential_id = 'DEV-Sec' ORDER BY timestamp." },
    },
  },
  {
    id: "OBJ-8",
    title: "Correlate sensors + maintenance + access to reconstruct the mechanism",
    description:
      "Write a SELECT against train_sensors filtered to coach A in the 23:46–23:52 window, ordering by timestamp, to identify the PRESSURE spike. Then correlate this with the maintenance_logs STATE_CHANGE and the access_logs DEV-Sec entry — all three events align within 8 seconds.",
    thread: "ACCUSATION",
    language: "sql",
    starterQuery:
      "SELECT ts.timestamp, ts.sensor, ts.value, ts.carriage, ts.source FROM train_sensors ts WHERE ts.carriage = 'A' AND ts.timestamp >= '2025-03-16 23:46:00' AND ts.timestamp <= '2025-03-16 23:52:00' ORDER BY ts.timestamp;",
    hints: {
      1: { title: "Investigative direction", body: "Put all the pieces together: the security console access (23:46:51), the actuator STATE_CHANGE (23:48:16), the PRESSURE spike (23:48:19), the locked cabin." },
      2: { title: "Database direction", body: "Correlate access_logs (DEV-Sec at 23:46:51), maintenance_logs (actuator STATE_CHANGE at 23:48:16), train_sensors (PRESSURE spike at 23:48:19)." },
      3: { title: "SQL technique", body: "Use WHERE carriage = 'A' AND timestamp BETWEEN '2025-03-16 23:46:00' AND '2025-03-16 23:52:00' ORDER BY timestamp on train_sensors." },
    },
  },

  // ---------- Python forensic analysis objectives ----------
  {
    id: "OBJ-PY1",
    title: "Create a loop to scan train_sensors for the fatal spike",
    description:
      "Switch to the Python IDE. Create a for-loop that iterates over the train_sensors list, filtering each row by carriage == 'A' AND sensor == 'PRESSURE' AND '2025-03-16 23:46:00' <= timestamp <= '2025-03-16 23:52:00'. Print the timestamp, value, and source of every matching reading to identify the fatal pressure spike.",
    thread: "FORENSIC",
    language: "python",
    starterCode: `# Loop through train_sensors and isolate PRESSURE readings in A-coach during the murder window
window_start = "2025-03-16 23:46:00"
window_end = "2025-03-16 23:52:00"

for s in train_sensors:
    if s["carriage"] != "A":
        continue
    if s["sensor"] != "PRESSURE":
        continue
    if not (window_start <= s["timestamp"] <= window_end):
        continue
    print(s["timestamp"], s["value"], "source=" + s["source"])
`,
    hints: {
      1: { title: "Investigative direction", body: "Use Python to scan every train_sensors reading in A-coach during the murder window. The PRESSURE sensor is the key signal — its spike marks the moment of the fatal wound." },
      2: { title: "Python direction", body: "Iterate with `for s in train_sensors:`. Use `if` statements to filter by carriage, sensor, and timestamp. Use `print()` to surface the rows." },
      3: { title: "Python technique", body: "Use a for-loop with chained if-guards: `for s in train_sensors: if s['carriage']=='A' and s['sensor']=='PRESSURE' and window_start <= s['timestamp'] <= window_end: print(...)`" },
    },
  },
  {
    id: "OBJ-PY2",
    title: "Create a nested loop to correlate DEV-Sec access with maintenance actions",
    description:
      "Switch to the Python IDE. Create a nested for-loop that iterates over access_logs (filtering for credential_id == 'DEV-Sec') and, for each matching access event, iterates over maintenance_logs (filtering for carriage == 'A') to find the maintenance action whose timestamp is closest. Print the access timestamp, the matched maintenance timestamp, and the action — proving the security-console access triggered the actuator.",
    thread: "FORENSIC",
    language: "python",
    starterCode: `# Cross-reference DEV-Sec access events with A-coach maintenance actions
# Find the maintenance log whose timestamp is closest to each DEV-Sec access event

dev_sec_events = [a for a in access_logs if a["credential_id"] == "DEV-Sec"]
a_coach_maintenance = [m for m in maintenance_logs if m["carriage"] == "A"]

print(f"Found {len(dev_sec_events)} DEV-Sec access events")
print(f"Found {len(a_coach_maintenance)} A-coach maintenance actions\\n")

for acc in dev_sec_events:
    print(f"DEV-Sec access at {acc['timestamp']} on {acc['cabin_id']}")
    # Find the maintenance action with the closest timestamp
    for m in a_coach_maintenance:
        # Both timestamps are sortable ISO strings, so string comparison works
        if "23:4" in m["timestamp"] or "23:5" in m["timestamp"]:
            print(f"  -> maintenance {m['action']} on {m['component']} at {m['timestamp']}")
`,
    hints: {
      1: { title: "Investigative direction", body: "Prove the security-console access (DEV-Sec) directly triggered the maintenance actuator. Find the maintenance action whose timestamp is closest to the DEV-Sec access." },
      2: { title: "Python direction", body: "Use a list comprehension to filter access_logs: `[a for a in access_logs if a['credential_id']=='DEV-Sec']`. Then nest a for-loop over maintenance_logs to find the closest timestamp." },
      3: { title: "Python technique", body: "Use a nested for-loop: `for acc in dev_sec_events: for m in a_coach_maintenance: if ...: print(...)`" },
    },
  },
  {
    id: "OBJ-PY3",
    title: "Create a loop to build a unified murder-window timeline",
    description:
      "Switch to the Python IDE. Create a loop that merges rows from train_sensors, access_logs, maintenance_logs, and cctv_metadata (all filtered to the 23:46–23:52 window) into a single list of dicts with a 'type' field. Sort the list by timestamp and print each event. The merged timeline will reveal the 8-second sequence: security-console access → actuator deploy → pressure spike → actuator retract.",
    thread: "FORENSIC",
    language: "python",
    starterCode: `# Build a unified murder-window timeline by merging four record sources
window_start = "2025-03-16 23:46:00"
window_end = "2025-03-16 23:52:00"

timeline = []

# Merge train_sensors
for s in train_sensors:
    if s["carriage"] == "A" and window_start <= s["timestamp"] <= window_end:
        timeline.append({
            "type": "sensor",
            "timestamp": s["timestamp"],
            "detail": f"{s['sensor']}={s['value']} (source={s['source']})"
        })

# Merge access_logs
for a in access_logs:
    if window_start <= a["timestamp"] <= window_end:
        timeline.append({
            "type": "access",
            "timestamp": a["timestamp"],
            "detail": f"{a['credential_id']} -> {a['cabin_id']} ({a['result']})"
        })

# Merge maintenance_logs
for m in maintenance_logs:
    if m["carriage"] == "A" and window_start <= m["timestamp"] <= window_end:
        timeline.append({
            "type": "maintenance",
            "timestamp": m["timestamp"],
            "detail": f"{m['action']} on {m['component']}"
        })

# Merge cctv_metadata
for c in cctv_metadata:
    if window_start <= c["timestamp"] <= window_end:
        timeline.append({
            "type": "cctv",
            "timestamp": c["timestamp"],
            "detail": f"{c['camera_id']} {c['event_type']}"
        })

# Sort by timestamp (ISO strings sort correctly)
timeline.sort(key=lambda e: e["timestamp"])

print(f"Murder-window timeline ({len(timeline)} events):\\n")
for event in timeline:
    print(f"  [{event['timestamp']}] {event['type'].upper():12s} {event['detail']}")
`,
    hints: {
      1: { title: "Investigative direction", body: "The murder was an 8-second sequence. Merge every record source into one timeline to see the chain: access → actuator → spike → retract." },
      2: { title: "Python direction", body: "Build a list of dicts, each with a 'type' and 'timestamp' field. Use `list.sort(key=lambda e: e['timestamp'])` to order them chronologically." },
      3: { title: "Python technique", body: "Use four for-loops (one per source), each appending to a shared `timeline` list. Then `timeline.sort(key=lambda e: e['timestamp'])` and a final for-loop to print." },
    },
  },
];
