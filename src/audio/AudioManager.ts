import { EventEmitter } from "pixi.js";
import { AUDIO } from "../config";

export type SoundName = "tick" | "clunk" | "error" | "chime";

export interface Whoosh {
  setSpeed(speed: number): void;
  stop(): void;
}

class AudioManager extends EventEmitter<{ mute: [boolean] }> {
  private ctx?: AudioContext;
  private master?: GainNode;
  private noise?: AudioBuffer;
  private isMuted = AudioManager.loadMuted();

  constructor() {
    super();

    window.addEventListener("pointerdown", this.unlock, true);
    window.addEventListener("keydown", this.unlock, true);
  }

  get muted() {
    return this.isMuted;
  }

  set muted(value: boolean) {
    this.isMuted = value;
    this.applyVolume();
    AudioManager.saveMuted(value);
    this.emit("mute", value);
  }

  unlock = () => {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.connect(this.ctx.destination);
      this.noise = this.createNoise(this.ctx);
      this.applyVolume();
    }

    if (this.ctx.state === "suspended") void this.ctx.resume();
  };

  play(name: SoundName) {
    const ctx = this.ready();

    if (!ctx) return;

    const t = ctx.currentTime;

    if (name === "tick") this.tick(ctx, t);
    else if (name === "clunk") this.clunk(ctx, t);
    else if (name === "error") this.error(ctx, t);
    else this.chime(ctx, t);
  }

  ledOn(index: number) {
    const ctx = this.ready();

    if (!ctx) return;

    const t = ctx.currentTime;
    const freq = 660 * Math.pow(2, (index * 4) / 12);
    const osc = this.osc(ctx, "sine", freq);
    const gain = this.envelope(ctx, t, 0.005, 0.18, 0.25);

    osc.frequency.setValueAtTime(freq * 0.8, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.04);
    osc.connect(gain);
    this.run(osc, t, 0.2);
  }

  whoosh(): Whoosh {
    const ctx = this.ready();

    if (!ctx || !this.noise) return { setSpeed: () => {}, stop: () => {} };

    const t = ctx.currentTime;
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    source.buffer = this.noise;
    source.loop = true;
    filter.type = "bandpass";
    filter.Q.value = 2.5;
    filter.frequency.value = 300;
    gain.gain.value = 0;
    source.connect(filter).connect(gain).connect(this.master!);
    source.start(t);

    return {
      setSpeed: (speed: number) => {
        const now = ctx.currentTime;
        const s = Math.min(Math.max(speed, 0), 1);

        filter.frequency.setTargetAtTime(250 + s * 2200, now, 0.03);
        gain.gain.setTargetAtTime(s * 0.35, now, 0.03);
      },
      stop: () => {
        const now = ctx.currentTime;

        gain.gain.cancelScheduledValues(now);
        gain.gain.setTargetAtTime(0, now, 0.05);
        source.stop(now + 0.3);
      },
    };
  }

  private tick(ctx: AudioContext, t: number) {
    const noise = this.noiseBurst(ctx, t, 0.04, 0.35);
    const filter = ctx.createBiquadFilter();
    const ping = this.osc(ctx, "sine", 2600);
    const pingGain = this.envelope(ctx, t, 0.001, 0.04, 0.12);

    filter.type = "highpass";
    filter.frequency.value = 1800;
    noise.source.connect(filter).connect(noise.gain);
    ping.connect(pingGain);
    this.run(ping, t, 0.05);
  }

  private clunk(ctx: AudioContext, t: number) {
    const osc = this.osc(ctx, "sine", 80);
    const gain = this.envelope(ctx, t, 0.004, 0.22, 0.9);
    const noise = this.noiseBurst(ctx, t, 0.12, 0.5);
    const filter = ctx.createBiquadFilter();

    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.2);
    osc.connect(gain);
    filter.type = "lowpass";
    filter.frequency.value = 600;
    noise.source.connect(filter).connect(noise.gain);
    this.run(osc, t, 0.25);
  }

  private error(ctx: AudioContext, t: number) {
    for (let i = 0; i < 2; i++) {
      const start = t + i * 0.16;

      for (const detune of [-12, 12]) {
        const osc = this.osc(ctx, "square", 155);
        const filter = ctx.createBiquadFilter();
        const gain = this.envelope(ctx, start, 0.005, 0.13, 0.08);

        osc.detune.value = detune;
        filter.type = "lowpass";
        filter.frequency.value = 1400;
        osc.connect(filter).connect(gain);
        this.run(osc, start, 0.14);
      }
    }
  }

  private chime(ctx: AudioContext, t: number) {
    const delay = ctx.createDelay();
    const feedback = ctx.createGain();
    const wet = ctx.createGain();
    const bus = ctx.createGain();

    delay.delayTime.value = 0.18;
    feedback.gain.value = 0.35;
    wet.gain.value = 0.4;
    bus.connect(this.master!);
    bus.connect(delay).connect(feedback).connect(delay);
    delay.connect(wet).connect(this.master!);

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const start = t + i * 0.09;

      for (const type of ["sine", "triangle"] as OscillatorType[]) {
        const osc = this.osc(ctx, type, freq);
        const gain = this.envelope(
          ctx,
          start,
          0.01,
          0.9,
          type === "sine" ? 0.18 : 0.08,
          bus,
        );

        osc.connect(gain);
        this.run(osc, start, 0.95);
      }
    });
  }

  private ready() {
    if (this.isMuted || !this.ctx || this.ctx.state !== "running") return;

    return this.ctx;
  }

  private osc(ctx: AudioContext, type: OscillatorType, freq: number) {
    const osc = ctx.createOscillator();

    osc.type = type;
    osc.frequency.value = freq;

    return osc;
  }

  private envelope(
    ctx: AudioContext,
    t: number,
    attack: number,
    release: number,
    peak: number,
    out: AudioNode = this.master!,
  ) {
    const gain = ctx.createGain();

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
    gain.connect(out);

    return gain;
  }

  private noiseBurst(
    ctx: AudioContext,
    t: number,
    duration: number,
    peak: number,
  ) {
    const source = ctx.createBufferSource();
    const gain = this.envelope(ctx, t, 0.002, duration, peak);

    source.buffer = this.noise!;
    this.run(source, t, duration + 0.01);

    return { source, gain };
  }

  private run(node: AudioScheduledSourceNode, t: number, duration: number) {
    node.start(t);
    node.stop(t + duration);
  }

  private createNoise(ctx: AudioContext) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    return buffer;
  }

  private applyVolume() {
    if (!this.master || !this.ctx) return;

    this.master.gain.setTargetAtTime(
      this.isMuted ? 0 : AUDIO.volume,
      this.ctx.currentTime,
      0.02,
    );
  }

  private static loadMuted() {
    try {
      return localStorage.getItem(AUDIO.storageKey) === "1";
    } catch {
      return false;
    }
  }

  private static saveMuted(value: boolean) {
    try {
      localStorage.setItem(AUDIO.storageKey, value ? "1" : "0");
      return true;
    } catch {
      return false;
    }
  }
}

export const audio = new AudioManager();
