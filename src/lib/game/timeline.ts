"use client";

// Maps discovered evidence to a timeline event (chronological).
// Only events the player has discovered appear on the timeline.

export interface TimelineEventDef {
  evidenceId: string;
  time: string; // "HH:MM" — sortable lexically
  label: string;
  description?: string;
}

// Chronological events on the night of March 14, 2025.
export const EVIDENCE_TIMELINE: TimelineEventDef[] = [
  {
    evidenceId: "EVD-006",
    time: "10:08",
    label: "Elias pulls the TR-4817 ledger",
    description: "Elias Voss asks auditor Priya Nair to pull every payment tagged TR-4817.",
  },
  {
    evidenceId: "EVD-007",
    time: "20:45",
    label: "Elias invites Maya to the Archive",
    description: "Elias emails Maya requesting a private meeting at the Archive at 22:30.",
  },
  {
    evidenceId: "EVD-008",
    time: "21:15",
    label: "Maya messages Daniel",
    description: "Maya: 'He knows. He pulled the TR-4817 file... I need the room dark.' Daniel: 'How dark.' Maya: 'CAM-04.'",
  },
  {
    evidenceId: "EVD-004",
    time: "22:18",
    label: "Maya returns via the Side Entrance",
    description: "Badge MC-4471 re-enters the building after supposedly driving home at 21:00.",
  },
  {
    evidenceId: "EVD-002",
    time: "22:30",
    label: "Archive camera disabled",
    description: "CAM-04 manually disabled by admin user d.brooks from the Security Control Room.",
  },
  {
    evidenceId: "EVD-003",
    time: "22:41",
    label: "Maya enters the Archive",
    description: "Badge MC-4471 accesses the Archive — during the estimated time of death.",
  },
  {
    evidenceId: "EVD-005",
    time: "22:50",
    label: "Archive terminal wiped",
    description: "Workstation ARC-TERM-02 wiped, authenticated as m.chen from the local console.",
  },
  {
    evidenceId: "EVD-010",
    time: "22:51",
    label: "Elias's phone goes dark",
    description: "Elias Voss's phone last pings near the Archive. Not recovered.",
  },
];

export function getTimelineEventForEvidence(evidenceId: string): TimelineEventDef | undefined {
  return EVIDENCE_TIMELINE.find((e) => e.evidenceId === evidenceId);
}
