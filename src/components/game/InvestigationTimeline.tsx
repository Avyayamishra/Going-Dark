
import { Clock3, Lock } from "lucide-react";
import { useActiveStory, useTimeline, useDiscoveredEvidence } from "@/lib/game/store";
import { EVIDENCE_CATEGORY_META } from "@/stories/evidenceMeta";
import { cn } from "@/lib/utils";

export function InvestigationTimeline() {
  const story = useActiveStory();
  const timeline = useTimeline();
  const discovered = useDiscoveredEvidence();

  // Sort by time ascending (already sorted in store, but ensure).
  const events = [...timeline].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
        <span className="flex items-center gap-1.5">
          <Clock3 className="size-3 text-primary/70" />
          Investigation Timeline
        </span>
        <span className="tabular-nums">{events.length} events</span>
      </div>
      {events.length === 0 && (
        <div className="text-center py-8 text-muted-foreground/50">
          <Lock className="size-5 mx-auto mb-2 opacity-40" />
          <p className="text-[11px] font-mono text-muted-foreground/60">No events discovered yet.</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">Discover evidence to reveal timeline events.</p>
        </div>
      )}
      {events.length > 0 && (
        <div className="relative pl-5">
          {/* vertical line */}
          <div className="absolute left-2 top-2 bottom-2 w-px bg-border/60" />
          {events.map((ev, i) => {
            const evd = story?.evidenceCatalog.find((e) => e.evidenceId === ev.evidenceId);
            const cat = evd?.category;
            const catColor = cat
              ? EVIDENCE_CATEGORY_META[cat]?.dot ?? "bg-muted-foreground"
              : "bg-muted-foreground";
            return (
              <div key={ev.id} className="relative mb-3 fade-up">
                <div className={cn("absolute -left-[14px] top-1 size-2 rounded-full border-2 border-background", catColor)} />
                <div className="border border-border/50 bg-black/20 rounded-sm p-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-primary tabular-nums">{ev.time}</span>
                    {cat && (
                      <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60 px-1 py-px border border-border/40 rounded-sm">
                        {cat}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-foreground/90">{ev.label}</div>
                  {ev.description && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground/80 leading-snug">{ev.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {discovered.length > 0 && events.length === 0 && (
        <p className="px-1 text-[10px] text-muted-foreground/50">Tip: query the visits and security_logs tables to reveal timed events.</p>
      )}
    </div>
  );
}
