import type { SuspectInfo } from "@/stories/types";

export const CASE_001_SUSPECTS: SuspectInfo[] = [
  {
    id: "S001",
    suspectId: "S001",
    name: "Maya Chen",
    role: "Chief Financial Officer",
    department: "Finance",
    shortBio: "CFO with signatory authority over vendor payments. Under pressure from Elias over a vendor ledger audit. Separation negotiations were underway.",
  },
  {
    id: "S002",
    suspectId: "S002",
    name: "Daniel Brooks",
    role: "Head of Security",
    department: "Security",
    shortBio: "Unrestricted access to every location including the Archive. Authorised to disable cameras for maintenance. Undisclosed personal relationship with Maya Chen.",
  },
  {
    id: "S003",
    suspectId: "S003",
    name: "Sofia Martinez",
    role: "Senior Software Engineer",
    department: "Engineering",
    shortBio: "Holds remote admin access to Nexora servers. Passed over for a promotion two weeks before the incident. No documented financial motive.",
  },
  {
    id: "S004",
    suspectId: "S004",
    name: "Ryan Cole",
    role: "Operations Manager",
    department: "Operations",
    shortBio: "Holds Archive access for inspections. Discovered the body and called emergency services at 23:52. Filed a complaint about staffing levels.",
  },
];
