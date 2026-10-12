import { X } from "lucide-react";
import { CAROUSEL } from "@/lib/catalog";
import { useUniverse } from "@/lib/store";
import { CoverUpload } from "./CoverUpload";
import { XoMark } from "./XoMark";

export function CreditsCarousel() {
  const open = useUniverse((s) => s.creditsOpen);
  const toggle = useUniverse((s) => s.toggleCredits);
  const select = useUniverse((s) => s.select);
  const customCovers = useUniverse((s) => s.customCovers);
  if (!open) return null;

  return (
    <div className="credits-scrim" role="dialog" aria-label="D4DVSN times XO">
      <button
        type="button"
        aria-label="Close"
        className="icon-btn absolute right-4 top-4 size-11"
        onClick={() => toggle(false)}
      >
        <X className="size-4" />
      </button>
      <div className="absolute left-1/2 top-8 z-10 -translate-x-1/2 text-center">
        <p className="font-display text-[11px] tracking-[0.4em] text-muted">Created by</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="font-display text-2xl tracking-[0.22em]">D4DVSN</span>
          <span className="text-muted">×</span>
          <span className="flex items-center gap-2">
            <XoMark size={36} />
          </span>
        </div>
        <p className="mt-2 text-xs text-subtle">Upload a picture to custom any cover</p>
        <p className="mt-1 text-[10px] tracking-wide text-subtle">Fan project. Not affiliated with The Weeknd or XO.</p>
      </div>
      <div className="xo-wrapper">
        <div className="xo-inner" style={{ ["--quantity" as string]: CAROUSEL.length }}>
          {CAROUSEL.map((c, i) => (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              className="xo-card"
              style={{
                ["--index" as string]: i,
                ["--color-card" as string]: c.rgb,
              }}
              onClick={() => {
                select(c.id);
                toggle(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                select(c.id);
                toggle(false);
              }}
            >
              <img src={customCovers[c.id] ?? c.cover} alt={c.label} className="img" draggable={false} />
              <CoverUpload id={c.id} />
              <span className="caption">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}