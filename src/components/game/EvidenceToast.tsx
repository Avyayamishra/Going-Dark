
import { useEffect, useState } from "react";
import { Fingerprint, X, Plus } from "lucide-react";

export interface EvidenceNotification {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
}

interface EvidenceToastProps {
  evidence: EvidenceNotification | null;
  onDismiss: () => void;
}

/**
 * Cinematic "NEW EVIDENCE DISCOVERED" notification. Appears briefly, then
 * auto-dismisses. Does NOT identify the murderer — just announces the clue.
 */
export function EvidenceToast({ evidence, onDismiss }: EvidenceToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!evidence) return;
    // Reveal on next frame so the CSS transition fires, then auto-dismiss.
    const raf = requestAnimationFrame(() => setVisible(true));
    const dismiss = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 5500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(dismiss);
    };
  }, [evidence, onDismiss]);

  if (!evidence) return null;

  return (
    <div
      className={`pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,420px)] transition-all duration-400 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="pointer-events-auto border border-primary/50 bg-card/95 backdrop-blur-md rounded-sm shadow-[0_0_32px_-8px] shadow-primary/40 overflow-hidden">
        {/* top accent bar */}
        <div className="h-0.5 bg-primary animate-[scan_1.5s_ease-out]" />
        <div className="p-3">
          <div className="flex items-start gap-2.5">
            <div className="size-8 rounded-sm border border-primary/40 bg-primary/10 flex items-center justify-center shrink-0">
              <Fingerprint className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-primary">New Evidence Discovered</span>
              </div>
              <div className="mt-0.5 font-mono text-sm text-foreground font-semibold leading-tight">
                {evidence.name}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug line-clamp-2">{evidence.description}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-primary/70 px-1.5 py-0.5 border border-primary/30 rounded-sm">
                  {evidence.category}
                </span>
                <span className="text-[10px] font-mono text-emerald-500/80 inline-flex items-center gap-0.5">
                  <Plus className="size-2.5" />
                  {evidence.points}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(onDismiss, 200);
              }}
              className="size-5 rounded-sm flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent shrink-0"
              aria-label="Dismiss"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
