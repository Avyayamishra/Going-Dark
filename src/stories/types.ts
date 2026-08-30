/**
 * Core story types for the multi-story GOING DARK platform.
 *
 * A Story is a self-contained content pack: metadata, an investigation database
 * seed, evidence definitions, objectives, hints, a timeline, an accusation
 * configuration, and the canonical solution.
 *
 * The game engine operates on a generic `Story` object — no story-specific
 * branching in engine code.
 */

import type { AccusationOption } from "@/types";

// ---------- Metadata ----------

export type StoryAccessType = "FREE" | "PAID" | "COMING_SOON";
export type StoryDifficulty = "ROOKIE" | "DETECTIVE" | "INSPECTOR";

export interface StoryMetadata {
  /** Stable unique id, e.g. "case-001". */
  id: string;
  /** Display case number, e.g. "#001". */
  caseNumber: string;
  /** URL-safe slug, e.g. "the-midnight-archive". */
  slug: string;
  title: string;
  tagline: string;
  /** One-paragraph description for the case archive card. */
  description: string;
  difficulty: StoryDifficulty;
  /** Estimated play time, e.g. "45–60 min". */
  estimatedTime: string;
  accessType: StoryAccessType;
  /** Price string for paid stories, e.g. "$4.99". Omit for free/coming-soon. */
  price?: string;
  currency?: string;
  /** Cover image path (relative to /public or a URL). */
  coverImage?: string;
  // Case facts
  victim: string;
  victimRole: string;
  location: string;
  incidentDate: string;
  timeOfDeath: string;
  discoveredAt: string;
}

// ---------- Suspects ----------

export interface SuspectInfo {
  id: string;
  suspectId: string;
  name: string;
  role: string;
  department: string;
  shortBio: string;
}

// ---------- Objectives ----------

export type InvestigationThread =
  | "MOVEMENT"
  | "COMMUNICATION"
  | "FINANCIAL"
  | "SECURITY"
  | "MESSAGES"
  | "PHYSICAL"
  | "ACCUSATION";

export interface ObjectiveDefinition {
  id: string;
  title: string;
  description: string;
  thread: InvestigationThread;
  /** A starter SQL query the player can load to begin investigating this objective. */
  starterQuery?: string;
  hints: {
    1: { title: string; body: string };
    2: { title: string; body: string };
    3: { title: string; body: string };
  };
}

// ---------- Leads ----------

export interface LeadDefinition {
  id: string;
  question: string;
  thread: InvestigationThread;
  starterQuery?: string;
}

// ---------- Evidence ----------

export type EvidenceCategory =
  | "MOVEMENT"
  | "COMMUNICATION"
  | "FINANCIAL"
  | "SECURITY"
  | "MESSAGE"
  | "PHYSICAL";

export type AccusationDimension = "identity" | "opportunity" | "motive" | "supporting";

export interface EvidenceCatalogItem {
  evidenceId: string;
  name: string;
  description: string;
  category: EvidenceCategory;
  significance: string;
  source: string;
  foundTime: string;
  relatedSuspect?: string;
  relatedPersonId?: string;
  /** Other evidence ids this item connects to. */
  relatedEvidence?: string[];
  /** Whether this evidence contributes to the accusation gate, and which dimension. */
  accusationDimension?: AccusationDimension;
}

/** Context passed to an evidence trigger test. */
export interface EvidenceTriggerContext {
  sql: string;
  sqlUpper: string;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  tableName?: string;
}

/** A trigger that fires when a query result matches a meaningful discovery. */
export interface EvidenceTrigger {
  evidenceId: string;
  name: string;
  description: string;
  category: EvidenceCategory;
  significance: string;
  test: (ctx: EvidenceTriggerContext) => boolean;
}

/** Maps an evidence id to a timeline event (revealed only when discovered). */
export interface TimelineEventDef {
  evidenceId: string;
  time: string; // "HH:MM" — sortable lexically
  label: string;
  description?: string;
}

// ---------- Accusation ----------

export interface AccusationDefinition {
  whoOptions: AccusationOption[];
  howOptions: AccusationOption[];
  whyOptions: AccusationOption[];
  /** Required evidence-coverage dimensions for the accusation to be submittable. */
  dimensions: { id: AccusationDimension; label: string; description: string }[];
}

// ---------- Solution (server-side canonical answer) ----------

/** A query-pattern-based trigger that completes an objective. */
export interface ObjectiveTrigger {
  /** The objective id to complete when this trigger fires. */
  objectiveId: string;
  /** Test whether the query result satisfies this objective. */
  test: (ctx: EvidenceTriggerContext) => boolean;
}

export interface StorySolution {
  /** The correct WHO option id. */
  who: string;
  /** The correct HOW option id. */
  how: string;
  /** The correct WHY option id. */
  why: string;
  /** Query-pattern-based triggers that complete objectives (independent of evidence). */
  objectiveTriggers: ObjectiveTrigger[];
  /** Full narrative shown on the completion screen (only when accusation is correct). */
  reconstruction: string[];
}

// ---------- Database seed ----------

/**
 * A table's seed data: the table name + an array of row objects whose keys are
 * column names.
 */
export interface SeedTable {
  name: string;
  rows: Record<string, unknown>[];
}

/** A table's schema definition (CREATE TABLE SQL + column descriptions). */
export interface TableSchemaDef {
  name: string;
  createSql: string;
  description: string;
  columns: { name: string; type: string; description: string }[];
}

/**
 * The investigation database seed for a story. Each story provides its own
 * schema + data. The engine creates an isolated in-memory SQLite database
 * from this seed.
 */
export interface InvestigationDatabaseSeed {
  /** The SQL schema (CREATE TABLE statements) for this story. If omitted, the engine uses the default shared schema. */
  schema?: TableSchemaDef[];
  /** The data rows for each table. */
  tables: SeedTable[];
}

// ---------- Story ----------

export interface Story {
  metadata: StoryMetadata;
  suspects: SuspectInfo[];
  objectives: ObjectiveDefinition[];
  leads: LeadDefinition[];
  evidenceCatalog: EvidenceCatalogItem[];
  evidenceTriggers: EvidenceTrigger[];
  timeline: TimelineEventDef[];
  accusation: AccusationDefinition;
  solution: StorySolution;
  database: InvestigationDatabaseSeed;
}
