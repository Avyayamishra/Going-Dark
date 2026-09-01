import type { Story } from "@/stories/types";
import { CASE_003_METADATA } from "./metadata";
import { CASE_003_SUSPECTS } from "./suspects";
import { CASE_003_OBJECTIVES } from "./objectives";
import { CASE_003_LEADS } from "./leads";
import { CASE_003_EVIDENCE_CATALOG } from "./evidence";
import { CASE_003_EVIDENCE_TRIGGERS } from "./triggers";
import { CASE_003_TIMELINE } from "./timeline";
import { CASE_003_ACCUSATION } from "./accusation";
import { CASE_003_SOLUTION } from "./solution";
import { CASE_003_DATABASE } from "./database";

export const CASE_003: Story = {
  metadata: CASE_003_METADATA,
  suspects: CASE_003_SUSPECTS,
  objectives: CASE_003_OBJECTIVES,
  leads: CASE_003_LEADS,
  evidenceCatalog: CASE_003_EVIDENCE_CATALOG,
  evidenceTriggers: CASE_003_EVIDENCE_TRIGGERS,
  timeline: CASE_003_TIMELINE,
  accusation: CASE_003_ACCUSATION,
  solution: CASE_003_SOLUTION,
  database: CASE_003_DATABASE,
};
