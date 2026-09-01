/**
 * Platform Service Abstraction
 *
 * Provides a clean interface between the game and the distribution platform
 * (CrazyGames, other HTML5 portals, or local play).
 *
 * To add CrazyGames support: implement CrazyGamesPlatform and swap the active
 * platform in the factory function.
 */

export interface PlatformService {
  onGameStart(): void;
  onGameStop(): void;
  showAd(placement: AdPlacement): Promise<void>;
  saveData?(key: string, data: unknown): Promise<void>;
  loadData?(key: string): Promise<unknown | null>;
  trackEvent?(event: string, data?: Record<string, unknown>): void;
  readonly name: string;
}

export type AdPlacement = "between-cases" | "loading" | "game-over";

// CrazyGames SDK type (loaded via script tag in production)
interface CrazyGamesSDK {
  game: {
    gameplayStart: () => void;
    gameplayStop: () => void;
    sdkGameLoadingStart: () => void;
    sdkGameLoadingStop: () => void;
  };
  ad: {
    requestAd: (type: "midgame" | "rewarded", callbacks: {
      adFinished?: () => void;
      adError?: (error: unknown) => void;
      adStarted?: () => void;
    }) => void;
  };
  data: {
    getItem: (key: string) => unknown | null;
    setItem: (key: string, value: unknown) => void;
    removeItem: (key: string) => void;
  };
}

declare global {
  interface Window {
    CrazyGames?: { SDK: CrazyGamesSDK };
  }
}

class LocalPlatform implements PlatformService {
  readonly name = "local";
  onGameStart() {}
  onGameStop() {}
  async showAd(_placement: AdPlacement) { void _placement; }
}

class CrazyGamesPlatform implements PlatformService {
  readonly name = "crazygames";

  private get sdk(): CrazyGamesSDK | null {
    if (typeof window === "undefined") return null;
    return window.CrazyGames?.SDK ?? null;
  }

  onGameStart() {
    try { this.sdk?.game.gameplayStart(); } catch {}
  }

  onGameStop() {
    try { this.sdk?.game.gameplayStop(); } catch {}
  }

  async showAd(placement: AdPlacement): Promise<void> {
    return new Promise((resolve) => {
      const sdk = this.sdk;
      if (!sdk) { resolve(); return; }
      // Use a timeout so the game never gets stuck if ad fails
      const timeout = setTimeout(() => resolve(), 10000);
      try {
        sdk.ad.requestAd("midgame", {
          adFinished: () => { clearTimeout(timeout); resolve(); },
          adError: () => { clearTimeout(timeout); resolve(); },
          adStarted: () => {},
        });
      } catch {
        clearTimeout(timeout);
        resolve();
      }
      void placement;
    });
  }

  async saveData(key: string, data: unknown) {
    try { this.sdk?.data.setItem(key, data); } catch {}
  }

  async loadData(key: string) {
    try { return this.sdk?.data.getItem(key) ?? null; } catch { return null; }
  }

  trackEvent(event: string, data?: Record<string, unknown>) {
    // CrazyGames doesn't have a dedicated analytics API, but we can log
    void event; void data;
  }
}

function isCrazyGames(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.CrazyGames?.SDK;
}

let _instance: PlatformService | null = null;

export function getPlatform(): PlatformService {
  if (!_instance) {
    _instance = isCrazyGames() ? new CrazyGamesPlatform() : new LocalPlatform();
  }
  return _instance;
}
