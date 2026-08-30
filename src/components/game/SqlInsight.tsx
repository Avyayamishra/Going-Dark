"use client";

import { useEffect, useState } from "react";
import { Lightbulb, X, Sparkles } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import type { SqlConcept } from "@/lib/sql/analyzer";

interface InsightPayload {
  concept: SqlConcept;
  title: string;
  body: string;
}

interface SqlInsightProps {
  /** The insight to display, or null to hide. */
  insight: InsightPayload | null;
  /** Called when the insight is dismissed or auto-dismisses. */
  onDismiss: () => void;
}

/**
 * Subtle contextual SQL insight — appears after a successful query that used a
 * new concept. Auto-dismisses after a few seconds; never interrupts the
 * investigation with a modal.
 */
export function SqlInsight({ insight, onDismiss }: SqlInsightProps) {
  const markShown = useGameStore((s) => s.markInsightShown);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!insight) return;
    // Mark the concept as shown (idempotent store update).
    markShown(insight.concept);
    // Reveal on next frame so the CSS transition fires, then auto-dismiss.
    const raf = requestAnimationFrame(() => setVisible(true));
    const dismiss = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 7000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(dismiss);
    };
  }, [insight, markShown, onDismiss]);

  if (!insight) return null;

  return (
    <div
      className={`border border-primary/30 bg-card/80 backdrop-blur-sm rounded-sm shadow-lg transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="flex items-start gap-2 p-2.5">
        <div className="size-6 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="size-3 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-2.5 text-primary/70" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-primary">SQL Insight</span>
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-foreground font-semibold">YOU USED: {insight.title}</div>
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{insight.body}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onDismiss, 200);
          }}
          className="size-5 rounded-sm flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent shrink-0"
          aria-label="Dismiss insight"
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  );
}
