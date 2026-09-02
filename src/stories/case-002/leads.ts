import type { LeadDefinition } from "@/stories/types";

export const CASE_002_LEADS: LeadDefinition[] = [
  // SQL leads
  {
    id: "LEAD-1",
    question: "Who was aboard and which cabins were in A-coach?",
    thread: "MOVEMENT",
    language: "sql",
    starterQuery:
      "SELECT p.name, t.coach, t.cabin FROM passengers p JOIN tickets t ON p.passenger_id = t.passenger_id WHERE t.coach = 'A' ORDER BY t.cabin;",
  },
  {
    id: "LEAD-2",
    question: "What were Arvind Rao's last movements?",
    thread: "MOVEMENT",
    language: "sql",
    starterQuery:
      "SELECT d.timestamp, d.location, d.item FROM passengers p JOIN dining_transactions d ON p.passenger_id = d.passenger_id WHERE p.name = 'Arvind Rao' ORDER BY d.timestamp;",
  },
  {
    id: "LEAD-3",
    question: "What happened during the tunnel window (23:47–23:52)?",
    thread: "SECURITY",
    language: "sql",
    starterQuery:
      "SELECT * FROM train_sensors WHERE timestamp >= '2025-03-16 23:47:00' AND timestamp <= '2025-03-16 23:52:00' ORDER BY timestamp;",
  },
  {
    id: "LEAD-4",
    question: "Did anyone access A-17 during the murder?",
    thread: "SECURITY",
    language: "sql",
    starterQuery:
      "SELECT * FROM access_logs WHERE cabin_id = 'A-17' AND timestamp >= '2025-03-16 23:40:00' ORDER BY timestamp;",
  },
  {
    id: "LEAD-5",
    question: "What maintenance happened on A-coach?",
    thread: "SECURITY",
    language: "sql",
    starterQuery:
      "SELECT * FROM maintenance_logs WHERE carriage = 'A' ORDER BY timestamp;",
  },
  {
    id: "LEAD-6",
    question: "Who used the DEV-Sec credential?",
    thread: "ACCUSATION",
    language: "sql",
    starterQuery:
      "SELECT * FROM access_logs WHERE credential_id = 'DEV-Sec' ORDER BY timestamp;",
  },
  {
    id: "LEAD-7",
    question: "What did the CCTV record during the tunnel?",
    thread: "SECURITY",
    language: "sql",
    starterQuery:
      "SELECT * FROM cctv_metadata WHERE timestamp >= '2025-03-16 23:47:00' AND timestamp <= '2025-03-16 23:52:00' ORDER BY timestamp;",
  },
  {
    id: "LEAD-8",
    question: "What was the cause of death?",
    thread: "PHYSICAL",
    language: "sql",
    starterQuery: "SELECT * FROM medical_report;",
  },
  // Python leads
  {
    id: "LEAD-PY1",
    question: "Use a loop to scan every sensor reading in A-coach during the murder window.",
    thread: "FORENSIC",
    language: "python",
    starterCode: `# Loop through train_sensors and isolate readings in A-coach during the murder window
window_start = "2025-03-16 23:46:00"
window_end = "2025-03-16 23:52:00"

for s in train_sensors:
    if s["carriage"] != "A":
        continue
    if not (window_start <= s["timestamp"] <= window_end):
        continue
    print(s["timestamp"], s["sensor"], "=", s["value"], "(source=" + s["source"] + ")")
`,
  },
  {
    id: "LEAD-PY2",
    question: "Use a list comprehension to filter access_logs for DEV-Sec, then loop to print each event.",
    thread: "FORENSIC",
    language: "python",
    starterCode: `# Use a list comprehension to filter access_logs
dev_sec = [a for a in access_logs if a["credential_id"] == "DEV-Sec"]
print(f"DEV-Sec was used {len(dev_sec)} times:")
for event in dev_sec:
    print(f"  {event['timestamp']} -> {event['cabin_id']} ({event['result']})")
`,
  },
  {
    id: "LEAD-PY3",
    question: "Use a loop to count CCTV low-light events per camera during the tunnel crossing.",
    thread: "FORENSIC",
    language: "python",
    starterCode: `# Count LOW_LIGHT CCTV events per camera during the tunnel crossing
window_start = "2025-03-16 23:47:00"
window_end = "2025-03-16 23:52:00"

camera_counts = {}
for c in cctv_metadata:
    if c["event_type"] != "LOW_LIGHT":
        continue
    if not (window_start <= c["timestamp"] <= window_end):
        continue
    cam = c["camera_id"]
    camera_counts[cam] = camera_counts.get(cam, 0) + 1

print("LOW_LIGHT events per camera during the tunnel:")
for cam, count in camera_counts.items():
    print(f"  {cam}: {count}")
`,
  },
];
