import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MessageSquareQuote, Play, X } from "lucide-react";
import { playCatalogTrack } from "@/lib/audio-engine";
import { bodyById } from "@/lib/catalog";
import { EXAMPLE_QUERIES, searchLyrics, type LyricHit } from "@/lib/lyric-rag";
import { sfx } from "@/lib/sfx";
import { useUniverse } from "@/lib/store";

export function LyricsSearch() {
  const open = useUniverse((s) => s.lyricsOpen);
  const toggle = useUniverse((s) => s.toggleLyrics);
  const select = useUniverse((s) => s.select);
  const customCovers = useUniverse((s) => s.customCovers);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<LyricHit[]>([]);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const gen = useRef(0);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => input.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const query = q.trim();
    if (query.length < 2) {
      setHits([]);
      setBusy(false);
      setHint("");
      return;
    }
    const local = searchLyrics(query, 5);
    setHits(local);
    setHint(local.length ? "" : "Searching the nights…");
    const id = ++gen.current;
    setBusy(!local.length);
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch("/api/lyrics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q: query }),
          });
          if (id !== gen.current) return;
          if (res.ok) {
            const data = (await res.json()) as { hits?: LyricHit[] };
            if (data.hits?.length) {
              setHits(data.hits);
              setHint("");
            } else if (!local.length) setHint("Nothing in orbit for that line.");
          } else if (!local.length) setHint("Couldn't reach the archive.");
        } catch {
          if (id !== gen.current) return;
          if (!local.length) setHint("Couldn't reach the archive.");
        } finally {
          if (id === gen.current) setBusy(false);
        }
      })();
    }, 380);
    return () => window.clearTimeout(timer);
  }, [q, open]);

  const pick = (h: LyricHit) => {
    sfx.playHit();
    select(h.bodyId);
    toggle(false);
    void playCatalogTrack(h.bodyId, h.title);
  };

  const apply = (line: string) => {
    setQ(line);
    input.current?.focus();
  };

  if (!open) return null;

  return (
    <div className="lyrics-scrim" role="dialog" aria-label="Search by remembered lyrics" onClick={() => toggle(false)}>
      <aside className="hud-hot lyrics-panel glass-strong" onClick={(e) => e.stopPropagation()}>
        <div className="music-head">
          <div>
            <p className="music-kicker">Remember a line</p>
            <p className="lyrics-sub">Find the song from a half-remembered lyric.</p>
          </div>
          <button type="button" aria-label="Close" className="icon-btn size-9" onClick={() => toggle(false)}>
            <X className="size-4" />
          </button>
        </div>
        <form
          className="lyrics-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (hits[0]) pick(hits[0]);
          }}
        >
          <MessageSquareQuote className="size-4 shrink-0 text-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="I can't feel my face when I'm with you"
            aria-label="Remembered lyrics"
            autoComplete="off"
            spellCheck={false}
          />
          {q ? (
            <button type="button" className="lyrics-clear" aria-label="Clear" onClick={() => setQ("")}>
              <X className="size-3.5" />
            </button>
          ) : null}
          <span className="lyrics-status" aria-hidden>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : null}
          </span>
        </form>
        {!q.trim() ? (
          <div className="lyrics-chips">
            {EXAMPLE_QUERIES.map((line) => (
              <button key={line} type="button" className="lyrics-chip" onClick={() => apply(line)}>
                {line}
              </button>
            ))}
          </div>
        ) : (
          <p className="lyrics-hint">{hint || (hits.length ? `${hits.length} match${hits.length === 1 ? "" : "es"}` : "")}</p>
        )}
        <div className="lyrics-hits">
          {hits.map((h, i) => (
            <button
              key={`${h.bodyId}-${h.title}`}
              type="button"
              className={`lyrics-hit ${i === 0 ? "is-top" : ""}`}
              onClick={() => pick(h)}
            >
              <img src={customCovers[h.bodyId] ?? bodyById(h.bodyId)?.cover ?? ""} alt="" draggable={false} />
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium">{h.title}</span>
                <span className="mt-0.5 block truncate text-[11px] uppercase tracking-wider text-muted">
                  {h.planet} · {h.album}
                </span>
                {h.line ? <span className="lyrics-line">“{h.line}”</span> : null}
              </span>
              <Play className="lyrics-play size-4" />
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
