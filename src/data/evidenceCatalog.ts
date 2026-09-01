// Catalogue of all discoverable evidence for the Evidence Panel UI + Evidence Board.
// Reflects the Maya-as-killer solution.
export interface EvidenceCatalogItem {
  evidenceId: string;
  name: string;
  description: string;
  category: "MOVEMENT" | "COMMUNICATION" | "FINANCIAL" | "SECURITY" | "MESSAGE" | "PHYSICAL";
  significance: string;
  source: string;
  foundTime: string;
  relatedSuspect?: string;
  relatedPersonId?: string;
  /** Other evidence ids this item connects to. */
  relatedEvidence?: string[];
  /** Whether this evidence contributes to the accusation gate, and which dimension. */
  accusationDimension?: "identity" | "opportunity" | "motive" | "supporting";
}

export const EVIDENCE_CATALOG: EvidenceCatalogItem[] = [
  {
    evidenceId: "EVD-001",
    name: "Reference TR-4817 in Audit Notes",
    description: "A handwritten reference 'TR-4817' found in Elias Voss's notebook near the Archive terminal. No context — you must search the database.",
    category: "PHYSICAL",
    significance: "The starting clue. TR-4817 recurs across many small transactions and several messages.",
    source: "Archive — Elias's notebook",
    foundTime: "2025-03-15 02:10",
    relatedPersonId: "EMP-001",
    relatedEvidence: ["EVD-006", "EVD-008"],
  },
  {
    evidenceId: "EVD-002",
    name: "Disabled Camera Feed",
    description: "Archive camera CAM-04 manually disabled at 22:30:12 by admin user d.brooks from the Security Control Room.",
    category: "SECURITY",
    significance: "Establishes premeditation and an accomplice. Disabled remotely, not from inside the Archive.",
    source: "Security Control Room — access log",
    foundTime: "2025-03-14 22:30",
    relatedSuspect: "S002",
    relatedPersonId: "EMP-003",
    relatedEvidence: ["EVD-003", "EVD-005", "EVD-008"],
    accusationDimension: "supporting",
  },
  {
    evidenceId: "EVD-003",
    name: "Maya's Archive Access",
    description: "Badge MC-4471 (Maya Chen) entered the Archive at 22:41:09 and exited at 22:54:07 — during the time of death.",
    category: "MOVEMENT",
    significance: "Places Maya at the scene during the time of death and contradicts her alibi.",
    source: "Archive — door access log",
    foundTime: "2025-03-14 22:41",
    relatedSuspect: "S001",
    relatedPersonId: "EMP-002",
    relatedEvidence: ["EVD-004", "EVD-002", "EVD-005"],
    accusationDimension: "opportunity",
  },
  {
    evidenceId: "EVD-004",
    name: "Maya's Return to the Building",
    description: "Badge MC-4471 re-entered via the Side Entrance at 22:18:22 — after exiting the Parking Garage at 21:00.",
    category: "MOVEMENT",
    significance: "Direct contradiction of Maya's alibi. She returned secretly via the unguarded side entrance.",
    source: "Side Entrance — access log",
    foundTime: "2025-03-14 22:18",
    relatedSuspect: "S001",
    relatedPersonId: "EMP-002",
    relatedEvidence: ["EVD-003"],
    accusationDimension: "identity",
  },
  {
    evidenceId: "EVD-005",
    name: "Wiped Archive Terminal",
    description: "Archive workstation ARC-TERM-02 wiped at 22:50:41, authenticated as m.chen from the local console.",
    category: "SECURITY",
    significance: "Maya was inside the Archive at the time. Indicates an attempt to destroy evidence of the motive.",
    source: "Archive — ARC-TERM-02 security log",
    foundTime: "2025-03-14 22:50",
    relatedSuspect: "S001",
    relatedPersonId: "EMP-002",
    relatedEvidence: ["EVD-003", "EVD-002", "EVD-006"],
    accusationDimension: "supporting",
  },
  {
    evidenceId: "EVD-006",
    name: "TR-4817 Financial Pattern",
    description: "14 transactions tagged reference TR-4817: small outgoing vendor payments + incoming kickbacks to Maya Chen's account, all authorised by the same signatory.",
    category: "FINANCIAL",
    significance: "Provides motive: embezzlement. Only visible when transactions are aggregated by reference code.",
    source: "Financial ledger — audit",
    foundTime: "2025-03-14 10:08",
    relatedSuspect: "S001",
    relatedPersonId: "EMP-002",
    relatedEvidence: ["EVD-001", "EVD-007", "EVD-005"],
    accusationDimension: "motive",
  },
  {
    evidenceId: "EVD-007",
    name: "Elias's Confrontation Invitation",
    description: "Email chain Elias↔Maya at 20:45–20:49. Elias requests a private meeting at the Archive at 22:30 'to walk you through something.'",
    category: "MESSAGE",
    significance: "Establishes Elias arranged the meeting and already had the evidence — Maya was being confronted.",
    source: "Email server",
    foundTime: "2025-03-14 20:45",
    relatedSuspect: "S001",
    relatedPersonId: "EMP-002",
    relatedEvidence: ["EVD-006", "EVD-003"],
    accusationDimension: "motive",
  },
  {
    evidenceId: "EVD-008",
    name: "Maya-Daniel Coordination",
    description: "SMS chain Maya↔Daniel 21:15–22:09: 'He knows. He pulled the TR-4817 file... I need the room dark.' 'How dark.' 'CAM-04.'",
    category: "COMMUNICATION",
    significance: "Establishes Daniel as accomplice (camera) and Maya as principal (returned, entered Archive).",
    source: "SMS gateway",
    foundTime: "2025-03-14 21:15",
    relatedSuspect: "S001",
    relatedPersonId: "EMP-002",
    relatedEvidence: ["EVD-001", "EVD-002", "EVD-003"],
    accusationDimension: "supporting",
  },
  {
    evidenceId: "EVD-010",
    name: "Missing Phone",
    description: "Elias Voss's phone unrecovered. Last signal at 22:51 near the Archive.",
    category: "PHYSICAL",
    significance: "Likely removed by the killer to suppress communications.",
    source: "Carrier — last ping",
    foundTime: "2025-03-14 22:51",
    relatedPersonId: "EMP-001",
    relatedEvidence: ["EVD-005"],
  },
  {
    evidenceId: "EVD-012",
    name: "Building Movement Log",
    description: "Complete badge access log for 2025-03-14 establishing who was present.",
    category: "MOVEMENT",
    significance: "The master movement record. Cross-referencing reveals Maya's secret return.",
    source: "Building access system",
    foundTime: "2025-03-14 23:59",
    relatedEvidence: ["EVD-003", "EVD-004"],
  },
];

export const EVIDENCE_CATEGORY_META: Record<
  EvidenceCatalogItem["category"],
  { label: string; color: string; icon: string; dot: string }
> = {
  MOVEMENT: { label: "Movement", color: "text-sky-400/90 border-sky-500/40 bg-sky-500/5", icon: "Footprints", dot: "bg-sky-500" },
  COMMUNICATION: { label: "Communication", color: "text-violet-400/90 border-violet-500/40 bg-violet-500/5", icon: "Phone", dot: "bg-violet-500" },
  FINANCIAL: { label: "Financial", color: "text-amber-400/90 border-amber-500/40 bg-amber-500/5", icon: "DollarSign", dot: "bg-amber-500" },
  SECURITY: { label: "Security", color: "text-rose-400/90 border-rose-500/40 bg-rose-500/5", icon: "ShieldAlert", dot: "bg-rose-500" },
  MESSAGE: { label: "Message", color: "text-teal-400/90 border-teal-500/40 bg-teal-500/5", icon: "Mail", dot: "bg-teal-500" },
  PHYSICAL: { label: "Physical", color: "text-stone-300/90 border-stone-500/40 bg-stone-500/5", icon: "Package", dot: "bg-stone-400" },
};

/** Evidence required for a complete accusation — coverage across 4 dimensions. */
export const ACCUSATION_DIMENSIONS = [
  { id: "identity", label: "Identity", description: "Who was the killer?" },
  { id: "opportunity", label: "Opportunity", description: "Were they at the scene during the time of death?" },
  { id: "motive", label: "Motive", description: "Why did they do it?" },
  { id: "supporting", label: "Supporting", description: "Corroborating evidence (coordination, cover-up, etc.)" },
] as const;
