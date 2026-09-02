
import { useEffect, useState } from "react";
import { ArrowRight, FileText, Users, Clock, ChevronRight, Satellite, Radio, ShieldAlert, Lock, Database, Eye, Train, KeyRound, Wrench } from "lucide-react";
import { useGameStore, useActiveStory } from "@/lib/game/store";
import { useAudio } from "@/hooks/use-audio";
import { Button } from "@/components/ui/button";

// Story-specific briefing beats for each case.
const CASE_BEATS: Record<string, { icon: React.ElementType; label: string; text: string }[]> = {
  "case-001": [
    { icon: Satellite, label: "02:13 UTC", text: "Encrypted Russian military satellite KOSMOS-9147 briefly disappeared from its assigned orbital network. For exactly seven minutes and forty-two seconds, it transmitted an impossible signal." },
    { icon: Lock, label: "LEGITIMATE CREDENTIAL", text: "The authentication used a valid Russian authorization certificate (RUS-77A). The credential was technically active and belonged to a Colonel who was hundreds of kilometers away." },
    { icon: ShieldAlert, label: "IMPOSSIBLE ACCESS", text: "Russian authorities claim a routine telemetry malfunction. The IMF believes someone used the missing seven minutes to extract a classified orbital communication key." },
    { icon: Eye, label: "FALSE TRAIL", text: "Agent Ethan Hunt was assigned to investigate — but his movements during the incident are inconsistent with his mission. Someone deliberately inserted him into the trail." },
  ],
  "case-002": [
    { icon: Train, label: "11:47 PM", text: "The Maharaja Meridian luxury train enters Khandala Tunnel. When it emerges four minutes later, billionaire Arvind Rao is dead inside locked cabin A-17." },
    { icon: KeyRound, label: "LOCKED CABIN", text: "The cabin door was latched from inside. The window is sealed. CCTV shows no person entering A-17. No weapon is found inside." },
    { icon: Wrench, label: "IMPOSSIBLE CRIME", text: "The initial assumption: nobody could have entered. The player must determine whether that assumption is actually correct." },
    { icon: Eye, label: "THE TUNNEL WINDOW", text: "For four minutes and twelve seconds, the train was in darkness. Something happened during those minutes that the records can reveal." },
  ],
};

export function CaseIntroduction() {
  const story = useActiveStory();
  const setStage = useGameStore((s) => s.setStage);
  const { play } = useAudio();
  const [visible, setVisible] = useState(0);
  const meta = story?.metadata;
  const suspects = story?.suspects ?? [];
  const storyId = story?.metadata.id ?? "case-001";
  const beats = CASE_BEATS[storyId] ?? CASE_BEATS["case-001"];

  useEffect(() => {
    play("transition");
    const id = setInterval(() => {
      setVisible((v) => {
        if (v < beats.length + 1) return v + 1;
        clearInterval(id);
        return v;
      });
    }, 850);
    return () => clearInterval(id);
  }, [play, beats.length]);

  const accessDb = () => {
    play("click");
    setStage("investigation");
  };

  if (!meta) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="size-3.5 text-primary" />
            <span>Case File — {meta.caseNumber}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-primary">●</span> BRIEFING
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="fade-up">
            <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-primary">Case Briefing</div>
            <h1 className="mt-2 font-mono text-3xl sm:text-4xl font-bold tracking-tight">
              {meta.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              <span>Incident: {meta.incidentDate}</span>
              <span>Discovered: {meta.discoveredAt}</span>
              <span>Location: {meta.location}</span>
            </div>
          </div>

          {/* Story beats */}
          <div className="mt-8 space-y-3">
            {beats.map((b, i) => (
              <Beat key={i} beat={b} show={visible > i} delay={i} />
            ))}
          </div>

          {/* Incident window callout */}
          <div
            className={`mt-8 border border-primary/40 bg-primary/5 rounded-sm p-5 transition-all duration-500 ${
              visible > beats.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary">
              Incident Window
            </div>
            <div className="mt-1 font-mono text-2xl text-foreground">{meta.timeOfDeath}</div>
            <div className="mt-1 text-xs font-mono text-muted-foreground">{meta.incidentDate}</div>
          </div>

          {/* Persons of interest */}
          <div
            className={`mt-8 transition-all duration-500 ${
              visible > beats.length ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="size-4 text-primary" />
              <h2 className="font-mono text-sm uppercase tracking-[0.2em]">
                {storyId === "case-001" ? "Agents of Interest" : "Persons of Interest"}
              </h2>
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[11px] font-mono text-muted-foreground">{suspects.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {suspects.map((s) => (
                <div
                  key={s.id}
                  className="group border border-border/60 bg-card/40 hover:border-primary/50 transition-colors rounded-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs text-muted-foreground">{s.id}</div>
                  </div>
                  <div className="mt-1 font-mono text-base text-foreground">{s.name}</div>
                  <div className="text-xs text-primary font-mono">{s.role}</div>
                  <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{s.shortBio}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Objective */}
          <div
            className={`mt-8 border border-border bg-black/30 rounded-sm p-5 transition-all duration-500 ${
              visible > beats.length ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              Investigation Objective
            </div>
            <p className="mt-2 font-mono text-sm text-foreground/90 leading-relaxed">
              {storyId === "case-001" ? (
                <>
                  You have been granted access to the IMF investigation database. Cross-reference the records to determine:
                </>
              ) : (
                <>
                  You have been granted access to a read-only replica of the internal database. Cross-reference the records to determine:
                </>
              )}
            </p>
            <ul className="mt-3 space-y-1.5 font-mono text-sm">
              {storyId === "case-001" ? (
                <>
                  <li className="flex items-center gap-2 text-primary"><ChevronRight className="size-3.5" /> WHO accessed the satellite?</li>
                  <li className="flex items-center gap-2 text-primary"><ChevronRight className="size-3.5" /> HOW did they obtain the credentials?</li>
                  <li className="flex items-center gap-2 text-primary"><ChevronRight className="size-3.5" /> WHY was Ethan Hunt inserted into the trail?</li>
                </>
              ) : storyId === "case-002" ? (
                <>
                  <li className="flex items-center gap-2 text-primary"><ChevronRight className="size-3.5" /> WHO killed Arvind Rao?</li>
                  <li className="flex items-center gap-2 text-primary"><ChevronRight className="size-3.5" /> HOW did the murder happen inside a locked cabin?</li>
                  <li className="flex items-center gap-2 text-primary"><ChevronRight className="size-3.5" /> WHY was no weapon found?</li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2 text-primary"><ChevronRight className="size-3.5" /> WHO is responsible?</li>
                  <li className="flex items-center gap-2 text-primary"><ChevronRight className="size-3.5" /> HOW was it done?</li>
                  <li className="flex items-center gap-2 text-primary"><ChevronRight className="size-3.5" /> WHY?</li>
                </>
              )}
            </ul>
          </div>

          {/* CTA */}
          <div
            className={`mt-8 flex flex-col items-center transition-all duration-500 ${
              visible > beats.length ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              onClick={accessDb}
              size="lg"
              className="font-mono uppercase tracking-[0.2em] text-sm h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_24px_-6px] shadow-primary/50"
            >
              <Database className="size-4" />
              Access Investigation Database
              <ArrowRight className="size-4" />
            </Button>
            <p className="mt-3 text-[11px] font-mono text-muted-foreground/70">
              {meta.tagline}
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-border/60 py-3 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
          <span>Case {meta.caseNumber}</span>
          <span>Briefing — authorized personnel only</span>
        </div>
      </footer>
    </div>
  );
}

function Beat({
  beat,
  show,
  delay,
}: {
  beat: { icon: React.ElementType; label: string; text: string };
  show: boolean;
  delay: number;
}) {
  const Icon = beat.icon;
  return (
    <div
      className={`flex gap-4 border-l-2 border-primary/30 pl-4 transition-all duration-500 ${
        show ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
      }`}
      style={{ transitionDelay: `${delay * 60}ms` }}
    >
      <div className="mt-0.5 shrink-0">
        <div className="size-9 rounded-sm border border-border bg-card/60 flex items-center justify-center">
          <Icon className="size-4 text-primary" />
        </div>
      </div>
      <div className="flex-1">
        <div className="text-[11px] font-mono uppercase tracking-widest text-primary">{beat.label}</div>
        <p className="mt-0.5 text-sm text-foreground/90 leading-relaxed">{beat.text}</p>
      </div>
    </div>
  );
}
