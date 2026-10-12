import { BODIES } from "@/lib/catalog";
import { useUniverse } from "@/lib/store";
import { audioEnergy } from "@/lib/runtime";
import { useEffect, useState } from "react";

export function PlanetDock() {
  const selectedId = useUniverse((s) => s.selectedId);
  const select = useUniverse((s) => s.select);
  const customCovers = useUniverse((s) => s.customCovers);
  const [live, setLive] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setLive(audioEnergy.playingBodyId), 120);
    return () => window.clearInterval(id);
  }, []);

  return (
    <nav aria-label="Albums" className="hud-hot planet-dock">
      <div className="glass scroller scrollbar-thin">
        {BODIES.map((b) => {
          const on = selectedId === b.id;
          const playing = live === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => select(on ? null : b.id)}
              className={`dock-item ${on ? "is-on" : ""} ${playing ? "is-live" : ""}`}
              style={{ ["--era" as string]: b.eraRgb }}
            >
              <span className="dock-orb">
                <img src={customCovers[b.id] ?? b.cover} alt="" draggable={false} />
                {playing ? (
                  <span className="dock-eq" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null}
              </span>
              <span className="dock-copy">
                <span className="dock-planet">{b.id === "sun" ? "XO" : b.planet}</span>
                <span className="dock-album">{b.id === "sun" ? "The Weeknd" : b.name}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
