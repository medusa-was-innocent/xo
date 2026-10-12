import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BODIES } from "@/lib/catalog";
import { bodyPositions, view } from "@/lib/runtime";
import { useUniverse } from "@/lib/store";

const ndc = new THREE.Vector3();

export function OrbitLabels() {
  const show = useUniverse((s) => s.showLabels);
  const selectedId = useUniverse((s) => s.selectedId);
  const select = useUniverse((s) => s.select);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!show || selectedId) return;
    let raf = 0;
    const loop = () => {
      const cam = view.camera;
      const { w, h } = view.size;
      if (cam) {
        const top = 72;
        const bottom = 96;
        const side = 18;
        for (const body of BODIES) {
          const el = refs.current[body.id];
          const pos = bodyPositions.get(body.id);
          if (!el || !pos) continue;
          ndc.copy(pos);
          ndc.y += body.radius + 0.55;
          ndc.project(cam);
          const x = (ndc.x * 0.5 + 0.5) * w;
          const y = (-ndc.y * 0.5 + 0.5) * h;
          const vis = ndc.z < 1 && ndc.z > -1 && x > side && x < w - side && y > top && y < h - bottom;
          el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -120%)`;
          el.style.opacity = vis ? "1" : "0";
          el.style.pointerEvents = vis ? "auto" : "none";
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [show, selectedId]);

  if (!show || selectedId) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {BODIES.map((b) => (
        <button
          key={b.id}
          type="button"
          ref={(el) => {
            refs.current[b.id] = el;
          }}
          className="orbit-label"
          aria-label={`${b.planet} — ${b.name}`}
          onClick={(e) => {
            e.stopPropagation();
            select(b.id);
          }}
        >
          {b.id === "sun" ? "XO" : b.planet}
          <span>{b.id === "sun" ? "The Weeknd" : b.name}</span>
        </button>
      ))}
    </div>
  );
}
