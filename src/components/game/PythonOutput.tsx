
import { Loader2, Database, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { PythonResult } from "@/lib/python/engine";
import { cn } from "@/lib/utils";

interface PythonOutputProps {
  result: PythonResult | null;
  running: boolean;
}

export function PythonOutput({ result, running }: PythonOutputProps) {
  if (running) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16 text-muted-foreground">
        <Loader2 className="size-8 text-primary animate-spin" />
        <div className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">Running Python…</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16 text-muted-foreground">
        <Database className="size-8 text-muted-foreground/40" />
        <div className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">No Python executed yet</div>
        <div className="mt-1 text-[11px] font-mono text-muted-foreground/70 max-w-sm">
          Write Python in the terminal on the left. Tables are injected as list-of-dicts variables.
        </div>
        <div className="mt-4 font-mono text-[11px] text-muted-foreground/60 border border-border/60 rounded-sm px-3 py-2 bg-black/20">
          <span className="text-primary">›</span> print(len(passengers))
        </div>
      </div>
    );
  }

  if (!result.ok) return <ErrorState result={result} />;
  return <SuccessState result={result} />;
}

function ErrorState({ result }: { result: Extract<PythonResult, { ok: false }> }) {
  const { error } = result;
  const isLoad = error.kind === "LOAD_ERROR";
  return (
    <div className="h-full overflow-auto p-4 sm:p-6">
      <div className="max-w-xl fade-up">
        <div className="flex items-center gap-2">
          <XCircle className="size-5 text-primary" />
          <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-primary">{error.title}</h3>
        </div>
        <p className="mt-3 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-mono">
          {error.message}
        </p>
        {error.hint && (
          <div className="mt-4 border-l-2 border-primary/40 bg-primary/5 pl-3 py-2 pr-3 rounded-r-sm">
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary">Investigator Hint</div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{error.hint}</p>
          </div>
        )}
        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
          <Clock className="size-3" />
          {result.executionTimeMs} ms · {error.kind}
          {isLoad && <span className="text-amber-400/70"> · retry will re-fetch from CDN</span>}
        </div>
      </div>
    </div>
  );
}

function SuccessState({ result }: { result: Extract<PythonResult, { ok: true }> }) {
  const { stdout, stderr, result: rawResult, executionTimeMs } = result;
  const resultStr = typeof rawResult === "string" ? rawResult : rawResult == null ? "" : String(rawResult);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60 bg-card/40">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
          <CheckCircle2 className="size-3.5 text-emerald-500/80" />
          <span className="text-emerald-500/90">Execution Complete</span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
          <Clock className="size-3" />
          {executionTimeMs} ms
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-auto">
        <Section label="STDOUT">
          {stdout ? (
            <pre className="font-mono text-[12px] leading-5 text-foreground/90 whitespace-pre-wrap break-words">
              {stdout}
            </pre>
          ) : (
            <p className="font-mono text-[11px] text-muted-foreground/50 italic">(no output)</p>
          )}
        </Section>

        {stderr && (
          <Section label="STDERR" tone="error">
            <pre className="font-mono text-[12px] leading-5 text-amber-300/90 whitespace-pre-wrap break-words">
              {stderr}
            </pre>
          </Section>
        )}

        <Section label="RESULT">
          {resultStr ? (
            <pre className="font-mono text-[12px] leading-5 text-foreground/90 whitespace-pre-wrap break-words">
              {resultStr}
            </pre>
          ) : (
            <p className="font-mono text-[11px] text-muted-foreground/50 italic">(no return value)</p>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({
  label,
  tone = "default",
  children,
}: {
  label: string;
  tone?: "default" | "error";
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border/40 last:border-b-0">
      <div
        className={cn(
          "px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border-b border-border/40 bg-black/20",
          tone === "error" ? "text-amber-400/70" : "text-primary/80",
        )}
      >
        {label}
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}
