"use client";

import { Target, CheckCircle2, Circle, GraduationCap, CornerDownRight, AlertTriangle } from "lucide-react";
import { useGameStore, useActiveStory, useCompletedObjectives, useLearnedConcepts } from "@/lib/game/store";
import { CONCEPT_META } from "@/lib/sql/analyzer";
import { useAudio } from "@/hooks/use-audio";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const THREAD_LABELS: Record<string, string> = {
  MOVEMENT: "Movements",
  COMMUNICATION: "Communications",
  FINANCIAL: "Financial",
  SECURITY: "Security",
  MESSAGES: "Messages",
  PHYSICAL: "Physical",
  ACCUSATION: "Accusation",
};

const THREAD_COLORS: Record<string, string> = {
  MOVEMENT: "text-sky-400/80 border-sky-500/30",
  COMMUNICATION: "text-violet-400/80 border-violet-500/30",
  FINANCIAL: "text-amber-400/80 border-amber-500/30",
  SECURITY: "text-rose-400/80 border-rose-500/30",
  MESSAGES: "text-teal-400/80 border-teal-500/30",
  PHYSICAL: "text-stone-300/80 border-stone-500/30",
  ACCUSATION: "text-primary border-primary/40",
};

interface InvestigationProgressProps {
  onLoadQuery?: (sql: string) => void;
}

export function InvestigationProgress({ onLoadQuery }: InvestigationProgressProps) {
  const story = useActiveStory();
  const completed = useCompletedObjectives();
  const learnedConcepts = useLearnedConcepts();
  const penalizeScore = useGameStore((s) => s.penalizeScore);
  const { play } = useAudio();
  const completedSet = new Set(completed);
  const objectives = story?.objectives ?? [];
  const pct = objectives.length > 0 ? Math.round((completed.length / objectives.length) * 100) : 0;

  const handleLoadStarterQuery = (sql: string, objectiveId: string) => {
    play("click");
    penalizeScore(100);
    toast({
      title: "Starter query loaded",
      description: `-100 points. The answer query has been pasted to the editor. Run it to complete ${objectiveId}.`,
    });
    onLoadQuery?.(sql);
  };

  const threads = Array.from(new Set(objectives.map((o) => o.thread)));

  return (
    <div className="p-2 space-y-2">
      <div className="px-1">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <span>Investigation Progress</span>
          <span className="tabular-nums text-foreground">{completed.length}/{objectives.length}</span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-black/30 overflow-hidden border border-border/40">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {threads.map((thread) => {
        const objs = objectives.filter((o) => o.thread === thread);
        const doneCount = objs.filter((o) => completedSet.has(o.id)).length;
        return (
          <div key={thread} className="space-y-1">
            <div className="flex items-center justify-between px-1">
              <span className={cn("text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border rounded-sm", THREAD_COLORS[thread])}>
                {THREAD_LABELS[thread]}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground tabular-nums">{doneCount}/{objs.length}</span>
            </div>
            {objs.map((o) => {
              const done = completedSet.has(o.id);
              return (
                <div
                  key={o.id}
                  className={cn(
                    "w-full text-left border rounded-sm p-2 transition-colors",
                    done ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-black/20 hover:border-primary/30",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {done ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500/80 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="size-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Target className="size-3 text-primary/70" />
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{o.id}</span>
                      </div>
                      <div className={cn("font-mono text-xs mt-0.5", done ? "text-foreground" : "text-foreground/80")}>{o.title}</div>
                      <p className="text-[10px] text-muted-foreground/80 leading-snug mt-0.5">{o.description}</p>
                      {o.starterQuery && onLoadQuery && (
                        <button
                          onClick={() => handleLoadStarterQuery(o.starterQuery!, o.id)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-amber-400/80 hover:text-amber-400 border-b border-amber-400/30 hover:border-amber-400/60 transition-colors cursor-pointer"
                        >
                          <CornerDownRight className="size-2.5" />
                          Load answer query
                          <span className="text-amber-400/60">(-100 pts)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* SQL concepts learned */}
      <div className="mt-2 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <GraduationCap className="size-3 text-primary/70" />
            SQL Concepts Used
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/60 tabular-nums">
            {learnedConcepts.length}/{CONCEPT_META.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 px-1">
          {CONCEPT_META.map((m) => {
            const used = learnedConcepts.includes(m.id);
            return (
              <span
                key={m.id}
                title={m.hint}
                className={cn(
                  "text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 border rounded-sm transition-colors",
                  used
                    ? "border-primary/40 text-primary bg-primary/5"
                    : "border-border/30 text-muted-foreground/40",
                )}
              >
                {m.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
