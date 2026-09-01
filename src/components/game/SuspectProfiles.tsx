
import { useState } from "react";
import { UserCircle, Fingerprint, StickyNote, X } from "lucide-react";
import { useActiveStory, useDiscoveredEvidence, useNotes } from "@/lib/game/store";
import { EVIDENCE_CATEGORY_META } from "@/stories/evidenceMeta";
import type { SuspectInfo, EvidenceCatalogItem } from "@/stories/types";
import type { DiscoveredEvidence, InvestigationNote } from "@/types";
import { cn } from "@/lib/utils";
import { useAudio } from "@/hooks/use-audio";

export function SuspectProfiles() {
  const story = useActiveStory();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { play } = useAudio();
  const discovered = useDiscoveredEvidence();
  const notes = useNotes();
  const suspects = story?.suspects ?? [];
  const evidenceCatalog = story?.evidenceCatalog ?? [];

  const selected = suspects.find((s) => s.id === selectedId);

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-1">
        <span className="flex items-center gap-1.5">
          <UserCircle className="size-3 text-primary/70" />
          Suspect Profiles
        </span>
        <span className="tabular-nums">{suspects.length}</span>
      </div>
      <div className="space-y-1.5">
        {suspects.map((s) => {
          const evCount = discovered.filter((e) => {
            const cat = evidenceCatalog.find((c) => c.evidenceId === e.evidenceId);
            return cat?.relatedSuspect === s.id;
          }).length;
          const noteCount = notes.filter((n) => n.text.toUpperCase().includes(s.name.split(" ")[0].toUpperCase())).length;
          return (
            <button
              key={s.id}
              onClick={() => {
                play("click");
                setSelectedId(s.id);
              }}
              className="w-full text-left border border-border/60 bg-black/20 hover:border-primary/40 hover:bg-primary/5 rounded-sm p-2 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-sm border border-border/60 bg-card/60 flex items-center justify-center shrink-0">
                  <UserCircle className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-foreground truncate">{s.name}</span>
                    <span className="font-mono text-[9px] text-muted-foreground/50">{s.id}</span>
                  </div>
                  <div className="font-mono text-[10px] text-primary truncate">{s.role}</div>
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[9px] font-mono text-muted-foreground/60">
                <span className="inline-flex items-center gap-0.5">
                  <Fingerprint className="size-2.5" />
                  {evCount} evidence
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-0.5">
                  <StickyNote className="size-2.5" />
                  {noteCount} notes
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <SuspectDetail
          suspect={selected}
          discovered={discovered}
          notes={notes}
          evidenceCatalog={evidenceCatalog}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function SuspectDetail({
  suspect,
  discovered,
  notes,
  evidenceCatalog,
  onClose,
}: {
  suspect: SuspectInfo;
  discovered: DiscoveredEvidence[];
  notes: InvestigationNote[];
  evidenceCatalog: EvidenceCatalogItem[];
  onClose: () => void;
}) {
  // Evidence related to this suspect.
  const suspectEvidence = evidenceCatalog.filter((e) => e.relatedSuspect === suspect.id);
  const discoveredSuspectEvidence = suspectEvidence.filter((e) =>
    discovered.some((d) => d.evidenceId === e.evidenceId),
  );
  // Notes that mention this suspect's first name.
  const suspectNotes = notes.filter((n) =>
    n.text.toUpperCase().includes(suspect.name.split(" ")[0].toUpperCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card border border-primary/30 rounded-sm shadow-2xl max-h-[85vh] overflow-auto fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-3 border-b border-border/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-9 rounded-sm border border-border/60 bg-card/60 flex items-center justify-center shrink-0">
              <UserCircle className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[9px] text-muted-foreground/60">{suspect.id}</div>
              <h3 className="font-mono text-sm text-foreground">{suspect.name}</h3>
              <div className="font-mono text-[10px] text-primary">{suspect.role} · {suspect.department}</div>
            </div>
          </div>
          <button onClick={onClose} className="size-6 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-3 space-y-3">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-primary mb-1">Known Information</div>
            <p className="text-xs text-foreground/90 leading-relaxed">{suspect.shortBio}</p>
          </div>

          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-primary mb-1.5 flex items-center gap-1">
              <Fingerprint className="size-3" />
              Discovered Evidence ({discoveredSuspectEvidence.length}/{suspectEvidence.length})
            </div>
            {discoveredSuspectEvidence.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/50 italic">No evidence linked to this suspect yet.</p>
            ) : (
              <div className="space-y-1">
                {discoveredSuspectEvidence.map((ev) => {
                  const meta = EVIDENCE_CATEGORY_META[ev.category];
                  return (
                    <div key={ev.evidenceId} className="flex items-center gap-2 border border-border/50 bg-black/20 rounded-sm px-2 py-1.5">
                      <span className={cn("size-1.5 rounded-full", meta?.dot ?? "bg-muted-foreground")} />
                      <span className="font-mono text-[9px] text-muted-foreground/60">{ev.evidenceId}</span>
                      <span className="font-mono text-[11px] text-foreground/80">{ev.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-primary mb-1.5 flex items-center gap-1">
              <StickyNote className="size-3" />
              Your Notes ({suspectNotes.length})
            </div>
            {suspectNotes.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/50 italic">No notes about this suspect yet.</p>
            ) : (
              <div className="space-y-1">
                {suspectNotes.map((n) => (
                  <div key={n.id} className="border border-border/50 bg-black/20 rounded-sm px-2 py-1.5">
                    <p className="text-[11px] text-foreground/80 leading-snug whitespace-pre-wrap">{stripTag(n.text)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function stripTag(text: string): string {
  return text.replace(/^\[([A-Z,]+)\]\s*/, "");
}
