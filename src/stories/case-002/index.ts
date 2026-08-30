import type { Story } from "@/stories/types";
import { CASE_002_METADATA } from "./metadata";
import { CASE_002_SUSPECTS } from "./suspects";
import { CASE_002_OBJECTIVES } from "./objectives";
import { CASE_002_LEADS } from "./leads";
import { CASE_002_EVIDENCE_CATALOG } from "./evidence";
import { CASE_002_EVIDENCE_TRIGGERS } from "./triggers";
import { CASE_002_TIMELINE } from "./timeline";
import { CASE_002_ACCUSATION } from "./accusation";
import { CASE_002_SOLUTION } from "./solution";
import { CASE_002_DATABASE } from "./database";

export const CASE_002: Story = {
  metadata: CASE_002_METADATA,
  suspects: CASE_002_SUSPECTS,
  objectives: CASE_002_OBJECTIVES,
  leads: CASE_002_LEADS,
  evidenceCatalog: CASE_002_EVIDENCE_CATALOG,
  evidenceTriggers: CASE_002_EVIDENCE_TRIGGERS,
  timeline: CASE_002_TIMELINE,
  accusation: CASE_002_ACCUSATION,
  solution: CASE_002_SOLUTION,
  database: CASE_002_DATABASE,
};
