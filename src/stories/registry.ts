/**
 * Story registry — the central catalog of all available stories.
 *
 * The game engine never imports a specific story. Instead it asks the registry
 * for the active story by id. New DLC stories are registered here.
 */
import type { Story, StoryMetadata } from "./types";
import { CASE_001 } from "./case-001";
import { CASE_002 } from "./case-002";
import { CASE_003 } from "./case-003";

/**
 * All playable stories (full Story objects with database + evidence + etc.).
 */
const PLAYABLE_STORIES: Story[] = [CASE_001, CASE_002, CASE_003];

/**
 * Metadata-only entries for stories that are not yet playable (COMING_SOON).
 */
const COMING_SOON_METADATA: StoryMetadata[] = [];

export interface StoryRegistry {
  /** All stories (playable + coming-soon), metadata only. */
  listAll(): StoryMetadata[];
  /** Playable stories only (full Story objects available). */
  listPlayable(): Story[];
  /** Get a full Story by id, or null if not playable. */
  getStory(storyId: string): Story | null;
  /** Get metadata by id (works for both playable and coming-soon). */
  getByStoryId(storyId: string): StoryMetadata | null;
}

export const STORY_REGISTRY: StoryRegistry = {
  listAll() {
    return [...PLAYABLE_STORIES.map((s) => s.metadata), ...COMING_SOON_METADATA];
  },

  listPlayable() {
    return PLAYABLE_STORIES;
  },

  getStory(storyId) {
    return PLAYABLE_STORIES.find((s) => s.metadata.id === storyId) ?? null;
  },

  getByStoryId(storyId) {
    const playable = PLAYABLE_STORIES.find((s) => s.metadata.id === storyId);
    if (playable) return playable.metadata;
    return COMING_SOON_METADATA.find((m) => m.id === storyId) ?? null;
  },
};
