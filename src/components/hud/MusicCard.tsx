import { useEffect, useMemo, useState } from "react";
import {
  AudioLines,
  LoaderCircle,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { albumQuery, bodyById, soundcloudUrl } from "@/lib/catalog";
import { useUniverse } from "@/lib/store";
import { audioEngine, playCatalogTrack } from "@/lib/audio-engine";
import { fetchAlbumTracks, formatTrackTime, hitUsable } from "@/lib/soundcloud";
import { fetchPreviews } from "@/lib/itunes";
import { youtubeIdFor } from "@/lib/youtube";
import { sfx } from "@/lib/sfx";
import { CoverUpload } from "./CoverUpload";

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function displayTitle(title: string) {
  if (title === "I Can't Fucking Sing") return "I Can't F***ing Sing";
  return title;
}

export function MusicCard() {
  const selectedId = useUniverse((s) => s.selectedId);
  const select = useUniverse((s) => s.select);
  const body = bodyById(selectedId);
  const nowPlaying = useUniverse((s) => s.nowPlaying);
  const isPlaying = useUniverse((s) => s.isPlaying);
  const playbackStatus = useUniverse((s) => s.playbackStatus);
  const progress = useUniverse((s) => s.progress);
  const duration = useUniverse((s) => s.duration);
  const volume = useUniverse((s) => s.volume);
  const muted = useUniverse((s) => s.muted);
  const loop = useUniverse((s) => s.loop);
  const playSource = useUniverse((s) => s.playSource);
  const setVolume = useUniverse((s) => s.setVolume);
  const setMuted = useUniverse((s) => s.setMuted);
  const setLoop = useUniverse((s) => s.setLoop);
  const scByTitle = useUniverse((s) => s.scByTitle);
  const setScByTitle = useUniverse((s) => s.setScByTitle);
  const setItunesByTitle = useUniverse((s) => s.setItunesByTitle);
  const itunesByTitle = useUniverse((s) => s.itunesByTitle);
  const libraryStatus = useUniverse((s) => s.libraryStatus);
  const setLibraryStatus = useUniverse((s) => s.setLibraryStatus);
  const customCover = useUniverse((s) => (selectedId ? s.customCovers[selectedId] : undefined));
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!body) return;
    let cancelled = false;
    setLibraryStatus("loading");
    setErr(null);
    Promise.all([
      fetchAlbumTracks(albumQuery(body.name, body.id), body.tracks).catch(() => ({})),
      fetchPreviews(albumQuery(body.name, body.id), body.tracks).catch(() => ({})),
    ])
      .then(([sc, itunes]) => {
        if (cancelled) return;
        setScByTitle(sc);
        setItunesByTitle(itunes);
        setLibraryStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setLibraryStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [body, setLibraryStatus, setScByTitle, setItunesByTitle]);

  const activeTitle = nowPlaying?.track.title;
  const onThisBody = nowPlaying?.bodyId === body?.id;
  const playingHere = onThisBody && isPlaying;
  const waiting =
    onThisBody && (playbackStatus === "loading" || playbackStatus === "buffering");
  const found = useMemo(() => {
    if (!body) return 0;
    return body.tracks.filter((t) => hitUsable(scByTitle[t.title]) || itunesByTitle[t.title]).length;
  }, [body, scByTitle, itunesByTitle]);

  const coverSrc =
    customCover ||
    (onThisBody && nowPlaying?.artwork ? nowPlaying.artwork : (body?.cover ?? ""));

  const currentPermalink =
    onThisBody && nowPlaying?.permalink
      ? nowPlaying.permalink
      : body
        ? scByTitle[body.tracks[0]?.title ?? ""]?.permalink
        : null;
  const scCurrent = body
    ? soundcloudUrl(
        onThisBody && nowPlaying ? nowPlaying.track.title : (body.tracks[0]?.title ?? body.name),
        currentPermalink,
      )
    : "#";
  const ytId = onThisBody && nowPlaying ? youtubeIdFor(nowPlaying.track.title) : null;

  const statusLine = () => {
    if (waiting) return playbackStatus === "loading" ? "Loading…" : "Buffering…";
    if (onThisBody && playbackStatus === "restricted") return "Restricted — try another track";
    if (onThisBody && playbackStatus === "error") return "Couldn't stream this one";
    if (onThisBody && isPlaying) return playSource === "youtube" ? "Playing · video" : playSource === "itunes" ? "Preview" : "Playing";
    return `${body?.tracks.length ?? 0} tracks`;
  };

  const play = async (title: string) => {
    if (!body) return;
    setErr(null);
    sfx.playHit();
    try {
      await playCatalogTrack(body.id, title);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "restricted") {
        setErr("Restricted in-app — open it on SoundCloud.");
        return;
      }
      setErr("Couldn't load this one — open it on SoundCloud.");
    }
  };

  const toggle = () => {
    if (!nowPlaying && body?.tracks[0]) {
      void play(body.tracks[0].title);
      return;
    }
    if (nowPlaying && !isPlaying && playbackStatus === "restricted") {
      void play(nowPlaying.track.title);
      return;
    }
    audioEngine.toggle();
  };

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0;

  if (!body) return null;

  return (
    <aside
      className="hud-hot music-card glass-strong card-enter"
      style={{ ["--era" as string]: body.eraRgb }}
    >
      <div className="music-head">
        <p className="music-kicker">
          {body.planet}
          {playingHere ? " · Live" : ""}
        </p>
        <button
          type="button"
          aria-label="Close"
          className="icon-btn size-9"
          onClick={() => select(null)}
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="music-album">
        <div className={`cover-stack ${playingHere ? "is-on" : ""}`}>
          <div className="vinyl" />
          <img src={coverSrc} alt="" className="cover-art" draggable={false} />
          <CoverUpload id={body.id} compact />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="music-title">{body.name}</h2>
          <p className="music-artist">The Weeknd</p>
          <p className="music-meta">
            <span className="music-planet">{body.id === "sun" ? "Center" : body.planet}</span>
            <span> · {body.year}</span>
            <span> · {body.tracks.length} tracks</span>
          </p>
        </div>
      </div>

      <div className="player-well mt-3 rounded-[20px] px-3 py-3">
        <div className="wave-strip" aria-hidden>
          {Array.from({ length: 36 }, (_, i) => (
            <i
              key={i}
              className={playingHere ? "is-live" : ""}
              style={{
                animationDelay: `${(i % 9) * 70}ms`,
                height: `${28 + ((i * 37) % 72)}%`,
              }}
            />
          ))}
        </div>
        <div className="now-copy min-w-0">
          <p className="truncate text-sm font-medium">
            {onThisBody ? displayTitle(nowPlaying?.track.title ?? "") : "Pick a track"}
          </p>
          <p className="text-[11px] text-muted">{err ?? statusLine()}</p>
        </div>
        <div className="player-row flex items-center gap-2">
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
            className={`play-fab ${waiting ? "is-wait" : ""}`}
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {waiting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4 translate-x-px" />
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
          <div className="ml-auto flex items-center gap-1">
            {!ytId && (
              <a
                className="icon-btn size-9"
                href={scCurrent}
                target="_blank"
                rel="noreferrer"
                aria-label="Open on SoundCloud"
              >
                <AudioLines className="size-3.5" />
              </a>
            )}
            <button
              type="button"
              className={`icon-btn size-9 ${loop ? "is-on" : "is-off"}`}
              aria-pressed={loop}
              aria-label="Loop"
              onClick={() => setLoop(!loop)}
            >
              <Repeat className="size-3.5" />
            </button>
            <button
              type="button"
              className="icon-btn size-9"
              onClick={() => {
                const shouldMute = !muted;
                setMuted(shouldMute);
                audioEngine.setVolume(volume > 0 ? volume : 0.7, shouldMute);
                if (!shouldMute && volume === 0) setVolume(0.7);
              }}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="w-8 text-[10px] tabular-nums text-subtle">{fmt(progress)}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={pct}
            className="xo-range flex-1"
            style={{
              background: `linear-gradient(to right, rgb(225 6 0) ${pct}%, rgba(255,255,255,0.12) ${pct}%)`,
            }}
            onChange={(e) => {
              if (!duration) return;
              audioEngine.seek((Number(e.target.value) / 100) * duration);
            }}
          />
          <span className="w-8 text-right text-[10px] tabular-nums text-subtle">
            {duration ? fmt(duration) : "—"}
          </span>
        </div>
        <label className="mt-1.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-subtle">
          Vol
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            className="xo-range flex-1"
            style={{
              background: `linear-gradient(to right, rgb(225 6 0) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.12) ${(muted ? 0 : volume) * 100}%)`,
            }}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              setMuted(v === 0);
              audioEngine.setVolume(v, v === 0);
            }}
          />
        </label>
        {playbackStatus === "restricted" && onThisBody && !ytId && (
          <a className="sc-fallback" href={scCurrent} target="_blank" rel="noreferrer">
            Open on SoundCloud
          </a>
        )}
      </div>

      <p className="sc-chip mt-3">
        <AudioLines className="size-3" />
        {libraryStatus === "loading"
          ? "Matching tracks…"
          : libraryStatus === "error"
            ? "Using cached previews"
            : playSource === "youtube"
              ? "Playing in the app"
              : `${found} ready to play`}
      </p>

      <div className="music-tracks scrollbar-thin">
        {libraryStatus === "loading" && (
          <div className="lib-status">
            <span className="shimmer-text">Tuning the album…</span>
            <span className="text-subtle">Finding playable previews.</span>
          </div>
        )}
        {err && libraryStatus !== "loading" && (
          <p className="px-3 py-1 text-xs text-accent">{err}</p>
        )}
        {body.tracks.map((t, i) => {
          const hit = scByTitle[t.title];
          const preview = itunesByTitle[t.title];
          const on = activeTitle === t.title && onThisBody;
          const blocked = hit?.policy === "BLOCK" && !preview;
          const label = on
            ? waiting
              ? "Buffering…"
              : isPlaying
                ? "Now playing"
                : playbackStatus === "restricted"
                  ? "Restricted"
                  : "Paused"
            : blocked
              ? "Restricted"
              : preview
                ? "Play preview"
                : hitUsable(hit)
                  ? hit?.policy === "SNIP"
                    ? "Preview"
                    : "Play"
                  : libraryStatus === "ready"
                    ? "Search fallback"
                    : "…";
          const durLabel =
            preview && !hit?.duration
              ? "0:30"
              : formatTrackTime(hit?.duration ?? 0) || (on && duration ? fmt(duration) : "—");
          const rowPct = on && duration > 0 ? pct : 0;
          return (
            <div key={t.title} className={`track-row ${on ? "is-on" : ""} ${blocked ? "is-blocked" : ""}`}>
              <button
                type="button"
                className="track-main"
                onClick={() => {
                  if (on) {
                    audioEngine.toggle();
                    return;
                  }
                  void play(t.title);
                }}
              >
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-md text-[11px]"
                  style={{ background: `rgb(${body.eraRgb} / 0.22)` }}
                >
                  {on && waiting ? (
                    <LoaderCircle className="size-3.5 animate-spin" />
                  ) : on && isPlaying ? (
                    <span className="eq" aria-hidden>
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm">{displayTitle(t.title)}</span>
                  <span className="text-[11px] text-subtle">{label}</span>
                  {on ? (
                    <span className="track-progress" aria-hidden>
                      <span style={{ width: `${rowPct}%` }} />
                    </span>
                  ) : null}
                </span>
                <span className="track-dur">{durLabel}</span>
                <span className="play-hint">
                  {on && isPlaying ? (
                    <Pause className="size-3.5" />
                  ) : (
                    <Play className="size-3.5 translate-x-px" />
                  )}
                </span>
              </button>
              <a
                className="yt-link"
                href={soundcloudUrl(t.title, hit?.permalink)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${t.title} on SoundCloud`}
                onClick={(e) => e.stopPropagation()}
              >
                <AudioLines className="size-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
