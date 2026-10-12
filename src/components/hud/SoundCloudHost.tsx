import { useEffect, useRef } from "react";
import { audioEngine, type ScWidget } from "@/lib/audio-engine";

declare global {
  interface Window {
    SC?: {
      Widget: {
        (el: HTMLIFrameElement | string): ScWidget;
        Events: {
          READY: string;
          PLAY: string;
          PAUSE: string;
          FINISH: string;
          PLAY_PROGRESS: string;
          ERROR: string;
        };
      };
    };
  }
}

const PRIME =
  "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/theweeknd/blinding-lights&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&show_artwork=false";

function loadApi() {
  if (window.SC?.Widget) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-sc-widget="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("sc-script")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://w.soundcloud.com/player/api.js";
    s.async = true;
    s.dataset.scWidget = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("sc-script"));
    document.head.appendChild(s);
  });
}

export function SoundCloudHost() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    let cancelled = false;
    void loadApi()
      .then(() => {
        if (cancelled || !window.SC?.Widget) return;
        const widget = window.SC.Widget(iframe);
        audioEngine.attach(widget, window.SC.Widget.Events);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="sc-host-wrap" aria-hidden="true">
      <iframe
        ref={ref}
        id="sc-widget"
        title="SoundCloud player"
        allow="autoplay"
        src={PRIME}
        className="sc-host"
        aria-hidden="true"
        tabIndex={-1}
        inert
        style={{
          position: "fixed",
          left: -12000,
          top: 0,
          width: 450,
          height: 166,
          opacity: 0,
          pointerEvents: "none",
          border: 0,
        }}
      />
    </div>
  );
}
