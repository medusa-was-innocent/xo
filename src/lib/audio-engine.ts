import { albumQuery, bodyById, type CelestialBody } from "./catalog";
import { fetchPreviews } from "./itunes";
import { audioEnergy } from "./runtime";
import { fetchAlbumTracks, type ScHit } from "./soundcloud";
import { youtubeIdFor } from "./youtube";
import { useUniverse } from "./store";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export type ScWidget = {
  bind: (event: string, listener: (data?: { currentPosition?: number }) => void) => void;
  unbind: (event: string) => void;
  load: (url: string, options?: Record<string, unknown>) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (ms: number) => void;
  setVolume: (v: number) => void;
  getDuration: (cb: (ms: number) => void) => void;
  getPosition: (cb: (ms: number) => void) => void;
  isPaused: (cb: (p: boolean) => void) => void;
  getCurrentSound?: (cb: (sound: { duration?: number; permalink_url?: string } | null) => void) => void;
};

type Status = "idle" | "loading" | "playing" | "paused" | "buffering" | "restricted" | "error";

class AudioEngine {
  widget: ScWidget | null = null;
  events: {
    READY: string;
    PLAY: string;
    PAUSE: string;
    FINISH: string;
    PLAY_PROGRESS: string;
    ERROR?: string;
  } | null = null;
  ready = false;
  waiters: Array<() => void> = [];
  playWaiters: Array<(ok: boolean) => void> = [];
  bpm = 120;
  durationMs = 0;
  loadGen = 0;
  raf = 0;
  lastPos = 0;
  meterOn = false;
  currentUrl: string | null = null;
  poll = 0;
  finishGuard = 0;
  el: HTMLAudioElement | null = null;
  ctx: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  freq: Uint8Array<ArrayBuffer> | null = null;
  hooked = false;
  using: "itunes" | "soundcloud" | "youtube" | null = null;
  yt: {
    getVideoUrl?: () => string;
    loadVideoById: (id: string, startSeconds?: number) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    seekTo: (s: number, allow: boolean) => void;
    setVolume: (n: number) => void;
    mute: () => void;
    unMute: () => void;
    getCurrentTime: () => number;
    getDuration: () => number;
  } | null = null;
  ytReady = false;
  ytWaiters: Array<() => void> = [];
  ytId: string | null = null;

  ensureEl() {
    if (this.el) return this.el;
    if (typeof window === "undefined") throw new Error("ssr");
    const el = new Audio();
    el.preload = "auto";
    el.crossOrigin = "anonymous";
    el.addEventListener("timeupdate", () => {
      if (this.using !== "itunes") return;
      const d = el.duration;
      if (Number.isFinite(d) && d > 0) {
        this.lastPos = el.currentTime * 1000;
        this.durationMs = d * 1000;
        useUniverse.getState().setProgress(el.currentTime, d);
      }
    });
    el.addEventListener("playing", () => {
      if (this.using !== "itunes") return;
      useUniverse.getState().setIsPlaying(true);
      useUniverse.getState().setPlaybackStatus("playing");
      this.startMeter();
    });
    el.addEventListener("pause", () => {
      if (this.using !== "itunes") return;
      const st = useUniverse.getState();
      if (st.playbackStatus === "loading" || st.playbackStatus === "buffering") return;
      st.setIsPlaying(false);
      if (st.playbackStatus === "playing") st.setPlaybackStatus("paused");
    });
    el.addEventListener("ended", () => {
      if (this.using !== "itunes") return;
      if (useUniverse.getState().loop) {
        el.currentTime = 0;
        void el.play();
        return;
      }
      void this.skip(1);
    });
    el.addEventListener("error", () => {
      if (this.using !== "itunes") return;
      useUniverse.getState().setIsPlaying(false);
      useUniverse.getState().setPlaybackStatus("error");
    });
    this.el = el;
    return el;
  }

  attach(
    widget: ScWidget,
    events: {
      READY: string;
      PLAY: string;
      PAUSE: string;
      FINISH: string;
      PLAY_PROGRESS: string;
      ERROR?: string;
    },
  ) {
    this.widget = widget;
    this.events = events;
    widget.bind(events.READY, () => {
      this.ready = true;
      this.waiters.splice(0).forEach((fn) => fn());
      const { volume, muted } = useUniverse.getState();
      widget.setVolume(muted ? 0 : Math.round(volume * 100));
    });
    widget.bind(events.PLAY, () => {
      if (this.using !== "soundcloud") return;
      this.playWaiters.splice(0).forEach((fn) => fn(true));
      useUniverse.getState().setIsPlaying(true);
      useUniverse.getState().setPlaybackStatus("playing");
      this.startMeter();
      this.startPoll();
    });
    widget.bind(events.PAUSE, () => {
      if (this.using !== "soundcloud") return;
      const st = useUniverse.getState();
      if (st.playbackStatus === "loading" || st.playbackStatus === "buffering") return;
      st.setIsPlaying(false);
      if (st.playbackStatus === "playing") st.setPlaybackStatus("paused");
    });
    widget.bind(events.PLAY_PROGRESS, (progress) => {
      if (this.using !== "soundcloud") return;
      const ms = progress?.currentPosition ?? 0;
      this.applyProgress(ms);
    });
    widget.bind(events.FINISH, () => {
      if (this.using !== "soundcloud") return;
      const gen = this.loadGen;
      window.setTimeout(() => {
        if (gen !== this.loadGen) return;
        const st = useUniverse.getState();
        if (st.loop) {
          widget.seekTo(0);
          widget.play();
          return;
        }
        void this.skip(1);
      }, 40);
    });
    if (events.ERROR) {
      widget.bind(events.ERROR, () => {
        this.playWaiters.splice(0).forEach((fn) => fn(false));
        if (this.using !== "soundcloud") return;
        const st = useUniverse.getState();
        st.setIsPlaying(false);
        st.setPlaybackStatus("error");
      });
    }
  }

  applyProgress(ms: number) {
    this.lastPos = ms;
    const dur = this.durationMs > 0 ? this.durationMs : 0;
    useUniverse.getState().setProgress(ms / 1000, dur / 1000);
    if (dur > 4000 && ms >= dur - 350 && useUniverse.getState().isPlaying) {
      if (this.finishGuard === this.loadGen) return;
      this.finishGuard = this.loadGen;
      const st = useUniverse.getState();
      if (st.loop) {
        this.widget?.seekTo(0);
        this.widget?.play();
        return;
      }
      void this.skip(1);
    }
  }

  whenReady() {
    if (this.ready) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const t = window.setTimeout(() => reject(new Error("widget")), 10000);
      this.waiters.push(() => {
        window.clearTimeout(t);
        resolve();
      });
    });
  }

  attachYoutube(player: NonNullable<AudioEngine["yt"]>) {
    this.yt = player;
    this.ytReady = true;
    this.ytWaiters.splice(0).forEach((fn) => fn());
    const { volume, muted } = useUniverse.getState();
    try {
      player.setVolume(muted ? 0 : Math.round(volume * 100));
      if (muted) player.mute();
      else player.unMute();
    } catch {
      /* ignore */
    }
  }

  whenYtReady() {
    if (this.ytReady && this.yt) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const t = window.setTimeout(() => reject(new Error("yt-widget")), 12000);
      this.ytWaiters.push(() => {
        window.clearTimeout(t);
        resolve();
      });
    });
  }

  onYoutubeState(data: number) {
    if (this.using !== "youtube") return;
    const st = useUniverse.getState();
    if (data === 1) {
      this.playWaiters.splice(0).forEach((fn) => fn(true));
      st.setIsPlaying(true);
      st.setPlaybackStatus("playing");
      st.setPlaySource("youtube");
      this.startMeter();
      this.startYtPoll();
      try {
        const d = this.yt?.getDuration() ?? 0;
        if (d > 0) {
          this.durationMs = d * 1000;
          st.setProgress(this.lastPos / 1000, d);
        }
      } catch {
        /* ignore */
      }
    } else if (data === 2) {
      if (st.playbackStatus === "loading" || st.playbackStatus === "buffering") return;
      st.setIsPlaying(false);
      if (st.playbackStatus === "playing") st.setPlaybackStatus("paused");
    } else if (data === 3) {
      st.setPlaybackStatus("buffering");
    } else if (data === 0) {
      if (st.loop) {
        this.yt?.seekTo(0, true);
        this.yt?.playVideo();
        return;
      }
      void this.skip(1);
    }
  }

  onYoutubeError(code?: number) {
    if (this.using !== "youtube") return;
    if (code !== 100 && code !== 101 && code !== 150 && code !== 153) return;
    this.playWaiters.splice(0).forEach((fn) => fn(false));
  }

  startYtPoll() {
    this.startPoll();
  }

  async playYoutube(id: string, bpm: number, bodyId: string) {
    if (!this.yt || !this.ytReady) await this.whenYtReady();
    if (!this.yt) throw new Error("no-yt");
    this.using = "youtube";
    this.el?.pause();
    try {
      this.widget?.pause();
    } catch {
      /* ignore */
    }
    this.bpm = bpm;
    this.loadGen += 1;
    const gen = this.loadGen;
    this.ytId = id;
    this.lastPos = 0;
    this.durationMs = 0;
    audioEnergy.playingBodyId = bodyId;
    useUniverse.getState().setPlaySource("youtube");
    useUniverse.getState().setPlaybackStatus("loading");
    useUniverse.getState().setProgress(0, 0);
    const { volume, muted } = useUniverse.getState();
    this.yt.setVolume(muted ? 0 : Math.round(volume * 100));
    if (muted) this.yt.mute();
    else this.yt.unMute();
    this.yt.loadVideoById(id, 0);
    this.yt.playVideo();
    const ok = await this.waitForPlay(5000);
    if (gen !== this.loadGen) return;
    if (!ok) {
      try {
        this.yt.pauseVideo();
      } catch {
        /* ignore */
      }
      this.using = null;
      throw new Error("yt-fail");
    }
  }

  unlock() {
    const el = this.ensureEl();
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!this.ctx) this.ctx = new AC({ latencyHint: "playback" });
    if (this.ctx.state === "suspended") void this.ctx.resume();
    if (!this.hooked && this.ctx) {
      try {
        const src = this.ctx.createMediaElementSource(el);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.72;
        src.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
        this.freq = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
        this.hooked = true;
      } catch {
        /* already connected */
      }
    }
    this.startMeter();
  }

  startMeter() {
    if (this.meterOn) return;
    this.meterOn = true;
    const tick = () => {
      const playing = useUniverse.getState().isPlaying;
      if (playing && this.analyser && this.freq) {
        this.analyser.getByteFrequencyData(this.freq);
        let bass = 0;
        let mid = 0;
        const n = this.freq.length;
        const bN = Math.max(4, Math.floor(n * 0.12));
        for (let i = 0; i < bN; i++) bass += this.freq[i] ?? 0;
        for (let i = bN; i < bN * 3; i++) mid += this.freq[i] ?? 0;
        audioEnergy.bass = clamp01(bass / (bN * 220));
        audioEnergy.mid = clamp01(mid / (bN * 2 * 210));
        audioEnergy.level = clamp01(audioEnergy.bass * 0.7 + audioEnergy.mid * 0.35);
      } else if (playing && this.using === "youtube") {
        const pulse = 0.22 + Math.abs(Math.sin(Date.now() / 280)) * 0.28;
        audioEnergy.level = pulse;
        audioEnergy.bass = pulse * 0.85;
        audioEnergy.mid = pulse * 0.55;
      } else if (!playing) {
        audioEnergy.level *= 0.9;
        audioEnergy.bass *= 0.9;
        audioEnergy.mid *= 0.9;
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  startPoll() {
    if (this.poll) return;
    this.poll = window.setInterval(() => {
      const st = useUniverse.getState();
      if (!st.isPlaying && st.playbackStatus !== "loading" && st.playbackStatus !== "buffering") return;
      if (this.using === "youtube" && this.yt) {
        try {
          const t = this.yt.getCurrentTime();
          const d = this.yt.getDuration();
          if (Number.isFinite(t)) this.lastPos = t * 1000;
          if (Number.isFinite(d) && d > 0) this.durationMs = d * 1000;
          st.setProgress(t || 0, d || 0);
        } catch {
          /* ignore */
        }
        return;
      }
      if (!this.widget || this.using !== "soundcloud") return;
      this.widget.getPosition((ms) => {
        if (typeof ms === "number" && ms >= 0) this.applyProgress(ms);
      });
      this.widget.getDuration((d) => {
        if (d && d !== this.durationMs) {
          this.durationMs = d;
          useUniverse.getState().setProgress(this.lastPos / 1000, d / 1000);
        }
      });
    }, 450);
  }

  setVolume(v: number, muted: boolean) {
    const gain = muted ? 0 : Math.min(1, Math.max(0, v));
    if (this.el) this.el.volume = gain;
    try {
      this.widget?.setVolume(Math.round(gain * 100));
    } catch {
      /* widget not ready */
    }
    try {
      if (this.yt) {
        this.yt.setVolume(Math.round(gain * 100));
        if (muted) this.yt.mute();
        else this.yt.unMute();
      }
    } catch {
      /* yt not ready */
    }
  }

  waitForPlay(ms: number) {
    return new Promise<boolean>((resolve) => {
      const t = window.setTimeout(() => {
        this.playWaiters = this.playWaiters.filter((fn) => fn !== sink);
        resolve(false);
      }, ms);
      const sink = (ok: boolean) => {
        window.clearTimeout(t);
        resolve(ok);
      };
      this.playWaiters.push(sink);
    });
  }

  async playItunes(url: string, bpm: number, bodyId: string) {
    this.unlock();
    this.using = "itunes";
    this.bpm = bpm;
    this.loadGen += 1;
    this.currentUrl = url;
    audioEnergy.playingBodyId = bodyId;
    this.widget?.pause();
    this.yt?.pauseVideo();
    const el = this.ensureEl();
    const { volume, muted } = useUniverse.getState();
    el.volume = muted ? 0 : volume;
    useUniverse.getState().setPlaybackStatus("loading");
    useUniverse.getState().setProgress(0, 30);
    el.src = `/api/audio?src=${encodeURIComponent(url)}`;
    el.currentTime = 0;
    await el.play();
  }

  async playSoundCloud(url: string, bpm: number, bodyId: string) {
    await this.whenReady();
    if (!this.widget) throw new Error("no-widget");
    this.using = "soundcloud";
    this.el?.pause();
    this.yt?.pauseVideo();

    if (this.currentUrl === url && this.durationMs > 0) {
      this.bpm = bpm;
      audioEnergy.playingBodyId = bodyId;
      useUniverse.getState().setPlaybackStatus("buffering");
      this.widget.play();
      const ok = await this.waitForPlay(3500);
      if (!ok) this.widget.play();
      return;
    }

    this.bpm = bpm;
    this.loadGen += 1;
    const gen = this.loadGen;
    this.finishGuard = 0;
    this.lastPos = 0;
    this.durationMs = 0;
    this.currentUrl = url;
    const { volume, muted } = useUniverse.getState();
    this.widget.setVolume(muted ? 0 : Math.round(volume * 100));
    useUniverse.getState().setProgress(0, 0);
    useUniverse.getState().setPlaybackStatus("loading");
    audioEnergy.playingBodyId = bodyId;
    this.startPoll();

    const playGate = this.waitForPlay(14000);
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("timeout")), 14000);
      this.widget!.load(url, {
        auto_play: true,
        show_artwork: false,
        buying: false,
        sharing: false,
        download: false,
        show_user: false,
        hide_related: true,
        visual: false,
        callback: () => {
          if (gen !== this.loadGen) return;
          window.clearTimeout(timeout);
          this.widget!.getDuration((d) => {
            this.durationMs = d || 0;
            useUniverse.getState().setProgress(this.lastPos / 1000, (d || 0) / 1000);
          });
          this.widget!.setVolume(muted ? 0 : Math.round(volume * 100));
          resolve();
        },
      });
    });

    if (gen !== this.loadGen) return;
    if (useUniverse.getState().isPlaying) {
      useUniverse.getState().setPlaybackStatus("playing");
      return;
    }
    useUniverse.getState().setPlaybackStatus("buffering");
    this.widget.play();
    let started = await Promise.race([playGate, this.waitForPlay(2800)]);
    if (gen !== this.loadGen) return;
    if (useUniverse.getState().isPlaying) return;
    if (!started) {
      this.widget.play();
      started = await this.waitForPlay(3200);
    }
    if (gen !== this.loadGen) return;
    if (!started) {
      const paused = await new Promise<boolean>((resolve) => {
        window.setTimeout(() => {
          this.widget!.isPaused((p) => resolve(p));
        }, 200);
      });
      if (paused) {
        useUniverse.getState().setIsPlaying(false);
        useUniverse.getState().setPlaybackStatus("restricted");
        throw new Error("restricted");
      }
    }
  }

  async play(opts: {
    youtubeId?: string | null;
    previewUrl?: string | null;
    scUrl?: string | null;
    bpm: number;
    bodyId: string;
  }) {
    if (opts.youtubeId) {
      try {
        await this.playYoutube(opts.youtubeId, opts.bpm, opts.bodyId);
        return;
      } catch {
        /* fall through */
      }
    }
    if (opts.previewUrl) {
      useUniverse.getState().setPlaySource("itunes");
      await this.playItunes(opts.previewUrl, opts.bpm, opts.bodyId);
      return;
    }
    if (opts.scUrl) {
      useUniverse.getState().setPlaySource("soundcloud");
      await this.playSoundCloud(opts.scUrl, opts.bpm, opts.bodyId);
      return;
    }
    throw new Error("no-source");
  }

  pause() {
    if (this.using === "itunes") {
      this.el?.pause();
      useUniverse.getState().setIsPlaying(false);
      useUniverse.getState().setPlaybackStatus("paused");
      return;
    }
    if (this.using === "youtube") {
      this.yt?.pauseVideo();
      useUniverse.getState().setIsPlaying(false);
      useUniverse.getState().setPlaybackStatus("paused");
      return;
    }
    this.widget?.pause();
    useUniverse.getState().setIsPlaying(false);
    useUniverse.getState().setPlaybackStatus("paused");
  }

  toggle() {
    const st = useUniverse.getState();
    if (st.isPlaying) {
      this.pause();
      return;
    }
    if (this.using === "youtube" && this.ytId) {
      this.yt?.playVideo();
      return;
    }
    if (this.using === "itunes" && this.el?.src) {
      this.unlock();
      st.setPlaybackStatus("buffering");
      void this.el.play();
      return;
    }
    if (!st.nowPlaying) return;
    void playCatalogTrack(st.nowPlaying.bodyId, st.nowPlaying.track.title);
  }

  seek(t: number) {
    if (!Number.isFinite(t)) return;
    if (this.using === "youtube" && this.yt) {
      this.yt.seekTo(t, true);
      this.lastPos = t * 1000;
      useUniverse.getState().setProgress(t, this.durationMs / 1000);
      return;
    }
    if (this.using === "itunes" && this.el) {
      this.el.currentTime = t;
      this.lastPos = t * 1000;
      useUniverse.getState().setProgress(t, this.durationMs / 1000);
      return;
    }
    if (!this.widget) return;
    this.widget.seekTo(t * 1000);
    this.lastPos = t * 1000;
    useUniverse.getState().setProgress(t, this.durationMs / 1000);
  }

  async skip(dir: 1 | -1) {
    const st = useUniverse.getState();
    const np = st.nowPlaying;
    if (!np) return;
    const body = bodyById(np.bodyId);
    if (!body) return;
    const idx = body.tracks.findIndex((t) => t.title === np.track.title);
    if (idx < 0) return;
    for (let step = 1; step <= body.tracks.length; step++) {
      const next = body.tracks[(idx + dir * step + body.tracks.length * 8) % body.tracks.length];
      if (!next) continue;
      const yt = youtubeIdFor(next.title);
      const preview = st.itunesByTitle[next.title];
      const hit = st.scByTitle[next.title];
      if (!yt && !preview && !hit?.permalink) continue;
      if (!yt && hit?.policy === "BLOCK" && !preview) continue;
      st.setNowPlaying({
        bodyId: body.id,
        track: next,
        permalink: hit?.permalink ?? null,
        artwork: hit?.artwork ?? null,
      });
      st.setPlaybackStatus("loading");
      try {
        await playCatalogTrack(body.id, next.title);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg === "restricted") {
          st.setPlaybackStatus("restricted");
          st.setIsPlaying(false);
          continue;
        }
        st.setIsPlaying(false);
        st.setPlaybackStatus("error");
        continue;
      }
      return;
    }
    st.setIsPlaying(false);
    st.setPlaybackStatus("paused");
    st.setProgress(0, this.durationMs / 1000);
    audioEnergy.level = 0;
    audioEnergy.bass = 0;
    audioEnergy.playingBodyId = null;
  }
}

export const audioEngine = new AudioEngine();
export type PlaybackStatus = Status;

export async function playCatalogTrack(bodyId: CelestialBody["id"], title: string) {
  const body = bodyById(bodyId);
  if (!body) return;
  const track = body.tracks.find((t) => t.title === title);
  if (!track) return;
  const st = useUniverse.getState();
  const yt = youtubeIdFor(title);
  let preview = st.itunesByTitle[title] ?? null;
  let hit: ScHit | null = st.scByTitle[title] ?? null;

  const pending =
    preview && hit?.permalink
      ? null
      : Promise.all([
          fetchAlbumTracks(albumQuery(body.name, body.id), body.tracks).catch(
            () => ({}) as Record<string, ScHit | null>,
          ),
          fetchPreviews(albumQuery(body.name, body.id), body.tracks).catch(
            () => ({}) as Record<string, string | null>,
          ),
        ]).then(([sc, itunes]) => {
          useUniverse.getState().setScByTitle(sc);
          useUniverse.getState().setItunesByTitle(itunes);
          return {
            preview: itunes[title] ?? preview,
            hit: sc[title] ?? hit,
          };
        });

  st.setNowPlaying({
    bodyId: body.id,
    track,
    permalink: hit?.permalink ?? null,
    artwork: hit?.artwork ?? null,
  });

  try {
    await audioEngine.play({
      youtubeId: yt,
      previewUrl: preview,
      scUrl: hit?.permalink ?? null,
      bpm: body.bpm,
      bodyId: body.id,
    });
  } catch (err) {
    const fb = pending ? await pending : null;
    const nextPreview = fb?.preview ?? preview;
    const nextHit = fb?.hit ?? hit;
    if (!nextPreview && !nextHit?.permalink) throw err;
    useUniverse.getState().setNowPlaying({
      bodyId: body.id,
      track,
      permalink: nextHit?.permalink ?? null,
      artwork: nextHit?.artwork ?? null,
    });
    await audioEngine.play({
      previewUrl: nextPreview,
      scUrl: nextHit?.permalink ?? null,
      bpm: body.bpm,
      bodyId: body.id,
    });
  }
}
