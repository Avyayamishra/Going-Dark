
import { Clock, CheckCircle2, XCircle, Trash2, RotateCw } from "lucide-react";
import { useGameStore, useQueryHistory } from "@/lib/game/store";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/hooks/use-audio";

interface QueryHistoryProps {
  onRestore?: (sql: string) => void;
}

export function QueryHistory({ onRestore }: QueryHistoryProps) {
  const history = useQueryHistory();
  const clearHistory = useGameStore((s) => s.clearHistory);
  const { play } = useAudio();

  return (
    <div className="flex flex-col h-full min-h-0">
      {history.length > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/60">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {history.length} queries
          </span>
          <Button
            onClick={() => {
              play("click");
              clearHistory();
            }}
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label="Clear history"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto p-1.5 space-y-1">
        {history.length === 0 && (
          <div className="text-center py-8 text-muted-foreground/50">
            <Clock className="size-5 mx-auto mb-2 opacity-40" />
            <p className="text-[11px] font-mono text-muted-foreground/60">No queries executed yet.</p>
          </div>
        )}
        {history.map((h) => (
          <button
            key={h.id}
            onClick={() => {
              if (onRestore) {
                play("click");
                onRestore(h.sql);
              }
            }}
            className="group w-full text-left border border-border/50 bg-black/20 hover:border-primary/40 hover:bg-primary/5 rounded-sm p-2 transition-colors"
          >
            <div className="flex items-center justify-between gap-1.5">
              {h.ok ? (
                <CheckCircle2 className="size-3 text-emerald-500/80 shrink-0" />
              ) : (
                <XCircle className="size-3 text-primary shrink-0" />
              )}
              <span className="font-mono text-[9px] text-muted-foreground/60 ml-auto tabular-nums">
                {h.durationMs}ms
              </span>
              {onRestore && (
                <RotateCw className="size-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <pre className="mt-1 font-mono text-[10px] text-foreground/80 whitespace-pre-wrap break-words leading-snug line-clamp-3">
              {h.sql}
            </pre>
            <div className="mt-1 flex items-center gap-2 text-[9px] font-mono text-muted-foreground/50">
              <span>{new Date(h.executedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
              <span>·</span>
              {h.ok ? <span>{h.rowCount} records</span> : <span className="text-primary">{h.errorTitle}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
