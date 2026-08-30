"use client";

import { Compass, CornerDownRight } from "lucide-react";
import { useActiveStory } from "@/lib/game/store";
import { useAudio } from "@/hooks/use-audio";
import { cn } from "@/lib/utils";

const THREAD_LABELS: Record<string, string> = {
  MOVEMENT: "Movement",
  COMMUNICATION: "Comms",
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

interface InvestigationLeadsProps {
  onRunQuery?: (sql: string) => void;
}

export function InvestigationLeads({ onRunQuery }: InvestigationLeadsProps) {
  const story = useActiveStory();
  const { play } = useAudio();
  const leads = story?.leads ?? [];

  return (
    <div className="p-2 space-y-2">
      <div className="px-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Compass className="size-3 text-primary/70" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Suggested Leads</span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/60">non-linear</span>
      </div>
      <p className="px-1 text-[10px] text-muted-foreground/70 leading-snug">
        Investigate any thread in any order. Use a starter query or write your own.
      </p>
      <div className="space-y-1.5">
        {leads.map((lead) => (
          <div key={lead.id} className="border border-border/50 bg-black/20 rounded-sm p-2 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={cn("text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border rounded-sm", THREAD_COLORS[lead.thread])}>
                {THREAD_LABELS[lead.thread]}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/50 ml-auto">{lead.id}</span>
            </div>
            <p className="text-[11px] text-foreground/90 leading-snug">{lead.question}</p>
            {lead.starterQuery && onRunQuery && (
              <button
                onClick={() => {
                  play("click");
                  onRunQuery(lead.starterQuery!);
                }}
                className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-primary/80 hover:text-primary border-b border-primary/30 hover:border-primary/60 transition-colors"
              >
                <CornerDownRight className="size-2.5" />
                Load starter query
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
