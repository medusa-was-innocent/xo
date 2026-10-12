import type { Track } from "./catalog";

type ItunesSong = {
  trackName?: string;
  previewUrl?: string;
  artistName?: string;
  collectionName?: string;
};

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/são/g, "sao")
    .replace(/…/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function score(a: string, b: string) {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return 0;
  if (na === nb) return 4;
  if (na.includes(nb) || nb.includes(na)) return 3;
  const wa = new Set(na.split(" ").filter(Boolean));
  const wb = nb.split(" ").filter(Boolean);
  let hit = 0;
  for (const w of wb) if (wa.has(w)) hit++;
  return hit / Math.max(wb.length, 1);
}

async function search(term: string, limit = 40): Promise<ItunesSong[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("itunes");
  const data = (await res.json()) as { results?: ItunesSong[] };
  return (data.results ?? []).filter((r) =>
    (r.artistName ?? "").toLowerCase().includes("weeknd"),
  );
}

export async function fetchPreviews(
  albumQuery: string,
  tracks: Track[],
): Promise<Record<string, string | null>> {
  const results = await search(albumQuery, 50);
  const map: Record<string, string | null> = {};
  for (const track of tracks) {
    let best: ItunesSong | null = null;
    let bestScore = 0.55;
    for (const r of results) {
      const s = score(track.title, r.trackName ?? "");
      if (s > bestScore) {
        bestScore = s;
        best = r;
      }
    }
    map[track.title] = best?.previewUrl ?? null;
  }

  const missing = tracks.filter((t) => !map[t.title]);
  await Promise.all(
    missing.slice(0, 12).map(async (t) => {
      try {
        const hits = await search(t.search, 8);
        let best: ItunesSong | null = null;
        let bestScore = 0.4;
        for (const r of hits) {
          const s = score(t.title, r.trackName ?? "");
          if (s > bestScore) {
            bestScore = s;
            best = r;
          }
        }
        map[t.title] = best?.previewUrl ?? null;
      } catch {
        map[t.title] = null;
      }
    }),
  );
  return map;
}
