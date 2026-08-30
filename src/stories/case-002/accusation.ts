import type { AccusationDefinition } from "@/stories/types";
import { ACCUSATION_DIMENSIONS } from "@/stories/evidenceMeta";
import { CASE_002_SUSPECTS } from "./suspects";

export const CASE_002_ACCUSATION: AccusationDefinition = {
  whoOptions: CASE_002_SUSPECTS.map((s) => ({
    id: s.id,
    label: `${s.name} — ${s.role}`,
  })),
  howOptions: [
    { id: "M_CRED_THEFT", label: "Stole Sokolov's credential RUS-77A and used it to access the satellite while he was away" },
    { id: "M_INSIDER_LEAK", label: "Obtained the credential through an insider leak within the intelligence network" },
    { id: "M_REMOTE_HACK", label: "Remotely hacked the satellite's authentication system to bypass credentials" },
    { id: "M_SOCIAL_ENGINEER", label: "Social-engineered Sokolov into revealing his credential during a prior meeting" },
  ],
  whyOptions: [
    { id: "M_EXTRACT_KEY", label: "To extract a classified orbital communication key during the seven-minute telemetry gap" },
    { id: "M_DISRUPT_COMMS", label: "To disrupt Russian military communications across Eastern Europe" },
    { id: "M_FRAME_ETHAN", label: "To create an intelligence incident that would frame Ethan Hunt and cause inter-agency suspicion" },
    { id: "M_TEST_DEFENSES", label: "To test the satellite's defense systems for a future larger operation" },
  ],
  dimensions: [...ACCUSATION_DIMENSIONS],
};
