"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Award, RotateCcw, FileCheck2, Fingerprint, GraduationCap, Archive } from "lucide-react";
import { useGameStore, useActiveStory, useAccusation, useDiscoveredEvidence, useQueryHistory, useLearnedConcepts } from "@/lib/game/store";
import { useAudio } from "@/hooks/use-audio";
import { Button } from "@/components/ui/button";
import { CONCEPT_META, type SqlConcept } from "@/lib/sql/analyzer";

export function CaseComplete() {
  const story = useActiveStory();
  const accusation = useAccusation();
  const discovered = useDiscoveredEvidence();
  const queryHistory = useQueryHistory();
  const score = useGameStore((s) => (s.activeStoryId ? s.progress[s.activeStoryId]?.score ?? 0 : 0));
  const learnedConcepts = useLearnedConcepts();
  const reset = useGameStore((s) => s.resetActiveStory);
  const exitToArchive = useGameStore((s) => s.exitToArchive);
  const { play } = useAudio();
  const [show, setShow] = useState(false);

  const learnedConceptsList = (learnedConcepts as SqlConcept[]).filter((c) =>
    CONCEPT_META.some((m) => m.id === c),
  );

  useEffect(() => {
    play("solved");
    const id = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(id);
  }, [play]);

  if (!accusation || !story) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
        No accusation on record.
      </div>
    );
  }

  const meta = story.metadata;
  const whoOpt = story.accusation.whoOptions.find((o) => o.id === accusation.who);
  const howOpt = story.accusation.howOptions.find((o) => o.id === accusation.how);
  const whyOpt = story.accusation.whyOptions.find((o) => o.id === accusation.why);
  const correctWho = story.accusation.whoOptions.find((o) => o.id === story.solution.who);
  const correctHow = story.accusation.howOptions.find((o) => o.id === story.solution.how);
  const correctWhy = story.accusation.whyOptions.find((o) => o.id === story.solution.why);

  const stats = [
    { label: "Evidence Collected", value: `${discovered.length}/${story.evidenceCatalog.length}` },
    { label: "Queries Executed", value: queryHistory.length },
    { label: "Final Score", value: score },
  ];

  return (
    <div className="min-h-screen flex flex-col forensic-bg">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileCheck2 className="size-3.5 text-primary" />
            Case File — {meta.caseNumber}
          </div>
          <div className="text-primary">{accusation.correct ? "● CLOSED" : "● REOPENED"}</div>
        </div>
      </header>

      <div className="flex-1 px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-2xl mx-auto">
          <div className={`text-center transition-all duration-700 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="inline-flex items-center justify-center size-16 rounded-full border-2 border-primary/40 bg-primary/10 mb-6">
              {accusation.correct ? (
                <CheckCircle2 className="size-8 text-primary" />
              ) : (
                <XCircle className="size-8 text-primary" />
              )}
            </div>
            <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary">
              {accusation.correct ? "Case Closed" : "Accusation Rejected"}
            </div>
            <h1 className="mt-2 font-mono text-3xl sm:text-4xl font-bold tracking-tight">
              {accusation.correct ? "THE ARCHIVE SPEAKS" : "THE EVIDENCE DISAGREES"}
            </h1>
            <p className="mt-4 font-mono text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {accusation.correct
                ? "Your accusation matched the record. Justice is served."
                : `The board rejected your conclusion — ${accusation.correctCount} of 3 answers were correct. Return to the database and re-examine the evidence.`}
            </p>
          </div>

          {/* Accusation breakdown */}
          <div className="mt-10 border border-border/60 rounded-sm divide-y divide-border/60 bg-black/20">
            <AccusationRow
              label="WHO killed the victim?"
              submitted={whoOpt?.label}
              correct={accusation.who === story.solution.who}
              correctAnswer={correctWho?.label}
            />
            <AccusationRow
              label="HOW was it done?"
              submitted={howOpt?.label}
              correct={accusation.how === story.solution.how}
              correctAnswer={accusation.correct ? undefined : correctHow?.label}
            />
            <AccusationRow
              label="WHY?"
              submitted={whyOpt?.label}
              correct={accusation.why === story.solution.why}
              correctAnswer={accusation.correct ? undefined : correctWhy?.label}
            />
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/60 border border-border/60 rounded-sm overflow-hidden">
            {stats.map((s) => (
              <div key={s.label} className="bg-card/60 p-3 text-center">
                <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="mt-1 font-mono text-xl text-foreground tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>

          {/* The true narrative (only when correct) */}
          {accusation.correct && (
            <div className="mt-8 border-l-2 border-primary/50 pl-4 fade-up">
              <div className="flex items-center gap-2">
                <Fingerprint className="size-4 text-primary" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">
                  Case Reconstruction
                </span>
              </div>
              <div className="mt-2 space-y-3">
                {story.solution.reconstruction.map((para, i) => (
                  <p key={i} className="text-sm text-foreground/90 leading-relaxed">{para}</p>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                The database never forgets.
              </p>
            </div>
          )}

          {/* Educational summary */}
          {accusation.correct && (
            <div className="mt-8 border border-primary/30 bg-card/40 rounded-sm p-5 fade-up">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">What You Learned</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                You used these SQL concepts over the course of the investigation:
              </p>
              <div className="mt-3 space-y-1.5">
                {learnedConceptsList.map((c) => {
                  const meta = CONCEPT_META.find((m) => m.id === c);
                  return (
                    <div key={c} className="flex items-start gap-2 border border-border/40 bg-black/20 rounded-sm px-2 py-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-primary px-1.5 border border-primary/30 rounded-sm shrink-0 mt-0.5">
                        {meta?.label ?? c}
                      </span>
                      <span className="text-[11px] text-muted-foreground/90 leading-snug">
                        {meta?.hint ?? ""}
                      </span>
                    </div>
                  );
                })}
                {learnedConceptsList.length === 0 && (
                  <p className="text-[11px] text-muted-foreground/50 italic">No concepts tracked yet.</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-border/40">
                <p className="text-sm font-mono text-foreground/90 italic leading-relaxed">
                  "You didn't learn SQL so you could play the game.
                  <br />
                  You learned SQL because you needed it to solve the murder."
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            {accusation.correct ? (
              <>
                <Button
                  onClick={() => {
                    play("click");
                    exitToArchive();
                  }}
                  size="lg"
                  className="font-mono uppercase tracking-[0.2em] text-sm h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Archive className="size-4" />
                  Return to Case Archive
                </Button>
                <Button
                  onClick={() => {
                    play("click");
                    reset();
                  }}
                  variant="outline"
                  size="lg"
                  className="font-mono uppercase tracking-[0.2em] text-sm h-12 px-8"
                >
                  <RotateCcw className="size-4" />
                  Replay Case
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    play("click");
                    useGameStore.getState().setStage("investigation");
                  }}
                  size="lg"
                  className="font-mono uppercase tracking-[0.2em] text-sm h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Award className="size-4" />
                  Return to Database
                </Button>
                <Button
                  onClick={() => {
                    play("click");
                    exitToArchive();
                  }}
                  variant="outline"
                  size="lg"
                  className="font-mono uppercase tracking-[0.2em] text-sm h-12 px-8"
                >
                  <Archive className="size-4" />
                  Case Archive
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-border/60 py-3 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
          <span>Case {CASE.caseNumber} — {CASE.title}</span>
          <span>{accusation.correct ? "SOLVED" : "UNSOLVED"}</span>
        </div>
      </footer>
    </div>
  );
}

function AccusationRow({
  label,
  submitted,
  correct,
  correctAnswer,
}: {
  label: string;
  submitted?: string;
  correct: boolean;
  correctAnswer?: string;
}) {
  return (
    <div className="p-4 flex items-start gap-3">
      {correct ? (
        <CheckCircle2 className="size-5 text-emerald-500/80 mt-0.5 shrink-0" />
      ) : (
        <XCircle className="size-5 text-primary mt-0.5 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        <div className={`mt-0.5 text-sm font-mono ${correct ? "text-foreground" : "text-foreground/80"}`}>
          {submitted ?? "— No answer —"}
        </div>
        {!correct && correctAnswer && (
          <div className="mt-1 text-xs text-muted-foreground">
            <span className="text-primary">Correct:</span> {correctAnswer}
          </div>
        )}
      </div>
    </div>
  );
}
