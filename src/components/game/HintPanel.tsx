"use client";

import { useState } from "react";
import { Lightbulb, Lock, ChevronRight, ChevronDown } from "lucide-react";
import { useGameStore, useActiveStory, useHints } from "@/lib/game/store";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/hooks/use-audio";
import { cn } from "@/lib/utils";

const THREAD_COLORS: Record<string, string> = {
  MOVEMENT: "text-sky-400/80 border-sky-500/30",
  COMMUNICATION: "text-violet-400/80 border-violet-500/30",
  FINANCIAL: "text-amber-400/80 border-amber-500/30",
  SECURITY: "text-rose-400/80 border-rose-500/30",
  MESSAGES: "text-teal-400/80 border-teal-500/30",
  PHYSICAL: "text-stone-300/80 border-stone-500/30",
  ACCUSATION: "text-primary border-primary/40",
};

const LEVEL_LABELS: Record<number, { label: string; desc: string }> = {
  1: { label: "Investigative", desc: "Direction for the investigation" },
  2: { label: "Database", desc: "Which table / field to look at" },
  3: { label: "SQL Concept", desc: "The SQL technique to use" },
};

export function HintPanel() {
  const story = useActiveStory();
  const hints = useHints();
  const revealHint = useGameStore((s) => s.useHint);
  const completed = useGameStore((s) => {
    if (!s.activeStoryId) return [];
    return s.progress[s.activeStoryId]?.completedObjectives ?? [];
  });
  const objectives = story?.objectives ?? [];
  const { play } = useAudio();
  const [expanded, setExpanded] = useState<string | null>(null);

  const revealedKeys = new Set(hints.map((h) => h.id));

  return (
    <div className="p-2 space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
        <span>Investigator Hints</span>
        <span className="tabular-nums">{hints.length} revealed</span>
      </div>
      <p className="px-1 text-[10px] text-muted-foreground/60 leading-snug">
        Three progressive levels per objective: investigative → database → SQL. Each level costs -25 pts.
      </p>
      {objectives.map((obj) => {
        const isExpanded = expanded === obj.id;
        const completedObj = completed.includes(obj.id);
        const l1Key = `${obj.id}-L1`;
        const l2Key = `${obj.id}-L2`;
        const l3Key = `${obj.id}-L3`;
        const l1Done = revealedKeys.has(l1Key);
        const l2Done = revealedKeys.has(l2Key);
        const l3Done = revealedKeys.has(l3Key);
        return (
          <div
            key={obj.id}
            className={cn(
              "border rounded-sm transition-colors",
              completedObj ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-black/20",
            )}
          >
            <button
              onClick={() => {
                play("click");
                setExpanded(isExpanded ? null : obj.id);
              }}
              className="w-full flex items-center gap-1.5 p-2 text-left"
            >
              {isExpanded ? <ChevronDown className="size-3 text-muted-foreground" /> : <ChevronRight className="size-3 text-muted-foreground" />}
              <Lightbulb className={cn("size-3.5", completedObj ? "text-emerald-500/70" : "text-muted-foreground/50")} />
              <span className="font-mono text-[9px] text-muted-foreground/60">{obj.id}</span>
              <span className={cn("text-[9px] font-mono uppercase tracking-wider px-1 border rounded-sm", THREAD_COLORS[obj.thread])}>
                {obj.thread}
              </span>
              <span className="ml-auto text-[9px] font-mono text-muted-foreground/50">
                {[l1Done, l2Done, l3Done].filter(Boolean).length}/3
              </span>
            </button>
            {isExpanded && (
              <div className="px-2 pb-2 space-y-1.5">
                <div className="font-mono text-[11px] text-foreground/80">{obj.title}</div>
                <p className="text-[10px] text-muted-foreground/70 leading-snug">{obj.description}</p>
                {[1, 2, 3].map((level) => {
                  const key = `${obj.id}-L${level}`;
                  const done = revealedKeys.has(key);
                  const locked = level >= 2 && !revealedKeys.has(`${obj.id}-L${level - 1}`);
                  const def = obj.hints[level as 1 | 2 | 3];
                  return (
                    <div
                      key={level}
                      className={cn(
                        "border rounded-sm p-1.5",
                        done ? "border-primary/40 bg-primary/5" : "border-border/40 bg-black/20",
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/60 px-1 border border-border/40 rounded-sm">
                          L{level}
                        </span>
                        <span className="font-mono text-[9px] text-muted-foreground/70">{LEVEL_LABELS[level].label}</span>
                        {!done && locked && <Lock className="size-2.5 text-muted-foreground/40 ml-auto" />}
                        {!done && !locked && <span className="ml-auto text-[8px] font-mono text-emerald-500/60 uppercase">ready</span>}
                        {done && <span className="ml-auto text-[8px] font-mono text-primary uppercase">revealed</span>}
                      </div>
                      {done ? (
                        <>
                          <div className="mt-0.5 font-mono text-[10px] text-foreground/80">{def.title}</div>
                          <p className="mt-0.5 text-[10px] text-muted-foreground/90 leading-snug">{def.body}</p>
                        </>
                      ) : (
                        <Button
                          disabled={locked}
                          onClick={() => {
                            play("hint");
                            revealHint(obj.id, level);
                          }}
                          size="sm"
                          variant="outline"
                          className="mt-1 h-5 font-mono text-[9px] uppercase tracking-wider w-full"
                        >
                          {locked ? `Reveal L${level - 1} first` : `Reveal L${level} (-25 pts)`}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
