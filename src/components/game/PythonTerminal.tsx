
import { useRef, useCallback, useState } from "react";
import { Play, Trash2, Loader2, Keyboard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePython } from "@/hooks/use-python";
import type { PythonResult } from "@/lib/python/engine";
import { isPythonReady } from "@/lib/python/engine";
import { useAudio } from "@/hooks/use-audio";

interface PythonTerminalProps {
  value: string;
  onChange: (v: string) => void;
  onResult: (result: PythonResult) => void;
  onRunningChange?: (running: boolean) => void;
}

export function PythonTerminal({ value, onChange, onResult, onRunningChange }: PythonTerminalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const runningRef = useRef(false);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const { runPython, preload } = usePython();
  const { play } = useAudio();

  const runInternal = useCallback(async () => {
    if (runningRef.current) return;
    const code = value;
    if (!code.trim()) {
      play("error");
      onResult({
        ok: false,
        error: {
          kind: "EMPTY",
          title: "EMPTY SCRIPT",
          message: "The Python terminal is empty. Write some code and run it again.",
          hint: "Tip: try print(len(passengers))",
        },
        executionTimeMs: 0,
      });
      return;
    }

    runningRef.current = true;
    setRunning(true);
    onRunningChange?.(true);

    // First-time load: spin up Pyodide, surface a loading indicator.
    if (!isPythonReady()) {
      setLoading(true);
      try {
        await preload();
      } catch {
        /* executePython will surface a LOAD_ERROR */
      } finally {
        setLoading(false);
      }
    }

    const result = await runPython(code);
    runningRef.current = false;
    setRunning(false);
    onRunningChange?.(false);
    onResult(result);
  }, [value, runPython, preload, onResult, play, onRunningChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void runInternal();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60 bg-card/40">
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => void runInternal()}
            disabled={running || loading}
            size="sm"
            className="font-mono uppercase tracking-wider text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {running || loading ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            Run
          </Button>
          <Button
            onClick={() => { play("click"); onChange(""); }}
            variant="outline"
            size="sm"
            className="font-mono uppercase tracking-wider text-xs h-8 cursor-pointer"
          >
            <Trash2 className="size-3.5" />
            Clear
          </Button>
          {loading && (
            <span className="ml-1 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-400/80">
              <Loader2 className="size-3 animate-spin" />
              Loading Python runtime…
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <span className="hidden sm:inline-flex items-center gap-1">
            <Keyboard className="size-3" />
            Ctrl + Enter
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            Pyodide
          </span>
          <span className="inline-flex items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary/90">
            PYTHON
          </span>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 min-h-0 bg-black/20 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          placeholder={"# Write Python to analyse the case data...\n# Available: passengers, tickets, cctv_metadata, train_sensors, ...\nfor p in passengers:\n    print(p[\"name\"])"}
          className="w-full h-full bg-transparent text-foreground/90 font-mono text-[13px] leading-5 p-3 resize-none outline-none border-none placeholder:text-muted-foreground/30"
          style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
        />
      </div>
    </div>
  );
}
