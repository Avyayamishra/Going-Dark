"use client";

import { User, ShieldCheck } from "lucide-react";
import { useActiveStory } from "@/lib/game/store";
import { useAudio } from "@/hooks/use-audio";

export function SuspectList() {
  const story = useActiveStory();
  const { play } = useAudio();
  if (!story) return null;
  return (
    <div className="space-y-2 p-2">
      {story.suspects.map((s) => (
        <div
          key={s.id}
          className="group border border-border/60 bg-black/20 rounded-sm p-2.5 hover:border-primary/50 transition-colors"
          onMouseEnter={() => play("click")}
        >
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-sm border border-border/60 bg-card/60 flex items-center justify-center shrink-0">
              <User className="size-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs text-foreground truncate">{s.name}</span>
                <span className="font-mono text-[9px] text-muted-foreground/60">{s.id}</span>
              </div>
              <div className="font-mono text-[10px] text-primary truncate">{s.role}</div>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
            <ShieldCheck className="size-2.5" />
            {s.department}
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground/80 leading-snug">{s.shortBio}</p>
        </div>
      ))}
    </div>
  );
}
