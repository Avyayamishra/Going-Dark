
import { useState, useCallback, useEffect, useRef } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import {
  FolderOpen,
  Users,
  Database as DatabaseIcon,
  StickyNote,
  History,
  Fingerprint,
  Target,
  Lightbulb,
  Compass,
  LayoutGrid,
  Clock3,
  ChevronRight,
  TerminalSquare,
  Code2,
} from "lucide-react";
import { TopBar } from "@/components/game/TopBar";
import { SearchTerminal } from "@/components/game/SearchTerminal";
import { QueryResults } from "@/components/game/QueryResults";
import { PythonTerminal } from "@/components/game/PythonTerminal";
import { PythonOutput } from "@/components/game/PythonOutput";
import { DatabaseExplorer } from "@/components/game/DatabaseExplorer";
import { CaseBrief } from "@/components/game/CaseBrief";
import { InvestigationNotes } from "@/components/game/InvestigationNotes";
import { QueryHistory } from "@/components/game/QueryHistory";
import { EvidencePanel } from "@/components/game/EvidencePanel";
import { HintPanel } from "@/components/game/HintPanel";
import { InvestigationProgress } from "@/components/game/InvestigationProgress";
import { InvestigationLeads } from "@/components/game/InvestigationLeads";
import { InvestigationTimeline } from "@/components/game/InvestigationTimeline";
import { EvidenceBoard } from "@/components/game/EvidenceBoard";
import { SuspectProfiles } from "@/components/game/SuspectProfiles";
import { EvidenceToast, type EvidenceNotification } from "@/components/game/EvidenceToast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useGameStore, useActiveStory, useDiscoveredEvidence } from "@/lib/game/store";
import { useAudio } from "@/hooks/use-audio";
import type { QueryResult } from "@/lib/sql/client-engine";
import type { PythonResult } from "@/lib/python/engine";
import { cn } from "@/lib/utils";

type LeftTab = "brief" | "suspects" | "database" | "notes" | "history";
type RightTab = "evidence" | "board" | "timeline" | "leads" | "progress" | "hints";
type IdeMode = "sql" | "python";

const LEFT_TABS: { id: LeftTab; label: string; icon: React.ElementType }[] = [
  { id: "brief", label: "Brief", icon: FolderOpen },
  { id: "suspects", label: "Suspects", icon: Users },
  { id: "database", label: "Records", icon: DatabaseIcon },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "history", label: "History", icon: History },
];

const RIGHT_TABS: { id: RightTab; label: string; icon: React.ElementType }[] = [
  { id: "evidence", label: "Evidence", icon: Fingerprint },
  { id: "board", label: "Board", icon: LayoutGrid },
  { id: "timeline", label: "Timeline", icon: Clock3 },
  { id: "leads", label: "Leads", icon: Compass },
  { id: "progress", label: "Progress", icon: Target },
  { id: "hints", label: "Hints", icon: Lightbulb },
];

export function InvestigationDashboard() {
  const story = useActiveStory();
  const defaultTable = story?.database.schema?.[0]?.name ?? "suspects";
  const [ide, setIde] = useState<IdeMode>("sql");
  const [sql, setSql] = useState<string>(`SELECT * FROM ${defaultTable};`);
  const [python, setPython] = useState<string>("# Inspect the case data tables available to you\nprint(tables())\n");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [pythonResult, setPythonResult] = useState<PythonResult | null>(null);
  const [running, setRunning] = useState(false);
  const [leftTab, setLeftTab] = useState<LeftTab>("brief");
  const [rightTab, setRightTab] = useState<RightTab>("evidence");
  const [mobileLeft, setMobileLeft] = useState(false);
  const [mobileRight, setMobileRight] = useState(false);
  const [evidenceNotif, setEvidenceNotif] = useState<EvidenceNotification | null>(null);
  const discoveredEvidence = useDiscoveredEvidence();
  const discoveredCount = discoveredEvidence.length;
  const { play } = useAudio();

  const handleResult = useCallback((r: QueryResult) => {
    setResult(r);
    setRunning(false);
  }, []);

  const handlePythonResult = useCallback((r: PythonResult) => {
    setPythonResult(r);
    setRunning(false);
  }, []);

  // When loading a query/code from a lead or objective, route to the right IDE.
  const loadSql = useCallback((q: string) => {
    setSql(q);
    setIde("sql");
  }, []);
  const loadPython = useCallback((c: string) => {
    setPython(c);
    setIde("python");
  }, []);

  const prevDiscoveredRef = useRef(discoveredEvidence.length);
  useEffect(() => {
    if (discoveredEvidence.length <= prevDiscoveredRef.current) {
      prevDiscoveredRef.current = discoveredEvidence.length;
      return;
    }
    prevDiscoveredRef.current = discoveredEvidence.length;
    const latest = discoveredEvidence[0];
    if (!latest) return;
    const id = setTimeout(() => {
      setEvidenceNotif({
        id: latest.id, name: latest.name, description: latest.description,
        category: latest.category, points: 100,
      });
    }, 0);
    return () => clearTimeout(id);
  }, [discoveredEvidence]);

  return (
    <div className="h-screen flex flex-col">
      <TopBar onOpenMobileNav={() => setMobileLeft(true)} />

      <div className="lg:hidden flex items-center gap-1 px-2 py-1 border-b border-border/60 bg-card/40">
        <Button variant="ghost" size="sm" onClick={() => { play("click"); setMobileLeft(true); }} className="font-mono text-[11px] uppercase tracking-wider h-7">
          <FolderOpen className="size-3.5" /> Case
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={() => { play("click"); setMobileRight(true); }} className="font-mono text-[11px] uppercase tracking-wider h-7">
          <Fingerprint className="size-3.5" /> Evidence ({discoveredCount})
        </Button>
      </div>

      <div className="flex-1 min-h-0 flex">
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-border/60 bg-sidebar/30">
          <SidebarShell tabs={LEFT_TABS} active={leftTab} onChange={(t) => { play("click"); setLeftTab(t as LeftTab); }}>
            <LeftContent
              tab={leftTab}
              onInsertQuery={(q) => loadSql(q)}
              onRestoreQuery={(q) => loadSql(q)}
            />
          </SidebarShell>
        </aside>

        <section className="flex-1 min-w-0 flex flex-col">
          <ObjectiveBanner />
          {/* IDE mode toggle */}
          <IdeSwitch mode={ide} onChange={(m) => { play("click"); setIde(m); }} />
          <div className="flex-1 min-h-0">
            <PanelGroup direction="vertical" autoSaveId="investigation-panel">
              <Panel defaultSize={42} minSize={18} className="min-h-0">
                <div className="h-full border-b border-border/60 bg-card/20">
                  {ide === "sql" ? (
                    <SearchTerminal value={sql} onChange={setSql} onResult={handleResult} onRunningChange={setRunning} />
                  ) : (
                    <PythonTerminal value={python} onChange={setPython} onResult={handlePythonResult} onRunningChange={setRunning} />
                  )}
                </div>
              </Panel>
              <PanelResizeHandle className="h-1.5 bg-border/40 hover:bg-primary/40 transition-colors data-[resize-handle-active]:bg-primary" />
              <Panel defaultSize={58} minSize={20} className="min-h-0">
                <div className="h-full bg-background/40">
                  {ide === "sql" ? (
                    <QueryResults result={result} running={running} />
                  ) : (
                    <PythonOutput result={pythonResult} running={running} />
                  )}
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </section>

        <aside className="hidden lg:flex flex-col w-80 shrink-0 border-l border-border/60 bg-sidebar/30">
          <SidebarShell tabs={RIGHT_TABS} active={rightTab} onChange={(t) => { play("click"); setRightTab(t as RightTab); }}>
            <RightContent
              tab={rightTab}
              onLeadQuery={(q) => loadSql(q)}
              onLeadPython={(c) => loadPython(c)}
            />
          </SidebarShell>
        </aside>
      </div>

      <Sheet open={mobileLeft} onOpenChange={setMobileLeft}>
        <SheetContent side="left" className="w-[85vw] max-w-sm p-0 bg-sidebar border-border/60">
          <SheetHeader className="px-3 py-2 border-b border-border/60">
            <SheetTitle className="font-mono text-xs uppercase tracking-[0.2em]">Case Files</SheetTitle>
          </SheetHeader>
          <SidebarShell tabs={LEFT_TABS} active={leftTab} onChange={(t) => { setLeftTab(t as LeftTab); }}>
            <LeftContent
              tab={leftTab}
              onInsertQuery={(q) => { loadSql(q); setMobileLeft(false); }}
              onRestoreQuery={(q) => { loadSql(q); setMobileLeft(false); }}
            />
          </SidebarShell>
        </SheetContent>
      </Sheet>
      <Sheet open={mobileRight} onOpenChange={setMobileRight}>
        <SheetContent side="right" className="w-[85vw] max-w-sm p-0 bg-sidebar border-border/60">
          <SheetHeader className="px-3 py-2 border-b border-border/60">
            <SheetTitle className="font-mono text-xs uppercase tracking-[0.2em]">Investigation</SheetTitle>
          </SheetHeader>
          <SidebarShell tabs={RIGHT_TABS} active={rightTab} onChange={(t) => { setRightTab(t as RightTab); }}>
            <RightContent
              tab={rightTab}
              onLeadQuery={(q) => loadSql(q)}
              onLeadPython={(c) => loadPython(c)}
            />
          </SidebarShell>
        </SheetContent>
      </Sheet>

      <EvidenceToast evidence={evidenceNotif} onDismiss={() => setEvidenceNotif(null)} />
    </div>
  );
}

function SidebarShell({ tabs, active, onChange, children }: { tabs: { id: string; label: string; icon: React.ElementType }[]; active: string; onChange: (id: string) => void; children: React.ReactNode; }) {
  return (
    <>
      <div className="flex items-center bg-card/30 shrink-0 relative">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                "relative flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              <span className="font-mono text-[9px] uppercase tracking-wider">{t.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-t-sm" />
              )}
            </button>
          );
        })}
        {/* Single shared bottom border under all tabs */}
        <span className="absolute bottom-0 left-0 right-0 h-px bg-border/60 pointer-events-none" />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </>
  );
}

function LeftContent({ tab, onInsertQuery, onRestoreQuery }: { tab: LeftTab; onInsertQuery: (q: string) => void; onRestoreQuery: (q: string) => void; }) {
  if (tab === "brief") return <div className="h-full overflow-auto"><CaseBrief /></div>;
  if (tab === "suspects") return <div className="h-full overflow-auto"><SuspectProfiles /></div>;
  if (tab === "database") return <DatabaseExplorer onInsertQuery={onInsertQuery} />;
  if (tab === "notes") return <InvestigationNotes />;
  return <QueryHistory onRestore={onRestoreQuery} />;
}

function RightContent({
  tab,
  onLeadQuery,
  onLeadPython,
}: {
  tab: RightTab;
  onLeadQuery: (sql: string) => void;
  onLeadPython: (code: string) => void;
}) {
  if (tab === "evidence") return <div className="h-full overflow-auto"><EvidencePanel /></div>;
  if (tab === "board") return <div className="h-full overflow-auto"><EvidenceBoard /></div>;
  if (tab === "timeline") return <div className="h-full overflow-auto"><InvestigationTimeline /></div>;
  if (tab === "leads") return (
    <div className="h-full overflow-auto">
      <InvestigationLeads onRunQuery={onLeadQuery} onRunPython={onLeadPython} />
    </div>
  );
  if (tab === "progress") {
    return (
      <div className="h-full overflow-auto">
        <InvestigationProgress
          onLoadQuery={(q) => onLeadQuery(q)}
          onLoadPython={(c) => onLeadPython(c)}
        />
      </div>
    );
  }
  return <div className="h-full overflow-auto"><HintPanel /></div>;
}

function ObjectiveBanner() {
  const story = useActiveStory();
  const completed = useGameStore((s) => (s.activeStoryId ? s.progress[s.activeStoryId]?.completedObjectives ?? [] : []));
  const objectives = story?.objectives ?? [];
  const completedSet = new Set(completed);
  const current = objectives.find((o) => !completedSet.has(o.id)) ?? objectives[0];
  const allDone = objectives.length > 0 && objectives.every((o) => completedSet.has(o.id));

  return (
    <div className="border-b border-border/60 bg-card/40 px-4 py-2 flex items-center gap-3 shrink-0">
      <div className="size-7 rounded-sm border border-primary/40 bg-primary/10 flex items-center justify-center shrink-0">
        <Target className="size-3.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-primary">
            {allDone ? "ALL OBJECTIVES COMPLETE" : "Current Objective"}
          </span>
          {current && <span className="text-[9px] font-mono text-muted-foreground/60">{current.id}</span>}
          {current?.language === "python" && (
            <span className="text-[8px] font-mono uppercase tracking-wider px-1 py-0.5 border border-primary/40 text-primary bg-primary/5 rounded-sm">PYTHON</span>
          )}
        </div>
        <p className="font-mono text-xs text-foreground/90 truncate">
          {allDone ? "You have enough to make an accusation." : current?.description ?? "No objectives."}
        </p>
      </div>
      {!allDone && (
        <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-muted-foreground/70 shrink-0">
          Open leads: {objectives.filter((o) => !completedSet.has(o.id)).length}
          <ChevronRight className="size-3" />
        </div>
      )}
    </div>
  );
}

/** SQL / Python IDE switcher. */
function IdeSwitch({ mode, onChange }: { mode: IdeMode; onChange: (m: IdeMode) => void }) {
  return (
    <div className="border-b border-border/60 bg-card/30 px-3 py-1.5 flex items-center justify-between gap-2 shrink-0">
      <div className="inline-flex items-center rounded-sm border border-border/60 bg-black/20 p-0.5">
        <button
          onClick={() => onChange("sql")}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer",
            mode === "sql" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <TerminalSquare className="size-3" />
          SQL IDE
        </button>
        <button
          onClick={() => onChange("python")}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer",
            mode === "python" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Code2 className="size-3" />
          Python IDE
        </button>
      </div>
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60 hidden sm:block">
        {mode === "sql" ? "Query the records database" : "Analyse case data with Python"}
      </div>
    </div>
  );
}
