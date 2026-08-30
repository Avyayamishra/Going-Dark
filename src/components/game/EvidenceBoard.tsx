"use client";

import { useState } from "react";
import { LayoutGrid, Lock, Fingerprint, Search, Link2, X, Clock, User, FileText } from "lucide-react";
import { useActiveStory, useDiscoveredEvidence } from "@/lib/game/store";
import { EVIDENCE_CATEGORY_META } from "@/stories/evidenceMeta";
import type { EvidenceCatalogItem } from "@/stories/types";
import { cn } from "@/lib/utils";
import { useAudio } from "@/hooks/use-audio";

const CATEGORY_ORDER: EvidenceCatalogItem["category"][] = [
  "MOVEMENT",
  "COMMUNICATION",
  "FINANCIAL",
  "SECURITY",
  "MESSAGE",
  "PHYSICAL",
];

export function EvidenceBoard() {
  const story = useActiveStory();
  const discovered = useDiscoveredEvidence();
  const discoveredIds = new Set(discovered.map((e) => e.evidenceId));
  const [selected, setSelected] = useState<EvidenceCatalogItem | null>(null);
  const { play } = useAudio();
  const evidenceCatalog = story?.evidenceCatalog ?? [];

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
        <span className="flex items-center gap-1.5">
          <LayoutGrid className="size-3 text-primary/70" />
          Evidence Board
        </span>
        <span className="tabular-nums">{discovered.length}/{evidenceCatalog.length}</span>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const meta = EVIDENCE_CATEGORY_META[cat];
        const items = evidenceCatalog.filter((e) => e.category === cat);
        const foundCount = items.filter((e) => discoveredIds.has(e.evidenceId)).length;
        return (
          <div key={cat}>
            <div className="flex items-center gap-1.5 px-1 mb-1">
              <span className={cn("size-1.5 rounded-full", meta.dot)} />
              <span className={cn("text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border rounded-sm", meta.color)}>
                {meta.label}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground/60 tabular-nums ml-auto">{foundCount}/{items.length}</span>
            </div>
            <div className="space-y-1">
              {items.filter((ev) => discoveredIds.has(ev.evidenceId)).map((ev) => {
                const instance = discovered.find((e) => e.evidenceId === ev.evidenceId);
                return (
                  <button
                    key={ev.evidenceId}
                    onClick={() => {
                      play("click");
                      setSelected(ev);
                    }}
                    className="w-full text-left border rounded-sm p-2 transition-colors border-border/60 bg-black/20 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Fingerprint className="size-3 text-primary/70 shrink-0" />
                      <span className="font-mono text-[9px] text-muted-foreground/60">{ev.evidenceId}</span>
                      {ev.accusationDimension && (
                        <span className="ml-auto text-[8px] font-mono uppercase tracking-wider text-primary/60 px-1 border border-primary/30 rounded-sm">
                          {ev.accusationDimension}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-foreground/90">
                      {ev.name}
                    </div>
                    {instance && (
                      <div className="mt-0.5 text-[9px] font-mono text-muted-foreground/50">
                        {new Date(instance.discoveredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </button>
                );
              })}
              {items.filter((ev) => discoveredIds.has(ev.evidenceId)).length === 0 && (
                <p className="text-[10px] text-muted-foreground/40 italic px-1 py-1">No evidence discovered in this category yet.</p>
              )}
            </div>
          </div>
        );
      })}

      {selected && (
        <EvidenceInspector evidence={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function EvidenceInspector({ evidence, onClose }: { evidence: EvidenceCatalogItem; onClose: () => void }) {
  const story = useActiveStory();
  const discovered = useDiscoveredEvidence();
  const evidenceCatalog = story?.evidenceCatalog ?? [];
  const instance = discovered.find((e) => e.evidenceId === evidence.evidenceId);
  const meta = EVIDENCE_CATEGORY_META[evidence.category];
  const related = (evidence.relatedEvidence ?? [])
    .map((id) => evidenceCatalog.find((e) => e.evidenceId === id))
    .filter(Boolean) as EvidenceCatalogItem[];
  const suspect = evidence.relatedSuspect ? story?.suspects.find((s) => s.id === evidence.relatedSuspect) : undefined;
  const { play } = useAudio();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card border border-primary/30 rounded-sm shadow-2xl max-h-[85vh] overflow-auto fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-3 border-b border-border/60">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("size-2 rounded-full shrink-0", meta.dot)} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[9px] text-muted-foreground/60">{evidence.evidenceId}</span>
                <span className={cn("text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border rounded-sm", meta.color)}>
                  {meta.label}
                </span>
              </div>
              <h3 className="font-mono text-sm text-foreground mt-0.5 truncate">{evidence.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="size-6 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent shrink-0">
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3 space-y-3">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-primary mb-1">Description</div>
            <p className="text-xs text-foreground/90 leading-relaxed">{evidence.description}</p>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-primary mb-1">Significance</div>
            <p className="text-xs text-muted-foreground/90 leading-relaxed">{evidence.significance}</p>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <MetaRow icon={FileText} label="Source" value={evidence.source} />
            <MetaRow icon={Clock} label="Found" value={evidence.foundTime} />
            {suspect && <MetaRow icon={User} label="Related suspect" value={`${suspect.name}`} />}
            {instance && (
              <MetaRow icon={Search} label="Discovered" value={new Date(instance.discoveredAt).toLocaleString()} />
            )}
          </div>

          {/* Related evidence */}
          {related.length > 0 && (
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-primary mb-1.5 flex items-center gap-1">
                <Link2 className="size-3" />
                Related Evidence
              </div>
              <div className="space-y-1">
                {related.map((rel) => {
                  const relFound = discovered.some((e) => e.evidenceId === rel.evidenceId);
                  const relMeta = EVIDENCE_CATEGORY_META[rel.category];
                  return (
                    <div
                      key={rel.evidenceId}
                      className={cn(
                        "flex items-center gap-2 border rounded-sm px-2 py-1.5",
                        relFound ? "border-border/60 bg-black/20" : "border-border/30 bg-black/10 opacity-60",
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", relMeta.dot)} />
                      <span className="font-mono text-[9px] text-muted-foreground/60">{rel.evidenceId}</span>
                      <span className={cn("font-mono text-[11px]", relFound ? "text-foreground/80" : "text-muted-foreground/50")}>
                        {relFound ? rel.name : "Undiscovered"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="border border-border/40 bg-black/20 rounded-sm p-1.5">
      <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-muted-foreground/60">
        <Icon className="size-2.5" />
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[10px] text-foreground/80">{value}</div>
    </div>
  );
}
