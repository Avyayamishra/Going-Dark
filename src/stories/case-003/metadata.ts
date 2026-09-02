import type { StoryMetadata } from "@/stories/types";

/**
 * Project Lazarus — coming soon.
 *
 * A scientific conspiracy / biotech thriller. A scientist working on
 * experimental tissue regeneration dies unexpectedly. The official report
 * says natural causes. The laboratory's internal database shows something
 * impossible: the scientist's credentials were used six hours after his
 * recorded time of death.
 *
 * Gameplay will combine SQL investigation (researchers, lab access,
 * experiment logs, sample inventory, security records) with Python
 * gameplay (analyzing experimental datasets and .pkl files via pickle).
 *
 * Twist: the credentials weren't stolen — someone, or something, was
 * using them.
 */
export const CASE_003_METADATA: StoryMetadata = {
  id: "case-003",
  caseNumber: "#003",
  slug: "project-lazarus",
  title: "PROJECT LAZARUS",
  tagline: "DEATH WAS ONLY THE BEGINNING.",
  description:
    "A scientist working on experimental tissue regeneration dies unexpectedly. The official report says natural causes — but the laboratory's internal database shows his credentials were used six hours after his recorded time of death. Investigate researcher records, lab access logs, experiment datasets, and serialized .pkl objects to uncover the truth. The credentials weren't stolen. Someone — or something — was using them.",
  difficulty: "INSPECTOR",
  estimatedTime: "90–120 min",
  accessType: "COMING_SOON",
  victim: "Dr. Aris Thorne",
  victimRole: "Lead Researcher, Tissue Regeneration, Helix Bio Labs",
  location: "HELIX BIO LABS — SUBLEVEL RESEARCH WING, LAB 7",
  incidentDate: "April 22, 2025",
  timeOfDeath: "06:14 AM (Recorded)",
  discoveredAt: "12:08 PM (Credential Use Detected)",
};
