

import { useEffect } from "react";
import { useGameStore } from "@/lib/game/store";
import { LandingPage } from "@/components/game/LandingPage";
import { CaseArchive } from "@/components/game/CaseArchive";
import { CaseIntroduction } from "@/components/game/CaseIntroduction";
import { InvestigationDashboard } from "@/components/game/InvestigationDashboard";
import { CaseComplete } from "@/components/game/CaseComplete";
import { ErrorBoundary } from "@/components/game/ErrorBoundary";
import { getPlatform } from "@/services/platform";

export default function App() {
  const stage = useGameStore((s) => s.stage);
  const hasHydrated = useGameStore((s) => s._hasHydrated);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    useGameStore.persist.rehydrate();
    const platform = getPlatform();
    platform.onGameStart();
    return () => platform.onGameStop();
  }, []);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center forensic-bg noise-overlay">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          <span className="text-primary">●</span> Initialising forensic terminal…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col forensic-bg noise-overlay">
      <main className="flex-1 flex flex-col">
        <ErrorBoundary>
          {stage === "landing" && <LandingPage />}
          {stage === "archive" && <CaseArchive />}
          {stage === "briefing" && <CaseIntroduction />}
          {stage === "investigation" && <InvestigationDashboard />}
          {stage === "complete" && <CaseComplete />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
