import { createFileRoute } from "@tanstack/react-router";

type ScApiTrack = {
  title?: string;
  permalink_url?: string;
  duration?: number;
  artwork_url?: string | null;
  streamable?: boolean;
  policy?: string;
  user?: { username?: string; permalink?: string };
};

type ScHit = {
  permalink: string;
  artwork: string | null;
  duration: number;
  title: string;
  streamable: boolean;
  policy: "ALLOW" | "SNIP" | "BLOCK" | "UNKNOWN";
  verified: boolean;
};

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/são/g, "sao")
    .replace(/…/g, " ")
    .replace(/['’]/g, "")
    .replace(/\(feat\.?[^)]*\)/gi, " ")
    .replace(/\(ft\.?[^)]*\)/gi, " ")
    .replace(/\bfeat(uring)?\.?\s+.+$/i, " ")
    .replace(/\bwith\s+daft punk\b/gi, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(pt|part)\b/g, "pt")
    .trim();
}

function scoreTitle(query: string, hitTitle: string) {
  const na = norm(query);
  const nb = norm(hitTitle);
  if (!na || !nb) return 0;
  if (na === nb) return 5;
  if (nb.startsWith(na) || na.startsWith(nb)) return 4.2;
  if (na.includes(nb) || nb.includes(na)) return 3.4;
  const wa = new Set(na.split(" ").filter((w) => w.length > 1));
  const wb = nb.split(" ").filter((w) => w.length > 1);
  if (!wb.length) return 0;
  let hit = 0;
  for (const w of wb) if (wa.has(w)) hit++;
  return (hit / Math.max(wb.length, wa.size, 1)) * 3.2;
}

function slugify(title: string) {
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
  "Popular": ["popular", "popular-1"],
  "Die For You": ["die-for-you", "die-for-you-1"],
};

function candidateUrls(title: string) {
  const slugs = [...new Set([slugify(title), ...(SLUG_OVERRIDES[title] ?? [])])];
  return slugs.map((s) => `https://soundcloud.com/theweeknd/${s}`);
}

let cachedId: { id: string; at: number } | null = null;

async function scrapeClientId() {
  if (cachedId && Date.now() - cachedId.at < 1000 * 60 * 60 * 6) return cachedId.id;
  const html = await fetch("https://soundcloud.com", {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" },
  }).then((r) => r.text());
  const scripts = [...html.matchAll(/src="(https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js)"/g)].map(
    (m) => m[1],
  );
  for (const src of scripts.slice().reverse()) {
    const js = await fetch(src, { headers: { "User-Agent": "Mozilla/5.0" } }).then((r) => r.text());
    const m = js.match(/client_id:"([A-Za-z0-9]{16,})"/);
    if (m) {
      cachedId = { id: m[1], at: Date.now() };
      return m[1];
    }
  }
  if (cachedId) return cachedId.id;
  cachedId = { id: "Pb72ranhoyt6gw7hM7TkzUItXlMWSNSo", at: Date.now() };
  return cachedId.id;
}

async function scGet(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`sc ${res.status}`);
  return res.json();
}

async function searchTracks(q: string, limit = 40): Promise<ScApiTrack[]> {
  const id = await scrapeClientId();
  const url = `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(q)}&client_id=${id}&limit=${limit}&app_locale=en`;
  const data = (await scGet(url)) as { collection?: ScApiTrack[] };
  return data.collection ?? [];
}

async function resolveUrl(url: string): Promise<ScApiTrack | null> {
  try {
    const id = await scrapeClientId();
    const data = (await scGet(
      `https://api-v2.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${id}`,
    )) as ScApiTrack & { kind?: string };
    if (data?.permalink_url && (data.kind === "track" || data.title)) return data;
    return null;
  } catch {
    return null;
  }
}

function isJunk(title: string) {
  return /remix|bootleg|karaoke|cover|sped up|slowed|nightcore|8d|mashup|prod\.|edit zyzz|\s[x×]\s|tribute|instrumental/i.test(
    title,
  );
}

function isOfficial(h: ScApiTrack) {
  const user = (h.user?.permalink ?? "").toLowerCase();
  const name = (h.user?.username ?? "").toLowerCase();
  return user === "theweeknd" || name === "the weeknd";
}

function pick(hits: ScApiTrack[], title: string) {
  let best: ScApiTrack | null = null;
  let bestScore = 1.15;
  for (const h of hits) {
    if (!h.permalink_url || !h.title) continue;
    const official = isOfficial(h);
    if (isJunk(h.title) && !isJunk(title) && !official) continue;
    let s = scoreTitle(title, h.title);
    if (official) s += 2.4;
    else if ((h.user?.username ?? "").toLowerCase().includes("weeknd")) s += 0.45;
    else s -= 0.4;
    const dur = h.duration ?? 0;
    if (dur >= 90_000) s += 0.35;
    else if (dur > 0 && dur < 42_000) s -= 0.55;
    if (h.streamable === false) s -= 0.55;
    if ((h.policy ?? "").toUpperCase() === "BLOCK") s -= 1.2;
    if ((h.policy ?? "").toUpperCase() === "SNIP") s -= 0.12;
    if (s > bestScore) {
      bestScore = s;
      best = h;
    }
  }
  return best;
}

function toHit(h: ScApiTrack, verified = true): ScHit {
  const policyRaw = (h.policy ?? "UNKNOWN").toUpperCase();
  const policy =
    policyRaw === "ALLOW" || policyRaw === "SNIP" || policyRaw === "BLOCK" ? policyRaw : "UNKNOWN";
  return {
    permalink: h.permalink_url!,
    artwork: h.artwork_url ? h.artwork_url.replace("-large", "-t500x500") : null,
    duration: h.duration ?? 0,
    title: h.title ?? "",
    streamable: h.streamable !== false && policy !== "BLOCK",
    policy,
    verified,
  };
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const out: R[] = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

export const Route = createFileRoute("/api/soundcloud")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { album?: string; tracks?: string[] };
        const album = body.album?.trim() || "The Weeknd";
        const titles = Array.isArray(body.tracks) ? body.tracks.slice(0, 40) : [];
        if (!titles.length) return Response.json({ tracks: {} });

        const map: Record<string, ScHit | null> = {};
        for (const title of titles) map[title] = null;

        try {
          const albumHits = await searchTracks(album, 50);
          for (const title of titles) {
            const hit = pick(albumHits, title);
            if (hit) map[title] = toHit(hit);
          }

          const missing = titles.filter((t) => !map[t]);
          await mapLimit(missing, 6, async (title) => {
            for (const url of candidateUrls(title)) {
              const resolved = await resolveUrl(url);
              if (resolved && (isOfficial(resolved) || scoreTitle(title, resolved.title ?? "") >= 3)) {
                map[title] = toHit(resolved);
                return null;
              }
            }
            try {
              const hits = await searchTracks(`The Weeknd ${title}`, 12);
              const hit = pick(hits, title);
              map[title] = hit ? toHit(hit) : map[title];
            } catch {
              /* keep prior */
            }
            return null;
          });

          const still = titles.filter((t) => !map[t]);
          await mapLimit(still.slice(0, 10), 4, async (title) => {
            try {
              const hits = await searchTracks(`"${title}" The Weeknd`, 8);
              const hit = pick(hits, title);
              if (hit) map[title] = toHit(hit);
            } catch {
              /* ignore */
            }
            return null;
          });
        } catch {
          for (const title of titles) {
            if (!(title in map)) map[title] = null;
          }
        }

        return Response.json({ tracks: map });
      },
    },
  },
});
