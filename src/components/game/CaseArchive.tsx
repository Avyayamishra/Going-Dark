"use client";

import { Archive, Lock, ChevronLeft, Volume2, VolumeX, CheckCircle2, Play, Clock } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { STORY_REGISTRY } from "@/stories/registry";
import { LocalStoryAccessProvider } from "@/stories/access";
import { useAudio } from "@/hooks/use-audio";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { StoryMetadata } from "@/stories/types";
import { cn } from "@/lib/utils";

const accessProvider = new LocalStoryAccessProvider();

const DIFFICULTY_LABELS: Record<string, string> = {
  ROOKIE: "ROOKIE",
  DETECTIVE: "DETECTIVE",
  INSPECTOR: "INSPECTOR",
};

export function CaseArchive() {
  const selectStory = useGameStore((s) => s.selectStory);
  const setStage = useGameStore((s) => s.setStage);
  const progress = useGameStore((s) => s.progress);
  const { audioEnabled, toggleAudio, audioVolume, setVolume, play } = useAudio();
  const allStories = STORY_REGISTRY.listAll();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="h-12 shrink-0 border-b border-border/60 bg-card/60 backdrop-blur-sm flex items-center justify-between px-4 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block size-2 rounded-full bg-primary flicker shrink-0" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/90">GOING DARK</span>
          <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider text-muted-foreground">· Case Archive</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              play("click");
              setStage("landing");
            }}
            variant="ghost"
            size="sm"
            className="font-mono text-[11px] uppercase tracking-wider h-8"
          >
            <ChevronLeft className="size-3.5" /> Back
          </Button>
          <button
            onClick={toggleAudio}
            className="inline-flex items-center justify-center size-8 rounded-sm border border-border/60 hover:border-primary/50 hover:text-primary transition-colors"
            aria-label={audioEnabled ? "Mute" : "Unmute"}
          >
            {audioEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          </button>
          {audioEnabled && (
            <div className="hidden lg:flex items-center gap-2 w-24">
              <Slider value={[Math.round(audioVolume * 100)]} max={100} step={1} onValueChange={(v) => setVolume(v[0] / 100)} />
            </div>
          )}
        </div>
      </header>

      {/* Archive content */}
      <div className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-border rounded-sm text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
              <Archive className="size-3.5 text-primary" />
              Investigation Archive
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-glow">
              CASE ARCHIVE
            </h1>
            <p className="mt-3 font-mono text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Select an investigation to begin. Each case is a self-contained SQL murder mystery —
              the database is the crime scene.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allStories.map((meta) => (
              <CaseCard
                key={meta.id}
                meta={meta}
                progress={progress[meta.id]}
                onSelect={() => {
                  if (!accessProvider.canAccessStorySync(meta)) {
                    play("error");
                    return;
                  }
                  play("click");
                  selectStory(meta.id);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-border/60 py-3 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
          <span>Forensic Investigation Suite</span>
          <span>{allStories.length} cases archived</span>
        </div>
      </footer>
    </div>
  );
}

function CaseCard({
  meta,
  progress,
  onSelect,
}: {
  meta: StoryMetadata;
  progress?: { completed?: boolean; started?: boolean; score?: number };
  onSelect: () => void;
}) {
  const accessLabel = accessProvider.accessLabel(meta);
  const canAccess = accessProvider.canAccessStorySync(meta);
  const isComingSoon = meta.accessType === "COMING_SOON";
  const isCompleted = progress?.completed;
  const isInProgress = progress?.started && !progress?.completed;
  const statusLabel = isCompleted ? "COMPLETED" : isInProgress ? "IN PROGRESS" : accessLabel;

  return (
    <div
      className={cn(
        "group relative border rounded-sm overflow-hidden transition-all flex flex-col",
        canAccess
          ? "border-border/60 bg-card/40 hover:border-primary/50 hover:bg-card/60 cursor-pointer"
          : "border-border/40 bg-card/20 opacity-70",
      )}
      onClick={canAccess ? onSelect : undefined}
    >
      {/* Status bar */}
      <div
        className={cn(
          "h-1",
          isCompleted ? "bg-emerald-500" : isInProgress ? "bg-amber-500" : isComingSoon ? "bg-muted-foreground/40" : "bg-primary",
        )}
      />

      <div className="p-4 flex-1 flex flex-col">
        {/* Case number + difficulty */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{meta.caseNumber}</span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 px-1.5 py-0.5 border border-border/40 rounded-sm">
            {DIFFICULTY_LABELS[meta.difficulty]}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-mono text-base font-bold text-foreground leading-tight">{meta.title}</h3>
        <p className="mt-1 font-mono text-[10px] text-primary/70 uppercase tracking-wider">{meta.tagline}</p>

        {/* Description */}
        <p className="mt-2 text-[11px] text-muted-foreground/80 leading-relaxed line-clamp-3 flex-1">{meta.description}</p>

        {/* Meta */}
        <div className="mt-3 space-y-1 text-[10px] font-mono text-muted-foreground/60">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground/40">VICTIM</span>
            <span className="text-foreground/70 truncate">{meta.victim}</span>
          </div>
          {!isComingSoon && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-2.5" />
              <span>{meta.estimatedTime}</span>
            </div>
          )}
        </div>

        {/* Status + action */}
        <div className="mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-1 border rounded-sm",
                isCompleted
                  ? "border-emerald-500/40 text-emerald-500/90 bg-emerald-500/5"
                  : isInProgress
                    ? "border-amber-500/40 text-amber-500/90 bg-amber-500/5"
                    : isComingSoon
                      ? "border-muted-foreground/30 text-muted-foreground/60"
                      : "border-primary/30 text-primary bg-primary/5",
              )}
            >
              {isCompleted && <CheckCircle2 className="size-2.5" />}
              {isInProgress && <Play className="size-2.5" />}
              {!isCompleted && !isInProgress && isComingSoon && <Lock className="size-2.5" />}
              {statusLabel}
            </span>
            {progress?.score !== undefined && progress.score > 0 && (
              <span className="font-mono text-[10px] text-muted-foreground/60 tabular-nums">{progress.score} pts</span>
            )}
          </div>
          {canAccess && !isComingSoon && (
            <div className="mt-2">
              <Button
                size="sm"
                className="w-full font-mono uppercase tracking-wider text-[11px] h-8 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isCompleted ? "Replay" : isInProgress ? "Continue" : "Begin"}
              </Button>
            </div>
          )}
          {isComingSoon && (
            <p className="mt-2 text-[10px] font-mono text-muted-foreground/50 italic">
              {meta.price ? `${meta.price} · ` : ""}Coming soon
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

