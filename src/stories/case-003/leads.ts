import type { LeadDefinition } from "@/stories/types";

export const CASE_003_LEADS: LeadDefinition[] = [
  {
    id: "LEAD-1",
    question: "Who was aboard and which cabins were in A-coach?",
    thread: "MOVEMENT",
    starterQuery: "SELECT p.name, t.coach, t.cabin FROM passengers p JOIN tickets t ON p.passenger_id = t.passenger_id WHERE t.coach = 'A' ORDER BY t.cabin;",
  },
  {
    id: "LEAD-2",
    question: "What were Arvind Rao's last movements?",
    thread: "MOVEMENT",
    starterQuery: "SELECT d.timestamp, d.location, d.item FROM passengers p JOIN dining_transactions d ON p.passenger_id = d.passenger_id WHERE p.name = 'Arvind Rao' ORDER BY d.timestamp;",
  },
  {
    id: "LEAD-3",
    question: "What happened during the tunnel window (23:47–23:52)?",
    thread: "SECURITY",
    starterQuery: "SELECT * FROM train_sensors WHERE timestamp >= '2025-03-16 23:47:00' AND timestamp <= '2025-03-16 23:52:00' ORDER BY timestamp;",
  },
  {
    id: "LEAD-4",
    question: "Did anyone access A-17 during the murder?",
    thread: "SECURITY",
    starterQuery: "SELECT * FROM access_logs WHERE cabin_id = 'A-17' AND timestamp >= '2025-03-16 23:40:00' ORDER BY timestamp;",
  },
  {
    id: "LEAD-5",
    question: "What maintenance happened on A-coach?",
    thread: "SECURITY",
    starterQuery: "SELECT * FROM maintenance_logs WHERE carriage = 'A' ORDER BY timestamp;",
  },
  {
    id: "LEAD-6",
    question: "Who used the DEV-Sec credential?",
    thread: "ACCUSATION",
    starterQuery: "SELECT * FROM access_logs WHERE credential_id = 'DEV-Sec' ORDER BY timestamp;",
  },
  {
    id: "LEAD-7",
    question: "What did the CCTV record during the tunnel?",
    thread: "SECURITY",
    starterQuery: "SELECT * FROM cctv_metadata WHERE timestamp >= '2025-03-16 23:47:00' AND timestamp <= '2025-03-16 23:52:00' ORDER BY timestamp;",
  },
  {
    id: "LEAD-8",
    question: "What was the cause of death?",
    thread: "PHYSICAL",
    starterQuery: "SELECT * FROM medical_report;",
  },
];
