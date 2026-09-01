
/**
 * Audio engine — synthesises UI and ambient sounds via the Web Audio API so the
 * project ships with zero audio assets. Each sound is a small programmatic
 * patch; the abstraction allows real samples to be dropped in later.
 */

type SoundName =
  | "click"
  | "panel"
  | "execute"
  | "success"
  | "error"
  | "evidence"
  | "hint"
  | "transition"
  | "accuse"
  | "solved"
  | "type";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientNodes: OscillatorNode[] = [];
  private enabled = false;
  private volume = 0.5;
  private ambientStarted = false;

  init() {
    if (this.ctx) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.value = 0;
      this.ambientGain.connect(this.masterGain);
    } catch {
      this.ctx = null;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) {
      this.init();
      this.resume();
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.enabled ? 0.18 * this.volume : 0, this.ctx.currentTime, 0.5);
    }
  }

  private startAmbient() {
    if (!this.ctx || !this.ambientGain || this.ambientStarted) return;
    this.ambientStarted = true;
    const freqs = [55, 58.27, 82.41];
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain);
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 220;
    lfoGain.connect(filter.frequency);
    filter.connect(this.ambientGain);
    for (const f of freqs) {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.value = 0.3;
      osc.connect(g);
      g.connect(filter);
      osc.start();
      this.ambientNodes.push(osc);
    }
    lfo.start();
    this.ambientNodes.push(lfo);
    this.ambientGain.gain.setTargetAtTime(0.18 * this.volume, this.ctx.currentTime, 1.5);
  }

  private stopAmbient() {
    if (!this.ctx || !this.ambientGain) return;
    this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    setTimeout(() => {
      for (const n of this.ambientNodes) {
        try {
          n.stop();
        } catch {
          /* ignore */
        }
      }
      this.ambientNodes = [];
      this.ambientStarted = false;
    }, 600);
  }

  private now() {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  private tone(
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType,
    peak: number,
    destination?: AudioNode,
  ) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(destination ?? this.masterGain);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  private noise(start: number, dur: number, peak: number, cutoff = 1200) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);
    src.start(start);
    src.stop(start + dur + 0.02);
  }

  play(name: SoundName) {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const t = this.now();
    switch (name) {
      case "click":
        this.tone(880, t, 0.05, "square", 0.04);
        break;
      case "type":
        this.tone(1200 + Math.random() * 200, t, 0.02, "square", 0.015);
        break;
      case "panel":
        this.tone(420, t, 0.08, "sine", 0.05);
        this.tone(620, t + 0.04, 0.08, "sine", 0.04);
        break;
      case "execute":
        this.noise(t, 0.18, 0.05, 800);
        this.tone(180, t, 0.18, "sawtooth", 0.03);
        break;
      case "success":
        this.tone(523.25, t, 0.1, "sine", 0.06);
        this.tone(659.25, t + 0.08, 0.1, "sine", 0.06);
        this.tone(783.99, t + 0.16, 0.18, "sine", 0.06);
        break;
      case "error":
        this.tone(196, t, 0.12, "sawtooth", 0.06);
        this.tone(146.83, t + 0.1, 0.22, "sawtooth", 0.05);
        this.noise(t, 0.12, 0.03, 500);
        break;
      case "evidence":
        this.tone(880, t, 0.08, "sine", 0.05);
        this.tone(1108.73, t + 0.06, 0.08, "sine", 0.05);
        this.tone(1318.51, t + 0.12, 0.2, "sine", 0.05);
        this.noise(t + 0.12, 0.1, 0.02, 3000);
        break;
      case "hint":
        this.tone(700, t, 0.08, "triangle", 0.05);
        this.tone(920, t + 0.08, 0.14, "triangle", 0.05);
        break;
      case "transition":
        this.tone(110, t, 0.4, "sine", 0.06);
        this.tone(220, t + 0.05, 0.4, "sine", 0.04);
        this.noise(t, 0.4, 0.03, 400);
        break;
      case "accuse":
        this.tone(146.83, t, 0.3, "sawtooth", 0.06);
        this.tone(220, t, 0.3, "sine", 0.04);
        this.noise(t, 0.3, 0.04, 600);
        break;
      case "solved":
        this.tone(523.25, t, 0.18, "sine", 0.07);
        this.tone(659.25, t + 0.14, 0.18, "sine", 0.07);
        this.tone(783.99, t + 0.28, 0.18, "sine", 0.07);
        this.tone(1046.5, t + 0.42, 0.5, "sine", 0.08);
        this.noise(t + 0.42, 0.5, 0.02, 4000);
        break;
    }
  }
}

let _engine: AudioEngine | null = null;
export function getAudioEngine(): AudioEngine {
  if (typeof window === "undefined") {
    return new AudioEngine();
  }
  if (!_engine) _engine = new AudioEngine();
  return _engine;
}
