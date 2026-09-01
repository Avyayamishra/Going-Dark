
import { Volume2, VolumeX, Gavel, ChevronLeft, Activity, Award, Check, Lock, ChevronRight, ChevronDown } from "lucide-react";
import { useGameStore, useActiveStory, useDiscoveredEvidence, useScore } from "@/lib/game/store";
import { useAudio } from "@/hooks/use-audio";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ACCUSATION_DIMENSIONS } from "@/stories/evidenceMeta";
import { evaluateAccusation } from "@/lib/sql/client-engine";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export function TopBar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const story = useActiveStory();
  const score = useScore();
  const hintsUsed = useGameStore((s) => (s.activeStoryId ? s.progress[s.activeStoryId]?.hintsUsed ?? 0 : 0));
  const discovered = useDiscoveredEvidence();
  const discoveredCount = discovered.length;
  const setAccusation = useGameStore((s) => s.setAccusation);
  const activeStoryId = useGameStore((s) => s.activeStoryId);
  const exitToArchive = useGameStore((s) => s.exitToArchive);
  const { audioEnabled, toggleAudio, audioVolume, setVolume, play } = useAudio();
  const [accuseOpen, setAccuseOpen] = useState(false);
  // Sequential accusation: Q1 (WHO) → Q2 (HOW) → Q3 (WHY)
  // Each question requires linked evidence.
  const [who, setWho] = useState("");
  const [how, setHow] = useState("");
  const [why, setWhy] = useState("");
  const [whoEvidence, setWhoEvidence] = useState<string[]>([]);
  const [howEvidence, setHowEvidence] = useState<string[]>([]);
  const [whyEvidence, setWhyEvidence] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const evidenceCatalog = story?.evidenceCatalog ?? [];
  const discoveredIds = discovered.map((d) => d.evidenceId);

  // Evidence-coverage gate.
  const coverage = useMemo(() => {
    const dimSet = new Set<string>();
    for (const ev of evidenceCatalog) {
      if (discoveredIds.includes(ev.evidenceId) && ev.accusationDimension) {
        dimSet.add(ev.accusationDimension);
      }
    }
    return ACCUSATION_DIMENSIONS.map((d) => ({ ...d, covered: dimSet.has(d.id) }));
  }, [discoveredIds, evidenceCatalog]);
  const allCovered = coverage.every((c) => c.covered);

  // Sequential gating: Q2 appears only after Q1 is answered, Q3 after Q2.
  const q1Answered = who !== "" && whoEvidence.length > 0;
  const q2Answered = how !== "" && howEvidence.length > 0;
  const q3Answered = why !== "" && whyEvidence.length > 0;
  const canSubmit = q1Answered && q2Answered && q3Answered;

  const resetAccusation = () => {
    setWho(""); setHow(""); setWhy("");
    setWhoEvidence([]); setHowEvidence([]); setWhyEvidence([]);
  };

  const submit = async () => {
    if (!canSubmit) {
      toast({
        title: "Incomplete accusation",
        description: "Answer all three questions and link evidence to each before submitting.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    play("accuse");
    const result = evaluateAccusation(activeStoryId ?? "", who, how, why);
    const allEvidence = [...whoEvidence, ...howEvidence, ...whyEvidence];
    setAccusation({
      who, how, why,
      evidence: allEvidence,
      correct: result.correct,
      correctCount: result.correctCount,
      evidenceCoverage: coverage.filter((c) => c.covered).length,
      submittedAt: Date.now(),
    });
    setAccuseOpen(false);
    resetAccusation();
    if (result.correct) {
      play("solved");
      toast({ title: "Case Closed", description: "Your accusation was correct. Justice is served." });
    } else {
      toast({
        title: "Case theory incomplete",
        description: `The selected evidence does not form a consistent explanation. ${result.correctCount}/3 answers correct — return to the investigation.`,
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  return (
    <header className="h-12 shrink-0 border-b border-border/60 bg-card/60 backdrop-blur-sm flex items-center justify-between px-3 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {onOpenMobileNav && (
          <Button variant="ghost" size="icon" className="size-8 lg:hidden cursor-pointer" onClick={onOpenMobileNav}>
            <ChevronLeft className="size-4 rotate-180" />
          </Button>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block size-2 rounded-full bg-primary flicker shrink-0" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/90 truncate">
            GOING DARK
          </span>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider text-muted-foreground truncate">
            · {story?.metadata.caseNumber} {story?.metadata.title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Stat icon={Activity} label="Evidence" value={discoveredCount} />
        <Stat icon={Award} label="Score" value={score} />
        <span className="hidden md:inline font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Hints: {hintsUsed}
        </span>

        <Button
          onClick={() => {
            play("click");
            exitToArchive();
          }}
          variant="ghost"
          size="sm"
          className="font-mono uppercase tracking-wider text-[11px] h-8 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden sm:inline">Archive</span>
        </Button>

        <Button
          onClick={() => {
            play("click");
            resetAccusation();
            setAccuseOpen(true);
          }}
          variant="outline"
          size="sm"
          className={cn(
            "font-mono uppercase tracking-wider text-[11px] h-8 cursor-pointer",
            allCovered
              ? "border-primary/40 text-primary hover:bg-primary/10"
              : "border-border/60 text-muted-foreground",
          )}
        >
          {allCovered ? <Gavel className="size-3.5" /> : <Lock className="size-3.5" />}
          <span className="hidden sm:inline">Final Accusation</span>
        </Button>

        <button
          onClick={toggleAudio}
          className="inline-flex items-center justify-center size-8 rounded-sm border border-border/60 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
          aria-label={audioEnabled ? "Mute" : "Unmute"}
        >
          {audioEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
        </button>
        {audioEnabled && (
          <div className="hidden lg:flex items-center gap-2 w-28">
            <Slider value={[Math.round(audioVolume * 100)]} max={100} step={1} onValueChange={(v) => setVolume(v[0] / 100)} />
          </div>
        )}
      </div>

      <Dialog open={accuseOpen} onOpenChange={setAccuseOpen}>
        <DialogContent className="max-w-2xl bg-card border-border/80">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase tracking-[0.2em] text-primary">
              Final Accusation
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-muted-foreground">
              Answer each question in sequence. Link evidence to support each answer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-auto pr-1">
            {/* Coverage gate */}
            <div className="border border-border/60 bg-black/20 rounded-sm p-2">
              <div className="text-[9px] font-mono uppercase tracking-widest text-primary mb-1.5">
                Evidence Coverage Required
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {coverage.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 border rounded-sm text-[10px] font-mono",
                      c.covered
                        ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-500/90"
                        : "border-border/40 text-muted-foreground/60",
                    )}
                  >
                    {c.covered ? <Check className="size-2.5" /> : <Lock className="size-2.5" />}
                    <span className="uppercase tracking-wider">{c.label}</span>
                  </div>
                ))}
              </div>
              {!allCovered && (
                <p className="mt-1.5 text-[10px] text-amber-400/70">
                  Gather evidence covering all four dimensions before submitting your accusation.
                </p>
              )}
            </div>

            {/* Q1: WHO — always visible */}
            <SequentialQuestion
              step={1}
              label="WHO killed the victim?"
              value={who}
              onValueChange={setWho}
              options={story?.accusation.whoOptions ?? []}
              evidence={whoEvidence}
              onEvidenceChange={setWhoEvidence}
              discoveredIds={discoveredIds}
              evidenceCatalog={evidenceCatalog}
            />

            {/* Q2: HOW — visible only after Q1 answered */}
            {q1Answered && (
              <SequentialQuestion
                step={2}
                label="HOW was it done?"
                value={how}
                onValueChange={setHow}
                options={story?.accusation.howOptions ?? []}
                evidence={howEvidence}
                onEvidenceChange={setHowEvidence}
                discoveredIds={discoveredIds}
                evidenceCatalog={evidenceCatalog}
              />
            )}

            {/* Q3: WHY — visible only after Q2 answered */}
            {q2Answered && (
              <SequentialQuestion
                step={3}
                label="WHAT WAS THE MOTIVE?"
                value={why}
                onValueChange={setWhy}
                options={story?.accusation.whyOptions ?? []}
                evidence={whyEvidence}
                onEvidenceChange={setWhyEvidence}
                discoveredIds={discoveredIds}
                evidenceCatalog={evidenceCatalog}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAccuseOpen(false)} className="font-mono text-xs uppercase cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={submitting || !canSubmit || !allCovered}
              className="font-mono uppercase tracking-wider text-xs bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              Submit Accusation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-sm border border-border/60 bg-black/20">
      <Icon className="size-3 text-muted-foreground" />
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-mono text-xs text-foreground tabular-nums">{value}</span>
    </div>
  );
}

/** A sequential accusation question with radio options + linked evidence selector. */
function SequentialQuestion({
  step,
  label,
  value,
  onValueChange,
  options,
  evidence,
  onEvidenceChange,
  discoveredIds,
  evidenceCatalog,
}: {
  step: number;
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { id: string; label: string }[];
  evidence: string[];
  onEvidenceChange: (ids: string[]) => void;
  discoveredIds: string[];
  evidenceCatalog: { evidenceId: string; name: string; accusationDimension?: string }[];
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const answered = value !== "" && evidence.length > 0;
  const availableEvidence = evidenceCatalog.filter((e) => discoveredIds.includes(e.evidenceId));

  const toggleEvidence = (id: string) => {
    if (evidence.includes(id)) {
      onEvidenceChange(evidence.filter((x) => x !== id));
    } else {
      onEvidenceChange([...evidence, id]);
    }
  };

  return (
    <div className={cn(
      "border rounded-sm p-3 transition-colors",
      answered ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/60 bg-black/20",
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          "size-5 rounded-sm border flex items-center justify-center font-mono text-[10px] font-bold shrink-0",
          answered ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10" : "border-primary/40 text-primary bg-primary/10",
        )}>
          {answered ? <Check className="size-3" /> : step}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">{label}</span>
        {answered && <span className="ml-auto text-[9px] font-mono text-emerald-500/70 uppercase">answered</span>}
      </div>

      <RadioGroup value={value} onValueChange={onValueChange} className="space-y-1.5">
        {options.map((o) => (
          <div
            key={o.id}
            className={cn(
              "flex items-start gap-2 p-2 rounded-sm border transition-colors cursor-pointer",
              value === o.id
                ? "border-primary/50 bg-primary/10"
                : "border-border/50 hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            <RadioGroupItem value={o.id} id={`q${step}-${o.id}`} className="mt-0.5 border-primary/50" />
            <Label htmlFor={`q${step}-${o.id}`} className="text-xs font-mono text-foreground/90 leading-relaxed cursor-pointer">
              {o.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Evidence linking */}
      <div className="mt-2 pt-2 border-t border-border/40">
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-primary/70 hover:text-primary cursor-pointer"
        >
          {showEvidence ? <ChevronDown className="size-2.5" /> : <ChevronRight className="size-2.5" />}
          Link Evidence ({evidence.length} selected)
        </button>
        {showEvidence && (
          <div className="mt-1.5 space-y-1 max-h-32 overflow-auto">
            {availableEvidence.length === 0 && (
              <p className="text-[11px] text-muted-foreground/50 italic">No evidence discovered yet.</p>
            )}
            {availableEvidence.map((ev) => {
              const checked = evidence.includes(ev.evidenceId);
              return (
                <button
                  key={ev.evidenceId}
                  onClick={() => toggleEvidence(ev.evidenceId)}
                  className={cn(
                    "w-full flex items-start gap-2 p-1.5 rounded-sm border text-left transition-colors cursor-pointer",
                    checked ? "border-primary/50 bg-primary/10" : "border-border/50 hover:border-primary/30",
                  )}
                >
                  <div className={cn(
                    "size-3.5 rounded-sm border flex items-center justify-center shrink-0 mt-0.5",
                    checked ? "bg-primary border-primary" : "border-border/60",
                  )}>
                    {checked && <Check className="size-2.5 text-primary-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-mono text-[9px] text-muted-foreground/60">{ev.evidenceId}</span>
                    {ev.accusationDimension && (
                      <span className="ml-1.5 text-[8px] font-mono uppercase tracking-wider text-primary/60 px-1 border border-primary/30 rounded-sm">
                        {ev.accusationDimension}
                      </span>
                    )}
                    <span className="block font-mono text-[10px] text-foreground/80">{ev.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {value !== "" && evidence.length === 0 && (
          <p className="mt-1 text-[10px] text-amber-400/70">Link at least one piece of evidence to support your answer.</p>
        )}
      </div>
    </div>
  );
}
