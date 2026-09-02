/**
 * Python execution hook.
 *
 * Wires the Pyodide engine into the game state: plays audio cues, evaluates
 * the story's `pythonObjectiveTriggers` against each run, and completes
 * objectives whose test passes.
 *
 * Mirrors `useSqlQuery` but for Python — same store hooks, same audio
 * pattern, same objective-trigger flow.
 */

import { useCallback } from "react";
import { useGameStore, useActiveStory, useCompletedObjectives } from "@/lib/game/store";
import { useAudio } from "@/hooks/use-audio";
import type { EvidenceTriggerContext } from "@/stories/types";
import { executePython, preloadPython } from "@/lib/python/engine";
import type { PythonResult } from "@/lib/python/engine";

export function usePython() {
  const completeObjective = useGameStore((s) => s.completeObjective);
  const story = useActiveStory();
  const completedObjectives = useCompletedObjectives();
  const { play } = useAudio();

  const runPython = useCallback(
    async (code: string): Promise<PythonResult> => {
      play("execute");
      const result: PythonResult = story
        ? await executePython(story.metadata.id, code)
        : {
            ok: false,
            error: {
              kind: "RUNTIME_ERROR",
              title: "NO CASE SELECTED",
              message: "No case is active.",
            },
            executionTimeMs: 0,
          };

      if (result.ok && story) {
        play("success");
        const ctx: EvidenceTriggerContext = {
          language: "python",
          pythonCode: code,
          pythonStdout: result.stdout,
          pythonResult: result.result,
          sql: "",
          sqlUpper: "",
          columns: [],
          rows: [],
          rowCount: 0,
        };
        const alreadyCompleted = new Set(completedObjectives);
        const triggers = story.solution.pythonObjectiveTriggers ?? [];
        for (const trigger of triggers) {
          if (!alreadyCompleted.has(trigger.objectiveId)) {
            try {
              if (trigger.test(ctx)) completeObjective(trigger.objectiveId);
            } catch {
              /* ignore trigger evaluation errors */
            }
          }
        }
      } else if (!result.ok) {
        play("error");
      }
      return result;
    },
    [completeObjective, completedObjectives, play, story],
  );

  const preload = useCallback(() => preloadPython(), []);

  return { runPython, preload };
}
