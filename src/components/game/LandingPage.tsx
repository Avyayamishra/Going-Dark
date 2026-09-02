
import { useEffect, useState } from "react";
import { ShieldAlert, Terminal, Database, Volume2, VolumeX } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { STORY_REGISTRY } from "@/stories/registry";
import { useAudio } from "@/hooks/use-audio";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function LandingPage() {
  const setStage = useGameStore((s) => s.setStage);
  const { audioEnabled, toggleAudio, audioVolume, setVolume, play } = useAudio();
  const [mounted, setMounted] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const lines = [
      "[ok] forensic terminal kernel loaded",
      "[ok] nexora systems db replica mounted (read-only)",
      "[ok] evidence vault synchronized",
      "[ok] case #001 manifest acquired",
      "[ok] awaiting investigator credentials...",
    ];
    let i = 0;
    const id = setInterval(() => {
      if (i < lines.length) {
        setBootLines((b) => [...b, lines[i]]);
        i++;
      } else {
        clearInterval(id);
      }
    }, 280);
    return () => clearInterval(id);
  }, []);

  const begin = () => {
    play("click");
    setStage("archive");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top status bar */}
      <header className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-primary flicker" />
            <span>FORENSIC TERMINAL — v1.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">SECURE CHANNEL</span>
            <span className="text-primary">● LIVE</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-3xl text-center fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border rounded-sm text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-8">
            <ShieldAlert className="size-3.5 text-primary" />
            Confidential Investigation
          </div>

          <h1 className="font-mono text-5xl sm:text-7xl font-bold tracking-tight text-foreground leading-[1.05] text-glow">
            GOING
            <br />
            DARK
          </h1>

          <p className="mt-5 font-mono text-sm sm:text-base uppercase tracking-[0.35em] text-primary">
            Case Archive
          </p>
          <p className="mt-1 font-mono text-lg sm:text-xl uppercase tracking-[0.2em] text-foreground/90">
            {STORY_REGISTRY.listAll().length} investigations available
          </p>

          <p className="mt-8 font-mono text-xs sm:text-sm text-muted-foreground tracking-wide max-w-xl mx-auto leading-relaxed">
            THE DATABASE IS THE CRIME SCENE.
          </p>

          {/* Case facts grid */}
          {(() => {
            const all = STORY_REGISTRY.listAll();
            const freeCases = all.filter((m) => m.accessType === "FREE").length;
            const upcoming = all.filter((m) => m.accessType === "COMING_SOON").length;
            const totalTables = STORY_REGISTRY.listPlayable().reduce(
              (sum, s) => sum + (s.database.schema?.length ?? s.database.tables.length),
              0,
            );
            const totalRecords = STORY_REGISTRY.listPlayable().reduce(
              (sum, s) => sum + s.database.tables.reduce((rs, t) => rs + t.rows.length, 0),
              0,
            );
            return (
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-border/60 border border-border/60 rounded-sm overflow-hidden text-left">
                <Fact label="Archive Status" value="ACTIVE" highlight />
                <Fact label="Free Cases" value={`${freeCases}`} />
                <Fact label="Upcoming" value={`${upcoming}`} />
                <Fact label="Total Cases" value={`${all.length}`} />
                <div className="col-span-2 md:col-span-4 bg-card/60 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  <span>{totalTables} tables across playable cases</span>
                  <span>{totalRecords} records available</span>
                </div>
              </div>
            );
          })()}

          {/* Boot log */}
          <div className="mt-8 text-left mx-auto max-w-xl border border-border/60 bg-black/30 rounded-sm p-3 font-mono text-[11px] leading-relaxed text-muted-foreground min-h-[124px]">
            {mounted && bootLines.length === 0 && (
              <span className="text-primary">›</span>
            )}
            {bootLines.filter((l): l is string => typeof l === "string").map((l, i) => (
              <div key={i} className="fade-up">
                <span className={l.startsWith("[ok]") ? "text-emerald-400/80" : "text-foreground/70"}>
                  {l.split("]")[0]}]
                </span>
                <span className="text-muted-foreground">{l.split("]").slice(1).join("]")}</span>
              </div>
            ))}
            {bootLines.length >= 5 && (
              <div className="text-primary caret">investigator@terminal</div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={begin}
              size="lg"
              className="font-mono uppercase tracking-[0.2em] text-sm h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_24px_-6px] shadow-primary/50"
            >
              <Terminal className="size-4" />
              Enter Case Archive
            </Button>
          </div>

          {/* Audio control */}
          <div className="mt-10 flex items-center justify-center gap-3 text-xs font-mono text-muted-foreground">
            <button
              onClick={toggleAudio}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-sm hover:border-primary/60 hover:text-foreground transition-colors"
              aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
            >
              {audioEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
              {audioEnabled ? "AUDIO ON" : "AUDIO OFF"}
            </button>
            {audioEnabled && (
              <div className="flex items-center gap-2 w-40">
                <Slider
                  value={[Math.round(audioVolume * 100)]}
                  max={100}
                  step={1}
                  onValueChange={(v) => setVolume(v[0] / 100)}
                  className="flex-1"
                />
                <span className="tabular-nums w-8 text-right">{Math.round(audioVolume * 100)}</span>
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
            <Database className="size-3" />
            <span>read-only replica · client-side sql.js engine</span>
          </div>
        </div>
      </div>

      <footer className="border-t border-border/60 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
          <span>Forensic Investigation Suite</span>
          <span>Evidence integrity: verified</span>
        </div>
      </footer>
    </div>
  );
}

function Fact({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-card/60 p-3 sm:p-4">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-sm sm:text-base ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
