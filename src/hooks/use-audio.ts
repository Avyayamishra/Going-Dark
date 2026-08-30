"use client";

import { useCallback, useEffect } from "react";
import { getAudioEngine } from "@/lib/audio/engine";
import { useGameStore } from "@/lib/game/store";

export function useAudio() {
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const audioVolume = useGameStore((s) => s.audioVolume);
  const setAudio = useGameStore((s) => s.setAudio);

  // Sync engine with persisted state.
  useEffect(() => {
    const eng = getAudioEngine();
    eng.setEnabled(audioEnabled);
    eng.setVolume(audioVolume);
  }, [audioEnabled, audioVolume]);

  const play = useCallback((name: Parameters<ReturnType<typeof getAudioEngine>["play"]>[0]) => {
    getAudioEngine().play(name);
  }, []);

  const toggleAudio = useCallback(() => {
    setAudio(!audioEnabled, audioVolume);
  }, [audioEnabled, audioVolume, setAudio]);

  const setVolume = useCallback(
    (v: number) => {
      setAudio(true, v);
    },
    [setAudio],
  );

  return { audioEnabled, audioVolume, play, toggleAudio, setVolume, setAudio };
}
