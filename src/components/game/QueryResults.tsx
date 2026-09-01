
import { useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertOctagon, Copy, Check, Clock, Database, SearchX, Fingerprint } from "lucide-react";
import type { QueryResult } from "@/lib/sql/client-engine";
import type { EvidenceTriggerContext, EvidenceTrigger } from "@/stories/types";
import { useActiveStory, useDiscoveredEvidence, useGameStore } from "@/lib/game/store";
import { useAudio } from "@/hooks/use-audio";
import { Button } from "@/components/ui/button";

interface QueryResultsProps {
  result: QueryResult | null;
  running: boolean;
}

export function QueryResults({ result, running }: QueryResultsProps) {
  const { play } = useAudio();

  if (running) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16 text-muted-foreground">
        <Database className="size-8 text-primary animate-pulse" />
        <div className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">Searching records…</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16 text-muted-foreground">
        <Database className="size-8 text-muted-foreground/40" />
        <div className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">No records searched</div>
        <div className="mt-1 text-[11px] font-mono text-muted-foreground/70 max-w-sm">
          Use the search terminal to query the investigation records. Results will appear here.
        </div>
        <div className="mt-4 font-mono text-[11px] text-muted-foreground/60 border border-border/60 rounded-sm px-3 py-2 bg-black/20">
          <span className="text-primary">›</span> SELECT * FROM suspects;
        </div>
      </div>
    );
  }

  if (!result.ok) return <ErrorState result={result} />;
  return <SuccessState result={result} onCopy={() => play("click")} />;
}

function ErrorState({ result }: { result: Extract<QueryResult, { ok: false }> }) {
  const { error } = result;
  const isUnsafe = error.kind === "UNSAFE_QUERY" || error.kind === "UNSUPPORTED";
  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="max-w-xl fade-up">
        <div className="flex items-center gap-2">
          {isUnsafe ? <AlertOctagon className="size-5 text-primary" /> : <XCircle className="size-5 text-primary" />}
          <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-primary">{error.title}</h3>
        </div>
        <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{error.message}</p>
        {error.hint && (
          <div className="mt-4 border-l-2 border-primary/40 bg-primary/5 pl-3 py-2 pr-3 rounded-r-sm">
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary">Investigator Hint</div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{error.hint}</p>
          </div>
        )}
        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
          <Clock className="size-3" />
          {result.executionTimeMs} ms · {error.kind}
        </div>
      </div>
    </div>
  );
}

function SuccessState({ result, onCopy }: { result: Extract<QueryResult, { ok: true }>; onCopy: () => void }) {
  const { columns, rows, rowCount, executionTimeMs, truncated } = result;
  const [copied, setCopied] = useState(false);
  const story = useActiveStory();
  const discovered = useDiscoveredEvidence();
  const discoverEvidence = useGameStore((s) => s.discoverEvidence);
  const addTimelineEvent = useGameStore((s) => s.addTimelineEvent);
  const { play } = useAudio();
  const [discoveredRowIds, setDiscoveredRowIds] = useState<Set<number>>(new Set());

  const copyAll = () => {
    const tsv = [columns.join("\t"), ...rows.map((r) => columns.map((c) => formatCell(r[c])).join("\t"))].join("\n");
    navigator.clipboard?.writeText(tsv);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 1200);
  };

  const handleRowClick = useCallback(
    (row: Record<string, unknown>, rowIndex: number) => {
      if (!story) return;
      play("click");
      const ctx: EvidenceTriggerContext = {
        sql: "", sqlUpper: "", columns, rows: [row], rowCount: 1,
        tableName: inferTableNameFromColumns(columns),
      };
      const alreadyDiscovered = discovered.map((e) => e.evidenceId);
      for (const trigger of story.evidenceTriggers) {
        if (alreadyDiscovered.includes(trigger.evidenceId)) continue;
        try {
          if (trigger.test(ctx)) {
            discoverEvidence({
              id: `disc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              evidenceId: trigger.evidenceId, name: trigger.name, description: trigger.description,
              category: trigger.category, significance: trigger.significance, discoveredAt: Date.now(),
              triggerQuery: "manual row click", source: trigger.category,
            });
            play("evidence");
            setDiscoveredRowIds((prev) => new Set(prev).add(rowIndex));
            const tlEvent = story.timeline.find((t) => t.evidenceId === trigger.evidenceId);
            if (tlEvent) {
              addTimelineEvent({
                id: `tl-${trigger.evidenceId}`, time: tlEvent.time, label: tlEvent.label,
                description: tlEvent.description, evidenceId: trigger.evidenceId, addedAt: Date.now(),
              });
            }
          }
        } catch { /* ignore */ }
      }
    },
    [story, discovered, discoverEvidence, addTimelineEvent, play, columns],
  );

  if (rowCount === 0) {
    return (
      <div className="h-full overflow-auto p-4 sm:p-6">
        <div className="max-w-xl fade-up">
          <div className="flex items-center gap-2">
            <SearchX className="size-5 text-amber-400/70" />
            <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-amber-400/90">No Records Found</h3>
          </div>
          <p className="mt-3 text-sm text-foreground/90 leading-relaxed">Your search executed successfully, but no records matched.</p>
          <div className="mt-3 border border-border/60 bg-black/20 pl-3 py-2 pr-3 rounded-sm">
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400/70">Investigative Note</div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              An empty result can be evidence too. Consider whether your assumptions are correct.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
            <Clock className="size-3" />
            {executionTimeMs} ms · 0 rows
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60 bg-card/40">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
          <CheckCircle2 className="size-3.5 text-emerald-500/80" />
          <span className="text-emerald-500/90">Records Found</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground tabular-nums">{rowCount.toLocaleString()}</span>
          <span className="text-muted-foreground">records</span>
          {truncated && <span className="text-amber-400/80 font-mono text-[10px]">(showing first 1000)</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[9px] font-mono text-muted-foreground/50">Click a row to inspect for evidence</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
            <Clock className="size-3" />{executionTimeMs} ms
          </span>
          <Button onClick={copyAll} variant="outline" size="sm" className="font-mono text-[10px] uppercase tracking-wider h-7 px-2 cursor-pointer">
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}{copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full border-collapse text-[12px] font-mono">
          <thead className="sticky top-0 z-10">
            <tr className="bg-card/80 backdrop-blur">
              <th className="sticky left-0 z-20 bg-card/80 backdrop-blur w-10 border-b border-r border-border/60 px-2 py-1.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-normal">#</th>
              {columns.map((c) => (
                <th key={c} className="border-b border-border/60 px-3 py-1.5 text-left text-[10px] uppercase tracking-wider text-primary font-semibold whitespace-nowrap">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isDiscovered = discoveredRowIds.has(i);
              return (
                <tr key={i} onClick={() => handleRowClick(row, i)} className="hover:bg-primary/10 group cursor-pointer transition-colors">
                  <td className={`sticky left-0 z-[1] bg-background/80 group-hover:bg-primary/10 w-10 border-b border-r border-border/40 px-2 py-1.5 text-[10px] text-muted-foreground/60 tabular-nums ${isDiscovered ? "text-primary" : ""}`}>
                    {isDiscovered ? <Fingerprint className="size-3 inline" /> : i + 1}
                  </td>
                  {columns.map((c) => (
                    <td key={c} className="border-b border-border/40 px-3 py-1.5 text-foreground/90 align-top whitespace-nowrap max-w-[480px] overflow-hidden text-ellipsis" title={formatCell(row[c])}>
                      {renderCell(row[c])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function inferTableNameFromColumns(columns: string[]): string | undefined {
  const colSet = new Set(columns.map((c) => c.toLowerCase()));
  if (colSet.has("suspect_id")) return "suspects";
  if (colSet.has("employee_id")) return "employees";
  if (colSet.has("agent_id") && colSet.has("codename")) return "agents";
  if (colSet.has("location_id") && colSet.has("access_level")) return "locations";
  if (colSet.has("visit_id")) return "visits";
  if (colSet.has("call_id")) return "calls";
  if (colSet.has("transaction_id")) return "transactions";
  if (colSet.has("message_id")) return "messages";
  if (colSet.has("log_id")) return "security_logs";
  if (colSet.has("satellite_id") && colSet.has("event_type")) return "satellite_events";
  if (colSet.has("movement_id")) return "agent_movements";
  if (colSet.has("credential_id")) return "credentials";
  return undefined;
}

function renderCell(v: unknown) {
  if (v === null || v === undefined) return <span className="text-muted-foreground/40 italic">NULL</span>;
  if (typeof v === "number") return <span className="tabular-nums">{v}</span>;
  const s = String(v);
  if (s.length > 200) return <span>{s.slice(0, 200)}…</span>;
  return <span>{s}</span>;
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  return String(v);
}
