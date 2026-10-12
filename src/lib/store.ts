import { create } from "zustand";
import { bodyById, type BodyId, type Track } from "./catalog";
import type { ScHit } from "./soundcloud";
import { sfx } from "./sfx";

export type NowPlaying = {
  bodyId: BodyId;
  track: Track;
  permalink: string | null;
  artwork: string | null;
};

export type PanelMode = "tracks" | "facts";
export type PlaybackStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "buffering"
  | "restricted"
  | "error";
export type LibraryStatus = "idle" | "loading" | "ready" | "error";
export type PlaySource = "youtube" | "itunes" | "soundcloud" | null;

type PersistV1 = {
  v: 1;
  selectedId: BodyId | null;
  volume: number;
  muted: boolean;
  loop: boolean;
  lastTrack: {
    bodyId: BodyId;
    title: string;
    permalink: string | null;
    artwork: string | null;
  } | null;
};

const PERSIST_KEY = "xo-universe-v1";

function readPersist(): PersistV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as PersistV1;
    if (d?.v !== 1) return null;
    return d;
  } catch {
    return null;
  }
}

function writePersist(s: {
  selectedId: BodyId | null;
  volume: number;
  muted: boolean;
  loop: boolean;
  nowPlaying: NowPlaying | null;
}) {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistV1 = {
      v: 1,
      selectedId: s.selectedId,
      volume: s.volume,
      muted: s.muted,
      loop: s.loop,
      lastTrack: s.nowPlaying
        ? {
            bodyId: s.nowPlaying.bodyId,
            title: s.nowPlaying.track.title,
            permalink: s.nowPlaying.permalink,
            artwork: s.nowPlaying.artwork,
          }
        : null,
    };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
}

type UniverseStore = {
  entered: boolean;
  selectedId: BodyId | null;
  creditsOpen: boolean;
  lyricsOpen: boolean;
  speed: number;
  showOrbits: boolean;
  showLabels: boolean;
  orbitsPaused: boolean;
  nowPlaying: NowPlaying | null;
  isPlaying: boolean;
  playbackStatus: PlaybackStatus;
  playSource: PlaySource;
  progress: number;
  duration: number;
  volume: number;
  muted: boolean;
  loop: boolean;
  panelMode: PanelMode;
  libraryStatus: LibraryStatus;
  scByTitle: Record<string, ScHit | null>;
  itunesByTitle: Record<string, string | null>;
  bootProgress: number;
  bootLabel: string;
  bootReady: boolean;
  customCovers: Record<string, string>;
  enter: () => void;
  select: (id: BodyId | null) => void;
  toggleCredits: (open?: boolean) => void;
  toggleLyrics: (open?: boolean) => void;
  setSpeed: (speed: number) => void;
  setShowOrbits: (v: boolean) => void;
  setShowLabels: (v: boolean) => void;
  setOrbitsPaused: (v: boolean) => void;
  setNowPlaying: (np: NowPlaying | null) => void;
  setIsPlaying: (v: boolean) => void;
  setPlaybackStatus: (s: PlaybackStatus) => void;
  setPlaySource: (s: PlaySource) => void;
  setProgress: (progress: number, duration: number) => void;
  setVolume: (v: number) => void;
  setMuted: (v: boolean) => void;
  setLoop: (v: boolean) => void;
  setPanelMode: (v: PanelMode) => void;
  setLibraryStatus: (s: LibraryStatus) => void;
  setScByTitle: (map: Record<string, ScHit | null>) => void;
  setItunesByTitle: (map: Record<string, string | null>) => void;
  setBoot: (progress: number, label: string, ready?: boolean) => void;
  hydrateCovers: (map: Record<string, string>) => void;
  setCustomCover: (id: BodyId, url: string) => void;
  clearCustomCover: (id: BodyId) => void;
};

const persisted = readPersist();

export const useUniverse = create<UniverseStore>((set) => ({
  entered: false,
  selectedId: null,
  creditsOpen: false,
  lyricsOpen: false,
  speed: 1,
  showOrbits: true,
  showLabels: true,
  orbitsPaused: false,
  nowPlaying: null,
  isPlaying: false,
  playbackStatus: "idle",
  playSource: null as PlaySource,
  progress: 0,
  duration: 0,
  volume: persisted?.volume ?? 0.85,
  muted: persisted?.muted ?? false,
  loop: persisted?.loop ?? false,
  panelMode: "tracks",
  libraryStatus: "idle",
  scByTitle: {},
  itunesByTitle: {},
  bootProgress: 0,
  bootLabel: "Opening the night",
  bootReady: false,
  customCovers: {},
  enter: () => {
    const p = readPersist();
    const last = p?.lastTrack;
    const body = last ? bodyById(last.bodyId) : null;
    const track = body?.tracks.find((t) => t.title === last?.title);
    set({
      entered: true,
      selectedId: p?.selectedId ?? null,
      volume: p?.volume ?? 0.85,
      muted: p?.muted ?? false,
      loop: p?.loop ?? false,
      nowPlaying:
        body && track && last
          ? {
              bodyId: last.bodyId,
              track,
              permalink: last.permalink,
              artwork: last.artwork,
            }
          : null,
      isPlaying: false,
      playbackStatus: "idle",
    });
  },
  select: (id) => {
    if (id) sfx.whoosh();
    set({ selectedId: id, creditsOpen: false, panelMode: "tracks" });
  },
  toggleCredits: (open) =>
    set((s) => {
      const creditsOpen = open ?? !s.creditsOpen;
      return { creditsOpen, lyricsOpen: creditsOpen ? false : s.lyricsOpen };
    }),
  toggleLyrics: (open) =>
    set((s) => {
      const lyricsOpen = open ?? !s.lyricsOpen;
      return { lyricsOpen, creditsOpen: lyricsOpen ? false : s.creditsOpen };
    }),
  setSpeed: (speed) => set({ speed }),
  setShowOrbits: (showOrbits) => set({ showOrbits }),
  setShowLabels: (showLabels) => set({ showLabels }),
  setOrbitsPaused: (orbitsPaused) => set({ orbitsPaused }),
  setNowPlaying: (nowPlaying) => set({ nowPlaying }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackStatus: (playbackStatus) => set({ playbackStatus }),
  setPlaySource: (playSource) => set({ playSource }),
  setProgress: (progress, duration) => set({ progress, duration }),
  setVolume: (volume) => set({ volume, muted: volume === 0 }),
  setMuted: (muted) => set({ muted }),
  setLoop: (loop) => set({ loop }),
  setPanelMode: (panelMode) => set({ panelMode }),
  setLibraryStatus: (libraryStatus) => set({ libraryStatus }),
  setScByTitle: (scByTitle) => set((s) => ({ scByTitle: { ...s.scByTitle, ...scByTitle } })),
  setItunesByTitle: (itunesByTitle) =>
    set((s) => ({ itunesByTitle: { ...s.itunesByTitle, ...itunesByTitle } })),
  setBoot: (bootProgress, bootLabel, bootReady) =>
    set((s) => ({
      bootProgress,
      bootLabel,
      bootReady: bootReady ?? s.bootReady,
    })),
  hydrateCovers: (customCovers) => set({ customCovers }),
  setCustomCover: (id, url) =>
    set((s) => {
      const prev = s.customCovers[id];
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return { customCovers: { ...s.customCovers, [id]: url } };
    }),
  clearCustomCover: (id) =>
    set((s) => {
      const prev = s.customCovers[id];
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      const next = { ...s.customCovers };
      delete next[id];
      return { customCovers: next };
    }),
}));

if (typeof window !== "undefined") {
  let timer = 0;
  useUniverse.subscribe((s) => {
    if (!s.entered) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      writePersist(s);
    }, 280);
  });
}
