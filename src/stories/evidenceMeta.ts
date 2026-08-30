/**
 * Evidence category metadata — reusable across all stories (engine-level).
 */
import type { EvidenceCategory } from "@/stories/types";

export const EVIDENCE_CATEGORY_META: Record<
  EvidenceCategory,
  { label: string; color: string; icon: string; dot: string }
> = {
  MOVEMENT: { label: "Movement", color: "text-sky-400/90 border-sky-500/40 bg-sky-500/5", icon: "Footprints", dot: "bg-sky-500" },
  COMMUNICATION: { label: "Communication", color: "text-violet-400/90 border-violet-500/40 bg-violet-500/5", icon: "Phone", dot: "bg-violet-500" },
  FINANCIAL: { label: "Financial", color: "text-amber-400/90 border-amber-500/40 bg-amber-500/5", icon: "DollarSign", dot: "bg-amber-500" },
  SECURITY: { label: "Security", color: "text-rose-400/90 border-rose-500/40 bg-rose-500/5", icon: "ShieldAlert", dot: "bg-rose-500" },
  MESSAGE: { label: "Message", color: "text-teal-400/90 border-teal-500/40 bg-teal-500/5", icon: "Mail", dot: "bg-teal-500" },
  PHYSICAL: { label: "Physical", color: "text-stone-300/90 border-stone-500/40 bg-stone-500/5", icon: "Package", dot: "bg-stone-400" },
};

/** The standard accusation-coverage dimensions required by every story. */
export const ACCUSATION_DIMENSIONS = [
  { id: "identity", label: "Identity", description: "Who was the killer?" },
  { id: "opportunity", label: "Opportunity", description: "Were they at the scene during the time of death?" },
  { id: "motive", label: "Motive", description: "Why did they do it?" },
  { id: "supporting", label: "Supporting", description: "Corroborating evidence (coordination, cover-up, etc.)" },
] as const;
