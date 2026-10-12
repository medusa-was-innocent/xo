import { useEffect, useState } from "react";
import { audioEngine } from "@/lib/audio-engine";
import { sfx } from "@/lib/sfx";
import { BOOT_LYRICS } from "@/lib/lyrics";
import { useUniverse } from "@/lib/store";
import { XoHero } from "./XoMark";

const stars = Array.from({ length: 56 }, (_, i) => ({
  left: ((i * 47) % 100) + (i % 7),
  top: ((i * 29) % 100) + (i % 5),
  delay: (i % 9) * 0.12,
}));

export function BootScreen() {
  const enter = useUniverse((s) => s.enter);
  const progress = useUniverse((s) => s.bootProgress);
  const label = useUniverse((s) => s.bootLabel);
  const ready = useUniverse((s) => s.bootReady);
  const [lyric, setLyric] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLyric((n) => (n + 1) % BOOT_LYRICS.length);
    }, 4800);
    return () => window.clearInterval(id);
  }, []);

  const verse = BOOT_LYRICS[lyric] ?? BOOT_LYRICS[0];

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-bg">
      <div className="boot-stars pointer-events-none absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            style={{
              left: `${s.left % 100}%`,
              top: `${s.top % 100}%`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
      <p className="font-display text-[11px] tracking-[0.42em] text-muted">Nine eras · one orbit</p>
      <XoHero className="mt-5" />
      <p className="font-display mt-3 text-lg tracking-[0.42em] text-muted">Universe</p>

      {!ready ? (
        <div className="boot-load">
          <div className="boot-meter" aria-hidden>
            <span style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
          <p className="boot-pct">{Math.min(100, Math.round(progress))}%</p>
          <p className="boot-label">{label}</p>
        </div>
      ) : (
        <button
          className="hud-hot enter-btn"
          onClick={() => {
            audioEngine.unlock();
            sfx.unlock();
            enter();
          }}
        >
          Enter the night
        </button>
      )}

      <blockquote className="boot-lyric">
        <p>{verse.line}</p>
        <cite>{verse.song}</cite>
      </blockquote>
      <p className="absolute bottom-6 px-6 text-center text-[10px] tracking-[0.16em] text-subtle">
        Fan project. Not affiliated with The Weeknd or XO.
      </p>
    </div>
  );
}
