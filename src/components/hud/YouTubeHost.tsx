import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { audioEngine } from "@/lib/audio-engine";
import { useUniverse } from "@/lib/store";

type YTPlayer = {
  loadVideoById: (id: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (s: number, allow: boolean) => void;
  setVolume: (n: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoUrl?: () => string;
  getPlayerState: () => number;
  setSize?: (w: number, h: number) => void;
  destroy: () => void;
  getIframe?: () => HTMLIFrameElement;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          height: string;
          width: string;
          host?: string;
          videoId?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
            onError?: (e: { data: number }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function loadApi() {
  if (window.YT?.Player) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (document.querySelector('script[data-yt-api="1"]')) return;
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    s.dataset.ytApi = "1";
    document.head.appendChild(s);
  });
}

type Box = { x: number; y: number; w: number; h: number };

const MIN_W = 200;
const MIN_H = 228;

function limits() {
  const maxW = Math.max(MIN_W, Math.min(window.innerWidth - 16, Math.round(window.innerWidth * 0.86)));
  const maxH = Math.max(MIN_H, Math.min(window.innerHeight - 16, Math.round(window.innerHeight * 0.72)));
  return { maxW, maxH };
}

function clampBox(b: Box): Box {
  const { maxW, maxH } = limits();
  const w = Math.min(maxW, Math.max(MIN_W, b.w));
  const h = Math.min(maxH, Math.max(MIN_H, b.h));
  const x = Math.min(Math.max(8, window.innerWidth - w - 8), Math.max(8, b.x));
  const y = Math.min(Math.max(8, window.innerHeight - h - 8), Math.max(8, b.y));
  return { x, y, w, h };
}

function defaultBox(): Box {
  const w = Math.min(360, Math.max(MIN_W, window.innerWidth - 32));
  return clampBox({ x: 16, y: window.innerHeight - MIN_H - 96, w, h: MIN_H });
}

export function YouTubeHost() {
  const mount = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const boxRef = useRef<Box>({ x: 16, y: 80, w: 320, h: MIN_H });
  const [box, setBox] = useState<Box>(() => {
    if (typeof window === "undefined") return { x: 16, y: 80, w: 320, h: MIN_H };
    try {
      const raw = localStorage.getItem("xo-yt-box");
      if (raw) {
        const parsed = JSON.parse(raw) as Box;
        if (parsed && typeof parsed.w === "number") return clampBox(parsed);
      }
    } catch {
      /* ignore */
    }
    return defaultBox();
  });
  boxRef.current = box;
  const [moving, setMoving] = useState(false);
  const source = useUniverse((s) => s.playSource);
  const playing = useUniverse((s) => s.isPlaying);
  const creditsOpen = useUniverse((s) => s.creditsOpen);
  const entered = useUniverse((s) => s.entered);
  const visible = entered && source === "youtube" && !creditsOpen;
  const live = visible && playing;

  const place = (next: Box) => {
    const clamped = clampBox(next);
    boxRef.current = clamped;
    setBox(clamped);
  };

  useEffect(() => {
    try {
      localStorage.setItem("xo-yt-box", JSON.stringify(box));
    } catch {
      /* ignore */
    }
    const videoH = Math.max(200, box.h - 28);
    try {
      player.current?.setSize?.(box.w, videoH);
    } catch {
      /* ignore */
    }
  }, [box]);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let dead = false;
    void loadApi().then(() => {
      if (dead || !window.YT?.Player || player.current) return;
      const iframe = document.createElement("iframe");
      iframe.className = "yt-frame";
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      iframe.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
      );
      iframe.style.touchAction = "manipulation";
      const origin = encodeURIComponent(window.location.origin);
      iframe.src = `https://www.youtube-nocookie.com/embed/4NRXx6U8ABQ?enablejsapi=1&playsinline=1&rel=0&modestbranding=1&controls=1&fs=0&origin=${origin}`;
      el.appendChild(iframe);
      player.current = new window.YT.Player(iframe, {
        height: "200",
        width: "320",
        events: {
          onReady: (e) => {
            try {
              e.target.pauseVideo();
            } catch {
              /* ignore */
            }
            const videoH = Math.max(200, boxRef.current.h - 28);
            e.target.setSize?.(boxRef.current.w, videoH);
            audioEngine.attachYoutube(e.target);
          },
          onStateChange: (e) => audioEngine.onYoutubeState(e.data),
          onError: (e) => audioEngine.onYoutubeError(e.data),
        },
      });
    });
    return () => {
      dead = true;
    };
  }, []);

  const drag = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const orig = boxRef.current;
    setMoving(true);
    const move = (ev: PointerEvent) => {
      place({
        ...orig,
        x: orig.x + ev.clientX - startX,
        y: orig.y + ev.clientY - startY,
      });
    };
    const up = () => {
      setMoving(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const resize = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const orig = boxRef.current;
    setMoving(true);
    const move = (ev: PointerEvent) => {
      place({
        ...orig,
        w: orig.w + ev.clientX - startX,
        h: orig.h + ev.clientY - startY,
      });
    };
    const up = () => {
      setMoving(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      className={`hud-hot yt-dock ${visible ? "is-on" : ""} ${live ? "is-live" : ""} ${moving ? "is-moving" : ""}`}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
      aria-hidden={!visible}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="yt-grab" onPointerDown={drag} aria-label="Drag video">
        <span className="yt-grab-bars" />
      </div>
      <div ref={mount} className="yt-stage" />
      {!live && <div className="yt-shield" aria-hidden="true" />}
      <div
        className="yt-resize"
        onPointerDown={resize}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize video"
      />
    </div>
  );
}
