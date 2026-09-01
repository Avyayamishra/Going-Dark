
import { useEffect, useState } from "react";
import { Table2, ChevronRight, ChevronDown, Key, Hash, Type, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TableInfo } from "@/lib/sql/client-engine";
import { getSchema } from "@/lib/sql/client-engine";
import { useActiveStory } from "@/lib/game/store";
import { useAudio } from "@/hooks/use-audio";
import { cn } from "@/lib/utils";

interface DatabaseExplorerProps {
  onInsertQuery?: (sql: string) => void;
}

export function DatabaseExplorer({ onInsertQuery }: DatabaseExplorerProps) {
  const story = useActiveStory();
  const storyId = story?.metadata.id ?? "";
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["suspects"]));
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const { play } = useAudio();

  const fetchSchema = async () => {
    if (!storyId) return;
    setLoading(true);
    try {
      // Client-side schema — no backend API call.
      const schema = await getSchema(storyId);
      setTables(schema);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSchema();
  }, [storyId]);

  const toggle = (name: string) => {
    play("click");
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const filtered = tables.filter(
    (t) =>
      t.name.toLowerCase().includes(filter.toLowerCase()) ||
      t.columns.some((c) => c.name.toLowerCase().includes(filter.toLowerCase())),
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-border/60 bg-card/40 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Schema · {tables.length} tables
          </div>
          <Button
            onClick={() => {
              play("click");
              void fetchSchema();
            }}
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label="Refresh schema"
          >
            <RefreshCw className={cn("size-3", loading && "animate-spin")} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter tables / columns"
            className="h-7 pl-7 text-xs font-mono bg-black/20 border-border/60"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto py-1">
        {filtered.map((t) => {
          const isOpen = expanded.has(t.name);
          return (
            <div key={t.name} className="border-b border-border/30">
              <button
                onClick={() => toggle(t.name)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 hover:bg-primary/5 transition-colors group"
              >
                {isOpen ? (
                  <ChevronDown className="size-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-3 text-muted-foreground" />
                )}
                <Table2 className="size-3.5 text-primary/80" />
                <span className="font-mono text-xs text-foreground group-hover:text-primary transition-colors">
                  {t.name}
                </span>
                <span className="ml-auto text-[9px] font-mono text-muted-foreground/60 tabular-nums">
                  {t.columns.length}
                </span>
              </button>
              {isOpen && (
                <div className="pb-1.5">
                  <div className="px-2 py-1 text-[10px] text-muted-foreground/70 leading-snug">{t.description}</div>
                  <div className="space-y-0.5">
                    {t.columns.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          play("click");
                          onInsertQuery?.(`SELECT * FROM ${t.name} LIMIT 50;`);
                        }}
                        className="w-full text-left flex items-center gap-1.5 px-3 py-1 hover:bg-primary/5 transition-colors group/col"
                        title={c.description || c.type}
                      >
                        <span className="w-3 shrink-0">
                          {c.pk ? (
                            <Key className="size-3 text-primary" />
                          ) : /INT/i.test(c.type) ? (
                            <Hash className="size-3 text-muted-foreground/60" />
                          ) : (
                            <Type className="size-3 text-muted-foreground/60" />
                          )}
                        </span>
                        <span className="font-mono text-[11px] text-foreground/90 group-hover/col:text-primary transition-colors truncate">
                          {c.name}
                        </span>
                        <span className="ml-auto font-mono text-[9px] uppercase text-muted-foreground/60">
                          {c.type}
                        </span>
                      </button>
                    ))}
                  </div>
                  {onInsertQuery && (
                    <button
                      onClick={() => {
                        play("click");
                        onInsertQuery(`SELECT * FROM ${t.name} LIMIT 50;`);
                      }}
                      className="mx-3 mt-1.5 mb-0.5 inline-flex items-center gap-1 px-2 py-1 rounded-sm border border-border/60 hover:border-primary/50 hover:text-primary text-[10px] font-mono uppercase tracking-wider text-muted-foreground transition-colors"
                    >
                      <Search className="size-3" />
                      Quick query
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
