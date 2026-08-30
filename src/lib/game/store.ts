"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  QueryHistoryItem,
  DiscoveredEvidence,
  InvestigationNote,
  HintItem,
  AccusationRecord,
  TimelineEvent,
} from "@/types";
import { STORY_REGISTRY } from "@/stories/registry";
import type { Story } from "@/stories/types";

// ---------- Per-story progress ----------

export interface StoryProgress {
  storyId: string;
  discoveredEvidence: DiscoveredEvidence[];
  queryHistory: QueryHistoryItem[];
  notes: InvestigationNote[];
  hintsUsed: number;
  hints: HintItem[];
  completedObjectives: string[];
  accusation: AccusationRecord | null;
  score: number;
  timeline: TimelineEvent[];
  learnedConcepts: string[];
  shownInsights: string[];
  /** Whether the player has started this story (entered briefing/investigation). */
  started: boolean;
  /** Whether the case has been solved. */
  completed: boolean;
}

function emptyProgress(storyId: string): StoryProgress {
  return {
    storyId,
    discoveredEvidence: [],
    queryHistory: [],
    notes: [],
    hintsUsed: 0,
    hints: [],
    completedObjectives: [],
    accusation: null,
    score: 0,
    timeline: [],
    learnedConcepts: [],
    shownInsights: [],
    started: false,
    completed: false,
  };
}

// ---------- Global game state (not story-specific) ----------

export type GameStage = "landing" | "archive" | "briefing" | "investigation" | "complete";

interface GameStore {
  // Global
  stage: GameStage;
  activeStoryId: string | null;
  audioEnabled: boolean;
  audioVolume: number;
  // Per-story progress map
  progress: Record<string, StoryProgress>;
  _hasHydrated: boolean;

  // Actions
  setStage: (stage: GameStage) => void;
  selectStory: (storyId: string) => void;
  exitToArchive: () => void;

  // Per-story actions (operate on the active story)
  addQuery: (item: QueryHistoryItem) => void;
  clearHistory: () => void;
  discoverEvidence: (ev: DiscoveredEvidence) => void;
  addNote: (text: string) => void;
  removeNote: (id: string) => void;
  updateNote: (id: string, text: string) => void;
  useHint: (objectiveId: string, level: number) => void;
  completeObjective: (id: string) => void;
  setAccusation: (acc: AccusationRecord) => void;
  setAudio: (enabled: boolean, volume: number) => void;
  recordConcepts: (concepts: string[]) => void;
  markInsightShown: (concept: string) => void;
  addTimelineEvent: (ev: TimelineEvent) => void;
  penalizeScore: (points: number) => void;
  resetActiveStory: () => void;
  _setHydrated: () => void;
}

// Helper to get the active story's progress (or a fresh one).
function getActiveProgress(state: GameStore): StoryProgress | null {
  if (!state.activeStoryId) return null;
  return state.progress[state.activeStoryId] ?? emptyProgress(state.activeStoryId);
}

// Helper to update the active story's progress immutably.
function updateActiveProgress(state: GameStore, updater: (p: StoryProgress) => StoryProgress): Partial<GameStore> {
  if (!state.activeStoryId) return {};
  const current = state.progress[state.activeStoryId] ?? emptyProgress(state.activeStoryId);
  return {
    progress: { ...state.progress, [state.activeStoryId]: updater(current) },
  };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      stage: "landing",
      activeStoryId: null,
      audioEnabled: false,
      audioVolume: 0.5,
      progress: {},
      _hasHydrated: false,

      setStage: (stage) => set({ stage }),

      selectStory: (storyId) =>
        set((s) => {
          const story = STORY_REGISTRY.getStory(storyId);
          if (!story) return s;
          const existing = s.progress[storyId] ?? emptyProgress(storyId);
          return {
            activeStoryId: storyId,
            stage: existing.completed ? "complete" : "briefing",
            progress: {
              ...s.progress,
              [storyId]: { ...existing, started: true },
            },
          };
        }),

      exitToArchive: () => set({ stage: "archive", activeStoryId: null }),

      addQuery: (item) =>
        set((s) =>
          updateActiveProgress(s, (p) => ({
            ...p,
            queryHistory: [item, ...p.queryHistory].slice(0, 100),
          })),
        ),

      clearHistory: () =>
        set((s) => updateActiveProgress(s, (p) => ({ ...p, queryHistory: [] }))),

      discoverEvidence: (ev) =>
        set((s) =>
          updateActiveProgress(s, (p) => {
            if (p.discoveredEvidence.some((e) => e.evidenceId === ev.evidenceId)) return p;
            return {
              ...p,
              discoveredEvidence: [...p.discoveredEvidence, ev],
              score: p.score + 100,
            };
          }),
        ),

      addNote: (text) =>
        set((s) =>
          updateActiveProgress(s, (p) => ({
            ...p,
            notes: [
              { id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text, createdAt: Date.now() },
              ...p.notes,
            ].slice(0, 200),
          })),
        ),

      removeNote: (id) =>
        set((s) => updateActiveProgress(s, (p) => ({ ...p, notes: p.notes.filter((n) => n.id !== id) }))),

      updateNote: (id, text) =>
        set((s) =>
          updateActiveProgress(s, (p) => ({
            ...p,
            notes: p.notes.map((n) => (n.id === id ? { ...n, text } : n)),
          })),
        ),

      useHint: (objectiveId, level) =>
        set((s) => {
          const story = s.activeStoryId ? STORY_REGISTRY.getStory(s.activeStoryId) : null;
          if (!story) return s;
          const obj = story.objectives.find((o) => o.id === objectiveId);
          if (!obj) return s;
          const hintKey = `${objectiveId}-L${level}`;
          return updateActiveProgress(s, (p) => {
            if (p.hints.some((h) => h.id === hintKey)) return p;
            if (level >= 2 && !p.hints.some((h) => h.id === `${objectiveId}-L${level - 1}`)) return p;
            const hintDef = obj.hints[level as 1 | 2 | 3];
            if (!hintDef) return p;
            return {
              ...p,
              hints: [
                ...p.hints,
                { id: hintKey, level, title: hintDef.title, body: hintDef.body, revealedAt: Date.now() },
              ],
              hintsUsed: p.hintsUsed + 1,
              score: Math.max(0, p.score - 25),
            };
          });
        }),

      completeObjective: (id) =>
        set((s) =>
          updateActiveProgress(s, (p) => {
            if (p.completedObjectives.includes(id)) return p;
            return {
              ...p,
              completedObjectives: [...p.completedObjectives, id],
              score: p.score + 200,
            };
          }),
        ),

      setAccusation: (acc) =>
        set((s) =>
          updateActiveProgress(s, (p) => ({
            ...p,
            accusation: acc,
            score: acc.correct ? p.score + 500 : p.score,
            completed: acc.correct,
          })),
        ),

      setAudio: (enabled, volume) => set({ audioEnabled: enabled, audioVolume: volume }),

      recordConcepts: (concepts) =>
        set((s) =>
          updateActiveProgress(s, (p) => {
            const existing = new Set(p.learnedConcepts);
            let added = false;
            for (const c of concepts) {
              if (!existing.has(c)) {
                existing.add(c);
                added = true;
              }
            }
            if (!added) return p;
            return {
              ...p,
              learnedConcepts: Array.from(existing),
              score: p.score + concepts.filter((c) => !p.learnedConcepts.includes(c)).length * 5,
            };
          }),
        ),

      markInsightShown: (concept) =>
        set((s) =>
          updateActiveProgress(s, (p) =>
            p.shownInsights.includes(concept) ? p : { ...p, shownInsights: [...p.shownInsights, concept] },
          ),
        ),

      addTimelineEvent: (ev) =>
        set((s) =>
          updateActiveProgress(s, (p) => {
            if (p.timeline.some((t) => t.id === ev.id)) return p;
            const next = [...p.timeline, ev].sort((a, b) => a.time.localeCompare(b.time));
            return { ...p, timeline: next };
          }),
        ),

      resetActiveStory: () =>
        set((s) => {
          if (!s.activeStoryId) return s;
          return {
            progress: { ...s.progress, [s.activeStoryId]: emptyProgress(s.activeStoryId) },
            stage: "briefing",
          };
        }),

      penalizeScore: (points) =>
        set((s) =>
          updateActiveProgress(s, (p) => ({
            ...p,
            score: Math.max(0, p.score - points),
          })),
        ),

      _setHydrated: () => set({ _hasHydrated: true }),
    }),
    {
      name: "sql-murder-mystery-state",
      version: 3,
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?._setHydrated();
      },
    },
  ),
);

// ---------- Selectors (hooks that read the active story's progress) ----------

export function useActiveStory(): Story | null {
  return useGameStore((s) => (s.activeStoryId ? STORY_REGISTRY.getStory(s.activeStoryId) : null));
}

export function useActiveProgress(): StoryProgress | null {
  return useGameStore((s) => getActiveProgress(s));
}

// Convenience hooks for individual progress fields.
export function useDiscoveredEvidence(): DiscoveredEvidence[] {
  return useGameStore((s) => getActiveProgress(s)?.discoveredEvidence ?? []);
}
export function useQueryHistory(): QueryHistoryItem[] {
  return useGameStore((s) => getActiveProgress(s)?.queryHistory ?? []);
}
export function useNotes(): InvestigationNote[] {
  return useGameStore((s) => getActiveProgress(s)?.notes ?? []);
}
export function useHints(): HintItem[] {
  return useGameStore((s) => getActiveProgress(s)?.hints ?? []);
}
export function useCompletedObjectives(): string[] {
  return useGameStore((s) => getActiveProgress(s)?.completedObjectives ?? []);
}
export function useScore(): number {
  return useGameStore((s) => getActiveProgress(s)?.score ?? 0);
}
export function useTimeline(): TimelineEvent[] {
  return useGameStore((s) => getActiveProgress(s)?.timeline ?? []);
}
export function useLearnedConcepts(): string[] {
  return useGameStore((s) => getActiveProgress(s)?.learnedConcepts ?? []);
}
export function useShownInsights(): string[] {
  return useGameStore((s) => getActiveProgress(s)?.shownInsights ?? []);
}
export function useAccusation(): AccusationRecord | null {
  return useGameStore((s) => getActiveProgress(s)?.accusation ?? null);
}
