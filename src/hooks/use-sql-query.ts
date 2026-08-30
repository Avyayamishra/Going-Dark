"use client";

import { useCallback } from "react";
import { useGameStore, useActiveStory, useCompletedObjectives } from "@/lib/game/store";
import { useAudio } from "@/hooks/use-audio";
import type { EvidenceTriggerContext } from "@/stories/types";
import { executeQuery } from "@/lib/sql/client-engine";
import type { QueryResult } from "@/lib/sql/client-engine";
import { analyzeQuery } from "@/lib/sql/analyzer";

export interface RunQueryOptions {
  onResult?: (result: QueryResult) => void;
}

export function useSqlQuery() {
  const addQuery = useGameStore((s) => s.addQuery);
  const completeObjective = useGameStore((s) => s.completeObjective);
  const recordConcepts = useGameStore((s) => s.recordConcepts);
  const story = useActiveStory();
  const completedObjectives = useCompletedObjectives();
  const { play } = useAudio();

  const runQuery = useCallback(
    async (sql: string): Promise<QueryResult> => {
      play("execute");
      const start = performance.now();
      const analysis = analyzeQuery(sql);
      let result: QueryResult;
      try {
        if (!story) {
          result = {
            ok: false,
            error: {
              kind: "UNKNOWN_ERROR",
              title: "NO CASE SELECTED",
              message: "No case is active. Select a case from the Case Archive first.",
            },
            executionTimeMs: Math.round(performance.now() - start),
          };
        } else {
          result = await executeQuery(story.metadata.id, sql);
        }
      } catch {
        result = {
          ok: false,
          error: {
            kind: "UNKNOWN_ERROR",
            title: "DATABASE ERROR",
            message: "Could not initialise the investigation database. The database engine may be loading.",
          },
          executionTimeMs: Math.round(performance.now() - start),
        };
      }

      addQuery({
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sql,
        executedAt: Date.now(),
        ok: result.ok,
        rowCount: result.ok ? result.rowCount : 0,
        durationMs: result.executionTimeMs,
        errorTitle: result.ok ? undefined : result.error.title,
        concepts: analysis.concepts,
        level: analysis.level,
      });

      if (result.ok && analysis.concepts.length > 0) {
        recordConcepts(analysis.concepts);
      }

      if (result.ok && story) {
        play("success");
        // Check objective triggers — objectives complete based on query patterns,
        // NOT on evidence discovery. This is independent of manual evidence clicking.
        const ctx: EvidenceTriggerContext = {
          sql,
          sqlUpper: sql.toUpperCase(),
          columns: result.columns,
          rows: result.rows,
          rowCount: result.rowCount,
          tableName: inferTableName(sql),
        };
        const alreadyCompleted = new Set(completedObjectives);
        for (const trigger of story.solution.objectiveTriggers) {
          if (!alreadyCompleted.has(trigger.objectiveId)) {
            try {
              if (trigger.test(ctx)) {
                completeObjective(trigger.objectiveId);
              }
            } catch {
              // ignore trigger errors
            }
          }
        }
        // NOTE: Evidence discovery is NO LONGER automatic.
        // The user must manually click on specific rows in the results table
        // to discover evidence. The QueryResults component handles this via
        // the onRowClick callback.
      } else if (!result.ok) {
        play("error");
      }

      return result;
    },
    [addQuery, completeObjective, completedObjectives, play, recordConcepts, story],
  );

  return { runQuery };
}

function inferTableName(sql: string): string | undefined {
  const m = sql.match(/from\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
  return m ? m[1].toLowerCase() : undefined;
}
