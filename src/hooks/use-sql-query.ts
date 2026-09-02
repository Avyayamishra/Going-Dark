
import { useCallback } from "react";
import { useGameStore, useActiveStory, useDiscoveredEvidence, useCompletedObjectives } from "@/lib/game/store";
import { useAudio } from "@/hooks/use-audio";
import type { EvidenceTriggerContext } from "@/stories/types";
import { executeQuery } from "@/lib/sql/client-engine";
import type { QueryResult } from "@/lib/sql/client-engine";

export function useSqlQuery() {
  const addQuery = useGameStore((s) => s.addQuery);
  const discoverEvidence = useGameStore((s) => s.discoverEvidence);
  const completeObjective = useGameStore((s) => s.completeObjective);
  const addTimelineEvent = useGameStore((s) => s.addTimelineEvent);
  const story = useActiveStory();
  const discoveredEvidence = useDiscoveredEvidence();
  const completedObjectives = useCompletedObjectives();
  const { play } = useAudio();

  const runQuery = useCallback(
    async (sql: string): Promise<QueryResult> => {
      play("execute");
      const start = performance.now();
      let result: QueryResult;
      try {
        if (!story) {
          result = {
            ok: false,
            error: { kind: "UNKNOWN_ERROR", title: "NO CASE SELECTED", message: "No case is active." },
            executionTimeMs: Math.round(performance.now() - start),
          };
        } else {
          result = await executeQuery(story.metadata.id, sql);
        }
      } catch {
        result = {
          ok: false,
          error: { kind: "UNKNOWN_ERROR", title: "DATABASE ERROR", message: "Could not initialise the investigation database." },
          executionTimeMs: Math.round(performance.now() - start),
        };
      }

      addQuery({
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sql, executedAt: Date.now(), ok: result.ok,
        rowCount: result.ok ? result.rowCount : 0, durationMs: result.executionTimeMs,
        errorTitle: result.ok ? undefined : result.error.title,
      });

      if (result.ok && story) {
        play("success");
        const ctx: EvidenceTriggerContext = {
          sql, sqlUpper: sql.toUpperCase(),
          columns: result.columns, rows: result.rows, rowCount: result.rowCount,
          tableName: inferTableName(sql),
        };
        const alreadyCompleted = new Set(completedObjectives);
        for (const trigger of story.solution.objectiveTriggers) {
          if (!alreadyCompleted.has(trigger.objectiveId)) {
            try { if (trigger.test(ctx)) completeObjective(trigger.objectiveId); } catch { /* ignore */ }
          }
        }
      } else if (!result.ok) {
        play("error");
      }
      return result;
    },
    [addQuery, discoverEvidence, completeObjective, completedObjectives, play, addTimelineEvent, story, discoveredEvidence],
  );

  return { runQuery };
}

function inferTableName(sql: string): string | undefined {
  const m = sql.match(/from\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
  return m ? m[1].toLowerCase() : undefined;
}
