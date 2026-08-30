import type { AccusationDefinition } from "@/stories/types";
import { ACCUSATION_DIMENSIONS } from "@/stories/evidenceMeta";
import { CASE_001_SUSPECTS } from "./suspects";

export const CASE_001_ACCUSATION: AccusationDefinition = {
  whoOptions: CASE_001_SUSPECTS.map((s) => ({
    id: s.id,
    label: `${s.name} — ${s.role}`,
  })),
  howOptions: [
    { id: "M_RETURN_ARCHIVE", label: "Maya secretly returned to the building, entered the Archive during the time of death, and killed Elias by strangulation" },
    { id: "M_DANIEL_KILLED", label: "Daniel killed Elias inside the Archive while Maya was at home" },
    { id: "M_REMOTE_HACK", label: "Sofia remotely hacked the archive terminal to trigger a fatal electrical fault" },
    { id: "M_STAGED_BURGLARY", label: "Ryan staged a burglary in the Archive and struck Elias during the struggle" },
  ],
  whyOptions: [
    { id: "M_EMBEZZLEMENT", label: "To prevent Elias from exposing Maya's embezzlement scheme tagged with reference TR-4817" },
    { id: "M_BUDGET_DISPUTE", label: "Elias blocked Maya's budget, threatening layoffs" },
    { id: "M_PROMOTION", label: "Elias denied Sofia a promotion she believed she earned" },
    { id: "M_STAFFING", label: "Elias ignored Ryan's warnings about unsafe staffing levels" },
  ],
  dimensions: [...ACCUSATION_DIMENSIONS],
};
