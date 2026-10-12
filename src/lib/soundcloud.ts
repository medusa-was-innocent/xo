import type { Track } from "./catalog";

export type ScPolicy = "ALLOW" | "SNIP" | "BLOCK" | "UNKNOWN";

export type ScHit = {
  permalink: string;
  artwork: string | null;
  duration: number;
  title: string;
  streamable: boolean;
  policy: ScPolicy;
  verified: boolean;
};

export function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/…/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const SLUG_OVERRIDES: Record<string, string[]> = {
  "I Feel It Coming": ["i-feel-it-coming", "i-feel-it-coming-feat-daft-punk"],
  "Can't Feel My Face": ["cant-feel-my-face"],
  "House of Balloons / Glass Table Girls": [
    "house-of-balloons-glass-table-girls",
    "house-of-balloons",
  ],
  "The Party & The After Party": ["the-party-the-after-party"],
  "XO / The Host": ["xo-the-host"],
  "The Birds Pt. 1": ["the-birds-pt-1", "the-birds-part-1"],
  "The Birds Pt. 2": ["the-birds-pt-2", "the-birds-part-2"],
  "Here We Go… Again": ["here-we-go-again"],
  "How Do I Make You Love Me?": ["how-do-i-make-you-love-me"],
  "Is There Someone Else?": ["is-there-someone-else"],
  "Don't Break My Heart": ["dont-break-my-heart"],
  "I Heard You're Married": ["i-heard-youre-married"],
  "Phantom Regret by Jim": ["phantom-regret-by-jim"],
  "A Tale by Quincy": ["a-tale-by-quincy"],
  "São Paulo": ["sao-paulo"],
  "I Can't Fucking Sing": ["i-cant-fucking-sing"],
  "Until We're Skin & Bones": ["until-were-skin-and-bones", "until-were-skin-bones"],
  "Repeat After Me (Interlude)": ["repeat-after-me-interlude", "repeat-after-me"],
  "Stargirl Interlude": ["stargirl-interlude"],
  "D.D.": ["dd", "d-d"],
  "Every Angel Is Terrifying": ["every-angel-is-terrifying"],
  "Popular": ["popular", "popular-1"],
  "Die For You": ["die-for-you", "die-for-you-1"],
  "Save Your Tears": ["save-your-tears"],
  "Blinding Lights": ["blinding-lights"],
  "The Hills": ["the-hills"],
  "Starboy": ["starboy"],
  "Call Out My Name": ["call-out-my-name"],
  "Wicked Games": ["wicked-games"],
  "High for This": ["high-for-this"],
  "Take My Breath": ["take-my-breath"],
  "Out of Time": ["out-of-time"],
  "Less Than Zero": ["less-than-zero"],
  "One of the Girls": ["one-of-the-girls"],
  "Double Fantasy": ["double-fantasy"],
  "Timeless": ["timeless"],
  "Wake Me Up": ["wake-me-up"],
};

export function titleSlugs(title: string) {
  const base = slugify(title);
  const extras = SLUG_OVERRIDES[title] ?? [];
  const slim = base.replace(/-pt-/g, "-pt-").replace(/-part-/g, "-pt-");
  return [...new Set([base, slim, `${base}-1`, ...extras].filter(Boolean))];
}

export function candidatePermalinks(title: string) {
  return titleSlugs(title).flatMap((slug) => [
    `https://soundcloud.com/theweeknd/${slug}`,
  ]);
}

export function soundcloudSearchUrl(title: string) {
  return `https://soundcloud.com/search/sounds?q=${encodeURIComponent(`The Weeknd ${title}`)}`;
}

export function isPreviewDuration(ms: number) {
  return ms > 8_000 && ms < 42_000;
}

export function formatTrackTime(ms: number) {
  if (!ms || ms < 1000) return "";
  if (isPreviewDuration(ms)) return "Preview";
  const t = Math.floor(ms / 1000);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function hitUsable(hit: ScHit | null | undefined) {
  return Boolean(hit?.permalink && hit.verified !== false && hit.policy !== "BLOCK");
}

export async function fetchAlbumTracks(
  albumQuery: string,
  tracks: Track[],
): Promise<Record<string, ScHit | null>> {
  const res = await fetch("/api/soundcloud", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      album: albumQuery,
      tracks: tracks.map((t) => t.title),
    }),
  });
  if (!res.ok) throw new Error("soundcloud");
  const data = (await res.json()) as { tracks?: Record<string, ScHit | null> };
  const map: Record<string, ScHit | null> = { ...(data.tracks ?? {}) };
  for (const t of tracks) {
    if (map[t.title]?.permalink) continue;
    map[t.title] = {
      permalink: candidatePermalinks(t.title)[0],
      artwork: null,
      duration: 0,
      title: t.title,
      streamable: true,
      policy: "UNKNOWN",
      verified: false,
    };
  }
  return map;
}
