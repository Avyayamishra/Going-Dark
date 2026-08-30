import type { Story } from "@/stories/types";
import { CASE_001_METADATA } from "./metadata";
import { CASE_001_SUSPECTS } from "./suspects";
import { CASE_001_OBJECTIVES } from "./objectives";
import { CASE_001_LEADS } from "./leads";
import { CASE_001_EVIDENCE_CATALOG } from "./evidence";
import { CASE_001_EVIDENCE_TRIGGERS } from "./triggers";
import { CASE_001_TIMELINE } from "./timeline";
import { CASE_001_ACCUSATION } from "./accusation";
import { CASE_001_SOLUTION } from "./solution";
import { CASE_001_DATABASE } from "./database";

export const CASE_001: Story = {
  metadata: CASE_001_METADATA,
  suspects: CASE_001_SUSPECTS,
  objectives: CASE_001_OBJECTIVES,
  leads: CASE_001_LEADS,
  evidenceCatalog: CASE_001_EVIDENCE_CATALOG,
  evidenceTriggers: CASE_001_EVIDENCE_TRIGGERS,
  timeline: CASE_001_TIMELINE,
  accusation: CASE_001_ACCUSATION,
  solution: CASE_001_SOLUTION,
  database: CASE_001_DATABASE,
};
