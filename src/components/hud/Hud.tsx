import { useEffect } from "react";
import { audioEngine } from "@/lib/audio-engine";
import { readAllCovers } from "@/lib/covers";
import { sfx } from "@/lib/sfx";
import { useUniverse } from "@/lib/store";
import { BootScreen } from "./BootScreen";
import { CreditsCarousel } from "./CreditsCarousel";
import { Header } from "./Header";
import { LyricsSearch } from "./LyricsSearch";
import { MiniPlayer } from "./MiniPlayer";
import { MusicCard } from "./MusicCard";
import { OrbitLabels } from "./OrbitLabels";
import { PlanetDock } from "./PlanetDock";
import { SoundCloudHost } from "./SoundCloudHost";
import { YouTubeHost } from "./YouTubeHost";

export function Hud() {
  const entered = useUniverse((s) => s.entered);
  const selectedId = useUniverse((s) => s.selectedId);
  const select = useUniverse((s) => s.select);
  const creditsOpen = useUniverse((s) => s.creditsOpen);
  const lyricsOpen = useUniverse((s) => s.lyricsOpen);
  const toggleCredits = useUniverse((s) => s.toggleCredits);
  const toggleLyrics = useUniverse((s) => s.toggleLyrics);
  const volume = useUniverse((s) => s.volume);
  const muted = useUniverse((s) => s.muted);
  const hydrateCovers = useUniverse((s) => s.hydrateCovers);

  useEffect(() => {
    let live = true;
    const urls: string[] = [];
    void readAllCovers().then((blobs) => {
      if (!live) return;
      const map: Record<string, string> = {};
      for (const [id, blob] of Object.entries(blobs)) {
        const url = URL.createObjectURL(blob);
        urls.push(url);
        map[id] = url;
      }
      hydrateCovers(map);
    });
    return () => {
      live = false;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [hydrateCovers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lyricsOpen) toggleLyrics(false);
        else if (creditsOpen) toggleCredits(false);
        else select(null);
        return;
      }
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (!entered) return;
      if (e.code === "Space") {
        e.preventDefault();
        audioEngine.toggle();
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        void audioEngine.skip(1);
      }
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        void audioEngine.skip(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [creditsOpen, entered, lyricsOpen, select, toggleCredits, toggleLyrics]);

  useEffect(() => {
    const vis = () => {
      if (document.visibilityState === "visible") audioEngine.unlock();
    };
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, []);

  useEffect(() => {
    if (entered) {
      audioEngine.setVolume(volume, muted);
      sfx.setGain(muted ? 0 : volume * 0.42);
    }
  }, [entered, volume, muted]);

  return (
    <>
      <SoundCloudHost />
      {!entered ? (
        <BootScreen />
      ) : (
        <div className={`hud ${selectedId ? "is-selected" : ""} ${creditsOpen ? "is-credits" : ""}`}>
          <OrbitLabels />
          <Header />
          <LyricsSearch />
          <YouTubeHost />
          <MusicCard />
          <div className="bottom-chrome">
            <MiniPlayer />
            <PlanetDock />
          </div>
          <CreditsCarousel />
        </div>
      )}
    </>
  );
}
