/**
 * Story access abstraction.
 *
 * For now, a `LocalStoryAccessProvider` determines which stories are unlocked
 * based on the story's `accessType` (FREE stories are always unlocked; PAID /
 * COMING_SOON stories are locked). A development override can unlock all stories.
 *
 * In a future stage this interface can be backed by a `BackendStoryAccessProvider`
 * that verifies entitlements against a backend (Supabase, Stripe, etc.) — the
 * calling code won't change.
 */
import type { Story, StoryMetadata } from "./types";

export interface StoryAccessProvider {
  canAccessStory(storyId: string): Promise<boolean>;
  /** Synchronous variant for client-side gating (uses cached metadata only). */
  canAccessStorySync(story: Story | StoryMetadata): boolean;
  /** Human-readable reason for UI display, e.g. "FREE", "LOCKED", "COMING SOON". */
  accessLabel(story: Story | StoryMetadata): string;
}

/**
 * Development override. When true, every story is treated as unlocked locally
 * so developers can preview DLC content without payment. Clearly marked as
 * development functionality — NOT production payment logic.
 */
const DEV_UNLOCK_ALL = false;

export class LocalStoryAccessProvider implements StoryAccessProvider {
  async canAccessStory(storyId: string): Promise<boolean> {
    if (DEV_UNLOCK_ALL) return true;
    const meta = STORY_REGISTRY.getByStoryId(storyId);
    if (!meta) return false;
    return meta.accessType === "FREE";
  }

  canAccessStorySync(story: Story | StoryMetadata): boolean {
    if (DEV_UNLOCK_ALL) return true;
    const meta = "metadata" in story ? story.metadata : story;
    return meta.accessType === "FREE";
  }

  accessLabel(story: Story | StoryMetadata): string {
    const meta = "metadata" in story ? story.metadata : story;
    if (meta.accessType === "COMING_SOON") return "COMING SOON";
    if (meta.accessType === "PAID") return meta.price ? `LOCKED · ${meta.price}` : "LOCKED";
    return "FREE";
  }
}

// Late-imported to avoid a circular dependency (registry imports access types).
// Using a lazy getter keeps the module graph clean.
import { STORY_REGISTRY } from "./registry";
