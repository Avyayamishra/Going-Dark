
import { useRef, useCallback, useState } from "react";
import { Play, Trash2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSqlQuery } from "@/hooks/use-sql-query";
import type { QueryResult } from "@/lib/sql/client-engine";
import { useAudio } from "@/hooks/use-audio";

interface SearchTerminalProps {
  value: string;
  onChange: (v: string) => void;
  onResult: (result: QueryResult) => void;
  onRunningChange?: (running: boolean) => void;
}

export function SearchTerminal({ value, onChange, onResult, onRunningChange }: SearchTerminalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const runningRef = useRef(false);
  const [running, setRunning] = useState(false);
  const { runQuery } = useSqlQuery();
  const { play } = useAudio();

  const runInternal = useCallback(async () => {
    if (runningRef.current) return;
    const sql = value;
    if (!sql.trim()) {
      play("error");
      onResult({
        ok: false,
        error: {
          kind: "EMPTY_QUERY",
          title: "EMPTY SEARCH",
          message: "The search terminal is empty. Enter a search command and run it.",
          hint: "Tip: try SELECT * FROM suspects;",
        },
        executionTimeMs: 0,
      });
      return;
    }
    runningRef.current = true;
    setRunning(true);
    onRunningChange?.(true);
    const result = await runQuery(sql);
    runningRef.current = false;
    setRunning(false);
    onRunningChange?.(false);
    onResult(result);
  }, [value, runQuery, onResult, play, onRunningChange]);

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
            disabled={running}
            size="sm"
            className="font-mono uppercase tracking-wider text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            Search
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
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <span className="hidden sm:inline">Ctrl + Enter</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            Records DB
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
          placeholder="Enter a search command...&#10;e.g. SELECT * FROM suspects;"
          className="w-full h-full bg-transparent text-foreground/90 font-mono text-[13px] leading-5 p-3 resize-none outline-none border-none placeholder:text-muted-foreground/30"
          style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
        />
      </div>
    </div>
  );
}
