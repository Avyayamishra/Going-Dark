import type { AccusationDefinition } from "@/stories/types";
import { ACCUSATION_DIMENSIONS } from "@/stories/evidenceMeta";
import { CASE_003_SUSPECTS } from "./suspects";

export const CASE_003_ACCUSATION: AccusationDefinition = {
  whoOptions: CASE_003_SUSPECTS.map((s) => ({
    id: s.id,
    label: `${s.name} — ${s.role}`,
  })),
  howOptions: [
    { id: "M_TRAIN_MECHANISM", label: "A concealed retractable spike inside the train's service infrastructure was remotely activated through the security console" },
    { id: "M_DIRECT_ENTRY", label: "The killer entered A-17 through the cabin door during the tunnel" },
    { id: "M_POISON", label: "Arvind was poisoned earlier in the evening and died during the tunnel" },
    { id: "M_WINDOW_ENTRY", label: "The killer entered through the sealed window" },
  ],
  whyOptions: [
    { id: "M_SELL_SECRETS", label: "Dev was selling company security intelligence to a rival consortium and Arvind planned to expose him in Delhi" },
    { id: "M_BUSINESS_RIVALRY", label: "Business rivalry over the acquisition deal" },
    { id: "M_INHERITANCE", label: "To prevent the sale of the family company and protect inheritance" },
    { id: "M_PROFESSIONAL", label: "Professional grievance over work conditions" },
  ],
  dimensions: [...ACCUSATION_DIMENSIONS],
};
