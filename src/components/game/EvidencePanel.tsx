"use client";

import { Fingerprint, ScrollText } from "lucide-react";
import { useActiveStory, useDiscoveredEvidence } from "@/lib/game/store";
import { cn } from "@/lib/utils";

export function EvidencePanel() {
  const story = useActiveStory();
  const discovered = useDiscoveredEvidence();
  const catalog = story?.evidenceCatalog ?? [];
  // Only show discovered evidence — undiscovered items are hidden.
  const discoveredCatalog = catalog.filter((ev) =>
    discovered.some((d) => d.evidenceId === ev.evidenceId),
  );

  return (
    <div className="p-2 space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
        <span>Collected Evidence</span>
        <span className="tabular-nums text-foreground">{discovered.length}/{catalog.length}</span>
      </div>
      {discoveredCatalog.length === 0 && (
        <div className="text-center py-8 text-muted-foreground/50">
          <Fingerprint className="size-5 mx-auto mb-2 opacity-40" />
          <p className="text-[11px] font-mono text-muted-foreground/60">No evidence discovered yet.</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">Run SQL queries and click result rows to find evidence.</p>
        </div>
      )}
      {discoveredCatalog.map((ev) => {
        const instance = discovered.find((e) => e.evidenceId === ev.evidenceId);
        return (
          <div
            key={ev.evidenceId}
            className="border border-primary/40 bg-primary/5 rounded-sm p-2 transition-colors"
          >
            <div className="flex items-start gap-2">
              <div className="size-6 rounded-sm border border-primary/50 bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Fingerprint className="size-3 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground/70">{ev.evidenceId}</span>
                  {ev.category && (
                    <span className="font-mono text-[9px] uppercase px-1 py-px rounded-sm bg-card border border-border/60 text-muted-foreground">
                      {ev.category}
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs mt-0.5 text-foreground">
                  {ev.name}
                </div>
                <p className="text-[10px] text-muted-foreground/90 leading-snug mt-1">{ev.description}</p>
                <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-primary">
                  <ScrollText className="size-2.5" />
                  {ev.significance.length > 60 ? ev.significance.slice(0, 60) + "…" : ev.significance}
                </div>
                {instance?.triggerQuery && (
                  <div className="mt-1 font-mono text-[9px] text-muted-foreground/50 truncate" title={instance.triggerQuery}>
                    via: {instance.triggerQuery.replace(/\s+/g, " ").slice(0, 40)}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Suppress unused import.
void cn;
