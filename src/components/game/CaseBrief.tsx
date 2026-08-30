"use client";

import { FileText, Clock, MapPin, User, ShieldAlert } from "lucide-react";
import { useActiveStory } from "@/lib/game/store";

export function CaseBrief() {
  const story = useActiveStory();
  if (!story) return null;
  const meta = story.metadata;

  return (
    <div className="p-3 space-y-3">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">Case {meta.caseNumber}</div>
        <h3 className="font-mono text-base text-foreground mt-0.5">{meta.title}</h3>
      </div>

      <div className="space-y-1.5 border border-border/50 bg-black/20 rounded-sm p-2.5">
        <Row icon={User} label="Victim" value={meta.victim} sub={meta.victimRole} />
        <Row icon={MapPin} label="Location" value={meta.location} />
        <Row icon={Clock} label="Time of Death" value={meta.timeOfDeath} />
        <Row icon={ShieldAlert} label="Status" value="UNSOLVED" highlight />
      </div>

      <div className="border-l-2 border-primary/40 pl-2.5">
        <div className="flex items-center gap-1.5">
          <FileText className="size-3 text-primary" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary">Incident Summary</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground/90 leading-relaxed">
          At {meta.discoveredAt} on {meta.incidentDate}, {meta.victim} was found dead inside the {meta.location.split("—")[0].trim().replace(/^.*?SYSTEMS\s*/, "").trim() || "facility"}. No forced entry. Phone missing. Workstation wiped. Archive camera went dark minutes before death.
        </p>
      </div>

      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
          Persons of Interest
        </div>
        <div className="space-y-1">
          {story.suspects.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-xs">
              <span className="font-mono text-[10px] text-muted-foreground/60 w-8">{s.id}</span>
              <span className="font-mono text-foreground/90">{s.name}</span>
              <span className="font-mono text-[10px] text-primary/80 truncate">{s.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="size-3 text-muted-foreground/70 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/70">{label}</div>
        <div className={`font-mono text-xs ${highlight ? "text-primary" : "text-foreground"}`}>{value}</div>
        {sub && <div className="font-mono text-[10px] text-muted-foreground/70">{sub}</div>}
      </div>
    </div>
  );
}
