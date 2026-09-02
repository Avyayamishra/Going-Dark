import type { TimelineEventDef } from "@/stories/types";

export const CASE_001_TIMELINE: TimelineEventDef[] = [
  {
    evidenceId: "EVD-006",
    time: "01:30",
    label: "Anya arrives at Plesetsk Uplink Station",
    description: "Anya Petrova arrives at LOC-01 (Plesetsk Uplink) — the facility from which KOSMOS-9147 was accessed.",
  },
  {
    evidenceId: "EVD-002",
    time: "01:58",
    label: "RUS-77A authenticates with KOSMOS-9147",
    description: "Access ID RUS-77A sends a successful authentication request to the satellite.",
  },
  {
    evidenceId: "EVD-003",
    time: "01:58",
    label: "Sokolov's credential used",
    description: "The credential belongs to Colonel Sokolov, who is hundreds of kilometers away.",
  },
  {
    evidenceId: "EVD-008",
    time: "02:05",
    label: "Identity trail manipulated",
    description: "RUS-77A is used to claim a different identity — the first of four different claimed identities.",
  },
  {
    evidenceId: "EVD-001",
    time: "02:13",
    label: "Seven-minute telemetry gap begins",
    description: "KOSMOS-9147 stops transmitting normal telemetry. The gap lasts 7 minutes and 42 seconds.",
  },
  {
    evidenceId: "EVD-007",
    time: "02:15",
    label: "TR-914 referenced in communications",
    description: "Intercepted communications between Anya and Dmitri contain TR-914 references during the gap.",
  },
  {
    evidenceId: "EVD-009",
    time: "02:21",
    label: "Telemetry resumes — Anya still at uplink",
    description: "Normal satellite operation resumes. Anya remains at the Plesetsk Uplink Station until 02:50.",
  },
  {
    evidenceId: "EVD-010",
    time: "02:30",
    label: "Ethan Hunt's false trail",
    description: "Ethan's mission records show he should have been elsewhere, but his movements place him at the uplink facility.",
  },
];
