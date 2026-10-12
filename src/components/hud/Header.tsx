import { MessageSquareQuote, Orbit, Pause, Play, Tag } from "lucide-react";
import { useUniverse } from "@/lib/store";
import { XoMark } from "./XoMark";

export function Header() {
  const showOrbits = useUniverse((s) => s.showOrbits);
  const showLabels = useUniverse((s) => s.showLabels);
  const paused = useUniverse((s) => s.orbitsPaused);
  const speed = useUniverse((s) => s.speed);
  const lyricsOpen = useUniverse((s) => s.lyricsOpen);
  const setShowOrbits = useUniverse((s) => s.setShowOrbits);
  const setShowLabels = useUniverse((s) => s.setShowLabels);
  const setOrbitsPaused = useUniverse((s) => s.setOrbitsPaused);
  const setSpeed = useUniverse((s) => s.setSpeed);
  const toggleCredits = useUniverse((s) => s.toggleCredits);
  const toggleLyrics = useUniverse((s) => s.toggleLyrics);

  return (
    <header className="hud-header pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 px-3 md:px-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleLyrics()}
          className={`hud-hot icon-btn glass ${lyricsOpen ? "is-on" : ""}`}
          aria-label="Search songs by remembered lyrics"
          aria-pressed={lyricsOpen}
        >
          <MessageSquareQuote className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => toggleCredits(true)}
          className="hud-hot glass flex items-center gap-2.5 rounded-[22px] py-1.5 pl-2 pr-3.5"
          aria-label="XO Universe — open credits"
        >
          <XoMark size={34} />
          <span className="text-left">
            <span className="block font-display text-[10px] tracking-[0.32em] text-muted">
              The Weeknd
            </span>
            <span className="font-display block text-lg tracking-[0.18em] text-fg md:text-xl">
              Universe
            </span>
          </span>
        </button>
      </div>
      <div className="hud-hot glass flex items-center gap-0.5 rounded-[22px] p-1">
        <button
          type="button"
          aria-label={paused ? "Resume orbits" : "Pause orbits"}
          className="icon-btn"
          onClick={() => setOrbitsPaused(!paused)}
        >
          {paused ? <Play className="size-4 translate-x-px" /> : <Pause className="size-4" />}
        </button>
        <button
          type="button"
          aria-pressed={showOrbits}
          aria-label="Toggle orbits"
          className={`icon-btn ${showOrbits ? "is-on" : "is-off"}`}
          onClick={() => setShowOrbits(!showOrbits)}
        >
          <Orbit className="size-4" />
        </button>
        <button
          type="button"
          aria-pressed={showLabels}
          aria-label="Toggle names"
          className={`icon-btn ${showLabels ? "is-on" : "is-off"}`}
          onClick={() => setShowLabels(!showLabels)}
        >
          <Tag className="size-4" />
        </button>
        <label className="hidden items-center gap-2 px-2 sm:flex">
          <span className="text-[10px] uppercase tracking-[0.18em] text-subtle">Time</span>
          <input
            type="range"
            min={0.2}
            max={4}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="xo-range w-20"
            style={{
              background: `linear-gradient(to right, rgb(225 6 0) ${((speed - 0.2) / 3.8) * 100}%, rgba(255,255,255,0.12) ${((speed - 0.2) / 3.8) * 100}%)`,
            }}
          />
        </label>
      </div>
    </header>
  );
}
