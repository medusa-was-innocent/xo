import { BODIES, type BodyId } from "./catalog";

export type LyricHit = {
  bodyId: BodyId;
  title: string;
  album: string;
  planet: string;
  line: string;
  score: number;
};

type Doc = {
  bodyId: BodyId;
  title: string;
  album: string;
  planet: string;
  text: string;
};

const LINES: Record<string, string[]> = {
  "High for This": ["you don't know what's in store but you know what you're here for", "let me make you high"],
  "What You Need": ["baby i can make it better", "i got what you need"],
  "House of Balloons / Glass Table Girls": ["i just want to tell you i come from a city", "where nobody gives a damn"],
  "The Morning": ["i'm the type to leave with every girl i meet"],
  "Wicked Games": ["bring your love baby i could bring my shame", "let me inside i want you tonight"],
  "The Party & The After Party": ["you've been dancing for a while"],
  "Coming Down": ["i always want you when i'm coming down"],
  "Loft Music": ["we can enjoy slow kisses"],
  "The Knowing": ["i know you've got someone else"],
  "Twenty Eight": ["this house is not a home to you"],
  "Lonely Star": ["i'm a lonely star"],
  "Life of the Party": ["i just want to tell you i come from a city"],
  Thursday: ["i only want you on thursdays"],
  "The Zone": ["i'm in the zone"],
  "The Birds Pt. 1": ["i told you not to fall in love"],
  "The Birds Pt. 2": ["she told me not to fall in love"],
  Gone: ["baby i've been gone"],
  "Rolling Stone": ["i'm a rolling stone"],
  "Heaven or Las Vegas": ["heaven or las vegas"],
  Valerie: ["valerie it's so hard"],
  "D.D.": ["dirty diana"],
  Montreal: ["talk to me in french"],
  "XO / The Host": ["xo until we overdose"],
  Initiation: ["you can meet me in the palace"],
  "Echoes of Silence": ["echoes of silence"],
  "Till Dawn (Here Comes the Sun)": ["here comes the sun"],
  Professional: ["i'm a professional"],
  "The Town": ["i'm from the town"],
  Adaptation: ["adaptation"],
  "Love in the Sky": ["love in the sky"],
  "Belong to the World": ["you belong to the world"],
  "Live For": ["live for"],
  Wanderlust: ["wanderlust"],
  "Kiss Land": ["this is the moment you've waited for", "welcome to the kiss land"],
  Pretty: ["you're so pretty"],
  "Tears in the Rain": ["tears in the rain"],
  "Real Life": ["this ain't no real life"],
  Often: ["she asked me if i do this every day i said often"],
  "The Hills": [
    "i only call you when it's half past five",
    "the only time that i'll be by your side",
    "i've been here for too long",
  ],
  Acquainted: ["let's get acquainted"],
  "Can't Feel My Face": ["i can't feel my face when i'm with you", "but i love it"],
  Shameless: ["i'll be shameless"],
  "Earned It": ["you deserve it baby you earned it"],
  "In the Night": ["in the night she hears him calling"],
  "As You Are": ["i'll take you as you are"],
  Prisoner: ["you got me trapped"],
  Starboy: ["look what you've done", "i'm a starboy"],
  "Party Monster": ["i'm good i've been rolling"],
  "False Alarm": ["false alarm"],
  Reminder: ["i just need a reminder"],
  "Rockin'": ["we gon' be rocking"],
  Secrets: ["everybody's got a secret"],
  "True Colors": ["show me your true colors"],
  "Stargirl Interlude": ["i just wanna see you shine"],
  Sidewalks: ["i walked the sidewalks"],
  "Die For You": ["i'd die for you"],
  "I Feel It Coming": ["i feel it coming"],
  "Call Out My Name": ["i want you to stay even when you say we can't be together", "call out my name"],
  "Try Me": ["try me"],
  "Wasted Times": ["wasted times i spent with you"],
  "I Was Never There": ["when it's time you always leave me", "i was never there"],
  "Hurt You": ["i don't wanna hurt you"],
  Privilege: ["it's a privilege"],
  "Alone Again": ["have you seen that charity ad with the dogs", "alone again"],
  "Too Late": ["it's too late"],
  "Hardest To Love": ["i'm the hardest to love"],
  "Scared To Live": ["i'm scared to live"],
  Snowchild: ["i used to pray when i was sixteen"],
  "Escape From LA": ["escape from la"],
  Heartless: ["never need a bitch i'm what a bitch need", "i'm heartless"],
  Faith: ["i still got faith"],
  "Blinding Lights": [
    "i've been tryna call i've been on my own for long enough",
    "the city's blinding lights",
    "i can't sleep until i feel your touch",
  ],
  "In Your Eyes": ["in your eyes i see there's something burning inside you"],
  "Save Your Tears": ["save your tears for another day"],
  "After Hours": ["tell them that it's after hours"],
  "Until I Bleed Out": ["until i bleed out"],
  "Dawn FM": ["you've been in the dark for way too long"],
  Gasoline: ["it's 5am i'm drunk again"],
  "How Do I Make You Love Me?": ["how do i make you love me"],
  "Take My Breath": ["i want you to take my breath"],
  Sacrifice: ["i don't wanna sacrifice"],
  "Out of Time": ["say i love you girl but i'm out of time"],
  "Is There Someone Else?": ["is there someone else or not"],
  "Less Than Zero": ["i tried to hide but i'm wasting my time"],
  Popular: ["i'm popular"],
  "One of the Girls": ["i wanna be one of the girls"],
  "Double Fantasy": ["double fantasy"],
  "Wake Me Up": ["wake me up"],
  "Cry For Me": ["cry for me"],
  "São Paulo": ["sao paulo"],
  "Baptized In Fear": ["baptized in fear"],
  "Open Hearts": ["open hearts"],
  "I Can't Wait To Get There": ["i can't wait to get there"],
  Timeless: ["timeless"],
  "Niagara Falls": ["niagara falls"],
  "Take Me Back To LA": ["take me back to la"],
  "Hurry Up Tomorrow": ["hurry up tomorrow"],
  "Without a Warning": ["without a warning"],
  "The Abyss": ["the abyss"],
};

const STOP = new Set([
  "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "i", "you", "me",
  "my", "it", "is", "im", "we", "that", "this", "with", "when", "but",
  "your", "be", "do", "dont", "just", "so", "its",
]);

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string) {
  return norm(s)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP.has(t));
}

const DOCS: Doc[] = BODIES.flatMap((b) =>
  b.tracks.map((t) => ({
    bodyId: b.id,
    title: t.title,
    album: b.name,
    planet: b.planet,
    text: norm([t.title, b.name, b.planet, ...(LINES[t.title] ?? [])].join(" ")),
  })),
);

export const EXAMPLE_QUERIES = [
  "I can't feel my face",
  "half past five",
  "save your tears",
  "call out my name",
  "in your eyes",
  "I've been on my own for long enough",
];

function editDist(a: string, b: string) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 1) return 99;
  if (!a.length || !b.length) return Math.max(a.length, b.length);
  let i = 0;
  let j = 0;
  let cuts = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    cuts += 1;
    if (cuts > 1) return 99;
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return cuts + (a.length - i) + (b.length - j);
}

function fuzzyHit(hay: string, needle: string) {
  if (hay.includes(needle)) return true;
  if (needle.length < 4) return false;
  return hay.split(" ").some((w) => editDist(w, needle) <= 1);
}

function lineScore(line: string, q: string, qt: string[]) {
  const n = norm(line);
  let s = 0;
  if (q.length >= 5 && n.includes(q)) s += 12;
  for (const t of qt) {
    if (n.includes(t)) s += t.length > 4 ? 1.8 : 1;
    else if (fuzzyHit(n, t)) s += 0.9;
  }
  const phrase = qt.slice(0, 5).join(" ");
  if (phrase.length > 7 && n.includes(phrase)) s += 5;
  return s;
}

export function searchLyrics(query: string, limit = 6): LyricHit[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const qt = tokens(q);
  if (!qt.length && q.length < 4) return [];

  const scored = DOCS.map((d) => {
    const lines = LINES[d.title] ?? [d.title];
    let bestLine = lines[0] ?? d.title;
    let lineBest = -1;
    for (const line of lines) {
      const ls = lineScore(line, q, qt);
      if (ls > lineBest) {
        lineBest = ls;
        bestLine = line;
      }
    }
    let score = lineBest;
    const tn = norm(d.title);
    const hay = `${tn} ${d.text}`;
    const covered = qt.filter((t) => hay.includes(t) || fuzzyHit(hay, t)).length;
    const cover = covered / Math.max(qt.length, 1);
    if (qt.length >= 2 && cover < 0.5 && lineBest < 8) {
      return { d, score: 0, line: bestLine };
    }
    if (tn.includes(q) || (tn.length > 4 && q.includes(tn))) score += 6;
    for (const t of qt) {
      if (tn.includes(t)) score += 1.5;
      if (d.text.includes(t)) score += 0.35;
      else if (fuzzyHit(d.text, t)) score += 0.4;
    }
    if (q.length >= 6 && d.text.includes(q)) score += 4;
    if (d.bodyId === "sun") score -= 1.2;
    return { d, score, line: bestLine };
  })
    .filter((x) => x.score > 3.2)
    .sort((a, b) => b.score - a.score);

  return collapseHits(
    scored.map(({ d, score, line }) => ({
      bodyId: d.bodyId,
      title: d.title,
      album: d.album,
      planet: d.planet,
      line,
      score,
    })),
    limit,
  );
}

export function collapseHits(hits: LyricHit[], limit = 6): LyricHit[] {
  const seen = new Set<string>();
  const out: LyricHit[] = [];
  for (const h of hits) {
    const key = h.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
    if (out.length >= limit) break;
  }
  return out;
}

export function catalogForPrompt() {
  return BODIES.map((b) => `${b.planet} | ${b.name} | ${b.id} | ${b.tracks.map((t) => t.title).join("; ")}`).join(
    "\n",
  );
}
