import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { bodyById } from "@/lib/catalog";
import { audioEngine, playCatalogTrack } from "@/lib/audio-engine";
import { useUniverse } from "@/lib/store";

const SIDE_KEY = "xo-mini-player-side";

function readSide(): "left" | "right" {
  if (typeof window === "undefined") return "left";
  try {
    return localStorage.getItem(SIDE_KEY) === "right" ? "right" : "left";
  } catch {
    return "left";
  }
}

function writeSide(side: "left" | "right") {
  try {
    localStorage.setItem(SIDE_KEY, side);
  } catch {
    /* private */
  }
}

export function MiniPlayer() {
  const nowPlaying = useUniverse((s) => s.nowPlaying);
  const isPlaying = useUniverse((s) => s.isPlaying);
  const playbackStatus = useUniverse((s) => s.playbackStatus);
  const selectedId = useUniverse((s) => s.selectedId);
  const select = useUniverse((s) => s.select);
  const progress = useUniverse((s) => s.progress);
  const duration = useUniverse((s) => s.duration);
  const volume = useUniverse((s) => s.volume);
  const muted = useUniverse((s) => s.muted);
  const playSource = useUniverse((s) => s.playSource);
  const setVolume = useUniverse((s) => s.setVolume);
  const setMuted = useUniverse((s) => s.setMuted);
  const customCovers = useUniverse((s) => s.customCovers);
  const [side, setSide] = useState<"left" | "right">("left");
  const [volOpen, setVolOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const visible = Boolean(nowPlaying && !selectedId);

  useEffect(() => {
    setSide(readSide());
  }, []);

  useEffect(() => {
    const root = wrap.current?.parentElement;
    if (!root?.classList.contains("bottom-chrome")) return;
    root.classList.toggle("is-player-end", side === "right");
    return () => root.classList.remove("is-player-end");
  }, [side, visible]);

  useEffect(() => {
    if (!volOpen) return;
    const close = (e: Event) => {
      const t = e.target as Node | null;
      if (wrap.current && t && wrap.current.contains(t)) return;
      setVolOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [volOpen]);

  useEffect(() => {
    if (!visible) return;
    const el = wrap.current;
    if (!el) return;
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("button, a, input, .mini-vol")) return;
      drag.current = { x: e.clientX, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      if (Math.abs(e.clientX - drag.current.x) > 12) drag.current.moved = true;
    };
    const up = (e: PointerEvent) => {
      if (!drag.current) return;
      if (drag.current.moved) {
        const next = e.clientX > window.innerWidth * 0.5 ? "right" : "left";
        setSide(next);
        writeSide(next);
      }
      drag.current = null;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [visible]);

  if (!nowPlaying || selectedId) return null;
  const body = bodyById(nowPlaying.bodyId);
  if (!body) return null;
  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;
  const waiting = playbackStatus === "loading" || playbackStatus === "buffering";
  const cover = customCovers[body.id] || nowPlaying.artwork || body.cover;
  const album = body.id === "sun" ? "XO" : body.name;
  const sub =
    playbackStatus === "restricted"
      ? "Restricted · try another track"
      : waiting
        ? "Buffering…"
        : playSource === "youtube"
          ? `${body.planet} · video`
          : `${body.planet} · ${album}`;

  const setGain = (v: number) => {
    const next = Math.min(1, Math.max(0, v));
    setVolume(next);
    setMuted(next === 0);
    audioEngine.setVolume(next, next === 0);
  };

  return (
    <div
      ref={wrap}
      className={`hud-hot mini-player glass-strong ${side === "right" ? "is-end" : ""}`}
    >
      <button
        type="button"
        className="size-11 shrink-0 overflow-hidden rounded-[14px]"
        onClick={() => select(body.id)}
        aria-label={`Open ${body.name}`}
      >
        <img src={cover} alt="" className="size-full object-cover" draggable={false} />
      </button>
      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => select(body.id)}>
        <p className="truncate text-sm font-medium">{nowPlaying.track.title}</p>
        <p className="truncate text-[11px] text-muted">{sub}</p>
        <span className="mini-progress" aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </span>
      </button>
      <div className={`mini-vol ${volOpen ? "is-open" : ""}`}>
        <button
          type="button"
          className="icon-btn size-9"
          aria-label={muted || volume === 0 ? "Unmute" : "Volume"}
          aria-expanded={volOpen}
          onClick={() => {
            if (volOpen) {
              const shouldMute = !(muted || volume === 0);
              if (shouldMute) {
                setMuted(true);
                audioEngine.setVolume(volume, true);
              } else {
                const v = volume > 0 ? volume : 0.7;
                setVolume(v);
                setMuted(false);
                audioEngine.setVolume(v, false);
              }
            } else {
              setVolOpen(true);
            }
          }}
        >
          {muted || volume === 0 ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
        </button>
        {volOpen ? (
          <div className="mini-vol-pop glass-strong" onPointerDown={(e) => e.stopPropagation()}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              aria-label="Volume"
              className="xo-range mini-vol-range"
              style={{
                background: `linear-gradient(to right, rgb(225 6 0) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.12) ${(muted ? 0 : volume) * 100}%)`,
              }}
              onChange={(e) => setGain(Number(e.target.value))}
            />
          </div>
        ) : null}
      </div>
      <button
        type="button"
        className="icon-btn size-9"
        aria-label="Previous"
        onClick={() => void audioEngine.skip(-1)}
      >
        <SkipBack className="size-3.5" />
      </button>
      <button
        type="button"
        className="play-fab size-10"
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={() => {
          if (!isPlaying && playbackStatus !== "paused") {
            void playCatalogTrack(body.id, nowPlaying.track.title);
            return;
          }
          audioEngine.toggle();
        }}
      >
        {waiting ? (
          <LoaderCircle className="size-3.5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5 translate-x-px" />
        )}
      </button>
      <button
        type="button"
        className="icon-btn size-9"
        aria-label="Next"
        onClick={() => void audioEngine.skip(1)}
      >
        <SkipForward className="size-3.5" />
      </button>
    </div>
  );
}
