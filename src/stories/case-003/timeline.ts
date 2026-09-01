import type { TimelineEventDef } from "@/stories/types";

export const CASE_003_TIMELINE: TimelineEventDef[] = [
  {
    evidenceId: "EVD-001",
    time: "23:15",
    label: "Arvind's last dining transaction",
    description: "Arvind Rao orders a late-night coffee in the dining car — his last recorded movement before returning to A-17.",
  },
  {
    evidenceId: "EVD-006",
    time: "23:46",
    label: "Dev's credential at security console",
    description: "Credential DEV-Sec accesses the security console at 23:46:51. Dev claims he never touched the system.",
  },
  {
    evidenceId: "EVD-003",
    time: "23:47",
    label: "Train enters Khandala Tunnel",
    description: "CCTV switches to low-light. For 4 minutes, the train is in darkness.",
  },
  {
    evidenceId: "EVD-004",
    time: "23:48",
    label: "Actuator state change",
    description: "Maintenance log records STATE_CHANGE on ACTUATOR in A-coach at 23:48:16.",
  },
  {
    evidenceId: "EVD-005",
    time: "23:48",
    label: "A-17 pressure spike",
    description: "Train sensor records PRESSURE SPIKE on A-17 at 23:48:19, returning to normal at 23:48:20.",
  },
  {
    evidenceId: "EVD-007",
    time: "23:48",
    label: "Actuator retracted",
    description: "Sensor shows ACTUATOR_STATE returning to RETRACTED at 23:48:21. The weapon disappears.",
  },
  {
    evidenceId: "EVD-002",
    time: "23:54",
    label: "Body discovered",
    description: "Cabin attendant uses emergency override to enter A-17. Arvind Rao is found dead. The door was locked from inside.",
  },
];
